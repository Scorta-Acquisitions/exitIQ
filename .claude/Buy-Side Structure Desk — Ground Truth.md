# DealIQ — Buy-Side Structure Desk

**Ground truth. v1. 13 August 2026.**
Supersedes Plan v3 for the next 11 weeks. Plan v3’s broker SaaS, Passport, Instant Qualification, $129/listing, and Fannie/format thesis are **not this company**.

This document is the source of truth for product, engine, GTM, batch execution, and long-term vision. If a slide, landing page, or engineer plan disagrees with this file, this file wins.

**One-line:** DealIQ tells a Main Street buyer, from the CIM and financials they already hold and from *their* capital, whether a deal can be funded — at what price, with what stack, against which SBA rule set.

---

## 0. How to use this document

- **Founders:** Demo Day, pricing, kill tests, and what we refuse live here. Do not invent a second thesis.
- **Engineers:** §11 (code map) and §16–17 (pods + weeks) are the build contract. Engines are deterministic. LLMs extract and narrate. They never own the math.
- **Underwriter / ops:** §6–9 are the credit logic. Sign the rule pack; do not improvise in a report.
- **Counsel:** §12 is the legal posture. First-party tool. Not a credit decision. Not a loan commitment. Not attest.

Related code (today): `lib/dealiq/reverseRecast.ts`, `lib/dealiq/returns.ts`, `lib/dealiq/screenScore.ts`, `lib/dealiq/types.ts`, `lib/assessment/sba.ts` (toy — replace). Related plans: `plans/DealIQ — Product & Build Plan.md` (demo definition), `plans/DealIQ — Execution Plan.md` (what was built as demo). **This document is the production company.** The demo plans do not override it.

---

## 1. Locked thesis

A searcher looks at 50–200 listings a year. The deal dies when the debt cannot clear at the asking price under a stack the buyer can actually fund. Nobody computes that honestly until week ten of diligence.

**DealIQ computes it when the CIM hits the desk.**

The product is not a score of the listing. It is not a credential of the buyer. It is a **fundability map**: the region of price × structure in which *this* buyer can close *this* business on 7(a) (or cannot).

We sell to the person who repeats the work. We do not sell to the broker. We do not create a market standard. We do not gate a CIM.

---

## 2. What the company is

| Is | Is not |
|---|---|
| Buy-side SaaS for search funds, ETA, independent sponsors, self-funded operators buying sub-$5M | Broker tool, marketplace, Passport network, Fannie Mae for Main Street |
| Recast + SBA structure solver + fundability map | Cheap QoE, CPA attest, lender credit decision |
| First-party: buyer’s CIM, buyer’s financials, buyer’s cash | Third-party consumer report furnished to brokers |
| DealIQ brand (already piloted at $1,250) | “Bankable,” “verified,” “pre-approved,” “loan commitment” |

**Customer:** the buyer who already has the CIM under NDA (or public listing plus documents the broker sent them). Sub-$5M EV. Explicitly not large PE.

**Job to be done:** *At my cash, my salary need, and this CIM — does 7(a) clear at the ask? If not, at what price and what seller-note / standby / equity mix does it clear? If never, walk.*

---

## 3. What is refused (fatal Plan v3)

Do not rebuild these. They are not “later.” They are off.

- Day-one underwriting from public listing copy with **no** seller financials, sold as a verdict
- Instant Qualification / Plaid-before-CIM / ranked buyer inbox for brokers
- Auto-created Passport / pre-verified inbound as the thesis
- $129 per listing, 100-broker logo hunt, taking the brokerage offline as a GTM stunt
- Format-as-moat / Desktop Underwriter analog
- Lender fees on the same loan as a buyer-paid pack (13 CFR § 103.4(g))
- The word **bankable** on a landing page, pack, or Demo Day script
- Selling “the pair” to a broker

**Brokerage runoff:** existing sell-side engagements stay alive for cash. **Zero engineers.** Not the Demo Day company. Do not shut them for theater.

---

## 4. Hero product — the Fundability Map

The map is the product. Recast and the rules engine exist to drive it. Screen Score, diligence lists, and LOI draft are supporting surfaces, not the company.

### 4.1 What the buyer sees

One deal. Two axes. Colored regions. Three pins.

| Axis | Meaning |
|---|---|
| **X — Purchase price** | From a floor (e.g. 1.5× underwritable SDE) to a ceiling (ask + 15%, or 7(a) max) |
| **Y — Buyer cash at close** | Equity that actually leaves their account: injection + closing costs + working capital, or a simpler “cash they will write” slider with costs layered in |

**Regions (legend is the product language — use these words everywhere):**

