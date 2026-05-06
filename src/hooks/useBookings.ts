import { useCallback, useEffect, useState } from 'react'

import { listBookings } from '../api/bookings'
import { type Booking } from '../api/schemas'
import { ApiError } from '../types/api'

export interface UseBookingsOptions {
  customer?: boolean
  venue?: boolean
  enabled?: boolean
}

export interface UseBookingsState {
  data: Booking[] | null
  error: ApiError | Error | null
  isLoading: boolean
  refetch: () => void
}

// listBookings doesn't take an AbortSignal, so we drop stale resolutions
// with a cancelled flag instead of an AbortController.
export function useBookings(options: UseBookingsOptions = {}): UseBookingsState {
  const { customer, venue, enabled = true } = options

  const [data, setData] = useState<Booking[] | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [refetchCounter, setRefetchCounter] = useState(0)

  const refetch = useCallback(() => {
    setRefetchCounter((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear loading when consumer toggles `enabled` off mid-flow.
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    listBookings({ customer, venue })
      .then((bookings) => {
        if (cancelled) return
        setData(bookings)
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
  }, [customer, venue, enabled, refetchCounter])

  return { data, error, isLoading, refetch }
}
