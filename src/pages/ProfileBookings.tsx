import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { BookingList, ProfileHeader } from '../components/profile'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '../components/ui'
import { useProfileBookings } from '../hooks/useProfileBookings'

type BookingTab = 'upcoming' | 'past'

export default function ProfileBookings() {
  const [tab, setTab] = useState<BookingTab>('upcoming')
  const bookings = useProfileBookings()

  const { upcoming, past } = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const all = bookings.data ?? []
    return {
      upcoming: all.filter((b) => new Date(b.dateTo) >= start),
      past: all.filter((b) => new Date(b.dateTo) < start),
    }
  }, [bookings.data])

  const total = (bookings.data ?? []).length

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <span aria-current="page">Bookings</span>
          </li>
        </ol>
      </nav>

      <ProfileHeader
        title={
          <>
            Your <em>bookings</em>.
          </>
        }
        sub={
          total === 0
            ? 'No bookings yet.'
            : `${String(upcoming.length)} upcoming · ${String(past.length)} past`
        }
      />

      {bookings.isLoading && <p className="mono">Loading…</p>}
      {!bookings.isLoading && bookings.error && (
        <div className="empty-state">
          <p className="empty-state__title">Something went wrong.</p>
          <button type="button" onClick={bookings.refetch} className="empty-state__cta">
            Try again
          </button>
        </div>
      )}
      {!bookings.isLoading && !bookings.error && (
        <Tabs<BookingTab> value={tab} onChange={setTab} ariaLabel="Booking filter">
          <TabList>
            <Tab value="upcoming">
              Upcoming <span className="tabs__count mono">{upcoming.length}</span>
            </Tab>
            <Tab value="past">
              Past <span className="tabs__count mono">{past.length}</span>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="upcoming">
              <BookingList variant="upcoming" rows={upcoming} onChanged={bookings.refetch} />
            </TabPanel>
            <TabPanel value="past">
              <BookingList variant="past" rows={past} onChanged={bookings.refetch} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </>
  )
}
