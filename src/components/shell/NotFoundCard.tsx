import { Link } from 'react-router-dom'

import markUrl from '../../assets/logo/holidaze-mark.svg'

// Off-the-atlas panel shared by the 404 route and any in-page not-found state.

export interface NotFoundLink {
  to: string
  label: string
  primary?: boolean
}

export interface NotFoundCardProps {
  /** Slash-wrapped code shown above the title. Defaults to 404. */
  code?: string
  /** Wrap a phrase in <em> for italic-cinnabar emphasis. */
  title: React.ReactNode
  body: string
  links: NotFoundLink[]
}

export function NotFoundCard({
  code = '404',
  title,
  body,
  links,
}: NotFoundCardProps) {
  return (
    <section className="notfound" aria-labelledby="nf-title">
      <img className="notfound__mark" src={markUrl} alt="" aria-hidden="true" />
      <p className="notfound__code">
        <span className="slash">/</span>
        {code}
        <span className="slash">/</span>
      </p>
      <h1 className="notfound__title" id="nf-title" data-route-anchor tabIndex={-1}>
        {title}
      </h1>
      <p className="notfound__body mono">{body}</p>
      <div className="notfound__links">
        {links.map((link) => (
          <Link
            key={link.to + link.label}
            to={link.to}
            className={link.primary ? 'is-primary' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
