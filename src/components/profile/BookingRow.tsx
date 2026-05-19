import { Link } from 'react-router-dom'

import { type Booking } from '../../api/schemas'

interface BookingRowProps {
  booking: Booking
  variant: 'upcoming' | 'past'
  onCancel?: (id: string) => void
}

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function nights(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function BookingRow({ booking, variant, onCancel }: BookingRowProps) {
  const venue = booking.venue
  const venueName = venue?.name ?? 'Unknown venue'
  const venueId = venue?.id ?? null
  const thumb = venue?.media[0]?.url ?? ''
  const total = (venue?.price ?? 0) * nights(booking.dateFrom, booking.dateTo)
  const cancelLabel = `Cancel booking at ${venueName}, ${fmt(booking.dateFrom)} to ${fmt(booking.dateTo)}`

  return (
    <article className="rec" data-id={booking.id} aria-label={venueName}>
      {thumb ? (
        <img
          className="rec__img"
          src={thumb}
          alt=""
          role="presentation"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="rec__img rec__img--placeholder" aria-hidden="true" />
      )}
      <div className="rec__body">
        {venueId ? (
          <Link className="rec__name" to={`/venues/${venueId}`}>
            {venueName}
          </Link>
        ) : (
          <span className="rec__name">{venueName}</span>
        )}
        <p className="rec__meta">
          {fmt(booking.dateFrom)} → {fmt(booking.dateTo)} · {booking.guests} guests ·{' '}
          <em>€{total}</em>
        </p>
      </div>
      <div className="rec__actions">
        {variant === 'upcoming' ? (
          <button
            type="button"
            className="rec__btn rec__btn--danger"
            aria-label={cancelLabel}
            onClick={() => {
              onCancel?.(booking.id)
            }}
          >
            Cancel booking
          </button>
        ) : (
          <Link className="rec__btn" to={`/bookings/${booking.id}`}>
            Receipt
          </Link>
        )}
      </div>
    </article>
  )
}
