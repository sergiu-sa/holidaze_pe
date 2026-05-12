import { describe, expect, it } from 'vitest'

import { INTRO_CITIES } from '../cities'

describe('INTRO_CITIES', () => {
  it('contains the eight Act 1 cities in choreography order', () => {
    expect(INTRO_CITIES.map((c) => c.key)).toEqual([
      'oslo',
      'lisbon',
      'marrakech',
      'cape-town',
      'rio-de-janeiro',
      'san-francisco',
      'kyoto',
      'sydney',
    ])
  })

  it('every city resolves to a real coordinate in CITY_COORDS', () => {
    for (const city of INTRO_CITIES) {
      expect(Number.isFinite(city.lat)).toBe(true)
      expect(Number.isFinite(city.lng)).toBe(true)
      expect(city.lat).not.toBe(0)
      expect(city.lng).not.toBe(0)
    }
  })

  it('Oslo carries the head-row bounds coordinates (N 59° 55′ · E 10° 45′)', () => {
    const oslo = INTRO_CITIES.find((c) => c.key === 'oslo')
    expect(oslo).toBeDefined()
    expect(oslo!.lat).toBeCloseTo(59.9139, 3)
    expect(oslo!.lng).toBeCloseTo(10.7522, 3)
  })

  it('module load succeeds — every gazetteer key resolved (no pick() throw)', () => {
    expect(INTRO_CITIES).toHaveLength(8)
  })
})
