import { useCallback, useEffect, useRef, useState } from 'react'

import { getVenue } from '../api/venues'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'

export interface UseVenueState {
  data: Venue | null
  error: ApiError | Error | null
  isLoading: boolean
  refetch: () => void
}

export interface UseVenueOptions {
  /** Skip the fetch (e.g. when the route param hasn't resolved). */
  enabled?: boolean
}

export function useVenue(
  id: string | undefined,
  options: UseVenueOptions = {},
): UseVenueState {
  const enabled = (options.enabled ?? true) && Boolean(id)

  const [data, setData] = useState<Venue | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [refetchCounter, setRefetchCounter] = useState(0)

  const refetch = useCallback(() => {
    setRefetchCounter((n) => n + 1)
  }, [])

  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled || !id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear loading when `enabled` toggles off.
      setIsLoading(false)
      return
    }
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    // Drop stale data when the id changes so the user never sees the previous venue's content.
    setData(null)
    setError(null)
    setIsLoading(true)

    getVenue(id, { signal: controller.signal })
      .then((venue) => {
        if (controller.signal.aborted) return
        setData(venue)
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
  }, [id, enabled, refetchCounter])

  return { data, error, isLoading, refetch }
}
