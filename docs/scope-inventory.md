# Holidaze — Scope Inventory

## 1. Purpose

Holidaze is an accommodation booking site built against the **Noroff v2 API**. The brief grades three audiences:

- **Guests** — browse, search, view venues + availability, register.
- **Customers** — everything guests can do, plus book, view upcoming bookings, update avatar.
- **Venue Managers** — everything customers can do, plus create / edit / delete venues and view bookings on those venues.

---

## 2. Stack

| Concern | Decision |
| --- | --- |
| Language | TypeScript (strict mode) |
| Framework | React 18 |
| Styling | Tailwind v3 + CSS variables for tokens |
| Routing | React Router v6 |
| Bundler | Vite |
| Server state | Hand-rolled hooks on top of `fetch` (or TanStack Query if scope allows) |
| Forms | Native `<form>` + small validation helpers (no form lib) |
| Validation | **Zod** — installed with the API client slice. Scope: parse Noroff responses at the fetch boundary (`NoroffErrorEnvelopeSchema` lives in `src/api/schemas.ts`; resource schemas land with slice 2) + back form validators via `safeParse` (types via `z.infer`). Not a form library. |
| Lint / format | ESLint + Prettier (`npm run lint` must exit clean) |
| Hosting | Netlify / Vercel / GitHub Pages |
| API | `https://v2.api.noroff.dev/holidaze` + `/auth/*` |

---

## 3. User-story traceability (13 / 13)

Every graded story maps to a file + component in the build.

| # | Story | Route | Primary component |
| --- | --- | --- | --- |
| V1 | View a list of venues | `/`, `/venues` | `VenueGrid`, `VenueCard` |
| V2 | Search for a venue | `/venues`, `/` (inline-prose), `⌘K` | `VenueSearch`, `CommandBar` |
| V3 | View a venue by ID | `/venues/:id` | `VenueSpread` |
| V4 | Register (stud.noroff.no) | `/register` | `RegisterForm` |
| V5 | View availability calendar | `/venues/:id` | `AvailabilityCalendar` |
| C1 | Log in | `/login` | `LoginForm` |
| C2 | Log out | any (topbar menu) | `AvatarMenu` |
| C3 | Create a booking | `/venues/:id` → `/bookings/:id` | `BookingPanel`, `Receipt` |
| C4 | View upcoming bookings | `/profile/bookings` | `BookingList`, `Tabs` |
| C5 | Update avatar | `/profile/avatar` | `AvatarEditor` |
| M1 | Manager — log in | `/login` | `LoginForm` |
| M2 | Manager — log out | any | `AvatarMenu` |
| M3 | Create a venue | `/profile/venues/new` | `VenueForm` |
| M4 | Update a venue | `/profile/venues/:id/edit` | `VenueForm` |
| M5 | Delete a venue | `/profile/venues` (+ edit) | `ConfirmDialog` |
| M6 | View bookings on a managed venue | `/profile/venues/:id/bookings` | `BookingList` |
| M7 | Manager — update avatar | `/profile/avatar` | `AvatarEditor` |

---

## 4. Routes

### 4.1 Primary routes

| Route | Guard | Purpose |
| --- | --- | --- |
| `/` | public | Home — hero, bento grid of featured venues, inline-prose search, entry to `/venues` |
| `/venues` | public | Full venues grid, sticky search, filter panel, sort, pagination, dark page-hero |
| `/venues/:id` | public | Magazine spread: dark headline, gallery, body, specs/amenities/address marginalia, host strip, availability calendar, booking panel |
| `/hosts` | public | Editorial pitch for prospective managers; CTA into `/register?role=host` |
| `/bookings/:id` | auth (customer) | Post-booking receipt, print-ready |
| `/login` | public (redirect if signed in) | Reader Access spread — email gate on `stud.noroff.no` |
| `/register` | public (redirect if signed in) | Reader Access spread — role picker (customer / manager), `venueManager: true` for hosts |
| `/profile` | auth | Overview — header, role badge, stats, role-aware prompts |
| `/profile/bookings` | auth | Upcoming / Past tabs, cancel action per row |
| `/profile/avatar` | auth | Avatar URL + live preview (also toggles `venueManager` flag if keeping server-side role swap) |
| `/profile/venues` | auth + role=manager | List owned venues, row actions (edit / delete / bookings) |
| `/profile/venues/new` | auth + role=manager | `VenueForm` in create mode |
| `/profile/venues/:id/edit` | auth + role=manager (+ owner) | `VenueForm` in edit mode, with destructive delete |
| `/profile/venues/:id/bookings` | auth + role=manager (+ owner) | `BookingList` for one owned venue |
| `*` | public | 404 — off-the-atlas page |

