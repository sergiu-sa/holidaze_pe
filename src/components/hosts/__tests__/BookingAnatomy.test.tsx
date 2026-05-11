import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BookingAnatomy } from '../BookingAnatomy'

describe('<BookingAnatomy>', () => {
  it('renders the section heading', () => {
    render(<BookingAnatomy />)
    expect(
      screen.getByRole('heading', { name: /anatomy of a booking/i }),
    ).toBeInTheDocument()
  })

  it('exposes the SVG diagram with an aria-label covering the data', () => {
    render(<BookingAnatomy />)
    const svg = screen.getByRole('img', { name: /diagram of a booking/i })
    const label = svg.getAttribute('aria-label') ?? ''
    expect(label.toLowerCase()).toContain('€240')
    expect(label.toLowerCase()).toContain('100%')
    expect(label.toLowerCase()).toContain('€49')
  })

  it('renders the figure caption with the €49/yr subscription note', () => {
    render(<BookingAnatomy />)
    expect(screen.getByText(/€49\/yr/i)).toBeInTheDocument()
  })
})
