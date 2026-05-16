export interface LiveSignalInput {
  totalVenues?: number
  isFallback?: boolean
  lastFetchedAt?: number | null
  /** Override `new Date(timestamp)` formatting — used in tests for determinism. */
  formatTime?: (timestamp: number) => string
}

function defaultFormatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Composes the right-side ruler label for routes backed by the venues cache.
 *
 *  - live + count + timestamp  → "32 venues · 12:14 · live"
 *  - fallback / cached source  → "32 venues · cached"
 *  - no data yet               → "— venues indexed"
 */
export function formatLiveSignal({
  totalVenues,
  isFallback,
  lastFetchedAt,
  formatTime = defaultFormatTime,
}: LiveSignalInput): string {
  if (totalVenues == null) return '— venues indexed'

  const noun = totalVenues === 1 ? 'venue' : 'venues'
  const head = `${String(totalVenues)} ${noun}`

  if (isFallback) return `${head} · cached`
  if (lastFetchedAt != null) return `${head} · ${formatTime(lastFetchedAt)} · live`
  return `${head} indexed`
}
