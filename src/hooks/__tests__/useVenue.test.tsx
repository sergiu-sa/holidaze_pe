import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { BASE } from '../../api/client'
import { server } from '../../test/msw/server'
import type { Venue } from '../../types/venue'
import { useVenue } from '../useVenue'

const SAMPLE_VENUE: Venue = {
  id: 'detail-1',
  name: 'Casa del Viento',
  description: 'Cliffside.',
  media: [{ url: 'https://images.unsplash.com/photo-1?w=1400', alt: '' }],
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
  bookings: [],
  owner: {
    name: 'Lina',
    email: 'lina@stud.noroff.no',
    bio: null,
    avatar: { url: 'https://images.unsplash.com/photo-2?w=400', alt: '' },
    banner: { url: 'https://images.unsplash.com/photo-3?w=1400', alt: '' },
  },
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('useVenue', () => {
  it('starts loading and resolves to a venue', async () => {
    server.use(
      http.get(`${BASE}/venues/detail-1`, () =>
        HttpResponse.json({ data: SAMPLE_VENUE, meta: {} }),
      ),
    )

    const { result } = renderHook(() => useVenue('detail-1'))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.data?.id).toBe('detail-1')
    expect(result.current.error).toBeNull()
  })

  it('exposes error on 404', async () => {
    server.use(
      http.get(`${BASE}/venues/missing`, () =>
        HttpResponse.json({ errors: [{ message: 'Not Found' }] }, { status: 404 }),
      ),
    )

    const { result } = renderHook(() => useVenue('missing'))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.error).not.toBeNull()
    expect(result.current.data).toBeNull()
  })

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useVenue(undefined))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useVenue('detail-1', { enabled: false }))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeNull()
  })
})
