import { Link } from 'react-router-dom'

import { type Booking } from '../../api/schemas'
import { formatLongDate } from '../../lib/dates'
import { formatPrice } from '../../lib/venue-format'
import { type Venue } from '../../types/venue'
import { Icon } from '../ui/Icon'

interface ReceiptProps {
  booking: Booking & { venue: Venue }
}

function nightsBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso).getTime()
  const b = new Date(toIso).getTime()
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

/** Print-ready typographic receipt. Presentational only. */
export function Receipt({ booking }: ReceiptProps) {
  const { venue } = booking
  const nights = nightsBetween(booking.dateFrom, booking.dateTo)
  const total = nights * venue.price
  const cover = venue.media.length > 0 ? venue.media[0] : null

  return (
    <article className="receipt__doc" aria-labelledby="r-venue">
      <span className="regmark regmark--tl" aria-hidden="true" />
      <span className="regmark regmark--tr" aria-hidden="true" />
      <span className="regmark regmark--bl" aria-hidden="true" />
      <span className="regmark regmark--br" aria-hidden="true" />

      <header className="receipt__doc-head">
        <p className="mono receipt__doc-code">
          Booking · <span>{booking.id.toUpperCase()}</span>
        </p>
        <p className="mono receipt__doc-when">
          Issued <span>{formatLongDate(booking.created)}</span>
        </p>
      </header>

      {cover ? (
        <figure className="receipt__plate">
          <img src={cover.url} alt={cover.alt || venue.name} referrerPolicy="no-referrer" loading="lazy" />
          <figcaption className="mono">Receipt · {venue.name}</figcaption>
        </figure>
      ) : null}

      <h2 className="receipt__venue" id="r-venue">{venue.name}</h2>

      <dl className="receipt__dl">
        <div>
          <dt><Icon name="arrow-right" size="xs" />Arrival</dt>
          <dd>{formatLongDate(booking.dateFrom)}</dd>
        </div>
        <div>
          <dt><Icon name="arrow-left" size="xs" />Departure</dt>
          <dd>{formatLongDate(booking.dateTo)}</dd>
        </div>
        <div>
          <dt><Icon name="clock" size="xs" />Nights</dt>
          <dd>{nights} {nights === 1 ? 'night' : 'nights'}</dd>
        </div>
        <div>
          <dt><Icon name="guests" size="xs" />Guests</dt>
          <dd>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</dd>
        </div>
        <div>
          <dt><Icon name="euro" size="xs" />Rate</dt>
          <dd>{formatPrice(venue.price)} / night</dd>
        </div>
        <div>
          <dt><Icon name="ticket" size="xs" />Total</dt>
          <dd className="receipt__total">{formatPrice(total)}</dd>
        </div>
      </dl>

      <p className="receipt__note">
        Direct with the host. No commission, no padding, no hidden fees.
        The full amount above is what you pay, and what the host receives.
      </p>

      <div className="receipt__cta-row">
        <Link to="/profile/bookings" className="receipt__cta-primary">
          <Icon name="calendar" size="sm" />
          <span>See all bookings</span>
          <Icon name="arrow-right" size="sm" />
        </Link>
        <Link to="/venues" className="receipt__cta-secondary">
          <Icon name="compass" size="sm" />
          <span>Keep browsing</span>
        </Link>
        <button
          type="button"
          className="receipt__cta-secondary"
          onClick={() => { window.print() }}
        >
          <Icon name="printer" size="sm" />
          <span>Print</span>
        </button>
      </div>
    </article>
  )
}
