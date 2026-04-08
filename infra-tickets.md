# Infrastructure Tickets — ExitIQ Phase 1

## Dependency Map

```
INF-001 (env vars)
   ├── INF-002 (Drizzle setup)  ──→  INF-003 (migrations)
   └── INF-004 (Supabase SSR)  ──→  INF-005 (middleware)

INF-006 (AI SDK) — fully independent, no prerequisites
```

**Dev split recommendation**
- **Dev 1:** INF-001 → INF-002 → INF-003
- **Dev 2:** INF-006 (start immediately) → INF-004 → INF-005 (after INF-001 merges)

---

## Summary Table

| Ticket | Title | Depends On | Parallel With | Assigned To |
|--------|-------|------------|---------------|-------------|
| INF-001 | Env Vars & Supabase Project Config | — | INF-006 | Dev 1 |
| INF-002 | Drizzle ORM Setup | INF-001 | INF-004, INF-006 | Dev 1 |
| INF-003 | Drizzle Migration Workflow | INF-002 | INF-004, INF-005, INF-006 | Dev 1 |
| INF-004 | Supabase SSR Auth Client Setup | INF-001 | INF-002, INF-003, INF-006 | Dev 2 |
| INF-005 | Next.js Middleware for Session Management | INF-004 | INF-002, INF-003, INF-006 | Dev 2 |
| INF-006 | Vercel AI SDK & Anthropic Provider | — | Everything | Dev 2 (start here) |

**Critical path:** INF-001 → INF-002 → INF-003

---

## INF-001 — Env Vars & Supabase Project Configuration

| | |
|---|---|
| **Type** | Infrastructure setup |
| **Blocks** | INF-002, INF-004 |
| **Can start immediately** | Yes |

### Description

All Supabase-dependent tickets require project credentials before any code can be written or tested. This ticket provisions the Supabase project and wires its credentials into the type-safe environment validation layer the boilerplate already uses (`env.mjs` + `@t3-oss/env-nextjs`).

This ticket produces no runtime code — only configuration and the validated env schema that all subsequent tickets import.

### Acceptance Criteria

- [ ] A Supabase project exists (cloud or local CLI) and connection strings are obtainable
- [ ] `env.mjs` validates all required Supabase vars at startup — app crashes with a clear error if any are missing
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the client bundle via the `client` block in `env.mjs`
- [ ] `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are server-only
- [ ] A `.env.local.example` file exists at the repo root with all keys listed (no values)
- [ ] `.env.local` is confirmed present in `.gitignore` (already is via boilerplate — verify, don't add a duplicate)

### File Changes

**Packages to install:** None — configuration only.

**Supabase values to retrieve from project dashboard:**
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
- `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
- Connection string (Transaction pooler, port 6543) → `DATABASE_URL`

---

**`env.mjs`** — replace entire file:

```js
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    ANALYZE: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
    // Supabase — server-only
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  },
  client: {
    // Supabase — safe for browser
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
})
```

**`.env.local.example`** — create at repo root:

```bash
# Supabase — get these from your Supabase project Settings > API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Postgres — Supabase project Settings > Database > Connection String
# Use Transaction pooler URL for runtime (port 6543)
# Use Session pooler URL for migrations (port 5432)
DATABASE_URL=

# AI — added by INF-006
ANTHROPIC_API_KEY=
```

---

## INF-002 — Drizzle ORM Setup

| | |
|---|---|
| **Type** | Infrastructure |
| **Depends on** | INF-001 |
| **Blocks** | INF-003 |
| **Parallel with** | INF-004, INF-006 |

### Description

Install Drizzle ORM and create the database client singleton that all future feature code will import. This includes the Drizzle config file, the `lib/db/` module structure, and the schema barrel. No schema tables are defined here — only the scaffolding that feature tickets will populate.

The `postgres` npm package is used as the driver. `prepare: false` is required for Supabase's Transaction pooler (PgBouncer does not support prepared statements in transaction mode).

### Acceptance Criteria

