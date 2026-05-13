import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { _resetHeroCoverCacheForTests, HERO_COVERS, pickHeroCover } from '../covers'

const COVER_IDX_KEY = 'holidaze:v1:home-cover-rotation-idx'

describe('pickHeroCover', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetHeroCoverCacheForTests()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the first cover on a fresh page-load (no stored index)', () => {
    const cover = pickHeroCover()
    expect(cover).toBe(HERO_COVERS[0])
    expect(localStorage.getItem(COVER_IDX_KEY)).toBe('0')
  })

  it('advances by one on each page-load (re-imported between calls)', () => {
    // Simulate page loads by resetting the module-level cache between calls.
    expect(pickHeroCover().key).toBe(HERO_COVERS[0].key)

    _resetHeroCoverCacheForTests()
    expect(pickHeroCover().key).toBe(HERO_COVERS[1].key)

    _resetHeroCoverCacheForTests()
    expect(pickHeroCover().key).toBe(HERO_COVERS[2].key)

    _resetHeroCoverCacheForTests()
    expect(pickHeroCover().key).toBe(HERO_COVERS[3].key)
  })

  it('wraps back to the first cover after N page-loads', () => {
    HERO_COVERS.forEach(() => {
      pickHeroCover()
      _resetHeroCoverCacheForTests()
    })
    // Next call should land on cover 0 again.
    expect(pickHeroCover().key).toBe(HERO_COVERS[0].key)
  })

  it('returns the same cover when called multiple times in one page-load (StrictMode safety)', () => {
    const a = pickHeroCover()
    const b = pickHeroCover()
    const c = pickHeroCover()
    expect(a).toBe(b)
    expect(b).toBe(c)
    expect(localStorage.getItem(COVER_IDX_KEY)).toBe('0')
  })

  it('treats a malformed stored index as fresh state', () => {
    localStorage.setItem(COVER_IDX_KEY, 'not-a-number')
    expect(pickHeroCover()).toBe(HERO_COVERS[0])
  })

  it('falls open (returns first cover, no throw) when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => pickHeroCover()).not.toThrow()
    expect(pickHeroCover()).toBe(HERO_COVERS[0])
  })

  it('swallows localStorage.setItem failures and still returns a cover', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => pickHeroCover()).not.toThrow()
    expect(pickHeroCover()).toBe(HERO_COVERS[0])
  })
})
