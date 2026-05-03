import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession, setSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { ToastProvider } from '../../ui/ToastProvider'
import { AuthGuard } from '../AuthGuard'
import { RoleGuard } from '../RoleGuard'

function renderTree() {
  return render(
    <MemoryRouter initialEntries={['/profile/venues']}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/profile/venues"
              element={
                <AuthGuard>
                  {/* eslint-disable-next-line jsx-a11y/aria-role -- `role` here is the RoleGuard prop, not an ARIA attribute */}
                  <RoleGuard role="manager"><p>manager-only</p></RoleGuard>
                </AuthGuard>
              }
            />
            <Route path="/profile" element={<p>profile</p>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => { clearSession() })
afterEach(() => { clearSession() })

describe('RoleGuard', () => {
  it('redirects a customer to /profile', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
    renderTree()
    expect(await screen.findByText('profile')).toBeInTheDocument()
  })

  it('renders children for a manager', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: true,
    })
    renderTree()
    expect(await screen.findByText('manager-only')).toBeInTheDocument()
  })
})
