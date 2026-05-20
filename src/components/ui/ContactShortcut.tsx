import { useId } from 'react'
import { Link } from 'react-router-dom'

export interface ContactShortcutProps {
  /** Destination — typically '/hosts#contact'; can be '#contact' on the Hosts page itself. */
  to: string
  /** Mono eyebrow text (left side). */
  eyebrow: string
  /** Italic Fraunces link text (right side). */
  label: string
  /** Trailing arrow glyph. Default '→'. Use '↓' on /hosts where the link points down to a section on the same page. */
  arrow?: '→' | '↓'
  /** 'quiet' for page foot ornament; 'prominent' for in-flow stress moments. */
  variant?: 'quiet' | 'prominent'
}

export function ContactShortcut({
  to,
  eyebrow,
  label,
  arrow = '→',
  variant = 'quiet',
}: ContactShortcutProps) {
  const eyebrowId = useId()
  const className =
    variant === 'prominent'
      ? 'contact-shortcut contact-shortcut--prominent'
      : 'contact-shortcut'
  return (
    <aside className={className} aria-labelledby={eyebrowId}>
      <span className="contact-shortcut__eyebrow" id={eyebrowId}>
        {eyebrow}
      </span>
      <Link className="contact-shortcut__link" to={to}>
        {label} <span aria-hidden="true">{arrow}</span>
      </Link>
    </aside>
  )
}
