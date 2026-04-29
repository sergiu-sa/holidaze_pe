// Curated gazetteer covering the cities that appear in the Holidaze fallback +
// the most common Noroff venue cities. Used as a fallback when a venue ships
// `lat: 0, lng: 0` or empty `country`/`continent`. Re-derived from the
// prototype's `wip_prototype/js/atlas.js` per CLAUDE.md §3.6.

export type Continent =
  | 'Africa'
  | 'Antarctica'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Oceania'
  | 'South America'

export interface CityCoord {
  lat: number
  lng: number
  country: string
  continent: Continent
}

export const CITY_COORDS: Readonly<Record<string, CityCoord>> = {
  // Europe
  paris: { lat: 48.8566, lng: 2.3522, country: 'France', continent: 'Europe' },
  london: { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', continent: 'Europe' },
  edinburgh: { lat: 55.9533, lng: -3.1883, country: 'United Kingdom', continent: 'Europe' },
  rome: { lat: 41.9028, lng: 12.4964, country: 'Italy', continent: 'Europe' },
  florence: { lat: 43.7696, lng: 11.2558, country: 'Italy', continent: 'Europe' },
  venice: { lat: 45.4408, lng: 12.3155, country: 'Italy', continent: 'Europe' },
  milan: { lat: 45.4642, lng: 9.19, country: 'Italy', continent: 'Europe' },
  madrid: { lat: 40.4168, lng: -3.7038, country: 'Spain', continent: 'Europe' },
  barcelona: { lat: 41.3851, lng: 2.1734, country: 'Spain', continent: 'Europe' },
  seville: { lat: 37.3891, lng: -5.9845, country: 'Spain', continent: 'Europe' },
  begur: { lat: 41.9542, lng: 3.2088, country: 'Spain', continent: 'Europe' },
  lisbon: { lat: 38.7223, lng: -9.1393, country: 'Portugal', continent: 'Europe' },
  porto: { lat: 41.1579, lng: -8.6291, country: 'Portugal', continent: 'Europe' },
  berlin: { lat: 52.52, lng: 13.405, country: 'Germany', continent: 'Europe' },
  munich: { lat: 48.1351, lng: 11.582, country: 'Germany', continent: 'Europe' },
  hamburg: { lat: 53.5511, lng: 9.9937, country: 'Germany', continent: 'Europe' },
  amsterdam: { lat: 52.3676, lng: 4.9041, country: 'Netherlands', continent: 'Europe' },
  copenhagen: { lat: 55.6761, lng: 12.5683, country: 'Denmark', continent: 'Europe' },
  stockholm: { lat: 59.3293, lng: 18.0686, country: 'Sweden', continent: 'Europe' },
  oslo: { lat: 59.9139, lng: 10.7522, country: 'Norway', continent: 'Europe' },
  bergen: { lat: 60.3913, lng: 5.3221, country: 'Norway', continent: 'Europe' },
  tromsø: { lat: 69.6492, lng: 18.9553, country: 'Norway', continent: 'Europe' },
  tromso: { lat: 69.6492, lng: 18.9553, country: 'Norway', continent: 'Europe' },
  fanø: { lat: 55.4422, lng: 8.4061, country: 'Denmark', continent: 'Europe' },
  fano: { lat: 55.4422, lng: 8.4061, country: 'Denmark', continent: 'Europe' },
  reykjavik: { lat: 64.1466, lng: -21.9426, country: 'Iceland', continent: 'Europe' },
  reykjavík: { lat: 64.1466, lng: -21.9426, country: 'Iceland', continent: 'Europe' },
  helsinki: { lat: 60.1699, lng: 24.9384, country: 'Finland', continent: 'Europe' },
  dublin: { lat: 53.3498, lng: -6.2603, country: 'Ireland', continent: 'Europe' },
  vienna: { lat: 48.2082, lng: 16.3738, country: 'Austria', continent: 'Europe' },
  prague: { lat: 50.0755, lng: 14.4378, country: 'Czech Republic', continent: 'Europe' },
  budapest: { lat: 47.4979, lng: 19.0402, country: 'Hungary', continent: 'Europe' },
  athens: { lat: 37.9838, lng: 23.7275, country: 'Greece', continent: 'Europe' },
  istanbul: { lat: 41.0082, lng: 28.9784, country: 'Turkey', continent: 'Europe' },
  zurich: { lat: 47.3769, lng: 8.5417, country: 'Switzerland', continent: 'Europe' },
  geneva: { lat: 46.2044, lng: 6.1432, country: 'Switzerland', continent: 'Europe' },
  brussels: { lat: 50.8503, lng: 4.3517, country: 'Belgium', continent: 'Europe' },
  warsaw: { lat: 52.2297, lng: 21.0122, country: 'Poland', continent: 'Europe' },

  // North America
  'new york': { lat: 40.7128, lng: -74.006, country: 'USA', continent: 'North America' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'USA', continent: 'North America' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'USA', continent: 'North America' },
  chicago: { lat: 41.8781, lng: -87.6298, country: 'USA', continent: 'North America' },
  miami: { lat: 25.7617, lng: -80.1918, country: 'USA', continent: 'North America' },
  toronto: { lat: 43.6532, lng: -79.3832, country: 'Canada', continent: 'North America' },
  vancouver: { lat: 49.2827, lng: -123.1207, country: 'Canada', continent: 'North America' },
  'mexico city': { lat: 19.4326, lng: -99.1332, country: 'Mexico', continent: 'North America' },
  havana: { lat: 23.1136, lng: -82.3666, country: 'Cuba', continent: 'North America' },

  // Asia
  tokyo: { lat: 35.6762, lng: 139.6503, country: 'Japan', continent: 'Asia' },
  kyoto: { lat: 35.0116, lng: 135.7681, country: 'Japan', continent: 'Asia' },
  osaka: { lat: 34.6937, lng: 135.5023, country: 'Japan', continent: 'Asia' },
  seoul: { lat: 37.5665, lng: 126.978, country: 'South Korea', continent: 'Asia' },
  beijing: { lat: 39.9042, lng: 116.4074, country: 'China', continent: 'Asia' },
  shanghai: { lat: 31.2304, lng: 121.4737, country: 'China', continent: 'Asia' },
  'hong kong': { lat: 22.3193, lng: 114.1694, country: 'China', continent: 'Asia' },
  bangkok: { lat: 13.7563, lng: 100.5018, country: 'Thailand', continent: 'Asia' },
  singapore: { lat: 1.3521, lng: 103.8198, country: 'Singapore', continent: 'Asia' },
  bali: { lat: -8.4095, lng: 115.1889, country: 'Indonesia', continent: 'Asia' },
  delhi: { lat: 28.7041, lng: 77.1025, country: 'India', continent: 'Asia' },
  mumbai: { lat: 19.076, lng: 72.8777, country: 'India', continent: 'Asia' },
  dubai: { lat: 25.2048, lng: 55.2708, country: 'UAE', continent: 'Asia' },

  // Africa
  marrakech: { lat: 31.6295, lng: -7.9811, country: 'Morocco', continent: 'Africa' },
  'cape town': { lat: -33.9249, lng: 18.4241, country: 'South Africa', continent: 'Africa' },
  cairo: { lat: 30.0444, lng: 31.2357, country: 'Egypt', continent: 'Africa' },
  nairobi: { lat: -1.2921, lng: 36.8219, country: 'Kenya', continent: 'Africa' },

  // Oceania
  sydney: { lat: -33.8688, lng: 151.2093, country: 'Australia', continent: 'Oceania' },
  melbourne: { lat: -37.8136, lng: 144.9631, country: 'Australia', continent: 'Oceania' },
  auckland: { lat: -36.8485, lng: 174.7633, country: 'New Zealand', continent: 'Oceania' },

  // South America
  'buenos aires': {
    lat: -34.6037,
    lng: -58.3816,
    country: 'Argentina',
    continent: 'South America',
  },
  'rio de janeiro': {
    lat: -22.9068,
    lng: -43.1729,
    country: 'Brazil',
    continent: 'South America',
  },
  'são paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil', continent: 'South America' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil', continent: 'South America' },
  lima: { lat: -12.0464, lng: -77.0428, country: 'Peru', continent: 'South America' },
  cusco: { lat: -13.5319, lng: -71.9675, country: 'Peru', continent: 'South America' },
}

export function lookupCity(city: string | null | undefined): CityCoord | null {
  if (!city) return null
  const key = city.trim().toLowerCase()
  return CITY_COORDS[key] ?? null
}
