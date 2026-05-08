import { expect, test } from '@playwright/test'

import {
  clearStorageForOrigin,
  customerSession,
  fulfillJSON,
  HOLIDAZE,
  signIn,
} from './helpers/auth'

const upcomingBooking = {
  id: 'b-1',
  dateFrom: '2030-06-01T00:00:00.000Z',
  dateTo: '2030-06-04T00:00:00.000Z',
  guests: 2,
  created: '2026-05-04T00:00:00.000Z',
  updated: '2026-05-04T00:00:00.000Z',
  venue: {
    id: 'v-1',
    name: 'Cabin A',
    description: 'desc',
    media: [{ url: 'https://example.com/v.jpg', alt: 'Cabin' }],
    price: 100,
    maxGuests: 4,
    rating: 0,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    meta: { wifi: true, parking: false, breakfast: false, pets: false },
    location: {
      address: null,
      city: null,
      zip: null,
      country: null,
      continent: null,
      lat: 0,
      lng: 0,
    },
  },
}

const profileResponse = {
  data: {
    name: customerSession.data.name,
    email: customerSession.data.email,
    bio: null,
    avatar: { url: '', alt: '' },
    banner: { url: '', alt: '' },
    venueManager: false,
    _count: { venues: 0, bookings: 1 },
  },
}

const bookingsList = {
  data: [upcomingBooking],
  meta: {
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 1,
  },
}

const emptyBookingsList = {
  data: [],
  meta: {
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 0,
  },
}

test.describe('profile · bookings', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
    await page.route(`${HOLIDAZE}/profiles/${customerSession.data.name}`, (route) =>
      fulfillJSON(route, 200, profileResponse),
    )
  })

  test('switches between Upcoming and Past with arrow keys', async ({ page }) => {
    await page.route(
      `${HOLIDAZE}/profiles/${customerSession.data.name}/bookings*`,
      (route) => fulfillJSON(route, 200, bookingsList),
    )
    await signIn(page)
    await page.goto('/profile/bookings')
    const upcoming = page.getByRole('tab', { name: /upcoming/i })
    const past = page.getByRole('tab', { name: /past/i })
    await upcoming.focus()
    await page.keyboard.press('ArrowRight')
    await expect(past).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowLeft')
    await expect(upcoming).toHaveAttribute('aria-selected', 'true')
  })

  test('cancels an upcoming booking via the confirm dialog', async ({ page }) => {
    let listResponse = bookingsList
    await page.route(
      `${HOLIDAZE}/profiles/${customerSession.data.name}/bookings*`,
      (route) => fulfillJSON(route, 200, listResponse),
    )
    // The client's apiFetch always calls res.json() on 2xx responses, so a real
    // 204 with no body throws. Stub a 200 + empty envelope instead — the route
    // path is unique to DELETE here.
    await page.route(`${HOLIDAZE}/bookings/b-1`, (route) =>
      fulfillJSON(route, 200, { data: null, meta: {} }),
    )
    await signIn(page)
    await page.goto('/profile/bookings')
    await expect(page.getByRole('link', { name: /cabin a/i })).toBeVisible()

    // Refetch after cancel will return the empty list — closure is read fresh
    // each time `page.route` fires.
    listResponse = emptyBookingsList

    await page.getByRole('button', { name: /cancel booking at/i }).click()
    // ConfirmDialog is a native <dialog>; the confirm button is also "Cancel
    // booking" text. Scope to the dialog to pick the right one.
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: /cancel booking/i }).click()
    await expect(page.getByText(/booking cancelled/i)).toBeVisible()
  })
})