- [ ] `pnpm add drizzle-orm postgres` and `pnpm add -D drizzle-kit` complete without errors
- [ ] `lib/db/index.ts` exports a `db` singleton typed as `drizzle<typeof schema>`
- [ ] `lib/db/schema/index.ts` exists as the schema barrel (empty exports at this stage)
- [ ] `drizzle.config.ts` exists at repo root and references `DATABASE_URL` from `env.mjs`
- [ ] `tsc --noEmit` passes with no new errors
- [ ] The `db` client does not instantiate a new pool on every request (singleton via module-level variable)

### File Changes

**Install:**
```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

---

**`lib/db/index.ts`** — create:

```ts
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env.mjs"
import * as schema from "./schema"

// Module-level singleton — reused across requests in the same process
const client = postgres(env.DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema })
```

**`lib/db/schema/index.ts`** — create:

```ts
// Schema barrel — feature tickets add table definitions here
export {}
```

**`drizzle.config.ts`** — create at repo root:

```ts
/**
 * Database workflow:
 *   pnpm db:generate   — generate a migration file after editing schema
 *   pnpm db:migrate    — apply pending migrations to the target database
 *   pnpm db:push       — push schema directly (dev only, skips migration files)
 *   pnpm db:studio     — open Drizzle Studio GUI
 *
 * Use SESSION pooler URL (port 5432) in DATABASE_URL when running migrations locally.
 * Use TRANSACTION pooler URL (port 6543) in DATABASE_URL for the deployed app.
 */
import { defineConfig } from "drizzle-kit"

