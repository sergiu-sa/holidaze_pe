import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import wordmarkSvg from '../../assets/logo/holidaze-wordmark.svg'
import { useAtlasCities } from '../../hooks/useAtlasCities'
import { useAuth } from '../../hooks/useAuth'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { AvatarMenu } from '../nav/AvatarMenu'
import { NavToggle } from '../nav/NavToggle'
import { PrimaryNav } from '../nav/PrimaryNav'
import { SignedOutLinks } from '../nav/SignedOutLinks'
import { ColophonPopover } from './ColophonPopover'
import { Ruler } from './Ruler'
import { useRulerLabels } from './rulerForRoute'

const TRIGGER_ID = 'issue-toggle'
const PANEL_ID = 'colophon-pop'

export function Topbar() {
  const [navOpen, setNavOpen] = useState(false)
  const [colophonOpen, setColophonOpen] = useState(false)
  const { state } = useAuth()
  const atlas = useAtlasCities()
  const scrollProgress = useScrollProgress()
  const { left: rulerLeft, right: rulerRight } = useRulerLabels({
    totalVenues: atlas.totalVenues > 0 ? atlas.totalVenues : undefined,
    isFallback: atlas.isFallback,
    lastFetchedAt: atlas.lastFetchedAt,
  })

  const headerStyle = {
    '--scroll-progress': String(scrollProgress),
  } as CSSProperties

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const prevColophonOpenRef = useRef(false)

  const handleNavToggle = useCallback(() => {
    setNavOpen((prev) => !prev)
  }, [])

  const handleNavLinkClick = useCallback(() => {
    setNavOpen(false)
  }, [])

  const handleColophonToggle = useCallback(() => {
    setColophonOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!colophonOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setColophonOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [colophonOpen])

  useEffect(() => {
    if (!colophonOpen) return
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setColophonOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [colophonOpen])

  // Move focus into the panel on open; restore to the trigger on close so
  // keyboard users don't lose their place when the panel is dismissed.
  // Falls back to getElementById in case the ref is stale after a remount.
  useEffect(() => {
    const wasOpen = prevColophonOpenRef.current
    if (colophonOpen) {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    } else if (wasOpen) {
      const trigger =
        triggerRef.current ??
        (document.getElementById(TRIGGER_ID) as HTMLButtonElement | null)
      trigger?.focus()
    }
    prevColophonOpenRef.current = colophonOpen
  }, [colophonOpen])

  return (
    <header className="topbar" role="banner" style={headerStyle}>
      <div className="topbar__inner">
        <Link to="/" className="wordmark" aria-label="Holidaze home">
          <img
            className="wordmark__svg"
            src={wordmarkSvg}
            alt="Holidaze"
            width="1200"
            height="300"
          />
        </Link>

        <PrimaryNav isOpen={navOpen} onLinkClick={handleNavLinkClick} />

        <div className="topbar__account">
          <div data-auth-slot>
            {state.status === 'loading' ? null : state.status === 'anonymous' ? (
              <SignedOutLinks onLinkClick={handleNavLinkClick} />
            ) : (
              <AvatarMenu />
            )}
          </div>

          <NavToggle isOpen={navOpen} onToggle={handleNavToggle} />
        </div>
      </div>

      <Ruler
        left={
          <button
            ref={triggerRef}
            type="button"
            className="ruler__issue"
            id={TRIGGER_ID}
            aria-expanded={colophonOpen}
            aria-controls={PANEL_ID}
            aria-label="Colophon — about this issue"
            onClick={handleColophonToggle}
          >
            <span className="ruler__issue__label">{rulerLeft}</span>
            <span className="ruler__issue__caret" aria-hidden="true">
              ▼
            </span>
          </button>
        }
        right={
          atlas.isFallback ? (
            <span className="ruler__meta ruler__meta--right ruler__meta--cached">
              {rulerRight}
            </span>
          ) : (
            rulerRight
          )
        }
      />

      <div ref={panelRef}>
        <ColophonPopover
          id={PANEL_ID}
          triggerId={TRIGGER_ID}
          open={colophonOpen}
          atlas={atlas}
        />
      </div>
    </header>
  )
}
