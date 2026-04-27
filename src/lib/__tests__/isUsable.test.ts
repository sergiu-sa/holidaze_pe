import { describe, expect, it } from 'vitest'

import type { Venue } from '../../types/venue'
import { isUsable } from '../isUsable'

function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: 'v1',
    name: 'Casa del Viento',
    description: 'A cliffside house above the Mediterranean.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400',
        alt: '',
      },
    ],
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

describe('isUsable — happy path', () => {
  it('accepts a venue with real-looking name + price + city + image', () => {
    expect(isUsable(makeVenue())).toBe(true)
  })
})

describe('isUsable — name rejections', () => {
  it('rejects "string" name (the canonical stub)', () => {
    expect(isUsable(makeVenue({ name: 'string' }))).toBe(false)
  })

  it('rejects names shorter than 3 chars', () => {
    expect(isUsable(makeVenue({ name: 'ab' }))).toBe(false)
  })

  it('rejects placeholder prefixes (asdf, lorem, xxx)', () => {
    expect(isUsable(makeVenue({ name: 'asdf place' }))).toBe(false)
    expect(isUsable(makeVenue({ name: 'Lorem ipsum house' }))).toBe(false)
  })

  it('rejects names longer than 80 chars (defensive against pasted junk)', () => {
    expect(isUsable(makeVenue({ name: 'x'.repeat(120) }))).toBe(false)
  })
})

describe('isUsable — price rejections', () => {
  it('rejects price === 0', () => {
    expect(isUsable(makeVenue({ price: 0 }))).toBe(false)
  })

  it('rejects unreasonably high prices', () => {
    expect(isUsable(makeVenue({ price: 99_999_999 }))).toBe(false)
  })

  it('rejects negative prices', () => {
    expect(isUsable(makeVenue({ price: -10 }))).toBe(false)
  })
})

describe('isUsable — location rejections', () => {
  it('rejects null city', () => {
    const v = makeVenue()
    v.location = { ...v.location, city: null }
    expect(isUsable(v)).toBe(false)
  })

  it('rejects city starting with a non-letter (numbers, punctuation)', () => {
    const v = makeVenue()
    v.location = { ...v.location, city: '123' }
    expect(isUsable(v)).toBe(false)
  })
})

describe('isUsable — media rejections', () => {
  it('rejects when media is missing entirely (default options)', () => {
    expect(isUsable(makeVenue({ media: [] }))).toBe(false)
  })

  it('accepts missing media when allowEmptyMedia: true', () => {
    expect(isUsable(makeVenue({ media: [] }), { allowEmptyMedia: true })).toBe(true)
  })

  it('rejects placeholder image hosts', () => {
    expect(
      isUsable(makeVenue({ media: [{ url: 'https://via.placeholder.com/600', alt: '' }] })),
    ).toBe(false)
  })

  it('rejects non-image URLs that are not on a known CDN', () => {
    expect(
      isUsable(makeVenue({ media: [{ url: 'https://random.example/abc', alt: '' }] })),
    ).toBe(false)
  })

  it('accepts images on known CDNs even without an extension in the URL', () => {
    expect(
      isUsable(
        makeVenue({
          media: [{ url: 'https://images.unsplash.com/photo-123?w=800', alt: '' }],
        }),
      ),
    ).toBe(true)
  })
})

describe('isUsable — null/undefined inputs', () => {
  it('returns false for null', () => {
    expect(isUsable(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isUsable(undefined)).toBe(false)
  })
})
