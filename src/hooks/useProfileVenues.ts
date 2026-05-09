import { useCallback, useEffect, useState } from 'react'

import { getProfileVenues } from '../api/profiles'
import { ApiError } from '../types/api'
import type { Venue } from '../types/venue'
import { useAuth } from './useAuth'

export interface UseProfileVenuesState {
  data: Venue[] | null
  error: ApiError | Error | null
  isLoading: boolean
  refetch: () => void
}

export function useProfileVenues(): UseProfileVenuesState {
  const { user } = useAuth()
  const name = user?.name ?? null

  const [data, setData] = useState<Venue[] | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(name))
  const [counter, setCounter] = useState(0)

  const refetch = useCallback(() => {
    setCounter((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear loading/data when the user signs out.
      setIsLoading(false)
      setData(null)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    getProfileVenues(name, { bookings: true })
      .then((list) => {
        if (cancelled) return
        setData(list)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [name, counter])

  return { data, error, isLoading, refetch }
}
