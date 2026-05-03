import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../api/session'
import { ToastProvider } from '../../components/ui/ToastProvider'
import { AuthProvider } from '../../hooks/useAuth'
import Register from '../Register'

function renderPage(initialEntries: string[] = ['/register']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<p>profile</p>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Register page', () => {
  it('renders the masthead and the role picker', () => {
    clearSession()
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/begin/i)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
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
})
