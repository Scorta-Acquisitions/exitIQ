# STATION_5.md — Financial Recast

## Goal
Show the seller what their business financials actually look like
through the eyes of an SBA underwriter — normalized, add-back
justified, and defensible. This is the moment the seller sees
their "real" numbers for the first time. The gap between reported
EBITDA and normalized SDE is the core value Scorta has already
delivered before a single buyer has been contacted. The human
approval here is the most consequential gate in the demo — once
Chandan approves, the recast is publishable to lenders and buyers.

The station must feel like a real financial document, not a
dashboard. The Recast Agent did the work of a QofE firm. The
screen should communicate that weight.

---

## Route + Entry Point
**Route:** `/recast`
**Arrives from:** `/ingestion` via "Approve & Continue" CTA
**Exits to:** `/risk` via "Approve Recast & Continue" gate

The user arrives with the Recast Agent already "dispatched"
by the prior approval. Open in a brief in-progress state
that resolves into the full recast surface — consistent with
the handoff pattern established in Stations 3 and 4.

---

## What This Station Must Establish for Downstream Stations

The approved recast is the financial backbone of the entire deal.
Nothing downstream is credible without it.

- `/risk` — the multiple compression story (1.5x vs 3x) is
  only meaningful relative to the $962K normalized SDE and
  $1.75M listing price established here. The +$450K fix value
  for owner-dependency is calculated against this baseline.
- `/score` — Financial Health (68/100) and Documentation (65/100)
  sub-scores are derived from the recast quality, add-back
  defensibility, and 3-year trend established here.
- `/marketplace` — the lender package is built directly from the
  approved recast narrative. DSCR 4.4x traces to $962K SDE.
  Lender match percentages reference the approved add-back story.
- `/documents` — the CIM is generated from the approved recast.
  The executive summary, financial performance section, and
  normalized SDE add-back schedule in the CIM are outputs of
  what gets approved on this screen.
- `/outreach` — buyers receive the recast financials through the
  VDR once this is approved. The listing price of $1.75M shown
  to buyers originates here.

Boardroom (future station) — the Recast Agent feeds updated
financials into the Boardroom continuously as the seller
provides new information. This station's output is the first
input the Boardroom reasons against. The recast narrative and
add-back defensibility directly affect the SBA-Backed Operator
persona's "would proceed to LOI" verdict.

If any recast number on this screen is inconsistent with what
the Ingestion Agent produced in Station 4, every downstream
station fails QA question 3.

---

## What We Are Building

A financial recast surface with three layers:

1. **The before/after recast table** — reported vs. normalized,
   all three years, every line item. The seller sees exactly
   what changed and why.

2. **The add-back narrative** — for each add-back line item,
   the Recast Agent has generated a short lender-facing
   justification. This is the LLM layer — the prose that
   accompanies the deterministic math and makes each
   adjustment defensible in a lender's hands.

3. **The valuation output** — the normalized SDE drives a
   recommended listing price with the multiple range shown
   transparently. The seller sees how the number was reached,
   not just what it is.

Each layer builds on the last. The table establishes the
numbers. The narrative makes them defensible. The valuation
output shows what those numbers are worth.

---

## Hard-Coded Surface

All values from `DEMO_PERSONA.md` Section 3.
All add-back narrative copy must be consistent with SBA SOP
50 10 8 logic — the Recast Agent writes narratives that a
real lender would find defensible. Do not invent copy that
would not survive lender scrutiny.

─────────────────────────────────────────────
PAGE OPEN — RECAST AGENT IN PROGRESS
─────────────────────────────────────────────
Brief 1.8s in-progress state on arrival. Reuse SyncStream
pattern (400ms cadence). ARIA banner:
"Recast Agent is normalizing Palace's financials — applying
SBA-style add-backs and cleaning the EBITDA story."

Three cycling status lines:
  "Applying owner compensation add-back..."
  "Normalizing one-time and personal expenses..."
  "Building SBA-defensible narrative..."

After 1.8s, banner updates:
"Recast complete. Review the normalized financials and
approve before the Recast Agent publishes to your
lender package."

Full recast surface slides in (360ms, same reveal pattern
as Station 4 summary card).

─────────────────────────────────────────────
SECTION 1 — BEFORE / AFTER RECAST TABLE
─────────────────────────────────────────────
Full 3-year P&L. All three years side by side.
2024 column mint-emphasized — most recent is most relevant.
"Before" and "After" are not separate tables. They are
columns within a single table, so the delta is immediately
visible on each row.

Columns: Line Item / 2022 / 2023 / 2024

