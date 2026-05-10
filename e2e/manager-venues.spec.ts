import { expect, test } from '@playwright/test'

import {
  clearStorageForOrigin,
  customerSession,
  fulfillJSON,
  HOLIDAZE,
  managerSession,
  signIn,
} from './helpers/auth'

interface Venue {
  id: string
  name: string
  description: string
  media: { url: string; alt: string }[]
  price: number
  maxGuests: number
  rating: number
  created: string
  updated: string
  meta: { wifi: boolean; parking: boolean; breakfast: boolean; pets: boolean }
  location: {
    address: string | null
    city: string | null
    zip: string | null
    country: string | null
    continent: string | null
    lat: number | null
    lng: number | null
  }
  bookings: unknown[]
  owner: {
    name: string
    email: string
    bio: null
    avatar: { url: string; alt: string }
    banner: { url: string; alt: string }
  }
}

const managerProfileResponse = {
  data: {
    name: managerSession.data.name,
    email: managerSession.data.email,
    bio: null,
    avatar: { url: '', alt: '' },
    banner: { url: '', alt: '' },
    venueManager: true,
    _count: { venues: 0, bookings: 0 },
  },
}

const emptyListMeta = {
  isFirstPage: true,
  isLastPage: true,
  currentPage: 1,
  previousPage: null,
  nextPage: null,
  pageCount: 1,
  totalCount: 0,
}

const baseOwner = {
  name: managerSession.data.name,
  email: managerSession.data.email,
  bio: null,
  avatar: { url: '', alt: '' },
  banner: { url: '', alt: '' },
} as const

const emptyEnvelope = { data: [], meta: emptyListMeta }

test.describe('manager · venue CRUD (M3 / M4 / M5 / M6)', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)

    await page.route(`${HOLIDAZE}/profiles/${managerSession.data.name}`, (route) =>
      fulfillJSON(route, 200, managerProfileResponse),
    )
    await page.route(
      `${HOLIDAZE}/profiles/${managerSession.data.name}/bookings*`,
      (route) => fulfillJSON(route, 200, emptyEnvelope),
    )
  })

  test('logs in, creates a venue, edits its price, deletes it', async ({ page }) => {
    let stored: Venue | null = null

    await page.route(
      `${HOLIDAZE}/profiles/${managerSession.data.name}/venues*`,
      (route) =>
        fulfillJSON(route, 200, {
          data: stored ? [stored] : [],
          meta: { ...emptyListMeta, totalCount: stored ? 1 : 0 },
        }),
    )

    await page.route(`${HOLIDAZE}/venues`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback()
        return
      }
      const body = route.request().postDataJSON() as Partial<Venue>
      const now = new Date().toISOString()
      stored = {
        id: 'venue-e2e-1',
        name: body.name ?? '',
        description: body.description ?? '',
        media: body.media ?? [],
        price: body.price ?? 0,
        maxGuests: body.maxGuests ?? 1,
        rating: 0,
        created: now,
        updated: now,
        meta: body.meta ?? { wifi: false, parking: false, breakfast: false, pets: false },
        location: {
          address: body.location?.address ?? null,
          city: body.location?.city ?? null,
          zip: body.location?.zip ?? null,
          country: body.location?.country ?? null,
          continent: body.location?.continent ?? null,
          lat: body.location?.lat ?? null,
          lng: body.location?.lng ?? null,
        },
        bookings: [],
        owner: baseOwner,
      }
      await fulfillJSON(route, 201, { data: stored })
    })

    await page.route(`${HOLIDAZE}/venues/venue-e2e-1*`, async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        if (!stored) {
          await fulfillJSON(route, 404, { errors: [{ message: 'Not found' }] })
          return
        }
        await fulfillJSON(route, 200, { data: stored })
        return
      }
      if (method === 'PUT') {
        const body = route.request().postDataJSON() as Partial<Venue>
        if (stored) {
          stored = {
            ...stored,
            ...(body as Partial<Venue>),
            location: { ...stored.location, ...(body.location ?? {}) },
            meta: { ...stored.meta, ...(body.meta ?? {}) },
            updated: new Date().toISOString(),
          }
        }
        await fulfillJSON(route, 200, { data: stored })
        return
      }
      if (method === 'DELETE') {
        stored = null
        await route.fulfill({ status: 204, body: '' })
        return
      }
      await route.fallback()
    })

    await signIn(page, managerSession)
    await page.goto('/profile/venues')

    // Empty state shows initial CTA
    await expect(page.getByRole('heading', { level: 1, name: /your venues/i })).toBeVisible()
    await expect(page.getByText('Nothing listed.', { exact: true })).toBeVisible()

    // Create
    await page.getByRole('link', { name: /list a place/i }).click()
    await expect(page).toHaveURL(/\/profile\/venues\/new$/)

    await page.getByLabel(/^name$/i).fill('Olive Cabin')
    await page.getByLabel(/description/i).fill('Stone-walled bothy a kilometre off the road.')
    await page.getByLabel(/price/i).fill('240')
    await page.getByLabel(/max guests/i).fill('4')
    await page.getByLabel(/^city$/i).fill('Lisbon')
    await page.getByLabel(/^country$/i).fill('Portugal')
    await page.getByRole('button', { name: /list place/i }).click()

    // After create → edit page of the new venue
    await expect(page).toHaveURL(/\/profile\/venues\/venue-e2e-1\/edit$/)
    await expect(page.getByRole('heading', { level: 1, name: /edit/i })).toBeVisible()
    await expect(page.getByLabel(/^name$/i)).toHaveValue('Olive Cabin')

    // Edit the price and save
    const priceInput = page.getByLabel(/price/i)
    await priceInput.fill('320')
    await page.getByRole('button', { name: /save changes/i }).click()
    await expect(page.getByText(/saved/i)).toBeVisible()
    await expect(priceInput).toHaveValue('320')

    // Back to the list, confirm the venue is there
    await page.goto('/profile/venues')
    await expect(page.getByRole('link', { name: 'Olive Cabin', exact: true })).toBeVisible()
    await expect(page.getByText(/€320\/night/i)).toBeVisible()

    // Delete via row action
    await page.getByRole('button', { name: /delete olive cabin/i }).click()
    await page.getByRole('button', { name: /^delete venue$/i }).click()

    await expect(page.getByText('Nothing listed.', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Olive Cabin', exact: true })).not.toBeVisible()
  })
})

test.describe('manager · ownership guards', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
  })

  test('customer hitting /profile/venues/new is redirected away', async ({ page }) => {
    await page.route(`${HOLIDAZE}/profiles/${customerSession.data.name}`, (route) =>
      fulfillJSON(route, 200, {
        data: {
          name: customerSession.data.name,
          email: customerSession.data.email,
          bio: null,
          avatar: { url: '', alt: '' },
          banner: { url: '', alt: '' },
          venueManager: false,
          _count: { venues: 0, bookings: 0 },
        },
      }),
    )
    await page.route(
      `${HOLIDAZE}/profiles/${customerSession.data.name}/bookings*`,
      (route) => fulfillJSON(route, 200, emptyEnvelope),
    )

    await signIn(page)
    await page.goto('/profile/venues/new')
    await expect(page).toHaveURL(/\/profile($|\?)/)
    await expect(page.getByRole('heading', { level: 1, name: /new venue/i })).not.toBeVisible()
  })
})
