# exitIQ — Current Workflow: Last Question to Full Report

> Audited 2026-05-12. Documents what actually runs vs. what is built but dead.

---

## Step 1 — The 10-Question Questionnaire (fully visible to user)

The user answers 10 questions one at a time in `components/exitiq/ExitIQApp.tsx`, steps 0–9. The questions collect: industry, years in business, facility type, revenue band, SDE band, doc readiness, customer concentration, employee count, key-man risk score (1–5), and recurring revenue percentage.

Each answer triggers a ripple animation, a "Recalculating…" flash, and optionally an AI insight tooltip — all purely cosmetic, pre-written strings from a lookup table in `lib/exitiq/data.ts`. No AI is called at this stage. Answers are saved to `localStorage` so partial progress survives a browser refresh.

---

## Step 2 — The Pre-Gate Teaser (visible to user, but AI-free)

After question 9, step advances to 10 and `GateTeaserCard` renders from `components/exitiq/preview.tsx:1653`. It shows a valuation range, exit readiness score, and grade, plus a list of locked report sections. All of this is computed **client-side** by `calcDerived(answers)` in `lib/exitiq/calculations.ts` — pure math, no API call.

**Dead feature:** There is a fully built `PreviewCard` component in `components/exitiq/preview.tsx:2103` that accepts a `teaserData` prop and renders AI-enriched teaser content (LLM-written headline, two strengths, two risks, buyer pool narrative, signal pills). This component is never rendered in the actual flow. `GateTeaserCard` — a simpler, client-only version — is what gets shown instead.

---

## Step 3 — Email Gate (visible to user)

The "Unlock Full Report" button calls `handleUnlock` → `setShowModal(true)` → `EmailGateModal` appears. User enters first name, email, and selling timeline. Submitting calls `handleSubmit`.

---

## Step 4 — handleSubmit Fires (mostly invisible to user)

`handleSubmit` in `ExitIQApp.tsx` runs four things in sequence:

### 4a. UI transition

`setSubmitted(true)` + `clearPartialProgress()` — localStorage partial is wiped. `CinematicLoader` replaces all UI immediately.

### 4b. Session persistence

`persistSession()` → `POST /api/assessment/session` — Writes the session to the database.

- **Stage1** gets: industry, years, revenue, sde, employees, state, facilityType, docReadiness, plus three extra fields (`customerConc`, `keyMan`, `recurringRev`) that are passed but do not exist in the `Stage1Answers` TypeScript interface — they are extra keys silently written to the JSONB column.
- **Gate** gets: firstName, email, sellingTimeline, segmentTag.
- **Stage2, Stage3, Stage4** are **never written** — they remain `null` in the database.

### 4c. LLM generation

Once `persistSession()` resolves, `requestGenerate(sid)` → `POST /api/assessment/generate` is called.

The server:
1. Calls `mapStage1ForScoring()` on stage1
2. Calls `buildReportData(s1Scored, firstName, timeline, {}, {}, {})` — stages 2, 3, and 4 are all passed as empty objects
3. Builds the full Sonnet prompt with the frozen `ReportData`
4. Streams the Sonnet response back to the client

The client reads the stream chunk by chunk, accumulating the full markdown into `reportMd` React state. `reportStreaming` is `true` the entire time. When the stream closes: the server saves the markdown to `assessment_reports.reportMd` via Next.js `after()`, and the client sets `reportStreaming = false`.

**What is NOT called:** `requestTeaser()` is never called here or anywhere in the codebase. The `POST /api/assessment/teaser` endpoint is fully implemented but no component ever invokes it.

### 4d. No-op

`fetchReport()` exists in `lib/assessment/api.ts` but is never called at any point in the flow.

---

## Step 5 — CinematicLoader (visible to user, mostly cosmetic)

`CinematicLoader` from `components/exitiq/report.tsx:348` shows for the duration of the Sonnet generation (~20–40 seconds). It displays:

- **6 phase labels** with subtitles — "Reading your financial signals," "Modeling buyer pool," "Running three valuation methods," "Scoring transferability," "Identifying risk drivers," "Drafting your narrative" — each running on a hardcoded timer. Total animation: 42 seconds. These phases have **no connection to actual computation** — they are timer-based cosmetics.
- **A scrolling ticker** cycling through ~20 hardcoded lines such as "Pulling lower-middle-market comps (n=2,847)" and "Buyer archetype probabilities: operator 46% · SBA 29% · strategic 25%." These are static strings, not real outputs.
- **A progress bar** advancing from 0% to 99% over 42 seconds, then pausing at 99% until `aiReady` is true.

`aiReady` is computed as `!reportStreaming && !!reportMd`. When both the 42-second phase animation completes AND the Sonnet stream finishes, `onComplete()` fires → `router.push('/report/${sessionId}')`.

**Bug — stuck loader:** If `requestGenerate` fails (network error, server error, timeout), `reportStreaming` goes to `false` and `reportMd` stays `""`. `aiReady` evaluates to `false`. The loader is stuck at 99% permanently — no timeout, no error message, no fallback navigation. The user is stranded.

---

## Step 6 — The Report Page (visible to user, but LLM output silently discarded)

`app/report/[sessionId]/page.tsx` is a server component that:

1. Fetches the session and report from the database in parallel.
2. Calls `mapStage1ForScoring()` on stage1.
3. Calls `buildReportData(s1Scored, firstName, timeline, stage2 ?? undefined, stage3 ?? undefined, stage4 ?? undefined)`.

Since stage2, stage3, and stage4 are `null` in the database, all three default to `{}` inside `buildReportData`. This means the following signals are absent from the scoring computation on the report page:

