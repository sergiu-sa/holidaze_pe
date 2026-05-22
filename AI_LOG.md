# AI Usage Log: Holidaze

This file records the AI assistance I used while building **Holidaze** (Noroff Project Exam 2), as required by the assignment's AI policy. A condensed version of this log also appears in my reflection report.

## How I used AI

I worked with **Claude (Anthropic)** throughout the project. During the planning and design week it was mostly a thinking and drafting partner, somewhere to test the concept and to get the design system and the project documentation onto paper. During the build it ran through Claude Code: a main session on **Opus 4.7** that I worked in directly, plus two helpers I could call on. A read-only **code-explorer** pass surveyed the relevant files before I changed them, and a **code-reviewer** pass read each change before I committed it.

The pattern stayed the same from start to finish. I settled the design language and the architecture first, used AI to move faster through the implementation and to explain anything I wanted to see in more depth, and treated nothing as done until I had tested it and could account for it on my own. Nothing went into the repository that I can't reason about myself.

Commit messages, pull-request descriptions, GitHub issue and board copy, code comments and some inline SVG were drafted by AI, in the first pass, I edited before pushing to the repo.

The three tools named in the log below:

- **Opus 4.7**: the model the main session ran on, where the planning, building and checking happened.
- **code-explorer**: read-only sweeps that mapped the relevant code before a change, so I could brief the work precisely.
- **code-reviewer**: an independent second read of each diff before it was committed.

**Scope.** This log covers the planning and design week and the build phase, 13 April to 21 May 2026.

## Log - Sergiu

| Tool | Date | Purpose | Outcome |
| --- | --- | --- | --- |
| Claude (Anthropic) | 13-20 Apr 2026 | The planning and design week: brainstorming the concept and design system, drafting the page and component inventory, breaking the brief into checklists, writing the brand and design docs, and specific problems I hit while building the Figma prototype | A clear creative direction and a planning set that let me picture the whole project before any code. The concept, the design system and the prototype were mine; AI gave me something to think out loud against, helped get the planning on paper quickly, and got me unstuck in Figma |
| Claude (Anthropic) | 21 Apr 2026 | Setup guidance: scaffolding Tailwind v3, PostCSS, fonts and the Atlas Press tokens, and deferring Zod to the API layer | Tailwind compiled with the full token set, and the React 18 pin and scripts were settled. AI flagged missing installs. Each config call was mine, checked against a clean build |
| Claude (Anthropic) | 25 Apr 2026 | Configuration guidance: hardening ESLint and standing up Vitest, React Testing Library, Playwright and CI | A flat ESLint config and a two-job CI pipeline went green, with the no-rounded-corners rule baked in as a lint check. I chose the rules and confirmed a clean run |
| Claude (Anthropic) | 25 Apr 2026 | The API client: a fetch wrapper, the Noroff envelope unwrap, dual-header auth, an `ApiError` type, the session store and an MSW test harness | The data layer landed with 15 tests green. I decided the auth modes and session isolation, and read it through before relying on it |
| Claude (Anthropic) | 26 Apr 2026 | Implementation help on the Zod schemas and types for Venue, Booking and Profile, including the recursion the Noroff shapes need (`z.lazy()`) | Seven schemas and their types shipped with 21 tests green. The nullable-versus-optional rules I worked out from the real API myself |
| Claude (Anthropic) | 27 Apr 2026 | UI primitives and the first Vercel deploy: SPA rewrites, security headers, Web Vitals | Seven lazy primitives and a live build. Choosing lucide-react and restructuring Field for accessibility were my calls; I configured and smoke-tested the deploy |
| Claude (Anthropic) | 27 Apr 2026 | The browse and search slice (V1, V2): re-deriving `isUsable` and the `FALLBACK` list in TypeScript, a venue cache, the `useVenues` and `useVenueSearch` hooks. | Browse and search worked across all four states: loading, success, empty and error. When the first attempt drifted from the prototype I sent it back. Knowing what the design demanded was on me |
| Claude (Anthropic) | 29 Apr 2026 | Explanation and implementation help with Venue detail and the availability calendar (V3, V5): the date-range state machine, a keyboard ARIA calendar grid, a native `<dialog>` lightbox and a shared 404 | A full venue spread with a two month booked dates calendar. I had code explorer map the data layer first, set the architecture, and traced the calendar logic before accepting it |
| Claude (Anthropic) | 29 Apr 2026 | Design guidance on the Atlas page: a typographic world map with markers, a gazetteer and a selection dock, across a multi-pass redesign | Atlas became the editorial centrepiece, with 223 tests green after the arc. This was almost entirely my direction, steered pass by pass until it read right |
| Claude (Anthropic) | 2 May 2026 | The auth slice (V4, C1, C2, M1, M2): the Noroff register, login and create-api-key bootstrap, three route guards, the `useAuth` provider and the sign-in and register screens | Auth worked end-to-end. The code-reviewer pass caught two real bugs in `login()` before they shipped. I confirmed the response shapes against the live API |
| Claude (Anthropic) | 4 May 2026 | Helped implementing the booking flow (C3): a four-state inline panel, an auth-required interrupt, a print-ready receipt and a queued toast stack | Booking shipped. The code-reviewer pass surfaced a missing force-refetch on a 409 conflict. The flow was settled in planning, where the real decisions sat |
| Claude (Anthropic) | 6 May 2026 | Guidance wioth the profile area (C4, C5, M7): nested `/profile` routing, a bookings list, and an avatar editor with a live image probe and a monogram fallback | The profile area shipped and a lingering avatar bug was closed. I set the scope, keeping the cancel action and dropping the immutable username field |
| Claude (Anthropic) | 8-10 May 2026 | Implementation help on manager venue CRUD (M3 to M6) and its accessibility pass: VenueForm, AmenityToggle, ImageUrlList, VenueRow, the owner gate and native navigation | The full create, edit, delete and view lifecycle shipped, with a story-validation pass confirming the graded stories end-to-end. I used code-explorer to map the foundations first |
| Claude (Anthropic) | 10 May 2026 | Design help on the Hosts editorial pitch page and a reusable ContactShortcut component | Hosts shipped at Lighthouse 91 / 94 / 96 / 92. The code-reviewer pass flagged a token location and a tap-target size; I made the revisions and signed off the deliberate brand deviations |
| Claude (Anthropic) | 12-15 May 2026 | Home polish: the intro and cover acts, the Atlas marker and pulse-glyph rebuild, the search funnel and longitude marquee, and the Ruler colophon | First-visit choreography with `localStorage` gating and reduced-motion fallbacks. I drove the design and the round-by-round fixes, and tracked down a React StrictMode double-invoke bug |
| Claude (Anthropic) | 16-20 May 2026 | Triaging the Lighthouse, HTML-validator and WAVE findings into fixes, splitting `global.css` into partials, and turning on strict TypeScript | The five graded routes reached Lighthouse Accessibility 97 to 100 with no WAVE errors, and strict mode came on with zero type errors. I set the bar, re-ran each tool locally and on the deploy, and approved only what cleared it |
| Claude (Anthropic) | 19-21 May 2026 | Drafting the README, this AI log, and the reflection report | Drafts built from my own build records, then edited by me, with every figure checked back against the repository |

> A note on how to read this log: AI sped the work up, but it did not make the decisions. The design language, the architecture, the scope and the trade-offs were mine. Where I leaned on AI to implement or to explain, I made a point of understanding the result well enough to defend it without help.
