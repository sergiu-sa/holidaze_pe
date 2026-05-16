import { matchPath, useLocation } from 'react-router-dom'

import { formatLiveSignal, type LiveSignalInput } from '../../lib/formatLiveSignal'

export const ISSUE_LABEL = 'ISSUE N°04 · SPRING · 2026'

export type RulerLiveSignal = LiveSignalInput

export interface RulerLabels {
  left: string
  right: string
}

export function rulerForRoute(
  pathname: string,
  live: RulerLiveSignal = {},
): RulerLabels {
  const left = ISSUE_LABEL
  const liveRight = formatLiveSignal(live)

  if (pathname === '/') return { left, right: liveRight }
  if (matchPath('/venues', pathname)) return { left, right: liveRight }
  if (matchPath('/atlas', pathname)) return { left, right: liveRight }
  if (matchPath('/venues/:id', pathname)) return { left, right: '—' }
  if (matchPath('/bookings/:id', pathname)) return { left, right: 'Receipt' }
  if (matchPath('/hosts', pathname)) return { left, right: 'Charter · Spring · 2026' }
  if (matchPath('/login', pathname)) return { left, right: 'Plate · N 60.39° E 5.32°' }
  if (matchPath('/register', pathname)) return { left, right: 'New reader · Spring · 2026' }
  if (matchPath('/profile/bookings', pathname)) return { left, right: 'Your trips' }
  if (matchPath('/profile/avatar', pathname)) return { left, right: 'Your face' }
  if (matchPath('/profile/venues/new', pathname)) return { left, right: 'A new venue' }
  if (matchPath('/profile/venues/:id/edit', pathname)) return { left, right: 'Editing a venue' }
  if (matchPath('/profile/venues/:id/bookings', pathname)) return { left, right: "Who's coming" }
  if (matchPath('/profile/venues', pathname)) return { left, right: 'Your places' }
  if (matchPath('/profile', pathname)) return { left, right: 'Your atlas' }

  return { left, right: '—' }
}

export function useRulerLabels(live?: RulerLiveSignal): RulerLabels {
  const { pathname } = useLocation()
  return rulerForRoute(pathname, live)
}
