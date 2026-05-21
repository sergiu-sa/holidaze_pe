import type { Continent } from './cityCoords'

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

/** World plate viewBox (equirectangular). */
export const WORLD_VIEWBOX: ViewBox = { x: 0, y: 0, w: 360, h: 180 }

/** Bounding boxes per continent on the equirectangular plate (SVG space: x = lng + 180, y = 90 − lat). Padded to ~2:1 aspect so `slice` mode neither letterboxes nor crops. */
export const CONTINENT_VIEWBOXES: Readonly<Record<Continent, ViewBox>> = {
  Europe: { x: 133, y: 18, w: 120, h: 60 },
  Asia: { x: 185, y: 10, w: 200, h: 100 },
  'North America': { x: 3, y: 18, w: 160, h: 80 },
  'South America': { x: 52, y: 78, w: 150, h: 75 },
  Africa: { x: 92, y: 50, w: 200, h: 100 },
  Oceania: { x: 245, y: 88, w: 140, h: 70 },
  Antarctica: { x: 0, y: 130, w: 360, h: 50 },
}

/** Choose the active viewBox for the current continent filter. */
export function viewBoxFor(continent: Continent | 'All'): ViewBox {
  if (continent === 'All') return WORLD_VIEWBOX
  return CONTINENT_VIEWBOXES[continent]
}

/** Convert an SVG-space point (0..360 / 0..180) into a percentage relative to the active viewBox. Used to re-position HTML marker buttons. */
export function pctInViewBox(svgX: number, svgY: number, vb: ViewBox): { x: number; y: number } {
  return {
    x: ((svgX - vb.x) / vb.w) * 100,
    y: ((svgY - vb.y) / vb.h) * 100,
  }
}
