import type { HTMLAttributes } from 'react'

export type PulseVariant = 'live' | 'fallback'

export interface PulseProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PulseVariant
  /** Accessible label (e.g. "Live status"). When omitted, the dot is aria-hidden ornament. */
  label?: string
  className?: string
}

const VARIANT_CLASS: Record<PulseVariant, string> = {
  live: 'pulse',
  fallback: 'pulse pulse--fallback',
}

// Two stacked SVG rings — mark beats, halo radiates. Mirrors the hero
// cover-folio pin geometry so live-mark language is one visual system.
export function Pulse({ variant = 'live', label, className, ...rest }: PulseProps) {
  const composed = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ')
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }

  return (
    <span className={composed} {...a11y} {...rest}>
      <svg className="pulse__mark" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <svg className="pulse__halo" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  )
}
