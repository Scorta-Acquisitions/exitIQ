# STATION_7.md — CIM & Docs

## Goal
Generate the Confidential Information Memorandum that a buyer
or lender would actually receive. This is the moment all of
Scorta's upstream work — the recast financials, the risk
remediation plan, the Boardroom's objection responses — gets
assembled into a publishable deal document. The seller sees
the CIM being built section by section, reviews it, and
approves it for VDR release.

The dominant message of this station is: all of that agent
work produced something real and publishable. The CIM is
not a template with placeholders. It is a document built
from approved data, written for the specific buyer profiles
the Boardroom identified.

---

## Route + Entry Point
**Route:** `/documents`
**Arrives from:** `/boardroom` via "Dispatch Agent Fleet" CTA
**Exits to:** `/marketplace` via "Publish to VDR & Continue →"
  approval gate at the bottom of the station

ARIA intro on arrival:
"The Recast Agent and Boardroom have handed off everything
the CIM Agent needs. Palace Kitchen & Catering's Confidential
Information Memorandum is being assembled now — 12 sections,
built from approved data. Review and approve each section
before it goes to buyers."

---

## What This Station Must Establish for Downstream Stations

- `/marketplace` — lenders receive a link to the approved
  CIM in the VDR as part of the lender package. The CIM
  must be approved here before lender matching is meaningful.
- `/score` — the Scorta Score's Documentation sub-score
  (65/100 → 81/100 post-remediation) is partially driven
  by CIM completeness. A complete, approved CIM moves
  the Documentation score.
- `/outreach` — buyers access the CIM through the VDR
  after signing an NDA. The CIM approved here is what
  they read. Buyer engagement metrics on `/outreach`
  (CIM opened, sections read) reference this document.

---

## What We Are Building

Three layers:

LAYER 1 — GENERATION
A streaming assembly sequence showing the CIM being built
section by section. Each of the 12 sections appears one at
a time with a typewriter reveal. The seller watches the
document come together.

LAYER 2 — PREVIEW
A structured document preview. Section 1 (Executive Summary)
is fully populated and readable. Sections 2–12 are collapsed
to their titles with a section-complete chip. One additional
section (Deal Structure, Section 6) is expanded to show a
second complete section — giving the impression of a fully
populated document without building all 12.

LAYER 3 — APPROVAL GATE
The seller approves the CIM for VDR release. This is the
canonical mint gradient banner approval, not the dashed
◇ approval surface — this approval triggers an action
(publishing to the VDR), making it a first-class gate.

---

## Hard-Coded Surface

All section titles from `DEMO_PERSONA.md` Section 10.
Executive Summary content from approved upstream data.
Deal Structure content from Section 7 (SBA financing).
All financial figures from the approved recast (Section 3).

─────────────────────────────────────────────
PAGE OPEN — CIM AGENT GENERATING (streaming)
─────────────────────────────────────────────
On arrival, a brief generation sequence plays before the
preview surface renders. Reuse the dark terminal-card
surface (matching Ingestion + Boardroom + Risk).

Terminal card header:
  "CIM AGENT · PALACE KITCHEN & CATERING"
  Host label: "cim-agent · assembling · live"

Single stream (not dual — one agent, one document):
  12 lines, one per CIM section, at 300ms cadence.
  Each line format: `[Section N] Title... ✓`

  [Section 01] Executive Summary... ✓
  [Section 02] Business Overview & History... ✓
  [Section 03] Products & Services... ✓
  [Section 04] Market & Competition... ✓
  [Section 05] Financial Performance... ✓
  [Section 06] Deal Structure & Terms... ✓
  [Section 07] Operations & Staffing... ✓
  [Section 08] Owner-Dependency Remediation... ✓
  [Section 09] Customer Concentration Analysis... ✓
  [Section 10] Facilities & Equipment... ✓
  [Section 11] Growth Opportunities... ✓
  [Section 12] Buyer Qualification Criteria... ✓

After the last line:
  "CIM Agent · assembly complete · 12 sections · ready for review"

Total: 12 × 300ms = 3.6s. Then 360ms reveal of the
preview surface below the terminal card. Terminal card
stays visible above the preview (collapsed to a slim
status bar: "CIM Agent · complete · 12 sections ✓").

─────────────────────────────────────────────
CIM PREVIEW SURFACE
─────────────────────────────────────────────
Document-style surface. Feels like a real PDF preview —
not a dashboard card. Use a slightly warm off-white
background (`#faf9f7` or similar), Garamond throughout,
with a document header at the top:

DOCUMENT HEADER:
  "CONFIDENTIAL INFORMATION MEMORANDUM"
  "Palace Kitchen & Catering · Prepared by Scorta"
  "[today's date] · SBA 7(a) Eligible · Listed: $1.75M"
  Scorta wordmark + "Broker of Record" caption

