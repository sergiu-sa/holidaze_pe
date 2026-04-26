import { z } from 'zod'

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

// Noroff error envelope: { errors: [{ message, code?, path? }], status?, statusCode? }
// Used in client.ts to safeParse non-OK response bodies before mapping to ApiError.
export const NoroffErrorEnvelopeSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
      path: z.array(z.string()).optional(),
    }),
  ),
  status: z.string().optional(),
  statusCode: z.number().optional(),
})

export type NoroffErrorEnvelope = z.infer<typeof NoroffErrorEnvelopeSchema>

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

// Media objects appear on venues (cover images) and profiles (avatar, banner).
// Noroff always sends both fields; alt defaults to '' when omitted in data.
export const MediaSchema = z.object({
  url: z.url(),
  alt: z.string().default(''),
})

// Location fields are sent as explicit null when not provided — .nullable() not
// .optional() — because the API consistently includes the key with a null value
// rather than omitting it entirely.
export const LocationSchema = z.object({
  address: z.string().nullable(),
  city: z.string().nullable(),
  zip: z.string().nullable(),
  country: z.string().nullable(),
  continent: z.string().nullable(),
  // lat/lng are number | null in the fixture (not string)
  lat: z.number().nullable(),
  lng: z.number().nullable(),
})

export const MetaFlagsSchema = z.object({
  wifi: z.boolean(),
  parking: z.boolean(),
  breakfast: z.boolean(),
  pets: z.boolean(),
})

// ---------------------------------------------------------------------------
// Owner / Profile
// ---------------------------------------------------------------------------

// OwnerSchema covers the embedded `owner` block returned by venues with
// ?_owner=true.  It is also the base for ProfileSchema (which adds venueManager
// and _count fields that only appear on full profile responses).
export const OwnerSchema = z.object({
  name: z.string(),
  // z.email() is the Zod 4 standalone validator (z.string().email() is deprecated)
  email: z.email(),
  bio: z.string().nullable(),
  avatar: MediaSchema,
  banner: MediaSchema,
})

// ProfileSchema extends the owner shape with fields specific to full profile
// responses (GET /profiles/:name).  venueManager is optional because it is only
// present on authenticated profile reads; _count likewise.
export const ProfileSchema = OwnerSchema.extend({
  venueManager: z.boolean().optional(),
  _count: z
    .object({
      venues: z.number().int(),
      bookings: z.number().int(),
    })
    .optional(),
})

// ---------------------------------------------------------------------------
// Pagination meta  (list responses)
// ---------------------------------------------------------------------------

// Returned in the top-level `meta` field of every list endpoint.
// previousPage and nextPage are integers or null (never omitted).
export const PaginationMetaSchema = z.object({
  isFirstPage: z.boolean(),
  isLastPage: z.boolean(),
  currentPage: z.number().int(),
  previousPage: z.number().int().nullable(),
  nextPage: z.number().int().nullable(),
  pageCount: z.number().int(),
  totalCount: z.number().int(),
})

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>

// ---------------------------------------------------------------------------
// Booking + Venue  (mutually recursive — both use z.lazy())
// ---------------------------------------------------------------------------

// Forward-declare the inferred types so the lazy wrappers can be typed without
// creating a real circular import.  TypeScript requires explicit type annotations
// on z.lazy() schemas.  interface is used here per @typescript-eslint/consistent-type-definitions.
export interface Booking {
  id: string
  dateFrom: string
  dateTo: string
  guests: number
  created: string
  updated: string
  customer?: z.infer<typeof OwnerSchema>
  // venue is present only when ?_venue=true is passed; VenueSchema is lazy.
  venue?: Venue
}

export interface Venue {
  id: string
  name: string
  description: string
  media: z.infer<typeof MediaSchema>[]
  price: number
  maxGuests: number
  rating: number
  created: string
  updated: string
  meta: z.infer<typeof MetaFlagsSchema>
  location: z.infer<typeof LocationSchema>
  owner?: z.infer<typeof OwnerSchema>
  // bookings is present only when ?_bookings=true is passed; BookingSchema is lazy.
  bookings?: Booking[]
  _count?: { bookings: number }
}

// BookingSchema must be declared before VenueSchema because VenueSchema
// references it.  BookingSchema in turn references VenueSchema via z.lazy() to
// break the cycle.
// z.iso.datetime() is the Zod 4 preferred form; z.string().datetime() is deprecated.
export const BookingSchema: z.ZodType<Booking> = z.object({
  id: z.string(),
  dateFrom: z.iso.datetime(),
  dateTo: z.iso.datetime(),
  // guests must be a positive integer (≥1 person required for a booking)
  guests: z.number().int().min(1),
  created: z.iso.datetime(),
  updated: z.iso.datetime(),
  // customer is present only with ?_customer=true
  customer: OwnerSchema.optional(),
  // venue is present only with ?_venue=true; z.lazy breaks the mutual reference
  venue: z.lazy(() => VenueSchema).optional(),
})

export const VenueSchema: z.ZodType<Venue> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  media: MediaSchema.array(),
  price: z.number(),
  // maxGuests must be ≥1 — a venue with zero capacity is not bookable
  maxGuests: z.number().int().min(1),
  // rating is 0–5 on the Noroff scale
  rating: z.number().min(0).max(5),
  created: z.iso.datetime(),
  updated: z.iso.datetime(),
  meta: MetaFlagsSchema,
  location: LocationSchema,
  // owner is present only with ?_owner=true
  owner: OwnerSchema.optional(),
  // bookings is present only with ?_bookings=true; z.lazy breaks the mutual reference
  bookings: z.lazy(() => BookingSchema).array().optional(),
  // _count is present on list responses; absent on some detail responses (returns meta: {})
  _count: z.object({ bookings: z.number().int() }).optional(),
})
