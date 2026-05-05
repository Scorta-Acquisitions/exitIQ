# Integration Plan: Backend ↔ Frontend Alignment

## Context

The frontend has been fully revamped to a polished 6-question Stage 1 assessment + email gate flow (ExitIQApp → QuestionPanel → PreviewCard → EmailGateModal). It stores answers in `localStorage`, computes real-time UI signals via `calcDerived`, and fire-and-forgets a `POST /api/assessment/session` call with all data once the user submits their email.

The backend already has most of the plumbing (Drizzle schema, Claude AI routes, scoring logic), but there are **naming mismatches, missing endpoints, schema divergence from `phase1.md`, and unbuilt infrastructure** (waitlist, email, payments) that need to be closed before Phase 1 is shippable.

**Goal:** Bring the backend into full alignment with the revamped frontend and the `phase1.md` spec—no DB destructive changes without migrations, no `process.env` reads, all DB access server-only.

---

## Current State

### Frontend calls these endpoints (all working)
| Endpoint | Purpose |
|---|---|
| `POST /api/assessment/session` | Upsert session w/ stage1 + gate + completedAt |
| `GET /api/assessment/session/[session_id]` | Resume session |
| `POST /api/assessment/teaser` | Claude Haiku quick summary |
| `POST /api/assessment/generate` | Claude Sonnet streaming report |
| `GET /api/assessment/report/[session_id]` | Fetch completed report |

### What's missing or misaligned

#### 1. `POST /api/waitlist` — **MISSING**
- phase1.md requires this for the marketing-site "Join Waitlist" CTAs
- No route, no DB table (`waitlist`) exists yet
- `LandingPage.tsx` has CTAs that will need to call this

#### 2. Report polling — **INCOMPLETE**
- phase1.md says report is async; client should poll `GET /api/assessments/:id/report`
- Current `GET /api/assessment/report/[session_id]` returns raw data but no `status` field
- Frontend `PostSubmitCard` says "Check inbox..." but never polls or shows report inline
- Need a `status: "pending" | "ready"` field in the response

#### 3. DB schema diverges from `phase1.md` spec
- Current: `assessment_sessions` (JSONB stage1/stage2/stage3/stage4 columns)
- Spec: flat `assessments` table with individual named columns per field
- Current design is fine for MVP **if** column names inside JSONB match the spec field names (they do)
- No migration needed unless we want indexed individual columns for analytics queries
- **Decision: keep JSONB for now; add migration to flat schema only when analytics dashboards are needed**

#### 4. Segmentation naming mismatch
- Backend: `segmentTag` = `"hot_seller" | "warm_explorer" | "nurture" | "burned_by_broker"`
- phase1.md: `lead_quality` = `"hot" | "warm" | "nurture"`
- Both the column name and values differ; need normalization

#### 5. `assessment_sessions.sessionId` is a client-generated timestamp string
- phase1.md uses UUID (`assessment_id`)
- No breaking issue for Phase 1, but the API response doesn't expose `assessment_id` per spec
- Route response should include both `sessionId` and a stable UUID for Phase 2 compatibility

#### 6. `env.mjs` is missing `ANTHROPIC_API_KEY` from the `.env.local.example`
- `env.mjs` declares it on the server side ✓
- But `.env.local.example` needs that key listed (blank value) per CLAUDE.md requirements

#### 7. Stages 2–4 exist in backend types + scoring but NOT in frontend
- `lib/assessment/session.ts` defines `Stage2Answers`, `Stage3Answers`, `Stage4Answers`
- `lib/assessment/scoring.ts` accepts all 4 stages
- The 6-question frontend only sends `stage1 + gate`
- **Phase 1 MVP does not require Stages 2–4 in the UI**—the spec validates this
- Stages 2–4 scoring still runs on the backend (with empty data = default scores), which is acceptable

#### 8. No email integration (Resend/Loops)
- phase1.md requires 3 email sequences triggered on submission
- No email library installed, no trigger logic in the session route
- **Must be added** before Phase 1 is shippable

