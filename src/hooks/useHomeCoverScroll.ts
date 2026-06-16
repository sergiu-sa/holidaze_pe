import { useEffect, useRef } from 'react'

// Quadratic ease-in — backdrop holds at the start of scroll, accelerates out.
function easeCt(t: number): number {
  return t * t
}

const COVER_SCROLL_RANGE_VH = 0.75

export function useHomeCoverScroll(showCover: boolean, coverSrc: string) {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!showCover) return
    const hero = heroRef.current
    if (!hero) return

    hero.style.setProperty('--cover-img', `url(${coverSrc})`)
    hero.style.setProperty('--ct', '0')

    const range = window.innerHeight * COVER_SCROLL_RANGE_VH
    let done = false
    let ticking = false

    const settle = (): void => {
      done = true
      hero.style.setProperty('--ct', '1')
      hero.style.removeProperty('--cover-scale')
      hero.style.removeProperty('--cover-y')
      hero.dataset.coverDone = 'true'
      window.removeEventListener('scroll', onScroll)
    }

    const onScroll = (): void => {
      if (done || ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const t = Math.min(1, Math.max(0, window.scrollY / range))
        const ct = Math.min(1, easeCt(t))
        hero.style.setProperty('--ct', ct.toFixed(4))
        hero.style.setProperty('--cover-scale', (1 + t * 0.04).toFixed(4))
        hero.style.setProperty('--cover-y', `${(t * -8).toFixed(2)}px`)
        if (ct >= 1) settle()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      hero.style.removeProperty('--cover-img')
      hero.style.removeProperty('--ct')
      hero.style.removeProperty('--cover-scale')
      hero.style.removeProperty('--cover-y')
      delete hero.dataset.coverDone
    }
  }, [showCover, coverSrc])

  return heroRef
}
