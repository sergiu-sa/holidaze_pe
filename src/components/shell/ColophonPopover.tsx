import { Link } from 'react-router-dom'

import type { UseAtlasCitiesState } from '../../hooks/useAtlasCities'
import { Eyebrow } from '../ui/Eyebrow'

export type ColophonAtlasData = Pick<
  UseAtlasCitiesState,
  'cities' | 'totalVenues' | 'isFallback'
>

export interface ColophonPopoverProps {
  id: string
  triggerId: string
  open: boolean
  atlas: ColophonAtlasData
}

function countContinents(cities: ColophonAtlasData['cities']): number {
  const set = new Set<string>()
  for (const c of cities) if (c.continent) set.add(c.continent)
  return set.size
}

function dashIfZero(n: number): string {
  return n > 0 ? String(n) : '—'
}

export function ColophonPopover({ id, triggerId, open, atlas }: ColophonPopoverProps) {
  const continents = countContinents(atlas.cities)
  const featured = atlas.cities.slice(0, 3)
  const sourceLabel = atlas.isFallback ? 'Cached · curated fallback' : 'Live · just fetched'
  const featuredHeadingId = `${id}__featured-heading`

  return (
    <div
      className="colophon-pop"
      id={id}
      hidden={!open}
      role="region"
      aria-labelledby={triggerId}
      data-testid="colophon-popover"
    >
      <div className="colophon-pop__inner">
        <div className="colophon-pop__col">
          <Eyebrow num="§" label="Issue" />
          <p className="colophon-pop__head">
            N°04 · <em>Spring</em> 2026
          </p>
          <p className="colophon-pop__meta">{sourceLabel}</p>
        </div>

        <div className="colophon-pop__col">
          <Eyebrow num="§" label="The Atlas" />
          <p className="colophon-pop__stat">
            <strong>{dashIfZero(atlas.totalVenues)}</strong> venues indexed
          </p>
          <p className="colophon-pop__meta">
            {dashIfZero(atlas.cities.length)} cities · {dashIfZero(continents)} continents
          </p>
        </div>

        <div className="colophon-pop__col">
          <Eyebrow id={featuredHeadingId} num="§" label="This issue features" />
          {featured.length > 0 ? (
            <ul className="colophon-pop__feat" aria-labelledby={featuredHeadingId}>
              {featured.map((c, idx) => (
                <li key={`${c.city}-${String(idx)}`}>
                  <span className="num">N°{String(idx + 1).padStart(2, '0')}</span>
                  <span className="where">{c.city}</span>
                  <span className="count">{c.venues.length}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="colophon-pop__meta">No destinations yet</p>
          )}
        </div>

        <div className="colophon-pop__col colophon-pop__col--end">
          <Eyebrow num="§" label="Colophon" />
          <Link to="/hosts#contact" className="colophon-pop__link">
            Correspondence <span aria-hidden="true">→</span>
          </Link>
          <p className="colophon-pop__meta colophon-pop__meta--dim">
            Typography, palette, spatial law.
          </p>
        </div>
      </div>
    </div>
  )
}
