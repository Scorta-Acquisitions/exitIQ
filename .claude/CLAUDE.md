# exitIQ — Agent Contract (Demo Sprint Phase)

Read this file at the start of every session. It is the single source of truth for
coding standards, architecture constraints, and the technical reality of the codebase
**during the accelerator demo sprint**.

---

## Current Phase: Accelerator Demo Sprint

**We are building one flawless demo pathway. Nothing else.**

- **Prime directive:** UI perfection over backend accuracy. Hard-code everything that accelerates polish.
- **Sprint plan:** [.claude/DEMO_SPRINT.md](DEMO_SPRINT.md) — owns the station sequence, QA rule, persona references, state tracker, and handoff notes.
- **Positioning:** [.claude/Scorta-AI-Agent-Native.md](Scorta-AI-Agent-Native.md) — agent fleet architecture and approval layer.
- **Ground truth doc:** [.claude/Scorta-Ground-Truth-v6.md](Scorta-Ground-Truth-v6.md).
- **Persona (LOCKED):** three files in [.exitiq-debug/sessions/](../.exitiq-debug/sessions/) — `DEMO_PERSONA.md`, `demo-persona.json`, `demo-report.md`. Never invent persona values. If a value isn't in those files, stop and log an open question in Handoff Notes.


### What this means in practice

- One pathway only. Happy path only. No edge cases. No error handling beyond happy path.
- Mock data, static responses, single-pathway logic are explicitly allowed and encouraged.
- Loading states are mandatory — every async-feeling action gets a spinner or skeleton.
- Agent names appear in copy ("Ingestion Agent is classifying…", "Recast Agent proposes…").
- Anywhere an agent produces material output, show a "Review & Approve" surface — even if it's a no-op.
- Prefer "polished" over "real"; prefer "ships today" over "extensible".

### What this does NOT mean

- We still don't break the build. Type errors, dead routes, console errors, and broken navigation kill the demo.
- We still follow the architecture boundaries below (db server-only, env.mjs, no upward imports). Breaking these creates cascading bugs that cost more time than they save.

---

## Station Workflow (Anti-Drift)

Every session:

1. **Open** — Read `DEMO_SPRINT.md`. Confirm the active station from the State Tracker. Read the open Station Card. Read the last Handoff Note.
2. **Build** — Implement only what the Station Card defines. Do not gold-plate. Do not extend scope. Do not add a second pathway.
3. **Walk** — Run the QA Rule (3 questions) yourself. Click through prior stations to confirm no regressions.
4. **Close** — Update the State Tracker and append a Handoff Note in `DEMO_SPRINT.md` before ending the session.

### QA Rule (non-negotiable)

Before closing any station, all three must be Yes:

1. Can I click through this without breaking? (No console errors, no dead buttons, no 404s.)
2. Does it look investor-ready on a 1080p screen?
3. Does the mock data tell a coherent story? (Same company, same numbers, same names across every screen.)

---

## Stack (verified from `package.json`)

