import { describe, expect, it } from 'vitest'

import type { Venue } from '../../types/venue'
import type { Filters } from '../venues-grid-helpers'
import {
  filterVenues,
  formatShortDate,
  isSortValue,
  SORT_OPTIONS,
  trimToBentoCount,
  variantClassFor,
} from '../venues-grid-helpers'

function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: 'v1',
    name: 'Casa del Viento',
    description: 'A cliffside house above the Mediterranean.',
    media: [{ url: 'https://images.unsplash.com/photo-123?w=800', alt: '' }],
    price: 280,
    maxGuests: 4,
    rating: 4.8,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    meta: { wifi: true, parking: true, breakfast: false, pets: true },
    location: {
      address: null,
      city: 'Begur',
      zip: null,
      country: 'Spain',
      continent: 'Europe',
      lat: 41.95,
      lng: 3.21,
    },
    ...overrides,
  }
}

function makeVenues(n: number): Venue[] {
  return Array.from({ length: n }, (_, i) => makeVenue({ id: `v${String(i)}` }))
}

const BASE_FILTERS: Filters = {
  maxPrice: 1000,
  minGuests: 1,
  amenities: new Set(),
  minRating: 0,
}

// ──────────────────────────────────────────────────────────────────────────────
// trimToBentoCount
// ──────────────────────────────────────────────────────────────────────────────

describe('trimToBentoCount', () => {
  it('returns empty array when input is empty', () => {
    expect(trimToBentoCount([])).toHaveLength(0)
  })

  it('returns all 5 when length is exactly 5', () => {
    expect(trimToBentoCount(makeVenues(5))).toHaveLength(5)
  })

  it('trims to 5 when length is less than 10 but ≥ 5', () => {
    // Length 7 → target 5
    expect(trimToBentoCount(makeVenues(7))).toHaveLength(5)
  })

  it('trims to 10 when length is between 10 and 12 (exclusive)', () => {
    expect(trimToBentoCount(makeVenues(10))).toHaveLength(10)
    expect(trimToBentoCount(makeVenues(11))).toHaveLength(10)
  })

  it('trims to 12 when length is between 12 and 15 (exclusive)', () => {
    expect(trimToBentoCount(makeVenues(12))).toHaveLength(12)
    expect(trimToBentoCount(makeVenues(13))).toHaveLength(12)
  })

  it('trims to 15 when length is ≥ 15', () => {
    expect(trimToBentoCount(makeVenues(15))).toHaveLength(15)
    expect(trimToBentoCount(makeVenues(50))).toHaveLength(15)
  })

  it('returns the input unchanged when length is below any target (< 5)', () => {
    const input = makeVenues(3)
    expect(trimToBentoCount(input)).toStrictEqual(input)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// filterVenues
// ──────────────────────────────────────────────────────────────────────────────

describe('filterVenues — price', () => {
  it('keeps venues at or below maxPrice', () => {
    const venues = [makeVenue({ price: 100 }), makeVenue({ price: 500 }), makeVenue({ price: 1000 })]
    const result = filterVenues(venues, { ...BASE_FILTERS, maxPrice: 500 })
    expect(result).toHaveLength(2)
  })

  it('excludes venues above maxPrice', () => {
    const result = filterVenues([makeVenue({ price: 1001 })], { ...BASE_FILTERS, maxPrice: 1000 })
    expect(result).toHaveLength(0)
  })
})

describe('filterVenues — guests', () => {
  it('keeps venues with maxGuests >= minGuests', () => {
    const venues = [makeVenue({ maxGuests: 2 }), makeVenue({ maxGuests: 4 }), makeVenue({ maxGuests: 1 })]
    const result = filterVenues(venues, { ...BASE_FILTERS, minGuests: 3 })
    expect(result).toHaveLength(1)
    expect(result[0].maxGuests).toBe(4)
  })
})

describe('filterVenues — rating', () => {
  it('keeps venues with rating >= minRating', () => {
    const venues = [makeVenue({ rating: 3 }), makeVenue({ rating: 4 }), makeVenue({ rating: 4.5 })]
    const result = filterVenues(venues, { ...BASE_FILTERS, minRating: 4 })
    expect(result).toHaveLength(2)
  })
})

describe('filterVenues — amenities', () => {
  it('keeps venues that have all required amenities', () => {
    const venues = [
      makeVenue({ meta: { wifi: true, parking: false, breakfast: false, pets: false } }),
      makeVenue({ meta: { wifi: true, parking: true, breakfast: false, pets: false } }),
    ]
    const result = filterVenues(venues, {
      ...BASE_FILTERS,
      amenities: new Set(['wifi', 'parking'] as const),
    })
    expect(result).toHaveLength(1)
  })

  it('returns all venues when amenity set is empty', () => {
    const venues = makeVenues(3)
    expect(filterVenues(venues, BASE_FILTERS)).toHaveLength(3)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// variantClassFor
// ──────────────────────────────────────────────────────────────────────────────

describe('variantClassFor', () => {
  it('returns "venue--feature" for index 0 (every 5th)', () => {
    expect(variantClassFor(0)).toBe('venue--feature')
    expect(variantClassFor(5)).toBe('venue--feature')
    expect(variantClassFor(10)).toBe('venue--feature')
  })

  it('returns empty string for non-multiples of 5', () => {
    expect(variantClassFor(1)).toBe('')
    expect(variantClassFor(2)).toBe('')
    expect(variantClassFor(3)).toBe('')
    expect(variantClassFor(4)).toBe('')
    expect(variantClassFor(6)).toBe('')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// isSortValue
// ──────────────────────────────────────────────────────────────────────────────

describe('isSortValue', () => {
  it('returns true for all valid sort values', () => {
    for (const opt of SORT_OPTIONS) {
      expect(isSortValue(opt.value)).toBe(true)
    }
  })

  it('returns false for unknown strings', () => {
    expect(isSortValue('random')).toBe(false)
    expect(isSortValue('')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isSortValue(null)).toBe(false)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// formatShortDate
// ──────────────────────────────────────────────────────────────────────────────

describe('formatShortDate', () => {
  it('formats a valid ISO date string to a short locale date', () => {
    // en-GB with { day: 'numeric', month: 'short' } → "15 Jun" style
    const result = formatShortDate('2026-06-15T00:00:00.000Z')
    expect(result).toMatch(/\d{1,2}\s+\w+/)
  })

  it('passes through an invalid string unchanged', () => {
    expect(formatShortDate('not-a-date')).toBe('not-a-date')
  })

  it('passes through an empty string unchanged', () => {
    expect(formatShortDate('')).toBe('')
  })
})
