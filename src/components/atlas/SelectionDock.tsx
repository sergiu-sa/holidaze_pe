import { Link } from 'react-router-dom'

import type { CityEntry } from '../../lib/atlas/groupByCity'
import { formatCoord } from '../../lib/atlas/project'

export interface SelectionDockProps {
  city: CityEntry
  onClose: () => void
}

const PREVIEW_LIMIT = 6

export function SelectionDock({ city, onClose }: SelectionDockProps) {
  const previews = city.venues.slice(0, PREVIEW_LIMIT)
  const venueLabel = city.venues.length === 1 ? 'venue' : 'venues'

  return (
    <section className="atp__selection" aria-labelledby="selection-title">
      <div className="atp__selection__head">
        <div>
          <p className="atp__selection__eyebrow">
            <strong>Selection</strong>{' '}
            {`${city.continent || city.country || '—'} · ${String(city.venues.length)} ${venueLabel}`}
          </p>
          <h2 className="atp__selection__title" id="selection-title">
            In <em>{city.city}</em>.
          </h2>
          <p className="atp__selection__coords">
            {formatCoord(city.lat, city.lng)} · {city.country || '—'}
          </p>
        </div>
        <button
          type="button"
          className="atp__selection__close"
          onClick={onClose}
          aria-label="Dismiss city selection"
        >
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      {previews.length === 0 ? (
        <p className="atlas__gaz__empty">No matching venues.</p>
      ) : (
        <div className="atp__selection__list">
          {previews.map((v, i) => {
            const img = v.media[0]?.url
            const alt = v.media[0]?.alt || v.name
            return (
              <Link
                key={v.id}
                to={`/venues/${v.id}`}
                className="atp__selection__card"
                aria-label={`${v.name} — €${String(v.price)} per night, ${v.rating.toFixed(1)} stars`}
              >
                <div className="atp__selection__card__img">
                  {img ? <img src={img} alt={alt} loading="lazy" referrerPolicy="no-referrer" /> : null}
                  <span className="atp__selection__card__num">
                    N°{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="atp__selection__card__body">
                  <p className="atp__selection__card__name">{v.name}</p>
                  <div className="atp__selection__card__row">
                    <span>
                      <strong>€{String(v.price)}</strong> /night
                    </span>
                    <span>{v.rating.toFixed(1)} ★</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="atp__selection__foot">
        <p className="atp__selection__foot__meta">
          Showing {String(previews.length)} of {String(city.venues.length)}
        </p>
        <Link className="atp__selection__cta" to={`/venues?q=${encodeURIComponent(city.city)}`}>
          All venues in {city.city} →
        </Link>
      </div>
    </section>
  )
}
