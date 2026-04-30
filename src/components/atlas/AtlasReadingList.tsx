import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

import type { CityEntry } from '../../lib/atlas/groupByCity'
import type { Venue } from '../../types/venue'
import { cityKey } from './cityKey'

const READING_LIST_LIMIT = 12

interface ReadingItem {
  venue: Venue
  city: CityEntry
  /** N°XX numbering, 1-based across the *visible* list. */
  index: number
}

export interface AtlasReadingListProps {
  /** Already-sorted, already-filtered city entries. */
  cities: readonly CityEntry[]
  visibleKeys?: ReadonlySet<string>
  hoveredKey?: string | null
  selectedKey?: string | null
  onCityHover?: (city: CityEntry | null) => void
  onCitySelect?: (city: CityEntry) => void
  /** Anchor link rendered at the end of the strip. */
  totalAfterFilter: number
}

function buildItems(cities: readonly CityEntry[], visibleKeys?: ReadonlySet<string>): ReadingItem[] {
  const visible = visibleKeys
    ? cities.filter((c) => visibleKeys.has(cityKey(c)))
    : [...cities]

  const items: ReadingItem[] = []
  // One card per *city*, showing the city's cheapest venue. Keeps the strip
  // tight and prevents a single big city from dominating the rail.
  for (const city of visible) {
    if (city.venues.length === 0) continue
    const [first, ...rest] = city.venues
    const cheapest = rest.reduce((acc, v) => (v.price < acc.price ? v : acc), first)
    items.push({ venue: cheapest, city, index: items.length + 1 })
    if (items.length >= READING_LIST_LIMIT) break
  }
  return items
}

export function AtlasReadingList({
  cities,
  visibleKeys,
  hoveredKey,
  selectedKey,
  onCityHover,
  onCitySelect,
  totalAfterFilter,
}: AtlasReadingListProps) {
  const items = useMemo(() => buildItems(cities, visibleKeys), [cities, visibleKeys])
  const trackRef = useRef<HTMLDivElement | null>(null)

  // Scroll the matching card into view when the user *commits* to a city by
  // clicking — hover stays exploratory and doesn't yank the page. The pull
  // card on the plate already gives a hover-time preview.
  useEffect(() => {
    if (!selectedKey || !trackRef.current) return
    const card = trackRef.current.querySelector<HTMLElement>(`[data-city-key="${selectedKey}"]`)
    if (!card) return
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    card.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [selectedKey])

  const overflowCount = Math.max(0, totalAfterFilter - items.length)

  if (items.length === 0) {
    return null
  }

  return (
    <section className="atp__reading" aria-labelledby="atp-reading-title">
      <header className="atp__reading__head">
        <p className="atp__reading__eyebrow">
          <strong>N°06</strong> Reading list
        </p>
        <h2 className="atp__reading__title" id="atp-reading-title">
          The <em>specimens</em>, listed.
        </h2>
        <p className="atp__reading__meta">
          {String(items.length)} of {String(totalAfterFilter)} · synced with the plate
        </p>
      </header>

      <div className="atp__reading__track" ref={trackRef}>
        {items.map((item) => {
          const key = cityKey(item.city)
          const hovered = hoveredKey === key
          const selected = selectedKey === key
          const classes = ['atp__reading__card']
          if (hovered) classes.push('is-hovered-ext')
          if (selected) classes.push('is-selected')

          const img = item.venue.media[0]?.url
          const alt = item.venue.media[0]?.alt || item.venue.name
          const rating = Number.isFinite(item.venue.rating) ? item.venue.rating.toFixed(1) : null

          return (
            <article
              key={key}
              className={classes.join(' ')}
              data-city-key={key}
              onMouseEnter={() => {
                onCityHover?.(item.city)
              }}
              onMouseLeave={() => {
                onCityHover?.(null)
              }}
            >
              <button
                type="button"
                className="atp__reading__dock"
                onClick={() => {
                  onCitySelect?.(item.city)
                }}
                onFocus={() => {
                  onCityHover?.(item.city)
                }}
                onBlur={() => {
                  onCityHover?.(null)
                }}
                aria-label={`Dock ${item.city.city} on the plate — ${String(item.city.venues.length)} venues`}
              >
                <span className="atp__reading__num">N°{String(item.index).padStart(2, '0')}</span>
                <span className="atp__reading__city">{item.city.city}</span>
                <span className="atp__reading__count">
                  {String(item.city.venues.length)}{' '}
                  {item.city.venues.length === 1 ? 'venue' : 'venues'}
                </span>
              </button>

              <Link
                to={`/venues/${item.venue.id}`}
                className="atp__reading__media"
                aria-label={`Open ${item.venue.name}`}
              >
                {img ? (
                  <img src={img} alt={alt} loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <span className="atp__reading__media__alt" aria-hidden="true">
                    no image
                  </span>
                )}
                <span className="atp__reading__price">
                  <span className="atp__reading__price__from">from</span>
                  <span className="atp__reading__price__val">€{String(item.venue.price)}</span>
                </span>
              </Link>

              <div className="atp__reading__body">
                <p className="atp__reading__name">
                  <Link to={`/venues/${item.venue.id}`}>{item.venue.name}</Link>
                </p>
                <p className="atp__reading__row">
                  <span>{item.city.country || '—'}</span>
                  {rating ? <span>★ {rating}</span> : null}
                </p>
              </div>
            </article>
          )
        })}

        {overflowCount > 0 ? (
          <a className="atp__reading__overflow" href="#atp-gazetteer">
            <span className="atp__reading__overflow__num">+{String(overflowCount)}</span>
            <span className="atp__reading__overflow__label">
              more in the <em>gazetteer</em>
              <span aria-hidden="true"> ↓</span>
            </span>
          </a>
        ) : null}
      </div>
    </section>
  )
}
