import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { ToastProvider } from '../../ui/ToastProvider'
import { AuthGuard } from '../AuthGuard'

function LocProbe() {
  const loc = useLocation()
  return <p data-testid="path">{loc.pathname + loc.search}</p>
}

function renderTree(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <p>private</p>
                  <LocProbe />
                </AuthGuard>
              }
            />
            <Route path="/login" element={<><p>login</p><LocProbe /></>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthGuard', () => {
  it('redirects to /login?next=… when anonymous', async () => {
    clearSession()
    renderTree(['/profile'])
    expect(await screen.findByText('login')).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('next=%2Fprofile')
  })

  it('renders children when authenticated', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
    renderTree(['/profile'])
    expect(await screen.findByText('private')).toBeInTheDocument()
    clearSession()
  })
})
