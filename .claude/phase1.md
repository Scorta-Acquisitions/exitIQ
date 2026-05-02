# Scorta — Phase 1: Exit IQ

## Vision

Scorta is an AI-native exit operating system for Main Street business owners. Phase 1 validates the core thesis: **owners will engage with and pay for a product that makes them transaction-ready before they ever talk to a broker.**

The Startup Idea Analysis is now a core product stage — not a lead-gen hook. It is the wedge that proves supply-side demand, surfaces willingness to pay, and generates the proprietary data that all future product phases depend on.

**Phase 1 ships exactly three things:** the Exit IQ assessment engine, a marketing site, and an email nurture system. Nothing else.

---

## What Is Exit IQ

Exit IQ is a multi-stage business readiness assessment. It produces a personalized, buyer-grade report that shows owners:

- What their business may be worth
- Whether it is buyer-ready and SBA-financeable
- What red flags buyers and lenders will surface
- What to fix before listing

The output should feel like a $5,000 consultant report delivered in 10 seconds. This is the product — not a funnel for something else.

---

## Assessment Flow (4 Stages)

### Stage 1 — The Snapshot *(no auth required)*

**Purpose:** Low-friction hook. Immediate partial output to create pull.

**Inputs:**
- Industry (25 categories)
- Years in business
- Annual revenue (range selector)
- Annual SDE (range selector + tooltip)
- Number of employees
- State

**Immediate output:**
- Estimated valuation range (intentionally broad)
- Industry average SDE multiple
- Percentile positioning ("Top 35% of HVAC businesses in Texas")
- CTA: "Get Your Full Exit IQ Score →" with 25% progress indicator

---

### Stage 2 — The Health Check *(email capture gate)*

**Before Stage 2:** Capture name, email, and selling timeline.  
The selling timeline is the highest-value segmentation signal. Segment immediately: "ASAP / 6–12 months" = hot; "Just curious" = nurture.

**Inputs:**
1. Owner dependency (4-point scale)
2. Customer concentration (% from top 3 customers)
3. Revenue trend (last 3 years)
4. Recurring revenue percentage
5. Financial documentation readiness (CPA-prepared / self-maintained / partial / none)
6. Real estate situation (own / long lease / short lease / home-based)
7. Reason for selling

---

### Stage 3 — The Buyer Lens

**Purpose:** Flip perspective. Show what a serious buyer would scrutinize. No other tool offers this.

**Inputs:**
8. SBA debt service feasibility (auto-calculated from SDE + estimated price, shown as yes/no with explanation)
9. Employee tenure and retention
10. Systems and SOPs documentation
11. Most obvious growth lever for a new owner (free text — becomes listing copy input)
12. Pending legal/regulatory issues

---

### Stage 4 — Your Goals

**Inputs:**
13. Owner's asking price expectation (free text or "no idea")
14. Deal structure openness (seller financing / SBA / earnout / all-cash / unsure)
15. Timeline urgency
16. Current broker status — "Was with a broker, didn't work out" = highest-intent cohort

---

## The Exit IQ Report (Output)

Delivered as a responsive web page with PDF download. Personalized, data-rich, shareable with CPA/advisor.

**Report sections:**

| Section | Content |
|---|---|
| Exit IQ Score (0–100) | Composite score across 5 weighted dimensions displayed as radar chart |
| Valuation Range | Refined from Stage 1 using SDE × multiple, revenue multiple, and asset floor methods |
| Red Flag / Green Flag Summary | Buyer strengths, areas to fix, deal risks — each with actionable recommendation |
| 90-Day Exit Prep Checklist | AI-generated, gap-specific action items with estimated value impact |
| SBA Financing Snapshot | Estimated down payment, loan amount, DSCR |
| Broker Fee Savings | Estimated cost of using a broker vs. Scorta |
| Next Step CTA | "Ready now" / "Need 3–6 months" / "Just exploring" — routes to appropriate conversion |

