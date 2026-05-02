import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthCard } from '../AuthCard'

describe('AuthCard', () => {
  it('renders stamp, title, specimenNumber, and children', () => {
    render(
      <AuthCard
        stamp={<>Reader Credential ★</>}
        title="Reader card"
        specimenNumber="R · 0042"
      >
        <p>form contents</p>
      </AuthCard>,
    )
    expect(screen.getByText(/Reader Credential/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader card' })).toBeInTheDocument()
    expect(screen.getByText('R · 0042')).toBeInTheDocument()
    expect(screen.getByText('form contents')).toBeInTheDocument()
  })

  it('marks corner ticks as aria-hidden', () => {
    // Corner ticks are decorative ornament with no accessible name by design,
    // so Testing Library queries can't reach them — container access is the
    // correct tool here (eslint-disable below scopes the override narrowly).
    const { container } = render(
      <AuthCard stamp="x" title="y" specimenNumber="z">
        c
      </AuthCard>,
    )
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    container.querySelectorAll('.auth-card__tick').forEach((node) => {
      expect(node).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
