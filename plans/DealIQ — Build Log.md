# DealIQ — Build Log & Decision Record

> Running record for the DealIQ sprint. The [Execution Plan](./DealIQ%20—%20Execution%20Plan.md) says
> *what to build*. This document records *what was decided while building it*, and why — so a
> decision made in item 1 is not re-litigated in item 8, and an agent picking up item 9 cold does not
> have to reverse-engineer the contract from the code.

**Read order for anyone joining this build:** `.claude/CLAUDE.md` → `DealIQ — Execution Plan.md` →
this document → the code.

---

## How to use this document

- **Append, don't rewrite.** History is the point. If a decision is reversed, add a new entry saying
  so and mark the old one `SUPERSEDED` — do not delete it.
- **Every completed item gets a section** under [Item log](#item-log): what was built, what was
  decided, what was deliberately deferred.
- **Anything that binds a future item** goes in [Standing decisions](#standing-decisions) with the
  item number that established it. That section is the short read if you only have two minutes.
- **Repo gotchas** that cost time go in [Repo facts](#repo-facts-learned-the-hard-way) so they cost
  time exactly once.
- **Never record a business fact here.** Names, figures, and copy live in `lib/dealiq/data/` behind
  the placeholder banner. If a number appears in this document it is illustrative and explicitly
  labelled as such.
- **Keep entries short.** Item-1's entry is longer than any future one should be. A new item adds a
  status row, any *new* standing decisions (one or two lines each), and a ≤6-line item-log entry.
  This document is loaded into agent context — length is a real cost.

---

## Status

| # | Item | Est. | Status | Commit |
|---|---|---|---|---|
| 1 | Data layer & types | 2h | ✅ **Done** | `8adcf6e` |
| 2 | Engines: `reverseRecast` · `returns` · `screenScore` (+ Vitest) | 4h | ✅ **Done** | `1e13244` |
| 3 | Standalone app shell & IA | 4h | ✅ **Done** | `3ea5aca` |
| 4 | Buyer sign-in & standalone entry | 2h | ✅ **Done** | `f299e58` |
| 14 | Landing-page buy-side entry | 2.5h | ✅ **Done** | — |
| 5 | Deal Inbox | 4h | ✅ **Done** | — |
| 6 | Screen Score | 4h | ✅ **Done** | — |
| 7 | Reverse Recast *(highest polish budget)* | 6h | ⬜ | — |
| 8 | Returns Model | 5h | ⬜ | — |
| 11 | Capital Verification | 2.5h | ⬜ | — |
| 13 | Cross-product handoff seam | 1.5h | ⬜ | — |
| 9 | Diligence Pack | 3h | ⬜ | — |
| 10 | LOI Drafter | 4h | ⬜ | — |
| 12 | Certified Deal Flow | 2.5h | ⬜ | — |

Build order is the plan's serial spine: **1 → 2 → 3 → 4 → 14 → 5 → 6 → 7 → 8 → 11 → 13 → 9 → 10 → 12.**

**Green-build baseline at each commit:** `pnpm typecheck` · `pnpm lint` · `pnpm exec vitest run lib/dealiq` ·
`pnpm exec prettier --check "lib/dealiq/**/*.ts"`.

---

## Standing decisions

Decisions that bind every item after the one that made them. Item number in brackets.

### Architecture & boundaries

1. **`lib/dealiq/` imports nothing from the repo outside `lib/dealiq/`.** [1]
   Stricter than the plan's "no `@/lib/persona`" gate, and it enforces §2's *no component imports
   across products* rule at the lib layer too. Enforced mechanically by
   `lib/dealiq/__tests__/data.structure.test.ts` — a repo-internal specifier (`@/…`) that does not
   start with `@/lib/dealiq/` fails the suite. Third-party packages and node builtins are
   unrestricted. **Consequence:** when items 5 and 7 add API routes, the *route* may import
   `@/lib/ai`, `@/lib/logger`, and `@/env.mjs` — but nothing under `lib/dealiq/` may.

2. **`lib/dealiq/pipeline.ts` exists, beyond §2's module list.** [1]
   The plan bans stored funnel counters but did not name a module to derive them in. Derivations
   (`countByStage`, `funnel`, `orderedDeals`, `dealPosition`, `adjacentDeals`) live here rather than
   in `data/`, which stays logic-free. `orderedDeals` is the canonical order — the board's card order
   and the deal context bar's "4 of 12" stepper are the same sequence by construction, so item 3 must
   bind the `[` / `]` shortcuts to it rather than re-sorting.

3. **All types live in `lib/dealiq/types.ts`, including engine I/O.** [1]
   `ReverseRecastInput/Result`, `ReturnsInput/Result`, `ScreenScoreInput/Result`, `LoiDraft`,
   `ListingMatch`, and `RankedDiligenceQuestion` are already declared. Engine modules **implement
   against** these types; they do not declare their own. This is what lets streams B and C fan out
   before stream A finishes.

4. **`navigation.ts` and `format.ts` export values only, never types.** [1]
   `DealTabKey`, `PipelineStage`, and friends are in `types.ts`; `navigation.ts` imports them. Keeps
   the "one type module" DoD true and avoids an import cycle.

### The data seam

5. **`DealSeed` is the unit of deal content.** [1]
   One object in `data/deal.ts` carrying `card` + `addBacks` + `occupancy` + `risk` + `compMultiple` +
   `historyWindowYears` + optional `financing` overrides. A seed carries **claims and facts only** —
   never a defensible SDE, fair value, score, or verdict. A test greps the serialized seed for those
   keys and fails if one appears.

6. **The focus deal is absent from `data/pipeline.ts`.** [1]
   It arrives during the demo when the Inbox screens it and writes `scorta:dealiq:screened`, so the
   board *visibly gains* a card. Item 3's pipeline surface and item 5's success path both depend on
   this; a structural test asserts the id is not in the pipeline list.

7. **The sample listing is built from the seed, not typed.** [1]
   `buildSampleListing(seed)` in `data/copy.ts` interpolates the fixture's own figures, so the
   listing text a buyer pastes can never drift from the deal it represents. The content pass rewrites
   the prose *around* the interpolations and must not replace them with literals.

8. **The ingestion log script states no figure.** [1]
   Unlike the sell-side log (`IngestionStation.tsx`, which hardcodes `"Detected: $120,000 owner
   salary"`), `INGESTION_LOG` describes actions only. A log line asserting a total would be a
   hand-typed number on screen and would silently contradict the seed the moment an add-back changed.
   A test enforces it (`expect(line.text).not.toMatch(/\$\s?[\d.]/)`).

9. **`LogLine.accent` is a `boolean`, not `"mint"`.** [1]
   Shape-compatible with the sell-side script so it is authored the same way, but mint is the
   sell-side's signature and never appears in DealIQ. `components/shared/StreamingLog.tsx` (item 5)
   maps `accent: true` → `--dq-accent`.

10. **Engine tests never import `lib/dealiq/data/`; one seed-integrity test does.** [1]
    `format.test.ts`, `navigation.test.ts`, and `pipeline.test.ts` use synthetic fixtures declared in
    the test file and survive a total content swap untouched. `data.structure.test.ts` is the single
    deliberate exception and asserts **only structure** — uniqueness, union membership, internal
    consistency, banner presence — never a value. **Item 2's three engine test files must follow the
    first pattern.**

### Presentation

11. **`format.ts` pins `en-US` on every `Intl` formatter.** [1]
    `Intl` defaults to the runtime locale, which differs between the Node render and the browser
    hydrate — a hydration mismatch on any figure rendered from a server component.

12. **Non-finite renders as an em dash (`—`), never `NaN` or `Infinity`.** [1]
    Item 8's slider extremes and scenario boundaries cannot put `Infinity` on screen even if an
    engine guard is missed.

13. **Shares are 0-1 decimals everywhere.** [1]
    `topCustomerShare: 0.34`, not `34`. `formatPercent()` multiplies. The only 0-100 values in the
    system are *scores*.

14. **Verdict and band → colour is one exported function each.** [1]
    `verdictAccentVar()` and `bandAccentVar()` in `format.ts`. The score panel, deal context bar, and
    pipeline board all call them, so a verdict cannot render in two different colours. `PURSUE` →
    `--dq-accent` · `DIG` → `--gold` · `PASS` → `--crit`. A test asserts the three are distinct and
    none contains `mint`.

15. **Seeded dates, never `Date.now()`.** [1]
    `FLOW_AS_OF` in `data/flow.ts` is the reference "now" the pre-market countdown measures against,
    so the feed shows the same days remaining forever instead of quietly decaying to "released".
    Item 12 must derive from it.

---

## Engine semantics locked by item 1's types

Item 2 implements these; the shapes in `types.ts` already commit to them. Where a threshold is
listed as *proposed*, item 2 owns the final number but must export it as a named constant.

| Rule | Input fields | Semantics |
|---|---|---|
| **Role split** | `roleVacatedShare` (0-1) | Accept `annualAmount × roleVacatedShare`. A buyer who has to re-hire the work has not saved the salary. |
| **Mixed use** | `businessUseShare` (0-1) | Accept `annualAmount × (1 − businessUseShare)`. The business-use portion is a real cost and stays in. **Note the inversion** — the field is the share that *serves the business*, i.e. the non-addable part. |
| **Documentation** | `documentation` | *Proposed:* `verified` → no haircut · `partial` → 50% haircut · `none` → reject. |
| **Replacement cost** | `replacementCost` | Emit an `omitted_cost` line for `replacementCost − acceptedCompPortion` when positive. |
| **Reserve** | `recurredYears`, `recurringAnnualAverage`, `historyWindowYears` | A "one-time" expense that recurred in ≥2 of the window years: **accept the claim** (it did occur that year) **and** emit an `omitted_cost` line for `recurringAnnualAverage`. This is the plan's literal wording and it avoids the double-count that rejecting *plus* reserving would produce. It also reads better on screen: *"✓ the repair happened — ✗ and it happens every year."* |
| **Occupancy** | `OccupancyInput` | Emits a `RecastFlag` (+ an optional scenario line), **not** a base adjustment. The occupancy scenario in the Returns model is where it is priced. |

**Invariants item 2 must hold:**

- `claimedSde − totalAdjusted === defensibleSde`
- every `RecastLine.adjusted` is non-negative
- `omitted_cost` lines carry `claimed: 0` and `accepted: 0` — the seller claimed nothing
- line totals equal header totals
- `yearsToPayback` is `number | null` — never `Infinity`; `null` means the deal never recovers
- weights sum to 1; scores clamp to 0-100

**Sanity anchor, not a test expectation.** With the current placeholder seed the focus deal lands
around a **~4× implied multiple on defensible SDE against a 2.0×–3.0× comp band**, i.e. a large
negotiation delta and a `DIG`-to-`PASS` score. That is a deliberately vivid demo, and it is
*illustrative only* — **no test may assert it**, and the content pass will move it. If item 2's
engines produce something in that neighbourhood the wiring is probably right; if they produce a
1.0× multiple, something is inverted.

---

## Repo facts learned the hard way

- **`tsconfig.json` targets `es5`.** `for…of` over an iterator and `String.matchAll()` fail
  `tsc` with TS2802 (`--downlevelIteration`). Use an `exec` loop or `Array.from()`. **Vitest does not
  catch this** — esbuild transpiles happily and the test passes; only `pnpm typecheck` fails. Always
  run typecheck before believing a green test run.
- **ESLint `sort-imports` is an `error`** with `ignoreCase: true`, `ignoreDeclarationSort: true`.
  Named members must be alphabetised case-insensitively **within** a declaration, and `type X` sorts
  by its name (`type Verdict` before `VERDICTS`, since a prefix sorts first). Declaration order is
  handled by `import/order`, which is only a *warning*.
- **`import/order` groups are `external → builtin → internal`.** So `vitest` comes **before**
  `node:fs`. All `@/…` paths are one internal group, alphabetised.
- **Prettier:** no semicolons, `printWidth: 120`, `trailingComma: "es5"`, 2-space tabs. Run
  `pnpm exec prettier --write` on new files before committing — it reflows long string properties and
  will otherwise show up as a diff later.
- **Lint baseline: 13 pre-existing warnings, 0 errors.** The QA gate is "zero errors; warning count no
  worse than before the sprint". Check with `pnpm lint; echo $?`.
- **Package manager is `pnpm` only.** Never `npm` / `yarn`.

---

## Item log

### Item 1 — Data layer & types ✅ `8adcf6e`

**Built.** `lib/dealiq/types.ts` (single type module) · `lib/dealiq/data/{buyer,pipeline,deal,flow,diligence,copy}.ts`
(all placeholder content, banner-marked) · `lib/dealiq/navigation.ts` · `lib/dealiq/pipeline.ts` ·
`lib/dealiq/format.ts` · four test files, 102 tests.

**Seed shape.** Buyer + mandate · 12 pipeline deals across four stages (3 sourced / 6 screened /
2 diligence / 1 LOI — heavy at screened, thin at LOI, three killed deals visible with reasons) ·
the focus deal's 6 claimed add-backs, exercising all six challenge rules with two claims left
intact · 6 certified listings with mixed mandate fit · a 27-question diligence bank covering all six
categories and tagging every promotable recast rule · log script, fallback memo, and per-surface copy.

**Decisions made here:** standing decisions 1–15 above, plus the engine semantics table.

**Deviations from the plan, and why:**

- *Added `lib/dealiq/pipeline.ts`* — see standing decision 2.
- *Added `DealSeed` to `types.ts`* — the plan's item-1 step 2 implies one but names no type.
- *Strengthened the persona QA gate into a whole-directory import gate* — see standing decision 1.
  The plan's literal gate (`grep -rn "@/lib/persona" lib/dealiq/`) still returns clean.
- *Split the structural test from the engine tests* — the plan asks for a structural test of the seed
  in item 1 **and** forbids tests from importing `data/` in §1/§6. Both hold: one file imports data
  and asserts only structure; the rest are content-free. See standing decision 10.
- *Diligence question wording is real, not provisional-marked.* The questions contain no names,
  figures, or verdicts — they are trade craft, not facts about a fictional business, so there is no
  risk of one shipping unnoticed as a fabricated claim. Their **tags** (`category`, `killSpeed`,
  `sourceFinding`) are what item 9's ranking depends on and are the part the content pass should
  scrutinise. Every other data file uses obviously provisional naming (`Placeholder Holdings`,
  `Sample Dental Partners`, round figures).

**Deferred to later items:** nothing. Item 1 is closed.

### Item 2 — Engines ✅

`reverseRecast.ts` · `returns.ts` · `screenScore.ts` + three test files. 191 tests total, green.

**New standing decisions:**

16. **Acceptance rules compose multiplicatively**; the row names whichever reduced the claim most.
    Replacement cost and reserve emit their own `omitted_cost` lines instead of reducing acceptance.
17. **Debt service is steady-state** — `annualDebtService === monthlyDebtService × 12`. Seller-note
    standby shows in the segment's terms string, not in a year-one figure that would disagree with
    the monthly number beside it.
18. **`applyScenario(input, scenario, uncoveredOccupancy)`** is how item 8 drives the four chips —
    one engine, four input sets, no UI branching.
19. **Owner-dependency coefficients are deliberately gentle.** An owner-operated business is
    *expected* to be owner-dependent; a typical one must land low without pinning at 0, or the axis
    stops telling deals apart.

### Item 3 — Shell & IA ✅

Route group `app/(dealiq)/` (public layout → `(workspace)` guard), `DealIQShell` (56px top bar, four
destinations, Screen-a-deal action, mandate chip, verified badge, buyer menu), `DealContextBar`
(stepper + `[` / `]` + five `?tab=` tabs), `DealIQSessionContext`, `PipelineBoard`, `analyze.ts`.
202 tests green; `pnpm build` clean; all six routes render, guard redirects, unknown deal id 404s.

**New standing decisions:**

20. **Inline styles + CSS-var tokens in `components/dealiq/`**, matching `components/scorta/`.
    CLAUDE.md points new standalone components at Tailwind, but every product surface in this repo is
    inline-styled and the plan explicitly borrows AppShell's injected-`<style>` pattern; a hybrid
    would be worse than either choice. Revisit only if the whole app moves.
21. **`?tab=` is read server-side from `searchParams`, not `useSearchParams`.** No Suspense boundary
    is needed and every tab is a real deep link. The plan's Suspense note is therefore moot.
22. **`lib/dealiq/analyze.ts` is the composition root** — `analyzeDeal(seed)` runs recast → returns →
    score in order and returns all three. Items 6-10 read one analysis so their numbers cannot
    disagree. `components/dealiq/usePipelineDeals.ts` is the matching merge for board + stepper.
23. **Never use a template literal for a `className`.** `prettier-plugin-tailwindcss` rewrites class
    strings inside them and ate a separating space. Build the string with an array + `join(" ")`.
24. **Item 4 partly landed here.** `BuyerSignIn` and `/dealiq/signin` exist and work, because the
    guard would otherwise 404. Item 4 is now just `nextPath.ts` + its tests, wiring `?next=`, and the
    landing-page entry.

**Not verified:** the visual pass (1280/1440, keyboard walk). The Chrome extension was not connected
and the repo has no demo credentials, so the signed-in surfaces were checked structurally — routes,
rendered content, zero server errors — with the guard temporarily bypassed locally, then restored.

**Noted for item 13:** `/network` now exists in the route table, so DEMO P1.2 shipped after the plan
was written. The adapter's secondary target is available.

### Item 4 — Buyer sign-in & entry ✅

`lib/dealiq/nextPath.ts` (`safeDealIqPath`) + tests (206 total green) · signed-out `/dealiq/*`
requests now redirect with `?next=` · `signin/page.tsx` validates it and threads the destination
through redirect and `BuyerSignIn`. Sign-out → `/dealiq/signin` already landed in item 3.
Verified live: `curl /dealiq/deal/x?tab=recast` → 307 to `/dealiq/signin?next=…` with full path+query.

**New standing decision:**

25. **The `?next=` redirect lives in root `middleware.ts`, not the workspace layout.** Layouts
    cannot see the requested path; middleware can. The layout guard stays as backstop (plain
    redirect, no `next`). Middleware imports `DEALIQ_ROOT`/`DEALIQ_SIGNIN_PATH` from
    `lib/dealiq/navigation` — safe because that module's imports are type-only. `?next=` is only
    ever consumed through `safeDealIqPath` (rejects `//`, absolute URLs, `\`, `:`, `..`, encoded
    variants, and any path outside `/dealiq`).

### Item 14 — Landing-page buy-side entry ✅

Four additive insertions to `LandingPage.tsx`, no restructuring: "For buyers" nav link (desktop +
mobile — the links array already routes `/`-prefixed hrefs through `<Link>`, bypassing the anchor
handler) · quiet hero line under the microcopy · `SBuySide()` band between `SProductSurfaces` and
`SRoadmap` (three tiles matching the product-surfaces card treatment, `C.sky`/`C.lav` accents,
`useReveal` classes, CTA → `/dealiq`, secondary link → `#exitiq`) · footer "DealIQ for buyers" link.
All copy `TODO(content)`-marked. No `lib/dealiq/` import in the landing bundle. Every entry points at
`/dealiq`; item 4's middleware handles the signed-out case.

### Item 5 — Deal Inbox ✅

`POST/GET /api/dealiq/screen` (Haiku `generateObject`, 6s abort → placeholder card + `provenance:
"fallback"` + HTTP 200) · `components/shared/StreamingLog.tsx` (copied from `IngestionStation`,
presentational, accent color as prop) · `DealInbox.tsx` (log mask, card reveals on log-done AND
response-resolved, writes `scorta:dealiq:screened`) · extraction prompt in `lib/ai/prompts.ts`.
Verified live: fallback path (200 + card), fixture-pinned live path (~2s), and arbitrary-text
extraction all work; bad body → 400; unknown URL → `needsText` guidance.

**New standing decisions:**

26. **`generateObject` takes a hand-written `jsonSchema`, not the zod object.** This zod/ai version
    pair trips TS2589 through the schema generic (`zodSchema()` too); zod stays as the runtime
    validator on the result. Also: Anthropic's structured-output schema support **rejects
    `maxItems`** — list caps go in the prompt, not the schema. Item 7's narrate route: take note.
27. **`StreamingLog` declares its own `StreamingLogLine` type** (structurally compatible with both
    products' scripts) so the sell side can adopt it without importing `lib/dealiq/types`.
28. **Fixture text is detected by `SAMPLE_LISTING_MARKER`** (exported from `data/copy.ts`); on a
    fixture match the route still calls the model but returns the seed card and logs any divergence
    — the fixture is the source document. `FIXTURE_LISTING_URLS` (same file) is the URL fixture set.

### Item 6 — Screen Score ✅

`components/shared/ScoreDial.tsx` (rAF sweep drives arc + number together, once per mount,
reduced-motion renders final state) · `ScreenScorePanel.tsx` (server component; sub-score rows mapped
off the engine array, conditions deep-link via `dealPath`, cross-product strip hidden until props
arrive, methodology drawer renders `WEIGHTS`/`VERDICT_BANDS` in a native `<details>`) · score tab
wired in `deal/[id]/page.tsx`. `pnpm build` clean.

**New standing decisions:**

29. **Non-focus deals get `ScoreSummary`, not the full panel.** The stepper visits every board deal,
    so the score tab must render for deals without a seed: recorded score + verdict for screened
    ones, a not-screened state otherwise. Items 7–10 need the same split — full surface for the
    focus deal, honest reduced state for the rest.
30. **Panel colors only via `verdictAccentVar` / `bandAccentVar`** — no verdict→color mapping was
    added in any component.

**Open for the owner (content, not code):** against the current seed the focus deal scores **~40 →
PASS**, driven by a 4.1× implied multiple against a 2.0×–3.0× comp band. Items 7–10 walk the buyer
through Returns → Diligence → LOI, which reads oddly on a deal the score says to kill. Fix is a seed
tweak in `data/deal.ts` (softer ask or less extreme concentration), **not** an engine or band change.
Flagged for the content pass; nothing is blocked.

---

## Open decisions for the owner

Tracking §9 of the execution plan. **Item 3 cannot start until #1 is answered.**

| # | Decision | Recommendation | Status |
|---|---|---|---|
| 1 | **DealIQ IA** — global top bar vs. slim left icon rail | Top bar | ✅ **Settled 2026-08-05 — top bar.** No rail is ever created. Item 3 builds the 56px global bar + deal context bar with prev/next stepper. |
| 2 | How the presenter moves between products during the demo | Second tab live; landing page when the story needs telling | ⏳ Open (no build impact) |
| 3 | Where item 13 lands | `OutreachStation`'s third buyer slot today, adapter ready for `/network` if DEMO P1.2 ships | ⏳ Open (blocks item 13 only) |
| 4 | Whether DealIQ needs its own copilot | Not this sprint. Wave-3 stretch reusing `/api/case/chat` with a buy-side system prompt (~3h) | ⏳ Open (out of scope) |
| 5 | Live LLM before content exists | Build the plumbing now with placeholder prompts; the fallback contract is the hard part and is content-independent | ✅ **Settled — proceeding** |

---

## Handoff to the content pass

Unchanged from execution plan §8. As of item 1, every file that pass needs to touch **exists and is
populated with shape-truthful placeholders**: `data/buyer.ts`, `data/pipeline.ts`, `data/deal.ts`,
`data/flow.ts`, `data/diligence.ts`, `data/copy.ts`. Still to be created by later items:
`lib/ai/prompts.ts` additions (items 5, 7) and the `TODO(content)` strings in `LandingPage.tsx`
(item 14).
