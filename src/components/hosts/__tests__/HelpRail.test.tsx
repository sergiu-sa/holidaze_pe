import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HelpRail } from '../HelpRail'

describe('<HelpRail>', () => {
  it('renders the eyebrow line', () => {
    render(<HelpRail />)
    expect(screen.getByText(/in a hurry/i)).toBeInTheDocument()
    expect(screen.getByText(/booking gone sideways/i)).toBeInTheDocument()
  })

  it('links to #contact', () => {
    render(<HelpRail />)
    const link = screen.getByRole('link', { name: /write to the editor/i })
    expect(link).toHaveAttribute('href', '#contact')
  })

  it('exposes the complementary landmark', () => {
    render(<HelpRail />)
    expect(
      screen.getByRole('complementary', { name: /need help/i }),
    ).toBeInTheDocument()
  })
})