**Score dimensions (weighted):**

| Dimension | Weight |
|---|---|
| Financial Attractiveness | 25% |
| Operational Independence | 25% |
| Market Positioning | 20% |
| Deal Readiness | 15% |
| Buyer Accessibility | 15% |

---

## Paid Offer Ladder

Exit IQ is the top of a monetization funnel. Do not make everything free. Test willingness to pay from week one.

| Offer | Price | Purpose |
|---|---|---|
| Free Exit IQ Snapshot | Free | Lead capture, funnel entry |
| Full AI Sellability Report | $99–$199 | Willingness-to-pay test |
| Founder-Reviewed Exit Package | $499–$999 | High-intent validation |
| Concierge Buyer-Ready Package | $1,500–$3,000 | Revenue + deep product learning |

The Concierge Package delivers: normalized financial summary, anonymized teaser, data room checklist, buyer FAQ, SBA/lender package, and listing copy — initially delivered manually using AI internally.

---

## Data Model

### `assessments`

```sql
id                    uuid PK
created_at            timestamptz
updated_at            timestamptz

-- Identity
email                 text NOT NULL
first_name            text
selling_timeline      text  -- 'asap' | '6_12mo' | '1_2yr' | '3yr_plus' | 'already_selling' | 'curious'
broker_status         text  -- 'yes' | 'was_failed' | 'no_self' | 'exploring'

-- Stage 1 inputs
industry              text
state                 text
years_in_business     int
revenue_range         text
sde_range             text
employee_count_range  text

-- Stage 2 inputs
owner_dependency      int   -- 1–4
customer_concentration text
revenue_trend         text
recurring_revenue_pct text
doc_readiness         text
real_estate_type      text
reason_for_selling    text

-- Stage 3 inputs
sba_eligible          boolean  -- computed
employee_tenure       text
has_sops              text
growth_lever          text     -- free text
has_legal_issues      boolean

-- Stage 4 inputs
owner_price_expectation text
deal_structure_prefs  text[]
timeline_urgency      text

-- Computed outputs
exit_iq_score         int      -- 0–100
score_breakdown       jsonb    -- {financial, operational, market, deal_readiness, buyer_access}
valuation_low         int
valuation_high        int
sde_multiple_used     numeric
sba_snapshot          jsonb    -- {dscr, loan_amount, down_payment}
broker_fee_estimate   int
report_url            text
pdf_url               text

-- Metadata
stage_completed       int      -- 1–4
paid_tier             text     -- null | 'report' | 'reviewed' | 'concierge'
lead_quality          text     -- 'hot' | 'warm' | 'nurture'
```

### `waitlist`

```sql
id          uuid PK
email       text NOT NULL UNIQUE
role        text  -- 'seller' | 'buyer' | 'advisor' | 'both'
created_at  timestamptz
source      text
```

### `assessment_history`

```sql
id              uuid PK
assessment_id   uuid FK → assessments.id
snapshot        jsonb
changed_at      timestamptz
```

---

## API Contracts

### `POST /api/assessments/start`
Accepts Stage 1 inputs. Returns partial assessment with `id`, valuation range, and percentile.

**Request:**
```json
{
  "industry": "hvac",
  "state": "TX",
  "years_in_business": 12,
  "revenue_range": "1m_2m",
  "sde_range": "250k_500k",
  "employee_count_range": "6_15"
}
```
**Response:**
```json
{
  "assessment_id": "uuid",
  "valuation_low": 550000,
  "valuation_high": 1100000,
  "industry_multiple_range": "2.2–3.8",
  "percentile_label": "Top 35% of HVAC businesses in Texas",
  "stage_completed": 1
}
```

---

### `POST /api/assessments/:id/health`
Accepts Stage 2 inputs + email capture. Returns `lead_quality` segment.

**Request:** Stage 2 fields + `{ email, first_name, selling_timeline }`

