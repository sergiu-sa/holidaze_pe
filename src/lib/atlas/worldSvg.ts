// Builds the static SVG markup for the Atlas world plate. The string is
// computed once at module init and reused across every plate render.

import { CONTINENTS } from './world-paths'

interface PlaceLabel {
  text: string
  x: number
  y: number
  size: number
  rot?: number
}

const REGION_SLUGS: Readonly<Record<string, string>> = {
  Africa: 'africa',
  Asia: 'asia',
  Europe: 'europe',
  'North America': 'north-america',
  'South America': 'south-america',
  Oceania: 'oceania',
  Antarctica: 'antarctica',
}

// Country labels tucked inside their Natural Earth geometry. Equirectangular
// coords (x = lng + 180, y = 90 − lat). Sizes tier by country scale.
const PLACE_LABELS: readonly PlaceLabel[] = [
  // North America
  { text: 'CANADA', x: 80, y: 32, size: 5 },
  { text: 'USA', x: 82, y: 51, size: 5 },
  { text: 'MEXICO', x: 78, y: 67, size: 3.5 },
  { text: 'GREENLAND', x: 140, y: 20, size: 4 },
  // South America
  { text: 'BRAZIL', x: 127, y: 100, size: 5 },
  { text: 'ARGENTINA', x: 118, y: 128, size: 3.5 },
  // Europe
  { text: 'NORWAY', x: 191, y: 30, size: 2.6 },
  { text: 'UK', x: 179, y: 38, size: 2.4 },
  { text: 'GERMANY', x: 190, y: 40, size: 2.4 },
  { text: 'FRANCE', x: 183, y: 44, size: 2.4 },
  { text: 'SPAIN', x: 176, y: 50, size: 2.6 },
  { text: 'ITALY', x: 192, y: 47, size: 2.2, rot: -28 },
  { text: 'GREECE', x: 203, y: 51, size: 2.2 },
  // Africa
  { text: 'MOROCCO', x: 174, y: 58, size: 2.6 },
  { text: 'EGYPT', x: 210, y: 63, size: 3 },
  { text: 'NIGERIA', x: 188, y: 80, size: 2.8 },
  { text: 'KENYA', x: 218, y: 91, size: 2.6 },
  { text: 'SOUTH AFRICA', x: 205, y: 119, size: 3 },
  // Asia
  { text: 'RUSSIA', x: 270, y: 30, size: 5 },
  { text: 'INDIA', x: 259, y: 68, size: 4 },
  { text: 'CHINA', x: 284, y: 55, size: 5 },
  { text: 'JAPAN', x: 320, y: 54, size: 2.6 },
  { text: 'THAILAND', x: 281, y: 76, size: 2.4 },
  { text: 'INDONESIA', x: 298, y: 94, size: 3.5 },
  // Oceania
  { text: 'AUSTRALIA', x: 315, y: 118, size: 5 },
]

function continentSlug(continent: string): string {
  return REGION_SLUGS[continent] ?? continent.toLowerCase().replace(/\s+/g, '-')
}

function buildLandLayer(): string {
  return CONTINENTS.map(({ continent, d }) => {
    const slug = continentSlug(continent)
    return `<path class="atlas__land" data-region="${slug}" data-continent="${continent}" d="${d}"/>`
  }).join('')
}

function buildPlaceLayer(): string {
  return PLACE_LABELS.map(
    (p) =>
      `<text class="atlas__place" x="${String(p.x)}" y="${String(p.y)}" font-size="${String(p.size)}" transform="rotate(${String(p.rot ?? 0)} ${String(p.x)} ${String(p.y)})">${p.text}</text>`,
  ).join('')
}

function buildGridLayer(): string {
  const meridians: string[] = []
  for (let lng = 30; lng < 360; lng += 30) {
    meridians.push(
      `<line class="atlas__grid" x1="${String(lng)}" y1="0" x2="${String(lng)}" y2="180"/>`,
    )
  }
  const parallels: string[] = []
  for (let lat = 30; lat < 180; lat += 30) {
    parallels.push(
      `<line class="atlas__grid" x1="0" y1="${String(lat)}" x2="360" y2="${String(lat)}"/>`,
    )
  }
  const guides = [
    '<line class="atlas__guide atlas__guide--equator" x1="0" y1="90" x2="360" y2="90"/>',
    '<line class="atlas__guide atlas__guide--tropic" x1="0" y1="66.5" x2="360" y2="66.5"/>',
    '<line class="atlas__guide atlas__guide--tropic" x1="0" y1="113.5" x2="360" y2="113.5"/>',
    '<line class="atlas__guide atlas__guide--meridian" x1="180" y1="0" x2="180" y2="180"/>',
  ].join('')
  return `${meridians.join('')}${parallels.join('')}${guides}`
}

export const WORLD_SVG_MARKUP: string = [
  '<g class="atlas__ocean" aria-hidden="true">',
  '<rect class="atlas__ocean__base" x="0" y="0" width="360" height="180"/>',
  '</g>',
  '<g class="atlas__grid-layer" aria-hidden="true">',
  buildGridLayer(),
  '</g>',
  '<g class="atlas__land-layer" aria-hidden="true">',
  buildLandLayer(),
  '</g>',
  '<g class="atlas__place-layer" aria-hidden="true">',
  buildPlaceLayer(),
  '</g>',
].join('')
