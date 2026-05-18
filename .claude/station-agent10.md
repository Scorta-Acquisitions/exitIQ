# STATION_OUTREACH.md — Lenders, Buyers & Outreach

## Goal
Take everything the agent fleet has built — the approved recast,
the CIM, the Boardroom's buyer targeting, the VDR — and put it
in front of the right lenders and buyers. This station is where
the deal goes to market. It is the operational execution layer
of the Boardroom's strategic recommendations.

Two coordinated agents run this station: the Lender Ops Agent
assembles and submits the SBA package to matched lenders; the
Outreach Agent runs personalized buyer sequences against
Scorta's verified network. Both pipelines are visible
simultaneously. The seller controls approval at every step —
no communication leaves without their sign-off.

This is the most operationally dense station in the demo.
It must feel like a real deal room in motion — not a CRM
dashboard, not a marketing tool. It is a coordinated,
agent-driven transaction pipeline with a human principal.

---

## Route + Entry Point
**Route:** `/outreach`
**Arrives from:** `/score` via "Proceed to Lender Matching →"
**Does not have a single exit** — this is the terminal
  operational station. The deal is in market from here.
  A "Deal Summary" CTA at the bottom surfaces a final
  status snapshot but does not route to a new station.

ARIA intro on arrival:
"The Lender Ops Agent has matched three SBA lenders against
Palace's approved financials. The Outreach Agent has built
sequences for two buyer profiles — SBA-Backed Operator and
Micro-PE. Search Fund outreach is held pending the NJ Transit
contract confirmation. Nothing goes out until you approve it.
Review both pipelines and authorize."

---

## What This Station Establishes

This is the last sequential station. Everything built upstream
converges here:
- Recast financials → lender package
- CIM → buyer outreach payload
- Boardroom buyer targeting → outreach priority order
- VDR approval → CIM access gating
- Risk remediation status → Search Fund hold condition
- Scorta Score → lender match eligibility signal

The outputs of this station feed back into the VDR
(buyer NDA tracking, lender submission status) and into
the Agent Activity Panel (Outreach Agent row flips from
WAITING → RUNNING when outreach is authorized here).

---

## Layout

The station uses a **two-column layout** — the two
pipelines side by side, equal weight. On 1080p each
column is approximately 520px wide. A full-width
approval gate sits at the bottom spanning both columns.

Left column: LENDER PIPELINE (Lender Ops Agent)
Right column: BUYER PIPELINE (Outreach Agent)

Each column has its own section header, agent eyebrow,
and independent state. They are coordinated but not
coupled — the seller can authorize lender submission
without authorizing buyer outreach, and vice versa.

---

## Hard-Coded Surface

Lender data from `DEMO_PERSONA.md` Section 7.
Buyer data from Boardroom persona definitions.
Outreach sequence copy consistent with Boardroom
verdict framings (SBA conditional on SOPs, Micro-PE
proceed, Search Fund held).

─────────────────────────────────────────────
PAGE OPEN — AGENTS BRIEFING (1.4s)
─────────────────────────────────────────────
Brief dual-thread in-progress state on arrival.
Reuse the dual-stream terminal card from Station 6.

Left thread (Lender Ops Agent):
  "Loading approved P&L Recast..."
  "Matching lenders against deal profile..."
  "Ranking by match score..."

Right thread (Outreach Agent):
  "Loading Boardroom buyer segment recommendations..."
  "Building SBA-Backed Operator sequence..."
  "Building Micro-PE sequence..."

After 1.4s both streams complete.
Full two-column surface slides in (360ms).

─────────────────────────────────────────────
LEFT COLUMN — LENDER PIPELINE
─────────────────────────────────────────────
Section label: "LENDER OPS AGENT · SBA 7(A) PACKAGE"
Status chip: ● READY TO SUBMIT (mint)
Boardroom ref: "Lender package built from approved
  recast · DSCR 4.4× · SBA 7(a) eligible"

PACKAGE SUMMARY CARD (above the lender list):
  Mini financial summary — the lender sees this first:
  Normalized SDE (Year 3):    $962,000
  Listing Price:              $1,750,000
  Loan Amount:                $1,090,000
  Buyer Down Payment:         $106,000 minimum
  DSCR:                       4.4× (floor 1.25×)
  Monthly Debt Service:       $14,200/month
  Scorta Score:               71/100 · SBA Eligible

  Below the summary: "P&L Recast + add-back schedule
  + DSCR worksheet assembled · published to VDR."
  CTA: "View package in VDR →" → routes to /vdr

