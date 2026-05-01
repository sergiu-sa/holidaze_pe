import { http, HttpResponse } from 'msw'

const NOROFF_AUTH = 'https://v2.api.noroff.dev/auth'

interface RegisterBody {
  name: string
  email: string
  password: string
  venueManager?: boolean
}

interface LoginBody {
  email: string
  password: string
}

// ─── happy-path handlers ────────────────────────────────────────────────────

export const registerHappy = http.post(`${NOROFF_AUTH}/register`, async ({ request }) => {
  const body = (await request.json()) as RegisterBody
  return HttpResponse.json({
    data: {
      name: body.name,
      email: body.email,
      venueManager: body.venueManager ?? false,
    },
  })
})

export const loginHappy = http.post(`${NOROFF_AUTH}/login`, async ({ request }) => {
  const body = (await request.json()) as LoginBody
  return HttpResponse.json({
    data: {
      name: body.email.split('@')[0],
      email: body.email,
      venueManager: body.email.startsWith('host'),
      accessToken: 'tok_test_token',
    },
  })
})

export const createApiKeyHappy = http.post(
  `${NOROFF_AUTH}/create-api-key`,
  () =>
    HttpResponse.json({
      data: { name: 'Holidaze session', status: 'ACTIVE', key: 'key_test_uuid' },
    }),
)

export const authHappy = [registerHappy, loginHappy, createApiKeyHappy]

// ─── unhappy-path handlers (per-test override via server.use(...)) ──────────

export const registerConflict = http.post(`${NOROFF_AUTH}/register`, () =>
  HttpResponse.json(
    { errors: [{ message: 'Profile already exists' }] },
    { status: 409 },
  ),
)

export const loginUnauthorized = http.post(`${NOROFF_AUTH}/login`, () =>
  HttpResponse.json(
    { errors: [{ message: 'Invalid email or password' }] },
    { status: 401 },
  ),
)

export const createApiKeyUnauthorized = http.post(
  `${NOROFF_AUTH}/create-api-key`,
  () =>
    HttpResponse.json(
      { errors: [{ message: 'Invalid token' }] },
      { status: 401 },
    ),
)

export const networkError = http.post(`${NOROFF_AUTH}/login`, () =>
  HttpResponse.error(),
)
