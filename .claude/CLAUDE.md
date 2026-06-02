# exitIQ / Scorta — Engineering Contract

Read this at the start of every session. It is the single source of truth for the stack,
architecture boundaries, conventions, and the engineering standards this codebase holds itself to.
When the code and this document disagree, trust the code and fix this document.

---

## What this project is

**Scorta** is an AI-native broker for sub-$2M Main Street businesses — underwriter, prep shop, and
broker-of-record run by a coordinated fleet of specialized agents (Ingestion, Recast,
Owner-Dependency, Concentration, Case Manager / CASE, Boardroom, CIM, VDR, Lender Ops, Outreach)
with humans on the approval and relationship layer.

The codebase began as **exitIQ** — the public Exit IQ Assessment (stage 1 + email gate are live;
stages 2–4 are schema-ready but not yet wired into the live flow). That assessment plus the GAP
report it generates is the kept foundation. Current build direction (see `plans/`) is
**brokerage-first**: build the full broker workflow — CIM generation, marketplace listings, buyer
qualification, LOI drafting, data room — as agent surfaces, while the seller relationship stays
human-in-the-loop.

Engineering reality to keep in mind: much of the authenticated `(app)` workspace currently renders
against a **single locked mock persona** (`lib/persona.ts`) rather than live per-user data. That is
acceptable scaffolding, but it is *debt*, not a standard. New work should move data flows toward
real, per-session/per-user data wherever feasible, and must not deepen the mock coupling without a
reason.

Build plans live in [`plans/`](../plans):
- `plans/Scorta Brokerage Build.md` — strategic pivot + broker responsibility map
- `plans/Phase 1 — Intake & Valuation.md`, `Phase 2 — Listing Preparation.md`, `Phase 3 — Buyer Outreach & Qualification.md`

---

## Engineering standards (non-negotiable)

These apply to all new and modified code. They replace the prior "demo sprint / happy-path-only" rules.

1. **The build stays green.** `pnpm typecheck` and `pnpm lint` must pass. No type errors, no
   `@ts-ignore` without a one-line justification, no dead routes, no console errors in normal flows.
2. **Type safety is real.** TypeScript is strict with `noUncheckedIndexedAccess`. No `any` to silence
   the compiler — model the type. Validate all external input (request bodies, params, env) with Zod.
3. **Handle the unhappy path.** Route handlers and server actions must handle invalid input, missing
   rows, and upstream failures with explicit status codes and structured logs — not crashes. Client
   surfaces need loading **and** error states. (Existing demo code may not; new code must.)
4. **Respect the architecture boundaries** below (env surface, server-only DB, no upward imports,
   `@/*` alias). Breaking these creates cascading bugs.
5. **Tests for logic.** Pure logic in `lib/` (scoring, segmentation, SBA, transforms) is unit-tested
   with Vitest. DB schema/RLS behavior has integration tests. Add/extend tests when you touch this logic.
6. **Migrations are append-only and ship with their RLS.** Never edit an applied migration; generate a
   new one. Any new user-data table ships its RLS policies in the *same* migration.
7. **No secrets in code or logs.** Read config only through `@/env.mjs`. Redact PII before tracing.
8. **Small, reviewable changes.** Match existing file conventions. Don't reformat unrelated code or
   introduce new libraries/palettes/AI providers without cause.

A related but separate document, [`AGENTS.md`](../AGENTS.md) at the repo root, is the **read-only PR
review contract** (server/client/hooks/bundle/design-token/a11y rules). Treat its rules as the target
state for frontend code; note that the current inline-style station UI predates several of them.

---

## Stack (verified from `package.json`)