| Region | Meaning |
|---|---|
| **Clears at lender-typical** | DSCR ≥ 1.25× on underwritable cash flow, stack is SOP-legal (injection, standby, 7(a) cap) |
| **Clears at SOP** | 1.15× ≤ DSCR < 1.25× — possible at some lenders, not the default screen |
| **Clears at 7(a) Small Loan floor** | 1.10× ≤ DSCR < 1.15× **and** the loan is in the Small Loan box; otherwise this region is not offered |
| **Restructure only** | Ask does not clear; a lower price and/or more seller note / longer standby does |
| **Does not clear on 7(a)** | No legal stack funds this buyer at any price they would pay. Show conventional / all-cash / walk |

**Pins:**

1. **Ask** — listing or CIM price  
2. **Buyer’s actual cash** — what they say they will bring (optional Plaid, first-party only)  
3. **Clearing price at 1.25×** — output of the structure solver at default floor  

**Headline verdict (exactly one):**

1. `CLEARS AS ASKED` — pin 1 sits in lender-typical under pin 2’s cash  
2. `CLEARS IF RESTRUCTURED` — show the cheapest change: cut price to $X, **or** seller note $Y on full standby, **or** more cash $Z  
3. `DOES NOT CLEAR ON 7(a)` — with the binding constraint named (DSCR, injection, citizenship, ineligible industry, 7(a) size cap, experience flag)

Never show a green region without naming the **rule pack version** and **effective date** that produced it.

### 4.2 Secondary outputs on the same page

- Capital stack at the selected point: SBA / seller note / buyer cash, dollars and percents, standby months  
- Cash to close vs cash they have (gap in dollars)  
- DSCR at 1.10 / 1.15 / 1.25 with a marker for which floor is active  
- Max supportable loan and max supportable price at the active floor  
- Stress toggles: transition (−10% SDE), stress (−25%), occupancy (market rent in) — already in `lib/dealiq/returns.ts` as scenarios  

### 4.3 What the map is not

- Not a probability of lender approval  
- Not a credit score of the buyer  
- Not a listing grade for a broker  
- Not comparable across buyers unless they share the same rule pack version and the same stack inputs  

---

## 5. Inputs — two files, both first-party

### 5.1 Deal file (from the CIM + financials the buyer already holds)

The buyer uploads or pastes. We do not scrape a seller’s books from a marketplace and call it underwriting.

| Input | Source | Required for map? |
|---|---|---|
| Asking price / offer price | CIM, listing, or buyer override | Yes |
| Claimed SDE / EBITDA / cash flow | CIM | Yes |
| Add-back schedule | CIM or buyer-entered | Yes for a pack; listing-only screen may run a **thin map** labeled as listing-copy |
| Tax returns / P&L / interim | Buyer’s NDA package | Required for **Structure Pack**; optional for seat thin-map |
| Debt schedule, rent, owner comp | Same | Pack |
| Industry, NAICS, entity, employees | CIM | Eligibility |
| Real estate in/out, lease term | CIM | Occupancy + 7(a) real-estate rules |
| Comp band (optional) | Buyer or our table | Fair-value context, not the map |

**Thin map vs Structure Pack:**  
- **Seat / thin:** listing + claimed SDE + buyer stack. Watermark: *Listing-copy. Not a recast.*  
- **Pack:** CIM + financials → three-column recast → map on **underwritable** cash flow. This is what pilots paid $1,250 for.

A thin map must never be exportable as a pack PDF.

### 5.2 Buyer file (their capital, not a Passport)

Held for the buyer. Never furnished to a broker as a ranked verdict.

| Input | Why it is on the map |
|---|---|
| Cash available at close | Y-axis; injection test |
| Source of cash (self-attested; optional read-only Plaid **to themselves**) | Gap vs required injection |
| Salary they need to draw | DSCR numerator (`SDE − buyer compensation`) |
| Working capital they will leave in | Cash to close |
| Target / max seller note they will ask | Solver constraint |
| Industry experience (years, self-attested) | SBA management flag, not a score |
| Citizenship / residency (self-attested, March 2026 rule) | 7(a) eligibility gate |
| Credit self-attestation (optional, coarse) | Disclaimer only — we do not pull a credit report in v1 |

Plaid, if used, is **first-party modeling aid**. Sharing a derived “verified liquidity ≥ $X” with a broker is a CRA. Do not build that export.

---

## 6. Three-column recast

Evolve today’s `claimed / accepted / adjusted` (`lib/dealiq/reverseRecast.ts`) into the credit language we will print.

| Column | Definition | Who uses it |
|---|---|---|
| **Claimed** | What the CIM / seller add-back schedule says | Negotiation, “they asked for this multiple on this number” |
| **Documented** | Amount that has a source line: tax return, bank deposit, payroll report, invoice, lease | What we will even discuss |
| **Underwritable** | Amount that survives SOP-shaped add-back rules: role split, mixed use, replacement cost, reserves, occupancy | **This is the only number the map runs on** |

