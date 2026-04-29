import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { FALLBACK_VENUES } from '../lib/fallback'
import { server } from '../test/msw/server'
import type { Venue } from '../types/venue'
import { BASE } from './client'
import { getVenue, listVenues, searchVenues } from './venues'

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
