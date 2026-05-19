import { useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteVenue } from '../api/venues'
import { useDeleteVenueConfirm, VenueRow } from '../components/manager'
import { ProfileHeader } from '../components/profile'
import { Icon } from '../components/ui'
import { useToast } from '../components/ui/ToastProvider'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useProfileVenues } from '../hooks/useProfileVenues'
import type { Venue } from '../types/venue'

export default function ProfileVenues() {
  useDocumentTitle('Your venues')
  const { data, error, isLoading, refetch } = useProfileVenues()
  const confirmDelete = useDeleteVenueConfirm()
  const toast = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function onDelete(venue: Venue) {
    const ok = await confirmDelete(venue.name)
    if (!ok) return
    setDeletingId(venue.id)
    try {
      await deleteVenue(venue.id)
      toast(`${venue.name} deleted.`, { kind: 'success' })
      refetch()
    } catch {
      toast("We couldn't delete that venue. Try again.", { kind: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  const venues = data ?? []
  const count = venues.length

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
            <span aria-current="page">My venues</span>
          </li>
        </ol>
      </nav>

      <ProfileHeader
        title={
          <>
            Your <em>venues</em>.
          </>
        }
        sub={
          isLoading
            ? 'Loading your atlas…'
            : count === 0
              ? 'Nothing listed yet.'
              : `${String(count)} listing${count === 1 ? '' : 's'} in the atlas.`
        }
      />

      {isLoading && <p className="mono" role="status">Loading…</p>}

      {!isLoading && error && (
        <div className="empty-state">
          <p className="empty-state__title">Something went wrong.</p>
          <p>We couldn&apos;t load your venues.</p>
          <button type="button" onClick={refetch} className="empty-state__cta">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && count === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">Nothing listed.</p>
          <p>Your first venue takes about ten minutes.</p>
          <Link to="/profile/venues/new" className="empty-state__cta">
            List a place →
          </Link>
        </div>
      )}

      {!isLoading && !error && count > 0 && (
        <>
          <nav className="manager-toolbar" aria-label="Venue list actions">
            <Link to="/profile/venues/new" className="rec__btn">
              <Icon name="plus" size="sm" /> New venue
            </Link>
          </nav>
          <ul className="rec-list">
            {venues.map((venue) => (
              <li key={venue.id} className="rec-list__item">
                <VenueRow
                  venue={venue}
                  onDelete={(v) => {
                    void onDelete(v)
                  }}
                  pendingDelete={deletingId === venue.id}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