Invariant (must be tested):

```
underwritableSde = claimedSde − Σ(claimed − underwritable) − omitted_costs
```

Same invariant as today’s `claimedSde - totalAdjusted === defensibleSde`. Rename `defensibleSde` → `underwritableSde` in the engine. Keep `defensible` out of customer copy if it sounds like attest.

### 6.1 Line rules (already in code — keep, do not replace with an LLM)

From `reverseRecast.ts`. Deterministic. LLM writes the prose around the number, never the number.

| Rule | Effect |
|---|---|
| Role split | Accept only the vacated share of owner comp |
| Mixed use | Personal portion add-backable; business-use stays in the cost base |
| Documentation | `verified` 100%, `partial` 50%, `none` 0% into **documented**; underwritable cannot exceed documented |
| Replacement cost | Omitted cost if re-hire > vacated comp |
| Reserve | Recurring “one-time” → annual reserve as omitted cost (do not double-count) |
| Occupancy | Flag + returns scenario; do not silently drop rent |

### 6.2 Unreported income (non-negotiable)

Same bright line as Plan v3, because packs will see cash businesses:

1. Intake never asks about unreported revenue.  
2. If volunteered, the analyst stops the topic and does not record it.  
3. Reports show documented figures only. Undocumented claims: *“not substantiated — excluded from underwritable cash flow.”* No characterization.  
4. The policy is public.

18 U.S.C. § 1014 / 15 U.S.C. § 645 are about false statements to federally insured lenders. We do not put a pack in a loan file as a representation of earnings. The pack is a **buyer workpaper**. Cover letter says so.

### 6.3 Provenance

Every dollar on a pack traces to a source line (PDF page, P&L account, CIM footnote). `sourceNote` already exists on `ClaimedAddBack`. Make it mandatory for packs. LLMs extract candidates; a human (ops analyst) accepts the line before a pack PDF generates, for the first 30 days of every customer and for every pack until week 8 quality is proven.

---

## 7. SBA rules engine — versioned by effective date

`lib/assessment/sba.ts` is a toy (0.9 × valuation, 10% down, 10.5% rate, industry denylist). **Do not ship the map on it.**

### 7.1 Contract

```
evaluate(deal, buyer, stack, atDate) → Eligibility + Constraints + DSCR inputs
```

- Rules are **data** (JSON/TS rule packs) keyed by `effectiveFrom` / `effectiveTo`.  
- Runtime reads the pack for `atDate` (default: today). Closing date can be set for “if this closes after March 2026 citizenship.”  
- **Never** hard-code a ratio, cap, or injection rule in a React component.  
- Policy moved three times in 2026. The engine is built for the fourth.

### 7.2 Packs to encode in week 1–3 (underwriter-signed)

| Pack ID | Effective | Contents |
|---|---|---|
| `sop-50-10-8` | 2025-06-01 | Baseline 7(a) change-of-ownership: injection, standby, size, ineligible types, CPA-in-lieu *for lenders* (we do not claim that in-lieu) |
| `citizenship-2026-03` | March 2026 | Citizenship / residency gate on the **borrower**. Self-attested. If fail → 7(a) region of the map is off; conventional/seller-note paths remain |
| `pn-5000-875701` | as published | 7(a) Small Loan DSCR 1.1×; SBSS prescreen sunset — we do not implement SBSS; we implement the DSCR floor |
| `pn-5000-876777` | supersedes prior | Encode only what the underwriter says changed |
| `pn-5000-879058` | 2026-07-04 | Cumulative-cap clarification. **7(a) individual max still $5M.** Irrelevant at $349k median but must live in the engine, not on a slide |

Exact notice text is the underwriter’s job in week 0. Engineers do not guess SOP paragraph numbers from memory.

### 7.3 Injection and seller notes (default v1 — confirm week 0)

These are the rules the map will enforce unless counsel/underwriter revises them in writing:

1. **Minimum equity injection 10%** of the total project (purchase + fees + WC as SOP defines “project”).  
2. **Seller note counts toward injection only if** it is on **full standby for the entire term of the SBA loan**, and **only up to 50% of the required injection**.  
3. Therefore **at least 5% must be genuine buyer cash**.  
4. A seller note that is **not** on full-term standby is debt. It counts in DSCR. It does **not** count as injection.  
5. Standby of 24 months (today’s `DEFAULT_FINANCING.sellerNoteStandbyMonths`) is **not** full-term standby. The solver must not treat a 24-month standby note as injection. Today’s demo defaults are **wrong for SOP** and will green-light illegal stacks. Fix in week 1.  
6. 7(a) maximum **$5,000,000**.  
7. Change-of-ownership eligible use; ineligible industries and special-use (passive real estate, etc.) gate the 7(a) region off.  
8. Management / experience: **flag**, not a silent fail, unless the underwriter says it is binary for that NAICS.  
9. We **never** call the output a loan commitment. Copy: *“Structure that meets these published rules at this DSCR floor. Approval is the lender’s.”*

