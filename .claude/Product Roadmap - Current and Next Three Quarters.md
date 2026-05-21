# **Product Roadmap \- Current and Next Three Quarters**

## **Q2 2026 (Current \- May through July)**

**Milestones:**

* Lock the agent-stack reproducibility loop in our three Phase 1 verticals (home services, restaurants/franchises, digital marketing agencies). For each vertical: standardized Ingestion Agent integrations, vertical-tuned Recast Agent rule sets, vertical-specific Boardroom buyer-persona libraries.

* **Complete first 5 signed brokerage agreements** (currently 2, with the marketing agencies); the agency cohort is highest-conversion because business is digital and remote, enabling fastest agent integration.

* **Ship Continuous Boardroom v1 \-**  moving from one-shot pre-engagement red-team to monthly automated rescores during the 6–12 month prep period, with sub-score regression alerts.

* Established first paid pilot with one SBA lender, currently in early talks with Live Oak Bank

* Complete Delaware C-corp incorporation, foreign-qualify in NJ, assign existing client contracts to corp, execute founder vesting with 83(b) elections.

**Capital required:** $1k \- $15K (legal costs for incorporation and brokerage agreement cleanup) Agent infrastructure and software costs. Self-funded from current revenue.

**Revenue projection:** $45K–$60K cumulative through end of Q2 (vs. $35K today, with current month-over-month growth of 2.7 \- 3x off a small base).

## **Q3 2026 (August \- October)**

**Milestones:**

* **First closed brokered deal.** Median Main Street time-to-close is 6–9 months from engagement-start, so the earliest engagements signed in late March/April 2026 reach the close window in Q3. Target: 2 closed deals.

* **Launch Lender Ops Agent v2** — direct integration with Live Oak's portal and one other PLP lender's LOS. Agents submit lender packages, track status, and respond to clarification requests in real lender systems with one-click human approval.

* **Ship Lender SKU v1** — first paid annual subscription giving a named SBA loan officer cohort priority access to certified deal flow. Target: 1 paid lender contract.

* **Sign 5–10 CPA partnership agreements** in NJ/NYC. White-label ExitIQ at \[firm\].scorta.app with per-partner branding.

* Reach **25 cumulative paid Diagnostic engagements** across the three verticals.

* Hire **Head of Deal Operations** (IBBA-credentialed, 10+ years experience, 50+ closed deals). Trust signal to sellers, conscience on diligence calls, hands-on closing manager.

**Capital required:** $400K–$600K. Allocates to one senior hire ($180K loaded), GTM/distribution (CPA pilot incentives, conference presence, content), agent-stack productionizing, legal counsel buildout ($25–50K), and \~6 months runway for the founder team.

**Revenue projection:** $150K–$200K cumulative through end of Q3 (Diagnostic revenue compounding \+ first brokerage success fees beginning to close).

## **Q4 2026 (November \- January 2027\)**

**Milestones:**

* **5–8 cumulative closed brokered deals.** Each at average \~$55K combined revenue (Diagnostic \+ 5% success fee on \~$1M average deal value).

* **Ship War Room v1** — diligence command center for live deals: inquiry triage, NDA workflow, agent-drafted founder-approved Q\&A, document vault hygiene, live pipeline view.

* **Ship Lender Desk v1** — real-time status indicators against each partner lender's underwriting criteria as the business is improved through the prep cycle.

* **First Scorta Score referenced by name** in at least one NJ SBA lender's pre-qual checklist. This is the leading indicator that the protocol is taking hold.

* Hire **senior growth engineer** to further productionize the agent stack further. Target: drop human cost per engagement from 80% to 60% of total time-on-deal.

* Reach **50 cumulative paid Diagnostic engagements**, the threshold at which close-rate data becomes statistically meaningful and the agent-loop reinforcement compounds visibly.

**Capital required:** $500K–$800K. Second senior hire ($150K loaded), continued GTM investment, expanded agent infrastructure, and runway extension.

**Revenue projection:** $400K–$600K cumulative through end of Q4 (the first material brokerage closes contributing).

## **Q1 2027 (February–April)**

**Milestones:**

* **10+ cumulative closed brokered deals.** This is the Phase 1 gate to Phase 2 investment.

* **Close-rate analysis published at deal 50** \- the key falsifiable test of our thesis. If certified deals close materially above the 20% Main Street baseline, the certification has provable value and we accelerate. If not, we pivot.

