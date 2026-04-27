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

// Pulse — square live-status dot. Renders as a square because the global
// border-radius reset overrides .pulse's `border-radius: 50%` (brand rule).
export function Pulse({ variant = 'live', label, className, ...rest }: PulseProps) {
  const composed = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ')
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }

  return <span className={composed} {...a11y} {...rest} />
}
