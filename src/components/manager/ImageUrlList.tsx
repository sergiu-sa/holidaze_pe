import type { Media } from '../../types/venue'
import { Field } from '../ui/Field'

export interface ImageUrlListProps {
  value: Media[]
  onChange: (next: Media[]) => void
  /** Per-row errors keyed by index, split by field. */
  errors?: {
    url?: Record<number, string | undefined>
    alt?: Record<number, string | undefined>
  }
  /** Top-level error (e.g. "At least one photo required"). */
  error?: string
}

const EMPTY_ROW: Media = { url: '', alt: '' }

export function ImageUrlList({ value, onChange, errors, error }: ImageUrlListProps) {
  const rows = value.length === 0 ? [EMPTY_ROW] : value

  function update(index: number, patch: Partial<Media>) {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    onChange(next)
  }

  function add() {
    onChange([...rows, { ...EMPTY_ROW }])
  }

  function remove(index: number) {
    if (rows.length <= 1) {
      onChange([{ ...EMPTY_ROW }])
      return
    }
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <div className="v-editor__media" role="group" aria-label="Photos">
      {rows.map((row, index) => (
        <div key={index} className="v-editor__media-row">
          <div className="v-editor__media-pair">
            <Field
              label={`Photo URL${index === 0 ? '' : ` ${String(index + 1)}`}`}
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://…"
              value={row.url}
              onChange={(event) => {
                update(index, { url: event.currentTarget.value })
              }}
              error={errors?.url?.[index]}
            />
            <Field
              label="Alt text"
              type="text"
              autoComplete="off"
              placeholder="A short description of the photo"
              hint="Describe the photo for screen readers"
              value={row.alt}
              onChange={(event) => {
                update(index, { alt: event.currentTarget.value })
              }}
              error={errors?.alt?.[index]}
            />
          </div>
          <button
            type="button"
            className="rec__btn"
            onClick={() => {
              remove(index)
            }}
            aria-label={`Remove photo ${String(index + 1)}`}
            disabled={rows.length === 1 && !row.url && !row.alt}
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" className="rec__btn" onClick={add}>
        + Add another photo
      </button>

      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