### 7.4 What we do not encode in v1

- Full PLP vs GP processing differences  
- Franchise directory / SBA franchise matrix as a hard gate (flag “verify franchise” only)  
- 504 / USDA / conventional credit boxes (conventional = single “non-7(a)” path with buyer-set rate/term)  
- Buyer personal FICO as a live bureau pull  

---

## 8. DSCR floors

Three floors. The map draws all three. **Default screen is 1.25×.**

| Floor | Value | When it applies | How we talk about it |
|---|---|---|---|
| 7(a) Small Loan | **1.10×** | Only if the loan is in the Small Loan box per the active pack | “SOP Small Loan floor — not most lenders’ box” |
| Broader SOP | **~1.15×** | Confirm exact ratio with underwriter; do not invent | “SOP coverage” |
| Lender-typical | **1.25×** | Default for `CLEARS AS ASKED` | “What a typical 7(a) shop wants to see” |

**DSCR definition we ship (must match `returns.ts` and the pack PDF):**

```
DSCR = (underwritableSde − buyerCompensation) / annualDebtService
```

- `buyerCompensation` is the salary the buyer will take, not a plug.  
- `annualDebtService` = SBA amortizing payment × 12 **plus** any seller note that is **not** on qualifying full-term standby.  
- Full-term standby seller note: **$0** in the DSCR denominator during the SBA term (and it may count toward injection per §7.3).  
- Occupancy / transition / stress scenarios adjust the numerator, not the floor.

`meetsDscrFloor` in code today is a single floor. Change to `dscrVsFloors: { smallLoan, sop, lenderTypical }` plus `activeFloor` (default `lenderTypical`).

Buyer may set `mandate.minDscr` (already on `Mandate` in `types.ts`). If they set 1.30×, the map’s “clears” region uses **max(lenderTypical, buyerMin)**.

---

## 9. Structure solver

`computeReturns` evaluates **one** stack. The solver searches the **legal** stack space and returns the map.

### 9.1 Decision variables

| Variable | Bounds |
|---|---|
| Price | Buyer min (optional) … ask × 1.15 (cap) |
| Buyer cash | 0 … buyer’s stated max |
| Seller note $ | 0 … seller-note max the buyer will request |
| Seller note standby | none / 12 / 24 / **full term** (full term is the only one that can count as injection) |
| SBA $ | residual of price − cash − note, capped at $5M and eligible use |

Closing costs and WC are functions of price (defaults: `closingCostsShare` 3%, `workingCapital` from buyer or $75k default — `DEFAULT_FINANCING`).

### 9.2 Objective (pick in this order, show all three)

1. **Clear the ask** at 1.25× with minimum buyer cash (searchers are cash-constrained).  
2. Else **minimum price cut** at 1.25× with their cash and a SOP-legal note.  
3. Else **minimum price cut** at 1.15×, labeled as SOP-not-typical.  
4. Else **no 7(a) solution.**

Also emit `maxPriceAtDscrFloor` at each floor (already inverted in `returns.ts` for a *fixed* share stack). The solver must **re-share** the stack as price moves, because injection is a percent of project, not a frozen 12%/15% mix. Today’s `equityShare: 0.12` / `sellerNoteShare: 0.15` demo defaults are a single point, not a solution.

### 9.3 Illegal stacks (hard reject)

The solver **must not** return:

- Seller note counted as injection without full-term standby  
- Buyer cash < 5% of project when using 7(a)  
- SBA > $5M  
- DSCR computed on claimed SDE rather than underwritable  
- 1.10× green on a loan that is not Small Loan  

If the demo currently greens a 24-month standby as if it were injection, that is a **product bug**, not a scenario.

### 9.4 Output object (pack + API)

```
FundabilityResult
  rulePackId, effectiveDate
  underwritableSde
  verdict: clears_as_asked | clears_if_restructured | does_not_clear_7a
  bindingConstraint: dscr | injection | sba_cap | eligibility | citizenship | cash_to_close | ...
  atAsk: ReturnsResult          // current ask, legal stack closest to buyer prefs
  clearing: {                   // if restructure
    price, stack, dscr, floorUsed, cashRequired, cashGap
  }
  maxPriceByFloor: { 1.10, 1.15, 1.25 }
  map: cells[]                  // discretized grid for the UI
```

Grid resolution: price step $25k (or 1% of ask), cash step $25k. Coarse enough to render, fine enough to negotiate.

