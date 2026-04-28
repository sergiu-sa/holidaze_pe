import { Link } from 'react-router-dom'

import type { Venue } from '../../types/venue'

export interface VenueCardProps {
  venue: Venue
  /** Sequence number for the cinnabar index chip ("N°04"). 1-based. */
  index?: number
  /** Variant class — `bento__cell--N` on Home, `venue--feature` on /venues. */
  className?: string
  /**
   * When set, a plain click opens the peek modal instead of navigating.
   * Modifier-clicks still follow the link so open-in-new-tab works.
   */
  onPeek?: (venue: Venue) => void
}

const RATING_DOTS = ['●', '●', '●', '●', '●']

function formatIndex(index: number): string {
  return `N°${index.toString().padStart(2, '0')}`
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatLocation(venue: Venue): string {
  const city = venue.location.city?.trim() ?? ''
  const country = venue.location.country?.trim() ?? ''
  return [city, country].filter(Boolean).join(', ')
}

function ratingDots(rating: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)))
  return RATING_DOTS.slice(0, filled).join(' ')
}

export function VenueCard({ venue, index, className, onPeek }: VenueCardProps) {
  const cover = venue.media.length > 0 ? venue.media[0] : null
  const where = formatLocation(venue)
  const composed = ['venue', className].filter(Boolean).join(' ')

  const amenityLabels: string[] = []
  if (venue.meta.wifi) amenityLabels.push('Wi-Fi')
  if (venue.meta.parking) amenityLabels.push('Parking')
  if (venue.meta.breakfast) amenityLabels.push('Breakfast')
  if (venue.meta.pets) amenityLabels.push('Pets')

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!onPeek) return
    // Modifier + middle clicks signal "open in new tab" — let the browser handle them.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button === 1
    ) {
      return
    }
    event.preventDefault()
    onPeek(venue)
  }

  return (
    <Link
      to={`/venues/${venue.id}`}
      className={composed}
      aria-label={venue.name}
      onClick={handleClick}
    >
      {cover && (
        <img
          className="venue__img"
          src={cover.url}
          alt={cover.alt || venue.name}
          loading="lazy"
        />
      )}
      <span className="venue__scrim" aria-hidden="true" />
      <span className="venue__ticks" aria-hidden="true" />

      <div className="venue__meta-top">
        <span className="venue__index">{formatIndex(index ?? 0)}</span>
        {venue.location.continent && <span>{venue.location.continent}</span>}
      </div>

      <div className="venue__body">
        <h3 className="venue__name">{venue.name}</h3>
        {where && <p className="venue__where">{where}</p>}
        {venue.description && (
          <p className="venue__desc">{venue.description}</p>
        )}
        <div className="venue__row">
          <span className="venue__price">
            <strong>{formatPrice(venue.price)}</strong> /night
          </span>
          <span className="venue__rating" aria-label={`Rating ${venue.rating.toFixed(1)} of 5`}>
            <span className="venue__dots" aria-hidden="true">
              {ratingDots(venue.rating)}
            </span>
          </span>
        </div>
        {amenityLabels.length > 0 && (
          <div className="venue__amenities">
            {amenityLabels.map((label) => (
              <span key={label} className="amenity">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
