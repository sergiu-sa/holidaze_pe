import { expect, test, type Route } from '@playwright/test'

const NOROFF = 'https://v2.api.noroff.dev'

// ─── canned responses ───────────────────────────────────────────────────────

const customerLoginResponse = {
  data: {
    name: 'sergiu',
    email: 'sergiu@stud.noroff.no',
    venueManager: false,
    accessToken: 'tok_e2e_customer',
  },
}

const managerLoginResponse = {
  data: {
    name: 'host_sergiu',
    email: 'host@stud.noroff.no',
    venueManager: true,
    accessToken: 'tok_e2e_manager',
  },
}

const apiKeyResponse = {
  data: { name: 'Holidaze session', status: 'ACTIVE', key: 'key_e2e' },
}

async function fulfillJSON(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

// `addInitScript` runs on every navigation (including reload), which would wipe
// a freshly-established session. Instead, hop to the origin once and clear
// localStorage from there before each test.
async function clearStorageForOrigin(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

// ─── happy path ─────────────────────────────────────────────────────────────

test.describe('auth · happy path', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
  })

  test('register customer → profile → sign out → sign in', async ({ page }) => {
    await page.route(`${NOROFF}/auth/register*`, async (route) => {
      const body = (await route.request().postDataJSON()) as { name: string; email: string }
      await fulfillJSON(route, 200, {
        data: { name: body.name, email: body.email, venueManager: false },
      })
    })
    await page.route(`${NOROFF}/auth/login*`, (route) =>
      fulfillJSON(route, 200, customerLoginResponse),
    )
    await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
      fulfillJSON(route, 200, apiKeyResponse),
    )

    await page.goto('/register')
    await page.getByLabel(/name/i).fill('sergiu')
    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /apply for access/i }).click()

    await expect(page).toHaveURL(/\/profile/)
    await expect(page.getByRole('button', { name: /account menu/i })).toBeVisible()

    // Sign out via avatar menu — Sign out is a real <button>, not a menuitem.
    // Scope to the popover because the Footer also renders a Sign out <button> when authenticated.
    await page.getByRole('button', { name: /account menu/i }).click()
    await page.locator('#avatar-menu-pop').getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible()

    // Sign in again
    await page.getByRole('link', { name: /sign in/i }).first().click()
    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /check in/i }).click()
    await expect(page).toHaveURL(/\/profile/)
  })
})

// ─── unhappy paths ──────────────────────────────────────────────────────────

test.describe('auth · unhappy paths', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
  })

  test('wrong password → form-level error, URL stays /login', async ({ page }) => {
    await page.route(`${NOROFF}/auth/login*`, (route) =>
      fulfillJSON(route, 401, { errors: [{ message: 'Invalid email or password' }] }),
    )
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('a@stud.noroff.no')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /check in/i }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: /wrong email or password/i }).first(),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('non-stud email is rejected inline before any API call', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/name/i).fill('sergiu')
    await page.getByLabel(/email/i).fill('me@example.com')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /apply for access/i }).click()
    await expect(page.getByText(/email must end in stud\.noroff\.no/i).first()).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
  })

  test('?next= survives login and redirects there on success', async ({ page }) => {
    await page.route(`${NOROFF}/auth/login*`, (route) =>
      fulfillJSON(route, 200, customerLoginResponse),
    )
    await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
      fulfillJSON(route, 200, apiKeyResponse),
    )
    await page.goto('/profile/bookings')
    await expect(page).toHaveURL(/next=%2Fprofile%2Fbookings/)
    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /check in/i }).click()
    await expect(page).toHaveURL(/\/profile\/bookings/)
  })

  test('hard reload while signed in keeps session', async ({ page }) => {
    await page.route(`${NOROFF}/auth/login*`, (route) =>
      fulfillJSON(route, 200, customerLoginResponse),
    )
    await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
      fulfillJSON(route, 200, apiKeyResponse),
    )
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /check in/i }).click()
    await expect(page.getByRole('button', { name: /account menu/i })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: /account menu/i })).toBeVisible()
  })
})

// ─── manager path ───────────────────────────────────────────────────────────

test.describe('auth · manager path', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await clearStorageForOrigin(page)
  })

  test('register with ?role=host → My venues visible in AvatarMenu', async ({ page }) => {
    await page.route(`${NOROFF}/auth/register*`, async (route) => {
      const body = (await route.request().postDataJSON()) as {
        name: string
        email: string
        venueManager?: boolean
      }
      await fulfillJSON(route, 200, {
        data: { name: body.name, email: body.email, venueManager: !!body.venueManager },
      })
    })
    await page.route(`${NOROFF}/auth/login*`, (route) =>
      fulfillJSON(route, 200, managerLoginResponse),
    )
    await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
      fulfillJSON(route, 200, apiKeyResponse),
    )

    await page.goto('/register?role=host')
    await expect(page.getByRole('radio', { name: /host/i })).toBeChecked()
    await page.getByLabel(/name/i).fill('host_sergiu')
    await page.getByLabel(/email/i).fill('host@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /apply for access/i }).click()
    await expect(page).toHaveURL(/\/profile/)
    await page.getByRole('button', { name: /account menu/i }).click()
    await expect(
      page.locator('#avatar-menu-pop').getByRole('link', { name: /my venues/i }),
    ).toBeVisible()
  })

  test('customer is redirected away from /profile/venues', async ({ page }) => {
    await page.route(`${NOROFF}/auth/login*`, (route) =>
      fulfillJSON(route, 200, customerLoginResponse),
    )
    await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
      fulfillJSON(route, 200, apiKeyResponse),
    )
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /check in/i }).click()
    // Wait for the login round-trip to complete and the redirect to /profile
    // to land before triggering the next navigation — otherwise `page.goto`
    // can race the in-flight login and abandon it before the session persists.
    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByRole('button', { name: /account menu/i })).toBeVisible()
    await page.goto('/profile/venues')
    await expect(page).toHaveURL(/\/profile($|\?)/)
  })
})
