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

test.describe('profile · routing guards', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
  })

  test('anonymous /profile redirects to /login?next=/profile', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login.*next=%2Fprofile/)
  })

  test('anonymous /profile/avatar redirects to /login?next=/profile/avatar', async ({ page }) => {
    await page.goto('/profile/avatar')
    await expect(page).toHaveURL(/\/login.*next=%2Fprofile%2Favatar/)
  })

  test('customer hitting /profile/venues redirects to /profile', async ({ page }) => {
    await page.route(`${HOLIDAZE}/profiles/${customerSession.data.name}`, (route) =>
      fulfillJSON(route, 200, profileResponse),
    )
    await page.route(
      `${HOLIDAZE}/profiles/${customerSession.data.name}/bookings*`,
      (route) => fulfillJSON(route, 200, emptyBookings),
    )
    await signIn(page)
    await expect(page).toHaveURL(/\/profile/)
    await page.goto('/profile/venues')
    await expect(page).toHaveURL(/\/profile($|\?)/)
  })
})
