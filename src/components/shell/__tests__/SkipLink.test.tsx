import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SkipLink } from '../SkipLink'

describe('SkipLink', () => {
  it('renders a link pointing to #main', () => {
    render(<SkipLink />)
    const link = screen.getByRole('link', { name: /skip to main content/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#main')
  })

  it('has the .skip class (visually hidden by default, visible on focus via CSS)', () => {
    render(<SkipLink />)
    const link = screen.getByRole('link', { name: /skip to main content/i })
    expect(link).toHaveClass('skip')
  })
})
