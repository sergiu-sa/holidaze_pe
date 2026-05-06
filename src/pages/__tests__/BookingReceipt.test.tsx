import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BASE } from '../../api/client'
import { clearSession, setSession } from '../../api/session'
import { ToastProvider } from '../../components/ui/ToastProvider'
import { AuthProvider } from '../../hooks/useAuth'
import { getBookingHappy } from '../../test/msw/booking-handlers'
import { server } from '../../test/msw/server'
import BookingReceipt from '../BookingReceipt'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'sergiu',
  email: 'sergiu@stud.noroff.no',
  venueManager: false,
}

function renderPage(path = '/bookings/b-1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/bookings/:id" element={<BookingReceipt />} />
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
afterEach(() => { clearSession(); })

describe('BookingReceipt page', () => {
  it('renders the receipt for the owner', async () => {
    server.use(getBookingHappy)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Bergen Studio')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument()
  })

  it('renders NotFoundCard when the user is not the owner', async () => {
    server.use(
      http.get(`${BASE}/bookings/:id`, () =>
        HttpResponse.json({
          data: {
            id: 'b-1',
            dateFrom: '2026-06-01T00:00:00.000Z',
            dateTo: '2026-06-04T00:00:00.000Z',
            guests: 2,
            created: '2026-05-04T12:00:00.000Z',
            updated: '2026-05-04T12:00:00.000Z',
            customer: {
              name: 'someone-else',
              email: 'other@stud.noroff.no',
              bio: null,
              avatar: { url: 'https://example.com/a.jpg', alt: '' },
              banner: { url: 'https://example.com/b.jpg', alt: '' },
            },
            venue: {
              id: 'v-1', name: 'Bergen Studio', description: 'x',
              media: [{ url: 'https://example.com/x.jpg', alt: '' }],
              price: 180, maxGuests: 4, rating: 4.5,
              created: '2026-01-01T00:00:00.000Z', updated: '2026-01-01T00:00:00.000Z',
              meta: { wifi: true, parking: false, breakfast: true, pets: false },
              location: {
                address: 'x', city: 'Bergen', zip: '5003',
                country: 'Norway', continent: 'Europe', lat: 60.39, lng: 5.32,
              },
            },
          },
        }),
      ),
    )
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/off the atlas/i)).toBeInTheDocument()
    })
  })
})
