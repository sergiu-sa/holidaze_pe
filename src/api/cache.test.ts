import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __test__buildKey,
  bustVenueCache,
  clearCacheNamespace,
  readCache,
  writeCache,
} from './cache'

describe('cache — buildKey', () => {
  it('returns prefix + namespace when no params', () => {
    expect(__test__buildKey({ namespace: 'venues' })).toBe('holidaze:v1:cache:venues')
  })

  it('serializes params alphabetically (so {a,b} === {b,a})', () => {
    const k1 = __test__buildKey({ namespace: 'venues', params: { page: 2, limit: 24 } })
    const k2 = __test__buildKey({ namespace: 'venues', params: { limit: 24, page: 2 } })
    expect(k1).toBe(k2)
    expect(k1).toBe('holidaze:v1:cache:venues?limit=24&page=2')
  })

  it('drops null/undefined/empty-string params from the key', () => {
    expect(
      __test__buildKey({ namespace: 'venues', params: { q: '', page: 1 } }),
    ).toBe('holidaze:v1:cache:venues?page=1')
  })
})

describe('cache — read/write round-trip', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('writes data and reads it back within TTL', () => {
    writeCache({ namespace: 'venues' }, [{ id: '1' }])
    expect(readCache({ namespace: 'venues' })).toEqual([{ id: '1' }])
  })

  it('evicts entries older than the TTL', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    writeCache({ namespace: 'venues' }, [{ id: '1' }])
    vi.setSystemTime(new Date('2026-01-01T00:11:00Z'))
    expect(readCache({ namespace: 'venues' })).toBeNull()
  })

  it('respects a custom TTL', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    writeCache({ namespace: 'venues' }, [{ id: '1' }])
    vi.setSystemTime(new Date('2026-01-01T00:00:30Z'))
    expect(readCache({ namespace: 'venues' }, 60_000)).toEqual([{ id: '1' }])
    expect(readCache({ namespace: 'venues' }, 10_000)).toBeNull()
  })

  it('returns null and evicts when stored value is malformed JSON', () => {
    sessionStorage.setItem('holidaze:v1:cache:venues', 'not-json')
    expect(readCache({ namespace: 'venues' })).toBeNull()
    expect(sessionStorage.getItem('holidaze:v1:cache:venues')).toBeNull()
  })

  it('different param sets cache independently', () => {
    writeCache({ namespace: 'venues', params: { page: 1 } }, [{ id: 'a' }])
    writeCache({ namespace: 'venues', params: { page: 2 } }, [{ id: 'b' }])
    expect(readCache({ namespace: 'venues', params: { page: 1 } })).toEqual([{ id: 'a' }])
    expect(readCache({ namespace: 'venues', params: { page: 2 } })).toEqual([{ id: 'b' }])
  })
})

describe('cache — clearCacheNamespace', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('removes every key under a namespace, leaves others alone', () => {
    writeCache({ namespace: 'venues', params: { page: 1 } }, ['v1'])
    writeCache({ namespace: 'venues', params: { page: 2 } }, ['v2'])
    writeCache({ namespace: 'profiles' }, ['p1'])
    clearCacheNamespace('venues')
    expect(readCache({ namespace: 'venues', params: { page: 1 } })).toBeNull()
    expect(readCache({ namespace: 'venues', params: { page: 2 } })).toBeNull()
    expect(readCache({ namespace: 'profiles' })).toEqual(['p1'])
  })
})

describe('bustVenueCache', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('removes the cached entry for the given venue id', () => {
    writeCache({ namespace: 'venue', params: { id: 'v-1' } }, { id: 'v-1', name: 'Test' })
    expect(readCache({ namespace: 'venue', params: { id: 'v-1' } })).not.toBeNull()

    bustVenueCache('v-1')

    expect(readCache({ namespace: 'venue', params: { id: 'v-1' } })).toBeNull()
  })

  it('does not affect other venue cache entries', () => {
    writeCache({ namespace: 'venue', params: { id: 'v-1' } }, { id: 'v-1' })
    writeCache({ namespace: 'venue', params: { id: 'v-2' } }, { id: 'v-2' })

    bustVenueCache('v-1')

    expect(readCache({ namespace: 'venue', params: { id: 'v-1' } })).toBeNull()
    expect(readCache({ namespace: 'venue', params: { id: 'v-2' } })).not.toBeNull()
  })
})
