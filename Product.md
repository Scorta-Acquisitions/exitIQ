# BrokerFree — Product Reference

This file exists so that engineering decisions — database schemas, auth models, AI
integrations — can be evaluated against what the product actually does. Read this
before making any infrastructure or architecture decision.

---

## What BrokerFree Is

An AI-powered platform for buying and selling small businesses under $10M. The core
value proposition is replacing the business broker. Brokers charge 8–12% of the sale
price ($40K–$120K on a $500K–$1M deal). BrokerFree replaces their job functions with
AI and platform features for a fraction of that cost.

---

## The Three Phases

### Phase 1 — Exit IQ Assessment (building now)
A public-facing, no-login AI assessment tool for business owners considering selling.
No auth required. Session state lives in localStorage.

### Phase 2 — Deal Portal (next)
An authenticated, multi-role portal. Sellers/brokers invite buyers to a deal-specific
space. Financial documents, AI assistance, messaging, and NDA/e-signature flows all
live here. Roles: Seller, Buyer, Broker, Admin.

### Phase 3 — Marketplace (future)
A discoverable marketplace of business listings. Browse, search, filter, AI match
scoring, valuation badges, and success-fee billing at close.

---

## Phase 1 — Exit IQ: Full Product Spec

### What It Does
A seller answers 16 questions across 4 stages. The AI generates a personalized
"Exit IQ Report" — the product. The report must feel like a $5,000 consultant
produced it.

### User Flow
```
/ (landing page)
  → /assessment          Stage 1: The Snapshot (no login)
    → teaser card        Partial result shown inline, no new page
      → email gate       Modal — captures email before Stage 2
        → /assessment/stage-2    Stage 2: Health Check
          → /assessment/stage-3  Stage 3: Buyer Lens
            → /assessment/stage-4 Stage 4: Goals
              → /assessment/generating  Loading screen
                → /report/[session_id]  The Report
                  → /waitlist/confirmed  Post-CTA
```

### The 4 Assessment Stages

**Stage 1 — The Snapshot (6 fields, no email required)**
- Industry (dropdown, 25 categories)
- Years in business (slider, 1–30+)
- Annual revenue (range selector: <$250K / $250K–$500K / $500K–$1M / $1M–$2M / $2M–$5M / $5M–$10M)
- Annual SDE / Seller's Discretionary Earnings (same bands — include tooltip explaining SDE)
- Number of employees (0 / 1–5 / 6–15 / 16–50 / 50+)
- State (dropdown, all 50 states)

Immediately after Stage 1 submit: show a teaser card with a wide valuation range,
industry SDE multiple, and a locked Exit IQ radar chart. CTA: "Get Your Full Exit IQ Score."

**Email Gate (modal between Stage 1 and Stage 2)**
- First name
- Email address
- "When are you thinking about selling?" (Just curious / 6–12 months / 1–2 years / 3+ years / Already trying to sell)

The timeline answer is the most important data point — used to segment email sequences:
- "Already trying to sell" or "6–12 months" → tag: hot_seller
- "1–2 years" or "3+ years" → tag: warm_explorer
- "Just curious" → tag: nurture

**Stage 2 — Health Check (7 questions, multiple choice)**
1. Owner dependency: "If you left for 3 months, what would happen to revenue?"
2. Customer concentration: "% of revenue from top 3 customers?"
3. Revenue trend: "Over last 3 years, revenue has..."
4. Recurring revenue: "% of revenue that is recurring or contracted?"
5. Documentation readiness: "Do you have clean financial statements for last 3 years?"
6. Real estate/lease: "Does the business own or lease its location?"
7. Reason for selling (Retirement / Burnout / New opportunity / Health / Partner dispute / Business is struggling / Just exploring)

Note: "Business is struggling" sets internal flag `distressed=true` — changes report tone.

**Stage 3 — Buyer Lens (5 questions)**
8. SBA eligibility: AI calculates from Stage 1 data, shown as info card + asks about restricted industries
9. Key person risk: "How many employees have been with you 3+ years?"
10. Systems & processes: "Are operations documented in SOPs?"
11. Growth levers: Free text — "What's the most obvious way a new owner could grow this?"
12. Legal/liability: "Any pending lawsuits or regulatory issues?"

