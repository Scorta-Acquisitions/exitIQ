# legacy/ — sunset Scorta / exitIQ application

This directory holds the previous website, authenticated seller workspace, DealIQ buyer app, and
their API routes. It was moved here (not deleted) when the new Heirloom marketing site took over
the root `app/` directory.

- `legacy/app/` — the former Next.js App Router tree (marketing pages, `(app)` workspace, `(dealiq)`, `api/*`).
- `legacy/middleware.ts` — the former Supabase session / DealIQ access middleware.
- `legacy/__tests__/` — the former API route tests (still run by Vitest; imports point at `@/legacy/app/...`).

Nothing under `legacy/app/` is routed or deployed: Next.js only serves the root `app/` directory.
Shared libraries the legacy code depends on (`lib/assessment`, `lib/db`, `lib/supabase`, `lib/ai`,
`lib/dealiq`, `components/scorta`, `components/exitiq`, `components/dealiq`, …) remain in place and
are still type-checked and unit-tested so the code can be revived or mined later.

To bring a legacy route back, move it under root `app/` and restore the middleware.
