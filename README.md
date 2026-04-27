# Holidaze

[![CI](https://github.com/sergiu-sa/holidaze_pe/actions/workflows/ci.yml/badge.svg)](https://github.com/sergiu-sa/holidaze_pe/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/vercel-deployed-000?logo=vercel)](https://holidaze-black.vercel.app/)

A modern front end for **Holidaze**, an accommodation booking site built against the Noroff API v2.

## What it does

- **Guests** browse and search venues, view details and availability calendars, and register an account.
- **Customers** book stays, view their upcoming bookings, and manage their profile.
- **Venue Managers** create, edit, and delete venues, and track bookings on venues they own.

## Stack

React + TypeScript + Tailwind, talking to `https://v2.api.noroff.dev/holidaze`. Hosted on Vercel.

## Local development

```bash
npm install
npm run dev          # vite dev server, localhost:5173
npm run build        # production bundle into dist/
npm run preview      # serve the production bundle locally, localhost:4173
npm run lint         # eslint, zero-warning gate
npm run typecheck    # tsc --noEmit
npm run test         # vitest
npm run e2e          # playwright
```

## Design

[Figma – Holidaze°](https://www.figma.com/design/6b7xOMQl4yOkBZMJXQ9kNo/Holidaze%C2%B0?node-id=0-1&t=p3dzslViAIxekmkm-1)

## Links

- [GitHub repo](https://github.com/sergiu-sa/holidaze_pe)
- [GitHub project board](https://github.com/users/sergiu-sa/projects/14)
- [Production](https://holidaze-black.vercel.app/)
