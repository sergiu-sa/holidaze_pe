import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { Venue } from '../../../types/venue'
import { VenuePeekModal } from '../VenuePeekModal'

const SAMPLE: Venue = {
  id: 'v1',
  name: 'Casa del Viento',
  description: 'A whitewashed cliffside house above the Mediterranean.',
  media: [{ url: 'https://images.unsplash.com/photo-1?w=1400', alt: 'Cliffside cover' }],
  price: 280,
  maxGuests: 4,
  rating: 4.8,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
  meta: { wifi: true, parking: true, breakfast: false, pets: true },
  location: {
    address: null,
    city: 'Begur',
    zip: null,
    country: 'Spain',
    continent: 'Europe',
    lat: 41.95,
    lng: 3.21,
  },
}

// jsdom doesn't implement HTMLDialogElement.showModal/close fully — patch the
// shape so the component's open/close flow can be exercised. Real browsers
// supply this natively. We re-assign unconditionally so test-order independence
// is preserved across files that may also patch.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

function renderWith(venue: Venue | null, onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <MemoryRouter>
        <VenuePeekModal venue={venue} index={3} onClose={onClose} />
      </MemoryRouter>,
    ),
  }
}

describe('VenuePeekModal', () => {
  it('opens the dialog and renders venue details when a venue is set', async () => {
    renderWith(SAMPLE)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveAttribute('open')
    })
    expect(screen.getByRole('heading', { level: 2, name: /casa del viento/i })).toBeInTheDocument()
    expect(screen.getByText(/whitewashed cliffside/i)).toBeInTheDocument()
    expect(screen.getByText(/€280/)).toBeInTheDocument()
    // Eyebrow shows the 1-based number from the supplied 0-based index.
    expect(screen.getByText(/N°04/i)).toBeInTheDocument()
  })

  it('renders the Book now CTA pointing at the venue page and closes on click', async () => {
    const { onClose } = renderWith(SAMPLE)
    const cta = screen.getByRole('link', { name: /book now/i })
    expect(cta).toHaveAttribute('href', '/venues/v1')
    const user = userEvent.setup()
    await user.click(cta)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the close button is pressed', async () => {
    const { onClose } = renderWith(SAMPLE)
    await userEvent.setup().click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render any frame content when venue is null', () => {
    renderWith(null)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('renders only the amenities that are on', () => {
    renderWith(SAMPLE)
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Pets OK')).toBeInTheDocument()
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument()
  })
})
