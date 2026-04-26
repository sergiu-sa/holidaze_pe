import { useCallback, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import wordmarkSvg from '../../assets/logo/holidaze-wordmark.svg'
import { NavToggle } from '../nav/NavToggle'
import { PrimaryNav } from '../nav/PrimaryNav'
import { Ruler } from './Ruler'

// Topbar — sticky editorial header (wordmark, nav, account slot, ruler).
export function Topbar() {
  const [navOpen, setNavOpen] = useState(false)

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
            <NavLink
              to="/login"
              className="account__link"
              onClick={handleNavLinkClick}
            >
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className="account__link account__link--cta"
              onClick={handleNavLinkClick}
            >
              Register<span aria-hidden="true"> →</span>
            </NavLink>
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
