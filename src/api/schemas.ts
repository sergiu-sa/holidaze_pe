import { z } from 'zod'

// Noroff error envelope. client.ts safeParses non-OK bodies against this
// before mapping to ApiError.
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

export const MediaSchema = z.object({
  url: z.url(),
  alt: z.string().default(''),
})

// Location fields are .nullable() (not .optional()) — Noroff sends explicit
// null rather than omitting the key.
export const LocationSchema = z.object({
  address: z.string().nullable(),
  city: z.string().nullable(),
  zip: z.string().nullable(),
  country: z.string().nullable(),
  continent: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
})

export const MetaFlagsSchema = z.object({
  wifi: z.boolean(),
  parking: z.boolean(),
  breakfast: z.boolean(),
  pets: z.boolean(),
})

// Embedded owner block returned by venues with ?_owner=true. Also the base for
// ProfileSchema, which adds fields that only appear on full profile reads.
export const OwnerSchema = z.object({
  name: z.string(),
  email: z.email(),
  bio: z.string().nullable(),
  avatar: MediaSchema,
  banner: MediaSchema,
})

// venueManager and _count are only present on authenticated profile reads
// (GET /profiles/:name).
export const ProfileSchema = OwnerSchema.extend({
  venueManager: z.boolean().optional(),
  _count: z
    .object({
      venues: z.number().int(),
      bookings: z.number().int(),
    })
    .optional(),
})

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

// Booking and Venue reference each other; the interfaces forward-declare the
// inferred types so the z.lazy() wrappers below can break the cycle.
export interface Booking {
  id: string
  dateFrom: string
  dateTo: string
  guests: number
  created: string
  updated: string
  customer?: z.infer<typeof OwnerSchema>
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
  bookings?: Booking[]
  _count?: { bookings: number }
}

export const BookingSchema: z.ZodType<Booking> = z.object({
  id: z.string(),
  dateFrom: z.iso.datetime(),
  dateTo: z.iso.datetime(),
  guests: z.number().int().min(1),
  created: z.iso.datetime(),
  updated: z.iso.datetime(),
  // customer is present only with ?_customer=true
  customer: OwnerSchema.optional(),
  // venue is present only with ?_venue=true
  venue: z.lazy(() => VenueSchema).optional(),
})

export const VenueSchema: z.ZodType<Venue> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  media: MediaSchema.array(),
  price: z.number(),
  maxGuests: z.number().int().min(1),
  rating: z.number().min(0).max(5),
  created: z.iso.datetime(),
  updated: z.iso.datetime(),
  meta: MetaFlagsSchema,
  location: LocationSchema,
  // owner is present only with ?_owner=true
  owner: OwnerSchema.optional(),
  // bookings is present only with ?_bookings=true
  bookings: z.lazy(() => BookingSchema).array().optional(),
  // _count is on list responses; absent on some detail responses
  _count: z.object({ bookings: z.number().int() }).optional(),
})

// Outgoing payloads use .strict() so we never send extra fields to Noroff.
export const LoginInputSchema = z
  .object({
    email: z
      .email('Use a valid email')
      .regex(/@stud\.noroff\.no$/i, 'Email must end in stud.noroff.no'),
    password: z.string().min(8, '8 characters or more'),
  })
  .strict()

export const RegisterInputSchema = LoginInputSchema.extend({
  name: z
    .string()
    .min(1, 'Required')
    .max(20, '20 characters max')
    .regex(/^[A-Za-z0-9_]+$/, 'Letters, numbers, underscore only'),
  venueManager: z.boolean(),
}).strict()

// Verified 2026-05-01 against docs.noroff.dev: /auth/register does NOT return
// an accessToken — only the user record. /auth/login DOES return accessToken
// when called with `?_holidaze=true`.
const AuthUserShape = {
  name: z.string(),
  email: z.string(),
  avatar: z.object({ url: z.string(), alt: z.string() }).optional(),
  banner: z.object({ url: z.string(), alt: z.string() }).optional(),
  venueManager: z.boolean(),
}

export const LoginSuccessSchema = z.object({
  data: z.object({ ...AuthUserShape, accessToken: z.string() }),
})

export const RegisterSuccessSchema = z.object({
  data: z.object(AuthUserShape),
})

export const ApiKeySuccessSchema = z.object({
  data: z.object({
    name: z.string(),
    status: z.string(),
    key: z.string(),
  }),
})

export type LoginInput = z.infer<typeof LoginInputSchema>
export type RegisterInput = z.infer<typeof RegisterInputSchema>
export type LoginSuccess = z.infer<typeof LoginSuccessSchema>
export type RegisterSuccess = z.infer<typeof RegisterSuccessSchema>
export type ApiKeySuccess = z.infer<typeof ApiKeySuccessSchema>
