import '../styles/reading-list.css'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Atlas as AtlasComposite } from '../components/atlas/Atlas'
import { AtlasControls } from '../components/atlas/AtlasControls'
import { AtlasGazetteer } from '../components/atlas/AtlasGazetteer'
import { AtlasReadingList } from '../components/atlas/AtlasReadingList'
import { AtlasSortSelect } from '../components/atlas/AtlasSort'
import { cityKey } from '../components/atlas/cityKey'
import { CompassDial } from '../components/atlas/CompassDial'
import { RunningNote } from '../components/atlas/RunningNote'
import { ScopeRail } from '../components/atlas/ScopeRail'
import { SelectionDock } from '../components/atlas/SelectionDock'
import { useAtlasCities } from '../hooks/useAtlasCities'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { centroid } from '../lib/atlas/centroid'
import type { Continent } from '../lib/atlas/cityCoords'
import type { CityEntry } from '../lib/atlas/groupByCity'
import { formatBounds } from '../lib/atlas/project'
import { type AtlasSort, isAtlasSort, sortCities } from '../lib/atlas/sortCities'

const HERO_WORDMARK = 'TERRA'

type ContinentFilter = Continent | 'All'

function isContinent(value: string): value is Continent {
  return (
    value === 'Europe' ||
    value === 'Asia' ||
    value === 'North America' ||
    value === 'South America' ||
    value === 'Africa' ||
    value === 'Oceania' ||
    value === 'Antarctica'
  )
}

