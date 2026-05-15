import { describe, expect, it } from 'vitest'

import { computeScrollProgress } from '../useScrollProgress'

describe('computeScrollProgress', () => {
  it('returns 0 when the page is not scrollable (height ≤ viewport)', () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0)
    expect(computeScrollProgress(0, 500, 800)).toBe(0)
    expect(computeScrollProgress(0, 0, 800)).toBe(0)
  })

  it('returns 0 when scrollY is at the top', () => {
    expect(computeScrollProgress(0, 2000, 800)).toBe(0)
  })

  it('returns 1 when scrollY is at the bottom', () => {
    expect(computeScrollProgress(1200, 2000, 800)).toBe(1)
  })

  it('clamps over-scroll above 1', () => {
    expect(computeScrollProgress(9000, 2000, 800)).toBe(1)
  })

  it('clamps negative scrollY to 0', () => {
    expect(computeScrollProgress(-50, 2000, 800)).toBe(0)
  })

  it('interpolates linearly between 0 and 1', () => {
    expect(computeScrollProgress(600, 2000, 800)).toBeCloseTo(0.5, 5)
    expect(computeScrollProgress(300, 2000, 800)).toBeCloseTo(0.25, 5)
  })
})
