import { Link } from 'react-router-dom'

import wordmarkSvg from '../../assets/logo/holidaze-wordmark.svg'

// Footer — 4-column editorial footer (brand · explore · account · colophon).
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
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
          <h4 className="footer__h">Explore</h4>
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
          <h4 className="footer__h">Account</h4>
          <ul className="footer__list">
            <li>
              <Link to="/login">Sign in</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/hosts">Become a host</Link>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__h">Colophon</h4>
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
          © {year} Holidaze — N°04, Spring {year}
        </p>
        <p className="mono">
          <span className="pulse" aria-hidden="true" />
          Built against Noroff v2 —{' '}
          <span className="footer__status">live</span>
        </p>
      </div>
    </footer>
  )
}
