import { useParams } from 'react-router-dom'

// BookingReceipt — placeholder for the booking confirmation receipt.
export default function BookingReceipt() {
  const { id } = useParams<{ id: string }>()

  return (
    <main id="main" className="px-gutter py-shelf">
      <h1 className="font-serif text-step-5 text-ink">Booking receipt</h1>
      <p className="mt-2 font-mono text-step--2 uppercase tracking-eyebrow text-ink-mute">
        booking id: {id}
      </p>
      <p className="mt-4 font-sans text-step-0 text-ink-soft">
        Coming soon — slice 5.2 will ship the booking receipt.
      </p>
    </main>
  )
}
