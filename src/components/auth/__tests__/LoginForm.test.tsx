import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { authHappy, loginUnauthorized } from '../../../test/msw/auth-handlers'
import { server } from '../../../test/msw/server'
import { ToastProvider } from '../../ui/ToastProvider'
import { LoginForm } from '../LoginForm'

function Probe() {
  const loc = useLocation()
  return <p data-testid="path">{loc.pathname + loc.search}</p>
}

function renderForm(initialEntries: string[] = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <>
                  <LoginForm />
                  <Probe />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <>
                  <p>profile</p>
                  <Probe />
                </>
              }
            />
            <Route
              path="/profile/bookings"
              element={
                <>
                  <p>bookings</p>
                  <Probe />
                </>
              }
            />
          </Routes>
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

describe('LoginForm', () => {
  it('rejects non-stud emails inline before calling the API', async () => {
    server.use(...authHappy)
    renderForm()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /check in/i }))

    expect(await screen.findByText(/email must end in stud\.noroff\.no/i)).toBeInTheDocument()
    expect(screen.queryByText('profile')).not.toBeInTheDocument()
  })

  it('rejects short password inline', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '123')
    await userEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(await screen.findByText(/8 characters/i)).toBeInTheDocument()
  })

  it('redirects to /profile on success', async () => {
    server.use(...authHappy)
    renderForm()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(await screen.findByText('profile')).toBeInTheDocument()
  })

  it('honours ?next= and redirects to it on success', async () => {
    server.use(...authHappy)
    renderForm(['/login?next=%2Fprofile%2Fbookings'])
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(await screen.findByText('bookings')).toBeInTheDocument()
  })

  it('shows the form-level banner on 401', async () => {
    server.use(loginUnauthorized)
    renderForm()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /check in/i }))
    const banners = await screen.findAllByRole('alert')
    expect(banners.some((b) => /wrong email or password/i.test(b.textContent))).toBe(true)
  })

  it('calls login with parsed credentials on a valid happy submit', async () => {
    server.use(...authHappy)
    renderForm()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(await screen.findByText('profile')).toBeInTheDocument()
  })
})
