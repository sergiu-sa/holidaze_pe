import {
  amenitiesOf,
  deriveDeck,
  formatPrice,
  ratingDots,
} from '../../lib/venue-format'
import type { Venue } from '../../types/venue'

interface VenueTitlePlateProps {
  venue: Venue
}

export function VenueTitlePlate({ venue }: VenueTitlePlateProps) {
  const city = venue.location.city?.trim() ?? ''
  const country = venue.location.country?.trim() ?? ''
  const continent = venue.location.continent?.trim() ?? ''
  const where = [city, country].filter(Boolean).join(' · ').toUpperCase() || '—'
  const filedUnder = (continent !== '' ? continent : country !== '' ? country : '—').toUpperCase()
  const guests = venue.maxGuests
  const hostName = venue.owner?.name.trim() ?? 'a Holidaze host'
  const ratingText = `${venue.rating.toFixed(1)} ${ratingDots(venue.rating)}`

  return (
    <header className="v-title" aria-labelledby="v-name">
      <span className="regmark regmark--tl" aria-hidden="true" />
      <span className="regmark regmark--tr" aria-hidden="true" />
      <span className="regmark regmark--bl" aria-hidden="true" />
      <span className="regmark regmark--br" aria-hidden="true" />

      <div className="v-title__crown" aria-hidden="true">
        <span className="v-title__crown-cell">
          <span className="v-title__crown-lbl">Rubric</span>
          <span className="v-title__crown-val">A place, described</span>
        </span>
        <span className="v-title__crown-cell">
          <span className="v-title__crown-lbl">Where</span>
          <span className="v-title__crown-val">{where}</span>
        </span>
        <span className="v-title__crown-cell">
          <span className="v-title__crown-lbl">Filed under</span>
          <span className="v-title__crown-val">{filedUnder}</span>
        </span>
      </div>

      <h1 className="v-title__name" id="v-name">
        {venue.name}
      </h1>
      <p className="v-title__deck">{deriveDeck(venue)}</p>

      <dl className="v-title__facts" aria-label="Venue at a glance">
        <div className="v-title__fact v-title__fact--price">
          <dt className="mono">Nightly</dt>
          <dd>
            <strong>{formatPrice(venue.price)}</strong>
          </dd>
        </div>
        <div className="v-title__fact">
          <dt className="mono">Rating</dt>
          <dd>{ratingText}</dd>
        </div>
        <div className="v-title__fact">
          <dt className="mono">Sleeps</dt>
          <dd>{guests > 0 ? `${String(guests)} guest${guests === 1 ? '' : 's'}` : '—'}</dd>
        </div>
        <div className="v-title__fact">
          <dt className="mono">Host</dt>
          <dd>
            <em>{hostName}</em>
          </dd>
        </div>
      </dl>

      <nav className="v-title__toc mono" aria-label="Jump to section">
        <span className="v-title__toc-lbl">
          Jump to <span aria-hidden="true">→</span>
        </span>
        <a href="#v-body" className="v-title__toc-link">
          <span className="v-title__toc-num">§ 06·β</span> <span>The story</span>
        </a>
        <a href="#cal-title" className="v-title__toc-link">
          <span className="v-title__toc-num">§ 07</span> <span>Availability</span>
        </a>
        <a href="#book-title" className="v-title__toc-link">
          <span className="v-title__toc-num">§ 08</span> <span>Book direct</span>
        </a>
        {venue.owner ? (
          <a href="#host-name" className="v-title__toc-link">
            <span className="v-title__toc-num">§ 09</span> <span>The host</span>
          </a>
        ) : null}
      </nav>

      {/* Hidden summary so screen readers can announce amenities up-front. */}
      <span className="sr-only">
        Amenities:{' '}
        {amenitiesOf(venue)
          .filter((a) => a.on)
          .map((a) => a.label)
          .join(', ') || 'None listed'}
      </span>
    </header>
  )
}