---

## 5. Components

### 5.1 Shell

`src/components/shell/`

- **AppLayout** — Topbar + `<Outlet/>` + Footer; applied to every route except 404.
- **Topbar** — wordmark + primary nav + account slot + hairline ruler with ticks.
- **Footer** — 4-col (brand / Explore / Account / Colophon) with live/fallback pulse.
- **Breadcrumbs** — on venue detail, booking receipt, venues, hosts, all profile sub-pages.
- **ProfileShell** — two-column sidebar + main; sidebar is role-aware (host gets extra links).
- **SkipLink** — skip to `#main` on every page.
- **Ruler** — hairline band with ticks, meta labels left + right; used in topbar and inside pages.

### 5.2 Navigation

`src/components/nav/`

- **PrimaryNav** — Home / Venues / Hosts / Identity links, collapses to `<NavToggle>` ≤ 960px.
- **NavToggle** — mobile hamburger, `aria-controls` + `aria-expanded`.
- **AvatarMenu** — account chip dropdown; Profile / My bookings / Avatar / (My venues) / Sign out. `aria-haspopup`, Esc + outside-click close.
- **CommandBar** *(editorial)* — `⌘K` / `Ctrl+K` / `/` site-wide dialog; listbox semantics, arrow-key nav, enter-to-open.

### 5.3 Auth

`src/components/auth/`

- **LoginForm** — email + password, `stud.noroff.no` regex gate, `?next=` redirect.
- **RegisterForm** — name + email + password + role picker (customer / manager → `venueManager: true`).
- **AuthGuard** — wraps protected routes; redirect unauthenticated → `/login?next=…`.
- **RoleGuard** — wraps manager-only routes; redirect wrong-role → `/profile`.
- **AuthRequiredModal** — `ConfirmDialog` variant fired from the booking form when not signed in.

### 5.4 Browsing

`src/components/browse/`

- **VenueCard** — three flavours via `variant` prop: `"bento"` (home), `"grid"` (venues list), `"modal"` (bento quick-view).
- **VenueGrid** — responsive grid wrapping `VenueCard[]`.
- **BentoGrid** *(editorial)* — asymmetric bento with neighbour-dim on hover, lift + shadow on hover.
- **VenueSearch** — two variants: `"sticky"` (venues) and `"prose"` (home sentence-form).
- **VenueFilters** — max-price slider, guests input, rating dots toggle, amenity checkboxes, URL-reflected.
- **VenueSort** — created / price / rating / guests.
- **Pagination** — prev / next + numbered pages + ellipses, URL-reflected `?page=`.
- **VenueModal** *(editorial)* — bento quick-view dialog, shared between home and venues list.
- **RecentlyViewedStrip** *(editorial)* — 4 recents from `localStorage`, suggested fallback on empty.
- **Atlas** *(editorial)* — typographic world plate + `CITY_COORDS` gazetteer fallback + hover pull-card.
- **AtlasStats** *(editorial)* — home marquee + counts.
- **Marquee** *(editorial)* — "BOOK DIRECT · NO COMMISSION" cobalt band.
- **ErrorState** — striped banner when API falls back to the curated sample.
- **EmptyState** — "No matches" / "No bookings yet" etc.

### 5.5 Venue detail

`src/components/venue/`

- **VenueSpread** — the full magazine layout (masthead, headline with `--headline-bg`, body, marginalia, host strip).
- **VenueGallery** — hero `<img>` + prev/next arrows + thumbnail strip + **Lightbox** dialog.
- **AmenityList** — wifi / parking / breakfast / pets, strike-through off-state.
- **VenueSpecs** — numeric spec list (guests, rating, price, where, continent, coords).
- **HostStrip** — avatar + name + meta.
- **RatingStars** — ochre `dots()` helper wrapped as a component.
- **ReadMoreToggle** — collapses long descriptions with a fade + `aria-expanded`.

### 5.6 Booking

`src/components/booking/`

- **BookingPanel** — date-range picker + `GuestStepper` + live nights × price total + submit. States: Pick / Review / Confirm / Success.
- **AvailabilityCalendar** — two-month grid, hatched booked nights, ink-block selection edges, range-fill. Real `<button>` per day with descriptive `aria-label`, keyboard-navigable.
- **DateRangePicker** — paired `<input type="date">` mirroring the calendar.
- **GuestStepper** — −/+ buttons flanking `<input type="number">`, disabled at bounds.
- **GuestBanner** — cobalt-striped note inside booking form for unsigned visitors.
- **Receipt** — print-ready confirmation document (double-frame border, typographic).

