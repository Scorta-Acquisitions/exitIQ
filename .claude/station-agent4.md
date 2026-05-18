# STATION_4.md — Ingestion Agent

## Goal
Replace the LockedStation stub at `/ingestion` with a live streaming
agent log that makes the audience feel like they are watching a real
AI pipeline classifying 36 months of financial data in real time.
The station ends with a Review & Approve gate on the extracted
summary — the first human approval moment in the demo, and the one
that unlocks `/recast`.

---

## Route + Entry Point
**Route:** `/ingestion`
**Arrives from:** `/connect` via "Run Ingestion Agent" banner CTA
**Exits to:** `/recast` via "Approve & Continue" on the summary card

The user arrives here in a "handing off" framing already set by
Station 3. The ingestion log must begin streaming immediately on
page load — no additional button click required. The work is
already in progress when they arrive.

---

## What This Station Must Establish for Downstream Stations

The ingestion output is the data foundation every downstream station
stands on. The numbers surfaced in the final summary card are the
numbers `/recast`, `/risk`, `/score`, and `/marketplace` all
reference. If any value here is wrong or inconsistent, every
downstream station breaks the coherent story QA check.

- `/recast` — receives normalized SDE ($962K Year 3), 3-year P&L,
  and the add-back line items identified here. The recast table
  is a direct elaboration of the ingestion summary.
- `/risk` — the 2 flags raised here (owner key-man, top customer
  19%) are what the Owner-Dependency and Concentration agents
  surface on the risk screen. The flags must match exactly.
- `/score` — the Scorta Score computation references the data
  confidence score (94%) and the revenue trend (↑18%) from the
  ingestion summary.
- `/marketplace` — lender matches are built on the normalized
  financials confirmed here. The DSCR of 4.4x traces back to
  the $962K SDE established in this station.

The human approval on this screen is also the first instance of
the approval layer pattern that every subsequent station inherits.
Build it well here — it is the template.

---

## Hard-Coded Surface

All values from `DEMO_PERSONA.md` Section 9. Do not invent log
lines, timings, or summary stats.

### Streaming Log (20 lines at 300ms cadence)
[00:01] Authenticating QuickBooks connection...
[00:02] Fetching chart of accounts...
[00:04] Pulling 36 months of transaction history...
[00:07] Analyzing 1,247 transactions...
[00:09] Categorizing revenue streams...
[00:11] Identifying owner compensation entries...
[00:13] Flagging non-recurring expenses...
[00:15] Cross-referencing Plaid bank deposits...
[00:18] Reconciling revenue vs. bank receipts: 98.4% match
[00:21] Calculating add-back schedule...
[00:24] Detected: $120,000 owner salary (add-back eligible)
[00:25] Detected: $18,000 personal vehicle expenses (add-back eligible)
[00:26] Detected: $22,000 one-time equipment repair — Year 2 (add-back eligible)
[00:27] Detected: $9,000 personal travel (add-back eligible)
[00:29] Normalizing SDE across 3 years...
[00:31] Running concentration analysis...
[00:33] Flagged: Top customer = 19% of revenue (moderate)
[00:34] Flagged: Key-man dependency — owner drives catering sales
[00:36] Generating financial summary...
[00:38] Analysis complete.


Use the same `key={step}` re-mount + `syncLineIn` ease-out pattern
from `SyncStream` in `ConnectStation.tsx`. 300ms cadence per spec.
Detected add-back lines render in mint accent — they are the
signal lines in the log, everything else is muted mono.

### Final Summary Card (slides in after log completes)

The summary card is not a four-stat grid. It is a full agent
report surface — the Ingestion Agent presenting its complete
findings to the seller for approval. It must feel like a real
document, not a dashboard widget.

─────────────────────────────────────────────
CARD HEADER
─────────────────────────────────────────────
Agent eyebrow (small caps, muted): "INGESTION AGENT · RUN COMPLETE"
Timestamp line: "Completed [today's date] · 1,247 transactions
  analyzed across 36 months · Data confidence: 94%"
