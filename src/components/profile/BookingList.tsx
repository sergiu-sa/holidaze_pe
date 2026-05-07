import { Link } from 'react-router-dom'

import { deleteBooking } from '../../api/bookings'
import { type Booking } from '../../api/schemas'
import { useToast } from '../ui/ToastProvider'
import { BookingRow } from './BookingRow'
import { useCancelBookingConfirm } from './CancelBookingConfirm'

interface BookingListProps {
  variant: 'upcoming' | 'past'
  rows: Booking[]
  onChanged: () => void
}

export function BookingList({ variant, rows, onChanged }: BookingListProps) {
  const confirmCancel = useCancelBookingConfirm()
  const toast = useToast()

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">
          {variant === 'past' ? 'Nothing past yet.' : 'Your atlas is blank.'}
        </p>
        <p>
          {variant === 'past'
            ? "You haven't completed a trip yet."
            : "You haven't booked anything yet."}
        </p>
        <Link to="/venues" className="empty-state__cta">
          Find a place →
        </Link>
      </div>
    )
  }

  async function onCancel(id: string) {
    const ok = await confirmCancel()
    if (!ok) return
    try {
      await deleteBooking(id)
      toast('Booking cancelled.', { kind: 'success' })
      onChanged()
    } catch {
      toast("We couldn't cancel that booking. Try again.", { kind: 'error' })
    }
  }

  return (
    <div className="rec-list" role="list">
      {rows.map((booking) => (
        <div key={booking.id} role="listitem">
          <BookingRow
            booking={booking}
            variant={variant}
            onCancel={(id) => {
              void onCancel(id)
            }}
          />
        </div>
      ))}
    </div>
  )
}
