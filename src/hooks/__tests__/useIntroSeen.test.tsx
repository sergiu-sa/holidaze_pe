import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useIntroSeen } from '../useIntroSeen'

const KEY = 'holidaze:v1:intro-seen'

describe('useIntroSeen', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns seen: false when localStorage has no flag', () => {
    const { result } = renderHook(() => useIntroSeen())
    expect(result.current.seen).toBe(false)
  })

  it('returns seen: true when localStorage has flag "1"', () => {
    localStorage.setItem(KEY, '1')
    const { result } = renderHook(() => useIntroSeen())
    expect(result.current.seen).toBe(true)
  })

  it('markSeen() writes "1" to localStorage and updates seen', () => {
    const { result } = renderHook(() => useIntroSeen())
    expect(result.current.seen).toBe(false)

    act(() => {
      result.current.markSeen()
    })

    expect(localStorage.getItem(KEY)).toBe('1')
    expect(result.current.seen).toBe(true)
  })

  it('fails open (seen: true) when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: localStorage blocked')
    })
    const { result } = renderHook(() => useIntroSeen())
    expect(result.current.seen).toBe(true)
  })

  it('swallows localStorage.setItem failures during markSeen()', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useIntroSeen())
    expect(() => {
      act(() => {
        result.current.markSeen()
      })
    }).not.toThrow()
    expect(result.current.seen).toBe(true)
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})