Confidence bar: thin full-width progress bar at 94% fill, mint.

─────────────────────────────────────────────
SECTION 1 — FINANCIAL SUMMARY
─────────────────────────────────────────────
Section label: "Financial Overview"

Three-year revenue table:
  Year        Revenue      COGS         Gross Profit
  2022        $1,780,000   $534,000     $1,246,000
  2023        $1,970,000   $591,000     $1,379,000
  2024        $2,100,000   $630,000     $1,470,000

Below the table, one summary line in mint:
"↑ 18% revenue growth over 3 years — consistent upward trend."

─────────────────────────────────────────────
SECTION 2 — ADD-BACKS IDENTIFIED
─────────────────────────────────────────────
Section label: "Add-Backs Identified by Ingestion Agent"
Subhead: "The following items were automatically flagged as
  add-back eligible. Each will be reviewed by the Recast Agent
  for SBA defensibility."

Line-item list — each row has: category label / amount /
  eligibility badge (Confirmed / Likely / Review Required):

  Owner Compensation          $120,000/yr    ● Confirmed
  Personal Vehicle Expenses    $18,000/yr    ● Confirmed
  One-Time Equipment Repair    $22,000       ● Confirmed (Year 2 only)
  Personal Travel               $9,000/yr    ● Confirmed

  ─────────────────────────────────
  Total add-backs identified:    $127,400 (normalized across 3 yrs)
  ─────────────────────────────────

Below the list, one line:
"Recast Agent will produce the full SBA-defensible add-back
  narrative for each line item."

─────────────────────────────────────────────
SECTION 3 — FLAGS RAISED
─────────────────────────────────────────────
Section label: "Risk Flags"
Subhead: "Two signals were automatically flagged for agent
  review. These do not block the recast — they route to
  Risk Analysis after financials are approved."

Flag card 1 — RED:
  "Key-Man Dependency"
  "Owner drives all catering sales relationships and vendor
  negotiations. 1 of 11 employees has 3+ years tenure.
  0 documented SOPs on record."
  Downstream: "→ Owner-Dependency Agent will address this in
  Risk Analysis"

Flag card 2 — AMBER:
  "Customer Concentration — Moderate"
  "Top customer accounts for 19% of annual revenue (NJ Transit
  Corporate Catering · 6-year account tenure). Within SBA
  threshold — flagged for monitoring."
  Downstream: "→ Concentration Agent will review contract
  status in Risk Analysis"

─────────────────────────────────────────────
SECTION 4 — NORMALIZED SDE PREVIEW
─────────────────────────────────────────────
Section label: "Normalized SDE — Preview"
Note line (muted italic): "Full recast requires Recast Agent
  review. This is the Ingestion Agent's preliminary read."

Single prominent stat:
  $962,000
  Normalized SDE · Year 3

Supporting line:
  "Based on $815,000 reported EBITDA + $147,000 in
  confirmed add-backs. Recast Agent will validate and
  produce the lender-facing narrative."

─────────────────────────────────────────────
REVIEW & APPROVE GATE
─────────────────────────────────────────────
Separator line above this section.
Agent eyebrow: "INGESTION AGENT · AWAITING YOUR APPROVAL"
Headline: "Review extracted data before the Recast Agent proceeds."
Body: "The figures above will form the basis of your normalized
  financials, add-back schedule, and lender package. Approve
  to hand off to the Recast Agent."

Two buttons:
- Primary: "Approve & Continue →" → 700ms spinner
  ("Dispatching Recast Agent...") → router.push("/recast")
- Secondary: "Review raw data" → tooltip only:
  "Full transaction export available in your VDR."

Audit confirmation line (appears after click, before route):
"✓ Approved by Chandan Patel · [today's date] · [timestamp]"
Visible for at least 500ms before route transition fires.

### Review & Approve Gate

Below the summary card, the approval surface:

