import { type Page, type Route } from '@playwright/test'

export const NOROFF = 'https://v2.api.noroff.dev'
export const HOLIDAZE = `${NOROFF}/holidaze`

export const customerSession = {
  data: {
    name: 'sergiu',
    email: 'sergiu@stud.noroff.no',
    venueManager: false,
    accessToken: 'tok_e2e_customer',
  },
}

export const managerSession = {
  data: {
    name: 'host_sergiu',
    email: 'host@stud.noroff.no',
    venueManager: true,
    accessToken: 'tok_e2e_manager',
  },
}

export const apiKeyResponse = {
  data: { name: 'Holidaze session', status: 'ACTIVE', key: 'key_e2e' },
}

export async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

// `addInitScript` runs on every navigation (including reload), which would wipe
// a freshly-established session. Hop to the origin once and clear localStorage
// from there before each test instead.
export async function clearStorageForOrigin(page: Page): Promise<void> {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

export async function mockAuthEndpoints(
  page: Page,
  session: typeof customerSession = customerSession,
): Promise<void> {
  await page.route(`${NOROFF}/auth/login*`, (route) => fulfillJSON(route, 200, session))
  await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
    fulfillJSON(route, 200, apiKeyResponse),
  )
}

export async function signIn(
  page: Page,
  session: typeof customerSession = customerSession,
): Promise<void> {
  await mockAuthEndpoints(page, session)
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(session.data.email)
  await page.getByLabel(/password/i).fill('hunter22hunter')
  await page.getByRole('button', { name: /check in/i }).click()
  await page.waitForURL(/\/profile/, { timeout: 10_000 })
}
