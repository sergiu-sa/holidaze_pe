import { describe, expect, it } from 'vitest'

import { ISSUE_LABEL, rulerForRoute } from '../rulerForRoute'

describe('rulerForRoute', () => {
  it('keeps the issue label on every route (left chip is global)', () => {
    expect(rulerForRoute('/').left).toBe(ISSUE_LABEL)
    expect(rulerForRoute('/venues').left).toBe(ISSUE_LABEL)
    expect(rulerForRoute('/profile/avatar').left).toBe(ISSUE_LABEL)
    expect(rulerForRoute('/bookings/abc-123').left).toBe(ISSUE_LABEL)
  })

  it('returns a "venues indexed" placeholder for data-backed routes when no live signal is supplied', () => {
    expect(rulerForRoute('/').right).toBe('— venues indexed')
    expect(rulerForRoute('/venues').right).toBe('— venues indexed')
    expect(rulerForRoute('/atlas').right).toBe('— venues indexed')
  })

  it('formats the live venues count when a signal is supplied', () => {
    expect(rulerForRoute('/', { totalVenues: 32 }).right).toBe('32 venues indexed')
    expect(rulerForRoute('/venues', { totalVenues: 1 }).right).toBe('1 venue indexed')
    expect(rulerForRoute('/atlas', { totalVenues: 100 }).right).toBe('100 venues indexed')
  })

  it('appends a timestamp + live marker when the fetch resolved', () => {
    const formatTime = () => '12:14'
    expect(
      rulerForRoute('/', { totalVenues: 32, lastFetchedAt: 0, formatTime }).right,
    ).toBe('32 venues · 12:14 · live')
    expect(
      rulerForRoute('/atlas', { totalVenues: 14, lastFetchedAt: 0, formatTime }).right,
    ).toBe('14 venues · 12:14 · live')
  })

  it('marks the right label as cached when the source is the fallback list', () => {
    expect(
      rulerForRoute('/venues', { totalVenues: 6, isFallback: true, lastFetchedAt: 0 }).right,
    ).toBe('6 venues · cached')
  })

  it('uses editorial copy on non-data routes', () => {
    expect(rulerForRoute('/hosts').right).toBe('Charter · Spring 2026')
    expect(rulerForRoute('/login').right).toBe('Plate · N 60.39° E 5.32°')
    expect(rulerForRoute('/register').right).toBe('New reader · Spring 2026')
    expect(rulerForRoute('/profile').right).toBe('Your atlas')
    expect(rulerForRoute('/profile/bookings').right).toBe('Your trips')
    expect(rulerForRoute('/profile/avatar').right).toBe('Your face')
    expect(rulerForRoute('/profile/venues').right).toBe('Your places')
    expect(rulerForRoute('/profile/venues/new').right).toBe('A new venue')
    expect(rulerForRoute('/profile/venues/abc/edit').right).toBe('Editing a venue')
    expect(rulerForRoute('/profile/venues/abc/bookings').right).toBe("Who's coming")
  })

  it('handles dynamic segments via pattern matching', () => {
    expect(rulerForRoute('/venues/zzz-id').right).toBe('—')
    expect(rulerForRoute('/bookings/zzz-id').right).toBe('Receipt')
  })

  it('falls back to a hairline placeholder for unknown paths', () => {
    expect(rulerForRoute('/something-unknown').right).toBe('—')
  })
})
