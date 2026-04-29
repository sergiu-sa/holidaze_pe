import { describe, expect, it } from 'vitest'

import { bearingFromCentre, centroid } from '../centroid'

describe('centroid', () => {
  it('returns null for an empty list', () => {
    expect(centroid([])).toBeNull()
  })

  it('averages lat/lng of valid points', () => {
    const c = centroid([
      { lat: 50, lng: 0 },
      { lat: -50, lng: 0 },
    ])
    expect(c).toEqual({ lat: 0, lng: 0 })
  })

  it('skips non-finite values', () => {
    const c = centroid([
      { lat: 60, lng: 10 },
      { lat: NaN, lng: 0 },
    ])
    expect(c).toEqual({ lat: 60, lng: 10 })
  })
})

describe('bearingFromCentre', () => {
  it('points due North for +lat / 0 lng', () => {
    expect(Math.round(bearingFromCentre({ lat: 50, lng: 0 }))).toBe(0)
  })

  it('points East for 0 lat / +lng', () => {
    expect(Math.round(bearingFromCentre({ lat: 0, lng: 50 }))).toBe(90)
  })

  it('points South for -lat / 0 lng', () => {
    expect(Math.round(bearingFromCentre({ lat: -50, lng: 0 }))).toBe(180)
  })
})
