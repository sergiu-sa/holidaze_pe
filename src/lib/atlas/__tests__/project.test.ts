import { describe, expect, it } from 'vitest'

import { formatBounds, formatCoord, project, projectSvg } from '../project'

describe('project', () => {
  it('puts (0, 0) at the centre of the plate', () => {
    expect(project(0, 0)).toEqual({ x: 50, y: 50 })
  })

  it('places the prime meridian at x=50%', () => {
    const { x } = project(0, 0)
    expect(x).toBe(50)
  })

  it('puts the north pole at y=0%', () => {
    expect(project(90, 0).y).toBe(0)
  })

  it('puts the south pole at y=100%', () => {
    expect(project(-90, 0).y).toBe(100)
  })

  it('wraps east/west extremes to 0% and 100%', () => {
    expect(project(0, -180).x).toBe(0)
    expect(project(0, 180).x).toBe(100)
  })

  it('plots Tokyo above the equator and east of Greenwich', () => {
    const { x, y } = project(35.6762, 139.6503)
    expect(x).toBeGreaterThan(50)
    expect(y).toBeLessThan(50)
  })
})

describe('projectSvg', () => {
  it('translates lng/lat into SVG-space units', () => {
    expect(projectSvg(0, 0)).toEqual({ x: 180, y: 90 })
    expect(projectSvg(45, -90)).toEqual({ x: 90, y: 45 })
  })
})

describe('formatCoord', () => {
  it('uses N/S and E/W cardinals with one decimal', () => {
    expect(formatCoord(48.8566, 2.3522)).toBe('48.9°N 2.4°E')
    expect(formatCoord(-33.8688, 151.2093)).toBe('33.9°S 151.2°E')
    expect(formatCoord(40.7128, -74.006)).toBe('40.7°N 74.0°W')
  })

  it('treats the equator and prime meridian as N and E', () => {
    expect(formatCoord(0, 0)).toBe('0.0°N 0.0°E')
  })
})

describe('formatBounds', () => {
  it('returns an em-dash for an empty list', () => {
    expect(formatBounds([])).toBe('—')
  })

  it('summarises north→south and west→east extents', () => {
    const cities = [
      { lat: 60, lng: -120 },
      { lat: -30, lng: 150 },
      { lat: 0, lng: 0 },
    ]
    expect(formatBounds(cities)).toBe('60°N → 30°S · 120°W → 150°E')
  })
})
