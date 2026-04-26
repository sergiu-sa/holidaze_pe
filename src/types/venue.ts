import type { z } from 'zod'

import type { LocationSchema, MediaSchema, MetaFlagsSchema, OwnerSchema } from '../api/schemas'

// Resource types are derived from Zod schemas — the schema is the single source
// of truth for both runtime parsing and compile-time types.
export type Media = z.infer<typeof MediaSchema>
export type Location = z.infer<typeof LocationSchema>
export type VenueMeta = z.infer<typeof MetaFlagsSchema>
export type Owner = z.infer<typeof OwnerSchema>
// Venue is already declared as an explicit type in schemas.ts to break the
// mutual recursion with BookingSchema.  Re-export it from here so consumers
// import from '@/types/venue', not from '@/api/schemas'.
export type { Venue } from '../api/schemas'