| Layer | Choice | Version pin |
|-------|--------|-------------|
| Framework | Next.js 15 App Router (RSC-first) | `next@15.5.10` |
| Dev bundler | Turbopack (`next dev --turbo`) | — |
| Language | TypeScript strict, `noUncheckedIndexedAccess`, `target: es5` | `typescript@^5.9` |
| Runtime | React 19 | `react@^19.2.4` |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`), CSS-variable design tokens in `styles/tailwind.css` | `tailwindcss@^4.2` |
| Primitives | Radix UI (accordion, dialog, dropdown, popover, select, slider, switch, tabs, tooltip, etc.) | `@radix-ui/*` |
| Variants | CVA + `tailwind-merge` | `class-variance-authority@^0.7` |
| Package manager | pnpm (node ≥ 20) — use `pnpm`, never `npm` or `yarn` | `pnpm@10.0.0` |
| ORM | Drizzle ORM + `postgres` (postgres.js driver) | `drizzle-orm@^0.45.2`, `postgres@^3.4.9` |
| DB | Supabase Postgres — transaction pooler for runtime | — |
| Auth | Supabase Auth via `@supabase/ssr` (publishable key in both browser and server clients) | `@supabase/ssr@^0.10.2` |
| Env | `@t3-oss/env-nextjs` via `env.mjs` (single surface) | `@t3-oss/env-nextjs@^0.13` |
| AI | AI SDK v6 + `@ai-sdk/anthropic` (direct provider — **not** AI Gateway) | `ai@^6.0.160`, `@ai-sdk/anthropic@^3.0.69` |
| AI models | `claude-sonnet-4-6` (reports), `claude-haiku-4-5-20251001` (fast paths) — constants in `lib/ai/index.ts` | — |
| Email | Resend (optional — only sends when `RESEND_API_KEY` is set) | `resend@^6.12` |
| Validation | Zod | `zod@^3.24` |
| Observability | `@vercel/otel` + custom structured logger (`lib/logger.ts`) | `@vercel/otel@^1.12` |
| Testing | Vitest + RTL + Playwright | `vitest@^3.2`, `@playwright/test@^1.58` |
| Stories | Storybook 8 | `storybook@^8.6` |

**Do not introduce a new color palette, component library, or AI provider.** Inherit what's in place.

---

## Environment Variables — `env.mjs` is the ONLY surface

**Never read `process.env` directly anywhere in application code** (only exception: `lib/debug/workflow-trace.ts` reads `EXITIQ_WORKFLOW_LOG` and `VERCEL` directly, by design, to stay outside the t3-env server guard so it can be invoked from edge-bundled helpers and tests).

```ts
import { env } from "@/env.mjs"
// ✅ env.DATABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL, …
// ❌ process.env.DATABASE_URL
```

### Variables (as defined in `env.mjs`)

| Variable | Scope | Purpose |
|---|---|---|
| `DATABASE_URL` | server | Postgres connection — **transaction pooler (port 6543)** for runtime; use session pooler (5432) only when running `drizzle-kit` locally |
| `SUPABASE_URL` | server | Project URL — declared but not currently consumed by any runtime code path |
| `SUPABASE_SERVICE_SECRET_KEY` | server | Service-role key — **declared but only used inside the RLS integration test** (`lib/db/__tests__/assessment-rls.int.test.ts`). No runtime code uses it. Do not introduce service-role calls casually. |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Used by both browser and server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | Used by both browser and server Supabase clients (server client uses publishable + cookies, **not** the service key) |
| `ANTHROPIC_API_KEY` | server | Anthropic API key consumed in `lib/ai/index.ts` |
| `RESEND_API_KEY` | server, optional | When missing, `lib/email/index.ts` becomes a no-op |
| `EXITIQ_WORKFLOW_LOG` / `NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG` | both | Enable NDJSON workflow tracing to `.exitiq-debug/` (local dev only; auto-disabled on Vercel) |
| `ANALYZE` | server | Toggles `@next/bundle-analyzer` in `next.config.ts` |
| `SKIP_ENV_VALIDATION` | special | Set in CI / lint envs lacking real creds (bypasses `createEnv` validation) |

`.env.local.example` is the canonical template. Update both `env.mjs` and `.env.local.example` whenever a variable is added/removed.

**`prepare: false` is set in `lib/db/index.ts`** because `DATABASE_URL` is the transaction-mode pooler (PgBouncer in transaction mode doesn't support prepared statements). **Never remove it.**

---

## Architecture Boundaries (Hard Rules)

### 1. Import alias `@/*` → repo root

```ts
import { env } from "@/env.mjs"
import { db } from "@/lib/db"
```

No relative `../../` imports for repo-internal modules.

### 2. Database access is server-only

`lib/db/index.ts` exports a module-level `db` singleton (single `postgres()` client reused across requests). Import it **only** in:

- Route Handlers (`app/api/**/route.ts`)
- Server Actions (`"use server"` files)
- Server-only utility modules

**Never** import `db` from a Client Component. For the demo, prefer hard-coded data in components — but if you must hit the DB, do it server-side.

### 3. Supabase client split (`lib/supabase/`)

| Client | File | Use |
|---|---|---|
| Browser | `client.ts` (`createBrowserClient`) | Client Components, browser-side auth |
| Server | `server.ts` (`createServerClient` + `next/headers` cookies) | Server Components, Route Handlers |
| Middleware | `middleware.ts` (`createServerClient` + `NextRequest` cookies) | `middleware.ts` session refresh only |

All three currently use the **publishable** key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). RLS is the gatekeeper for `anon`; Drizzle bypasses RLS via the direct `DATABASE_URL` connection.

The root [middleware.ts](../middleware.ts) calls `supabase.auth.getUser()` on every non-static request to keep server-component auth state in sync.

### 4. Module layering (no upward imports)

```
app/          (pages, layouts, route handlers, server actions)
  └── lib/    (assessment, ai, supabase, db, email, debug, logger)
        └── env.mjs   (sole env surface)
```

A module in `lib/` must not import from `app/`. UI components must not import `db`.

---

## Routes & API Contract (actual, verified)

```
app/
  page.tsx                                    → components/scorta/LandingPage
  about/page.tsx                              → components/scorta/AboutPage
  report/[sessionId]/page.tsx                 → assessment report page
  api/
    health/route.ts                           GET     liveness probe
    waitlist/route.ts                         POST    waitlist signup
    assessment/
      session/route.ts                        POST    upsert session (one route, all stages)
      session/[session_id]/route.ts           GET     read session row
      generate/route.ts                       POST    stream Sonnet report (text/plain)
      report/[session_id]/route.ts            GET     read cached report markdown
      teaser/                                  (teaser route exists — Haiku fast-path)
    debug/workflow-trace/route.ts             POST    client → server trace event sink