| Layer | Choice | Pin |
|-------|--------|-----|
| Framework | Next.js 15 App Router (RSC-first) | `next@15.5.10` |
| Dev bundler | Turbopack (`next dev --turbo`) | — |
| Language | TypeScript strict, `noUncheckedIndexedAccess` | `typescript@^5.9` |
| Runtime | React 19 | `react@^19.2.4` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + CSS-variable design tokens in `styles/tailwind.css` | `tailwindcss@^4.2` |
| Primitives | Radix UI (accordion, dialog, dropdown, popover, select, slider, switch, tabs, tooltip, checkbox, radio, scroll-area, toggle-group, label, form) | `@radix-ui/*` |
| Variants | CVA + `tailwind-merge` | `class-variance-authority@^0.7` |
| Package manager | **pnpm** (node ≥ 20) — never `npm`/`yarn` | `pnpm@10.0.0` |
| ORM | Drizzle ORM + postgres.js | `drizzle-orm@^0.45`, `postgres@^3.4` |
| DB | Supabase Postgres — transaction pooler at runtime | — |
| Auth | Supabase Auth via `@supabase/ssr` (publishable key, cookie sessions) | `@supabase/ssr@^0.10` |
| Env | `@t3-oss/env-nextjs` via `env.mjs` (single surface) | `@t3-oss/env-nextjs@^0.13` |
| AI | AI SDK v6 + `@ai-sdk/anthropic` (direct provider — **not** AI Gateway) | `ai@^6.0`, `@ai-sdk/anthropic@^3.0` |
| AI models | `claude-sonnet-4-6` (reports), `claude-haiku-4-5-20251001` (fast paths) — constants in `lib/ai/index.ts` | — |
| Email | Resend (no-op until `RESEND_API_KEY` set) | `resend@^6.12` |
| Validation | Zod | `zod@^3.24` |
| Observability | `@vercel/otel` + structured logger (`lib/logger.ts`) | `@vercel/otel@^1.12` |
| Testing | Vitest + RTL + Playwright | `vitest@^3.2`, `@playwright/test@^1.58` |
| Stories | Storybook 8 | `storybook@^8.6` |

**Do not introduce a new color palette, component library, or AI provider.** Inherit what's in place.

---

## Environment Variables — `env.mjs` is the ONLY surface

**Never read `process.env` directly in application code.** The single exception is
`lib/debug/workflow-trace.ts`, which reads `EXITIQ_WORKFLOW_LOG` and `VERCEL` directly by design, to
stay outside the t3-env server guard so it can run from edge-bundled helpers and tests.

```ts
import { env } from "@/env.mjs"
// ✅ env.DATABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL, …
// ❌ process.env.DATABASE_URL
```

| Variable | Scope | Purpose |
|---|---|---|
| `DATABASE_URL` | server | Postgres — **transaction pooler (6543)** at runtime; session pooler (5432) only for local `drizzle-kit` |
| `SUPABASE_URL` | server | Project URL — declared, not currently consumed by runtime code |
| `SUPABASE_SERVICE_SECRET_KEY` | server | Service-role key — **only** used in the RLS integration test. No runtime code uses it; don't add service-role calls casually |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Used by browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | Used by browser + server Supabase clients (server uses publishable + cookies, **not** the service key) |
| `ANTHROPIC_API_KEY` | server | Consumed in `lib/ai/index.ts` |
| `RESEND_API_KEY` | server, optional | When missing, `lib/email/index.ts` is a no-op |
| `EXITIQ_WORKFLOW_LOG` / `NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG` | both | NDJSON workflow tracing to `.exitiq-debug/` (local dev only; auto-off on Vercel) |
| `ANALYZE` | server | Toggles `@next/bundle-analyzer` in `next.config.ts` |
| `SKIP_ENV_VALIDATION` | special | Bypasses `createEnv` validation in CI / lint envs without creds |

`.env.local.example` is the canonical template. When you add/remove a variable, update **both**
`env.mjs` and `.env.local.example`.

