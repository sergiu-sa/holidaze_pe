import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { Icon, type IconName } from '../ui'

interface SidebarLink {
  to: string
  label: string
  icon: IconName
  end?: boolean
  /** Custom matcher overrides NavLink's default — useful when one route covers several sub-routes while a sibling stays exact-match. */
  match?: (pathname: string) => boolean
}

const customerLinks: SidebarLink[] = [
  { to: '/profile', label: 'Overview', icon: 'guest', end: true },
  { to: '/profile/bookings', label: 'My bookings', icon: 'ticket' },
  { to: '/profile/avatar', label: 'Avatar', icon: 'edit' },
]

const managerLinks: SidebarLink[] = [
  {
    to: '/profile/venues',
    label: 'My venues',
    icon: 'compass',
    // Active for every /profile/venues/* sub-route except the create page,
    // which has its own sidebar entry.
    match: (pathname) =>
      pathname.startsWith('/profile/venues') && pathname !== '/profile/venues/new',
  },
  { to: '/profile/venues/new', label: 'New venue', icon: 'plus', end: true },
]

export function ProfileSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const links = user.venueManager ? [...customerLinks, ...managerLinks] : customerLinks
  const initial = (user.name.charAt(0) || '?').toUpperCase()

  function onSignOut() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside className="profile__side" aria-label="Account navigation">
      <div className="profile__id">
        <span className="profile__regmark profile__regmark--tl" aria-hidden="true" />
        <span className="profile__regmark profile__regmark--tr" aria-hidden="true" />
        <span className="profile__regmark profile__regmark--bl" aria-hidden="true" />
        <span className="profile__regmark profile__regmark--br" aria-hidden="true" />
        <div className="profile__avatar" aria-hidden="true">
          {user.avatar?.url ? (
            <img src={user.avatar.url} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <p className="profile__name">{user.name}</p>
        <p className="profile__email mono">{user.email}</p>
        <span className={`profile__role ${user.venueManager ? 'profile__role--host' : ''}`}>
          {user.venueManager ? 'Host' : 'Guest'}
        </span>
      </div>

      <nav className="profile__menu" aria-label="Account">
        {links.map((link) => {
          if (link.match) {
            const isActive = link.match(location.pathname)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={isActive ? 'profile__link is-active' : 'profile__link'}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={link.icon} size="sm" />
                <span>{link.label}</span>
              </Link>
            )
          }
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'profile__link is-active' : 'profile__link')}
            >
              <Icon name={link.icon} size="sm" />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <button type="button" className="profile__logout" onClick={onSignOut}>
        <Icon name="logout" size="sm" />
        <span>Sign out</span>
      </button>
    </aside>
  )
}
