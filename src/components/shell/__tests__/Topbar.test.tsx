import { render, screen } from '@testing-library/react'
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

  it('renders the ruler hairline band', () => {
    renderTopbar()
    expect(screen.getByText(/ISSUE/i)).toBeInTheDocument()
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
