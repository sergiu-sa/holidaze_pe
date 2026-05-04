import type { Booking } from '../types/booking'

// Date helpers for the availability calendar. Dates are pinned to local midnight
// so day comparisons don't drift across timezone boundaries.

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function parseToLocalDay(iso: string): Date {
  return startOfDay(new Date(iso))
}

export function formatDay(date: Date): string {
  const y = String(date.getFullYear())
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Preserves day-of-month, clamping at end-of-month (Jan 31 + 1 → Feb 28, not March).
export function addMonths(date: Date, n: number): Date {
  const result = new Date(date)
  const targetMonth = date.getMonth() + n
  // Move to day 1 first so setMonth never rolls over into a longer month.
  result.setDate(1)
  result.setMonth(targetMonth)
  const targetMonthLength = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate()
  result.setDate(Math.min(date.getDate(), targetMonthLength))
  return result
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function isPast(date: Date, today: Date = startOfDay(new Date())): boolean {
  return startOfDay(date).getTime() < today.getTime()
}

export function nightsBetween(from: Date, to: Date): number {
  const diff = startOfDay(to).getTime() - startOfDay(from).getTime()
  return Math.max(0, Math.round(diff / ONE_DAY_MS))
}

// Departure day is exclusive — same-day turnover is allowed (a guest checks
// out in the morning, the next checks in that afternoon).
export function buildBookedSet(bookings: Booking[] | undefined): Set<string> {
  const set = new Set<string>()
  if (!bookings) return set

  for (const booking of bookings) {
    const from = parseToLocalDay(booking.dateFrom)
    const to = parseToLocalDay(booking.dateTo)
    for (let cursor = from; cursor < to; cursor = addDays(cursor, 1)) {
      set.add(formatDay(cursor))
    }
  }
  return set
}

export function rangeHasBookedDay(
  from: Date,
  to: Date,
  bookedSet: Set<string>,
): boolean {
  for (let cursor = startOfDay(from); cursor < startOfDay(to); cursor = addDays(cursor, 1)) {
    if (bookedSet.has(formatDay(cursor))) return true
  }
  return false
}

// Alias kept in step with the slice spec's `rangeHasBooked` naming.
export const rangeHasBooked = rangeHasBookedDay

const MONTH_TITLE = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

export function formatMonthTitle(date: Date): string {
  return MONTH_TITLE.format(date)
}

const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// Receipt-style long form ("4 June 2026"). Accepts an ISO string or Date.
export function formatLongDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input
  return LONG_DATE.format(date)
}
