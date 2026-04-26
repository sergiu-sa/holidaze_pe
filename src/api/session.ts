const STORAGE_KEY = 'holidaze:v1:session'

export interface Session {
  accessToken: string
  apiKey: string
  name?: string
  email?: string
  venueManager?: boolean
}

// Module-level memory cache — avoids repeated localStorage reads.
let current: Session | null = null

function loadFromStorage(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
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
