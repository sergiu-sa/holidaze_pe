import { z } from 'zod'

import { type Media, MediaSchema } from './schemas'

// Per-user credentials live here at runtime — `.env` would inline them into
// the production bundle, where every visitor could read them.
export const STORAGE_KEY = 'holidaze:v1:session'

export interface Session {
  accessToken: string
  apiKey: string
  name?: string
  email?: string
  venueManager?: boolean
  avatar?: Media
  banner?: Media
}

// Validates the localStorage payload before we trust it as a Session. Tampered
// can never reach an Authorization header.
export const SessionSchema = z.object({
  accessToken: z.string().min(1),
  apiKey: z.string().min(1),
  name: z.string().optional(),
  email: z.string().optional(),
  venueManager: z.boolean().optional(),
  avatar: MediaSchema.optional(),
  banner: MediaSchema.optional(),
})

// Module-level memory cache — avoids repeated localStorage reads.
let current: Session | null = null

function loadFromStorage(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const result = SessionSchema.safeParse(JSON.parse(raw))
    if (!result.success) {
      // Unexpected shape — clear so the next write starts from a clean slot.
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return result.data
  } catch {
    console.warn('[holidaze] Failed to parse session from localStorage')
    return null
  }
}

// Hydrate once at module load.
current = loadFromStorage()

export function getSession(): Session | null {
  return current
}

export function setSession(session: Session): void {
  current = session
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    console.warn('[holidaze] Failed to persist session to localStorage')
  }
}

export function clearSession(): void {
  current = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.warn('[holidaze] Failed to remove session from localStorage')
  }
}

export function getAccessToken(): string | null {
  return current?.accessToken ?? null
}

export function getApiKey(): string | null {
  return current?.apiKey ?? null
}
