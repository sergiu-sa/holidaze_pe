// Ruler — hairline band with tick marks and left/right meta labels.
export interface RulerProps {
  left?: React.ReactNode
  right?: React.ReactNode
  ariaHidden?: boolean
}

export function Ruler({ left, right, ariaHidden = false }: RulerProps) {
  return (
    <div
      className="ruler"
      aria-hidden={ariaHidden ? true : undefined}
    >
      {left != null ? (
        <span className="ruler__meta">{left}</span>
      ) : (
        <span aria-hidden="true" />
      )}
      <span className="ruler__ticks" aria-hidden="true" />
      {right != null ? (
        <span className="ruler__meta ruler__meta--right">{right}</span>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  )
}
