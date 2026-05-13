import type { HeroCover } from '../../lib/hero/covers'
import { pickHeroCover } from '../../lib/hero/covers'

export interface HeroPlateProps {
  /** Optional cover override — defaults to the page-load rotation pick. */
  cover?: HeroCover
  tag?: string
}

// Cover photo for the issue. The same image feeds the Act 2 backdrop, so
// passing `cover` from the same source keeps plate and page in sync.
export function HeroPlate({ cover, tag = 'Cover · N°04' }: HeroPlateProps) {
  const c = cover ?? pickHeroCover()
  return (
    <figure className="hero__plate">
      <span className="hero__plate__tag">{tag}</span>
      <img
        className="hero__img"
        src={c.src}
        alt={c.alt}
        loading="eager"
        // React 18 expects lowercase `fetchpriority` — spread the literal.
        {...{ fetchpriority: 'high' }}
      />
      <figcaption className="hero__caption">
        <span className="mono">{c.coords}</span>
        <span className="mono">{c.place}</span>
      </figcaption>
    </figure>
  )
}
