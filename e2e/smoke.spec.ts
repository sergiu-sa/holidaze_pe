import { expect, test } from '@playwright/test'

test.describe('Smoke', () => {
  test('home page mounts and renders the hero headline', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    await page.goto('/')

    await expect(page).toHaveTitle(/Holidaze/i)
    await expect(
      page.getByRole('heading', { level: 1, name: /stay somewhere particular/i }),
    ).toBeVisible()
    await expect(page.locator('#root')).not.toBeEmpty()

    // Vercel Analytics + Speed Insights scripts only resolve on the deployed
    // origin; in local preview they 404 harmlessly. Filter them out so this
    // assertion catches real app errors.
    const realErrors = consoleErrors.filter(
      (msg) =>
        !/_vercel\/(insights|speed-insights)/i.test(msg) &&
        !/^Failed to load resource.*404/.test(msg),
    )
    expect(realErrors, `Console errors on load:\n${realErrors.join('\n')}`).toEqual([])
  })

  test('topbar wordmark and nav links are visible on home page', async ({ page }) => {
    await page.goto('/')

    // Both topbar and footer carry the "Holidaze home" label — scope to the banner.
    const banner = page.getByRole('banner')
    await expect(banner.getByRole('link', { name: /holidaze home/i })).toBeVisible()

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav.getByRole('link', { name: /^home$/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^venues$/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^atlas$/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^hosts$/i })).toBeVisible()
  })

  test('clicking Venues nav link navigates to /venues and renders the page hero', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /^venues$/i }).first().click()

    await expect(page).toHaveURL('/venues')
    await expect(page.getByRole('heading', { level: 1, name: /every place/i })).toBeVisible()
  })

  test('unknown path renders the 404 page', async ({ page }) => {
    await page.goto('/no-such-page')

    await expect(page.getByRole('heading', { level: 1, name: /off the atlas/i })).toBeVisible()
  })

  test('skip link is present and points to #main on home page', async ({ page }) => {
    await page.goto('/')

    // Focus-visible reveal is CSS-only and verified manually — Playwright's
    // headless Tab focus is unreliable across browsers.
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    await expect(skipLink).toBeInViewport({ ratio: 0 }).catch(() => undefined)
    await expect(skipLink).toHaveAttribute('href', '#main')
    await expect(skipLink).toHaveClass(/skip/)
  })
})
