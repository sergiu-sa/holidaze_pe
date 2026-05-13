import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HERO_COVERS } from '../../lib/hero/covers'
import { _resetHomeCoverVisitsCacheForTests, useHomeCoverVisits } from '../useHomeCoverVisits'

const COUNT_KEY = 'holidaze:v1:home-cover-visits'
const CAP = HERO_COVERS.length

function stubReducedMotion(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce') ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

describe('useHomeCoverVisits', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetHomeCoverVisitsCacheForTests()
    stubReducedMotion(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns shouldShow: true on visit 1 and increments the count', () => {
    const { result } = renderHook(() => useHomeCoverVisits())
    expect(result.current.shouldShow).toBe(true)
    expect(localStorage.getItem(COUNT_KEY)).toBe('1')
  })

  it('returns shouldShow: true on every visit up to the cap', () => {
    // Walk visits 2 .. CAP — each fresh page-load should still play Act 2.
    for (let visit = 2; visit <= CAP; visit++) {
      localStorage.setItem(COUNT_KEY, String(visit - 1))
      _resetHomeCoverVisitsCacheForTests()
      const { result } = renderHook(() => useHomeCoverVisits())
      expect(result.current.shouldShow).toBe(true)
      expect(localStorage.getItem(COUNT_KEY)).toBe(String(visit))
    }
  })

  it('returns shouldShow: false once the cap is reached and does not increment past it', () => {
    localStorage.setItem(COUNT_KEY, String(CAP))
    const { result } = renderHook(() => useHomeCoverVisits())
    expect(result.current.shouldShow).toBe(false)
    expect(localStorage.getItem(COUNT_KEY)).toBe(String(CAP))
  })

  it('returns the same shouldShow on a second call within the same page-load (StrictMode safety)', () => {
    {
      const { result } = renderHook(() => useHomeCoverVisits())
      expect(result.current.shouldShow).toBe(true)
      expect(localStorage.getItem(COUNT_KEY)).toBe('1')
    }
    // Second hook mount within the same module load — cache should win, no second increment.
    {
      const { result } = renderHook(() => useHomeCoverVisits())
      expect(result.current.shouldShow).toBe(true)
      expect(localStorage.getItem(COUNT_KEY)).toBe('1')
    }
  })

  it('returns shouldShow: false when prefers-reduced-motion: reduce, and does not increment', () => {
    stubReducedMotion(true)
    const { result } = renderHook(() => useHomeCoverVisits())
    expect(result.current.shouldShow).toBe(false)
    expect(localStorage.getItem(COUNT_KEY)).toBeNull()
  })

  it('fails open (shouldShow: false) when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { result } = renderHook(() => useHomeCoverVisits())
    expect(result.current.shouldShow).toBe(false)
  })

  it('swallows localStorage.setItem failures and still returns shouldShow: true', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => {
      const { result } = renderHook(() => useHomeCoverVisits())
      expect(result.current.shouldShow).toBe(true)
    }).not.toThrow()
  })

  it('treats a malformed localStorage value as 0 visits', () => {
    localStorage.setItem(COUNT_KEY, 'not-a-number')
    const { result } = renderHook(() => useHomeCoverVisits())
    expect(result.current.shouldShow).toBe(true)
    expect(localStorage.getItem(COUNT_KEY)).toBe('1')
  })
})
