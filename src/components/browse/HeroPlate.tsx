import heroFallbackUrl from '../../assets/hero/hero-home.png'

export interface HeroPlateProps {
  tag?: string
}

const HERO_ALT = 'A whitewashed cliffside house above the Mediterranean'
const HERO_COORDS = '41.38° N / 2.17° E'
const HERO_LOCATION = 'Costa Brava, ES'

// Static cover — Noroff dataset is too unreliable to drive the masthead.
// Live API data shows in the bento + stats below.
export function HeroPlate({ tag = 'Cover · N°04' }: HeroPlateProps) {
  return (
    <figure className="hero__plate">
      <span className="hero__plate__tag">{tag}</span>
      <img
        className="hero__img"
        src={heroFallbackUrl}
        alt={HERO_ALT}
        loading="eager"
        // React 18 expects lowercase `fetchpriority` — spread the literal.
        {...{ fetchpriority: 'high' }}
      />
      <figcaption className="hero__caption">
        <span className="mono">{HERO_COORDS}</span>
        <span className="mono">{HERO_LOCATION}</span>
      </figcaption>
    </figure>
  )
}
