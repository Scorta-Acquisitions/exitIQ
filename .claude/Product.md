# Scorta — Product Overview

## What Scorta Is

Scorta is an AI-native exit operating system for Main Street business owners. It helps sellers understand their valuation, identify deal-killing issues, become SBA-financeable, prepare a buyer-grade package, and manage the transaction process — without paying a broker 10%.

**Positioning:** From valuation to buyer-ready. The AI exit desk for Main Street businesses.

---

## The Problem

Small business transactions are broken for both sides:

**Sellers** don't know what their business is worth, what buyers need, how to prep financials, or how to avoid confidentiality risk. They rely on brokers who charge 8–12% and slow everything down. Most first-generation owners are not transaction-ready when they decide to sell.

**Buyers** encounter underprepared listings, slow broker responses, PDFs, and email-driven NDAs. Diligence takes months because sellers don't have basic documentation.

Scorta starts upstream — before the seller lists, before they hire a broker, before they know if their business is actually sellable.

---

## Core Product Stages

### Phase 1 — Exit IQ (Live Now)
**The Startup Idea Analysis as a core product stage.**

A 5–8 minute conversational assessment that produces a personalized business readiness report. Four progressive stages collect financials, health signals, buyer-lens factors, and seller goals. Output includes:

- Exit IQ Score (0–100) across 5 dimensions
- Valuation range (3 methodologies)
- Red flag / green flag summary
- 90-day exit prep checklist
- SBA financeability snapshot
- Broker fee savings estimate

Paid tiers unlock deeper AI reports, founder-reviewed packages, and concierge exit prep. Phase 1 is the validation gate — it must prove owners will pay before the full product is built.

→ See `phase1.md` for full assessment flow, data model, API contracts, and architecture.

---

### Phase 2 — Seller Operating System *(post-Phase 1 validation)*
AI-assisted exit preparation and transaction command center.

**Modules:**
- Document upload and data room builder
- AI-normalized financial summary and SDE recasting
- Buyer-ready listing copy generator
- SBA/lender readiness package
- One-click listing export to BizBuySell, BizQuest, broker emails, and industry channels
- Buyer inquiry tracker and NDA workflow
- Diligence request manager
- AI drafts all responses; seller approves everything (human-in-the-loop)

---

### Phase 3 — Managed Listing and Buyer Intake *(post Phase 2)*
Scorta becomes the command center for the active transaction.

- Inbound buyer qualification and proof-of-funds gating
- Offer comparison and LOI workflow
- Diligence stage tracking
- Lender and attorney collaboration
- Seller reminders and task management

---

### Phase 4 — Buyer Passport *(long-term)*
Built only after seller-side supply is established.

Buyer profiles include: verified identity, proof of funds, acquisition criteria, SBA readiness, credit band, operator background, and timeline. Sellers can restrict access to Scorta-verified buyers only. This becomes a real moat.

---

## Revenue Model

| Product | Price | Phase |
|---|---|---|
| Free Exit IQ Snapshot | Free | 1 |
| Full AI Sellability Report | $99–$199 | 1 |
| Founder-Reviewed Exit Package | $499–$999 | 1 |
| Concierge Buyer-Ready Package | $1,500–$3,000 | 1 |
| Seller Operating System (SaaS) | TBD (monthly) | 2 |
| Success fee / listing fee | TBD | 3 |

---

## Target Customer

**Primary (Phase 1–2):** Business owner aged 50–70, service business, $500K–$3M revenue, $100K–$750K SDE, no succession plan, thinking about selling in 6–24 months. Nervous about confidentiality. Does not want to pay a broker 10%.

**Initial niche:** Texas home-service businesses (HVAC, plumbing, landscaping, pest control, cleaning, roofing, auto repair).

**Secondary:** CPAs, bookkeepers, and SBA lenders who advise these owners — served as distribution partners, not direct customers.

---

## Competitive Positioning

Scorta is not a marketplace. It is not a broker replacement (yet). It is **sell-side infrastructure that starts before the listing.**

| Competitor | What they do | Scorta's difference |
|---|---|---|
| BizBuySell | Listing marketplace | Scorta prepares sellers before they list; can use BizBuySell as distribution |
| Baton | Modern broker/marketplace hybrid | Scorta is not a broker; no success-fee model at launch; sell-side OS first |
| Clearly Acquired | Buyer tooling + SBA financing | Scorta owns the seller relationship upstream |
| Traditional brokers | 8–12% commission, slow process | Scorta replaces prep work; eventual agentic workflow reduces broker need |

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), Vercel
- **Backend:** Next.js Route Handlers
- **Database:** Supabase (PostgreSQL), RLS enforced
- **AI:** Claude 3.5 Sonnet (report narratives, red flags, checklists)
- **Email:** Resend + Loops.so
- **Payments:** Stripe
- **Storage:** Vercel Blob / S3 (PDFs)

Scoring and valuation are deterministic (formula-based), not LLM-driven. LLM is used only for narrative generation and structured output.

---

## Proprietary Data Moat

Every completed assessment is a structured seller profile: normalized financials, readiness scores, red flags, industry benchmarks, and seller intent signals. At scale this becomes:

- Proprietary valuation benchmarks by industry and geography
- Readiness distribution data unavailable anywhere else
- Early seller intent data (6–24 months before public listing)
- Lender-validated deal structure patterns

This data advantage is what makes Scorta venture-backable — not the tool itself, but the system of record it becomes for sellability.
