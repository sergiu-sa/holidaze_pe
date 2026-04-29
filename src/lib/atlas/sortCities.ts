import type { CityEntry } from './groupByCity'
import { priceStats } from './priceStats'

export type AtlasSort =
  | 'most-venues'
  | 'cheapest'
  | 'highest-rated'
  | 'a-z'
  | 'north-south'
  | 'west-east'

export const ATLAS_SORTS: readonly AtlasSort[] = [
  'most-venues',
  'cheapest',
  'highest-rated',
  'a-z',
  'north-south',
  'west-east',
]

export const ATLAS_SORT_LABELS: Readonly<Record<AtlasSort, string>> = {
  'most-venues': 'Most venues',
  cheapest: 'Cheapest first',
  'highest-rated': 'Highest rated',
  'a-z': 'A → Z',
  'north-south': 'North → South',
  'west-east': 'West → East',
}

export function isAtlasSort(value: string): value is AtlasSort {
  return (ATLAS_SORTS as readonly string[]).includes(value)
}

function avgRating(c: CityEntry): number {
  if (c.venues.length === 0) return 0
  let sum = 0
  let count = 0
  for (const v of c.venues) {
    const r = v.rating
    if (!Number.isFinite(r) || r <= 0) continue
    sum += r
    count += 1
  }
  return count === 0 ? 0 : sum / count
}

/** Stable sort by the chosen comparator. Ties broken alphabetically. */
export function sortCities(cities: readonly CityEntry[], sort: AtlasSort): CityEntry[] {
  const list = [...cities]
  const cmp = comparator(sort)
  list.sort((a, b) => {
    const primary = cmp(a, b)
    if (primary !== 0) return primary
    return a.city.localeCompare(b.city)
  })
  return list
}

function comparator(sort: AtlasSort): (a: CityEntry, b: CityEntry) => number {
  switch (sort) {
    case 'most-venues':
      return (a, b) => b.venues.length - a.venues.length
    case 'cheapest': {
      return (a, b) => {
        const pa = priceStats(a.venues)?.cheapest ?? Number.POSITIVE_INFINITY
        const pb = priceStats(b.venues)?.cheapest ?? Number.POSITIVE_INFINITY
        return pa - pb
      }
    }
    case 'highest-rated':
      return (a, b) => avgRating(b) - avgRating(a)
    case 'a-z':
      return (a, b) => a.city.localeCompare(b.city)
    case 'north-south':
      return (a, b) => b.lat - a.lat
    case 'west-east':
      return (a, b) => a.lng - b.lng
  }
}