---

## 10. Supporting surfaces (keep, demote)

DealIQ already has demo surfaces. Re-rank them.

| Surface | Role in this company | 11-week status |
|---|---|---|
| **Fundability Map** | Hero. New. | Ship week 2–4 |
| **Three-column recast** | Feeds the map | Evolve reverse recast week 1–3 |
| **Structure Pack PDF** | The $1,500–$2,500 SKU | Week 3–6 |
| Pipeline | Retention; many deals | Keep; persist to DB |
| Screen Score | Optional composite; **do not lead with PASS/DIG/PURSUE** as if it were financeability | Demote under the map; financeability is not a 20% sub-score |
| Diligence pack | Kill-order questions | Keep as pack appendix |
| LOI drafter | Terms from **clearing structure**, not from ask | Only after solver exists |
| Capital verification / certified flow | Plan v3 flywheel. **Off.** | Do not staff. Do not Demo Day. |
| Cross-product handoff to sell-side outreach | Deferred in build log. **Stays deferred.** | Avoids Passport-by-another-name |

---

## 11. Code map — what exists vs what to build

| Module | Today | 11-week target |
|---|---|---|
| `lib/dealiq/reverseRecast.ts` | Claimed/accepted/adjusted, six rules, unit tested | Add documented column; `underwritableSde`; source-line required on packs |
| `lib/dealiq/returns.ts` | One stack, one DSCR floor 1.25, 24mo standby default, `maxPriceAtDscrFloor` | Multi-floor; SOP-legal debt service; **fix standby≠injection** |
| `lib/dealiq/screenScore.ts` | 20% weight on financeability | Map is primary; score is optional |
| `lib/dealiq/types.ts` | `FinancingTerms`, `ReturnsResult`, `Mandate.minDscr` | `RulePack`, `FundabilityResult`, three-column line type |
| **`lib/dealiq/sba/packs/`** | Missing | Versioned JSON/TS packs + loader by date |
| **`lib/dealiq/structureSolver.ts`** | Missing | Search legal stacks; grid for map |
| `lib/assessment/sba.ts` | Toy eligibility | Do not import into DealIQ. New engine lives under `lib/dealiq/` (import wall) |
| Persistence | Session / placeholder data | Supabase: deals, files, recast lines, packs, billing |
| Extraction | Demo ingest route | Bought vendor (Plan v3 was right: never build the document layer) |
| Billing | None | Stripe: seat + pack |
| PDF | None | Pack PDF: three columns, map snapshot, stack, disclaimer, rule pack ID |

**Architecture rules (bind):**

1. `lib/dealiq/` still imports nothing outside itself except types it owns. Rule packs live *inside* `lib/dealiq/sba/`.  
2. LLMs extract and classify. Math is TypeScript.  
3. Vitest for solver, injection legality, DSCR, pack loader. A pack that greens an illegal stack fails CI.  
4. No `process.env` outside `env.mjs`.  
5. No model training on customer financials.

---

## 12. Legal, naming, first-party

### 12.1 What we are

A **buyer-side analysis tool**. The buyer is the customer. They already have the documents under the broker NDA’s advisor carve-out (counsel, accountants, lenders, advisors). We are their advisor for this purpose. We are not the lender’s designee. We do not file 8821.

### 12.2 Banned words (accountancy + credit)

Do not use: audit, review, examination, attest, assurance, compilation, **verification**, **bankable**, pre-approved, committed, guaranteed, credit decision, pre-qual letter (unless *the lender’s* letter, attached by the buyer).

Use: **score, findings, underwritable (defined), fundability map, structure that meets published SBA rules at this floor.**

### 12.3 FCRA / CRA

We do not furnish a consumer report to a broker. We do not rank buyers. We do not persist a Passport from a listing inquiry.

Optional Plaid is the buyer looking at their own cash. No “verified liquidity ≥ $X” export to third parties in v1.

If a buyer attaches our pack to *their* loan application, that is their document. Cover: *Not a credit decision. Not a commitment. Lender must underwrite.*

### 12.4 Two-master

**Buyer pays. Lender does not, on the same loan, in this company.** No $2,500 territory pipeline. No Form 159 as a business line. Packet the buyer carries to their own lender is still buyer-paid analysis, not referral.

### 12.5 Counsel in week 0 (three calls, not five)

| Counsel | Question |
|---|---|
| Accountancy | Naming. Pack as findings. Banned words. |
| Privacy | First-party CIM/Plaid retention, deletion, state financial privacy. |
| SBA | Confirm we are not an Agent under 13 CFR 103 if we take **no** lender money and do not refer. Confirm copy does not imply a credit decision. |

Securities / M&A-broker exemption: irrelevant if we are not brokering and not holding funds. Do not record a broker-or-lender identity. Brokerage runoff stays in the existing LLC until C-corp assignment is done.

