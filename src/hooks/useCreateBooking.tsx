import { useCallback, useState } from 'react'

import { createBooking } from '../api/bookings'
import { bustVenueCache } from '../api/cache'
import { type Booking, type CreateBookingInput } from '../api/schemas'
import { ApiError } from '../types/api'

export interface UseCreateBookingReturn {
  mutate: (input: CreateBookingInput) => Promise<Booking>
  isPending: boolean
  error: ApiError | null
  reset: () => void
}

export function useCreateBooking(venueId: string): UseCreateBookingReturn {
  const [isPending, setPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(
    async (input: CreateBookingInput) => {
      setPending(true)
      setError(null)
      try {
        const booking = await createBooking(input)
        bustVenueCache(venueId)
        return booking
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : new ApiError(0, 'Network error')
        setError(apiErr)
        throw apiErr
      } finally {
        setPending(false)
      }
    },
    [venueId],
  )

  const reset = useCallback(() => {
    setError(null)
    setPending(false)
  }, [])

  return { mutate, isPending, error, reset }
}
