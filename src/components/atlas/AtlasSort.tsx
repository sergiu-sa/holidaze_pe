import { useId } from 'react'

import { ATLAS_SORT_LABELS, ATLAS_SORTS, type AtlasSort } from '../../lib/atlas/sortCities'

export interface AtlasSortProps {
  value: AtlasSort
  onChange: (next: AtlasSort) => void
}

export function AtlasSortSelect({ value, onChange }: AtlasSortProps) {
  const selectId = useId()
  return (
    <label htmlFor={selectId} className="atp__sort">
      <span className="atp__sort__label">Sort</span>
      <select
        id={selectId}
        className="atp__sort__select"
        value={value}
        onChange={(e) => {
          const next = e.target.value as AtlasSort
          onChange(next)
        }}
      >
        {ATLAS_SORTS.map((s) => (
          <option key={s} value={s}>
            {ATLAS_SORT_LABELS[s]}
          </option>
        ))}
      </select>
      <span className="atp__sort__chev" aria-hidden="true">
        ▾
      </span>
    </label>
  )
}
