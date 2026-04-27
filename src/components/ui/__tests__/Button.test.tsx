import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../Button'

describe('Button', () => {
  it('renders a button with primary variant by default and fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Inquire</Button>)
    const btn = screen.getByRole('button', { name: 'Inquire' })
    expect(btn).toHaveClass('btn', 'btn--primary')
    expect(btn).toHaveAttribute('type', 'button')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders the cobalt variant and forwards aria-busy when loading', () => {
    render(
      <Button variant="cobalt" loading>
        Saving
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Saving' })
    expect(btn).toHaveClass('btn--cobalt', 'btn--loading')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
  })

  it('renders as <a> when as="a" and forwards href', () => {
    render(
      <Button as="a" href="/venues" variant="link">
        Browse
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Browse' })
    expect(link).toHaveAttribute('href', '/venues')
    expect(link).toHaveClass('btn--link')
  })
})
