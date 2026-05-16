import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { ToastProvider } from '../../ui/ToastProvider'
import { Topbar } from '../Topbar'

function renderTopbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <ToastProvider>
          <Topbar />
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

describe('Topbar', () => {
  it('renders the wordmark link', () => {
    renderTopbar()
    expect(screen.getByRole('link', { name: /holidaze home/i })).toBeInTheDocument()
  })

  it('renders all primary nav links', () => {
    renderTopbar()
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^venues$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^atlas$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^hosts$/i })).toBeInTheDocument()
  })

  it('renders the auth slot with Sign in link', () => {
    renderTopbar()
    const signIn = screen.getByRole('link', { name: /sign in/i })
    expect(signIn).toBeInTheDocument()
    expect(signIn).toHaveAttribute('href', '/login')
  })

  it('marks the active route link with aria-current="page"', () => {
    renderTopbar('/venues')
    const venuesLink = screen.getByRole('link', { name: /^venues$/i })
    expect(venuesLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders the hamburger toggle (always in DOM, hidden via CSS below nav: bp)', () => {
    renderTopbar()
    expect(
      screen.getByRole('button', { name: /open navigation menu/i }),
    ).toBeInTheDocument()
  })

  it('renders the ruler hairline band with the issue chip', () => {
    renderTopbar()
    expect(
      screen.getByRole('button', { name: /colophon — about this issue/i }),
    ).toHaveTextContent(/ISSUE N°04/i)
  })
})

describe('Topbar — colophon disclosure', () => {
  it('renders the issue chip as a button collapsed by default', () => {
    renderTopbar()
    const chip = screen.getByRole('button', { name: /colophon — about this issue/i })
    expect(chip).toHaveAttribute('aria-expanded', 'false')
    expect(chip).toHaveAttribute('aria-controls', 'colophon-pop')
  })

  it('toggles the colophon panel open and closed when the chip is clicked', async () => {
    const user = userEvent.setup()
    renderTopbar()
    const chip = screen.getByRole('button', { name: /colophon — about this issue/i })
    const panel = screen.getByTestId('colophon-popover')

    expect(panel).toHaveAttribute('hidden')
    expect(chip).toHaveAttribute('aria-expanded', 'false')

    await user.click(chip)
    expect(panel).not.toHaveAttribute('hidden')
    expect(chip).toHaveAttribute('aria-expanded', 'true')

    await user.click(chip)
    expect(panel).toHaveAttribute('hidden')
    expect(chip).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the panel and restores focus to the chip when Escape is pressed', async () => {
    const user = userEvent.setup()
    renderTopbar()
    const chip = screen.getByRole('button', { name: /colophon — about this issue/i })

    await user.click(chip)
    expect(screen.getByTestId('colophon-popover')).not.toHaveAttribute('hidden')

    await user.keyboard('{Escape}')
    expect(screen.getByTestId('colophon-popover')).toHaveAttribute('hidden')
    expect(chip).toHaveFocus()
  })
})

describe('Topbar — auth slot', () => {
  it('renders Sign in / Register links when anonymous', async () => {
    renderTopbar()
    expect(await screen.findByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('renders the AvatarMenu when authenticated', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
    renderTopbar()
    expect(await screen.findByRole('button', { name: /account menu/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
  })
})
