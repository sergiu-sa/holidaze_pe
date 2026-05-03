import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import wordmarkSvg from '../../assets/logo/holidaze-wordmark.svg'
import { useAuth } from '../../hooks/useAuth'
import { AvatarMenu } from '../nav/AvatarMenu'
import { NavToggle } from '../nav/NavToggle'
import { PrimaryNav } from '../nav/PrimaryNav'
import { SignedOutLinks } from '../nav/SignedOutLinks'
import { Ruler } from './Ruler'

export function Topbar() {
  const [navOpen, setNavOpen] = useState(false)
  const { state } = useAuth()

  const handleNavToggle = useCallback(() => {
    setNavOpen((prev) => !prev)
  }, [])

  const handleNavLinkClick = useCallback(() => {
    setNavOpen(false)
  }, [])

  const year = String(new Date().getFullYear())

  return (
    <header className="topbar" role="banner">
      <div className="topbar__inner">
        <Link to="/" className="wordmark" aria-label="Holidaze home">
          <img
            className="wordmark__svg"
            src={wordmarkSvg}
            alt="Holidaze"
            width="1200"
            height="300"
          />
        </Link>

        <PrimaryNav isOpen={navOpen} onLinkClick={handleNavLinkClick} />

        <div className="topbar__account">
          <div data-auth-slot>
            {state.status === 'loading' ? null : state.status === 'anonymous' ? (
              <SignedOutLinks onLinkClick={handleNavLinkClick} />
            ) : (
              <AvatarMenu />
            )}
          </div>

          <NavToggle isOpen={navOpen} onToggle={handleNavToggle} />
        </div>
      </div>

      <Ruler
        left={`ISSUE N°04 · SPRING · ${year}`}
        right="— venues indexed"
      />
    </header>
  )
}