| Signal | Stage | Field name | Effect when absent |
|---|---|---|---|
| Owner dependency | Stage2 | `ownerDependency` | Operational dimension scores from default, no detractor generated |
| Customer concentration | Stage2 | `customerConcentration` | No high-concentration detractor |
| Revenue trend | Stage2 | `revenueTrend` | Neutral scoring |
| Recurring revenue | Stage2 | `recurringRevenue` | No recurring revenue driver |
| Doc readiness (full) | Stage2 | `docReadiness` | Deal readiness defaults |
| Real estate | Stage2 | `realEstate` | Lease risk check skipped |
| Reason for selling | Stage2 | `reasonForSelling` | Distress signals absent |
| SBA restricted | Stage3 | `sbaRestricted` | SBA eligibility not self-reported |
| Key person risk | Stage3 | `keyPersonRisk` | No long-tenured staff signal |
| SOPs | Stage3 | `sops` | Documentation driver/detractor defaults |
| Growth levers (text) | Stage3 | `growthLevers` | Seller-identified lever not surfaced |
| Legal exposure | Stage3 | `legal` | No legal detractor |
| Asking price | Stage4 | `askingPrice` | Asking price context absent from prompt |
| Deal structure prefs | Stage4 | `dealStructure` | Deal structure section uses defaults |
| Urgency | Stage4 | `urgency` | CTA line defaults |
| Broker status | Stage4 | `brokerStatus` | CTA line defaults |

4. Renders `<FullReportVisual data={data} reportMd={report?.reportMd ?? undefined} />`.

In `FullReportVisual` at `components/exitiq/report-visual.tsx:2053`:

```ts
export function FullReportVisual({ data, reportMd: _reportMd }: { data: ReportData; reportMd?: string })
```

The `_reportMd` prefix is TypeScript convention for "received but intentionally unused." The fully generated Sonnet markdown — billed per call, containing 10 narrative sections of personalized advisor prose — is accepted and immediately discarded. **No user ever sees a single word of it.**

The user sees only the 9 visual sections built from `ReportData`: the score gauge, valuation bar charts, SBA stamp (if eligible), transferability toggle, driver/detractor cards, deal structure cards, growth levers, next steps, and the Boardroom CTA. All of this is math-model output rendered as visual cards.

---

## Summary: Implemented Features Running Uselessly

| Feature | What it does | Why it is wasted |
|---|---|---|
| `POST /api/assessment/teaser` | Calls Haiku via `generateObject`, produces a 17-field teaser JSON: headline, valuationRange, multipleContext, buyerPoolPrimary, 2 strengths, 2 risks, 3 signal pills, brokerFeeNarrative, topStrength, topRisk, segmentTag | Never called from any client component. `requestTeaser()` is defined in `lib/assessment/api.ts` but never invoked |
| `PreviewCard` component | Full AI-enriched teaser display in `components/exitiq/preview.tsx:2103` with graceful fallback to client-side values when `teaserData` is null | `GateTeaserCard` is rendered instead; `PreviewCard` is never mounted in the current flow |
| `fetchReport()` function | Polls `GET /api/assessment/report/[sessionId]` and returns both `reportMd` and `teaserJson` | Defined in `lib/assessment/api.ts`, never called from any component |
| `teaserJson` DB column | Stores the Haiku teaser object in `assessment_reports` | Always `null` — the teaser API is never triggered so nothing writes to it |
| LLM Sonnet report (`reportMd`) | Full markdown with Executive Summary, Business Profile, Valuation Analysis, SBA narrative, Transferability, Deal Structure, Drivers, Detractors, Growth Levers, Next Steps — personalized advisor prose | Passed to `FullReportVisual` as `_reportMd` and discarded. Billed per generation but never displayed |
| Stage2 / Stage3 / Stage4 scoring infrastructure | `computeScore`, `buildDrivers`, `buildDetractors`, `buildGrowthLevers` all accept and use stage2/3/4 signals | Stage2/3/4 are never collected in the current questionnaire flow and are always null in the DB. All scoring branches that depend on them produce neutral/fallback defaults |

---

## Data Flow Diagram

```
User answers Q1–Q10 (ExitIQApp)
        │
        ▼
calcDerived(answers)          ← client-side math only
        │
        ▼
GateTeaserCard shown          ← no API call
        │
        ▼
EmailGateModal (name, email, timeline)
        │
        ▼
handleSubmit()
    ├── persistSession()      → POST /api/assessment/session
    │       stage1 + gate written to DB
    │       stage2 / stage3 / stage4 → NULL
    │
    └── requestGenerate()     → POST /api/assessment/generate
            buildReportData(s1, {}, {}, {})   ← stage2/3/4 empty
            buildReportPrompt(session, reportData)
            streamText via Sonnet
            client accumulates → reportMd state
            server saves → assessment_reports.reportMd (via after())
        │
        ▼
CinematicLoader (42s timer animation, cosmetic only)
        │
        ▼ (when phasesComplete && aiReady)
router.push('/report/[sessionId]')
        │
        ▼
Report page (server component)
    fetch session + report from DB
    buildReportData(s1, undefined, undefined, undefined)  ← same empty stages
    <FullReportVisual data={data} reportMd={_reportMd} />
                                           │
                                           └── discarded ✗
        │
        ▼
User sees: 9 visual card sections (math-model only)
User does NOT see: any LLM prose
```

---

## APIs That Exist But Are Not Wired

| Endpoint | File | Status |
|---|---|---|
| `POST /api/assessment/teaser` | `app/api/assessment/teaser/route.ts` | Implemented, never called |
| `GET /api/assessment/report/[session_id]` | `app/api/assessment/report/[session_id]/route.ts` | Implemented, never called |
