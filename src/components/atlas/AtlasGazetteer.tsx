import { Link } from 'react-router-dom'

import type { CityEntry } from '../../lib/atlas/groupByCity'
import { formatCoord } from '../../lib/atlas/project'
import { cityKey } from './cityKey'

export interface AtlasGazetteerProps {
  /** All city entries (sorted A–Z internally). */
  cities: readonly CityEntry[]
  /** When set, rows whose key isn't in the set get the `is-hidden` class. */
  visibleKeys?: ReadonlySet<string>
  /** Currently-selected key — adds `is-selected` styling. */
  selectedKey?: string | null
  /** Currently-hovered key (drives `is-hovered-ext` for bidirectional sync). */
  hoveredKey?: string | null
  onHover?: (city: CityEntry | null) => void
  /** "compact" → rows are <Link>s to /venues?q=. "full" → rows emit onSelect callbacks. */
  mode?: 'compact' | 'full'
  onSelect?: (city: CityEntry) => void
  /** When false, render in the order received instead of sorting A–Z internally.
   *  Default true so the compact embed (Home) keeps its index-style A–Z list. */
  alphaSort?: boolean
}

export function AtlasGazetteer({
  cities,
  visibleKeys,
  selectedKey,
  hoveredKey,
  onHover,
  mode = 'compact',
  onSelect,
  alphaSort = true,
}: AtlasGazetteerProps) {
  const sorted = alphaSort
    ? [...cities].sort((a, b) => a.city.localeCompare(b.city))
    : [...cities]
  const visibleCount = visibleKeys ? sorted.filter((c) => visibleKeys.has(cityKey(c))).length : sorted.length

  if (visibleCount === 0) {
    return <p className="atlas__gaz__empty">No cities match the current filter.</p>
  }

  return (
    <ol id="atp-gazetteer" className="atlas__gazetteer" aria-label="Alphabetical index of cities">
      {sorted.map((city, i) => {
        const key = cityKey(city)
        const hidden = visibleKeys && !visibleKeys.has(key)
        const selected = selectedKey === key
        const hovered = hoveredKey === key
        const liClasses: string[] = []
        if (hidden) liClasses.push('is-hidden')
        if (selected) liClasses.push('is-selected')
        if (hovered) liClasses.push('is-hovered-ext')

        const meta = `${city.continent || city.country || ''} · ${formatCoord(city.lat, city.lng)}`

        return (
          <li
            key={key}
            className={liClasses.join(' ') || undefined}
            onMouseEnter={() => onHover?.(city)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(city)}
            onBlur={() => onHover?.(null)}
          >
            <span className="atlas__gaz-num">N°{String(i + 1).padStart(2, '0')}</span>
            {mode === 'full' ? (
              <button
                type="button"
                className="atlas__gaz-link"
                onClick={() => {
                  onSelect?.(city)
                }}
                aria-label={`${city.city}${city.continent || city.country ? ', ' + (city.continent || city.country) : ''} — ${String(city.venues.length)} ${city.venues.length === 1 ? 'venue' : 'venues'}`}
              >
                {city.city}
              </button>
            ) : (
              <Link className="atlas__gaz-link" to={`/venues?q=${encodeURIComponent(city.city)}`}>
                {city.city}
              </Link>
            )}
            <span className="atlas__gaz-dots" aria-hidden="true" />
            <span className="atlas__gaz-meta">{meta}</span>
            <span className="atlas__gaz-count">{String(city.venues.length)}</span>
          </li>
        )
      })}
    </ol>
  )
}
