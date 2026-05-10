import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { FALLBACK_VENUES } from '../lib/fallback'
import { server } from '../test/msw/server'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'
import { __test__buildKey, writeCache } from './cache'
import { BASE } from './client'
import { clearSession, setSession } from './session'
import { createVenue, deleteVenue, getVenue, listVenues, searchVenues, updateVenue } from './venues'

const SAMPLE_VENUE: Venue = {
  id: 'real-1',
  name: 'Casa del Viento',
  description: 'A whitewashed cliffside house above the Mediterranean.',
  media: [
    { url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400', alt: '' },
  ],
  price: 280,
  maxGuests: 4,
  rating: 4.8,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
  meta: { wifi: true, parking: true, breakfast: false, pets: true },
  location: {
    address: null,
    city: 'Begur',
    zip: null,
    country: 'Spain',
    continent: 'Europe',
    lat: 41.95,
    lng: 3.21,
  },
}

const SAMPLE_META = {
  isFirstPage: true,
  isLastPage: false,
  currentPage: 1,
  previousPage: null,
  nextPage: 2,
  pageCount: 5,
  totalCount: 100,
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('listVenues', () => {
  it('returns live venues + meta when the API succeeds with enough usable items', async () => {
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({
          data: [SAMPLE_VENUE, SAMPLE_VENUE, SAMPLE_VENUE, SAMPLE_VENUE].map((v, i) => ({
            ...v,
            id: `real-${String(i)}`,
          })),
          meta: SAMPLE_META,
        }),
      ),
    )

    const result = await listVenues({ page: 1, limit: 24 })
    expect(result.source).toBe('live')
    expect(result.venues).toHaveLength(4)
    expect(result.meta?.currentPage).toBe(1)
  })

  it('returns FALLBACK when the API succeeds but the filter eliminates too much', async () => {
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({
          data: [
            { ...SAMPLE_VENUE, id: 'junk-1', name: 'string' },
            { ...SAMPLE_VENUE, id: 'junk-2', price: 0 },
          ],
          meta: SAMPLE_META,
        }),
      ),
    )

    const result = await listVenues()
    expect(result.source).toBe('fallback')
    expect(result.venues).toEqual(FALLBACK_VENUES)
  })

  it('returns FALLBACK when the API call fails', async () => {
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({ errors: [{ message: 'server error' }] }, { status: 500 }),
      ),
    )

    const result = await listVenues()
    expect(result.source).toBe('fallback')
  })

  it('serves from cache on second call within TTL', async () => {
    let calls = 0
    server.use(
      http.get(`${BASE}/venues`, () => {
        calls++
        return HttpResponse.json({
          data: Array.from({ length: 4 }, (_v, i) => ({ ...SAMPLE_VENUE, id: `r-${String(i)}` })),
          meta: SAMPLE_META,
        })
      }),
    )

    const first = await listVenues({ page: 1 })
    const second = await listVenues({ page: 1 })
    expect(first.source).toBe('live')
    expect(second.source).toBe('cache')
    expect(calls).toBe(1)
  })

  it('propagates AbortError when the caller aborts', async () => {
    server.use(
      http.get(`${BASE}/venues`, async () => {
        await new Promise((r) => setTimeout(r, 50))
        return HttpResponse.json({ data: [], meta: SAMPLE_META })
      }),
    )

    const controller = new AbortController()
    const promise = listVenues({ signal: controller.signal })
    controller.abort()
    await expect(promise).rejects.toThrow()
  })
})

describe('searchVenues', () => {
  it('returns matched venues from /venues/search', async () => {
    server.use(
      http.get(`${BASE}/venues/search`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('q')).toBe('norway')
        return HttpResponse.json({
          data: [{ ...SAMPLE_VENUE, id: 'norway-1', name: 'Norwegian Cabin' }],
          meta: { ...SAMPLE_META, totalCount: 1, pageCount: 1, isLastPage: true, nextPage: null },
        })
      }),
    )

    const result = await searchVenues({ q: 'norway' })
    expect(result.source).toBe('live')
    expect(result.venues).toHaveLength(1)
    expect(result.venues[0].name).toBe('Norwegian Cabin')
  })

  it('returns an empty array when the API has no matches (not a fallback)', async () => {
    server.use(
      http.get(`${BASE}/venues/search`, () =>
        HttpResponse.json({
          data: [],
          meta: { ...SAMPLE_META, totalCount: 0, pageCount: 0, isLastPage: true, nextPage: null },
        }),
      ),
    )

    const result = await searchVenues({ q: 'nowhere-zzz' })
    expect(result.venues).toEqual([])
    expect(result.source).toBe('live')
  })

  it('throws on API error (no fallback for search)', async () => {
    server.use(
      http.get(`${BASE}/venues/search`, () =>
        HttpResponse.json({ errors: [{ message: 'server error' }] }, { status: 500 }),
      ),
    )

    await expect(searchVenues({ q: 'norway' })).rejects.toThrow()
  })
})

