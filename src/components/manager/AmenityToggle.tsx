import { type ChangeEvent, useId } from 'react'

import type { VenueMeta } from '../../types/venue'

export interface AmenityToggleProps {
  value: VenueMeta
  onChange: (next: VenueMeta) => void
  /** Visible label above the grid. */
  label?: string
}

const AMENITIES: { key: keyof VenueMeta; label: string }[] = [
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'parking', label: 'Parking' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'pets', label: 'Pets OK' },
]

export function AmenityToggle({ value, onChange, label = 'Amenities' }: AmenityToggleProps) {
  const groupId = useId()

  function handleChange(key: keyof VenueMeta, event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, [key]: event.currentTarget.checked })
  }

  return (
    <div role="group" aria-labelledby={groupId}>
      <p id={groupId} className="field__label v-editor__group-label">
        {label}
      </p>
      <div className="v-editor__meta-grid">
        {AMENITIES.map(({ key, label: optionLabel }) => (
          <label key={key}>
            <input
              type="checkbox"
              name={key}
              checked={value[key]}
              onChange={(event) => {
                handleChange(key, event)
              }}
            />
            {optionLabel}
          </label>
        ))}
      </div>
    </div>
  )
}
