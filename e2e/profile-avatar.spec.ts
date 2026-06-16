import { expect, test } from '@playwright/test'

import {
  clearStorageForOrigin,
  customerSession,
  fulfillJSON,
  HOLIDAZE,
  signIn,
} from './helpers/auth'

// 1×1 transparent GIF data URL — keeps the AvatarMenu <img> off the network and
// decodes cleanly in every engine. A 1×1 PNG data URL here was rejected by
// Firefox as "Image corrupt or truncated", firing the img onError → the
// initial-letter fallback, which raced (and flaked) the src assertions below.
const SAMPLE_AVATAR =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const profileBefore = {
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

const profileAfter = {
  data: {
    ...profileBefore.data,
    avatar: { url: SAMPLE_AVATAR, alt: customerSession.data.name },
  },
}

test.describe('profile · avatar', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
    await page.route(`${HOLIDAZE}/profiles/${customerSession.data.name}`, async (route) => {
      if (route.request().method() === 'PUT') {
        await fulfillJSON(route, 200, profileAfter)
        return
      }
      await fulfillJSON(route, 200, profileBefore)
    })
    await page.route(
      `${HOLIDAZE}/profiles/${customerSession.data.name}/bookings*`,
      (route) =>
        fulfillJSON(route, 200, {
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
        }),
    )
  })

  test('saves avatar; topbar reflects it; persists across reload', async ({ page }) => {
    await signIn(page)
    await page.goto('/profile/avatar')

    await page.getByLabel(/avatar url/i).fill(SAMPLE_AVATAR)
    await page.getByRole('button', { name: /^save/i }).click()

    // Lands back on /profile after save.
    await expect(page).toHaveURL(/\/profile$/)

    // Topbar AvatarMenu now shows the image.
    const trigger = page.getByRole('button', { name: /account menu/i })
    await expect(trigger).toBeVisible()
    await expect(trigger.locator('img')).toHaveAttribute('src', SAMPLE_AVATAR)

    // The persistence lock — reload, image still there.
    await page.reload()
    await expect(trigger.locator('img')).toHaveAttribute('src', SAMPLE_AVATAR)
  })
})
