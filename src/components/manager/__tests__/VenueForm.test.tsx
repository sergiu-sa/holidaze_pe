import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { Venue } from '../../../types/venue'
import { VenueForm } from '../VenueForm'

const SAMPLE_VENUE: Venue = {
  id: 'v-1',
  name: 'Olive Cabin',
  description: 'Stone-walled bothy a kilometre off the road.',
  media: [{ url: 'https://example.com/cover.jpg', alt: 'Cover' }],
  price: 240,
  maxGuests: 4,
  rating: 4.5,
  created: '2026-04-01T00:00:00.000Z',
  updated: '2026-04-01T00:00:00.000Z',
  meta: { wifi: true, parking: true, breakfast: false, pets: false },
  location: {
    address: null,
    city: 'Lisbon',
    zip: null,
    country: 'Portugal',
    continent: 'Europe',
    lat: null,
    lng: null,
  },
}

function renderForm(props: Partial<Parameters<typeof VenueForm>[0]> = {}) {
  const onSubmit = vi.fn(() => Promise.resolve())
  const utils = render(
    <MemoryRouter>
      <VenueForm mode="create" onSubmit={onSubmit} {...props} />
    </MemoryRouter>,
  )
  return { onSubmit, ...utils }
}

describe('VenueForm', () => {
  it('rejects missing required fields inline', async () => {
    const { onSubmit } = renderForm()

    await userEvent.click(screen.getByRole('button', { name: /list place/i }))

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a typed payload on a valid create', async () => {
    const captured: unknown[] = []
    const onSubmit = vi.fn((input: unknown) => {
      captured.push(input)
      return Promise.resolve()
    })
    render(
      <MemoryRouter>
        <VenueForm mode="create" onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Olive Cabin')
    await userEvent.type(
      screen.getByLabelText(/description/i),
      'Stone-walled bothy.',
    )
    const priceInput = screen.getByLabelText(/price/i)
    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '240')
    const guestsInput = screen.getByLabelText(/max guests/i)
    await userEvent.clear(guestsInput)
    await userEvent.type(guestsInput, '4')
    await userEvent.type(screen.getByLabelText(/city/i), 'Lisbon')
    await userEvent.type(screen.getByLabelText(/country/i), 'Portugal')

    await userEvent.click(screen.getByRole('button', { name: /list place/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    const arg = captured[0] as Record<string, unknown>
    expect(arg.name).toBe('Olive Cabin')
    expect(arg.price).toBe(240)
    expect(arg.maxGuests).toBe(4)
    const location = arg.location as Record<string, unknown>
    expect(location.city).toBe('Lisbon')
    expect(location.country).toBe('Portugal')
    expect(location.zip).toBeNull()
  })

  it('hydrates the edit mode from an initial venue', () => {
    render(
      <MemoryRouter>
        <VenueForm mode="edit" initial={SAMPLE_VENUE} onSubmit={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('Olive Cabin')
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Stone-walled bothy a kilometre off the road.',
    )
    expect(screen.getByLabelText(/price/i)).toHaveValue(240)
    expect(screen.getByLabelText(/max guests/i)).toHaveValue(4)
    expect(screen.getByLabelText(/city/i)).toHaveValue('Lisbon')
    expect(screen.getByLabelText(/^photo url$/i)).toHaveValue('https://example.com/cover.jpg')
    expect(screen.getByRole('checkbox', { name: /wi-fi/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /pets ok/i })).not.toBeChecked()
  })

  it('renders a Delete button only in edit mode + onDelete callback', () => {
    const onDelete = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <VenueForm mode="create" onSubmit={vi.fn()} onDelete={onDelete} />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <VenueForm
          mode="edit"
          initial={SAMPLE_VENUE}
          onSubmit={vi.fn()}
          onDelete={onDelete}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows an error banner when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Boom'))
    render(
      <MemoryRouter>
        <VenueForm mode="create" onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/^name$/i), 'X')
    await userEvent.type(screen.getByLabelText(/description/i), 'Y')
    const priceInput = screen.getByLabelText(/price/i)
    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '10')
    const guestsInput = screen.getByLabelText(/max guests/i)
    await userEvent.clear(guestsInput)
    await userEvent.type(guestsInput, '2')

    await userEvent.click(screen.getByRole('button', { name: /list place/i }))

    expect(await screen.findByText(/boom/i)).toBeInTheDocument()
  })

  it('lets the manager add and remove photo rows', async () => {
    render(
      <MemoryRouter>
        <VenueForm mode="create" onSubmit={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getAllByLabelText(/photo url/i)).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: /add another photo/i }))
    expect(screen.getAllByLabelText(/photo url/i)).toHaveLength(2)

    const remove = screen.getAllByRole('button', { name: /remove photo/i })[1]
    await userEvent.click(remove)
    expect(screen.getAllByLabelText(/photo url/i)).toHaveLength(1)
  })
})
