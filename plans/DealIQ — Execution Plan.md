# DealIQ — Execution Plan (product & component build)

> Execution companion to [`DealIQ — Product & Build Plan.md`](./DealIQ%20—%20Product%20&%20Build%20Plan.md).
> That document says *what* DealIQ is. This one says *what to type*, in what order, against this repo.
> Target: partner-ready demo at production visual/UX fidelity. Backend stays demo-grade by design.
> Audited against branch `demo` @ `4d79d90`.

**Scope of this sprint: the product and its components.** Every surface, shell, route, engine, state
machine, and interaction gets built. **Content does not.** Names, dollar figures, add-back schedules,
pipeline deals, buyer profiles, and listing copy are **placeholders behind a single data seam** and get
authored separately, then plugged in. Nothing in this plan asks anyone to reconcile a number, and no
component is allowed to depend on a specific one.

**DealIQ is a standalone application, not a mode of Scorta.** It gets its own information
architecture designed around what a searcher actually does — triage many deals fast — rather than the
seller workspace's linear station walk through one deal. It gets its own entry and its own sign-in.
**There is no product switcher and no link from the seller workspace into DealIQ**: someone selling a
business is not simultaneously buying one, and an affordance that implies otherwise makes both
products read as one app with a toggle. The two share a design language (typography, tokens, glass
treatments, agent-surface primitives) and an engine — they do not share navigation. The only
connection that stays is one-directional and invisible to the user: a buy-side buyer profile can
surface inside the seller's buyer queue (item 13).

---

## 0. State of play — what is in the repo today

Verified before planning. Several assumptions in the product plan are stale:

| Product-plan assumption | Reality |
|---|---|
| "Reuses the Scorta Score component built in P1.1" | **Not built.** `app/(app)/score/page.tsx` still renders `LockedStation`. DealIQ builds the dial *first* — so build it shared and let the sell-side inherit it. |
| "Ryan appears in the sell-side `/network` shortlist" | **`/network` does not exist.** DEMO plan P1.2 is unbuilt. The cross-product item (13) targets `OutreachStation`, which already has a buyer slot literally named *"Search Fund (Profile TBD)"*. |
| Deal Clock / live CASE are pending | **Both shipped.** `lib/dealClock.ts` (+ tests) and `app/api/case/chat/route.ts` exist. The live-LLM-with-fallback pattern DealIQ needs is already proven in `CASEChat.tsx` → `lib/caseChatClient.ts`. |
| — | **`/login` is seller-branded and hard-wired to `/dashboard`** (`LoginPanel.tsx:31`, `app/login/page.tsx`). DealIQ needs its own sign-in surface (item 4), not a redirect through the seller's. |

Patterns confirmed available for reuse (do not reinvent):

- **Streaming log** — `IngestionStation.tsx:13-51` (`T` timing const, `LogLine` type, `setTimeout` fan-out at `:73-85`, `StreamingLog` at `:311`).
- **Approve gate** — `IngestionStation.tsx:1121` (`ApprovePhase = "idle" | "approving" | "approved"`, spinner → timestamped signature → route push).
- **Shell** — `AppShell.tsx` (280px rail, `RailGroup`/`RailItem`/`StationIndicator`, 64px sticky top bar, `ScopedStyles` injected `<style>`, `data-theme="cream"`).
- **Cross-nav session state** — `AgentFleetContext.tsx` (sessionStorage-backed provider, key `scorta:fleet:dispatched`). Copy this shape for DealIQ state.
- **Live LLM + graceful fallback** — `api/case/chat/route.ts` (Zod body → `streamText` → `toTextStreamResponse`, structured `logger.error`) + `lib/caseChatClient.ts` (reader loop, throw → caller falls back).
- **Pure lib + Vitest** — `lib/dealClock.ts` / `lib/dealClock.test.ts` is the house style for the DealIQ engine modules.
- **Landing page** — `components/scorta/LandingPage.tsx`: local palette const `C` (`:9-31`), `SNav` (`:976`, links array at `:1006`), `SHero` (`:1255`, CTA row at `:1345`), `SProductSurfaces` (`:2648`), `SRoadmap` (`:2929`), `SFinalCTA` (`:3013`), `SFooter` (`:3078`).
- **Tokens** — `--sky`, `--sky-soft`, `--sky-edge`, `--lav`, `--lav-soft`, `--lav-edge`, `--gold`, `--crit` all exist in `styles/tailwind.css` under `[data-theme="cream"]`. No new palette needed, none permitted.
- **Stack facts** — `ai@6.0.160` (`generateObject` accepts `schema` + `abortSignal`), `zod@3.25.76`, models in `lib/ai/index.ts`. No new env vars required.

---

## 1. The data seam — how placeholders work

This is the rule that lets content land later without reopening a single component.

**One directory owns all content.**

```
lib/dealiq/data/
  buyer.ts       buyer identity, firm, mandate, capital status
  pipeline.ts    the deal board + funnel counters
  deal.ts        the focus deal: header facts + claimed add-back lines + risk inputs
  flow.ts        certified pre-market listings
  diligence.ts   the question bank
  copy.ts        long-form strings (log scripts, memo fallback, verify statements)
```

Each file opens with the same banner and exports typed consts only:

```ts
/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */
```

**Five rules that make the swap trivial:**

1. **Components take data as props or read it from `lib/dealiq/data/` — never inline literals.** No dollar amount, business name, verdict, or score appears in JSX. A grep of `components/dealiq/` for `$` followed by a digit should return nothing.
2. **Engines carry rules, not facts.** `reverseRecast`, `returns`, `screenScore` are pure functions over typed inputs. Weights, bands, and default financing terms are exported constants at the top of each module so they can be tuned when real data lands, without touching logic.
3. **Placeholders are shape-truthful.** Provisional values must be realistic in *magnitude and length* — a seven-figure number, a two-word firm name, a 90-character rationale — so layout, wrapping, and truncation are being tested for real. They may not be so realistic that they could ship unnoticed; keep them obviously provisional (`"Buyer Name"`, `"Placeholder Holdings"`, round figures).
4. **Everything is derived, nothing is asserted.** Totals, deltas, percentages, funnel counts, and match scores are computed from the seed at render time. When the seed changes, every dependent figure moves with it. No screen shows a total that was typed by hand.
5. **DealIQ never imports `@/lib/persona`.** The buy-side is decoupled from sell-side content by construction. If the two products need to agree on something later, that agreement is authored in the data pass — not created as a code dependency now.

**Formatting** goes through one shared module (`lib/dealiq/format.ts`: currency, compact currency, multiple, percent, score) so real numbers inherit consistent typography the moment they arrive.

**Tests** run against synthetic fixtures defined *inside the test files* — never against `lib/dealiq/data/`. Engine tests must survive a total content swap untouched. That is the acceptance criterion for the seam.

---

## 2. Architecture decisions (settled — don't relitigate mid-build)

**Routes.** Sibling route group, with the guard pushed down one level so DealIQ can own a **public
sign-in page under its own URL space**. No path collisions with `(app)`.

