import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HostsHero } from '../HostsHero'

describe('<HostsHero>', () => {
  it('renders the visually-hidden caption as the page <h1>', () => {
    render(<HostsHero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(/holidaze takes zero commission/i)
  })

  it('marks the strike, tick, folio, and pin as decorative', () => {
    render(<HostsHero />)
    const decorations = [
      screen.getByTestId('hero-strike'),
      screen.getByTestId('hero-tick'),
      screen.getByTestId('hero-pin'),
      screen.getByTestId('hero-crown'),
    ]
    expect(decorations.length).toBeGreaterThan(0)
    decorations.forEach((el) => {
      expect(el).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('renders the deck-pin note prose', () => {
    render(<HostsHero />)
    const note = screen.getByLabelText(/what holidaze takes/i)
    expect(note).toHaveTextContent(/none of your/i)
    expect(note).toHaveTextContent(/rate/i)
    expect(note).toHaveTextContent(/ever/i)
  })
})
