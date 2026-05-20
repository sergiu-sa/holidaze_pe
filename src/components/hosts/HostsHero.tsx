export function HostsHero() {
  return (
    <section
      className="h2-hero"
      aria-label="On hosting — Holidaze takes zero commission. Ever."
    >
      <header className="h2-hero__head">
        <span className="eyebrow">
          <span className="eyebrow__num">§ 03</span>
          <span className="eyebrow__label">On Hosting · A Specimen</span>
        </span>
        <span className="h2-hero__rubric">
          <em>Holidaze takes</em> ↓
        </span>
      </header>

      <div className="h2-hero__stage">
        <span className="regmark regmark--tl" aria-hidden="true" />
        <span className="regmark regmark--tr" aria-hidden="true" />
        <span className="regmark regmark--bl" aria-hidden="true" />
        <span className="regmark regmark--br" aria-hidden="true" />

        <h1 className="h2-hero__num" data-route-anchor tabIndex={-1}>
          <span className="visually-hidden">Holidaze takes zero commission. </span>
          0<em>%</em>
        </h1>

        <div
          className="h2-hero__strike"
          aria-hidden="true"
          data-testid="hero-strike"
        >
          <span className="h2-hero__strike-text">commission</span>
          <span className="h2-hero__strike-line">
            <svg viewBox="0 0 200 12" preserveAspectRatio="none">
              <path d="M 1 7 Q 30 3, 60 6 T 120 5 T 199 7" />
            </svg>
          </span>
        </div>

        <div
          className="h2-hero__tick"
          aria-hidden="true"
          data-testid="hero-tick"
        >
          <svg viewBox="0 0 200 50" preserveAspectRatio="none">
            <path d="M 4 8 Q 20 18, 50 22 T 130 30" />
            <path d="M 130 30 L 122 26 M 130 30 L 124 36" />
            <text x="140" y="34">
              CHARTER · §03
            </text>
          </svg>
        </div>

        <span className="h2-hero__folio" aria-hidden="true">
          HOLIDAZE PRESS · N°<strong>04</strong> · SPRING 2026
        </span>

        <aside className="h2-hero__note" aria-label="What Holidaze takes">
          <span
            className="h2-hero__note-pin"
            aria-hidden="true"
            data-testid="hero-pin"
          >
            <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="11" fill="#2A2720" />
              <circle cx="14" cy="14" r="11" fill="none" stroke="#0F0E0B" strokeWidth="1" />
              <circle cx="11" cy="10" r="3" fill="#D4A130" opacity="0.5" />
            </svg>
          </span>
          <div className="h2-hero__note-body">
            <p className="h2-hero__note-line">
              None of your <strong>rate.</strong> <em>Ever.</em>
            </p>
          </div>
          <span
            className="h2-hero__note-crown"
            aria-hidden="true"
            data-testid="hero-crown"
          >
            <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 22 64 L 16 10 L 38 30 L 60 4 L 80 32 L 104 12 L 98 64 Q 60 70 22 64 Z"
                stroke="#0F0E0B"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </aside>
      </div>
    </section>
  )
}
