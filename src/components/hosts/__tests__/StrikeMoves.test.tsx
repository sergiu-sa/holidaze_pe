import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StrikeMoves } from '../StrikeMoves'

describe('<StrikeMoves>', () => {
  it('renders the section heading', () => {
    render(<StrikeMoves />)
    expect(
      screen.getByRole('heading', { name: /three moves, one motion/i }),
    ).toBeInTheDocument()
  })

  it('renders three move articles, each with its title', () => {
    render(<StrikeMoves />)
    expect(
      screen.getByRole('heading', { name: /register.*as a host/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /describe.*your place/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /welcome.*the guest/i }),
    ).toBeInTheDocument()
  })

  it('mentions the stud.noroff.no email rule in step 1', () => {
    render(<StrikeMoves />)
    expect(screen.getByText(/stud\.noroff\.no/)).toBeInTheDocument()
  })

  it('marks the middle article as dominant via the move--dom class', () => {
    render(<StrikeMoves />)
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(3)
    expect(articles[1]).toHaveClass('move--dom')
  })
})
