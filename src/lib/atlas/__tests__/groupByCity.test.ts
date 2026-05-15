import { describe, expect, it } from 'vitest'

import type { Venue } from '../../../types/venue'
import { groupByCity } from '../groupByCity'

function makeVenue(overrides: Partial<Venue> & { id: string }): Venue {
  return {
    id: overrides.id,
    name: overrides.name ?? 'A house',
    description: overrides.description ?? '',
    media: overrides.media ?? [],
    price: overrides.price ?? 100,
    maxGuests: overrides.maxGuests ?? 2,
    rating: overrides.rating ?? 0,
    created: overrides.created ?? '2026-01-01T00:00:00.000Z',
    updated: overrides.updated ?? '2026-01-01T00:00:00.000Z',
    meta: overrides.meta ?? { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: 'Paris',
      zip: null,
      country: 'France',
      continent: 'Europe',
      lat: 48.8566,
      lng: 2.3522,
      ...overrides.location,
    },
  }
}

describe('groupByCity — happy path', () => {
  it('aggregates two venues in the same city into one entry', () => {
    const venues = [
      makeVenue({ id: 'a' }),
      makeVenue({ id: 'b' }),
    ]
    const cities = groupByCity(venues)
    expect(cities).toHaveLength(1)
    expect(cities[0]?.venues).toHaveLength(2)
    expect(cities[0]?.city).toBe('Paris')
  })

  it('keeps separate entries for distinct cities', () => {
    const venues = [
      makeVenue({ id: 'a' }),
      makeVenue({
        id: 'b',
        location: {
          city: 'Tokyo',
          country: 'Japan',
          continent: 'Asia',
          lat: 35.6762,
          lng: 139.6503,
          address: null,
          zip: null,
        },
      }),
    ]
    const cities = groupByCity(venues)
    expect(cities).toHaveLength(2)
    expect(cities.map((c) => c.city).sort()).toEqual(['Paris', 'Tokyo'])
  })
})

describe('groupByCity — gazetteer fallback', () => {
  it('fills in country + continent + coords when the venue ships placeholders', () => {
    const venues = [
      makeVenue({
        id: 'a',
        location: {
          city: 'Bergen',
          country: '',
          continent: '',
          lat: 0,
          lng: 0,
          address: null,
          zip: null,
        },
      }),
    ]
    const cities = groupByCity(venues)
    expect(cities).toHaveLength(1)
    const city = cities[0]
    expect(city.country).toBe('Norway')
    expect(city.continent).toBe('Europe')
    expect(city.lat).toBeCloseTo(60.39, 1)
    expect(city.lng).toBeCloseTo(5.32, 1)
  })

  it('prefers the gazetteer for country/continent even when coords are real', () => {
    const venues = [
      makeVenue({
        id: 'a',
        location: {
          city: 'Bergen',
          country: 'wrong',
          continent: 'wrong',
          lat: 60.4,
          lng: 5.3,
          address: null,
          zip: null,
        },
      }),
    ]
    const cities = groupByCity(venues)
    expect(cities).toHaveLength(1)
    const city = cities[0]
    expect(city.country).toBe('Norway')
    expect(city.continent).toBe('Europe')
    // Real coords retained
    expect(city.lat).toBe(60.4)
    expect(city.lng).toBe(5.3)
  })

  it('drops a venue with empty city', () => {
    const venues = [
      makeVenue({
        id: 'a',
        location: {
          city: '',
          country: 'X',
          continent: 'Y',
          lat: 1,
          lng: 1,
          address: null,
          zip: null,
        },
      }),
    ]
    expect(groupByCity(venues)).toHaveLength(0)
  })

  it('drops a venue with placeholder coords AND no gazetteer hit', () => {
    const venues = [
      makeVenue({
        id: 'a',
        location: {
          city: 'Atlantis',
          country: '',
          continent: '',
          lat: 0,
          lng: 0,
          address: null,
          zip: null,
        },
      }),
    ]
    expect(groupByCity(venues)).toHaveLength(0)
  })

  it('drops a venue with real coords but no gazetteer hit', () => {
    // Noroff managers type garbage city names ("That Town", "Menthure") with
    // plausible-looking coords; without a curated gazetteer entry we can't
    // verify the city is real, so it stays off the atlas plate.
    const venues = [
      makeVenue({
        id: 'a',
        location: {
          city: 'That Town',
          country: 'France',
          continent: 'Europe',
          lat: 48.5,
          lng: 2.5,
          address: null,
          zip: null,
        },
      }),
    ]
    expect(groupByCity(venues)).toHaveLength(0)
  })
})
