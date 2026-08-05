# Scorta Demo — Audit & Build Plan

> Scope: get the exitIQ/Scorta platform to a cohesive, impressive **3–5 minute demo** state.
> Not production. Demo-grade fidelity is the target; deployability and narrative coherence are non-negotiable.
> Audited on branch `demo` @ `e425283`.

---

## Part 1 — Audit: where the platform actually stands

### 1.1 Build health — **RED**

| Check | Result |
|---|---|
| `pnpm typecheck` | ✅ clean (only after `rm -rf .next` — stale `.next/types` referenced the deleted `api/assessment/teaser` route) |
| `pnpm lint` | ❌ **2 errors** |
| `pnpm build` | ❌ **Fails.** Compiles in 2.5s, then dies at the lint gate |

The two errors:
- [AppShell.tsx:8](../components/scorta/AppShell.tsx#L8) — `sort-imports`: member `Station` out of order
- [CaseHero.tsx:257](../components/scorta/CaseHero.tsx#L257) — `prefer-const`: `raf` never reassigned

**Consequence: the demo branch does not deploy to Vercel today.** This is a ~2-minute fix and it is the single highest-priority item in this document. Everything else is a distant second.

There are also ~30 lint *warnings*, concentrated in [components/exitiq/preview.tsx](../components/exitiq/preview.tsx) — 14 dead components (`SignalCard`, `InsightCard`, `DriverPill`, `UnlockList`, `BuyerArchetypeSection`, `getStrengths`, `getRisks`, …). That file is carrying a large amount of abandoned code.

### 1.2 What is genuinely strong — do not touch this

The `(app)` workspace is far more built out than the CLAUDE.md description implies. ~600KB of dense, internally consistent UI across 11 stations, all sharing one design language (cream theme, EB Garamond / Inter / JetBrains Mono, glass panels, scripted streaming logs, approve gates).

- **The approve-gate pattern** — `ApproveGate` recurs in Ingestion, Recast, Documents, Boardroom. This is literally the "agents propose, humans approve, every material action has a named signatory" claim from `Scorta-AI-Agent-Native.md`, rendered as UI. It is the most on-thesis thing in the codebase.
- **[lib/auditTrail.ts](../lib/auditTrail.ts) + AuditTrailModal** — 24 chronological entries, each with an agent **reasoning trace** and structured metadata (model used, processing duration, hashes). This is the most credible "AI-native" artifact you have. A partner reading one expanded entry learns more than three minutes of clicking.
- **[BoardroomStation](../components/scorta/BoardroomStation.tsx)** (53KB) — 3 buyer personas, live reasoning surface, verdict strips, valuation blocks, severity-ranked objection stacks, and 4 dispatched work orders. This is the centerpiece and it earns the screen time.
- **AgentActivityPanel + AgentFleetContext** — a persistent right-rail fleet view that survives navigation. Agents keep working while you move between stations. Excellent demo mechanic; underused.
- **[OutreachStation](../components/scorta/OutreachStation.tsx)** (78KB) — one component serving both `/lenders` and `/buyers` via a `mode` prop, with lender match scoring, buyer sequences, and a kanban. Efficient and good.
- **LandingPage** already carries the speed-to-close claim: **~38 days vs. broker avg 186 days**, with an animated comparison.

### 1.3 The gaps that matter for *this* demo

Ranked by damage to the narrative you have already told the partners.

**① Speed to close is claimed everywhere and rendered nowhere.**
You told Jared: *"we rebuilt the agent stack around speed to close."* That is the entire pivot of the fall application. But a partner clicking through the workspace sees stations, not a clock. There is no elapsed-day counter, no benchmark comparison, no human-hours figure anywhere in the product. The claim lives on the marketing page and in the email thread — not in the thing he said he'd look at. This is the #1 product gap.

**② CASE is a keyword matcher, not an agent.**
[lib/caseChat.ts:235](../lib/caseChat.ts#L235) — `matchResponse()` lowercases the input and runs `.includes()` against 24 hard-coded trigger sets. Anything unmatched returns one fallback string: *"I don't have a specific answer for that right now."*

In a live demo, the moment a partner types their own question instead of clicking a chip, the Case Manager Agent — the thing your own ground-truth doc calls "the operational backbone" and the "20-deals-per-operator lever" — visibly is not an agent. This is the highest-risk 10 seconds in the demo, and it is on the surface you can least afford it.

**③ The Scorta Score is a "coming soon" page.**
[app/(app)/score/page.tsx](../app/(app)/score/page.tsx) renders `LockedStation`. But the Scorta Score is defensibility pillar #3 in the roadmap — the FICO/Carfax analog, the thing you want an SBA lender to reference by name. `PERSONA.scorta` already holds the numbers (71 overall, 4 sub-scores). Clicking into a locked stub on your own protocol is a credibility leak.

**④ There is no capital-verified buyer pool surface.**
This is the direct answer to Jared's structural question — *"we built the pool of verified buyers first and rebuilt the agent stack around speed to close."* Today the pool exists as three hard-coded objects inside OutreachStation, and one of them is literally named **"Search Fund (Profile TBD)"**. The most important narrative artifact in the fall application has no home in the product.

**⑤ DealIQ does not exist.** Zero routes, zero components, zero mention. The application says 3 search funds pay $1,250/mo each. Jared said *"I'll take a look at the app."* See the companion plan.

**⑥ No multi-deal view.** Everything renders one locked persona. The "20 concurrent deals per operator vs. industry 4–6" claim — your core unit-economics argument — has no visual proof.

**⑦ The authenticated workspace makes zero AI calls.** The only live model call in the entire product is the assessment report stream (`/api/assessment/generate` → Sonnet). Everything in `(app)` is scripted `setTimeout` choreography. That is fine and correct for a demo — but it means CASE (②) is the *only* place you can cheaply make the agent claim literally true, which raises its priority.

**⑧ Assessment stages 2–4 are dead.** 13 questions defined in `lib/exitiq/data.ts`, 10 wired into the flow. `stage4` is never collected, so `scoreBuyerAccess` silently takes the `"no_idea"` branch and grants full +20. Documented in AUDIT.md; not a demo blocker.

**⑨ Auth risk.** [LoginPanel](../components/scorta/LoginPanel.tsx) is password-only with no signup path. The demo depends entirely on a pre-seeded Supabase user existing in the deploy target's project. **Verify this before demo day** — it is a silent, total failure mode.

---

## Part 2 — The demo we should build toward

Design the build around the story, not the feature list. Four minutes, one spine: **speed to close**.

| # | Beat | Surface | Line | State |
|---|---|---|---|---|
| 1 | The clock | Seller Home | *"This deal is on day 4. A traditional broker is also on day 4 — of 186."* | **BUILD** |
| 2 | The red team | Boardroom | 3 buyer personas reason live, produce 4 work orders, dispatch the fleet | ✅ exists |
| 3 | The fleet | right rail, while navigating | 4 agents keep working as you move between stations | ✅ exists |
| 4 | The interrogation | CASE | Partner types their **own** question. It answers. | **BUILD** |
| 5 | The protocol | Scorta Score | 71/100 → 13 points to Scorta Certified, 7 sub-scores, methodology drawer | **BUILD** |
| 6 | Why we're fast | Buyer Network | *"3 capital-verified buyers were matched before we listed. That's the 186→38."* | **BUILD** |
| 7 | The receipts | Audit Trail | Every agent action, with reasoning + model + duration + elapsed | ✅ exists (+ small add) |
| 8 | The other side | DealIQ | Same engine, buyer's seat. Screen Palace Kitchen *against* the seller. | **BUILD** — companion plan |

Beat 8 closing on beat 1 — the same business, both sides of the table, and the buyer turning out to be one of the verified buyers in the seller's queue — is the shot that ends the demo.

---

## Part 3 — Build plan

### P0 — Ship-blocking (~half a day)

**P0.1 · Make the build green.** ~5 min.
Fix the two lint errors. Then `rm -rf .next && pnpm typecheck && pnpm lint && pnpm build` must all pass before anything else is written.

**P0.2 · Verify the demo account.** ~15 min.
Confirm the seeded Supabase user exists in the deploy-target project and that `/login → /dashboard` works on the deployed URL, not just locally. Document the credentials somewhere the demo driver can reach them under pressure.

**P0.3 · The Deal Clock.** ~3h. *Highest narrative leverage per hour in this document.*
New `lib/dealClock.ts` + a `<DealClock>` banner on Seller Home and a compact pill in the AppShell top bar (so it is on screen in **every** station, every second of the demo).

Content — all of it traceable to data that already exists, nothing invented:
- **Day 4** — `PERSONA.exitIQ.completedAt` (2026-05-17) → the last AUDIT_TRAIL entry (2026-05-20)
- **Target: LOI by day 38** — the landing page's own number
- **Broker benchmark: 186 days** — same source
- **Human time on this deal: 6.4 hrs** — derivable from the approve-gate count; broker equivalent 250–300 hrs
- **Agent actions: 24 logged** — `AUDIT_TRAIL.length`, live

Keep it honest: day 4, not day 23. *"Day 4 of 38 — a broker is on day 4 of 186"* is a stronger line than any invented mid-deal number, and it costs zero data fabrication. Per the persona file's own rule: do not invent values.

**P0.4 · Make CASE real.** ~4h. *Highest risk removed per hour.*
New `POST /api/case/chat` — streaming, `HAIKU_MODEL` for latency (this is a fast path, not a report). System prompt carries the full `PERSONA` object, the current route, the station's `PROACTIVE_MESSAGES` context, and a condensed `AUDIT_TRAIL`.

Keep the existing `QA_MAP` as a **fast-path cache**: the seeded chips and their exact triggers return the hand-written answers instantly (they are better written than anything a model will produce live, and they keep the demo's timing predictable). Everything unmatched falls through to the model instead of the fallback string. `FALLBACK_RESPONSE` becomes the network-error path only.

This is a small change with an outsized effect: it removes the demo's worst failure mode, and it makes the "coordinated agent fleet" claim literally true on the one surface a partner will poke at.

### P1 — High impact (~1.5 days)

**P1.1 · Scorta Score station.** ~5h. Replace `LockedStation` on `/score`.
Animated 0–100 dial at 71. Seven sub-scores from the roadmap's own definition — Financial Defensibility, Owner Independence, Customer Concentration, SBA Lendability, Operational & Legal Cleanliness, Market Position, Transferability. `PERSONA.scorta` supplies four; derive the other three from `PERSONA.risk` and `PERSONA.sba` rather than inventing them. Then: **"13 points to Scorta Certified"**, with the 5 SOP tasks that close the gap deep-linked to `/risk`, and a **methodology drawer** — because "methodology-transparent" is the entire claim, and showing the rubric is what makes a partner believe it could become a protocol.

**P1.2 · Buyer Network station** (`/network`). ~5h.
The capital-verified pool as a real surface. ~40 buyers: name, archetype (SBA operator / search fund / micro-PE / independent sponsor), mandate (industry, geography, EV band), **capital-verified badge** with proof-of-funds or SBA pre-qual status, last active. A live filter against Palace Kitchen's profile that resolves to *"9 mandate matches → 3 shortlisted → 2 sequences live."*

Then the line that answers Jared directly: *"These buyers were verified before Chandan signed. That's why the seller-side clock is 38 days and not 186."* Wire it into the rail between `/boardroom` and `/buyers`.

**P1.3 · Velocity column in the Audit Trail.** ~1.5h.
The trail already has `dateLabel` + `timeLabel` on all 24 entries. Add a cumulative elapsed figure and a human-minutes figure per entry, plus a header stat strip: *24 agent actions · 6.4 human hours · 3 days elapsed.* Cheap, and it turns an already-good artifact into the proof of the whole thesis.

### P2 — Polish, if time allows

- **P2.1 · Operator multi-deal view** (`/deals`, ~3h) — 8 concurrent deals, each with a clock and current blocker. This is the only way to *show* 20-deals-per-operator instead of asserting it.
- **P2.2 · Kill "Search Fund (Profile TBD)"** — replace with a named, verified buyer drawn from the new Network. A placeholder name on screen during a demo reads as unfinished.
- **P2.3 · Unlock the rail** — nothing should be `locked` during the demo. Once `/score` is built, audit `STATIONS` so no click lands on a dead end.
- **P2.4 · Delete the dead code in `preview.tsx`** — 14 unused components. Clears most of the lint warnings.

### Sequencing

```
Day 1   P0.1  P0.2  P0.3 (Deal Clock)  P0.4 (CASE live)
Day 2   P1.1 (Scorta Score)  P1.2 (Buyer Network)
Day 3   P1.3  P2.x  →  then DealIQ (companion plan)
```

If time compresses, the order that preserves the most narrative is: **P0.1 → P0.4 → P0.3 → DealIQ Wave 1–2 → P1.1 → P1.2.** DealIQ outranks the Scorta Score station because "we have a second product with paying pilots" is a claim with no evidence at all today, whereas the Score at least has a coherent placeholder.

### Rules for this work

Demo-grade, but not sloppy — the engineering contract still applies to what we write:
- Build stays green. `typecheck` + `lint` + `build` after every item.
- The new `lib/dealClock.ts` and any DealIQ math is pure logic → **unit tests**, per the contract.
- New stations follow the existing inline-style + CSS-token convention in `components/scorta/`. No new palette, no new component library.
- Every number on screen traces to `lib/persona.ts` or a deterministic function. Do not invent values — that rule is already written at the top of the persona file and it is what makes the audit trail credible.
- The live CASE call needs a visible loading state and a graceful error path. A spinner that never resolves in front of a partner is worse than a scripted answer.
