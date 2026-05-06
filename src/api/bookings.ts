import { apiFetch } from './client'
import {
  type Booking,
  BookingsListSuccessSchema,
  BookingSuccessSchema,
  type CreateBookingInput,
  CreateBookingInputSchema,
  type UpdateBookingInput,
  UpdateBookingInputSchema,
} from './schemas'

interface QueryFlags {
  customer?: boolean
  venue?: boolean
}

function flagsToQuery(opts?: QueryFlags): string {
  if (!opts) return ''
  const q = new URLSearchParams()
  if (opts.customer) q.set('_customer', 'true')
  if (opts.venue) q.set('_venue', 'true')
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function listBookings(opts?: QueryFlags): Promise<Booking[]> {
  const res = await apiFetch<unknown>(`/bookings${flagsToQuery(opts)}`, {
    auth: 'required',
    unwrap: false,
  })
  return BookingsListSuccessSchema.parse(res).data
}

export async function getBooking(id: string, opts?: QueryFlags): Promise<Booking> {
  const res = await apiFetch<unknown>(`/bookings/${id}${flagsToQuery(opts)}`, {
    auth: 'required',
    unwrap: false,
  })
  return BookingSuccessSchema.parse(res).data
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const body = CreateBookingInputSchema.parse(input)
  const res = await apiFetch<unknown>('/bookings', {
    method: 'POST',
    body,
    auth: 'required',
    unwrap: false,
  })
  return BookingSuccessSchema.parse(res).data
}

export async function updateBooking(id: string, patch: UpdateBookingInput): Promise<Booking> {
  const body = UpdateBookingInputSchema.parse(patch)
  const res = await apiFetch<unknown>(`/bookings/${id}`, {
    method: 'PUT',
    body,
    auth: 'required',
    unwrap: false,
  })
  return BookingSuccessSchema.parse(res).data
}

export async function deleteBooking(id: string): Promise<void> {
  // Noroff returns 204 No Content; nothing to parse.
  await apiFetch<unknown>(`/bookings/${id}`, {
    method: 'DELETE',
    auth: 'required',
    unwrap: false,
  })
}
