import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import {
  amenitiesOf,
  formatCoord,
  formatPrice,
} from '../../lib/venue-format'
import type { Venue } from '../../types/venue'

// Quick-look dialog opened from a venue card click. The "Book now" CTA links
// to the full venue page.

interface VenuePeekModalProps {
  /** Non-null = open. */
  venue: Venue | null
  /** Sequence shown in the eyebrow ("Venue · N°04"). 0-based. */
  index?: number
  onClose: () => void
}

export function VenuePeekModal({ venue, index, onClose }: VenuePeekModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (venue && !dialog.open) {
      dialog.showModal()
    } else if (!venue && dialog.open) {
      dialog.close()
    }
  }, [venue])

  // Native <dialog> fires 'close' on Esc + .close(). Forward to the parent.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
    }
  }, [onClose])

  return (
    // <dialog> is a native interactive widget; the jsx-a11y rules below
    // don't apply (keyboard + focus are handled by the platform).
    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
    <dialog
      ref={dialogRef}
      className="venue-modal"
      aria-labelledby="venue-modal-name"
      onClick={(event) => {
        // A click on the dialog itself (the backdrop) closes the modal.
        if (event.target === dialogRef.current) {
          dialogRef.current.close()
        }
      }}
    >
      {venue ? <PeekFrame venue={venue} index={index} onClose={onClose} /> : null}
    </dialog>
    /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
  )
}

interface PeekFrameProps {
  venue: Venue
  index: number | undefined
  onClose: () => void
}

function PeekFrame({ venue, index, onClose }: PeekFrameProps) {
  const cover = venue.media.length > 0 ? venue.media[0] : null
  const city = venue.location.city?.trim() ?? ''
  const country = venue.location.country?.trim() ?? ''
  const continent = venue.location.continent?.trim() ?? ''
  const coords = formatCoord(venue.location.lat, venue.location.lng)

  const where = country ? `${city} · ${country}` : city || '—'
  const description =
    venue.description.trim().length > 8
      ? venue.description
      : "The host hasn't written a description yet. A conversation with them will reveal more than any marketing copy would."

  const amenities = amenitiesOf(venue).filter((a) => a.on)

  const eyebrowText =
    typeof index === 'number'
      ? `Venue · N°${String(index + 1).padStart(2, '0')}`
      : 'Venue · Peek'

  return (
    <div className="venue-modal__frame">
      <button
        type="button"
        className="venue-modal__close"
        onClick={onClose}
        aria-label="Close venue preview"
      >
        Close ✕
      </button>

      <figure className="venue-modal__plate">
        {cover ? (
          <img
            className="venue-modal__img"
            src={cover.url}
            alt={cover.alt || venue.name}
            referrerPolicy="no-referrer"
          />
        ) : null}
        <figcaption className="venue-modal__caption">
          <span>{coords}</span>
          <span>{continent || country || '—'}</span>
        </figcaption>
      </figure>

      <div className="venue-modal__body">
        <p className="venue-modal__eyebrow">{eyebrowText}</p>
        <h2 className="venue-modal__name" id="venue-modal-name">
          {venue.name}
        </h2>
        <p className="venue-modal__where">{where}</p>
        <p className="venue-modal__desc">{description}</p>

        <div className="venue-modal__facts">
          {venue.maxGuests > 0 ? (
            <div className="venue-modal__fact">
              <span>Sleeps</span>
              <strong>
                {venue.maxGuests} guest{venue.maxGuests === 1 ? '' : 's'}
              </strong>
            </div>
          ) : null}
          {country ? (
            <div className="venue-modal__fact">
              <span>Country</span>
              <strong>{country}</strong>
            </div>
          ) : null}
          {continent ? (
            <div className="venue-modal__fact">
              <span>Continent</span>
              <strong>{continent}</strong>
            </div>
          ) : null}
          <div className="venue-modal__fact">
            <span>Rating</span>
            <strong>{venue.rating.toFixed(1)} / 5</strong>
          </div>
        </div>

        {amenities.length > 0 ? (
          <div className="venue-modal__amen">
            {amenities.map((a) => (
              <span key={a.key} className="amenity">
                {a.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="venue-modal__book">
          <p className="venue-modal__price">
            <strong>{formatPrice(venue.price)}</strong>
            <small>per night, direct</small>
          </p>
          <Link
            to={`/venues/${venue.id}`}
            className="venue-modal__cta"
            onClick={onClose}
          >
            Book now <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
