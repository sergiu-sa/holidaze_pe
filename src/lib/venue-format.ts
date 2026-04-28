import type { Venue } from '../types/venue'

// Display formatters for venue data. Missing fields fall through to em-dashes
// so the page renders cleanly when the public dataset has gaps.

export function formatPrice(price: number): string {
  const n = Number.isFinite(price) ? price : 0
  return `€${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
}

export function formatCoord(lat: number | null, lng: number | null): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') return '—'
  if (lat === 0 && lng === 0) return '—'
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}° ${ns} / ${Math.abs(lng).toFixed(2)}° ${ew}`
}

// Brand renders ratings as `●●●●○` glyphs, never an SVG icon.
export function ratingDots(rating: number): string {
  const n = Math.round(Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0)))
  return '●'.repeat(n) + '○'.repeat(5 - n)
}

export function formatLocation(venue: Pick<Venue, 'location'>): string {
  const city = venue.location.city?.trim() ?? ''
  const country = venue.location.country?.trim() ?? ''
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return '—'
}

export interface AmenityEntry {
  key: 'wifi' | 'parking' | 'breakfast' | 'pets'
  label: string
  on: boolean
}

const AMENITY_ORDER: readonly {
  key: AmenityEntry['key']
  label: string
}[] = [
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'parking', label: 'Parking' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'pets', label: 'Pets OK' },
]

export function amenitiesOf(venue: Pick<Venue, 'meta'>): AmenityEntry[] {
  return AMENITY_ORDER.map(({ key, label }) => ({
    key,
    label,
    on: venue.meta[key],
  }))
}

export function deriveDeck(venue: Pick<Venue, 'description' | 'location'>): string {
  const raw = venue.description.trim()
  if (raw.length > 8) {
    const sentence = raw.split(/(?<=[.!?])\s+/)[0]
    return sentence.length > 140 ? `${sentence.slice(0, 137)}…` : sentence
  }
  const city = venue.location.city?.trim()
  const country = venue.location.country?.trim()
  if (city && country) return `A place in ${city}, ${country}.`
  if (city) return `A place in ${city}.`
  return 'A place to stay.'
}
