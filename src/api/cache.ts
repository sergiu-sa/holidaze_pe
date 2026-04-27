// sessionStorage TTL cache. Per-tab, 10-min default, quota errors silently skip.

const CACHE_PREFIX = 'holidaze:v1:cache:'
const DEFAULT_TTL_MS = 10 * 60 * 1000

interface CacheEnvelope<T> {
  at: number
  data: T
}

export interface CacheKey {
  namespace: string
  params?: Record<string, unknown>
}

function buildKey({ namespace, params }: CacheKey): string {
  if (!params) return `${CACHE_PREFIX}${namespace}`
  // Sort keys so { a:1, b:2 } and { b:2, a:1 } share a cache slot.
  const sortedEntries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  if (sortedEntries.length === 0) return `${CACHE_PREFIX}${namespace}`
  const serialized = sortedEntries
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&')
  return `${CACHE_PREFIX}${namespace}?${serialized}`
}

// Returns `unknown` — sessionStorage is opaque, callers cast at the site.
export function readCache(key: CacheKey, ttlMs: number = DEFAULT_TTL_MS): unknown {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(buildKey(key))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEnvelope<unknown>
    if (typeof parsed.at !== 'number') return null
    if (Date.now() - parsed.at > ttlMs) {
      window.sessionStorage.removeItem(buildKey(key))
      return null
    }
    return parsed.data
  } catch {
    try {
      window.sessionStorage.removeItem(buildKey(key))
    } catch {
      /* ignore */
    }
    return null
  }
}

export function writeCache(key: CacheKey, data: unknown): void {
  if (typeof window === 'undefined') return
  try {
    const envelope: CacheEnvelope<unknown> = { at: Date.now(), data }
    window.sessionStorage.setItem(buildKey(key), JSON.stringify(envelope))
  } catch {
    /* Quota exceeded or storage disabled — network will serve fresh data. */
  }
}

export function clearCacheNamespace(namespace: string): void {
  if (typeof window === 'undefined') return
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i)
      if (k?.startsWith(`${CACHE_PREFIX}${namespace}`)) keysToRemove.push(k)
    }
    keysToRemove.forEach((k) => {
      window.sessionStorage.removeItem(k)
    })
  } catch {
    /* ignore */
  }
}

// Test-only — exposes the literal storage key shape.
export const __test__buildKey = buildKey
