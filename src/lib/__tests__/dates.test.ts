import { describe, expect, it } from 'vitest'

import type { Booking } from '../../types/booking'
import {
  addDays,
  addMonths,
  buildBookedSet,
  formatDay,
  isPast,
  isSameDay,
  isSameMonth,
  nightsBetween,
  parseToLocalDay,
  rangeHasBookedDay,
  startOfDay,
} from '../dates'

function makeBooking(dateFrom: string, dateTo: string, id = 'b1'): Booking {
  return {
    id,
    dateFrom,
    dateTo,
    guests: 2,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  }
}

describe('startOfDay', () => {
  it('zeroes time portion', () => {
    const d = new Date(2026, 5, 15, 14, 30, 22, 500)
    const s = startOfDay(d)
    expect(s.getHours()).toBe(0)
    expect(s.getMinutes()).toBe(0)
    expect(s.getSeconds()).toBe(0)
    expect(s.getMilliseconds()).toBe(0)
    expect(s.getDate()).toBe(15)
  })
})

describe('formatDay', () => {
  it('produces a YYYY-MM-DD string', () => {
    expect(formatDay(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(formatDay(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('addDays / addMonths', () => {
  it('adds days', () => {
    const start = new Date(2026, 4, 30)
    expect(formatDay(addDays(start, 3))).toBe('2026-06-02')
  })

  it('adds months, preserving day-of-month', () => {
    expect(formatDay(addMonths(new Date(2026, 10, 15), 2))).toBe('2027-01-15')
  })

  it('clamps day-of-month when target month is shorter', () => {
    // Jan 31 + 1 month → Feb 28 (2026 is non-leap)
    expect(formatDay(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28')
  })
})

describe('isSameDay / isSameMonth', () => {
  it('isSameDay ignores time', () => {
    expect(
      isSameDay(new Date(2026, 0, 1, 9, 0), new Date(2026, 0, 1, 23, 59)),
    ).toBe(true)
    expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false)
  })

  it('isSameMonth compares year+month', () => {
    expect(isSameMonth(new Date(2026, 5, 1), new Date(2026, 5, 30))).toBe(true)
    expect(isSameMonth(new Date(2026, 5, 1), new Date(2026, 6, 1))).toBe(false)
  })
})

describe('isPast', () => {
  it('treats today as not past', () => {
    const today = startOfDay(new Date(2026, 5, 15))
    expect(isPast(new Date(2026, 5, 15), today)).toBe(false)
  })

  it('treats yesterday as past', () => {
    const today = startOfDay(new Date(2026, 5, 15))
    expect(isPast(new Date(2026, 5, 14), today)).toBe(true)
  })
})

describe('nightsBetween', () => {
  it('returns 0 for same-day in/out', () => {
    expect(nightsBetween(new Date(2026, 5, 15), new Date(2026, 5, 15))).toBe(0)
  })

  it('counts nights, not days', () => {
    expect(nightsBetween(new Date(2026, 5, 15), new Date(2026, 5, 18))).toBe(3)
  })

  it('clamps negative ranges to 0', () => {
    expect(nightsBetween(new Date(2026, 5, 18), new Date(2026, 5, 15))).toBe(0)
  })
})

describe('buildBookedSet', () => {
  it('returns an empty set for undefined / empty bookings', () => {
    expect(buildBookedSet(undefined).size).toBe(0)
    expect(buildBookedSet([]).size).toBe(0)
  })

  it('treats dateTo as exclusive (departure day is bookable)', () => {
    // 3-night stay: 15, 16, 17 booked; 18 (departure) is free.
    const set = buildBookedSet([
      makeBooking('2026-06-15T00:00:00.000Z', '2026-06-18T00:00:00.000Z'),
    ])
    expect(set.has('2026-06-15')).toBe(true)
    expect(set.has('2026-06-16')).toBe(true)
    expect(set.has('2026-06-17')).toBe(true)
    expect(set.has('2026-06-18')).toBe(false)
    expect(set.size).toBe(3)
  })

  it('unions multiple bookings', () => {
    const set = buildBookedSet([
      makeBooking('2026-06-15T00:00:00.000Z', '2026-06-17T00:00:00.000Z', 'a'),
      makeBooking('2026-06-20T00:00:00.000Z', '2026-06-22T00:00:00.000Z', 'b'),
    ])
    expect(set.size).toBe(4)
    expect(set.has('2026-06-15')).toBe(true)
    expect(set.has('2026-06-20')).toBe(true)
    expect(set.has('2026-06-18')).toBe(false)
  })
})

describe('rangeHasBookedDay', () => {
  it('returns true when range crosses a booked day', () => {
    const set = new Set(['2026-06-16'])
    expect(rangeHasBookedDay(new Date(2026, 5, 15), new Date(2026, 5, 18), set)).toBe(true)
  })

  it('returns false when range is clear', () => {
    const set = new Set(['2026-06-20'])
    expect(rangeHasBookedDay(new Date(2026, 5, 15), new Date(2026, 5, 18), set)).toBe(false)
  })

  it('treats range end as exclusive', () => {
    const set = new Set(['2026-06-18'])
    expect(rangeHasBookedDay(new Date(2026, 5, 15), new Date(2026, 5, 18), set)).toBe(false)
  })
})

describe('parseToLocalDay', () => {
  it('returns a date pinned to local midnight', () => {
    const d = parseToLocalDay('2026-06-15T14:30:00.000Z')
    expect(d.getHours()).toBe(0)
  })
})
