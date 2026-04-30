import { bearingFromCentre } from '../../lib/atlas/centroid'

export interface CompassDialProps {
  /** Geographic centroid of the currently-filtered cities; null when none. */
  centroid: { lat: number; lng: number } | null
  /** Optional label appended to the accessible name (e.g. "Europe"). */
  label?: string
}

// Plate-corner compass dial. SVG-only: italic Fraunces N/E/S/W around a
// hairline circle, terracotta needle rotating to the geographic bearing.
export function CompassDial({ centroid, label }: CompassDialProps) {
  const bearing = centroid ? bearingFromCentre(centroid) : null
  const rotation = bearing ?? 0
  const bearingText =
    bearing !== null ? `${String(Math.round(bearing)).padStart(3, '0')} degrees` : 'no bearing'
  const ariaLabel = `Compass — bearing ${bearingText}${label ? `, ${label}` : ''}`

  return (
    <figure className="compass compass--overlay" aria-label={ariaLabel}>
      <svg
        className="compass__svg"
        viewBox="-50 -50 100 100"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="0" cy="0" r="44" className="compass__ring" />
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16
          const isCardinal = i % 4 === 0
          const inner = isCardinal ? 38 : 41
          const outer = 44
          const rad = (angle * Math.PI) / 180
          const x1 = Math.sin(rad) * inner
          const y1 = -Math.cos(rad) * inner
          const x2 = Math.sin(rad) * outer
          const y2 = -Math.cos(rad) * outer
          return (
            <line
              key={i}
              x1={x1.toFixed(2)}
              y1={y1.toFixed(2)}
              x2={x2.toFixed(2)}
              y2={y2.toFixed(2)}
              className={isCardinal ? 'compass__tick compass__tick--major' : 'compass__tick'}
            />
          )
        })}

        <text x="0" y="-30" className="compass__cardinal">
          N
        </text>
        <text x="30" y="3" className="compass__cardinal">
          E
        </text>
        <text x="0" y="33" className="compass__cardinal">
          S
        </text>
        <text x="-30" y="3" className="compass__cardinal">
          W
        </text>

        <g
          className="compass__needle"
          style={{ transform: `rotate(${rotation.toFixed(1)}deg)` }}
        >
          <polygon points="-2,8 2,8 0,28" className="compass__needle__tail" />
          <polygon points="-2,-8 2,-8 0,-30" className="compass__needle__point" />
          <circle cx="0" cy="0" r="2.4" className="compass__needle__pivot" />
        </g>
      </svg>
    </figure>
  )
}