Rows:
  Gross Revenue         $1,780,000   $1,970,000   $2,100,000
  Cost of Goods Sold     $534,000     $591,000     $630,000
  Gross Profit         $1,246,000   $1,379,000   $1,470,000
  Payroll (non-owner)    $412,000     $441,000     $463,000
  Utilities               $68,000      $72,000      $76,000
  Marketing               $24,000      $31,000      $38,000
  Insurance               $18,000      $19,000      $21,000
  Other Operating         $44,000      $51,000      $57,000
  ─────────────────────────────────────────────────────────
  EBITDA (as reported)   $680,000     $765,000     $815,000
  ─────────────────────────────────────────────────────────
  [ADD-BACKS — expandable section, open by default]
  Owner Comp Add-Back    +$120,000    +$120,000    +$120,000
  Personal Vehicle        +$18,000     +$18,000     +$18,000
  One-Time Equipment          —        +$22,000         —
  Personal Travel          +$9,000      +$9,000      +$9,000
  ─────────────────────────────────────────────────────────
  Total Add-Backs        +$147,000    +$169,000    +$147,000
  ─────────────────────────────────────────────────────────
  NORMALIZED SDE         $827,000     $934,000     $962,000

The NORMALIZED SDE row uses mint text, bold weight, and a
mint left border. It is the number the entire screen exists
to establish.

Add-back rows each have a small "ⓘ" icon. Clicking or
hovering reveals the narrative tooltip for that line item
(see Section 2 below). This connects the table to the
narrative without cluttering the table itself.

─────────────────────────────────────────────
SECTION 2 — ADD-BACK NARRATIVE
─────────────────────────────────────────────
Below the table, a collapsible section (open by default):
"Add-Back Justifications — Recast Agent Narrative"
Subhead: "The following narratives accompany the recast and
  will be included in the lender package. Each justification
  is written to SBA SOP 50 10 8 standards."

Four narrative cards, one per add-back. Each card:
  - Add-back label + amount
  - 2–3 sentence lender-facing narrative
  - Defensibility badge: "● SBA Accepted" (mint) or
    "● Likely Accepted" (sky) or "⚠ Review Required" (peach)

Narratives (hard-coded):

Owner Compensation — $120,000/yr — ● SBA Accepted
  "Owner salary of $120,000 annually is added back as
  seller's discretionary earnings. This represents
  compensation paid to the owner-operator above and beyond
  what a replacement manager would require. A buyer
  stepping into this role would recapture this cash flow
  in full. Supported by payroll records across all 3 years."

Personal Vehicle — $18,000/yr — ● SBA Accepted
  "Vehicle expenses of $18,000 annually were run through
  the business for a personally-owned vehicle with
  documented mixed personal and business use. The
  business-use portion has been isolated; the personal
  use component is added back as non-operating expense.
  Consistent treatment across all 3 years."

One-Time Equipment Repair — $22,000 (Year 2 only) — ● SBA Accepted
  "A non-recurring equipment repair of $22,000 was
  incurred in 2023 for commercial kitchen equipment.
  This item is added back as a one-time capital event
  with no expected recurrence, supported by vendor
  invoice documentation. Excluded from Year 1 and
  Year 3 normalized figures."

Personal Travel — $9,000/yr — ● Likely Accepted
  "Travel expenses of $9,000 annually include a personal
  travel component run through the business. The non-
  business portion is added back. A lender may request
  supporting documentation distinguishing business travel
  from personal. Recommend retaining receipts for lender
  review."

─────────────────────────────────────────────
SECTION 3 — VALUATION OUTPUT
─────────────────────────────────────────────
Section label: "Valuation — Based on Approved Recast"

Two-column layout:
Left — the math, shown transparently:
  Normalized SDE (Year 3):    $962,000
  SDE Multiple Range:         1.5× – 3.0×
  Applied Multiple:           2.4×
  ─────────────────────────────────────
  Valuation Range:            $1.6M – $1.9M
  Recommended Listing Price:  $1.75M
  Asset Floor:                $500K

Right — context panel:
  "Why 2.4×?"
  Short prose: "Palace Kitchen's multiple reflects 15 years
  of operating history, SBA eligibility, and property
  ownership — offset by owner-dependency risk currently
  scored at 38/100. Resolving the dependency score to 62/100
  supports the upper end of the range at 3.0×, adding
  approximately $450K in deal value."

  SBA line below the prose:
  "SBA 7(a) Eligible · DSCR 4.4× · $106K minimum buyer down"

The $1.75M listing price is the dominant visual element
in this section — large Garamond, mint color. Everything
else is subordinate context.

