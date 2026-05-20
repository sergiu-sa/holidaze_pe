import { Link, useNavigate } from 'react-router-dom'

import wordmarkSvg from '../../assets/logo/holidaze-wordmark.svg'
import { useAuth } from '../../hooks/useAuth'
import { Pulse } from '../ui/Pulse'
import { useToast } from '../ui/ToastProvider'

export function Footer() {
  const year = new Date().getFullYear()
  const { state, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function handleSignOut() {
    logout()
    toast('Signed out.')
    navigate('/', { replace: true })
  }

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__col footer__col--brand">
          <p className="footer__mark">
            <Link to="/" aria-label="Holidaze home">
              <img
                className="wordmark__svg"
                src={wordmarkSvg}
                alt="Holidaze"
                width="1200"
                height="300"
              />
            </Link>
          </p>
          <p className="footer__tag">
            A curated atlas of places to stay. Booked direct.
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__h">Explore</h3>
          <ul className="footer__list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/venues">All venues</Link>
            </li>
            <li>
              <Link to="/hosts">Hosts</Link>
            </li>
            <li>
              <Link to="/atlas">Atlas</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col" data-footer-account-col>
          <h3 className="footer__h">Account</h3>
          <ul className="footer__list">
            {state.status === 'authenticated' ? (
              <>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <Link to="/profile/bookings">My bookings</Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="footer__signout"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Sign in</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/register?role=host">Become a host</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__h">Colophon</h3>
          <ul className="footer__list">
            <li>
              <span className="mono">Fraunces</span>
            </li>
            <li>
              <span className="mono">Bricolage Grotesque</span>
            </li>
            <li>
              <span className="mono">JetBrains Mono</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__rule" aria-hidden="true" />

      <div className="footer__foot">
        <p className="mono">
          © {year} Holidaze — N°04 · Spring {year}
        </p>
        <p className="mono">
          <Pulse />
          Built against Noroff v2 —{' '}
          <span className="footer__status">live</span>
        </p>
      </div>
    </footer>
  )
}
