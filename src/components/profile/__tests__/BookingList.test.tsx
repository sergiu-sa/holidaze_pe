import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { BookingList } from '../BookingList'

vi.mock('../../../api/bookings', () => ({
  deleteBooking: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../CancelBookingConfirm', () => ({
  useCancelBookingConfirm: () => () => Promise.resolve(true),
}))

vi.mock('../../ui/ToastProvider', () => ({
  useToast: () => vi.fn(),
}))

const upcoming = [
  {
    id: 'b-1',
    dateFrom: '2030-06-01T00:00:00.000Z',
    dateTo: '2030-06-04T00:00:00.000Z',
    guests: 2,
    created: '2026-05-04T00:00:00.000Z',
    updated: '2026-05-04T00:00:00.000Z',
    venue: {
      id: 'v-1',
      name: 'Cabin A',
      description: '',
      media: [{ url: '', alt: '' }],
      price: 100,
      maxGuests: 4,
      rating: 0,
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-01T00:00:00.000Z',
      meta: { wifi: false, parking: false, breakfast: false, pets: false },
      location: {
        address: null,
        city: null,
        zip: null,
        country: null,
        continent: null,
        lat: 0,
        lng: 0,
      },
    },
  },
]

describe('BookingList', () => {
  it('confirms cancel, calls deleteBooking, and notifies the parent', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    const { deleteBooking } = await import('../../../api/bookings')
    render(
      <MemoryRouter>
        <BookingList variant="upcoming" rows={upcoming} onChanged={onChanged} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /cancel booking/i }))
    await waitFor(() => {
      expect(deleteBooking).toHaveBeenCalledWith('b-1')
    })
    expect(onChanged).toHaveBeenCalled()
  })
})
