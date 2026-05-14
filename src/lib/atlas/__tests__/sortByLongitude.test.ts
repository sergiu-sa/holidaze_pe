import { describe, expect, it } from 'vitest'

import type { CityEntry } from '../groupByCity'
import { uniqueCitiesByLongitude } from '../sortByLongitude'

function entry(city: string, lng: number): CityEntry {
  return { city, country: 'XX', continent: 'Europe', lat: 0, lng, venues: [] }
}

describe('uniqueCitiesByLongitude', () => {
  it('returns city names sorted west-to-east', () => {
    const result = uniqueCitiesByLongitude([
      entry('Bergen', 5.3),
      entry('Marrakech', -8.0),
      entry('Kyoto', 135.8),
      entry('Lisbon', -9.1),
    ])
    expect(result).toEqual(['Lisbon', 'Marrakech', 'Bergen', 'Kyoto'])
  })

  it('dedups by lower-case city name, keeping first occurrence', () => {
    const result = uniqueCitiesByLongitude([
      entry('Bergen', 5.3),
      entry('bergen', 5.4),
      entry('BERGEN', 5.5),
    ])
    expect(result).toEqual(['Bergen'])
  })

  it("rejects garbage entries ('string', 'unknown')", () => {
    const result = uniqueCitiesByLongitude([
      entry('string', 0),
      entry('Unknown', 0),
      entry('Paris', 2.35),
    ])
    expect(result).toEqual(['Paris'])
  })

  it('returns an empty array when every entry is rejected', () => {
    expect(uniqueCitiesByLongitude([entry('string', 0)])).toEqual([])
  })
})
