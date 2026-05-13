import { project } from '../../lib/atlas/project'
import type { IntroCity } from '../../lib/intro/cities'
import { WorldPlate } from '../atlas/WorldPlate'

interface IntroPlateProps {
  cities: readonly IntroCity[]
}

export function IntroPlate({ cities }: IntroPlateProps) {
  return (
    <div className="intro-cover__plate-wrap">
      <WorldPlate ariaLabel="World plate with eight Holidaze cities">
        <div className="intro-cover__markers" aria-hidden="true">
          {cities.map((c) => {
            const { x, y } = project(c.lat, c.lng)
            return (
              <div
                key={c.key}
                className="intro-cover__pin"
                data-city={c.key}
                style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
              >
                {/* Pin = the brand's coordinate glyph (the wordmark °). */}
                <svg className="intro-cover__pin-dot" viewBox="0 0 14 14" aria-hidden="true">
                  <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <svg className="intro-cover__pin-ring" viewBox="0 0 14 14" aria-hidden="true">
                  <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )
          })}
        </div>
      </WorldPlate>
    </div>
  )
}
