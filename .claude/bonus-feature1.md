# AGENT_ACTIVITY_PANEL.md — Live Agent Activity View

## Goal
Give the seller (and the demo audience) a persistent,
always-visible window into what the agent fleet is doing
right now. After the Boardroom dispatches four agents
simultaneously, those agents don't disappear — they are
running in the background while the seller moves through
the remaining stations. The Activity Panel makes that
visible at all times.

This is not a notification system. It is a live operations
view — the equivalent of watching a job queue drain in
real time. The seller should feel like they are the
principal of a coordinated fleet, not a user clicking
through screens.

The panel must be:
- Always present, never blocking
- Readable at a glance without full attention
- Accurate to the demo's actual state progression
- The most compelling ambient element in the UI

---

## Where It Lives

The Activity Panel is a collapsible side drawer anchored
to the right edge of the AppShell, outside the main
content column. It does not overlap the station content.
On 1080p, the AppShell has enough horizontal real estate
to show the panel open by default after the Boardroom
dispatch fires.

Layout:
  [Left rail 224px] [Main content flex-1] [Activity panel 280px]

Before the Boardroom dispatch: the panel shows an idle
state (ARIA coordinating, no active agents). After
dispatch: four agent rows populate and begin showing
live status.

The panel has a collapse toggle (chevron button on its
left edge). When collapsed, it becomes a 40px slim bar
on the right edge showing only a pulsing mint dot + the
count of active agents ("3 active"). Expanding it slides
the full 280px panel in (200ms ease-out).

---

## Panel Header

  "AGENT ACTIVITY"  (mono uppercase, muted, 10px)
  [collapse toggle — chevron left]

  Below header, one system status line:
  While any agent is active:
    ● mint pulse dot + "Fleet active · N agents running"
  When all agents complete:
    ✓ mint + "Fleet idle · all tasks complete"
  Before Boardroom dispatch:
    ○ muted + "Fleet standing by"

---

## Agent Rows

Each dispatched agent gets one row in the panel.
Rows appear in the order they were dispatched.
Non-dispatched agents (agents that haven't been
called yet in the demo flow) do not appear.

ROW ANATOMY (per agent):
  Top line: Agent name (Garamond 14px) + status chip
  Middle: Current task description (mono 11px, 2 lines max,
          truncated with ellipsis if longer)
  Bottom: Progress indicator — either a thin mint progress
          bar (determinate if we know total steps) or a
          pulsing dots animation (indeterminate)

STATUS CHIP STATES:
  ● RUNNING   (mint bg, pulsing dot)  — agent is active
  ● WAITING   (sky bg)               — dispatched, queued
  ◐ REVIEWING (amber bg)             — awaiting human input
  ✓ COMPLETE  (dark bg, mint text)   — task finished
  ○ IDLE      (muted)                — standing by

─────────────────────────────────────────────
DEMO STATE MACHINE — WHAT EACH AGENT SHOWS
─────────────────────────────────────────────

The panel reads the current demo route from the router
and advances agent states accordingly. This is entirely
hard-coded — not a real job queue. The appearance of
real-time progress is achieved through route-aware
state + timed micro-progressions within each row.

BEFORE /boardroom dispatch:
  Panel shows only ARIA (Case Manager Agent):
    ● RUNNING · "Coordinating deal state machine"
    Pulsing indeterminate bar

AFTER /boardroom Dispatch Agent Fleet is clicked:
  Four rows populate with 200ms stagger:

  Row 1 — Owner-Dependency Agent
    ● RUNNING · "Drafting SOP templates for 5 tasks"
    Determinate bar — advances slowly (1 tick / 4s)
    while user is on any station

  Row 2 — Concentration Agent
    ● RUNNING · "Drafting NJ Transit contract extension"
    Determinate bar

  Row 3 — Recast Agent
    ● RUNNING · "Hardening personal travel add-back narrative"
    Determinate bar

  Row 4 — Outreach Agent
    ● WAITING · "Queued · pending NJ Transit contract status"
    Pulsing indeterminate bar (slower pulse = waiting)

