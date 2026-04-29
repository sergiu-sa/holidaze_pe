import { describe, expect, it } from 'vitest'

import type { Venue } from '../../../types/venue'
import type { CityEntry } from '../groupByCity'
import { sortCities } from '../sortCities'

function makeVenue(price: number, rating: number, id = `v${String(price)}-${String(rating)}`): Venue {
  return {
    id,
    name: `Venue ${id}`,
    description: '',
    media: [],
    price,
    maxGuests: 2,
    rating,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: 'X',
      zip: null,
      country: 'X',
      continent: 'Europe',
      lat: 0,
      lng: 0,
    },
  }
}

function city(name: string, lat: number, lng: number, venues: Venue[]): CityEntry {
  return { city: name, country: '', continent: 'Europe', lat, lng, venues }
}

const FIXTURE: CityEntry[] = [
  city('Paris', 48.8, 2.3, [makeVenue(280, 4.6), makeVenue(320, 4.4)]),
  city('Bergen', 60.4, 5.3, [makeVenue(180, 4.9)]),
  city('Tokyo', 35.7, 139.7, [makeVenue(220, 4.7), makeVenue(260, 4.5), makeVenue(310, 4.8)]),
  city('Marrakech', 31.6, -7.9, [makeVenue(150, 4.2)]),
]

describe('sortCities', () => {
  it('most-venues puts the largest city first', () => {
    const sorted = sortCities(FIXTURE, 'most-venues').map((c) => c.city)
    expect(sorted[0]).toBe('Tokyo')
  })

  it('cheapest sorts by lowest €/night', () => {
    const sorted = sortCities(FIXTURE, 'cheapest').map((c) => c.city)
    expect(sorted).toEqual(['Marrakech', 'Bergen', 'Tokyo', 'Paris'])
  })

  it('highest-rated sorts by avg rating desc', () => {
    const sorted = sortCities(FIXTURE, 'highest-rated').map((c) => c.city)
    expect(sorted[0]).toBe('Bergen')
  })

  it('a-z is alphabetical', () => {
    const sorted = sortCities(FIXTURE, 'a-z').map((c) => c.city)
    expect(sorted).toEqual(['Bergen', 'Marrakech', 'Paris', 'Tokyo'])
  })

  it('north-south goes high latitude → low', () => {
    const sorted = sortCities(FIXTURE, 'north-south').map((c) => c.city)
    expect(sorted).toEqual(['Bergen', 'Paris', 'Tokyo', 'Marrakech'])
  })

  it('west-east goes negative longitude → positive', () => {
    const sorted = sortCities(FIXTURE, 'west-east').map((c) => c.city)
    expect(sorted).toEqual(['Marrakech', 'Paris', 'Bergen', 'Tokyo'])
  })

  it('does not mutate the input', () => {
    const original = [...FIXTURE]
    sortCities(FIXTURE, 'cheapest')
    expect(FIXTURE).toEqual(original)
  })
})
