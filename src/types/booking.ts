// Booking is already declared as an explicit type in schemas.ts to break the
// mutual recursion with VenueSchema.  Re-export it from here so consumers
// import from '@/types/booking', not from '@/api/schemas'.
export type { Booking } from '../api/schemas'
