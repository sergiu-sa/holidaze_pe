import { describe, expect, it } from 'vitest'

import type { Venue } from '../../../types/venue'
import { priceStats } from '../priceStats'

function makeVenue(price: number): Venue {
  return {
    id: `v${String(price)}`,
    name: 'V',
    description: '',
    media: [],
    price,
    maxGuests: 1,
    rating: 0,
    created: '',
    updated: '',
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: null,
      zip: null,
      country: null,
      continent: null,
      lat: null,
      lng: null,
    },
  }
}

describe('priceStats', () => {
  it('returns null for empty input', () => {
    expect(priceStats([])).toBeNull()
  })

  it('returns null when no valid prices exist', () => {
    expect(priceStats([makeVenue(0), makeVenue(-1)])).toBeNull()
  })

  it('reports cheapest, dearest, and rounded average', () => {
    expect(priceStats([makeVenue(180), makeVenue(280), makeVenue(320)])).toEqual({
      cheapest: 180,
      dearest: 320,
      avg: 260,
    })
  })

  it('skips zero/negative prices', () => {
    expect(priceStats([makeVenue(180), makeVenue(0), makeVenue(220)])).toEqual({
      cheapest: 180,
      dearest: 220,
      avg: 200,
    })
  })
})
