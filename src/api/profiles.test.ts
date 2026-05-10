import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '../test/msw/server'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'
import { BASE } from './client'
import { getProfile, getProfileBookings, getProfileVenues, updateProfile } from './profiles'
import { clearSession, setSession } from './session'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'tester',
  email: 'tester@stud.noroff.no',
  venueManager: false,
}

const baseProfile = {
  name: 'tester',
  email: 'tester@stud.noroff.no',
  bio: null,
  avatar: { url: '', alt: '' },
  banner: { url: '', alt: '' },
  venueManager: false,
  _count: { venues: 0, bookings: 0 },
}

const emptyBookingsList = {
  data: [],
  meta: {
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 0,
  },
}

beforeEach(() => {
  clearSession()
  setSession(TEST_SESSION)
})

describe('getProfile', () => {
  it('fetches and parses a profile', async () => {
    server.use(
      http.get(`${BASE}/profiles/tester`, () =>
        HttpResponse.json({ data: baseProfile }),
      ),
    )
    const profile = await getProfile('tester')
    expect(profile.name).toBe('tester')
    expect(profile.venueManager).toBe(false)
  })

  it('throws ApiError(404) on missing profile', async () => {
    server.use(
      http.get(`${BASE}/profiles/missing`, () =>
        HttpResponse.json(
          { errors: [{ message: 'Not found' }], status: 'Not Found', statusCode: 404 },
          { status: 404 },
        ),
      ),
    )
    await expect(getProfile('missing')).rejects.toBeInstanceOf(ApiError)
    await expect(getProfile('missing')).rejects.toMatchObject({ status: 404 })
  })
})

describe('getProfileBookings', () => {
  it('appends _venue=true by default and parses the response', async () => {
    let url: URL | null = null
    server.use(
      http.get(`${BASE}/profiles/tester/bookings`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(emptyBookingsList)
      }),
    )
    const list = await getProfileBookings('tester')
    expect(list).toEqual([])
    expect(url).not.toBeNull()
    expect(url!.searchParams.get('_venue')).toBe('true')
  })

  it('omits _venue=true when caller opts out', async () => {
    let url: URL | null = null
    server.use(
      http.get(`${BASE}/profiles/tester/bookings`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(emptyBookingsList)
      }),
    )
    await getProfileBookings('tester', { venue: false })
    expect(url).not.toBeNull()
    expect(url!.searchParams.has('_venue')).toBe(false)
  })
})

describe('updateProfile', () => {
  it('PUTs the patch and returns the updated profile', async () => {
    let receivedBody: Record<string, unknown> | null = null
    server.use(
      http.put(`${BASE}/profiles/tester`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: {
            ...baseProfile,
            avatar: { url: 'https://example.com/me.jpg', alt: 'Me' },
          },
        })
      }),
    )
    const updated = await updateProfile('tester', {
      avatar: { url: 'https://example.com/me.jpg', alt: 'Me' },
    })
    expect(updated.avatar.url).toBe('https://example.com/me.jpg')
    expect(receivedBody).toEqual({
      avatar: { url: 'https://example.com/me.jpg', alt: 'Me' },
    })
  })

  it('throws when the patch fails strict-schema validation', async () => {
    await expect(
      // @ts-expect-error — deliberately malformed; runtime rejection is the contract
      updateProfile('tester', { monoColor: 'ink' }),
    ).rejects.toThrow()
  })

  it('surfaces ApiError(400) from the server', async () => {
    server.use(
      http.put(`${BASE}/profiles/tester`, () =>
        HttpResponse.json(
          {
            errors: [{ message: 'Invalid avatar URL' }],
            status: 'Bad Request',
            statusCode: 400,
          },
          { status: 400 },
        ),
      ),
    )
    await expect(
      updateProfile('tester', { avatar: { url: 'http://broken', alt: 'x' } }),
    ).rejects.toBeInstanceOf(ApiError)
    await expect(
      updateProfile('tester', { avatar: { url: 'http://broken', alt: 'x' } }),
    ).rejects.toMatchObject({ status: 400 })
  })
})

describe('getProfileVenues', () => {
  const sampleVenue: Venue = {
    id: 'v-1',
    name: 'Olive Cabin',
    description: 'Stone-walled bothy a kilometre off the road.',
    media: [{ url: 'https://example.com/cover.jpg', alt: 'Cover' }],
    price: 240,
    maxGuests: 4,
    rating: 4.5,
    created: '2026-04-01T00:00:00.000Z',
    updated: '2026-04-01T00:00:00.000Z',
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

  const venuesEnvelope = {
    data: [sampleVenue],
    meta: {
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1,
    },
  }

  it('appends _bookings=true by default and parses the response', async () => {
    let url: URL | null = null
    server.use(
      http.get(`${BASE}/profiles/tester/venues`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(venuesEnvelope)
      }),
    )
    const list = await getProfileVenues('tester')
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Olive Cabin')
    expect(url).not.toBeNull()
    expect(url!.searchParams.get('_bookings')).toBe('true')
  })

  it('omits _bookings=true when caller opts out', async () => {
    let url: URL | null = null
    server.use(
      http.get(`${BASE}/profiles/tester/venues`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(venuesEnvelope)
      }),
    )
    await getProfileVenues('tester', { bookings: false })
    expect(url).not.toBeNull()
    expect(url!.searchParams.has('_bookings')).toBe(false)
  })

  it('throws ApiError(401) when session is missing', async () => {
    clearSession()
    await expect(getProfileVenues('tester')).rejects.toBeInstanceOf(ApiError)
  })
})
