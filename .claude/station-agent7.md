***

## STATION_6.md — Risk Analysis (Updated with Intake Flow)

```markdown
# STATION_6.md — Risk Analysis

## Goal
Transform the Risk Analysis station from a static display into
an active data collection and analysis surface. The Owner-Dependency
Agent and Concentration Agent cannot produce a defensible risk
assessment from 10 intake questions alone. This station collects
the structured operational data needed to generate a real score —
through a guided Q&A flow that the seller completes in-session.

The output of this intake is the risk analysis. The agent reads
the answers, computes the scores, and surfaces the remediation
plan. The seller sees the analysis being generated from their
own words — not pre-baked from a persona file.

For the demo, the Q&A fields are pre-filled with Chandan's
answers. The seller "reviews and confirms" rather than types
from scratch. This preserves demo speed while showing the
real product interaction.

Two intake paths are supported:
1. Guided Q&A (default) — structured questions, typed answers,
   agent analyzes in real time
2. One-pager upload — seller uploads a prepared document,
   Ingestion Agent extracts the structured fields, same
   analysis runs on the extracted data

Both paths produce the same output surface. The toggle
between them is visible at the top of the intake section.

---

## Route + Entry Point
**Route:** `/risk`
**Arrives from:** `/recast` via "Approve Recast & Continue"
**Exits to:** `/boardroom` via "Open Boardroom →" CTA

ARIA intro on arrival:
"To assess how transferable Palace Kitchen is to a new owner,
I need to understand how the business actually runs day to day.
Answer the questions below — or upload a one-pager if you've
already prepared one. The Owner-Dependency Agent will score
your business and generate a remediation plan from your answers."

---

## What We Are Building

Three sequential layers on one screen:

LAYER 1 — INTAKE
The seller answers structured questions across two domains:
Owner-Dependency and Customer Concentration. Each domain
has its own question set. Answers are typed or selected.
For the demo, all fields are pre-filled — the seller
reviews and confirms.

LAYER 2 — ANALYSIS
After the seller submits, the agents analyze the answers
in real time. A brief processing sequence plays (reusing
the streaming pattern), then the scored output appears.

LAYER 3 — OUTPUT
The scored risk analysis: donut charts, transferability
score, remediation plan, concentration panel. This is
the same surface described in the original Station 6 brief
— it is now the result of the intake, not a static display.

---

## Hard-Coded Surface

All pre-filled answers from `DEMO_PERSONA.md` Section 6.
The Q&A fields render pre-filled for the demo. The seller
clicks "Confirm & Analyze" rather than typing from scratch.

─────────────────────────────────────────────
INTAKE TOGGLE (top of station)
─────────────────────────────────────────────
Two-option pill toggle:
  [ Answer Questions ]  [ Upload One-Pager ]

Default: Answer Questions active.

Upload path: A drag-and-drop zone appears. Copy:
"Upload a one-pager describing your operations, staff
structure, and key customer relationships. The Ingestion
Agent will extract the structured fields and run the
same analysis."
File input accepts PDF, DOCX. In the demo, the upload
zone is present but non-functional — clicking it shows
a tooltip: "Document ingestion available — demo uses
Q&A mode for this walkthrough."

─────────────────────────────────────────────
INTAKE — OWNER-DEPENDENCY QUESTIONS
─────────────────────────────────────────────
Section label: "OWNER-DEPENDENCY ASSESSMENT"
Agent eyebrow: "Owner-Dependency Agent · intake"
Subhead: "These answers determine how transferable your
business is to a new owner and where the agent will
focus remediation."

Question set — 8 questions, each with a field type:

Q1  If you were unavailable for 30 days, what would
    break first?
    Field: textarea (3 rows)
    Pre-filled: "Catering sales would stop. All new
    catering inquiries and quotes come directly to me.
    No one else has the client relationships or knows
    our pricing model."

Q2  Which of your operational tasks requires your
    personal involvement to complete?
    Field: textarea (3 rows)
    Pre-filled: "Catering client calls and contract
    negotiations, vendor price negotiations, daily
    bank deposits, staff scheduling decisions,
    health inspection responses."

Q3  How many employees have been with you for 3 or
    more years?
    Field: number input
    Pre-filled: 1

Q4  How many of your staff could open and run the
    kitchen for a full day without you present?
    Field: select (None / 1–2 / 3–5 / Most of them)
    Pre-filled: "1–2"

Q5  Do you have written procedures for any of your
    core operations?
    Field: select (None / A few informal notes /
    Some written SOPs / Comprehensive SOPs)
    Pre-filled: "None"

Q6  Who handles customer complaints when you are
    not available?
    Field: textarea (2 rows)
    Pre-filled: "There is no formal process. Staff
    call or text me regardless of where I am."

Q7  How long would it take a new owner to learn
    everything they need to run the business
    independently?
    Field: select (< 30 days / 1–3 months /
    3–6 months / 6+ months)
    Pre-filled: "3–6 months"

Q8  Are any of your key vendor relationships
    or contracts in your name personally rather
    than the business name?
    Field: select (Yes, most / Some / No, all
    in business name)
    Pre-filled: "Yes, most"

─────────────────────────────────────────────
INTAKE — CONCENTRATION QUESTIONS
─────────────────────────────────────────────
Section label: "CUSTOMER CONCENTRATION ASSESSMENT"
Agent eyebrow: "Concentration Agent · intake"
Subhead: "These answers determine your revenue
concentration risk and contract coverage."

Question set — 5 questions:

Q1  What percentage of your annual revenue comes
    from your single largest customer?
    Field: select (< 10% / 10–25% / 25–50% / > 50%)
    Pre-filled: "10–25%"

Q2  Who is your largest customer and what is the
    nature of the relationship?
    Field: textarea (2 rows)
    Pre-filled: "NJ Transit Corporate Catering —
    we provide lunch and event catering for their
    Northern NJ offices. 6-year relationship, monthly
    invoicing, no formal multi-year contract in place."

Q3  Do you have a signed contract with your top
    customer?
    Field: select (Yes, multi-year / Yes, annual /
    Month-to-month / No contract)
    Pre-filled: "Month-to-month"

Q4  How many customers account for more than 5%
    of your annual revenue?
    Field: number input
    Pre-filled: 2

Q5  If your largest customer ended the relationship
    tomorrow, how long could the business sustain
    current operations?
    Field: select (< 1 month / 1–3 months /
    3–6 months / 6+ months)
    Pre-filled: "3–6 months"

─────────────────────────────────────────────
SUBMIT ACTION
─────────────────────────────────────────────
Below both question sets, a single full-width CTA:

Primary: "Confirm Answers & Run Analysis →"
Copy above: "The Owner-Dependency Agent and Concentration
Agent will analyze your answers and generate your
risk profile and remediation plan."

On click:
- Button spinner (700ms)
- Transitions to analysis processing sequence

─────────────────────────────────────────────
ANALYSIS PROCESSING SEQUENCE (after submit)
─────────────────────────────────────────────
The intake form fades out (200ms). A terminal-card
analysis surface fades in (reuse dark card from
Ingestion and Boardroom stations). Two parallel
agent streams run simultaneously:

Owner-Dependency Agent stream (left column):
  "Reading operational dependency answers..."
  "Scoring task surface against replaceability model..."
  "Flagging undocumented processes..."
  "Calculating transferability score..."
  "Generating remediation playbook..."

Concentration Agent stream (right column):
  "Reading customer concentration answers..."
  "Cross-referencing SBA concentration threshold..."
  "Flagging contract coverage gap..."
  "Assessing revenue sustainability..."
  "Generating contract extension playbook..."

Timing: 5 lines × 400ms = 2.0s per stream.
Both streams run at the same cadence and complete
together. After both complete:
"Analysis complete. Generating risk profile..."
Full risk output surface slides in (360ms).

─────────────────────────────────────────────
RISK OUTPUT SURFACE
─────────────────────────────────────────────
Identical to the output described in the previous
Station 6 brief. Rendered as the result of the
intake, not a static display. The scores, narrative,
and remediation plan all reference the specific
answers the seller gave.

SECTION 1 — OWNER-DEPENDENCY OUTPUT
  Score: 38/100 Transferability (derived from answers)
  "Your answers indicate high owner-dependency. You
  identified 5 tasks that require your personal
  involvement, have 0 documented SOPs, and most
  vendor contracts are in your name personally."
  [Remediation plan — 5 task rows as before]
  [Projected outcome card as before]

SECTION 2 — CONCENTRATION OUTPUT
  Score: 19% top customer (derived from Q1 answer)
  "NJ Transit accounts for 19% of revenue on a
  month-to-month arrangement. The absence of a
  multi-year contract is a Search Fund deal-breaker
  and a lender monitoring flag."
  [Single task row — NJ Transit contract renewal]
  [Outcome card as before]

─────────────────────────────────────────────
OPEN BOARDROOM HANDOFF
─────────────────────────────────────────────
Same as original Station 6 brief. Dark nav panel,
single CTA: "Open Boardroom →" → /boardroom
No spinner, no audit line. Pure navigation.

---

## Interactions

- **Toggle between Q&A and Upload** — instant visual swap.
  Upload zone is non-functional in demo (tooltip fires).
- **Question fields** — all pre-filled. Seller can edit
  any field. Edits do not change the hard-coded output
  for the demo — the analysis result is always the
  persona values regardless of what is typed. (In
  production, edits would rerun the model.)
- **"Confirm Answers & Run Analysis"** — triggers the
  processing sequence. Cannot be re-clicked mid-sequence.
- **Processing stream** — auto-scrolls within the terminal
  card. Same ingestLineIn ease-out animation as Station 4.
- **Output surface interactions** — identical to original
  Station 6 brief (donut hovers, task row hovers,
  projected outcome card hover).

---

## Loading States

- **Submit button:** Spinner, fixed width, "Analyzing
  your answers..." copy during sequence.
- **Form fade-out / analysis fade-in:** 200ms cross-fade.
  No layout jump.
- **Output surface reveal:** 360ms slide-in after both
  streams complete.

---

## Design Direction

The intake section must feel like a professional structured
interview — not a form. The question copy is plain language,
empathetic, and specific to the seller's situation. Each
question group has an agent eyebrow to reinforce that a
specialized agent is reading the answers, not a generic
survey tool.

The transition from intake → processing → output is the
key interaction moment. The seller types (or confirms)
their answers, clicks analyze, and watches the agents
derive a score and plan from their specific words. That
chain of causation — answer → agent reasoning → scored
output — is what makes this feel like a real AI product
and not a hardcoded risk report.

---

## Downstream Implications

1. The specific answer to Q2 (owner-dependent tasks)
   feeds the five remediation task titles. The tasks
   shown in the output should reference the language
   the seller used in their answers — even in the demo,
   the pre-filled Q2 answer maps to the five task titles.

2. The NJ Transit answer (Q2 Concentration) establishes
   the contract extension framing that the Boardroom's
   Search Fund persona references. Consistent language
   across both stations.

3. The one-pager upload path is a product demo surface —
   show it exists, don't build it functionally. A tooltip
   is sufficient. When the full product ships, the
   Ingestion Agent extracts fields from the uploaded
   document and pre-fills the Q&A fields automatically.

4. After this station ships, flip `/risk` from `locked`
   → `active` and `/recast` → `shipped` in `lib/persona.ts`.

---

## Done Definition — QA Rule

1. **Can I click through without breaking?**
   `/risk` loads with ARIA intro + intake toggle + both
   question sets pre-filled. Toggle to Upload shows drag
   zone with tooltip. "Confirm Answers & Run Analysis"
   → spinner → form fades out → dual-stream terminal
   card renders → both streams complete → output surface
   slides in with both agent sections. "Open Boardroom →"
   navigates to `/boardroom`. No console errors. pnpm
   typecheck clean.

2. **Does it look investor-ready on 1080p?**
   Intake reads as a professional structured interview,
   not a survey. Question copy is specific and plain.
   Agent eyebrows distinguish the two question groups.
   Processing terminal card matches Ingestion/Boardroom
   dark surface treatment. Output surface matches prior
   Station 6 design spec — Section 1 visually dominates
   Section 2.

3. **Does the mock data tell a coherent story?**
   Pre-filled Q2 answer names the same 5 task areas
   that appear in the remediation plan. NJ Transit
   answer matches concentration output (19%, month-to-
   month). Output scores (38/100, 19%) match what the
   Recast station referenced in "Why 2.4×?" context
   and what the Boardroom work orders reference.
```