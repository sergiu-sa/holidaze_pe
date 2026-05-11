export function BookingAnatomy() {
  return (
    <section className="anatomy-wrap" aria-labelledby="anat-title">
      <header className="section-head">
        <span className="section-head__num">
          § 03·β <em>Anatomy</em>
        </span>
        <h2 id="anat-title" className="section-head__title">
          Anatomy of a <em>booking.</em>
        </h2>
        <p className="section-head__meta">
          A diagram, drawn to scale.
          <br />
          Atlas Press · plate 12.
        </p>
      </header>

      <div className="anatomy">
        <div className="anatomy__plate">
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />
          <span className="anatomy__plate-tag">Fig. 01 · Plate 12 · N°04</span>
          <span className="anatomy__plate-no">
            Anatomy of <em>a booking</em>
          </span>

          <div className="anatomy__svg-wrap">
            <svg
              viewBox="0 0 1100 540"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Diagram of a booking. The Guest pays €240 directly. The Venue is Casa Lluna in Costa Brava. The Host receives €240 and keeps 100%. Holidaze takes 0% commission and is funded by a flat €49/year subscription, invisible to guests."
            >
              <text x="550" y="44" className="lbl-tiny" textAnchor="middle">
                — HOLIDAZE TAKES —
              </text>
              <text x="550" y="142" className="lbl-zero" textAnchor="middle">
                0<tspan>%</tspan>
              </text>
              <text x="550" y="172" className="lbl-tiny" textAnchor="middle">
                NO COMMISSION · NO TOLL · NO TIER
              </text>
              <line className="stroke" x1="350" y1="194" x2="750" y2="194" />
              <line className="stroke stroke--mute" x1="550" y1="194" x2="550" y2="232" />

              <text x="170" y="226" className="lbl-coord" textAnchor="middle">
                A<tspan className="deg">°</tspan> · THE GUEST
              </text>
              <circle className="stroke stroke--strong" cx="170" cy="288" r="22" />
              <path
                className="stroke stroke--strong"
                d="M 170 310 L 170 396 M 142 340 L 198 340 M 144 444 L 170 396 L 196 444"
              />
              <rect className="case-glyph" x="206" y="346" width="32" height="26" />
              <line className="case-glyph" x1="214" y1="346" x2="214" y2="340" />
              <line className="case-glyph" x1="230" y1="346" x2="230" y2="340" />
              <line className="case-glyph" x1="214" y1="340" x2="230" y2="340" />
              <line className="stroke" x1="198" y1="344" x2="206" y2="344" />
              <text x="170" y="478" className="lbl-name" textAnchor="middle">
                The <tspan>Guest</tspan>
              </text>
              <line className="stroke" x1="128" y1="492" x2="212" y2="492" />
              <text x="170" y="510" textAnchor="middle">
                PAYS €240 · DIRECT
              </text>
              <text x="170" y="528" className="lbl-tiny" textAnchor="middle">
                CARD · BANK · CASH
              </text>

              <text x="550" y="226" className="lbl-coord" textAnchor="middle">
                B<tspan className="deg">°</tspan> · THE VENUE
              </text>
              <rect className="stroke stroke--strong" x="400" y="246" width="300" height="240" />
              <rect className="venue-stamp" x="400" y="246" width="108" height="26" />
              <text x="454" y="263" className="venue-stamp-lbl" textAnchor="middle">
                PLATE · B°
              </text>
              <text x="690" y="263" className="lbl-tiny" textAnchor="end">
                N°12
              </text>
              <text x="550" y="334" className="lbl-name lbl-name--xl" textAnchor="middle">
                Casa <tspan>Lluna</tspan>
              </text>
              <line className="stroke" x1="448" y1="354" x2="652" y2="354" />
              <text x="550" y="378" className="lbl-coord" textAnchor="middle">
                41.38<tspan className="deg">°</tspan> N · 2.17<tspan className="deg">°</tspan> E
              </text>
              <text x="550" y="404" textAnchor="middle">
                €240 / NIGHT · COSTA BRAVA
              </text>
              <line className="stroke" x1="498" y1="442" x2="602" y2="442" />
              <text x="550" y="460" className="lbl-tiny" textAnchor="middle">
                THE BOOKING
              </text>
              <text x="550" y="476" className="lbl-tiny" textAnchor="middle">
                NIGHTS · GUESTS · DATES
              </text>

              <text x="930" y="226" className="lbl-coord" textAnchor="middle">
                C<tspan className="deg">°</tspan> · THE HOST
              </text>
              <circle className="stroke stroke--strong" cx="930" cy="288" r="22" />
              <path
                className="stroke stroke--strong"
                d="M 930 310 L 930 396 M 902 340 L 958 340 M 904 444 L 930 396 L 956 444"
              />
              <g className="key-glyph">
                <circle cx="996" cy="340" r="9" />
                <line x1="987" y1="340" x2="958" y2="340" />
                <line x1="966" y1="340" x2="966" y2="352" />
                <line x1="976" y1="340" x2="976" y2="348" />
              </g>
              <text x="930" y="478" className="lbl-name" textAnchor="middle">
                The <tspan>Host</tspan>
              </text>
              <line className="stroke" x1="888" y1="492" x2="972" y2="492" />
              <text x="930" y="510" textAnchor="middle">
                RECEIVES €240 · KEEPS 100%
              </text>
              <text x="930" y="528" className="lbl-tiny" textAnchor="middle">
                PERSON WITH THE KEYS
              </text>

              <line className="stroke stroke--accent" x1="244" y1="288" x2="395" y2="288" />
              <polyline className="stroke stroke--accent" points="385,278 397,288 385,298" />
              <text x="319" y="274" className="lbl-amt" textAnchor="middle">
                €240 <tspan>booking</tspan>
              </text>
              <text x="319" y="312" className="lbl-route" textAnchor="middle">
                — 1 · PAYMENT —
              </text>

              <line
                className="stroke stroke--accent"
                style={{ strokeWidth: 2.6 }}
                x1="705"
                y1="288"
                x2="908"
                y2="288"
              />
              <polyline
                className="stroke stroke--accent"
                style={{ strokeWidth: 2.6 }}
                points="898,278 910,288 898,298"
              />
              <line className="stroke stroke--accent" x1="800" y1="282" x2="814" y2="282" />
              <line className="stroke stroke--accent" x1="800" y1="294" x2="814" y2="294" />
              <text x="807" y="274" className="lbl-amt" textAnchor="middle">
                €240 <tspan>kept</tspan>
              </text>
              <text x="807" y="312" className="lbl-route" textAnchor="middle">
                — 2 · 100% —
              </text>
            </svg>
          </div>
        </div>

        <div className="anatomy__cap">
          <span>
            Fig. <em>01</em> — €240 enters at A°, €240 leaves at C°. Holidaze
            runs on a flat <em>€49/yr</em> host subscription, invisible to
            guests.
          </span>
          <span>
            Plate <em>12</em> · Holidaze Press · Spring 2026
          </span>
        </div>
      </div>
    </section>
  )
}
