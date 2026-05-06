# Scorta — Product Strategy & Implementation (v3)

> The AI-native broker for Main Street home-service businesses. From valuation to wire transfer, with hybrid pricing that beats the 10% commission while supporting real human judgment at every customer-facing decision.

This document is the company's source of truth for product, GTM, and strategic positioning. It is updated based on operating reality, not aspiration. Last revision: Q2 2026.

The check we use to evaluate any product, hiring, or go-to-market decision: *does this make us more like the AI-native broker for Main Street home services in the Northeast, or less?* If less, we don't ship it.

---

## Table of Contents

1. [What Scorta Is](#1-what-scorta-is)
2. [Why Now](#2-why-now)
3. [The Problem](#3-the-problem)
4. [Strategic Thesis: The Four Moats](#4-strategic-thesis-the-four-moats)
5. [Phase 1 — The Wow That Builds the Flywheel](#5-phase-1--the-wow-that-builds-the-flywheel)
6. [Phase 2 — The Operating System for the Sale](#6-phase-2--the-operating-system-for-the-sale)
7. [Phase 3 — Category Leadership](#7-phase-3--category-leadership)
8. [Phase 4 — Transaction Infrastructure](#8-phase-4--transaction-infrastructure)
9. [What We Are At Each Stage](#9-what-we-are-at-each-stage)
10. [Operating Principles](#10-operating-principles)
11. [Human Approval Boundaries](#11-human-approval-boundaries)
12. [Known Gaps and Risks We Are Carrying](#12-known-gaps-and-risks-we-are-carrying)

---

## 1. What Scorta Is

Scorta is the AI-native broker for Main Street home-service businesses. We replace the traditional broker end-to-end — valuation, prep, buyer materials, qualification, lender coordination, diligence, and close — with hybrid pricing that beats the 10% commission while preserving human judgment at every customer-facing decision.

**The trojan horse** is a wow experience that converts owners in 6 minutes.
**The compounding engine** is closed-deal data that makes every subsequent deal sharper.
**The lock-in** is the relationship the owner has with us six months before they sell.

What we are building toward, over a decade: **the transaction infrastructure layer for every Main Street home-service business sale in America.** Not a tool brokers use. Not a marketplace owners list on. The default place owners go when they're ready to exit, and the system that runs the deal from first thought to wire transfer.

---

## 2. Why Now

Three things changed at the same time, and they are the reason this company exists in 2026 and not 2020:

**1. AI got good enough to do broker work.** Valuation analysis, financial recasting, CIM generation, buyer outreach drafting, NDA workflow, and diligence response generation are now reliably automatable with LLMs in the loop — *with human approval at every customer-facing boundary*. Two years ago they weren't. Owner-grade outputs require frontier reasoning models with deterministic guardrails — both arrived in 2025.

**2. The boomer retirement wave is hitting an inflection.** Per Gallup analysis of US Census data, 52.3% of US employer firms (~3M of nearly 6M) are owned by people aged 55+, and 74% of employer-business owners plan to sell or transfer ownership over the long term. Most want to exit. Most can't, because the business isn't sellable and no broker will do the prep work.

**3. The unit economics that excluded these deals are inverted.** A human broker earning 10% on a $1M sale nets $100K and still loses money on small messy deals — the work is too manual, the deals too small. A hybrid pricing model — small retainer + capped success fee — is materially cheaper for the seller, structurally more profitable for us as automation matures, and creates the cash flow predictability a flat fee cannot.

There has never been a credible attempt to build the broker for sub-$2M Main Street businesses because, until now, the math didn't work. It does now.

---

## 3. The Problem

Most Main Street businesses are not sellable in their current state. Books are messy. Owner is the business. No documentation exists. Financials don't pass SBA underwriting. Seller has no idea what their business is worth. They want to exit, and they can't.

Per BizBuySell's benchmark dataset: sold HVAC businesses had a $750,000 median sale price, $304,309 median owner earnings, and 186 median days on market — exactly the transaction band where a lower-cost, high-trust advisor matters most. And industry data suggests 70–80% of small businesses listed for sale never actually close.

Today owners have three options:

- **Hire a traditional broker.** 8–12% commission. Brokers cherry-pick deals over $2M and "list and pray" on smaller ones. Process runs on PDFs and email.
- **List on a marketplace** (BizBuySell, Acquire.com, BizQuest). Marketplaces don't prep the seller, qualify the buyer, or run the transaction. Most listings sit and rot.
- **Try to sell it themselves.** Almost never works. They don't know what to ask for, what to share, how to qualify a buyer, or how to get to close.

Scorta is the fourth option: **we do the work.**

The buyer side is also broken. Buyers (search funds, micro-PE, family offices, strategic acquirers) waste months on underprepared listings. They lose deals that die in SBA underwriting because nobody set them up to be financeable. The buyer side becomes a Phase 3 product. The wedge is the seller side, because that's where the supply bottleneck is.

---

## 4. Strategic Thesis: The Four Moats

There are very few enduring moats left for software companies in 2026. The ones that still work:

1. **Proprietary data flywheel** — data that gets better with each customer in ways competitors can't replicate by spending money
2. **UI/UX for AI-native interaction** — visual languages and interaction models that take taste, time, and engineering to build coherently
3. **Distribution and market penetration** — channel relationships and brand presence that compound over years
4. **A fundamentally unique wow experience** — the marketing surface that makes the underlying moats visible to a customer in seconds

A world-class company in this category needs all four. Scorta is structured to build all four simultaneously, with the wow experience leading distribution in Phase 1, the data flywheel compounding underneath, and the UI/UX investment establishing a visual language that becomes recognizable as ours.

### Moat 1: The Closed-Deal Data Flywheel

**The asset:** structured records of every transaction we touch — what business sold, at what price, to which buyer archetype, with what deal structure, against what financing, with what objections raised in diligence, what fixes moved the needle, what timelines actually played out.

**Why it compounds:**
- Every closed deal sharpens our valuation model on the next deal
- Every objection raised in diligence becomes a red flag we screen for upstream
- Every successful structure (cash + seller note + earn-out blend) becomes a template
- Every lender approval/rejection teaches us their underwriting box better than they document it
- Every buyer interaction makes our buyer-agent personas more realistic

**Why competitors can't catch up by spending money:**
- BizBuySell has listings, not closed-deal outcomes. Brokers have closed deals but fragmented across thousands of small firms in PDFs and email threads. There is no clean closed-deal dataset for Main Street M&A in existence today.
- Buying the data doesn't work because there's nothing to buy
- Each closed deal feeds back into the agents that produce the wow for the next prospect

**The flywheel as a loop:**

1. ExitIQ + Boardroom produces an unusually accurate, specific, valuable read for an owner →
2. Owner converts to paid engagement →
3. Scorta runs the full sale, capturing every signal along the way →
4. Closed deal feeds back into buyer agents, comp engine, SBA screen, and fix recommendations →
5. Next ExitIQ + Boardroom is sharper, more specific, more valuable →
6. Conversion rate goes up; engagement value goes up; the wow gets harder to clone

This is the loop the entire company is built to spin. Every architectural and operational decision should be evaluated against whether it speeds up this loop.

**Critical legal addition:** every customer engagement agreement explicitly grants Scorta the right to use anonymized deal data for future Boardroom comps and aggregate analytics. Without this consent layer, the moat thesis has a legal hole. See §12 for the gap on getting these agreements professionally drafted.

### Moat 2: UI/UX for AI-Native Decision Support

**The thesis:** every owner in this category will ask AI to help them sell their business in the next 24 months. Most will use ChatGPT and get a bad answer. Some will use a generic assistant and get a slightly better one. The winning product will be the one that uses AI in a *qualitatively different interaction model* — not chat, not forms, but something that feels like sitting in a room with a team of advisors.

The Scorta visual language, built phase by phase:

- **The Boardroom (Phase 1)** — three buyer agents simulating offers in real time
- **The War Room (Phase 2)** — live diligence command center
- **The Lender Desk (Phase 2)** — real-time SBA financeability across multiple lenders
- **The Negotiation Table (Phase 3)** — AI counter-party walking owners through LOI terms

Each is a custom-built UX surface for a specific decision moment. Together they form a visual language unique to Scorta — the way Stripe's developer dashboard has a visual language unique to payments.

**Why this is moat-like:** multi-agent streaming UIs require taste, animation chops, prompt engineering, and a coherent visual system. Most teams ship one of those four. The interface ideas are easy to describe and hard to copy well.

### Moat 3: Distribution Through Channel Partners

**The thesis:** the cheapest, highest-trust path to Main Street owners is not direct marketing — it's the three professionals every owner already trusts: their CPA, their banker, and their attorney. Whoever owns those relationships at scale owns deal flow at scale.

**The honest reality of channel velocity:** channel partnerships ramp slowly. CPAs are conservative. Lenders are skeptical of unproven services. The first 5 partnerships will take 3 months each. We plan accordingly — depth over velocity.

The play, in order of priority:

1. **CPAs and bookkeepers** — every CPA serving small business clients sees an exit conversation 5–10 times a year and has nothing actionable to recommend. We become their answer.
2. **SBA lenders** — lenders watch deals collapse in underwriting and want a fix-it referral. We become the place they send broken deals to be fixed.
3. **Vertical operator communities** — trade associations, franchise networks, conferences in chosen verticals
4. **Exit coaches and fractional CFOs** — already trusted advisors to owners thinking about exit; productize the resale model we've already validated

We've already validated the economics of channel #4 (the marketing-agency consultant reselling Scorta to his SMB clients). We need to industrialize channels #1 and #2 in Phase 2.

### Moat 4: The Wow Experience as Distribution

The wow is the demo. It's what gets us in the door — with VCs, with customers, with channel partners. It is *not* the moat by itself. It's the moat's distribution mechanism.

What makes Scorta's wow defensible is not the Boardroom UX (clonable in 90 days). It's that the Boardroom is powered by data nobody else has (Moat 1) and rendered through a UX language nobody else has built coherently (Moat 2). The wow is what makes the underlying moats *visible* and *valuable* in 6 minutes.

We will keep ratcheting the wow as the data flywheel matures. Phase 1 wow: three buyer agents simulating offers. Phase 3 wow: three buyer agents simulating offers, *plus the line "we've sold 47 businesses like yours in the last 12 months — here are their actual outcomes."* The same demo gets unanswerable as the data accrues.

### A Fifth Implicit Moat: Trust at the Moment of Decision

Selling a business is the largest financial decision most Main Street owners ever make. The winner in this category will be the brand owners trust when they are scared. Trust compounds slowly, deliberately, and is genuinely hard to copy. We build it one closed deal at a time, on referenceable outcomes.

Brand work in Phase 1 is restraint: don't overpromise, don't oversell, look serious. Brand work in Phase 3 is publication: case studies, the Main Street Exit Report, podcast presence, conference circuit. The brand we are building is "the firm Main Street owners trust to handle the most important transaction of their lives."

---

## 5. Phase 1 — The Wow That Builds the Flywheel

**Timeline:** Now through Q3 2026 (approximately 8–12 weeks of build, then 90 days of validated learning)

**Geographic and vertical wedge:**
- **Verticals:** Home services — HVAC, plumbing, electrical, landscaping, pest control, roofing, auto repair
- **Geography:** New Jersey + New York metro area (NJ, NY, eastern PA, southern CT)
- **Deal size:** $500K–$2M enterprise value, $100K–$500K SDE
- **Buyer types (by likelihood, in order):** SBA-financed individual buyers (searchers), local strategic acquirers, family offices

The geographic choice is deliberate: founders are NJ-based, dense small-business population, accessible for in-person meetings during the relationship-building phase, and avoids the Florida real-estate-license-includes-business-interests issue that affected our earlier Sun Belt plan. Sun Belt expansion comes in Phase 3.

**Phase 1 success criteria** (these are the gates to Phase 2 investment):

1. ExitIQ → founder call conversion: **≥15%** of completed assessments (qualified) book a call within 7 days
2. Founder call → paid engagement conversion: **≥30%** of founder calls convert to paid engagement at $3K–$10K
3. **≥10 closed concierge engagements** with full structured closed-deal records logged
4. **≥5 deeply engaged channel partners** (CPAs, lenders, or exit coaches) actively sending referrals
5. The Boardroom passes the **"savvy owner with ChatGPT" test** in side-by-side blind comparisons with 5+ owners
6. **Zero customer-facing factual errors** that required post-send correction

If criteria 1–5 hold and #6 stays clean by end of Phase 1, we move to Phase 2 build with conviction. If 3 of 5 functional criteria hold, we extend Phase 1 by a quarter. If fewer than 3, we revisit thesis.

### 5.1 Product Surface — What the User Sees

Five experiences in order:

**1. The Landing.** Single page, dark visual, restrained. The aesthetic of an investment bank microsite, not a SaaS landing page. The headline is the offer: *"See what your business is actually worth — free, 6 minutes, three buyers will tell you."* Single CTA. No tier comparison, no testimonials yet (we don't have enough), no pricing page.

**2. ExitIQ Assessment (6 minutes).** Conversational form, four sections, save-and-resume. Every question phrased as a sharp advisor would phrase it, not a form. Owner email captured at end of section 2. See §5.2 for the full assessment design.

**3. Generation Phase (60–90 seconds, watchable).** This is theater that happens to be real. Status feed:
   - *"Pulling 47 comparable sales in HVAC in NJ/NY metro..."*
   - *"Running your numbers against 6 SBA lender underwriting models..."*
   - *"Convening The Boardroom — three buyer agents are evaluating your business..."*

   The loading state itself is part of the wow. Most assessment tools throw up a spinner; we narrate the work.

**4. The Boardroom (the wow moment).** Owner lands on a custom page for their business. Hero element: visual "boardroom" UI with three buyer-agent cards rendering in sequence. **The Searcher renders first** (most representative of likely actual buyer in $500K–$2M EV band), then The Strategic, then The Operator. Each agent streams its analysis over ~30 seconds. Every Boardroom output carries a prominent "simulation, not actual offers" disclaimer. See §5.3 for full Boardroom spec.

**5. The Gap Report.** Below the Boardroom, a single scrolling page:
   - ExitIQ score (0–100) across 5 dimensions
   - Three offer scenarios (table view, prices and structures)
   - Valuation gap analysis ("why The Strategic pays $700K more than The Searcher")
   - SBA pre-screen result (✅ / ⚠️ / ❌ with specific gating items)
   - 90-day fix list, each item priced (cost, time, valuation impact)
   - 12-month fix list, each item priced
   - Comparable sales — 3–5 anonymized real recent transactions
   - Single CTA: *"Book 30 minutes with a founder. We'll quote you a transparent fee structure to make these fixes and run the sale."*

### 5.2 ExitIQ Assessment Design

Four sections, each gating progression. Designed to take 6 minutes for a prepared owner, 12 minutes for an unprepared one. Email captured at the end of section 2 so we have the lead even if they bail.

**Section 1: Financials (90 seconds)**
- Annual revenue (last 3 years)
- COGS as % of revenue
- Operating expenses (last 12 months total)
- Owner total compensation (salary + benefits + perks + distributions)
- SDE if known; if unknown, we calculate it
- Growth trajectory (single chart-style input)

**Section 2: Business Health (2 minutes)**
- Customer concentration (% from top 1, top 5, top 10 customers)
- Recurring vs. project revenue split
- Owner involvement (hours/week, % of revenue from owner relationships)
- Employee count (FTE, contractor)
- Key person dependencies (sales, operations, technical)
- *Email captured here as "save your progress"*

**Section 3: Buyer-Lens Factors (90 seconds)**
- Industry / NAICS code (auto-suggest, with vertical-specific follow-up questions)
- Geography (metro level)
- Lease situation (owned, leased, lease term remaining)
- Equipment age and condition
- Customer contracts in place (yes/no, average term)
- Licensing / regulatory factors

**Section 4: Seller Goals (60 seconds)**
- Timeline to exit (now, 6 months, 12 months, 24 months, exploring)
- Target sale price (or "don't know")
- Willingness to do seller note (yes / no / depends)
- Post-sale involvement (clean exit, transition period, ongoing role)
- Confidentiality concerns (high / medium / low)
- Reason for selling (retirement, burnout, health, opportunity, other)

**Output of assessment:** structured `Business` and `SellerProfile` records that feed everything downstream.

### 5.3 The Boardroom — Detailed Spec

The Boardroom is the wow. It is also the engineering hardest part of Phase 1. Plan accordingly.

**The three buyer-agent personas** (v1: fixed; expand later). Note the order: The Searcher renders first because it represents the most likely buyer for our $500K–$2M EV wedge.

**Persona 1 — The Searcher ("Madison Park Search Fund")** *(renders first)*
- Profile: Solo searcher, SBA 7(a) financing, looking for one business to operate
- Acquisition criteria: SDE $200K–$700K, owner-independent or close, SBA-financeable
- Pricing logic: Market (3.0x–3.8x SDE); structure includes 10–15% seller note
- Underwriting weights: SBA financeability (highest), owner-independence (highest), DSCR (high), industry stability (medium)
- Walk-aways: Cannot get SBA approval, owner can't be replaced for under $120K, DSCR < 1.5

**Persona 2 — The Strategic ("Apex Holdings")**
- Profile: Multi-state vertical roll-up, PE-backed, acquiring 8–12 add-ons per year
- Acquisition criteria: SDE $400K–$1.2M, recurring/repeatable revenue, willing to retain owner 12–24 months
- Pricing logic: Top of market (4.5x–5.5x SDE) for quality fit; structure includes earn-out tied to retention
- Underwriting weights: Customer concentration (high), brand/contracts (high), owner-independence (medium), location (low)
- Walk-aways: >40% customer concentration, no contracts, owner is the entire sales engine

**Persona 3 — The Operator ("Carter Family Office")**
- Profile: Wealthy family acquiring for cash flow and capital preservation
- Acquisition criteria: SDE $300K–$900K, all-cash, low-volatility industries
- Pricing logic: Below market (2.8x–3.5x SDE) but offers cash and certainty
- Underwriting weights: Cash flow stability (highest), recession resistance (high), recurring revenue (high), growth (low)
- Walk-aways: Cyclical industries, declining trends, customer concentration > 25%

**Each persona produces a structured output:**
- Numeric offer price
- Deal structure breakdown: cash %, seller note %, earn-out %
- 3–5 specific objections sourced from the owner's actual answers (not generic)
- "Would proceed to LOI" verdict with named conditions
- One-sentence "what we'd want in diligence" summary

**Critical disclaimer:** every Boardroom output carries prominent language: *"This is a simulation based on real buyer archetypes. These are not actual offers. Actual buyer offers may differ materially. Scorta is not making a recommendation about the value of your business or the terms of any actual transaction."*

This disclaimer is not just legal hygiene — it is honest. The Boardroom is the best simulation we can build, but it is a simulation. Owners should treat the output as preparation for real conversations, not as actual offers.

**The Living Comp Card.** Critical addition: every Boardroom output displays anonymized real comps below each buyer's offer. *"The Searcher's $1.4M offer is in line with these 3 recent sales: HVAC business in northern NJ, $1.1M revenue, $340K SDE, sold for $1.05M (3.1x SDE) Q4 2025; ..."*

This is what makes the wow data-grounded rather than LLM-narrated. Critically, **every closed deal we run becomes a comp for future Boardroom runs.** The first deal feeds the second deal's wow. The flywheel becomes visible to the user.

### 5.4 SBA Pre-Screen

**Sources for v1:**
- SBA SOP 50 10 7 (the actual SBA underwriting handbook, public document)
- Live Oak Bank's published criteria for SBA 7(a) acquisition loans
- Cooperative SBA lender contacts (leverage Suyash's micro-PE network — searcher community has these relationships)

**The pre-screen evaluates:**
- Industry eligibility (some NAICS codes are restricted)
- Owner cash flow vs. debt service coverage (DSCR)
- Add-back validity (we model the ones banks accept and the ones they reject)
- Down payment sufficiency
- Seller note structure compatibility
- Industry-specific gating items (licensing, environmental, real estate components)

**Output:** ✅ "Likely SBA-financeable as-is" / ⚠️ "Financeable with these 2 specific fixes" / ❌ "Not financeable today; here's the path."

This is the single most valuable output in the entire Gap Report. Owners and brokers spend $5K–$15K to learn this information through traditional channels. We deliver it in 90 seconds — flagged appropriately as a pre-screen, not a lender commitment.

### 5.5 Fix Recommendations (Priced)

Each red flag from the assessment generates a fix recommendation with:
- Specific action ("hire a GM to handle daily ops")
- Cost to implement ("$95K/yr base + 10% bonus")
- Time to implement ("60–90 days to hire and onboard")
- Valuation impact (delta in $ across the three buyer scenarios)
- Dependency chain (which fixes unlock which subsequent fixes)

Pricing the fixes is the move that makes the report feel like a $25K bank study. ChatGPT doesn't price fixes against the owner's specific buyer pool because ChatGPT doesn't have the buyer pool.

### 5.6 Tech Architecture

**Frontend:** Next.js 15 (App Router), React 19, Vercel hosting. Boardroom UI uses streaming SSE to render each buyer-agent's analysis progressively. Animation library: Framer Motion. UI primitives: shadcn/ui customized with the Scorta design system.

**Backend:** Next.js Route Handlers for synchronous endpoints (assessment, auth). Async job runner for the Boardroom generation pipeline (Inngest preferred — Vercel-native, good DX, schedulable retries).

**Database:** Supabase (Postgres). RLS enforced on every table. Schema versioned via Supabase migrations.

**AI orchestration:**
- Claude Sonnet 4.5 for reasoning-heavy steps: buyer-agent analysis, valuation narrative, lender-readiness explanation, fix recommendation rationale
- Claude Haiku 4.5 for high-volume parsing and classification: NAICS auto-classification, document extraction, email parsing
- All prompts versioned in code. Evaluation harness (see §5.10) measures every prompt version against a fixed benchmark set
- Structured output enforcement: JSON schema validation on every LLM call that produces structured data. Refusals and truncations trigger fallback paths and human-review queue routing.
- Temperature 0.3 for buyer agents (stable behavior across runs); 0.5 for narrative generation

**Deterministic vs. LLM:**
- Valuation math: deterministic (multiples × SDE adjusted by red/green flags). LLM never used for the numbers themselves.
- SBA screen: rules engine; LLM wraps the verdict in plain-English explanation
- Fix cost/time/impact: deterministic from a rules table; LLM writes the narrative
- Boardroom buyer-agent reasoning: LLM with structured output schema enforced

**Provenance and approval architecture (new in v3):**
- Every LLM-generated claim that appears in a customer-facing artifact links to its source (source document chunk, deterministic calculation reference, or persona prompt version)
- Evidence store: separate table tracking source attribution for each generated sentence
- Human approval queue: no customer-facing artifact (CIM, lender package, buyer outreach) ships without founder review and explicit sign-off
- Immutable audit log: every action on a deal (document upload, AI generation, founder approval, send) is logged append-only with timestamp, actor, and content hash

**Document ingestion (Phase 2 readiness):** plan to use LlamaParse or Unstructured for tax returns and P&Ls. Build the abstraction layer in Phase 1 even though we don't fully use it. Add redaction pipeline for SSNs, bank account numbers, and tax IDs before any document upload feature ships to customers.

**Email:** Resend (transactional) + Loops (nurture campaigns)

**Payments:** Stripe (only after founder call → quote → contract — never on the assessment itself)

**Analytics:** PostHog (product analytics) + custom funnel tracking written to a `funnel_events` table in Postgres for SQL access. Sensitive financial data never flows to analytics tooling.

### 5.7 Data Model (Phase 1 — The Foundation of the Moat)

This schema is the load-bearing center of the entire company. Build it carefully in Phase 1; rework is expensive later.

```sql
-- Owners and businesses

owners (
  id uuid pk,
  email text unique,
  phone text,
  created_at timestamptz,
  source text,
  source_partner_id uuid nullable,
  notes text
)

businesses (
  id uuid pk,
  owner_id uuid fk -> owners,
  business_name text,
  vertical text,
  naics_code text,
  geography_metro text,
  geography_state text,
  founded_year int,
  employee_count int,
  lease_status text,
  lease_term_remaining_months int nullable,
  created_at timestamptz
)

financials (
  id uuid pk,
  business_id uuid fk -> businesses,
  fiscal_year int,
  revenue numeric,
  cogs numeric,
  opex numeric,
  owner_comp numeric,
  sde numeric,
  growth_pct numeric nullable,
  source text
)

business_health (
  id uuid pk,
  business_id uuid fk -> businesses,
  customer_concentration_top1 numeric,
  customer_concentration_top5 numeric,
  customer_concentration_top10 numeric,
  recurring_revenue_pct numeric,
  owner_hours_weekly int,
  owner_relationship_revenue_pct numeric,
  key_person_deps jsonb,
  contracts_in_place boolean,
  contracts_avg_term_months int nullable
)

seller_goals (
  id uuid pk,
  business_id uuid fk -> businesses,
  exit_timeline text,
  target_price numeric nullable,
  willing_seller_note boolean,
  post_sale_involvement text,
  confidentiality_level text,
  exit_reason text
)

-- Assessment outputs

assessments (
  id uuid pk,
  business_id uuid fk -> businesses,
  completed_at timestamptz,
  exit_iq_score int,
  dimension_scores jsonb,
  red_flags jsonb,
  green_flags jsonb,
  prompt_version text
)

valuations (
  id uuid pk,
  business_id uuid fk -> businesses,
  methodology text,
  low numeric,
  mid numeric,
  high numeric,
  multiple_used numeric,
  comps_used jsonb,
  generated_at timestamptz
)

boardroom_runs (
  id uuid pk,
  business_id uuid fk -> businesses,
  persona_id text,
  offer_price numeric,
  deal_structure jsonb,
  objections jsonb,
  proceed_verdict text,
  proceed_conditions jsonb,
  diligence_summary text,
  generated_at timestamptz,
  prompt_version text,
  model_version text
)

sba_screens (
  id uuid pk,
  business_id uuid fk -> businesses,
  verdict text,
  gating_items jsonb,
  lender_models_used jsonb,
  generated_at timestamptz,
  rules_version text
)

fix_recommendations (
  id uuid pk,
  business_id uuid fk -> businesses,
  fix_type text,
  action text,
  cost_estimate numeric,
  time_weeks int,
  valuation_impact jsonb,
  priority int,
  dependency_ids jsonb,
  generated_at timestamptz
)

-- Provenance and approval (new in v3)

evidence_links (
  id uuid pk,
  artifact_id uuid,
  artifact_type text,
  generated_text text,
  source_type text,  -- document_chunk, deterministic_calc, persona_prompt
  source_reference text,
  created_at timestamptz
)

approval_queue (
  id uuid pk,
  artifact_id uuid,
  artifact_type text,
  business_id uuid fk -> businesses,
  status text,  -- pending, approved, rejected, edited
  founder_reviewed_by uuid nullable,
  founder_decision_at timestamptz nullable,
  founder_edits jsonb nullable,
  created_at timestamptz
)

audit_log (
  id uuid pk,
  business_id uuid fk -> businesses,
  actor_type text,  -- ai_agent, founder, owner
  actor_id text,
  action_type text,
  artifact_id uuid nullable,
  content_hash text,
  metadata jsonb,
  occurred_at timestamptz
)

-- The flywheel: comps and closed deals

comps (
  id uuid pk,
  vertical text,
  naics_code text,
  geography_metro text,
  geography_state text,
  revenue numeric,
  sde numeric,
  sold_price numeric,
  multiple numeric,
  sold_date date,
  source text,
  scorta_deal_id uuid nullable,
  anonymized_description text,
  is_active boolean default true
)

-- THE MOAT: closed deal records

closed_deals (
  id uuid pk,
  business_id uuid fk -> businesses,
  buyer_archetype text,
  buyer_anonymized_profile jsonb,
  final_sale_price numeric,
  deal_structure jsonb,
  cash_at_close numeric,
  seller_note_amount numeric,
  seller_note_terms jsonb,
  earn_out_amount numeric nullable,
  earn_out_terms jsonb nullable,
  financing_type text,
  lender_id uuid nullable,
  
  engagement_start_date date,
  loi_signed_date date nullable,
  diligence_start_date date nullable,
  closed_date date,
  total_days_to_close int,
  
  diligence_objections_raised jsonb,
  diligence_objections_resolved jsonb,
  diligence_objections_unresolved jsonb,
  
  initial_valuation numeric,
  fixes_implemented jsonb,
  fixes_skipped jsonb,
  valuation_lift_attributable_to_fixes numeric,
  
  what_worked text,
  what_didnt text,
  template_for_future boolean,
  notes text,
  
  closed_at timestamptz
)

-- Funnel tracking

leads (
  id uuid pk,
  owner_id uuid fk -> owners,
  business_id uuid fk -> businesses,
  source text,
  utm_data jsonb,
  funnel_stage text,
  call_booked_at timestamptz nullable,
  call_held_at timestamptz nullable,
  quote_sent_at timestamptz nullable,
  quote_amount numeric nullable,
  paid_at timestamptz nullable,
  paid_amount numeric nullable,
  closed_lost_reason text nullable
)

-- Channel partners

channel_partners (
  id uuid pk,
  partner_type text,
  organization_name text,
  primary_contact_email text,
  primary_contact_name text,
  agreement_signed_at timestamptz nullable,
  referral_fee_pct numeric,
  white_label boolean,
  active boolean,
  vertical_focus text nullable,
  geography_focus text nullable
)

partner_referrals (
  id uuid pk,
  partner_id uuid fk -> channel_partners,
  business_id uuid fk -> businesses,
  referred_at timestamptz,
  outcome text,
  fee_paid_amount numeric nullable,
  fee_paid_at timestamptz nullable
)

-- Lenders

lenders (
  id uuid pk,
  name text,
  type text,
  underwriting_criteria jsonb,
  active_partnership boolean,
  partnership_signed_at timestamptz nullable,
  preferred_verticals jsonb,
  contact_info jsonb
)
```

Every table is RLS-scoped by `owner_id` where applicable. The `comps` and `lenders` tables are read-cross-org. The `closed_deals` table is the most important table in the company — every concierge engagement we run *must* produce a complete record.

### 5.8 The Three Phase 1 Additions That Plant the Flywheel

These are small features in build effort but enormous in strategic impact. They are the difference between Scorta-the-services-business and Scorta-the-VC-grade-data-asset.

**Addition 1: The Living Comp Card** (already specified in §5.3 — the user-visible piece)

The user-visible piece is small. The strategic piece is that **every closed deal automatically becomes a future comp.** As we accumulate closed deals through Phase 1 and beyond, the comp database compounds and the wow gets sharper without any additional engineering work. Build the closed-deal → comp pipeline in week 8 of Phase 1.

**Addition 2: The Owner's Time Capsule.** When an owner completes ExitIQ, we save their full state and projection at that moment. Six months later, regardless of whether they engaged, we email them:

> *"Six months ago you ran ExitIQ. Here's what's changed: industry comps in your vertical have moved [+5%]. SBA criteria have tightened on customer concentration. Your projected sale price has moved from $1.4M to $1.6M based on those shifts. Want to revisit?"*

This is the longest-tail nurture in the industry. Only possible because we have their structured data. Provides a re-engagement event with a built-in reason to talk.

**Addition 3: Closed-Deal Capture Discipline.** From day one, every concierge engagement we run is logged into the `closed_deals` schema with a strict SLA: full record within 7 days of close, founder-reviewed, signed off. This is non-negotiable.

Build the internal admin tool for closed-deal capture in week 8 of Phase 1. The tool should:
- Pull data from existing tables (Business, Boardroom outputs, etc.) so the founder isn't re-entering
- Force completion of all required fields before allowing save
- Surface a weekly Slack/email digest of "deals closed but not logged yet"

### 5.9 8-Week Implementation Plan

Each week assumes both founders working full-time. Sequencing optimizes for "demoable to a VC by week 4, paid traffic test by week 8."

**Week 1 — Foundation**
- Schema setup in Supabase, RLS configured, migrations versioned
- Auth + basic owner/business creation flow
- Assessment shell (4 sections, save and resume, email capture at section 2)
- Deterministic valuation engine (SDE × multiple, with red/green flag adjustments)
- Static "v0 report" page that just shows valuation + score (no Boardroom yet)

**Week 2 — Assessment polish + comp seed**
- Assessment UX polish (conversational tone, copy refinement, animations)
- NAICS auto-classifier (Haiku-powered, validated against a manual list)
- Manual curation of 50 NJ/NY metro home-services comps into the `comps` table — pull from public records, BizBuySell sold-listings (manual scrape if no API yet), broker close announcements, Suyash's micro-PE network
- Funnel tracking instrumentation
- Customer engagement agreement template drafted (founder-drafted v1; legal review when funded — see §12)

**Week 3 — Boardroom v1 (the hard week)**
- Buyer-agent prompt templates for all three personas (Searcher, Strategic, Operator — in that order)
- Structured output enforcement (JSON schema validated; refusal/truncation handlers)
- Internal evaluation harness: 10 reference businesses with expected outputs, A/B prompt versions
- First end-to-end Boardroom run (no UI yet, just logged JSON outputs)
- Spend a full day per persona iterating on prompts before moving on
- Disclaimer language ("simulation, not actual offers") drafted and integrated

**Week 4 — Boardroom UI + first demoable build**
- Streaming SSE infrastructure
- Boardroom visual UI: three buyer cards, theatrical loading states, progressive reveal (Searcher first)
- Living Comp Card UI wired to seeded comp database
- First end-to-end demoable build — show to 5 friendly business owners and 3 VCs for feedback
- *Gate: if the wow doesn't land in 5/5 owner reactions, stop and iterate before week 5*

**Week 5 — SBA pre-screen + Gap Report layout**
- SBA rules engine v1: 10 most common gating items, hardcoded from SBA SOP 50 10 7
- Lender criteria models: Live Oak (published) + 1–2 from Suyash's network
- Gap Report full layout: scenarios table, valuation gap analysis, SBA verdict, fix list, comps
- PDF export of Gap Report

**Week 6 — Fix recommendations + provenance layer**
- Fix recommendation engine: rules table for cost/time/impact deltas
- LLM narrative wrapper for fix descriptions
- Dependency chain logic (which fixes unlock which)
- Fix list UI in Gap Report
- Evidence store implementation: every generated text in customer-facing outputs links to source
- Audit log table populated for every Boardroom run

**Week 7 — Funnel polish + email automation + approval queue**
- Calendly embed for founder calls
- Email automation in Loops:
  - Day 0: Report + calendar link
  - Day 2: Anonymized success story + calendar link  
  - Day 7: Plain-text personal email from founder
  - Day 14: Re-engagement based on top red flag
  - Day 180: Time Capsule email (the long-tail nurture)
- Funnel analytics dashboard (PostHog + Postgres queries)
- Founder approval queue UI: review screen for any artifact about to ship to a customer

**Week 8 — Closed-deal capture + demo mode + first traffic + ops playbook**
- Internal admin tool for closed-deal capture (the moat-feeding interface)
- Demo mode: `/demo/[seed-id]` route with 3 pre-loaded businesses (HVAC, plumbing, electrical) — VCs and prospects can see the full Boardroom run on a fully-loaded business in <60 seconds
- First paid traffic test: $2K Google + Meta budget targeted at NJ/NY home-services owners
- Founder-led outreach to first 50 owners in target vertical
- **Deal-ops playbook v1:** onboarding checklist, document-request templates, readiness rubric, CIM QA checklist, lender package checklist, response SLAs, escalation paths, close/no-go criteria

**End of week 8 deliverable:** demoable, instrumented, lead-generating product with 50 hand-curated comps, working SBA pre-screen, the closed-deal capture infrastructure ready to ingest the first concierge engagements, an evidence/approval/audit foundation, and a documented operations playbook.

### 5.10 Evaluation Harness — Critical Infrastructure

The Boardroom is the wow. If it produces inconsistent or generic output, the company fails. Build the evaluation harness in week 3 alongside the prompts themselves, not as an afterthought.

**Reference set:** 10 hand-built business profiles spanning the spectrum (great fit for Searcher, great fit for Strategic, good for Operator, terrible fit for any, etc.). Each has expected outputs codified by Suyash from his micro-PE experience.

**Scoring dimensions** for each Boardroom run:
- Specificity: do objections reference the actual business, not generic concerns? (1–5)
- Realism: would a real buyer of this archetype actually say this? (1–5)
- Pricing: is the offer in a defensible range for this profile? (within X%)
- Coherence: does the structure match the price (e.g., Searcher with all-cash = wrong)?
- **Factual accuracy:** does every claim trace to source data? (binary, must be 100%)

**Workflow:**
- Every prompt version run against all 10 reference businesses
- Outputs scored automatically where possible (pricing, structure coherence) and reviewed by Suyash for qualitative dimensions
- Prompt changes that regress on >2 reference businesses are blocked from production
- Prompt changes that produce factual hallucinations (claims not traceable to inputs) are blocked from production regardless of other scores
- Maintain a `prompt_versions` log linking every shipped prompt to its eval scores

This harness is the difference between a Boardroom that passes the "savvy owner with ChatGPT" test and one that doesn't. Skipping it is not an option.

### 5.11 Phase 1 GTM Playbook

Three plays in priority order, designed to produce 10 paid engagements and seed the closed-deal flywheel.

**Play 1: Founder-led outbound to 50 home-service operators (NJ/NY metro)**

*Why:* highest-intent, most-controllable channel for the first 90 days. Suyash's micro-PE network has the relationships.

*How:*
- Build a list of 200 target operators in HVAC, plumbing, electrical, landscaping in the NJ/NY metro
- Use ZoomInfo / Apollo for contact info; LinkedIn Sales Nav for relationship mapping
- Outreach sequence: warm intro where possible (Suyash's network), cold otherwise
- The cold outbound *uses the product*: "I ran ExitIQ on your business based on public data. Here's what The Boardroom said it's worth. Want the full report?" → attach a partial Boardroom output
- Goal: 10 conversations, 5 paid engagements, $25K in revenue

**Play 2: CPA pilot program (first 5 deeply engaged firms)**

*Why:* CPAs are the highest-trust touchpoint to small business owners. Every CPA serving SMB clients sees an exit conversation 5–10 times a year and has nothing to recommend.

*How:*
- Hand-pick 5 CPA firms in the NJ/NY metro that specialize in home services
- Pitch: "We give your clients a free Exit Readiness Score and pay you $2K for any client who becomes a paid Scorta engagement. You look smart, you have no liability, your clients get answers."
- White-label option: ExitIQ runs at `[firm-name].scorta.app` with the firm's branding
- Founder-led pitch (Suyash); 30-min Zoom; signed agreement template ready
- Goal: 5 signed CPA partners; 20 ExitIQ runs from CPA referrals; 2 paid engagements

*Operational reality:* the first 5 CPA partnerships will take 3 months each. Plan for that. Don't budget for "20 partners by Q3" and panic when you have 4. Depth > velocity.

**Play 3: The "real teaser as outbound" play**

*Why:* highest-conversion outbound mechanic in the industry. Owners who see their own business analyzed are 5–10x more likely to engage than owners pitched generically.

*How:*
- Source list: businesses listed on BizBuySell in NJ/NY metro home services (public data on revenue, SDE, asking price) — these are owners actively considering exit
- For each target, run ExitIQ with the public data + public records
- Generate a partial Gap Report (anonymized, no full Boardroom)
- Outreach: "Saw your listing on BizBuySell. I ran our AI assessment — your listing price is leaving $X on the table because of [specific issue]. Here's the full analysis if interested."
- Owners on a marketplace are a *higher-intent, validated, exit-considering* population. This is fishing where the fish are.
- Goal: 30 outbound, 10 conversations, 3 paid engagements

*Caveat:* respect privacy — do not surface info the owner hasn't already published on BizBuySell.

### 5.12 Phase 1 Budget and Burn Discipline

Two-founder team, no salaries from company revenue, modest external spend. Approximate Phase 1 monthly burn:

- AI usage (Anthropic API): $500–$1,500/month, scaling with traffic
- Hosting (Vercel + Supabase): $200/month
- Tools (Linear, Loops, Resend, PostHog, etc.): $400/month
- Comp data sourcing (BizBuySell paid access if available, paid scraping otherwise): $300–$800/month
- Paid traffic experiments: $2K/month from week 8 onward

Total ongoing burn: ~$3K–$5K/month. Sustainable on existing capital ($15K) plus ongoing engagement revenue for 4–6 months without raising. Runway is functionally open-ended at this scale.

**Fundraise strategy (parallel to Phase 1):** apply to YC and ERA in Q2 2026. If accepted, use accelerator capital + intro network for Phase 2 acceleration. If not, raise a small pre-seed ($500K–$1M) in Q3 2026 from operator-investors with SMB / services backgrounds. **Critical use of first capital includes legal review** (see §12) — this is the first dollar item, before hires and before paid acquisition scale.

---

## 6. Phase 2 — The Operating System for the Sale

**Timeline:** Q3 2026 through Q1 2027 (approximately 6 months of build + scale)

**Phase 2 success criteria** *(re-baselined to reflect Main Street M&A reality)*:

1. **20–25 closed deals** with full structured records in `closed_deals`
2. **Cost per concierge engagement reduced by 40%** (measured in founder hours per deal) via agent automation
3. **Time to close in line with industry average or better** (industry: 6–10 months; target: 6–8 months)
4. **5+ closed deals at hybrid pricing** ($5K–$10K retainer + 2.5%–4% capped success fee), validating the upmarket pricing move
5. **25+ active CPA partners**; **2+ SBA lender partnerships** with formal referral agreements
6. **First quarter at $750K–$1M ARR run-rate**
7. **Mandate close rate ≥25%** (against industry baseline of 20–30%)
8. **Zero customer-facing factual errors** that required post-send correction

### 6.1 Pricing Evolution — The Hybrid Model

Phase 2's most important strategic move: shift from flat fees to hybrid pricing.

- **Phase 1 pricing (current):** $3K–$5K flat for prep-only engagements. This works because Phase 1 customers pay for prep work, not for sale execution — there's no "success" event to fee on.
- **Phase 2 default pricing:** **$5K–$10K activation retainer + 2.5%–4% success fee on enterprise value at close**, with a floor of $15K total and a cap of ~$60K total.

Why hybrid:
- **Cash flow predictability.** Retainers collected at engagement signing, success fee at close. Solves the 6–10 month engagement-to-revenue gap that flat fees create.
- **Aligned incentives.** Success fee aligns Scorta with seller outcomes — same alignment a traditional broker has, without the magnitude.
- **Defensible economics.** Even with cap, expected revenue per deal ranges from $25K–$50K — enough to support quality human review at every customer-facing decision.
- **Preserves the wedge.** Cap matters: on a $1M sale, traditional broker is $100K, Scorta caps at ~$45K (10K retainer + 35K success fee at 3.5%). Materially cheaper, more transparent.

Phase 2 mix target: 60% hybrid (full broker replacement) by end of Phase 2; remaining 40% are prep-only engagements at evolving Phase 1 pricing.

### 6.2 Phase 2 Product Surface — What the User Sees (After They've Engaged)

Phase 1 is for prospects. Phase 2 is for *active customers in a sale process.* This is a different product surface — owner is logged in, in an ongoing engagement, and Scorta is the live system running their transaction.

**The Engagement Dashboard.** Owner's home base after they've paid. Single page showing:
- Current stage (intake → prep → listing → buyer outreach → LOI → diligence → close)
- Action items (yours / Scorta's)
- Live deal value estimate (updated as the business is improved or as buyers engage)
- Buyer pipeline summary
- Next milestone

**The War Room.** When buyer interest is active, the War Room becomes the command center. See §6.3.

**The Lender Desk.** Live SBA financeability scoring across multiple lenders. See §6.4.

**The Document Vault.** AI-organized data room. Owner uploads tax returns, P&Ls, leases, contracts; Scorta classifies, normalizes, and surfaces inconsistencies for the owner to resolve. Becomes the buyer-facing data room when they sign NDA. **Redaction pipeline runs on every upload** to flag SSNs, bank account numbers, and tax IDs for review before any external visibility.

**The Buyer-Facing Site.** Once the deal is listed (anonymized), buyers land on a Scorta-branded micro-site for that business. NDA flow built in. Document vault access gated by NDA + buyer qualification status.

### 6.3 The War Room — Detailed Spec

The War Room is the live diligence command center. It's where active deals run.

**Buyer Inquiry Triage:**
- Inbound buyer inquiries (from BizBuySell listings, Scorta inbound, broker email forwards) hit the War Room
- AI scores each inquiry against the seller's stated criteria: financing (cash vs. SBA), timeline, fit, professionalism
- Three buckets: 🔴 Filter out / 🟡 Needs founder review / 🟢 Auto-progress to NDA flow
- Owner sees a triage view; can override AI scoring with one click
- Founder reviews every 🟡 routing decision before it becomes 🟢 or 🔴

**NDA Workflow:**
- Templated NDAs (lawyer-reviewed once, used many times — see §12 for legal review timing)
- One-click execution via DocuSign API
- Tracking dashboard: who has signed, who has accessed the data room, who has dropped off

**Diligence Request Management:**
- Buyer questions (typically 50–200 per deal) land in the War Room
- AI parses each question, classifies (financial, operational, legal, customer, employee, etc.), drafts a response sourced from the data room
- Three buckets: ✅ AI-drafted (founder approves with one click) / ⚠️ Needs founder review / ❓ Owner must answer
- **Every response that ships externally requires founder approval — no exceptions.** Approval queue is part of the production workflow, not optional review
- Response history tracked; common questions become templates for the next deal

**Live Pipeline View:**
- All active buyers with their stage, last activity, blocking items
- Probability-weighted pipeline value
- Activity feed: "Buyer A signed NDA at 2pm. Buyer B requested 2024 P&L. Buyer C scheduled site visit."

**Why this matters operationally:** the War Room is what allows two founders to run 20+ active deals simultaneously without quality degradation. Without it, each deal eats 10+ hours/week of founder time on email triage. With it, that drops to 1–2 hours/week of judgment calls.

### 6.4 The Lender Desk — Detailed Spec

Every Phase 2 deal is run through real SBA lender criteria simultaneously:

- Three columns, one per lender (Live Oak, [Partner Bank 2], [Partner Bank 3])
- Each column shows: ✅/⚠️/❌ status, DSCR projection, gating items, required adjustments
- Real-time updates as the seller makes business changes: clean up a customer concentration issue → all three columns update
- Pre-qualified lender intros at the moment the deal needs financing — Scorta sends a lender package generated from the data room directly to the lender's underwriter

**Why lenders partner with us:**
- Steady stream of pre-qualified deals (every Scorta deal arrives lender-ready)
- Reduced underwriting effort (we do the prep work their underwriters would otherwise do)
- Vertical specialization (we send them the deals they actually want)

**Lender partnership economics:**
- Phase 2: free referrals; we earn trust by sending good deals
- Phase 3: formal referral fees only after the legal structure is mapped and disclosed (see §12 — SBA Form 159 considerations apply)
- Phase 4: white-label SBA pre-screening as a SaaS for lenders (separate product)

### 6.5 The Agent Factory

Phase 2's engineering work is not "build new product surfaces" — it's **convert each step of the founder-delivered concierge workflow into an AI agent**. Each agent reduces founder hours per deal, expanding capacity. *Every agent's output continues to flow through the human approval queue before any external send.*

**Agents to build, in priority order:**

1. **Financial Recaster Agent.** Takes uploaded tax returns + P&Ls; produces normalized SDE statement with add-backs, owner comp adjustments, one-time expense flagging. Replaces ~6 hours of founder time per deal. Founder approves before output is shared with anyone external.

2. **CIM Generator Agent.** Produces the Confidential Information Memorandum (the buyer-facing sale document). Sources from financials, business health, and a CIM template; founder reviews and edits every CIM before any buyer sees it. Replaces ~10 hours per deal.

3. **Buyer Outreach Agent.** Drafts personalized outreach to qualified buyers in our database. Sources from the buyer's stated criteria + the deal's profile. Founder approves before send. Replaces ~5 hours per deal.

4. **Diligence Response Drafter Agent.** Already part of the War Room; iterate on quality with each closed deal. Improvement target: from 70% AI-drafted (Phase 2 start) to 90% AI-drafted (Phase 3 start). Approval gate stays in place regardless of confidence.

5. **NDA + Document Workflow Agent.** Triggers NDA, monitors signing, grants access, logs activity. Mostly deterministic with LLM polish on personalized email copy.

6. **Lender Package Generator Agent.** Generates lender-specific submission packages from the data room. Each lender has different formatting requirements; we templatize and automate. Founder reviews before submission.

**Build cadence:** one agent per 2–3 weeks, shipped, used in production immediately, iterated based on real deal data.

### 6.6 Phase 2 GTM — Industrialize the Channels

The Phase 1 plays continue. Phase 2 industrializes them and adds two new ones.

**Channel 1: CPA Partner Program v2 (Industrialized)**

By end of Phase 2: 25 active CPA partners (down from earlier 50 estimate based on realistic channel velocity).

What changes from Phase 1:
- Self-serve partner portal (CPAs can onboard without founder time)
- White-label ExitIQ at `[firm].scorta.app` standardized
- Quarterly partner business review (top 10 partners)
- Co-marketing: case studies, webinars on "exit planning for your SMB clients"
- Partner success metrics dashboard
- Tiered referral fees: $2K (standard), $3K (top quartile partners)

**Channel 2: SBA Lender Partnerships**

Goal: 2 formal lender partnerships by end of Phase 2.

Pitch to lenders:
- "We send you SBA-financeable deals at scale — ~5 per month per partner by end of year"
- "Every deal arrives with a pre-built lender package matching your criteria"
- "You become our default lender for our NJ/NY metro home-services pipeline"

Approach: target Live Oak Bank first (largest SBA lender, deep Main Street focus), then 1 regional bank with northeast home-services lending expertise.

**Channel 3: Vertical Content Engine**

Goal: dominate organic search for "[vertical] exit" + NJ/NY metro terms.

Content production:
- 1–2 long-form articles per week ("The HVAC owner's complete guide to exit planning in New Jersey," "What plumbing businesses sell for in 2026," etc.)
- Founder bylines (Suyash) on industry publications (HVACR Business, Plumbing & Mechanical, Pest Management Professional)
- Quarterly "State of NJ/NY Home-Services Exits" reports — original data from our closed-deal dataset

**Channel 4: The Reseller Channel (Productized)**

The marketing-agency consultant pattern, productized.

Productized partner program for fractional CFOs, exit coaches, SMB management consultants, and industry-specific advisors.

Tier structure:
- Bronze: refer-and-earn (standard $2K fee)
- Silver: white-label ExitIQ + co-branded reports + 25% rev share on engagements
- Gold: white-label entire engagement, sub-contract Scorta as backend service

Goal: 20 reseller partners by end of Phase 2; 20% of new business from this channel by end of Q4 2026.

### 6.7 Phase 2 Operations and Quality Control

Services businesses scale through operational discipline. Phase 2 formalizes the deal-ops playbook drafted at the end of Phase 1.

**Required playbook components:**
- Onboarding checklist by vertical
- Document-request templates (tax returns, P&Ls, leases, customer contracts, employment agreements)
- Readiness-scoring rubric (deterministic + judgment dimensions)
- CIM QA checklist (factual accuracy, completeness, no leakage of identifying details)
- Lender-package checklist (matched to each lender's specific requirements)
- Buyer-room hygiene rules (what's accessible at NDA, at LOI, at deep diligence)
- Response SLA for buyer questions (24 hours acknowledgment, 72 hours full response)
- Escalation path for discrepancies, fraud flags, financing failures
- Close/no-go criteria by mandate quality (when do we walk away from a deal?)

**Quality KPIs tracked weekly:**
- Factual correction rate per CIM (target: <1 material correction per CIM after Q1 of Phase 2)
- Human override rate on AI outputs (informational; tells us where automation is weak)
- Document completeness within 14 days of engagement start (target: 80%)
- Time-to-first-CIM-draft (target: <72 hours from full document availability)
- Lender package acceptance rate (target: 85%)

---

## 7. Phase 3 — Category Leadership

**Timeline:** 2027 through mid-2028

**The strategic move:** become the default exit option in 2–3 verticals nationally. Establish brand recognition at the moment of decision. Move from "a startup some owners have heard of" to "the answer when an owner asks 'what do I do about exiting.'"

**Geographic expansion:** beyond NJ/NY metro to the Sun Belt (TX, AZ, NC) — but only after Phase 2 hits 15+ closed deals in the NJ/NY metro and after legal mapping is complete for each new state. Florida specifically remains gated on resolving the real-estate-license-includes-business-interests question.

**Product additions:**

- **The Negotiation Table.** When an LOI lands, the owner walks into an AI counter-party that simulates buyer pushback on every term. Each clause walked through with "if you push back here, the buyer is likely to [respond]; here's the modeled probability." Powered by 200+ closed-deal LOI/term outcome data.

- **Predictive Sale Modeling.** "Based on businesses like yours, we predict your sale will close in 142 days at $1.83M ± 12%, with a 78% probability of SBA approval." The line that ends every VC conversation.

- **The Buyer-Side Product (limited beta).** Curated deal flow service for searchers and small funds we've vetted. Subscription + per-introduction fees. NOT a marketplace — a high-touch, qualified-buyer product. The marketplace move only happens when seller supply is overwhelming.

- **Vertical-Specific Surfaces.** The visual language extends into vertical-specific UI: HVAC dashboards know about route density, dental practices know about insurance contract exposure, restaurants know about lease assignment risk.

**GTM:**
- Expansion to 5 verticals beyond home services (consider: dental, veterinary, accounting practices themselves, specialty trades, light manufacturing)
- Geographic expansion as legal posture allows
- Lender partnerships at scale: 5+ SBA lenders, 2+ national
- First brand marketing investment: marketing hire, conference circuit, "The Main Street Exit Report" quarterly publication
- Buyer-side beta: 50 vetted acquirers, $250K ARR from buyer subscriptions

**Brand investment:**

The Main Street Exit Report becomes the industry reference. Quarterly. Original data from the closed-deal dataset. Press coverage in WSJ, FT, industry trades. Suyash on the SMB M&A podcast circuit. The category we're building toward: *"the Carta of Main Street exits."*

---

## 8. Phase 4 — Transaction Infrastructure

**Timeline:** 2028 onward

**The endgame:** Scorta is no longer a brokerage. It is the system every Main Street business sale runs through, regardless of who facilitates it.

**The product:**

- **The Closed Deal Index.** Proprietary dataset so deep it becomes the industry reference. Brokers, lenders, PE firms pay for access. The Bloomberg of Main Street M&A.
- **Transaction infrastructure.** Escrow, closing, lien searches, license transfers, SBA paperwork — all run through Scorta. Take rate on every transaction in the system, regardless of who originated it.
- **The buyer marketplace, finally.** Built last. Marketplaces work when one side is captured; we capture the seller side first.
- **The brand for the boomer transition.** The retirement of millions of owner-operators is one of the largest wealth transfer events of the next two decades. Scorta is the brand owners trust to handle it.

**The TAM at Phase 4** isn't $1B in broker fees. It's a take rate on the underlying transaction value of an entire generation's exit — measured in tens of billions per year.

---

## 9. What We Are At Each Stage

In one sentence per stage, for clarity of focus:

- **Today:** A two-founder AI-native broker for Main Street home-service businesses, with three paying customers, $11K collected, and a wow demo we're racing to build.
- **End of Phase 1 (Q3 2026):** A validated AI-native broker for NJ/NY metro home services with 10+ closed deals, 5 deeply engaged channel partners, a Boardroom that visibly outperforms ChatGPT, and zero factual errors in customer-facing artifacts.
- **End of Phase 2 (Q1 2027):** The default sale-readiness layer for NJ/NY metro home services, with 20–25 closed deals, 25 CPA partners, hybrid pricing in production, the only operating closed-deal dataset for sub-$2M Main Street M&A in the region, and $750K–$1M ARR run-rate.
- **End of Phase 3 (mid-2028):** The category-defining brand for Main Street home-service exits, 200+ closed deals across 5 verticals nationally with appropriate state-by-state legal posture, the only credible AI-native broker at scale, and a buyer-side product feeding the seller pipeline.
- **End of Phase 4 (2030+):** The transaction infrastructure layer for the boomer exit wave. A take rate on a generation's worth of small business sales. The system every other player in the category interoperates with.

---

## 10. Operating Principles

These are the rules we use to keep the company on track when day-to-day decisions get murky.

**1. The vertical wedge is sacred.** Through end of Phase 1, we serve NJ/NY metro home-service businesses. We will turn down restaurants in Boston, SaaS companies in Austin, dental practices in Seattle. Narrowness is what makes the data feel real, the demo land, and the founder voice credible.

**2. Concierge first, automation second, every time.** Every new agent we build is preceded by founders doing the work manually for 5+ deals. The agent learns from real founder behavior, not from imagined behavior.

**3. The closed-deal record is non-negotiable.** Every concierge engagement produces a complete `closed_deals` record within 7 days. No exceptions. The flywheel doesn't spin if we're sloppy here.

**4. Human approval at every customer-facing boundary.** No CIM, lender package, buyer outreach, or other external artifact ships without founder review and explicit sign-off. AI drafts; humans approve. This is not a phase-out item — it is permanent until we can prove (with audited data) that AI quality consistently exceeds founder quality.

**5. The wow has to clear the ChatGPT bar.** Every user-facing output is evaluated against "could a savvy owner with ChatGPT produce this?" If the answer is yes, we don't ship it; we go deeper.

**6. We don't compete on price; we compete on outcomes.** Hybrid pricing structurally beats the 10% commission while supporting real human work. We don't discount, we don't tier into $99 SaaS plays.

**7. Trust is built one closed deal at a time.** Every customer interaction is evaluated against "would this person refer us to their best friend." Brand is a Phase 3 lever; trust is built starting today.

**8. We say "broker" out loud.** We are an AI-native broker. We replace traditional brokers. We don't hedge with "we're not a broker (yet)" or "we're a sale-readiness platform." Owners compare us to brokers and we want to win that comparison head-on.

**9. Depth over velocity in channel partnerships.** 5 deeply engaged CPA partners sending 3 referrals each beats 50 logo'd partners sending nothing.

**10. Founder-led sales until further notice.** Both founders are personally selling and personally running deals through end of Phase 2. Founder-led selling continues even at scale for the largest deals and most strategic channel partnerships.

**11. Honesty about gaps.** When we don't have legal review or compliance buildout in place, we say so — internally, to investors, to partners. Hidden gaps become bigger problems than acknowledged ones.

---

## 11. Human Approval Boundaries

A clear map of which Scorta artifacts ship automatically vs. require founder approval vs. are entirely human-produced. This is the operating answer to "what does AI do vs. what does a human do."

### Auto-ships (no human approval required)
- ExitIQ assessment scoring (deterministic + LLM narrative within bounded parameters)
- Boardroom buyer-agent simulation (clearly labeled as simulation, with prominent disclaimer)
- Initial valuation range (deterministic calculation; LLM narrative reviewed in production logs but not gated)
- Document classification and routing
- NAICS code suggestions
- Diligence question parsing and triage routing
- Internal status emails and notifications
- The Time Capsule re-engagement email (templated)

### AI-drafted, founder-approved before any external send
- CIM (full document review by founder before any buyer sees)
- Buyer outreach copy (founder approves each send)
- Diligence responses to buyers (founder approves each response)
- Lender packages (founder approves before submission)
- LOI analysis and counter-recommendations (founder reviews before discussing with seller)
- Any seller-facing valuation claim that becomes part of a paid engagement deliverable
- Marketing copy that references specific deals or outcomes

### Human-only (no AI drafting)
- The 30-minute founder call with a prospective customer
- Deal strategy decisions (which buyer to prioritize, when to push back, when to walk)
- Negotiation tactics and conversations
- Final pricing recommendations to the seller
- Any judgment call under partial information
- Conflict resolution between buyer and seller
- Decisions about whether to take or decline a mandate

This split is permanent until we can prove (via audited factual accuracy data over 50+ deals) that AI quality consistently meets or exceeds founder quality on a given category. Even then, sensitive categories (deal strategy, pricing recommendations) likely remain human-only forever.

---

## 12. Known Gaps and Risks We Are Carrying

This section exists so we are honest with ourselves, our investors, and our partners about what is not yet handled. Hidden gaps become bigger problems than acknowledged gaps.

### 12.1 The compliance gap (highest priority)

**What we have not done:** retained securities/M&A broker counsel; mapped Scorta activities to regulatory status; obtained state-by-state licensing analysis; finalized customer engagement agreements with proper legal review; established compliance posture for SBA lender referral fees; reviewed The Boardroom output language for advisor/recommendation regulatory exposure.

**Why this is risky:**
- SEC broker-dealer rules apply to transaction-based compensation. The M&A broker exemption (codified in the Exchange Act) has scope conditions we have not analyzed.
- State licensing varies meaningfully. Some states (notably Florida) define real estate to include business interests, requiring a real estate broker license for business sales with contingency-like fees. NJ and NY have their own regimes we have not mapped.
- SBA referral fees are governed by 13 CFR Part 103 and SBA Form 159. Any future "SBA lender referral fee" revenue must be disclosed and structured per these rules.
- Customer engagement agreements drafted by founders without legal review may not properly grant the data-use rights underlying our flywheel moat.

**Why we are carrying this gap:** we do not currently have budget to retain legal counsel ($15K–$30K minimum for the initial mapping work).

**Mitigation in the meantime:**
- Founder-drafted engagement agreements include explicit data-use consent and prominent disclaimers (better than nothing; not a substitute for legal review)
- The Boardroom carries prominent "simulation, not actual offers" disclaimers throughout
- We do not collect transaction-based compensation in Phase 1 (engagements are flat-fee for prep work, not contingent on a sale closing)
- We do not represent ourselves as licensed brokers
- All marketing language describes us as "AI-native broker" with explicit context that we are a new category, not a licensed real estate or securities broker
- We restrict v1 operations to NJ/NY metro where our legal exposure is known and manageable
- We do not take or pay any lender referral fees in Phase 1 — all lender introductions are uncompensated

**When we close this gap:** the first material capital event (YC funding, ERA funding, or pre-seed raise) allocates the first $25K to legal review. This is *before* any other use of capital — before hires, before paid acquisition scale, before further build investment. Phase 2 cannot begin in earnest without this work complete.

### 12.2 The security and data-handling gap

**What we have not done:** formal security audit; access review cadence; redaction pipeline for sensitive financial documents; isolated worker plane for sensitive workflows; comprehensive RBAC at the deal level (currently org-level only).

**Why this is carrying risk:** as we move into Phase 2 with active customer documents flowing through the system (tax returns, bank statements, customer lists), the cost of a breach or mishandling event scales rapidly.

**Mitigation in the meantime:**
- Vercel + Supabase provide reasonable baseline security posture (SOC 2 Type 2 for both)
- All sensitive documents accessible only via signed URLs with short expiration
- MFA required for both founders on all systems
- No financial documents flow to analytics tooling
- Document upload paused until Phase 2 build includes redaction pipeline (Phase 1 ExitIQ does not require document upload)

**When we close this gap:** alongside the legal work in Phase 2, allocate budget for a third-party security review and the redaction pipeline build before any document upload feature ships to customers.

### 12.3 The operational scale gap

**What we have not done:** no full-time hires beyond the two founders; no fractional advisory relationships; no formal external audit of operating discipline.

**Why this is technically a gap:** the critique correctly notes that two founders carrying product, GTM, brokerage operations, lender relations, and compliance is a lot. We are accepting this gap because we believe we can carry it through Phase 1 and most of Phase 2 with strong operational discipline (the deal-ops playbook, the closed-deal capture habit, the human approval queue).

**Mitigation:** ruthless operational discipline. Every deal goes through the playbook. Every closed-deal record is logged within 7 days. Every customer-facing artifact goes through the approval queue. If we drop any of these, we recognize it as an early warning sign that we have exceeded two-founder capacity and need to hire.

**When we close this gap:** first material capital event funds the first M&A Associate hire (someone with brokerage or PE associate experience to own deal execution alongside founders). Estimated late Phase 1 / early Phase 2.

### 12.4 The data sourcing gap

**What we have not yet validated:** whether BizBuySell will partner for comp data API access, or whether we are stuck with manual scraping for the foreseeable future.

**Why this matters:** the Living Comp Card is a load-bearing piece of the wow. If we can't source comps efficiently, Phase 1 wow degrades over time as our manual seed becomes stale.

**Mitigation:** Phase 1 starts with 50 hand-curated comps, sufficient for the first 90 days. In parallel, pursue: (a) BizBuySell partnership conversation, (b) IBBA or regional broker association data partnerships, (c) direct relationships with friendly NJ/NY brokers who might share anonymized close data in exchange for our pre-screening tools.

### 12.5 The Boardroom regulatory exposure question

**What we have not yet tested:** whether presenting AI-generated "buyer offers" to a seller could be construed as making a recommendation about the value of a business interest in a way that triggers advisor/broker regulatory scrutiny.

**Mitigation in the meantime:** prominent "simulation, not actual offers" disclaimers throughout all Boardroom outputs. Language describes outputs as "preparation for real conversations" and "what real buyer archetypes might think," not as actual valuations.

**When we close this gap:** part of the legal review in §12.1.

---

*This document is the source of truth for product, GTM, and strategic decisions at Scorta. It is updated quarterly. It is honest about what is handled and what is not. Last revision: Q2 2026 (v3).*