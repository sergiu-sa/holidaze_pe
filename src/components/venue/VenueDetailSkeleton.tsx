// Page-shaped loading placeholder. The layout matches the live page so the
// content swap doesn't shift anything when the venue resolves.

export function VenueDetailSkeleton() {
  return (
    <main id="main" className="v-mag" aria-busy="true" aria-label="Loading venue">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>Home</li>
          <li>Venues</li>
          <li>
            <span aria-current="page">Loading…</span>
          </li>
        </ol>
      </nav>

      <section
        className="v-hero"
        aria-hidden="true"
        style={{ background: 'var(--bone-deep)' }}
      />

      <header className="v-title" aria-hidden="true">
        <span className="regmark regmark--tl" />
        <span className="regmark regmark--tr" />
        <span className="regmark regmark--bl" />
        <span className="regmark regmark--br" />
        <h1 className="v-title__name">Loading…</h1>
        <p className="v-title__deck">Fetching the spread.</p>
      </header>
    </main>
  )
}