─────────────────────────────────────────────
REVIEW & APPROVE GATE
─────────────────────────────────────────────
Reuse the mint gradient approval banner pattern from
Station 4 exactly. This is the template station — the
pattern must be consistent.

Agent eyebrow: "RECAST AGENT · AWAITING YOUR APPROVAL"
Headline: "Approve the normalized financials to publish
  to your lender package."
Body: "Once approved, these figures are locked and shared
  with matched lenders and qualified buyers. The Recast
  Agent's add-back narratives will accompany every
  financial disclosure. Your approval is your signature
  on this representation."

Two CTAs:
- Secondary: "Download recast PDF" → tooltip only:
  "Available in your VDR once approved."
- Primary: "Approve Recast & Continue →" → 700ms spinner
  ("Publishing to lender package...") → audit confirmation
  line → router.push("/risk")

Audit confirmation line:
"✓ Recast approved by Chandan Patel · [today] · [time]
  · Recast Agent output locked for lender distribution."
Visible 500ms minimum before route fires.

---

## Interactions

- **Add-back row ⓘ hover** — tooltip surfaces the matching
  narrative card copy inline. Closes on mouse-out.
  Does not require the narrative section to be open.
- **Add-back section collapse toggle** — chevron in section
  header. Collapses the four narrative cards. Table and
  valuation remain visible. Default: open.
- **"Why 2.4×?" context panel** — always visible. Not a
  tooltip, not collapsed. The multiple justification is
  part of the primary story, not a detail.
- **Valuation range row** — hovering the 1.5× and 3.0×
  endpoints shows tooltips:
  - 1.5×: "Current floor — reflects owner-dependency risk"
  - 3.0×: "Achievable at Transferability score 62/100"
- **"Approve Recast & Continue"** — primary CTA.
  Spinner → audit line → route to /risk.

---

## Loading States

- **Page arrival:** 1.8s in-progress ARIA banner → recast
  surface slides in. Do not show a skeleton for the table —
  the in-progress banner carries the wait.
- **Approve button:** Same pattern as Station 4. Spinner,
  fixed width, no layout shift. "Publishing to lender
  package..." copy during spinner.

---

## Agent Timing

The 1.8s in-progress open is shorter than Station 4's 6s
stream — intentionally. The ingestion was the long run.
The recast is fast because the data is already in. The
speed contrast communicates that the hard work already
happened in Station 4.

---

## Downstream Implications for the Station Agent

1. **Every number on this screen must exactly match
   Station 4.** $962K SDE, $127.4K add-backs, 3-year
   revenue ladder. Run a cross-check against
   `DEMO_PERSONA.md` Section 3 before declaring done.

2. **The $1.75M listing price and 2.4x multiple are
   referenced by name on `/risk`, `/score`, `/marketplace`,
   and `/outreach`.** Hard-code these values consistently —
   do not derive them dynamically.

3. **The add-back narratives established here are the
   source of truth for the CIM's financial section.**
   When Station 7 (CIM) is built, the add-back copy
   comes from this station — not reinvented.

4. **The approval gate pattern here is the canonical
   template.** Risk, Score, and Lender Ops all use
   the same mint banner + spinner + audit line + route
   structure. Build it cleanly — it will be copied
   verbatim.

5. **After this station ships**, flip `/ingestion` →
   `shipped` and `/recast` → `shipped` and `/risk` →
   `active` in `lib/persona.ts`.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   Arriving from `/ingestion` → 1.8s in-progress banner
   → recast surface slides in → table renders with all
   rows and all three years → add-back ⓘ hovers fire
   tooltips → narrative cards visible → valuation section
   shows $1.75M → "Approve Recast & Continue" → spinner
   → audit line → routes to `/risk`. No console errors.
   Collapse toggle works. Valuation range tooltips fire.

2. **Does it look investor-ready on 1080p?**
   The table reads like a real financial document —
   clean row separations, mint emphasis on the SDE row,
   subtle alternating row tint for readability. Add-back
   narrative cards feel like a professional QofE output,
   not UI copy. The $1.75M listing price is the visual
   anchor of the valuation section. Approval banner
   communicates weight — this is a real signature moment.

3. **Does the mock data tell a coherent story?**
   Every number traces back to `DEMO_PERSONA.md` Section 3
   without exception. SDE $962K matches ingestion output.
   Add-back total $147K (Year 3) matches the four line
   items. $1.75M at 2.4x on $962K checks out mathematically.
   The "why 2.4×" context references Transferability 38/100
   which is what `/risk` will surface next.