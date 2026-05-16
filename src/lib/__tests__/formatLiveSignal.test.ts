import { describe, expect, it } from 'vitest'

import { formatLiveSignal } from '../formatLiveSignal'

const fixedClock = () => '12:14'

describe('formatLiveSignal', () => {
  it('returns the loading placeholder when no count is known yet', () => {
    expect(formatLiveSignal({})).toBe('— venues indexed')
    expect(formatLiveSignal({ totalVenues: undefined })).toBe('— venues indexed')
  })

  it('formats a live count + timestamp when fetch succeeded', () => {
    expect(
      formatLiveSignal({ totalVenues: 32, lastFetchedAt: 0, formatTime: fixedClock }),
    ).toBe('32 venues · 12:14 · live')
  })

  it('singularises when the count is exactly 1', () => {
    expect(
      formatLiveSignal({ totalVenues: 1, lastFetchedAt: 0, formatTime: fixedClock }),
    ).toBe('1 venue · 12:14 · live')
  })

  it('swaps to "cached" suffix when isFallback is true', () => {
    expect(
      formatLiveSignal({ totalVenues: 6, isFallback: true, lastFetchedAt: 0, formatTime: fixedClock }),
    ).toBe('6 venues · cached')
  })

  it('falls back to "indexed" when count exists but the timestamp is missing', () => {
    expect(formatLiveSignal({ totalVenues: 32 })).toBe('32 venues indexed')
  })

  it('uses the platform locale formatter by default', () => {
    const result = formatLiveSignal({ totalVenues: 5, lastFetchedAt: Date.UTC(2026, 4, 15, 9, 7) })
    expect(result).toMatch(/^5 venues · \d{2}:\d{2} · live$/)
  })
})
