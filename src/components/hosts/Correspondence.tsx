import markUrl from '../../assets/logo/holidaze-mark.svg'

export function Correspondence() {
  return (
    <section className="post-wrap" id="contact" aria-labelledby="post-title">
      <header className="section-head">
        <span className="section-head__num">
          § 03·δ <em>Correspondence</em>
        </span>
        <h2 id="post-title" className="section-head__title">
          A letter, <em>a reply.</em>
        </h2>
        <p className="section-head__meta">
          Atlas Press · Oslo.
          <br />
          Letters answered by the editor.
        </p>
      </header>

      <div className="post">
        <div className="post__plate">
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />
          <span className="post__plate-tag">Fig. 02 · Plate 13 · N°04</span>
          <span className="post__plate-no">
            How to reach <em>us</em>
          </span>

          <div className="post__grid">
            <ul className="post__desks">
              <li className="desk">
                <span className="desk__lbl">— Editorial Desk —</span>
                <p className="desk__name">
                  For the <em>editor.</em>
                </p>
                <a className="desk__mail" href="mailto:editor@holidaze.press">
                  editor@holidaze.press
                </a>
                <span className="desk__hours">
                  Reply within <em>48h</em> · signed oltenkS
                </span>
              </li>
              <li className="desk desk--dom">
                <span className="desk__lbl">— Hosts Desk —</span>
                <p className="desk__name">
                  For <em>prospective hosts.</em>
                </p>
                <a className="desk__mail" href="mailto:hosts@holidaze.press">
                  hosts@holidaze.press
                </a>
                <span className="desk__hours">
                  Reply within <em>24h</em> · charter inquiries
                </span>
              </li>
              <li className="desk">
                <span className="desk__lbl">— Lost Coordinates —</span>
                <p className="desk__name">
                  For <em>guests in trouble.</em>
                </p>
                <a
                  className="desk__mail"
                  href="mailto:coordinates@holidaze.press"
                >
                  coordinates@holidaze.press
                </a>
                <span className="desk__hours">
                  Reply <em>same day</em> · 09–17 CET
                </span>
              </li>
            </ul>

            <aside className="post__postal" aria-label="Postal address">
              <figure className="post__stamp" aria-hidden="true">
                <span className="post__stamp-cap">Holidaze · Press</span>
                <span className="post__stamp-mark">
                  <img src={markUrl} alt="" />
                </span>
                <span className="post__stamp-foot">N°04 · MMXXVI</span>
                <span className="post__stamp-postmark">
                  <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.6"
                    />
                    <text x="30" y="26" textAnchor="middle">
                      OSLO
                    </text>
                    <line
                      x1="14"
                      y1="30"
                      x2="46"
                      y2="30"
                      stroke="currentColor"
                      strokeWidth="0.6"
                    />
                    <text x="30" y="40" textAnchor="middle">
                      MMXXVI
                    </text>
                  </svg>
                </span>
              </figure>
              <div className="post__addr">
                <span className="post__addr-lbl">Postal address</span>
                <p className="post__addr-line">
                  Holidaze <em>Press</em>
                  <br />
                  c/o Atlas House
                  <br />
                  Karl Johans gate, N°04
                  <br />
                  0154 Oslo · Norway
                </p>
                <span className="post__addr-hours">
                  Office · Mon–Fri · <em>09–17</em> CET
                </span>
              </div>
            </aside>
          </div>
        </div>

        <p className="post__cap">
          <span>
            Fig. <em>02</em> — Three desks, one stamp. Letters answered by the
            editor in person.
          </span>
          <span>
            Plate <em>13</em> · Holidaze Press · Spring 2026
          </span>
        </p>
      </div>
    </section>
  )
}
