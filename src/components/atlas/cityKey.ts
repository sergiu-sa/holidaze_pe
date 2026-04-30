import type { CityEntry } from '../../lib/atlas/groupByCity'

// Stable key for a (city, lat, lng) bucket — matches the bucket key used in
// groupByCity so URL state can round-trip without ambiguity.
export function cityKey(city: Pick<CityEntry, 'city' | 'lat' | 'lng'>): string {
  return `${city.city.toLowerCase()}|${String(Math.round(city.lat * 10))}|${String(Math.round(city.lng * 10))}`
}
