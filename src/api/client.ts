import { ApiError } from '../types/api'
import { NoroffErrorEnvelopeSchema } from './schemas'
import { getAccessToken, getApiKey } from './session'

export const BASE = 'https://v2.api.noroff.dev/holidaze'

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** "optional" attaches auth iff both creds present; "required" throws if either missing. */
  auth?: 'optional' | 'required'
  signal?: AbortSignal
  /** Default true. Set false on list endpoints to keep the `{ data, meta }` envelope. */
  unwrap?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = 'optional', signal, unwrap = true } = options

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
    // AbortError propagates untouched so callers distinguish cancellation from network failure.
    // Detected by name (jsdom + browsers disagree on the class).
    if (err instanceof Error && err.name === 'AbortError') throw err
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
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

  // Noroff wraps in { data, meta } for resources but not auth (e.g. /auth/login).
  // Unwrap by default; pass `unwrap: false` to keep the envelope.
  if (unwrap && data !== null && typeof data === 'object' && 'data' in data) {
    return (data as { data: T }).data
  }

  return data as T
}
