Good context — I can see exactly where the [exitIQ app](https://github.com/Scorta-Acquisitions/exitIQ) sits and how it flows. Here's the deep dive on everything that happens between "seller submits the exitIQ form" and "financials are ready to recast."

***

## The Corrected Intake Flow for Scorta

The sequence you described is the right architecture. Here's how it maps out fully before a single financial document gets touched:

```
exitIQ app → GAP Report + Valuation Opinion Letter
     ↓
Contact form → Co-founder consultation call (human layer)
     ↓
Account creation
     ↓
DATA INGESTION (multi-modal, multi-environment)
     ↓
Normalization & reconciliation
     ↓
Completeness assessment
     ↓
THEN: Recasting / add-back analysis
```

***

## Phase: Account Creation & Onboarding

When the account is created after the consultation call, a broker would do several things before touching any numbers:

- **Engagement letter / listing agreement execution** — the legal relationship. Sets the broker's commission (typically 10% sub-$1M, 8% $1M-$5M), exclusivity period (usually 6-12 months), and what the broker is authorized to do on the seller's behalf. This is the contract. For Scorta this becomes a service agreement signed at account creation.
- **Confidentiality protocol agreement with the seller** — what info will be shared, with whom, at what stage. Sellers are often paranoid about employees, customers, and competitors finding out. Broker establishes rules upfront: no names, no addresses in early materials; staged disclosure only.
- **Target timeline setting** — when does the seller want to close? Working backwards sets the urgency and pacing of every subsequent step. A seller who needs out in 6 months gets a very different process than one who has 18 months.
- **Deal structure preference discussion** — asset vs. stock sale, willingness to carry seller financing, earnout tolerance, real estate situation (own or lease), key employee retention requirements. These preferences shape every document generated downstream.
- **Motivations and constraints capture** — why now? Retirement, health, burnout, partner dispute, new opportunity? This matters for how the CIM frames the sale narrative and how the agent handles buyer objections.

***

## Phase: Data Ingestion — The Full Broker Rulebook

This is where Scorta diverges most sharply from how a traditional broker operates. A broker typically hands the seller a massive checklist, waits weeks for a Dropbox dump, and then manually reviews everything. Your multi-modal ingestion agents collapse this into a structured pipeline. Here's every document category a broker requests and the rules attached to each:

### Financial Documents

**The rules a broker applies to every financial document:**
- Must have **3 full years of history** minimum. 5 years preferred if the business is older than 5 years. Anything less than 3 years triggers a risk flag that will suppress the buyer pool (lenders won't finance it, most PE won't underwrite it).
- **Fiscal year vs. calendar year alignment** — if the business uses a non-calendar fiscal year, the broker reconciles trailing twelve months (TTM) figures manually. This is a common source of confusion and error.
- **Tax returns vs. P&Ls must reconcile** — the most common red flag in any deal is when the tax returns show different revenue than the P&Ls. Brokers flag every discrepancy over $5K and require an explanation from the seller's CPA. If they don't reconcile, the CIM cannot be completed.
- **Cash vs. accrual accounting** — must be identified upfront. Cash-basis books are harder to recast and harder to underwrite. Brokers often recommend converting or providing a bridge reconciliation.
- **Most recent interim period** — in addition to 3 years of annuals, the broker needs YTD financials through the most recent complete month. A business trending down in the current year is a very different risk profile than one trending up.

The specific documents requested:
- Federal business tax returns (Form 1120, 1120S, or 1065 depending on entity type) — 3 years
- Compiled or reviewed P&L statements — 3 years + YTD
- Balance sheets — 3 years + current
- Bank statements — typically 3-6 months to verify cash flow
- Accounts receivable aging report — current
- Accounts payable aging report — current
- Payroll records / ADP/Gusto exports — last 12 months

### Operational Documents

- **Lease agreement** — one of the most critical documents in the deal. Broker checks: remaining term (buyers and lenders want at least 2-3 years post-close), transfer/assignment clause (landlord approval required?), personal guarantee clause (does the seller have a PG that won't survive the sale?), rent escalation schedule.
- **Equipment list with approximate values** — any equipment included in the sale? Financed? Leased? Owned? This feeds the asset floor valuation method.
- **Inventory snapshot** — if product-based business, current inventory value at cost. Is it seasonal? Perishable? Method of counting (cycle vs. physical)?
- **Customer contracts / recurring revenue agreements** — any contracts that transfer with the sale? Are they assignable? Month-to-month or multi-year? Change-of-control clauses?
- **Vendor/supplier contracts** — same assignability question, plus any exclusive arrangements or pricing agreements that could change at sale.
- **Employee information** — headcount, roles, tenure, compensation. Are any employees key-person risks? Any non-competes or non-solicits in place? Benefits obligations?
- **Licenses and permits** — industry-specific licenses (liquor, contractor, healthcare, etc.). Are they transferable? In the owner's name or the business entity?
- **Insurance policies** — what's in force? Any claims history? Liability coverage amounts.
- **Org chart / org narrative** — how does the business actually run day to day without the owner present?

### Entity & Legal Documents

- **Articles of incorporation / operating agreement** — verifies entity type, ownership percentages, any restrictions on transfer
- **Cap table / ownership structure** — any minority owners? Investors with rights? Loans from owners that need to be unwound?
- **Pending litigation disclosure** — any open lawsuits, claims, or known liabilities? This is a broker's due diligence obligation and goes into the seller's representations.
- **IP inventory** — trademarks, domain names, social media accounts, proprietary processes. Are they owned by the entity or the individual?
- **Prior LOIs or deal attempts** — has the business been listed before? Why did prior deals fall through? This is highly relevant and must be disclosed.

***

## The Completeness Assessment — Broker Rule

Before a broker moves to recasting, they score the document set against a completeness threshold. The industry rule is simple: **you cannot produce a defensible valuation or a CIM without at minimum 3 years of tax returns and matching P&Ls.** Everything else is negotiable — missing a lease can be worked around; missing financial history cannot.

The broker's completeness review produces a **gap list**: a prioritized list of missing documents with urgency flags (deal-blocking vs. nice-to-have). This is exactly what your data ingestion agent should output before handing off to the recasting agent — a structured completeness score with specific missing items, their deal-blocking severity, and automated requests to the seller.

***

## The Normalization Step (Pre-Recast)

Before any add-back analysis, a broker does one more thing that's often overlooked: **they normalize the data format**. Tax returns use different line-item structure than QuickBooks exports. A voice memo from a seller saying "we also have $40K in equipment not on the books" is unstructured data that has to get reconciled into the balance sheet. Your multi-modal ingestion makes this step explicitly necessary — the normalization agent has to convert voice transcripts, uploaded PDFs, QuickBooks API pulls, and bank CSV exports into a single unified financial model before recasting can happen.

The broker rules here:
- All revenue figures must be on a **consistent accrual basis** before comparison across years
- **Owner W-2 wages must be separated** from distributions/draws — they're treated differently in SDE recasting
- **Related-party transactions** must be flagged — rent paid to an owner-controlled entity, loans to family members, etc.
- **Non-operating income/expenses** must be identified and tagged — one-time legal settlements, PPP forgiveness, insurance proceeds

Only after normalization does recasting begin. The recast is where the SDE/EBITDA number that actually drives the valuation gets built — but that's the next phase.

***

This means your intake agent pipeline for Scorta has at least **four distinct agent steps** before touching recast math: (1) multi-modal ingestion, (2) document classification & extraction, (3) completeness scoring + gap list generation, and (4) normalization into a unified financial model. Want to map out the agent architecture for any of these specifically?

Sources
