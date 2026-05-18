# Scorta — Company Ground Truth (v6)

> The trust protocol for Main Street M&A. Agent-native broker on the surface; pre-market underwriting and certification layer underneath, run end-to-end by a coordinated fleet of specialized agents with humans on the approval layer. Lenders pay for it. Capital-verified buyers ask for it. Sellers earn it. The dataset compounds with every certified deal.

This document is the consolidated source of truth for product, GTM, positioning, and external communications at Scorta. It is the foundation any accelerator application, pitch, investor memo, or hiring conversation should draw from. It is updated based on operating reality, not aspiration. **Last revision: May 16, 2026 (v6).** Supersedes v5.

**v6 changelog (May 16, 2026):**
- Reframed from "AI-native" to **"agent-native"** — coordinated fleet of specialized agents (Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom, Lender Ops, Outreach) with human approval gates, not a chat-with-LLM tool (Sections 0, 1, 6, 17)
- Added full agent architecture stack to Section 6 (Product Suite) and Section 17 (Technical Architecture) — every agent cluster mapped to function and human gate
- Added **Case Manager Agent** as the operational coordination backbone — the "20 deals per operator" lever (Section 6)
- Added **Lender Ops Agent** working in real SBA lender portals, VDRs, listing systems (Section 6)
- Added explicit outcome commitment: "SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid" (Sections 0, 1, 6)
- **Narrowed Phase 1 verticals (temporary): home services (HVAC, plumbing, electrical, lawn care, pool maintenance), restaurants and restaurant franchises, digital marketing and social media agencies.** Chosen for reproducible loops, clean integrations, fastest workflow embeddings. Explicit note: temporary as we expand share, products, brand (Section 11)
- Updated traction: **$35K revenue collected (March $3K, April $8K, May $24K), 9 paying customers (2 marketing agencies, 3 home services, 3 restaurants, 1 jewelry brand), split across central NJ and NYC** (Sections 2, 16)
- Added **first two brokerage success-fee agreements** signed with the marketing agencies, both SBA pre-qualed and ready for transition, at 5% success fee (Sections 2, 7, 8)
- Updated pricing: confirmed 5% success fee as Phase 1 brokerage rate against marketing agency cohort
- v5 was: Scope16 prior exit; unstructured deal-process dataset moat; ExitIQ multi-stage adaptive LLM with GAP Report; Puneet's FDE + Claims Concierge bio; "no one owns the prep layer" framing; AI-native architecture intro (all retained)

The check we use to evaluate any product, hiring, or go-to-market decision: *does this make Scorta more like the trust protocol for Main Street M&A in the NJ/NY/CT corridor, or less?* If less, we don't ship it.

---

## Table of Contents

