import { NavLink } from 'react-router-dom'

export interface PrimaryNavProps {
  isOpen: boolean
  onLinkClick: () => void
}

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/venues', label: 'Venues', end: false },
  { to: '/atlas', label: 'Atlas', end: false },
  { to: '/hosts', label: 'Hosts', end: false },
] as const

// PrimaryNav — horizontal/collapsible nav. NavLink emits aria-current="page" on
// the active route; the cinnabar underline is styled off that selector in global.css.
export function PrimaryNav({ isOpen, onLinkClick }: PrimaryNavProps) {
  return (
    <nav
      id="primary-nav"
      aria-label="Primary"
      className={`nav${isOpen ? ' is-open' : ''}`}
    >
      {NAV_LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="nav__link"
          aria-current={undefined}
          onClick={onLinkClick}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
