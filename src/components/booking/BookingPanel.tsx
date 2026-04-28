import { useState } from 'react'

import type { UseDateRangeReturn } from '../../hooks/useDateRange'
import { formatDay } from '../../lib/dates'
import { formatPrice } from '../../lib/venue-format'
import type { Venue } from '../../types/venue'
import { Icon } from '../ui/Icon'

// Date inputs, guest stepper, total, CTA. The submit button is disabled until
// the booking endpoint is wired; the calendar selection still updates totals.

interface BookingPanelProps {
  venue: Venue
  range: UseDateRangeReturn
  /** When true, the sign-in nudge is suppressed. */
  isAuthenticated?: boolean
}

export function BookingPanel({ venue, range, isAuthenticated = false }: BookingPanelProps) {
  const maxGuests = venue.maxGuests || 1
  const [guests, setGuests] = useState(() => Math.min(2, maxGuests))
  const total = range.nights * (venue.price || 0)

  const fromValue = range.from ? formatDay(range.from) : ''
  const toValue = range.to ? formatDay(range.to) : ''

  function handleDateInput(which: 'from' | 'to', value: string) {
    if (!value) return
    // YYYY-MM-DD → local midnight, so the day matches the calendar's keys.
    const [y, m, d] = value.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (which === 'from') {
      range.selectDate(date)
    } else if (range.from) {
      range.selectDate(date)
    }
  }

  function clampGuests(n: number) {
    return Math.max(1, Math.min(maxGuests, n))
  }

  return (
    <section className="v-mag__book" aria-label="Book this venue">
      <div className="v-mag__book-frame">
        <form
          className="book"
          aria-labelledby="book-title"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />

          <h2 className="sr-only" id="book-title">
            Book this venue
          </h2>

          {!isAuthenticated ? (
            <aside className="guest-banner" role="note">
              <span className="guest-banner__mark">§ Guest</span>
              <p className="guest-banner__body">
                You&rsquo;re browsing without an account. Sign in or register to
                book.
              </p>
            </aside>
          ) : null}

          <p className="book__price">
            <strong>{formatPrice(venue.price)}</strong>
            <small>per night</small>
          </p>

          <div className="book__dates">
            <label>
              <span>Arrive</span>
              <input
                type="date"
                name="from"
                value={fromValue}
                min={formatDay(range.today)}
                onChange={(e) => { handleDateInput('from', e.target.value); }}
              />
            </label>
            <label>
              <span>Depart</span>
              <input
                type="date"
                name="to"
                value={toValue}
                min={fromValue || formatDay(range.today)}
                onChange={(e) => { handleDateInput('to', e.target.value); }}
              />
            </label>
          </div>

          <div className="book__guests" role="group" aria-labelledby="book-guests-lbl">
            <span id="book-guests-lbl">Guests</span>
            <div className="stepper">
              <button
                type="button"
                className="stepper__btn"
                onClick={() => { setGuests((n) => clampGuests(n - 1)); }}
                disabled={guests <= 1}
                aria-label="Decrease guests"
              >
                <Icon name="minus" size="xs" />
              </button>
              <input
                type="number"
                name="guests"
                min={1}
                max={maxGuests}
                value={guests}
                onChange={(e) => { setGuests(clampGuests(Number(e.target.value) || 1)); }}
                aria-describedby="book-guests-max"
              />
              <button
                type="button"
                className="stepper__btn"
                onClick={() => { setGuests((n) => clampGuests(n + 1)); }}
                disabled={guests >= maxGuests}
                aria-label="Increase guests"
              >
                <Icon name="plus" size="xs" />
              </button>
            </div>
            <span className="book__guests-max" id="book-guests-max">
              max {maxGuests}
            </span>
          </div>

          <p className="book__total">
            <span>
              {range.nights} night{range.nights === 1 ? '' : 's'}
            </span>
            <strong>{formatPrice(total)}</strong>
          </p>

          <button
            type="submit"
            className="book__cta"
            disabled
            aria-disabled="true"
            title="Booking is not yet available"
          >
            <span>Book now</span>
            <Icon name="arrow-right" size="sm" />
          </button>

          <p className="book__note" role="status" aria-live="polite">
            Direct with the host. No commission.
          </p>
        </form>

        <aside className="v-mag__book-pitch">
          <p className="eyebrow">
            <span className="eyebrow__num">§ 08</span>
            <span className="eyebrow__label">How it works</span>
          </p>
          <h3>
            No middle-man.
            <br />
            <em>No hidden fees.</em>
          </h3>
          <ol>
            <li>
              <span className="mono">01</span> Pick your dates above — booked nights
              are blocked.
            </li>
            <li>
              <span className="mono">02</span> Book direct. No commission, no
              padding.
            </li>
            <li>
              <span className="mono">03</span> The host replies in &lt; 12 hours.
            </li>
          </ol>
        </aside>
      </div>
    </section>
  )
}
