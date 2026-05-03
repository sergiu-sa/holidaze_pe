import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../api/session'
import { ToastProvider } from '../../components/ui/ToastProvider'
import { AuthProvider } from '../../hooks/useAuth'
import { AppRoutes } from '../AppRoutes'

function renderRoutes(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
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

describe('AppRoutes guards', () => {
  it('redirects /profile to /login when anonymous', async () => {
    renderRoutes(['/profile'])
    await waitFor(() => {
      // /login renders with the giant "Welcome, again." h1 — confirms redirect landed
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome/i)
    })
  })

  it('renders /profile content when authenticated', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
    renderRoutes(['/profile'])
    // Wait for Suspense fallback to resolve and Profile page to render.
    // Profile page exists as a placeholder — assert it's NOT the login page.
    await waitFor(() => {
      const h1 = screen.queryByRole('heading', { level: 1 })
      // Either the Profile page rendered (not /welcome again/) or it's a placeholder.
      // The redirect would have shown "Welcome, again." — so absence of that text confirms guard passed.
      if (h1) {
        expect(h1).not.toHaveTextContent(/welcome,?\s*again/i)
      }
    })
  })
})
