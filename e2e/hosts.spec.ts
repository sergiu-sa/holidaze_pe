import { expect, test } from '@playwright/test'

test.describe('/hosts', () => {
  test('renders all six magazine sections', async ({ page }) => {
    await page.goto('/hosts')

    // Hero — visually-hidden span inside h1
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /holidaze takes zero commission/i,
    )

    // Plates
    await expect(
      page.getByRole('heading', { name: /six faces, six rates/i }),
    ).toBeVisible()

    // Anatomy
    await expect(
      page.getByRole('heading', { name: /anatomy of a booking/i }),
    ).toBeVisible()

    // Strike
    await expect(
      page.getByRole('heading', { name: /three moves, one motion/i }),
    ).toBeVisible()

    // Correspondence
    await expect(
      page.getByRole('heading', { name: /a letter, a reply/i }),
    ).toBeVisible()

    // Sign-off CTA
    await expect(
      page.getByRole('link', { name: /apply for access/i }),
    ).toBeVisible()
  })

  test('help-rail link scrolls to #contact', async ({ page }) => {
    await page.goto('/hosts')
    // HelpRail renders a plain <a href="#contact"> — .first() guards against
    // any additional "Write to the editor" links that may appear lower on the page.
    await page.getByRole('link', { name: /write to the editor/i }).first().click()
    await expect(page).toHaveURL(/\/hosts#contact$/)
    await expect(page.locator('#contact')).toBeInViewport()
  })

  test('mailto desks have correct hrefs', async ({ page }) => {
    await page.goto('/hosts')
    // Assert attributes only — do not click mailto links (Playwright would try
    // to open a mail client in a headed browser).
    const editor = page.getByRole('link', { name: /editor@holidaze\.press/i })
    const hostsDesk = page.getByRole('link', { name: /hosts@holidaze\.press/i })
    const coords = page.getByRole('link', {
      name: /coordinates@holidaze\.press/i,
    })
    await expect(editor).toHaveAttribute('href', 'mailto:editor@holidaze.press')
    await expect(hostsDesk).toHaveAttribute(
      'href',
      'mailto:hosts@holidaze.press',
    )
    await expect(coords).toHaveAttribute(
      'href',
      'mailto:coordinates@holidaze.press',
    )
  })

  test('direct /hosts#contact navigation lands on the Correspondence section', async ({
    page,
  }) => {
    await page.goto('/hosts#contact')
    // The page's useEffect scrolls the target into view on mount.
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#contact')).toBeInViewport()
  })

  test('404 page exposes ContactShortcut linking to /hosts#contact', async ({
    page,
  }) => {
    await page.goto('/this-route-does-not-exist')
    const shortcut = page.getByRole('complementary', {
      name: /looking for someone to talk to/i,
    })
    await expect(shortcut).toBeVisible()
    await expect(
      shortcut.getByRole('link', { name: /write to the editor/i }),
    ).toHaveAttribute('href', '/hosts#contact')
  })
})
