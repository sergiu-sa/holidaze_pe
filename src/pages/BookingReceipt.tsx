import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getBooking } from '../api/bookings'
import { type Booking } from '../api/schemas'
import { Receipt } from '../components/booking/Receipt'
import { NotFoundCard } from '../components/shell/NotFoundCard'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../types/api'
import { type Venue } from '../types/venue'

type FetchState =
  | { kind: 'loading' }
  | { kind: 'ok'; booking: Booking & { venue: Venue } }
  | { kind: 'not-found' }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }

export default function BookingReceipt() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [state, setState] = useState<FetchState>(() =>
    id ? { kind: 'loading' } : { kind: 'not-found' },
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getBooking(id, { customer: true, venue: true })
      .then((booking) => {
        if (cancelled) return
        const withVenue = booking as Booking & { venue?: Venue }
        const customerName = booking.customer?.name
        if (!withVenue.venue) {
          setState({ kind: 'error', message: "Couldn't load that booking. Try again." })
          return
        }
        if (user && customerName && customerName !== user.name) {
          setState({ kind: 'forbidden' })
          return
        }
        setState({ kind: 'ok', booking: { ...booking, venue: withVenue.venue } })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: 'not-found' })
          return
        }
        const message = err instanceof Error ? err.message : "Couldn't load that booking. Try again."
        setState({ kind: 'error', message })
      })
    return () => {
      cancelled = true
    }
  }, [id, user])

  useEffect(() => {
    if (state.kind === 'ok') {
      document.title = `Holidaze — Booked: ${state.booking.venue.name}`
    } else if (state.kind === 'not-found' || state.kind === 'forbidden') {
      document.title = 'Holidaze — Booking not found'
    }
  }, [state])

  return (
    <main id="main" className="receipt">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/profile/bookings">Bookings</Link></li>
          <li><span aria-current="page">Receipt</span></li>
        </ol>
      </nav>

      {state.kind === 'loading' && (
        <div role="status" aria-label="Loading receipt" className="w-full h-1 bg-ivory-deep overflow-hidden">
          <div className="h-full bg-cinnabar animate-pulse w-1/3" />
        </div>
      )}

      {state.kind === 'forbidden' && (
        <NotFoundCard
          title={<>This booking is <em>off the atlas.</em></>}
          body="It isn't yours."
          links={[
            { to: '/profile/bookings', label: 'See your bookings', primary: true },
            { to: '/', label: 'Back to home' },
          ]}
        />
      )}

      {state.kind === 'not-found' && (
        <NotFoundCard
          title={<>This booking is <em>off the atlas.</em></>}
          body="The link you followed may be stale, or this booking was removed."
          links={[
            { to: '/profile/bookings', label: 'See your bookings', primary: true },
            { to: '/', label: 'Back to home' },
          ]}
        />
      )}

      {state.kind === 'error' && (
        <NotFoundCard
          title="Couldn't load that booking."
          body={state.message}
          links={[
            { to: '/profile/bookings', label: 'See your bookings', primary: true },
            { to: '/', label: 'Back to home' },
          ]}
        />
      )}

      {state.kind === 'ok' && (
        <>
          <section className="receipt__stamp" aria-hidden="true">
            <span>Confirmed</span>
            <span>·</span>
            <span>Direct</span>
            <span>·</span>
            <span>No commission</span>
          </section>
          <section className="receipt__head">
            <p className="receipt__eyebrow mono">
              <span className="eyebrow__num">§ 09</span>
              <span className="eyebrow__label">Booking receipt</span>
            </p>
            <h1 className="receipt__title">A <em>place</em> is held<br />in your name.</h1>
            <p className="receipt__lede">
              The host has been notified. Your nights are locked — no one else can
              book them. Keep this page, or find it later under your bookings.
            </p>
          </section>

          <Receipt booking={state.booking} />

          <aside className="receipt__next">
            <p className="eyebrow"><span className="eyebrow__num">§ 10</span><span className="eyebrow__label">What&rsquo;s next</span></p>
            <ol className="receipt__steps">
              <li><span className="mono">01</span> The host replies within <em>12 hours</em> with directions.</li>
              <li><span className="mono">02</span> A calendar file lands in your inbox. Add it once, forget about it until the day.</li>
              <li><span className="mono">03</span> Arrive. Be a good guest. Leave a rating in italic afterwards.</li>
            </ol>
          </aside>
        </>
      )}
    </main>
  )
}
