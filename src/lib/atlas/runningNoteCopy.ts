import type { Continent } from './cityCoords'

export interface RunningNote {
  num: string // "N°XX"
  rubric: string
  body: string
}

const COPY: Readonly<Record<Continent | 'All', RunningNote>> = {
  All: {
    num: 'N°08',
    rubric: 'LANDFALLS',
    body:
      'The collection runs from the Norwegian coast to the Pacific. Cities chosen for one rule: a quiet room with a view that earns its keep.',
  },
  Europe: {
    num: 'N°08·a',
    rubric: 'EUROPE',
    body:
      'The continent we read most often. Coastal stone, inland linen, the cold edge in Bergen and the warm one in Begur.',
  },
  Asia: {
    num: 'N°08·b',
    rubric: 'ASIA',
    body:
      'Tatami and tile, mountain and monsoon. Where the editor goes off-grid for two weeks every year and returns with notebooks.',
  },
  'North America': {
    num: 'N°08·c',
    rubric: 'NORTH·AMERICA',
    body:
      'The wide set. Lofts in old factory blocks, cabins above the timberline, a single coast-side house in Big Sur.',
  },
  'South America': {
    num: 'N°08·d',
    rubric: 'SOUTH·AMERICA',
    body:
      'Patagonian wind, Andean light. Smallest set in the atlas; the standard is correspondingly higher.',
  },
  Africa: {
    num: 'N°08·e',
    rubric: 'AFRICA',
    body:
      'Marrakech to the Cape. Walled gardens, terracotta, tiled courtyards that cool the rooms by ten degrees on the hottest day.',
  },
  Oceania: {
    num: 'N°08·f',
    rubric: 'OCEANIA',
    body:
      'Two countries, one continent. Cliffside houses and beach lodges; the longest journey to get there, the longest stay once you arrive.',
  },
  Antarctica: {
    num: 'N°08·g',
    rubric: 'ANTARCTICA',
    body: 'Reserved. Editorial fiction; no venues here yet.',
  },
}

export function runningNoteFor(continent: Continent | 'All'): RunningNote {
  return COPY[continent]
}
