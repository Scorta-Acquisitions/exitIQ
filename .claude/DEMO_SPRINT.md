# Scorta — Accelerator Demo Sprint

> **Single source of truth for the accelerator demo build.**
> Every Claude Code session, every agent, every developer reads this file **before** writing a single line of code.
> Every session updates the [State Tracker](#state-tracker) and [Handoff Notes](#handoff-notes) **before** closing.
> Context does not live in anyone's head. It lives here.

---

## 1. Prime Directive

**One flawless demo pathway. UI perfection over backend accuracy. Hard-code everything that accelerates polish.**

This week, Scorta is being demoed to startup accelerators. The bar is:

- **The product must feel production-ready.** UI, UX, flows, buttons, navigation, transitions, loading states, and overall polish must be impeccable.
- **Agent outcomes do not need to be real.** Mocked responses, static data, and single-pathway logic are explicitly allowed and encouraged where they speed delivery and improve demo quality.
- **One single, smooth, end-to-end workflow** is the only requirement. There is no second pathway. There are no edge cases. There is no error handling beyond the happy path.
- **Speed of delivery and visual/functional perfection take absolute priority** over backend accuracy or real AI performance.

If a decision is between "more real" and "more polished," choose **polished**. If a decision is between "extensible" and "ships today," choose **ships today**.

you must leave pre-existing exitIQ assessment or report code untouched. Ask for permission if you need to change this code.

---

## 2. The Scorta Ground Truth (Never Lose This)

**Scorta is not an AI tool for brokers. Scorta is the underwriter, prep shop, and broker-of-record — run end-to-end by a coordinated fleet of specialized agents (Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom, Lender Ops, Outreach) with humans on the approval layer.**

We take a sub-$2M Main Street business from raw books to "SBA-funded, buyer-closed" — owning every step of underwriting, prep, remediation, and brokerage through a small human approval layer on top of an agent-driven operations stack.

**Our outcome commitment: SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid.**

### The Wedge

- Baton is a marketplace.
- OffDeal is an AI investment bank for the $5M+ revenue band.
- Iconic is a tech-enabled advisory platform serving up to $100M revenue.

**None of them owns the "is this business actually sellable, and if not, what would make it sellable?" layer.** That is the unclaimed wedge.

- "AI-native broker" is the wedge into the conversation.
- "Agent-native operations stack" is the architecture.

Every screen, every copy line, every interaction in the demo must reinforce this positioning. The demo is not a tour of features — it is a story about an agent fleet doing the work of a junior banker, underwriter, buyer panel, and deal coordinator, with the human operator on the approval layer.

See [.claude/Scorta-AI-Agent-Native.md](Scorta-AI-Agent-Native.md) for the full agent architecture and approval-layer details.

---

## 5. Feature Pipeline (Strict Sequence)

Build in this order. Do not start station N+1 until station N passes the [QA Rule](#7-the-qa-rule-non-negotiable). Wire the [Navigation Spine](#6-navigation-spine-build-this-first) before station 1.

| # | Station | Route | Purpose |
|---|---|---|---|
| 1 | **Intelligent Question Routing** | extends `/assessment` | Branching follow-up questions driven by earlier answers. One pathway. |
| 2 | **Auth / Seller Home** | `/dashboard` | Supabase Auth + seller home with information collected during exit IQ app session - ten question answers plus report information. |
| 3 | **Platform Connectors** | `/connect` | QuickBooks / Toast / Plaid / Drive tiles with simulated connect flow. |
| 4 | **Ingestion Agent** | `/ingestion` | Live-updating progress feed showing agent classification + extraction. |
| 5 | **Recast / Boardroom** | `/recast` | Before/after recast table with add-back narrative + executive view toggle. |
| 6 | **Owner-Dependency / Concentration** | `/risk` | Donut charts for revenue + owner-time concentration with AI recommendations. |
| 7 | **CIM / Doc Gen** | `/documents` | Generate-CIM action, generation progress, CIM preview card, download. |
| 8 | **Scorta Score** | `/score` | Animated score dial (0–100) + sub-score breakdown + improvement accordion. |
| 9 | **Lender Ops / VDR / Listings** | `/marketplace` | Tabbed: Lenders, VDR, Listings — all populated, all interactive. |
| 10 | **Outbound Outreach** | `/outreach` | Kanban pipeline: Identified → Contacted → Interested → NDA Signed. |

### Station Briefs

Each station is built from a **Station Card** — a micro-brief that defines exactly what to build and nothing more. Station Cards live as sub-sections of this document and are added/updated as we approach each station. Do not gold-plate. Do not extend scope. Do not add a second pathway.

The full Station Card content for each feature, written when the station opens, must include:

- **Goal** — one sentence, demo-framed.
- **Route + entry point** — where the user lands and how they got there.
- **Hard-coded surface** — what values, copy, and data appear on screen (filled in once persona is locked).
- **Interactions** — every click, hover, toggle, and animation.
- **Loading states** — every async-feeling action has a spinner or skeleton.
- **Done definition** — the three QA questions answered Yes.

---

## 6. Navigation Spine (Build This First)

Before any station, wire the persistent shell so every route exists. Empty routes are fine — dead links are not.

```
/dashboard      → Seller Home
/connect        → Platform Connectors
/ingestion      → Data Processing
/recast         → Financials Recast
/risk           → Risk Analysis
/documents      → CIM & Docs
/score          → Scorta Score
/marketplace    → Lenders / VDR / Listings
/outreach       → Buyer / Lender Outreach
```

Left-rail navigation with a status indicator per route (✓ complete · ● active · ○ locked) creates the illusion of a full platform on the first click. The agent-fleet narrative ("Case Manager Agent is coordinating across these stations") gets reinforced visually every time the user moves between screens.

---

## 7. The QA Rule (Non-Negotiable)

Before closing any station, answer all three with Yes. If any answer is No, fix it before moving on. One broken screen kills the demo narrative.

1. **Can I click through this without breaking?** No console errors. No dead buttons. No 404s. Every interaction has a visible response.
2. **Does it look investor-ready on a 1080p screen?** Typography, spacing, color, loading states, transitions, alignment — all polished. No placeholders. No lorem ipsum.
3. **Does the mock data tell a coherent story?** Same company. Same numbers. Same names. Consistent across every screen the user could see in the demo path.

---

## 8. Design System Principles (Non-Negotiable)

| Principle | Rule |
|---|---|
| Production feel | Every screen must feel production-ready. No placeholders. No lorem ipsum. |
| Real persona data | Use real persona data everywhere. _Persona: to be decided._ |
| Loading states | Every async action has a spinner or skeleton. No abrupt state jumps. |
| Error states | Skip for demo. Happy path only. |
| Navigation | Always works. No dead links. No 404s. |
| Mobile responsiveness | Not required for demo. Optimize for 1080p+ desktop. |
| Color palette | Inherit from existing project. Do not introduce a new palette. |
| Component library | Inherit Radix + CVA from existing project. Do not introduce a new library. |
| Copy tone | Reinforce agent-fleet positioning. Name the agents on screen ("Ingestion Agent is classifying…", "Recast Agent proposes…", "Case Manager Agent dispatched…"). |
| Approval layer | Anywhere an agent produces a material output, show a "Review & Approve" surface — even if approval is a no-op in the demo. This is the product story. |

---

## 9. Agent Prompt Template

Paste this at the top of every Claude Code / agent session. Do not edit it per-station — the station context comes from the [State Tracker](#state-tracker) and the open Station Card.

```
You are a senior full-stack engineer on the Scorta accelerator demo sprint.

GROUND TRUTH:
Scorta is not an AI tool for brokers. Scorta is the underwriter, prep shop, and
broker-of-record — run end-to-end by a coordinated fleet of specialized agents
(Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom,
Lender Ops, Outreach) with humans on the approval layer. We take a sub-$2M Main
Street business from raw books to "SBA-funded, buyer-closed" — owning every
step of underwriting, prep, remediation, and brokerage through a small human
approval layer on top of an agent-driven operations stack.

Outcome commitment: SBA-fundable, buyer-ready, term-sheet in hand — or we don't
get paid.

PRIME DIRECTIVE:
Build for demo perfection. UI and user-facing functionality must be impeccable.
Hard-code values. Mock data. One pathway only. Happy path only. No edge cases.
No error handling beyond the happy path.


REQUIRED READING BEFORE WRITING CODE:
1. .claude/DEMO_SPRINT.md                     — sprint source of truth (state, sequence, rules)
2. .claude/demo-script.md          — demo script and demo workflow
3. .claude/CLAUDE.md                          — architecture boundaries and definition of done
4. .exitiq-debug/sessions/DEMO_PERSONA.md     — locked demo persona (narrative)
5. .exitiq-debug/sessions/demo-persona.json   — locked demo persona (structured fields)
6. .exitiq-debug/sessions/demo-report.md      — locked Exit IQ Report for this persona
7. The open Station Card in DEMO_SPRINT.md for the current station

PROTOCOL:
- Confirm the current station from the State Tracker in DEMO_SPRINT.md.
- Build only what the Station Card defines. Do not gold-plate. Do not extend scope.
- Every async-feeling action has a loading state.
- Every agent output on screen names the agent and shows a "Review & Approve" surface.
- Run the QA Rule (3 questions) before declaring the station done.
- Update the State Tracker + Handoff Notes in DEMO_SPRINT.md before closing the session.

DO NOT:
- Ask about real backend logic.
- Add a second pathway.
- Add error handling beyond happy path.
- Invent persona values, company names, or numbers. The persona is locked.
  All values come from the three files referenced in Section 11 of DEMO_SPRINT.md:
    - .exitiq-debug/sessions/DEMO_PERSONA.md     (narrative)
    - .exitiq-debug/sessions/demo-persona.json   (structured fields for UI)
    - .exitiq-debug/sessions/demo-report.md      (Exit IQ Report output)
  If a value you need isn't in those files, stop and log an open question — do
  not invent it.
- Introduce a new color palette or component library.
```

---

## 10. Station Workflow Protocol (Anti-Drift)

The biggest risk at this pace is **session drift** — an agent halfway through station 6 forgets the demo persona, invents new numbers, or rebuilds something station 3 already shipped.

Follow this protocol on every session:

1. **Open** — Read `DEMO_SPRINT.md` end-to-end. Confirm the active station from the [State Tracker](#state-tracker). Read the open Station Card. Read the last entry in [Handoff Notes](#handoff-notes).
2. **Build** — Implement only what the Station Card defines. Loading states are mandatory. Agent names appear in copy. Approval surfaces appear anywhere an agent produces material output.
3. **Walk** — Click through the station yourself. Run the [QA Rule](#7-the-qa-rule-non-negotiable). Click through the prior stations in the demo path to confirm no regressions.
4. **Close** — Update the [State Tracker](#state-tracker) (check the station box, mark next station active). Append an entry to [Handoff Notes](#handoff-notes) with what shipped, what's mocked, what's left, and any decisions the next session needs to know.

If a session ends mid-station, that is a Handoff Note entry. The next session reads the note and continues — it does not re-derive context from the code.

---

## 11. Demo Persona

**Status: LOCKED.** The persona is hard-coded for all future features. **Do not invent or alter values.** Any number, name, date, dollar figure, or narrative beat shown on any screen must come from one of these three files — they are the ground truth:

| File | Format | Use For |
|---|---|---|
| [.exitiq-debug/sessions/DEMO_PERSONA.md](../.exitiq-debug/sessions/DEMO_PERSONA.md) | Markdown | Human-readable persona narrative — company story, owner, operations, risks, the "why" behind the numbers. Read this first for context. |
| [.exitiq-debug/sessions/demo-persona.json](../.exitiq-debug/sessions/demo-persona.json) | JSON | Structured field values for UI hard-coding — pull strings and numbers from here so every screen stays consistent. |
| [.exitiq-debug/sessions/demo-report.md](../.exitiq-debug/sessions/demo-report.md) | Markdown | The Exit IQ Report output for this persona — drives Recast / Boardroom / Score / Risk station copy and numbers. |

### Rules

- **Read all three files before opening any Station Card.** The Station Card's "Hard-coded surface" section must cite specific fields from these files — not values pulled from memory.
- **If a value you need isn't in the persona files, stop.** Do not invent it. Add an "Open question for the human" entry in [Handoff Notes](#handoff-notes) and wait for the persona files to be updated. Updates to the persona happen in the persona files, not in feature code.
- **Cross-screen coherence is mandatory.** Same company name, same revenue, same EBITDA, same buyer names, same lender names across every station the demo path touches. The QA Rule's question 3 ("Does the mock data tell a coherent story?") is enforced against these files.
- **Persona changes are global.** If the persona files are updated mid-sprint, every station already shipped must be re-validated against the new values before the next station opens.

---

## 12. State Tracker

> **Update this before closing every session.** Check the box when a station passes the QA Rule. Mark the next station active.

### Pre-flight
- [x] Demo persona locked — see [Section 11](#11-demo-persona) (three files in `.exitiq-debug/sessions/`)
- [x] Auth flow decision made for `/dashboard` (Supabase Auth vs. mock session)

### Stations
- [x] **Existing** — Assessment wizard  — do not modify
- [x] **Existing** — Report page - do not modify
- [x] **Station 2** — Auth / Seller Home (`/dashboard`), Navigation spine wired (all routes resolve, left-rail status indicators in place)
- [x] **Station 3** — Platform Connectors (`/connect`)
- [x] **Station 4** — Ingestion Agent (`/ingestion`)
- [x] **Station 5** — Recast / Boardroom (`/recast`)
- [x] **Station 6** — Owner-Dependency / Concentration (`/risk`)
- [x] **Station 6b** — The Boardroom (`/boardroom`) — shipped out-of-sequence (always-on station per Boardroom spec)
- [x] **Station 7** — CIM / Doc Gen (`/documents`)
- [x] **Station 07b** — Virtual Data Room (`/vdr`) — shipped out-of-sequence (always-on station per VDR spec; persistent reference surface like `/boardroom`)
- [ ] **Station 8** — Scorta Score (`/score`) ← active
- [ ] **Station 9** — Lender Ops / Listings (`/marketplace`)
- [x] **Station 10** — Lenders, Buyers & Outreach (`/outreach`)

### Currently Active
- **Station:** Station 8 — Scorta Score (`/score`) + Station 9 — Lender Ops / Listings (`/marketplace`) (parallel sessions)
- **Owner:** Puneet

### Auth Decision
- Using real Supabase Auth (email + password)
- Demo credentials: chandan@palacekitchen.com / chandan
- Single demo account pre-created in Supabase dashboard
---

## 13. Handoff Notes

> **Every session appends one entry before closing.** Newest entries on top. Each entry leaves the next session enough context to continue without reading code.

Entry template:

```markdown
### YYYY-MM-DD — <Session label> — <Station name or "Pre-flight">

**Shipped:**
- <bullets — what was actually built / merged>

**Mocked / hard-coded:**
- <bullets — what is fake and must stay consistent with persona once locked>

**Left for next session:**
- <bullets — concrete next actions, ordered>

**Decisions made (that future sessions must respect):**
- <bullets — anything chosen that wasn't in DEMO_SPRINT.md before>

**Open questions for the human:**
- <bullets — blockers that need a decision before the next session can proceed>
```

---

#### 2026-05-18 — Station 10 ship — Lenders, Buyers & Outreach (`/outreach`)

**Shipped:**
- New `components/scorta/OutreachStation.tsx` — the terminal operational station. Replaces the `LockedStation` stub at `/outreach` with a full two-column deal pipeline (lender pipeline on the left, buyer pipeline on the right) and a full-width approval gate underneath.
  - **Page open — Agents Briefing (1.4s).** Reuses the dual-thread terminal pattern from Station 6: two dark `rgba(12,10,9,.92)` cards side by side, each with a mint pulse dot + agent eyebrow. Left thread (Lender Ops Agent) cycles "Loading approved P&L Recast..." → "Matching lenders against deal profile..." → "Ranking by match score..." at 360ms intervals. Right thread (Outreach Agent) cycles "Loading Boardroom buyer segment recommendations..." → "Building SBA-Backed Operator sequence..." → "Building Micro-PE sequence..." in parallel. After all 3 lines + 240ms tail, the two-column surface fades in (360ms).
  - **Left column — Lender Pipeline.** Cream-tinted glass card (matches the Boardroom panel rhythm). Column header: `LENDER OPS AGENT · SBA 7(A) PACKAGE` mono eyebrow + mint `● READY TO SUBMIT` chip + Boardroom reference line. Package Summary card (cover-sheet treatment) with 7 rows pulled from persona — Normalized SDE $962K, Listing $1.75M (Garamond anchor), Loan $1.09M, Down $106K, DSCR 4.4× (mint), Service $14.2K/mo, Scorta Score 71/100 · SBA Eligible. Below: `View package in VDR →` link with a 2.2s tooltip flash ("Package available in your Virtual Data Room.") — no nav per spec. Then **three lender cards stacked** ranked by match score, each with: Garamond name, type subline, mint match badge (94 / 87 / 81), mint progress bar, note line, mono loan terms, status pill (Northeast = `VDR Access Granted` mint chip; others = muted `Not yet contacted`). Each card has an `Include in submission →` toggle that flips to a mint `Selected ✓` pill when active. Northeast + First National are pre-selected (matches persona Section 13 — both already marked `Package sent`). Submit bar at bottom shows live `N lenders selected` count + dark primary `Submit Package to Selected Lenders →` button that runs a 700ms spinner ("Uploading to lender portals...") and flips selected cards to mint `Submitted · [time]` status pills. Column-level submit is independent of the full approval gate per spec.
  - **Right column — Buyer Pipeline.** Same card treatment. Column header: `OUTREACH AGENT · BUYER SEQUENCES` mono eyebrow + amber `● 2 SEQUENCES READY · 1 HELD` chip + Boardroom priority order reference. **4-column Kanban** (Identified / Contacted / Interested / NDA Signed) inside a soft-grey panel with a 1px border. Three buyer cards land in `Identified`:
    - **Marcus Rivera** (mint chip — SBA-Backed Operator). 4-touch sequence built from spec verbatim (intro → CIM/NDA → DSCR worksheet → LOI). Touch 1 visible as a soft-tinted preview row; expanding the `View ▾` chevron reveals all four touches. `Launch Sequence →` button (mint outline) runs a 520ms spinner and moves the card to the `Contacted` column with a "Contacted · [time]" timestamp.
    - **David Chen** (peach chip — Micro-PE). 3-touch sequence (platform acquisition → CIM + seller-note memo → management transition + LOI). Same launch flow.
    - **Search Fund (Profile TBD)** (sky chip, **held** — amber left border + amber-tinted background). Hold Condition card cites the Concentration Agent: "NJ Transit contract confirmation required before Search Fund outreach. The Search Fund's deal-breaker objection (Boardroom WO 2) has not yet been resolved. Outreach Agent will auto-launch this sequence when the Concentration Agent confirms contract status." Estimate line below. `Override Hold →` button is tooltip-only (2.4s flash: "Not recommended. The Search Fund will ask about contract status immediately. Resolve the hold condition first.") — no launch path per spec.
    - Empty Contacted / Interested / NDA Signed columns show muted dashed placeholder rows ("No buyers contacted yet · launch a sequence to begin").
  - **Full-width approval gate — `Lender Ops Agent + Outreach Agent · awaiting your approval`.** Canonical mint gradient banner (same as `/recast`, `/risk`, `/boardroom`, `/documents`). Headline: "Authorize the full outreach and lender submission strategy." Body explains lender package submission, sequence launch, response routing, and pause/revoke from the VDR. Two CTAs: secondary `Review outreach plan` (tooltip-only, 2.2s flash: "Full sequence copy available for review before launch.") + primary `Authorize & Launch →`. The primary runs a 700ms spinner cycling `Authorizing Lender Ops Agent...` → `Authorizing Outreach Agent...` → `Logging approval...`. On completion: any selected-but-unsubmitted lenders flip to `Submitted` with the same timestamp; any unlaunched non-held buyers in `Identified` cascade into `Contacted` with a 300ms stagger per card. Audit line then fades in (mono, mint, dashed mint divider above): `Lender submission and buyer outreach authorized by Chandan Patel · [today] · [time] · Lender Ops Agent and Outreach Agent active. All responses route to Chandan for review before any commitment is made.`
  - **Post-authorization state.** The approval banner is replaced by a `Deal · IN MARKET` mint status bar showing two live agent status lines (`● Lender Ops Agent — monitoring N submissions` / `● Outreach Agent — N sequences active · 1 held`) plus the authorization timestamp.
  - **Deal Progress Strip — the emotional close.** A full-width strip pinned below the status bar showing every station as a mint `✓` chip in correct sequence: `Intake → Connect → Ingest → Recast → Risk → Boardroom → CIM → Score → VDR → Lenders → Outreach → ● IN MARKET`. Final chip is filled mint with a white-dot pulse animation (`outreachInMarketPulse`). This is the satisfying close — the seller sees the full arc on one line ending in IN MARKET.
- Updated `app/(app)/outreach/page.tsx` to render `<OutreachStation persona={PERSONA} />` (server → client pattern, matches every other shipped station).
- Flipped `lib/persona.ts` station state: `/outreach` `locked → active`. Agent label updated to `Lender Ops · Outreach` to match the station's owning agents (was `Outreach`). Stays `active` once activated (does not flip to `shipped` — terminal always-on station like `/boardroom` and `/vdr`).

**Mocked / hard-coded:**
- Lender data (Northeast Community Bank 94%, First National 87%, ReadyCap 81%) pulled verbatim from `DEMO_PERSONA.md` Section 7 / Section 11. Pre-selection state (Northeast + First National `Package sent`, ReadyCap `Sending`) matches Section 13's outbound lender notifications. Loan terms (`Up to $1.4M · 10-year · prime + 2.75%` etc.) hard-coded per spec lines 134–157.
- Buyer personas Marcus Rivera + David Chen are demo-only — they are NOT in the persona file. They represent the SBA-Backed Operator and Micro-PE buyer profiles from the Boardroom (per spec, lines 406–411). Sequence touch copy hard-coded verbatim from spec lines 199–227. Hold reason copy for the Search Fund (Boardroom WO 2 reference, NJ Transit contract gate) hard-coded verbatim from spec lines 234–248.
- Persona accent colors hold the Boardroom palette: SBA-Backed Operator → mint, Search Fund → sky, Micro-PE → peach. No new colors. Hold treatment uses amber (peach) left border + peach-tinted card bg, distinct from but consistent with the Boardroom severity tokens.
- Package Summary numbers all read from `persona.financials` / `persona.sba` / `persona.scorta` — `Normalized SDE $962K` (`financials.normalizedSDEYear3Display`), `Listing $1,750,000` (`financials.recommendedListing`), `Loan $1,090,000` (`sba.loanAmountDisplay`), `Down $106,000` (`sba.minDownPaymentDisplay`), `DSCR 4.4×` (`sba.dscr`), `Service $14,200/month` (`sba.monthlyDebtServiceDisplay`), `Scorta Score 71/100` (`scorta.overall`). No invented numbers. (I hard-coded the literal display strings rather than concatenating from persona — same pattern as `DocumentsStation` Section 6 panel — because the package-summary cover-sheet treatment renders best with the literal `$1,090,000` form. If persona numbers ever change, update both `lib/persona.ts` and the `PackageSummary.rows` array in `OutreachStation.tsx`.)
- Timing budget lives in `T = { … }` at the top of `OutreachStation.tsx`:
  - `briefingStepMs: 360`, `briefingLines: 3`, `briefingTailMs: 240` → ~1.32s briefing + 360ms surface reveal = ~1.68s to actionable surface
  - `surfaceRevealMs: 360`
  - `submitSpinnerMs: 700` (column-level lender submit)
  - `launchSpinnerMs: 520` (per-buyer launch)
  - `approveSpinnerMs: 700` (full approval)
  - `approveStaggerMs: 300` (per-card cascade after approval)
  - `auditHoldMs: 520`
  - `vdrTipMs: 2200`, `reviewTipMs: 2200` (tooltip flashes)
- Deal progress strip labels (`Intake / Connect / Ingest / Recast / Risk / Boardroom / CIM / Score / VDR / Lenders / Outreach`) are the canonical sequence per spec. VDR + Lenders are shown as completed in the strip even though Stations 8 (`/score`) and 9 (`/marketplace`) are still actively being built in parallel — the strip is the emotional close and reflects the full demo arc, not the live station state.
- Audit timestamps (`approvedAt.date`, `approvedAt.time`, lender `Submitted · [time]`, buyer `Contacted · [time]`) are generated live from `new Date()` — same pattern as `RecastStation`, `BoardroomStation`, `DocumentsStation`.
- The `useRouter` hook is imported but unused (`void router`) — `/outreach` is a terminal station with no exit per spec. Kept the import so future expansion (e.g. routing to a follow-up monitoring view) is a one-line change.
- The Agent Activity Panel automatically reflects the OUTREACH phase via the existing `getAgentState` projection in `lib/agentActivity.ts` (Outreach → running, Owner-Dependency → reviewing "SOP templates ready · Chandan to fill in", Concentration → complete, Recast → complete). No changes to `agentActivity.ts` required — that file was already wired for this station.

**Left for next session:**
- Stations 8 + 9 (Scorta Score + Marketplace) are being built in parallel sessions. Once Station 9 ships, wire its CTA to route to `/outreach` (the spec says outreach "arrives from `/score` via 'Proceed to Lender Matching →'" — that handoff CTA should be added to the trailing station rather than to `/outreach`).
- The Search Fund's `Override Hold` is currently tooltip-only per spec. If a future demo run wants to show the auto-unlock pathway (Concentration Agent confirms contract → Search Fund sequence launches automatically), it would be a follow-up enhancement — not in spec scope today.
- The Kanban supports drag visually per the spec note, but I did not wire HTML5 drag-and-drop — the spec calls this out as "visual only / no state change in downstream systems." If a future demo wants live drag, add `draggable` + `onDragStart` / `onDragOver` / `onDrop` to `BuyerCard` and update `buyerColumn[id]` on drop. The Launch Sequence button is the primary path and the demo's hero motion.
- The `/outreach` left-rail label currently reads "Buyer & Lender Outreach". If the demo script prefers it ordered as "Lenders & Buyers Outreach" to match the column reading order in the page (lenders first, then buyers), update `lib/persona.ts` line 170 — purely a label nit.

**Decisions made (that future sessions must respect):**
- Left rail label "Buyer & Lender Outreach" stays. Agent label changed from `Outreach` → `Lender Ops · Outreach` to reflect both agents owning the station, matching how `Owner-Dependency · Concentration` reads on `/risk` and `Recast · Boardroom` reads on `/recast`.
- `/outreach` is `state: "active"` (not `"shipped"`). Terminal always-on station like `/boardroom` and `/vdr` per the spec ("It does not flip to `shipped` — like the VDR and Boardroom, it is always-on once activated.").
- The Search Fund hold uses peach (amber) instead of crit (red). Peach is the Boardroom's "high but not deal-breaker" severity tone and matches the Top Bar's `Hot Seller · 6–12 mo` chip color — keeps visual tension without reading as alarming, per spec ("amber treatment without being alarming").
- All in-card sequence touch rows expand inline (chevron toggle, defaults to collapsed with Touch 1 visible as a preview). No modal — keeps the demo on one surface.
- The Kanban is rendered inside the right column, not as a separate surface. Matches spec layout: "Right column: BUYER PIPELINE (Outreach Agent)" with the Kanban as its primary visual element.

**Open questions for the human:**
- None blocking. The spec line "Arrives from: `/score` via 'Proceed to Lender Matching →'" implies a route handoff that today routes from `/score` → `/marketplace` → `/outreach`. Since Stations 8 and 9 are in parallel sessions, the wiring of that handoff CTA belongs to whichever station ships the upstream surface — not to this station. `/outreach` is already reachable directly from the left rail now that it's `active`.

---

#### 2026-05-18 — Station 07b ship — Virtual Data Room

**Shipped:**
- New `components/scorta/VDRStation.tsx` — the `/vdr` workspace, a four-panel deal-room surface that lives between `/documents` and `/marketplace` in the left rail. The VDR is an always-on persistent reference station (no shipped → active flip), exactly like `/boardroom`.
  - **Panel 1 — Deal Header.** Full-width white elevated card (file-cabinet treatment per spec, not a glass card). Left column: `SCORTA CERTIFIED · DEAL ROOM` mint mono eyebrow → Garamond 28px business name → `Northern New Jersey · Food Service` → Garamond 18px `Listed: $1.75M · 2.4× SDE` → four status chips (mint: SBA 7(a) Eligible, DSCR 4.4×, Scorta Score 71/100 · Strong SBA Candidate; amber: Transferability 38/100 · In Remediation). Right column (soft-grey inner panel): "Share VDR Access" eyebrow → unique deal link (`scorta.io/vdr/palace-kitchen-7f3a`) in mono with real copy-to-clipboard icon (shows mint "Copied ✓" toast for 1.5s) → NDA-required toggle (ON by default, real switch state) → Access level pill segmentation (Full Access / CIM Only / P&L Only / Custom; Full Access default) → `Send Access Request →` primary CTA that flashes a 2.2s "Generates a permissioned link — demo shows live access request flow." tooltip.
  - **Panel 2 — Document Library.** Glass card surface (consistent with other agent stations). `VDR · 2 documents published · 0 pending` mint mono eyebrow + Garamond H2 "Published Documents". Pill segmented tabs (`All / Buyer-Facing / Lender-Facing / Legal`) with instant filter — All shows both docs, Buyer-Facing shows only the CIM card, Lender-Facing shows only the P&L Recast, Legal shows the placeholder "NDA templates available · generated by Case Manager Agent on request." (per spec). Two doc cards in a 2-col grid:
    - **CIM card** — `BUYER-FACING` mint chip + dark mono "CIM" avatar (44×44) + Garamond 19px title + agent attribution `CIM Agent + Recast Agent + Boardroom` in mint + version v1.0 + today's published date. Inner data grid (Approved by Chandan Patel · Access NDA Required · Size 12 sections · ~4,200 words). Mint live-dot status (`Live · 1 view`). Three action buttons: **Preview** (primary, opens drawer), **Download** (secondary, flashes the "PDF export available · demo shows live preview only." tooltip for 2.2s), **Manage Access** (popover toggle showing "No parties with active access · approve a request below.").
    - **P&L Recast card** — `LENDER-FACING` sky chip + dark mono "P&L" avatar + Garamond 19px title + agent attribution `Recast Agent` in sky + v1.0 + today's date. Inner grid (Approved by Chandan Patel · Access NDA Required · Size 3-year P&L · add-back schedule · SDE summary). Same three action buttons with same tooltips.
    - Dashed "8 additional documents ready to generate on demand · Request via the Document Fleet on /documents" tile is a real `router.push("/documents")` (per spec — this is the one VDR interaction that navigates away).
  - **Panel 3 — Access Log.** Glass card. Mint mono eyebrow + Garamond H2 "All access requests and document views are logged in real time." Two pending request rows at top (amber-tinted, the established REVIEWING treatment): **Marcus Rivera · BUYER · SBA-Backed Operator** (Requested today · 2 hours ago, Documents: CIM, NDA: Not yet signed, note: "Approve to send NDA for signature. CIM unlocks after NDA is returned.") and **Northeast Community Bank · LENDER · SBA 7(a) Specialist** (Requested today · 45 minutes ago, Documents: P&L Recast + CIM, NDA: Waived (lender), note: "NDA waived for SBA lenders. Approval grants immediate access to both documents."). Each row has `Deny` secondary + `Approve Access →` primary. Approve runs a 700ms spinner ("Granting access…") then flips the row to a GRANTED entry in the activity log below with mint avatar; Deny instantly greys the row to DENIED state. Below the pending block is a hairline divider + three completed activity rows (verbatim per spec): `CP · Chandan Patel · SELLER · Published "CIM" to VDR · Today · 10:52 AM`, `CP · Chandan Patel · SELLER · Published "P&L Recast" to VDR · Today · 10:41 AM`, `CP · Chandan Patel · SELLER · Approved recast financials · Today · 10:38 AM`.
  - **Panel 4 — Engagement Analytics.** Glass card. Mint mono eyebrow + Garamond H2 "Buyer and lender engagement with your documents." Subhead "Based on 1 buyer view and 1 lender view since publication." Two engagement cards:
    - **CIM card** — buyer-facing mint chip header. Three stats row (Views 1, Avg time 4m 12s, Downloads 0). **12-bar section heatmap** under "Time per section · 12 sections" — bars sized from `CIM_HEATMAP` array. Section 1 (Executive Summary) tallest at 100% height in solid mint; Section 6 (Deal Structure & Terms) second at 78% also solid mint; all other 10 bars at 22–55% in soft mint (`rgba(44,140,112,.30)`). Hovering a bar lifts it -2px and surfaces a dark tooltip naming the section + simulated avg time (e.g. "Executive Summary · 1m 42s avg"). Below: `Most-read: Executive Summary · 1m 42s`. **Mint insight chip:** "Buyer spent the most time on Deal Structure — SBA financing terms are the primary interest." NDA status line: `NDA · 1 pending · 0 signed` (flips to `0 pending · 1 signed` when Marcus Rivera is approved).
    - **P&L Recast card** — lender-facing sky chip header. Three stats row (Views 1, Avg time 2m 38s, Downloads 0). Most-viewed-section row (`Add-Back Schedule · 1m 18s`) in a sky-tinted callout. **Sky insight chip:** "Lender reviewed add-back schedule — DSCR and add-back defensibility are the focus." NDA status: `NDA · Not required · access pending` (flips to `· access granted` when Northeast Community Bank is approved).
  - **Document preview drawer** (right-side slide-over, 560px wide, dark `rgba(12,10,9,.40)` overlay, 300ms slide). Click anywhere on the overlay or press **ESC** to dismiss. Header: `Read-only · VDR` mono eyebrow + document title + `v1.0` chip + close X. Body is a scrollable container that **reuses the existing station components in read-only mode** — `<DocumentsStation persona={persona} readOnly />` renders the same CIM document preview surface from Station 7 (off-white #faf9f7, Garamond, 12-section accordion with Sections 1 + 6 expanded by default, no terminal card, no approve gate, no ARIA header). `<RecastStation persona={persona} readOnly />` renders the same Recast surface from Station 5 (before/after 3-year P&L, add-back schedule, normalized SDE row, valuation output, no working state, no approve gate). One prop, no new document rendering logic — exactly what the spec called for.
- Added `readOnly?: boolean` prop to `DocumentsStation` (`components/scorta/DocumentsStation.tsx`). When `readOnly` is true: skip the picker, skip the terminal stream, hide the station header + ARIA banner + approve gate, force `started = streamComplete = previewVisible = true` so the document preview is the only thing visible. The stream `useEffect` early-returns. All approval logic remains dormant.
- Added `readOnly?: boolean` prop to `RecastStation` (`components/scorta/RecastStation.tsx`). When `readOnly` is true: skip the 1.8s working state entirely, force `surfaceVisible = true` immediately, hide the station header + ARIA banner + approve gate. Working `useEffect` early-returns.
- New route `app/(app)/vdr/page.tsx` — server component that renders `<VDRStation persona={PERSONA} />`. Sits inside the `(app)` group so it inherits the AppShell rail / topbar / AgentActivityPanel.
- Updated `lib/persona.ts` STATIONS: inserted `/vdr` between `/documents` and `/marketplace` with `state: "active"` (always-on per spec — the design system supports only ✓/●/○ indicators, so per spec lines 384–388 the active treatment stands in for the ◈ persistent indicator). Renamed `/marketplace` label `Lenders / VDR / Listings` → `Lenders / Listings` since the VDR now has its own rail entry.

**Mocked / hard-coded:**
- All pending requests, activity log entries, engagement stats, and section heatmap heights are simulated demo data per spec lines 199–283. The two pending parties (Marcus Rivera as SBA-Backed Operator buyer, Northeast Community Bank as SBA 7(a) lender) match the Boardroom's WO 4 buyer priority and the lender matching narrative the upcoming `/marketplace` station will surface (Northeast Community Bank = the 94% match).
- Deal share link: `scorta.io/vdr/${persona.identity.businessSlug}-7f3a` (slug from persona, 4-char suffix `7f3a` is a hard-coded mock — real implementation would generate per-deal).
- The deal header chips read from `persona`: SBA eligibility, DSCR 4.4×, Scorta Score 71/100, Transferability 38/100 — all from `persona.scorta` + `persona.sba`. No invented numbers.
- The CIM section heatmap (`CIM_HEATMAP` constant) uses fixed heights — Section 1 at 1.0 (tallest, mint solid), Section 6 at 0.78 (second tallest, mint solid), other 10 sections at 0.22–0.55 (muted mint). Per-section times (e.g. "Executive Summary · 1m 42s avg", "Deal Structure · 58s") are mock copy that ties the heatmap to the Boardroom's prediction about SBA-Backed Operator focus on deal structure.
- Today's published date for both documents is generated live from `new Date()` — same rule as audit lines in prior stations. Every other timestamp ("Today · 10:52 AM", "2 hours ago", "45 minutes ago") is hard-coded mock per spec.
- Timing budget (`T = { … }` in VDRStation.tsx):
  - `approveSpinnerMs: 700` — pending request → granted state flip
  - `copyToastMs: 1500` — "Copied ✓" tooltip on the deal link
  - `shareTipMs: 2200` — Send Access Request tooltip flash
  - `downloadTipMs: 2200` — Download button tooltip flash
  - `drawerEnterMs: 300` — preview drawer slide-in
- "Send Access Request" and Download buttons are tooltip-only no-ops per spec (no navigation). "Preview" opens the drawer with the read-only station component. "Manage Access" toggles a small popover that shows the empty active-access list (per spec line 339).

**Left for next session:**
- Open **Station 8 — Scorta Score (`/score`)** per the original State Tracker. Replace the LockedStation in `app/(app)/score/page.tsx` with the animated 0–100 score dial (71/100 overall · "Strong SBA Candidate"), the sub-score breakdown (Financial Health 68 · Market Position 74 · Transferability 38 · Documentation Quality 65 — Transferability is the dominant drag per `DEMO_PERSONA.md` Section 5), and the improvement accordion. Per the existing Station 7 handoff: the two-tier donut pattern (current vs. ceiling) established on `/risk` is the right model for visualizing Transferability 38 → 62 within the overall score.
- After Station 8 ships, flip `/documents` from `state: "active"` → `state: "shipped"` and `/score` from `state: "locked"` → `state: "active"` in `lib/persona.ts`. `/boardroom` stays `active`. `/vdr` stays `active` (always-on). `/marketplace` remains locked until Station 9.
- When **Station 9 (`/marketplace`)** is built, every lender card must include a `View in VDR →` CTA that routes to `/vdr` (per VDR spec line 47). The lender's access request (Northeast Community Bank, currently pending in the VDR access log) is the bridge between marketplace match and VDR access — approving the pending request on the VDR should be reflected on `/marketplace` as "VDR access granted." For the demo, a shared `VDRContext` (or sessionStorage flag — same pattern as `AgentFleetContext`) is the way to wire this cosmetic cross-station state. Same pattern for **Station 10 (`/outreach`)** and the Marcus Rivera buyer access flow.

**Decisions made (that future sessions must respect):**
- **The VDR carries different visual gravity than agent stations.** Per spec lines 343–367, document cards in the library use a white elevated treatment with a 1px border + soft drop shadow ("real file cabinet"), explicitly contrasting with the glass-card pattern used for agent-output surfaces. The deal header is the same white-card treatment. The access log + engagement panels use the standard glass-card treatment (operational surfaces). This three-tier visual hierarchy (white file cabinet = published external artifact / glass = internal operations / off-white document = printed artifact in the drawer) is now established and should carry forward to the Lender Ops marketplace cards.
- **Read-only mode is a one-prop change to existing stations.** `DocumentsStation` and `RecastStation` each take a `readOnly?: boolean`. When true, they hide their station-frame chrome (header, ARIA banner, approval gate) and render only their core preview surface with `surfaceVisible = true` immediately (no animation, no working state). This pattern is the contract the VDR drawer relies on. Any future station that produces a published artifact (term sheet on `/marketplace`, LOI on `/outreach`) should expose the same `readOnly` prop so the VDR drawer can render it. Do not write VDR-specific preview surfaces — always reuse the originating station component in read-only mode.
- **Access approval is a 700ms spinner then a row flip.** No route change. The pending row replaces itself with a GRANTED activity entry in the log below (mint avatar variant). Engagement panel reactively updates (`NDA · 1 pending · 0 signed` → `0 pending · 1 signed`). This is the canonical pattern for any future "approve external party" interaction.
- **The CIM heatmap insight is the Boardroom's prediction confirmed by behavior.** The buyer (Marcus Rivera, SBA-Backed Operator) spending the most time on Deal Structure (Section 6) is exactly what the Boardroom predicted in its WO 4 buyer prioritization. The mint insight chip ("Buyer spent the most time on Deal Structure — SBA financing terms are the primary interest.") is the demo's "the agent fleet's predictions matched reality" moment. Carry this narrative forward to `/outreach` where the buyer pipeline Kanban should surface the same engagement signal.
- **The VDR rail indicator uses the active treatment (●).** Per VDR spec lines 383–388, the ideal would be a third indicator type (◈) communicating "persistent reference, not sequential step." The design system supports only ✓/●/○, so we use the active treatment — same as `/boardroom`. Both are always-on and never flip to "shipped." If a third indicator type is added later, both `/boardroom` and `/vdr` should adopt it together.

**QA Rule (Station 07b):**
1. Click-through: ✅ Navigating to `/vdr` loads the four-panel layout. Deal header shows Palace Kitchen & Catering with the four status chips (mint SBA · DSCR · Score / amber Transferability). The deal link copies on click and shows the "Copied ✓" toast for 1.5s. NDA toggle and Access Level pills are interactive. "Send Access Request" flashes the tooltip for 2.2s. Document tabs filter the library instantly (All shows both, Buyer/Lender each show one, Legal shows the placeholder). "Preview" on the CIM opens the read-only drawer with the full Station 7 preview surface (off-white CIM document, Sections 1 + 6 expanded). "Preview" on P&L Recast opens the read-only drawer with the full Station 5 recast surface (before/after 3-year P&L, add-back schedule, $962K SDE row, valuation output). Both drawers close on × and ESC. "Download" flashes the PDF tooltip for 2.2s. "Manage Access" toggles the empty-state popover. "Approve Access" on Marcus Rivera runs the 700ms spinner and flips the row to a GRANTED entry in the log (and the CIM engagement NDA counter flips 1 pending → 0 pending / 0 signed → 1 signed). "Approve Access" on Northeast Community Bank does the same (and the recast NDA line flips access pending → access granted). "Deny" greys the pending row immediately. The "8 additional documents" tile routes to `/documents` (per spec — the one VDR interaction that navigates away). Heatmap bars surface section-time tooltips on hover. `pnpm typecheck` clean. `pnpm exec eslint components/scorta/VDRStation.tsx components/scorta/DocumentsStation.tsx components/scorta/RecastStation.tsx app/(app)/vdr/page.tsx lib/persona.ts` produces zero output. Dev server compiles `/vdr` in ~1.6s with no errors.
2. Investor-ready on 1080p: ✅ Document cards in the library use the white file-cabinet treatment (1px border + soft shadow) — visually distinct from the glass cards used in other panels. Deal header reads as a real listing card with chips communicating SBA / DSCR / Score / Transferability status at a glance. Access log reads as a financial audit trail (mono timestamps, mint live dots, amber-tinted pending rows for "this needs your attention"). Engagement heatmap is readable and specific — the two tall mint bars at Section 1 + Section 6 make the buyer-focus narrative legible without copy. Both insight chips are concrete (SBA financing terms / DSCR + add-back defensibility), not generic. Preview drawers are full-height, scrollable, read-only, with the close X persistent in the sticky header. Mint accent budget held — agent attributions, live dots, status chips, the heatmap bars, and the primary CTAs only. Sky accent only on the lender-facing surface treatments. No placeholders except the "8 additional documents" row and the Legal tab placeholder (both intentional per spec).
3. Coherent story: ✅ Every number ties back to upstream stations. Deal header: $1.75M listing + 2.4× multiple (Recast valuation), DSCR 4.4× (Recast SBA context), Scorta Score 71 + Transferability 38 (Risk + Score sub-scores per `DEMO_PERSONA.md` Section 5). Document cards: CIM agent attribution `CIM Agent + Recast Agent + Boardroom` matches the Section 1 + Section 6 multi-agent chips in the Station 7 preview; P&L Recast attribution `Recast Agent` matches Station 5. Pending parties: Marcus Rivera as SBA-Backed Operator is consistent with Boardroom WO 4 ("target SBA first"); Northeast Community Bank as SBA 7(a) Specialist is the lender the Marketplace will surface as the 94% match. Engagement insight ("Buyer spent the most time on Deal Structure — SBA financing terms are the primary interest.") closes the loop with the Boardroom's prediction. The 10:52 AM CIM publish + 10:41 AM Recast publish timestamps in the activity log mirror the audit lines on `/documents` and `/recast`. Every value in the preview drawers matches Station 5 + Station 7 outputs exactly because the drawers literally render those station components in read-only mode.

**Open questions for the human:**
- None — VDR spec was fully self-contained. The next blocker is the cosmetic cross-station state for the upcoming `/marketplace` ("VDR access granted") and `/outreach` ("CIM opened") flags. Pattern is established (`AgentFleetContext` / sessionStorage) — the next session for those stations can wire it as a `VDRContext` reading the granted-request IDs.

---

#### 2026-05-18 — Station 7 ship — CIM & Documents

**Shipped:**
- New `components/scorta/DocumentsStation.tsx` — the full `/documents` workspace replacing the LockedStation stub. **Four-phase composition (picker → generation → preview → approval gate)** — the picker is a deliberate pre-step so the demo can show the seller "the agent fleet can produce all of these deliverables" before committing to the CIM build:
  - **Layer 0 — DOCUMENT PICKER (the new pre-step).** Glass card with `Document Fleet · 8 deliverables configured` mint mono eyebrow + Garamond H2 "What should we generate next?" + 2-column grid of 8 doc-type cards. Each card shows: 42px mono-uppercase letter avatar (CIM / TSR / LP / NDA / ABS / SOP / LOI / Q&A), Garamond 18px title, mint agent chip (`● [Agent Name]`), mono audience tag (`· Buyer-facing` / `· Lender-facing` / `· Legal · pre-VDR` / `· Internal · remediation` / etc.), 2-line description, dashed divider, footer with status mono line + Generate CTA. **CIM card is "primary"** — 3px mint top border, mint-tinted background, dark mint avatar, `Generate CIM →` in the standard primary button treatment, footer reads `Ready · primary build` in mint. **Other 7 cards are "ready-on-demand"** — white background, dark avatar, secondary-style "Generate →" button, footer reads `Ready on demand` in muted. Hover lifts each card -1px with soft shadow. Clicking the CIM CTA flips `started = true` and the existing generation flow runs. Clicking any other card surfaces a 2.2s tooltip flash: "Available on demand · the [Agent Name] will publish this to your VDR when you request it." — communicating that the dummy cards are wired conceptually even if not generating during the demo.
  - The eight doc types are bespoke to the Scorta narrative — every agent in the fleet is represented as a document producer: CIM Agent (CIM), Outreach Agent (anonymized listing teaser), Lender Ops Agent (SBA lender package — normalized P&L + add-back schedule + DSCR worksheet), Case Manager Agent (mutual NDA template), Recast Agent (add-back defensibility memo), Owner-Dependency Agent (operations manual / SOP library — the 5-task remediation deliverable), Boardroom (LOI template + buyer Q&A brief).
  - **Station header** (eyebrow `Station 07 · /documents` / agent label swaps per phase — `Document Agents · standing by` on the picker, `CIM Agent` with live mint pulse dot during the 3.6s generation. Garamond H1 "CIM & Documents" at 38px. Subhead also swaps per phase: picker reads "The Boardroom's dispatch authorized eight agent deliverables for Palace Kitchen. Each one is built from the same approved upstream data — your recast financials, risk profile, and buyer-targeting verdicts. Choose what to generate next." Generation/Complete copy reads as before.)
  - **ARIA intro banner** — orb + dynamic copy that swaps across three phases. **Picker phase:** "Every deliverable Palace will need for lender outreach, buyer outreach, and the close is one click away — each one assembled from the agents who already approved their underlying inputs. Start with the CIM (buyers see it first); the rest stand by until you call for them." **Streaming:** "The Recast Agent and Boardroom have handed off everything the CIM Agent needs. Palace Kitchen & Catering's Confidential Information Memorandum is being assembled now — 12 sections, built from approved data. Review and approve each section before it goes to buyers." **Complete:** "The CIM is ready for your review. Once you approve, the document publishes to the Virtual Data Room and your lender package distribution is authorized."
  - **Layer 1 — GENERATION (dark terminal card, `rgba(12,10,9,.92)`):**
    - Header row: traffic-light dots + mint pulse + `CIM AGENT · PALACE KITCHEN & CATERING` mono eyebrow + `cim-agent · assembling · live` host label + live `N / 12` counter
    - Single stream, 12 lines at 300ms cadence. Format: `[Section NN] Title... ✓` — bracket index in muted grey, title in light text (current line full-opacity / prior lines dimmed to .78), mint ✓ tail on each line
    - Auto-scrolling 320px log surface with blinking caret
    - After the 12th line + 180ms midpoint pause, terminal **collapses to a slim status bar** (10px padding, dark surface stays visible) reading `● CIM Agent · complete · 12 sections ✓` / `cim-agent · ready for review` — evidence the agent ran, per spec ("do not hide it")
    - Total perceived generation: **3.6s** (12 × 300ms) + 360ms full surface reveal of the preview
  - **Layer 2 — PREVIEW (CIM document surface):**
    - Off-white `#faf9f7` background, Garamond throughout, soft warm-brown borders (`rgba(122,107,86,.14–.18)`) so the surface feels like a printed PDF cover — not a dashboard card. Generous 44/56px padding.
    - **Document header** (centered, hairline divider below): `CONFIDENTIAL INFORMATION MEMORANDUM` mono-uppercase eyebrow (3.6px tracking) → Garamond 30px business name → italic "Prepared by Scorta" → mono date line `${todayLong} · SBA 7(a) Eligible · Listed: $1.75M` → Scorta wordmark (S avatar + "Scorta" + `Broker of Record` mono caption)
    - **12 accordion section rows** below. Each row: 2-digit Garamond number (e.g. `01`) + Garamond section title (24px for the two expanded sections, 19px for collapsed) + mint section chip `● Complete · [agent attribution]` + chevron that rotates 180° when open. Hairline 1px borders between rows.
    - **Section 1 (Executive Summary, expanded by default):** 4 paragraphs of Garamond 16.5px prose at 1.7 line-height. Every paragraph references Palace explicitly — paragraph 1 (15-year business + 4,200 sq ft owned facility), paragraph 2 (18% CAGR + $962K Year 3 SDE + $827K → $934K → $962K trend + $147K add-backs), paragraph 3 ($1.75M listing + 2.4× multiple + 4.4× DSCR + $106K down + property as balance sheet asset), paragraph 4 (38/100 → 62/100 transferability + $450K SOP unlock + NJ Transit 19% / 6-year tenure / 3-year contract in progress). All numbers pulled from `persona.financials`, `persona.sba`, `persona.risk` — no hard-coded magic numbers.
    - **Section 6 (Deal Structure & Terms, expanded by default):** Two-column layout matching the Recast station's valuation panel rhythm. **Left column** = the numbers, in a soft cream-tinted panel: Listing Price `$1,750,000` (Garamond 22px anchor), Multiple `2.4× SDE`, Valuation Range `$1.6M – $1.9M`, Asset Floor `$500K` (muted) → hairline divider → `SBA 7(a) Financing` mono subsection label → Loan `$1,090,000 (87.5% financed)` / Down `$106,000 minimum` / Service `$14,200/month` / DSCR `4.4× (floor 1.25×)` (mint-emphasized) → divider → Seller Note `$175K – $229K optional` / Earnout `Available on request`. **Right column** = the three buyer profile cards using established Boardroom accent tokens (mint SBA, sky Search Fund, peach Micro-PE), each with full verbatim condition text from the spec. Hovering a card lifts it -1px with soft accent-tinted shadow.
    - **Sections 2–5, 7–12 (collapsed by default):** Each row shows the chevron + agent chip only. Clicking expands to a mint dashed placeholder: `Section NN content available in VDR · approved for buyer access`. Agent attributions hard-coded per spec lines 198–208 (CIM Agent / Recast Agent / Owner-Dependency Agent / Concentration Agent / Boardroom — Section 12 = Boardroom). Hovering any chip surfaces a dark tooltip naming the source: e.g. Section 12 reads "Built from Boardroom's buyer persona analysis — SBA-Backed Operator and Micro-PE prioritized" (exact spec text).
  - **Layer 3 — APPROVAL GATE (mint gradient banner, canonical pattern):**
    - Breathing ARIA orb + `CIM AGENT · AWAITING YOUR APPROVAL` mono eyebrow + headline "Approve the CIM for VDR release." + body explaining VDR publication, NDA gating, lender package reference, and per-section re-approval (verbatim from spec)
    - Two CTAs:
      - Secondary `Preview full CIM` — tooltip-only, 2.2s flash: "Full 12-section CIM available in your VDR." (no navigation per spec)
      - Primary `Approve & Publish to VDR →` — 700ms spinner ("Publishing to VDR...") → flips to mint "Published · routing to Marketplace" → 520ms audit hold → `router.push("/marketplace")`
    - **Audit confirmation line** (mono, mint, dashed mint divider above, follows Station 5 canonical pattern): `✓ CIM approved by Chandan Patel · [today] · [time] · Published to VDR · Lender package distribution authorized.` Date + time generated live from `new Date()` — every other value hard-coded.
- Updated `app/(app)/documents/page.tsx` to render `<DocumentsStation persona={PERSONA} />` (server → client component pattern, matches `/recast` / `/risk` / `/boardroom` / `/ingestion`).
- Flipped `lib/persona.ts` station states: `/risk` `active → shipped` (✓ in left rail), `/documents` `locked → active`, agent label changed from "Boardroom" to "CIM Agent" to match the station's owning agent. `/boardroom` stays `active` (always-on per Boardroom spec). `/marketplace` remains locked (Station 9).

**Mocked / hard-coded:**
- All 12 section titles + agent attributions come **verbatim from the Station 7 spec** (`station-agent8.md` lines 99–110 for stream order, lines 198–208 for collapsed-section attributions). Note: the spec's section titles diverge from `DEMO_PERSONA.md` Section 10 (e.g. spec Section 4 = "Market & Competition" vs. persona "Financial Performance (3-Year)"; spec Section 6 = "Deal Structure & Terms" vs. persona "Customer & Revenue Analysis"). **The Station Card spec wins** because it explicitly defines each section with attribution and ordering, and downstream stations reference this layout (Section 6 expanded = Deal Structure, Section 12 attribution = Boardroom). If a future demo run wants persona-file alignment, update `DEMO_PERSONA.md` Section 10 to match the spec's titles.
- Executive Summary prose (Section 1, 4 paragraphs) follows the spec verbatim with one substitution: every dollar/percent/score figure reads from `PERSONA` not from hard-coded strings (e.g. `${persona.financials.appliedMultiple}×`, `${persona.sba.dscr}×`, `${persona.risk.ownerDependencyScore}/100`). This guarantees the CIM reflects any future persona file edit without code change. The 3-year SDE trend ($827K → $934K → $962K), the $147K add-back total, the 4,200 sq ft facility size, and the 3-year contract framing are demo-purpose specifics that match the upstream Ingestion + Recast + Risk + Boardroom outputs.
- Deal Structure (Section 6) numeric block — Loan $1,090,000, Down $106,000, Service $14,200/month, DSCR 4.4× — pulled from `persona.sba`. Seller note $175K–$229K from `persona.sba.sellerNoteLow/High`. Buyer profile chip bodies are hard-coded verbatim from spec lines 237–251 (SBA: "Full SBA 7(a) structure available at $106K down. Conditional on SOP documentation completion. Pre-qualified lender matches available in VDR." / Search: "SBA or seller-financed. Conditional on 3-year NJ Transit contract confirmation. Outreach held pending contract status." / Micro-PE: "Cash + seller note. $175K–$229K seller note (10–15% of deal). No hard conditions — prefers faster close. Platform acquisition framing.").
- Persona accent colors held to the established Boardroom palette: SBA-Backed Operator → mint, Search Fund → sky, Micro-PE → peach. No new colors.
- Timing budget lives in `T = { … }` at the top of `DocumentsStation.tsx`:
  - `streamStepMs: 300` (12 lines × 300ms = 3.6s — non-negotiable per spec)
  - `streamTailMs: 360` (pause between final stream line and preview reveal; the terminal collapses to status bar halfway through this pause for a satisfying handoff)
  - `surfaceRevealMs: 360` (preview surface + approve gate slide-in)
  - `approveSpinnerMs: 700` ("Publishing to VDR..." cycle)
  - `auditHoldMs: 520` (audit line visible before route fires)
  - `previewTipMs: 2200` ("Full 12-section CIM available in your VDR." tooltip flash)
  - Total perceived run: **3.6s** stream + 360ms preview reveal ≈ 4.0s from arrival to actionable surface. Approve flow: 700ms spinner + 520ms audit hold = 1.22s to route.
- Document header date is generated live from `new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })` — every other value hard-coded, same rule as the audit lines in prior stations.
- "Preview full CIM" is a tooltip-only no-op per spec — no VDR navigation wired.

**Left for next session:**
- Open **Station 8 — Scorta Score (`/score`)**. Replace the LockedStation in `app/(app)/score/page.tsx` with the animated 0–100 score dial (71/100 overall · "Strong SBA Candidate"), the sub-score breakdown (Financial Health 68 · Market Position 74 · Transferability 38 · Documentation Quality 65 — Transferability is the dominant drag, all other sub-scores are solid per `DEMO_PERSONA.md` Section 5), and the improvement accordion. The Documents station already hands off via `Approve & Publish to VDR →` CTA — Score should arrive in a "CIM published · Case Manager Agent calculating final score" framing. The two-tier donut pattern (current vs. ceiling) established on `/risk` is the right model for visualizing Transferability 38 → 62 within the overall score.
- Persona-source for next station: `DEMO_PERSONA.md` Section 5 (Scorta Score sub-scores) + Section 6 (Transferability deep-dive — drives the dominant sub-score story). Reuse the `◇ approval surface` dashed-strip pattern from `/risk` for sub-score acceptance (conceptual approval, no immediate action) — distinct from the canonical mint gradient banner.
- After Station 8 ships, flip `/documents` from `state: "active"` → `state: "shipped"` and `/score` from `state: "locked"` → `state: "active"` in `lib/persona.ts`. `/boardroom` stays `active`. `/marketplace` remains locked until Station 9.

**Decisions made (that future sessions must respect):**
- **The CIM preview is a document, not a dashboard.** Off-white `#faf9f7` background, Garamond throughout, soft warm-brown borders, generous 44/56px padding, centered document header with mono-uppercase eyebrow. This is the **first time the demo presents a deliverable buyers actually receive**, so the visual language deliberately shifts from operational glass cards to printed PDF cover. The contrast between the dark terminal card (machine builds it) and the warm off-white document surface (human reviews it) is the demo's most direct visual articulation of "the agent fleet produced a real deal artifact."
- **Stream then collapse-but-do-not-hide pattern.** The 12-line generation runs in a full dark terminal card, then collapses to a slim 10px status bar (still dark, still visible) so the user retains evidence that the CIM Agent actually ran. This is distinct from `/risk`'s analysis surface (which gets replaced entirely by the output) — for a document-producing agent, the terminal stays as a kind of receipt. Reuse this collapse-to-status-bar pattern on `/marketplace` for the Lender Ops Agent's lender match run (the operational receipt stays visible while the matched lenders render below).
- **Section attribution chips are the demo's visual proof of the agent fleet's interconnectedness.** Each section row shows which agent(s) produced it (CIM Agent / Recast Agent / Owner-Dep Agent / Concentration Agent / Boardroom — multi-agent attributions for Sections 1 and 6 reading `Recast Agent + CIM Agent` and `Recast Agent + Boardroom`). Hovering a chip surfaces a dark tooltip naming the upstream work product. The Section 12 chip explicitly references the Boardroom's buyer persona analysis — that hover is the clearest downstream reference to the Boardroom in the CIM. Reuse multi-agent attribution chips anywhere a downstream artifact is composed from multiple agents' outputs.
- **Document header date is the only live value on a published artifact.** Same rule as audit lines in prior stations: when a station produces a dated deliverable (CIM, future term sheets, future LOIs), the date generates from `new Date()` and every other value is hard-coded. This keeps the demo internally consistent ("today's CIM") without requiring fixture-date plumbing.
- **Per-section approval is conceptual on the CIM — bulk approval at the bottom is the real action.** Per spec, "You can update individual sections at any time — updates require re-approval." For the demo, the sections themselves don't have approval surfaces; only the bottom `Approve & Publish to VDR` is real. This is distinct from `/risk`, where each agent's output had its own `◇` approval strip. The CIM is treated as a unified artifact at the approval level even though it was assembled from multiple agents. Reuse this distinction: when an artifact is published as a single deliverable to a downstream party (lenders, buyers), approval is a single gate; when an artifact is a workspace for operator review (risk profile, score breakdown), approval can be per-section.
- **Audit line names *what* is being published, not just who signed.** Format: `✓ CIM approved by {name} · {date} · {time} · Published to VDR · Lender package distribution authorized.` This is the canonical form established in Station 5 — every audit line on a publishing action must name the artifact, the destination (VDR), and the secondary authorization (lender package distribution). Apply to `/marketplace` lender package send and `/outreach` buyer NDA flow.

**QA Rule (Station 7):**
1. Click-through: ✅ Direct navigation to `/documents` (or arriving from `/boardroom` via Dispatch Agent Fleet → which already routes here per Station 6b's wiring) loads with the ARIA intake intro + Station header (CIM Agent eyebrow + live mint pulse dot) + dark terminal card. 12 lines stream at 300ms cadence in `[Section NN] Title... ✓` format. After the final line + 180ms midpoint pause, terminal collapses to the slim status bar (`● CIM Agent · complete · 12 sections ✓ / cim-agent · ready for review`). Document preview surface slides in (360ms ease-out). Document header reads as a real CIM cover. Section 1 expands by default with 4 paragraphs of Palace-specific prose. Section 6 expands by default with the 2-column deal structure (numbers left, buyer profile chips right). Hovering each agent chip surfaces a dark tooltip naming the upstream agent. Hovering each buyer profile card lifts it. Toggling any collapsed section's chevron rotates 180° and reveals the mint dashed `Section NN content available in VDR · approved for buyer access` placeholder. "Preview full CIM" flashes the VDR tooltip for 2.2s (no navigation). "Approve & Publish to VDR →" → 700ms spinner ("Publishing to VDR...") → audit line `✓ CIM approved by Chandan Patel · [today] · [time] · Published to VDR · Lender package distribution authorized.` → 520ms hold → routes to `/marketplace` (LockedStation, still — that's the next station to build). `pnpm typecheck` clean. `pnpm exec eslint components/scorta/DocumentsStation.tsx app/(app)/documents/page.tsx lib/persona.ts` produces zero output for new files. Pre-existing lint warnings in AppShell.tsx / AriaHero.tsx / exitiq/* unchanged.
2. Investor-ready on 1080p: ✅ Document preview surface reads as a real CIM cover, not a dashboard card. Centered Garamond document header with mono-uppercase eyebrow at 3.6px letter-spacing, Garamond 30px business name, italic "Prepared by Scorta", mono date line, Scorta wordmark with `Broker of Record` caption. Section 1's 4 paragraphs at Garamond 16.5px / 1.7 line-height are dense and specific — every paragraph references Palace explicitly. Section 6's two-column deal structure has the same visual rhythm as the Recast valuation panel: left numbers panel with the $1,750,000 listing as the Garamond 22px anchor + mint-emphasized DSCR, right buyer profile chips using established mint/sky/peach accent tokens. Terminal card generation is visible and satisfying; the collapse-to-status-bar transition feels intentional. Approval banner communicates that this is a real publishing action — VDR + lender package distribution named explicitly. Mint accent budget held — only on agent chips, ✓ marks, DSCR row, listing price treatment, and the approve CTA. No placeholders, no lorem ipsum, no "Coming Soon" anywhere.
3. Coherent story: ✅ Every number ties back to upstream stations and persona files. Executive Summary: $2.1M revenue + 18% trend (matches Ingestion + Recast Year 3), $962K Year 3 SDE + $827K/$934K/$962K trend (matches Recast normalized SDE), $147K add-backs (matches Recast total), $1.75M listing + 2.4× multiple (matches Recast valuation), 4.4× DSCR + $106K down (matches Recast SBA context + persona Section 7), 38/100 → 62/100 transferability + $450K unlock (matches Risk output), NJ Transit 19% / 6-year tenure / 3-year contract (matches Risk Concentration output + Boardroom WO 2). Deal Structure: same numbers re-presented in the deal-doc context + the three buyer profile chips quoting verbatim the Boardroom's conditional/proceed framings (SBA conditional on SOPs, Search Fund conditional on NJ Transit 3-year, Micro-PE proceed with $175K–$229K seller note). The chain `Recast valuation → Risk remediation plan → Boardroom buyer verdicts → CIM publishable artifact` reads coherently end-to-end. Same company, same numbers, same buyer names, same agent attributions across `/recast` / `/risk` / `/boardroom` / `/documents`.

**Open questions for the human:**
- **Spec-vs-persona-file section title divergence.** Station Card spec uses different titles for Sections 4, 6, 8, 9, 10, 12 than `DEMO_PERSONA.md` Section 10. I prioritized the spec because it explicitly enumerates each section + attribution + ordering. If the persona file is the canonical source, `DEMO_PERSONA.md` Section 10 needs editing to match (current spec titles: Executive Summary / Business Overview & History / Products & Services / Market & Competition / Financial Performance / Deal Structure & Terms / Operations & Staffing / Owner-Dependency Remediation / Customer Concentration Analysis / Facilities & Equipment / Growth Opportunities / Buyer Qualification Criteria). No code change needed either way — the section list lives in `SECTIONS` at the top of `DocumentsStation.tsx`.

---

#### 2026-05-18 — Station 6 ship — Risk Analysis (intake → analysis → output)

**Shipped:**
- New `components/scorta/RiskStation.tsx` — the full `/risk` workspace replacing the LockedStation stub. Three-phase state machine (`intake` → `analyzing` → `output`):
  - **Station header** (eyebrow `Station 06 · /risk` / `OWNER-DEPENDENCY · CONCENTRATION AGENTS` with live mint pulse dot during the analyzing phase, Garamond H1 "Risk Analysis" at 38px, forward-looking subhead naming the Boardroom as the downstream consumer of the risk profile).
  - **ARIA intro banner** — orb + dynamic copy that swaps per phase. Intake: explains the Q&A intake and one-pager upload alternative. Analyzing: "agents are reading your answers in parallel." Output: "review the transferability profile … hand off to the Boardroom."
  - **Phase 1 — INTAKE:**
    - **Pill toggle** (`Answer Questions` / `Upload One-Pager`) with active state surface — questions mode is default.
    - **Owner-Dependency intake card** — `OWNER-DEPENDENCY AGENT · intake` mint chip eyebrow + Garamond H2 + subhead + 8 questions (Q1 textarea / Q2 textarea / Q3 number / Q4–Q5 select / Q6 textarea / Q7–Q8 select). 3px mint accent top border.
    - **Concentration intake card** — `CONCENTRATION AGENT · intake` sky chip eyebrow + Garamond H2 + subhead + 5 questions (Q1 select / Q2 textarea / Q3 select / Q4 number / Q5 select). 3px sky accent top border.
    - All 13 fields pre-filled verbatim from the Station Card's spec defaults (Q2 of Owner-Dep names the 5 owner-dependent task areas verbatim, Q2 of Concentration names NJ Transit Corporate Catering with the 6-year monthly invoicing relationship). Fields are editable but edits don't change the output (happy path only — explicitly per spec).
    - **Submit bar** — canonical mint gradient banner with breathing ARIA orb + `READY WHEN YOU ARE` mono eyebrow + body + primary `Confirm Answers & Run Analysis →` CTA. 700ms spinner ("Analyzing your answers...") on click, then state flips to analyzing.
    - **Upload path** — dashed dropzone with mint icon circle + Garamond H2 "Drop a one-pager here, or click to browse" + descriptive subhead + mono `PDF · DOCX · up to 25MB` line. Click fires a 2.2s tooltip flash: "Document ingestion available — demo uses Q&A mode for this walkthrough." Non-functional per spec.
  - **Phase 2 — ANALYZING:**
    - Dark terminal-card analysis surface (`rgba(12,10,9,.92)` bg — same family as Ingestion Agent log + Boardroom work orders) with `RISK ANALYSIS · AGENTS RUNNING IN PARALLEL` mint eyebrow + live mint pulse dot + `palace-kitchen · live` host label.
    - **Two parallel stream columns** — Owner-Dependency Agent (left, mint accent) and Concentration Agent (right, sky accent). Each column has agent eyebrow + 5 status lines that stream in at 400ms cadence, current line full-opacity / prior lines dimmed to 55% — plus a 5-segment progress strip that fills as the lines advance. Both streams advance in lockstep through a single `streamIdx` so the parallel-reasoning visual is genuinely synchronous.
    - **Closing line** below both streams: `Streaming agent reasoning · N / 5` while running, flipping to `Analysis complete. Generating risk profile...` when both finish. After 5×400ms + 320ms tail = 2.32s total, phase auto-flips to output.
  - **Phase 3 — OUTPUT:**
    - **Section 1 — Owner-Dependency output** (visually dominant, larger card, mint accent border): mono mint eyebrow `OWNER-DEPENDENCY AGENT · OUTPUT` + Garamond H2 30px "Transferability profile & remediation plan" + narrative that references the seller's specific answers (5 tasks, 0 SOPs, most vendor contracts personal — 38/100 → 62/100 with +$450K unlock).
      - **Transferability donut** (left, 200px svg) — circular ring showing the current 38/100 score in peach + a dimmed mint outer arc indicating the 62/100 target. Garamond 56px score numeral + mono `/ 100 Transferability` caption. Dashed-mint divider below + legend rows showing `Today 38 / 100` (peach dot) and `Target (post-remediation) 62 / 100` (mint dot @ 50% opacity).
      - **Right rail:** Projected Outcome card — mint gradient surface with `PROJECTED OUTCOME · 5 TASKS COMPLETED` eyebrow + 3 outcome metrics (Transferability `38 → 62` / +24 points, Deal value unlock `+$450K` mint-emphasized at 26px / lender + buyer pool, Effort `~6 weeks` / agent-assisted SOP gen). Below: SignalRow — 3 stat tiles (Staff with 3+ yr tenure `1 of 11`, Documented SOPs `0`, Key-person risk `HIGH`).
      - **5-task remediation list** below: each row has a mint numbered chip (1–5), task title + body, and a mint `+N pts` chip on the right showing the score lift (+8/+5/+4/+4/+3 = 24 total). Hover lifts the row -1px with soft shadow. Tasks 1–5 reference the verbatim Q2 answer areas: catering sales/contracts, vendor negotiations, daily bank deposits, staff scheduling, health inspection responses.
      - **`◇ Approval surface`** strip below the task list — dashed mint border, label "Review & Approve Remediation Plan", hint "Plan locks into the Boardroom work order once the Owner-Dependency Agent's output is approved downstream."
    - **Section 2 — Concentration output** (smaller, less dominant, sky accent border): mono sky eyebrow `CONCENTRATION AGENT · OUTPUT` + Garamond H2 24px "Revenue concentration & contract coverage" + narrative explaining the 19% / month-to-month / Search Fund deal-breaker framing.
      - **Sky donut** (156px svg) — 19% share + mono `Top customer` caption + footer line "Concentration target: keep below 25%".
      - **Right rail:** SignalRow with 3 tiles (Top account `NJ Transit Corporate Catering`, Tenure `6 years`, Contract status `Month-to-month`) + sky-tinted callout: "Within SBA threshold — monitor. … the lack of a written contract is the risk — not the share."
      - **Single task row** (numbered 1, sky chip): "Convert NJ Transit relationship into a 3-year written contract" + body + `→ Triggered by: Search Fund deal-breaker · Lender monitoring flag`.
      - **`◇ Approval surface`** strip — dashed sky border, "Review & Approve Concentration Playbook" / "Approving the playbook authorizes the Concentration Agent to draft the NJ Transit extension proposal for review."
    - **Open Boardroom handoff** — dark terminal-card surface (matching the Boardroom work orders panel) with breathing ARIA orb + mint eyebrow `RISK PROFILE COMPLETE · ARIA · CASE MANAGER` + headline "The Boardroom is ready to review." + body about the 3 buyer agents. Primary mint CTA `Open Boardroom →` — 520ms spinner ("Opening Boardroom...") then `router.push("/boardroom")`. No audit line on this handoff (pure navigation per spec — the Boardroom has its own approval gate that produces the audit moment).
- Updated `app/(app)/risk/page.tsx` to render `<RiskStation persona={PERSONA} />` (server → client component pattern, matches `/recast` / `/boardroom` / `/ingestion`).
- Flipped `lib/persona.ts` station states: `/recast` `active → shipped` (✓ in left rail), `/risk` `locked → active`. `/boardroom` stays `active` (always-on station per Section 12 decision).

**Mocked / hard-coded:**
- All 13 pre-filled intake answers come **verbatim from the Station 6 spec** (`station-agent7.md` lines 113–202). Q2 of Owner-Dep enumerates the 5 task areas exactly (catering client calls and contract negotiations, vendor price negotiations, daily bank deposits, staff scheduling decisions, health inspection responses) — these names then flow downstream into the 5 remediation task titles so the chain answer → reasoning → output is internally consistent. Q2 of Concentration names "NJ Transit Corporate Catering" with the "6-year relationship, monthly invoicing, no formal multi-year contract" framing — that language is repeated in Section 2's narrative and the contract-extension task body.
- All scores trace to `DEMO_PERSONA.md` Section 6: Owner-Dependency 38/100, Target Transferability 62/100, +$450K fix-value unlock, Staff with 3+ yr tenure 1 of 11, Documented SOPs 0, Top Customer Share 19%, NJ Transit 6-year tenure, "Within SBA threshold — monitor."
- The 5 remediation task titles (catering sales playbook / vendor negotiation SOP / bank deposit delegation / scheduling SOP / health inspection protocol) are bespoke to map 1:1 with the Q2 owner-dependency task areas. Individual score lifts (+8/+5/+4/+4/+3) are demo-purpose interpolations within the 38→62 gap (24 points total = exact match). The titles aren't lifted from a persona file — they are the persona's own Q2 list re-cast as SOP/remediation work items. Spec says "the tasks shown in the output should reference the language the seller used in their answers — even in the demo, the pre-filled Q2 answer maps to the five task titles."
- Concentration playbook is the single NJ Transit contract-extension task, mirroring Boardroom Work Order 2's framing ("Draft a contract extension proposal … 3-year renewal") so `/risk`'s output reads consistently with what the Boardroom dispatches.
- Timing budget lives in `T = { … }` at the top of `RiskStation.tsx`:
  - `streamStepMs: 400` (analysis line cadence)
  - `streamLines: 5` (5 lines per stream — non-negotiable per spec)
  - `streamTailMs: 320` (pause after both streams complete before output reveal)
  - `fadeOutMs: 200` (intake fade-out — not used directly since phase flip is hard cut on the analysis surface mount; the intake state simply unmounts when phase changes)
  - `surfaceRevealMs: 360` (output surface + Boardroom gate slide-in)
  - `submitSpinnerMs: 700` (submit → analysis start)
  - `navSpinnerMs: 520` (Open Boardroom press hold before route fires)
  - Total perceived run: 700ms submit + 5×400ms streams + 320ms tail + 360ms reveal ≈ **3.4s** from "Confirm Answers" click to output visible. Boardroom handoff: 520ms spinner → route.
- The "edits don't change output" rule is enforced by not reading state in the output components — they pull from `PERSONA` and the hard-coded `REMEDIATION_TASKS` / `CONCENTRATION_TASK` constants. Per spec: "In production, edits would rerun the model." For the demo, fields are visibly editable so the seller can demonstrate the interaction, but the agent output is deterministic.
- Upload zone is non-functional. Clicking fires a 2.2s tooltip "Document ingestion available — demo uses Q&A mode for this walkthrough." per spec.

**Left for next session:**
- Open **Station 7 — CIM / Doc Gen (`/documents`)**. Replace the LockedStation in `app/(app)/documents/page.tsx` with the Generate-CIM action, generation progress (re-use the streaming pattern — the 12-section CIM structure in `DEMO_PERSONA.md` Section 10 streams one section title at a time with a typewriter feel), CIM preview card with Section 1 (Executive Summary) populated from the locked Exit IQ report, Sections 2–12 collapsed to titles only, and a download CTA. The Boardroom currently routes to `/documents` after dispatch — once Station 7 ships, the demo path is `/recast → /risk → /boardroom → /documents`.
- Persona-source for next station: `DEMO_PERSONA.md` Section 10 (CIM Structure — 12 sections), Section 7 (SBA Financing — needed for the Deal Structure section), and `demo-report.md` (Executive Summary content for Section 1).
- After Station 7 ships, flip `/documents` from `state: "locked"` → `state: "active"` and `/score` remains locked. The Boardroom stays `active` per the always-on decision.

**Decisions made (that future sessions must respect):**
- **Intake → Analysis → Output is the demo's "agent reasoning chain" moment.** The seller types (or confirms) their answers, watches the agents read them in parallel, then sees the score and plan derived from their words. The 5-line-per-agent dual stream is the visual proof that two specialized agents are running concurrently — not one big model with two prompts. Reuse the dual-stream terminal-card pattern anywhere two agents reason concurrently on the same input.
- **Approval surface = `◇` dashed border strip beneath any agent output.** This station introduces a lightweight approval surface treatment (mint or sky dashed border, `◇ APPROVAL SURFACE` mono eyebrow, label + hint, no button) — used when the approval is conceptual / handed off downstream, distinct from the canonical mint gradient banner used when approval triggers an immediate action (Recast publish, Boardroom dispatch). The dashed surface is the right pattern for "this is reviewable, but the actual approval happens at the Boardroom / next station." Reuse on `/documents` for CIM section approvals and on `/score` for sub-score acceptance.
- **The 5-task remediation list maps 1:1 to the Q2 owner-dependency answer.** The seller's literal words ("catering client calls and contract negotiations, vendor price negotiations, daily bank deposits, staff scheduling decisions, health inspection responses") become the 5 SOP task areas — so the agent appears to have read and structured the seller's answer rather than generated a generic list. Preserve this connection: if the persona's Q2 ever changes, the 5 task titles must change to match.
- **The two-tier donut (current vs target) for transferability is the central visual.** Peach arc on top showing 38/100 today, dimmed mint outer arc behind showing 62/100 target, both anchored at 12 o'clock. The contrast between the two arcs is the demo's most direct visual representation of "the gap that Scorta closes." Reuse this two-tier pattern on `/score` for Scorta Score current vs. ceiling.
- **Section 1 visually dominates Section 2.** Owner-Dependency output card is taller, has a 30px Garamond H2 + donut + 3-metric outcome card + 5-task list; Concentration output card is shorter, has a 24px Garamond H2 + smaller donut + 1-task list. The visual hierarchy reinforces the spec: owner-dependency is the +$450K story, concentration is the "watch and document" story. Do not equalize them.
- **Open Boardroom handoff has no audit line.** Per spec: "Same as original Station 6 brief. Dark nav panel, single CTA: 'Open Boardroom →' → /boardroom. No spinner, no audit line. Pure navigation." We do show a 520ms spinner on the CTA (the canonical pattern across other handoffs), but there's no audit confirmation line on `/risk` — the Boardroom owns the approval moment.

**QA Rule (Station 6):**
1. Click-through: ✅ `/recast` → "Approve Recast & Continue" → `/risk` loads with the ARIA intake intro + the Q&A/Upload pill toggle + Owner-Dependency intake card (8 pre-filled questions) + Concentration intake card (5 pre-filled questions) + mint submit bar. Toggle to "Upload One-Pager" shows the drag zone; clicking fires the demo tooltip. Toggle back to "Answer Questions" restores the intake. "Confirm Answers & Run Analysis" → 700ms spinner ("Analyzing your answers...") → phase flips to analyzing → dual-stream dark terminal card with Owner-Dependency (mint) and Concentration (sky) streams advancing in lockstep through 5 lines each at 400ms cadence → closing line flips to "Analysis complete. Generating risk profile..." → phase flips to output → output surface slides in with both sections visible. Open Boardroom CTA → 520ms spinner → `router.push("/boardroom")` resolves to the Boardroom convening sequence. No console errors. `pnpm typecheck` clean. Dev server `Compiled /risk in 1509ms` with no warnings (HTTP 307 from middleware is the auth redirect — expected for `(app)` routes). `pnpm lint` clean for new files (pre-existing AppShell.tsx + AriaHero.tsx lint errors unchanged — they predate this session and were noted in the Station 6b handoff).
2. Investor-ready on 1080p: ✅ Intake reads as a professional structured interview, not a survey — Garamond H2 section titles, mono `QN` indices on each question, agent chip eyebrows (`OWNER-DEPENDENCY AGENT · INTAKE` / `CONCENTRATION AGENT · INTAKE`), 3px accent top border per section card. Dual-stream terminal card matches the Ingestion + Boardroom dark surface treatment with the parallel-reasoning visual budget (mint + sky accents, 5-segment progress strips, lockstep streams). Output surface — Section 1 visually dominant with the 200px transferability donut, +$450K outcome metric in Garamond 26px mint, 5-row remediation list with `+N pts` chips; Section 2 smaller with the 156px sky donut and the single NJ Transit task. Approval surface `◇` strips are a quiet, dashed treatment that reinforces the agent-fleet narrative without competing with the next CTA. Open Boardroom handoff is the dark terminal-card surface so the visual handoff feels like dispatching to a downstream operational stage. No placeholders, no lorem ipsum, no "Coming Soon" anywhere.
3. Coherent story: ✅ Every score and copy line traces back to `DEMO_PERSONA.md` Section 6 + the Station 6 spec. Q2 answer ("Catering client calls and contract negotiations, vendor price negotiations, daily bank deposits, staff scheduling decisions, health inspection responses") names the 5 task areas. Remediation task titles re-cast those 5 areas as SOP work (catering playbook / vendor negotiation SOP / bank deposit delegation / scheduling SOP / inspection protocol). Owner-Dependency score 38 → target 62, totaling +24 points and matching the +$450K unlock referenced in the Recast valuation context and Boardroom Work Order 1. Concentration shows NJ Transit 19% / 6 years / month-to-month — exact match to Boardroom Work Order 2 (3-year renewal task) and the Search Fund deal-breaker objection. The narrative "Within SBA threshold — monitor" appears verbatim from persona. The chain `Recast valuation references 38/100` → `Risk shows the 38→62 gap` → `Boardroom WO 1 dispatches the SOP work` is now internally consistent across all three stations.

**Open questions for the human:**
- None blocking. The intake fields are editable but ignored for the demo's analysis output (per spec). If a future demo run wants the analysis to actually reflect edits, that's a Phase 2 product feature — the spec explicitly notes "In production, edits would rerun the model" and routes us to keep the demo deterministic.

---

#### 2026-05-18 — Station 6b ship — The Boardroom

**Shipped:**
- New `components/scorta/BoardroomStation.tsx` — the full `/boardroom` workspace replacing the LockedStation pattern. Layout:
  - **Station header** (eyebrow `Station 06b · /boardroom` / `BOARDROOM · INVESTMENT COMMITTEE` with live mint pulse dot during the 4.2s convening sequence, Garamond H1 "Boardroom" at 42px, forward-looking subhead naming the three buyer agents reviewing Palace in parallel and pointing at the agent fleet as the downstream consumer of the work orders).
  - **Three persona panels** in a 3-column grid (equal height ~720px once flipped). Each panel carries a 3px accent top border:
    - SBA-Backed Operator → `--mint` (#2c8c70) — financing / fundable
    - Search Fund Buyer → `--sky` (#4a7ba8) — thesis / recurring
    - Micro-PE Buyer → `--peach` (#b86a3e) — assets / platform (closest existing token to the spec's "warm gold/amber")
  - **Convening sequence (4.2s, non-negotiable):**
    - t=0: card 1 appears (320ms ease-out fade + 6px slide-up) with Garamond persona name, accent type label, profile summary, and `ReasoningSurface` — pulsing mint/sky/peach dot + "Analyzing" mono eyebrow + cycling mono status line + 4-segment progress strip that fills as the lines advance
    - t=600: card 2 appears, t=1200: card 3 appears
    - t=1800: all 3 cards visible — reasoning lines cycle in lockstep (`reasoningIdx`) at 600ms cadence — SBA: DSCR → operator replaceability → add-back defensibility → LOI conditions; Search: recurring revenue → concentration → mgmt transition → LOI conditions; Micro-PE: platform fit → property/assets → seller note → LOI conditions
    - t=4200: `verdictsRevealed=true` flips all 3 panels simultaneously to their full `VerdictSurface` (200ms `boardFlipIn` keyframe cross-fade)
  - **VerdictSurface (per panel)** has four hairline-divided internal sections:
    - **Verdict strip** — large pill (mint `● Proceed to LOI` / peach `◐ Conditional` / red `○ Would Not Proceed`) with 10px glowing dot + Garamond 22px verdict label + one-line condition summary. Hovering a CONDITIONAL badge swaps the truncated summary for the full condition text inline (per spec).
    - **Valuation & Deal Structure** — `Offer Range` (Garamond 17px anchor) + Structure + Seller Note + Condition rows, followed by an accent-tinted "read" block (e.g. "DSCR Read · 4.4× — Strong" / "Recurring Rev Read · 38% — Thin" / "Asset Read · Property + brand + 15-yr ops") with the persona-specific narrative.
    - **Objection stack** — section label + 1-line subhead + severity legend chip row + 4 `ObjectionRow` cards. Each row: severity chip (Deal-Breaker red · High peach · Medium sky · Low muted), objection text, agent assignment chip ("→ Owner-Dependency Agent" etc.). Hover lifts the row (-1px + soft shadow), the assignment chip recolors mint, and a dark tooltip appears above naming the work order it generated (e.g. "Generated Work Order 1 → Owner-Dependency Agent").
  - **Work Orders panel** (slides in 280ms after the verdict flip) — dark terminal-card surface (`rgba(12,10,9,.92)` bg, matching the Ingestion Agent log) with mint eyebrow `BOARDROOM OUTPUT · AGENT WORK ORDERS` + subhead. 2×2 grid of 4 work order cards:
    - **WO 1 — Owner-Dependency Agent · CRITICAL** · "Document the 5 owner-dependent operational tasks… raise Transferability score from 38/100 to 62/100." · Triggered by SBA deal-breaker + Search Fund deal-breaker + Micro-PE high · Unlock **+$450,000**
    - **WO 2 — Concentration Agent · HIGH** · "Draft a contract extension proposal for the NJ Transit Corporate Catering account. Target: 3-year renewal." · Triggered by Search Fund deal-breaker · Unlock "Unlocks Search Fund LOI pathway"
    - **WO 3 — Recast Agent · MEDIUM** · "Harden the personal travel add-back narrative ($9K/yr)…" · Triggered by SBA medium · Unlock "Reduces lender friction"
    - **WO 4 — Outreach Agent · HIGH** · "Prioritize SBA-Backed Operator and Micro-PE buyer profiles for initial outreach. Search Fund outreach held pending NJ Transit contract confirmation." · Triggered by Boardroom buyer segment recommendations · Unlock "Opens two of three LOI pathways"
    - Each card shows priority chip (crit/high/med-toned), task body, unlock line, and a `DispatchStatusChip` — `Awaiting Dispatch` with a slowly-pulsing dot, flipping to `Dispatched ✓` mint chip when the dispatch sequence reaches that card. Hovering an `Awaiting` card surfaces a light tooltip naming the triggering persona/severity.
  - **Dispatch approval gate** (slides in 480ms after the flip) — canonical mint gradient banner pattern from Stations 4 and 5. Breathing ARIA orb + `CASE MANAGER AGENT · AWAITING YOUR APPROVAL` mono eyebrow + headline "Authorize the agent fleet to execute the Boardroom's work orders." + body explaining that 4 agents will dispatch simultaneously, no external buyer communication will be sent until outreach is separately approved, and the seller can review each agent's output before publish. Two CTAs:
    - Secondary "Review LOI structure logic" — tooltip-only 2.2s flash: "Full LOI term logic available for deal lead review before any buyer communication reflects it." (no navigation per spec)
    - Primary "Dispatch Agent Fleet →" — 700ms spinner cycling 4 dispatch lines ("Dispatching Owner-Dependency Agent…" → Recast → Concentration → Outreach) → flips to mint "Fleet dispatched · routing to CIM & Docs" → 4 work order cards flip from `Awaiting Dispatch` to `Dispatched ✓` one at a time at 200ms stagger (each card gets a `boardWoFlash` mint-pulse box-shadow on flip — the visual payoff) → audit line appears → 520ms hold → `router.push("/documents")`.
  - **Audit confirmation line** — appears between the dispatch flips finishing and the route firing. Mono, mint, dashed mint divider above. Format: `✓ Boardroom work orders approved by Chandan Patel · May 18, 2026 · 12:34 PM · Agent fleet dispatched. No external communications authorized pending outreach review.` Date and time generated live from `new Date()` — every other value hard-coded per Station Card.
- New `app/(app)/boardroom/page.tsx` renders `<BoardroomStation persona={PERSONA} />` (server → client component pattern, matches `/recast` and `/ingestion`).
- Added `/boardroom` rail entry in `lib/persona.ts` between `/risk` and `/documents` with `state: "active"` and `prereq: "the Owner-Dependency remediation plan is reviewed"`. Per the spec's downstream implication #5: the Boardroom is always-on in production, represented in the rail by giving it a persistent non-locked state even before the user visits it. Updated `/documents` prereq to "the Boardroom dispatches the agent fleet" so the chain reads forward.

**Mocked / hard-coded:**
- All persona reasoning, verdicts, offer ranges, structures, seller notes, conditions, "reads", and objection text are **hard-coded verbatim from the Station 6b spec** in `.claude/station-agent6.md` (sections "PERSONA PANEL LAYOUT", "OBJECTION STACK", "WORK ORDERS PANEL"). The 12 objections (4 per panel) and 4 work orders are exactly the spec's enumerations — no invented values.
- All financial values referenced in the deal structures and "reads" trace to `DEMO_PERSONA.md`:
  - SBA-Backed Operator offer $1.55M–$1.70M, $106K buyer down, DSCR 4.4× (Section 7)
  - Search Fund offer $1.45M–$1.65M, $150K–$200K seller note, 38% recurring revenue mix (Section 3)
  - Micro-PE offer $1.65M–$1.85M, $175K–$229K seller note (10–15% of deal — Section 7)
  - WO 1 unlock +$450K (Section 6), WO 2 NJ Transit Corporate Catering (Section 6)
- Persona accent color tokens established here for downstream reuse on `/outreach` Kanban: SBA → `--mint`, Search Fund → `--sky`, Micro-PE → `--peach`. (Spec describes Micro-PE as "warm gold / amber" — peach is the closest existing palette token; per the design system rule we do not introduce new colors.) Severity chips deliberately overlap colors with persona accents (High = peach, Medium = sky) but the visual treatments are different — pill chip inside the panel vs. 3px top border on the panel itself.
- Timing budget lives in `T = { … }` at the top of `BoardroomStation.tsx`:
  - `cardStaggerMs: 600` (card 1 → 2 → 3 stagger)
  - `reasoningCycleMs: 600` (status line cadence inside each card)
  - `reasoningTotalMs: 2400` (4 lines × 600ms — non-negotiable per spec)
  - `flipMs: 200` (verdict reveal cross-fade)
  - `surfaceRevealMs: 360` (work orders + approve gate slide-in)
  - `approveSpinnerMs: 700` (dispatch spinner with cycling agent names)
  - `dispatchStaggerMs: 200` (gap between work order flips — visible and satisfying per spec)
  - `auditHoldMs: 520` (audit line hold before route fires)
  - `loiTipMs: 2200` (LOI tooltip flash duration)
  - Total convening: 600×3 (stagger) + 2400 (reasoning) + 200 (flip) = **4200ms** exactly per spec
  - Total dispatch run: 700 (spinner) + 200×4 (card flips) + 240 (audit reveal) + 520 (hold) ≈ **2.26s** before route fires
- Approval audit line follows the Station 5 canonical pattern — names *what* is being locked, not just who signed. Format: "Boardroom work orders approved by {name} · {date} · {time} · Agent fleet dispatched. No external communications authorized pending outreach review."
- `/risk` is still the LockedStation — the spec says `/boardroom` arrives from `/risk` via an "Open Boardroom" CTA. The Boardroom currently must be reached directly from the rail (it's the active state). When `/risk` ships, add the "Open Boardroom" CTA on `/risk` that routes here; no code in `/boardroom` itself needs to change.

**Left for next session:**
- Open **Station 6 — Owner-Dependency / Concentration (`/risk`)** per the original State Tracker. Replace the LockedStation in `app/(app)/risk/page.tsx` with the donut charts for revenue + owner-time concentration, the Owner-Dependency Agent's 5-task remediation playbook (38/100 → 62/100 = +$450K unlock), and the Concentration Agent panel (NJ Transit 19% / 6-year tenure, "Within SBA threshold — monitor"). When `/risk` ships, add an "Open Boardroom →" CTA at the bottom that routes to `/boardroom` (instead of the previous plan to route from `/risk` directly to `/documents`).
- After `/risk` ships, the user-visible left-rail story becomes: Station 06 (Risk Analysis · active) → Station 06b (The Boardroom · active, always-on) → Station 07 (CIM & Docs · locked until Boardroom dispatches). This is consistent with the spec's "always-on Boardroom" narrative and the spec's downstream link from `/risk`.
- Persona-source for next station: `DEMO_PERSONA.md` Section 6. The "fix-value unlock" math (38/100 → 62/100 = +$450K) is already echoed in the Recast valuation context and the Boardroom WO 1 unlock — `/risk` should deliver the remediation playbook that earns that unlock.
- After Station 6 (`/risk`) ships, flip `/recast` from `state: "active"` → `state: "shipped"` and `/risk` from `state: "locked"` → `state: "active"` in `lib/persona.ts`. `/boardroom` stays `active`.

**Decisions made (that future sessions must respect):**
- **Boardroom is an always-on station, not a sequential one.** Per the spec, the Boardroom is "always running in the background, updating as new information comes in." Represented in the rail by giving `/boardroom` a persistent `state: "active"` even before the user visits it. Do not flip this to `shipped` after it's used — it stays active because the production Boardroom reruns continuously.
- **Persona accent color tokens are now established and must be reused on `/outreach`:** SBA-Backed Operator → mint, Search Fund Buyer → sky, Micro-PE Buyer → peach. The buyer pipeline Kanban on `/outreach` MUST color-code its cards by buyer type using these exact tokens. Do not invent new colors.
- **Outreach Agent's targeting priority is set here:** SBA-Backed Operator FIRST, Micro-PE SECOND, Search Fund THIRD (held pending NJ Transit contract confirmation). This priority is encoded in WO 4's task body and MUST be reflected in the Kanban pipeline lane order on `/outreach`.
- **Dark terminal-card surface for "agent dispatch" UIs.** The work orders panel reuses the Ingestion Agent's terminal log surface treatment (`rgba(12,10,9,.92)` bg, mono mint eyebrow, light text on dark). Going forward, anywhere an agent fleet is being mobilized or executing a job queue, use this dark-surface treatment so the visual language for "operational dispatch" stays consistent.
- **Convening 4.2s cadence is the demo's most important perceived-AI moment.** Three cards stagger in at 600ms each → cards reason in lockstep at 600ms cadence → all flip simultaneously at 4.2s. Do not compress this. The parallel reasoning is the visual proof of "three buyer agents are running independently right now."
- **Work order flip cascade is the climactic UI moment.** 200ms stagger between each card flip from `Awaiting Dispatch` → `Dispatched ✓`, each card gets a brief mint-pulse box-shadow on flip (`boardWoFlash` keyframe). This is the demo's payoff for the approval gate — the agent fleet visibly mobilizes in real time.
- **Verdict badge hover-expand pattern.** CONDITIONAL verdict badges expand the truncated condition summary to the full condition text on hover. Reuse this pattern on `/risk` and `/score` anywhere a condensed summary line backs a longer underlying rationale.

**QA Rule (Station 6b):**
1. Click-through: ✅ Direct navigation to `/boardroom` (rail · `active` state) loads with the 4.2s convening sequence (card 1 at t=0, card 2 at t=600, card 3 at t=1200, all 3 visible at t=1800, reasoning lines cycle in lockstep at 2400/3000/3600, all flip simultaneously at t=4200). Each panel renders verdict strip + valuation + objection stack. Hovering an objection row lifts the row and shows a tooltip naming the work order it generated. Hovering a CONDITIONAL verdict badge expands the condition text. Work order panel slides in 280ms after flip. Hovering a work order card surfaces the trigger source tooltip. "Dispatch Agent Fleet →" spins for 700ms cycling 4 dispatch lines → 4 work order cards flip Dispatched ✓ at 200ms stagger → audit line `✓ Boardroom work orders approved by Chandan Patel · [today] · [time] · Agent fleet dispatched. No external communications authorized pending outreach review.` → 520ms hold → routes to `/documents` (LockedStation, still — that's the next station to build). `pnpm typecheck` clean. `pnpm lint` clean for new files (pre-existing warnings in other files unchanged). Dev server compile clean.
2. Investor-ready on 1080p: ✅ Three persona panels are the visual centerpiece — equal height (~720px once flipped), distinct mint/sky/peach 3px accent top borders, large Garamond 22px verdict badge dominant within each panel. Work order grid reads as an operational dispatch surface (dark terminal-card, light text, mint eyebrow), not a bullet list. Convening sequence communicates parallel AI reasoning without feeling like a loading screen — the 4-segment progress strip inside each card visibly fills as the lines advance. Dispatch flip sequence is the visual payoff — staggered, satisfying, mint-pulse on each card. Mint accent budget held — only on verdict badges (Proceed), status indicators, the dark-card eyebrow, the approve CTA, and the Unlock line in work order cards. Severity chip color budget: deal-breaker crit-red, high peach, medium sky, low muted. No placeholders, no lorem ipsum, no "Coming Soon" anywhere.
3. Coherent story: ✅ Every persona, verdict, offer range, structure, and objection traces back to `DEMO_PERSONA.md` (Sections 3, 6, 7) and the Station 6b spec. SBA-Backed Operator: $1.55M–$1.70M offer, SBA 7(a) $106K down, DSCR 4.4×, conditional on SOPs. Search Fund: $1.45M–$1.65M, seller note $150K–$200K, conditional on NJ Transit 3-yr. Micro-PE: $1.65M–$1.85M, seller note $175K–$229K. Work order unlocks: +$450K (Transferability 38→62), NJ Transit contract extension, $9K travel add-back receipt documentation, SBA + Micro-PE buyer prioritization. Persona accent colors match what `/outreach` will use for buyer type labeling.

**Open questions for the human:**
- The `/risk` station hasn't shipped yet, so the canonical demo path can't currently flow `/recast` → `/risk` → `/boardroom` → `/documents`. For the demo, the Boardroom is reachable via the left rail (it's `active`). When `/risk` ships, add an "Open Boardroom →" CTA on `/risk` that routes here — this matches the spec's "Arrives from `/risk` via 'Open Boardroom' CTA once the Owner-Dependency remediation plan has been reviewed."
- The Micro-PE persona accent uses `--peach` (existing palette token) — the spec describes it as "warm gold / amber" but the design system rule forbids introducing a new palette. If you want a true amber/gold for Micro-PE before the demo, add `--gold` and `--gold-edge` tokens in `styles/tailwind.css` and swap the 3 references in `BoardroomStation.tsx` (`PANELS[2].accent` / `.accentSoft` / `.accentEdge`).

---

#### 2026-05-18 — Station 5 ship — Financial Recast

**Shipped:**
- New `components/scorta/RecastStation.tsx` — the full `/recast` workspace replacing the LockedStation stub. Layout:
  - **Station header** (eyebrow `Station 05 · /recast` / `RECAST AGENT` with live mint pulse dot during the 1.8s working state, Garamond H1 "Financials Recast", forward-looking subhead naming the lender package as the downstream).
  - **ARIA intro banner** — orb + dynamic copy ("Recast Agent is normalizing Palace's financials — applying SBA-style add-backs and cleaning the EBITDA story." while working, then "Recast complete. Review the normalized financials and approve before the Recast Agent publishes to your lender package."). While working, a mono progress line cycles through the 3 spec lines ("Applying owner compensation add-back..." → "Normalizing one-time and personal expenses..." → "Building SBA-defensible narrative...") at 600ms cadence so the 1.8s wait reads as live work, not a fake timer.
  - **Recast surface** (slides in 360 ms after the working state ends, same reveal pattern as Station 4 summary card) — single glass card containing 3 layered sections separated by hairline top-border `SectionBlock` dividers, matching the Station 4 pattern:
    - **Section 1 — Before / After Recast Table.** Full 3-year P&L with all rows from `DEMO_PERSONA.md` Section 3 (Gross Revenue, COGS, Gross Profit, Payroll non-owner, Utilities, Marketing, Insurance, Other Operating, EBITDA-as-reported). 2024 column mint-emphasized header. Inline add-back section (with `ADD-BACKS — applied by Recast Agent` mint label row) lists the 4 add-back items as table rows in mint with the column ⓘ icon on each label. Mint Total Add-Backs row (+$147K / +$169K / +$147K). Final NORMALIZED SDE row uses mint left border (3px), mint bg tint, Garamond 22 px (2024 column at 22 px / others 18 px) — $827K / $934K / **$962K**.
    - **Section 2 — Add-Back Narrative.** Collapsible "Add-Back Justifications — Recast Agent Narrative" section (open by default, chevron toggle rotates 240ms). Subhead references SBA SOP 50 10 8. 2-column grid of 4 NarrativeCards — Owner Compensation $120K/yr (● SBA Accepted, mint), Personal Vehicle $18K/yr (● SBA Accepted), One-Time Equipment Repair $22K Year 2 only (● SBA Accepted), Personal Travel $9K/yr (● Likely Accepted, sky). Each card has a 2–3 sentence lender-facing narrative written verbatim from the Station 5 spec — no invented copy.
    - **Section 3 — Valuation Output.** 2-column layout. Left panel = the math, transparently shown: Normalized SDE (Year 3) $962,000 / SDE Multiple Range 1.5×–3.0× (each endpoint dotted-underline with hover tooltips per spec: "Current floor — reflects owner-dependency risk" / "Achievable at Transferability score 62 / 100") / Applied Multiple 2.4× / hairline divider / Valuation Range $1.6M–$1.9M / **Recommended Listing Price $1.75M** (Garamond 38 px mint anchor element) / Asset Floor $500K (muted). Right panel = mint-tinted context block: "Why 2.4×?" header + persona-driven prose explaining the multiple (15 yrs operating history, SBA eligibility, property ownership, offset by Owner-Dependency 38/100 with +$450K unlock at target 62/100). Below prose: dashed-mint divider + mono mint line "SBA 7(a) Eligible · DSCR 4.4× · $106K minimum buyer down".
  - **Add-back ⓘ hover** — each of the 4 add-back rows in the table has a small mint ⓘ chip on the label. Hover surfaces a dark tooltip (340px wide, right-positioned) showing the matching narrative card's label, defensibility badge, and full body copy — so the seller can read the justification inline without scrolling to Section 2.
  - **Review & Approve gate** (slides in ~180 ms after the recast surface lands) — reuses the canonical mint gradient approval banner pattern from Station 4. Breathing ARIA orb + agent eyebrow `RECAST AGENT · awaiting your approval` + headline "Approve the normalized financials to publish to your lender package." + body explaining that the figures will be locked and shared with lenders/buyers, with the add-back narratives accompanying every disclosure. Two CTAs:
    - Secondary "Download recast PDF" — tooltip-only, 2.2 s flash: "Available in your VDR once approved." (no navigation per spec)
    - Primary "Approve Recast & Continue →" — 700 ms spinner ("Publishing to lender package…") → flips to mint "Approved · routing to Risk Analysis" → 520 ms audit hold → `router.push("/risk")`.
  - **Audit confirmation line** — appears between the spinner finishing and the route firing. Mono, mint, dashed mint divider above. Format: `✓ Recast approved by Chandan Patel · May 18, 2026 · 12:34 PM · Recast Agent output locked for lender distribution.` Date and time generated live from `new Date()` — every other value hard-coded per Station Card.
- Updated `app/(app)/recast/page.tsx` to render `<RecastStation persona={PERSONA} />` (server → client component pattern, matches `/ingestion`).
- Flipped `lib/persona.ts` station states: `/ingestion` `active → shipped` (✓ in left rail), `/recast` `locked → active`.

**Mocked / hard-coded:**
- All P&L rows, add-back amounts, normalized SDE values, and listing/range numbers sourced exclusively from `.exitiq-debug/sessions/DEMO_PERSONA.md` Section 3. Every dollar figure traces — $1.78M/$1.97M/$2.10M revenue ladder, $534K/$591K/$630K COGS, $1.246M/$1.379M/$1.470M Gross Profit, $680K/$765K/$815K EBITDA-as-reported, +$120K/+$18K/+$22K (Year 2 only)/+$9K add-backs, $147K/$169K/$147K total add-backs by year, $827K/$934K/**$962K** Normalized SDE.
- Add-back narrative copy (all 4 cards + 4 tooltips) is **hard-coded verbatim from the Station 5 spec** in `.claude/station-agent5.md` Section "SECTION 2 — ADD-BACK NARRATIVE". The cards are written to SBA SOP 50 10 8 standards as the spec requires — no invented language. Owner Comp / Vehicle / Equipment / Travel each carry the exact narrative the spec authored.
- Valuation context references hard-coded persona-derived values: 15 yrs operating history, Owner-Dependency 38/100, target Transferability 62/100, +$450K unlock, DSCR 4.4×, $106K minimum buyer down — all from `PERSONA.business`, `PERSONA.risk`, and `PERSONA.sba`.
- Timing budget lives in `T = { … }` at the top of `RecastStation.tsx`: `agentWorkingMs: 1800` (per spec — do not change), `cycleStepMs: 600`, `surfaceRevealMs: 360`, `approveSpinnerMs: 700`, `auditHoldMs: 520`, `pdfTipMs: 2200`. Total perceived recast run ≈ 1.8s + 360ms reveal before the user can act. Approve flow: 700 ms spinner + 520 ms audit hold = 1.22 s to route.
- The audit line uses `toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })` and `toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })` — same format family as the Station 4 audit line.
- "Download recast PDF" is a tooltip-only no-op per spec — no VDR link wired.

**Left for next session:**
- Open **Station 6 — Owner-Dependency / Concentration (`/risk`)**. Replace the LockedStation in `app/(app)/risk/page.tsx` with the donut charts for revenue + owner-time concentration and the Owner-Dependency Agent's remediation playbook. The Recast station already hands off via the `Approve Recast & Continue` CTA — the Risk station should arrive in a "Owner-Dependency Agent dispatched…" framing, surface the 38/100 Transferability score with the multiple-compression story (1.5× vs 3.0× = +$450K unlock), the 5 owner-dependent task remediation list, and the Concentration Agent's NJ Transit panel (19% of revenue, 6-year tenure, "Within SBA threshold — monitor").
- Persona-source for next station: `DEMO_PERSONA.md` Section 6 (Risk Profile — Key-Man / Owner Dependency + Customer Concentration). The "fix-value unlock" math (38/100 → 62/100 = +$450K) is the dominant visual. The Recast valuation context already references this — Risk needs to deliver on it with the remediation playbook.
- After Station 6 ships, flip `/recast` from `state: "active"` → `state: "shipped"` and `/risk` from `state: "locked"` → `state: "active"` in `lib/persona.ts`.

**Decisions made (that future sessions must respect):**
- **Inline ⓘ hover on add-back rows = the connective tissue between the recast table and the narrative cards.** The seller never has to scroll-and-correlate; the lender-facing justification is one hover away on every line item. Reuse this pattern on `/risk` for the owner-dependent task list (each task row → tooltip → "why this task moves the score") and on `/score` for sub-score breakdowns.
- **NORMALIZED SDE row treatment is the financial document's anchor.** 3-px mint left border + mint bg tint + Garamond 22 px on the dominant column. This is the single most consequential row in the demo's financial story and must visually outweigh every other row in the table.
- **Approval audit line carries the agent's output description, not just the signatory.** Station 4: "Approved by Chandan Patel · [date] · [time]". Station 5: "Recast approved by Chandan Patel · [date] · [time] · Recast Agent output locked for lender distribution." The Station 5 form is the canonical pattern going forward — every audit line names *what* is being locked, not just who signed. Update Risk / Score / Lender Ops to follow this form.
- **Cycling status lines inside a working state must vary in content, not just blink.** The 1.8s open uses 3 distinct lines at 600ms cadence so the wait reads as "the agent is doing 3 different things" rather than "a spinner is spinning." Apply to any future short-running agent surface where streaming a 20-line log would be overkill.
- **Multi-line valuation panel = `ValueRow` rhythm.** Label/value pairs with consistent padding, a hairline divider above the listing price, a Garamond-anchored "anchor" row for the dominant number, and a "muted" row below for the floor. Reuse this layout when stations need to surface a calculated output (Scorta Score breakdown, Lender Ops DSCR breakdown, Outreach pipeline funnel math).

**QA Rule (Station 5):**
1. Click-through: ✅ `/ingestion` → "Approve & Continue" → `/recast` loads with the 1.8s working state (status lines cycle: "Applying owner compensation add-back..." → "Normalizing one-time and personal expenses..." → "Building SBA-defensible narrative..."). After 1.8s, working banner flips to "Recast complete. Review the normalized financials…" and the recast surface slides in (360ms ease-out). Table renders all rows × 3 years. Hovering any add-back row (Owner Comp / Vehicle / Equipment / Travel) surfaces the narrative tooltip with badge + body. Narrative section open by default — chevron toggle collapses/expands. Hovering the 1.5× / 3.0× endpoints in the valuation panel surfaces the spec tooltips. "Download recast PDF" flashes the VDR tooltip for 2.2 s. "Approve Recast & Continue" → 700 ms spinner ("Publishing to lender package…") → audit line "✓ Recast approved by Chandan Patel · [today] · [time] · Recast Agent output locked for lender distribution." → 520 ms hold → routes to `/risk` (LockedStation, still — that's the next station to build). `pnpm typecheck` clean. `pnpm lint` clean for the new file (pre-existing warnings in other files unchanged).
2. Investor-ready on 1080p: ✅ Recast surface reads as a real financial document, not a dashboard. Mint emphasis bounded to: NORMALIZED SDE row (table), add-back rows (table), total add-backs (table), narrative card "SBA Accepted" badges, valuation listing price, "Why 2.4×?" context panel, and the approve CTA. Garamond H1 (38 px) for the station title, Garamond H2 (26 px) for the surface header, Garamond 22 px for the SDE row, Garamond 38 px for the listing price anchor. Alternating row tint via subtotal rows for readability. Hover lifts (–1 px + shadow) on both CTAs and the chevron. No placeholders, no "Coming Soon" anywhere.
3. Coherent story: ✅ Every number ties back to `DEMO_PERSONA.md` Section 3. Revenue ladder ($1.78M / $1.97M / $2.10M), COGS ($534K / $591K / $630K), Gross Profit ($1.246M / $1.379M / $1.470M), EBITDA-as-reported ($680K / $765K / $815K), add-backs ($120K / $18K / $22K Year 2 only / $9K), Total Add-Backs ($147K / $169K / $147K), Normalized SDE ($827K / $934K / $962K), Recommended Listing $1.75M, Multiple Range 1.5×–3.0×, Applied 2.4×, Asset Floor $500K, DSCR 4.4×, +$450K unlock at Transferability 62/100, $106K minimum buyer down. The "Why 2.4×?" prose references the same 38/100 Transferability score that `/risk` will surface next.

**Open questions for the human:**
- None blocking. (The 2-column add-back narrative grid will reflow on screens narrower than ~960 px — for the demo run on a 1080p screen this is fine; if the demo machine is narrower we can switch to a single column.)

---

#### 2026-05-18 — Station 4 ship — Ingestion Agent

**Shipped:**
- New `components/scorta/IngestionStation.tsx` — the full `/ingestion` workspace replacing the LockedStation stub. Layout:
  - Station header (eyebrow `Station 04 · /ingestion` / `INGESTION AGENT` with live mint pulse dot while streaming, Garamond H1 "Data Processing", forward-looking subhead naming the Recast Agent as the next handoff).
  - ARIA intro banner — orb + dynamic copy ("The Ingestion Agent is classifying Palace's ledger right now…" while streaming, then "The Ingestion Agent has finished. Review the extracted summary…").
  - **Streaming log surface** — dark terminal-style card (rgba(12,10,9,.92) bg, traffic-light dots, mono caret) with all 20 log lines from `DEMO_PERSONA.md` Section 9 streamed at 300 ms cadence on page load (no button click). Fixed 320 px height, auto-scrolls smoothly to latest line. Header shows `ingestion-agent · palace-kitchen · live` and a live counter (`N / 20` → `Complete`). Each row uses `ingestLineIn` ease-out for the 280 ms slide-up + fade. Color coding:
    - Process lines: muted greyscale on dark
    - Detected add-back lines (4): mint accent + bold weight
    - Flag lines (2): red for key-man, amber for concentration
    - Blinking caret at the tail until "Analysis complete." renders
  - **Final summary card** (slides in 360 ms after stream completes) — full agent report surface, not a stat grid:
    - Card header: agent eyebrow (`INGESTION AGENT · RUN COMPLETE`), Garamond H2 "Extracted summary — review before handoff", live timestamp line ("Completed [today] · 1,247 transactions analyzed across 36 months · Data confidence: 94%"), thin 4 px mint progress bar at 94% fill with `ingestBarIn` 900 ms ease-out grow.
    - Section 1 — Financial Overview: 3-year revenue/COGS/Gross Profit table (2022 / 2023 / 2024, all numbers from `DEMO_PERSONA.md` Section 3). 2024 row uses mint emphasis. Followed by a mint callout line "↑ 18% revenue growth over 3 years — consistent upward trend."
    - Section 2 — Add-Backs Identified: 4 line-item rows (Owner Comp $120K/yr · Personal Vehicle $18K/yr · Equipment Repair $22K (Year 2 only) · Personal Travel $9K/yr), each with a mint "● Confirmed" badge. Mint-bordered total row at bottom: **$127,400** normalized across 3 yrs. Trailing line: "Recast Agent will produce the full SBA-defensible add-back narrative for each line item."
    - Section 3 — Risk Flags: 2-column grid of flag cards. Red `Key-Man Dependency` card (uses persona staff/SOP fields) with downstream pointer "→ Owner-Dependency Agent will address this in Risk Analysis". Amber `Customer Concentration — Moderate` card (NJ Transit Corporate Catering · 6-year tenure, 19%) with "→ Concentration Agent will review contract status in Risk Analysis". Both use brand-rail (3 px left edge) treatment matching the connector tiles.
    - Section 4 — Normalized SDE Preview: mint-tinted prominent panel — `$962,000` (Year 3) in 42 px Garamond mint + supporting line "Based on $815,000 reported EBITDA + $147,000 in confirmed add-backs. Recast Agent will validate the line items and produce the lender-facing narrative." Italic note: "Full recast requires Recast Agent review. This is the Ingestion Agent's preliminary read."
  - **Review & Approve gate** (slides in ~180 ms after the summary card lands) — mint gradient surface mirroring the Connect station's IngestionBanner pattern. Breathing ARIA orb + agent eyebrow `INGESTION AGENT · awaiting your approval` + headline "Review extracted data before the Recast Agent proceeds." + body explaining the downstream impact. Two CTAs:
    - Secondary "Review raw data" — tooltip-only, 2.2 s flash: "Full transaction export available in your VDR."
    - Primary "Approve & Continue →" — 700 ms spinner ("Dispatching Recast Agent…") → flips to mint "Approved · routing to Recast" → 520 ms audit hold → `router.push("/recast")`.
  - **Audit confirmation line** — appears between the spinner finishing and the route firing. Mono font, mint color, dashed mint divider above. Format: `✓ Approved by Chandan Patel · May 18, 2026 · 12:34 PM`. Date and time are generated live from `new Date()` (per the Station Card — every other value is hard-coded, this one is live).
- Updated `app/(app)/ingestion/page.tsx` to render `<IngestionStation persona={PERSONA} />` (server → client component pattern, matches `/connect`).
- Flipped `lib/persona.ts` station states: `/connect` `locked → shipped` (✓ in left rail), `/ingestion` `locked → active` (pulses while the user is on the page, otherwise inherits its declared `active` state from other surfaces).

**Mocked / hard-coded:**
- All log lines, summary stats, table values, add-back amounts, flag copy, and SDE numbers sourced exclusively from `.exitiq-debug/sessions/DEMO_PERSONA.md` Section 3 + Section 9 + Section 6. No invented values. The Ingestion Agent's "$127,400 normalized across 3 yrs" total matches the persona's explicit Ingestion Agent display line (`"Identified $127,400 in add-backs across 36 months of transactions"`); the "$147,000 in confirmed add-backs" supporting line under the SDE Preview matches Year 3 add-backs from the 3-year P&L table.
- Streaming timing budget lives in the `T = { … }` object at the top of `IngestionStation.tsx`: `streamStepMs: 300` (per spec — do not compress), `streamTailMs: 360`, `summaryRevealMs: 360`, `approveSpinnerMs: 700`, `auditHoldMs: 520`, `flagTipMs: 2200`. Total perceived ingestion run ≈ 6.0 s + 360 ms tail before the summary lands. Approve flow: 700 ms spinner + 520 ms audit hold = 1.22 s to route.
- The dynamic audit line uses `toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })` and `toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })`. The summary-card timestamp uses the full month form. Both rely on the demo machine's clock — if the demo runs in a different locale, format may shift slightly.
- The 4 add-back rows all use "Confirmed" badge (mint). The `AddBackRow` component supports "Likely" (sky) and "Review Required" (peach) tones for future stations — wired but unused this station per persona.
- "Review raw data" is a tooltip-only no-op per spec — no navigation, no VDR link wired.

**Left for next session:**
- Open **Station 5 — Recast / Boardroom (`/recast`)**. Replace the LockedStation in `app/(app)/recast/page.tsx` with the before/after recast table + Boardroom view. The Ingestion station already hands off via the `Approve & Continue` CTA — the Recast station should arrive in a "Recast Agent dispatched…" framing, then surface the 3-year recast table (use the full P&L from `DEMO_PERSONA.md` Section 3, including all add-backs and the final $827K / $934K / $962K normalized SDE row). Add an executive Boardroom-view toggle.
- After Station 5 ships, flip `/ingestion` from `state: "active"` → `state: "shipped"` and `/recast` from `state: "locked"` → `state: "active"` in `lib/persona.ts`.
- Persona-source for next station: `DEMO_PERSONA.md` Section 3 (3-Year P&L) plus the add-back narrative implicit in Section 9. Boardroom voices (SBA-Backed Operator / Search Fund / Micro-PE) are scripted in `.claude/demo-script.md` Stage 6 — confirm whether Station 5 includes the Boardroom personas or defers them to a later station.

**Decisions made (that future sessions must respect):**
- **Streaming log surface = dark terminal**. The Ingestion Agent's classifier feel is the first "watch the AI actually working" moment in the demo. Dark card with traffic-light header, mono font, mint accent on signal lines, blinking caret. Any future agent that streams a high-volume classification log (Recast walking through the recast math, Lender Ops scanning lender criteria) reuses this same surface so the visual language for "agent is working in real time" stays consistent.
- **Summary card = full agent report**, not a 4-stat grid. When an agent produces a material extracted output, the report card has: agent eyebrow + Garamond H2 + completion timestamp + confidence bar + ≥3 sectioned blocks (separated by hairline dividers + uppercase section labels) + downstream pointers to the next agent. Use this for Recast's recast narrative, Risk Analysis's remediation plan, and the Lender Ops package.
- **Flag card pattern**: 3 px brand-rail left edge + tinted background + uppercase severity chip (High / Moderate) + body + dashed divider + arrow downstream pointer. Reuse on `/risk` for Owner-Dependency and Concentration cards — same color tokens (`--crit` for red, `--peach` for amber).
- **Approval gate = mint banner**. The bottom-of-station approval surface uses the same gradient + breathing ARIA orb pattern as the Connect station's IngestionBanner. Primary CTA → spinner → audit confirmation line → route. The audit line uses mono font, mint color, and dynamic timestamp (the only live value in the demo). Reuse on Recast, Risk, and Lender Ops.
- **Stream cadence is 300 ms per line, not negotiable.** Tested at this rate the ~6 s run reads as "the agent is actually doing work, not faking it." Compressing this kills the demo moment.
- **Card section dividers** are top-borders on each block (`borderTop: 1px solid var(--div)`) with 18 px vertical padding. This pattern reads cleaner than horizontal hr lines and supports inline `<SectionBlock label subhead>` composition.

**QA Rule (Station 4):**
1. Click-through: ✅ `/connect` → "Run Ingestion Agent" → `/ingestion` loads with the log already streaming on first paint. All 20 lines render in order at 300 ms cadence, mint accents fire on the 4 detected lines, amber+red on the 2 flag lines, caret blinks at the tail. After "Analysis complete." renders, summary card slides in. Approve gate fades in just behind it. "Review raw data" flashes the VDR tooltip for 2.2 s. "Approve & Continue" → 700 ms spinner → audit line `✓ Approved by Chandan Patel · [today] · [time]` → 520 ms hold → routes to `/recast` (LockedStation, still — that's the next station to build). `pnpm typecheck` clean, no console errors.
2. Investor-ready on 1080p: ✅ Terminal log feels live (auto-scroll, blinking caret, traffic-light dots, mint pulse in header). Garamond H1 (38 px) for the station title, Garamond H2 (26 px) for the summary headline, Garamond 42 px for the SDE preview number. Mint accent budget held — only on status indicators, detected signal lines, the confidence bar, the SDE preview number, and the approve CTA. Red bounded to the key-man flag chip; amber bounded to the concentration flag. Hover lifts (–1 px + shadow) on the two CTAs at 180 ms ease-out. No placeholders, no "Coming Soon" anywhere.
3. Coherent story: ✅ Every number ties back to the persona files — 1,247 transactions across 36 months, 94% confidence, $127,400 add-back total, $962,000 Year 3 normalized SDE, $147K confirmed add-backs (Year 3), 18% revenue trend, $1.78M/$1.97M/$2.10M revenue ladder, $534K/$591K/$630K COGS, NJ Transit Corporate Catering 19% / 6-year tenure, 1 of 11 staff tenured, 0 SOPs. ARIA names Palace explicitly. Streaming log lines verbatim from Section 9.

**Open questions for the human:**
- None blocking. (The audit line's date/time format is `Mon Day, Year · H:MM AM/PM` — if you want a different format for the demo run, the call sites are in `onApprove()` and the summary header `todayDisplay` near the top of `IngestionStation.tsx`.)

---

#### 2026-05-18 — Station 3 ship — Platform Connectors

**Shipped:**
- New `components/scorta/ConnectStation.tsx` — the full `/connect` workspace replacing the LockedStation stub. Layout:
  - Station header (eyebrow `STATION 03 · /connect` / `INGESTION AGENT`, Garamond H1 "Platform Connectors", body subhead).
  - ARIA intro banner — orb + "Two of Palace's four sources are already authorized. Run the QuickBooks sync to hand the books off to the Ingestion Agent…"
  - Status strip — "2 of 4 sources connected" with four pills (QuickBooks · live, Plaid · live, Stripe · pending, Drive · pending). Live pills carry a pulsing mint dot.
  - 2×2 grid of connector tiles. Each tile: 3px brand-accent rail, brand-mark monogram in a tinted square (QuickBooks green / Plaid dark navy / Stripe purple / Google Drive multi-color triangle), name + sublabel, status badge (Connected · Synced · Pending · Awaiting), persona-driven detail line, three data-point chips, and an action button.
  - QuickBooks tile: "Sync now" → button spinner → in-tile cycling status stream (mono font, mint pulse dot, 400 ms cadence) running the 5 lines from the station card: "Authenticating with QuickBooks…" → "Fetching chart of accounts…" → "Pulling 36 months of transaction history…" → "Analyzing 1,247 transactions…" → "Sync complete." After the tail (360 ms), the tile flips to "Synced ✓" badge.
  - Plaid tile (secondary): same sync pattern with bank-feed copy ("Authenticating with Plaid…", "Refreshing 36 months of deposits…", "Reconciling bank receipts against ledger…", "Flagging non-recurring inflows…", "Sync complete.").
  - Stripe tile: "Connect →" opens a full-screen OAuth modal ("Redirecting to Stripe… Authorize the Ingestion Agent to read your online ordering revenue.") with a purple spinner. After 1.5 s the modal closes and the tile flips to "Awaiting · complete in Stripe dashboard" (peach pill + peach detail line).
  - Google Drive tile: "Connect →" shows a 2.2 s tooltip "Document ingestion via Drive coming soon." anchored to the button. No state change.
  - **Sync result card** (slides in 360 ms after QuickBooks sync completes) — mint ✓ chip + "Ingestion Agent · sync complete" eyebrow + "QuickBooks ledger handed off — ready for classification." headline. Four `ResultStat`s: Transactions 1,247 / Revenue confirmed $2.1M / Data sources 3 (P&L · Payroll · COGS) / Status Ready (mint).
  - **"Run Ingestion Agent" banner** — appears only after QuickBooks sync completes. Mint gradient surface with breathing ARIA orb, copy "ARIA · ready to advance · 2 of 4 sources connected — Ingestion Agent is ready to classify 36 months of activity." Primary dark CTA → 700 ms spinner state ("Opening Data Processing…") → `router.push("/ingestion")`.
- Updated `app/(app)/connect/page.tsx` to render `<ConnectStation persona={PERSONA} />` (server component → client component pattern, matches SellerHome).
- Updated `app/(app)/ingestion/page.tsx` LockedStation copy so the prereq reads forward, not backward, after the user has just authorized connectors — "I'll unlock this workspace once the Ingestion Agent's live feed finishes booting — your QuickBooks ledger is being handed off." (Left-rail tooltip wording in `lib/persona.ts` is unchanged so the lock copy seen from earlier stations still reads correctly.)

**Mocked / hard-coded:**
- All sync timings (400 ms per status line, 360 ms tail, 1.5 s Stripe redirect, 2.2 s Drive tooltip, 700 ms ingestion route handoff) live in the `T = { … }` object at the top of `ConnectStation.tsx`. Reuse the same constant naming family in Station 4.
- Persona values used on screen (all sourced from `.exitiq-debug/sessions/DEMO_PERSONA.md` Section 3 + Section 8): "1,247 transactions", "36 months", `$2.1M` revenue, brand list (QuickBooks Online, Plaid Bank Feed, Stripe, Google Drive). No invented numbers or copy.
- Status-pill logic is purely visual: Stripe `awaiting` doesn't count toward `connectedCount` (stays at 2). The Ingestion CTA only unlocks on QuickBooks sync — Plaid's resync is a "look, it works too" secondary surface, not part of the demo's primary unlock path.
- The "Run Ingestion Agent" button always routes to `/ingestion`. That page is still a LockedStation (the next station to build). Its copy has been updated so the handoff feels in-progress rather than blocked.

**Left for next session:**
- Open **Station 4 — Ingestion Agent (`/ingestion`)**. Replace the LockedStation in `app/(app)/ingestion/page.tsx` with the live streaming log per `DEMO_PERSONA.md` Section 9 (the 20-line timeline at 300 ms cadence and the Final Summary card). The Connect station already ships the user into a "handing off…" framing — the Ingestion station should pick up there with the log streaming, then surface a "Review & Approve" gate on the extracted summary before unlocking `/recast`.
- Reuse the same timing patterns: cycle status lines at 300 ms (per spec) using the same `key={step}` re-mount pattern as `SyncStream` in `ConnectStation.tsx` so each line gets the `syncLineIn` ease-out animation.
- When Station 4 ships, flip `/connect` from `state: "locked"` → `state: "shipped"` and `/ingestion` from `state: "locked"` → `state: "active"` in `lib/persona.ts`. (Held off this session because the left-rail story for `/dashboard` ("locked future stations") still relies on `/connect` reading as locked from earlier surfaces.)

**Decisions made (that future sessions must respect):**
- **Sync timing budget** for any agent that pulls a data source: 5 status lines × 400 ms = 2.0 s perceived wait + 360 ms reveal of the result card. Long enough to feel real, short enough to keep the demo moving. The same cadence holds whether the agent is "Sync now" on a connector or "Run agent" on a station.
- **Brand-accent rail (3 px, left edge of tile)** is the connector-tile signature. Use this pattern any time the surface represents an integration with a third-party data source (e.g., future tiles for POS / payroll integrations in later stations).
- **Result card pattern**: any agent that completes a material run-once action shows a glass card with mint ✓ chip + agent eyebrow + headline + 4-stat grid. Reuse this when Recast / Owner-Dependency / Lender Ops post their outputs.
- **"Run [Agent]" banner** is the canonical handoff between stations — mint gradient surface with breathing ARIA orb + dark CTA. Appears only when the prerequisite agent has finished its work on the current station. Use this same pattern at the bottom of every station that hands off to the next.
- **Locked-state in left rail is unchanged** for `/connect` — the user reaches it via the AriaHero CTA on `/dashboard`, not by clicking the rail. This means on `/dashboard`, `/connect` still shows as locked (with the tooltip "ARIA will unlock this once you approve the prep plan"). After Station 4 ships, that flip happens.
- **`SyncStream` uses `key={step}` to force re-mount** on each status-line change, which triggers the `syncLineIn` ease-out (3 px slide-up + fade, 280 ms). This is the project standard for any rapidly-changing status line.

**QA Rule (Station 3):**
1. Click-through: ✅ Report CTA → `/login` → `/dashboard` → "Start with step 1" → 1.4 s ARIA flow → `/connect` lands with intro banner + 4 tiles. Click "Sync now" on QuickBooks → button spinner → cycling status stream → 2.4 s later "Synced ✓". Result card slides in. Ingestion banner appears. Click "Run Ingestion Agent" → 700 ms spinner → `/ingestion` (forward-looking LockedStation). Optional flourishes: Stripe modal flow works (1.5 s redirect → "Awaiting" peach badge), Drive tooltip flashes 2.2 s, Plaid resync streams its own bank-feed copy. `pnpm typecheck` clean.
2. Investor-ready on 1080p: ✅ One dominant element per tile (logo + name + action). Glass cards with brand-accent rails. Garamond H1 (38 px) for the station title, Garamond 22 px for the result-card stats. Mint accents bounded to status indicators and the unlock CTA. Hover lifts (–1 px + soft shadow) on tiles and buttons at 180 ms ease-out. No placeholders, no lorem ipsum, no "Coming Soon" except the explicit Drive tooltip.
3. Coherent story: ✅ Every value ties back to the persona files — Palace Kitchen & Catering, QuickBooks 1,247 transactions, Plaid 36 months of deposits, $2.1M revenue confirmed, brand list per Section 8. The ARIA intro names Palace explicitly. The result card's "3 data sources (P&L · Payroll · COGS)" matches Section 8's "Data Points Unlocked" column.

**Open questions for the human:**
- None blocking. (The /ingestion locked-page copy was updated forward; left-rail tooltip wording in `STATIONS` stays backward-looking because it's read from earlier surfaces. If you want the rail tooltip to track the same forward framing post-unlock, that needs a small AppShell change — flag it and I'll do it in Station 4.)

---

#### 2026-05-18 — Station 2 polish pass — ARIA hero + agent timing + meaningful locks

**Shipped:**
- New `components/scorta/AriaHero.tsx` — the dashboard hero now anchors on ARIA (the user-facing voice of the Case Manager). Includes:
  - Rotating wireframe **globe** (132×132 SVG, animated meridian rx, ~30 s per rotation, two pulsing data dots, specular highlight).
  - Breathing **ARIA orb** avatar (radial gradient, 3.2 s breathe, halo ring).
  - **Typewriter greeting** ("Welcome, Chandan.") — first sentence only, ~40 ms/char, starts at 600 ms.
  - Cascade reveals: sub-heading (+400 ms after greeting), body (+300 ms after sub-heading), three action steps (250 ms apart, 8 px slide-up + fade), CTA (+220 ms after last step).
  - **CTA → status flow:** click "Start with step 1" → button spins + disables → status bar shows "ARIA is reviewing your profile…" (800 ms) → "Preparing your next step…" (600 ms) → "Platform Connectors is ready — opening now." → router.push to `/connect`. Total perceived wait ≈ 1.4 s.
- Locked stations in the left rail are now **non-clickable**. Hovering reveals a tooltip ("ARIA will unlock this once {prereq}.") at 180 ms ease-out. Lock icon appears at the row's right edge. Click does nothing — the lock is meaningful.
- `Station.prereq` field added in `lib/persona.ts` — each station declares what unlocks it (e.g. `/connect` → "you approve the prep plan", `/ingestion` → "Platform Connectors are authorized"). Drives both the rail tooltip and the LockedStation page copy.
- LockedStation page rewritten — removed the "Unlocks during demo sprint" pill. Replaced with an ARIA · Case Manager card: "I'll unlock this workspace once {prereq}. Head back to the Seller Home to keep moving." No placeholder/coming-soon language anywhere.
- AppShell rebranded: "Case Manager Agent" strip → ARIA strip with the orb. Decorative mint accents (scan lines, eyebrow tints, dashed mint borders) pulled out — mint now lives only on status indicators, CTAs, and the dot in the live status bar. Typography hierarchy sharpened: KPI numbers in 32 px Garamond, single dominant element per card, increased card padding (20 px), generous outer spacing (28 px gutters on main column).
- Hover states normalized at 180 ms ease-out across rail items, KPI cards, recap card chips, sign-out button, "Re-open full report" / "Open risk analysis" pills, and CTA buttons.

**Mocked / hard-coded:**
- The "Start with step 1" CTA always routes to `/connect`. The unlock is a no-op visual — `/connect` is still a LockedStation page (will turn into the real connectors workspace in Station 3).
- ARIA's body copy is templated from the persona (years operating, valuation range, SDE multiple range, transferability score, fix-value unlock dollar amount). No invented numbers.
- The persona-driven step copy on the hero references Year-3 SDE ($962K), DSCR (4.4×), and the +$450K transferability unlock — all sourced from `DEMO_PERSONA.md` and `demo-report.md`.

**Left for next session:**
- Open **Station 3 — Platform Connectors (`/connect`)**. The AriaHero CTA already routes here, so this is the user's first real touch after authorizing the prep plan. Build the QuickBooks / Plaid / Stripe / Drive tiles per DEMO_PERSONA Section 8 (QuickBooks + Plaid pre-connected; Stripe + Drive pending with a simulated connect flow). Apply the same agent-timing rules: every connect action is a 1.4–2.0 s status flow, no instant successes.

**Decisions made (that future sessions must respect):**
- **ARIA** is the public name of the Case Manager Agent — the unified voice that surfaces the rest of the agent fleet on screen. The underlying fleet names (Ingestion, Recast, Owner-Dependency, Boardroom, Lender Ops, Outreach) still appear when those agents speak. Do not introduce additional public-facing agent personas.
- **Mint/teal accent budget**: status indicators (✓/●/dot pulses), primary CTAs (when not in "done" state via dark btn-bg), and the rotating globe/orb only. Do not use mint on dividers, eyebrow text, hover backgrounds, scan lines, or decorative blobs. The peach pill (Hot Seller), crit-red risk strip, and lav/sky accent stays bounded.
- **Timing constants** for any agent surface live in the `T = { … }` object at the top of `AriaHero.tsx` (`charDelayMs: 40`, `greetingStartMs: 600`, `subheadDelayMs: 400`, `bodyDelayMs: 300`, `stepCascadeMs: 250`, `statusOneMs: 800`, `statusTwoMs: 600`). Reuse these across Ingestion / Recast / Owner-Dependency / Case Manager stations so every agent feels consistent — long enough to feel real, short enough not to frustrate.
- **Hover transition**: 180 ms ease-out is the project standard for all interactive elements.
- **Locked rail items do not navigate.** If a station needs to be reachable from the dashboard (e.g. the AriaHero CTA opening Platform Connectors), the route is reached via in-body buttons, not by clicking the rail entry.

**QA Rule (Station 2 — repeated):**
1. Click-through: ✅ Report CTA → `/login` → submit → `/dashboard` → ARIA hero plays cascade → click "Start with step 1" → 1.4 s status flow → land on `/connect` (LockedStation). Hover any other locked rail entry shows the tooltip; click does nothing. Typecheck clean. Dev: 0 errors across all 10 routes.
2. Investor-ready on 1080p: ✅ One dominant element per section (ARIA greeting, KPI numbers, recap stats). Mint accents scoped to status + CTAs. Hover states everywhere. Generous spacing, no cramped cards. No placeholders, no "Coming Soon", no lorem ipsum.
3. Coherent story: ✅ All numbers and names trace back to the persona files — Palace Kitchen & Catering · Chandan · 15 yrs · $1.6M–$1.9M · 1.5×–3× SDE multiple · Transferability 38/100 · DSCR 4.4× · +$450K unlock · NJ Transit Corporate Catering.

**Open questions for the human:**
- The original timing brief was cut off at "1 full rotation per ehavior" — I chose **~30 s per rotation** for the globe (premium, not distracting). If you want it faster/slower, the value lives in the `ariaGlobeMeridian` keyframe duration in `AriaHero.tsx`.

---

#### 2026-05-17 — Station 2 ship — Auth / Seller Home

**Shipped:**
- `/login` route — Supabase email+password auth via `@/lib/supabase/client`. Server component (`app/login/page.tsx`) redirects to `/dashboard` if a session already exists; otherwise renders `components/scorta/LoginPanel.tsx` (cream-theme glass card, EB Garamond headline, mint scan-line, shimmer-button, spinner during submit, inline error on credential mismatch).
- Report-page CTAs wired to `/login` — the main "Authorize & continue to Boardroom" button (`BoardroomCTACard`) and the floating "Save this report & continue to Boardroom" sticky CTA (`StickyCTA`) in `components/exitiq/report-visual.tsx` now `router.push("/login")` instead of `alert(...)`. This is the only edit to the existing report code; see "Decisions" below.
- Route group `app/(app)/` with shared auth-gated layout (`layout.tsx`) — calls `supabase.auth.getUser()` and redirects to `/login` when absent. Wraps children in `components/scorta/AppShell.tsx`.
- Left-rail nav spine (`AppShell.tsx`) — all 9 station routes listed with status indicators: ✓ shipped (filled mint), ● active (pulsing mint dot), ○ locked (dashed ring). Each row shows the station label, "Station NN", and the agent that owns it (Ingestion / Recast / Owner-Dependency / Concentration / Case Manager / Boardroom / Lender Ops / Outreach). Includes a Case Manager status strip and a seller footer with avatar + sign-out (spinner during signOut).
- Top bar — business name (Palace Kitchen & Catering), "Hot Seller · 6–12 mo" pill, Exit IQ score pill (49 · Needs Preparation).
- `/dashboard` (`SellerHome.tsx`) — Hero (CP avatar, "Welcome back, Chandan", business framing), KPI row (Exit IQ 49/100, Recommended Listing $1.75M, Normalized SDE $750K midpoint, SBA 7(a) Eligible with DSCR 4.4×), HIGH-risk strip linking to /risk, Case Manager Briefing with three AgentSteps and a **"Review & Approve"** authorization button (pending → "Approved · agents working" state), Sellability Roadmap (the 5 next-steps list from `DEMO_PERSONA.md` Section 15), and an Exit IQ recap row linking back to `/report/mp91it7xqthbf6b`. First-load 480 ms skeleton on KPI values.
- Eight stub routes — `/connect`, `/ingestion`, `/recast`, `/risk`, `/documents`, `/score`, `/marketplace`, `/outreach` — each rendering `components/scorta/LockedStation.tsx` with the route's station number, owning agent, narrative blurb, and a "Back to Seller Home" link. No 404s, no dead links.
- `lib/persona.ts` — single hard-coded source of truth for UI values, sourced exclusively from `.exitiq-debug/sessions/DEMO_PERSONA.md` + `demo-persona.json` + `demo-report.md`. Also exports `STATIONS` array driving the left-rail.

**Mocked / hard-coded:**
- All persona values (Chandan Patel · Palace Kitchen & Catering · $2.1M rev · $725K SDE · $1.75M listing · Exit IQ 49/C · Transferability 38/100 · DSCR 4.4×) live in `lib/persona.ts` and must stay synced with the three persona files.
- The Case Manager "Review & Approve" button on the dashboard is a no-op state machine (idle → 900 ms pending → approved-permanent).
- KPI skeleton timer is a 480 ms fake "first load" — no real async, purely for the loading-state requirement.
- The 8 stub stations show the canonical agent name + Station NN, but no functional UI yet.

**Left for next session:**
- Open **Station 3 — Platform Connectors (`/connect`)**: replace the `LockedStation` stub at `app/(app)/connect/page.tsx` with the QuickBooks / Plaid / Stripe / Google Drive tiles. Statuses from DEMO_PERSONA Section 8 (QuickBooks + Plaid ✅, Stripe + Drive ⬜). Use a simulated connect flow on the unconnected tiles (spinner → success). Keep the "Review & Approve" surface where the Ingestion Agent confirms it has access.
- Write the Station 3 Station Card into DEMO_SPRINT.md before coding.

**Decisions made (that future sessions must respect):**
- **`components/exitiq/report-visual.tsx` was edited** to wire the two existing "continue to Boardroom" CTAs to `/login`. The Section 1 directive says "leave pre-existing exitIQ assessment or report code untouched — ask for permission" — permission was granted in-session by the user. Future stations should still treat the assessment + report code as off-limits unless explicitly authorized.
- Auth gate is implemented at the route-group layout (`app/(app)/layout.tsx`) calling `supabase.auth.getUser()` and redirecting on miss. Middleware continues to refresh sessions (unchanged). Do not duplicate this check at the page level.
- Left-rail status logic: each station's default state lives in `STATIONS` in `lib/persona.ts`; the AppShell promotes the currently-routed station to `active` regardless of its default. To mark a station "shipped," flip its `state` to `"shipped"` in `lib/persona.ts` after the QA Rule passes.
- Cream theme (`data-theme="cream"`) is the Boardroom theme — every authenticated surface (login + all 9 stations) inherits it so the transition from the cream-themed report page feels seamless.
- Demo creds verified against Supabase: `chandan@palacekitchen.com / chandan` returns a valid access token.

**QA Rule (Station 2):**
1. Click-through: ✅ Report CTA → `/login` → submit → `/dashboard` → click any left-rail station → renders LockedStation → "Back to Seller Home" returns to dashboard. Typecheck clean. Dev server: 0 errors across all 10 routes. Unauthed visits to any `(app)` route 307 → `/login`.
2. Investor-ready on 1080p: ✅ Cream glass aesthetic matches the report. EB Garamond headlines, mint scan lines, persona avatar chip, status pills, KPI skeletons, animated approval button. No placeholders, no lorem ipsum.
3. Coherent story: ✅ Every number, name, and label on /dashboard ties back to `DEMO_PERSONA.md` and `demo-report.md` — Palace Kitchen & Catering · Chandan Patel · 15 yrs · $2.1M · $750K SDE · $1.75M listing · Exit IQ 49 · Transferability 38/100 · DSCR 4.4× · SBA eligible · 1 of 11 staff tenured.

**Open questions for the human:**
- Should the Case Manager's "Approve plan" action on the dashboard eventually drive real state forward (e.g., flip Station 3's left-rail icon to ✓ once the plan is approved and the Ingestion Agent kicks off), or stay as a per-page no-op visual? Current implementation is per-page no-op.

---

#### YYYY-MM-DD — Sprint kickoff — Pre-flight

**Shipped:**
- `DEMO_SPRINT.md` created as single source of truth.

**Mocked / hard-coded:**
- None yet.

**Left for next session:**
- Build the Navigation Spine (Section 6) — every route resolves, left-rail status indicators in place.
- Open Station 1 (Intelligent Question Routing) with a full Station Card filled in.

**Decisions made:**
- Sequence locked per Section 5 — no reordering without updating this file first.
- Demo persona locked — all values pulled from the three files referenced in Section 11 (`.exitiq-debug/sessions/DEMO_PERSONA.md`, `demo-persona.json`, `demo-report.md`). If a needed value is missing from those files, log an open question; never invent.

**Open questions for the human:**
- Demo runtime: what is the exact 5–8 minute click-path being walked on stage? (This determines which screens get the most polish budget.)
