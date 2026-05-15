import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { CityEntry } from '../../../lib/atlas/groupByCity'
import type { Venue } from '../../../types/venue'
import { type ColophonAtlasData, ColophonPopover } from '../ColophonPopover'

function makeVenue(id: string): Venue {
  return {
    id,
    name: `Venue ${id}`,
    description: '',
    media: [],
    price: 0,
    maxGuests: 1,
    rating: 0,
    created: '',
    updated: '',
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: null,
      zip: null,
      country: null,
      continent: null,
      lat: 0,
      lng: 0,
    },
  }
}

function makeCity(city: string, country: string, continent: string, count: number): CityEntry {
  return {
    city,
    country,
    continent: continent as CityEntry['continent'],
    lat: 0,
    lng: 0,
    venues: Array.from({ length: count }, (_, i) => makeVenue(`${city}-${String(i)}`)),
  }
}

function renderColophon(open: boolean, atlas: ColophonAtlasData) {
  return render(
    <MemoryRouter>
      <ColophonPopover id="colophon-pop" triggerId="issue-toggle" open={open} atlas={atlas} />
    </MemoryRouter>,
  )
}

describe('ColophonPopover', () => {
  const atlas: ColophonAtlasData = {
    totalVenues: 32,
    isFallback: false,
    cities: [
      makeCity('Bergen', 'Norway', 'Europe', 9),
      makeCity('Lisbon', 'Portugal', 'Europe', 5),
      makeCity('Tokyo', 'Japan', 'Asia', 3),
      makeCity('Marrakech', 'Morocco', 'Africa', 2),
    ],
  }

  it('renders all four columns when open', () => {
    renderColophon(true, atlas)
    expect(screen.getByText('Issue')).toBeInTheDocument()
    expect(screen.getByText('The Atlas')).toBeInTheDocument()
    expect(screen.getByText('This issue features')).toBeInTheDocument()
    expect(screen.getByText('Colophon')).toBeInTheDocument()
  })

  it('is hidden when open=false', () => {
    renderColophon(false, atlas)
    const panel = screen.getByTestId('colophon-popover')
    expect(panel).toHaveAttribute('hidden')
  })

  it('is visible when open=true', () => {
    renderColophon(true, atlas)
    const panel = screen.getByTestId('colophon-popover')
    expect(panel).not.toHaveAttribute('hidden')
  })

  it('links the panel back to the trigger via aria-labelledby', () => {
    renderColophon(true, atlas)
    const panel = screen.getByTestId('colophon-popover')
    expect(panel).toHaveAttribute('aria-labelledby', 'issue-toggle')
    expect(panel).toHaveAttribute('id', 'colophon-pop')
  })

  it('reports the venues count + cities + continents from the atlas data', () => {
    renderColophon(true, atlas)
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText(/4 cities · 3 continents/)).toBeInTheDocument()
  })

  it('renders the top three cities by venue count, in order', () => {
    renderColophon(true, atlas)
    const list = screen.getByRole('list')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Bergen')
    expect(items[1]).toHaveTextContent('Lisbon')
    expect(items[2]).toHaveTextContent('Tokyo')
  })

  it('shows a placeholder line when no cities are loaded yet', () => {
    renderColophon(true, { totalVenues: 0, isFallback: false, cities: [] })
    expect(screen.getByText(/No destinations yet/)).toBeInTheDocument()
  })

  it('marks fallback / cached data when isFallback is true', () => {
    renderColophon(true, { ...atlas, isFallback: true })
    expect(screen.getByText(/Cached · curated fallback/)).toBeInTheDocument()
  })
})
