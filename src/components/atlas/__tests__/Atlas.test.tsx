import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { server } from '../../../test/msw/server'
import type { Venue } from '../../../types/venue'
import { Atlas } from '../Atlas'

const API = 'https://v2.api.noroff.dev/holidaze'

function makeVenue(overrides: Partial<Venue> & { id: string }): Venue {
  return {
    id: overrides.id,
    name: overrides.name ?? 'Stay',
    description: overrides.description ?? '',
    media: overrides.media ?? [
      { url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200', alt: '' },
    ],
    price: overrides.price ?? 200,
    maxGuests: overrides.maxGuests ?? 4,
    rating: overrides.rating ?? 4.5,
    created: overrides.created ?? '2026-01-01T00:00:00.000Z',
    updated: overrides.updated ?? '2026-01-01T00:00:00.000Z',
    meta: overrides.meta ?? { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: 'Paris',
      zip: null,
      country: 'France',
      continent: 'Europe',
      lat: 48.8566,
      lng: 2.3522,
      ...overrides.location,
    },
  }
}

const SAMPLE_CITIES = [
  {
    city: 'Paris',
    country: 'France',
    continent: 'Europe' as const,
    lat: 48.8566,
    lng: 2.3522,
    venues: [makeVenue({ id: 'p1', name: 'Loft Marais' })],
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    continent: 'Asia' as const,
    lat: 35.6762,
    lng: 139.6503,
    venues: [
      makeVenue({
        id: 't1',
        name: 'Ryokan Kyoto',
        location: {
          address: null,
          city: 'Tokyo',
          zip: null,
          country: 'Japan',
          continent: 'Asia',
          lat: 35.6762,
          lng: 139.6503,
        },
      }),
    ],
  },
]

function renderInRouter(ui: React.ReactElement, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/atlas" element={ui} />
        <Route path="/venues" element={<div data-testid="venues-page">Venues</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Atlas — rendering', () => {
  it('renders one marker button per city, with descriptive aria-label', () => {
    renderInRouter(<Atlas variant="full" cities={SAMPLE_CITIES} hideFullLink />)
    const paris = screen.getByRole('button', { name: /Paris.*France.*1 venue.*48\.9°N/i })
    const tokyo = screen.getByRole('button', { name: /Tokyo.*Japan.*1 venue.*35\.7°N/i })
    expect(paris).toBeInTheDocument()
    expect(tokyo).toBeInTheDocument()
  })

  it('lists every city in the gazetteer in alphabetical order', () => {
    renderInRouter(<Atlas variant="full" cities={SAMPLE_CITIES} hideFullLink />)
    const list = screen.getByRole('list', { name: /alphabetical index/i })
    const items = within(list).getAllByRole('listitem')
    // Two cities sorted A→Z: Paris before Tokyo.
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent(/Paris/)
    expect(items[1]).toHaveTextContent(/Tokyo/)
  })

  it('shows the empty-state message when every city is filtered out', () => {
    renderInRouter(
      <Atlas variant="full" cities={SAMPLE_CITIES} visibleKeys={new Set()} hideFullLink />,
    )
    expect(screen.getByText(/no cities match/i)).toBeInTheDocument()
  })

  it('renders the full-atlas CTA on compact, hides it on full', () => {
    const { rerender } = renderInRouter(<Atlas variant="compact" cities={SAMPLE_CITIES} />)
    expect(screen.getByRole('link', { name: /open the full atlas/i })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <Atlas variant="full" cities={SAMPLE_CITIES} />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link', { name: /open the full atlas/i })).not.toBeInTheDocument()
  })
})

describe('Atlas — interaction', () => {
  it('navigates to /venues?q=<city> when a marker is clicked (compact default)', async () => {
    const user = userEvent.setup()
    renderInRouter(<Atlas variant="compact" cities={SAMPLE_CITIES} hideFullLink />)
    await user.click(screen.getByRole('button', { name: /Paris.*France/i }))
    expect(await screen.findByTestId('venues-page')).toBeInTheDocument()
  })

  it('navigates from a gazetteer link in compact mode', async () => {
    const user = userEvent.setup()
    renderInRouter(<Atlas variant="compact" cities={SAMPLE_CITIES} hideFullLink />)
    const link = screen.getByRole('link', { name: /Tokyo/ })
    expect(link).toHaveAttribute('href', '/venues?q=Tokyo')
    await user.click(link)
    expect(await screen.findByTestId('venues-page')).toBeInTheDocument()
  })

  it('calls onCitySelect (does not navigate) when provided', async () => {
    const user = userEvent.setup()
    const handler = vi.fn()
    renderInRouter(
      <Atlas variant="full" cities={SAMPLE_CITIES} onCitySelect={handler} hideFullLink />,
    )
    await user.click(screen.getByRole('button', { name: /Paris.*France/i }))
    expect(handler).toHaveBeenCalledTimes(1)
    const arg = handler.mock.calls[0]?.[0] as { city: string } | undefined
    expect(arg?.city).toBe('Paris')
    expect(screen.queryByTestId('venues-page')).not.toBeInTheDocument()
  })

  it('hides filtered-out markers from the focus order', () => {
    const visible = new Set(['paris|489|24'])
    renderInRouter(
      <Atlas variant="full" cities={SAMPLE_CITIES} visibleKeys={visible} hideFullLink />,
    )
    // Filtered-out marker is aria-hidden so RTL needs `hidden: true` opt-in.
    const tokyo = screen.getByLabelText(/Tokyo, Japan/i, { selector: '[data-city="Tokyo"]' })
    expect(tokyo).toHaveAttribute('tabindex', '-1')
    expect(tokyo).toHaveAttribute('aria-hidden', 'true')
    expect(tokyo).toHaveClass('is-filtered-out')
  })
})

describe('Atlas — internal hook fetch', () => {
  it('fetches venues itself when no cities prop is provided', async () => {
    server.use(
      http.get(`${API}/venues`, () =>
        HttpResponse.json({
          data: [makeVenue({ id: 'self-fetch', name: 'Loft Marais' })],
          meta: { isFirstPage: true, isLastPage: true, currentPage: 1, previousPage: null, nextPage: null, pageCount: 1, totalCount: 1 },
        }),
      ),
    )
    renderInRouter(<Atlas variant="compact" hideFullLink />)
    expect(await screen.findByRole('button', { name: /Paris.*France/i })).toBeInTheDocument()
  })
})