```

`next.config.ts` rewrites `/healthz`, `/api/healthz`, `/health`, `/ping` → `/api/health`.

### Assessment data flow

1. Client persists stage answers to `localStorage` (source of truth in-session) via `lib/assessment/session.ts`.
2. Client fires `POST /api/assessment/session` with a `SessionPatch` (see `lib/assessment/api.ts`).
3. Server validates with Zod, computes `score` + `sbaEligible` only when `completedAt` is present, returns `200` **before** the DB write completes (the write runs inside `after()`).
4. Client calls `POST /api/assessment/generate` which streams Sonnet output and persists the final markdown in another `after()` callback.

**Known race:** `/generate` can be called before the session is persisted (the upsert runs in `after()` after the 200). The route returns `404 not_found` in that case. See the `traceEvent("api.generate.session_not_found", …)` block in [app/api/assessment/generate/route.ts](../app/api/assessment/generate/route.ts) and the comments around the trailing `traceEvent("api.session.http_200_sent_before_after", …)` in `session/route.ts`. Do not "fix" this by removing `after()` without coordinating — it's the deliberate latency/UX tradeoff.

### Stage data — JSONB everywhere

`assessment_sessions` stores `stage1`, `gate`, `stage2`, `stage3`, `stage4` as JSONB columns. Per-stage Zod schemas live in `app/api/assessment/session/route.ts`; TS types live in `lib/assessment/session.ts` (`Stage1Answers` … `Stage4Answers`, `GateAnswers`). When adding a new stage field, update **both** the Zod schema and the TS interface.

### Naming quirk

`SegmentTag` was renamed to `leadQuality` in TypeScript but the DB column stays `segment_tag` (`.$type<SegmentTag>()` on the Drizzle column). See [lib/db/schema/assessments.ts](../lib/db/schema/assessments.ts):22-24. No migration is required for this rename — preserve the existing column name.

---

## Database

### Schema (`lib/db/schema/`)

Three tables, all RLS-enabled:

| Table | Purpose | Notable columns |
|---|---|---|
| `assessment_sessions` | One row per assessment | `session_id` (text, unique), stage1-4 + gate JSONB, `segment_tag`, `score`, `sba_eligible`, `completed_at` |
| `assessment_reports` | One report per session | `session_id` (FK, unique), `report_md`, `model_used`, `generation_ms` |
| `waitlist` | Email capture | `email` (unique), `role`, `source` |

### RLS posture

Public demo, anon role only:

- `anon_insert_sessions`, `anon_insert_reports`, `anon_insert_waitlist` — anon can INSERT.
- Anon SELECT/UPDATE on assessment tables were **dropped** in migration `0001_drop_anon_rw_policies.sql`. All reads route through API routes (which use the Drizzle service-level connection via `DATABASE_URL`, bypassing RLS).
- When you add a user-data table, RLS policies must ship in the **same migration**.

### Migrations (`lib/db/migrations/`)

```
0000_colossal_gravity.sql               initial schema + RLS
0001_drop_anon_rw_policies.sql          remove anon SELECT/UPDATE
0003_jazzy_dormammu.sql                 waitlist table + RLS
0004_fine_fixer.sql                     drop teaser_json column
0005_rainy_devos.sql                    swap session_id idx → UNIQUE constraint
0006_restore_assessment_anon_policies_idx.sql   idempotent repair
```

Migration `0002` is intentionally skipped (squashed during early development). Don't renumber.

### Commands

```bash
pnpm db:generate   # Generate migration SQL from schema changes
pnpm db:migrate    # Apply migrations — use SESSION pooler URL (port 5432) locally
pnpm db:push       # DEV/LOCAL ONLY — never staging/prod
pnpm db:studio     # Drizzle Studio
```

`drizzle.config.ts` loads `DATABASE_URL` via `env.mjs`. To run migrations, swap the value to a session-pooler URL in `.env.local` for that command only.

---

## Observability & Debug

- **`instrumentation.ts`** — registers `@vercel/otel` with `serviceName: "scorta-api"` and attaches an `unhandledRejection` handler that emits structured JSON.
- **`lib/logger.ts`** — `logger.info/warn/error(event, ctx)` emits a single JSON line per call; Vercel captures and indexes. `timed(name, fn)` wraps an async fn with success/error duration logging.
- **`lib/debug/workflow-trace.ts`** — `traceEvent(phase, payload)` appends NDJSON to `.exitiq-debug/sessions/<sessionId>.ndjson`. **Local dev only**: gated by `EXITIQ_WORKFLOW_LOG=true` AND `VERCEL !== "1"`. Tracing must never crash the app (errors are swallowed).
- **Client tracing** — `lib/debug/workflow-trace-client.ts` POSTs events to `/api/debug/workflow-trace` when `NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG=true`.

PII redaction: gate data must go through `redactGateForTrace()` before being passed to `traceEvent`.

---

## Components

```
components/
  scorta/                 marketing surfaces (landing, about)
    LandingPage.tsx
    AboutPage.tsx
  exitiq/                 assessment flow (client-heavy, WebGL canvas)
    ExitIQApp.tsx         master state machine + WebGL lifecycle
    questions.tsx         question panel
    dashboard.tsx         in-flow stage dashboard (NOT the /dashboard route)
    preview.tsx           gate teaser card + email gate modal
    report.tsx            cinematic loader + report shell
    report-visual.tsx     visual report renderer
    radar.tsx             7-axis radar chart
    bento.tsx             bento grid
    ui.tsx                SignalOrb / Ripple / ScanLine / AIInsight
