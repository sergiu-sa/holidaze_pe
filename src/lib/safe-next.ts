const DEFAULT_FALLBACK = '/profile'

// Guards the `?next=` redirect target on auth pages.
// Rejects: missing values, paths without a leading `/`, protocol-relative URLs
// (`//evil.com`, `/\evil.com`), and absolute URLs (`https://…`, `javascript:…`).
export function safeNext(
  raw: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (!raw) return fallback
  if (!raw.startsWith('/')) return fallback
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  return raw
}
