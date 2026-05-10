import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { ToastProvider } from '../../ui/ToastProvider'
import { AvatarMenu } from '../AvatarMenu'

function renderMenu(venueManager: boolean) {
  setSession({
    accessToken: 'tok',
    apiKey: 'key',
    name: 'sergiu',
    email: 'a@stud.noroff.no',
    venueManager,
  })
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <AvatarMenu />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  clearSession()
})
afterEach(() => {
  clearSession()
})

describe('AvatarMenu', () => {
  it('opens on click and exposes the right ARIA attributes', async () => {
    renderMenu(false)
    const trigger = await screen.findByRole('button', { name: /account menu/i })
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('hides "My venues" for a customer', async () => {
    renderMenu(false)
    await userEvent.click(await screen.findByRole('button', { name: /account menu/i }))
    expect(screen.queryByRole('link', { name: /my venues/i })).not.toBeInTheDocument()
  })

  it('shows "My venues" for a manager', async () => {
    renderMenu(true)
    await userEvent.click(await screen.findByRole('button', { name: /account menu/i }))
    expect(screen.getByRole('link', { name: /my venues/i })).toBeInTheDocument()
  })

  it('closes when Esc is pressed', async () => {
    renderMenu(false)
    const trigger = await screen.findByRole('button', { name: /account menu/i })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders the role chip with the correct label', async () => {
    renderMenu(true)
    await userEvent.click(await screen.findByRole('button', { name: /account menu/i }))
    expect(screen.getByText(/host/i)).toBeInTheDocument()
  })

  it('falls back to the initial when avatar.url is missing', async () => {
    renderMenu(false)
    const trigger = await screen.findByRole('button', { name: /account menu/i })
    expect(trigger).toHaveTextContent(/^S/i)
  })
})
