import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { BASE } from '../../api/client'
import { server } from '../../test/msw/server'
import type { Venue } from '../../types/venue'
import { useVenues } from '../useVenues'

const SAMPLE_VENUE: Venue = {
  id: 'real-1',
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

describe('useVenues', () => {
  it('starts in loading state and resolves to live data', async () => {
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({
          data: Array.from({ length: 4 }, (_v, i) => ({ ...SAMPLE_VENUE, id: `v-${String(i)}` })),
          meta: SAMPLE_META,
        }),
      ),
    )

    const { result } = renderHook(() => useVenues({ page: 1 }))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.data).toHaveLength(4)
    expect(result.current.source).toBe('live')
    expect(result.current.isFallback).toBe(false)
  })

  it('exposes isFallback when the API call falls back to the curated list', async () => {
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({ errors: [{ message: 'oops' }] }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useVenues({ page: 1 }))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isFallback).toBe(true)
    expect(result.current.data?.length).toBeGreaterThan(0)
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useVenues({ enabled: false }))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeNull()
  })
})
