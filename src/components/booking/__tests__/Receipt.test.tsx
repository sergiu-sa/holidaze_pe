import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { type Booking } from '../../../api/schemas'
import { type Venue } from '../../../types/venue'
import { Receipt } from '../Receipt'

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
    address: 'Bryggen 1', city: 'Bergen', zip: '5003',
    country: 'Norway', continent: 'Europe', lat: 60.39, lng: 5.32,
  },
}

const sampleBooking: Booking & { venue: Venue } = {
  id: 'b-uuid-9999',
  dateFrom: '2026-06-01T00:00:00.000Z',
  dateTo: '2026-06-04T00:00:00.000Z',
  guests: 2,
  created: '2026-05-04T12:00:00.000Z',
  updated: '2026-05-04T12:00:00.000Z',
  venue: sampleVenue,
}

function renderReceipt() {
  return render(
    <MemoryRouter>
      <Receipt booking={sampleBooking} />
    </MemoryRouter>,
  )
}

describe('Receipt', () => {
  it('renders the booking fields (venue, dates, nights, guests, rate, total)', () => {
    renderReceipt()
    expect(screen.getByText('Bergen Studio')).toBeInTheDocument()
    expect(screen.getByText(/3 nights?/i)).toBeInTheDocument()
    expect(screen.getByText(/2 guests?/i)).toBeInTheDocument()
    expect(screen.getByText(/€180/)).toBeInTheDocument()
    expect(screen.getByText(/€540/)).toBeInTheDocument()       // 3 × 180
  })

  it('Print button calls window.print', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    renderReceipt()

    await userEvent.click(screen.getByRole('button', { name: /print/i }))
    expect(printSpy).toHaveBeenCalledTimes(1)

    printSpy.mockRestore()
  })
})
