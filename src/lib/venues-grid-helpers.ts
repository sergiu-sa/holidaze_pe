import type { Venue } from '../types/venue'

// Pattern: 1 feature (span 2) + 4 regular per row of 5. Trim to the largest
// match so the grid never renders a half-empty trailing row.
export const BENTO_TARGETS = [15, 12, 10, 5] as const

export function trimToBentoCount(venues: Venue[]): Venue[] {
  for (const target of BENTO_TARGETS) {
    if (venues.length >= target) return venues.slice(0, target)
  }
  return venues
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest ↓' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'rating-desc', label: 'Rating ↓' },
  { value: 'name-asc', label: 'Name A–Z' },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

export function isSortValue(v: string | null): v is SortValue {
  return v != null && SORT_OPTIONS.some((opt) => opt.value === v)
}

export interface Filters {
  maxPrice: number
  minGuests: number
  amenities: Set<'wifi' | 'parking' | 'breakfast' | 'pets'>
  minRating: number
}

export const INITIAL_FILTERS: Filters = {
  maxPrice: 1000,
  minGuests: 1,
  amenities: new Set(),
  minRating: 0,
}

// Hydrates `minGuests` so the Home search funnel's guests count survives navigation.
export function initFiltersFromParams(params: URLSearchParams): Filters {
  const raw = Number(params.get('guests'))
  if (!Number.isFinite(raw) || raw <= 1) return INITIAL_FILTERS
  return { ...INITIAL_FILTERS, minGuests: Math.min(10, Math.floor(raw)) }
}

const SHORT_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

export function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : SHORT_DATE.format(d)
}

export function filterVenues(venues: Venue[], f: Filters): Venue[] {
  return venues.filter((v) => {
    if (v.price > f.maxPrice) return false
    if (v.maxGuests < f.minGuests) return false
    if (v.rating < f.minRating) return false
    for (const a of f.amenities) {
      if (!v.meta[a]) return false
    }
    return true
  })
}

// Every 5th card → feature (spans 2). Aligns with BENTO_TARGETS row math.
export function variantClassFor(i: number): string {
  return i % 5 === 0 ? 'venue--feature' : ''
}
