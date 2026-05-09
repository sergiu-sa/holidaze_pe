import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BASE } from '../../api/client'
import { clearSession, setSession } from '../../api/session'
import { server } from '../../test/msw/server'
import type { Venue } from '../../types/venue'
import { AuthProvider } from '../useAuth'
import { useProfileVenues } from '../useProfileVenues'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'host',
  email: 'host@stud.noroff.no',
  venueManager: true,
}

const sampleVenue: Venue = {
  id: 'v-1',
  name: 'Olive Cabin',
  description: 'Stone-walled bothy.',
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

const envelope = {
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

beforeEach(() => {
  clearSession()
  setSession(TEST_SESSION)
})

afterEach(() => {
  clearSession()
})

describe('useProfileVenues', () => {
  it('starts loading and resolves to the manager venues', async () => {
    server.use(
      http.get(`${BASE}/profiles/host/venues`, () => HttpResponse.json(envelope)),
    )

    const { result } = renderHook(() => useProfileVenues(), { wrapper: AuthProvider })
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('Olive Cabin')
    expect(result.current.error).toBeNull()
  })

  it('exposes error on 404', async () => {
    server.use(
      http.get(`${BASE}/profiles/host/venues`, () =>
        HttpResponse.json({ errors: [{ message: 'Not Found' }] }, { status: 404 }),
      ),
    )

    const { result } = renderHook(() => useProfileVenues(), { wrapper: AuthProvider })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.error).not.toBeNull()
    expect(result.current.data).toBeNull()
  })

  it('refetch triggers a second request', async () => {
    let calls = 0
    server.use(
      http.get(`${BASE}/profiles/host/venues`, () => {
        calls += 1
        return HttpResponse.json(envelope)
      }),
    )

    const { result } = renderHook(() => useProfileVenues(), { wrapper: AuthProvider })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(calls).toBe(1)

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(calls).toBe(2)
    })
  })

  it('does not fetch when there is no signed-in user', () => {
    clearSession()
    const { result } = renderHook(() => useProfileVenues(), { wrapper: AuthProvider })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeNull()
  })
})
