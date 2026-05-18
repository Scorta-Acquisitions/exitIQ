## STATION_BOARDROOM.md — The Boardroom

```markdown
# STATION_BOARDROOM.md — The Boardroom

## Goal
The Boardroom is Scorta's most differentiated feature and the
centerpiece of the demo's value proposition. It is not a report.
It is not a simulation. It is an AI investment committee — three
independent buyer agents running simultaneous multi-step reasoning
loops against the seller's approved financials, each producing a
verdict, a deal structure, and a ranked objection list that becomes
a direct work order for the downstream agent fleet.

The seller gets a red-team view of their own deal before a real
buyer ever sees it. The system has already started fixing the
problems before the session ends.

This screen must communicate two things simultaneously:
1. The analytical depth — three distinct buyer worldviews, each
   reasoning differently, each surfacing different risks
2. The operational consequence — every objection becomes a task,
   every task has an agent assigned, every agent has a status

The UI must be the most visually impressive screen in the demo.
Clean, structured, and weighty — like walking into a real
investment committee, not opening a SaaS dashboard.

---

## Route + Entry Point
**Route:** `/boardroom`
**Arrives from:** `/risk` via "Open Boardroom" CTA once the
  Owner-Dependency remediation plan has been reviewed
**Exits to:** `/documents` via "Dispatch Agent Fleet" approval
  gate — the moment the seller authorizes the agents to begin
  executing the work orders the Boardroom produced

This station does not sit in the standard linear station
sequence. The Boardroom is always running in the background,
updating as new information comes in. For the demo, it is
surfaced after Risk Analysis because that is when the seller
first has enough context to understand what the three personas
are reasoning against. In production, the Boardroom reruns
continuously as the seller completes remediation tasks and
new data is connected.

---

## What This Station Must Establish for Downstream Stations

The Boardroom is the engine that drives everything after it.
Its outputs are not display-only — they are work orders that
the downstream agent fleet executes.

- `/documents` — the CIM is generated to address the specific
  objections the SBA-Backed Operator and Micro-PE personas
  raised. The executive summary, risk section, and deal
  structure terms in the CIM trace back to Boardroom output.
- `/score` — the Scorta Score improvement path is informed by
  which objections ranked as deal-breakers vs. negotiation
  points. The score's "improvement accordion" surfaces the
  same fixes the Boardroom flagged.
- `/marketplace` — the lender match ranking and the outreach
  target sequence are set by Boardroom's buyer segment
  recommendations. The SBA-Backed Operator persona's DSCR
  reasoning directly informs which lenders are prioritized.
- `/outreach` — the Outreach Agent's targeting logic comes
  from Boardroom. SBA-Backed Operator and Micro-PE profiles
  are the primary targets. Search Fund is secondary pending
  the NJ Transit contract extension. The personalized
  outreach sequences reference Boardroom's deal structure
  outputs.
- `/risk` (backward link) — the Owner-Dependency Agent and
  Concentration Agent receive Boardroom's work orders as
  additional remediation tasks. The SOP documentation and
  NJ Transit contract extension are both Boardroom-generated
  work orders, not just Risk Analysis outputs.

The Boardroom is the connective tissue of the entire back half
of the demo. Every screen after it references something it
produced.

---

## What We Are Building

Three layers, all visible on one screen:

**Layer 1 — The Personas**
Three buyer agent panels running simultaneously. Each panel
surfaces: who this buyer is, how they reason, what they'd
offer, what would make them walk, and whether they'd proceed
to LOI right now.

**Layer 2 — The Objection Stack**
Each persona produces a ranked list of objections. The ranking
matters — deal-breakers are visually distinct from negotiation
points. The seller sees exactly what a real buyer of each type
would push back on, in order of severity.

**Layer 3 — The Work Orders**
The Boardroom's output is not a report the seller reads and
files. Every objection flagged as a remediation task is
immediately assigned to the correct downstream agent with a
status indicator. The seller sees the agent fleet being
mobilized in real time based on what the investment committee
just found.

---

## Hard-Coded Surface

All financial values from `DEMO_PERSONA.md` Section 3.
All risk values from Section 6. All SBA values from Section 7.
Boardroom persona reasoning is hard-coded — do not generate
it dynamically. The reasoning must be consistent across every
demo run.

─────────────────────────────────────────────
PAGE OPEN — BOARDROOM CONVENING
─────────────────────────────────────────────
The Boardroom does not open instantly. It convenes.

On arrival, a full-width dark surface with a centered header:
  "BOARDROOM"
  "Three buyer agents are reviewing Palace Kitchen & Catering."

Below the header, three persona cards appear one at a time
with a 600ms stagger — left to right. Each card starts as a
dark surface with only the persona name and a pulsing
"Analyzing..." indicator. They appear to be reasoning in
parallel.

After all three are visible (1.8s total), a progress
sequence runs inside each card simultaneously — short cycling
status lines specific to each persona's reasoning domain:

SBA-Backed Operator (600ms cadence):
  "Reviewing DSCR against SBA 7(a) threshold..."
  "Evaluating operator replaceability post-close..."
  "Assessing add-back defensibility..."
  "Forming LOI conditions..."

Search Fund Buyer (600ms cadence):
  "Evaluating recurring revenue quality..."
  "Analyzing customer concentration risk..."
  "Reviewing management transition timeline..."
  "Forming LOI conditions..."

Micro-PE Buyer (600ms cadence):
  "Assessing platform acquisition fit..."
  "Reviewing property and asset base..."
  "Modeling seller note structure..."
  "Forming LOI conditions..."

After 2.4s of simultaneous reasoning, all three cards
flip to their full verdict surfaces simultaneously.
The flip should feel like a reveal — not a load.
Use a subtle card-flip or cross-fade (200ms).

Total convening time: ~4.2s. Do not compress this.
The parallel reasoning is the demo moment.

─────────────────────────────────────────────
PERSONA PANEL LAYOUT
─────────────────────────────────────────────
The three persona panels are the dominant element on the page.
They sit side by side in a 3-column grid. On 1080p each panel
is approximately 360px wide. They are tall — all three should
reach the same height regardless of content.

Each panel has four internal sections separated by hairline
dividers (same SectionBlock pattern as prior stations):

PANEL HEADER
  Persona name (Garamond, large)
  Persona type label (small caps, muted)
  Buyer profile summary (2 lines max)

  SBA-Backed Operator
  FIRST-TIME BUYER / SBA 7(A) FINANCING
  "Evaluates deals through debt service coverage and
  operator replaceability. Needs a business that runs
  without the seller in 90 days."

  Search Fund Buyer
  SEARCHER / SELF-FUNDED ACQUISITION
  "Thesis-driven buyer focused on recurring revenue
  quality and management transition clarity. Will not
  proceed without contracted revenue visibility."

  Micro-PE Buyer
  INDEPENDENT SPONSOR / PLATFORM ACQUISITION
  "Asset and brand-driven. Models deals as platforms
  for add-on acquisitions. Comfortable with seller
  notes and earnouts."

VERDICT STRIP (immediately below header)
  Large verdict badge — one of three states:
  ● PROCEED TO LOI (mint) — would make an offer now
  ◐ CONDITIONAL (amber) — would proceed with conditions
  ○ WOULD NOT PROCEED (red) — hard no at current state

  Below the badge, one-line condition summary:
  SBA: "Conditional on SOP documentation for 5 tasks"
  Search Fund: "Conditional on 3-year NJ Transit contract"
  Micro-PE: "Proceed — prefers seller note $175K–$229K"

VALUATION & DEAL STRUCTURE
  Each persona proposes their own number and structure.
  Show as a clean value breakdown, not a table:

  SBA-Backed Operator:
    Offer Range:        $1.55M – $1.70M
    Structure:          SBA 7(a) · $106K buyer down
    Seller Note:        None required
    Condition:          SOP docs before close
    DSCR Read:          4.4× — "Strong. No lender concern
                        on the debt service."

  Search Fund Buyer:
    Offer Range:        $1.45M – $1.65M
    Structure:          SBA 7(a) or seller-financed
    Seller Note:        $150K–$200K preferred
    Condition:          NJ Transit 3-yr contract + mgmt
                        transition plan
    Recurring Rev Read: "38% is thin. The NJ Transit
                        account is the thesis. Lock it."

  Micro-PE Buyer:
    Offer Range:        $1.65M – $1.85M
    Structure:          Cash + seller note
    Seller Note:        $175K–$229K (10–15% of deal)
    Condition:          None hard — prefers faster close
    Asset Read:         "Property ownership is a balance
                        sheet asset. 15-year brand +
                        facility = platform fit."

OBJECTION STACK
  Section label: "Objections — ranked by severity"
  Subhead: "Deal-breakers are flagged for immediate
  remediation. Negotiation points are surfaced for
  awareness."

  Each objection row:
    Severity chip (Deal-Breaker / High / Medium / Low)
    Objection text (one line, plain language)
    Agent assignment chip (if remediation exists)

  SBA-Backed Operator objections:
    ● DEAL-BREAKER  Owner-dependency score 38/100 —
                    lender will require documented SOPs
                    for post-close operations
                    → Owner-Dependency Agent
    ● HIGH          Only 1 of 11 staff tenured 3+ yrs —
                    key-person risk post-close
                    → Owner-Dependency Agent
    ● MEDIUM        Personal travel add-back ($9K) may
                    require receipt documentation for
                    lender review
                    → Recast Agent
    ● LOW           Marketing spend trending up 58% over
                    3 yrs — buyer will want attribution
                    → No agent assigned

  Search Fund Buyer objections:
    ● DEAL-BREAKER  NJ Transit contract unconfirmed
                    beyond current term — recurring
                    revenue thesis depends on it
                    → Concentration Agent
    ● DEAL-BREAKER  No management layer below owner —
                    search fund requires operable
                    business on day 1
                    → Owner-Dependency Agent
    ● HIGH          Recurring revenue at 38% — below
                    search fund threshold of 50%+
                    → No agent assigned (structural)
    ● MEDIUM        No documented transition plan for
                    catering sales relationships
                    → Owner-Dependency Agent

  Micro-PE Buyer objections:
    ● HIGH          0 documented SOPs — platform
                    integration requires process
                    documentation
                    → Owner-Dependency Agent
    ● HIGH          Single-location operation limits
                    near-term add-on potential
                    → No agent assigned (structural)
    ● MEDIUM        Seller note preference ($175K–$229K)
                    needs seller confirmation
                    → Human: deal lead to confirm
    ● LOW           Customer concentration moderate —
                    within threshold but monitor
                    → Concentration Agent

─────────────────────────────────────────────
WORK ORDERS PANEL (below the three persona panels)
─────────────────────────────────────────────
Section label: "BOARDROOM OUTPUT — AGENT WORK ORDERS"
Subhead: "The following tasks have been generated from
Boardroom objections. Each is assigned to the correct
agent. Approve to dispatch."

This section is the operational consequence of the
investment committee's findings. It must feel like a
real task dispatch surface — not a list of bullet points.

Four work order cards in a 2×2 grid:

WORK ORDER 1 — Owner-Dependency Agent
Priority: CRITICAL
Task: "Document the 5 owner-dependent operational tasks
  flagged by the SBA-Backed Operator and Search Fund
  personas. Generate SOP templates for each task.
  Target: raise Transferability score from 38/100 to 62/100."
Triggered by: SBA-Backed Operator (deal-breaker) +
  Search Fund (deal-breaker) + Micro-PE (high)
Estimated value unlock: +$450,000
Status: AWAITING DISPATCH → mint on approval

WORK ORDER 2 — Concentration Agent
Priority: HIGH
Task: "Draft a contract extension proposal for the NJ
  Transit Corporate Catering account. Target: 3-year
  renewal. Confirm contract status and document tenure
  for lender package."
Triggered by: Search Fund (deal-breaker)
Estimated value unlock: "Unlocks Search Fund LOI pathway"
Status: AWAITING DISPATCH → mint on approval

WORK ORDER 3 — Recast Agent
Priority: MEDIUM
Task: "Harden the personal travel add-back narrative
  ($9K/yr) with receipt-level documentation guidance.
  Update lender package narrative to pre-empt SBA
  underwriter challenge."
Triggered by: SBA-Backed Operator (medium)
Estimated value unlock: "Reduces lender friction"
Status: AWAITING DISPATCH → mint on approval

WORK ORDER 4 — Outreach Agent
Priority: HIGH
Task: "Prioritize SBA-Backed Operator and Micro-PE
  buyer profiles for initial outreach. Search Fund
  outreach held pending NJ Transit contract confirmation.
  Generate personalized sequences for each target profile."
Triggered by: Boardroom buyer segment recommendations
Estimated value unlock: "Opens two of three LOI pathways"
Status: AWAITING DISPATCH → mint on approval

─────────────────────────────────────────────
HUMAN GATE — DISPATCH APPROVAL
─────────────────────────────────────────────
Below the work order grid, the canonical mint gradient
approval banner (same pattern as Stations 4 and 5):

Agent eyebrow: "CASE MANAGER AGENT · AWAITING YOUR APPROVAL"
Headline: "Authorize the agent fleet to execute the
  Boardroom's work orders."
Body: "ARIA will dispatch four agents simultaneously.
  No buyer communication will be sent until outreach
  strategy is separately approved. You can review each
  agent's output before it is published or shared."

Two CTAs:
- Secondary: "Review LOI structure logic" → tooltip only:
  "Full LOI term logic available for deal lead review
  before any buyer communication reflects it."
- Primary: "Dispatch Agent Fleet →" → spinner 700ms
  ("Dispatching Owner-Dependency Agent... Recast Agent...
  Concentration Agent... Outreach Agent...") →
  work order cards flip from "AWAITING DISPATCH" to
  "DISPATCHED ✓" one at a time with 200ms stagger →
  audit line → router.push("/documents")

Audit confirmation line:
"✓ Boardroom work orders approved by Chandan Patel ·
  [today] · [time] · Agent fleet dispatched. No external
  communications authorized pending outreach review."

─────────────────────────────────────────────
SECONDARY INTERACTIONS
─────────────────────────────────────────────

Objection row hover:
  Row elevates subtly (–1px + shadow). The agent
  assignment chip glows. Tooltip shows: "This objection
  generated Work Order [N] → [Agent Name]." Connects
  the objection list to the work order grid visually.

Work order card hover:
  Shows which objection(s) triggered this work order
  in a tooltip. "Triggered by: [persona] — [severity]
  objection: [text]." Closes on mouse-out.

Persona verdict badge hover:
  "CONDITIONAL" badge expands inline to show the full
  condition text rather than the truncated summary.

Objection severity chip legend:
  Small legend at the top of each objection stack:
  ● Deal-Breaker · ● High · ● Medium · ● Low
  Chips are color-coded:
  Deal-Breaker: red bg / red border
  High: peach bg / peach border
  Medium: sky bg / sky border
  Low: muted bg / no border

─────────────────────────────────────────────
VISUAL DESIGN DIRECTION
─────────────────────────────────────────────
The Boardroom screen must feel like the most serious screen
in the application. It is an investment committee, not a
feature panel.

- The three persona panels use a slightly darker card
  background than the standard glass card — they are
  deliberating rooms, not data displays.
- Each persona panel has a 3px top border in the persona's
  accent color:
    SBA-Backed Operator: mint (financing / fundable)
    Search Fund:         sky blue (thesis / recurring)
    Micro-PE:            warm gold / amber (assets / platform)
- The PROCEED / CONDITIONAL / WOULD NOT PROCEED verdict
  badge is the largest typographic element in each panel —
  Garamond, 22px, full badge width. It must be the first
  thing the eye lands on after the persona name.
- The work order grid uses the dark terminal card surface
  from the Ingestion Agent log — these are operational
  dispatches, not summary stats. The "AWAITING DISPATCH"
  state uses a subtle pulse animation on the status chip
  to communicate that the fleet is ready and waiting.
- When the dispatch approval fires, the four work order
  cards flipping to "DISPATCHED ✓" one at a time is the
  climactic UI moment of the demo. The stagger must be
  visible and satisfying — 200ms between each flip,
  each card getting a brief mint flash on flip.

---

## Loading States

- **Convening sequence:** 600ms stagger between persona
  card appearances + 2.4s parallel reasoning lines +
  200ms flip reveal. Total: ~4.2s. Non-negotiable — this
  is the demo's most important perceived-AI moment.
- **Dispatch approval:** 700ms spinner with cycling agent
  names, then 4 card flips at 200ms stagger = ~1.5s total
  before route fires.
- **No skeletons on this screen.** The convening sequence
  is the loading state. Cards should not flash skeleton
  content — they should appear dark and then reason.

---

## Downstream Implications for the Station Agent

1. **Work order card "DISPATCHED" state must persist in
   the left rail and on downstream stations.** When the
   user navigates to `/risk` after this station, the
   Owner-Dependency Agent's task list should reflect
   that it received a Boardroom work order — not just
   the Risk Analysis output. This means `/risk` needs
   a "Boardroom work order received" indicator on the
   remediation plan section.

2. **The Outreach Agent's targeting logic on `/outreach`
   is set here.** The buyer profile priority order
   (SBA-Backed Operator first, Micro-PE second, Search
   Fund third pending NJ Transit) must be reflected in
   the Kanban pipeline on `/outreach`. Do not invent a
   different priority order on that station.

3. **The Search Fund's NJ Transit condition connects
   directly to the Concentration Agent work order.**
   When `/risk` surfaces the Concentration Agent panel,
   it should reference the Search Fund persona's
   deal-breaker as the reason the NJ Transit contract
   extension is critical — not just a standalone risk.

4. **The persona accent colors (mint / sky / amber)
   are reused on `/outreach`** where the buyer pipeline
   Kanban cards are color-coded by buyer type. Establish
   the color tokens here and carry them forward.

5. **After this station ships**, flip `/boardroom` →
   `active` and add it to the left rail between `/risk`
   and `/documents` in `lib/persona.ts`. The Boardroom
   is always-on in production — represent this in the
   rail by giving it a persistent non-locked state even
   before the user visits it.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   Arriving from `/risk` → 4.2s convening sequence
   fires correctly (3 cards appear staggered, reasoning
   lines cycle per persona, all three flip simultaneously).
   All objection row hovers fire tooltips. Work order
   card hovers show trigger source. Verdict badge hovers
   expand condition text. "Dispatch Agent Fleet" →
   700ms spinner with cycling agent names → 4 cards flip
   to DISPATCHED ✓ with 200ms stagger → audit line →
   routes to `/documents`. No console errors. Severity
   chip legend renders. pnpm typecheck clean.

2. **Does it look investor-ready on 1080p?**
   The three persona panels are the visual centerpiece —
   equal height, distinct accent borders, verdict badge
   dominant. Work order grid reads as operational
   dispatch surface, not a bullet list. Convening
   sequence communicates parallel AI reasoning without
   feeling like a loading screen. The dispatch flip
   sequence is the visual payoff — satisfying, not
   flashy. No placeholders anywhere.

3. **Does the mock data tell a coherent story?**
   All financial values match the approved recast from
   Station 5. DSCR 4.4×, SDE $962K, listing $1.75M,
   Transferability 38/100, NJ Transit 19% / 6-year
   tenure, seller note $175K–$229K — all from
   DEMO_PERSONA.md. Objections trace back to real
   risk data. Work orders reference the correct agents.
   Persona accent colors match what `/outreach` will
   use for buyer type labeling.
```