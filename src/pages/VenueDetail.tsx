import '../styles/reading-list.css'

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AuthRequiredModal } from '../components/auth/AuthRequiredModal'
import { AvailabilityCalendar, BookingPanel } from '../components/booking'
import { NotFoundCard } from '../components/shell/NotFoundCard'
import {
  HostStrip,
  VenueDetailSkeleton,
  VenueGallery,
  VenueSpread,
  VenueTitlePlate,
} from '../components/venue'
import { useAuth } from '../hooks/useAuth'
import { useDateRange } from '../hooks/useDateRange'
import { useVenue } from '../hooks/useVenue'
import { buildBookedSet } from '../lib/dates'
import { formatCoord, formatLocation } from '../lib/venue-format'
import { ApiError } from '../types/api'

// The date-range hook lives on the page so the calendar and the booking panel
// share a single source of truth — selecting a range in one updates the other.

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: venue, error, isLoading, refetch } = useVenue(id)
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    from: string
    to: string
    guests: number
  } | null>(null)

  const bookedSet = useMemo(
    () => buildBookedSet(venue?.bookings),
    [venue?.bookings],
  )
  const range = useDateRange({ bookedSet })

  useEffect(() => {
    if (!venue) return
    const previous = document.title
    document.title = `${venue.name} · Holidaze`
    return () => {
      document.title = previous
    }
  }, [venue])

  if (isLoading) return <VenueDetailSkeleton />

  if (error) {
    const isNotFound = error instanceof ApiError && error.status === 404
    if (isNotFound) {
      return (
        <main id="main" role="alert">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol className="crumbs__list">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/venues">Venues</Link>
              </li>
              <li>
                <span aria-current="page">Off the atlas</span>
              </li>
            </ol>
          </nav>
          <NotFoundCard
            title={
              <>
                This venue is <em>off the atlas.</em>
              </>
            }
            body="The link you followed may be stale, or this venue was removed from the atlas."
            links={[
              { to: '/venues', label: 'Browse all venues', primary: true },
              { to: '/', label: 'Back to home' },
            ]}
          />
        </main>
      )
    }
    return (
      <main id="main" className="px-gutter py-shelf">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol className="crumbs__list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/venues">Venues</Link>
            </li>
            <li>
              <span aria-current="page">Error</span>
            </li>
          </ol>
        </nav>
        <div className="v-empty" role="alert">
          <p className="v-empty__title">Something went sideways.</p>
          <p className="v-empty__body">
            The venue request failed. Try again, or browse the full collection.
          </p>
          <button type="button" className="v-empty__reset" onClick={refetch}>
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!venue) return null

  return (
    <>
      <main id="main" className="v-mag">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol className="crumbs__list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/venues">Venues</Link>
            </li>
            <li>
              <span aria-current="page">{venue.name}</span>
            </li>
          </ol>
        </nav>

        <VenueGallery
          media={venue.media}
          venueName={venue.name}
          coords={formatCoord(venue.location.lat, venue.location.lng)}
          indexLabel={formatLocation(venue).toUpperCase()}
        />
        <VenueTitlePlate venue={venue} />
        <VenueSpread venue={venue} />
        <AvailabilityCalendar range={range} />
        <BookingPanel
          venue={venue}
          range={range}
          isAuthenticated={user !== null}
          onRequestAuth={(action) => {
            setPendingAction(action)
            setAuthModalOpen(true)
          }}
          onConflictRefetch={refetch}
        />
        <HostStrip owner={venue.owner} />
      </main>

      <AuthRequiredModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false)
        }}
        trigger="book"
        pendingActionKey={`holidaze:pending:venue/${venue.id}`}
        pendingAction={pendingAction ?? undefined}
      />
    </>
  )
}
