import { ATLAS_SORT_LABELS, ATLAS_SORTS, type AtlasSort } from '../../lib/atlas/sortCities'

export interface ScopeRailProps {
  value: AtlasSort
  onChange: (next: AtlasSort) => void
  /** Hard reset — clears all atlas state (search, continent, city, sort). */
  onResetAll: () => void
  /** Whether any filter is currently active (drives the reset button's emphasis). */
  hasActiveFilter: boolean
}

// Vertical "scope rail" mirroring the sort dropdown; only renders at ≥1100px
// where the side margins exist. Always-visible at desktop so the user doesn't
// have to open a dropdown to re-sort.
export function ScopeRail({ value, onChange, onResetAll, hasActiveFilter }: ScopeRailProps) {
  return (
    <aside className="atp__rail" aria-label="Scope rail">
      <p className="atp__rail__head">
        <span className="atp__rail__num">N°09</span>
        <span className="atp__rail__rubric">SCOPE</span>
      </p>

      {/* Primary action — always visible. Doubles as a "filter refresh" when
          any filter is active; reads as a neutral "see all" otherwise. */}
      <button
        type="button"
        className={`atp__rail__all ${hasActiveFilter ? 'is-active' : ''}`}
        onClick={onResetAll}
        aria-label={
          hasActiveFilter
            ? 'Reset filters and show all venues'
            : 'Show all venues across the atlas'
        }
      >
        <span className="atp__rail__all__glyph" aria-hidden="true">
          ⟲
        </span>
        <span className="atp__rail__all__label">All venues</span>
        <span className="atp__rail__all__hint">
          {hasActiveFilter ? 'reset' : 'see everything'}
        </span>
      </button>

      <p className="atp__rail__sublabel">
        <span className="atp__rail__num">N°09·a</span>
        <span className="atp__rail__rubric">SORT</span>
      </p>
      <ul className="atp__rail__list">
        {ATLAS_SORTS.map((s) => {
          const active = s === value
          return (
            <li key={s}>
              <button
                type="button"
                className={`atp__rail__btn ${active ? 'is-active' : ''}`}
                onClick={() => {
                  onChange(s)
                }}
                aria-pressed={active}
              >
                <span className="atp__rail__label">{ATLAS_SORT_LABELS[s]}</span>
                <span className="atp__rail__rule" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
