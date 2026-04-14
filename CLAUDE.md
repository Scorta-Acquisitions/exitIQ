# exitIQ — Agent Contract

Read this file at the start of every session. It is the single source of truth for
coding standards, architecture constraints, and the definition of done.

---

## Product & Spec Context

- **Product spec:** `Product.md` — read before making any UX, flow, or data-model decision.
- **Infrastructure tickets:** `tickets/infra-tickets.md` — acceptance criteria and
  exact implementation details for all infra (Supabase, Drizzle, env, auth, CI).
- **Tickets drive implementation.** If a ticket spec and your inference conflict,
  the ticket wins. If the ticket is ambiguous, stop and ask.

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router (`app/` directory, RSC-first) |
| Language | TypeScript (strict, `ts-reset` included) |
| Styling | Tailwind CSS v4 + `tailwind-merge` |
| Components | Radix UI primitives + CVA for variants |
| Package manager | pnpm (node ≥ 20, pnpm 10) — use `pnpm`, never `npm` or `yarn` |
| ORM | Drizzle ORM + `postgres` (postgres.js driver) |
| Database | Supabase Postgres — transaction pooler for runtime |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Env validation | T3 Env (`@t3-oss/env-nextjs`) via `env.mjs` |
| Testing | Vitest + React Testing Library + Playwright |
| Component dev | Storybook 8 |
| Observability | OpenTelemetry (`@vercel/otel`) |
| Releases | Semantic Release + Conventional Commits |
| AI | Anthropic Claude (Haiku for fast paths, Sonnet for report generation) |

---

## Import Alias

All internal imports use `@/*` which maps to the repo root:

```ts
import { env } from "@/env.mjs"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
```

Never use relative `../../` imports for repo-internal modules.

---

## Environment Variables — `env.mjs` is the ONLY env surface

**Never read `process.env` directly anywhere in application code.**
Always import from `@/env.mjs`:

```ts
import { env } from "@/env.mjs"
// ✅ env.DATABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL, etc.
// ❌ process.env.DATABASE_URL
```

### Variable names (do not invent aliases)

| Variable | Location | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | server | Postgres connection — **transaction pooler URL** (port 6543) |
| `SUPABASE_URL` | server | Project URL for server-side Supabase client |
| `SUPABASE_SERVICE_SECRET_KEY` | server | Secret/service-role key — never exposed to browser |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Project URL (safe for browser) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | Publishable (anon) key — safe for browser |

**Transaction pooler note:** `DATABASE_URL` must point to the Supabase transaction-mode
pooler (port 6543, not 5432). This is why `prepare: false` is set on the postgres.js
client in `lib/db/index.ts`. **Never remove `prepare: false` from that client.**
Use the session pooler / direct URL only for `drizzle-kit` migrations (port 5432).

---

## Architecture Boundaries

### 1. Database access is server-only

`lib/db/index.ts` exports `db` — import it **only** in:
- Route Handlers (`app/api/**/route.ts`)
- Server Actions (`"use server"` files)
- Server-only utility modules (not imported by client components)

**Never** import `db` from a Client Component or any file that ships to the browser.
This is a hard rule — agents must not spray Drizzle queries into UI components.

### 2. Supabase client split

| Client | File | Use for |
|--------|------|---------|
| Browser | `lib/supabase/client.ts` | Client Components, browser-side auth |
| Server | `lib/supabase/server.ts` | Server Components, Route Handlers, cookie reads |
| Middleware | `lib/supabase/middleware.ts` | `middleware.ts` session refresh only |

The service secret key (`SUPABASE_SERVICE_SECRET_KEY`) is used only for admin
operations (e.g., setting custom claims, bypassing RLS) — never in browser paths.
Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for all browser-facing Supabase clients.

### 3. Assessment flow is the source of truth

`Product.md` defines the exact API contract (`POST /api/assessment/stage1`, etc.),
data model, and report JSON shape. Before generating any route handler or data
payload, read the relevant section of `Product.md`. Do not deviate without updating
`Product.md` first.

### 4. Module layering (no upward imports)

```
app/          (pages, layouts, route handlers)
  └── lib/    (business logic, db, supabase clients)
        └── env.mjs  (only env surface)
```

A module in `lib/` must not import from `app/`. UI components must not import `db`.

---

## Database Discipline

### Migration rules (non-negotiable)

1. **Runtime:** `DATABASE_URL` = transaction pooler (port 6543) with `prepare: false`. Always.
2. **Migrations:** Schema changes go through `db:generate` → commit the SQL → apply via
   `db:migrate`. Use session pooler URL (port 5432) when running `drizzle-kit` locally.
   **`db:push` is for local iteration only — never on staging or production.**
3. **RLS:** When adding any user-data table, RLS policies ship in the **same PR** as the
   migration — never deferred to a follow-up.

### Commands

```bash
pnpm db:generate   # Generate migration SQL from schema changes
pnpm db:migrate    # Apply pending migrations (use session pooler URL locally)
pnpm db:push       # Push schema directly — DEV/LOCAL ONLY
pnpm db:studio     # Open Drizzle Studio UI
```

Schema files: `lib/db/schema/index.ts`
Migration output: `lib/db/migrations/`
Config: `drizzle.config.ts`

---

## Pre-Push Checklist — mirrors CI exactly

Run all of these locally before pushing. CI will fail on the same checks.

```bash
pnpm lint                          # ESLint (Next.js config)
pnpm prettier                      # Prettier format check
pnpm test                          # Vitest unit + integration tests
pnpm exec tsc --noEmit             # TypeScript type check (not in CI yet — run manually)
pnpm build-storybook --quiet && \
  pnpm dlx concurrently -k -s first \
    "pnpm dlx http-server storybook-static --port 6006 --silent" \
    "pnpm dlx wait-on tcp:127.0.0.1:6006 && pnpm test-storybook"
  # Storybook smoke tests (matches CI)
```

Fix scripts:
```bash
pnpm lint:fix        # Auto-fix lint errors
pnpm prettier:fix    # Auto-fix formatting
```

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add stage-2 health check API route
fix: correct SDE multiple calculation in valuation
chore: update Drizzle to 0.45.3
docs: clarify RLS policy requirements in CLAUDE.md
```

Semantic Release is configured and generates changelogs automatically on merge to main.

---

## Definition of Done

A PR is not mergeable unless:

- [ ] `pnpm lint` passes with no new errors
- [ ] `pnpm prettier` passes
- [ ] `pnpm test` passes
- [ ] Storybook tests pass (if components were changed)
- [ ] `tsc --noEmit` passes (no new type errors)
- [ ] If schema changed: migration SQL committed, `db:generate` output matches
- [ ] If new env vars added: `env.mjs` and `.env.local.example` both updated
- [ ] RLS policies included in same PR as any new user-data table
- [ ] PR template filled out (what / how verified / risk / migrations)
- [ ] At least one human review approved

---

## What This Project Is

BrokerFree / exitIQ — AI-powered platform for buying and selling small businesses
under $10M. Phase 1 (building now): Exit IQ Assessment — a public, no-login tool
where a seller answers 16 questions across 4 stages and receives an AI-generated
"Exit IQ Report." Read `Product.md` for the full spec before touching any feature code.
