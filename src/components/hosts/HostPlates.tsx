import { HOSTS_SPECIMENS, type HostSpecimen } from '../../lib/hosts/specimens'

const EUR = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 })

function PlateFigure({ specimen }: { specimen: HostSpecimen }) {
  const isLead = specimen.variant === 'lead'
  return (
    <figure className={`plate plate--${specimen.variant}`}>
      <span className="plate__num">
        N°{specimen.no}
        {isLead ? ' · LEAD' : ''}
      </span>
      <div className="plate__img">
        <img
          src={specimen.photoUrl}
          alt={specimen.photoAlt}
          loading="lazy"
          style={
            specimen.imageFocus ? { objectPosition: specimen.imageFocus } : undefined
          }
        />
      </div>
      <figcaption className="plate__cap">
        <span className="plate__cap-name">
          {specimen.name.first} <em>{specimen.name.last}</em>
        </span>
        <span className="plate__cap-where">{specimen.where}</span>
        <span className="plate__cap-amt">
          €<em>{EUR.format(specimen.keptEur)}</em>
          <small>kept · specimen</small>
        </span>
      </figcaption>
    </figure>
  )
}

export function HostPlates() {
  // Bento order interleaves a static pull-quote (after N°02) and a static
  // index stamp (after N°04) — same positions as the prototype's grid.
  const head = HOSTS_SPECIMENS.slice(0, 2)
  const middle = HOSTS_SPECIMENS.slice(2, 4)
  const tail = HOSTS_SPECIMENS.slice(4)

  return (
    <section className="plates-wrap" aria-labelledby="plates-title">
      <header className="section-head">
        <span className="section-head__num">
          § 03·α <em>Plates</em>
        </span>
        <h2 id="plates-title" className="section-head__title">
          Six faces, <em>six rates</em>
          <br />
          kept whole.
        </h2>
        <p className="section-head__meta">
          Indexed Spring 2026.
          <br />
          Figures attested by the host.
        </p>
      </header>

      <div className="plates">
        {head.map((s) => (
          <PlateFigure key={s.no} specimen={s} />
        ))}

        <aside className="plate-quote" aria-label="Pull quote">
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />
          <div>
            <div className="plate-quote__mark">&ldquo;</div>
            <p className="plate-quote__text">
              The first booking arrived. The whole rate{' '}
              <em>landed in my account.</em> No envelope, no haircut.
              <span aria-hidden="true">&rdquo;</span>
            </p>
          </div>
          <p className="plate-quote__attr">— Niamh O&rsquo;Hara · N°03</p>
        </aside>

        {middle.map((s) => (
          <PlateFigure key={s.no} specimen={s} />
        ))}

        <aside className="plate-stamp" aria-label="Index stamp">
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />
          <div className="plate-stamp__big">
            {String(HOSTS_SPECIMENS.length).padStart(2, '0')}
            <em>.</em>
          </div>
          <p className="plate-stamp__lbl">
            Hosts
            <br />
            indexed
            <br />
            Spring 2026
          </p>
        </aside>

        {tail.map((s) => (
          <PlateFigure key={s.no} specimen={s} />
        ))}
      </div>
    </section>
  )
}
