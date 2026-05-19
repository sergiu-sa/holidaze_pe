import { forwardRef, type ReactNode, useEffect, useImperativeHandle, useRef } from 'react'

import type { Continent } from '../../lib/atlas/cityCoords'
import type { ViewBox } from '../../lib/atlas/continentBounds'
import { WORLD_VIEWBOX } from '../../lib/atlas/continentBounds'
import { WORLD_SVG_MARKUP } from '../../lib/atlas/worldSvg'

interface WorldPlateProps {
  /** Accessible name for the plate. */
  ariaLabel: string
  /** Highlight one continent's land paths and dim the rest. */
  highlightContinent?: Continent | null
  /** Marker layer + hover card live as children, positioned absolutely. */
  children?: ReactNode
  /** Active viewBox — defaults to the world plate. Animates between values. */
  viewBox?: ViewBox
}

/** Animate from one viewBox to another over `duration` ms. */
function animateViewBox(
  svg: SVGSVGElement,
  from: ViewBox,
  to: ViewBox,
  duration: number,
  onDone?: () => void,
): () => void {
  const start = performance.now()
  let frame = 0
  const ease = (t: number): number => 1 - Math.pow(1 - t, 3) // out-cubic
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const k = ease(t)
    const x = from.x + (to.x - from.x) * k
    const y = from.y + (to.y - from.y) * k
    const w = from.w + (to.w - from.w) * k
    const h = from.h + (to.h - from.h) * k
    svg.setAttribute('viewBox', `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`)
    if (t < 1) {
      frame = requestAnimationFrame(tick)
    } else {
      onDone?.()
    }
  }
  frame = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frame)
  }
}

// Static SVG plate: ocean → graticule → continents → country labels. The 147KB
// markup is built once at module init and injected via dangerouslySetInnerHTML;
// React doesn't reconcile the path tree, so the heavy SVG never re-renders.
const ANIMATION_DURATION = 600

export const WorldPlate = forwardRef<HTMLDivElement, WorldPlateProps>(function WorldPlate(
  { ariaLabel, highlightContinent, children, viewBox = WORLD_VIEWBOX },
  ref,
) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const plateRef = useRef<HTMLDivElement | null>(null)
  const lastViewBoxRef = useRef<ViewBox>(viewBox)
  // The HTMLDivElement is mounted by the time this is read; assertion lets the
  // imperative handle satisfy a non-nullable HTMLDivElement consumer.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- ref is always populated by render.
  useImperativeHandle(ref, () => plateRef.current!)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const lands = svg.querySelectorAll<SVGPathElement>('.atlas__land')
    lands.forEach((path) => {
      const continent = path.dataset.continent
      if (!highlightContinent) {
        path.classList.remove('is-focus', 'is-dim')
        return
      }
      path.classList.toggle('is-focus', continent === highlightContinent)
      path.classList.toggle('is-dim', continent !== highlightContinent)
    })
  }, [highlightContinent])

  // Animate the SVG viewBox between the previous and target.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const from = lastViewBoxRef.current
    const to = viewBox
    if (from.x === to.x && from.y === to.y && from.w === to.w && from.h === to.h) {
      return
    }
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      svg.setAttribute('viewBox', `${String(to.x)} ${String(to.y)} ${String(to.w)} ${String(to.h)}`)
      lastViewBoxRef.current = to
      return
    }
    const cancel = animateViewBox(svg, from, to, ANIMATION_DURATION, () => {
      lastViewBoxRef.current = to
    })
    return cancel
  }, [viewBox])

  return (
    <div ref={plateRef} className="atlas__plate" role="group" aria-label={ariaLabel}>
      <svg
        ref={svgRef}
        className="atlas__world"
        viewBox={`${String(viewBox.x)} ${String(viewBox.y)} ${String(viewBox.w)} ${String(viewBox.h)}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: WORLD_SVG_MARKUP }}
      />
      {children}
    </div>
  )
})
