import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '../test/msw/server'
import { ApiError } from '../types/api'
import { createApiKey, login, register } from './auth'

const NOROFF_AUTH = 'https://v2.api.noroff.dev/auth'

describe('register', () => {
  it('sends the typed payload and returns the data envelope', async () => {
    let captured: Record<string, unknown> | null = null
    server.use(
      http.post(`${NOROFF_AUTH}/register`, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: {
            name: captured.name,
            email: captured.email,
            venueManager: captured.venueManager,
          },
        })
      }),
    )

    const result = await register({
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      password: '12345678',
      venueManager: false,
    })

    expect(captured).toEqual({
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      password: '12345678',
      venueManager: false,
    })
    expect(result).toEqual({
      name: 'sergiu',
      email: 'a@stud.noroff.no',
      venueManager: false,
    })
  })

  it('throws ApiError(409) on already-registered email', async () => {
    server.use(
      http.post(`${NOROFF_AUTH}/register`, () =>
        HttpResponse.json(
          { errors: [{ message: 'Profile already exists' }] },
          { status: 409 },
        ),
      ),
    )

    await expect(
      register({
        name: 'sergiu',
        email: 'taken@stud.noroff.no',
        password: '12345678',
        venueManager: false,
      }),
    ).rejects.toMatchObject({ status: 409, message: 'Profile already exists' })
  })

  it('throws ApiError(400) on invalid payload from Noroff', async () => {
    server.use(
      http.post(`${NOROFF_AUTH}/register`, () =>
        HttpResponse.json(
          { errors: [{ message: 'Email must be a valid stud.noroff.no email' }] },
          { status: 400 },
        ),
      ),
    )

    await expect(
      register({
        name: 'sergiu',
        email: 'a@stud.noroff.no',
        password: '12345678',
        venueManager: false,
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})

describe('login', () => {
  it('sends ?_holidaze=true and returns user data with accessToken', async () => {
    let url: URL | null = null
    server.use(
      http.post(`${NOROFF_AUTH}/login`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({
          data: {
            name: 'sergiu',
            email: 'a@stud.noroff.no',
            venueManager: false,
            accessToken: 'tok_abc',
          },
        })
      }),
    )

    const result = await login({ email: 'a@stud.noroff.no', password: '12345678' })

    expect(url).not.toBeNull()
    expect(url!.searchParams.get('_holidaze')).toBe('true')
    expect(result.accessToken).toBe('tok_abc')
    expect(result.venueManager).toBe(false)
  })

  it('throws ApiError(401) on wrong password', async () => {
    server.use(
      http.post(`${NOROFF_AUTH}/login`, () =>
        HttpResponse.json(
          { errors: [{ message: 'Invalid email or password' }] },
          { status: 401 },
        ),
      ),
    )

    await expect(
      login({ email: 'a@stud.noroff.no', password: 'wrongpass' }),
    ).rejects.toMatchObject({ status: 401 })
  })
})

describe('createApiKey', () => {
  it('sends Authorization but NOT X-Noroff-API-Key, with body { name: "Holidaze session" }, returns the key', async () => {
    let captured: Headers | null = null
    let bodyCaptured: Record<string, unknown> | null = null
    server.use(
      http.post(`${NOROFF_AUTH}/create-api-key`, async ({ request }) => {
        captured = request.headers
        bodyCaptured = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { name: 'Holidaze session', status: 'ACTIVE', key: 'uuid-9999' },
        })
      }),
    )

    const key = await createApiKey('tok_test')

    expect(captured).not.toBeNull()
    expect(captured!.get('authorization')).toBe('Bearer tok_test')
    expect(captured!.has('x-noroff-api-key')).toBe(false)
    expect(bodyCaptured).toEqual({ name: 'Holidaze session' })
    expect(key).toBe('uuid-9999')
  })

  it('throws ApiError(401) on expired token', async () => {
    server.use(
      http.post(`${NOROFF_AUTH}/create-api-key`, () =>
        HttpResponse.json(
          { errors: [{ message: 'Invalid token' }] },
          { status: 401 },
        ),
      ),
    )

    await expect(createApiKey('tok_expired')).rejects.toMatchObject({ status: 401 })
  })
})
