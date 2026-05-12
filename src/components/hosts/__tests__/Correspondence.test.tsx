import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Correspondence } from '../Correspondence'

describe('<Correspondence>', () => {
  it('renders the section with id="contact" for hash-scroll', () => {
    render(<Correspondence />)
    const section = screen.getByRole('region', { name: /a letter, a reply/i })
    expect(section.id).toBe('contact')
  })

  it('exposes the labelled section heading', () => {
    render(<Correspondence />)
    expect(
      screen.getByRole('heading', { name: /a letter, a reply/i }),
    ).toBeInTheDocument()
  })

  it('renders three mailto desks with the expected addresses', () => {
    render(<Correspondence />)
    const editor = screen.getByRole('link', { name: /editor@holidaze\.press/i })
    const hostsDesk = screen.getByRole('link', { name: /hosts@holidaze\.press/i })
    const coords = screen.getByRole('link', {
      name: /coordinates@holidaze\.press/i,
    })
    expect(editor).toHaveAttribute('href', 'mailto:editor@holidaze.press')
    expect(hostsDesk).toHaveAttribute('href', 'mailto:hosts@holidaze.press')
    expect(coords).toHaveAttribute('href', 'mailto:coordinates@holidaze.press')
  })

  it('renders the postal address block', () => {
    render(<Correspondence />)
    expect(screen.getByLabelText(/postal address/i)).toBeInTheDocument()
    expect(screen.getByText(/karl johans gate/i)).toBeInTheDocument()
  })
})
