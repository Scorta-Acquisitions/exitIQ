# DealIQ — Product Definition & Build Plan

> Scorta's second product: the buy-side. Same engine, other side of the table.
> Target state: **impressive demo**, not production. Same fidelity bar as the sell-side workspace.
> Companion to [`DEMO — Audit & Build Plan.md`](./DEMO%20—%20Audit%20&%20Build%20Plan.md).

---

## 1. What DealIQ is, and why it exists

From the fall application:

> *"Our second product, DealIQ (in build), gives sub-$5M buyers the same analysis from the other side of the table, and every buyer who signs up joins a capital-verified pool that lets our sell-side tell sellers, truthfully: 'I have verified buyers looking for exactly your business right now.'"*

Two things are being claimed, and the demo has to make both visible:

1. **One engine, two sides.** The recast machinery that *defends* a seller's SDE is the same machinery that *attacks* it when you're the buyer. This is the technical claim, and it's the reason the second product costs almost no incremental engineering.
2. **The buy-side is the sell-side's supply of buyers.** Every DealIQ signup gets capital-verified, which is what lets Scorta compress a seller's clock from 186 days to 38. This is the strategic claim, and it's the direct answer to the YC feedback about a structural reason deals weren't closing.

Customer: searchers, ETA buyers, search funds, independent sponsors — buyers in the sub-$5M band. Explicitly **not** large PE, which does not buy here. Three are on paid pilots at $1,250 today.

Pricing already stated in the application: free gap report → ~$49/mo Searcher → ~$199/mo Pro → $1,500–$2,500 deep-recast packs.

**The one-line positioning:** *Sellers hire Scorta to make their numbers defensible. Buyers hire DealIQ to find out whether they are.*

---

## 2. Feature set

Nine surfaces. The first five are the product; the last four are the flywheel.

### 2.1 Deal Inbox — ingestion
Paste a BizBuySell/Acquire.com listing URL, or drop a CIM PDF. The Ingestion Agent extracts asking price, revenue, claimed SDE, industry, geography, employee count, real estate, and returns a structured deal card in seconds.

This is the opening move of the demo and it must feel instant. Reuses the sell-side Ingestion Agent's streaming-log pattern verbatim.

### 2.2 Screen Score — *is this deal worth your time?*
The buy-side mirror of the Scorta Score. 0–100 plus a verdict: **PASS / DIG / PURSUE**.

Sub-scores: SDE Quality · Add-Back Aggressiveness · Customer Concentration · Owner Dependency · SBA Financeability · Price vs. Comp.

A searcher looks at hundreds of deals and kills 95% of them. The product that tells them what to kill in 90 seconds is the product they keep paying for.

### 2.3 Reverse Recast Agent — **the differentiator**
Takes the seller's claimed SDE and challenges every add-back. This is the surface that makes the "one engine, two sides" claim land, because a partner can see it is the sell-side Recast Agent run with the sign flipped.

```
Seller claims          $962,000 SDE
DealIQ defends         $884,000 SDE
                       ─────────────
Rejected add-backs      $78,000

✗ Spouse payroll        $42,000   Real cost. The role must be replaced post-close.
✗ Personal travel        $9,000   No documentation. A lender will strike this.
⚠ Owner vehicle         $18,000   Partially defensible — 60% business use is supportable.
✓ Owner compensation   $120,000   Accepted. Standard SBA-recognized add-back.

At the seller's 2.4× multiple, that is $187,200 off the ask.
```

Deterministic rules produce the numbers; the LLM writes the justification. Exactly the hybrid architecture described in `Scorta-AI-Agent-Native.md` §2.2 — pointed the other way.

### 2.4 Returns Model
SBA 7(a) structure, computed in code: down payment, loan amount, 10-year term, monthly debt service, **DSCR**, cash-on-cash return, buyer's salary, years to payback. Sensitivity toggles on price and multiple.

This is what a searcher actually pays $199/mo for. It is also cheap and safe to build — pure arithmetic, no model risk, unit-testable.

### 2.5 Diligence Pack
Agent-generated: the 25 questions to send the broker, ranked by **which ones kill the deal fastest**, plus red flags already found in the CIM. Ordering by kill-speed is the insight — every other tool gives an undifferentiated checklist.

### 2.6 LOI Drafter
Price, structure (cash / seller note / earnout), contingencies, exclusivity, deposit — generated from the Returns Model output, with the negotiation rationale attached to each term. Closes the loop from "screen" to "offer" inside one product.

### 2.7 Pipeline
The retention surface. A board of every screened deal with its Screen Score, funneling **142 screened → 31 dug → 9 pursuing → 2 LOI**. Searchers live in this view; it is what makes the subscription sticky.

### 2.8 Capital Verification
Upload proof of funds or an SBA pre-qual letter once → **Capital-Verified badge**. State the trade explicitly in the UI: *verified buyers see Scorta-Certified deals before they reach BizBuySell.*

This is the join between the two products. It should be impossible to miss on screen.

### 2.9 Certified Deal Flow
A feed of Scorta-Certified listings matched to the buyer's mandate, shown pre-market. This is the flywheel rendered — and the reason a searcher tolerates the subscription in a month where they screen nothing.

---

## 3. The demo moment

Use a real searcher persona: **Ryan Delgado — Cascade Search Partners.** $2.5M committed capital, home-services and food-service mandate, NJ/NY/PA, EV band $800K–$3M, capital-verified.

Then screen **Palace Kitchen & Catering** — the same business the sell-side demo just walked through.

| | Scorta (seller) | DealIQ (buyer) |
|---|---|---|
| SDE | $962,000 claimed | **$884,000 defensible** |
| Value | $1.75M listing | **$1.62M fair value** |
| Verdict | Strong SBA Candidate · 71/100 | **PURSUE** · conditional on SOPs |
| Add-backs | $147K justified | **$78K rejected** |

