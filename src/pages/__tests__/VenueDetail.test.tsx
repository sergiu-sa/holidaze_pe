import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { BASE } from '../../api/client'
import { ToastProvider } from '../../components/ui/ToastProvider'
import { AuthProvider } from '../../hooks/useAuth'
import { server } from '../../test/msw/server'
import type { Venue } from '../../types/venue'
import VenueDetail from '../VenueDetail'

const SAMPLE: Venue = {
  id: 'venue-1',
  name: 'Casa del Viento',
  description:
    'A whitewashed cliffside house above the Mediterranean. The roof terrace catches the afternoon wind and the kitchen fills with light at sunset.',
  media: [
    { url: 'https://images.unsplash.com/photo-1564501049412?w=1400', alt: 'Cliffside view' },
    { url: 'https://images.unsplash.com/photo-1502602898657?w=1400', alt: 'Terrace at sunset' },
  ],
  price: 280,
  maxGuests: 4,
  rating: 4.8,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
  meta: { wifi: true, parking: true, breakfast: false, pets: true },
  location: {
    address: 'Carrer del Mar 12',
    city: 'Begur',
    zip: '17255',
    country: 'Spain',
    continent: 'Europe',
    lat: 41.95,
    lng: 3.21,
  },
  bookings: [
    {
      id: 'b1',
      // Future booking so the calendar can render past + future cleanly.
      dateFrom: '2099-06-15T00:00:00.000Z',
      dateTo: '2099-06-18T00:00:00.000Z',
      guests: 2,
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-01T00:00:00.000Z',
    },
  ],
  owner: {
    name: 'Lina',
    email: 'lina@stud.noroff.no',
    bio: null,
    avatar: { url: 'https://images.unsplash.com/photo-2?w=400', alt: '' },
    banner: { url: 'https://images.unsplash.com/photo-3?w=1400', alt: '' },
  },
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/venues/:id" element={<VenueDetail />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('VenueDetail page', () => {
  it('renders the loading skeleton while fetching, then the hydrated spread', async () => {
    server.use(
      http.get(`${BASE}/venues/venue-1`, () =>
        HttpResponse.json({ data: SAMPLE, meta: {} }),
      ),
    )

    renderAt('/venues/venue-1')
    expect(screen.getByRole('main', { name: /loading venue/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /casa del viento/i }),
      ).toBeInTheDocument()
    })

    // Title plate + booking panel both render the price.
    expect(screen.getAllByText(/€280/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/4\.8/).length).toBeGreaterThan(0)

    // Calendar present
    expect(
      screen.getByRole('heading', { level: 2, name: /pick your nights/i }),
    ).toBeInTheDocument()

    // Booking panel CTA is the entry into the 4-state booking machine.
    const cta = screen.getByRole('button', { name: /book now/i })
    expect(cta).toBeEnabled()

    // Host strip — owner present
    expect(screen.getByText(/hosted by/i)).toBeInTheDocument()
  })

  it('shows an in-page 404 panel when the venue is missing', async () => {
    server.use(
      http.get(`${BASE}/venues/missing`, () =>
        HttpResponse.json({ errors: [{ message: 'Not Found' }] }, { status: 404 }),
      ),
    )

    renderAt('/venues/missing')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/off the atlas/i)
    expect(screen.getByRole('link', { name: /browse all venues/i })).toBeInTheDocument()
  })

  it('shows a generic error panel with a retry button on a 500', async () => {
    server.use(
      http.get(`${BASE}/venues/server-down`, () =>
        HttpResponse.json({ errors: [{ message: 'oops' }] }, { status: 500 }),
      ),
    )

    renderAt('/venues/server-down')

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument()
  })

  it('selecting two days in the calendar updates the booking total', async () => {
    server.use(
      http.get(`${BASE}/venues/venue-1`, () =>
        HttpResponse.json({ data: SAMPLE, meta: {} }),
      ),
    )

    renderAt('/venues/venue-1')
    await screen.findByRole('heading', { level: 1, name: /casa del viento/i })

    // Find the calendar section by its labelled-by heading, then collect day cells.
    const calendarSection = screen.getByRole('region', { name: /pick your nights/i })
    const dayButtons = within(calendarSection)
      .getAllByRole('button')
      .filter(
        (btn) =>
          btn.getAttribute('aria-disabled') !== 'true' &&
          btn.getAttribute('data-date'),
      )
    expect(dayButtons.length).toBeGreaterThan(5)

    const user = userEvent.setup()
    await user.click(dayButtons[1])
    await user.click(dayButtons[5])

    // 4 nights between index 1 and index 5 of the consecutive available days.
    await waitFor(() => {
      expect(screen.getByText(/4\s*nights/i)).toBeInTheDocument()
    })
  })

  it('arrow-key navigation keeps exactly one day cell tabbable', async () => {
    server.use(
      http.get(`${BASE}/venues/venue-1`, () =>
        HttpResponse.json({ data: SAMPLE, meta: {} }),
      ),
    )

    renderAt('/venues/venue-1')
    await screen.findByRole('heading', { level: 1, name: /casa del viento/i })

    const calendarSection = screen.getByRole('region', { name: /pick your nights/i })
    const focusedCell = within(calendarSection)
      .getAllByRole('button')
      .find(
        (btn) =>
          btn.getAttribute('tabindex') === '0' && btn.getAttribute('data-date'),
      )
    expect(focusedCell).toBeDefined()

    focusedCell!.focus()
    const user = userEvent.setup()
    await user.keyboard('{ArrowRight}')

    // Roving tabindex invariant: still exactly one tabbable day cell.
    await waitFor(() => {
      const tabbable = within(calendarSection)
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.getAttribute('tabindex') === '0' && btn.getAttribute('data-date'),
        )
      expect(tabbable).toHaveLength(1)
    })
  })
})
