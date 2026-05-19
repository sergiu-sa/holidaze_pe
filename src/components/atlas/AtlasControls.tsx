import type { Continent } from '../../lib/atlas/cityCoords'

const CONTINENT_ORDER: readonly (Continent | 'All')[] = [
  'All',
  'Europe',
  'Asia',
  'North America',
  'South America',
  'Africa',
  'Oceania',
]

const CONTINENT_LABEL: Record<Continent | 'All', string> = {
  All: 'All',
  Europe: 'Europe',
  Asia: 'Asia',
  'North America': 'N. America',
  'South America': 'S. America',
  Africa: 'Africa',
  Oceania: 'Oceania',
  Antarctica: 'Antarctica',
}

export interface AtlasControlsProps {
  search: string
  continent: Continent | 'All'
  /** Per-continent counts (after free-text search applied). */
  counts: Readonly<Record<string, number>>
  totalAfterSearch: number
  onSearchChange: (value: string) => void
  onContinentChange: (continent: Continent | 'All') => void
}

export function AtlasControls({
  search,
  continent,
  counts,
  totalAfterSearch,
  onSearchChange,
  onContinentChange,
}: AtlasControlsProps) {
  return (
    <div className="atp__controls">
      <label className="atp__search">
        <span className="visually-hidden">Search cities and countries</span>
        <input
          type="search"
          name="atlas-search"
          placeholder="Filter cities, countries…"
          autoComplete="off"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
          }}
        />
        {search ? (
          <button
            type="button"
            className="atp__search__clear"
            onClick={() => {
              onSearchChange('')
            }}
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : null}
      </label>

      <div className="atp__chips" aria-label="Filter by continent" role="group">
        {CONTINENT_ORDER.map((c) => {
          const count = c === 'All' ? totalAfterSearch : (counts[c] ?? 0)
          const enabled = c === 'All' || count > 0
          const active = continent === c
          const classes = ['atp__chip']
          if (active) classes.push('is-active')
          if (!enabled) classes.push('is-disabled')
          return (
            <button
              key={c}
              type="button"
              className={classes.join(' ')}
              aria-pressed={active}
              disabled={!enabled}
              onClick={() => {
                onContinentChange(c)
              }}
            >
              {CONTINENT_LABEL[c]}
              <span className="atp__chip__count">{String(count)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
