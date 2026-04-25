import { render, screen } from '@testing-library/react'

import { App } from './App'

describe('App (smoke)', () => {
  it('renders the Holidaze headline', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /holidaze/i })).toBeInTheDocument()
  })

  it('exposes a skip link to main content', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#main',
    )
  })
})
