import type { CityEntry } from './groupByCity'

const SKIP_CITIES = new Set(['string', 'unknown'])

function dedupByCityName<T>(
  entries: readonly CityEntry[],
  project: (entry: CityEntry) => T,
): T[] {
  const seen = new Map<string, T>()
  for (const entry of entries) {
    const lower = entry.city.toLowerCase()
    if (SKIP_CITIES.has(lower)) continue
    if (seen.has(lower)) continue
    seen.set(lower, project(entry))
  }
  return Array.from(seen.values())
}

/** West-to-east journey order — used by the home marquee. */
export function uniqueCitiesByLongitude(entries: readonly CityEntry[]): string[] {
  return dedupByCityName(entries, (e) => ({ city: e.city, lng: e.lng }))
    .sort((a, b) => a.lng - b.lng)
    .map((e) => e.city)
}

export interface CityOption {
  city: string
  country: string
}

/** Alphabetical { city, country } pairs — used by the destination datalist. */
export function uniqueCityOptions(entries: readonly CityEntry[]): CityOption[] {
  return dedupByCityName(entries, (e) => ({ city: e.city, country: e.country })).sort(
    (a, b) => a.city.localeCompare(b.city),
  )
}
