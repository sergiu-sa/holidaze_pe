import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearSession, getSession, setSession } from '../../api/session'
import {
  authHappy,
  createApiKeyUnauthorized,
  loginUnauthorized,
  registerConflict,
} from '../../test/msw/auth-handlers'
import { server } from '../../test/msw/server'
import { AuthProvider, useAuth } from '../useAuth'

// ─── test consumer ─────────────────────────────────────────────────────────

function Probe() {
  const { state, login, register, logout } = useAuth()

  return (
    <div>
      <p data-testid="status">{state.status}</p>
      {state.status === 'authenticated' && (
        <p data-testid="user">{`${state.user.name}|${String(state.user.venueManager)}`}</p>
      )}
      <button
        type="button"
        onClick={() => {
          void login({ email: 'a@stud.noroff.no', password: '12345678' }).catch(() => {
            /* swallow — assertions read state */
          })
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={() => {
          void register({
            name: 'sergiu',
            email: 'a@stud.noroff.no',
            password: '12345678',
            venueManager: false,
          }).catch(() => {
            /* swallow — assertions read state */
          })
        }}
      >
        register
      </button>
      <button
        type="button"
        onClick={() => {
          logout()
        }}
      >
        logout
      </button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

beforeEach(() => {
  clearSession()
})

afterEach(() => {
  clearSession()
})

// ─── boot ───────────────────────────────────────────────────────────────────

describe('useAuth boot', () => {
  it('settles to anonymous when localStorage is empty', async () => {
    renderProbe()
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
  })

  it('rehydrates to authenticated when localStorage has a complete session', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: true,
    })

    renderProbe()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('sergiu|true')
  })

  it('discards a partial session (token without apiKey) and settles to anonymous', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: '',
      name: 'sergiu',
    })

    renderProbe()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
    expect(getSession()).toBeNull()
  })
})

// ─── login ──────────────────────────────────────────────────────────────────

describe('useAuth.login', () => {
  it('runs login + createApiKey, persists session, flips state to authenticated', async () => {
    server.use(...authHappy)

    renderProbe()
    const button = await screen.findByText('login')

    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })
    expect(getSession()).toMatchObject({
      accessToken: 'tok_test_token',
      apiKey: 'key_test_uuid',
      name: 'a',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
  })

  it('leaves state anonymous and session untouched on login 401', async () => {
    server.use(loginUnauthorized)

    renderProbe()
    const button = await screen.findByText('login')

    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
    expect(getSession()).toBeNull()
  })

  it('clears session and stays anonymous when createApiKey fails after login succeeds', async () => {
    const happyLogin = authHappy.find((h) => h.info.path.toString().includes('login'))!
    server.use(happyLogin, createApiKeyUnauthorized)

    renderProbe()
    const button = await screen.findByText('login')

    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
    expect(getSession()).toBeNull()
  })
})

// ─── register ───────────────────────────────────────────────────────────────

describe('useAuth.register', () => {
  it('chains register + login + createApiKey, ends authenticated', async () => {
    server.use(...authHappy)

    renderProbe()
    const button = await screen.findByText('register')

    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })
  })

  it('bubbles 409 from register itself; state stays anonymous', async () => {
    server.use(registerConflict)

    renderProbe()
    const button = await screen.findByText('register')

    await userEvent.click(button)

    // Give microtasks a chance to settle the rejected register call.
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
  })
})

// ─── logout ─────────────────────────────────────────────────────────────────

describe('useAuth.logout', () => {
  it('clears session and flips state to anonymous', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })

    renderProbe()
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    await userEvent.click(screen.getByText('logout'))

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    expect(getSession()).toBeNull()
  })
})

// ─── cross-tab sync ─────────────────────────────────────────────────────────

describe('useAuth cross-tab sync', () => {
  it('flips to anonymous when the storage event reports cleared session', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })

    renderProbe()
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    // Simulate sign-out in another tab: clear localStorage and dispatch the event.
    localStorage.removeItem('holidaze:v1:session')
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'holidaze:v1:session', newValue: null }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
  })

  it('flips to anonymous on malformed JSON in the storage event', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })

    renderProbe()
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'holidaze:v1:session', newValue: 'not-json{' }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
    expect(getSession()).toBeNull()
  })

  it('flips to anonymous when storage event delivers a partial session (missing apiKey)', async () => {
    setSession({
      accessToken: 'tok',
      apiKey: 'key',
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })

    renderProbe()
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'holidaze:v1:session',
        newValue: JSON.stringify({ accessToken: 'x' }),
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    })
  })
})