Agent eyebrow: "INGESTION AGENT · awaiting your approval"
Headline: "Review extracted data before the Recast Agent proceeds."
Body: "The figures below will form the basis of your normalized
financials, add-back schedule, and lender package. Approve to
hand off to the Recast Agent."

Two buttons:
- Primary: "Approve & Continue →" → 700ms spinner
  ("Dispatching Recast Agent...") → router.push("/recast")
- Secondary: "Review raw data" → no-op in demo, shows a
  tooltip: "Full transaction export available in your VDR."

Approval confirmation (after click, before route):
Small logged confirmation line appears below buttons:
"✓ Approved by Chandan Patel · [today's date] · [timestamp]"
This is the audit log moment. It must be visible for at least
500ms before the route transition fires.

---

## Interactions

- **Page load** → log begins streaming immediately. No button
  click required. ARIA orb pulses in the station header during
  the stream. Stops pulsing when "Analysis complete." renders.
- **Log scroll** → log container is fixed height with overflow
  scroll. Auto-scrolls to the latest line during streaming.
  User can manually scroll up to read earlier lines without
  interrupting the stream.
- **"Approve & Continue"** → primary CTA. Triggers spinner,
  audit confirmation line, then route to `/recast`.
- **"Review raw data"** → tooltip only. Does not navigate.
- **Flag chips** → hovering a flag chip shows a tooltip with
  the downstream implication:
  - Key-man: "This will be addressed in Risk Analysis →"
  - Concentration: "Flagged for Concentration Agent review →"

---

## Loading States

- **Page load:** Station header and ARIA intro render instantly.
  Log container renders with first line already visible.
  Subsequent lines stream in — do not show a loading skeleton
  for the log itself.
- **"Approve & Continue" button:** Spinner on click. Button text
  changes to "Dispatching Recast Agent..." Width fixed, no
  layout shift.
- **Summary card:** Uses the same slide-in (360ms, 8px up,
  opacity 0→1) from Station 3's result card pattern.

---

## Agent Timing

Total stream duration: ~6 seconds at 300ms per line.
This is longer than the connect sync — intentionally. The
ingestion agent is doing more work and the audience should
feel that. The detected add-back lines (four in a row at
[00:24]–[00:27]) create a satisfying rapid-fire moment that
communicates the agent finding real value automatically.

Do not compress this timing. The stream is a demo asset.

---

## Downstream Implications for the Station Agent

1. **The `SyncStream` component from `ConnectStation.tsx` is the
   reference implementation.** Extend or reuse it — do not
   rebuild the streaming pattern from scratch.

2. **The approval pattern established here is the template for
   every subsequent station.** Recast, Risk, Lender Ops all have
   a Review & Approve gate. Build this one cleanly — it will be
   copied.

3. **The audit confirmation line ("✓ Approved by Chandan Patel")**
   must use today's date dynamically, not a hard-coded date string.
   Every other value is hard-coded. This one should feel live.

4. **After this station ships**, flip `/connect` → `shipped` and
   `/ingestion` → `shipped` and `/recast` → `active` in
   `lib/persona.ts`. Do not do this before the QA Rule passes.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   Arriving from `/connect` CTA → log begins streaming
   immediately → all 20 lines render in order → summary card
   slides in → "Approve & Continue" triggers spinner + audit
   line + routes to `/recast` (LockedStation is fine).
   No console errors. Log auto-scrolls. Flag chip tooltips fire.

2. **Does it look investor-ready on 1080p?**
   Log reads like a real terminal output — mono font, mint
   accents on detected lines, muted grey on process lines.
   Summary card uses the same glass card + ResultStat pattern
   as Station 3. Approval surface feels like a real fiduciary
   moment — not a "next" button.

3. **Does the mock data tell a coherent story?**
   1,247 transactions matches Station 3 exactly. Add-backs
   ($120K + $18K + $22K + $9K = $169K gross, $127.4K net
   after normalization) match `DEMO_PERSONA.md` Section 9.
   Flags match what `/risk` will surface. Normalized SDE
   $962K matches what `/recast` will display.