**Stage 4 — Goals (4 questions)**
13. Asking price expectation: Free text dollar amount or "I have no idea"
14. Deal structure preference: Multi-select checkboxes (Seller financing / SBA loan / Earnout / All-cash / I don't know)
15. Timeline urgency: ASAP / 3–6 months / 6–12 months / No rush
16. Broker status: Yes active / Was but didn't work out / No, want to sell myself / No, just exploring

"Was but didn't work out" → tag: burned_by_broker

### The Exit IQ Report — Sections

1. **Exit IQ Score** — composite 0–100 score, letter grade, 2–3 sentence AI narrative
   Radar chart with 5 dimensions:
   - Financial Attractiveness (25%): SDE level, revenue trend, margins, recurring revenue
   - Operational Independence (25%): Owner dependency, key person risk, documented systems
   - Market Positioning (20%): Industry multiple trends, comparable volume, geographic demand
   - Deal Readiness (15%): Documentation quality, legal cleanliness, lease situation
   - Buyer Accessibility (15%): SBA eligibility, deal structure flexibility, price reasonableness

2. **Valuation Range** — horizontal range bar + owner expectation pin
   Three methodologies: SDE × multiple (primary), Revenue multiple, Asset-based floor
   Diplomatic message if expectation exceeds range

3. **Red / Green / Yellow Flag Summary** — 3 columns
   - Green: Strengths a buyer will love
   - Yellow: Areas to address before listing
   - Red: Deal risks to mitigate

4. **90-Day Exit Prep Checklist** — AI-generated action items based on gaps, ordered by impact

5. **SBA Financing Snapshot** — shown if SBA-eligible
   Down payment estimate, monthly payment, coverage ratio, buyer pool size assessment

6. **Buyer Demand Signal** — market data framing (NOT synthetic platform numbers)

7. **Growth Levers** — surfaces Q11 free text + AI expansion

8. **Three-Way CTA**
   - "I'm ready now" → waitlist for marketplace
   - "I need 3–6 months" → monthly update subscription
   - "Just exploring" → newsletter

Report is delivered as a web page. "Download PDF" via print stylesheet.
"Share with CPA" copies a read-only URL.

### Data Model

```
assessments
  id                uuid PK
  session_id        uuid (set at Stage 1, stored in localStorage)
  created_at        timestamp

  -- Stage 1
  industry          text
  years_in_business integer
  revenue_band      text
  sde_band          text
  employees         text
  state             text

  -- Email gate
  email             text
  first_name        text
  selling_timeline  text
  lead_segment      text  -- hot_seller | warm_explorer | nurture | burned_by_broker

  -- Stage 2
  owner_dependency        text
  customer_concentration  text
  revenue_trend           text
  recurring_revenue       text
  documentation_readiness text
  real_estate             text
  reason_for_selling      text

  -- Stage 3
  sba_restricted_industry text
  key_person_risk         text
  systems_documented      text
  growth_levers           text
  legal_liability         text

  -- Stage 4
  asking_price_expectation  text
  deal_structure_preference text[]
  timeline_urgency          text
  broker_status             text

  -- Flags
  distressed  boolean default false

  -- Report
  report_generated_at  timestamp
  report_json          jsonb   -- full report output stored here

early_access
  id          uuid PK
  email       text unique
  role        text  -- seller | buyer | both | cpa_advisor
  created_at  timestamp
```

### Report JSON Shape

```typescript
{
  session_id: string
  generated_at: string  // ISO timestamp
  business_profile: {
    industry: string
    state: string
    years: number
    revenue_band: string
    sde_band: string
    employees: string
  }
  exit_iq: {
    score: number        // 0–100
    grade: string        // A+, A, B+, B, C+, C, D, F
    narrative: string    // 2–3 sentence AI summary
    dimensions: {
      financial_attractiveness:   { score: number; explanation: string }
      operational_independence:   { score: number; explanation: string }
      market_positioning:         { score: number; explanation: string }
      deal_readiness:             { score: number; explanation: string }
      buyer_accessibility:        { score: number; explanation: string }
    }
  }
  valuation: {
    low: number
    high: number
    primary_method: "sde_multiple"
    sde_multiple_range: [number, number]
    revenue_multiple: number | null
    asset_floor: number | null
    owner_expectation: number | null
    expectation_assessment: "within_range" | "above_range" | "below_range"
    expectation_message: string
  }
  flags: {
    green:  string[]
    yellow: string[]
    red:    string[]
  }
  checklist: Array<{
    id: string
    title: string
    explanation: string
    estimated_impact: string | null
    priority: number
  }>
  sba: {
    eligible: boolean
    down_payment_estimate: number | null
    monthly_payment_estimate: number | null
    coverage_ratio: number | null
    message: string
  }
  buyer_demand_signal: string
  growth_levers: {
    owner_stated: string | null
    ai_expansion: string | null
  }
  cta_segment: "hot" | "warm" | "explorer" | "burned"
  distressed: boolean
}
```

### API Contract

```
POST   /api/assessment/stage1
       Body:    { industry, years_in_business, revenue_band, sde_band, employees, state }
       Returns: { session_id, valuation_low, valuation_high, industry_multiple, positioning_pct }

PATCH  /api/assessment/email-gate
       Body:    { session_id, email, first_name, selling_timeline }
       Returns: { ok: true }

PATCH  /api/assessment/stage2
       Body:    { session_id, owner_dependency, customer_concentration, revenue_trend,
                  recurring_revenue, documentation_readiness, real_estate, reason_for_selling }
       Returns: { ok: true }

PATCH  /api/assessment/stage3
       Body:    { session_id, sba_restricted_industry, key_person_risk,
                  systems_documented, growth_levers, legal_liability }
       Returns: { ok: true }

PATCH  /api/assessment/stage4
       Body:    { session_id, asking_price_expectation, deal_structure_preference,
                  timeline_urgency, broker_status }
       Returns: { ok: true }

POST   /api/assessment/generate-report
       Body:    { session_id }
       Returns: { report_url: string }
       Note:    Calls Claude Sonnet. May take 10–20 seconds. Run as async server action.

GET    /api/assessment/report/[session_id]
       Returns: full report JSON object (the shape above)

POST   /api/early-access
       Body:    { email, role }
       Returns: { ok: true }
```

### AI Usage in Phase 1

**Teaser card generation — Claude Haiku**
Input: Stage 1 data (industry, revenue_band, sde_band, state, years)
Output: valuation range (intentionally wide), industry multiple, positioning percentile
Latency target: <2 seconds

**Full report generation — Claude Sonnet**
Input: All 4 stages of assessment data
Output: complete report JSON matching the shape above
Latency: 10–20 seconds acceptable (user sees generating screen)
Critical: the prompt must produce valid JSON matching the schema exactly.
The `distressed=true` flag must trigger a materially different report tone.
Do not let the model hallucinate specific dollar figures not derived from inputs.

### Email / Lead Routing

- Trigger: email gate submission
- Platform: Resend (transactional) + Loops.so (sequences)
- Three sequences based on `lead_segment`:
  - `hot_seller`: Day 0 report, Day 2 quick wins, Day 5 SBA explainer, Day 10 industry guide, Day 14 marketplace waitlist invite, Day 21 founder outreach
  - `warm_explorer`: Day 0 report, Day 7 monthly update, Monthly market trend email, Quarterly retake prompt
  - `burned_by_broker`: Day 0 report, Day 2 why brokers fail content, Day 5 positioning piece, Day 10 founder outreach
- `burned_by_broker` is a subset of hot/warm — assign based on broker_status answer at Stage 4

---

## What Phase 1 Explicitly Does NOT Include

- User accounts or login
- Document upload
- Marketplace listings
- Buyer portal
- Messaging
- Payments
- Admin dashboard
- Mobile app

---

## Architectural Guardrails for Future Phases

When adding Phase 2 and 3 features, decisions made in Phase 1 must not need to be
undone. Specifically:

- The `assessments` table is the seed of the seller profile — Phase 2 will add a
  `businesses` table that references it
- `session_id` in Phase 1 becomes linkable to a `user_id` when auth is added in Phase 2
- The `report_json` column stores the full report — Phase 2 listing generation will
  pull from this to pre-populate listing copy
- Auth roles (seller / buyer / broker / admin) are defined in Phase 2 but the auth
  infrastructure added in Phase 1 setup should support RBAC from the start
- The document vault, NDA gate, and messaging features in Phase 2 all require
  row-level security in Supabase — RLS policies should be considered from the first
  migration, not retrofitted