---

## 13. Pricing, packaging, pilots

### 13.1 SKUs

| SKU | Price | What they get | Why they pay |
|---|---|---|---|
| **Searcher seat** | **$299/mo** (range we will test: $249–$499) | Unlimited thin maps, pipeline, solver on listing-copy, watermarked | Daily screening. Free tools do not run *their* cash against a stack. |
| **Structure Pack** | **$1,750** (range $1,500–$2,500) | 48h three-column recast + fundability map on underwritable SDE + PDF | They are about to bid or walk. One wasted month costs more than $1,750. |
| **Pilot grandfather** | Honor **$1,250** for the next pack for the three existing search funds; then standard pack | Do not punish the people who already paid | Convert them onto seats this week |

No free listing score as a public wedge. Turnstone / Biz Scorecard own that. We do not win a race to free.

Annual prepayments are not annualized on Demo Day. Pack revenue is a **separate line** from MRR.

### 13.2 Existing pilots (asset, not a footnote)

Three search funds, **$1,250 each**, DealIQ pilots. They are the design partners.

Week 0: put the fundability map (even spreadsheet + engineer) on **one live CIM they already have**. If they will not open a CIM, the company is fiction.

Do not add “capital-verified pool” or certified deal flow to their contract.

### 13.3 Who we do not sell

- Brokers (as the customer)  
- Lenders (as the customer)  
- Tire-kicker consumers who want to browse BizBuySell without a CIM  
- Large PE above our band  

---

## 14. Go to market

**Motion:** founder-led into communities of people who already screen deals.

| Channel | Use | Conflict check |
|---|---|---|
| The three pilots | Design partner, case study with permission | First |
| Searchfunder | Volume of self-funded + search | — |
| Acquisition Lab, Acquira | Operators in-program | Their software stack |
| SMB Deal Hunter, EBIT Community, r/search_fund, SMB Twitter | Content: anonymized map walkthroughs | — |
| Acquiring Minds | **Check** Live Oak / Oberle sponsorship before pitching as independent | Plan v3 flag, still valid |

**Pitch (do not mention brokers, Fannie, or Passports):**

> You already have the CIM. Free tools scored the listing. We recast the cash flow and show the price and structure at which 7(a) clears *your* down payment and salary — or we tell you to walk. Forty-eight hours. $1,750. The seat is for the other forty deals this year.

**Install:** upload CIM + financials, enter cash and salary, get a map. No CRM migration. No broker CC.

**Volume:** 15 searcher conversations per weekday until inbound exceeds it. Same founder cadence as Plan v3, different ICP.

---

## 15. Team — 10 engineers + specialists

Two technical founders. **10 founding engineers** on this product, not on broker GTM.

| Pod | Heads | Mission |
|---|---:|---|
| **A — Recast** | 3 | Extraction vendor, CIM/financials pipeline, three-column, source tracing, pack QA hooks |
| **B — Rules + solver** | 3 | Versioned SBA packs, DSCR floors, structure solver, fundability grid, CI fixtures for illegal stacks |
| **C — Map + workspace** | 2 | Fundability Map UI, pipeline persistence, pack PDF, seat UX |
| **D — Platform** | 2 | Auth, Stripe, file storage, retention/deletion, audit log, access control |

**Non-engineering (hire, do not fake):**

| Role | When | Why |
|---|---|---|
| Fractional SBA acquisition underwriter | Week 0 | Signs rule packs. Without this, the solver is fan fiction. |
| Ops analyst (recast) | Week 3 | Human accept on pack lines; 48h SLA |
| Counsel ×3 | Week 0 | §12.5 |

Founders: sales + underwriter sessions + Demo Day number. Not a fifth recast engineer.

---

## 16. Eleven weeks

**Wall number: seat MRR.** Second line: **collected pack revenue.** Never mix.