ON /score:
  Recast Agent → ✓ COMPLETE · "Add-back narrative hardened"
  Bar fills to 100%, chip flips, row dims slightly

ON /marketplace:
  Concentration Agent → ◐ REVIEWING
    "NJ Transit draft ready · awaiting your review"
    Row gets a soft amber left border

ON /outreach:
  Outreach Agent → ● RUNNING
    "Building SBA-Backed Operator sequences"
    Bar begins advancing

  Owner-Dependency Agent → ◐ REVIEWING
    "SOP templates ready · Chandan to fill in"
    Row gets a soft amber left border

ALL STATIONS COMPLETE:
  All four rows → ✓ COMPLETE
  Header flips to "Fleet idle · all tasks complete"
  A brief mint flash sweeps the panel header (200ms)

─────────────────────────────────────────────
ARIA ROW (always present, always top)
─────────────────────────────────────────────
ARIA sits above the dispatched agent rows, separated
by a hairline divider. She is always visible as the
coordinator.

  Avatar: the existing ARIA orb (20px, breathing)
  Name: "ARIA · Case Manager" (Garamond 13px)
  Status: always ● RUNNING during the demo
  Task line: swaps per station:
    /dashboard:   "Reviewing intake · 2 gaps identified"
    /connect:     "Waiting on account connection"
    /ingestion:   "Supervising Ingestion Agent run"
    /recast:      "Reviewing recast output"
    /risk:        "Tracking owner-dependency remediation"
    /boardroom:   "Coordinating Boardroom investment committee"
    /documents:   "Supervising CIM assembly"
    /score:       "Calculating final Scorta Score"
    /marketplace: "Routing lender package"
    /outreach:    "Managing buyer outreach cadence"

─────────────────────────────────────────────
ROW MICRO-PROGRESSIONS (within each agent row)
─────────────────────────────────────────────
To make the panel feel live even when nothing has
changed in the demo, each RUNNING agent row has a
subtle cycling task description. The current task line
rotates through 2–3 short lines at a 6s interval
(slow enough to not distract, fast enough to feel alive):

Owner-Dependency Agent running lines:
  "Drafting SOP templates for 5 tasks"
  "Mapping catering sales process steps..."
  "Generating vendor negotiation SOP..."

Concentration Agent running lines:
  "Drafting NJ Transit contract extension"
  "Reviewing 6-year account history..."
  "Preparing 3-year renewal terms..."

Recast Agent running lines:
  "Hardening personal travel add-back narrative"
  "Cross-referencing SBA SOP 50 10 8..."
  "Updating lender package narrative..."

Outreach Agent waiting lines:
  "Queued · pending NJ Transit contract status"
  "SBA-Backed Operator profile ready to sequence"
  "Micro-PE profile ready to sequence"

─────────────────────────────────────────────
VISUAL DESIGN
─────────────────────────────────────────────
The panel uses the same dark terminal surface as the
Ingestion log, Boardroom work orders, and Risk analysis
card (`rgba(12,10,9,.92)` bg). This is intentional —
the panel is an operational surface, not a glass card.
It reads as "the machine's view" vs. the main content
area which is "the seller's view."

Light text on dark. Mono font for task lines and
status chips. Garamond for agent names.

Progress bars: 2px height, mint fill on dark track.
Pulsing dot on RUNNING chips: the same `mintPulse`
keyframe used on station header eyebrows while agents
are active.

REVIEWING rows: soft amber left border (2px) +
amber-tinted row background (very subtle, 4% opacity)
to communicate "this one needs your attention."

COMPLETE rows: dim to 65% opacity after completing —
they are receipts, not active items. The mint ✓ chip
stays visible but the row recedes.

Panel scrolls if more than ~6 rows are visible.
Scrollbar is 2px, muted, appears on hover only.

─────────────────────────────────────────────
COLLAPSED STATE (40px slim bar)
─────────────────────────────────────────────
When collapsed, the right edge shows:
  A vertical mono label "AGENTS" (rotated 90°, 9px)
  A mint pulse dot if any agent is RUNNING
  A count badge: "N active" or "all done"

