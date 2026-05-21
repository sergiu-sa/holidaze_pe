import { apiFetch } from './client'
import {
  ApiKeySuccessSchema,
  type LoginInput,
  LoginInputSchema,
  type LoginSuccess,
  LoginSuccessSchema,
  type RegisterInput,
  RegisterInputSchema,
  type RegisterSuccess,
  RegisterSuccessSchema,
} from './schemas'

const NOROFF_AUTH = 'https://v2.api.noroff.dev/auth'

/** POST /auth/register — returns user only (no token); follow up with login() + createApiKey(). `?_holidaze=true` needed so `venueManager` comes back. */
export async function register(input: RegisterInput): Promise<RegisterSuccess['data']> {
  const body = RegisterInputSchema.parse(input)
  const res = await apiFetch<RegisterSuccess>(`${NOROFF_AUTH}/register?_holidaze=true`, {
    method: 'POST',
    body,
    absoluteUrl: true,
    unwrap: false,
  })
  return RegisterSuccessSchema.parse(res).data
}

/** POST /auth/login — `?_holidaze=true` needed so `venueManager` comes back on the user record. */
export async function login(input: LoginInput): Promise<LoginSuccess['data']> {
  const body = LoginInputSchema.parse(input)
  const res = await apiFetch<LoginSuccess>(`${NOROFF_AUTH}/login?_holidaze=true`, {
    method: 'POST',
    body,
    absoluteUrl: true,
    unwrap: false,
  })
  return LoginSuccessSchema.parse(res).data
}

/** POST /auth/create-api-key — Authorization header only (no X-Noroff-API-Key yet). */
export async function createApiKey(accessToken: string): Promise<string> {
  const res = await apiFetch<unknown>(`${NOROFF_AUTH}/create-api-key`, {
    method: 'POST',
    body: { name: 'Holidaze session' },
    absoluteUrl: true,
    unwrap: false,
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return ApiKeySuccessSchema.parse(res).data.key
}