Below the header, 12 section rows in accordion style.
Default state: Section 1 and Section 6 expanded,
all others collapsed.

─────────────────────────────────────────────
SECTION 1 — EXECUTIVE SUMMARY (expanded)
─────────────────────────────────────────────
Section chip: "● Complete · Recast Agent + CIM Agent"
Garamond H2: "Executive Summary"

Full prose block (3–4 paragraphs):

Para 1 — Business overview:
  "Palace Kitchen & Catering is a 15-year-old,
  owner-operated food service business located in
  Northern New Jersey. The business operates a
  full-service commercial kitchen offering walk-in
  dining, corporate catering, and event services.
  The owner holds title to the 4,200 sq ft facility,
  which is included in the listing."

Para 2 — Financial performance:
  "Over the trailing 36 months, Palace Kitchen has
  grown revenue at an 18% compound rate, reaching
  $2.1M in Year 3. Normalized Seller's Discretionary
  Earnings (SDE) for Year 3 are $962,000, after
  $147,000 in documented and SBA-defensible add-backs
  including owner compensation, personal vehicle
  expenses, and a non-recurring equipment repair.
  The 3-year normalized SDE trend shows consistent
  improvement: $827K (Year 1) → $934K (Year 2) →
  $962K (Year 3)."

Para 3 — Deal structure:
  "The business is listed at $1.75M, representing a
  2.4x multiple on Year 3 normalized SDE. The listing
  is SBA 7(a) eligible with a projected DSCR of 4.4x —
  well above the 1.25x threshold. Minimum buyer down
  payment is $106,000. Property ownership provides
  a balance sheet asset that supports both SBA
  financing and micro-PE acquisition structures."

Para 4 — Readiness:
  "A Scorta-assisted remediation plan is in progress
  to address owner-dependency risk (current
  Transferability score: 38/100; target: 62/100).
  Completion of the 5-task SOP documentation program
  is projected to add $450,000 in deal value and
  support the upper end of the valuation range at
  a 3.0x multiple. The NJ Transit Corporate Catering
  account (19% of revenue, 6-year tenure) is being
  formalized under a 3-year written contract."