```
app/(dealiq)/layout.tsx                        DealIQ-wide chrome: fonts, theme, metadata. NO guard.
app/(dealiq)/dealiq/signin/page.tsx            public buyer sign-in (own branding)
app/(dealiq)/dealiq/(workspace)/layout.tsx     auth guard → /dealiq/signin, + DealIQShell
app/(dealiq)/dealiq/(workspace)/page.tsx           /dealiq          Pipeline
app/(dealiq)/dealiq/(workspace)/screen/page.tsx    /dealiq/screen   Deal Inbox
app/(dealiq)/dealiq/(workspace)/deal/[id]/page.tsx /dealiq/deal/…   Deal workspace (5 tabs, ?tab=)
app/(dealiq)/dealiq/(workspace)/verify/page.tsx    /dealiq/verify   Capital Verification
app/(dealiq)/dealiq/(workspace)/flow/page.tsx      /dealiq/flow     Certified Deal Flow
app/api/dealiq/screen/route.ts                 POST ingest (Haiku) · GET warm ping
app/api/dealiq/narrate/route.ts                POST challenge memo (Sonnet stream)
```

The inner `(workspace)` group is what lets `/dealiq/signin` sit inside the DealIQ URL space without
inheriting the auth guard — putting the guard on `app/(dealiq)/layout.tsx` would redirect the sign-in
page to itself.

**Modules.**

```
lib/dealiq/types.ts          Deal · DealCard · RecastLine · Verdict · SubScore · BuyerProfile
lib/dealiq/reverseRecast.ts  add-back challenge rules → ReverseRecastResult   ← unit tested
lib/dealiq/returns.ts        amortization · DSCR · CoC · payback · sensitivity ← unit tested
lib/dealiq/screenScore.ts    6 sub-scores → composite → verdict                ← unit tested
lib/dealiq/loi.ts            terms derived from returns + recast               ← unit tested
lib/dealiq/matching.ts       mandate ↔ listing match scoring                   ← unit tested
lib/dealiq/format.ts         display formatters
lib/dealiq/navigation.ts     DEALIQ_NAV (4 destinations) + DEAL_TABS (5 workspace tabs)
lib/dealiq/data/*            ALL placeholder content (§1)
lib/dealiq/nextPath.ts       post-sign-in redirect resolution, /dealiq paths only ← unit tested
components/dealiq/*          DealIQ shell, navigation, and every buy-side surface
components/shared/           ScoreDial · StreamingLog (design-language primitives only)
lib/dealiq/__tests__/*.test.ts
```

**What is shared, and what is not.** DealIQ shares the *design language* — fonts, CSS-variable tokens, glass treatments, the streaming-log and approve-gate interaction patterns — and the engine. It does **not** share navigation, layout, or shell. Concretely:

- **Do not fork `AppShell`.** Its IA (280px station rail, sequential sublabels, one-deal top bar, CASE strip, agent gutter) is built for a linear walk through a single engagement. DealIQ is a multi-deal triage tool; copying that chrome and recoloring it is exactly the reskin this build is trying not to be. Build `components/dealiq/DealIQShell.tsx` from its own IA (item 3), borrowing token usage and spacing rhythm rather than structure.
- **Copy the interaction primitives** — `StreamingLog` and `ApproveGate` are lifted from `IngestionStation` *by copy* into `components/shared/` and `components/dealiq/` respectively, leaving that 42KB demo-critical file untouched.
- **`ScoreDial` goes to `components/shared/`** because DEMO P1.1 will want it for the sell-side Scorta Score.
- **No component imports across products.** Nothing in `components/dealiq/` imports from `components/scorta/`, and nothing in `components/scorta/` imports from `components/dealiq/`. The single exception is item 13's adapter, which passes plain data, not components.

**Accent.** `DealIQShell` sets buy-side aliases once on its root element; every DealIQ component references only the aliases:

```ts
"--dq-accent": "var(--sky)", "--dq-accent-soft": "var(--sky-soft)", "--dq-accent-edge": "var(--sky-edge)",
"--dq-agent": "var(--lav)",  "--dq-agent-soft": "var(--lav-soft)",  "--dq-agent-edge": "var(--lav-edge)",
```

Verdict colors: `PURSUE` → `--dq-accent` (sky), `DIG` → `--gold`, `PASS` → `--crit`. **Mint never appears in DealIQ** — it is the sell-side's signature. No raw hex outside token definitions (AGENTS §E). Colour alone is not the differentiator here; the layout is.

**State.** No database, no migrations, no new tables — DealIQ is session-scoped. One provider, `components/dealiq/DealIQSessionContext.tsx`, copied from `AgentFleetContext.tsx`, keys `scorta:dealiq:screened` and `scorta:dealiq:verified`.

**LLM fallback contract (mandatory, both routes).**

1. Server: `abortSignal: AbortSignal.timeout(6000)` on the model call; on abort/error return the placeholder payload with `provenance: "fallback"` and **HTTP 200** — the demo path must never see a 5xx.
2. Client: independent timeout (8s to first token for the stream) → render placeholder prose.
3. The streaming log's scripted duration (~4.5s) is the latency mask; the card reveals when *both* the log completes and the response resolves.
4. Provenance is visible but neutral: a mono chip reading `haiku · 1.8s` when live, `cached` when not.
5. `GET /api/dealiq/screen` → `{ ok: true }`, pinged on Deal Inbox mount to warm the function.

---

## 3. The build items

Fourteen items — the product plan's thirteen, plus the landing-page entry point. Estimates assume one engineer who has read §1 and §2. **Total ~4 days at demo fidelity**, content pass excluded.

---

### 1 · Data layer & types — *2h*

**Goal.** Every shape DealIQ renders is typed and instantiated once, so surfaces can be built immediately and content can be swapped in one directory later.

**Dependencies.** None. Do this first; everything imports from it.

**Implementation steps.**
1. `lib/dealiq/types.ts` — `BuyerProfile` (identity, firm, `committedCapital`, `capitalVerified`, `verificationMethod`, `verifiedOn`, `poolRank`), `Mandate` (industries, geographies, `evBand`, `sdeFloor`, `maxOwnerDependency`), `PipelineDeal` (id, name, industry, geography, ask, claimed SDE, score, verdict, stage, `daysInStage`, `lastAgentAction`, `killReason?`), `ClaimedAddBack` (label, annual amount, documentation quality, `businessUseShare?`, role split), `DealCard`, `RecastLine`, `Verdict`, `SubScore`, `CertifiedListing`, `DiligenceQuestion`.
2. `lib/dealiq/data/*` — one placeholder instance of each, under the §1 banner. Pipeline gets **12 deals across four stages** with a realistic distribution shape (heavy at screened, thin at LOI) plus funnel counters; the focus deal is absent at load so it can arrive during the demo.
3. `lib/dealiq/navigation.ts` — `DEALIQ_NAV`: the four global destinations (Pipeline · Screen · Flow · Verify), each `{ href, label, icon }` — flat labels, no station numbering, no agent sublabels; and `DEAL_TABS`: the five workspace tabs (Screen Score · Reverse Recast · Returns · Diligence · LOI) with their `?tab=` keys.
4. `lib/dealiq/format.ts` — the shared formatters.

**Data strategy.** 100% placeholder, shape-truthful, single directory, banner-marked.

