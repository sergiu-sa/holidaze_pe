import type { ReactNode } from 'react'

interface MarginaliaNoteProps {
  eyebrow: string
  children: ReactNode
}

/**
 * Bone-paper note pinned at -3.5° with a saffron pin SVG.
 * Uses the Caveat font for the italic line — sanctioned brand exception
 * scoped to marginalia ornament (recorded in docs/design-concept.md).
 */
export function MarginaliaNote({ eyebrow, children }: MarginaliaNoteProps) {
  return (
    <div className="auth-marginalia">
      <span className="auth-marginalia__pin" aria-hidden="true">
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="6" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="1" />
          <circle cx="9" cy="9" r="2" fill="var(--ink)" />
        </svg>
      </span>
      <span className="auth-marginalia__eyebrow">{eyebrow}</span>
      <p className="auth-marginalia__line">{children}</p>
    </div>
  )
}
