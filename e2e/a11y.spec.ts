import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Programmatic a11y verification across the main public routes. Same axe-core
// rules as Lighthouse, excluding color-contrast (italic cinnabar on cobalt
// panels, saffron .ruler__meta--cached) — color-contrast is verified separately
// during the manual Lighthouse pass.

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/venues', name: 'Venues' },
  { path: '/atlas', name: 'Atlas' },
  { path: '/hosts', name: 'Hosts' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/some-unknown-path', name: 'NotFound' },
]

test.describe('A11y — main routes have no axe violations', () => {
  for (const route of ROUTES) {
    test(`${route.name} (${route.path}) has no serious or critical violations`, async ({ page }) => {
      await page.goto(route.path)
      // Skip intro cover on / so the underlying page is what's audited.
      if (route.path === '/') {
        await page.evaluate(() => {
          window.localStorage.setItem('holidaze:v1:intro-seen', '1')
        })
        await page.goto(route.path)
      }

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast'])
        .analyze()

      const serious = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      if (serious.length > 0) {
        console.log(`\n${route.name} — ${String(serious.length)} serious/critical:`)
        for (const v of serious) {
          console.log(`  · [${v.impact ?? '?'}] ${v.id}: ${v.help}`)
          console.log(`    Nodes: ${String(v.nodes.length)}`)
        }
      }
      expect(serious).toEqual([])
    })
  }
})
