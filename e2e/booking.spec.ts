import { expect, test, type Page, type Route } from '@playwright/test'

const NOROFF = 'https://v2.api.noroff.dev'
const HOLIDAZE = `${NOROFF}/holidaze`

const customerLoginResponse = {
  data: {
    name: 'sergiu',
    email: 'sergiu@stud.noroff.no',
    venueManager: false,
    accessToken: 'tok_e2e',
  },
}

const apiKeyResponse = {
  data: { name: 'Holidaze session', status: 'ACTIVE', key: 'key_e2e' },
}

const sampleVenue = {
  id: 'v-e2e',
  name: 'Bergen Studio',
  description: 'A quiet flat in Bergen.',
  media: [{ url: 'https://example.com/x.jpg', alt: 'Living room' }],
  price: 180,
  maxGuests: 4,
  rating: 4.5,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
  meta: { wifi: true, parking: false, breakfast: true, pets: false },
  location: {
    address: 'Bryggen 1',
    city: 'Bergen',
    zip: '5003',
    country: 'Norway',
    continent: 'Europe',
    lat: 60.39,
    lng: 5.32,
  },
  bookings: [],
  owner: {
    name: 'host',
    email: 'host@stud.noroff.no',
    bio: null,
    avatar: { url: 'https://example.com/h.jpg', alt: '' },
    banner: { url: 'https://example.com/b.jpg', alt: '' },
  },
}

const createdBooking = {
  data: {
    id: 'b-e2e-uuid',
    dateFrom: '2026-07-01T00:00:00.000Z',
    dateTo: '2026-07-04T00:00:00.000Z',
    guests: 2,
    created: '2026-05-04T12:00:00.000Z',
    updated: '2026-05-04T12:00:00.000Z',
    customer: {
      name: 'sergiu',
      email: 'sergiu@stud.noroff.no',
      bio: null,
      avatar: { url: 'https://example.com/c.jpg', alt: '' },
      banner: { url: 'https://example.com/b.jpg', alt: '' },
    },
    venue: sampleVenue,
  },
}

async function fulfillJSON(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

// `addInitScript` runs on every navigation (including reload), which would wipe
// a freshly-established session. Hop to the origin once and clear localStorage
// from there before each test instead.
async function clearStorageForOrigin(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

async function stubVenueAndAuth(page: Page) {
  await page.route(`${HOLIDAZE}/venues/v-e2e*`, (route) =>
    fulfillJSON(route, 200, { data: sampleVenue }),
  )
  await page.route(`${NOROFF}/auth/login*`, (route) =>
    fulfillJSON(route, 200, customerLoginResponse),
  )
  await page.route(`${NOROFF}/auth/create-api-key`, (route) =>
    fulfillJSON(route, 200, apiKeyResponse),
  )
}

test.describe('booking · happy path', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageForOrigin(page)
  })

  test('signed-in user picks → reviews → confirms → lands on receipt', async ({ page }) => {
    await stubVenueAndAuth(page)
    await page.route(`${HOLIDAZE}/bookings`, async (route) => {
      if (route.request().method() === 'POST') {
        await fulfillJSON(route, 200, createdBooking)
      } else {
        await route.continue()
      }
    })
    await page.route(`${HOLIDAZE}/bookings/b-e2e-uuid*`, (route) =>
      fulfillJSON(route, 200, createdBooking),
    )

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /check in/i }).click()
    await expect(page.getByRole('button', { name: /account menu/i })).toBeVisible()

    await page.goto('/venues/v-e2e')
    await page.getByLabel(/arrive/i).fill('2026-07-01')
    await page.getByLabel(/depart/i).fill('2026-07-04')
    await page.getByRole('button', { name: /book now/i }).click()

    await expect(page.getByRole('button', { name: /confirm booking/i })).toBeVisible()
    await page.getByRole('button', { name: /confirm booking/i }).click()

    await expect(page).toHaveURL(/\/bookings\/b-e2e-uuid/)
    await expect(page.getByText(/Bergen Studio/).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /print/i })).toBeVisible()
  })
})

test.describe('booking · anonymous interrupt', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageForOrigin(page)
  })

  test('anonymous Book click fires AuthRequiredModal; pre-fills and lands on Review after sign-in', async ({
    page,
  }) => {
    await stubVenueAndAuth(page)

    await page.goto('/venues/v-e2e')
    await page.getByLabel(/arrive/i).fill('2026-07-01')
    await page.getByLabel(/depart/i).fill('2026-07-04')
    await page.getByRole('button', { name: /book now/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('link', { name: /sign in/i }).click()

    await page.getByLabel(/email/i).fill('sergiu@stud.noroff.no')
    await page.getByLabel(/password/i).fill('hunter22hunter')
    await page.getByRole('button', { name: /check in/i }).click()

    await expect(page).toHaveURL(/\/venues\/v-e2e/)
    await expect(page.getByRole('button', { name: /confirm booking/i })).toBeVisible()
  })
})

test.describe('booking · booked-range guard', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorageForOrigin(page)
  })

  test('picking a range that crosses a booked night does not advance to review', async ({
    page,
  }) => {
    const blockedVenue = {
      ...sampleVenue,
      bookings: [
        {
          id: 'existing-1',
          dateFrom: '2026-07-02T00:00:00.000Z',
          dateTo: '2026-07-03T00:00:00.000Z',
          guests: 2,
          created: '2026-05-04T12:00:00.000Z',
          updated: '2026-05-04T12:00:00.000Z',
        },
      ],
    }
    await page.route(`${HOLIDAZE}/venues/v-e2e*`, (route) =>
      fulfillJSON(route, 200, { data: blockedVenue }),
    )
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

    await page.goto('/venues/v-e2e')
    await page.getByLabel(/arrive/i).fill('2026-07-01')
    await page.getByLabel(/depart/i).fill('2026-07-04')

    // useDateRange.selectDate silently rejects a depart date that crosses a
    // booked night: it reassigns `from` to the new value and clears `to`. The
    // depart input ends up empty, so the form's "pick a departure" guard fires
    // when the user tries to submit instead of a dedicated "those nights are
    // blocked" message. The user can't advance to review either way; flag the
    // missing inline explanation as a UX gap.
    await expect(page.getByLabel(/depart/i)).toHaveValue('')
    await expect(page.getByText(/0 nights/)).toBeVisible()

    // Force-click + blur the date input first; WebKit's focused
    // <input type="date"> can swallow the synthesised pointer event.
    await page.getByLabel(/depart/i).evaluate((el: HTMLInputElement) => { el.blur() })
    await page.getByRole('button', { name: /book now/i }).click({ force: true })

    // The pick state never advances to review — confirm by absence of the
    // confirm CTA after a generous wait.
    await expect(page.getByRole('button', { name: /confirm booking/i })).toBeHidden()
    // The Book now button stays present (still in pick state, not review).
    await expect(page.getByRole('button', { name: /book now/i })).toBeVisible()
  })
})
