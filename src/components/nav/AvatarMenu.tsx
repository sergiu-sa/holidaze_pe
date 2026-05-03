import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../ui/ToastProvider'

export function AvatarMenu() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

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
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => {
      popRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
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
        aria-haspopup="menu"
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
        role="menu"
        className="avatar-menu__pop"
        hidden={!open}
      >
        <header className="avatar-menu__header">
          <p className="avatar-menu__rubric">§ Signed in</p>
          <p className="avatar-menu__name">{user.name}</p>
          <p className="avatar-menu__email mono">{user.email}</p>
          <span className={`avatar-menu__role-chip avatar-menu__role-chip--${role}`}>
            {user.venueManager ? 'Host' : 'Guest'}
          </span>
        </header>

        <hr className="avatar-menu__rule" aria-hidden="true" />

        <Link role="menuitem" to="/profile" onClick={close}>
          Profile
        </Link>
        <Link role="menuitem" to="/profile/bookings" onClick={close}>
          My bookings
        </Link>
        {user.venueManager && (
          <Link role="menuitem" to="/profile/venues" onClick={close}>
            My venues
          </Link>
        )}
        <Link role="menuitem" to="/profile/avatar" onClick={close}>
          Avatar
        </Link>

        <hr className="avatar-menu__rule" aria-hidden="true" />

        <button role="menuitem" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