**Response:** `{ stage_completed: 2, lead_quality: "hot" | "warm" | "nurture" }`

---

### `POST /api/assessments/:id/buyer-lens`
Accepts Stage 3 inputs. Returns computed SBA eligibility signal.

---

### `POST /api/assessments/:id/goals`
Accepts Stage 4 inputs. Triggers report generation. Returns `report_url`.

**Async:** Report is generated via Claude and stored; poll `GET /api/assessments/:id/report` until `status: "ready"`.

---

### `GET /api/assessments/:id/report`
Returns full report data as structured JSON for frontend rendering.

```json
{
  "status": "ready",
  "exit_iq_score": 72,
  "score_breakdown": { ... },
  "valuation_low": 620000,
  "valuation_high": 940000,
  "red_flags": [...],
  "green_flags": [...],
  "checklist": [...],
  "sba_snapshot": { ... },
  "broker_fee_estimate": 75000,
  "report_url": "https://..."
}
```

---

### `POST /api/waitlist`
Email + role capture. Upserts on duplicate email.

---

## High-Level Architecture

```
Client (Next.js 15 / App Router)
  └── Assessment wizard (multi-step, client-side state via Zustand or useReducer)
  └── Report renderer (SSR-hydrated from Supabase)
  └── Marketing site (static, Vercel edge)

API Layer (Next.js Route Handlers)
  └── /api/assessments/* — CRUD + stage progression
  └── /api/report/generate — queues Claude report generation
  └── /api/waitlist — email capture

AI Layer
  └── Exit IQ Score: deterministic formula (no LLM)
  └── Valuation: deterministic (industry multiple table + adjustment factors)
  └── Report narratives: Claude 3.5 Sonnet, structured JSON prompt
  └── Red flags / checklist: Claude, templated by segment

Data Layer (Supabase / PostgreSQL)
  └── assessments, assessment_history, waitlist
  └── RLS: anon can INSERT assessments; owners can SELECT own rows by email
  └── Industry multiples: hardcoded lookup table (20+ industries)

Email (Resend + Loops.so)
  └── Sequence 1: Hot Sellers (ASAP / 6–12 months)
  └── Sequence 2: Warm Explorers (1–2 years / just curious)
  └── Sequence 3: Burned by Brokers (broker_status = 'was_failed')

Payments (Stripe)
  └── One-time checkout for report tiers
  └── Webhook → update assessments.paid_tier
```

**Infra:** Vercel (Next.js), Supabase (DB + auth), Resend (email), Stripe (payments), Vercel Blob or S3 (PDF storage).

**No marketplace. No listings. No buyer portal. No messaging. No agentic transaction workflows. Those are Phase 2+.**

---

## Validation Targets (Phase 1 Exit Criteria)

The phase is successful when:

| Metric | Target |
|---|---|
| Completed assessments | 500+ |
| Email-captured leads | 100+ |
| Qualified seller leads (hot / warm) | 25+ |
| Discovery calls booked | 10+ |
| Paid conversions (any tier) | 3+ |
| Document uploads (concierge) | 5+ |

**Kill criteria:** If 500 assessments complete and fewer than 3 owners take a paid or high-intent action (upload docs, book call, pay), do not proceed to Phase 2 without repositioning.

---

## What Is NOT Built in Phase 1

- Buyer marketplace or listings
- Buyer portal or Buyer Passport
- Messaging or NDA workflow
- Document upload or data room
- Agentic listing management
- LOI or due diligence tooling
- Attorney / lender integrations
- Matching or deal flow engine

These are Phase 2 and Phase 3 features, gated on Phase 1 validation.

---

## Phase 1 → Phase 2 Bridge

Every assessment record is a structured seller profile. When Phase 2 launches (seller operating system + concierge workflow), all assessment data becomes the intake record. No re-onboarding required. The Exit IQ score becomes the seller's baseline deal readiness indicator tracked over time.
