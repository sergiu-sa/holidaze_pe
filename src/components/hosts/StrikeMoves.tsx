export function StrikeMoves() {
  return (
    <section className="strike-wrap" aria-labelledby="strike-title">
      <header className="section-head">
        <span className="section-head__num">
          § 03·γ <em>Strike</em>
        </span>
        <h2 id="strike-title" className="section-head__title">
          Three moves, <em>one motion.</em>
        </h2>
        <p className="section-head__meta">
          Roughly ten minutes.
          <br />
          Sign-up to first listing.
        </p>
      </header>

      <div className="strike">
        <article className="move">
          <span className="move__digit">01</span>
          <p className="move__lbl">Sign up</p>
          <h3 className="move__title">
            <em>Register</em> as a host.
          </h3>
          <p className="move__body">
            Use your <code>stud.noroff.no</code> email. Tick the host box. No
            call, no questionnaire.
          </p>
          <span className="move__time">
            ~<em>2</em> min
          </span>
        </article>
        <article className="move move--dom">
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />
          <span className="move__digit">02</span>
          <p className="move__lbl">List</p>
          <h3 className="move__title">
            <em>Describe</em> your place.
          </h3>
          <p className="move__body">
            Name, price, max guests, a few photos, the amenities that matter.
            Edit anytime.
          </p>
          <span className="move__time">
            ~<em>8</em> min
          </span>
        </article>
        <article className="move">
          <span className="move__digit">03</span>
          <p className="move__lbl">Host</p>
          <h3 className="move__title">
            <em>Welcome</em> the guest.
          </h3>
          <p className="move__body">
            Bookings appear in your dashboard. You keep 100% of the rate. We
            stay out of the room.
          </p>
          <span className="move__time">
            <em>onwards</em>.
          </span>
        </article>
      </div>
    </section>
  )
}
