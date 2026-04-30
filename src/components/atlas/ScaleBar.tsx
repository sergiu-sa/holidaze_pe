// Typographic scale bar — bottom-right of the plate. Static at world scale.
// Pure decoration that says "this is a real cartographic surface."

const SEGMENTS = ['0', '1000', '2500'] as const

export function ScaleBar() {
  return (
    <div className="atp__scale" aria-hidden="true">
      <div className="atp__scale__rule">
        {SEGMENTS.map((s, i) => (
          <span
            key={s}
            className={`atp__scale__tick ${i === 0 ? 'atp__scale__tick--start' : ''}`}
          />
        ))}
      </div>
      <div className="atp__scale__labels">
        {SEGMENTS.map((s) => (
          <span key={s} className="atp__scale__label">
            {s}
          </span>
        ))}
        <span className="atp__scale__unit">km</span>
      </div>
    </div>
  )
}
