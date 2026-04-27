import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Pulse } from '../Pulse'

describe('Pulse', () => {
  it('renders the live variant aria-hidden by default', () => {
    render(<Pulse data-testid="pulse" />)
    const dot = screen.getByTestId('pulse')
    expect(dot).toHaveClass('pulse')
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    expect(dot).not.toHaveClass('pulse--fallback')
  })

  it('renders the fallback variant with an accessible label when provided', () => {
    render(<Pulse variant="fallback" label="Cached data" />)
    const dot = screen.getByRole('img', { name: 'Cached data' })
    expect(dot).toHaveClass('pulse--fallback')
  })
})