### 5.7 Manager (CRUD)

`src/components/manager/`

- **VenueForm** — shared by create + edit. Fields: name, description, media URL array, price, max guests, location, amenity toggles.
- **AmenityToggle** — 4 checkboxes (wifi / parking / breakfast / pets).
- **ImageUrlList** — array field (add / remove URLs).
- **DeleteVenueConfirm** — `ConfirmDialog` wrapper with owner-only message.
- **VenueBookingsList** — one table per venue for `/profile/venues/:id/bookings`.

### 5.8 Profile

`src/components/profile/`

- **ProfileSidebar** — role-aware links, active `aria-current="page"`, sign-out button.
- **ProfileHeader** — banner + avatar + name + email + role badge.
- **ProfileStats** — numeric stats band (trips / venues).
- **BookingList** — used on customer `/profile/bookings` and per-venue manager list.
- **BookingRow** — one booking with venue thumb, dates, guests, price, cancel action.
- **CancelBookingConfirm** — `ConfirmDialog` variant (danger).
- **AvatarEditor** — URL input + live preview + save.
- **RolePicker** — two flavours: `ra-role__grid` (large CHECK-ONE tiles on register) and `.role-toggle` (compact, shared primitive).
- **Tabs** — Upcoming / Past; `role="tablist"`, arrow-key navigable, counts in labels.

### 5.9 Feedback / state primitives

`src/components/ui/`

- **ConfirmDialog** — `Promise<boolean>` API; rubric + title + body + cancel / confirm; danger variant. Used for cancel booking, delete venue, auth-required modal.
- **Toast** + **ToastProvider** — bottom-right stack, `aria-live="polite"`, ok / err / info kinds, auto-dismiss, reduced-motion aware.
- **Modal** — `<dialog>` wrapper with focus-trap + Esc-close for custom dialogs.
- **Skeleton** — card and line skeletons for loading states.
- **FormError** — terracotta band above submit.
- **Spinner** — if used; small motion element for pending actions.

### 5.10 Base primitives

`src/components/ui/`

- **Button** — primary / ghost / danger + `loading` + `disabled` states.
- **IconButton** — square icon-only variant.
- **LetterpressCTA** *(editorial)* — block submit button with offset cinnabar shadow, used on auth.
- **Input** (TextField)
- **PasswordField** — input + reveal button (wires the `data-reveal` pattern).
- **Textarea**
- **Select**
- **Checkbox**
- **Chip**
- **Badge** (`RoleBadge` specialisation for Host / Guest)
- **Avatar** — image or initials fallback.
- **Icon** — inline-SVG registry, `size` prop.
- **VisuallyHidden** — a11y helper.

### 5.11 Editorial primitives (Reader Access spread)

`src/components/editorial/` *(optional — port if magazine treatment is preserved)*

Namespaced so they don't collide with core primitives. Port 1:1 from the prototype's `.ra-*` classes into a `ReaderAccessSpread` island.

- **ReaderAccessSpread** — the two-page container; recto (cover story) + verso (access card).
- **RunHead** / **RunFoot** — narrow top/bottom bands with page number + section label.
- **PhotoPlate** — framed image with museum tag, credit, caption.
- **DropCapLetter** — italic Bodoni title with cinnabar drop-cap.
- **Lede** — one-sentence deck under the title.
- **MagazineTOC** — "Also in this issue" contents.
- **AccessCard** — subscription / access card container.
- **RegistrationMarks** — printers' crosshairs at four corners.
- **PostmarkStamp** — SVG circular postmark with `textPath` + inner N°.
- **MiniCover** — 2:3 thumbnail with inline barcode.
- **ReaderField** — numbered field rows with mono hints + reveal button.
- **RoleGrid** — large CHECK-ONE guest / host picker.
- **TearLine** — perforated separator with scissors glyphs.
- **ColorBar** — faux CMYK proof strip at card foot.
- **IntroSequence** *(editorial, first-visit)* — Act 1 title-page stamp-in + Act 2 scroll-driven cover.
- **CoverMode** *(editorial)* — scroll-driven `--ct` crossfade on home hero.
- **ColophonPopover** *(editorial)* — ISSUE chip → live status surface.

---

## 6. Data layer

### 6.1 API client (`src/api/client.ts`)

- `apiFetch<T>(path, options)` wrapper; joins `BASE`, sets `Accept: application/json`, JSON-parses the body, unwraps Noroff's `{ data, meta }` envelope when present (returns the raw body otherwise — covers `/auth/login`'s flat response).
- Auth header injection is controlled by `options.auth`:
  - `"optional"` (default) — attaches `Authorization: Bearer <token>` + `X-Noroff-API-Key: <key>` only when both are present in the session store.
  - `"required"` — throws `ApiError(401, …)` synchronously before fetch when either credential is missing.