**Quality bar.** `readonly` / `as const` throughout (matches `lib/persona.ts` style). No import of `@/lib/persona`. A structural test: pipeline stage counts are internally consistent, every id is unique, every verdict is a member of the union.

**Demo path.** Nothing visible yet — but every later item compiles against it.

**Risks.** Shapes turn out wrong when real content arrives. *Mitigation:* model the shapes off the sell-side's analogous data (`lib/persona.ts`, `lib/auditTrail.ts`) which already survived a full product build; add optional fields liberally rather than reshaping later.

**DoD.** Typecheck clean · every type exported from one module · content-swap requires touching only `lib/dealiq/data/`.

---

### 2 · Engines: `reverseRecast.ts` + `returns.ts` + `screenScore.ts` (+ Vitest) — *4h*

**Goal.** Rules, not facts. Three pure modules that turn typed inputs into the figures every money surface displays — with tests that pass regardless of what content is eventually seeded.

**Dependencies.** Item 1 (types). Style reference: `lib/dealClock.ts` / `lib/dealClock.test.ts`.

**Implementation steps.**

`reverseRecast.ts` — each rule is a separately exported, separately testable function; the orchestrator composes them:
```ts
export function reverseRecast(input: ReverseRecastInput): ReverseRecastResult
// → { claimedSde, defensibleSde, totalAdjusted, lines: RecastLine[],
//     impliedMultiple, fairValue, negotiationDelta }
```
Rule families to implement (parameterized — thresholds are exported constants):
- **Role-split rule** — accept only the portion of a compensation add-back tied to roles vacated at close.
- **Mixed-use rule** — split a claimed add-back by a documented business-use share.
- **Documentation rule** — reject/haircut by documentation quality (`verified` / `partial` / `none`).
- **Replacement-cost rule** — emit an omitted-cost line when a role must be re-hired above what it was paid.
- **Reserve rule** — emit an omitted-cost line when a "one-time" expense recurs across the history window.
- **Occupancy rule** — emit a flag (and an optional scenario line) when the P&L carries no occupancy cost.

Each `RecastLine` carries `{ kind: "add_back_challenge" | "omitted_cost", verdict, claimed, accepted, adjusted, rule, rationale }`. `rationale` is deterministic text; LLM prose (item 7) is additive, never load-bearing.

`returns.ts`:
```ts
export function amortizedPayment(principal: number, annualRate: number, years: number): number
export function computeReturns(input: ReturnsInput): ReturnsResult
```
Inputs: price, defensible SDE, buyer compensation, equity %, seller-note % / rate / standby months, SBA rate / term, closing costs, working capital, optional SDE haircut. Outputs: capital stack, monthly + annual debt service, DSCR, cash-on-cash, years to payback, `maxPriceAtDscrFloor`. Scenario support: `"base" | "transition" | "stress" | "occupancy"` as input modifiers, not branches in the UI.

`screenScore.ts` — six sub-scores (SDE Quality · Add-Back Aggressiveness · Customer Concentration · Owner Dependency · SBA Financeability · Price vs Comp), each returning `{ score, weight, basis }` where `basis` is a UI-renderable one-liner. Exported `WEIGHTS` and `VERDICT_BANDS` constants → composite → `PASS | DIG | PURSUE`.

**Data strategy.** Zero content, zero LLM, zero I/O. Every business fact arrives as an argument.

**Quality bar (this is where the contract bites).**
- Tests use **synthetic fixtures declared in the test file**. A full swap of `lib/dealiq/data/` must not touch a single test.
- `reverseRecast.test.ts` — each rule isolated; result invariants (`claimed − adjusted === defensible`, line totals equal header totals); edge cases: empty schedule, business-use share of 0 and 1, unknown documentation, zero claimed SDE.
- `returns.test.ts` — `amortizedPayment(100_000, 0.12, 10)` ≈ `1_434.71` (known value); DSCR monotonic in price; divide-by-zero guarded (zero equity, zero debt service); `maxPriceAtDscrFloor` inverts correctly.
- `screenScore.test.ts` — weights sum to 1; clamping at 0 and 100; verdict at each band boundary and one either side.
- `noUncheckedIndexedAccess` is on: no bare `arr[i]` without a guard. No `any`.

**Demo path.** Invisible — but it is the answer when a partner asks *"is this just a prompt?"*: `pnpm exec vitest run lib/dealiq`, all green, on screen.

**Risks.** Rules get written around one imagined deal. *Mitigation:* every threshold is a named exported constant, and each rule is tested at two different input profiles.

**DoD.** `pnpm exec vitest run lib/dealiq` green · no business fact inside any engine module · every UI figure has a function that produces it.

---

### 3 · Standalone app shell & information architecture — *4h*

**Goal.** DealIQ reads as its own product the moment it loads — because its navigation is built for what a searcher does (triage many deals, move between them fast, decide), not for the seller's one-deal station walk.

**Dependencies.** Item 1. **Not** a fork of `AppShell` (§2).

**The IA — three layers, four destinations.** The seller workspace has eleven sequential stations and a rail wide enough to explain each one. DealIQ has four destinations and a deal context; a 280px explanatory rail would be wrong furniture.

```
┌──────────────────────────────────────────────────────────────────────┐
│ DealIQ ▸  Pipeline  Screen  Flow  Verify        ⌘K  ·  mandate chip  │  global bar (56px)
│                                                    capital-verified ▸ │
├──────────────────────────────────────────────────────────────────────┤
│ ◂ Sunrise HVAC · $1.9M ask · Score 58 · DIG        ▸ 4 of 12   ✕     │  deal context bar
│   Screen Score │ Reverse Recast │ Returns │ Diligence │ LOI           │  (only inside a deal)
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   content — full width, table/board-first density                    │
```

