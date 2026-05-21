import type { Venue } from '../../types/venue'
import { type Continent,lookupCity } from './cityCoords'

export interface CityEntry {
  city: string
  country: string
  continent: Continent | ''
  lat: number
  lng: number
  venues: Venue[]
}

const MAX_LAT = 85

function hasRealCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) && Math.abs(lat) <= MAX_LAT
}

function entryKey(city: string, lat: number, lng: number): string {
  return `${city.toLowerCase()}|${String(Math.round(lat * 10))}|${String(Math.round(lng * 10))}`
}

/** Aggregate venues by city, falling back to the curated `CITY_COORDS` gazetteer when the venue ships placeholder coords or empty country/continent. Drops cities without a gazetteer hit. Returns one entry per (city, rounded-coord-bucket); caller sorts. */
export function groupByCity(venues: readonly Venue[]): CityEntry[] {
  const map = new Map<string, CityEntry>()

  for (const venue of venues) {
    const loc = venue.location
    const city = loc.city?.trim()
    if (!city) continue

    let lat = Number(loc.lat)
    let lng = Number(loc.lng)
    let country = loc.country?.trim() ?? ''
    let continent: Continent | '' = (loc.continent?.trim() ?? '') as Continent | ''

    const real = hasRealCoords(lat, lng)
    const hit = lookupCity(city)

    // Trust the gazetteer over the venue's own (often empty) country/continent.
    // Coords are only overridden when the venue's are missing or invalid.
    // Unknown cities (not in the gazetteer) are dropped from the atlas plate
    // even if they ship real-looking coords — the Noroff dataset is full of
    // manager-typed garbage ("That Town", "Menthure") that can't be verified.
    // Affected venues still appear in /venues browse + search; this only
    // governs what gets plotted on the map.
    if (!hit) continue
    if (!real) {
      lat = hit.lat
      lng = hit.lng
    }
    country = hit.country
    continent = hit.continent

    const key = entryKey(city, lat, lng)
    const existing = map.get(key)
    if (existing) {
      existing.venues.push(venue)
    } else {
      map.set(key, { city, country, continent, lat, lng, venues: [venue] })
    }
  }

  return Array.from(map.values())
}
