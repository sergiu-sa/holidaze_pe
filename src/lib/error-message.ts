import { ApiError } from '../types/api'

// Noroff validation errors (400/422) carry short, human-readable field messages
// worth showing verbatim (e.g. "Image url is too long"). Everything else —
// network drops (status 0), auth (401/403), not-found, and 5xx — is technical
// noise, so callers get a friendly fallback and the raw error is logged in dev.
export function toFriendlyMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && (err.status === 400 || err.status === 422)) {
    const detail = err.message.trim()
    if (detail) return detail
  }
  if (import.meta.env.DEV) console.error(err)
  return fallback
}
