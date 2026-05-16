import { isValidElement, type ReactNode } from 'react'

export interface RulerProps {
  left?: ReactNode
  right?: ReactNode
  ariaHidden?: boolean
}

function metaSlot(node: ReactNode, className: string): ReactNode {
  if (isValidElement(node)) return node
  return <span className={className}>{node}</span>
}

// String slots are wrapped in `.ruler__meta`; React elements (e.g. the
// colophon chip button) pass through unwrapped so the caller owns semantics.
export function Ruler({ left, right, ariaHidden = false }: RulerProps) {
  return (
    <div className="ruler" aria-hidden={ariaHidden ? true : undefined}>
      {left != null ? metaSlot(left, 'ruler__meta') : <span aria-hidden="true" />}
      <span className="ruler__ticks" aria-hidden="true">
        <span className="ruler__tick-cursor" />
      </span>
      {right != null ? (
        metaSlot(right, 'ruler__meta ruler__meta--right')
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  )
}
