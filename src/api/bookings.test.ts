import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '../test/msw/server'
import { ApiError } from '../types/api'
import { createBooking, getBooking } from './bookings'
import { BASE } from './client'
import { clearSession, setSession } from './session'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'sergiu',
  email: 'a@stud.noroff.no',
  venueManager: false,
}

beforeEach(() => {
  clearSession()
  setSession(TEST_SESSION)
})

describe('createBooking', () => {
  it('sends the typed payload and returns the booking', async () => {
    let captured: Record<string, unknown> | null = null
    server.use(
      http.post(`${BASE}/bookings`, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: {
            id: 'b-uuid-1',
            dateFrom: captured.dateFrom,
            dateTo: captured.dateTo,
            guests: captured.guests,
            created: '2026-05-04T12:00:00.000Z',
            updated: '2026-05-04T12:00:00.000Z',
          },
        })
      }),
    )

    const result = await createBooking({
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-04T00:00:00.000Z',
      guests: 2,
      venueId: 'venue-uuid-1',
    })

    expect(captured).toMatchObject({
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-04T00:00:00.000Z',
      guests: 2,
      venueId: 'venue-uuid-1',
    })
    expect(result.id).toBe('b-uuid-1')
    expect(result.guests).toBe(2)
  })

  it('throws ApiError(400) on validation failure', async () => {
    server.use(
      http.post(`${BASE}/bookings`, () =>
        HttpResponse.json(
          { errors: [{ message: 'dateFrom must be in the future' }] },
          { status: 400 },
        ),
      ),
    )

    await expect(
      createBooking({
        dateFrom: '2020-01-01T00:00:00.000Z',
        dateTo: '2020-01-04T00:00:00.000Z',
        guests: 2,
        venueId: 'venue-uuid-1',
      }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('throws ApiError(401) when session is missing', async () => {
    clearSession()
    await expect(
      createBooking({
        dateFrom: '2026-06-01T00:00:00.000Z',
        dateTo: '2026-06-04T00:00:00.000Z',
        guests: 2,
        venueId: 'venue-uuid-1',
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('getBooking', () => {
  it('fetches by id with optional ?_customer=true&_venue=true and returns the booking', async () => {
    let url: URL | null = null
    server.use(
      http.get(`${BASE}/bookings/b-1`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({
          data: {
            id: 'b-1',
            dateFrom: '2026-06-01T00:00:00.000Z',
            dateTo: '2026-06-04T00:00:00.000Z',
            guests: 2,
            created: '2026-05-04T12:00:00.000Z',
            updated: '2026-05-04T12:00:00.000Z',
          },
        })
      }),
    )

    const result = await getBooking('b-1', { customer: true, venue: true })

    expect(url).not.toBeNull()
    expect(url!.searchParams.get('_customer')).toBe('true')
    expect(url!.searchParams.get('_venue')).toBe('true')
    expect(result.id).toBe('b-1')
  })

  it('throws ApiError(404) on missing booking', async () => {
    server.use(
      http.get(`${BASE}/bookings/missing`, () =>
        HttpResponse.json(
          { errors: [{ message: 'Booking not found' }] },
          { status: 404 },
        ),
      ),
    )

    await expect(getBooking('missing')).rejects.toMatchObject({ status: 404 })
  })
})
