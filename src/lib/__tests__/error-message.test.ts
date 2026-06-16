import { describe, expect, it } from 'vitest'

import { ApiError } from '../../types/api'
import { toFriendlyMessage } from '../error-message'

const FALLBACK = 'Something went wrong. Please try again.'

describe('toFriendlyMessage', () => {
  it('shows a 400 validation message verbatim (user-actionable)', () => {
    const err = new ApiError(400, 'Image url is too long')
    expect(toFriendlyMessage(err, FALLBACK)).toBe('Image url is too long')
  })

  it('shows a 422 validation message verbatim', () => {
    const err = new ApiError(422, 'Guests must be 100 or fewer')
    expect(toFriendlyMessage(err, FALLBACK)).toBe('Guests must be 100 or fewer')
  })

  it('hides a network error (status 0) behind the fallback', () => {
    expect(toFriendlyMessage(new ApiError(0, 'Failed to fetch'), FALLBACK)).toBe(FALLBACK)
  })

  it('hides a 500 behind the fallback', () => {
    expect(toFriendlyMessage(new ApiError(500, 'Internal Server Error'), FALLBACK)).toBe(FALLBACK)
  })

  it('hides a plain Error behind the fallback', () => {
    expect(toFriendlyMessage(new Error('TypeError: x is undefined'), FALLBACK)).toBe(FALLBACK)
  })

  it('hides a non-Error throw behind the fallback', () => {
    expect(toFriendlyMessage('boom', FALLBACK)).toBe(FALLBACK)
  })
})