- Session store at `src/api/session.ts` — in-memory mirror of `localStorage` key `holidaze:v1:session`; exports `getSession`, `setSession`, `clearSession`, `getAccessToken`, `getApiKey`. Hydrates once on module load.
- Errors normalised via Zod (`NoroffErrorEnvelopeSchema` in `src/api/schemas.ts`): non-OK responses with a parseable Noroff envelope → `ApiError(status, errors[0].message, errors[])`; malformed body → `ApiError(status, statusText)`; network / abort → `ApiError(0, message)`.
- `isUsable(venue)` filter and curated **FALLBACK** list (6 entries) — **deferred to slice 4** (venues read). The prototype encodes the rules; we re-derive in TypeScript at `src/lib/isUsable.ts` and `src/lib/fallback.ts` rather than copy-paste.

### 6.2 Feature modules (`src/api/<feature>.ts`)

| Module | Exports |
| --- | --- |
| `venues.ts` | `listVenues`, `getVenue`, `searchVenues`, `createVenue`, `updateVenue`, `deleteVenue` |
| `bookings.ts` | `listBookings`, `getBooking`, `createBooking`, `updateBooking`, `deleteBooking` (supports `?_customer=true`, `?_venue=true`) |
| `profiles.ts` | `getProfile(name)`, `updateProfile(name, patch)`, `getProfileVenues(name)`, `getProfileBookings(name)` |
| `auth.ts` | `register`, `login`, `createApiKey` |

### 6.3 Typed models (`src/types/`)

- `Venue` — mirrors Noroff v2 shape: `id`, `name`, `description`, `media[]`, `price`, `rating`, `maxGuests`, `meta{wifi,parking,breakfast,pets}`, `location{...}`, `owner?`, `bookings?`.
- `Booking` — `id`, `dateFrom`, `dateTo`, `guests`, `created`, `updated`, optional `venue`, `customer`.
- `Profile` — `name`, `email`, `avatar{url,alt}`, `banner?`, `bio?`, `venueManager`, `_count?`.
- `ApiError` — class extending `Error` (so `instanceof` works in `catch` blocks). Fields: `status: number` (HTTP status, or `0` for network errors), `message: string`, `details?: unknown` (raw `errors` array if present). Lives at `src/types/api.ts`.

> **Plan:** resource types (`Venue`, `Booking`, `Profile`) land in slice 2 derived from Zod schemas (`z.infer<typeof VenueSchema>` etc.) — one source of truth for runtime parse and compile-time type.

### 6.4 Noroff auth flow

Three-step bootstrap — the prototype stubs this in localStorage; the real build must walk it.

1. **Register** — `POST /auth/register` with `{ name, email, password, venueManager? }`. Email **must** end in `stud.noroff.no` (server enforces). Manager accounts send `venueManager: true`.
2. **Login** — `POST /auth/login` with `{ email, password }` → returns `{ accessToken, name, email, avatar, venueManager, ... }`. Persist.
3. **Create API key** — `POST /auth/create-api-key` with `Authorization: Bearer <accessToken>` → returns `{ key }`. Persist once per session.

---

## 7. State / hooks

`src/hooks/`

- **useAuth** — exposed via `<AuthProvider>`; returns `user`, `login`, `register`, `logout`, `refreshApiKey`. Persists `user` + `accessToken` + `apiKey` in `localStorage` so reload survives.
- **useVenues** — list with pagination, filters, sort.
- **useVenue(id)** — single venue with `?_bookings=true&_owner=true`.
- **useVenueSearch(q)** — debounced (~300 ms), cancels stale.
- **useBookings()** — current user's bookings (Upcoming / Past partition).
- **useCreateBooking()** — mutation, invalidates `useVenue(id)` on success.
- **useProfile(name)** — read + update (`updateAvatar`).
- **useProfileVenues(name)** — manager's venues.
- **useProfileBookings(name)** — bookings made on manager's venues (aggregation).
- **useGuards** — thin wrappers around `useAuth` that short-circuit render and redirect.
- **useRecentlyViewed** *(editorial)* — `localStorage` `holidaze:v1:recent`.
- **useIntroSeen** *(editorial)* — `localStorage` `holidaze:v1:intro-seen` gate for the two-act intro.

---

## 8. Design tokens

Ported from `css/base.css`  into `tailwind.config.ts` as theme extensions + CSS variables on `:root` for runtime-only values (e.g. `--ct`, `--headline-bg`, `--page-hero-bg`, `--cover-img`).
