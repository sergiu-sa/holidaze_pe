import { useCallback, useEffect, useRef, useState } from 'react'

import { type PaginationMeta } from '../api/schemas'
import { searchVenues } from '../api/venues'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'

export interface UseVenueSearchState {
  data: Venue[] | null
  meta: PaginationMeta | null
  error: ApiError | Error | null
  isLoading: boolean
  /** True between keystroke and request fire. */
  isDebouncing: boolean
}

export interface UseVenueSearchOptions {
  q: string
  page?: number
  limit?: number
  /** Debounce window in ms. Default 300. Set to 0 to disable. */
  debounceMs?: number
}

export function useVenueSearch({
  q,
  page,
  limit,
  debounceMs = 300,
}: UseVenueSearchOptions): UseVenueSearchState {
  const [data, setData] = useState<Venue[] | null>(null)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)

  const controllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = useCallback(() => {
    controllerRef.current?.abort()
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    cleanup()

    const trimmed = q.trim()
    if (!trimmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear results when query is emptied.
      setData(null)
      setMeta(null)
      setError(null)
      setIsLoading(false)
      setIsDebouncing(false)
      return
    }

    setIsDebouncing(true)

    debounceTimerRef.current = setTimeout(() => {
      setIsDebouncing(false)
      setIsLoading(true)
      setError(null)
      const controller = new AbortController()
      controllerRef.current = controller

      searchVenues({ q: trimmed, page, limit, signal: controller.signal })
        .then((result) => {
          if (controller.signal.aborted) return
          setData(result.venues)
          setMeta(result.meta ?? null)
          setIsLoading(false)
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          if (err instanceof Error && err.name === 'AbortError') return
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        })
    }, debounceMs)

    return cleanup
  }, [q, page, limit, debounceMs, cleanup])

  return { data, meta, error, isLoading, isDebouncing }
}
