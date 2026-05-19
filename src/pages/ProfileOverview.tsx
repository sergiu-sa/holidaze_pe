import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import {
  BookingRow,
  ProfileHeader,
  ProfileStats,
} from '../components/profile'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useProfile } from '../hooks/useProfile'
import { useProfileBookings } from '../hooks/useProfileBookings'

export default function ProfileOverview() {
  useDocumentTitle('Profile')
  const { user } = useAuth()
  const profile = useProfile()
  const bookings = useProfileBookings()

  const upcoming = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return (bookings.data ?? []).filter((b) => new Date(b.dateTo) >= start)
  }, [bookings.data])

  const sub = user?.venueManager
    ? 'Your places, your bookings.'
    : 'Your trips, your atlas. All in one place.'

  const stats = user?.venueManager
    ? [
        { label: 'Venues listed', value: profile.data?._count?.venues ?? 0 },
        { label: 'Upcoming trips', value: upcoming.length },
      ]
    : [
        { label: 'Upcoming trips', value: upcoming.length },
        { label: 'Places saved', value: 0 },
      ]

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <span aria-current="page">Profile</span>
          </li>
        </ol>
      </nav>

      <ProfileHeader
        title={
          <>
            <em>Hello,</em>
            <br />
            {user?.name ?? 'you'}.
          </>
        }
        sub={sub}
      />

      <ProfileStats cells={stats} />

      <section aria-label="Recent bookings">
        <h2 className="profile-section__h">Recent bookings</h2>
        {bookings.isLoading && <p className="mono">Loading…</p>}
        {!bookings.isLoading && upcoming.length === 0 && (
          <div className="empty-state">
            <p className="empty-state__title">Your atlas is blank.</p>
            <p>No bookings yet.</p>
            <Link to="/venues" className="empty-state__cta">
              Find a place →
            </Link>
          </div>
        )}
        {!bookings.isLoading && upcoming.length > 0 && (
          <div className="rec-list" role="list">
            {upcoming.slice(0, 3).map((b) => (
              <div key={b.id} role="listitem">
                <BookingRow booking={b} variant="upcoming" />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