Both screens are honest. Both are computed by the same engine. Neither is spin.

Then the last click: Ryan appears in Palace Kitchen's `/network` shortlist as a capital-verified match. The two products close on each other, and the "186 days → 38 days" claim stops being a marketing number and becomes a mechanism a partner just watched operate.

---

## 4. Architecture

Mount as a sibling route group so it reads as a second product, not a reskin:

```
app/(dealiq)/
  layout.tsx              auth guard + DealIQShell (buy-side accent)
  dealiq/page.tsx         Pipeline
  dealiq/screen/page.tsx  Deal Inbox — ingest a listing
  dealiq/deal/[id]/       Screen Score · Reverse Recast · Returns · Diligence · LOI (tabs)
  dealiq/verify/page.tsx  Capital Verification
  dealiq/flow/page.tsx    Certified Deal Flow

lib/dealiq/
  persona.ts        Ryan Delgado / Cascade Search Partners + seeded pipeline
  reverseRecast.ts  deterministic add-back challenge rules   ← unit tested
  returns.ts        SBA 7(a) debt service, DSCR, CoC, payback ← unit tested
  screenScore.ts    6 sub-scores → composite → PASS/DIG/PURSUE ← unit tested

app/api/dealiq/
  screen/route.ts   POST — listing URL or pasted text → structured deal (Haiku)
  narrate/route.ts  POST — stream add-back justification prose (Sonnet)
```

**Visual identity.** Reuse every existing pattern — station header, approve gate, streaming log, glass panel — but pivot the accent from `--mint` (sell-side) to `--sky`/`--lav`, which are already defined in `styles/tailwind.css`. Same house, different room. No new palette; the engineering contract forbids it and the demo doesn't need it.

**What is real vs. scripted.** Be deliberate here:
- **Real, deterministic TS:** reverse recast rules, DSCR/returns math, screen scoring. Cheap, testable, and it makes the application's claim — *"every dollar figure is computed in deterministic code, traced to a source document"* — literally true on the newest surface. This is the honest version and it costs almost nothing.
- **Real LLM:** listing ingestion (Haiku, structured output) and add-back justification prose (Sonnet stream).
- **Seeded:** the pipeline's 142 historical deals, the buyer network, the certified flow feed.
- **Mandatory:** every live LLM path needs a seeded fallback that fires on timeout or error. A demo that hangs on a cold API call is worse than one that never called out at all.

---

## 5. Build plan

### Wave 1 — Foundation (~1 day)
1. `lib/dealiq/persona.ts` — Ryan + Cascade + a seeded 12-deal pipeline with a realistic funnel shape.
2. `lib/dealiq/returns.ts` + `screenScore.ts` + `reverseRecast.ts` — pure functions, **with Vitest unit tests** (contract requirement for `lib/` logic).
3. `app/(dealiq)/layout.tsx` + `DealIQShell` — rail, top bar, buy-side accent. Fork the AppShell structure rather than parameterizing it; the demo timeline doesn't reward the abstraction.
4. Cross-link: a product switcher in both shells so the demo can pivot between Scorta and DealIQ in one click. **Build this early** — it is the seam the whole demo turns on.

### Wave 2 — The three money surfaces (~2 days)
5. **Deal Inbox** — paste a listing → streaming ingestion log → structured deal card. Reuses `IngestionStation`'s log pattern.
6. **Screen Score** — dial, 6 sub-scores, PASS/DIG/PURSUE verdict. Reuses the Scorta Score component built in P1.1 of the demo plan (build that first and this is nearly free).
7. **Reverse Recast** — the accept/reject/partial table, the rejected-add-back total, the negotiation delta, streamed justification prose. *This is the surface that sells the product; give it the most polish budget.*
8. **Returns Model** — SBA structure, DSCR, cash-on-cash, price sensitivity slider.

### Wave 3 — The flywheel (~1.5 days)
9. **Diligence Pack** — 25 ranked questions + red flags.
10. **LOI Drafter** — terms + rationale, with an approve gate matching the sell-side pattern.
11. **Capital Verification** — upload → badge → the explicit statement of what the badge buys.
12. **Certified Deal Flow** — mandate-matched pre-market listings.
13. **Wire the loop** — Ryan appears in the sell-side `/network` shortlist and in Palace Kitchen's outreach queue. Ten lines of code; it is the closing shot of the demo.

**Total: ~4.5 days at demo fidelity.** Waves 1–2 alone (~3 days) are a demoable product — Waves 1 and 2 give you the ingestion → screen → recast → returns spine, which is the whole pitch. Wave 3 is what makes the two-sided story visible.

### Cut order, if time compresses
Ship Wave 1 + items 5, 6, 7 and the cross-link (#4). A searcher pasting a listing, getting a verdict in 8 seconds, and watching the seller's add-backs get torn apart is the entire product thesis in 90 seconds. Everything else is elaboration.

---

## 6. Risks

- **Live model latency in the ingestion step.** Mitigate with a pre-warmed seeded deal on the demo path and a hard 6s timeout to fallback. Never demo a cold call.
- **Two products can dilute a 5-minute demo.** Budget DealIQ to ~60–75 seconds, positioned as the closing move, not a second tour. The sell-side is the business; DealIQ is the proof that the engine generalizes and that the buyer pool is real.
- **The numbers must reconcile.** DealIQ's $884K defensible SDE has to be derivable from the same $147K add-back schedule the sell-side Recast Station shows. If a partner does the arithmetic and the two products disagree, the "one engine" claim dies on the spot. Drive both from one source in `lib/persona.ts`.
