import { Link } from 'react-router-dom'

export function SignedOff() {
  return (
    <>
      <aside className="page-imprint" aria-label="Issue imprint">
        <span className="page-imprint__chip">
          HOLIDAZE PRESS · N°<strong>04</strong> · SPRING 2026 ·{' '}
          <em>End of specimen</em>
        </span>
      </aside>

      <section className="signed" aria-label="Sign-off">
        <p className="signed__line">
          Your place, your <strong>voice,</strong> your rate.
          <br />
          <Link to="/register?role=host">Apply for access</Link>
        </p>

        <div className="signed__block">
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />
          <div className="signed__sig">
            oltenk
            <span className="signed__sig-s">
              S
              <span className="signed__crown" aria-hidden="true">
                <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 22 64 L 16 10 L 38 30 L 60 4 L 80 32 L 104 12 L 98 64 Q 60 70 22 64 Z"
                    stroke="#0F0E0B"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>
          <div className="signed__rule">
            <em>oltenkS</em> · Sergiu Sarbu · Editor · Holidaze Press · Spring 2026
          </div>
        </div>
      </section>
    </>
  )
}
