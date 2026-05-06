import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { bustVenueCache, readCache, writeCache } from '../../api/cache'
import { clearSession, setSession } from '../../api/session'
import {
  createBookingHappy,
  createBookingValidationError,
} from '../../test/msw/booking-handlers'
import { server } from '../../test/msw/server'
import { useCreateBooking } from '../useCreateBooking'

const TEST_SESSION = {
  accessToken: 'tok_test',
  apiKey: 'key_test',
  name: 'sergiu',
  email: 'a@stud.noroff.no',
  venueManager: false,
}

const VALID_INPUT = {
  dateFrom: '2026-06-01T00:00:00.000Z',
  dateTo: '2026-06-04T00:00:00.000Z',
  guests: 2,
  venueId: 'v-1',
}

function Probe() {
  const { mutate, isPending, error } = useCreateBooking('v-1')
  const handleClick = () => {
    void (async () => {
      try {
        const b = await mutate(VALID_INPUT)
        const el = screen.queryByTestId('booking-id')
        if (el) el.textContent = b.id
      } catch {
        /* swallowed; error state set */
      }
    })()
  }
  return (
    <div>
      <p data-testid="status">{isPending ? 'pending' : error ? 'error' : 'idle'}</p>
      <p data-testid="error-status">{error?.status ?? ''}</p>
      <p data-testid="booking-id" />
      <button type="button" onClick={handleClick}>
        book
      </button>
    </div>
  )
}

beforeEach(() => {
  clearSession()
  setSession(TEST_SESSION)
})
afterEach(() => {
  clearSession()
})

describe('useCreateBooking', () => {
  it('calls createBooking, busts venue cache on success, returns the booking', async () => {
    server.use(createBookingHappy)
    writeCache({ namespace: 'venue', params: { id: 'v-1' } }, { id: 'v-1', name: 'X' })
    expect(readCache({ namespace: 'venue', params: { id: 'v-1' } })).not.toBeNull()

    render(<Probe />)
    await userEvent.click(screen.getByText('book'))

    await waitFor(() => {
      expect(screen.getByTestId('booking-id')).toHaveTextContent('b-test-uuid')
    })
    expect(readCache({ namespace: 'venue', params: { id: 'v-1' } })).toBeNull()
  })

  it('bubbles ApiError on failure, populates error state, leaves cache untouched', async () => {
    server.use(createBookingValidationError)
    writeCache({ namespace: 'venue', params: { id: 'v-1' } }, { id: 'v-1', name: 'X' })

    render(<Probe />)
    await userEvent.click(screen.getByText('book'))

    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('400')
    })
    // Cache untouched — failed mutations don't bust.
    expect(readCache({ namespace: 'venue', params: { id: 'v-1' } })).not.toBeNull()
    bustVenueCache('v-1') // cleanup
  })
})
