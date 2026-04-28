import { useState } from 'react'

import {
  amenitiesOf,
  formatCoord,
  formatLocation,
  formatPrice,
} from '../../lib/venue-format'
import type { Venue } from '../../types/venue'
import { Icon, type IconName } from '../ui'

interface VenueSpreadProps {
  venue: Venue
}

const AMENITY_ICONS: Record<'wifi' | 'parking' | 'breakfast' | 'pets', IconName> = {
  wifi: 'wifi',
  parking: 'parking',
  breakfast: 'breakfast',
  pets: 'pets',
}

export function VenueSpread({ venue }: VenueSpreadProps) {
  const description = venue.description.trim()
  const fallback =
    "The host hasn't written a description yet. A conversation with them will reveal more than any marketing copy ever could."
  const fullText = description.length > 8 ? description : fallback
  const paragraphs = fullText.split(/\n+/).map((p) => p.trim()).filter(Boolean)
  const isLong = fullText.length > 280 || paragraphs.length > 2

  const [expanded, setExpanded] = useState(false)

  const amenities = amenitiesOf(venue)
  const coord = formatCoord(venue.location.lat, venue.location.lng)
  const where = formatLocation(venue)

  const addressFields = [
    venue.location.address,
    venue.location.city,
    venue.location.zip,
    venue.location.country,
  ].filter((field): field is string => {
    if (!field) return false
    const trimmed = field.trim()
    // Skip placeholder strings the public dataset is full of.
    return trimmed.length > 0 && trimmed !== 'Unknown' && trimmed !== 'string'
  })

  return (
    <article className="v-mag__spread">
      <div
        className={`v-mag__body${isLong && !expanded ? ' v-mag__body--collapsed' : ''}`}
        id="v-body"
      >
        {paragraphs.map((para, i) => (
          <p
            key={`${String(i)}-${para.slice(0, 12)}`}
            className={`v-mag__body-p${i === 0 ? ' v-mag__body-p--dropcap' : ''}`}
          >
            {para}
          </p>
        ))}
        {isLong ? (
          <button
            type="button"
            className="v-mag__more"
            aria-expanded={expanded}
            aria-controls="v-body"
            onClick={() => { setExpanded((v) => !v); }}
          >
            <span>{expanded ? 'Collapse' : 'Read the whole thing'}</span>
            <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
          </button>
        ) : null}
      </div>

      <aside className="v-mag__margin" aria-label="Venue particulars">
        <section className="v-mag__specs">
          <h3>The particulars</h3>
          <dl>
            <dt>
              <Icon name="bed" size="xs" />
              Sleeps
            </dt>
            <dd>{venue.maxGuests || '—'}</dd>

            <dt>
              <Icon name="star" size="xs" />
              Rating
            </dt>
            <dd>{(venue.rating || 0).toFixed(1)} / 5</dd>

            <dt>
              <Icon name="euro" size="xs" />
              Per night
            </dt>
            <dd>
              <em>{formatPrice(venue.price)}</em>
            </dd>

            <dt>
              <Icon name="pin" size="xs" />
              Location
            </dt>
            <dd>{where}</dd>

            <dt>
              <Icon name="globe" size="xs" />
              Continent
            </dt>
            <dd>{venue.location.continent?.trim() ? venue.location.continent.trim() : '—'}</dd>

            <dt>
              <Icon name="coords" size="xs" />
              Coords
            </dt>
            <dd className="mono">{coord}</dd>
          </dl>
        </section>

        <section className="v-mag__amen">
          <h3>Kept on hand</h3>
          <ul>
            {amenities.map((a) => (
              <li key={a.key} className={a.on ? undefined : 'is-off'}>
                <Icon name={AMENITY_ICONS[a.key]} size="sm" />
                <span>{a.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="v-mag__addr">
          <h3>The door</h3>
          <p className="mono">{addressFields.join(', ') || where}</p>
        </section>
      </aside>
    </article>
  )
}
