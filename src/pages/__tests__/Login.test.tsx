import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../api/session'
import { ToastProvider } from '../../components/ui/ToastProvider'
import { AuthProvider } from '../../hooks/useAuth'
import Login from '../Login'

function renderPage(initialEntries: string[] = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<p>profile</p>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Login page', () => {
  it('renders the masthead, marginalia, and the form', () => {
    clearSession()
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome/i)
    expect(screen.getByText(/marginalia/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
  })

  it('redirects to /profile when already authenticated', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
    renderPage()
    expect(await screen.findByText('profile')).toBeInTheDocument()
    clearSession()
  })

  it('shows the expired-token banner when ?reason=expired', () => {
    clearSession()
    renderPage(['/login?reason=expired'])
    expect(screen.getByText(/session timed out/i)).toBeInTheDocument()
  })
})
