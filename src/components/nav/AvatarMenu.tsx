import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { Icon } from '../ui/Icon'
import { useToast } from '../ui/ToastProvider'

export function AvatarMenu() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (
        !popRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      // Trap Tab inside the open menu so focus can't slip behind it.
      if (event.key === 'Tab' && popRef.current) {
        const focusable = popRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => {
      firstItemRef.current?.focus()
    })
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  const initial = user.name.charAt(0).toUpperCase()
  const avatarUrl = user.avatar?.url
  const showImage = Boolean(avatarUrl) && !imgFailed
  const role = user.venueManager ? 'host' : 'guest'

  function handleSignOut() {
    setOpen(false)
    logout()
    toast('Signed out.')
    navigate('/', { replace: true })
  }

  function close() {
    setOpen(false)
  }

  return (
    <div className="avatar-menu">
      <button
        ref={triggerRef}
        type="button"
        className="avatar-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="avatar-menu-pop"
        aria-label={`Account menu for ${user.name}`}
        onClick={() => {
          setOpen((o) => !o)
        }}
      >
        {showImage && avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            width={32}
            height={32}
            onError={() => {
              setImgFailed(true)
            }}
          />
        ) : (
          <span className="avatar-menu__initial" aria-hidden="true">
            {initial}
          </span>
        )}
      </button>

      <div
        id="avatar-menu-pop"
        ref={popRef}
        className="avatar-menu__pop"
        hidden={!open}
      >
        <div className="avatar-menu__header">
          <p className="avatar-menu__rubric">§ Signed in</p>
          <p className="avatar-menu__name">{user.name}</p>
          <p className="avatar-menu__email mono">{user.email}</p>
          <span className={`avatar-menu__role-chip avatar-menu__role-chip--${role}`}>
            {user.venueManager ? 'Host' : 'Guest'}
          </span>
        </div>

        <hr className="avatar-menu__rule" aria-hidden="true" />

        <nav aria-label="Account">
          <NavLink ref={firstItemRef} to="/profile" end onClick={close} className="avatar-menu__item">
            <Icon name="guest" size="sm" />
            <span>Profile</span>
          </NavLink>
          <NavLink to="/profile/bookings" onClick={close} className="avatar-menu__item">
            <Icon name="ticket" size="sm" />
            <span>My bookings</span>
          </NavLink>
          <NavLink to="/profile/avatar" onClick={close} className="avatar-menu__item">
            <Icon name="edit" size="sm" />
            <span>Avatar</span>
          </NavLink>
          {user.venueManager && (
            <>
              <NavLink to="/profile/venues" onClick={close} className="avatar-menu__item">
                <Icon name="compass" size="sm" />
                <span>My venues</span>
              </NavLink>
              <NavLink to="/profile/venues/new" end onClick={close} className="avatar-menu__item">
                <Icon name="plus" size="sm" />
                <span>New venue</span>
              </NavLink>
            </>
          )}
        </nav>

        <hr className="avatar-menu__rule" aria-hidden="true" />

        <button type="button" onClick={handleSignOut} className="avatar-menu__signout">
          <Icon name="logout" size="sm" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}
