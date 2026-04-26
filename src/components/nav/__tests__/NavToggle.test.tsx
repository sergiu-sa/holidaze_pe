import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { NavToggle } from '../NavToggle'

function renderToggle(isOpen = false, onToggle = vi.fn()) {
  return render(<NavToggle isOpen={isOpen} onToggle={onToggle} />)
}

describe('NavToggle', () => {
  it('renders a button with aria-controls="primary-nav"', () => {
    renderToggle()
    const btn = screen.getByRole('button', { name: /open navigation menu/i })
    expect(btn).toHaveAttribute('aria-controls', 'primary-nav')
  })

  it('has aria-expanded="false" when closed', () => {
    renderToggle(false)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has aria-expanded="true" when open', () => {
    renderToggle(true)
    expect(
      screen.getByRole('button', { name: /close navigation menu/i }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderToggle(false, onToggle)
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('shows "Menu" label when closed and "Close" when open', () => {
    const { rerender } = renderToggle(false)
    expect(screen.getByRole('button')).toHaveTextContent('Menu')

    rerender(<NavToggle isOpen={true} onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Close')
  })

  it('calls onToggle on Escape key when open', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderToggle(true, onToggle)
    await user.keyboard('{Escape}')
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
