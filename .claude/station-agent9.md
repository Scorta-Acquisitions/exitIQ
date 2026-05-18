# VDR_STATION.md — Virtual Data Room

## Goal
The Virtual Data Room is the deal's single source of truth for
external parties — buyers, lenders, and their advisors. Every
document the agent fleet has produced and the seller has approved
flows into the VDR automatically. External parties request access,
sign an NDA, and receive a permissioned view of exactly the
documents they are authorized to see.

For the seller, the VDR is a control surface: they see who has
accessed what, when, and for how long. They grant and revoke
access. They see which documents are generating the most
engagement. The VDR is not a file dump — it is a live deal room
with access analytics.

For the demo, the VDR has two approved documents already
published: the P&L Recast (approved on /recast) and the CIM
(approved on /documents). The seller can see both documents,
preview their contents, and see the access log. Two simulated
external parties have already requested access, illustrating
the buyer-facing flow.

---

## Route + Entry Point
**Route:** `/vdr`
**Accessible from:** Left rail as a persistent station (not
  locked — the VDR exists from the moment the first document
  is approved). Also linked from the /documents approval
  confirmation and from lender + buyer cards on /marketplace
  and /outreach via "View in VDR →" CTAs.
**Does not exit to a specific next station** — the VDR is
  a reference surface, not a sequential step. The seller
  returns to wherever they came from.

ARIA intro on arrival:
"Your Virtual Data Room is live. Two documents are published
and access-controlled. One buyer and one lender have requested
access — both are pending your approval. Every view, every
download, and every access request is logged here."

---

## What This Station Must Establish for Downstream Stations

- `/marketplace` — lender cards have a "View in VDR →"
  CTA that routes here. The lender's access request
  (Northeast Community Bank) is visible in the VDR
  access log. The P&L Recast is the primary document
  lenders need.
- `/outreach` — buyer cards have a "View in VDR →" CTA
  that routes here. The buyer's NDA and CIM access
  are tracked here. Buyer engagement (CIM opened,
  sections read) surfaces on /outreach as pipeline
  signals.
- `/documents` — every document approved on /documents
  auto-publishes here. The VDR is the destination of
  the /documents approval gate. The audit line on
  /documents ("Published to VDR") is the provenance
  of the documents visible here.
- `/score` — the "Scorta Certified" label visible on
  the VDR's deal header communicates deal readiness
  to buyers and lenders who access the room.

---

## What We Are Building

Four panels on one screen:

PANEL 1 — DEAL HEADER
The deal's identity card at the top of the VDR.
Business name, listing price, Scorta Score badge,
SBA eligibility status, and a shareable access
request link.

PANEL 2 — DOCUMENT LIBRARY
All published documents, organized by audience
(Buyer-facing / Lender-facing / Legal). Each
document shows: agent attribution, approval date,
access level, version, and per-document CTAs
(Preview / Download / Manage Access).

PANEL 3 — ACCESS LOG
A real-time feed of who has accessed what and when.
Each entry shows: party name, party type (Buyer /
Lender / Advisor), document accessed, timestamp,
and duration. Pending access requests surface at
the top with Approve / Deny CTAs.

PANEL 4 — ENGAGEMENT ANALYTICS
Per-document engagement: view count, time spent,
sections read (for the CIM accordion), download
count. Surfaces which sections of the CIM buyers
are spending the most time on — signals what
they care about.

---

## Hard-Coded Surface

All document values from approved upstream station
outputs. All access log entries are simulated demo
data consistent with the Boardroom's buyer targeting
(SBA-Backed Operator first, Micro-PE second).

─────────────────────────────────────────────
PANEL 1 — DEAL HEADER
─────────────────────────────────────────────
Full-width card at the top. Two-column layout:

Left column:
  Business name: "Palace Kitchen & Catering"
    (Garamond 28px)
  Location: "Northern New Jersey · Food Service"
  Listed: "$1,750,000 · 2.4× SDE"
  Status row:
    [mint chip] SBA 7(a) Eligible
    [mint chip] DSCR 4.4×
    [mint chip] Scorta Score 71/100 · Strong SBA Candidate
    [amber chip] Transferability 38/100 · In Remediation

