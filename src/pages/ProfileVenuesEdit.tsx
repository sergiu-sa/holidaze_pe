import { Link, useNavigate, useParams } from 'react-router-dom'

import { type CreateVenueInput } from '../api/schemas'
import { deleteVenue, updateVenue } from '../api/venues'
import { useDeleteVenueConfirm, VenueForm } from '../components/manager'
import { ProfileHeader } from '../components/profile'
import { useToast } from '../components/ui/ToastProvider'
import { useOwnerGate } from '../hooks/useOwnerGate'
import { useVenue } from '../hooks/useVenue'

export default function ProfileVenuesEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: venue, isLoading, error, refetch } = useVenue(id)
  const confirmDelete = useDeleteVenueConfirm()

  useOwnerGate(venue, { message: 'You can only edit venues you own.' })

  async function onSubmit(input: CreateVenueInput) {
    if (!id) return
    const updated = await updateVenue(id, input)
    toast(`${updated.name} saved.`, { kind: 'success' })
    refetch()
  }

  async function onDelete() {
    if (!venue || !id) return
    const ok = await confirmDelete(venue.name)
    if (!ok) return
    try {
      await deleteVenue(id)
      toast(`${venue.name} deleted.`, { kind: 'success' })
      navigate('/profile/venues', { replace: true })
    } catch {
      toast("We couldn't delete that venue. Try again.", { kind: 'error' })
    }
  }

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
            <Link to="/profile/venues">My venues</Link>
          </li>
          <li>
            <span aria-current="page">Edit</span>
          </li>
        </ol>
      </nav>

      <ProfileHeader
        title={
          venue ? (
            <>
              Edit <em>{venue.name}</em>.
            </>
          ) : (
            <>Edit venue.</>
          )
        }
        sub={venue ? 'Changes go live immediately.' : undefined}
      />

      {isLoading && <p className="mono">Loading…</p>}

      {!isLoading && error && (
        <div className="empty-state">
          <p className="empty-state__title">We couldn&apos;t load that venue.</p>
          <p>It may have been removed, or your session expired.</p>
          <Link to="/profile/venues" className="empty-state__cta">
            Back to my venues →
          </Link>
        </div>
      )}

      {!isLoading && !error && venue && (
        <VenueForm
          mode="edit"
          initial={venue}
          onSubmit={onSubmit}
          onDelete={() => {
            void onDelete()
          }}
        />
      )}
    </>
  )
}
