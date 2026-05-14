import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CityEntry } from '../../lib/atlas/groupByCity'
import Home from '../Home'

const INTRO_KEY = 'holidaze:v1:intro-seen'
const HOME_COVER_KEY = 'holidaze:v1:home-cover-visits'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

function makeCity(city: string, country: string, lat: number, lng: number): CityEntry {
  return { city, country, continent: 'Europe', lat, lng, venues: [] }
}

const FIXTURE_CITIES: CityEntry[] = [
  makeCity('Bergen', 'NO', 60.4, 5.3),
  makeCity('Bordeaux', 'FR', 44.8, -0.6),
  makeCity('Kyoto', 'JP', 35.0, 135.8),
  // groupByCity may emit multiple entries per city name (different coord
  // buckets) — cityOptions should collapse them to one option.
  makeCity('bergen', 'NO', 60.5, 5.4),
]

vi.mock('../../hooks/useAtlasCities', () => ({
  useAtlasCities: () => ({
    cities: FIXTURE_CITIES,
    isLoading: false,
    isFallback: false,
    error: null,
    refetch: () => undefined,
    totalVenues: 4,
  }),
}))

vi.mock('../../hooks/useVenues', () => ({
  useVenues: () => ({
    data: [],
    meta: null,
    source: 'api',
    error: null,
    isLoading: false,
    isFallback: false,
    refetch: () => undefined,
  }),
}))

// Atlas composite triggers extra network during render — replace with a stub.
vi.mock('../../components/atlas/Atlas', () => ({
  Atlas: () => <div data-testid="atlas-stub" />,
}))

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home — search-wrap', () => {
  beforeEach(() => {
    localStorage.setItem(INTRO_KEY, '1')
    localStorage.setItem(HOME_COVER_KEY, '99')
    navigateMock.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders a datalist with city + country labels, deduped and sorted', () => {
    renderHome()
    const options = screen.getAllByRole('option', { hidden: true })
    expect(options.map((o) => o.getAttribute('value'))).toEqual(['Bergen', 'Bordeaux', 'Kyoto'])
    expect(options.map((o) => o.textContent)).toEqual(['Bergen, NO', 'Bordeaux, FR', 'Kyoto, JP'])
  })

  it('links the destination input to the cities datalist', () => {
    renderHome()
    expect(screen.getByLabelText(/destination/i)).toHaveAttribute('list', 'search-cities')
  })

  it('navigates to /venues with q encoded when submitted with a destination only', () => {
    renderHome()
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Bergen' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(navigateMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith('/venues?q=Bergen')
  })

  it('encodes from / to / guests when the user fills them in', () => {
    renderHome()
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Kyoto' } })
    fireEvent.change(screen.getByLabelText(/arrive/i), { target: { value: '2026-05-20' } })
    fireEvent.change(screen.getByLabelText(/depart/i), { target: { value: '2026-05-24' } })
    fireEvent.change(screen.getByLabelText(/guests/i), { target: { value: '4' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(navigateMock).toHaveBeenCalledWith(
      '/venues?q=Kyoto&from=2026-05-20&to=2026-05-24&guests=4',
    )
  })

  it('exposes the Inquire submit button', () => {
    renderHome()
    expect(screen.getByRole('button', { name: /inquire/i })).toBeInTheDocument()
  })
})