Clicking the slim bar expands the full panel.
The expand/collapse animation is 200ms ease-out,
no layout shift in the main content column (the
content column has a fixed width regardless of
panel state — the panel slides over the rightmost
margin space).

─────────────────────────────────────────────
WHEN TO SHOW vs. HIDE THE PANEL
─────────────────────────────────────────────
The panel is present from /dashboard onward.
On /dashboard it shows the idle state (ARIA only,
fleet standing by) — so the investor can see that
the infrastructure exists before it activates.

Before /boardroom dispatch: ARIA row only.
After dispatch: full fleet rows populate.

The panel is never hidden. It is only collapsible.

---

## Files to Touch

1. `components/scorta/AppShell.tsx` — add the panel
   as a right-side child of the shell's flex row.
   Read current route from `usePathname()` to drive
   ARIA's task line and agent state progressions.
   Import `AgentActivityPanel` component.

2. New `components/scorta/AgentActivityPanel.tsx` —
   the panel component. Accepts `currentRoute: string`
   and `dispatched: boolean` as props. Manages its
   own internal state: collapse toggle, agent row
   states, task line rotation timers.

3. `lib/persona.ts` — add a `AGENT_TASKS` constant
   that maps route → ARIA task line copy so the
   AppShell can pass it through without hard-coding
   route strings in the component itself.

4. `lib/agentActivity.ts` (new file) — define the
   agent row state machine: agent definitions,
   route-triggered state transitions, task line
   rotation copy for each agent. Keeps the component
   clean and makes the state logic testable.

---

## Implementation Notes

- `dispatched` prop flips to `true` when the Boardroom
  "Dispatch Agent Fleet" CTA fires. The cleanest way
  to pass this is via a lightweight context
  (`AgentFleetContext`) that the Boardroom station
  sets on approval and the AppShell reads. This avoids
  prop-drilling through page components.

- The determinate progress bars do not reflect real
  task completion. They are cosmetic timers: each
  RUNNING agent's bar advances by 1% every 3–4s via
  a `setInterval` that runs while the agent is in
  RUNNING state. The bar never reaches 100% on a
  RUNNING agent — it stalls at 85% and only fills
  to 100% when the route-triggered COMPLETE flip fires.
  This is the same "long enough to feel real" principle
  as the station streaming timers.

- Task line rotation uses `useEffect` with a 6s interval.
  Clear the interval when the agent flips to COMPLETE
  or REVIEWING. Freeze the task line on the last value
  when the agent completes.

- The panel's expand/collapse state is local to
  `AgentActivityPanel` — it does not need to persist
  across routes. Default: expanded after dispatch,
  collapsed before dispatch (showing only the slim bar
  with "Fleet standing by").

---

## Done Definition — QA Rule

1. **Does the panel appear correctly across all routes?**
   Navigate to /dashboard — slim bar shows "Fleet
   standing by." Navigate to /boardroom, click
   "Dispatch Agent Fleet" — four agent rows stagger
   in (200ms each). Each row shows correct initial
   status chip and task line. ARIA row shows route-
   appropriate task copy on every station. Progress
   bars advance visibly over 30s on any given station.
   Navigating to /score flips Recast Agent to COMPLETE.
   Navigating to /marketplace flips Concentration Agent
   to REVIEWING with amber border. pnpm typecheck clean.

2. **Does it look right at 1080p?**
   Panel is 280px wide, does not overlap main content.
   Dark terminal surface is visually distinct from the
   glass card main content. Agent name in Garamond,
   task lines in mono 11px are readable at demo zoom.
   REVIEWING rows have visible amber treatment without
   being alarming. COMPLETE rows recede appropriately.
   Collapse animation is smooth, no layout shift.

3. **Does it tell a coherent story?**
   The four agent rows map exactly to the Boardroom's
   four work orders (WO 1 Owner-Dep / WO 2 Concentration /
   WO 3 Recast / WO 4 Outreach). Task line copy for
   each agent matches the work order task body verbatim
   at a summary level. ARIA's task lines reference the
   correct station activity at each route. The panel
   reads as a real operations view, not a decorative
   element.