THREE LENDER CARDS (stacked, ranked by match score):

LENDER 1 — Northeast Community Bank
  Match: 94% (mint progress bar)
  Type: NJ food service specialist · SBA preferred lender
  Note: "Highest match — local relationship lender,
    NJ food service specialization, SBA preferred
    status means faster commitment."
  Loan terms: Up to $1.4M · 10-year term · prime + 2.75%
  Status chip: ● VDR ACCESS GRANTED (mint)
    (reflects the access approval from /vdr)
  CTA: "Include in submission →"
    → toggles to "✓ Selected" on click

LENDER 2 — First National Business Capital
  Match: 87% (mint progress bar)
  Type: National SBA lender · 15-day commitment SLA
  Note: "Fast commitment timeline — 15-day SLA
    suitable for Chandan's 6–12 month exit window."
  Loan terms: Up to $1.2M · 10-year term · prime + 3.0%
  Status chip: ○ NOT YET CONTACTED (muted)
  CTA: "Include in submission →"
    → toggles to "✓ Selected" on click

LENDER 3 — ReadyCap Commercial
  Match: 81% (mint progress bar)
  Type: SBA non-bank lender · flexible down payment
  Note: "Flexible down payment structure — useful if
    buyer needs sub-$106K entry point."
  Loan terms: Up to $1.1M · 10-year term · prime + 3.25%
  Status chip: ○ NOT YET CONTACTED (muted)
  CTA: "Include in submission →"
    → toggles to "✓ Selected" on click

SUBMIT LENDER PACKAGE CTA (below the three cards):
  Shows count of selected lenders: "2 lenders selected"
  Primary dark button (not mint — this is column-level,
  not the full approval gate): "Submit Package to
  Selected Lenders →"
  → 700ms spinner ("Uploading to lender portals...")
  → each selected lender card flips status chip to
     ✓ SUBMITTED · [timestamp]
  → a confirmation line appears:
    "Package submitted to 2 lenders · Lender Ops
    Agent monitoring for responses."
  No route change. No audit line (that happens at
  the full approval gate below).

─────────────────────────────────────────────
RIGHT COLUMN — BUYER PIPELINE
─────────────────────────────────────────────
Section label: "OUTREACH AGENT · BUYER SEQUENCES"
Status chip: ● 2 SEQUENCES READY · 1 HELD (amber)
Boardroom ref: "Priority order from Boardroom:
  SBA-Backed Operator first · Micro-PE second ·
  Search Fund held pending NJ Transit contract"

PIPELINE KANBAN (4 columns within the right panel):
  [ Identified ] [ Contacted ] [ Interested ] [ NDA Signed ]

Each buyer card shows: avatar initial + name + buyer
type chip (using established persona accent colors:
mint/sky/peach) + match rationale line + current
stage + action.

IDENTIFIED COLUMN (2 buyers):

  Buyer Card — Marcus Rivera
  Type: SBA-BACKED OPERATOR (mint chip)
  Profile: "First-time buyer · SBA 7(a) pre-qualified ·
    restaurant operations background · NJ-based"
  Match rationale: "DSCR 4.4× strong for SBA.
    Boardroom: proceed to LOI conditional on SOPs."
  Sequence: 4-touch sequence ready
    Touch 1: "Personalized intro — Palace's 15-year
      history, $962K SDE, SBA pre-qual status"
    Touch 2: "CIM access invitation with NDA link"
    Touch 3: "DSCR worksheet + lender intro"
    Touch 4: "LOI structure conversation"
  Outreach Agent note: "Sequence ready to launch.
    Awaiting authorization."
  CTA: "Launch Sequence →" (mint)
    → on click: spinner → card moves to CONTACTED
    column → VDR context updates Marcus Rivera
    to "outreach initiated"

  Buyer Card — David Chen
  Type: MICRO-PE BUYER (peach chip)
  Profile: "Independent sponsor · platform acquisition
    focus · property + brand thesis · 2 prior deals"
  Match rationale: "Property ownership = balance sheet
    asset. Boardroom: proceed, seller note preferred."
  Sequence: 3-touch sequence ready
    Touch 1: "Platform acquisition angle — Palace's
      property + 15-year brand as anchor asset"
    Touch 2: "CIM access + deal structure memo
      (seller note $175K–$229K modeled)"
    Touch 3: "Management transition discussion +
      LOI structure"
  Outreach Agent note: "Sequence ready to launch.
    Awaiting authorization."
  CTA: "Launch Sequence →" (peach)
    → same flow as Marcus Rivera