import { env } from "./env.mjs"

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
```

**`tsconfig.json`** — verify the `@/*` path alias exists. If missing, add to `compilerOptions`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## INF-003 — Drizzle Migration Workflow

| | |
|---|---|
| **Type** | Infrastructure / DX |
| **Depends on** | INF-002 |
| **Parallel with** | INF-004, INF-005, INF-006 |

### Description

Wire `drizzle-kit` commands into `package.json` scripts so the team has a consistent, documented workflow for generating and applying schema migrations. The pattern is established here before any feature schema is added.

No migration files are generated yet — the schema is empty at this stage. The scripts are the deliverable.

### Acceptance Criteria

- [ ] `pnpm db:generate` runs `drizzle-kit generate` without errors
- [ ] `pnpm db:migrate` runs `drizzle-kit migrate` and applies pending migrations
- [ ] `pnpm db:push` runs `drizzle-kit push` (for rapid local schema iteration)
- [ ] `pnpm db:studio` launches Drizzle Studio at `https://local.drizzle.studio`
- [ ] All four scripts are present in `package.json` under `"scripts"`
- [ ] `lib/db/migrations/` directory exists and is tracked in git

### File Changes

**`package.json`** — add to `"scripts"`:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate":  "drizzle-kit migrate",
  "db:push":     "drizzle-kit push",
  "db:studio":   "drizzle-kit studio"
}
```

**`lib/db/migrations/.gitkeep`** — create empty file so the directory is tracked before any migrations exist.

---

## INF-004 — Supabase SSR Auth Client Setup

| | |
|---|---|
| **Type** | Infrastructure |
| **Depends on** | INF-001 |
| **Blocks** | INF-005 |
| **Parallel with** | INF-002, INF-003, INF-006 |

### Description

Install `@supabase/ssr` and create the three Supabase client factory functions required by Next.js App Router:

| File | Context | Used by |
|------|---------|---------|
| `lib/supabase/client.ts` | Browser | Client Components |
| `lib/supabase/server.ts` | Server | Server Components, Route Handlers |
| `lib/supabase/middleware.ts` | Edge | `middleware.ts` only (INF-005) |

These factories read cookies correctly for each rendering context and do not share state across requests. No auth UI, sign-in flows, or protected routes are built here — client plumbing only.

### Acceptance Criteria

- [ ] `pnpm add @supabase/supabase-js @supabase/ssr` completes without errors
- [ ] `lib/supabase/client.ts` exports `createClient()` — safe to call in Client Components
- [ ] `lib/supabase/server.ts` exports async `createClient()` — reads/writes cookies via `next/headers`
- [ ] `lib/supabase/middleware.ts` exports `createMiddlewareClient(request)` returning `{ supabase, response }`
- [ ] All three files read credentials from `env.mjs`, not from `process.env` directly
- [ ] `tsc --noEmit` passes with no new errors

### File Changes

**Install:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

---

**`lib/supabase/client.ts`** — create:

```ts
import { createBrowserClient } from "@supabase/ssr"

import { env } from "@/env.mjs"

export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
```

**`lib/supabase/server.ts`** — create:

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { env } from "@/env.mjs"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component context — cookie writes are a no-op; middleware handles refresh
        }
      },
    },
  })
}
```

**`lib/supabase/middleware.ts`** — create:

```ts
import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { env } from "@/env.mjs"

export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  return { supabase, response }
}
```

---

## INF-005 — Next.js Middleware for Auth Session Management

| | |
|---|---|
| **Type** | Infrastructure |
| **Depends on** | INF-004 |
| **Parallel with** | INF-002, INF-003, INF-006 |

### Description

Create `middleware.ts` at the repo root. Its sole responsibility at this stage is to call `supabase.auth.getUser()` on every matched request, which causes `@supabase/ssr` to silently refresh expired sessions and write the refreshed cookies back to the browser. Without this, users are logged out when their access token expires (default: 1 hour).

No route protection logic is added here — that belongs in feature tickets. The matcher excludes static files and Next.js internals to avoid unnecessary overhead.

### Acceptance Criteria

- [ ] `middleware.ts` exists at the repo root (same level as `next.config.ts`)
- [ ] `supabase.auth.getUser()` is awaited on every matched request
- [ ] The middleware always returns `response` — it never blocks or redirects at this stage
- [ ] `config.matcher` excludes `_next/static`, `_next/image`, `favicon.ico`, and common static asset extensions
- [ ] `tsc --noEmit` passes with no new errors
- [ ] `GET /api/health` still returns `{ status: "ok" }` — health route unaffected by matcher

### File Changes

**`middleware.ts`** — create at repo root:

```ts
import { type NextRequest } from "next/server"

import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired — required for Server Component auth to stay in sync.
  // Result is intentionally unused here; session data is read in Server Components via
  // lib/supabase/server.ts when needed.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - common static asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
}
```

---

## INF-006 — Vercel AI SDK & Anthropic Provider Setup

| | |
|---|---|
| **Type** | Infrastructure |
| **Depends on** | None — start immediately |
| **Parallel with** | Everything |

### Description

Install the Vercel AI SDK (`ai`) and the Anthropic provider (`@ai-sdk/anthropic`), add `ANTHROPIC_API_KEY` to the env schema, and create `lib/ai/index.ts` which exports a configured provider instance and a default model constant. Feature tickets that build AI-powered route handlers import from `lib/ai/` rather than instantiating the provider themselves.

This ticket produces no Route Handlers or streaming logic — provider configuration only.

### Acceptance Criteria

- [ ] `pnpm add ai @ai-sdk/anthropic` completes without errors
- [ ] `ANTHROPIC_API_KEY` is added to `env.mjs` server block and `runtimeEnv`
- [ ] `lib/ai/index.ts` exports an `anthropic` provider instance via `createAnthropic()`
- [ ] The provider is instantiated once at module level — not per request
- [ ] `DEFAULT_MODEL` is exported as a typed constant — single source of truth for model selection
- [ ] `tsc --noEmit` passes with no new errors
- [ ] `.env.local.example` has `ANTHROPIC_API_KEY=` listed (coordinate with Dev 1 if INF-001 hasn't merged yet)

### File Changes

**Install:**
```bash
pnpm add ai @ai-sdk/anthropic
```

---

**`env.mjs`** — add to `server` block and `runtimeEnv`:

```js
server: {
  // ... existing vars
  ANTHROPIC_API_KEY: z.string().min(1),
},
runtimeEnv: {
  // ... existing vars
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
},
```

> **Note:** If INF-001 has not merged yet, make this change in your own branch. If it has, rebase and add only these two lines.

**`lib/ai/index.ts`** — create:

```ts
import { createAnthropic } from "@ai-sdk/anthropic"

import { env } from "@/env.mjs"

export const anthropic = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

// Single source of truth for model selection.
// Update here to change the model across all AI route handlers.
export const DEFAULT_MODEL = "claude-sonnet-4-6" as const
```