#### 9. No Stripe integration
- phase1.md paid tiers require Stripe
- **Phase 1 MVP: basic flow first, Stripe second** — not blocking frontend alignment

#### 10. No PDF generation
- phase1.md mentions PDF download of the report
- **Deferred: Phase 1 first milestone is web report only**

---

## Integration Plan

### Step 1 — Add `/api/waitlist` endpoint + DB table

**New file:** `app/api/waitlist/route.ts`
- `POST`: accept `{ email, role }`, validate with Zod, upsert into `waitlist` table
- Return `{ success: true }` or 409 if duplicate (graceful upsert)

**Schema addition** (`lib/db/schema/assessments.ts`):
```ts
export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role"),  // 'seller' | 'buyer' | 'advisor' | 'both'
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
```

**Migration:** `pnpm db:generate` → commit SQL → `pnpm db:migrate`

**RLS policy** (in migration): anon can INSERT, no SELECT/UPDATE

**Frontend:** Wire LandingPage.tsx CTAs to `POST /api/waitlist` (currently they link to email or no-op)

---

### Step 2 — Add `status` field to report fetch response

**File:** `app/api/assessment/report/[session_id]/route.ts`

Change response to:
```ts
{
  status: "pending" | "ready",
  reportMd: string | null,
  teaserJson: object | null,
  createdAt: string | null
}
```
Return `{ status: "pending" }` if no report row found yet.

**Frontend consideration:** `PostSubmitCard` in `components/exitiq/ExitIQApp.tsx` currently shows static text. Add a simple poll (`useEffect` with `setInterval`, 5s, max 10 retries) that calls `GET /api/assessment/report/[session_id]` and reveals the report inline once `status === "ready"`.

---

### Step 3 — Normalize segmentation (rename + remap values)