HELD COLUMN (1 buyer, distinct visual treatment):

  Buyer Card — Search Fund (Profile TBD)
  Type: SEARCH FUND BUYER (sky chip)
  Status: ON HOLD — amber left border, amber bg tint
  Hold reason card:
    "HOLD CONDITION · CONCENTRATION AGENT"
    "NJ Transit contract confirmation required before
    Search Fund outreach. The Search Fund's deal-
    breaker objection (Boardroom WO 2) has not yet
    been resolved. Outreach Agent will auto-launch
    this sequence when the Concentration Agent
    confirms contract status."
  Estimated unlock: "When NJ Transit 3-year contract
    is confirmed → Search Fund sequence launches
    automatically"
  CTA: "Override Hold →" → tooltip: "Not recommended.
    The Search Fund will ask about contract status
    immediately. Resolve the hold condition first."

CONTACTED / INTERESTED / NDA SIGNED COLUMNS:
  Initially empty. Populate as buyer cards are launched.
  The Kanban is live — cards move as the demo progresses.
  After Marcus Rivera is launched, his card appears
  in CONTACTED with a "2 hours ago" timestamp.

  CONTACTED column placeholder (before any launches):
    "No buyers contacted yet · launch a sequence
    to begin" (muted, centered)

─────────────────────────────────────────────
FULL-WIDTH APPROVAL GATE
─────────────────────────────────────────────
Below both columns, the canonical mint gradient
approval banner:

Agent eyebrow: "LENDER OPS AGENT + OUTREACH AGENT
  · AWAITING YOUR APPROVAL"
Headline: "Authorize the full outreach and lender
  submission strategy."
Body: "Approving this plan authorizes the Lender Ops
  Agent to submit the SBA package to selected lenders
  and the Outreach Agent to launch buyer sequences.
  Every response, NDA, and lender communication will
  route back here for your review. You can pause or
  revoke access at any time from the VDR."

Two CTAs:
- Secondary: "Review outreach plan" → tooltip only:
  "Full sequence copy available for review before
  launch." 2.2s flash.
- Primary: "Authorize & Launch →"
  → 700ms spinner cycling:
    "Authorizing Lender Ops Agent..."
    "Authorizing Outreach Agent..."
    "Logging approval..."
  → Each lender card that was selected flips to
     ✓ SUBMITTED if not already submitted
  → Each buyer card in Identified moves to CONTACTED
     with staggered 300ms delay per card
  → Audit confirmation line:
    "✓ Lender submission and buyer outreach authorized
    by Chandan Patel · [today] · [time] · Lender Ops
    Agent and Outreach Agent active. All responses
    route to Chandan for review before any commitment
    is made."

─────────────────────────────────────────────
POST-AUTHORIZATION STATE
─────────────────────────────────────────────
After the full approval fires, the page settles
into a live monitoring view. The approval banner
is replaced by a status summary bar:

  ● Lender Ops Agent — monitoring 2 submissions
  ● Outreach Agent — 2 sequences active · 1 held
  → "View all activity in VDR →"

The Kanban now shows both buyer cards in CONTACTED.
The lender cards show SUBMITTED status.

A deal progress strip appears at the very bottom
of the page — a horizontal timeline showing all
completed stations as ✓ chips leading up to the
current "In Market" state:

  ✓ Intake → ✓ Connect → ✓ Ingest → ✓ Recast →
  ✓ Risk → ✓ Boardroom → ✓ CIM → ✓ Score →
  ✓ VDR → ✓ Lenders → ✓ Outreach →
  ● IN MARKET (mint pulse)

This strip is the demo's emotional close — the full
journey compressed into one horizontal line ending
at "In Market."

---

## Interactions

- **Lender card "Include in submission" toggle** —
  toggles between included/not included. Running
  total updates in the Submit CTA label.
- **"Submit Package to Selected Lenders" CTA** —
  column-level submit, independent of the full
  approval gate. Can be used before or instead of
  the full gate.
