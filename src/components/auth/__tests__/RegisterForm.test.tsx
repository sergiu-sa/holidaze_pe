import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession } from '../../../api/session'
import { AuthProvider } from '../../../hooks/useAuth'
import { authHappy, registerConflict } from '../../../test/msw/auth-handlers'
import { server } from '../../../test/msw/server'
import { ToastProvider } from '../../ui/ToastProvider'
import { RegisterForm } from '../RegisterForm'

function renderForm(initialEntries: string[] = ['/register']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/profile" element={<p>profile</p>} />
            <Route path="/login" element={<p>login</p>} />
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

describe('RegisterForm', () => {
  it('defaults role to guest and submits venueManager: false', async () => {
    server.use(...authHappy)
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'sergiu')
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /apply for access/i }))

    expect(await screen.findByText('profile')).toBeInTheDocument()
  })

  it('pre-selects host when ?role=host is in the URL', () => {
    renderForm(['/register?role=host'])
    expect(screen.getByRole('radio', { name: /host/i })).toBeChecked()
  })

  it('defaults to guest when ?role= is unrecognised', () => {
    renderForm(['/register?role=banana'])
    expect(screen.getByRole('radio', { name: /guest/i })).toBeChecked()
  })

  it('rejects empty name', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /apply for access/i }))
    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })

  it('rejects name with hyphen', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'ser-giu')
    await userEvent.type(screen.getByLabelText(/email/i), 'a@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /apply for access/i }))
    expect(await screen.findByText(/letters, numbers, underscore only/i)).toBeInTheDocument()
  })

  it('shows inline email error on 409 from register', async () => {
    server.use(registerConflict)
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'sergiu')
    await userEvent.type(screen.getByLabelText(/email/i), 'taken@stud.noroff.no')
    await userEvent.type(screen.getByLabelText(/password/i), '12345678')
    await userEvent.click(screen.getByRole('button', { name: /apply for access/i }))
    expect(await screen.findByText(/already registered/i)).toBeInTheDocument()
  })

  it('switching role to host changes which radio is checked', async () => {
    renderForm()
    expect(screen.getByRole('radio', { name: /guest/i })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: /host/i }))
    expect(screen.getByRole('radio', { name: /host/i })).toBeChecked()
  })
})