| Wk | Seat MRR | Packs (cum.) | Ships | Sales |
|---:|---:|---:|---|---|
| 0 | — | — | Counsel ×3. Underwriter signed. Income policy. Stripe. Rule-pack v0 in writing. Three pilots scheduled. Extraction vendor wired. | Convert 3 pilots to seats. 30-searcher list. |
| 1 | $900 | 3 | SOP injection/standby **bugfix** in `returns`. Rule-pack loader. Thin map on one stack. | 40 conversations. Pilots run a live CIM. |
| 2 | $2,400 | 6 | Fundability Map v1 (grid + three regions + pins). Multi-floor DSCR. | 8 paying seats (incl. pilots). |
| 3 | $4,500 | 10 | Three-column recast on uploaded CIM. Analyst on packs. | 15 seats. First non-pilot pack. |
| 4 | $7,500 | 16 | Solver searches legal stacks (not frozen 12/15). Persistence. | **Kill gate: 15 paid seats.** |
| 5 | $10,500 | 22 | Pack PDF with rule pack ID + disclaimer. Stress scenarios on the map. | 35 seats. |
| 6 | $14,000 | 30 | Structure Pack productized (SLA 48h). | **Kill gate: pack changes bid/kill ≥40% of packs.** |
| 7 | $17,000 | 38 | Onboarding, billing hygiene, reliability. | 50 seats. |
| 8 | $20,000 | 45 | Freeze new surfaces. Quality. | 60 seats. |
| 9 | $22,000 | 52 | Broker analytics **not in scope.** Searcher analytics: map usage, pack→decision. | Cluster: one searcher community, not one metro of brokers. |
| 10 | $24,000 | 58 | No new features. | 70 seats. |
| 11 | **$25,000** | **60** | Freeze. Demo Day. | **70–80 seats, 60 packs.** |

**Goal vs floor**

| | Floor | Goal |
|---|---:|---:|
| Paying seats | 40 | 70 |
| Seat price realized | $249 | $299 |
| **Seat MRR** | **$10k** | **$21–25k** |
| Packs collected | 30 | 60 |
| Pack revenue collected | $45k | $90–105k |
| % packs that change bid or kill | 25% | 40%+ |
| Thin-map → pack conversion | 8% | 15% |

This is **smaller than Plan v3’s $55k** on purpose. Lying about 100 brokers is how that plan died.

### 16.1 What 10 engineers actually ship, by week

- **Wk 1:** Pod B fixes injection/standby; pack loader; tests that 24-month standby ≠ injection. Pod A wires extraction vendor on one CIM. Pod C thin map UI on `computeReturns`. Pod D Stripe + auth.  
- **Wk 2–4:** Pod B solver + grid. Pod C map. Pod A three-column. Pod D DB.  
- **Wk 5–7:** PDF, SLA, quality.  
- **Wk 8–11:** Harden. No new product.

If Pod C builds Certified Deal Flow or Capital Verification, that is a **process failure**, not a feature.

---

## 17. Metrics and kill tests

**Order that matters:**

1. Net new **seat MRR**  
2. Pack collected revenue (separate)  
3. **% of packs that change price, structure, or walk** — if this is not material, we are a PDF mill  
4. Thin-map → pack conversion  
5. Median time to pack (target ≤ 48h)  
6. Solver used on ≥70% of deals that leave “sourced” (otherwise they are using us as a viewer)

**Kill tests (cash and behavior, not vanity):**

| Wk | Trigger | Action |
|---|---|---|
| 1 | 3 pilots will not put a real CIM on the map | Thesis is wrong for the people who already paid. Stop. Talk to them before writing more engine. |
| 2 | Illegal stack can still render green | Do not sell. Fix. This is a credit-integrity fail. |
| 4 | **<15 paying seats** | Seat WTP missing. Test $199 or pack-only. Do **not** go back to broker SaaS. |
| 6 | **<40% of packs change bid/kill/walk** | Recast is decoration. Deepen rules or kill the pack SKU. |
| 6 | Pack SLA > 72h median | Stop selling packs until ops catches up. |
| 8 | Thin-map → pack < 5% | Seat is a toy. Change onboarding or kill the seat. |
| Any | Unreported income recorded | Purge, retrain. Existential. |
| Any | Pack language implies a commitment or attest | Pull PDF until counsel rewrites. |

**Week 4 branch (decide, don’t drift):**

- Seats + packs working → stay on this document.  
- Packs working, seats dead → pack-only firm. Raise price. Drop $299. Still this company.  
- Seats working, packs dead → listing calculator. Probably not a VC company; say so.  
- Neither → do not resurrect Plan v3. Path 2 (CPA) is the only allowed pivot. Path 3 (brokerage factory) is cash backup with **no** new engineers.

---

## 18. Demo Day narrative (60 seconds)

Do not say: broker SaaS, marketplace, cheap QoE, AI wrapper, Fannie Mae, Passport, infrastructure for Main Street, bankable.

> Main Street buyers don’t lose deals because they can’t find listings. They lose them when the debt can’t clear. Free tools score the listing. Nobody runs the CIM against *their* cash and a legal 7(a) stack until week ten.
>
> DealIQ does it when the CIM hits the desk. We recast claimed cash flow into what’s documented and what’s underwritable, then map the prices and structures that clear 1.25× — or we tell them to walk.
>
> [N] searchers pay monthly. $[X] MRR. $[W] collected on structure packs. On those packs, [P]% changed the bid, the stack, or the decision to walk.
>
> We sell to the buyer who does this every week. We don’t sell to brokers, and we don’t pretend we’re the SBA.