- **"Launch Sequence" on buyer cards** — launches
  individual sequences. Cards move to CONTACTED.
  Can be done before or instead of the full gate.
- **Kanban card drag** — cards are draggable between
  columns (Identified → Contacted → Interested →
  NDA Signed) for demo flexibility. Drag is visual
  only — no state change in downstream systems.
- **"Override Hold" on Search Fund card** — tooltip
  only. Does not launch sequence.
- **Deal progress strip** — appears only after
  full authorization fires.
- **Sequence touch rows** — expandable within each
  buyer card (chevron toggle). Default: collapsed.
  Touch 1 is always visible as a preview.

---

## Visual Design Direction

The two-column layout is the dominant structural
choice. Both pipelines must feel equally weighted
and professionally composed — this is not a
lopsided dashboard with one primary panel.

The lender column reads like a financial submission
surface: clean rows, match percentages as progress
bars, package summary card at the top that feels
like the cover sheet of the SBA package.

The buyer column reads like a deal pipeline: the
Kanban communicates momentum and stage. The buyer
cards feel like deal cards — persona type chip,
match rationale, sequence preview. The held Search
Fund card with the amber treatment is the visual
tension in the column — something is waiting to
be resolved.

The deal progress strip at the bottom is the
emotional punctuation of the entire demo. It is
the one moment the seller sees the full arc of
what just happened. It must be satisfying. Every
✓ chip should feel earned.

---

## Downstream Implications

1. **The Agent Activity Panel updates when outreach
   is authorized here.** The Outreach Agent row in
   the panel flips from WAITING → RUNNING when the
   full approval gate fires. The Owner-Dependency
   Agent row flips to REVIEWING ("SOP templates
   ready · Chandan to fill in") — the SOPs are
   needed to close the SBA-Backed Operator's
   conditional LOI.

2. **The VDR reflects outreach authorization.**
   After Marcus Rivera's sequence launches, his
   entry in the VDR access log updates to "Outreach
   initiated." After Northeast Community Bank is
   submitted, their VDR entry shows "Package
   submitted."

3. **Lender cards use the same match percentages
   and terms as the persona file.** Do not invent
   new lender terms. The three lenders (Northeast
   Community Bank 94% / First National 87% /
   ReadyCap 81%) are the canonical lender set from
   `DEMO_PERSONA.md` Section 7.

4. **The buyer names (Marcus Rivera / David Chen)
   are demo-purpose personas** — not in the persona
   file. They represent the SBA-Backed Operator and
   Micro-PE buyer profiles from the Boardroom. Use
   these names consistently if they appear in the
   VDR access log or the Agent Activity Panel.

5. **After this station ships**, flip `/outreach`
   from `locked` → `active` in `lib/persona.ts`.
   It does not flip to `shipped` — like the VDR
   and Boardroom, it is always-on once activated.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   Arriving from `/score` → 1.4s dual-thread briefing
   → two-column surface slides in. Lender column shows
   package summary + 3 lender cards. Buyer column shows
   Kanban with 2 identified buyers + 1 held card. Lender
   "Include" toggles work. "Submit Package" on lenders
   → spinner → cards flip to SUBMITTED. "Launch Sequence"
   on Marcus Rivera → card moves to CONTACTED column.
   Full approval gate → spinner cycling agent names →
   audit line → post-authorization state renders with
   deal progress strip. No console errors. pnpm typecheck
   clean.

2. **Does it look investor-ready on 1080p?**
   Two columns are equal weight. Lender column reads as
   a financial submission surface. Buyer Kanban has clear
   stage columns. Held Search Fund card is visually
   distinct (amber treatment) without being alarming.
   Deal progress strip at the bottom is satisfying and
   readable. Mint accent budget held — match bars, launch
   CTAs, the IN MARKET chip. No placeholders.

3. **Does the mock data tell a coherent story?**
   Marcus Rivera (SBA-Backed Operator) matches Boardroom
   WO 4 priority 1. David Chen (Micro-PE) matches priority
   2. Search Fund hold condition matches Boardroom WO 2
   (NJ Transit contract). Lender match percentages and
   terms match Section 7 exactly. Package summary numbers
   match the approved recast ($962K SDE, $1.75M, DSCR
   4.4×, $106K down). The deal progress strip shows every
   station in correct sequence. The "IN MARKET" end state
   is the emotional payoff the demo has been building to.