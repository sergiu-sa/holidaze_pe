import { useState } from 'react'

import { HERO_COVERS } from '../lib/hero/covers'

const COUNT_KEY = 'holidaze:v1:home-cover-visits'

// One Act 2 play per cover — adding or removing covers auto-rebalances.
const CAP = HERO_COVERS.length

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function readCount(): number {
  try {
    const raw = localStorage.getItem(COUNT_KEY)
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
  } catch {
    return -1 // sentinel: storage unreadable → caller skips the cover
  }
}

// Survives React 18 StrictMode's dev unmount-remount so the counter doesn't
// double-increment. Resets on real page reload (module re-evaluates).
let cachedShouldShow: boolean | null = null

function decideAndCommit(): boolean {
  if (cachedShouldShow !== null) return cachedShouldShow

  if (prefersReducedMotion()) {
    cachedShouldShow = false
    return false
  }

  const count = readCount()
  if (count < 0) {
    cachedShouldShow = false
    return false
  }

  if (count >= CAP) {
    cachedShouldShow = false
    return false
  }

  try {
    localStorage.setItem(COUNT_KEY, String(count + 1))
  } catch {
    // Persistence failed — accept; cover replays next mount.
  }

  cachedShouldShow = true
  return true
}

export interface UseHomeCoverVisitsResult {
  shouldShow: boolean
}

export function useHomeCoverVisits(): UseHomeCoverVisitsResult {
  const [shouldShow] = useState<boolean>(decideAndCommit)
  return { shouldShow }
}

/** Test-only: clear the module-level page-load cache between cases. */
export function _resetHomeCoverVisitsCacheForTests(): void {
  cachedShouldShow = null
}
