import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { Venue } from '../../../types/venue'
import { VenueCard } from '../VenueCard'
import { VenueCardSkeleton } from '../VenueCardSkeleton'

function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: 'v1',
    name: 'Casa del Viento',
    description: 'A whitewashed cliffside house above the Mediterranean.',
    media: [
      { url: 'https://images.unsplash.com/photo-1?w=1400', alt: 'Cliffside cover' },
    ],
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
    ...overrides,
  }
}

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('VenueCard (prototype port)', () => {
  it('renders the venue as a link to /venues/:id with the name as accessible label', () => {
    renderInRouter(<VenueCard venue={makeVenue()} index={4} />)
    const link = screen.getByRole('link', { name: 'Casa del Viento' })
    expect(link).toHaveAttribute('href', '/venues/v1')
    expect(link).toHaveClass('venue')
  })

  it('renders the index chip with the prototype N°XX format', () => {
    renderInRouter(<VenueCard venue={makeVenue()} index={4} />)
    expect(screen.getByText('N°04')).toBeInTheDocument()
  })

  it('renders price + location + description + rating-aria + amenities', () => {
    renderInRouter(<VenueCard venue={makeVenue()} index={1} />)
    expect(screen.getByText(/€280/)).toBeInTheDocument()
    expect(screen.getByText(/Begur, Spain/)).toBeInTheDocument()
    expect(screen.getByText(/whitewashed cliffside/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Rating 4\.8 of 5/)).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Pets')).toBeInTheDocument()
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument()
  })

  it('renders the cover image with alt text', () => {
    renderInRouter(<VenueCard venue={makeVenue()} index={1} />)
    const img = screen.getByRole('img', { name: 'Cliffside cover' })
    expect(img).toHaveClass('venue__img')
  })

  it('renders the bento variant class when supplied', () => {
    renderInRouter(<VenueCard venue={makeVenue()} index={1} className="bento__cell--1" />)
    const link = screen.getByRole('link', { name: 'Casa del Viento' })
    expect(link).toHaveClass('venue', 'bento__cell--1')
  })

  it('does not render an <img> when media is empty', () => {
    renderInRouter(<VenueCard venue={makeVenue({ media: [] })} index={1} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('VenueCardSkeleton', () => {
  it('renders the skeleton with .venue and .venue--skeleton classes', () => {
    render(<VenueCardSkeleton />)
    const skel = screen.getByTestId('venue-skeleton')
    expect(skel).toHaveClass('venue', 'venue--skeleton')
    expect(skel).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards extra className for bento spans', () => {
    render(<VenueCardSkeleton className="bento__cell--3" />)
    expect(screen.getByTestId('venue-skeleton')).toHaveClass('bento__cell--3')
  })
})
