import { useCallback, useEffect, useRef, useState } from 'react'

import { type PaginationMeta } from '../api/schemas'
import { listVenues, type ListVenuesOptions, type VenueListSource } from '../api/venues'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'

export interface UseVenuesState {
  data: Venue[] | null
  meta: PaginationMeta | null
  source: VenueListSource | null
  error: ApiError | Error | null
  isLoading: boolean
  isFallback: boolean
  refetch: () => void
}

export interface UseVenuesOptions extends Omit<ListVenuesOptions, 'signal'> {
  /** Skip the fetch entirely (useful when a parent gate hasn't resolved yet). */
  enabled?: boolean
}

export function useVenues(options: UseVenuesOptions = {}): UseVenuesState {
  const { enabled = true, page, limit, sort, sortOrder } = options
  // Serialize options so reference-unstable parents don't refire the effect.
  const cacheKey = JSON.stringify({ page, limit, sort, sortOrder })

  const [data, setData] = useState<Venue[] | null>(null)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [source, setSource] = useState<VenueListSource | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [refetchCounter, setRefetchCounter] = useState(0)

  const refetch = useCallback(() => {
    setRefetchCounter((n) => n + 1)
  }, [])

  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear loading when consumer toggles `enabled` off mid-flow.
      setIsLoading(false)
      return
    }
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setIsLoading(true)
    setError(null)

    listVenues({ page, limit, sort, sortOrder, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return
        setData(result.venues)
        setMeta(result.meta ?? null)
        setSource(result.source)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      })

    return () => {
      controller.abort()
    }
    // cacheKey is the real dep; destructured options aren't reference-stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, refetchCounter, enabled])

  return {
    data,
    meta,
    source,
    error,
    isLoading,
    isFallback: source === 'fallback',
    refetch,
  }
}
