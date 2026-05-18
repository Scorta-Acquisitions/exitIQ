## script
Here is the fully rewritten script pulling directly from the agent-native architecture and weaving in the persona only where it illustrates a specific capability.

***

# Scorta — 2-Minute Demo Script (VC/Accelerator Final)

**Format:** Loom screen recording, one take
**Tone:** Technical founder, calm, showing a working system
**Rule:** Agent architecture is the story. Chandan is the live data running through it.

***

## [0:00–0:18] — What Scorta Is

*Screen: Scorta landing page*

> "There are about 200,000 Main Street businesses under two million in revenue that will attempt to sell in the next five years. The vast majority will fail — not because the business isn't worth buying, but because no one ever made it lender-ready or buyer-ready before taking it to market.
>
> Traditional brokers don't do that work. Scorta does. We are the underwriter, prep shop, and broker-of-record — run end-to-end by a coordinated fleet of specialized agents with a human approval layer on top. Not a tool for brokers. We are the broker."

***

## [0:18–0:40] — ExitIQ: Intake and Scoring

*Screen: ExitIQ assessment — filling in answers live as Chandan*

> "The entry point is ExitIQ. This is an LLM-based intake that intelligently determines three things about any business: exit readiness, lender readiness, and valuation range. The questions are dynamically selected by the model based on industry — a restaurant gets a different question set than a services firm.
>
> I'm running through a live scenario right now — a restaurant operator in New Jersey, fifteen years in business, owns the property, roughly two million in revenue."

*Submit. Report generates.*

> "We run those answers through models built on industry and deal data. The output is a gap report, lender financeability criteria, and a 90-day checklist. This operator scores 49 out of 100 — SBA eligible, but two gaps are compressing his multiple from 3x down to 1.5x. Undocumented operations and financials that haven't been normalized for a lender."

*Scroll briefly through the score breakdown. Move on.*

***

## [0:40–1:00] — ARIA and the Case Manager Agent

*Screen: /dashboard — ARIA animates in*

> "When the seller signs in, the Case Manager Agent — ARIA — has already reviewed the intake and knows exactly what's blocking this deal. She owns the deal state machine. She identifies the blockers, dispatches the right agents, sends structured nudges to the seller when something is stalled, and escalates to a human operator when a judgment call is needed.
>
> This is the coordination layer that traditionally lived in a junior banker's inbox — an agent that never drops context and runs across dozens of concurrent deals simultaneously. One operator on Scorta manages what would otherwise require a team of four to six."

*Point to the left rail — locked stations. Show one locked hover tooltip.*

> "Nothing unlocks until the prerequisite is done. ARIA decides when a station is ready — the seller never has to figure out where they are."

***

## [1:00–1:25] — Ingestion → Recast → Approval Layer

*Screen: /connect → /ingestion log streaming → /recast table*

> "Once financial accounts are connected — QuickBooks, bank feed, eventually POS and payroll — the Ingestion Agent pulls the raw data, classifies it, and extracts structured fields into Scorta's internal data model. No manual Excel work. The system builds the room for underwriting to happen.
>
> On this scenario, it identified $127,000 in add-backs across 36 months — owner comp, personal vehicle, a one-time equipment repair. That moves normalized SDE from what's on the books to $962,000.
>
> The Recast Agent then performs an SBA-style P&L recast. The architecture is deliberately hybrid — deterministic logic handles the math against SOP 50 10 8 constraints, because SBA underwriters don't care about a clever narrative, they care about the numbers being right. The LLM layer generates the recast narrative and the add-back justifications. That separation is what makes the output defensible in a lender's hands."

*Show the Review & Approve button. Click it.*

> "Every recast is staged for human approval before it reaches any buyer or lender. Agents propose. Humans sign off. Every action is logged with a named signatory and a timestamp. That's how we operate as a licensed brokerage while moving at agent speed."

***

## [1:25–1:45] — Owner-Dependency + The Boardroom

*Screen: /risk — owner-dependency panel*