**Implementation steps.**
1. `app/(dealiq)/layout.tsx` — DealIQ-wide chrome only: `data-theme="cream"`, the `--dq-*` accent aliases (§2), metadata. **No auth guard** (the sign-in page lives under it).
2. `app/(dealiq)/dealiq/(workspace)/layout.tsx` — `createClient()` → `getUser()` → `redirect("/dealiq/signin?next=…")`, then renders `DealIQShell`. Server component.
3. `components/dealiq/DealIQShell.tsx` — the global bar: wordmark + `Buy-side` mark on `--dq-accent`, four horizontal nav items (`Pipeline · Screen · Flow · Verify`) with `aria-current`, a **Screen a deal** primary action (the app's main verb, always reachable), the mandate chip, the capital-verified badge, and the buyer menu (profile, screening log, sign out → `/dealiq/signin`). No station rail, no sublabels, no agent gutter, no CASE strip.
4. `components/dealiq/DealContextBar.tsx` — mounts only on `/dealiq/deal/[id]`: deal name, ask, score chip, verdict chip, a **prev/next deal stepper** bound to pipeline order (with `[` / `]` keyboard shortcuts), a close affordance back to the pipeline, and the five workspace tabs. Tabs sync to `?tab=` for deep links (client component under `<Suspense>`, per Next 15's `useSearchParams` rule).
5. `components/dealiq/DealIQSessionContext.tsx` — sessionStorage provider copied in shape from `AgentFleetContext.tsx`; keys `scorta:dealiq:screened`, `scorta:dealiq:verified`.
6. **Density and rhythm.** Buy-side surfaces are triage surfaces: table- and board-first, tighter vertical rhythm than the seller stations, numbers in mono, one accent. Reuse the token set and spacing scale so it reads as the same company — do not reuse the glass-card-per-section composition, which is a one-deal storytelling layout.
7. `ScopedStyles` — own keyframes and hover rules under a `dq-` class prefix so the two apps can never collide.

**Data strategy.** Reads item 1's placeholder buyer, mandate, and `DEALIQ_NAV` / `DEAL_TABS`.

**Quality bar.** `"use client"` on the shell and context bar only; layouts stay server components. Full keyboard path: nav, deal stepper, tabs, buyer menu. Focus-visible rings on every interactive element. Deal context bar must handle a long business name (truncate with title) and a deal with no score yet. Empty state on `/dealiq` before anything is screened. No `--mint`, no `scorta-` class names, no import from `components/scorta/`.

**Demo path.** `/dealiq` loads straight into the pipeline board; nothing on screen resembles the seller workspace except the typography.

**Risks.** The IA drifts back toward a rail because that code already exists. *Mitigation:* the global bar is built first and the rail is never created. Horizontal nav feels thin with four items. *Mitigation:* that is correct for four destinations — the density belongs in the content, and the `⌘K`/Screen-a-deal action carries the primary verb.

**DoD.** Guard verified by signing out · keyboard-only pass through global bar → deal → tabs → back · `grep -rn "mint\|scorta-" components/dealiq/` empty · renders at 1280 and 1440 without horizontal scroll.

---

### 4 · Buyer sign-in & standalone entry — *2h · build early*

**Goal.** DealIQ has its own front door. A buyer signs into DealIQ and lands in DealIQ — never through a seller-branded login, never into `/dashboard`. This replaces the product switcher, which is deliberately not being built.

**Dependencies.** Item 3 (route structure).

**Implementation steps.**
1. `app/(dealiq)/dealiq/signin/page.tsx` — public, outside the `(workspace)` guard. If a session already exists, `redirect` straight into `/dealiq`.
2. `components/dealiq/BuyerSignIn.tsx` — DealIQ-branded sign-in: buy-side wordmark, its own one-line positioning, `--dq-accent` primary button. Written fresh against the same Supabase browser client `LoginPanel.tsx` uses; borrow its auth call and error handling, not its layout or copy. States: idle, submitting, invalid-credentials, network error.
3. `lib/dealiq/nextPath.ts` — `safeDealIqPath(raw: string | null): string`: returns `raw` only when it is a same-origin path under `/dealiq`, else `/dealiq`. Rejects protocol-relative (`//host`), absolute URLs, backslash tricks, and encoded escapes. **Pure and unit-tested** — the guard passes `?next=` for deep links (a partner sent straight to a deal URL should land on that deal after signing in), and an unvalidated redirect param is a real open-redirect.
4. Sign-out in the buyer menu returns to `/dealiq/signin`, not `/login`.
5. **Explicitly not built:** any link, pill, or menu item in the seller workspace that navigates to DealIQ. `AppShell.tsx` is not touched by this item at all.

**Data strategy.** Copy from `data/copy.ts`; auth is the existing Supabase session (one demo account serves both apps — role separation is out of scope, §7).

**Quality bar.** `safeDealIqPath` tested against `//evil.com`, `https://evil.com`, `/\evil.com`, `%2f%2fevil.com`, `/dashboard`, and valid deep links. Sign-in form is keyboard- and password-manager-friendly (`<form>`, labelled inputs, `autocomplete="current-password"`). Error states never leave the button spinning.

**Demo path.** `/dealiq` while signed out → DealIQ's own sign-in → into the pipeline. Deep link to a deal while signed out → same sign-in → lands on that deal.

**Risks.** Two sign-in surfaces on one Supabase user confuse the demo driver. *Mitigation:* the driver signs in once before presenting; both doors reach the same session, so an already-signed-in visit skips the form entirely.

**DoD.** `safeDealIqPath` tests green · signed-out deep link round-trips to its target · sign-out returns to the DealIQ door · `grep -rn "dealiq" components/scorta/AppShell.tsx` empty.

---

### 5 · Deal Inbox — *4h*

**Goal.** Paste a listing, watch the Ingestion Agent work, get a structured deal card in seconds. Opening move of the demo; it must feel instant.

**Dependencies.** Items 1–4. Reuses `IngestionStation`'s log pattern; needs `POST /api/dealiq/screen`.

**Implementation steps.**
1. `app/api/dealiq/screen/route.ts`:
   - `GET` → `{ ok: true }` (warm ping).
   - `POST` body Zod: `{ source: "text" | "url", value: string }` (1–20,000 chars).
   - `source: "url"` → resolve against the placeholder fixture set; unknown URLs return `{ needsText: true }` with guidance. **No internet fetching, no scraping** (§7).
   - `source: "text"` → `generateObject({ model: anthropic(HAIKU_MODEL), schema: dealCardSchema, prompt, abortSignal: AbortSignal.timeout(6000) })`.
   - On abort/error → `logger.warn("dealiq.screen.fallback", { reason })` → return the placeholder card, `provenance: "fallback"`, **status 200**.
   - Always return `{ deal, provenance, latencyMs, model? }`.
   - Prompt construction lives in a pure exported function so it is unit-testable and its content can be rewritten in the data pass.
2. `components/dealiq/DealInbox.tsx` (client): textarea + a **sample listing** chip that fills it from `data/copy.ts`; `POST` on submit; `components/shared/StreamingLog.tsx` runs a ~14-line script (~4.5s) as the latency mask; the card reveals when log-done **and** response-resolved.
3. Log script lives in `data/copy.ts` as a typed `LogLine[]` — same shape as the sell-side's (`ts`, `text`, optional `accent` / `flag`), so its content is authored later without touching the component.
4. Deal card: header facts + provenance chip + primary CTA into the workspace.
5. On success, write `scorta:dealiq:screened` so the Pipeline picks the deal up.

**Data strategy.** Live Haiku on pasted text; placeholder card as fixture and as fallback. All copy from `data/copy.ts`.

**Quality bar.** Loading, empty, and error states (`needsText`, network failure, oversized input) all designed. In-flight request aborts on unmount. `maxLength` on the textarea. Structured logs on both paths.

**Demo path.** `/dealiq/screen` → sample chip → **Screen this deal** → log streams → card lands → into the workspace.

**Risks.** Model latency spike. *Mitigation:* 6s server abort + log mask + fallback. Extraction returns values that disagree with the fixture. *Mitigation:* when the input matches a known fixture, prefer the fixture and log the divergence — the fixture is the source document.

**DoD.** Works with `ANTHROPIC_API_KEY` unset · works offline (client catch) · no unhandled rejection · card renders correctly for a long business name and a short one.

---

### 6 · Screen Score — *4h*

**Goal.** In 90 seconds a searcher knows whether to kill the deal: a dial, six sub-scores with their bases, and a PASS / DIG / PURSUE verdict.

**Dependencies.** Items 2, 5.

**Implementation steps.**
1. `components/shared/ScoreDial.tsx` — animated 0→N arc (SVG `stroke-dasharray`, ~900ms ease-out, `prefers-reduced-motion` respected), accent and band thresholds via props. **Built shared so DEMO P1.1 inherits it for the sell-side Scorta Score.**
2. `components/dealiq/ScreenScorePanel.tsx` — dial + verdict badge + six sub-score rows (label · bar · score · `basis`). The list is rendered off the engine's returned array; adding a seventh sub-score must require no JSX edit. Bars color by band, so a weak score renders in `--crit` without any per-deal special-casing — the panel must be able to visibly argue with itself.
3. Conditions block — renders `result.conditions[]`, each deep-linking to the tab that proves it.
4. Cross-product strip — a slot for the sell-side score comparison (*"same engine, opposite objective"*); the two numbers arrive in the content pass, the component takes them as props and hides itself when absent.
5. Methodology drawer — renders `WEIGHTS` and `VERDICT_BANDS` from the engine, plus the line *"No model produced this number."*

**Data strategy.** Fully computed by `screenScore()`. No LLM.

**Quality bar.** Dial animates once per mount, not per re-render. Must render correctly at 0, at each band boundary, and at 100 — check all three during build. Verdict → color mapping is one exported function shared with the Pipeline board.

**Demo path.** Workspace opens on this tab; dial animates; verdict lands; the weak sub-scores set up the Returns tab.

**Risks.** The panel is built around one expected score. *Mitigation:* build it with a temporary dev control that sweeps the composite 0→100 and confirm nothing breaks; delete the control before commit.

**DoD.** No score literal in JSX · methodology drawer keyboard-accessible · reduced-motion path verified · renders for all three verdicts.

---

### 7 · Reverse Recast — **the differentiator, highest polish budget** — *6h*

**Goal.** The seller's add-back schedule taken apart line by line, with the defensible SDE, the adjustment total, and the negotiation delta — visibly the sell-side Recast Agent with the sign flipped.

**Dependencies.** Items 2, 5. Visual reference: `RecastStation.tsx:415-545` — the challenge table should deliberately echo its structure, because that echo *is* the argument.

**Implementation steps.**
1. `components/dealiq/ReverseRecastPanel.tsx`:
   - **Header ledger** — three figures (claimed → defensible → adjusted), the middle one arriving on a ~600ms count-up driven by the engine result.
   - **Challenge table** — one row per `RecastLine`: verdict glyph (✓ accepted / ⚠ partial / ✗ rejected), label, claimed, accepted, adjusted, rule chip. Rows group by `line.kind`, so add-back challenges and omitted costs render as two sections under one divider automatically — no manual ordering.
   - **Expandable provenance** — each row opens to show the rule that fired and where the claim came from. Build this properly; it is the most persuasive detail on the screen.
   - **Negotiation block** — implied multiple, fair value, delta off the ask, with the one-line rule that produced them.
   - **Flag strip** — renders any flags the engine emits (e.g. the occupancy rule), linking to the Returns scenario that models them.
2. `app/api/dealiq/narrate/route.ts` — `POST { dealId }`; the server recomputes `reverseRecast()` (never trusts client-supplied figures), prompts Sonnet for a short challenge memo grounded in the computed lines, returns `result.toTextStreamResponse()`. Unknown `dealId` → 404 `not_found`. Prompt goes in `lib/ai/prompts.ts` beside the existing ones; its wording is placeholder and gets a pass with the content.
3. Client streams it below the table via a `caseChatClient`-shaped reader; 8s first-token timeout → placeholder memo from `data/copy.ts`. **The table renders instantly and never waits on the stream.**
4. Approve gate (forked) — *"Accept this challenge → carry the defensible SDE into the Returns model"*, timestamped signature matching the sell-side pattern, then routes to `?tab=returns`.

**Data strategy.** Figures 100% deterministic; prose live-Sonnet with placeholder fallback.

**Quality bar.** Table fully data-driven — adding a rule adds a row. Streaming region is `aria-live="polite"`. Stream aborts on unmount and on tab change. Table must render sensibly with 3 lines and with 12, and when every line is accepted (no adjustment at all).

**Demo path.** Tab loads → ledger counts up → partner scans the rows → expands one → memo streams underneath → accept → Returns.

**Risks.** Sonnet is slow or drifts from the numbers. *Mitigation:* figures never depend on it; the prompt receives computed lines and is instructed to explain, never compute; 8s fallback. The table reads as a hit piece. *Mitigation:* accepted and partial rows must be visually first-class — the product's credibility is that it also agrees.

**DoD.** Every figure traceable to the engine result · memo streams with a key set and falls back cleanly without one · gate signature lands in the Screening Log · renders at 3, 6, and 12 lines.

---

### 8 · Returns Model — *5h*

**Goal.** The subscription surface: SBA structure, DSCR, cash-on-cash, payback, and a sensitivity slider that recomputes live.

**Dependencies.** Items 2, 7.

**Implementation steps.**
1. `components/dealiq/ReturnsPanel.tsx`:
   - **Capital stack** — horizontal stacked bar (SBA loan · seller note · buyer cash) with terms beneath each segment; proportions come from the engine.
   - **Metric row** — monthly debt service · DSCR against a floor marker · cash-on-cash · years to payback · buyer salary. Labels must be precise (*"Year-1 cash-on-cash, pre-transition-risk"*), because whatever the eventual figures are, precision is what makes them credible.
   - **Sensitivity slider** — price range derived from the seeded ask (±25%), with ticks at fair value and ask; every metric recomputes via `useMemo` over `computeReturns` — no effects, no state sync.
   - **Scenario chips** — Base · Transition · Stress · Occupancy, each a different input set into the same engine.
   - **Constraint line** — renders `maxPriceAtDscrFloor` with the framing that follows from it.
2. Slider is a Radix Slider (already a dependency) or a native `<input type="range">` with a visible value — do not hand-roll a drag handle.

**Data strategy.** 100% computed. No LLM. Financing defaults live as exported constants in `returns.ts`, overridable from `data/deal.ts`.

**Quality bar.** Slider keyboard-operable with `aria-valuetext` in dollars. No NaN or `Infinity` at either slider extreme or in any scenario — test the boundaries explicitly. All figures through `format.ts`.

**Demo path.** Land from the recast accept → read DSCR → drag the slider → flip to the transition scenario → the searcher's question is answered.

**Risks.** Slider stutters. *Mitigation:* pure `useMemo`, no per-frame state writes. Metrics look implausible once real content lands. *Mitigation:* precise labels plus the scenario chips make the assumptions visible; the content pass can tune the defaults without touching the component.

**DoD.** Metrics match `computeReturns()` in a test · slider keyboard-accessible · all four scenarios render at both slider extremes without NaN.

---

### 9 · Diligence Pack — *3h*

**Goal.** ~25 questions ranked by **which kill the deal fastest** — the ordering is the product.

**Dependencies.** Items 2, 7 (findings feed the top questions).

**Implementation steps.**
1. `lib/dealiq/diligence.ts` — `rankQuestions(bank, findings)`: `killScore` is computed (`killSpeed × categoryWeight × unresolvedFlag`) and the list is sorted by it — **never hand-ordered**. Question bank itself lives in `data/diligence.ts`, tagged by category and by the recast rule that can promote it.
2. Questions whose `sourceFinding` matches a fired recast rule float to the top automatically. That linkage is what proves the pack was generated rather than templated — and it works no matter what content is seeded.
3. `components/dealiq/DiligencePanel.tsx` — ranked list with kill-speed bars, category filter chips, expandable rationale per row, and a red-flags header strip fed by engine flags.
4. **Copy pack** button → clipboard as markdown (no email, no sending).

**Data strategy.** Placeholder bank; deterministic ranking; no LLM.

**Quality bar.** Test: sort is stable and matches `killScore` descending; promotion by `sourceFinding` works; unique ids. Empty state when a filter excludes everything.

**Demo path.** *"These aren't a checklist — they're sorted by what kills the deal fastest, and the top ones came out of the recast."*

**Risks.** Reads as a generic list. *Mitigation:* the promotion linkage and kill-speed bars; cut question count before cutting the linkage.

**DoD.** Ranking test green · promoted rows link back to their recast line · copy-to-clipboard works · filters have an empty state.

---

### 10 · LOI Drafter — *4h*

**Goal.** Screen → offer inside one product, with a negotiation rationale attached to every term.

**Dependencies.** Items 7, 8. Approve-gate fork.

**Implementation steps.**
1. `lib/dealiq/loi.ts` — `buildLoi(returns, recast, mandate): LoiDraft`. Every term is derived: price from fair value, structure from the capital stack, contingencies from fired recast rules and flags, exclusivity/deposit/earnout from exported constants. Each term carries a `rationale` referencing the line or metric that produced it.
2. `components/dealiq/LOIPanel.tsx` — term-sheet layout (serif headings, mono figures), rows expandable to their rationale, a **"why this price, not the ask"** callout, and a non-binding disclaimer.
3. Approve gate → **"Send to seller's Case Manager"** → scripted ~700ms → signature line → toast → pipeline card moves to the LOI stage and the funnel counter increments.

**Data strategy.** Deterministic derivation; no LLM (short prose is better hand-written and lands in the content pass).

**Quality bar.** `buildLoi` unit-tested: price equals fair value; the stack sums to price; every term has a non-empty rationale; contingencies vary when the recast input varies. Clear non-binding labeling — no attempt at real legal language (§7).

**Demo path.** Returns → LOI → scan terms → approve → the card moves and survives navigation.

**Risks.** Reads as a legal document. *Mitigation:* label it *"LOI draft · non-binding · for counsel review"* on the surface.

**DoD.** Test green · gate signature lands in the Screening Log · pipeline state persists across routes.

---

### 11 · Capital Verification — *2.5h*

**Goal.** The join between the two products, stated so plainly it cannot be missed.

**Dependencies.** Items 1, 3. Session key `scorta:dealiq:verified`.

**Implementation steps.**
1. `components/dealiq/CapitalVerification.tsx` — drop zone accepting proof-of-funds / pre-qual documents. **The file is read client-side only: name, size, and type are displayed; the `File` object is never uploaded, never POSTed, never stored.** Scripted ~2.2s verification with three check lines.
2. Result: **Capital-Verified** badge, a chip in the shell top bar, and the trade statement in large type — the *"verified buyers see certified deals before they reach the open market"* claim, with the pool stats beneath it. All strings from `data/copy.ts`.
3. Writes the session flag; Certified Flow and the cross-product surface (item 13) read it.
4. Pre-verified state: the placeholder buyer is already verified, so the page opens on the badge with a **"Re-verify / update proof"** affordance — the upload flow stays demonstrable without pretending the buyer is new.

**Data strategy.** Placeholder; the upload is inspected in-browser only.

**Quality bar.** Drop zone keyboard-accessible with a real `<input type="file">` fallback; wrong-type error state; **zero network calls**; an explicit code comment stating no upload occurs.

**Demo path.** `/dealiq/verify` → drop a file → badge → read the trade statement → switch products.

**Risks.** Looks like fake KYC. *Mitigation:* the surface says verification is analyst-reviewed in production.

**DoD.** No network request on upload (confirm in devtools) · badge propagates to the shell · error state for a non-document file.

---

### 12 · Certified Deal Flow — *2.5h*

**Goal.** The flywheel rendered: pre-market certified listings, mandate-matched, with a visible clock before they hit the open market.

**Dependencies.** Items 1, 11.

**Implementation steps.**
1. `lib/dealiq/matching.ts` — `matchScore(listing, mandate)` with weighted components (industry · geography · EV band · SDE floor), returning both the score and the per-component breakdown so the card can show *why* it matched.
2. `components/dealiq/CertifiedFlow.tsx` — cards with match %, certification seal, a pre-market countdown strip, and the seller-side certification basis. Sorted by match score.
3. One card CTA routes into `/dealiq/screen` prefilled — closing the loop back to item 5.
4. Locked state (*"Verify capital to view"*) when the session flag is absent — makes the badge mean something.

**Data strategy.** Placeholder listings; computed match scores (unit-tested).

**Quality bar.** Match ordering tested; countdown derives from a seeded date, not `Date.now()` drift; empty state when the mandate excludes everything.

**Demo path.** After verification → the feed → *"these are the deals I see before the market does"* → click through to the Inbox.

**Risks.** Reads as filler. *Mitigation:* the countdown and the locked card make it feel like access, not a list.

**DoD.** Scores computed and tested · locked card unlocks after verification · CTA routes into the screen flow.

---

### 13 · Cross-product handoff seam — *1.5h*

**Goal.** A buy-side buyer profile can render on a sell-side surface, so the closing shot of the demo — *"that's the buyer you just watched screen this deal"* — is a component wiring change, not a rebuild, whenever the content pass supplies the profile.

**Dependencies.** Items 1, 11. **Note:** the product plan's landing surface (`/network`) does not exist; DEMO P1.2 is unbuilt.

**Implementation steps.**
1. `lib/dealiq/adapters/toSellSideBuyer.ts` — a pure adapter mapping `BuyerProfile` → the `Buyer` shape `OutreachStation.tsx` already consumes (`:107-121`). One function, unit-tested, so neither product's types leak into the other.
2. **Primary target (available today):** `OutreachStation.tsx`'s third buyer slot — currently `name: "Search Fund (Profile TBD)"` at `:171` — renders through the adapter instead of its inline object. A placeholder name on screen during a demo reads as unfinished, so this also clears DEMO plan P2.2.
3. Add a **Capital-Verified via DealIQ** badge to that card. Presence is **unconditional**; only a *"verified in this session"* pulse is stateful (reads `scorta:dealiq:verified`), so jumping straight to `/buyers` still works.
4. **Secondary target (if DEMO P1.2 `/network` ships):** the same adapter feeds the shortlist; no new data, no new mapping.

5. **One-directional by design.** Data flows buy-side → sell-side. The sell-side card carries **no link back into DealIQ** and no indication that a separate app exists — a seller has no reason to be sent there.

**Data strategy.** Placeholder profile through the adapter. The identity itself is content and arrives later.

**Quality bar.** Adapter unit-tested for field mapping and for missing optional fields. Sell-side kanban behavior unchanged. No buy-side *component* imported into `components/scorta/` — only the adapter's plain-data output.

**Demo path.** DealIQ verify → presenter opens the seller workspace (separate tab or the landing page) → `/buyers` → the buyer is already in the seller's queue, capital-verified.

**Risks.** Editing a 78KB sell-side component. *Mitigation:* one object replaced by one function call; exercise the kanban afterwards.

**DoD.** Adapter test green · no "Profile TBD" string anywhere · `/buyers` fully functional.

---

### 14 · Landing-page buy-side entry (new) — *2.5h*

**Goal.** A visitor on the public landing page who is *buying*, not selling, has an obvious door into DealIQ — and it lands them in the buyer app, not in a dead end. With no in-app switcher, this is the **only** bridge between the two products, which makes it load-bearing for the demo.

**Dependencies.** Items 3 and 4 (the route and the buyer sign-in must exist). Build alongside item 4 — together they are the entry.

**Implementation steps.**
1. **Nav link** — add `{ l: "For buyers", href: "/dealiq" }` to `SNav`'s links array (`LandingPage.tsx:1006`). The array feeds both desktop and mobile menus; confirm the mobile sheet renders it and that `scrollToSection` is bypassed for real routes (it currently `preventDefault`s every link — route links must use `<Link>`, not the anchor handler).
2. **Hero secondary line** — beneath the CTA row (`:1345-1355`), under the *"Free assessment. No login."* microcopy: **"Buying a business, not selling? See DealIQ →"** as a text link in `C.sky`. Quiet, not competing with the primary CTA.
3. **Buy-side band** — a new `SBuySide()` section mounted between `SProductSurfaces` (`:2648`) and `SRoadmap` (`:2929`):
   - Eyebrow *"The other side of the table"*, headline, and one-sentence positioning.
   - Three feature tiles matching the product's actual surfaces — screen any listing in seconds · challenge the seller's add-backs · model SBA returns and DSCR — each with the same card treatment used by `SProductSurfaces`.
   - Primary CTA → `/dealiq`; secondary text link → the assessment for anyone who clicked wrong.
   - Uses `C.sky` / `C.lav` from the landing page's local palette so the band reads buy-side and matches the app accent decision (§2). No new colors.
4. **Footer** — a DealIQ link in `SFooter` (`:3078`).
5. Reuse the existing reveal hook (`useReveal`) so the band animates in like every other section.
6. Every entry points at `/dealiq` — the app's own front door handles the signed-out case via item 4. The landing page never links to `/login`.

**Data strategy.** Copy is placeholder, in the component for now (this file is content-heavy by nature); marked with a `TODO(content)` comment so the content pass finds it.

**Quality bar.** Mobile menu renders the new link and closes on navigation. No CLS on the hero. Band is responsive at 375px, 768px, and 1440px. The landing page bundle must not import anything from `lib/dealiq/` — keep the marketing page free of app-side code.

**Demo path.** Public landing → *"Buying a business, not selling? See DealIQ →"* → `/dealiq` → (buyer sign-in if signed out) → the pipeline, where the partner sees the buyer's view and the surfaces available to them.

**Risks.** Editing a 117KB landing component. *Mitigation:* one new section function plus three small insertions; no restructuring. The band competes with the seller CTA. *Mitigation:* the hero line stays quiet and the band sits below the product surfaces — a seller has already converted by then.

**DoD.** Signed-out click lands in the DealIQ pipeline after sign-in · nav/hero/band/footer entries all navigate · landing page renders unchanged above the new band · responsive at three widths.

---

## 4. Build order

**Serial spine (solo build):** 1 → 2 → 3 → 4 → 14 → 5 → 6 → 7 → 8 → 11 → 13 → 9 → 10 → 12.

Rationale for the two deviations from the product plan's order: **items 4 and 14 sit in Wave 1** because together they are DealIQ's front door — an app nobody can reach gets demoed by URL-typing, and entries built late get designed around. **Items 11 and 13 jump ahead of 9, 10, 12** because Capital Verification plus the handoff are the two-sided claim and cost four hours combined; Diligence, LOI, and Flow are elaboration.

**If parallelizing (2–3 people), three clean streams after item 1:**

| Stream | Items | Touches | Conflicts |
|---|---|---|---|
| **A · Engines & API** | 2, then both API routes (5a, 7b) | `lib/dealiq/*`, `app/api/dealiq/*` | none |
| **B · Shell, entry & landing** | 3, 4, 14, 11 | `components/dealiq/*`, `components/shared/*`, `LandingPage` | `LandingPage.tsx` only |
| **C · Surfaces** | 5, 6, 7, 8 → 9, 10, 12 | `components/dealiq/*Panel` | consumes A's exports |

Note what stream B no longer touches: **`AppShell.tsx` is not modified by this sprint at all.** The only sell-side file that changes is `OutreachStation.tsx`, in item 13.

Stream C is blocked on A's signatures — so **write item 1's types and the three engine signatures first (~45 min), commit, then fan out**. Item 13 comes last; it needs 1 and 11.

**Commit discipline.** One commit per item; build green at every commit (`pnpm typecheck && pnpm lint && pnpm exec vitest run lib/dealiq`).

---

## 5. MVP cut line

If time compresses, ship **items 1, 2, 3, 4, 14, 5, 6, 7** — roughly 2.5 days. That is the whole thesis: a buyer arrives from the landing page, pastes a listing, gets a verdict, and watches the seller's add-backs come apart.

Cut order beyond that:

1. **12 · Certified Flow** — cut first; the trade statement on the verify page already carries the claim.
2. **10 · LOI Drafter** — cut second; the negotiation block on the recast panel closes the loop verbally.
3. **9 · Diligence Pack** — cut third; if it goes, keep the red-flags strip and drop it into the Screen Score panel (~30 min).
4. **8 · Returns Model** — last thing to cut before the MVP line. If it must go, surface a single DSCR figure on the Screen Score panel.

**Never cut:** the data seam discipline (§1), the engine tests (item 2), the buyer entry (items 4 + 14 — without them the app has no door), or item 13's adapter, which is ninety minutes and is the closing shot.

**Degrade-in-place** rather than cutting: Reverse Recast without the streamed memo is 80% of the value at 60% of the build. Deal Inbox with fixture-only ingestion loses the live-LLM claim but nothing visual.

---

## 6. Integration & QA pass

Run end-to-end on the **deployed URL**, not just localhost.

**Build gates**
- [ ] `rm -rf .next && pnpm typecheck` clean
- [ ] `pnpm lint` clean (zero errors; warning count no worse than before the sprint)
- [ ] `pnpm prettier` satisfied
- [ ] `pnpm exec vitest run lib/dealiq` green
- [ ] `pnpm build` succeeds

**Data-seam integrity (this is what proves content can land later)**
- [ ] `grep -rnE '\$[0-9]' components/dealiq/` returns nothing
- [ ] `grep -rn "@/lib/persona" lib/dealiq/ components/dealiq/` returns nothing
- [ ] Every file in `lib/dealiq/data/` carries the placeholder banner
- [ ] Swapping one seed value (change an ask, a name, a score) propagates everywhere with no other edit
- [ ] Engine tests pass with `lib/dealiq/data/` untouched — no test imports it

**Standalone-app integrity**
- [ ] `grep -rn "dealiq" components/scorta/AppShell.tsx` returns nothing — the seller workspace has no door into DealIQ
- [ ] `grep -rn "components/scorta" components/dealiq/` and `grep -rn "components/dealiq" components/scorta/` both return nothing
- [ ] DealIQ renders no station rail, no CASE strip, no Deal Clock, no agent gutter
- [ ] Signing out of DealIQ returns to `/dealiq/signin`, never `/login`

**Flow, clicked in order**
- [ ] Public landing → "For buyers" nav link, hero line, band CTA, and footer link all navigate
- [ ] Signed-out click → `/dealiq/signin` → sign in → lands on `/dealiq`
- [ ] Signed-out deep link to a deal URL → sign-in → lands on that deal (not the pipeline)
- [ ] `safeDealIqPath` rejects `//evil.com`, `https://evil.com`, `/\evil.com`, encoded variants, and `/dashboard`
- [ ] `/dealiq` pipeline renders with the focus deal absent
- [ ] Deal context bar: prev/next stepper and `[` / `]` move between deals; close returns to the pipeline
- [ ] `/dealiq/screen` → sample chip → log streams → card lands
- [ ] Pipeline picks up the screened deal; counters move; survives a hard refresh
- [ ] `?tab=score` → dial animates → verdict + conditions render
- [ ] `?tab=recast` → ledger counts up → row expands → memo streams → accept gate signs
- [ ] `?tab=returns` → slider at both extremes → all four scenarios → no NaN
- [ ] `?tab=diligence` → ranking, filters, empty state, copy-to-clipboard
- [ ] `?tab=loi` → approve → card moves and persists
- [ ] `/dealiq/verify` → drop a file → badge → **no network request in devtools**
- [ ] `/dealiq/flow` → sorted by match → locked card behavior → CTA back into the Inbox
- [ ] Seller workspace (separate tab) → `/buyers` → adapted buyer renders, no "Profile TBD", no link back to DealIQ
- [ ] Every sell-side station still loads (`/dashboard`, `/connect`, `/ingestion`, `/recast`, `/risk`, `/boardroom`, `/documents`, `/vdr`, `/lenders`, `/buyers`, `/case`)

**Resilience & quality drills**
- [ ] `ANTHROPIC_API_KEY` unset → Inbox still lands a card; memo still renders
- [ ] Offline mid-screen → error state, no hang, no console error
- [ ] Refresh on every DealIQ route → no hydration warnings, no unstyled flash
- [ ] Back/forward through `?tab=` → correct tab, no double-animation
- [ ] Keyboard-only pass through global bar, deal stepper, tabs, slider, drop zone, drawers
- [ ] Landing page responsive at 375 / 768 / 1440
- [ ] Zero console errors across the whole run

---

## 7. What not to build

- **No content authoring.** Names, figures, schedules, listing copy, and buyer identities are a separate pass. If a component needs a value that doesn't exist yet, add it to `lib/dealiq/data/` as a placeholder — do not invent a fact inside a component.
- **No listing scraper.** URLs resolve to fixtures or ask for pasted text. No fetching, no HTML parsing.
- **No PDF pipeline.** The Inbox accepts pasted text this sprint.
- **No file storage.** Capital Verification reads a `File` in the browser and discards it. No bucket, no upload, no server receipt.
- **No real POF/KYC verification.** No bank APIs, no identity checks, no SBA integrations.
- **No DealIQ database work.** No tables, no migrations, no RLS, no Drizzle schema. Session state lives in `sessionStorage`.
- **No product switcher, and no link of any kind from the seller workspace into DealIQ.** They are separate applications; a seller is not a buyer. The presenter moves between them via the landing page or a second tab.
- **No shared shell, rail, or navigation component between the two apps.** Shared design language, yes; shared chrome, no.
- **No auth hardening beyond `safeDealIqPath`.** No buyer signup, roles, or multi-tenancy — one Supabase account serves both apps in the demo, and role separation is explicitly out of scope. (`safeDealIqPath` is in scope only because deep-link sign-in requires a redirect param, and an unvalidated one is a real vulnerability.)
- **No outbound anything.** No email, no Resend, no webhooks. "Send LOI" is an in-app state change and a toast.
- **No payments or subscription gating.**
- **No NDA or binding legal content.** The LOI is a non-binding draft for counsel review.
- **No new palette, component library, or AI provider.**
- **No changes to `AppShell`, `IngestionStation`, `RecastStation`, or the sell-side stations.** The only sell-side files this sprint touches are `OutreachStation.tsx` (item 13, one object) and `LandingPage.tsx` (item 14, additive sections).
- **No editing applied migrations, no service-role keys, no `process.env` outside `env.mjs`.**

---

## 8. Handoff spec for the content pass

When names and numbers get authored, this is the complete list of what they must supply — and the only files they should need to touch:

| File | Supplies |
|---|---|
| `data/buyer.ts` | Buyer identity, firm, committed capital, verification method + date, pool rank, mandate (industries, geographies, EV band, SDE floor) |
| `data/pipeline.ts` | 12 deals (name, industry, geography, ask, claimed SDE, score, verdict, stage, days in stage, last agent action, kill reasons) + funnel counters |
| `data/deal.ts` | Focus deal header facts · claimed add-back lines with documentation quality / business-use shares / role splits · concentration + owner-dependency inputs · comp multiple band · financing overrides |
| `data/flow.ts` | Certified listings with the fields `matchScore` consumes + pre-market dates |
| `data/diligence.ts` | Question bank with categories, kill-speed ratings, and `sourceFinding` tags |
| `data/copy.ts` | Ingestion log script · fallback challenge memo · verification trade statement + pool stats · sample listing text · buyer sign-in positioning line |
| `lib/ai/prompts.ts` | Final wording for the extraction and narration prompts |
| `LandingPage.tsx` | The `TODO(content)` strings in the buy-side band |

Everything else — layout, interaction, engine rules, tests — should be untouched by that pass. If it isn't, the seam in §1 was violated somewhere, and that's the bug to fix.

---

## 9. Open decisions for the owner

1. **The DealIQ IA** (item 3). Recommended: global top bar with four destinations + a deal context bar with a prev/next stepper — built for triage, and structurally unlike the seller's station rail. The alternative is a slim icon rail on the left; it survives more destinations later but reads closer to the sell-side today. This decision shapes every screenshot, so make it before item 3 starts.
2. **How the presenter moves between products during the demo.** With no switcher, the options are a second browser tab (fastest, invisible to the audience) or a trip through the public landing page (tells the two-product story out loud, costs ~5 seconds). Recommended: second tab for the live demo, landing page when the story needs telling.
3. **Where item 13 lands.** Recommended: `OutreachStation`'s third buyer slot today, with the adapter ready for `/network` if DEMO P1.2 ships. The alternative is building `/network` first — a separate ~5h item on the sell-side plan.
4. **Whether DealIQ eventually needs its own copilot.** The seller workspace has CASE; the buyer app deliberately ships without one this sprint. If a partner expects an agent to talk to on the buy side, that is a Wave-3 stretch reusing the `/api/case/chat` pattern with a buy-side system prompt (~3h).
5. **Live LLM before content exists.** Recommended: build the plumbing now with placeholder prompts — the fallback contract is the hard part and it is content-independent; sharpen the wording in the content pass.
