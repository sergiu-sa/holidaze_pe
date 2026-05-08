import { apiFetch } from './client'
import {
  type Booking,
  type Profile,
  ProfileBookingsListSuccessSchema,
  ProfileSuccessSchema,
  type UpdateProfileInput,
  UpdateProfileInputSchema,
} from './schemas'

interface ProfileBookingsOptions {
  /** Include the venue object on each booking row. Defaults to `true`. */
  venue?: boolean
}

function bookingsQuery(opts?: ProfileBookingsOptions): string {
  const venue = opts?.venue ?? true
  return venue ? '?_venue=true' : ''
}

export async function getProfile(name: string): Promise<Profile> {
  const res = await apiFetch<unknown>(`/profiles/${encodeURIComponent(name)}`, {
    auth: 'required',
    unwrap: false,
  })
  return ProfileSuccessSchema.parse(res).data
}

export async function getProfileBookings(
  name: string,
  opts?: ProfileBookingsOptions,
): Promise<Booking[]> {
  const res = await apiFetch<unknown>(
    `/profiles/${encodeURIComponent(name)}/bookings${bookingsQuery(opts)}`,
    { auth: 'required', unwrap: false },
  )
  return ProfileBookingsListSuccessSchema.parse(res).data
}

export async function updateProfile(
  name: string,
  patch: UpdateProfileInput,
): Promise<Profile> {
  const body = UpdateProfileInputSchema.parse(patch)
  const res = await apiFetch<unknown>(`/profiles/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body,
    auth: 'required',
    unwrap: false,
  })
  return ProfileSuccessSchema.parse(res).data
}
