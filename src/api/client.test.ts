import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '../test/msw/server'
import type { ApiError } from '../types/api'
import { apiFetch, BASE } from './client'
import { clearSession, setSession } from './session'

// ─── helpers ────────────────────────────────────────────────────────────────

const TEST_SESSION = { accessToken: 'tok_test', apiKey: 'key_test' }

// Capture request headers so we can assert on them.
let lastRequestHeaders: Headers | null = null

type JsonBody = Record<string, unknown> | unknown[]

function captureHandler(path: string, body: JsonBody, status = 200) {
  return http.get(`${BASE}${path}`, ({ request }) => {
    lastRequestHeaders = request.headers
    return HttpResponse.json(body, { status })
  })
}

// ─── tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  clearSession()
  lastRequestHeaders = null
})

describe('apiFetch — happy path', () => {
  it('unwraps { data } envelope and returns the inner value', async () => {
    server.use(
      http.get(`${BASE}/venues`, () =>
        HttpResponse.json({ data: [{ id: '1', name: 'Test Venue' }], meta: { count: 1 } }),
      ),
    )

    const result = await apiFetch<{ id: string; name: string }[]>('/venues')
    expect(result).toEqual([{ id: '1', name: 'Test Venue' }])
  })

  it('returns raw body when there is no data property (e.g. /auth/login shape)', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ accessToken: 'abc', name: 'user@stud.noroff.no' }),
      ),
    )

    const result = await apiFetch<{ accessToken: string; name: string }>('/auth/login', {
      method: 'POST',
      body: { email: 'user@stud.noroff.no', password: 'password' },
    })
    expect(result).toEqual({ accessToken: 'abc', name: 'user@stud.noroff.no' })
  })
})

describe('apiFetch — auth headers', () => {
  it('does not send auth headers when auth is optional and no session is set', async () => {
    server.use(captureHandler('/venues', { data: [] }))

    await apiFetch('/venues', { auth: 'optional' })

    expect(lastRequestHeaders?.has('authorization')).toBe(false)
    expect(lastRequestHeaders?.has('x-noroff-api-key')).toBe(false)
  })

  it('sends both auth headers when auth is optional and a session is present', async () => {
    setSession(TEST_SESSION)
    server.use(captureHandler('/venues', { data: [] }))

    await apiFetch('/venues', { auth: 'optional' })

    expect(lastRequestHeaders?.get('authorization')).toBe('Bearer tok_test')
    expect(lastRequestHeaders?.get('x-noroff-api-key')).toBe('key_test')
  })

  it('throws ApiError status 401 before the network call when auth is required and no session', async () => {
    // The handler should never be reached — assert that by using an error handler.
    let handlerCalled = false
    server.use(
      http.get(`${BASE}/protected`, () => {
        handlerCalled = true
        return HttpResponse.json({ data: {} })
      }),
    )

    await expect(apiFetch('/protected', { auth: 'required' })).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<ApiError>)

    expect(handlerCalled).toBe(false)
  })
})

describe('apiFetch — error handling', () => {
  it('throws a normalised ApiError from the Noroff error envelope on 4xx', async () => {
    server.use(
      http.get(`${BASE}/venues/missing`, () =>
        HttpResponse.json(
          {
            errors: [{ message: 'Venue not found', code: 'NOT_FOUND' }],
            statusCode: 404,
          },
          { status: 404 },
        ),
      ),
    )

    await expect(apiFetch('/venues/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Venue not found',
    } satisfies Partial<ApiError>)
  })

  it('falls back to status + statusText when the error body is not a valid Noroff envelope', async () => {
    server.use(
      http.get(`${BASE}/venues/broken`, () =>
        // A plain HTML-style response or a non-envelope JSON body.
        HttpResponse.json({ garbage: true }, { status: 503 }),
      ),
    )

    await expect(apiFetch('/venues/broken')).rejects.toMatchObject({
      status: 503,
    } satisfies Partial<ApiError>)
  })

  it('throws ApiError with status 0 on a network error', async () => {
    server.use(
      http.get(`${BASE}/venues/offline`, () => {
        // MSW network error simulation.
        return HttpResponse.error()
      }),
    )

    await expect(apiFetch('/venues/offline')).rejects.toMatchObject({
      status: 0,
    } satisfies Partial<ApiError>)
  })
})

describe('apiFetch — absoluteUrl option (auth endpoints)', () => {
  it('skips the BASE prefix when absoluteUrl is true', async () => {
    server.use(
      http.post('https://v2.api.noroff.dev/auth/login', () =>
        HttpResponse.json({ data: { name: 'x', email: 'a@b.c', venueManager: false, accessToken: 't' } }),
      ),
    )

    const result = await apiFetch<{ data: { accessToken: string } }>(
      'https://v2.api.noroff.dev/auth/login',
      { method: 'POST', body: { email: 'a@b.c', password: '12345678' }, absoluteUrl: true, unwrap: false },
    )
    expect(result.data.accessToken).toBe('t')
  })

  it('omits X-Noroff-API-Key when absoluteUrl is true and only Authorization is provided in headers', async () => {
    let captured: Headers | null = null
    server.use(
      http.post('https://v2.api.noroff.dev/auth/create-api-key', ({ request }) => {
        captured = request.headers
        return HttpResponse.json({ data: { name: 'k', status: 'ACTIVE', key: 'uuid' } })
      }),
    )

    await apiFetch('https://v2.api.noroff.dev/auth/create-api-key', {
      method: 'POST',
      body: { name: 'Holidaze session' },
      absoluteUrl: true,
      headers: { Authorization: 'Bearer tok_test' },
      unwrap: false,
    })

    expect(captured).not.toBeNull()
    expect(captured!.get('authorization')).toBe('Bearer tok_test')
    expect(captured!.has('x-noroff-api-key')).toBe(false)
  })

  it('still includes session-derived Authorization + API-key on /holidaze paths after the extension', async () => {
    setSession(TEST_SESSION)
    server.use(captureHandler('/venues', { data: [] }))

    await apiFetch('/venues')

    expect(lastRequestHeaders?.get('authorization')).toBe('Bearer tok_test')
    expect(lastRequestHeaders?.get('x-noroff-api-key')).toBe('key_test')
  })
})
