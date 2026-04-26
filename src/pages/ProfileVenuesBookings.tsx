import { useParams } from 'react-router-dom'

// ProfileVenuesBookings — placeholder for the bookings-on-this-venue page.
export default function ProfileVenuesBookings() {
  const { id } = useParams<{ id: string }>()

  return (
    <main id="main" className="px-gutter py-shelf">
      <h1 className="font-serif text-step-5 text-ink">Bookings on this venue</h1>
      <p className="mt-2 font-mono text-step--2 uppercase tracking-eyebrow text-ink-mute">
        venue id: {id}
      </p>
      <p className="mt-4 font-sans text-step-0 text-ink-soft">
        Coming soon — slice 5.4 will ship the venue bookings view.
      </p>
    </main>
  )
}
