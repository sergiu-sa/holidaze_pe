import { type KeyboardEvent, useEffect, useMemo, useRef } from 'react'

import type { UseDateRangeReturn } from '../../hooks/useDateRange'
import {
  addMonths,
  formatDay,
  formatMonthTitle,
  isPast,
  isSameDay,
  isSameMonth,
} from '../../lib/dates'
import { Eyebrow } from '../ui/Eyebrow'
import { Icon } from '../ui/Icon'

// Two-month date picker. State lives in the `range` prop; this is a pure view.

interface AvailabilityCalendarProps {
  range: UseDateRangeReturn
  /** Element id used by aria-labelledby on the heading. */
  titleId?: string
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function AvailabilityCalendar({
  range,
  titleId = 'cal-title',
}: AvailabilityCalendarProps) {
  const monthA = range.viewMonth
  const monthB = addMonths(range.viewMonth, 1)

  return (
    <section className="cal" aria-labelledby={titleId}>
      <header className="cal__head">
        <div>
          <Eyebrow num="§ 07" label="Availability" />
          <h2 className="cal__title" id={titleId}>
            Pick your <em>nights</em>.
          </h2>
        </div>
        <p className="cal__note">
          Hatched cells are already taken. Click a date to set arrival, click
          again to set departure. Use the arrow keys to navigate; Home and End
          jump across the week, PageUp and PageDown across months.
        </p>
      </header>

      <div className="cal__nav">
        <button
          type="button"
          className="cal__nav-btn"
          onClick={range.goToPrevMonth}
          disabled={!range.canGoPrev}
          aria-label="Previous month"
        >
          <Icon name="chevron-left" size="xs" /> <span>Earlier</span>
        </button>
        <span className="cal__nav-label mono">
          {formatMonthTitle(monthA)} · {formatMonthTitle(monthB)}
        </span>
        <button
          type="button"
          className="cal__nav-btn"
          onClick={range.goToNextMonth}
          aria-label="Next month"
        >
          <span>Later</span> <Icon name="chevron-right" size="xs" />
        </button>
      </div>

      <div className="cal__grid">
        <CalendarMonth firstDay={monthA} range={range} />
        <CalendarMonth firstDay={monthB} range={range} />
      </div>

      <ul className="cal__legend mono" aria-label="Legend">
        <li>
          <span className="cal__swatch cal__swatch--avail" aria-hidden="true" />
          Available
        </li>
        <li>
          <span className="cal__swatch cal__swatch--booked" aria-hidden="true" />
          Booked
        </li>
        <li>
          <span className="cal__swatch cal__swatch--sel" aria-hidden="true" />
          Your selection
        </li>
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------

interface CalendarMonthProps {
  firstDay: Date
  range: UseDateRangeReturn
}

function CalendarMonth({ firstDay, range }: CalendarMonthProps) {
  // Flat list of leading blanks + days; CSS grid wraps every 7th cell.
  type Cell = { kind: 'pad'; key: string } | { kind: 'day'; key: string; date: Date }
  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = []
    // Mon-first weekday offset (0 = Monday … 6 = Sunday).
    const leadingDow = (firstDay.getDay() + 6) % 7
    for (let i = 0; i < leadingDow; i++) {
      out.push({ kind: 'pad', key: `pad-${String(i)}` })
    }
    const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate()
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day)
      out.push({ kind: 'day', date, key: formatDay(date) })
    }
    return out
  }, [firstDay])

  const monthLabelId = `cal-month-${formatDay(firstDay)}`

  return (
    <div className="cal__month" role="group" aria-labelledby={monthLabelId}>
      <header className="cal__month-head" id={monthLabelId}>
        <em>
          {firstDay.toLocaleDateString('en-GB', { month: 'long' })}
        </em>
        <span>{firstDay.getFullYear()}</span>
      </header>
      <div className="cal__days" role="group" aria-label={formatMonthTitle(firstDay)}>
        {WEEKDAYS.map((d) => (
          <span key={d} className="cal__dow" aria-hidden="true">
            {d}
          </span>
        ))}
        {cells.map((cell) =>
          cell.kind === 'pad' ? (
            <span key={cell.key} className="cal__day cal__day--pad" aria-hidden="true" />
          ) : (
            <DayCell key={cell.key} date={cell.date} range={range} />
          ),
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

interface DayCellProps {
  date: Date
  range: UseDateRangeReturn
}

function DayCell({ date, range }: DayCellProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const wasFocused = useRef(isSameDay(date, range.focused))

  const key = formatDay(date)
  const isFocused = isSameDay(date, range.focused)
  const isBooked = range.bookedSet.has(key)
  const past = isPast(date, range.today)
  const isStart = range.from && isSameDay(date, range.from)
  const isEnd = range.to && isSameDay(date, range.to)
  const isInRange = Boolean(
    range.from && range.to && date > range.from && date < range.to,
  )
  const isToday = isSameDay(date, range.today)
  const isOutsideMonth = !isSameMonth(date, range.viewMonth) && !isSameMonth(date, addMonths(range.viewMonth, 1))

  const disabled = past || isBooked

  // Move browser focus only when the focused day actually changes, so the
  // calendar doesn't steal focus on initial render.
  useEffect(() => {
    if (isFocused && !wasFocused.current && document.activeElement !== ref.current) {
      ref.current?.focus({ preventScroll: true })
    }
    wasFocused.current = isFocused
  }, [isFocused])

  function handleClick() {
    if (disabled) return
    range.selectDate(date)
    range.setFocused(date)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        range.moveFocus('day-left')
        return
      case 'ArrowRight':
        event.preventDefault()
        range.moveFocus('day-right')
        return
      case 'ArrowUp':
        event.preventDefault()
        range.moveFocus('week-up')
        return
      case 'ArrowDown':
        event.preventDefault()
        range.moveFocus('week-down')
        return
      case 'Home':
        event.preventDefault()
        range.moveFocus('week-start')
        return
      case 'End':
        event.preventDefault()
        range.moveFocus('week-end')
        return
      case 'PageUp':
        event.preventDefault()
        range.moveFocus('month-prev')
        return
      case 'PageDown':
        event.preventDefault()
        range.moveFocus('month-next')
        return
      case 'Escape':
        event.preventDefault()
        range.clear()
        return
    }
  }

  const classes = ['cal__day']
  if (past) classes.push('cal__day--past')
  if (isBooked) classes.push('cal__day--booked')
  if (isStart || isEnd) classes.push('cal__day--selected')
  if (isInRange) classes.push('cal__day--in-range')
  if (isToday) classes.push('cal__day--today')

  const stateSuffix = isBooked
    ? ' — booked'
    : past
      ? ' — past'
      : isStart
        ? ' — arrival'
        : isEnd
          ? ' — departure'
          : isInRange
            ? ' — within selected range'
            : ''

  return (
    <button
      ref={ref}
      type="button"
      className={classes.join(' ')}
      data-date={key}
      tabIndex={isFocused ? 0 : -1}
      aria-pressed={Boolean(isStart) || Boolean(isEnd)}
      aria-disabled={disabled || undefined}
      aria-hidden={isOutsideMonth || undefined}
      aria-label={`${date.toDateString()}${stateSuffix}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="cal__day-num">{date.getDate()}</span>
    </button>
  )
}