0. [TL;DR — The Three Things to Internalize](#0-tldr--the-three-things-to-internalize)
1. [What Scorta Is](#1-what-scorta-is)
2. [Company Snapshot](#2-company-snapshot)
3. [The Problem](#3-the-problem)
4. [The Insight Competitors Missed](#4-the-insight-competitors-missed)
5. [Why Now](#5-why-now)
6. [Product Suite](#6-product-suite)
7. [The Three-Sided Revenue Model](#7-the-three-sided-revenue-model)
8. [Pricing & Customer Arc](#8-pricing--customer-arc)
9. [The Moats](#9-the-moats)
10. [Distribution Strategy](#10-distribution-strategy)
11. [Market Wedge — Geography, Segment, Verticals](#11-market-wedge--geography-segment-verticals)
12. [Competitive Landscape](#12-competitive-landscape)
13. [Founder-Market Fit](#13-foundermarket-fit)
14. [The Phased Plan](#14-the-phased-plan)
15. [The Five Strategic Sharpenings](#15-the-five-strategic-sharpenings)
16. [Phase 1 Success Criteria & Operating Plan](#16-phase-1-success-criteria--operating-plan)
17. [Technical Architecture](#17-technical-architecture)
18. [Capital Use](#18-capital-use)
19. [Human Approval Boundaries](#19-human-approval-boundaries)
20. [Known Gaps and Risks](#20-known-gaps-and-risks)
21. [Operating Principles](#21-operating-principles)
22. [Market Data & Source Inventory](#22-market-data--source-inventory)
23. [The Napkin Pitch](#23-the-napkin-pitch)
24. [Investor Pushback — Q&A Category Map](#24-investor-pushback--qa-category-map)

---

## 0. TL;DR — The Three Things to Internalize

1. **Scorta is not an AI tool for brokers. Scorta is the underwriter, prep shop, and broker-of-record — run end-to-end by a coordinated fleet of specialized agents (Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom, Lender Ops, Outreach) with humans on the approval layer.** We take a sub-$2M Main Street business from raw books to "SBA-funded, buyer-closed" — owning every step of underwriting, prep, remediation, and brokerage through a small human approval layer on top of an agent-driven operations stack. **Our outcome commitment: SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid.** Baton is a marketplace, OffDeal is an AI investment bank for the $5M+ revenue band, Iconic is a tech-enabled advisory platform serving up to $100M revenue. None of them owns the "is this business actually sellable, and if not, what would make it sellable?" layer. That is the unclaimed wedge — and "AI-native broker" is the wedge into the conversation, "agent-native operations stack" is the architecture.

2. **The defensible asset is not closed-deal comps. It is the structured, unstructured deal-process dataset — buyer objections, lender concerns, broker negotiations, diligence breaks, financial recasts, owner-dependency findings — captured during paid concierge engagements before businesses ever go to market.** BizBuySell already has the closed-deal comp set in vastly greater volume than we'll ever match. The public data is shallow: inputs (listing details) and outputs (sold / not sold, price). The valuable data — the lender concerns, buyer objections, broker interactions, and back-and-forth that actually determine outcomes — sits trapped in PDFs and emails, scattered across thousands of small-shop brokers, and remains unused. We are the only player paid to capture it systematically. **Patterns we see twice become checklists. Patterns we see ten times become agents.** The services layer is the data acquisition channel for the infrastructure layer. Boardroom is the objection-mining engine. Scorta Certified is the central product pillar — a public, methodology-transparent letter grade (the **Scorta Score**) that SBA lenders, CPAs, and buyers come to reference by name. The Carfax / SOC 2 analog.

3. **Capital deploys against (1) trusted-advisor distribution into CPAs, SBA lenders, and wealth advisors in the NJ/NY/CT corridor, (2) two senior hires — an IBBA-credentialed Head of Deal Operations and a senior growth engineer, (3) productionizing the deal-process data pipeline so concierge engagements get cheaper to run and the unstructured data captured becomes structured agent-ready inputs, and (4) buying down the first 25 closed deals to manufacture proof.** Legal counsel is a $25–50K routine line item, not a strategic moat — most states (including NJ) don't require business broker licensing absent real estate, and only ~17 do per the American Business Brokers Association. The framing remains distribution-first, infrastructure-first.

---

## 1. What Scorta Is

**At the core:** Scorta is a pre-market underwriting, remediation, and certification system that turns messy Main Street businesses into SBA-financeable, buyer-ready, Scorta-Certified assets — then brokers the sale through a process owned end-to-end by AI agents instead of PDFs and email.

**We are not an AI tool for brokers. We are the underwriter, prep shop, and broker-of-record for sub-$2M SMB exits.**

The agent-native part is not "chat with a bot." It is a coordinated fleet of specialized agents and pipelines that do the work a junior banker, underwriter, buyer panel, and deal coordinator would normally do — fed by a deal-process dataset Scorta is uniquely positioned to collect. **One human operator running Scorta manages what would otherwise require a team of four to six.** Target: 20+ concurrent exits per human deal lead vs. industry average of 4–6.

**Outcome commitment:** *SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid.*

**Today:** an agent-native broker that runs paid pre-market diagnostic engagements on Main Street businesses in the NJ/NY/NYC corridor and brokers the sale of those that earn certification. Revenue: concierge fees upfront + brokerage success fees on close.

**Tomorrow:** the **Scorta Score** — a published, letter-graded, methodology-transparent certification standard that SBA lenders pay subscription dollars to receive deal flow against, and that CPAs pay per-seat licenses to run on their existing books. The standard, not the broker.

**The long arc:** the underwriting and trust infrastructure for the entire Main Street transaction market. Brokers, lenders, buyers, and sellers all run on Scorta. The FICO / Carfax / SOC 2 analog — own the protocol, license it everywhere.

**The verbal frame:**

> *"We're an agent-native broker. Coordinated fleet of specialized agents — Ingestion, Recast, Owner-Dependency, Case Manager, Boardroom, Lender Ops, Outreach — running every step of underwriting, prep, and brokerage, with humans on the approval layer. We sit upstream of every existing player. We figure out why 70–80% of these businesses don't sell, fix it before they list, and only then take them to market."*

What we are building toward, over a decade: the underwriting and trust standard for every Main Street business sale in America. Not a tool brokers use. Not a marketplace owners list on. The standard the brokers, the lenders, the buyers, and the sellers all reference.

---

## 2. Company Snapshot

**Founders**

- **Suyash Agrawal — CEO.** Ex-Atlassian (Rovo growth, scaling AI-native product distribution into the SMB segment). Before Atlassian, ran operations at a micro-PE fund acquiring and operating Main Street businesses in the exact $500K–$2M EV range Scorta now serves. Personally has been on the buy side of the deals Scorta intermediates — knows what a clean diligence package looks like, what an SBA underwriter cares about, what a search fund will and won't tolerate.
- **Puneet Gupta — CTO.** One of the **first Forward Deployed Engineers at Travelers Insurance**, where he built and scaled **Claims Concierge** — an AI workflow platform that grew to **200+ insurance carriers, 8,500 monthly active users, and 2.8M invocations in 6 months**, with platform cache hit rate improved from ~30% to ~87%. The closest functional analog to what Scorta automates: structured-document, judgment-heavy underwriting work, in production, at enterprise scale. Before Travelers, **Founding Engineer at Ray Business Technologies**, where he built an AP document-ingestion platform from zero — 10+ concurrent jobs with 99%+ creation reliability, <500ms real-time status latency, <300ms search across 10K docs, and 95%+ three-way match accuracy.
- **Founder-founder fit:** Suyash and Puneet met in high school and have been working together for 10 years. Previously **built and sold Scope16 Marketing**, an agency serving Main Street businesses that reached **$100K MRR before exit.** Scope16's paying customers were Main Street businesses — the exact demographic Scorta sells to today. The team has shipped together, found product-market fit together, scaled revenue together, and exited together once already. They are not learning the customer, the workflow, or each other.

**Stage**

- Launched end of March 2026
- **9 paying customers, $35,000 collected in ~7 weeks** (March $3K, April $8K, May $24K — revenue growth: 2.7x → 3x month-over-month)
- **Customer mix:** 2 digital marketing/social media agencies, 3 home services, 3 restaurants, 1 jewelry brand. Geography: central NJ and NYC.
- **First two brokerage agreements signed** (with both marketing agencies). Both SBA pre-qualed and ready for transition. **5% success fee** on close.
- Revenue to date strictly from pre-market exit prep (Diagnostic engagements); brokerage success fees are pipeline, not collected
- 100% inbound, zero paid acquisition
- **Why marketing agencies first to brokerage agreement:** mostly digital businesses with remote work, easiest workflows to integrate with the Scorta agent stack. Reproducible loops emerged fastest.
- Zero closed brokered sales yet (median Main Street time-to-close is 6–9 months per IBBA Q3 2025 Market Pulse, so absence of closes at week 7 is structural, not signal)
- Two-founder team, no other full-time employees

**The four core products today**

- **ExitIQ** — free conversational assessment (6 minutes), feeds the funnel and the dataset
- **Diagnostic / Scorta Score Engagement** — paid pre-market underwriting deliverable (recast financials, owner-dependency map, customer concentration analysis, SBA pre-qual, top-15 buyer objections pre-written, published Scorta Score)
- **The Boardroom** — AI red-team simulating the buyer panel, SBA underwriter, and QofE firm; the objection-mining engine that feeds the deal-process dataset
- **Brokerage** — listing, marketing, capital-verified buyer outreach, close coordination

**Raise plan**

- Applying to YC Summer 2026 and ERA Round 2 in parallel
- If accepted: accelerator capital + intro network for distribution and senior hires
- If not: small pre-seed ($500K–$1M) in Q3 2026 from operator-investors with SMB / services backgrounds

---

## 3. The Problem

**The wave.** Per Gallup's March 2025 analysis of US Census data: **52.3% of US employer firms** — roughly 3M of nearly 6M — **are owned by people aged 55+**, and **74% of those owners plan to sell or transfer ownership** over the long term. Project Equity counts 2.9M US businesses with owners 55+, supporting 32.1M employees, $1.3T in payroll, and $6.5T in revenue. The Exit Planning Institute estimates a **$14T transition opportunity** over the next decade.

**The dysfunction.** **70–80% of small business listings never sell.** That's broker-association consensus aligned with Worldwide Business Brokers' analysis (~1 in 5.5 Main Street businesses sells) and BizBuySell's 6.46% median listing-to-close rate 2018–2022 (Teamshares analysis). The owner loses a year. The broker loses six months of work. The community loses the business.

**Why deals die — what the failure modes actually are.** Per Axial's 2025 Dead Deal Report, **21.3% of post-LOI failures in 2025 were Quality-of-Earnings / EBITDA discrepancies** — more than double the 10.6% rate in 2023. **78% of buyers walk on deals that lack three years of reviewed financials.** Other dominant failure modes: owner-dependency that buyers can't underwrite, customer-concentration risk, financials that don't pass SBA underwriting, no clean tax-return trail, no contracts in place, environmental or licensing flags, lease-assignment risk.

**The three options Main Street owners have today, and why each fails:**

- **Hire a traditional broker** (Sunbelt, Murphy, Transworld, regional shops). 8–15% commission per BizBuySell norms. Brokers cherry-pick deals over $2M and "list and pray" on smaller ones. Process runs on PDFs and email. Quality variance is enormous across franchisees. No pre-market diagnostic — the broker takes the listing because they get paid for taking the listing, not for telling the owner the truth about whether to list.
- **List on a marketplace** (BizBuySell, BizQuest, Baton, Acquire.com). Marketplaces don't prep the seller, qualify the buyer, or run the transaction. Most listings sit and rot. BizBuySell explicitly states it is "a marketing platform... not a brokerage firm."
- **Try to sell it themselves.** Almost never works. They don't know what to ask for, what to share, how to qualify a buyer, or how to get to close.

**The structural gap that creates the wedge. No one owns the prep layer.** Brokers list and market. Marketplaces host. Nobody systematically fixes the financials, operations, lendability, and 15 other things buyers flag during diligence. Every existing player makes money on listings or closes. None gets paid to do the work that determines whether the deal happens at all. **Scorta is the fourth option: we run the pre-market prep work no one else is paid to do — recasting financials, mapping owner dependency, surfacing concentration risk, pre-clearing SBA underwriting — then publish a methodology-transparent grade and broker the certified business.** That includes the honest "you should not list, here's what to fix first" memo when the work surfaces unfixable issues.

**The buyer side is also broken.** Search funders, ETA buyers, micro-PE, family offices, and strategic acquirers waste months on underprepared listings. They lose deals that die in SBA underwriting because nobody set them up to be financeable. They are the scarce side of the market — Citrin Cooperman's 2025 Independent Sponsor Report finds 74% of independent sponsors source deals from business brokers, meaning the buyer side is starved for vetted, broker-sourced deal flow. We aggregate them.

**The market-size impact of fixing this.** The 20% Main Street close rate is not an immutable ceiling — the failure modes are systematic, not random. If a pre-market certification layer moves the close rate to 30–40%, the incremental transaction value unlocked annually runs into the tens of billions of dollars. Even at a 5% take-rate equivalent across the full Scorta stack (broker fee, certification fee, lender referral, embedded escrow), each percentage-point improvement in close rate translates directly into a larger addressable revenue surface. The $14T transition opportunity is not just a wave to ride — it roughly doubles in value if the close rate doubles.

---

## 4. The Insight Competitors Missed

Three well-funded players sit in this space. Each is solving a different problem than the one that actually keeps Main Street owners stuck.

- **Baton built a marketplace.** Their thesis is that transparent listings + AI-driven valuations + a data room let sellers and buyers connect faster. True for businesses that are already ready to sell. Their advertised 70% close rate is a survivorship metric — measured on listings Baton accepted, not on the funnel of owners who approached. The 70% of owners whose businesses won't close are invisible to them, and they cannot afford to charge for honest diagnostic without cannibalizing their free-valuation wedge.
- **OffDeal built an AI-native investment bank.** Floor is $5–10M+ revenue, $1–10M EBITDA — an order of magnitude above where Scorta plays. Radical Ventures' Ryan Shannon (lead investor) has publicly said *"the unit economics don't stretch to the long tail of the market."* They are not coming down to a $700K HVAC business in Bergen County.
- **Iconic built a tech-enabled M&A advisory platform.** Acquired Integral Capital Advisors in September 2024 to bring in execution capacity. Stated client size: up to $100M revenue. Same problem — upstream of us in deal size.

So you have three well-funded players: one marketplace, one investment bank, one advisory platform. **None of them owns the question that actually determines whether a Main Street business closes: *is this business sellable, and if not, what would make it sellable?*** That question costs each of them money to ask — if Baton answered it honestly they'd reject most listings and lose marketplace inventory; if OffDeal answered it at our segment they wouldn't have a business model at our segment; Iconic's center of gravity is too far upstream.

**Scorta is the pre-market underwriting and certification layer that sits upstream of all three of them.** We are paid to ask the question they can't afford to ask. Architecture beats roadmap — the closest historical analog is Carvana versus the dealers, or what happened to Zillow when it tried to become an iBuyer (different company, different cost structure, failed at billions of dollars of cost).

---

## 5. Why Now

Six things converged. This is a 2026 company, not a 2022 one and not a 2028 one.

1. **Demographic.** Gallup March 2025: 52.3% of US employer firms owned by 55+, 74% planning to sell/transfer. Project Equity: 2.9M businesses, 32.1M employees, $1.3T payroll. EPI: $14T transition opportunity over the next decade. The wave is now, not in 10 years.

2. **Capital on the buy-side.** SBA 7(a) volume at all-time highs. **Live Oak Bank alone reported $1.37B in Q1 2026 loan production.** Stanford GSB's 2024 Search Fund Study reported a **record 94 new search funds launched in 2023, with 35.1% aggregate IRR**. The buy-side has never had this much dry powder chasing sub-$5M Main Street targets. The bottleneck is supply quality, not capital.

3. **AI capability.** The pre-market underwriting work — recasting financials the way an SBA underwriter would, mapping owner dependency, surfacing customer-concentration risk, running structured buyer-objection red-teams — was uneconomic to do at our segment before LLMs got reliable enough. Hebbia reports **92% extraction accuracy on complex financial/legal documents** (vs. 68% baseline RAG); Keye claims deterministic 100% extraction across PE diligence workflows. Frontier reasoning models with deterministic guardrails arrived in 2025. Two years ago this product was not buildable.

4. **Regulatory tailwind — SOP 50 10 8.** Effective **June 1, 2025**, the SBA's updated Standard Operating Procedure explicitly permits CPA-prepared or CPA-reviewed financials in lieu of tax returns for the first time. That creates a vacuum: lenders now need a *new* trust signal for non-tax-return financials. Whoever fills that vacuum with a standard owns the corridor. Live Oak Bank's Q1 2026 earnings explicitly cited SOP 50 10 8 as a drag on production volume — every PLP lender in the NJ/NY corridor is feeling this pain in real numbers right now.

5. **Competitive validation.** Baton raised $10M Series A in January 2025 from Obvious Ventures. OffDeal raised $12M Series A in July 2025 from Radical Ventures at a ~$100M valuation. Tier-1 capital has validated the market. The opening they missed — the segment below them, with a pre-market diagnostic layer — is precisely where Scorta is built.

6. **RWI reaching down to $25M.** Representations & Warranties Insurance — historically a middle-market tool — now has "streamlined small deal products" emerging for transactions as small as $25M EV. As RWI commoditizes buyer-side diligence at larger deal sizes, the pressure ripples downstream into sub-$5M Main Street: buyers and lenders increasingly expect defensible, benchmarked underwriting packages at every tier. There is a closing window to establish Scorta's deal-process dataset as the default trust standard before the RWI market fully absorbs the Main Street segment.

If we were pitching this in 2022, we'd be too early. If we wait until 2028, the segment gets crowded. Now is the window.

---

## 6. Product Suite

### 6.0 The Agent Architecture — How Scorta Actually Works

**Scorta is not "AI features sprinkled on a broker workflow." It is a coordinated fleet of specialized agents that own every step of pre-market underwriting, remediation, and brokerage — with humans on the approval layer for every material action.** A traditional broker shop running a deal in 2026 has a junior banker manually doing recasts in Excel, a partner emailing buyers, an analyst chasing missing docs, an assistant scheduling calls, a coordinator updating the VDR. Scorta has agents doing all of that, running across dozens of concurrent deals, never dropping context. One human operator runs what would otherwise need a team of 4–6.

**The full agent stack (Phase 1, in production today):**

| Agent Cluster | Function | Human Gate |
|---|---|---|
| **Ingestion Agent** | Connects to seller systems (QuickBooks, Gusto, Stripe, POS, CRM, bank feeds); classifies and extracts financial, payroll, contract, lease docs; structures into Scorta's internal data model | Upload review |
| **Recast Agent Pipeline** | SBA-style P&L recast — deterministic rules handle the math + SOP 50 10 8 constraints; LLM writes the add-back narrative explaining why each adjustment is defensible | Approval before publish |
| **Owner-Dependency Agent** | Scores replaceability via questionnaires, usage data, org chart ingestion; generates prioritized SOP / documentation remediation tasks | Review of task plan |
| **Concentration Agent** | Flags top-1/top-5/top-10 customer risk, missing contracts, churn signals; generates contract-tightening playbook | Review of task plan |
| **Case Manager Agent** | The coordination backbone. Watches every deal's state machine in real time. Identifies blockers, dispatches specialized agents, sends structured nudges to sellers/lenders/buyers, manages calendar, escalates stale threads. **This is the "20 deals per operator" lever.** | Exception escalation |
| **Boardroom** | Multi-persona buyer red-team (Searcher / Strategic / Operator / SBA Underwriter / QofE Firm). Each persona runs independent reasoning loops to produce a valuation range, deal structure, walk-conditions, and 20–40 ranked objections. Outputs become **work orders** dispatched to downstream agents — not a dashboard. | LOI structure review |
| **Recast Agent (Boardroom-fed)** | Hardens add-back narrative based on Boardroom objections — closes specific holes a buyer or QofE would exploit | Approval before publish |
| **Lender Ops Agent** | Logs into SBA lender portals and fintech LOS systems, uploads lender packages, tracks submission status, responds to lender info requests. Manages VDRs, gates buyer access by qualification tier. Posts and updates marketplace listings (BizBuySell, Acquire.com). | Approve before external action |
| **Outreach Agent** | Acts on Boardroom buyer-segment recommendations. Runs personalized email + CRM + call-scheduling sequences to capital-verified buyers at volume no junior broker can match. | Strategy approval |

**The Case Manager Agent is the unsung hero.** Traditional M&A processes die in the gaps — missing seller doc, open lender clarification, stale buyer thread. The Case Manager Agent never drops a thread. It dispatches the right agent or human at the right time, logs every action with timestamps and named approvers, and runs across dozens of concurrent deals. This is operationally what "agent-native" actually means.

**The human approval layer is a feature, not a limitation.** Every material action — every valuation claim, every add-back, every lender submission, every LOI term, every buyer communication — is staged for one-click human approval before execution. The approving operator's name, timestamp, and decision are logged permanently. The rule: **agents run the work, humans own the risk.** Every material action has a named human signatory and a permanent audit log. This is how we operate as a licensed, regulated, fiduciary-responsible brokerage while moving at agent speed.

**Outcome commitment:** *SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid.*

**What's downstream of 6.0:** Sections 6.1 through 6.9 below describe the customer-facing products (ExitIQ, Scorta Score, Diagnostic, Brokerage, Buyer Network, Lender/CPA SKUs, Diligence Intelligence). Each is **powered by the agent stack above**. The agent stack is the architecture; the products are the surfaces it presents.

---

### 6.1 ExitIQ — Intelligent Multi-Stage LLM Assessment

Not a form. A **conversational diagnostic that adapts in real time** — each answer determines the next question, surfacing the issues that actually matter for *this* business rather than running everyone through the same checklist. Save-and-resume, email captured at section 2. The output is the **GAP Report**, a deliverable owners cannot get anywhere else for free:

- **Valuation across multiple methods** (SDE multiple, EBITDA multiple, asset-based, DCF where applicable), with explicit reasoning for each method
- **Business summary** in the format an SBA underwriter or QofE firm would recognize
- **Critical gaps from a buyer's standpoint** — the diligence breaks that would kill the deal
- **Buyer-type matching** — which archetypes (search funds, strategic acquirers, family offices, individual ETA, micro-PE) would actually be interested, and why
- **Lendability roadmap** — what it would take to make this business SBA-financeable
- **90-day improvement checklist** — prioritized, prescriptive, tied directly to valuation uplift and close-probability uplift

Single CTA at the bottom: book a 30-minute founder call.

The aesthetic is investment-bank microsite, not SaaS landing page. The loading state during generation narrates the work ("*Pulling 47 comparable sales in HVAC in NJ/NY metro... Running your numbers against 6 SBA lender underwriting models... Convening The Boardroom...*"). Most assessment tools throw up a spinner; we narrate the work because the work is the product.

**Why this matters for the funnel and the moat.** ExitIQ is the only place in the funnel where a prospective seller sees the product *before paying*. The GAP Report is what converts. It's also a defensible artifact — competitors can copy a form, they can't copy a 90-day prescriptive checklist tied to a methodology-transparent grade, generated by an adaptive assessment that learns from every prior engagement.

### 6.2 The Scorta Score — The Central Product Pillar

A **public, methodology-transparent, letter-graded** (A through D) certification of pre-market readiness, built from **7 sub-scores**. Each sub-score maps to a documented reason Main Street deals die. Each carries a defined remediation playbook. The composite Scorta Score is what an SBA lender sees in their pre-qual checklist; the sub-score breakdown is what the seller and their CPA work against to lift the grade in 90 days.

**The 7 sub-scores:**

1. **Financial Defensibility** — Will the numbers survive an SBA underwriter and a QofE firm? Quality and consistency of books (cash vs. accrual, GAAP-adjacent vs. shoebox), recast confidence (clean bridge from tax returns to operating EBITDA), audit-readiness (three years of reviewed financials reconciled), add-back defensibility (owner perks, one-time items, related-party transactions documented), tax-return-to-P&L alignment. *Why it's #1: Axial 2025 — 21.3% of post-LOI failures are QofE/EBITDA discrepancies, doubled from 10.6% in 2023.*

2. **Owner Independence** — Can the business operate without the seller for 90 days? Key-person dependency (sales relationships, technical knowledge, vendor relationships), management depth below the owner, documented SOPs and operational handoff readiness, owner's weekly hours and what they do during those hours, transition-period risk.

3. **Customer Concentration & Revenue Quality** — How fragile is the revenue? Top-10 customer concentration (% of revenue), contract vs. handshake revenue (recurring contracts, MSAs, POs in place), customer tenure and churn patterns, revenue diversification across segments / verticals / geographies, project vs. recurring revenue mix. *SBA lenders flag concentration above 20–25% as credit risk.*

4. **SBA Lendability** — Will an SBA 7(a) lender finance this deal? Cash-flow coverage ratio (DSCR) at projected debt service, industry SBA eligibility and red flags, personal-guarantee dynamics and seller financing posture, real estate vs. lease (lease assignment risk), licensing / environmental / regulatory clearances, pre-screen against 6+ active PLP lender underwriting models (Live Oak, Pursuit, Cross River, Byline, etc.). *SOP 50 10 8 changed the rules in June 2025; lendability now requires a new trust signal.*

5. **Operational & Legal Cleanliness** — What skeletons surface during diligence? Contracts in place (vendor, customer, employee, lease), IP ownership clarity, employee classification (W-2 vs. 1099 exposure), lease assignment / change-of-control provisions, pending litigation / judgments / liens, environmental flags (especially HVAC, auto, dry cleaning, manufacturing), licensing — current, transferable, in the right entity.

6. **Market Position & Defensibility** — Is there a business here, or just a job the owner created? Competitive moat (geographic, contractual, technical, brand), market growth or contraction in the local geography, pricing power and gross margin trend, barriers to entry, comparable business performance benchmarks. *Buyers underwrite future cash flows, not past. A profitable business in a dying market is not saleable.*

7. **Transferability & Transition Readiness** — Can ownership actually change hands without breaking the business? Goodwill transferability (does the value walk out with the owner), vendor and supplier transition risk, key employee retention probability post-close, customer transition risk (especially relationship-driven businesses), training and transition period structure, brand vs. owner-identity entanglement ("Joe's Plumbing" run by Joe).

**Composite scoring.** Each sub-score: A / B / C / D. Composite Scorta Score: A / B / C / D (weighted; weights published in the methodology paper). Lender-ready threshold: B or higher composite, with no individual sub-score below C. Remediation playbook attached to every sub-score below A — the 90-day checklist in the ExitIQ GAP Report is the first instantiation.

*Weighting note: v1 ships equal-weighted; weights will be calibrated against close-rate outcomes by deal 50.*

**Methodology is published.** Sellers see their preview grade before they engage. CPAs and SBA lenders can request a Scorta Score on a borrower as part of pre-screening.

**The Scorta Score replaces "30-day exit ready" — which was always implausible to anyone who has touched a Main Street book — with a specific, measurable, deliverable commitment:**

> *"We will publish your Scorta Score within 14 business days of engagement, with a written remediation plan and a written commitment to lift you one full grade within 90 days, or you keep the score and we refund the concierge fee."*

This is the FICO move. Own the protocol, not the product. Comparable analogs: FICO (productized credit), CARFAX (vehicle history protocol), SOC 2 / Drata / Vanta (audit standards turned into compliance infrastructure), Trustpilot.

### 6.3 The Boardroom — Multi-Persona Buyer Red-Team and Work-Order Engine

The Boardroom is **not a wow demo and not a simulation dashboard.** It is the structured red-team that simulates the **buyer panel, the SBA underwriter, and the QofE firm** — every objection a seller will face, before they face it. Every Boardroom session is a data-collection event that adds rows to the deal-process dataset. **It produces actionable work orders that get dispatched to downstream specialized agents — not a report a human reads and acts on.**

**Three buyer-agent personas (v1, expand later):**

- **The Searcher / SBA-Backed Operator** (renders first — most representative of likely buyer in $500K–$2M EV band). Solo searcher, SBA 7(a) financing, looking for one business to operate. Reasons through debt service coverage, SBA eligibility, operator-replaceability. Pricing logic: market multiples (3.0x–3.8x SDE), 10–15% seller note. Walk-aways: cannot get SBA approval, owner can't be replaced for under $120K, DSCR < 1.5.
- **The Search Fund Buyer / Strategic** (multi-state vertical roll-up, PE-backed). Reasons through management transition risk, recurring revenue quality, deal structure flexibility. Top-of-market pricing (4.5x–5.5x SDE) for quality fit, structures include earn-outs tied to retention. Walk-aways: >40% customer concentration, no contracts, owner is the entire sales engine.
- **The Micro-PE Buyer / Operator** (family office or independent sponsor, all-cash, low-volatility industries). Reasons through platform fit, add-on potential, multiple arbitrage. Below-market pricing (2.8x–3.5x SDE) but cash and certainty. Walk-aways: cyclical industries, declining trends, customer concentration > 25%.

Each persona is **its own agent** — with its own context, objection library, and valuation heuristics — running multi-step reasoning loops independently.

**Each persona produces structured output:**

- A valuation range and deal structure (cash %, seller note %, earn-out %)
- A *"would proceed to LOI / would not"* verdict with explicit conditions
- 20–40 objections ranked by severity (deal-breaker vs. negotiation point)

**Boardroom outputs become work orders dispatched to downstream agents — not acted on by the Boardroom itself:**

- **Objections flagged as remediation tasks** → dispatched to the Owner-Dependency Agent and Concentration Agent, which generate fix plans
- **Recast narrative risks flagged by a persona** → handed to the Recast Agent (Boardroom-fed) to revise and harden the add-back story
- **Target buyer segment identified by each persona** → passed to the Outreach Agent, which generates personalized sequences and executes outreach to capital-verified buyers in Scorta's network
- **LOI structure logic from each persona** → surfaced to the human deal lead for approval before any buyer communication reflects it

The seller gets a red-team view of their own deal before a real buyer ever sees it — and the system has already started fixing the problems.

**The Boardroom evolves from one-shot to continuous (the Drata move).** Phase 1: a one-time pre-engagement red team. Phase 2: monthly automated rescores throughout the 6–12 month prep period, with alerts when sub-scores regress, plus quarterly human-in-the-loop intensives. Like the difference between SOC 2 Type I (snapshot) and SOC 2 Type II (operating effectiveness over time). Buyers will pay more for Type-II-equivalent businesses — and the longitudinal deal-process dataset becomes the single most defensible AI asset in Main Street M&A.

**Disclaimers.** Every Boardroom output carries prominent language: *"This is a simulation based on real buyer archetypes. These are not actual offers. Actual buyer offers may differ materially."* This is honest, not just legal hygiene.

**The Living Comp Card.** Below each persona's offer, anonymized real comps are surfaced: *"The Searcher's $1.4M offer is in line with these 3 recent sales..."* Every closed deal Scorta runs becomes a future comp. The flywheel becomes visible to the user.

**What's truly agent-native here.** The Boardroom is an AI investment committee that produces actionable work orders, not a simulation dashboard. Every output has a downstream agent or human approval waiting to receive it. **This is the architecture VCs miss when they look at "AI brokers" and see chatbots.**

### 6.4 Diagnostic / Concierge Engagement — The Paid Deliverable

The full pre-market engagement that produces a Scorta Score. **This is the explicit "prep stack" traditional brokers don't have. Every step is a productized, agentic workflow. Agents prepare and propose; humans approve before any material action.**

**Step-by-step components (each backed by a named agent or pipeline):**

1. **Data ingestion and normalization** — Ingestion Agent pulls structured data from QuickBooks, Gusto, Stripe, POS, CRM, and bank feeds. Where integrations don't exist, sellers upload documents and the Ingestion Agent classifies and extracts structured fields (chart of accounts, transaction buckets, contract terms) into Scorta's internal data model. *Document-understanding agents replace manual Excel keystrokes — no human hours spent normalizing data.*
2. **SBA-style recast and financial defensibility** — Recast Agent Pipeline performs SBA-style P&L recasts: normalizes owner comp, add-backs, one-time items, cleans the EBITDA story to match how an SBA underwriter or QofE firm will rebuild it. Deterministic rules handle math and SOP 50 10 8 constraints. LLM writes the narrative explaining why each adjustment is justified and which add-backs are likely to be accepted or rejected. Every recast is staged for human approval before publish or share. *Hybrid architecture — exact calculations in code, explanation and edge-case reasoning via LLM. Lender-defensible because numbers are deterministic, story is consistent with SBA logic, every representation has a named human signatory.*
3. **Owner-dependency mapping** — Owner-Dependency Agent scores replaceability from structured questionnaires, usage data, and org-chart ingestion. Identifies undocumented key processes and generates a prioritized SOP-and-handoff remediation playbook.
4. **Customer-concentration analysis** — Concentration Agent flags top-1/top-5/top-10 exposure, missing contracts, churn risk; generates a prioritized contract-tightening and diversification playbook.
5. **SBA pre-qualification eligibility memo** — pre-screened against Live Oak and 1–2 other PLP lenders' criteria. Live ✅/⚠️/❌ status per lender; lendable-or-not verdict with named remediation conditions.
6. **Multi-persona buyer red-team (The Boardroom)** — three buyer personas + SBA Underwriter agent + QofE Firm agent each independently reason through the deal and produce structured outputs (valuation, deal structure, walk conditions, 20–40 ranked objections). See Section 6.3.
7. **Top-15 buyer-objection book with pre-written responses** — Boardroom objections distilled into a written defense document, lender-and-buyer ready.
8. **The honest "list / don't list" memo** — the central truth-telling artifact. Founder-authored every time; not agent-generated.
9. **Lender package in SBA 7(a) pre-screen format** — Lender Ops Agent assembles the package, drafts the cover summary, and (post-approval) submits to lender portals on the seller's behalf.

**The Case Manager Agent runs the engagement end-to-end** — tracks blockers, dispatches the right specialized agent at the right time, sends seller and lender nudges, manages the calendar, escalates stale threads to the human deal lead.

**Why this matters versus what brokers do today.** A traditional broker delivers a teaser, a CIM in PDF, and an email to their contact list. We deliver an SBA-fundable, buyer-ready package with deterministic financial math, agent-generated remediation tasks already in progress, lender pre-clearance against six PLP models, and a buyer-objection defense built before any real buyer has seen the deal. Same word — "broker." Different product.

### 6.5 Scorta Certified — The Public Seal

The Scorta Score plus a public-facing certification report attached to the listing. Lender-ready, buyer-ready, NDA-gated as appropriate. Phase 2 goal: SBA lenders pre-qualify Scorta Certified businesses inside 48 hours (Live Oak already markets 24–48 hour pre-qual capability with "Speed is our weapon" as a tagline). Phase 3 goal: the certification becomes a licensable standard — other brokers, including Sunbelt and Transworld franchisees, can pay Scorta to certify their listings.

### 6.6 Brokerage — Listing, Buyer Outreach, Diligence, Close

Phase 1 brokerage is delivered through the **Lender Ops Agent**, the **Outreach Agent**, and the **Case Manager Agent** with founders on the human approval layer for every material action.

**The Lender Ops Agent cluster:**

- Logs into SBA lender portals and fintech LOS systems, uploads lender packages, tracks submission status, responds to lender info requests
- Creates and manages virtual data rooms, invites buyers, gates access based on qualification tier, and tracks which sections each buyer has reviewed
- Posts and updates listings on marketplaces (BizBuySell, Acquire.com), drafts responses to buyer Q&A in the seller's voice, and surfaces scheduling links for calls

Every action is **proposed by the agent and executed only after a human operator approves it.** Every executed action is logged.

**The Outreach Agent** runs personalized buyer outreach against Boardroom-recommended buyer segments — email, CRM follow-up, call scheduling — at volume and consistency no human junior broker can match. Human deal leads approve outreach strategy and review responses; agents handle cadence, follow-up timing, and pipeline tracking.

**Phase 2 enhancements:** the **War Room** (live diligence command center) and the **Lender Desk** (live SBA financeability across multiple lenders simultaneously) become explicit user surfaces. War Room handles inquiry triage, NDA workflow, diligence-question management with agent-drafted founder-approved responses, document vault hygiene, and live pipeline view. Lender Desk shows real-time ✅/⚠️/❌ status against each partner lender's criteria as the business is improved.

**Brokerage pricing (Phase 1):** 5% success fee on close. Materially cheaper than the 8–15% traditional brokers charge. First two agreements signed (both with the marketing agencies that started with the Diagnostic and are now SBA pre-qualed and ready for transition).

**What's agent-native here.** Our agents work with real lender portals, real VDRs, real listing systems — the same operational layer a broker's analyst would work in, running across dozens of deals at once with full audit trails. The human layer sets guardrails, approves material actions, and handles judgment calls. **This is the "20 deals per operator" lever** — a single Scorta operator runs what a traditional broker shop needs 4–6 people for.

### 6.7 The Scorta Buyer Network — Capital-Verified Buyer Pool

Pre-aggregated, gated buyer pool: search funders, ETA buyers, independent sponsors, micro-PE, family offices doing direct deals. Buyers apply, submit proof of capital (committed funds, search fund LP roster, family office attestation), and get tiered access to certified deal flow. **Capital-verified before they see deal flow** — different from Baton's open listing, different from Sunbelt's no-pre-vetting, different from OffDeal's $5M+ revenue floor.

**The promise to sellers:** *"Your business will receive its first qualified buyer call from a capital-verified Scorta Network buyer within 21 days of certification, and a signed LOI within 120 days from a buyer who has submitted proof of funds — or your concierge fee converts to a 12-month listing credit."*

The Buyer Network is the chicken-and-egg solver. We aggregate the scarce side (capital-verified Main Street buyers) first. Sellers come because the demand side is already there and paying.

### 6.8 Lender SKU and CPA SKU (Phase 2)

- **Lender SKU.** Annual subscription giving 1–3 named SBA loan officers per institution priority access to Scorta-Certified deal flow plus a borrower pre-screen tool that uses the Scorta Score. The SLA: *"A Scorta-Certified seller package will be in your lender's SBA 7(a) pre-screen format within 45 days of seller engagement — or the seller's concierge fee is refunded and the lender keeps the package."* Target: 5 paid lender contracts in 18 months.
- **CPA SKU.** Per-seat license for tax-and-advisory firms to run a Scorta "Exit Diagnostic" on existing clients. Co-branded delivery. Feeder for future seller conversions. Target: 20+ paid CPA seats in 18 months.

### 6.9 Diligence Intelligence (Phase 3–4)

The deal-process dataset productized. Every certified seller gets a Diligence Intelligence Report benchmarking them against 200+ comparable NJ/NY teardowns: *"47 NJ/NY HVAC businesses your size were diligenced in the last 24 months. 71% died. The top three failure modes were [X, Y, Z]. You are exposed on X. Here is the remediation."* Sold separately as subscription research to CPAs, independent sponsors, and SBA lenders — the PitchBook/CB Insights/GF Data move for Main Street.

---

## 7. The Three-Sided Revenue Model

Most competitors monetize one side. Scorta monetizes three, which is what creates the chicken-and-egg solution *and* the venture-grade revenue surface.

| Side | Today | Phase 2 | Phase 3+ |
|---|---|---|---|
| **Sellers** | Diagnostic $3.5K; Full Concierge $7–15K; Brokerage 5% success fee on close | Same; Certification-Only SKU $3.5K–$5K added | Same; success fees on a larger book |
| **SBA Lenders** | Free pilots (Live Oak first) | Paid annual subscription per institution; per-deal referral fees disclosed per SBA Form 159 | Embedded SBA pre-qual as a SaaS for lenders |
| **CPAs / Trusted Advisors** | $2K referral fee per converted client | Per-seat CPA SKU license; co-branded Diagnostic | White-label entire engagement |
| **Buyers** | Free access to Scorta Buyer Network | Subscription tier for premium deal flow access | Per-introduction fees on premium inventory |
| **Other Brokers** | n/a | n/a | Certification licensing — pay Scorta to certify their listings |
| **QofE Firms / PE** | n/a | n/a | Underwriting-as-a-service; Diligence Intelligence subscription |

The bottom line on TAM. The Diagnostic is the wedge, not the LTV. A fully-engaged Scorta customer pays $7K–15K Full Concierge + $80–100K brokerage success fee = **$100K+ per closed deal**. Layer on top: Certification-as-a-service licensed to other brokers, underwriting-as-a-service to lenders, embedded escrow and closing fees, buyer-side subscriptions, Diligence Intelligence subscriptions. Each layer adds a different revenue surface against the same customer base.

**Bottom-up build to $100M revenue:**
Big Asterisk in this section - Prices charged subject to change
- Year 1: 25 closed deals @ ~$80K success fee + ~$7K Full Concierge = ~$2M
- Year 2: 100 closed deals = ~$9M
- Year 3: 500 closed deals across two metros + first Certification licensing revenue + first lender pre-qual revenue = $40–60M
- $100M revenue path = closing 1,000–1,500 deals annually nationally with a certification and infrastructure layer underneath — a fraction of the IBBA's annual Main Street transaction count

---

## 8. Pricing & Customer Arc

**Seller pricing today and Phase 1:**
Big Asterisk in this section - Prices charged Subject to change

- **Diagnostic / Scorta Score Engagement:** $3.5K flat (current avg ACV ~$3.9K across the first 9 paying customers, including engagements ranging $3K–$5K)
- **Full Concierge:** $7K–$15K for prep + Scorta Score + lender package + Boardroom intensive
- **Certification-Only SKU:** $3.5K–$5K — for owners who plan to use their own broker or list direct but want the underwriting work and lender pre-qual. Wedge into the CPA channel.
- **Brokerage success fee:** **5% of enterprise value on close** (Phase 1 standard, anchored to the first two signed agreements with the marketing-agency cohort). Materially cheaper than the 8–15% traditional brokers charge.

**Seller pricing Phase 2 — hybrid brokerage pricing (post first 25 deals):**
Big Asterisk in this section - Prices charged Subject to change

- Phase 1 baseline: 5% success fee on close (current standard, anchored in the first two signed agreements)
- Phase 2 evolution as the agent stack absorbs more workflow: optional $5K–$10K activation retainer + 2.5%–4% success fee on EV at close, with a floor of $15K total and cap of ~$60K total
- On a $1M sale: traditional broker = $100K commission; Scorta Phase 1 = $50K (5%); Scorta Phase 2 = ~$45K. Materially cheaper, transparent, aligned.

**Why we charge upfront when Baton and OffDeal don't.** Free isn't actually free if the close rate is 20%. It means the buyer of free is the owner with a year of opportunity cost. The Scorta upfront fee is the cost of being told the truth — including "you should not list, here's what to fix first." For the 70% who would have wasted a year and walked away with nothing, the Diagnostic saves them that year. For the 30% who get certified and listed, the upfront fee is dwarfed by the close-rate uplift and faster time to close.

**Lender pricing Phase 2:** annual subscription per institution, sized to the named seat count (1–3 SBA officers per institution typically).

**CPA pricing Phase 2:** per-seat license, with referral kickback structure preserved for the bronze tier ($2K per converted seller) and revenue-share at the silver/gold tiers (25%+ rev share on engagements they originate).

---

## 9. The Moats

There are very few enduring moats left for software companies in 2026. Scorta builds six, three of them defensible-from-day-one, three that compound over time. **No single moat carries the company. The interlock is the moat.**

### Moat 1 — The Unstructured Deal-Process Dataset

**There is no rich dataset anywhere on why Main Street deals close or don't close.** The public data is shallow: inputs (listing details) and outputs (sold / not sold, price). **What's missing is the connective tissue — the lender concerns, buyer objections, broker negotiations, diligence breaks, financial recasts, and back-and-forth that actually determine the outcome.** All of it sits trapped in PDFs and email threads, scattered across thousands of small-shop brokers, and remains unused.

Scorta is the only player paid to capture this data systematically. Every engagement produces structured records of:

- Buyer objections raised and how they were resolved
- Lender pre-screen concerns and what fixed them
- Diligence breakpoints — where deals would have died and why
- Owner-dependency findings and remediation paths
- Financial recast deltas — recasted EBITDA vs. as-reported, by category
- QofE-adjacent flags surfaced before they cost a deal
- Broker-buyer-seller negotiation transcripts and resolution paths

**The compounding loop — the agent-building flywheel:**

> Engagement → Unstructured Data Captured → Agent Training & Reinforcement → Cheaper, Faster Engagement → More Engagements → More Data

We build productized agents directly out of what we encounter in customer engagements. **Patterns we see twice become checklists. Patterns we see ten times become agents.** The services layer is the data acquisition channel for the infrastructure layer. This is how the company moves from 80% human / 20% software in Year 1 to predominantly software by Year 5.

Throughput at each rotation of the flywheel:

- **5 engagements (today):** checklist formation begins; first agent prototypes built from recurring patterns
- **25 engagements:** underwriting checklist tightens; recurring objection patterns become structured agent inputs
- **200 engagements:** we can predict close probability with meaningful confidence; named agents replace founder labor for defined workflow steps
- **500 engagements:** model is licensable
- **1,000+ engagements:** we are the underwriting layer for the entire Main Street transaction market

Every engagement makes the underwriting model better. Every model improvement makes the next engagement faster and cheaper to run, which lets us serve smaller and smaller businesses profitably — pushing our floor toward $400K and then $300K EV, where existing players' unit economics break completely. **Services becomes infrastructure.**

BizBuySell has the closed-deal comps. Nobody has the deal-process data — and nobody can get it without sitting inside the engagements. That is the moat.

**The verbal shorthand:** *"The valuable data isn't 'this business sold for $X.' That's already public. The valuable data is the 200 emails, 47 lender questions, 18 buyer objections, and 6 diligence breaks that determined whether it sold at all. Nobody has captured that systematically. We are."*

**The agent-building shorthand:** *"Patterns we see twice become checklists. Patterns we see ten times become agents. The services layer is the data acquisition channel for the infrastructure layer."*

### Moat 2 — The Scorta Score as Protocol

A published methodology with sub-scores, a defined remediation playbook, and a grade-lift outcome dataset that competitors cannot reproduce by spending money. Two-sided pull: new brokers want to certify their listings because buyers ask for it; new buyers want certified inventory because lenders move faster on it.

The closest comparable: FICO. The credit score is more valuable than any single credit product because everyone references it. Once Live Oak or Byline asks a borrower "what's your Scorta Score?" — even once — the cycle starts.

### Moat 3 — Trusted-Advisor Distribution

CPAs, SBA loan officers, and wealth advisors are relationship businesses. Once we're embedded as the referral partner for a CPA firm — once they've referred three sellers and seen good outcomes — that channel is sticky in a way paid marketing never is. **Baton burned a meaningful portion of their Series A on direct marketing and still reports ~564 listings after three years.** Scorta is building distribution that compounds without paid spend.

A CPA who refers three sellers per year, multiplied across 200 CPAs in the NJ/NY/CT corridor, beats any direct-marketing funnel at this segment size.

### Moat 4 — The Capital-Verified Buyer Network

The cap-verified Main Street buyer graph. **Stanford GSB's 2024 Search Fund Study: 94 new search funds launched in 2023, 35.1% aggregate IRR.** Citrin Cooperman: 74% of independent sponsors source deals from business brokers. The buyer side is starved for vetted, broker-sourced flow. We aggregate them, contractually no-circumvent, and route them to certified inventory. OffDeal and Baton cannot replicate this without abandoning their open-marketplace and upmarket-banking models, respectively.

### Moat 5 — Three-Sided Market Structure

Lenders pay. CPAs pay. Sellers pay. Buyers eventually pay. Marketplaces and bankers are one-sided. Scorta is structurally a three-and-eventually-four-sided business. **Plaid sold to banks, not consumers. Carta sold to law firms before founders. Drata sells to auditors and end-customers in parallel.** This pattern produces a different gravity well — every side's demand pulls the others.

### Moat 6 — UI/UX for AI-Native Decision Support

Every owner in this category will ask AI to help them sell their business in the next 24 months. Most will use ChatGPT and get a bad answer. The winning product will use AI in a *qualitatively different interaction model* — not chat, not forms, but something that feels like sitting in a room with a team of advisors. The Scorta visual language, built phase by phase: The Boardroom (Phase 1), The War Room (Phase 2 — live diligence command center), The Lender Desk (Phase 2 — real-time SBA financeability across multiple lenders), The Negotiation Table (Phase 3 — AI counter-party walking owners through LOI terms). Multi-agent streaming UIs require taste, animation chops, prompt engineering, and a coherent visual system. Most teams ship one of those four.

### The Implicit Seventh — Trust at the Moment of Decision

Selling a business is the largest financial decision most Main Street owners ever make. The winner in this category will be the brand owners trust when they are scared. Trust compounds slowly, deliberately, and is genuinely hard to copy. We build it one closed deal at a time, on referenceable outcomes.

---

## 10. Distribution Strategy

The cheapest, highest-trust path to Main Street owners is **not direct marketing** — it's the three professionals every owner already trusts: their CPA, their banker, and their attorney. **Direct seller acquisition for the $500K–$2M segment is brutal.** Owners aren't searching "AI-native broker." Baton spent meaningful Series A capital on D2C marketing and has ~564 listings after three years. The leverage is in the trusted-advisor channel.

**Priority order:**

1. **CPAs and bookkeepers.** Every CPA serving small business clients sees an exit conversation 5–10 times a year and has nothing actionable to recommend. We become their answer. The CPA SKU + co-branded Diagnostic productizes this channel.
2. **SBA lenders.** Especially Live Oak's NJ-based loan officers (we have mapped Todd Dobiszweski explicitly as a target relationship) and other PLP banks like Pursuit Bank and Cross River. They want pre-qualified deals; Scorta hands them deals already 80% diligenced. SOP 50 10 8 has made their pre-screen workload heavier, and they are actively investing in AI-driven loan screening right now.
3. **Wealth advisors and exit planners.** EPI and IBBA report 68% of owners seek advisor input on exit, but 78% lack a formal transition team. Productize the relationship.
4. **Vertical operator communities** — trade associations, franchise networks, conferences across Main Street verticals.

**Channel velocity is honest, not aspirational.** The first 5 partnerships will take 3 months each. Depth over velocity. 5 deeply engaged CPA partners sending 3 referrals each beats 50 logo'd partners sending nothing.

**Two seller-direct plays continue alongside:**

- **Founder-led outbound** to 50 operators in the NJ/NY/CT corridor (Suyash's micro-PE network has many of the relationships). Outreach uses the product: "I ran ExitIQ on your business based on public data. Here's what the Boardroom said. Want the full report?"
- **The "real teaser as outbound" play** — owners listed on BizBuySell are an already-validated, exit-considering, higher-intent population. Fishing where the fish are.

---

## 11. Market Wedge — Geography, Segment, Verticals

**Geography: the NJ/NY/CT corridor.** Founders are NJ-based. Dense small-business population. Accessible for in-person meetings during the relationship-building phase. Avoids the Florida real-estate-license-includes-business-interests issue. **NJ does not require a business broker license** absent real estate in the transaction. Most Main Street businesses lease their space, so real estate isn't in the deal. NY and CT regimes have been mapped and are workable.

**Segment: $500K–$2M EV, $100K–$500K SDE.** Precisely where Baton's $100K-minimum marketplace gets thin, OffDeal's $5M revenue floor doesn't reach, and traditional brokers do worst (smallest fees, longest cycles, highest "list and pray" rates). Do not shrink this range — it's the structural gap competitors created.

**Verticals (Phase 1 focus, explicitly temporary): three vertical clusters chosen for reproducibility of agent loops.**

Through end of Phase 1 we are concentrating on three vertical clusters where the agent stack delivers the cleanest reproducible loops, the fastest integrations, and the most defensible workflow embeddings:

1. **Home services** — HVAC, plumbing, electrical, lawn care, pool maintenance. High SBA-loan eligibility, repeatable financial structures, well-understood buyer pool (SBA-backed searchers, franchise roll-ups), strong demographic tailwinds.
2. **Restaurants and restaurant franchises** — single-unit operators and small franchise portfolios. Concentrated lease/license/permit issues that the Operational & Legal Cleanliness sub-score is well-tuned for. POS data integrations (Toast, Square) reduce ingestion friction.
3. **Digital marketing and social media agencies** — the cohort that has progressed fastest through the Scorta stack. Why: mostly digital businesses with remote work, easiest to integrate the agent stack into existing workflows. Our first two signed brokerage agreements come from this vertical — both SBA pre-qualed and ready for transition at 5% success fees.

**This is temporary.** As we expand market share, product offerings, and brand recognition, we will broaden across Main Street services more aggressively. The reason for narrowing now is **agent reproducibility**: the more the same vertical repeats, the more our agent loops tighten — Ingestion Agent learns the chart of accounts shape, Recast Agent learns the typical add-back patterns, Concentration Agent learns the customer concentration norms, Boardroom learns the buyer-archetype objection libraries. Each vertical we lock in becomes a productized agent path.

**The broader vision remains horizontal across Main Street services.** Cross-pollination across verticals is what makes the deal-process dataset compound; the failure modes (owner dependency, customer concentration, SBA recasts, QofE bridges) are largely industry-agnostic. The current narrow focus is a Phase 1 sequencing choice, not a permanent positioning. Adjacent verticals reachable next: auto repair, accounting practices, specialty service firms, machine shops, light manufacturing, dental practices, veterinary practices. Vertical-specific UI surfaces (HVAC route density, restaurant lease assignment risk, agency client-retention modeling) come later as overlays, not as gates.

**Why these three specifically delivered fastest:** marketing agencies, restaurants, and home services span the operational complexity spectrum — digital-only / remote (agencies), location + lease + license (restaurants), and field-service + recurring revenue (home services). Locking in agent loops for all three before broadening means the agent stack carries forward into adjacent verticals with minimal new integration work.

**Buyer types (by likelihood in our EV band):** SBA-financed individual buyers (searchers) first, local strategic acquirers second, family offices third, vertical roll-ups fourth.

---

## 12. Competitive Landscape

### Direct Competitors

**Baton Market (NYC, founded December 2021 by Chat Joglekar (ex-Zillow 6 years, ex-Google, ex-Spotify) and Dylan Gans).** $15.5M total funding: seed $2.74M in April 2022 led by Giant Ventures; Series A $10M on January 22, 2025 led by Obvious Ventures (James Joaquin), with Burst Capital, FJ Labs, Fluent Ventures, Spencer Rascoff via 75 & Sunny, Divergent Capital, Bloomberg Beta, and Zeno Ventures. 51 employees as of March 2026. Trustpilot rating 4.7; claims "10x higher than market solutions" close rate and 50% cost savings vs. traditional brokers. **Marketplace architecture** with $100K valuation floor, free valuation + free Private Listing, paid tiers $500/mo (Lite) and $1,000/mo (Pro), plus 6% success fee. Claims 70% close rate (survivorship metric on accepted listings, not the funnel above). **Architectural gap:** marketplace economics require listing volume; pre-market underwriting that rejects 70% of opportunities is structurally incompatible. Cannot charge upfront for honest diagnostic without cannibalizing free-valuation wedge.

**OffDeal (NYC, YC-backed, founded 2024 by Ori Eldarov (CEO, ex-RBC banker, HBS MBA) and Alston Lin (CTO, ex-Meta engineer, prior founder of Bizwise)).** $17M total funding; $12M Series A led by Radical Ventures (Ryan Shannon) in July 2025 at ~$100M valuation, with YC, Rebel Fund, Centre Street Partners, and angels from Evercore, AllianceBernstein, McKinsey, and Cognition. <10 employees with 3 dedicated bankers, 1:1 engineer-to-banker ratio. MD Sam Mielke (age 25) projected ~$2M bonus; publicly stated goal is $100M ARR by 2027 (100 deals/year); ~30 sell-side processes launched, ~10 closed transactions as of Series A. **AI-native investment bank architecture** serving $5–100M revenue companies, $1–10M EBITDA. 5% success fee, no upfront retainer. Bankers running 7–10 deals each, target $2M bonuses on $5M+ success fees. **Architectural gap:** floor is an order of magnitude above Scorta's segment; Radical Ventures' Ryan Shannon has publicly said the unit economics don't stretch to the long tail. Coming down means rebuilding compensation, which means rebuilding the company.

**Iconic (West Hollywood, founded 2011 by Erik Salazar (ex-Microsoft, Kit.com, On Deck, Expa; CA Real Estate License #02241191)).** Co-founders include Naveen Selvadurai (co-founded Foursquare, founding partner at Expa) and Roberto Sanabria (co-founder at Expa, ex-LinkedIn, Google, Capital One). Single undisclosed funding round; acquired Integral Capital Advisors (Redondo Beach CA, led by Eric Coonrod) in September 2024. 34 employees as of March 2026. **Tech-enabled M&A advisory platform** ("The Iconic Rail"); no-cost valuations, buyer matching, deal-flow tracking. Clients up to $100M revenue. **Architectural gap:** value prop is execution speed + process tech, not pre-market diagnostic. Center of gravity is too far upstream.

### Secondary / Adjacent

- **BizBuySell / BizQuest (LoopNet/CoStar):** marketplace incumbents. ~65,000 listings annually, 3.5M monthly unique visitors. Pure advertising/subscription revenue. Explicitly state "we are a marketing platform... not a brokerage firm." Strongest closed-deal comp dataset in industry. Not a competitor on underwriting — infrastructure for the *current* broken process.
- **Sunbelt, Murphy, Transworld, First Choice — traditional broker franchise networks.** US business brokers industry: $1.8B with 80% untapped per Marketdata 2024. Sunbelt: ~250 franchised offices in 30 countries. Quality variance across franchisees; no proprietary technology; commission-only 8–15%; cohort-aging broker workforce. None shows signs of building AI underwriting — positioned as anti-AI relationship businesses. Their structural ceiling is also their structural protection from venture-funded disruption.
- **Live Oak Bank — partner, not competitor.** #1 SBA 7(a) lender by dollar volume. Q1 2026 loan production $1.37B. "Speed is our weapon" tagline; 24–48 hour pre-qual capability. Has NJ-based senior loan officer (Todd Dobiszweski). Distribution channel and certification consumer. Most important commercial partnership to secure in Phase 1.
- **Buy-side rollups (Acquco, WebStreet, Thrasio-style):** Acquco raised $160M Series A in 2021 to acquire Amazon FBA brands; "we bypass brokers" positioning. Threat if rollups acquire enough inventory directly. Mitigation: rollups still need underwriting and certification on what they buy — Scorta becomes their verification layer, not their competitor. Phase 3 Underwriting-as-a-Service includes this channel.
- **Worth AI (Orlando):** Founded by Suneera Madhani and Sal Rehmetullah (Stax Payments founders); raised ~$67M. AI-powered SMB credit underwriting for banks/fintechs, not a sell-side broker. Adjacent tooling, not competitor. Watch for pivot risk: if Worth AI enters SMB-sale credit scoring, their data assets are relevant to Scorta's certification layer.
- **Calhoun Companies (Edina, MN — regional broker archetype):** Founded 1908; ~117 years old; covers MN/IA/ND/SD/WI. Cited as the representative of the regional incumbent every metro has — NJ/NY equivalents include Synergy Business Brokers. These regional shops are simultaneously Scorta's competitors in their markets *and* potential Phase 3 certification customers once the standard is licensable.
- **Vertical operating systems (ServiceTitan, Housecall Pro, Jobber):** upstream data sources, potential acquirers of Scorta's certification standard at scale. Not competitive.

### The Scenario We Take Seriously

A new entrant — a YC company funded six months from now — that builds the same wedge. **That's why speed matters.** We need the Scorta Score to become the term lenders and CPAs use before someone else can claim it. If any incumbent comes down and copies us, they're 12–18 months behind on the deal-process dataset, 18+ months behind on the trusted-advisor channel, and carrying the marketing burden of repositioning a known brand. The defensible window is real but it isn't permanent — which is what we're raising capital to lock in.

---

## 13. Founder-Market Fit

Scorta has a rare combination of operator depth and AI-engineering depth, paired with a decade of shared shipping history and a prior exit together.

**The team headline.** Two founders. Met in high school. Ten years working together. **Previously built and sold Scope16 Marketing**, an agency serving Main Street businesses that reached **$100K MRR before exit.** Scope16's paying customers were Main Street businesses — the exact demographic Scorta sells to today. The team has shipped, found product-market fit, scaled revenue, and exited together once already. They are not learning the customer. They are not learning the workflow. They are not learning each other. The only thing being learned is the company itself.

**Suyash Agrawal — CEO.** Ex-Atlassian on Rovo growth — scaling AI-native product distribution to the SMB segment is literally what he was doing 18 months ago. Before that, ran operations at a micro-PE fund acquiring and operating Main Street businesses in the exact EV range Scorta now targets. Personally has been on the buy side of the deals Scorta intermediates. Knows what a clean diligence package looks like, what an SBA underwriter cares about, what a search fund will and won't tolerate. Pattern recognition, not researched perspective.

**Puneet Gupta — CTO.** One of the first **Forward Deployed Engineers at Travelers Insurance**, where he built and scaled **Claims Concierge** — an AI workflow platform that grew to **200+ insurance carriers, 8,500 monthly active users, and 2.8M invocations in 6 months.** The closest functional analog to what Scorta automates: structured-document, judgment-heavy underwriting work, in production, at enterprise scale. Before Travelers, **Founding Engineer at Ray Business Technologies**, where he built an AP document-ingestion platform from zero — diligence-grade extraction with 95%+ accuracy. Not a chatbot background. Builds the kind of system that recasts financials the way an SBA underwriter would, maps owner dependency, and surfaces customer-concentration risk.

**The combination:** a buy-side operator who has lived the buyer's diligence experience, paired with a Forward Deployed Engineer who has built exactly the kind of structured-document underwriting AI the business requires, with a decade of co-execution and one prior exit between them. That is the bet.

---

## 14. The Phased Plan

| Phase | Window | What we are | Top-line outcome |
|---|---|---|---|
| **1** | Now | Concierge underwriting + brokerage; first Scorta Scores published; founder-led trusted-advisor BD | 25 paid Diagnostic engagements; 10+ closed brokered deals; 5 deeply engaged channel partners; the Scorta Score recognized in 3+ NJ/NY SBA lenders' pre-qual checklists |
| **2** | Step 2 | Three-sided revenue: sellers + lenders + CPAs all paying; productized Diagnostic SKU; continuous Boardroom in production; capital-verified buyer network active | 20–25 closed deals; first quarter at $750K–$1M ARR run-rate; 25+ active CPA partners; 5 paid lender contracts; Scorta Score is the default Main Street trust signal in the NJ/NY/CT corridor |
| **3** | Step 3 | Category leadership in NJ/NY/CT; second metro launched; Underwriting-as-a-service to SBA lenders, QofE firms, search funds; failed-deal dataset licensed | 200+ closed deals across two metros; Diligence Intelligence subscription live; brand recognition at the moment of decision |
| **4** | Step 4 | Adjacent infrastructure — embedded escrow, closing automation, lender marketplace inside Scorta; certification licensed to other brokers including Sunbelt/Transworld franchisees | Take rate on every transaction in the system, regardless of who originated it |
| **5** *(back pocket)* | Step 5 | The Carfax / SOC 2 of small business transactions. Every Main Street deal in America references a Scorta Score. The brokers run on us. The lenders run on us. The buyers ask for us. | The infrastructure outcome. The honest ceiling, not the lead. |

---

## 15. The Five Strategic Sharpenings

The five shifts that retire "30-day exit ready" and replace each piece of the existing stack with a sharper version of the same piece. Sequenced from most central (lead with) to most additive (defer or layer).

| # | Shift | What stays | Lead promise | When |
|---|---|---|---|---|
| **1** | **The Scorta Score** — published letter grade, 7 sub-scores, methodology paper | Certification as central pillar; concierge ACV; NJ/NY focus | *"Scorta Score published in 14 business days; one grade lift in 90 days or refund"* | **Lead** |
| **2** | **Lender + CPA paying customers** — three-sided revenue model | Concierge price unchanged; seller remains primary | *"Scorta-Certified seller package in your lender's SBA 7(a) pre-screen format within 45 days or refund"* | Parallel with #3 |
| **3** | **Capital-verified Buyer Network** — pre-aggregate the scarce side | Broker model; concierge; Certified | *"First qualified buyer call within 21 days of certification; signed LOI within 120 days from a buyer with proof of funds or concierge converts to listing credit"* | Parallel with #2 |
| **4** | **Continuous Boardroom** — Drata for Exit Readiness | Boardroom product; concierge; dataset | *"100% of identified diligence-killing objections cleared and continuously monitored for the 90 days preceding listing, with monthly Boardroom rescores until close"* | Month 6–9 |
| **5** | **Diligence Intelligence productized** — deal-process dataset as deliverable + subscription | Dataset capture; concierge; broker model | *"QoE-grade EBITDA bridge and risk-benchmarked diligence dossier within 30 days, defended against 200+ comparable NJ/NY teardowns and pre-cleared by an SBA lender reviewer, or full refund"* | Month 12–18 |

**Per-Shift Success Milestones**

| Shift | 12-Month Target | 24-Month Target |
|---|---|---|
| **1 — Scorta Score** | 3+ NJ/NY SBA lenders contractually reference the Scorta Score in pre-qual checklists; 500+ businesses scored | Score is the default trust signal in the NJ/NY/CT corridor; methodology licensed to one CPA channel partner |
| **2 — Lender + CPA** | 5 paid lender contracts; 20+ paid CPA seats; 30% of seller inflow from lender/CPA referral | Lender ARR exceeds seller ARR; Scorta structurally indispensable to 2+ NJ/NY PLP lenders' Main Street pipelines |
| **3 — Buyer Network** | 200 capital-verified buyers in network; 70% of certified listings receive 3+ qualified buyer calls within 30 days of certification | Densest cap-verified Main Street buyer graph in NJ/NY/CT; moat OffDeal and Baton cannot replicate without abandoning their models |
| **4 — Continuous Boardroom** | 50% of concierge customers on continuous Boardroom; time-series dataset reaches 300+ business-months | Continuous Boardroom data feeds Scorta Score precision and powers the lender pre-screen tool |
| **5 — Diligence Intelligence** | 1,000+ benchmark entries; 25 paid CPA/IS subscribers; dossier is the most-cited artifact in NJ/NY SBA Main Street files | One of {OffDeal, Baton, Iconic} approaches Scorta for a data-licensing deal |

All five preserve 100% of the current product surface. Each introduces a paying party that is not the seller whose demand pulls sellers through. Together, they convert the marketplace argument from hand-waving into a documented three-sided revenue model.

---

## 16. Phase 1 Success Criteria & Operating Plan

**Phase 1 success criteria** (the gates to Phase 2 investment):
Big Asterisk in this section - Prices charged Subject to change

1. **ExitIQ → founder call conversion: ≥15%** of completed assessments (qualified) book a call within 7 days
2. **Founder call → paid Diagnostic conversion: ≥30%** at $3K–$10K
3. **≥10 closed brokered deals** with full structured `closed_deals` records logged
4. **≥5 deeply engaged channel partners** (CPAs, lenders, or exit coaches) actively sending referrals
5. The Boardroom passes the **"savvy owner with ChatGPT" test** in side-by-side blind comparisons with 5+ owners
6. **The Scorta Score recognized in 3+ NJ/NY SBA lenders' pre-qual checklists**
7. **Zero customer-facing factual errors** that required post-send correction

If criteria 1–6 hold and #7 stays clean by end of Phase 1, we move to Phase 2 build with conviction. If 4 of 6 functional criteria hold, we extend Phase 1 by a quarter. If fewer, we revisit thesis.


**Deliverable:** demoable, instrumented, lead-generating product with 50 hand-curated comps, working SBA pre-screen against SOP 50 10 8, closed-deal capture infrastructure, evidence/approval/audit foundation, and a documented operations playbook.

**Phase 1 GTM playbook — three plays in priority order:**
Big Asterisk in this section - Timelines and numbers Subject to change

1. **Founder-led outbound to operators in NJ/NY/NYC** across our three focus verticals (home services, restaurants and franchises, digital marketing/social media agencies). **Status: $35K collected from 9 customers in ~7 weeks, 100% inbound and founder-led; first two brokerage success-fee agreements signed at 5% on close.**
2. **CPA pilot program (first 5 deeply engaged firms).** White-label ExitIQ at `[firm-name].scorta.app`. Goal: 5 signed CPA partners, 20 ExitIQ runs from CPA referrals, 2 paid engagements. Plan for 3 months per partnership — depth over velocity.
3. **"Real teaser as outbound" play.** Run ExitIQ on BizBuySell listings in NJ/NY/NYC, generate partial GAP Report, outreach with the analysis. Goal: 30 outbound, 10 conversations, 3 paid engagements.

**Phase 1 monthly burn:** ~$3K–$5K/month. AI usage $500–$1.5K, hosting $200, tools $400, comp data $300–$800, paid traffic $2K from week 8. Sustainable on existing capital plus ongoing engagement revenue for 4–6 months without raising.

---

## 17. Technical Architecture
Big Asterisk in this section - Tech Stack Subject to change based on added removed features and requirements updates

**The architectural frame: an agent-native operations stack, purpose-built for Main Street M&A.** Scorta is a coordinated fleet of specialized agents — Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom (multi-persona), Lender Ops, Outreach — each with its own context, its own toolkit, and its own human approval gate. Agents run the work; humans own the risk. Every material action (every valuation claim, every add-back, every lender submission, every LOI term, every external buyer communication) is logged, staged for one-click human approval, and bound to a named human signatory with timestamp. This product was uneconomic at our segment before LLMs got to current reliability levels in 2025.

**The Case Manager Agent is the operational backbone** — watches every deal's state machine in real time, dispatches specialized agents and human operators on blockers, manages calendars and SLA windows, escalates stale threads, and logs every action in a permanent auditable timeline. It is what enables the "20+ deals per operator" lever.

**Agents work in real external systems, not just in our database.** The Lender Ops Agent logs into SBA lender portals and fintech LOS systems, uploads packages, tracks submission status, responds to lender info requests. It creates and manages VDRs, invites buyers, gates access by qualification tier. It posts and updates listings on BizBuySell and Acquire.com. The Outreach Agent runs personalized email and CRM sequences against capital-verified buyers. Real systems, real actions, full audit trails, human approval on every external touch.

**Frontend:** Next.js 15 (App Router), React 19, Vercel hosting. Boardroom UI uses streaming SSE for progressive buyer-agent reveal. Framer Motion for animation. shadcn/ui customized with the Scorta design system.

**Backend:** Next.js Route Handlers for synchronous endpoints. Async job runner (Inngest) for the Boardroom generation pipeline.

**Database:** Supabase (Postgres) with Drizzle ORM. RLS enforced on every table. Schema versioned via Supabase migrations. Supabase Auth with RBAC.

**AI orchestration (Vercel AI SDK with Anthropic provider):**

- **Claude Sonnet 4.5** for reasoning-heavy steps: buyer-agent analysis, valuation narrative, lender-readiness explanation, fix recommendation rationale
- **Claude Haiku 4.5** for high-volume parsing and classification: NAICS auto-classification, document extraction, email parsing
- All prompts versioned in code; evaluation harness measures every version against a fixed benchmark set of 10 reference businesses
- Structured output enforcement: JSON schema validation on every LLM call producing structured data; refusals and truncations trigger fallback paths and human-review queue routing
- Temperature 0.3 for buyer agents; 0.5 for narrative generation

**Deterministic vs. LLM (the firm boundary):**

- Valuation math: deterministic (multiples × SDE adjusted by red/green flags). LLM never used for the numbers themselves.
- Scorta Score sub-scores: deterministic rules engine; LLM only wraps the verdict in plain-English explanation
- SBA pre-screen: rules engine against SOP 50 10 8
- Fix cost/time/impact: deterministic from a rules table; LLM writes the narrative
- Boardroom buyer-agent reasoning: LLM with structured output schema enforced

**Provenance and approval architecture:**

- Every LLM-generated claim in a customer-facing artifact links to its source (document chunk, deterministic calculation reference, or persona prompt version)
- Evidence store table tracks source attribution per generated sentence
- Founder approval queue: no customer-facing artifact (Scorta Score Report, CIM, lender package, buyer outreach) ships without explicit sign-off
- Immutable audit log: every action on a deal logged append-only with timestamp, actor, content hash

**Document ingestion:** LlamaParse or Unstructured for tax returns and P&Ls. Redaction pipeline for SSNs, bank account numbers, and tax IDs runs on every upload before any external visibility.

**Email:** Resend (transactional) + Loops (nurture campaigns). **Payments:** Stripe (only after founder call → quote → contract). **Analytics:** PostHog + custom funnel tracking in a `funnel_events` Postgres table. Sensitive financial data never flows to analytics tooling.

**Core data model tables** (the load-bearing center of the company): `owners`, `businesses`, `financials`, `business_health`, `seller_goals`, `assessments`, `valuations`, `boardroom_runs`, `scorta_scores`, `sba_screens`, `fix_recommendations`, `evidence_links`, `approval_queue`, `audit_log`, `comps`, `closed_deals` (THE MOAT TABLE — every concierge engagement produces a complete record within 7 days of close), `leads`, `channel_partners`, `partner_referrals`, `lenders`, `buyer_network`. Every table is RLS-scoped where applicable. The `comps` and `lenders` tables are read-cross-org. The `closed_deals` and the new `failure_modes` table are non-negotiable.

---

## 18. Capital Use

The four buckets accelerator capital deploys against, with concrete benchmarks:

1. **Distribution (largest bucket).** We are a distribution-first company. Owners aren't searching "AI-native broker." They're talking to their CPA, their SBA loan officer, their wealth advisor. Build the trusted-advisor channel: signing **50 CPA firms in the NJ/NY/CT corridor**, **5–10 SBA lender partnerships** starting with Live Oak (Todd Dobiszweski already mapped), and **20 exit-planning advisors**.
2. **Two senior hires.** **A Head of Deal Operations** — IBBA-credentialed broker with 10+ years and 50+ closed deals. This person is the trust signal to sellers and the conscience on diligence calls. **A senior growth engineer** — productionize the underwriting workflow Puneet built so concierge engagements get cheaper and faster to run.
3. **Deal-process data infrastructure.** Turning the unstructured notes, emails, lender questions, buyer objections, and broker negotiations from every engagement into a structured proprietary dataset — and into productized agents — is engineering work, not consulting work. The infrastructure has to be in place before we scale the team, otherwise we lose the asset that justifies the company. Patterns we see twice become checklists; patterns we see ten times become agents.
4. **Proof manufacturing.** Buying down the first **25 closed deals** to the level of marketing investment necessary to make the Scorta Score a recognized term in the NJ/NY broker community. Some of this is direct seller acquisition at zero margin to manufacture comps.

**What capital does NOT go to (and why).**

- **Legal counsel as a strategic priority.** Most states don't require business broker licensing absent real estate. Only ~17 states do per the American Business Brokers Association. NJ doesn't. Securities regulation is a non-issue at our segment — Main Street asset sales aren't securities transactions, and HR 686 / S 1010 federal exemption legislation (pending) doesn't affect us at this scale. Legal is a $25–50K routine line item we will retain when funded, not a strategic capital-use thesis.
- **Direct seller acquisition at scale.** Baton's playbook. We've seen the result.
- **Free valuations.** That's Baton's wedge. Ours is honest underwriting including "you should not list."
- **Vertical specialization.** Narrowing kills the deal-process dataset's cross-pollination value.
- **Shrinking the EV range.** $500K–$2M is precisely where competitors' economics don't work.

---

## 19. Human Approval Boundaries

A clear map of which Scorta artifacts ship automatically vs. require founder approval vs. are entirely human-produced.

**Auto-ships (no human approval required):**

- ExitIQ assessment scoring (deterministic + LLM narrative within bounded parameters)
- Boardroom buyer-agent simulation (clearly labeled as simulation, with prominent disclaimer)
- Initial valuation range (deterministic calculation; LLM narrative reviewed in production logs but not gated)
- Scorta Score sub-score calculations (deterministic; LLM narrative gated only on the published report)
- Document classification and routing
- NAICS code suggestions
- Diligence question parsing and triage routing
- Internal status emails and notifications
- The Time Capsule re-engagement email (templated)

**AI-drafted, founder-approved before any external send:**

- Published Scorta Score Report (full document review by founder before any external party sees)
- CIM (full document review before any buyer sees)
- Buyer outreach copy
- Diligence responses to buyers
- Lender packages
- LOI analysis and counter-recommendations
- Any seller-facing valuation claim that becomes part of a paid engagement deliverable
- Marketing copy that references specific deals or outcomes

**Human-only (no AI drafting):**

- The 30-minute founder call with a prospective customer
- Deal strategy decisions (which buyer to prioritize, when to push back, when to walk)
- Negotiation tactics and conversations
- Final pricing recommendations to the seller
- Any judgment call under partial information
- Conflict resolution between buyer and seller
- Decisions about whether to take or decline a mandate (the "don't list" memo is founder-written every time)

This split is permanent until we can prove (via audited factual accuracy data over 50+ deals) that AI quality consistently meets or exceeds founder quality on a given category. Even then, sensitive categories (deal strategy, pricing recommendations, the "don't list" memo) likely remain human-only forever.

---

## 20. Known Gaps and Risks

This section exists so we are honest with ourselves, our investors, and our partners about what is not yet handled. Hidden gaps become bigger problems than acknowledged ones.

### 20.1 The trusted-advisor channel velocity risk (highest)

**If we can't get to 50 active referring CPAs and 5 lender partnerships in 18 months, we run out of inbound** and have to compete with Baton on paid acquisition, which they'll win because they have more capital. Mitigation: NJ/NY/CT corridor density, founder-led BD in year one, productized co-branded Diagnostic SKU for advisors in year two, the Scorta Score as a costless reason for advisors to refer.

### 20.2 The close-rate translation risk

**If our engagements close at the Main Street ~20% baseline, the certification has no value and the moat narrative collapses.** Mitigation: ruthless measurement of close rate by engagement cohort, willingness to refuse listings we predict won't close, transparent publishing of close-rate data once we have 50+ engagements. The thesis is robust to individual failures but not to systematic failure to predict closability — which is exactly what we measure and improve. If close rate isn't materially above 20% by deal 50, the thesis is wrong and we pivot.

### 20.3 The incumbent pivot risk

**Baton or OffDeal pivots earlier than expected.** Less likely for the structural reasons described — incentive misalignment for Baton, compensation-model break for OffDeal — but possible. Iconic adding a pre-market remediation layer is the most plausible threat since they already pitch as "tech-enabled advisory," but their center of gravity is upstream of us. The scenario we take most seriously is a new entrant (a YC company funded six months from now) building the same wedge. **Mitigation: speed.** If the Scorta Score becomes the term SBA underwriters use before someone else can claim it, the moat solidifies faster than competitors can pivot.

### 20.4 The security and data-handling gap

**What we have not done:** formal security audit; access review cadence; redaction pipeline for sensitive financial documents; isolated worker plane for sensitive workflows; comprehensive RBAC at the deal level (currently org-level only).

**Why this matters:** as Phase 2 brings active customer documents flowing through the system (tax returns, bank statements, customer lists), the cost of a breach or mishandling event scales rapidly.

**Mitigation in the meantime:** Vercel + Supabase provide reasonable baseline (SOC 2 Type 2 for both). All sensitive documents accessible only via signed URLs with short expiration. MFA required for both founders on all systems. No financial documents flow to analytics tooling. Document upload paused until the redaction pipeline ships.

**When we close this gap:** alongside the legal work, allocate budget for a third-party security review and the redaction pipeline build before any document upload feature ships to customers.

### 20.5 The operational scale gap

**Two founders carrying product, GTM, brokerage operations, lender relations, and compliance is a lot.** We accept this gap because we believe we can carry it through Phase 1 and most of Phase 2 with operational discipline. Mitigation: ruthless playbook adherence. Every deal goes through the playbook. Every closed-deal record logged within 7 days. Every customer-facing artifact through the approval queue. If we drop any of these, that's an early warning sign that we have exceeded two-founder capacity and need to hire. **First material capital event funds the IBBA-credentialed Head of Deal Operations.**

### 20.6 The data sourcing gap

**What we have not yet validated:** whether BizBuySell will partner for comp data API access, or whether we are stuck with manual scraping for the foreseeable future. Phase 1 starts with 50 hand-curated comps, sufficient for the first 90 days. In parallel, pursue: BizBuySell partnership conversation, IBBA or regional broker association data partnerships, direct relationships with friendly NJ/NY brokers who might share anonymized close data in exchange for our pre-screening tools.

### 20.7 The compliance posture (managed, not feared)

Reframing from prior versions: **regulatory is a routine line item, not a strategic threat or moat.**

- Most states don't require business broker licensing absent real estate. Only ~17 states do per the American Business Brokers Association. **NJ does not.** California, Florida, and Nevada are the headline states that do — Florida specifically remains gated on the real-estate-license-includes-business-interests question, which is why Sun Belt expansion comes only after legal mapping is complete state-by-state.
- For states that do require licensing, the playbook is well-established: partner with a licensed broker on a fee-split basis, or defer transacting until volume justifies hiring a licensed associate.
- Securities regulation is a non-issue at our segment. Main Street asset sales aren't securities transactions. Pending HR 686 / S 1010 federal exemption legislation doesn't affect us at this scale even if not passed.
- SBA referral fees are governed by 13 CFR Part 103 and SBA Form 159. Any future "SBA lender referral fee" revenue must be disclosed and structured per these rules. Phase 1 takes or pays zero lender referral fees — all lender introductions are uncompensated until the legal structure is mapped.
- Customer engagement agreements include explicit data-use consent and prominent disclaimers. Founder-drafted v1; professional review allocated against first material capital ($15K–$30K minimum for the initial mapping work, treated as a routine cost line not a strategic capital-use thesis).
- Boardroom outputs carry prominent "simulation, not actual offers" disclaimers throughout.
- We do not collect transaction-based compensation in Phase 1 prep-only engagements — those are flat-fee for prep work, not contingent on a sale closing.
- We do not represent ourselves as licensed brokers. Marketing language describes Scorta as "AI-native broker" with explicit context that we are a new category.

The Head of Deal Operations hire will be IBBA-credentialed both for trust signaling and to cover any state-by-state requirements as we scale.

---

## 21. Operating Principles

These are the rules we use to keep the company on track when day-to-day decisions get murky.

1. **The corridor wedge is sacred.** Through end of Phase 1, we serve the NJ/NY/CT corridor. We will turn down sellers in Boston, Austin, Seattle. Density is what makes the data feel real, the demo land, the trusted-advisor channel work, and the founder voice credible.

2. **Three-vertical Phase 1 focus, horizontal long term.** Through end of Phase 1 we concentrate on home services, restaurants/franchises, and digital marketing/social media agencies — the three clusters where agent loops are reproducing fastest. This is sequencing, not specialization. Once each cluster's agent path is locked, we broaden across Main Street services. Cross-pollination of failure modes across verticals is still what compounds the dataset long term. Vertical-specific UI surfaces come later as overlays, not gates.

3. **Concierge first, automation second, every time.** Every new agent we build is preceded by founders doing the work manually for 5+ deals. The agent learns from real founder behavior, not from imagined behavior.

4. **The closed-deal record is non-negotiable.** Every concierge engagement produces a complete `closed_deals` record within 7 days. **Every failed engagement produces a complete `failure_modes` record within 7 days.** No exceptions. The flywheel doesn't spin if we're sloppy here.

5. **Human approval at every customer-facing boundary.** No Scorta Score Report, CIM, lender package, buyer outreach, or other external artifact ships without founder review and explicit sign-off. AI drafts; humans approve. This is permanent until we can prove (with audited data) that AI quality consistently exceeds founder quality.

6. **Truth-telling is the product.** We get paid to tell the truth, including "you should not list." Every engagement produces an honest list/don't-list memo. The 70% of owners whose businesses won't close pay for diagnostic honesty, not for a sales pitch.

7. **The Scorta Score is the protocol.** Every pitch, every marketing artifact, every advisor pitch, every lender conversation references the Scorta Score by name. Repetition is how a standard becomes a standard. Carfax didn't become Carfax by being modest about it.

8. **We don't compete on price; we compete on outcomes.** Hybrid pricing structurally beats the 10% commission while supporting real human work. We don't discount to Baton/OffDeal levels, we don't tier into $99 SaaS plays. The upfront fee is the cost of being told the truth.

9. **Trust is built one closed deal at a time.** Every customer interaction is evaluated against "would this person refer us to their best friend." Brand is a Phase 3 lever; trust is built starting today.

10. **We say "broker" out loud.** We are an AI-native broker (the public framing) running on an agent-native operations stack (the architecture). We replace traditional brokers. We don't hedge with "we're not a broker (yet)" or "we're a sale-readiness platform." Owners compare us to brokers and we want to win that comparison head-on — *and then* we deepen the conversation into the pre-market underwriting layer and the agent fleet underneath.

11. **Depth over velocity in channel partnerships.** 5 deeply engaged CPA partners sending 3 referrals each beats 50 logo'd partners sending nothing. First 5 CPA partnerships take 3 months each. Plan accordingly.

12. **Founder-led sales until further notice.** Both founders are personally selling and personally running deals through end of Phase 2. Founder-led selling continues at scale for the largest deals and most strategic channel partnerships.

13. **Honesty about gaps.** When we don't have legal review or compliance buildout in place, we say so — internally, to investors, to partners. Hidden gaps become bigger problems than acknowledged ones. The same applies to traction: 9 paying customers, $35K collected (March $3K → April $8K → May $24K), 2 brokerage agreements signed but zero closed brokered deals at week 7 is what it is. The right benchmark is the next 25 engagements and the close rate by deal 50, and we will publish those numbers.

14. **The check we use to evaluate any decision.** Does this make Scorta more like the trust protocol for Main Street M&A in the NJ/NY/CT corridor, or less? If less, we don't ship it.

---

## 22. Market Data & Source Inventory

Citations and caveats for use in written applications and to fact-check spoken answers.

**Demographics and wave:**

- 52.3% of US employer firms owned by people 55+; 74% plan to sell or transfer. *Source: Gallup, "Most Small-Business Owners Lack a Succession Plan," March 25, 2025 (news.gallup.com/poll/657362).*
- 2.9M US businesses owned by people 55+, supporting 32.1M employees, $1.3T payroll, $6.5T revenue. *Source: Project Equity, "20 Key Business Owner Statistics on Exits & Succession."*
- 73% of privately held US companies plan to transition ownership within the next decade; $14T opportunity. *Source: Exit Planning Institute, 2023 State of Owner Readiness.*
- 49% of owners plan to exit within 5 years. *Source: EPI, 2023.*

**Dysfunction and close rates:**

- 70–80% of small business listings never sell. *Source: broker-association consensus; Worldwide Business Brokers analysis; EPI State of Owner Readiness; BizBuySell median 6.46% listing-to-close rate 2018–2022 per Teamshares analysis. Use as directional industry claim, attributed to broker-association consensus — not a single rigorous study.*
- Only ~20% of Main Street businesses under $1M revenue sell. *Source: Worldwide Business Brokers analysis.*
- Median sale price of closed BizBuySell businesses 2022: $315K. *Source: BizBuySell Insight Report via Teamshares.*
- HVAC business median asking price: $649,950; median revenue $1,035,546; median SDE $232,307. Median sale price grew 65% from <$500K (2020) to >$800K (2024). *Source: BizBuySell HVAC Valuation Benchmarks.*

**Why deals die (Axial 2025 Dead Deal Report):**

- 21.3% of post-LOI failures in 2025 from QoE/EBITDA discrepancies — vs. 10.6% in 2023. The single fastest-growing reason deals die post-LOI.
- 78% of buyers walk on deals that lack three years of reviewed financials. *Source: Strategic-Sharpenings analysis; use as supporting evidence for the pre-market underwriting mandate. Verify primary source before citing in written applications.*

**Industry market and broker norms:**

- US business brokers industry size: $1.8B; "80% untapped" (only 20% of businesses sold are sold by a broker). *Source: Marketdata LLC 2024 report.*
- IBBA Q3 2025 Market Pulse: Main Street ($0–$2M) median multiples held steady; Lower Middle Market $5M–$50M rebounded to 5.5x EBITDA. Baby Boomers ~60% of current sell-side. *Source: IBBA & M&A Source Market Pulse Q3 2025, 300 respondents, 247 transactions.*
- Time to close: $500K–$1M historically ~6 months; larger deals 7+ months. Industry consensus: 6–10 months for Main Street.
- Broker commissions: 10–15% under $1M, reduced above; minimum fees $15K–$100K common. *Source: BizBuySell Learning Center; Synergy Business Brokers.*

**Regulatory:**

- 17 states require business broker real estate license; New Jersey does not. *Source: American Business Brokers Association; BizBuySell Learning Center; Sigma Mergers analysis.*
- SBA SOP 50 10 8 effective June 1, 2025. Permits CPA-prepared or CPA-reviewed financials in lieu of tax returns for the first time. 10% equity injection enforcement, full-standby seller notes, citizenship verification, mandatory CPA-vs-tax-return reconciliation.

**Lender and capital data:**

- Live Oak Bank: #1 SBA 7(a) lender by dollar volume (2018, 2019, 2020, continuing). Q1 2026 loan production $1.37B. 24–48 hour pre-qual capability. Explicitly NJ-based senior loan officer (Todd Dobiszweski). *Source: Live Oak Bank; Exit Planning Exchange; LinkedIn Q1 2026 results.*
- Stanford GSB 2024 Search Fund Study: record 94 new search funds launched in 2023; 35.1% aggregate IRR.
- Citrin Cooperman 2025 Independent Sponsor Report: 74% of independent sponsors source deals from business brokers.

**AI diligence capability (the "Why Now" tech wave):**

- Hebbia: 92% extraction accuracy on complex financial/legal documents (vs. 68% baseline RAG).
- Keye: deterministic 100% extraction across PE diligence workflows.
- V7, Energent: in production at PE firms.

**Competitor funding (verify against current Crunchbase before any application):**

- **Baton Market:** $15.5M total. Series A $10M Jan 22, 2025 (Obvious Ventures lead). 51 employees per Tracxn March 31, 2026.
- **OffDeal:** $17M total. Series A $12M July 2025 (Radical Ventures lead). ~$100M valuation. <10 employees with 3 dedicated bankers.
- **Iconic:** Single undisclosed round. Acquired Integral Capital Advisors September 2024. 34 employees per Tracxn March 31, 2026.

**Caveats to use carefully:**

- The "70–80% of listings never close" statistic is broker-industry consensus, not a single rigorous study. The cleanest underlying datapoint is BizBuySell's 6.46% median close rate 2018–2022, which is a listing-to-close ratio (a different framing of the same dysfunction). Use the 70–80% figure as a directional claim, attributed.
- Iconic's "$2B+ transaction volume" claim could not be independently verified in available 2024–2026 sources (PR Newswire launch, LA Business Journal acquisition coverage, Iconic's own materials). Treat cautiously; characterize Iconic as a tech-enabled M&A advisory serving up to $100M revenue clients.
- Baton's "70% close rate" is a survivorship metric measuring closed deals against accepted Baton listings, not all sellers who approached.
- OffDeal's claimed deal-size range varies across sources — homepage says "$5–100M revenue"; funding-round coverage cites "$10–100M revenue, $1–10M EBITDA"; YC listing references "$10–50M SMB acquisitions" as their original buy-side product. Floor is multiples above Scorta's segment regardless.
- The "advisor decline rate ~70% of opportunities as non-saleable" is broker community consensus, not from a single rigorous source. Frame as such or pair with EPI owner-readiness data.
- 9 paying customers, $35K collected in ~7 weeks (March $3K, April $8K, May $24K — month-over-month growth from a small base). Avg ACV ~$3.9K on Diagnostic engagements; range $3K–$5K. Customer mix: 2 marketing agencies, 3 home services, 3 restaurants, 1 jewelry brand (central NJ + NYC). First two brokerage agreements signed (with both marketing agencies, 5% success fee on close, both SBA pre-qualed). Median Main Street time-to-close is 6–9 months, so absence of closed brokered deals at week 7 is structural. The close-rate uplift thesis remains unproven and must be measured rigorously over the next 12 months.
- Verify all funding/headcount claims against current Crunchbase data before any second-round VC interview.

---

## 23. The Napkin Pitch

**The one-line version (current pitch):**

> *"We're an AI-native broker and pre-market underwriting layer for Main Street businesses in the NJ/NY/CT corridor — agent-native operations stack underneath."*

**The one-line version (after Shift 1 — The Scorta Score):**

> *"We publish the Scorta Score — the FICO for Main Street M&A — and we underwrite every business in NJ/NY/CT against it."*

**The one-line version (after Shifts 1+2+3):**

> *"Scorta is building the Scorta Score, the underwriting protocol that NJ/NY/CT SBA lenders, capital-verified searchers, and CPAs are paying to use — and sellers come to us to get scored."*

**The unifying message:**

> ***Scorta is the Main Street trust protocol. Lenders pay for it. Capital-verified buyers ask for it. Sellers earn it. The dataset compounds with every certified deal.***

**The "why now" line:**

> *"SOP 50 10 8 made CPA-reviewed financials lender-acceptable for the first time in June 2025. A trust standard is now required. We are it."*

**The "how are you different" line:**

> *"We are not an AI tool for brokers. We are the underwriter, prep shop, and broker-of-record — run end-to-end by a coordinated fleet of specialized agents with humans on the approval layer. SBA-fundable, buyer-ready, term-sheet in hand — or we don't get paid."*

**The "what's the moat" line:**

> *"The unstructured deal-process dataset — lender concerns, buyer objections, broker negotiations trapped in PDFs and emails — captured during paid engagements. Plus the agent stack that converts that data into reproducible workflow on every new deal. Patterns we see twice become checklists; patterns we see ten times become agents."*

**The chicken-and-egg line:**

> *"We aggregate the scarce side (capital-verified buyers + SBA lenders) first. Sellers come because the demand side is already there and paying."*

**The why-us line:**

> *"A buy-side micro-PE operator who has lived the diligence experience, paired with a Forward Deployed Engineer who has built exactly this kind of structured-document underwriting AI in production at insurance scale — with one prior exit together. That's the bet."*

---

## 24. Investor Pushback — Q&A Category Map

The full spoken answers, underlying VC concerns, and follow-up rebuttals for every category below are in `scorta-context.md` Part 2. This section exists as a navigation index — before any investor meeting, review the category, then pull the spoken answer from the context file.

The 20 investor questions that come up in every ERA / YC / pre-seed conversation fall into seven categories:

**Category 1 — Competitive differentiation** *(the most critical cluster)*
- How are you meaningfully different from Baton, Iconic, and OffDeal?
- Why would a seller choose you over a traditional broker?
- What makes Scorta's AI use architecturally different from Baton's or OffDeal's?
- Why won't bigger competitors just copy this?
- What if Baton or OffDeal moves down-market or adds a remediation layer?

**Category 2 — Product and data moat**
- What is your unique value proposition in one sentence?
- What really is your product and the envisioned product suite?
- How are concierge engagements building toward something defensible — or is this just an agency?
- What's the moat beyond "we'll have more data"?

**Category 3 — Business model and pricing**
- What would you do with accelerator capital?
- How do you compete on price when Baton has 6% + $1K/mo and OffDeal charges nothing upfront?
- Why is your TAM not just the marketplace inventory — $3.5K ACV doesn't scale.

**Category 4 — Traction and proof**
- Does paid prep actually translate to closed sales? You have nine customers, two signed brokerage agreements, and zero closes.
- You have nine paying customers, $35K collected, and zero closed deals — why is now the right time to fund?

**Category 5 — Market sizing and timing**
- Why now? This problem has existed for 40 years.
- How big can this get? Show me $1B+.

**Category 6 — Risks and objections**
- What kills this company? *(Three failure modes in order of likelihood: channel velocity, close-rate translation, incumbent pivot.)*
- Why services-heavy? Doesn't that limit scale and venture multiples?
- What about regulatory risk?

**Category 7 — Team**
- Why you two? What's the founder-market fit?

**Key spoken frames to internalize before any meeting:**
- *"Baton's AI is a power tool. OffDeal's AI is a power tool with a banker on top. Ours is the assembly line that produces a new product — a certified business — that didn't exist as a category before. The output is different, not just the production cost."*
- *"Year 1: 80% human, 20% software. Year 2: 60/40. Year 3: 40/60. Year 5: predominantly software and certification fees. This is how Stripe, Carta, and Plaid all started."*
- *"If our close rate isn't materially above the 20% Main Street baseline by deal 50, the thesis is wrong and we should pivot."* Own this — VCs respect the honesty.

---

*This document is the source of truth for product, GTM, positioning, and strategic decisions at Scorta. It is updated quarterly. It is honest about what is handled and what is not. Every external application — accelerator, investor, partnership — draws from this document so that the company speaks with one voice. Last revision: May 16, 2026 (v6). Supersedes v5.*
