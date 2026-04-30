import { type ReactNode, useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAtlasCities } from '../../hooks/useAtlasCities'
import type { Continent } from '../../lib/atlas/cityCoords'
import { viewBoxFor, WORLD_VIEWBOX } from '../../lib/atlas/continentBounds'
import type { CityEntry } from '../../lib/atlas/groupByCity'
import { formatBounds } from '../../lib/atlas/project'
import { AtlasCard } from './AtlasCard'
import { AtlasGazetteer } from './AtlasGazetteer'
import { cityKey } from './cityKey'
import { CityMarker } from './CityMarker'
import { PlateCursor } from './PlateCursor'
import { ScaleBar } from './ScaleBar'
import { WorldPlate } from './WorldPlate'

export interface AtlasProps {
  variant: 'compact' | 'full'
  /** Used by the full page to filter the marker layer based on chip + search. */
  visibleKeys?: ReadonlySet<string>
  /** Highlight one continent's land paths (full page chip selection). */
  highlightContinent?: Continent | null
  /** The full page docks a selection — pass the active key to style the marker. */
  selectedKey?: string | null
  /** External hover state (page-managed for bidirectional sync with reading list). */
  hoveredKey?: string | null
  /** Notified when the user moves the cursor onto / off a marker or gazetteer row. */
  onCityHover?: (city: CityEntry | null) => void
  /** Override marker click — full page docks; compact navigates to /venues?q=. */
  onCitySelect?: (city: CityEntry) => void
  /** Skip the "Open the full atlas" CTA (true on /atlas itself). */
  hideFullLink?: boolean
  /** External cities feed — when supplied, the component skips its internal hook. */
  cities?: readonly CityEntry[]
  isLoading?: boolean
  /** Show the live-coords HUD + crosshair overlay (full page only). */
  withCursor?: boolean
  /** Show the typographic scale bar overlay (full page only). */
  withScaleBar?: boolean
  /** Suppress the internal `.atlas__head` (eyebrow + title + bounds) so the
   *  page can render its own at full layout width — used on /atlas to align
   *  the side-margin rail with the plate, not the title row. */
  hideHead?: boolean
  /** Suppress the internal gazetteer so the page can render it directly
   *  in the layout grid (full-width below the plate row). */
  hideGazetteer?: boolean
  /** Optional element rendered inside the plate (e.g. a compass overlay). */
  plateOverlay?: ReactNode
  /** When the user has zoomed into a continent, fires when they press the
   *  "↩ World" button to return to the full plate. */
  onResetZoom?: () => void
}

interface CardState {
  city: CityEntry
  position: { x: number; y: number }
}