describe('getVenue', () => {
  const VENUE_WITH_BOOKINGS: Venue = {
    ...SAMPLE_VENUE,
    id: 'real-detail',
    bookings: [
      {
        id: 'b1',
        dateFrom: '2026-06-15T00:00:00.000Z',
        dateTo: '2026-06-18T00:00:00.000Z',
        guests: 2,
        created: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-01T00:00:00.000Z',
      },
    ],
    owner: {
      name: 'Lina',
      email: 'lina@stud.noroff.no',
      bio: null,
      avatar: { url: 'https://images.unsplash.com/photo-2?w=400', alt: '' },
      banner: { url: 'https://images.unsplash.com/photo-3?w=1400', alt: '' },
    },
  }

  it('fetches a single venue with owner + bookings included', async () => {
    server.use(
      http.get(`${BASE}/venues/real-detail`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('_owner')).toBe('true')
        expect(url.searchParams.get('_bookings')).toBe('true')
        return HttpResponse.json({ data: VENUE_WITH_BOOKINGS, meta: {} })
      }),
    )

    const venue = await getVenue('real-detail')
    expect(venue.id).toBe('real-detail')
    expect(venue.bookings).toHaveLength(1)
    expect(venue.owner?.name).toBe('Lina')
  })

  it('throws ApiError on 404', async () => {
    server.use(
      http.get(`${BASE}/venues/missing`, () =>
        HttpResponse.json({ errors: [{ message: 'Not Found' }] }, { status: 404 }),
      ),
    )

    await expect(getVenue('missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })

  it('serves from cache on second call within TTL', async () => {
    let calls = 0
    server.use(
      http.get(`${BASE}/venues/cached-id`, () => {
        calls++
        return HttpResponse.json({ data: VENUE_WITH_BOOKINGS, meta: {} })
      }),
    )

    await getVenue('cached-id')
    await getVenue('cached-id')
    expect(calls).toBe(1)
  })

  it('propagates AbortError when the caller aborts', async () => {
    server.use(
      http.get(`${BASE}/venues/slow`, async () => {
        await new Promise((r) => setTimeout(r, 50))
        return HttpResponse.json({ data: VENUE_WITH_BOOKINGS, meta: {} })
      }),
    )

    const controller = new AbortController()
    const promise = getVenue('slow', { signal: controller.signal })
    controller.abort()
    await expect(promise).rejects.toThrow()
  })
})

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'host',
  email: 'host@stud.noroff.no',
  venueManager: true,
}

const VALID_INPUT = {
  name: 'Olive Cabin',
  description: 'Stone-walled bothy a kilometre off the road, with no neighbours.',
  media: [{ url: 'https://example.com/cover.jpg', alt: 'Cover' }],
  price: 240,
  maxGuests: 4,
  meta: { wifi: true, parking: true, breakfast: false, pets: false },
  location: {
    address: null,
    city: 'Lisbon',
    zip: null,
    country: 'Portugal',
    continent: 'Europe',
    lat: null,
    lng: null,
  },
}

describe('createVenue', () => {
  beforeEach(() => {
    clearSession()
    setSession(TEST_SESSION)
  })

  it('POSTs the typed body and returns the parsed venue', async () => {
    let captured: Record<string, unknown> | null = null
    server.use(
      http.post(`${BASE}/venues`, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { ...SAMPLE_VENUE, id: 'new-1', name: VALID_INPUT.name },
        })
      }),
    )

    const venue = await createVenue(VALID_INPUT)

    expect(captured).toMatchObject({
      name: VALID_INPUT.name,
      price: 240,
      maxGuests: 4,
      meta: VALID_INPUT.meta,
    })
    expect(venue.id).toBe('new-1')
    expect(venue.name).toBe(VALID_INPUT.name)
  })

  it('clears the venues-list cache on success', async () => {
    writeCache({ namespace: 'venues', params: { page: 1 } }, { venues: [], meta: undefined })
    expect(sessionStorage.getItem(__test__buildKey({ namespace: 'venues', params: { page: 1 } })))
      .not.toBeNull()

    server.use(
      http.post(`${BASE}/venues`, () =>
        HttpResponse.json({ data: { ...SAMPLE_VENUE, id: 'new-2' } }),
      ),
    )

    await createVenue(VALID_INPUT)
    expect(sessionStorage.getItem(__test__buildKey({ namespace: 'venues', params: { page: 1 } })))
      .toBeNull()
  })

  it('throws ApiError(401) when no session is set', async () => {
    clearSession()
    await expect(createVenue(VALID_INPUT)).rejects.toBeInstanceOf(ApiError)
  })

  it('rejects malformed input via the strict schema', async () => {
    await expect(
      // @ts-expect-error — extra field rejected by .strict()
      createVenue({ ...VALID_INPUT, isFeatured: true }),
    ).rejects.toThrow()
  })
})

