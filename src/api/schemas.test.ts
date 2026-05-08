import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import venueDetail from '../test/fixtures/venue-detail.json'
import venuesList from '../test/fixtures/venues-list.json'
import {
  ApiKeySuccessSchema,
  BookingSchema,
  BookingsListSuccessSchema,
  BookingSuccessSchema,
  CreateBookingInputSchema,
  LoginInputSchema,
  LoginSuccessSchema,
  OwnerSchema,
  PaginationMetaSchema,
  ProfileBookingsListSuccessSchema,
  ProfileSuccessSchema,
  RegisterInputSchema,
  RegisterSuccessSchema,
  UpdateBookingInputSchema,
  UpdateProfileInputSchema,
  VenueSchema,
} from './schemas'

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

describe('LoginInputSchema', () => {
  it('parses a valid stud.noroff.no email + password', () => {
    const result = LoginInputSchema.safeParse({
      email: 'a@stud.noroff.no',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an email that does not end in stud.noroff.no', () => {
    const result = LoginInputSchema.safeParse({
      email: 'a@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const tree = z.treeifyError(result.error)
      expect(tree.properties?.email?.errors[0]).toContain('stud.noroff.no')
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = LoginInputSchema.safeParse({
      email: 'a@stud.noroff.no',
      password: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const tree = z.treeifyError(result.error)
      expect(tree.properties?.password?.errors[0]).toContain('8')
    }
  })

  it('rejects extra fields in strict mode', () => {
    const result = LoginInputSchema.safeParse({
      email: 'a@stud.noroff.no',
      password: '12345678',
      extra: 'not allowed',
    })
    expect(result.success).toBe(false)
  })
})

describe('RegisterInputSchema', () => {
  const valid = {
    name: 'sergiu',
    email: 'a@stud.noroff.no',
    password: '12345678',
    venueManager: false,
  }

  it('parses a valid customer payload', () => {
    expect(RegisterInputSchema.safeParse(valid).success).toBe(true)
  })

  it('parses a valid manager payload', () => {
    expect(RegisterInputSchema.safeParse({ ...valid, venueManager: true }).success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = RegisterInputSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name longer than 20 characters', () => {
    const result = RegisterInputSchema.safeParse({ ...valid, name: 'a'.repeat(21) })
    expect(result.success).toBe(false)
  })

  it('rejects name with hyphen (regex allows letters, numbers, underscore only)', () => {
    const result = RegisterInputSchema.safeParse({ ...valid, name: 'ser-giu' })
    expect(result.success).toBe(false)
  })

  it('accepts name with underscore', () => {
    expect(RegisterInputSchema.safeParse({ ...valid, name: 'ser_giu' }).success).toBe(true)
  })
})

describe('LoginSuccessSchema', () => {
  it('parses a valid login response with accessToken and Holidaze fields', () => {
    const result = LoginSuccessSchema.safeParse({
      data: {
        name: 'sergiu',
        email: 'a@stud.noroff.no',
        avatar: { url: 'https://x/y.jpg', alt: 'me' },
        venueManager: false,
        accessToken: 'tok_abc',
      },
    })
    expect(result.success).toBe(true)
  })

  it('parses without optional avatar/banner fields', () => {
    const result = LoginSuccessSchema.safeParse({
      data: {
        name: 'sergiu',
        email: 'a@stud.noroff.no',
        venueManager: true,
        accessToken: 'tok_abc',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects when accessToken is missing', () => {
    const result = LoginSuccessSchema.safeParse({
      data: { name: 'sergiu', email: 'a@stud.noroff.no', venueManager: false },
    })
    expect(result.success).toBe(false)
  })
})

describe('RegisterSuccessSchema', () => {
  it('parses a register response WITHOUT accessToken (Noroff returns user only)', () => {
    const result = RegisterSuccessSchema.safeParse({
      data: { name: 'sergiu', email: 'a@stud.noroff.no', venueManager: false },
    })
    expect(result.success).toBe(true)
  })
})

describe('ApiKeySuccessSchema', () => {
  it('parses a valid api-key response', () => {
    const result = ApiKeySuccessSchema.safeParse({
      data: { name: 'Holidaze session', status: 'ACTIVE', key: 'uuid-1234' },
    })
    expect(result.success).toBe(true)
  })
})

describe('CreateBookingInputSchema', () => {
  const valid = {
    dateFrom: '2026-06-01T00:00:00.000Z',
    dateTo: '2026-06-04T00:00:00.000Z',
    guests: 2,
    venueId: 'venue-uuid-1',
  }

  it('parses a valid booking input', () => {
    expect(CreateBookingInputSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects guests < 1', () => {
    const result = CreateBookingInputSchema.safeParse({ ...valid, guests: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer guests', () => {
    const result = CreateBookingInputSchema.safeParse({ ...valid, guests: 2.5 })
    expect(result.success).toBe(false)
  })

  it('rejects malformed dateFrom', () => {
    const result = CreateBookingInputSchema.safeParse({ ...valid, dateFrom: 'not-a-date' })
    expect(result.success).toBe(false)
  })

  it('rejects extra fields in strict mode', () => {
    const result = CreateBookingInputSchema.safeParse({ ...valid, extra: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('UpdateBookingInputSchema', () => {
  it('accepts a partial patch (guests only)', () => {
    expect(UpdateBookingInputSchema.safeParse({ guests: 3 }).success).toBe(true)
  })

  it('accepts an empty patch (all fields optional)', () => {
    expect(UpdateBookingInputSchema.safeParse({}).success).toBe(true)
  })

  it('rejects extra fields in strict mode', () => {
    expect(UpdateBookingInputSchema.safeParse({ guests: 2, extra: 'x' }).success).toBe(false)
  })
})

describe('BookingSuccessSchema', () => {
  it('parses a valid booking response envelope', () => {
    const result = BookingSuccessSchema.safeParse({
      data: {
        id: 'b-1',
        dateFrom: '2026-06-01T00:00:00.000Z',
        dateTo: '2026-06-04T00:00:00.000Z',
        guests: 2,
        created: '2026-05-04T12:00:00.000Z',
        updated: '2026-05-04T12:00:00.000Z',
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('BookingsListSuccessSchema', () => {
  it('parses a list response with meta', () => {
    const result = BookingsListSuccessSchema.safeParse({
      data: [],
      meta: {
        isFirstPage: true,
        isLastPage: true,
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        pageCount: 1,
        totalCount: 0,
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('UpdateProfileInputSchema', () => {
  it('accepts an avatar-only patch', () => {
    const result = UpdateProfileInputSchema.safeParse({
      avatar: { url: 'https://example.com/me.jpg', alt: 'Me' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts a banner-only patch', () => {
    const result = UpdateProfileInputSchema.safeParse({
      banner: { url: 'https://example.com/banner.jpg', alt: 'Banner' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts an empty patch', () => {
    expect(UpdateProfileInputSchema.safeParse({}).success).toBe(true)
  })

  it('rejects unknown fields in strict mode', () => {
    const result = UpdateProfileInputSchema.safeParse({
      avatar: { url: 'https://x', alt: 'x' },
      monoColor: 'ink',
    })
    expect(result.success).toBe(false)
  })

  it('rejects malformed avatar (missing url)', () => {
    const result = UpdateProfileInputSchema.safeParse({
      avatar: { alt: 'Me' },
    })
    expect(result.success).toBe(false)
  })
})

describe('ProfileSuccessSchema', () => {
  it('parses a valid profile envelope', () => {
    const result = ProfileSuccessSchema.safeParse({
      data: {
        name: 'tester',
        email: 'tester@stud.noroff.no',
        bio: null,
        avatar: { url: '', alt: '' },
        banner: { url: '', alt: '' },
        venueManager: false,
        _count: { venues: 0, bookings: 2 },
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('ProfileBookingsListSuccessSchema', () => {
  it('parses an empty bookings list with meta', () => {
    const result = ProfileBookingsListSuccessSchema.safeParse({
      data: [],
      meta: {
        isFirstPage: true,
        isLastPage: true,
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        pageCount: 1,
        totalCount: 0,
      },
    })
    expect(result.success).toBe(true)
  })
})
