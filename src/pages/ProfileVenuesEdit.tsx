import { useParams } from 'react-router-dom'

// ProfileVenuesEdit — placeholder for the edit-venue form page.
export default function ProfileVenuesEdit() {
  const { id } = useParams<{ id: string }>()

  return (
    <main id="main" className="px-gutter py-shelf">
      <h1 className="font-serif text-step-5 text-ink">Edit venue</h1>
      <p className="mt-2 font-mono text-step--2 uppercase tracking-eyebrow text-ink-mute">
        id: {id}
      </p>
      <p className="mt-4 font-sans text-step-0 text-ink-soft">
        Coming soon — slice 5.4 will ship the edit-venue form.
      </p>
    </main>
  )
}
