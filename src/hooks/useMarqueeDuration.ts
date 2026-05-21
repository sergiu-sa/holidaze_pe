import { useEffect } from 'react'

/** Sets --marquee-duration on a doubled marquee track for constant px/sec velocity (keyframe `0 → -50%`, so one loop = `scrollWidth / 2`). */
export function useMarqueeDuration(
  trackRef: React.RefObject<HTMLElement | null>,
  velocityPxPerSec = 90,
  minDurationSec = 20,
): void {
  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const apply = () => {
      const half = el.scrollWidth / 2
      if (!half) return
      const seconds = Math.max(minDurationSec, half / velocityPxPerSec)
      el.style.setProperty('--marquee-duration', `${seconds.toFixed(2)}s`)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [trackRef, velocityPxPerSec, minDurationSec])
}