Right column (access control):
  "Share VDR Access" section
  Unique deal link: `scorta.io/vdr/palace-kitchen-XXXX`
    (mono font, copy-to-clipboard icon)
  NDA requirement toggle: ON (default)
  Access level selector: Full Access / CIM Only /
    P&L Only / Custom
  Primary CTA: "Send Access Request →"
    → tooltip: "Generates a permissioned link and
    sends it to the recipient. NDA signature required
    before documents unlock."

─────────────────────────────────────────────
PANEL 2 — DOCUMENT LIBRARY
─────────────────────────────────────────────
Section label: "PUBLISHED DOCUMENTS"
Agent eyebrow: "VDR · 2 documents published · 0 pending"

Three audience tabs:
  [ All ] [ Buyer-Facing ] [ Lender-Facing ] [ Legal ]
Default: All tab active.

Under the All tab, two document cards:

DOCUMENT 1 — CIM (Confidential Information Memorandum)
  Audience chip: BUYER-FACING (mint border)
  Agent attribution: "CIM Agent + Recast Agent + Boardroom"
  Version: v1.0
  Published: [today's date from /documents approval]
  Approved by: Chandan Patel
  Access level: NDA Required
  Size: 12 sections · ~4,200 words
  Status: ● Live · 1 view

  Three action buttons:
  "Preview" → opens an inline document preview drawer
    (slides in from the right, 300ms). The drawer shows
    the same CIM preview surface built in Station 7 —
    same off-white background, same Garamond, same
    accordion sections. Read-only. Close button top-right.
  "Download" → tooltip: "PDF export available · demo
    shows live preview only."
  "Manage Access" → opens a small popover showing the
    current access list with Revoke buttons per party.

DOCUMENT 2 — P&L Recast (Normalized Financial Summary)
  Audience chip: LENDER-FACING (sky border)
  Agent attribution: "Recast Agent"
  Version: v1.0
  Published: [today's date from /recast approval]
  Approved by: Chandan Patel
  Access level: NDA Required
  Size: 3-year P&L · add-back schedule · SDE summary
  Status: ● Live · 1 view

  Three action buttons:
  "Preview" → inline drawer showing the recast table
    from Station 5 — the before/after 3-year P&L, the
    add-back section, the normalized SDE row ($962K),
    the valuation output. Read-only.
  "Download" → same tooltip as CIM.
  "Manage Access" → same popover pattern.

Placeholder row below the two documents:
  Dashed border card — "8 additional documents ready
  to generate on demand · Request via the Document
  Fleet on /documents"

─────────────────────────────────────────────
PANEL 3 — ACCESS LOG
─────────────────────────────────────────────
Section label: "ACCESS LOG"
Subhead: "All access requests and document views
  are logged in real time."

TWO PENDING REQUESTS (at top, amber-tinted):

Request 1 — PENDING APPROVAL:
  Party: Marcus Rivera
  Type: BUYER · SBA-Backed Operator
  Requested: [today] · 2 hours ago
  Documents requested: CIM
  NDA: Not yet signed
  CTAs: [Approve Access →] [Deny]
  Note (muted): "Approve to send NDA for signature.
    CIM unlocks after NDA is returned."

Request 2 — PENDING APPROVAL:
  Party: Northeast Community Bank
  Type: LENDER · SBA 7(a) Specialist
  Requested: [today] · 45 minutes ago
  Documents requested: P&L Recast + CIM
  NDA: Waived (lender)
  CTAs: [Approve Access →] [Deny]
  Note (muted): "NDA waived for SBA lenders.
    Approval grants immediate access to both documents."

Both Approve CTAs → 700ms spinner → the pending
request card flips to a GRANTED entry in the log
below. No route change.

ACTIVITY LOG ENTRIES (below pending requests):
  Each entry: party avatar initial + party name +
  party type chip + action + document + timestamp

  Log (most recent first):
  CP · Chandan Patel · SELLER
    Published "P&L Recast" to VDR · Today · 10:41 AM

  CP · Chandan Patel · SELLER
    Published "CIM" to VDR · Today · 10:52 AM

  CP · Chandan Patel · SELLER
    Approved recast financials · Today · 10:38 AM

  [timestamps generated live from demo session context
  — use relative time formatting: "2 hours ago",
  "45 min ago" for pending requests; absolute time
  for completed actions]

─────────────────────────────────────────────
PANEL 4 — ENGAGEMENT ANALYTICS
─────────────────────────────────────────────
Section label: "DOCUMENT ENGAGEMENT"
Subhead: "Buyer and lender engagement with your
  documents — updated in real time."

Note: This panel is pre-populated with simulated
engagement data representing what the demo will
look like 24 hours after documents go live. The
framing line reads: "Based on 1 buyer view and 1
lender view since publication."

CIM engagement card:
  Total views: 1
  Avg time on document: 4m 12s
  Most-read section: Section 1 — Executive Summary
  Section heatmap (mini bar chart, 12 bars for 12
  sections, heights proportional to simulated
  time spent):
    Section 1 (Executive Summary): tallest bar (mint)
    Section 6 (Deal Structure): second tallest (mint)
    Sections 2–5, 7–12: shorter bars (muted)
  Downloads: 0
  NDA status: 1 pending · 0 signed

  Insight chip (mint, below the heatmap):
  "Buyer spent the most time on Deal Structure —
  SBA financing terms are the primary interest."

P&L Recast engagement card:
  Total views: 1
  Avg time on document: 2m 38s
  Most-viewed section: Add-Back Schedule
  Downloads: 0
  NDA status: Not required (lender access pending)

  Insight chip (sky):
  "Lender reviewed add-back schedule — DSCR and
  add-back defensibility are the focus."

---

## Document Preview Drawer

The inline preview drawer (slides in from the right
on "Preview" click) is a right-side panel over the
main content — not a modal. 560px wide, full height,
dark overlay behind it (opacity 0.4).

Drawer header:
  Document title + version chip + "Read-only · VDR"
  Close button (×)

Drawer content:
  For CIM: the exact DocumentsStation preview surface
    (off-white, Garamond, accordion sections) in a
    scrollable container. No approve button — read only.
  For P&L Recast: the exact RecastStation surface
    (the before/after table + add-back section + SDE
    row + valuation output) in a scrollable container.
    No approve button — read only.

Both drawers reuse the existing station components
in a read-only prop mode. No new document rendering
logic required — the VDR preview is a read-only
wrapper around already-built surfaces.

---

## Interactions

- **"Send Access Request" CTA** → tooltip only:
  "Generates a permissioned link — demo shows live
  access request flow." 2.2s flash. No navigation.
- **"Copy link" icon on deal URL** → copies to
  clipboard (real functionality). Shows a 1.5s
  "Copied ✓" tooltip.
- **Approve Access CTAs** → 700ms spinner → request
  card flips to GRANTED in the log. Engagement panel
  updates "NDA pending" count.
- **Deny CTAs** → immediate state flip to DENIED
  (greyed out, no animation needed).
- **Document tabs (All/Buyer/Lender/Legal)** →
  instant filter. Legal tab shows a placeholder:
  "NDA templates available · generated by Case
  Manager Agent on request."
- **Section heatmap bars** → hovering shows the
  section title + simulated time: "Executive Summary
  · 1m 42s avg."
- **Preview drawer** → slides in from right, 300ms.
  Scrollable. Close button or ESC dismisses.
- **"Manage Access" popover** → shows current
  access list. Demo has no granted parties yet
  (pending requests), so it shows: "No parties
  with active access · approve a request above."

---

## Visual Design Direction

The VDR must feel like a real deal room — professional,
controlled, and secure. It is the most external-facing
surface in the application (buyers and lenders will
actually see it) so it carries more visual gravity
than the internal agent stations.

The document cards use a slightly elevated surface
treatment — white cards with a soft 1px border and
a subtle drop shadow, more like a file cabinet than
a glass card. This contrasts intentionally with the
glass card pattern used on agent-output surfaces.

The access log reads like a financial audit trail:
mono timestamps, clear party labeling, no visual
decoration. The pending requests use the amber-tinted
treatment established for REVIEWING rows in the
Agent Activity Panel — visual consistency for
"this needs your attention."

The engagement analytics section uses the familiar
mint/sky accent budget but applies it to data
visualization rather than agent status — heatmap
bars in mint for CIM, sky for P&L Recast.

---

## Left Rail Entry

Add `/vdr` to `lib/persona.ts` as a persistent
station between `/documents` and `/marketplace`:

  Station 07b  /vdr   Virtual Data Room   VDR · Case Manager
  state: "active" from the moment /documents is approved
  (same always-on treatment as /boardroom)
  No lock state. The VDR exists whenever a document exists.

Left rail label: "Virtual Data Room"
Sub-label: "Station 07b · VDR · Case Manager"
Rail indicator: not a ✓ (shipped) or ● (active) —
  use a distinct ◈ indicator to communicate
  "this is a persistent reference surface, not a
  sequential step." If the design system doesn't
  support a third indicator type, use the active
  ● treatment with a different icon.

---

## Downstream Implications for the Station Agent

1. **The CIM preview drawer reuses `DocumentsStation`
   in read-only mode.** Add a `readOnly?: boolean` prop
   to `DocumentsStation`. When true: hide the approval
   gate, hide the picker, render only the preview
   surface (terminal card collapsed to status bar,
   document preview visible, no CTAs). This is a one-
   prop change — no new component needed.

2. **The P&L Recast preview drawer reuses `RecastStation`
   in read-only mode.** Same pattern — add `readOnly?:
   boolean` prop to `RecastStation`. When true: hide
   the approval gate, render only the recast surface.

3. **Access approval on the VDR populates downstream
   stations.** When Northeast Community Bank is
   approved, their access should be reflected on
   `/marketplace` as "VDR access granted." When Marcus
   Rivera is approved, his access should be reflected
   on `/outreach` as "CIM opened." For the demo, these
   cross-station state updates are cosmetic — a shared
   `VDRContext` that the marketplace and outreach
   stations read for access-granted flags.

4. **The engagement heatmap's insight chips are the
   Boardroom's buyer targeting confirmed by behavior.**
   The SBA-Backed Operator (Marcus Rivera) spending
   the most time on Deal Structure is exactly what
   the Boardroom predicted. This signal closes the
   loop between "the Boardroom said target SBA-Backed
   Operator first" and "the SBA-Backed Operator is
   the most engaged buyer." Surface this narrative
   connection on `/outreach` when building the
   pipeline Kanban.

5. **The "8 additional documents ready on demand"
   placeholder** connects back to the Document Fleet
   picker on `/documents`. When the user clicks it,
   route to `/documents` (not a tooltip). This is
   the one VDR interaction that navigates away.

6. **After the VDR station ships**, flip `/vdr` to
   `state: "active"` in `lib/persona.ts`. It should
   never flip to "shipped" — like the Boardroom, it
   is always-on.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   Navigating to `/vdr` shows the deal header + 2
   document cards + 2 pending access requests + activity
   log + engagement analytics. "Preview" on CIM opens
   the read-only drawer with the Station 7 preview
   surface. "Preview" on P&L Recast opens the read-only
   drawer with the Station 5 recast surface. Both drawers
   close on × and ESC. Approve CTA on Marcus Rivera
   flips to GRANTED. Approve CTA on Northeast Community
   Bank flips to GRANTED. "Copy link" copies to clipboard.
   All tab filters work. No console errors. pnpm typecheck
   clean.

2. **Does it look investor-ready on 1080p?**
   Document cards feel like a real file cabinet — white,
   elevated, bordered. Deal header communicates listing
   status at a glance. Access log reads as a financial
   audit trail. Engagement heatmap is readable and
   specific. Preview drawers are full-height, scrollable,
   and read-only. No placeholders except the "8 additional
   documents" row (which is intentional).

3. **Does the mock data tell a coherent story?**
   P&L Recast approval timestamp matches /recast audit
   line. CIM approval timestamp matches /documents audit
   line. Pending buyer (Marcus Rivera) is an SBA-Backed
   Operator — consistent with Boardroom's WO 4 priority
   order (SBA first). Pending lender (Northeast Community
   Bank) is the 94% match from the lender matching table.
   Engagement insight confirms what the Boardroom predicted
   about SBA-Backed Operator focus on deal structure.
   Every number in the preview drawers matches upstream
   station outputs exactly.