```

Stations 2–10 in `DEMO_SPRINT.md` (`/dashboard`, `/connect`, `/ingestion`, `/recast`, `/risk`, `/documents`, `/score`, `/marketplace`, `/outreach`) **do not exist yet**. They get built during the sprint.

---

## Design System

| Principle | Rule |
|---|---|
| Tokens | CSS variables in `styles/tailwind.css` (`--t1` … `--glass-bg`, `--scan-color`, …). Dark is default; `[data-theme="cream"]` is the light variant. |
| Production feel | No placeholders. No lorem ipsum. Real persona data everywhere. |
| Loading states | Every async-feeling action has a spinner or skeleton. No abrupt state jumps. |
| Error states | Skip for demo. Happy path only. |
| Navigation | Always works. No dead links. No 404s. Left-rail status indicators per route. |
| Mobile | Not required. Optimize for 1080p+ desktop. |
| Color / components | Inherit from project. Do not introduce new palette or library. |
| Copy tone | Reinforce agent-fleet positioning. Name the agents on screen. |
| Approval layer | Show "Review & Approve" anywhere an agent produces material output. |
| Fonts | `EB Garamond` (serif), `Inter` (sans), `JetBrains Mono` — loaded via `next/font/google` in `app/layout.tsx`. |

---

## Commands

```bash
pnpm dev           # Next dev with Turbopack
pnpm build         # Production build
pnpm start         # Production server
pnpm lint          # ESLint (flat config — typescript-eslint + next + storybook + import-order)
pnpm lint:fix
pnpm prettier      # Prettier check
pnpm prettier:fix
pnpm typecheck     # tsc --noEmit
pnpm test          # Vitest with RUN_DB_INTEGRATION_TESTS=1
pnpm test:integration   # Just the DB integration tests
pnpm e2e:headless  # Playwright
pnpm storybook
pnpm db:studio
```

---

## Demo Definition of Done (per station)

A station is done when:

- [ ] QA Rule (3 questions) all Yes
- [ ] Clickthrough works end-to-end with no console errors
- [ ] All copy and numbers come from the locked persona files (no invented values)
- [ ] Loading states present on every async-feeling action
- [ ] Agent names appear in copy where agents are doing work
- [ ] Approval surface appears where agents produce material output
- [ ] State Tracker updated and Handoff Note appended in `DEMO_SPRINT.md`

`pnpm lint` and `pnpm typecheck` should still pass — don't ship broken TypeScript or lint errors that will surface in the dev console during the demo. Full test suite, Storybook smoke tests, and migration discipline are de-prioritized for this sprint **unless a station explicitly requires DB schema changes** (in which case the RLS-in-same-migration rule still applies).

---

## What This Project Is

**Scorta** is positioned as an AI-native broker for sub-$2M Main Street businesses — the underwriter, prep shop, and broker-of-record run by a coordinated fleet of specialized agents (Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom, Lender Ops, Outreach) with humans on the approval layer.

The unclaimed wedge: nobody owns the "is this business actually sellable, and if not, what would make it sellable?" layer. Baton is a marketplace. OffDeal is an AI investment bank for $5M+. Iconic is a tech-enabled advisory firm up to $100M. Scorta owns the sub-$2M sellability wedge.

The codebase started as **exitIQ** — the public Exit IQ Assessment (stages 1 + gate live today; stages 2–4 are schema-ready but unused in the live flow). That assessment remains the entry point. The demo sprint extends it into the full agent-fleet narrative across the 10 stations defined in [.claude/DEMO_SPRINT.md](DEMO_SPRINT.md).
