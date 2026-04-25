import { expect, test } from '@playwright/test'

test.describe('Smoke', () => {
  test('home page mounts and renders the Holidaze headline', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    await page.goto('/')

    await expect(page).toHaveTitle(/Holidaze/i)
    await expect(page.getByRole('heading', { level: 1, name: /holidaze/i })).toBeVisible()
    await expect(page.locator('#root')).not.toBeEmpty()

    expect(consoleErrors, `Console errors on load:\n${consoleErrors.join('\n')}`).toEqual([])
  })
})
