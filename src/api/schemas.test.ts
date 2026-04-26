import { describe, expect, it } from 'vitest'

import venueDetail from '../test/fixtures/venue-detail.json'
import venuesList from '../test/fixtures/venues-list.json'
import { BookingSchema, OwnerSchema, PaginationMetaSchema, VenueSchema } from './schemas'

// ─── VenueSchema — list ──────────────────────────────────────────────────────

describe('VenueSchema — list fixture', () => {
  it('parses every venue in venues-list.json without error', () => {
    for (const venue of venuesList.data) {
      const result = VenueSchema.safeParse(venue)
      expect(result.success).toBe(true)
    }
  })
})

// ─── VenueSchema — detail (with owner + bookings) ───────────────────────────

describe('VenueSchema — detail fixture', () => {
  it('parses the venue-detail.json response (owner + bookings populated)', () => {
    const result = VenueSchema.safeParse(venueDetail.data)
    expect(result.success).toBe(true)
    if (!result.success) return

    // Spot-check a few fields to confirm mapping, not just parse success.
    expect(result.data.id).toBe('288d51f1-9cd3-4bf6-ab73-ee247badcb24')
    expect(result.data.owner?.name).toBe('venue1234')
    expect(Array.isArray(result.data.bookings)).toBe(true)
  })
})

// ─── OwnerSchema ─────────────────────────────────────────────────────────────

describe('OwnerSchema — embedded owner', () => {
  it('parses the owner block from venue-detail.json', () => {
    const result = OwnerSchema.safeParse(venueDetail.data.owner)
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.email).toBe('venue1234@stud.noroff.no')
    // bio is null in the fixture — confirm nullable is handled
    expect(result.data.bio).toBeNull()
  })
})

// ─── BookingSchema — rejection ───────────────────────────────────────────────

describe('BookingSchema — rejection', () => {
  it('rejects an empty object', () => {
    const result = BookingSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ─── VenueSchema — rejection ─────────────────────────────────────────────────

describe('VenueSchema — rejection', () => {
  it('rejects a partial object missing required fields', () => {
    const result = VenueSchema.safeParse({ id: 'x' })
    expect(result.success).toBe(false)
  })
})

// ─── PaginationMetaSchema ────────────────────────────────────────────────────

describe('PaginationMetaSchema', () => {
  it('parses the meta block from venues-list.json', () => {
    const result = PaginationMetaSchema.safeParse(venuesList.meta)
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.totalCount).toBe(1153)
    // previousPage is null for page 1
    expect(result.data.previousPage).toBeNull()
    expect(result.data.nextPage).toBe(2)
  })
})