export default function Atlas() {
  useDocumentTitle('Atlas')
  const { cities, isLoading, isFallback, error, totalVenues } = useAtlasCities()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const continentParam = params.get('continent') ?? 'All'
  const continent: ContinentFilter =
    continentParam === 'All' || isContinent(continentParam) ? continentParam : 'All'
  const selectedKeyParam = params.get('city')
  const sortParam = params.get('sort') ?? 'most-venues'
  const sort: AtlasSort = isAtlasSort(sortParam) ? sortParam : 'most-venues'

  // Document title — keep editorial framing.
  useEffect(() => {
    const previous = document.title
    document.title = 'The Atlas — Holidaze'
    return () => {
      document.title = previous
    }
  }, [])

  // Free-text predicate (city / country / continent name match).
  const searchPredicate = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (city: CityEntry): boolean => {
      if (!q) return true
      const hay = `${city.city} ${city.country} ${city.continent}`.toLowerCase()
      return hay.includes(q)
    }
  }, [search])

  const matchedCities = useMemo(() => cities.filter(searchPredicate), [cities, searchPredicate])
  const sortedCities = useMemo(() => sortCities(cities, sort), [cities, sort])

  // Per-continent counts after the search filter — chips reflect "what would
  // remain" on selection, so disabled chips read as "no matches under search".
  const continentCounts = useMemo<Readonly<Record<string, number>>>(() => {
    const counts: Record<string, number> = {}
    for (const c of matchedCities) {
      const k = c.continent || ''
      counts[k] = (counts[k] ?? 0) + 1
    }
    return counts
  }, [matchedCities])

  const visibleKeys = useMemo<ReadonlySet<string>>(() => {
    const set = new Set<string>()
    for (const c of matchedCities) {
      if (continent === 'All' || c.continent === continent) set.add(cityKey(c))
    }
    return set
  }, [matchedCities, continent])

  const visibleCities = useMemo(
    () => cities.filter((c) => visibleKeys.has(cityKey(c))),
    [cities, visibleKeys],
  )

  const selectedCity = useMemo<CityEntry | null>(() => {
    if (!selectedKeyParam) return null
    return cities.find((c) => cityKey(c) === selectedKeyParam) ?? null
  }, [cities, selectedKeyParam])

  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const handleHover = useCallback((city: CityEntry | null) => {
    setHoveredKey(city ? cityKey(city) : null)
  }, [])

  // Esc clears the selection (only when no input is focused).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (selectedKeyParam) {
        const next = new URLSearchParams(params)
        next.delete('city')
        setParams(next, { replace: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [selectedKeyParam, params, setParams])

  // URL helpers.
  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value && value !== 'All') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const handleCitySelect = (city: CityEntry) => {
    updateParam('city', cityKey(city))
  }

  const handleClose = () => {
    updateParam('city', null)
  }

  const handleResetAll = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true })
  }, [setParams])

  const hasActiveFilter = Boolean(search) || continent !== 'All' || sort !== 'most-venues' || Boolean(selectedKeyParam)

  const stats = useMemo(() => {
    const countries = new Set(cities.map((c) => c.country).filter(Boolean)).size
    const continents = new Set(cities.map((c) => c.continent).filter(Boolean)).size
    return { cities: cities.length, countries, continents, venues: totalVenues }
  }, [cities, totalVenues])

  const bounds = useMemo(() => formatBounds(cities), [cities])
  const highlightContinent = continent === 'All' ? null : continent
  const compassCentroid = useMemo(() => centroid(visibleCities), [visibleCities])
  const compassLabel =
    continent === 'All' ? `${String(visibleCities.length)} cities` : continent

  return (
    <main id="main">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <span aria-current="page">The Atlas</span>
          </li>
        </ol>
      </nav>

      <section className="atlas-hero" aria-labelledby="atlas-page-title">
        <div className="grain atlas-hero__grain" aria-hidden="true" />

        <span className="atlas-hero__wordmark" aria-hidden="true">
          {HERO_WORDMARK}
        </span>

        <p className="atlas-hero__stamp" aria-hidden="true">
          <span>Holidaze Press</span>
          <span className="atlas-hero__stamp__bullet">·</span>
          <span>N°04</span>
          <span className="atlas-hero__stamp__bullet">·</span>
          <span>Spring 2026</span>
        </p>

        <div className="atlas-hero__lead">
          <p className="eyebrow atlas-hero__eyebrow">
            <span className="eyebrow__num">§ 05</span>
            <span className="eyebrow__label">The Atlas, to scale</span>
          </p>
          <h1 className="atlas-hero__title" id="atlas-page-title" data-route-anchor tabIndex={-1}>
            Every <em>place</em>,<br />
            plotted.
          </h1>
          <p className="atlas-hero__lede">
            A typographic map of the collection — filter, search, or dock a city.
          </p>
          <p className="atlas-hero__bounds mono">{isLoading ? '…' : bounds}</p>
        </div>

        <dl className="atlas-hero__stats" aria-label="Atlas statistics">
          <div className="atlas-hero__stat">
            <dt>
              <span className="atlas-hero__stat__full">Cities plotted</span>
              <span className="atlas-hero__stat__short">Cities</span>
            </dt>
            <dd>{String(stats.cities || '—')}</dd>
          </div>
          <div className="atlas-hero__stat">
            <dt>Countries</dt>
            <dd>{String(stats.countries || '—')}</dd>
          </div>
          <div className="atlas-hero__stat">
            <dt>Continents</dt>
            <dd>{String(stats.continents || '—')}</dd>
          </div>
          <div className="atlas-hero__stat">
            <dt>
              <span className="atlas-hero__stat__full">Venues catalogued</span>
              <span className="atlas-hero__stat__short">Venues</span>
            </dt>
            <dd>{String(stats.venues || '—')}</dd>
          </div>
        </dl>
      </section>

      <section className="atp" aria-label="Interactive atlas">
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {isLoading
            ? 'Loading the atlas.'
            : error && !isFallback
              ? "The atlas couldn't be reached. Showing the curated set."
              : visibleCities.length === 0
                ? `No cities match the current filter${continent !== 'All' ? ` in ${continent}` : ''}.`
                : `${String(visibleCities.length)} ${visibleCities.length === 1 ? 'city' : 'cities'} visible.`}
        </p>
        <div className="atp__bar">
          <AtlasControls
            search={search}
            continent={continent}
            counts={continentCounts}
            totalAfterSearch={matchedCities.length}
            onSearchChange={(v) => {
              updateParam('q', v || null)
            }}
            onContinentChange={(c) => {
              updateParam('continent', c)
            }}
          />
          <AtlasSortSelect
            value={sort}
            onChange={(next) => {
              updateParam('sort', next === 'most-venues' ? null : next)
            }}
          />
        </div>

        <header className="atp__head" aria-labelledby="atlas-title">
          <p className="eyebrow">
            <span className="eyebrow__num">§ 05</span>
            <span className="eyebrow__label">The Atlas, to scale</span>
          </p>
          <h2 className="atlas__title atlas__title--page" id="atlas-title">
            {String(cities.length)} <em>places</em>, plotted.
          </h2>
          <p className="atlas__bounds mono">
            {isLoading ? '…' : bounds}
          </p>
        </header>

        <div className="atp__layout">
          <div className="atp__main">
            <AtlasComposite
              variant="full"
              cities={sortedCities}
              isLoading={isLoading}
              visibleKeys={visibleKeys}
              highlightContinent={highlightContinent}
              selectedKey={selectedKeyParam}
              hoveredKey={hoveredKey}
              onCityHover={handleHover}
              onCitySelect={handleCitySelect}
              hideFullLink
              hideHead
              hideGazetteer
              withCursor
              withScaleBar
              onResetZoom={() => {
                updateParam('continent', null)
              }}
              plateOverlay={<CompassDial centroid={compassCentroid} label={compassLabel} />}
            />
          </div>

          <aside className="atp__sidebar" aria-label="Scope sidebar">
            <ScopeRail
              value={sort}
              onChange={(next) => {
                updateParam('sort', next === 'most-venues' ? null : next)
              }}
              onResetAll={handleResetAll}
              hasActiveFilter={hasActiveFilter}
            />
            <RunningNote continent={continent} cityCount={visibleCities.length} />
          </aside>

          <AtlasReadingList
            cities={sortedCities}
            visibleKeys={visibleKeys}
            hoveredKey={hoveredKey}
            selectedKey={selectedKeyParam}
            onCityHover={handleHover}
            onCitySelect={handleCitySelect}
            totalAfterFilter={visibleCities.length}
          />

          {selectedCity ? <SelectionDock city={selectedCity} onClose={handleClose} /> : null}

          <AtlasGazetteer
            cities={sortedCities}
            visibleKeys={visibleKeys}
            selectedKey={selectedKeyParam}
            hoveredKey={hoveredKey}
            onHover={handleHover}
            mode="full"
            onSelect={handleCitySelect}
            alphaSort={false}
          />
        </div>

        {isLoading ? (
          <div className="atp__status atp__status--loading" role="status" aria-live="polite">
            <span className="atp__status__pill">Plotting cartography</span>
            <span className="atp__status__cursor" aria-hidden="true" />
            <span className="atp__status__meta">Reading the gazetteer · drawing the plate</span>
          </div>
        ) : null}

        {error && !isFallback ? (
          <div className="atp__status atp__status--error" role="status">
            <p className="atp__status__title">
              The atlas couldn&apos;t be reached. <em>Trying the curated set in the meantime.</em>
            </p>
            <button
              type="button"
              className="atp__selection__cta"
              onClick={() => {
                window.location.reload()
              }}
            >
              Retry the live cartography →
            </button>
          </div>
        ) : null}

        {!isLoading && visibleCities.length === 0 ? (
          <div className="atp__status atp__status--empty" role="status">
            <p className="atp__status__title">
              No landfalls in <em>{continent === 'All' ? 'this filter' : continent}</em>
              {search ? <> for &ldquo;{search}&rdquo;</> : null}.
            </p>
            <div className="atp__status__actions">
              {continent !== 'All' ? (
                <button
                  type="button"
                  className="atp__selection__cta"
                  onClick={() => {
                    updateParam('continent', null)
                  }}
                >
                  Try Europe →
                </button>
              ) : null}
              {search ? (
                <button
                  type="button"
                  className="atp__selection__cta"
                  onClick={() => {
                    updateParam('q', null)
                  }}
                >
                  Clear search →
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