export function Atlas({
  variant,
  visibleKeys,
  highlightContinent,
  selectedKey,
  hoveredKey,
  onCityHover,
  onCitySelect,
  hideFullLink,
  cities: externalCities,
  isLoading: externalLoading,
  withCursor,
  withScaleBar,
  hideHead,
  hideGazetteer,
  plateOverlay,
  onResetZoom,
}: AtlasProps) {
  const navigate = useNavigate()
  const internal = useAtlasCities({ enabled: externalCities === undefined })
  const cities = externalCities ?? internal.cities
  const isLoading = externalLoading ?? internal.isLoading

  const plateRef = useRef<HTMLDivElement | null>(null)
  const plateInnerRef = useRef<HTMLDivElement | null>(null)
  const [card, setCard] = useState<CardState | null>(null)

  const handleHoverStart = useCallback(
    (city: CityEntry, el: HTMLButtonElement) => {
      const plate = plateRef.current
      if (!plate) return
      const r = el.getBoundingClientRect()
      const p = plate.getBoundingClientRect()
      setCard({
        city,
        position: {
          x: ((r.left - p.left + r.width / 2) / p.width) * 100,
          y: ((r.top - p.top + r.height / 2) / p.height) * 100,
        },
      })
      onCityHover?.(city)
    },
    [onCityHover],
  )
  const handleHoverEnd = useCallback(() => {
    setCard(null)
    onCityHover?.(null)
  }, [onCityHover])

  const handleActivate = useCallback(
    (city: CityEntry) => {
      if (onCitySelect) {
        onCitySelect(city)
        return
      }
      navigate(`/venues?q=${encodeURIComponent(city.city)}`)
    },
    [navigate, onCitySelect],
  )

  const bounds = formatBounds(cities)
  const isCompact = variant === 'compact'

  // Continent zoom — only on the full page. Compact embed (Home) always shows
  // the world plate; zooming on a small embedded plate would hide context.
  const activeViewBox = !isCompact && highlightContinent ? viewBoxFor(highlightContinent) : WORLD_VIEWBOX

  const wrapperClass = isCompact ? 'atlas atlas--compact' : 'atlas'
  const eyebrowNum = isCompact ? '§ 03' : '§ 05'

  return (
    <section
      className={wrapperClass}
      aria-labelledby={hideHead ? undefined : 'atlas-title'}
      aria-label={hideHead ? 'Atlas plate' : undefined}
    >
      {hideHead ? null : (
        <div className="atlas__head">
          <p className="eyebrow">
            <span className="eyebrow__num">{eyebrowNum}</span>
            <span className="eyebrow__label">The Atlas, to scale</span>
          </p>
          <h2 className="atlas__title" id="atlas-title">
            {String(cities.length)} <em>places</em>, plotted.
          </h2>
          <p className="atlas__bounds mono" aria-label="Geographic bounds of the atlas">
            {isLoading ? '…' : bounds}
          </p>
        </div>
      )}

      <div ref={plateRef}>
        <WorldPlate
          ref={plateInnerRef}
          ariaLabel={`World map showing ${String(cities.length)} cities with Holidaze venues`}
          highlightContinent={highlightContinent}
          viewBox={activeViewBox}
        >
          {withCursor ? <PlateCursor plateRef={plateInnerRef} /> : null}
          {withScaleBar ? <ScaleBar /> : null}
          {plateOverlay}
          {onResetZoom && activeViewBox !== WORLD_VIEWBOX ? (
            <button
              type="button"
              className="atp__zoom-reset"
              onClick={onResetZoom}
              aria-label="Zoom out to the world plate"
            >
              <span className="atp__zoom-reset__glyph" aria-hidden="true">
                ↩
              </span>
              <span className="atp__zoom-reset__label">World</span>
            </button>
          ) : null}
          <div className="atlas__markers">
            {cities.map((city, i) => {
              const key = cityKey(city)
              const filteredOut = Boolean(visibleKeys && !visibleKeys.has(key))
              const selected = selectedKey === key
              const hovered = hoveredKey === key
              return (
                <CityMarker
                  key={key}
                  city={city}
                  index={i}
                  isFilteredOut={filteredOut}
                  isSelected={selected}
                  isHoveredExternally={hovered}
                  showPricePill={!isCompact}
                  viewBox={activeViewBox}
                  onActivate={handleActivate}
                  onHoverStart={handleHoverStart}
                  onHoverEnd={handleHoverEnd}
                />
              )
            })}
          </div>
          <AtlasCard city={card?.city ?? null} position={card?.position ?? null} />
        </WorldPlate>
      </div>

      {hideGazetteer ? null : (
        <AtlasGazetteer
          cities={cities}
          visibleKeys={visibleKeys}
          selectedKey={selectedKey}
          hoveredKey={hoveredKey}
          onHover={onCityHover}
          mode={onCitySelect ? 'full' : 'compact'}
          onSelect={onCitySelect}
          alphaSort={isCompact}
        />
      )}

      {!hideFullLink && isCompact ? (
        <Link className="atlas__full" to="/atlas">
          <span className="atlas__full__eyebrow">N°— · Continue</span>
          <span className="atlas__full__title">
            Open the <em>full atlas</em>
            <span aria-hidden="true"> ↗</span>
          </span>
          <span className="atlas__full__meta">
            Filter by continent · dock a city · open its venues
          </span>
        </Link>
      ) : null}
    </section>
  )
}
