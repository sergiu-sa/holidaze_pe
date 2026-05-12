import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { SignedOff } from '../SignedOff'

describe('<SignedOff>', () => {
  it('renders the apply-for-access link going to /register?role=host', () => {
    render(
      <MemoryRouter>
        <SignedOff />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /apply for access/i })
    expect(link).toHaveAttribute('href', '/register?role=host')
  })

  it('renders the page imprint chip', () => {
    render(
      <MemoryRouter>
        <SignedOff />
      </MemoryRouter>,
    )
    expect(screen.getByText(/end of specimen/i)).toBeInTheDocument()
  })

  it('renders the editor name in the rule line', () => {
    render(
      <MemoryRouter>
        <SignedOff />
      </MemoryRouter>,
    )
    expect(screen.getByText(/editor · holidaze press/i)).toBeInTheDocument()
  })
})