**File:** `lib/db/schema/assessments.ts`
- Rename `segmentTag` column to `leadQuality`
- Values: keep `"hot_seller"`, `"warm_explorer"`, `"nurture"`, `"burned_by_broker"` (more descriptive than spec; spec's 3-value enum is a simplification)
- **No DB migration needed yet** if column is renamed in schema + `onConflictDoUpdate` uses the new name

**File:** `lib/assessment/segmentation.ts` — update type exports

**File:** `app/api/assessment/session/route.ts` — update column reference

---

### Step 4 — Expose `assessmentId` (UUID) in session response

**File:** `app/api/assessment/session/route.ts`

Return `id` (the DB UUID) alongside `sessionId` in the response:
```ts
{ sessionId, assessmentId: insertedRow.id, score, sbaEligible }
```

Store this in `localStorage` via `lib/assessment/session.ts` as `assessmentId` for Phase 2 compatibility.

---

### Step 5 — Fix `.env.local.example`

**File:** `.env.local.example`

Add (with blank value):
```
ANTHROPIC_API_KEY=
```

Verify all 5 variables from `env.mjs` are present (see CLAUDE.md variable table + `ANTHROPIC_API_KEY`).

---

### Step 6 — Add email integration (Resend + Loops)

**Install:** `pnpm add resend` (or `loops` SDK)

**New file:** `lib/email/index.ts`
- `sendWelcomeEmail(session)` — triggered after session POST with `completedAt`
- Route email sequence by `segmentTag`:
  - `hot_seller` → Sequence 1 (immediate + follow-ups)
  - `warm_explorer` → Sequence 2
  - `burned_by_broker` → Sequence 3

**New env vars to add to `env.mjs` and `.env.local.example`:**
```
RESEND_API_KEY=
LOOPS_API_KEY=    (if using Loops for sequences)
```

**File:** `app/api/assessment/session/route.ts`
- After the `after()` DB write, add another `after()` call to `sendWelcomeEmail()`

---

### Step 7 — Validate scoring alignment with `phase1.md`

**File:** `lib/assessment/scoring.ts`

Verify the 5 weighted dimensions match the spec:
| Dimension | Weight | Current implementation |
|---|---|---|
| Financial Attractiveness | 25% | ✓ SDE band + growth + recurring |
| Operational Independence | 25% | ✓ owner dep + SOPs |
| Market Positioning | 20% | ✓ industry score + customer concentration |
| Deal Readiness | 15% | ✓ doc readiness + legal |
| Buyer Accessibility | 15% | ✓ asking price + deal structure |

If any dimension weight is off, fix the weights in `scoring.ts`. The final `score` (0–100) must be stored correctly in `assessment_sessions.score`.

---

### Step 8 — Verify report generation caching works

**File:** `app/api/assessment/generate/route.ts`

Current logic checks `assessment_reports` for an existing row and returns cached content. Ensure:
1. The cache check uses `sessionId` correctly
2. Streaming response headers are set properly for SSE
3. The `after()` hook stores both `reportMd` and `modelUsed`/`generationMs`

---

## File Change Summary

| File | Action | Notes |
|---|---|---|
| `lib/db/schema/assessments.ts` | Add `waitlist` table; rename `segmentTag` → `leadQuality` | Schema-only change |
| `lib/db/migrations/0002_add_waitlist.sql` | New migration from `pnpm db:generate` | |
| `app/api/waitlist/route.ts` | **Create** | POST upsert waitlist |
| `app/api/assessment/report/[session_id]/route.ts` | Modify | Add `status` field |
| `app/api/assessment/session/route.ts` | Modify | Expose `assessmentId`, rename segment ref |
| `lib/assessment/segmentation.ts` | Modify | Update type name |
| `lib/email/index.ts` | **Create** | Resend/Loops integration |
| `env.mjs` | Add | `RESEND_API_KEY`, `LOOPS_API_KEY` |
| `.env.local.example` | Add | `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `LOOPS_API_KEY` (blank) |
| `components/scorta/LandingPage.tsx` | Modify | Wire waitlist CTAs |
| `components/exitiq/ExitIQApp.tsx` | Modify | Add report polling in `PostSubmitCard` |
| `lib/assessment/scoring.ts` | Audit | Confirm weights match spec |

---

## Migration Steps

```bash
# 1. Update schema file (add waitlist table, rename column)
# 2. Generate migration
pnpm db:generate

# 3. Review generated SQL in lib/db/migrations/0002_*.sql
# 4. Add RLS policies to the migration SQL (anon INSERT only on waitlist)

# 5. Apply migration (use session pooler URL locally, port 5432)
DATABASE_URL="postgresql://...@db.xxx.supabase.co:5432/postgres" pnpm db:migrate

# 6. Verify tables in Drizzle Studio
pnpm db:studio
```

---

## Verification

1. **Waitlist:** POST `/api/waitlist` with `{ email: "test@x.com", role: "seller" }` → 200; duplicate → still 200 (upsert)
2. **Session flow:** Complete the 6-question assessment in browser → submit email → confirm `assessment_sessions` row inserted in Drizzle Studio with `stage1`, `gate`, `score`, `sbaEligible` populated
3. **Teaser:** `POST /api/assessment/teaser` with a valid `sessionId` → returns `{ headline, valuationRange, topStrength, topRisk, segmentTag }`
4. **Report polling:** After submit, `GET /api/assessment/report/[session_id]` initially returns `{ status: "pending" }`, then `{ status: "ready", reportMd: "..." }` after generation
5. **Env check:** `pnpm exec tsc --noEmit` passes, `pnpm lint` passes
6. **Email:** Submit a real email → verify Resend/Loops receives the event and queues the correct sequence

---

## Not in Scope (Phase 2+)

- Stages 2–4 UI (backend types exist, frontend deferred)
- Stripe payments / paid tiers
- PDF generation
- Flat `assessments` schema migration (JSONB is fine for Phase 1)
- Buyer portal, listings, messaging