─────────────────────────────────────────────
SECTIONS 2–5, 7–12 (collapsed)
─────────────────────────────────────────────
Each collapsed row shows:
  Section number + title
  Chip: "● Complete · [agent attribution]"
  Chevron toggle (rotates on expand — no content
  rendered in the demo, just expands to a mint
  placeholder: "Section [N] content available
  in VDR · approved for buyer access")

Collapsed sections and their agent attributions:
  02  Business Overview & History · CIM Agent
  03  Products & Services · CIM Agent
  04  Market & Competition · CIM Agent
  05  Financial Performance · Recast Agent
  07  Operations & Staffing · Owner-Dep Agent
  08  Owner-Dependency Remediation · Owner-Dep Agent
  09  Customer Concentration Analysis · Concentration Agent
  10  Facilities & Equipment · CIM Agent
  11  Growth Opportunities · CIM Agent
  12  Buyer Qualification Criteria · Boardroom

─────────────────────────────────────────────
SECTION 6 — DEAL STRUCTURE & TERMS (expanded)
─────────────────────────────────────────────
Section chip: "● Complete · Recast Agent + Boardroom"
Garamond H2: "Deal Structure & Terms"

Two-column layout matching the Recast station's
valuation panel pattern:

Left — the numbers:
  Listing Price:        $1,750,000
  Multiple (Year 3):    2.4× SDE
  Valuation Range:      $1.6M – $1.9M
  Asset Floor:          $500K
  ─────────────────────────────────
  SBA 7(a) Financing:
  Loan Amount:          $1,090,000 (87.5% financed)
  Buyer Down Payment:   $106,000 minimum
  Monthly Debt Service: $14,200/month
  DSCR:                 4.4× (floor 1.25×)
  ─────────────────────────────────
  Seller Note (Micro-PE):  $175K–$229K optional
  Earnout:                 Available on request

Right — buyer structure guidance:
  Per buyer profile (reference Boardroom persona colors):

  [Mint chip] SBA-Backed Operator
  "Full SBA 7(a) structure available at $106K down.
  Conditional on SOP documentation completion.
  Pre-qualified lender matches available in VDR."

  [Sky chip] Search Fund
  "SBA or seller-financed. Conditional on 3-year
  NJ Transit contract confirmation. Outreach held
  pending contract status."

  [Peach chip] Micro-PE
  "Cash + seller note. $175K–$229K seller note
  (10–15% of deal). No hard conditions — prefers
  faster close. Platform acquisition framing."

─────────────────────────────────────────────
REVIEW & APPROVE GATE
─────────────────────────────────────────────
Below the document preview, the canonical mint gradient
approval banner:

Agent eyebrow: "CIM AGENT · AWAITING YOUR APPROVAL"
Headline: "Approve the CIM for VDR release."
Body: "Once approved, the CIM will be published to
  your Virtual Data Room and made available to buyers
  who sign an NDA. Lender package distribution will
  reference the approved CIM. You can update individual
  sections at any time — updates require re-approval."

Two CTAs:
- Secondary: "Preview full CIM" → tooltip only:
  "Full 12-section CIM available in your VDR."
- Primary: "Approve & Publish to VDR →" →
  700ms spinner ("Publishing to VDR...") →
  audit confirmation line →
  router.push("/marketplace")

Audit confirmation line:
"✓ CIM approved by Chandan Patel · [today] · [time]
  · Published to VDR · Lender package distribution
  authorized."

---

## Interactions

- **Section accordion chevrons** — expand/collapse each
  section row. Collapsed sections expand to a mint
  placeholder line. No full content rendered in demo.
- **Section agent attribution chips** — hovering shows
  tooltip: "Built from [agent]'s approved output."
  Reinforces the upstream chain.
- **Deal Structure buyer profile chips** — hovering
  expands inline to show the full condition text
  (same hover-expand pattern as Boardroom verdict badges).
- **"Preview full CIM" CTA** — tooltip only, 2.2s flash.
- **Document header date** — generated live from
  `new Date()`. Every other value hard-coded.

---

## Loading States

- **Generation sequence:** 12 lines × 300ms = 3.6s.
  Terminal card stays visible as a collapsed status bar
  after completion. Do not hide it — it is evidence that
  the agent ran.
- **Preview reveal:** 360ms slide-in after generation
  completes.
- **Approve button:** 700ms spinner, "Publishing to VDR..."
  Fixed width, no layout shift.

---

## Visual Design Direction

The CIM preview surface must feel like a real financial
document. Off-white background, Garamond throughout,
clean section rows with consistent spacing. The document
header ("CONFIDENTIAL INFORMATION MEMORANDUM") should
feel like the top of a real PDF — not a UI card.

The contrast between the dark terminal card (generation)
and the warm off-white document surface (preview) is
intentional — the machine builds it, then the human
reviews it as a real document. Do not make the preview
surface feel like a dashboard. It is a document.

Section 1 prose is the only content the audience will
actually read during the demo. It must be dense enough
to feel real and specific enough to reference Palace
explicitly in every paragraph.

---

## Downstream Implications for the Station Agent

1. **The document header date is the only live value.**
   Everything else hard-coded. Same rule as audit lines
   in prior stations.

2. **Section 12 ("Buyer Qualification Criteria") is
   attributed to the Boardroom.** When the user hovers
   that chip, the tooltip should read: "Built from
   Boardroom's buyer persona analysis — SBA-Backed
   Operator and Micro-PE prioritized." This is the
   clearest downstream reference to the Boardroom's
   work product in the CIM.

3. **The deal structure buyer profile chips use the
   persona accent colors established in the Boardroom
   station** (mint / sky / peach). Do not introduce
   new colors.

4. **After this station ships**, flip `/documents` from
   `locked` → `active` and `/boardroom` stays `active`
   in `lib/persona.ts`. `/marketplace` remains locked
   until Station 8 ships.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   Arriving from `/boardroom` → ARIA intro renders →
   dark terminal card streams 12 section lines at 300ms
   cadence → "assembly complete" line renders → terminal
   card collapses to status bar → CIM preview slides in
   → Section 1 expanded with full prose → Section 6
   expanded with deal structure → remaining sections
   collapsed with chips → section chevrons toggle
   open/close → agent attribution chip hovers fire →
   "Approve & Publish to VDR →" → 700ms spinner →
   audit line → routes to `/marketplace` (LockedStation).
   No console errors. pnpm typecheck clean.

2. **Does it look investor-ready on 1080p?**
   Document header reads as a real CIM cover. Section 1
   prose is dense and specific — no placeholder language.
   Section 6 deal structure matches the Recast station's
   valuation panel visual rhythm. Terminal card generation
   sequence is visible and satisfying. Approval banner
   communicates that this is a real publishing action.

3. **Does the mock data tell a coherent story?**
   Every number in Section 1 and Section 6 traces to
   the approved recast: $2.1M revenue, $962K SDE, $1.75M
   listing, 2.4× multiple, $147K add-backs, DSCR 4.4×,
   $106K down, $1.09M loan. Buyer profile chips match
   Boardroom verdict framing exactly. Transferability
   38/100 → 62/100 and +$450K referenced in Section 1
   match Risk Analysis output. NJ Transit contract
   framing matches Concentration Agent output.