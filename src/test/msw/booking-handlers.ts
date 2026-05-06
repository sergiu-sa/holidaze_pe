import { http, HttpResponse } from 'msw'

import { BASE } from '../../api/client'

interface CreateBody {
  dateFrom: string
  dateTo: string
  guests: number
  venueId: string
}

const sampleVenue = {
  id: 'v-1',
  name: 'Bergen Studio',
  description: 'A quiet flat in Bergen.',
  media: [{ url: 'https://example.com/x.jpg', alt: 'Living room' }],
  price: 180,
  maxGuests: 4,
  rating: 4.5,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
  meta: { wifi: true, parking: false, breakfast: true, pets: false },
  location: {
    address: 'Bryggen 1',
    city: 'Bergen',
    zip: '5003',
    country: 'Norway',
    continent: 'Europe',
    lat: 60.39,
    lng: 5.32,
  },
}

const sampleCustomer = {
  name: 'sergiu',
  email: 'sergiu@stud.noroff.no',
  bio: null,
  avatar: { url: 'https://example.com/a.jpg', alt: '' },
  banner: { url: 'https://example.com/b.jpg', alt: '' },
}

// ─── happy-path handlers ────────────────────────────────────────────────────

export const createBookingHappy = http.post(`${BASE}/bookings`, async ({ request }) => {
  const body = (await request.json()) as CreateBody
  return HttpResponse.json({
    data: {
      id: 'b-test-uuid',
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      guests: body.guests,
      created: '2026-05-04T12:00:00.000Z',
      updated: '2026-05-04T12:00:00.000Z',
    },
  })
})

export const getBookingHappy = http.get(`${BASE}/bookings/:id`, ({ params }) =>
  HttpResponse.json({
    data: {
      id: params.id,
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-04T00:00:00.000Z',
      guests: 2,
      created: '2026-05-04T12:00:00.000Z',
      updated: '2026-05-04T12:00:00.000Z',
      customer: sampleCustomer,
      venue: sampleVenue,
    },
  }),
)

export const listBookingsHappy = http.get(`${BASE}/bookings`, () =>
  HttpResponse.json({
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
  }),
)

export const updateBookingHappy = http.put(`${BASE}/bookings/:id`, ({ params }) =>
  HttpResponse.json({
    data: {
      id: params.id,
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-04T00:00:00.000Z',
      guests: 3,
      created: '2026-05-04T12:00:00.000Z',
      updated: '2026-05-04T13:00:00.000Z',
    },
  }),
)

export const deleteBookingHappy = http.delete(
  `${BASE}/bookings/:id`,
  () => new HttpResponse(null, { status: 204 }),
)

export const bookingHappy = [
  createBookingHappy,
  getBookingHappy,
  listBookingsHappy,
  updateBookingHappy,
  deleteBookingHappy,
]

// ─── unhappy-path handlers (per-test override via server.use(...)) ──────────

export const createBookingValidationError = http.post(`${BASE}/bookings`, () =>
  HttpResponse.json(
    { errors: [{ message: 'dateFrom must be in the future' }] },
    { status: 400 },
  ),
)

export const createBookingConflict = http.post(`${BASE}/bookings`, () =>
  HttpResponse.json(
    { errors: [{ message: 'Those dates are no longer available' }] },
    { status: 409 },
  ),
)

export const createBookingUnauthorized = http.post(`${BASE}/bookings`, () =>
  HttpResponse.json(
    { errors: [{ message: 'Invalid token' }] },
    { status: 401 },
  ),
)

export const getBookingNotFound = http.get(`${BASE}/bookings/:id`, () =>
  HttpResponse.json(
    { errors: [{ message: 'Booking not found' }] },
    { status: 404 },
  ),
)
