import type { HTMLAttributes, ReactNode } from 'react'

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Numbered prefix (rendered in cinnabar). */
  num?: ReactNode
  /** Label text after the leading hairline. */
  label?: ReactNode
  className?: string
}

// Eyebrow — editorial section eyebrow with optional cinnabar number + hairline-prefixed label.
// Both slots are optional so it composes for "N°04" only, "BROWSE" only, or both together.
export function Eyebrow({ num, label, className, children, ...rest }: EyebrowProps) {
  const composed = ['eyebrow', className].filter(Boolean).join(' ')

  return (
    <span className={composed} {...rest}>
      {num != null && <span className="eyebrow__num">{num}</span>}
      {label != null && <span className="eyebrow__label">{label}</span>}
      {children}
    </span>
  )
}
