import { describe, expect, it } from 'vitest'

import { safeNext } from '../safe-next'

describe('safeNext', () => {
  it('passes through a same-origin relative path', () => {
    expect(safeNext('/profile/bookings')).toBe('/profile/bookings')
  })

  it('passes through a root-only path', () => {
    expect(safeNext('/')).toBe('/')
  })

  it('returns the default fallback for null', () => {
    expect(safeNext(null)).toBe('/profile')
  })

  it('returns the default fallback for undefined', () => {
    expect(safeNext(undefined)).toBe('/profile')
  })

  it('returns the default fallback for an empty string', () => {
    expect(safeNext('')).toBe('/profile')
  })

  it('rejects a protocol-relative URL (//evil.com)', () => {
    expect(safeNext('//evil.com/path')).toBe('/profile')
  })

  it('rejects a backslash-protocol-relative URL (/\\evil.com)', () => {
    expect(safeNext('/\\evil.com')).toBe('/profile')
  })

  it('rejects an absolute https URL', () => {
    expect(safeNext('https://evil.com/path')).toBe('/profile')
  })

  it('rejects a javascript: URL', () => {
    expect(safeNext('javascript:alert(1)')).toBe('/profile')
  })

  it('rejects a relative path without a leading slash', () => {
    expect(safeNext('profile/bookings')).toBe('/profile')
  })

  it('honours a custom fallback when provided', () => {
    expect(safeNext(null, '/login')).toBe('/login')
    expect(safeNext('https://evil.com', '/login')).toBe('/login')
  })
})
