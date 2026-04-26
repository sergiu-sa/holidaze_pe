import { useParams } from 'react-router-dom'

// VenueDetail — placeholder for the single-venue magazine spread.
export default function VenueDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <main id="main" className="px-gutter py-shelf">
      <h1 className="font-serif text-step-5 text-ink">Venue detail</h1>
      <p className="mt-2 font-mono text-step--2 uppercase tracking-eyebrow text-ink-mute">
        id: {id}
      </p>
      <p className="mt-4 font-sans text-step-0 text-ink-soft">
        Coming soon — slice 4.2 will ship the venue detail page.
      </p>
    </main>
  )
}
