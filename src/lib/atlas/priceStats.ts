import type { Venue } from '../../types/venue'

export interface PriceStats {
  cheapest: number
  dearest: number
  avg: number
}

/** Crunch a city's venues into cheapest/dearest/avg price (€/night). */
export function priceStats(venues: readonly Venue[]): PriceStats | null {
  if (venues.length === 0) return null
  let cheapest = Number.POSITIVE_INFINITY
  let dearest = 0
  let sum = 0
  let count = 0
  for (const v of venues) {
    const p = v.price
    if (!Number.isFinite(p) || p <= 0) continue
    if (p < cheapest) cheapest = p
    if (p > dearest) dearest = p
    sum += p
    count += 1
  }
  if (count === 0) return null
  return { cheapest, dearest, avg: Math.round(sum / count) }
}