* **Ship CPA SKU v1** — paid per-seat license for tax-and-advisory firms to run Scorta Diagnostic on existing clients with co-branded delivery. Target: 5 paid CPA seats.

* Begin scoping geographic expansion to a second metro (most likely candidate: Boston or DC corridor based on density and demographics).

* **3+ paid SBA lender contracts** signed.

* Begin scoping the Diligence Intelligence subscription product — the deal-process dataset productized as research, sold to CPAs, independent sponsors, and SBA lenders.

**Capital required:** $600K–$1M. Hire 3rd Deal Operations support (junior, agent-supervised), continued growth engineering, second metro entry costs, modest sales investment for lender expansion.

**Revenue projection:** $800K–$1.2M cumulative through the end of Q1 2027\.

## **Supplier and Infrastructure Partnerships**

We have no exclusive supplier dependencies in the traditional sense. Key infrastructure stack:

* **AI:** Anthropic (Claude Opus 4.7 for reasoning, Claude Haiku & Sonnet) for high-volume parsing). Failover provider in development for redundancy.

* **Data ingestion:** QuickBooks Online, Stripe, Gusto, Square, Toast, Plaid (bank feeds), HubSpot. Document parsing via LlamaParse or Unstructured.

* **Database and auth:** Supabase (Postgres \+ RLS \+ Auth).

* **Hosting and deployment:** Vercel.

* **Lender portals:** No direct API integration today — Lender Ops Agent operates via authenticated browser sessions with full audit logging. Direct API partnerships with Live Oak and Pursuit Bank are Q3 2026 priorities.

* **Listing platforms:** BizBuySell, Acquire.com.

**Strategic partnership priorities (no signed agreements yet, in active development):**

* **Live Oak Bank** (largest SBA 7(a) lender, $1.37B Q1 2026 production). Loan officer relationship mapped; partnership pilot targeted Q3 2026\.

* **2–3 mid-size CPA firms** in NJ/NYC for white-label ExitIQ. Conversations active.

* **A regional QofE firm** for back-end diligence outsourcing on larger deals. Conversation stage.

## **Proprietary and Defensible Assets**

The defensibility is structural, built from four reinforcing components rather than a single moat:

**1\. The Unstructured Deal-Process Dataset.** Every engagement produces structured records of buyer objections, lender concerns, financial recast deltas, diligence breaks, and remediation paths — data that currently lives unstructured in PDFs and email threads across thousands of small broker shops and has never been aggregated. We are the only player paid to capture this systematically at the pre-market stage. BizBuySell has closed-deal comps. We have connective tissue. **Patterns we see twice become checklists. Patterns we see ten times become agents.** The services layer is the data acquisition channel for the infrastructure layer.

**2\. The Agent Stack.** A coordinated fleet of 8 specialized agents (Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom multi-persona, Lender Ops, Outreach) with deterministic financial math in code, narrative reasoning via LLM, provenance tracking on every claim, and human approval gates on every material action. The Case Manager Agent is the operational backbone — it runs deal state machines across dozens of concurrent engagements, dispatches specialized agents on blockers, manages SLA windows, and is what enables the **20-deals-per-operator** unit economy vs. the industry average of 4–6.

**3\. The Scorta Score.** A public, methodology-transparent, letter-graded certification of pre-market readiness built from 7 sub-scores (Financial Defensibility, Owner Independence, Customer Concentration, SBA Lendability, Operational & Legal Cleanliness, Market Position, Transferability). Once SBA lenders and CPAs reference this by name in their pre-qual workflows — the leading indicator we're tracking — the protocol becomes the standard, not the product. The FICO / Carfax / SOC 2 analog.

**4\. Three-Sided Revenue Architecture.** SBA lenders subscribe to certified deal flow → pull sellers and CPAs to us. CPAs license the Diagnostic for existing clients → pull sellers to us. Sellers come because the gatekeeper (the lender) is asking for the certification. This is structurally different from one-sided marketplaces (Baton), one-sided bankers (OffDeal), and one-sided traditional brokers (Sunbelt). Every side's demand pulls the others.

These four components reinforce each other. The agent stack makes the data capture economical. The data makes the agents better. The better agents enable 20-deals-per-operator economics. The close-rate proof from those deals is what gets SBA lenders to pay. A competitor must build all four simultaneously while we are already running the loop.