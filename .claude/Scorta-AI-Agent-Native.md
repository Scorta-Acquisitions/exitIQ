***

# Scorta: AI-Native Sell-Side Underwriter and Brokerage for Main Street Exits

***

At the core, Scorta is a **pre-market underwriting, remediation, and certification system that turns messy Main Street businesses into SBA-financeable, buyer-ready, Scorta-Certified assets — then brokers the sale through a process owned end-to-end by AI agents instead of PDFs and email.**

**We are not an AI tool for brokers. We are the underwriter, prep shop, and broker-of-record for sub-$2M SMB exits.**

The AI-native part is not "chat with a bot." It is a coordinated fleet of specialized agents and pipelines that *do the work a junior banker, underwriter, buyer panel, and deal coordinator would normally do* — fed by a failure-mode dataset we are uniquely positioned to collect. One human operator running Scorta manages what would otherwise require a team of four to six.

**Our outcome commitment:** SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid.

***

## 1. Product in One Sentence

**Scorta takes a sub-$2M business from raw books to "SBA-funded, buyer-closed" — owning every step of underwriting, prep, remediation, and brokerage through a small human approval layer on top of an agent-driven operations stack.**

The product is not just the broker. It is:

- The **Scorta Score** — saleability certification protocol
- The **Underwriter Stack** — recast, dependency, and financiability agents
- The **Case Manager Agent** — coordination backbone that owns deal state and moves every file forward
- The **Boardroom** — multi-persona buyer red-team that generates remediation and outreach strategy, then hands off to specialized agents for execution
- The **Capital-Verified Buyer Network** — matched against certified deals with agents running personalized outreach sequences
- The **Lender Ops Layer** — agents that work in real lender portals, VDRs, and listing systems

***

## 2. What We Actually Do to Make a Business Saleable

This is the explicit "prep stack" traditional brokers don't have. Every step is a productized, agentic workflow. Agents prepare and propose; humans approve before any material action is taken.

***

### 2.1 Data Ingestion and Normalization

Agent pipelines connect to the seller's environment — QuickBooks, Gusto, Stripe, POS, CRM, bank feeds — and pull raw data: financials, payroll, invoices, customer lists, contracts, lease docs.

Where integrations don't exist yet, the seller uploads documents; an **Ingestion Agent** classifies and extracts structured fields (chart of accounts, transaction buckets, contract terms) into Scorta's internal data model.

**What's AI-native:**
Document-understanding and extraction agents replace manual Excel keystrokes. The system *builds the room* for underwriting to happen — no human hours spent normalizing data.

***

### 2.2 SBA-Style Recast and Financial Defensibility

A **Recast Agent Pipeline** performs SBA-style P&L recasts: normalizing owner comp, add-backs, one-time items, and cleaning the EBITDA story so that it matches how an SBA underwriter or QofE firm will rebuild it.

Deterministic rules handle the math and SOP 50 10 8 constraints. The LLM layer writes the narrative explaining why each adjustment is justified and which add-backs are likely to be accepted or rejected by a lender.

Every recast is **staged for human approval** before it is published or shared with any buyer or lender. The approving operator's name, timestamp, and decision are logged permanently.

**What's AI-native:**
Hybrid architecture — exact calculations in code, explanation and edge-case reasoning via LLM. Output is lender-defensible because the numbers are deterministic, the story is consistent with SBA logic, and every representation has a named human signatory.

***

### 2.3 Owner-Dependency and Customer-Concentration Mapping

Structured questionnaires, usage data, and org-chart ingestion feed an **Owner-Dependency Agent** that scores how replaceable the owner is and where key processes are undocumented.

A **Concentration Agent** flags over-reliance on top-1/top-5/top-10 customers, missing contracts, and churn risk — then generates a prioritized remediation playbook with specific tasks: lock in contracts, diversify accounts, document key relationships.

**What's AI-native:**
Agents automatically generate and assign remediation tasks instead of a human broker hand-waving "you're too owner-dependent." The seller gets a structured action plan; the Case Manager Agent tracks completion.

***

### 2.4 The Case Manager Agent — Coordination Backbone

This is the operational core that separates Scorta from a platform with smart analytics. The **Case Manager Agent** watches every deal's state machine in real time and decides what happens next.

It:

- Identifies blockers (missing seller document, open lender info request, unresolved buyer objection) and dispatches specialized agents or human operators accordingly
- Sends structured nudges to sellers ("Upload Q3 payroll summary"), to lenders ("Respond to clarification on add-back #3"), and to buyers ("Updated CIM is available in your data room")
- Manages the deal calendar: scheduling calls, tracking SLA windows, escalating stale threads to a human
- Logs every dispatched action, every state transition, and every external communication in a permanent, auditable timeline

**What's AI-native:**
The coordination layer — historically a junior banker living in email — is replaced by an agent that never drops context, never loses a thread, and runs across dozens of concurrent deals simultaneously. This is the "20 deals per operator" lever.

***

### 2.5 Lender Ops and External System Execution

Agents don't just analyze — they work in the real systems where deals get done.

The **Lender Ops Agent** cluster:

