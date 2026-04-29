import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { NotFoundCard } from '../NotFoundCard'

function renderWithRouter(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>)
}

describe('NotFoundCard', () => {
  it('renders the slash-wrapped code', () => {
    renderWithRouter(
      <NotFoundCard
        title="Off the atlas."
        body="No such page."
        links={[{ to: '/', label: 'Home', primary: true }]}
      />,
    )
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })

  it('renders the title and body', () => {
    renderWithRouter(
      <NotFoundCard
        title="Off the atlas."
        body="The URL you followed doesn't lead anywhere we've been."
        links={[{ to: '/', label: 'Home' }]}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: /off the atlas/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/url you followed/i)).toBeInTheDocument()
  })

  it('renders all links and marks the primary one with the is-primary class', () => {
    renderWithRouter(
      <NotFoundCard
        title="X"
        body="Y"
        links={[
          { to: '/', label: 'Home', primary: true },
          { to: '/venues', label: 'Browse venues' },
        ]}
      />,
    )
    const home = screen.getByRole('link', { name: /home/i })
    const browse = screen.getByRole('link', { name: /browse venues/i })
    expect(home).toHaveClass('is-primary')
    expect(browse).not.toHaveClass('is-primary')
  })

  it('honours an overridden code', () => {
    renderWithRouter(
      <NotFoundCard
        code="500"
        title="X"
        body="Y"
        links={[{ to: '/', label: 'Home' }]}
      />,
    )
    expect(screen.getByText(/500/)).toBeInTheDocument()
  })
})
