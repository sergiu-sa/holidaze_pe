import { lookupCity } from '../atlas/cityCoords'

export interface IntroCity {
  key: string
  label: string
  lat: number
  lng: number
}

function pick(key: string, label: string, gazKey: string = key): IntroCity {
  const coord = lookupCity(gazKey)
  if (!coord) {
    throw new Error(`INTRO_CITIES: no coord for "${gazKey}" in CITY_COORDS`)
  }
  return { key, label, lat: coord.lat, lng: coord.lng }
}

// Oslo anchors the head-row bounds line (59° 55′ N · 10° 45′ E).
export const INTRO_CITIES: readonly IntroCity[] = [
  pick('oslo', 'Oslo'),
  pick('lisbon', 'Lisbon'),
  pick('marrakech', 'Marrakech'),
  pick('cape-town', 'Cape Town', 'cape town'),
  pick('rio-de-janeiro', 'Rio', 'rio de janeiro'),
  pick('san-francisco', 'San Francisco', 'san francisco'),
  pick('kyoto', 'Kyoto'),
  pick('sydney', 'Sydney'),
]