> "The Owner-Dependency Agent scored this business at 38 out of 100 on transferability — the single biggest drag on the multiple. It doesn't just flag the problem. It generates a structured remediation plan: the five specific tasks this owner needs to document for the business to be operable without him. The Case Manager Agent tracks completion. That fix alone is worth over $400,000 in deal value.
>
> Behind that, we have the Boardroom — three strategic buyer personas running as independent agents, each with its own objection library and valuation heuristics. One reasons like an SBA-backed operator, one like a search fund, one like a micro-PE buyer. Each produces a valuation range, a deal structure, and 20 to 40 ranked objections.
>
> But the Boardroom's outputs aren't a report. They're work orders. Objections become remediation tasks dispatched to the Owner-Dependency and Concentration agents. Recast narrative risks get handed back to the Recast Agent to harden. Buyer segment recommendations go directly to the Outreach Agent to begin building personalized sequences. The seller gets a red-team view of their own deal before a real buyer ever sees it — and the system has already started fixing the problems."

***

## [1:45–2:00] — The Moat + Close

*Screen: Pull back to dashboard or go to blank*

> "On our existing engagements we've recast financials, gotten sellers SBA pre-qualified with a New Jersey lender, and generated comps that have already had real buyer reception off-market.
>
> And every engagement is feeding a proprietary dataset nobody else in this market has — structured failure-mode data on which add-backs got rejected, where SBA prequal hit friction, which objection killed the deal. That gets fed back into every agent and compounds with each transaction.
>
> We're not selling software to brokers. We are the broker. And the agents are how we make that economically defensible at scale. SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid."

***

## Recording Notes

| Segment | Screen needed | Status needed |
|---|---|---|
| ExitIQ | Assessment wizard, live input | Must be clickable |
| Report | Score 49, gap breakdown | Must render |
| Dashboard | ARIA welcome, locked left rail | Must animate |
| Ingestion | Streaming log, final summary card | Must stream visibly |
| Recast | Before/after table, approve button | Must be clickable |
| Risk | Owner-dependency score + task list | Must render |
| Boardroom | Can be static screenshot or skipped | Reference verbally only |

The Boardroom, CIM, Lender Ops, and Outreach stations do not need to be clickable  — the script references them architecturally while the demo stays on the screens that are already built.


## demo workflow
Here is the full end-to-end workflow for Chandan, mapped against every feature being demoed.

***

# Scorta Workflow: Palace Kitchen & Catering

**Seller:** Chandan Patel · **Business:** Palace Kitchen & Catering · **Goal:** SBA-funded, buyer-closed exit at $1.75M

***

## Stage 0 — Intake
**Screen:** ExitIQ assessment

Chandan answers 10 questions. The LLM scores his business at **49/100** — SBA eligible but two critical gaps identified immediately:
- Documentation score: **3/10** — no SOPs, financials rated "fair"
- Owner Independence score: **3/10** — business breaks without him

**Output:** Gap report, lender financeability criteria, 90-day checklist
**ARIA is initialized.** Deal state machine opens.

***

## Stage 1 — ARIA Onboarding
**Screen:** /dashboard

ARIA reviews the 10 answers and surfaces three honest next actions:
1. Connect financial accounts — nothing downstream is possible without real data
2. Begin owner-dependency documentation — can start today, no data needed
3. Stand by for Recast Agent — unlocks after Step 1

**What's happening behind the scenes:** Case Manager Agent opens the deal file, logs intake data, sets SLA windows for Steps 1 and 2, and flags the deal as `hot_seller` — 6–12 month timeline means urgency is real.

***

## Stage 2 — Data Connection
**Screen:** /connect

Chandan connects QuickBooks Online and Plaid bank feed. Two of four connectors live. Stripe and Google Drive pending — not blockers for this stage.

**ARIA dispatches:** Ingestion Agent

***

## Stage 3 — Ingestion
**Screen:** /ingestion

Ingestion Agent pulls 36 months of transactions across QuickBooks and bank feed. Streams classification log live. Surfaces:

- **1,247 transactions** analyzed
- **$127,400** in add-backs identified across 3 years
  - $120K owner compensation
  - $18K personal vehicle
  - $22K one-time equipment repair (Year 2)
  - $9K personal travel
- Revenue trend: **↑18% over 3 years**
- **2 flags raised:** owner key-man dependency, top customer at 19% concentration

**Human gate:** Chandan reviews the extracted data summary and approves ingestion output before anything moves forward.

**ARIA dispatches:** Recast Agent + Owner-Dependency Agent simultaneously

***

## Stage 4 — Financial Recast
**Screen:** /recast

Recast Agent performs SBA-style P&L normalization across all 3 years. Deterministic math produces the numbers; LLM generates the lender-facing narrative for each add-back justification.

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Reported EBITDA | $680K | $765K | $815K |
| Normalized SDE | $827K | $934K | **$962K** |

