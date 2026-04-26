import { ApiError } from '../types/api'
import { NoroffErrorEnvelopeSchema } from './schemas'
import { getAccessToken, getApiKey } from './session'

export const BASE = 'https://v2.api.noroff.dev/holidaze'

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  // "optional" — attach auth headers only if both token and key are present.
  // "required" — throw immediately (before fetch) if either is missing.
  auth?: 'optional' | 'required'
  signal?: AbortSignal
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = 'optional', signal } = options

  const token = getAccessToken()
  const apiKey = getApiKey()

  if (auth === 'required' && (!token || !apiKey)) {
    throw new ApiError(401, 'Authentication required — no session found')
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  // Attach auth headers when both credentials are present (auth: "optional")
  // or always when auth: "required" (we would have thrown above if missing).
  if (token && apiKey) {
    headers.Authorization = `Bearer ${token}`
    headers['X-Noroff-API-Key'] = apiKey
  }

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    throw new ApiError(0, message)
  }

  if (!res.ok) {
    let parsed: unknown
    try {
      parsed = await res.json()
    } catch {
      throw new ApiError(res.status, res.statusText || 'Request failed')
    }

    const envelope = NoroffErrorEnvelopeSchema.safeParse(parsed)
    if (envelope.success && envelope.data.errors.length > 0) {
      const first = envelope.data.errors[0]
      throw new ApiError(res.status, first.message, envelope.data.errors)
    }

    throw new ApiError(res.status, res.statusText || 'Request failed')
  }

  const data = (await res.json()) as unknown

  // Noroff wraps successful payloads in { data, meta }. When the response
  // has a `data` property we return it; otherwise return the body as-is
  // (e.g. /auth/login returns a flat object without wrapping).
  if (data !== null && typeof data === 'object' && 'data' in data) {
    return (data as { data: T }).data
  }

  return data as T
}
