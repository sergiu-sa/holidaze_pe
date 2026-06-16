import { type FormEvent } from 'react'

import type { CityOption } from '../../lib/atlas/sortByLongitude'
import { Icon } from '../ui/Icon'

export interface HeroSearchFormProps {
  destination: string
  onDestinationChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  dateTo: string
  onDateToChange: (value: string) => void
  guests: number
  onGuestsChange: (n: number) => void
  cityOptions: CityOption[]
  todayISO: string
  minDepart: string
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function HeroSearchForm({
  destination,
  onDestinationChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  guests,
  onGuestsChange,
  cityOptions,
  todayISO,
  minDepart,
  onSubmit,
}: HeroSearchFormProps) {
  return (
    <div className="search-wrap">
      <div className="search-wrap__head">
        <span className="search-wrap__label">Find a stay</span>
        <span className="search-wrap__step" aria-live="polite">
          — places in the atlas
        </span>
      </div>
      <form className="search" role="search" aria-label="Find a venue" onSubmit={onSubmit}>
        <span className="search__prose">I&apos;m looking to stay in</span>
        <label className="search__field" htmlFor="search-destination">
          <span className="search__pictogram" aria-hidden="true">
            <Icon name="pin" size="sm" />
          </span>
          <span className="visually-hidden">Destination</span>
          <input
            id="search-destination"
            type="text"
            name="destination"
            list="search-cities"
            placeholder="a quiet village"
            autoComplete="off"
            value={destination}
            onChange={(e) => {
              onDestinationChange(e.target.value)
            }}
          />
        </label>
        <datalist id="search-cities">
          {cityOptions.map(({ city, country }) => (
            <option key={city} value={city}>
              {country ? `${city}, ${country}` : city}
            </option>
          ))}
        </datalist>
        <span className="search__prose">from</span>
        <label className="search__field search__field--date" htmlFor="search-from">
          <span className="search__pictogram" aria-hidden="true">
            <Icon name="calendar" size="sm" />
          </span>
          <span className="visually-hidden">Arrive</span>
          <input
            id="search-from"
            type="date"
            name="from"
            min={todayISO}
            value={dateFrom}
            onChange={onDateFromChange}
          />
        </label>
        <span className="search__prose">to</span>
        <label className="search__field search__field--date" htmlFor="search-to">
          <span className="search__pictogram" aria-hidden="true">
            <Icon name="calendar" size="sm" />
          </span>
          <span className="visually-hidden">Depart</span>
          <input
            id="search-to"
            type="date"
            name="to"
            min={minDepart}
            value={dateTo}
            onChange={(e) => {
              onDateToChange(e.target.value)
            }}
          />
        </label>
        <span className="search__prose">, for</span>
        <label className="search__field search__field--short" htmlFor="search-guests">
          <span className="search__pictogram" aria-hidden="true">
            <Icon name="guests" size="sm" />
          </span>
          <span className="visually-hidden">Guests</span>
          <input
            id="search-guests"
            type="number"
            name="guests"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => {
              onGuestsChange(Number(e.target.value))
            }}
          />
        </label>
        <span className="search__prose">guests.</span>
        <button type="submit" className="search__submit">
          <Icon name="search" size="sm" />
          <span>Inquire</span>
          <Icon name="arrow-right" size="sm" />
        </button>
      </form>
    </div>
  )
}
