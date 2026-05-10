import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { type CreateVenueInput, CreateVenueInputSchema } from '../../api/schemas'
import type { Media, Venue, VenueMeta } from '../../types/venue'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { AmenityToggle } from './AmenityToggle'
import { ImageUrlList } from './ImageUrlList'

export type VenueFormMode = 'create' | 'edit'

interface FieldErrors {
  name?: string
  description?: string
  price?: string
  maxGuests?: string
  city?: string
  country?: string
  continent?: string
  address?: string
  media?: string
  mediaRows?: {
    url?: Record<number, string | undefined>
    alt?: Record<number, string | undefined>
  }
  form?: string
}

export interface VenueFormProps {
  mode: VenueFormMode
  /** Existing venue; consumed only in edit mode. */
  initial?: Venue | null
  /** Receives the validated, schema-strict payload. Throw to surface a banner. */
  onSubmit: (input: CreateVenueInput) => Promise<void>
  /** Edit-only destructive action. When present, renders a Delete button. */
  onDelete?: () => Promise<void> | void
}

const DEFAULT_META: VenueMeta = {
  wifi: false,
  parking: false,
  breakfast: false,
  pets: false,
}

function metaFrom(venue: Venue | null | undefined): VenueMeta {
  return venue?.meta ?? DEFAULT_META
}

function mediaFrom(venue: Venue | null | undefined): Media[] {
  if (!venue || venue.media.length === 0) return []
  return venue.media.map((m) => ({ url: m.url, alt: m.alt }))
}

function nullableStringFrom(value: string | null | undefined): string {
  return value ?? ''
}

function asNullableString(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

// Strip empty media rows; treat blank URL+alt as "remove".
function compactMedia(media: Media[]): Media[] {
  return media
    .map((row) => ({ url: row.url.trim(), alt: row.alt.trim() }))
    .filter((row) => row.url.length > 0)
}

export function VenueForm({
  mode,
  initial = null,
  onSubmit,
  onDelete,
}: VenueFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(
    initial?.price !== undefined ? String(initial.price) : '',
  )
  const [maxGuests, setMaxGuests] = useState(
    initial?.maxGuests !== undefined ? String(initial.maxGuests) : '2',
  )
  const [city, setCity] = useState(nullableStringFrom(initial?.location.city))
  const [country, setCountry] = useState(nullableStringFrom(initial?.location.country))
  const [continent, setContinent] = useState(nullableStringFrom(initial?.location.continent))
  const [address, setAddress] = useState(nullableStringFrom(initial?.location.address))
  const [media, setMedia] = useState<Media[]>(mediaFrom(initial))
  const [meta, setMeta] = useState<VenueMeta>(metaFrom(initial))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    const priceNum = price === '' ? Number.NaN : Number(price)
    const guestsNum = maxGuests === '' ? Number.NaN : Number(maxGuests)
    const cleanedMedia = compactMedia(media)

    const altErrors: Record<number, string> = {}
    media.forEach((row, i) => {
      if (row.url.trim() && !row.alt.trim()) {
        altErrors[i] = 'Describe the photo for screen readers'
      }
    })
    if (Object.keys(altErrors).length > 0) {
      setErrors({ mediaRows: { alt: altErrors } })
      return
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      media: cleanedMedia,
      price: priceNum,
      maxGuests: guestsNum,
      meta,
      location: {
        address: asNullableString(address),
        city: asNullableString(city),
        zip: null,
        country: asNullableString(country),
        continent: asNullableString(continent),
        lat: null,
        lng: null,
      },
    }

    const parsed = CreateVenueInputSchema.safeParse(payload)
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error)
      setErrors({
        name: tree.properties?.name?.errors[0],
        description: tree.properties?.description?.errors[0],
        price: tree.properties?.price?.errors[0] ?? errorIfNaN(priceNum, 'Required'),
        maxGuests:
          tree.properties?.maxGuests?.errors[0] ?? errorIfNaN(guestsNum, 'Required'),
        media: tree.properties?.media?.errors[0],
      })
      return
    }

    setPending(true)
    try {
      await onSubmit(parsed.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the venue'
      setErrors({ form: message })
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  const submitText = pending
    ? mode === 'create'
      ? 'Listing…'
      : 'Saving…'
    : mode === 'create'
      ? 'List place →'
      : 'Save changes →'

  return (
    <form
      className="v-editor"
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
      noValidate
    >
      <Field
        label="Name"
        type="text"
        autoComplete="off"
        required
        value={name}
        onChange={(event) => {
          setName(event.currentTarget.value)
        }}
        error={errors.name}
      />

      <Field label="Description" error={errors.description}>
        <textarea
          name="description"
          required
          value={description}
          onChange={(event) => {
            setDescription(event.currentTarget.value)
          }}
        />
      </Field>

      <div className="v-editor__row">
        <Field
          label="Price (€ / night)"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          required
          value={price}
          onChange={(event) => {
            setPrice(event.currentTarget.value)
          }}
          error={errors.price}
        />
        <Field
          label="Max guests"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          required
          value={maxGuests}
          onChange={(event) => {
            setMaxGuests(event.currentTarget.value)
          }}
          error={errors.maxGuests}
        />
      </div>

      <div className="v-editor__row">
        <Field
          label="City"
          type="text"
          autoComplete="address-level2"
          value={city}
          onChange={(event) => {
            setCity(event.currentTarget.value)
          }}
          error={errors.city}
        />
        <Field
          label="Country"
          type="text"
          autoComplete="country-name"
          value={country}
          onChange={(event) => {
            setCountry(event.currentTarget.value)
          }}
          error={errors.country}
        />
      </div>

      <div className="v-editor__row">
        <Field
          label="Continent"
          type="text"
          value={continent}
          onChange={(event) => {
            setContinent(event.currentTarget.value)
          }}
          error={errors.continent}
        />
        <Field
          label="Address (optional)"
          type="text"
          autoComplete="street-address"
          value={address}
          onChange={(event) => {
            setAddress(event.currentTarget.value)
          }}
          error={errors.address}
        />
      </div>

      <ImageUrlList
        value={media}
        onChange={setMedia}
        errors={errors.mediaRows}
        error={errors.media}
      />

      <AmenityToggle value={meta} onChange={setMeta} />

      {errors.form && (
        <p className="form-error" role="alert">
          {errors.form}
        </p>
      )}

      <div className="v-editor__actions">
        <Button type="submit" variant="primary" loading={pending}>
          {submitText}
        </Button>
        <Link to="/profile/venues" className="rec__btn">
          Cancel
        </Link>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            className="rec__btn rec__btn--danger v-editor__delete"
            onClick={() => {
              void handleDelete()
            }}
            disabled={deleting || pending}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </form>
  )
}

function errorIfNaN(value: number, message: string): string | undefined {
  return Number.isNaN(value) ? message : undefined
}
