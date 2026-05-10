import { Link } from 'react-router-dom'

import { formatLocation } from '../../lib/venue-format'
import type { Venue } from '../../types/venue'
import { Icon } from '../ui'

interface VenueRowProps {
  venue: Venue
  onDelete: (venue: Venue) => void
  pendingDelete?: boolean
}

function bookingCount(venue: Venue): number {
  if (typeof venue._count?.bookings === 'number') return venue._count.bookings
  return venue.bookings?.length ?? 0
}

export function VenueRow({ venue, onDelete, pendingDelete = false }: VenueRowProps) {
  const cover = venue.media.length > 0 ? venue.media[0] : null
  const count = bookingCount(venue)
  const location = formatLocation(venue)

  return (
    <article className="rec" aria-labelledby={`rec-${venue.id}-name`}>
      {cover?.url ? (
        <img className="rec__img" src={cover.url} alt={cover.alt || ''} loading="lazy" />
      ) : (
        <div className="rec__img rec__img--placeholder" aria-hidden="true" />
      )}

      <div className="rec__body">
        <Link
          to={`/venues/${encodeURIComponent(venue.id)}`}
          id={`rec-${venue.id}-name`}
          className="rec__name"
        >
          {venue.name}
        </Link>
        <p className="rec__meta mono">
          {location === '—' ? 'Location unset' : location} ·{' '}
          <em>€{String(venue.price)}</em>/night · sleeps {String(venue.maxGuests)}
        </p>
      </div>

      <div className="rec__actions">
        <Link
          to={`/profile/venues/${encodeURIComponent(venue.id)}/bookings`}
          className="rec__btn"
          aria-label={`View bookings for ${venue.name}`}
        >
          <Icon name="ticket" size="sm" />
          Bookings
          <span className="mono" aria-hidden="true">
            {' '}
            ({String(count)})
          </span>
        </Link>
        <Link
          to={`/profile/venues/${encodeURIComponent(venue.id)}/edit`}
          className="rec__btn"
          aria-label={`Edit ${venue.name}`}
        >
          <Icon name="edit" size="sm" />
          Edit
        </Link>
        <button
          type="button"
          className="rec__btn rec__btn--danger"
          onClick={() => {
            onDelete(venue)
          }}
          disabled={pendingDelete}
          aria-label={`Delete ${venue.name}`}
        >
          {pendingDelete ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  )
}
