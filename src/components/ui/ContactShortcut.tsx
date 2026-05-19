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
}

export function ContactShortcut({
  to,
  eyebrow,
  label,
  arrow = '→',
}: ContactShortcutProps) {
  const eyebrowId = useId()
  return (
    <aside className="contact-shortcut" aria-labelledby={eyebrowId}>
      <span className="contact-shortcut__eyebrow" id={eyebrowId}>
        {eyebrow}
      </span>
      <Link className="contact-shortcut__link" to={to}>
        {label} <span aria-hidden="true">{arrow}</span>
      </Link>
    </aside>
  )
}
