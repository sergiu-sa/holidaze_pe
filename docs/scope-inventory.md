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

- **AppLayout** ✓ — `SkipLink → Topbar → <Outlet/> → Footer`; applied via a parent route to every path except 404 (sibling 404 renders standalone).
- **Topbar** ✓ — wordmark SVG + `<PrimaryNav>` + auth slot (`[data-auth-slot]`) + hairline `<Ruler>` with ticks + ISSUE chip. Sticky with backdrop blur.
- **Footer** ✓ — 4-col (Brand / Explore / Account / Colophon) with hairline rules + live pulse dot (square — brand reading).
- **SkipLink** ✓ — skip to `#main`; visually hidden until focused, then 2px cinnabar outline.
- **Ruler** ✓ — hairline band with ticks, left / right meta labels.
- **RouteErrorBoundary** ✓ — small class component wrapping each Outlet; renders cinnabar fallback with "Try again" reset.
- **Breadcrumbs** — on venue detail, booking receipt, venues, hosts, all profile sub-pages. *(deferred to first-use slice)*
- **ProfileShell** — two-column sidebar + main; sidebar is role-aware. *(slice 5.3)*

### 5.2 Navigation

`src/components/nav/`

- **PrimaryNav** ✓ — Home / Venues / Hosts / Atlas / Identity links via React Router `<NavLink>`; `aria-current="page"` on active. Collapses to `<NavToggle>` below `nav: 960px` breakpoint.
- **NavToggle** ✓ — mobile hamburger; `aria-controls` + `aria-expanded`, focus-trap inside open menu, Esc closes, body-scroll lock while open, focus returns to toggle on close.
- **AvatarMenu** ✓ — account chip dropdown; Profile / My bookings / (My venues) / Avatar / Sign out. `aria-haspopup`, Esc + outside-click close, role chip (Guest / Host). *(slice 5.1, shipped 2026-05-02)*
- **SignedOutLinks** ✓ — extracted from Topbar's auth-slot; renders Sign in + Register `<NavLink>`s for anonymous users. *(slice 5.1)*
- **CommandBar** *(editorial)* — `⌘K` / `Ctrl+K` / `/` site-wide dialog; listbox semantics, arrow-key nav, enter-to-open. *(slice 5.6)*

### 5.3 Auth

`src/components/auth/` — all shipped in slice 5.1 (2026-05-02). Press-credentials chassis, light mode, Caveat marginalia exception.

**Form primitives (shared by Login + Register):**

- **AuthCard** ✓ — bone-paper card with corner ticks + saffron postal stamp + masthead row.
- **MarginaliaNote** ✓ — Caveat-font note pinned at -3.5° with saffron pin SVG.
- **SpecimenField** ✓ — numbered hairline-rule input row; `forwardRef`; `aria-invalid` + `aria-describedby` wiring.
- **RoleBento** ✓ — controlled 2-up role picker (guest / host); cinnabar fill on selected.
- **SubmitBar** ✓ — wide ink submit with pending-state label flip.

**Forms:**

- **LoginForm** ✓ — email + password, `stud.noroff.no` regex gate, submit-time Zod, `?next=` redirect, 401 form banner.
- **RegisterForm** ✓ — name + email + password + role picker (customer / manager → `venueManager: true`); `?role=host` URL prefill; 409 inline email error; auto-login fallback to `/login?email=…` on chain failure.

**Guards:**

- **AuthGuard** ✓ — wraps protected routes; redirect unauthenticated → `/login?next=…` (URL-encoded).
- **RoleGuard** ✓ — wraps manager-only routes; redirect non-manager → `/profile` with toast.
- **AuthRequiredModal** ✓ — native `<dialog>` for inline interrupts; `sessionStorage` stash for deferred actions (consumer wiring in slice 5.2).

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

- **BookingPanel** ✓ — *(slice 4.2 placeholder; rewritten as 4-state inline machine in slice 5.2)* — date-range picker + `GuestStepper` + live nights × price total + submit. States: Pick / Review / Confirm / Success.
- **AvailabilityCalendar** — two-month grid, hatched booked nights, ink-block selection edges, range-fill. Real `<button>` per day with descriptive `aria-label`, keyboard-navigable.
- **DateRangePicker** — paired `<input type="date">` mirroring the calendar.
- **GuestStepper** — −/+ buttons flanking `<input type="number">`, disabled at bounds.
- **GuestBanner** — cobalt-striped note inside booking form for unsigned visitors.
- **Receipt** ✓ — *(slice 5.2)* — print-ready confirmation document (double-frame border, typographic).

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
- **Toast** + **ToastProvider** ✓ — *(slice 5.1 minimal single-slot; enriched to queued stack + kinds + auto-dismiss in slice 5.2)* — bottom-right stack, `aria-live="polite"`, ok / err / info kinds, auto-dismiss, reduced-motion aware.
- **Modal** — `<dialog>` wrapper with focus-trap + Esc-close for custom dialogs.
- **Skeleton** — card and line skeletons for loading states.
- **FormError** — terracotta band above submit.
- **Spinner** — if used; small motion element for pending actions.

### 5.10 Base primitives

`src/components/ui/` — built lazily; primitives land with the first slice that needs them. Shipped set is exported through the `ui/` barrel.

**Shipped (slice 3.16, Apr 28 2026):**

