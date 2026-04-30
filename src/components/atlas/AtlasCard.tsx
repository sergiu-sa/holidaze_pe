import type { CityEntry } from '../../lib/atlas/groupByCity'
import { formatCoord } from '../../lib/atlas/project'

export interface AtlasCardProps {
  /** Active city — when null, the card renders empty (kept for layout stability). */
  city: CityEntry | null
  /** Plate-relative position in % (0..100). */
  position: { x: number; y: number } | null
}

const PREVIEW_LIMIT = 3

export function AtlasCard({ city, position }: AtlasCardProps) {
  if (!city || !position) {
    return <div className="atlas__card" aria-hidden="true" role="presentation" />
  }

  const showBelow = position.y < 40
  const showRight = position.x < 50

  const classes = ['atlas__card', 'is-shown']
  if (showBelow) classes.push('atlas__card--below')
  if (showRight) classes.push('atlas__card--right')

  const previews = city.venues.slice(0, PREVIEW_LIMIT)
  const remainder = city.venues.length - previews.length
  const venueLabel = city.venues.length === 1 ? 'venue' : 'venues'

  return (
    <div
      className={classes.join(' ')}
      aria-hidden="true"
      role="presentation"
      style={{
        left: `${String(position.x)}%`,
        top: `${String(position.y)}%`,
      }}
    >
      <p className="atlas__card__head">
        <span>
          {city.city}
          {city.country ? ` · ${city.country}` : ''}
        </span>
        <span className="mono">{formatCoord(city.lat, city.lng)}</span>
      </p>
      <ul className="atlas__card__list">
        {previews.map((v) => (
          <li key={v.id}>
            <span>{v.name}</span>
            <em>€{v.price.toLocaleString('en-GB')}</em>
          </li>
        ))}
        {remainder > 0 ? (
          <li className="atlas__card__more">+{String(remainder)} more</li>
        ) : null}
      </ul>
      <p className="atlas__card__foot">
        {city.continent || '—'} · {String(city.venues.length)} {venueLabel}
      </p>
    </div>
  )
}
