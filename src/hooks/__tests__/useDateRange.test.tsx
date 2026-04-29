import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { formatDay } from '../../lib/dates'
import { useDateRange } from '../useDateRange'

const TODAY = new Date(2026, 5, 15) // 15 June 2026, a Monday

function setup(bookedKeys: string[] = []) {
  const bookedSet = new Set(bookedKeys)
  return renderHook(() => useDateRange({ bookedSet, today: TODAY }))
}

describe('useDateRange — selection', () => {
  it('starts with empty selection', () => {
    const { result } = setup()
    expect(result.current.from).toBeNull()
    expect(result.current.to).toBeNull()
    expect(result.current.nights).toBe(0)
  })

  it('first click sets `from`', () => {
    const { result } = setup()
    act(() => {
      result.current.selectDate(new Date(2026, 5, 20))
    })
    expect(formatDay(result.current.from!)).toBe('2026-06-20')
    expect(result.current.to).toBeNull()
  })

  it('second click after `from` sets `to` and computes nights', () => {
    const { result } = setup()
    act(() => {
      result.current.selectDate(new Date(2026, 5, 20))
    })
    act(() => {
      result.current.selectDate(new Date(2026, 5, 23))
    })
    expect(formatDay(result.current.to!)).toBe('2026-06-23')
    expect(result.current.nights).toBe(3)
  })

  it('rejects past dates', () => {
    const { result } = setup()
    act(() => {
      result.current.selectDate(new Date(2026, 5, 10))
    })
    expect(result.current.from).toBeNull()
  })

  it('rejects booked dates', () => {
    const { result } = setup(['2026-06-20'])
    act(() => {
      result.current.selectDate(new Date(2026, 5, 20))
    })
    expect(result.current.from).toBeNull()
  })

  it('clicking a date earlier than `from` resets the start', () => {
    const { result } = setup()
    act(() => {
      result.current.selectDate(new Date(2026, 5, 23))
    })
    act(() => {
      result.current.selectDate(new Date(2026, 5, 20))
    })
    expect(formatDay(result.current.from!)).toBe('2026-06-20')
    expect(result.current.to).toBeNull()
  })

  it('rejects a range that crosses a booked day — resets to new start', () => {
    const { result } = setup(['2026-06-22'])
    act(() => {
      result.current.selectDate(new Date(2026, 5, 20))
    })
    act(() => {
      result.current.selectDate(new Date(2026, 5, 25))
    })
    // Range 20→25 crosses 22 (booked). Implementation resets `from` to 25.
    expect(formatDay(result.current.from!)).toBe('2026-06-25')
    expect(result.current.to).toBeNull()
  })

  it('clear() empties both ends', () => {
    const { result } = setup()
    act(() => {
      result.current.selectDate(new Date(2026, 5, 20))
      result.current.selectDate(new Date(2026, 5, 23))
    })
    act(() => {
      result.current.clear()
    })
    expect(result.current.from).toBeNull()
    expect(result.current.to).toBeNull()
  })
})

describe('useDateRange — focus + month nav', () => {
  it('moveFocus("day-right") advances focused day', () => {
    const { result } = setup()
    act(() => {
      result.current.setFocused(new Date(2026, 5, 20))
    })
    act(() => {
      result.current.moveFocus('day-right')
    })
    expect(formatDay(result.current.focused)).toBe('2026-06-21')
  })

  it('moveFocus("week-down") advances by 7 days', () => {
    const { result } = setup()
    act(() => {
      result.current.setFocused(new Date(2026, 5, 20))
    })
    act(() => {
      result.current.moveFocus('week-down')
    })
    expect(formatDay(result.current.focused)).toBe('2026-06-27')
  })

  it('moveFocus("month-next") advances by one month', () => {
    const { result } = setup()
    act(() => {
      result.current.setFocused(new Date(2026, 5, 20))
    })
    act(() => {
      result.current.moveFocus('month-next')
    })
    expect(formatDay(result.current.focused)).toBe('2026-07-20')
  })

  it('moveFocus past start of current month is clamped', () => {
    const { result } = setup()
    act(() => {
      result.current.setFocused(new Date(2026, 5, 1))
    })
    act(() => {
      result.current.moveFocus('day-left')
    })
    // Start of current month is June 1; moving left clamps there.
    expect(formatDay(result.current.focused)).toBe('2026-06-01')
  })

  it('canGoPrev is false at the current month', () => {
    const { result } = setup()
    expect(result.current.canGoPrev).toBe(false)
  })

  it('goToNextMonth advances viewMonth; goToPrevMonth steps back', () => {
    const { result } = setup()
    act(() => {
      result.current.goToNextMonth()
    })
    expect(result.current.canGoPrev).toBe(true)
    act(() => {
      result.current.goToPrevMonth()
    })
    expect(result.current.canGoPrev).toBe(false)
  })

  it('goToPrevMonth at the floor is a no-op', () => {
    const { result } = setup()
    const before = result.current.viewMonth.getTime()
    act(() => {
      result.current.goToPrevMonth()
    })
    expect(result.current.viewMonth.getTime()).toBe(before)
  })

  it('moveFocus into a future month scrolls viewMonth forward', () => {
    const { result } = setup()
    act(() => {
      result.current.setFocused(new Date(2026, 5, 30))
    })
    // Each act() flushes a render so the next moveFocus closes over fresh state.
    act(() => {
      result.current.moveFocus('month-next')
    })
    act(() => {
      result.current.moveFocus('month-next')
    })
    expect(result.current.focused.getMonth()).toBe(7) // August
    // viewMonth must have advanced so that focused (Aug 30) is visible — i.e. July or August.
    expect([6, 7]).toContain(result.current.viewMonth.getMonth())
  })
})
