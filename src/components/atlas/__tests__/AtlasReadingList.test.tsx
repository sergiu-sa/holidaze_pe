import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { CityEntry } from '../../../lib/atlas/groupByCity'
import type { Venue } from '../../../types/venue'
import { AtlasReadingList } from '../AtlasReadingList'

function venue(id: string, price: number): Venue {
  return {
    id,
    name: `Venue ${id}`,
    description: '',
    media: [{ url: 'https://images.unsplash.com/x?w=400', alt: '' }],
    price,
    maxGuests: 2,
    rating: 4.5,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: 'Paris',
      zip: null,
      country: 'France',
      continent: 'Europe',
      lat: 48.8,
      lng: 2.3,
    },
  }
}

const SAMPLE_CITIES: CityEntry[] = [
  {
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    lat: 48.8566,
    lng: 2.3522,
    venues: [venue('p1', 320), venue('p2', 280)],
  },
  {
    city: 'Bergen',
    country: 'Norway',
    continent: 'Europe',
    lat: 60.4,
    lng: 5.3,
    venues: [venue('b1', 180)],
  },
]

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AtlasReadingList', () => {
  it('renders a card per city using the cheapest venue as the lead', () => {
    renderInRouter(
      <AtlasReadingList cities={SAMPLE_CITIES} totalAfterFilter={SAMPLE_CITIES.length} />,
    )
    expect(screen.getByText('Venue p2')).toBeInTheDocument()
    expect(screen.getByText('Venue b1')).toBeInTheDocument()
    expect(screen.queryByText('Venue p1')).not.toBeInTheDocument()
  })

  it('shows price labels on the cards', () => {
    renderInRouter(
      <AtlasReadingList cities={SAMPLE_CITIES} totalAfterFilter={SAMPLE_CITIES.length} />,
    )
    expect(screen.getByText('€280')).toBeInTheDocument()
    expect(screen.getByText('€180')).toBeInTheDocument()
  })

  it('fires onCitySelect when the dock button is clicked', async () => {
    const user = userEvent.setup()
    const handler = vi.fn()
    renderInRouter(
      <AtlasReadingList
        cities={SAMPLE_CITIES}
        totalAfterFilter={SAMPLE_CITIES.length}
        onCitySelect={handler}
      />,
    )
    await user.click(screen.getByRole('button', { name: /dock paris on the plate/i }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('fires onCityHover on mouseenter', async () => {
    const user = userEvent.setup()
    const handler = vi.fn()
    renderInRouter(
      <AtlasReadingList
        cities={SAMPLE_CITIES}
        totalAfterFilter={SAMPLE_CITIES.length}
        onCityHover={handler}
      />,
    )
    await user.hover(screen.getByRole('button', { name: /dock bergen/i }))
    expect(handler).toHaveBeenCalled()
  })

  it('shows the overflow link when totalAfterFilter exceeds rendered count', () => {
    renderInRouter(<AtlasReadingList cities={SAMPLE_CITIES} totalAfterFilter={20} />)
    expect(screen.getByText(/\+18/)).toBeInTheDocument()
    expect(screen.getByText(/more in the/i)).toBeInTheDocument()
  })

  it('renders nothing when there are no items', () => {
    const { container } = renderInRouter(
      <AtlasReadingList cities={[]} totalAfterFilter={0} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
