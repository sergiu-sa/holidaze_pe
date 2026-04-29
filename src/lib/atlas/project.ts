// Equirectangular projection helpers shared by the embedded + full Atlas.
// SVG viewBox is 0 0 360 180 (x = lng + 180, y = 90 − lat).

export interface Point {
  x: number
  y: number
}

/** Project lat/lng to a percentage of plate width/height (0..100). */
export function project(lat: number, lng: number): Point {
  return {
    x: ((lng + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  }
}

/** Project lat/lng to SVG-space coordinates (0..360 / 0..180). */
export function projectSvg(lat: number, lng: number): Point {
  return {
    x: lng + 180,
    y: 90 - lat,
  }
}

export function formatCoord(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(1)}°${ns} ${Math.abs(lng).toFixed(1)}°${ew}`
}

export interface BoundsCity {
  lat: number
  lng: number
}

/** Geographic bounding-box label for a set of cities, e.g. "60°N → 38°S · 122°W → 151°E". */
export function formatBounds(cities: readonly BoundsCity[]): string {
  if (cities.length === 0) return '—'
  const lats = cities.map((c) => c.lat)
  const lngs = cities.map((c) => c.lng)
  const n = Math.max(...lats)
  const s = Math.min(...lats)
  const e = Math.max(...lngs)
  const w = Math.min(...lngs)
  const fmt = (v: number, pos: string, neg: string): string =>
    `${Math.abs(v).toFixed(0)}°${v >= 0 ? pos : neg}`
  return `${fmt(n, 'N', 'S')} → ${fmt(s, 'N', 'S')} · ${fmt(w, 'E', 'W')} → ${fmt(e, 'E', 'W')}`
}
