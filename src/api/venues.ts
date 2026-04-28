import { FALLBACK_VENUES } from '../lib/fallback'
import { isUsable } from '../lib/isUsable'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'
import { readCache, writeCache } from './cache'
import { apiFetch } from './client'
import { type PaginationMeta, PaginationMetaSchema, VenueSchema } from './schemas'

const VENUES_NAMESPACE = 'venues'
const VENUE_NAMESPACE = 'venue'

export type VenueListSource = 'live' | 'cache' | 'fallback'

export interface VenueListResult {
  venues: Venue[]
  source: VenueListSource
  meta?: PaginationMeta
}

export interface ListVenuesOptions {
  page?: number
  limit?: number
  sort?: 'created' | 'updated' | 'name' | 'price' | 'rating'
  sortOrder?: 'asc' | 'desc'
  signal?: AbortSignal
}

export interface SearchVenuesOptions {
  q: string
  page?: number
  limit?: number
  signal?: AbortSignal
}

const MIN_USABLE_THRESHOLD = 4

function buildListPath(opts: ListVenuesOptions): string {
  const params = new URLSearchParams()
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  if (opts.sort) params.set('sort', opts.sort)
  if (opts.sortOrder) params.set('sortOrder', opts.sortOrder)
  const qs = params.toString()
  return `/venues${qs ? `?${qs}` : ''}`
}

function buildSearchPath(opts: SearchVenuesOptions): string {
  const params = new URLSearchParams({ q: opts.q })
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  return `/venues/search?${params.toString()}`
}

function parseAndFilter(raw: unknown): { venues: Venue[]; meta: PaginationMeta | undefined } {
  // Callers fetch list endpoints with apiFetch(..., { unwrap: false }) so the
  // full { data, meta } envelope arrives here for pagination preservation.
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: unknown } | null)?.data)
      ? ((raw as { data: unknown[] }).data)
      : []
  const meta =
    raw && typeof raw === 'object' && 'meta' in raw
      ? PaginationMetaSchema.safeParse((raw).meta).data
      : undefined

  const venues: Venue[] = []
  for (const item of arr) {
    const parsed = VenueSchema.safeParse(item)
    if (parsed.success && isUsable(parsed.data)) venues.push(parsed.data)
  }
  return { venues, meta }
}

// Falls back to FALLBACK_VENUES when the API errors or isUsable strips the
// response below MIN_USABLE_THRESHOLD. Cached per-query in sessionStorage.
export async function listVenues(opts: ListVenuesOptions = {}): Promise<VenueListResult> {
  const cacheKey = {
    namespace: VENUES_NAMESPACE,
    params: {
      page: opts.page,
      limit: opts.limit,
      sort: opts.sort,
      sortOrder: opts.sortOrder,
    },
  }

  const cached = readCache(cacheKey) as
    | { venues: Venue[]; meta: PaginationMeta | undefined }
    | null
  if (cached && cached.venues.length >= MIN_USABLE_THRESHOLD) {
    return { venues: cached.venues, meta: cached.meta, source: 'cache' }
  }

  const path = buildListPath({ ...opts, limit: opts.limit ?? 100 })
  try {
    // unwrap: false → get the full envelope so we keep pagination meta.
    const raw = await apiFetch<unknown>(path, { signal: opts.signal, unwrap: false })
    const { venues, meta } = parseAndFilter(raw)
    if (venues.length < MIN_USABLE_THRESHOLD) {
      return { venues: FALLBACK_VENUES, source: 'fallback' }
    }
    writeCache(cacheKey, { venues, meta })
    return { venues, meta, source: 'live' }
  } catch (err) {
    // Re-throw if the caller aborted; otherwise serve the fallback.
    if (err instanceof Error && err.name === 'AbortError') throw err
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return { venues: FALLBACK_VENUES, source: 'fallback' }
  }
}

// No fallback on search — an empty result is a legitimate "no matches", not a
// failure. Errors propagate to the calling hook.
export async function searchVenues(opts: SearchVenuesOptions): Promise<VenueListResult> {
  const path = buildSearchPath({ ...opts, limit: opts.limit ?? 50 })
  const raw = await apiFetch<unknown>(path, { signal: opts.signal, unwrap: false })
  const { venues, meta } = parseAndFilter(raw)
  return { venues, meta, source: 'live' }
}

export interface GetVenueOptions {
  signal?: AbortSignal
}

// No fallback on detail — a 404 stays a 404. `isUsable` is not applied either:
// a direct-link visitor gets the real response and the page renders best-effort.
export async function getVenue(id: string, opts: GetVenueOptions = {}): Promise<Venue> {
  const cacheKey = { namespace: VENUE_NAMESPACE, params: { id } }

  const cached = readCache(cacheKey) as Venue | null
  if (cached) return cached

  const path = `/venues/${encodeURIComponent(id)}?_owner=true&_bookings=true`
  const raw = await apiFetch<unknown>(path, { signal: opts.signal })

  const parsed = VenueSchema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiError(0, 'Venue response failed validation', parsed.error.issues)
  }

  writeCache(cacheKey, parsed.data)
  return parsed.data
}
