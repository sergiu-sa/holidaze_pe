import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ProfileHeader } from '../components/profile'
import { useOwnerGate } from '../hooks/useOwnerGate'
import { useVenue } from '../hooks/useVenue'
import { formatLongDate, nightsBetween, parseToLocalDay } from '../lib/dates'
import type { Booking } from '../types/booking'

interface SortedBooking {
  booking: Booking
  upcoming: boolean
}

function sortBookings(bookings: Booking[] | undefined): SortedBooking[] {
  if (!bookings) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return [...bookings]
    .sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime())
    .map((booking) => ({
      booking,
      upcoming: parseToLocalDay(booking.dateTo).getTime() >= today.getTime(),
    }))
}

export default function ProfileVenuesBookings() {
  const { id } = useParams<{ id: string }>()
  const { data: venue, isLoading, error } = useVenue(id)

  useOwnerGate(venue, { message: 'You can only view bookings on venues you own.' })

  const rows = useMemo(() => sortBookings(venue?.bookings), [venue?.bookings])
  const total = rows.length

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/profile/venues">My venues</Link>
          </li>
          <li>
            <span aria-current="page">Bookings</span>
          </li>
        </ol>
      </nav>

      <ProfileHeader
        title={
          venue ? (
            <>
              Bookings · <em>{venue.name}</em>
            </>
          ) : (
            <>Bookings.</>
          )
        }
        sub={
          venue
            ? `${venue.location.city ?? 'Location unset'} · €${String(venue.price)}/night`
            : undefined
        }
      />

      <div className="manager-toolbar manager-toolbar--start">
        <Link to="/profile/venues" className="rec__btn">
          ← Back to my venues
        </Link>
      </div>

      {isLoading && <p className="mono">Loading…</p>}

      {!isLoading && error && (
        <div className="empty-state">
          <p className="empty-state__title">We couldn&apos;t load this venue.</p>
          <Link to="/profile/venues" className="empty-state__cta">
            Back to my venues →
          </Link>
        </div>
      )}

      {!isLoading && !error && venue && total === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">No bookings yet.</p>
          <p>When someone books, it appears here.</p>
        </div>
      )}

      {!isLoading && !error && venue && total > 0 && (
        <div className="rec-list" role="list">
          {rows.map(({ booking, upcoming }) => {
            const nights = nightsBetween(
              parseToLocalDay(booking.dateFrom),
              parseToLocalDay(booking.dateTo),
            )
            const subtotal = nights * venue.price
            return (
              <article
                key={booking.id}
                role="listitem"
                className="rec"
                aria-label={`Booking from ${formatLongDate(booking.dateFrom)} to ${formatLongDate(booking.dateTo)}`}
              >
                <div className="rec__img rec__img--placeholder" aria-hidden="true" />
                <div className="rec__body">
                  <p className="rec__name">
                    {formatLongDate(booking.dateFrom)} → {formatLongDate(booking.dateTo)}
                  </p>
                  <p className="rec__meta mono">
                    {String(nights)} night{nights === 1 ? '' : 's'} ·{' '}
                    {String(booking.guests)} guest{booking.guests === 1 ? '' : 's'} ·{' '}
                    <em>€{String(subtotal)}</em>
                    {!upcoming && ' · past'}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