Recommended listing price moves to **$1.75M** at a 2.4x multiple on Year 3 SDE.

**Human gate:** Chandan reviews the before/after recast table and approves. His name, timestamp, and approval are logged. Recast is now publishable to lenders and buyers.

***

## Stage 5 — Risk Analysis
**Screen:** /risk

Two agents report in parallel:

**Owner-Dependency Agent**
- Transferability score: **38/100** — HIGH risk
- Chandan handles all catering sales relationships and vendor negotiations personally
- Only 1 of 11 employees has 3+ years tenure
- 0 documented SOPs
- Fix: document top 5 owner-dependent tasks
- Value unlock: **+$450K** in deal value, transferability target rises to 62/100

**Concentration Agent**
- Top customer (NJ Transit Corporate Catering): **19% of revenue**
- Risk level: MODERATE — within SBA threshold, flagged for monitoring
- Account tenure: 6 years — mitigating factor noted in lender narrative

**Human gate:** Chandan reviews both remediation playbooks. Approves task list. Owner-dependency documentation begins — ARIA tracks completion.

***

## Stage 6 — The Boardroom
**Screen:** /recast or Boardroom panel (static if not built)

Three buyer personas red-team the deal simultaneously:

- **SBA-Backed Operator** — DSCR at 4.4x is strong. Primary objection: owner-dependency at 38/100 is a lender concern for post-close operations. Verdict: proceed to LOI *conditional on* SOP documentation
- **Search Fund Buyer** — recurring revenue at 38% is thin for a search fund thesis. Catering contract with NJ Transit is the asset. Wants 3-year contract locked before LOI
- **Micro-PE Buyer** — property ownership is a balance sheet asset. Facility + brand + 15-year history = platform fit. Would structure with seller note of $175K–$229K

**Boardroom outputs become work orders:**
- Owner-Dependency Agent: draft SOP template for top 5 tasks → Chandan fills in
- Concentration Agent: draft contract extension proposal for NJ Transit account
- Recast Agent: harden add-back narrative against SBA-Backed Operator objections
- Outreach Agent: target SBA-Backed Operator and Micro-PE buyer profiles first

**Human gate:** Deal lead reviews LOI structure logic before any buyer communication reflects it.

***

## Stage 7 — Lender Package
**Screen:** /marketplace → Lenders tab

Lender Ops Agent assembles the full SBA 7(a) package:
- Normalized 3-year P&L with approved recast narrative
- DSCR: **4.4x** (floor 1.25x — well clear)
- Buyer down payment: **$106K minimum**, $159K recommended
- Monthly debt service: **$14,200/month**
- Loan amount: **$1.09M** (87.5% SBA-financed)

Three lenders matched and ranked:
- Northeast Community Bank — **94% match** (NJ food service specialist)
- First National Business Capital — **87% match** (15-day commitment)
- ReadyCap Commercial — **81% match** (flexible down payment)

**Human gate:** Deal lead approves lender package before submission. Lender Ops Agent then logs into lender portals, uploads the package, and tracks submission status.

***

## Stage 8 — Buyer Outreach
**Screen:** /outreach → Kanban pipeline

Outreach Agent, acting on Boardroom's buyer segment recommendations, runs personalized sequences against Scorta's verified network — SBA-pre-qualified buyers sourced from prior closed deals and their professional connections.

Pipeline opens:
- **Identified** → 12 buyers matched to deal profile
- **Contacted** → 5 outreach sequences initiated by agent
- **Interested** → 3 buyers opened CIM in VDR
- **NDA Signed** → 2 NDAs returned

**Human gate:** Deal lead approves outreach strategy before sequences run. Agent handles cadence, follow-up timing, and CIM access gating.

***

## Stage 9 — Exit Ready

When Stage 5 remediation is complete (SOPs documented, NJ Transit contract extended), the Scorta Score updates:

| Sub-score | Before | After |
|---|---|---|
| Transferability | 38/100 | 62/100 |
| Documentation | 65/100 | 81/100 |
| **Overall Scorta Score** | **71/100** | **84/100** |

**Label moves from** "Strong SBA Candidate" → **"Scorta Certified"**

Palace Kitchen & Catering is now SBA-fundable, buyer-ready, and listed. The agent fleet has moved Chandan from a 10-question assessment to a term-sheet pipeline — with a human approval signature on every material step.