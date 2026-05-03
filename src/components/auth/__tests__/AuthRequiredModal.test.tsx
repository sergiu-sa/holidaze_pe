import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { AuthRequiredModal } from '../AuthRequiredModal'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', 'true')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})

afterEach(() => {
  sessionStorage.clear()
})

function Wrap({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('AuthRequiredModal', () => {
  it('renders as a dialog when open', () => {
    render(
      <Wrap>
        <AuthRequiredModal
          open
          onClose={vi.fn()}
          trigger="book"
          pendingActionKey="holidaze:pending:venue/abc"
        />
      </Wrap>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('writes pendingAction to sessionStorage when Sign in is clicked', async () => {
    render(
      <Wrap>
        <AuthRequiredModal
          open
          onClose={vi.fn()}
          trigger="book"
          pendingActionKey="holidaze:pending:venue/abc"
          pendingAction={{ from: '2026-06-01', to: '2026-06-05', guests: 2 }}
        />
      </Wrap>,
    )
    await userEvent.click(screen.getByRole('link', { name: /sign in/i }))
    expect(sessionStorage.getItem('holidaze:pending:venue/abc')).toContain('2026-06-01')
  })

  it('clears the sessionStorage key on close', async () => {
    sessionStorage.setItem('holidaze:pending:venue/abc', '{}')
    const onClose = vi.fn()
    render(
      <Wrap>
        <AuthRequiredModal
          open
          onClose={onClose}
          trigger="book"
          pendingActionKey="holidaze:pending:venue/abc"
        />
      </Wrap>,
    )
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
    expect(sessionStorage.getItem('holidaze:pending:venue/abc')).toBeNull()
  })
})