describe('updateVenue', () => {
  beforeEach(() => {
    clearSession()
    setSession(TEST_SESSION)
  })

  it('PUTs the patch and returns the updated venue', async () => {
    let captured: Record<string, unknown> | null = null
    server.use(
      http.put(`${BASE}/venues/v-1`, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { ...SAMPLE_VENUE, id: 'v-1', price: 320 },
        })
      }),
    )

    const venue = await updateVenue('v-1', { price: 320 })

    expect(captured).toEqual({ price: 320 })
    expect(venue.id).toBe('v-1')
    expect(venue.price).toBe(320)
  })

  it('busts the venue-detail cache and clears the list cache on success', async () => {
    writeCache({ namespace: 'venue', params: { id: 'v-1' } }, SAMPLE_VENUE)
    writeCache({ namespace: 'venues', params: { page: 1 } }, { venues: [], meta: undefined })

    server.use(
      http.put(`${BASE}/venues/v-1`, () =>
        HttpResponse.json({ data: { ...SAMPLE_VENUE, id: 'v-1', price: 320 } }),
      ),
    )

    await updateVenue('v-1', { price: 320 })

    expect(sessionStorage.getItem(__test__buildKey({ namespace: 'venue', params: { id: 'v-1' } })))
      .toBeNull()
    expect(sessionStorage.getItem(__test__buildKey({ namespace: 'venues', params: { page: 1 } })))
      .toBeNull()
  })

  it('surfaces ApiError(403) when the caller is not the owner', async () => {
    server.use(
      http.put(`${BASE}/venues/v-1`, () =>
        HttpResponse.json(
          { errors: [{ message: 'You do not own this venue' }] },
          { status: 403 },
        ),
      ),
    )

    await expect(updateVenue('v-1', { price: 320 })).rejects.toMatchObject({ status: 403 })
  })

  it('rejects extra fields via the strict patch schema', async () => {
    await expect(
      // @ts-expect-error — id is read-only on the resource
      updateVenue('v-1', { id: 'forced' }),
    ).rejects.toThrow()
  })
})

describe('deleteVenue', () => {
  beforeEach(() => {
    clearSession()
    setSession(TEST_SESSION)
  })

  it('DELETEs the venue and resolves on 204', async () => {
    let called = false
    server.use(
      http.delete(`${BASE}/venues/v-1`, () => {
        called = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteVenue('v-1')).resolves.toBeUndefined()
    expect(called).toBe(true)
  })

  it('busts the venue-detail cache and clears the list cache on success', async () => {
    writeCache({ namespace: 'venue', params: { id: 'v-1' } }, SAMPLE_VENUE)
    writeCache({ namespace: 'venues', params: { page: 1 } }, { venues: [], meta: undefined })

    server.use(
      http.delete(`${BASE}/venues/v-1`, () => new HttpResponse(null, { status: 204 })),
    )

    await deleteVenue('v-1')

    expect(sessionStorage.getItem(__test__buildKey({ namespace: 'venue', params: { id: 'v-1' } })))
      .toBeNull()
    expect(sessionStorage.getItem(__test__buildKey({ namespace: 'venues', params: { page: 1 } })))
      .toBeNull()
  })

  it('surfaces ApiError(403) when the caller is not the owner', async () => {
    server.use(
      http.delete(`${BASE}/venues/v-1`, () =>
        HttpResponse.json(
          { errors: [{ message: 'You do not own this venue' }] },
          { status: 403 },
        ),
      ),
    )

    await expect(deleteVenue('v-1')).rejects.toMatchObject({ status: 403 })
  })

  it('throws ApiError(401) when no session is set', async () => {
    clearSession()
    await expect(deleteVenue('v-1')).rejects.toBeInstanceOf(ApiError)
  })
})
