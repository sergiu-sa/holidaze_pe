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
                <span className="intro-cover__pin-dot" />
                <span className="intro-cover__pin-ring" />
              </div>
            )
          })}
        </div>
      </WorldPlate>
    </div>
  )
}