- **Button** ✓ — `variant: "primary" | "ghost" | "cobalt" | "link"`, `loading`, polymorphic `as: "button" | "a"`, `forwardRef`. Native `<button>`/`<a>` underneath.
- **Field** ✓ — label + control + optional `hint` / `error`. Auto-wires `htmlFor` + `aria-describedby` + `aria-invalid`. Accepts custom `<textarea>` / `<select>` children. Error span sits outside the `<label>` so the accessible name stays clean.
- **Chip** ✓ — `variant: "index" | "amenity"`. Index = cinnabar fill (e.g. "N°04"); amenity = hairline-bordered `icon + label`.
- **Eyebrow** ✓ — optional `num` (cinnabar) + `label` (hairline-prefixed) slots.
- **Pulse** ✓ — `variant: "live" | "fallback"`, optional accessible `label`. Square via the global `border-radius: 0` reset (brand rule).
- **Mono** ✓ — polymorphic `as: "span" | "p" | "code"`. Single-class wrapper over `.mono`.
- **Icon** ✓ — typed `name` allowlist (44 glyphs in `icon-registry.ts`) over **`lucide-react`**, `size: xs | sm | md | lg | xl`, `label` toggles `role="img"` ↔ `aria-hidden`.
- **SkipLink** ✓ — file lives in `shell/` (consumed by `AppLayout`); re-exported through the `ui/` barrel.

### 5.10a Browse composites

`src/components/browse/` — slice 4.1 components. These render the prototype's editorial markup directly (`.venue`, `.hero__plate`, `.pager`) instead of going through generic primitives — the prototype-faithful approach beat the generic-wrapper approach during 4.1's iteration.

- **VenueCard** ✓ — magazine plate that links to `/venues/:id`. Renders `.venue → .venue__img → .venue__scrim → .venue__ticks → .venue__meta-top (.venue__index) → .venue__body (name, where, desc, row, amenities)`. Bento + venues-grid CSS overrides reshape this same markup per cell variant.
- **VenueCardSkeleton** ✓ — same `.venue` outer shape with `.venue--skeleton` shimmer. Accepts a `className` so skeletons occupy the right grid span during loading.
- **HeroPlate** ✓ — static cover plate for the Home hero (cinnabar-tagged figure with caption). API-driven hero was attempted three times during 4.1; rejected — Noroff dataset is too unreliable to drive the masthead. Live data shows in the bento + stats below.
- **Pager** ✓ — prototype's `.pager` markup (Prev / numbered list with `.pager__gap` ellipses / Next / `Page X / Y` meta). Mobile (≤640px): list collapses, layout becomes `[Prev] [meta] [Next]`.

### 5.10b Notable cleanup decision (slice 4.1 post-ship, Apr 27 2026)

Generic UI primitives originally built for slice 4.1 — `Pagination`, `EmptyState`, `ErrorState`, `BentoGrid`, `SearchInput` — were **deleted** after the prototype-faithful rewrite. The prototype renders these patterns inline (`.v-empty`, `.v-errstate`, `.bento` direct children, `.v-search input`, `.pager` instead of generic Pagination), so the wrappers had zero consumers. Per CLAUDE.md §3.5 (don't keep code with no caller). They can return if a future page genuinely needs the abstraction.

**Deferred (lazy — land with their first consumer):**

- **VenueGallery** / **AvailabilityCalendar** / **HostStrip** / **AmenityList** / **VenueSpecs** / **RatingStars** / **ReadMoreToggle** → slice 4.2
- **BookingPanel** / **GuestStepper** / **Receipt** → slice 5.2
- **VenueForm** / **AmenityToggle** / **ImageUrlList** → slice 5.4
- **PasswordField** (icon-leading + reveal) — `Field` extension that lands with slice 5.1 (auth)
- **Toast** / **ConfirmDialog** / **Tabs** / **CommandBar** / **Avatar** / **Badge** / **VisuallyHidden** — first slice that needs each
- **IconButton** / **LetterpressCTA** — auth slice if still needed; otherwise drop

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

Resource types and their Zod schemas shipped in slice 2. The schema is the single source of truth — types are derived via `z.infer<typeof XSchema>`. All resource schemas live in `src/api/schemas.ts`; the type files re-export for a clean consumer import surface.

- `Venue` (`src/types/venue.ts`) — mirrors Noroff v2 shape: `id`, `name`, `description`, `media[]`, `price`, `rating`, `maxGuests`, `meta{wifi,parking,breakfast,pets}`, `location{...}`, `owner?`, `bookings?`, `_count?`. Also exports `Media`, `Location`, `VenueMeta`, `Owner`.
- `Booking` (`src/types/booking.ts`) — `id`, `dateFrom`, `dateTo`, `guests`, `created`, `updated`, optional `venue`, `customer`.
- `Profile` (`src/types/profile.ts`) — extends `Owner` with optional `venueManager: boolean` and `_count: { venues, bookings }`. Also exports `PaginationMeta`.
- `ApiError` — class extending `Error` (so `instanceof` works in `catch` blocks). Fields: `status: number` (HTTP status, or `0` for network errors), `message: string`, `details?: unknown` (raw `errors` array if present). Lives at `src/types/api.ts`.

Key schema decisions (slice 2):

- Location fields use `.nullable()` (not `.optional()`) — the API sends `null` explicitly for unset coords/address, not absent keys.
- `owner` and `bookings` on `VenueSchema` are `.optional()` — only present when `?_owner=true` / `?_bookings=true` is passed.
- `VenueSchema` ↔ `BookingSchema` are mutually recursive; both use `z.lazy()` to break the cycle. Forward `interface` declarations carry the types across the cycle boundary.
- Zod 4 preferred forms used throughout: `z.url()`, `z.email()`, `z.iso.datetime()`.

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
