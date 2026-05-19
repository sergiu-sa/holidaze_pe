import { Link, useNavigate } from 'react-router-dom'

import { type CreateVenueInput } from '../api/schemas'
import { createVenue } from '../api/venues'
import { VenueForm } from '../components/manager'
import { ProfileHeader } from '../components/profile'
import { useToast } from '../components/ui/ToastProvider'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ProfileVenuesNew() {
  useDocumentTitle('New venue')
  const navigate = useNavigate()
  const toast = useToast()

  async function onSubmit(input: CreateVenueInput) {
    const venue = await createVenue(input)
    toast(`${venue.name} listed.`, { kind: 'success' })
    navigate(`/profile/venues/${encodeURIComponent(venue.id)}/edit`, { replace: true })
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
            <span aria-current="page">New</span>
          </li>
        </ol>
      </nav>

      <ProfileHeader
        title={
          <>
            List a <em>place</em>.
          </>
        }
        sub="Name, description, photos, price. You can edit everything later."
      />

      <VenueForm mode="create" onSubmit={onSubmit} />
    </>
  )
}