**`prepare: false` in `lib/db/index.ts` is mandatory** — `DATABASE_URL` is the transaction-mode pooler
(PgBouncer in transaction mode doesn't support prepared statements). Never remove it.

---

## Architecture Boundaries (hard rules)

### 1. Import alias `@/*` → repo root
```ts
import { env } from "@/env.mjs"
import { db } from "@/lib/db"
```
No relative `../../` imports for repo-internal modules.

### 2. Database access is server-only
`lib/db/index.ts` exports a module-level `db` singleton (one `postgres()` client reused across
requests). Import it **only** in Route Handlers (`app/api/**/route.ts`), Server Actions
(`"use server"`), or server-only utility modules. **Never** import `db` from a Client Component.

### 3. Supabase client split (`lib/supabase/`)
| Client | File | Use |
|---|---|---|
| Browser | `client.ts` (`createBrowserClient`) | Client Components, browser-side auth |
| Server | `server.ts` (`createServerClient` + `next/headers` cookies) | Server Components, Route Handlers |
| Middleware | `middleware.ts` (`createServerClient` + `NextRequest` cookies) | session refresh in root `middleware.ts` |

All three use the **publishable** key. RLS gatekeeps the `anon` role; Drizzle bypasses RLS via the
direct `DATABASE_URL` connection. The root [`middleware.ts`](../middleware.ts) calls
`supabase.auth.getUser()` on every non-static request to keep server-component auth state fresh.

### 4. Module layering (no upward imports)
```
app/          (pages, layouts, route handlers, server actions)
  └── components/   (UI; must not import db)
  └── lib/          (assessment, ai, supabase, db, email, debug, exitiq, persona, logger)
        └── env.mjs (sole env surface)
```
A module in `lib/` must not import from `app/`. UI components must not import `db`.

---

## Routes & API contract (verified)

```
app/
  page.tsx                         → components/scorta/LandingPage   (marketing)
  about/page.tsx                   → components/scorta/AboutPage
  login/page.tsx                   → components/scorta/LoginPanel     (redirects to /dashboard if signed in)
  report/[sessionId]/page.tsx      → assessment report page
  (app)/                           authenticated seller workspace
    layout.tsx                     → guards via supabase.auth.getUser() → redirect("/login"); wraps AppShell
    dashboard/page.tsx             → SellerHome           (Station 02 — Case Manager)
    connect/page.tsx               → ConnectStation       (Platform Connectors — Ingestion)
    ingestion/page.tsx             → IngestionStation      (Data Processing — Ingestion)
    recast/page.tsx                → RecastStation         (Financials Recast — Recast · Boardroom)
    risk/page.tsx                  → RiskStation           (Owner-Dependency · Concentration)
    boardroom/page.tsx             → BoardroomStation      (dispatches the agent fleet)
    score/page.tsx                 → Scorta Score          (Case Manager)
    documents/page.tsx             → DocumentsStation      (CIM & Docs — CIM Agent)
    vdr/page.tsx                   → VDRStation            (Virtual Data Room)
    lenders/page.tsx               → LendersStation        (Lender Outreach — Lender Ops)
    buyers/page.tsx                → BuyersStation         (Buyer Outreach — Outreach)
    upload/page.tsx                → UploadStation
    case/page.tsx                  → CaseChatPage          (CASE conversation)
  api/
    health/route.ts                          GET    liveness probe
    waitlist/route.ts                        POST   waitlist signup
    assessment/session/route.ts              POST   upsert session (one route, all stages)
    assessment/session/[session_id]/route.ts GET    read session row
    assessment/generate/route.ts             POST   stream Sonnet report (text/plain)
    assessment/report/[session_id]/route.ts  GET    read cached report markdown
    debug/workflow-trace/route.ts            POST   client → server trace event sink
```

`next.config.ts` rewrites `/healthz`, `/api/healthz`, `/health`, `/ping` → `/api/health`.
The station rail / order / lock state is defined by `STATIONS` in `lib/persona.ts`.

### Assessment data flow
1. Client persists stage answers to `localStorage` (in-session source of truth) via `lib/assessment/session.ts`.
2. Client `POST`s a `SessionPatch` to `/api/assessment/session` (`lib/assessment/api.ts`).
3. Server validates with Zod, computes `score` + `sbaEligible` only when `completedAt` is present, and
   returns `200` **before** the DB write completes — the write runs in `after()`.
4. Client `POST`s `/api/assessment/generate`, which streams Sonnet output and persists the final
   markdown in another `after()` callback.

**Known race (deliberate):** `/generate` can be called before the session upsert from step 3 finishes
(the upsert runs in `after()` after the 200). In that case the route returns `404 not_found` — see the
`traceEvent("api.generate.session_not_found", …)` block in
[`app/api/assessment/generate/route.ts`](../app/api/assessment/generate/route.ts) and the
`api.session.http_200_sent_before_after` trace in `session/route.ts`. Do **not** "fix" this by removing
`after()` without coordinating — it's an intentional latency/UX tradeoff.

### Stage data — JSONB everywhere
`assessment_sessions` stores `stage1`, `gate`, `stage2`, `stage3`, `stage4` as JSONB. Per-stage Zod
schemas live in `app/api/assessment/session/route.ts`; TS types in `lib/assessment/session.ts`
(`Stage1Answers`…`Stage4Answers`, `GateAnswers`). Adding a stage field means updating **both** the Zod
schema and the TS interface.

### Naming quirk
`SegmentTag` was renamed to `leadQuality` in TypeScript, but the DB column stays `segment_tag`
(`.$type<SegmentTag>()` on the Drizzle column — see [`lib/db/schema/assessments.ts`](../lib/db/schema/assessments.ts):23).
No migration is needed for this rename; preserve the column name.

---

## Database

### Schema (`lib/db/schema/`) — three tables, all RLS-enabled
| Table | Purpose | Notable columns |
|---|---|---|
| `assessment_sessions` | One row per assessment | `session_id` (text, unique), stage1-4 + gate JSONB, `segment_tag`, `score`, `sba_eligible`, `completed_at` |
| `assessment_reports` | One report per session | `session_id` (FK, unique), `report_md`, `model_used`, `generation_ms` |
| `waitlist` | Email capture | `email` (unique), `role`, `source` |

### RLS posture (public, anon role only)
- `anon_insert_sessions`, `anon_insert_reports`, `anon_insert_waitlist` — anon can INSERT.
- Anon SELECT/UPDATE on assessment tables were **dropped** in `0001_drop_anon_rw_policies.sql`. All
  reads route through API routes using the Drizzle `DATABASE_URL` connection (which bypasses RLS).
- **Any new user-data table must ship its RLS policies in the same migration.**

### Migrations (`lib/db/migrations/`)
```
0000_colossal_gravity.sql               initial schema + RLS
0001_drop_anon_rw_policies.sql          remove anon SELECT/UPDATE
0003_jazzy_dormammu.sql                 waitlist table + RLS
0004_fine_fixer.sql                     drop teaser_json column
0005_rainy_devos.sql                    session_id idx → UNIQUE constraint
0006_restore_assessment_anon_policies_idx.sql   idempotent repair
```
`0002` is intentionally skipped (squashed during early dev). Don't renumber. Migrations are
append-only — never edit an applied one.

### Commands
```bash
pnpm db:generate   # generate migration SQL from schema changes
pnpm db:migrate    # apply migrations — use SESSION pooler URL (5432) locally
pnpm db:push       # DEV/LOCAL ONLY — never staging/prod
pnpm db:studio     # Drizzle Studio
```
`drizzle.config.ts` loads `DATABASE_URL` via `env.mjs`; swap to a session-pooler URL in `.env.local`
for migration commands only.

---

## AI

- Provider + model constants live in `lib/ai/index.ts` (one module-level `anthropic` instance — never
  per-request). `SONNET_MODEL` for report generation, `HAIKU_MODEL` for fast paths.
- Prompts live in `lib/ai/prompts.ts`.
- Report generation streams (`text/plain`) and persists in `after()`. Keep streaming responses
  cancellation-safe and never block the response on the persistence write.

---

## Observability & Debug

- **`instrumentation.ts`** — registers `@vercel/otel` (`serviceName: "scorta-api"`) and an
  `unhandledRejection` handler that emits structured JSON.
- **`lib/logger.ts`** — `logger.info/warn/error(event, ctx)` emits one JSON line per call; `timed(name, fn)`
  wraps an async fn with success/error duration logging. Use it for anything worth observing in prod.
- **`lib/debug/workflow-trace.ts`** — `traceEvent(phase, payload)` appends NDJSON to
  `.exitiq-debug/sessions/<sessionId>.ndjson`. **Local dev only** (gated by `EXITIQ_WORKFLOW_LOG=true`
  AND `VERCEL !== "1"`). Tracing must never crash the app — errors are swallowed by design.
- **Client tracing** — `lib/debug/workflow-trace-client.ts` POSTs events to `/api/debug/workflow-trace`
  when `NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG=true`.
- **PII redaction** — gate data must go through `redactGateForTrace()` before reaching `traceEvent`.

---

## Components & lib map

```
components/
  scorta/        platform shell + brokerage stations + marketing
    AppShell.tsx           left rail + top bar + CASE chat + agent panel (wraps every (app) route)
    AgentActivityPanel.tsx · AgentFleetContext.tsx · AuditTrailModal.tsx
    CASEChat.tsx · CaseChatPage.tsx · CaseHero.tsx
    SellerHome.tsx · LoginPanel.tsx · LandingPage.tsx · AboutPage.tsx
    ConnectStation · IngestionStation · RecastStation · RiskStation · BoardroomStation
    DocumentsStation · VDRStation · LendersStation · BuyersStation · OutreachStation
    UploadStation · LockedStation
  exitiq/        public assessment flow (client-heavy, WebGL canvas)
    ExitIQApp.tsx          master state machine + WebGL lifecycle
    questions · dashboard · preview · report · report-visual · radar · bento · ui

lib/
  persona.ts               locked mock persona (PERSONA) + STATIONS rail definition
  assessment/              questions, scoring, sba, segmentation, session, transform, api,
                           states, industries, readiness-axes, report-transform
  ai/                      index (provider + models), prompts
  db/                      index (singleton), schema/, migrations/, __tests__/
  supabase/                client, server, middleware
  exitiq/                  calculations, webgl, data
  email/ · debug/ · logger.ts
  auditTrail.ts · agentActivity.ts · caseChat.ts   (agent-fleet UI data)
```

### Styling reality
Design tokens are CSS variables in `styles/tailwind.css` (`--t1`…`--t4`, `--glass-bg`, `--mint`,
`--peach`, `--scan-color`, …). Dark is the default theme; `[data-theme="cream"]` is the light variant
(the `(app)` workspace pins `cream`). Much of the `scorta/` station UI is written with **inline-style
React using these CSS variables** rather than Tailwind utility classes. That is the current
convention for those files — when extending them, reuse the existing tokens and inline-style patterns
for consistency rather than mixing paradigms mid-component. New standalone components should prefer
Tailwind utilities + tokens per `AGENTS.md`. Never hardcode raw hex outside the token definitions.
Fonts (`EB Garamond` serif, `Inter` sans, `JetBrains Mono`) are loaded via `next/font/google` in
`app/layout.tsx`.

---

## Commands

```bash
pnpm dev                # Next dev (Turbopack)
pnpm build              # Production build
pnpm start              # Production server
pnpm lint  / lint:fix   # ESLint (flat config: typescript-eslint + next + storybook + import-order)
pnpm prettier / :fix    # Prettier
pnpm typecheck          # tsc --noEmit
pnpm test               # Vitest (RUN_DB_INTEGRATION_TESTS=1)
pnpm test:integration   # DB schema + RLS integration tests
pnpm e2e:headless       # Playwright
pnpm storybook
pnpm db:studio
```

---

## Definition of Done

A change is done when:

- [ ] `pnpm typecheck` and `pnpm lint` pass clean
- [ ] `pnpm prettier` is satisfied (run `:fix` if not)
- [ ] New/changed `lib/` logic has unit tests; DB/RLS changes have integration tests; all green
- [ ] Invalid input, missing rows, and upstream failures are handled with explicit status + structured logs
- [ ] Client surfaces have loading and error states
- [ ] No `process.env` outside `env.mjs`; no `db` import in client components; no `../../` imports
- [ ] Schema changes ship a new migration (with RLS where applicable); `env.mjs` + `.env.local.example` updated together
- [ ] No new palette / component library / AI provider introduced without cause
- [ ] The relevant flow was actually exercised (no console errors, no dead links, no 404s)
