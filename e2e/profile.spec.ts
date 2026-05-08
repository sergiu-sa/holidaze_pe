import { expect, test } from '@playwright/test'

import {
  clearStorageForOrigin,
  customerSession,
  fulfillJSON,
  HOLIDAZE,
  signIn,
} from './helpers/auth'

const profileResponse = {
  data: {
    name: customerSession.data.name,
    email: customerSession.data.email,
    bio: null,
    avatar: { url: '', alt: '' },
    banner: { url: '', alt: '' },
    venueManager: false,
    _count: { venues: 0, bookings: 0 },
  },
}

const emptyBookings = {
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

test.describe('profile · overview', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
    await page.route(`${HOLIDAZE}/profiles/${customerSession.data.name}`, (route) =>
      fulfillJSON(route, 200, profileResponse),
    )
    await page.route(
      `${HOLIDAZE}/profiles/${customerSession.data.name}/bookings*`,
      (route) => fulfillJSON(route, 200, emptyBookings),
    )
  })

  test('signed-in user sees Hello + stats + empty state', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByRole('heading', { level: 1, name: /hello/i })).toBeVisible()
    await expect(page.getByText(/upcoming trips/i)).toBeVisible()
    await expect(page.getByText(/your atlas is blank/i)).toBeVisible()
  })
})
