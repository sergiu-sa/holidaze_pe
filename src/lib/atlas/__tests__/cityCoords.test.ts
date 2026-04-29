import { describe, expect, it } from 'vitest'

import { CITY_COORDS, lookupCity } from '../cityCoords'

describe('lookupCity', () => {
  it('matches case- and trim-insensitively', () => {
    expect(lookupCity('paris')?.country).toBe('France')
    expect(lookupCity('  Paris  ')?.country).toBe('France')
    expect(lookupCity('PARIS')?.country).toBe('France')
  })

  it('returns null for empty / unknown inputs', () => {
    expect(lookupCity(null)).toBeNull()
    expect(lookupCity(undefined)).toBeNull()
    expect(lookupCity('')).toBeNull()
    expect(lookupCity('atlantis')).toBeNull()
  })

  it('covers the cities used by the curated FALLBACK list', () => {
    const required = ['begur', 'bergen', 'kyoto', 'paris', 'marrakech', 'fanø']
    for (const city of required) {
      expect(lookupCity(city)).not.toBeNull()
    }
  })

  it('aliases diacritic + ascii spellings to the same coordinates', () => {
    expect(lookupCity('tromsø')).toEqual(lookupCity('tromso'))
    expect(lookupCity('reykjavík')).toEqual(lookupCity('reykjavik'))
    expect(lookupCity('são paulo')).toEqual(lookupCity('sao paulo'))
    expect(lookupCity('fanø')).toEqual(lookupCity('fano'))
  })
})

describe('CITY_COORDS', () => {
  it('every entry carries a non-empty country and a known continent', () => {
    const known = new Set([
      'Africa',
      'Antarctica',
      'Asia',
      'Europe',
      'North America',
      'Oceania',
      'South America',
    ])
    for (const [, value] of Object.entries(CITY_COORDS)) {
      expect(value.country.length).toBeGreaterThan(0)
      expect(known.has(value.continent)).toBe(true)
    }
  })

  it('every coordinate is a finite number inside earth bounds', () => {
    for (const [, value] of Object.entries(CITY_COORDS)) {
      expect(Number.isFinite(value.lat)).toBe(true)
      expect(Number.isFinite(value.lng)).toBe(true)
      expect(Math.abs(value.lat)).toBeLessThanOrEqual(85)
      expect(Math.abs(value.lng)).toBeLessThanOrEqual(180)
    }
  })
})