**Q&A (prepared, true):**

- *Won’t they use Turnstone / Biz Scorecard?* Those score listings. We recast a CIM under a specific capital stack and print a legal-vs-illegal structure. That’s the paid layer.  
- *Isn’t this LoanBud?* LoanBud prequals the **business** for a lender network. We tell **this buyer** whether **this CIM** clears **their** injection. Different job. We do not route loans.  
- *Is this a credit decision?* No. Published rules + their numbers. The lender underwrites.  
- *Why won’t you sell to brokers?* Because gating their CIM is how you lose the lead, and a ranked buyer file is a CRA. We already killed that plan.  
- *What’s the ceiling?* Repeat buyers, then the pack they carry to their own lender, then (only with outcome data) better structure priors. Not escrow. Not a score the industry is forced to run.

---

## 19. Long-term vision (allowed rungs only)

Every rung has a trigger. **None is a batch input.** If it needs a license we do not have, it is not a rung.

| Next | Trigger | Why it is allowed |
|---|---|---|
| Pack the buyer carries to **their** lender (still buyer-paid) | 40+ packs/mo, zero lender money | Same customer, more of the job |
| CPA / searcher-firm white-label of the same engine | Path 1 seats working; CPAs asking | Repeat professional, first-party books — Path 2 as SKU, not a new thesis |
| Outcome log: which maps matched actual term sheets | 50+ packs with voluntary close/fail follow-up | Improves the solver; not a bureau |
| Conventional / 504 boxes as extra regions | Users asking after 7(a) map is trusted | Same product, more credit boxes |

**Not rungs:**

| Fantasy | Why it stays dead |
|---|---|
| Passport / pre-verified inbound | CRA + CIM gate |
| Broker ranked inbox | Same |
| Lender-paid pipeline + buyer packs on one loan | § 103.4(g) |
| Earnest money, escrow, seller-note origination | MTL / lending licenses |
| Transaction-liability insurance | No loss history, no carrier, no mandate |
| Form 1003 / DU analog | No GSE. SBA dropped even SBSS as a mandate |

**Ceiling we will say out loud:** a durable buy-side structure product for the people who buy Main Street companies for a living. Analysis + packs. If that is not a venture-scale outcome, we will not paper over it with Qualia.

---

## 20. Founder cadence

Daily 30 minutes: seat MRR first, pack revenue second, then “did a pack change a bid this week.”

Fifteen searcher conversations and five pack-follow-ups every weekday until inbound exceeds it.

Twenty-minute debrief within 24 hours of every Structure Pack — what the map said vs what they did.

Friday: kill-or-continue against that week’s gate. No extensions without a **new** test written down.

No fundraising theater during the batch. The round is a function of the number. No free seats counted as paid. No annualizing. No own brokerage as a DealIQ customer.

---

## 21. Week 0 — Monday

1. Book three counsel calls (§12.5).  
2. Sign the fractional SBA underwriter. First deliverable: injection / standby / DSCR floors in writing, including “24-month standby is not injection.”  
3. Publish unreported-income policy. Train pack script.  
4. Stripe: seat $299, pack $1,750. Grandfather three pilots.  
5. Two landing pages: DealIQ for buyers only. No broker page. No “bankable.”  
6. Convert three pilots to seats; schedule one live CIM each this week.  
7. Build the 50-searcher list (actively screening, not “interested in buying someday”).  
8. Wire extraction vendor. Instrument: seat conversion, pack completion, bid-change flag.  
9. Do **not** take brokerage offline. Do **not** staff engineers on it.  
10. Write rule-pack v0 as a checked-in fixture with tests, even if incomplete — empty pack that greens illegal stacks must fail CI.

---

## 22. Open questions (close in week 0, do not drift)

| # | Question | Default if unanswered by Friday week 0 |
|---|---|---|
| 1 | Exact SOP DSCR for non-Small-Loan 7(a) — 1.15× vs other | 1.15× SOP, 1.25× default screen |
| 2 | Small Loan size box (dollar cap) for 1.10× region | Hide 1.10× region until underwriter defines the box |
| 3 | Is buyer experience binary for our NAICS set? | Flag only |
| 4 | Pack SLA 48h vs 72h | 48h; stop selling if we miss |
| 5 | Seat $249 vs $299 vs $499 | Start **$299**; Monday ten-searcher ask |
| 6 | Plaid in v1? | **Off** until seat exists without it. Add later as optional first-party |

---

## 23. The check

Every product, hire, and sentence must pass:

> Does this help a repeat Main Street buyer see, from a CIM and their own cash, the price and legal 7(a) structure that funds — or that they should walk?

If it helps a broker rank inquiries, a lender buy a pipeline, or a slide about standards, it is someone else’s company. We already red-teamed that company. We are not building it.
