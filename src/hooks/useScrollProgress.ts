import { useEffect, useState } from 'react'

/**
 * Pure progress calculation, exported for unit-testing. Returns 0..1 where
 * 0 means the page has not been scrolled (or is shorter than the viewport)
 * and 1 means the page is fully scrolled.
 */
export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): number {
  const scrollable = scrollHeight - innerHeight
  if (scrollable <= 0) return 0
  const ratio = scrollY / scrollable
  if (ratio <= 0) return 0
  if (ratio >= 1) return 1
  return ratio
}

/**
 * Tracks the document's scroll position as a 0..1 ratio. Updates are
 * throttled via requestAnimationFrame. Returns 0 when the user prefers
 * reduced motion or the page is shorter than the viewport.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null

    let raf = 0

    const update = () => {
      raf = 0
      if (mq?.matches) {
        setProgress(0)
        return
      }
      const next = computeScrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight,
      )
      setProgress(next)
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    mq?.addEventListener('change', update)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mq?.removeEventListener('change', update)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return progress
}
