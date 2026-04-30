import { forwardRef } from 'react'

import type { ViewBox } from '../../lib/atlas/continentBounds'
import { pctInViewBox, WORLD_VIEWBOX } from '../../lib/atlas/continentBounds'
import type { CityEntry } from '../../lib/atlas/groupByCity'
import { priceStats } from '../../lib/atlas/priceStats'
import { formatCoord, projectSvg } from '../../lib/atlas/project'

function sizeClass(count: number): 'sm' | 'md' | 'lg' {
  if (count >= 3) return 'lg'
  if (count >= 2) return 'md'
  return 'sm'
}

// Hash a city name into 0..1 for deterministic flip-y assignment so labels
// alternate above/below without overlapping their neighbours.
function hashCity(name: string): number {
  let acc = 0
  for (const ch of name) acc = (acc + ch.charCodeAt(0)) % 7
  return acc
}

export interface CityMarkerProps {
  city: CityEntry
  index: number
  isFilteredOut?: boolean
  isSelected?: boolean
  /** Highlighted from outside (e.g. user hovered the matching gazetteer row). */
  isHoveredExternally?: boolean
  /** When true, marker carries a "from €X" price chip in addition to the count. */
  showPricePill?: boolean
  /** Active SVG viewBox — marker positions are computed relative to this so
   *  the dot/label sits over the right country when the plate is zoomed. */
  viewBox?: ViewBox
  onActivate?: (city: CityEntry) => void
  onHoverStart?: (city: CityEntry, el: HTMLButtonElement) => void
  onHoverEnd?: () => void
}

export const CityMarker = forwardRef<HTMLButtonElement, CityMarkerProps>(function CityMarker(
  {
    city,
    index,
    isFilteredOut,
    isSelected,
    isHoveredExternally,
    showPricePill,
    viewBox = WORLD_VIEWBOX,
    onActivate,
    onHoverStart,
    onHoverEnd,
  },
  ref,
) {
  const svgPos = projectSvg(city.lat, city.lng)
  const { x, y } = pctInViewBox(svgPos.x, svgPos.y, viewBox)
  const size = sizeClass(city.venues.length)
  // Outside the active viewBox? Hide entirely so labels can't bleed into
  // neighbouring continents when zoomed in.
  const outOfView = x < -2 || x > 102 || y < -2 || y > 102
  const flipX = x > 72
  const flipY = (hashCity(city.city) + index) % 2 === 0

  const classes = ['atlas__city', `atlas__city--${size}`]
  if (flipX) classes.push('atlas__city--flip-x')
  if (flipY) classes.push('atlas__city--flip-y')
  if (isFilteredOut) classes.push('is-filtered-out')
  if (isSelected) classes.push('is-selected')
  if (isHoveredExternally) classes.push('is-hovered-ext')
  if (outOfView) classes.push('is-out-of-view')

  const venueCount = city.venues.length
  const venueLabel = venueCount === 1 ? 'venue' : 'venues'
  const stats = priceStats(city.venues)
  const fromPrice = showPricePill && stats ? stats.cheapest : null
  const ariaLabel = `${city.city}${city.country ? `, ${city.country}` : ''} — ${String(venueCount)} ${venueLabel}${fromPrice ? ` from €${String(fromPrice)}` : ''} — ${formatCoord(city.lat, city.lng)}`

  return (
    <button
      ref={ref}
      type="button"
      className={classes.join(' ')}
      style={{
        left: `${String(x)}%`,
        top: `${String(y)}%`,
        ['--i' as string]: String(index),
      }}
      data-city={city.city}
      aria-label={ariaLabel}
      aria-hidden={isFilteredOut ? true : undefined}
      tabIndex={isFilteredOut ? -1 : 0}
      onClick={() => {
        onActivate?.(city)
      }}
      onMouseEnter={(e) => {
        onHoverStart?.(city, e.currentTarget)
      }}
      onFocus={(e) => {
        onHoverStart?.(city, e.currentTarget)
      }}
      onMouseLeave={() => {
        onHoverEnd?.()
      }}
      onBlur={() => {
        onHoverEnd?.()
      }}
    >
      <span className="atlas__dot" aria-hidden="true" />
      <span className="atlas__name">
        {city.city}
        {fromPrice ? (
          <span className="atlas__price" aria-hidden="true">
            <span className="atlas__price__from">from</span>
            <span className="atlas__price__val">€{String(fromPrice)}</span>
          </span>
        ) : (
          <sup className="atlas__count" aria-hidden="true">
            {String(venueCount)}
          </sup>
        )}
      </span>
    </button>
  )
})
