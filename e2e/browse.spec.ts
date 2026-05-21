import { expect, test } from '@playwright/test'

test.describe('Browse (V1 + V2)', () => {
  test('Home renders hero + featured bento', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: /stay somewhere particular/i }),
    ).toBeVisible()
    await expect(page.getByRole('region', { name: /featured venues/i })).toBeVisible()
  })

  test('Home structured search → /venues?q=norway', async ({ page }) => {
    await page.goto('/')
    // `<input type="text" list="…">` is exposed as role="combobox", not textbox —
    // the datalist autocomplete flips the role.
    const destination = page.getByRole('combobox', { name: /destination/i })
    await destination.fill('norway')
    await page.getByRole('button', { name: /inquire/i }).click()
    await expect(page).toHaveURL(/\/venues\?q=norway/)
    await expect(
      page.getByRole('heading', { level: 1, name: /every place/i }),
    ).toBeVisible()
  })

  test('/venues search input mirrors URL state', async ({ page }) => {
    await page.goto('/venues?q=norway')
    const search = page.getByRole('searchbox', { name: /search venues/i })
    await expect(search).toHaveValue('norway')
    await search.fill('')
    await expect(page).not.toHaveURL(/q=/)
  })

  test('venue cards link to /venues/:id', async ({ page }) => {
    await page.goto('/venues')
    const firstCard = page.locator('main a.venue').first()
    await expect(firstCard).toBeVisible({ timeout: 15_000 })
    const href = await firstCard.getAttribute('href')
    expect(href).toMatch(/^\/venues\/[A-Za-z0-9-]+$/)
  })

  test('Filters toggle reveals the filter rail', async ({ page }) => {
    await page.goto('/venues')
    const toggle = page.getByRole('button', { name: /filters/i })
    await toggle.click()
    await expect(page.getByRole('group', { name: /amenities/i })).toBeVisible()
  })
})
