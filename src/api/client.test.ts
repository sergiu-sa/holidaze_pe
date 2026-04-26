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
