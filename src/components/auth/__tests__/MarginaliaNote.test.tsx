import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarginaliaNote } from '../MarginaliaNote'

describe('MarginaliaNote', () => {
  it('renders the eyebrow and the line content', () => {
    render(
      <MarginaliaNote eyebrow="Marginalia">
        Two fields. <strong>Fifteen seconds.</strong>
      </MarginaliaNote>,
    )
    expect(screen.getByText('Marginalia')).toBeInTheDocument()
    expect(screen.getByText('Fifteen seconds.')).toBeInTheDocument()
  })

  it('renders a saffron pin SVG marked aria-hidden', () => {
    // SVG is decorative ornament with no accessible name by design,
    // so Testing Library queries can't reach it — container access is the
    // correct tool here (eslint-disable below scopes the override narrowly).
    const { container } = render(<MarginaliaNote eyebrow="x">y</MarginaliaNote>)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const pin = container.querySelector('svg')
    expect(pin).not.toBeNull()
    expect(pin).toHaveAttribute('aria-hidden', 'true')
  })
})
