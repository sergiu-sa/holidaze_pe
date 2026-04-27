import type { Venue } from '../types/venue'

// Six curated venues. Used when the API errors or isUsable strips the result
// below the threshold. Re-derived from wip_prototype/js/api.js per CLAUDE.md §3.6.
// `id` is prefixed `fb-` so consumers can detect fallback entries via isFallbackId().

const SYSTEM_OWNER = {
  name: 'holidaze',
  email: 'editorial@stud.noroff.no',
  bio: 'Holidaze editorial — fallback selections.',
  avatar: { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=256', alt: '' },
  banner: { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600', alt: '' },
}

const SYSTEM_TIMESTAMP = '2026-04-01T00:00:00.000Z'

export const FALLBACK_VENUES: Venue[] = [
  {
    id: 'fb-1',
    name: 'Casa del Viento',
    description: 'A whitewashed cliffside house on the Costa Brava.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400&q=80&auto=format',
        alt: 'Whitewashed cliffside house above the Mediterranean',
      },
    ],
    price: 280,
    maxGuests: 4,
    rating: 4.8,
    created: SYSTEM_TIMESTAMP,
    updated: SYSTEM_TIMESTAMP,
    meta: { wifi: true, parking: true, breakfast: false, pets: true },
    location: {
      address: null,
      city: 'Begur',
      zip: null,
      country: 'Spain',
      continent: 'Europe',
      lat: 41.95,
      lng: 3.21,
    },
    owner: SYSTEM_OWNER,
    _count: { bookings: 0 },
  },
  {
    id: 'fb-2',
    name: 'The Reading Cabin',
    description: 'A one-room pine cabin at the edge of a lake.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1400&q=80&auto=format',
        alt: 'Pine cabin at the edge of a Norwegian lake',
      },
    ],
    price: 140,
    maxGuests: 2,
    rating: 4.6,
    created: SYSTEM_TIMESTAMP,
    updated: SYSTEM_TIMESTAMP,
    meta: { wifi: true, parking: true, breakfast: true, pets: false },
    location: {
      address: null,
      city: 'Bergen',
      zip: null,
      country: 'Norway',
      continent: 'Europe',
      lat: 60.39,
      lng: 5.32,
    },
    owner: SYSTEM_OWNER,
    _count: { bookings: 0 },
  },
  {
    id: 'fb-3',
    name: 'Machiya No. 14',
    description: 'A restored 1920s townhouse in the Gion quarter.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1400&q=80&auto=format',
        alt: 'Restored Japanese townhouse with sliding wooden doors',
      },
    ],
    price: 320,
    maxGuests: 3,
    rating: 4.9,
    created: SYSTEM_TIMESTAMP,
    updated: SYSTEM_TIMESTAMP,
    meta: { wifi: true, parking: false, breakfast: true, pets: false },
    location: {
      address: null,
      city: 'Kyoto',
      zip: null,
      country: 'Japan',
      continent: 'Asia',
      lat: 35.01,
      lng: 135.77,
    },
    owner: SYSTEM_OWNER,
    _count: { bookings: 0 },
  },
  {
    id: 'fb-4',
    name: 'Atelier Saint-Paul',
    description: 'A painter’s loft in the Marais, north-facing skylight.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1505692794403-34cbf2b338b4?w=1400&q=80&auto=format',
        alt: 'Painter’s loft with a north-facing skylight',
      },
    ],
    price: 195,
    maxGuests: 2,
    rating: 4.5,
    created: SYSTEM_TIMESTAMP,
    updated: SYSTEM_TIMESTAMP,
    meta: { wifi: true, parking: false, breakfast: false, pets: true },
    location: {
      address: null,
      city: 'Paris',
      zip: null,
      country: 'France',
      continent: 'Europe',
      lat: 48.85,
      lng: 2.36,
    },
    owner: SYSTEM_OWNER,
    _count: { bookings: 0 },
  },
  {
    id: 'fb-5',
    name: 'Riad Zitoun',
    description: 'A courtyard riad with a lemon tree and a tiled plunge pool.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1548783307-f63adc3f200b?w=1400&q=80&auto=format',
        alt: 'Moroccan riad courtyard with tiled plunge pool',
      },
    ],
    price: 210,
    maxGuests: 6,
    rating: 4.7,
    created: SYSTEM_TIMESTAMP,
    updated: SYSTEM_TIMESTAMP,
    meta: { wifi: true, parking: false, breakfast: true, pets: false },
    location: {
      address: null,
      city: 'Marrakech',
      zip: null,
      country: 'Morocco',
      continent: 'Africa',
      lat: 31.62,
      lng: -7.99,
    },
    owner: SYSTEM_OWNER,
    _count: { bookings: 0 },
  },
  {
    id: 'fb-6',
    name: 'The Tidehouse',
    description: 'A black timber shack at the end of a jetty.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1400&q=80&auto=format',
        alt: 'Black timber shack at the end of a Danish jetty',
      },
    ],
    price: 175,
    maxGuests: 4,
    rating: 4.4,
    created: SYSTEM_TIMESTAMP,
    updated: SYSTEM_TIMESTAMP,
    meta: { wifi: true, parking: true, breakfast: false, pets: true },
    location: {
      address: null,
      city: 'Fanø',
      zip: null,
      country: 'Denmark',
      continent: 'Europe',
      lat: 55.44,
      lng: 8.41,
    },
    owner: SYSTEM_OWNER,
    _count: { bookings: 0 },
  },
]

export function isFallbackId(id: string): boolean {
  return id.startsWith('fb-')
}
