import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ContactShortcut } from '../ContactShortcut'

function withRouter(node: React.ReactNode) {
  return <MemoryRouter>{node}</MemoryRouter>
}

describe('<ContactShortcut>', () => {
  it('renders the eyebrow and the labelled link', () => {
    render(
      withRouter(
        <ContactShortcut
          to="/hosts#contact"
          eyebrow="Need to talk to a human?"
          label="Write to the editor"
        />,
      ),
    )

    expect(screen.getByText(/need to talk to a human/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /write to the editor/i })
    expect(link).toHaveAttribute('href', '/hosts#contact')
  })

  it('exposes the complementary landmark with an aria-label', () => {
    render(
      withRouter(
        <ContactShortcut
          to="/hosts#contact"
          eyebrow="Looking for someone to talk to?"
          label="Write to the editor"
        />,
      ),
    )
    expect(
      screen.getByRole('complementary', { name: /looking for someone to talk to/i }),
    ).toBeInTheDocument()
  })

  it('appends the default → arrow', () => {
    render(
      withRouter(
        <ContactShortcut to="/hosts#contact" eyebrow="x" label="Write" />,
      ),
    )
    const link = screen.getByRole('link', { name: /write/i })
    expect(link).toHaveTextContent(/→/)
  })

  it('respects an explicit ↓ arrow', () => {
    render(
      withRouter(
        <ContactShortcut to="#contact" eyebrow="x" label="Write" arrow="↓" />,
      ),
    )
    const link = screen.getByRole('link', { name: /write/i })
    expect(link).toHaveTextContent(/↓/)
  })

  it('omits the prominent modifier class by default', () => {
    render(
      withRouter(
        <ContactShortcut to="#contact" eyebrow="x" label="Write" />,
      ),
    )
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('contact-shortcut')
    expect(aside).not.toHaveClass('contact-shortcut--prominent')
  })

  it('applies the prominent modifier class when variant="prominent"', () => {
    render(
      withRouter(
        <ContactShortcut
          to="#contact"
          eyebrow="x"
          label="Write"
          variant="prominent"
        />,
      ),
    )
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('contact-shortcut')
    expect(aside).toHaveClass('contact-shortcut--prominent')
  })
})
