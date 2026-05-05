import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearSession, setSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { useDateRange } from '../../../hooks/useDateRange'
import {
  createBookingConflict,
  createBookingHappy,
  createBookingUnauthorized,
} from '../../../test/msw/booking-handlers'
import { server } from '../../../test/msw/server'
import { type Venue } from '../../../types/venue'
import { ToastProvider } from '../../ui/ToastProvider'
import { BookingPanel } from '../BookingPanel'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'sergiu',
  email: 'a@stud.noroff.no',
  venueManager: false,
}

const sampleVenue: Venue = {
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
  bookings: [],
}

function Harness({
  signedIn = true,
  onRequestAuth,
}: {
  signedIn?: boolean
  onRequestAuth?: (a: { from: string; to: string; guests: number }) => void
}) {
  const range = useDateRange({
    bookedSet: new Set(),
  })

  return (
    <BookingPanel
      venue={sampleVenue}
      range={range}
      isAuthenticated={signedIn}
      onRequestAuth={onRequestAuth}
    />
  )
}

function renderHarness(opts?: {
  signedIn?: boolean
  onRequestAuth?: (a: { from: string; to: string; guests: number }) => void
}) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Harness {...opts} />} />
            <Route path="/bookings/:id" element={<p>receipt page</p>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  clearSession()
  setSession(TEST_SESSION)
})
afterEach(() => {
  clearSession()
  sessionStorage.clear()
})

async function pickADateRange() {
  const futureFrom = new Date()
  futureFrom.setDate(futureFrom.getDate() + 7)
  const futureTo = new Date()
  futureTo.setDate(futureTo.getDate() + 10)
  const isoDay = (d: Date) => d.toISOString().slice(0, 10)

  const fromInput = screen.getByLabelText(/arrive/i)
  const toInput = screen.getByLabelText(/depart/i)
  await userEvent.clear(fromInput)
  await userEvent.type(fromInput, isoDay(futureFrom))
  await userEvent.clear(toInput)
  await userEvent.type(toInput, isoDay(futureTo))
}

describe('BookingPanel — 4-state machine', () => {
  it('cycles pick → review → confirm → success → redirects to /bookings/:id', async () => {
    server.use(createBookingHappy)
    renderHarness({ signedIn: true })

    await pickADateRange()
    await userEvent.click(screen.getByRole('button', { name: /book now/i }))

    expect(
      await screen.findByRole('button', { name: /confirm booking/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /confirm booking/i }))
    expect(await screen.findByText(/receipt page/i)).toBeInTheDocument()
  })

  it('fires onRequestAuth on Book click while anonymous; does NOT advance to review', async () => {
    const spy = vi.fn()
    renderHarness({ signedIn: false, onRequestAuth: spy })

    await pickADateRange()
    await userEvent.click(screen.getByRole('button', { name: /book now/i }))

    expect(spy).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: /confirm booking/i }),
    ).not.toBeInTheDocument()
  })

  it('pre-fills + advances to Review when sessionStorage has a valid stash', async () => {
    const futureFrom = new Date()
    futureFrom.setDate(futureFrom.getDate() + 7)
    const futureTo = new Date()
    futureTo.setDate(futureTo.getDate() + 10)
    sessionStorage.setItem(
      'holidaze:pending:venue/v-1',
      JSON.stringify({
        from: futureFrom.toISOString(),
        to: futureTo.toISOString(),
        guests: 2,
      }),
    )

    renderHarness({ signedIn: true })

    expect(
      await screen.findByRole('button', { name: /confirm booking/i }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('holidaze:pending:venue/v-1')).toBeNull()
  })

  it('returns to pick with dates preserved + form-level banner on 401', async () => {
    server.use(createBookingUnauthorized)
    renderHarness({ signedIn: true })

    await pickADateRange()
    await userEvent.click(screen.getByRole('button', { name: /book now/i }))
    await userEvent.click(
      await screen.findByRole('button', { name: /confirm booking/i }),
    )

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
  })
})

describe('BookingPanel — 409 force refetch', () => {
  it('calls onConflictRefetch when the server returns 409', async () => {
    server.use(createBookingConflict)
    const refetchSpy = vi.fn()

    function HarnessWithRefetch() {
      const range = useDateRange({ bookedSet: new Set() })
      return (
        <BookingPanel
          venue={sampleVenue}
          range={range}
          isAuthenticated
          onConflictRefetch={refetchSpy}
        />
      )
    }
    render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <HarnessWithRefetch />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>,
    )

    // Pick a range, advance to review, click confirm
    const futureFrom = new Date()
    futureFrom.setDate(futureFrom.getDate() + 7)
    const futureTo = new Date()
    futureTo.setDate(futureTo.getDate() + 10)
    const isoDay = (d: Date) => d.toISOString().slice(0, 10)
    await userEvent.clear(screen.getByLabelText(/arrive/i))
    await userEvent.type(screen.getByLabelText(/arrive/i), isoDay(futureFrom))
    await userEvent.clear(screen.getByLabelText(/depart/i))
    await userEvent.type(screen.getByLabelText(/depart/i), isoDay(futureTo))
    await userEvent.click(screen.getByRole('button', { name: /book now/i }))
    await userEvent.click(await screen.findByRole('button', { name: /confirm booking/i }))

    // 409 → revert to pick + onConflictRefetch fired
    expect(await screen.findByRole('alert')).toHaveTextContent(/booked by someone else/i)
    expect(refetchSpy).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
  })
})