- Logs into SBA lender portals and fintech LOS systems, uploads lender packages, tracks submission status, and responds to lender info requests
- Creates and manages virtual data rooms, invites buyers, gates access based on qualification tier, and tracks which sections each buyer has reviewed
- Posts and updates listings on marketplaces (BizBuySell, Acquire.com), drafts responses to buyer Q&A in the seller's voice, and surfaces scheduling links for calls

Every action is proposed by the agent and executed only after a human operator approves it. Every executed action is logged.

**What's AI-native:**
Our agents work with real lender portals, real VDRs, real listing systems — the same operational layer a broker's analyst would work in, running across hundreds of deals at once with full audit trails. The human layer sets guardrails, approves material actions, and handles judgment calls.

***

### 2.6 Multi-Persona Buyer Red-Team — The Boardroom

The Boardroom spins up three strategic buyer personas calibrated to the seller's industry, EBITDA, and financeability profile. Each persona is its own agent — with its own context, objection library, and valuation heuristics — running multi-step reasoning loops to simulate the offer they'd make, the objections they'd raise, and the reasons they'd walk.

- **The SBA-Backed Operator** reasons through debt service coverage, SBA eligibility, and operator-replaceability
- **The Search Fund Buyer** reasons through management transition risk, recurring revenue quality, and deal structure flexibility
- **The Micro-PE Buyer** reasons through platform fit, add-on potential, and multiple arbitrage

Each persona outputs:

- A valuation range and deal structure (cash, seller note, earn-out)
- A "would proceed to LOI / would not" verdict with explicit conditions
- 20–40 objections ranked by severity (deal-breaker vs. negotiation point)

**Boardroom outputs are handed directly to specialized downstream agents — not acted on by the Boardroom itself:**

- Objections flagged as **remediation tasks** → dispatched to the Owner-Dependency Agent and Concentration Agent to generate fix plans
- Recast narrative risks flagged by a persona → handed to the Recast Agent to revise and harden the add-back story
- Target buyer segment identified by each persona → passed to the **Outreach Agent**, which generates personalized sequences and executes outreach to capital-verified buyers in Scorta's network
- LOI structure logic from each persona → surfaced to the human deal lead for approval before any buyer communication reflects it

The seller gets a red-team view of their own deal before a real buyer ever sees it — and the system has already started fixing the problems.

**What's AI-native:**
Boardroom is an AI investment committee that produces actionable work orders, not a simulation dashboard. Every output has a downstream agent or human approval waiting to receive it.

***

### 2.7 Capital-Verified Buyer Network and Outreach Ops

Scorta maintains a network of SBA-pre-qualified and capital-verified buyers. The **Outreach Agent**, acting on Boardroom's buyer segment recommendations, runs targeted, personalized outreach sequences — email, CRM follow-up, call scheduling — at a volume and consistency no human junior broker can match.

Human deal leads approve the outreach strategy and review responses. Agents handle cadence, follow-up timing, and pipeline tracking.

***

## 3. The Agent Architecture in One View

| Agent Cluster | Function | Human Gate |
|---|---|---|
| **Ingestion Agent** | Connects to seller systems; classifies and extracts docs | Upload review |
| **Recast Agent Pipeline** | SBA-style P&L recast, add-back narrative | Approval before publish |
| **Owner-Dependency Agent** | Scores replaceability, generates SOP remediation tasks | Review of task plan |
| **Concentration Agent** | Flags customer risk, generates contract playbook | Review of task plan |
| **Case Manager Agent** | Deal state machine, dispatch, nudges, calendar, escalation | Exception escalation |
| **Boardroom** | Multi-persona buyer red-team; produces work orders for downstream agents | LOI structure review |
| **Recast Agent (Boardroom-fed)** | Hardens add-back narrative based on Boardroom objections | Approval before publish |
| **Lender Ops Agent** | Portal submissions, VDR management, listing ops, doc collection | Approve before external action |
| **Outreach Agent** | Buyer targeting and outreach sequences based on Boardroom personas | Strategy approval |

***

## 4. The Human Approval Layer

Every agent action that touches an external party or produces a material representation is logged and staged for human approval before execution. No valuation, add-back claim, lender submission, LOI term, or buyer communication goes out unsigned.

The approval UI is a single-screen review per action: what the agent proposes, why, and what happens if approved. Approval is one click. Declining routes back to the agent with context.

**The rule: agents run the work, humans own the risk. Every material action has a named human signatory and a permanent audit log.**

This is how we operate as a licensed, regulated, fiduciary-responsible brokerage while moving at agent speed.

***

## 5. The "AI-Native Services" Business Model

Scorta is not a SaaS product that charges per seat. We are a services business where AI agents have replaced the labor model, not the business model.

- **Pricing:** Success-fee-based brokerage, tiered by EV; fixed fee for Scorta Certification + term-sheet delivery
- **Unit economics:** As agents absorb more of the workflow, deals-per-operator scales — our target is 20+ concurrent exits per human deal lead vs. the industry average of 4–6
- **Moat:** The failure-mode dataset Scorta collects across every deal — what add-backs get rejected, what buyer personas walk on what signals, what SBA conditions kill deals — gets ingested back into every agent, compounding with each transaction

We don't sell software to brokers. We are the broker — and the AI is how we make that economically defensible at scale.

***

*Scorta. AI-native sell-side underwriting and brokerage for Main Street. SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid.*