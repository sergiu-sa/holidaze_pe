import { useCallback, useMemo, useState } from 'react'

import {
  addDays,
  addMonths,
  formatDay,
  isPast,
  nightsBetween,
  rangeHasBookedDay,
  startOfDay,
} from '../lib/dates'

// State for the availability calendar: selected range, focused day, visible month.
// No DOM here — components wire actions to events.

export type FocusDirection =
  | 'day-left'
  | 'day-right'
  | 'week-up'
  | 'week-down'
  | 'month-prev'
  | 'month-next'
  | 'week-start'
  | 'week-end'

export interface UseDateRangeOptions {
  bookedSet: Set<string>
  /** Override "today" for tests. Defaults to startOfDay(new Date()). */
  today?: Date
  /** Initial focused day. Defaults to today. */
  initialFocused?: Date
}

export interface UseDateRangeReturn {
  from: Date | null
  to: Date | null
  focused: Date
  viewMonth: Date
  today: Date
  bookedSet: Set<string>
  nights: number
  canGoPrev: boolean
  selectDate: (date: Date) => void
  setFocused: (date: Date) => void
  moveFocus: (direction: FocusDirection) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  clear: () => void
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function useDateRange(options: UseDateRangeOptions): UseDateRangeReturn {
  const { bookedSet } = options
  const today = useMemo(
    () => options.today ?? startOfDay(new Date()),
    [options.today],
  )
  const todayMonth = useMemo(() => startOfMonth(today), [today])

  const [from, setFrom] = useState<Date | null>(null)
  const [to, setTo] = useState<Date | null>(null)
  const [focused, setFocusedState] = useState<Date>(
    options.initialFocused ?? today,
  )
  const [viewMonth, setViewMonth] = useState<Date>(todayMonth)

  const canGoPrev = viewMonth.getTime() > todayMonth.getTime()

  const nights = useMemo(() => (from && to ? nightsBetween(from, to) : 0), [from, to])

  // Click 1 sets arrival; click 2 sets departure. A click on/before arrival,
  // or a range that crosses a booked night, restarts from the clicked day.
  const selectDate = useCallback(
    (date: Date) => {
      const day = startOfDay(date)
      if (isPast(day, today)) return
      if (bookedSet.has(formatDay(day))) return

      if (!from || to) {
        setFrom(day)
        setTo(null)
        return
      }
      if (day.getTime() <= from.getTime()) {
        setFrom(day)
        setTo(null)
        return
      }
      if (rangeHasBookedDay(from, day, bookedSet)) {
        setFrom(day)
        setTo(null)
        return
      }
      setTo(day)
    },
    [from, to, today, bookedSet],
  )

  const setFocused = useCallback(
    (date: Date) => {
      const day = startOfDay(date)
      // The first day of the current month is the floor — past days aren't focusable.
      const clamped = day.getTime() < todayMonth.getTime() ? todayMonth : day
      const viewEnd = addMonths(viewMonth, 2)
      if (clamped.getTime() < viewMonth.getTime()) {
        setViewMonth(startOfMonth(clamped))
      } else if (clamped.getTime() >= viewEnd.getTime()) {
        // Place the focused day in the right-hand month of the new view.
        setViewMonth(addMonths(startOfMonth(clamped), -1))
      }
      setFocusedState(clamped)
    },
    [viewMonth, todayMonth],
  )

  const moveFocus = useCallback(
    (direction: FocusDirection) => {
      let next: Date = focused
      switch (direction) {
        case 'day-left':
          next = addDays(focused, -1)
          break
        case 'day-right':
          next = addDays(focused, 1)
          break
        case 'week-up':
          next = addDays(focused, -7)
          break
        case 'week-down':
          next = addDays(focused, 7)
          break
        case 'month-prev':
          next = addMonths(focused, -1)
          break
        case 'month-next':
          next = addMonths(focused, 1)
          break
        case 'week-start': {
          const dow = (focused.getDay() + 6) % 7
          next = addDays(focused, -dow)
          break
        }
        case 'week-end': {
          const dow = (focused.getDay() + 6) % 7
          next = addDays(focused, 6 - dow)
          break
        }
      }
      setFocused(next)
    },
    [focused, setFocused],
  )

  const goToPrevMonth = useCallback(() => {
    const prev = addMonths(viewMonth, -1)
    if (prev.getTime() < todayMonth.getTime()) return
    setViewMonth(prev)
  }, [viewMonth, todayMonth])

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => addMonths(m, 1))
  }, [])

  const clear = useCallback(() => {
    setFrom(null)
    setTo(null)
  }, [])

  return {
    from,
    to,
    focused,
    viewMonth,
    today,
    bookedSet,
    nights,
    canGoPrev,
    selectDate,
    setFocused,
    moveFocus,
    goToPrevMonth,
    goToNextMonth,
    clear,
  }
}
