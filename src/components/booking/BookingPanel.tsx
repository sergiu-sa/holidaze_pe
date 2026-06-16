import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useCreateBooking } from '../../hooks/useCreateBooking'
import { type UseDateRangeReturn } from '../../hooks/useDateRange'
import { buildBookedSet, formatDay, nightsBetween, rangeHasBooked } from '../../lib/dates'
import { formatPrice } from '../../lib/venue-format'
import { ApiError } from '../../types/api'
import { type Venue } from '../../types/venue'
import { Icon } from '../ui/Icon'
import { useToast } from '../ui/ToastProvider'
import { BookingGuestStepper } from './BookingGuestStepper'
import { BookingReview } from './BookingReview'

type PanelState =
  | { kind: 'pick' }
  | { kind: 'review'; from: Date; to: Date; guests: number }
  | { kind: 'confirm'; from: Date; to: Date; guests: number }
  | { kind: 'success'; bookingId: string }

interface BookingPanelProps {
  venue: Venue
  range: UseDateRangeReturn
  isAuthenticated?: boolean
  onRequestAuth?: (action: { from: string; to: string; guests: number }) => void
  onConflictRefetch?: () => void
}

const REDIRECT_DELAY_MS = 700

function pendingKey(venueId: string) {
  return `holidaze:pending:venue/${venueId}`
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function BookingPanel({
  venue,
  range,
  isAuthenticated = false,
  onRequestAuth,
  onConflictRefetch,
}: BookingPanelProps) {
  const maxGuests = venue.maxGuests || 1
  const [guests, setGuests] = useState(() => Math.min(2, maxGuests))
  const [state, setState] = useState<PanelState>({ kind: 'pick' })
  const [pickError, setPickError] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const { mutate, isPending, reset } = useCreateBooking(venue.id)
  const toast = useToast()
  const navigate = useNavigate()
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the review heading when the panel transitions into review;
  // without this, focus drops to <body> because the submit button unmounts.
  useEffect(() => {
    if (state.kind === 'review') {
      reviewHeadingRef.current?.focus()
    }
  }, [state.kind])

  const fromValue = range.from ? formatDay(range.from) : ''
  const toValue = range.to ? formatDay(range.to) : ''

  // One-shot read of the auth-bounce stash — always cleared after, so a
  // stale entry can't re-trigger on the next mount.
  useEffect(() => {
    if (!isAuthenticated) return
    const raw = sessionStorage.getItem(pendingKey(venue.id))
    if (!raw) return
    try {
      const stash = JSON.parse(raw) as { from?: string; to?: string; guests?: number }
      const from = stash.from ? new Date(stash.from) : null
      const to = stash.to ? new Date(stash.to) : null
      const stashedGuests = Number(stash.guests)
      const guestsLooksValid =
        Number.isInteger(stashedGuests) && stashedGuests >= 1

      const bookedSet = buildBookedSet(venue.bookings ?? [])
      const datesLooksValid =
        from !== null &&
        to !== null &&
        from >= startOfToday() &&
        from < to &&
        !rangeHasBooked(from, to, bookedSet)

      if (datesLooksValid && guestsLooksValid && stashedGuests <= maxGuests) {
        range.selectDate(from)
        range.selectDate(to)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read-back of an auth-bounce stash; advancing to review is the whole point of the effect.
        setGuests(stashedGuests)
        setState({ kind: 'review', from, to, guests: stashedGuests })
        toast('Welcome back — review your booking.', { kind: 'info' })
      } else {
        if (from) range.selectDate(from)
        if (from && to) range.selectDate(to)
        if (guestsLooksValid) {
          setGuests(Math.min(stashedGuests, maxGuests))
        }
        setPickError("Those nights aren't available anymore — pick again.")
      }
    } catch {
      /* corrupt JSON — silent */
    } finally {
      sessionStorage.removeItem(pendingKey(venue.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, venue.id])

  function handleDateInput(which: 'from' | 'to', value: string) {
    if (!value) return
    const [y, m, d] = value.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (which === 'from') {
      range.selectDate(date)
    } else if (range.from) {
      range.selectDate(date)
    }
  }

  function handlePickSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPickError(null)

    if (!range.from || !range.to || range.nights < 1) {
      setPickError('Pick an arrival and a departure date.')
      return
    }
    if (guests < 1 || guests > maxGuests) {
      setPickError(`Guests must be between 1 and ${String(maxGuests)}.`)
      return
    }
    const bookedSet = buildBookedSet(venue.bookings ?? [])
    if (rangeHasBooked(range.from, range.to, bookedSet)) {
      setPickError('Those nights are blocked — pick a different range.')
      return
    }

    if (!isAuthenticated) {
      onRequestAuth?.({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        guests,
      })
      return
    }

    setState({ kind: 'review', from: range.from, to: range.to, guests })
  }

  async function handleConfirm() {
    if (state.kind !== 'review') return
    setReviewError(null)
    setState({ kind: 'confirm', from: state.from, to: state.to, guests: state.guests })
    try {
      const booking = await mutate({
        dateFrom: state.from.toISOString(),
        dateTo: state.to.toISOString(),
        guests: state.guests,
        venueId: venue.id,
      })
      setState({ kind: 'success', bookingId: booking.id })
      toast('Booking confirmed.', { kind: 'success' })
      window.setTimeout(() => {
        navigate(`/bookings/${booking.id}`, { replace: true })
      }, REDIRECT_DELAY_MS)
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError(0, 'Network error')
      const status = apiErr.status

      let message = 'Something went wrong — try again.'
      if (status === 400) message = "That booking couldn't be created — check your dates."
      else if (status === 409)
        message = 'Those nights were booked by someone else just now. Pick again.'
      else if (status === 401) message = 'Sign in again — your session expired.'

      // 409/401 → back to pick (re-pick against fresh data, or sign in again).
      // Other errors stay on review so the user can retry the same selection.
      if (status === 409) {
        // Race: someone else booked these nights. Refetch so the calendar
        // shows the new conflict.
        setState({ kind: 'pick' })
        setPickError(message)
        setReviewError(null)
        onConflictRefetch?.()
      } else if (status === 401) {
        setState({ kind: 'pick' })
        setPickError(message)
        setReviewError(null)
      } else {
        setReviewError(message)
        setState({ kind: 'review', from: state.from, to: state.to, guests: state.guests })
      }
      reset()
    }
  }

  const total = range.nights * (venue.price || 0)
  const reviewTotal =
    state.kind === 'review' || state.kind === 'confirm'
      ? nightsBetween(state.from, state.to) * (venue.price || 0)
      : 0

  return (
    <section
      className="v-mag__book"
      aria-label="Book this venue"
      aria-busy={isPending || undefined}
    >
      <div className="v-mag__book-frame">
        <form
          className="book"
          aria-labelledby="book-title"
          onSubmit={
            state.kind === 'pick'
              ? handlePickSubmit
              : (e) => {
                  e.preventDefault()
                }
          }
        >
          <span className="regmark regmark--tl" aria-hidden="true" />
          <span className="regmark regmark--tr" aria-hidden="true" />
          <span className="regmark regmark--bl" aria-hidden="true" />
          <span className="regmark regmark--br" aria-hidden="true" />

          <h2 className="sr-only" id="book-title">
            Book this venue
          </h2>

          {!isAuthenticated && state.kind === 'pick' ? (
            <aside className="guest-banner" role="note">
              <span className="guest-banner__mark">§ Guest</span>
              <p className="guest-banner__body">
                You&rsquo;re browsing without an account. Sign in or register to
                book.
              </p>
            </aside>
          ) : null}

          {state.kind === 'pick' && (
            <>
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
                    onChange={(e) => {
                      handleDateInput('from', e.target.value)
                    }}
                  />
                </label>
                <label>
                  <span>Depart</span>
                  <input
                    type="date"
                    name="to"
                    value={toValue}
                    min={fromValue || formatDay(range.today)}
                    onChange={(e) => {
                      handleDateInput('to', e.target.value)
                    }}
                  />
                </label>
              </div>

              <BookingGuestStepper
                guests={guests}
                maxGuests={maxGuests}
                onGuestsChange={setGuests}
              />

              <p className="book__total">
                <span>
                  {range.nights} night{range.nights === 1 ? '' : 's'}
                </span>
                <strong>{formatPrice(total)}</strong>
              </p>

              {(pickError ?? range.pickNotice) ? (
                <p className="book__error" role="alert">
                  {pickError ?? range.pickNotice}
                </p>
              ) : null}

              <button type="submit" className="book__cta">
                <span>Book now</span>
                <Icon name="arrow-right" size="sm" />
              </button>

              <p className="book__note">
                Direct with the host. No commission.
              </p>
            </>
          )}

          {(state.kind === 'review' || state.kind === 'confirm') && (
            <>
              <BookingReview
                venue={venue}
                from={state.from}
                to={state.to}
                guests={state.guests}
                total={reviewTotal}
                headingRef={reviewHeadingRef}
              />

              {reviewError ? (
                <p className="book__error" role="alert">
                  {reviewError}
                </p>
              ) : null}

              <button
                type="button"
                className="book__cta"
                onClick={() => {
                  void handleConfirm()
                }}
                disabled={state.kind === 'confirm'}
                aria-busy={state.kind === 'confirm' || undefined}
              >
                <span>{state.kind === 'confirm' ? 'Booking…' : 'Confirm booking'}</span>
                <Icon name="arrow-right" size="sm" />
              </button>

              <button
                type="button"
                className="book__back"
                onClick={() => {
                  setState({ kind: 'pick' })
                  setReviewError(null)
                }}
                disabled={state.kind === 'confirm'}
              >
                ← Back to pick
              </button>
            </>
          )}

          {state.kind === 'success' && (
            <div className="book__success" role="status" aria-live="polite">
              <p>Booked. Taking you to your receipt…</p>
              <span className="book__success-bar" aria-hidden="true" />
            </div>
          )}
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
