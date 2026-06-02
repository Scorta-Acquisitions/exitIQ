# Next Focus — Brokerage-First

## Strategic pivot

De-prioritize the **prep** side temporarily — it's complicating engineering and diluting the offering. Focus on building out the **brokerage** side instead.

**The model:** Agents replace everything a traditional broker does on the document and process side. Scorta stays **human-in-the-loop** for the relationship layer with sellers.

**What we keep:** ExitIQ app and the GAP report it generates (valuation + readiness analysis).

**What we build next:** The full broker workflow — starting with:
- CIM generation
- Buyer packet generation
- Marketplace listing drafting
- Buyer qualification
- LOI drafting
- …and every other responsibility a broker owns in a small business sale (see breakdown below).

**Stack context:** [exitIQ repo](https://github.com/Scorta-Acquisitions/exitIQ) — Next.js / TypeScript / Supabase, Drizzle ORM, Storybook, strong CI/CD.

---

## Seller intent (why they're here)

Capture **why** a seller is using the platform at intake — this drives question flow, report emphasis, and which agents we surface:

| Intent | What they want |
|---|---|
| **Sell** | Run a full exit — listing, outreach, qualification, LOI, close |
| **Understand value** | Clean up the business and get a clear picture of what it's worth |
| **Improve valuation** | Identify gaps and actions to increase multiple / sale price |
| **Get financing** | Package the business for lenders (SBA, conventional, seller note) |

This should be a first-class picker in ExitIQ — not inferred later.

---

## Broker responsibility map

Every function a traditional broker owns in a small business sale, organized by deal phase. Each item is a potential **agent surface** for Scorta.

---

## Phase 1 — Intake & Valuation

- **Initial seller consultation** — understand motivations, timeline, deal structure preferences; *this is the relationship layer you keep human*
- **Business valuation** — calculate SDE, EBITDA, apply industry multiples, benchmark comps; your GAP Report already owns the valuation analysis piece
- **Valuation opinion letter** — formal written range with methodology disclosed to seller
- **Recasting / add-back analysis** — normalize financials by identifying owner perks, one-time expenses, non-recurring items
- **Deal structure recommendation** — asset vs. stock sale, seller financing, earnout, real estate carveout

***

## Phase 2 — Listing Preparation

- **CIM (Confidential Information Memorandum)** — the flagship sales document: executive summary, business overview, financials, operations, growth thesis, asking price rationale
- **Teaser / blind profile** — 1-page anonymous summary for initial outreach without revealing identity
- **Marketplace listing drafts** — BizBuySell, BizQuest, DealStream, LoopNet (for RE-attached), industry-specific boards
- **NDA / CDA drafting** — standard non-disclosure for releasing the CIM to interested buyers
- **Seller FAQ document** — pre-answers common buyer questions to reduce deal friction

***

## Phase 3 — Buyer Outreach & Qualification

- **Buyer identification & sourcing** — build a targeted buyer list: financial sponsors, strategics, search funds, HNW individuals
- **Outreach campaigns** — email sequences, LinkedIn outreach, broker network distribution
- **Buyer qualification** — assess financial capacity (proof of funds / SBA pre-qual), acquisition experience, fit with business; your buyer qualification module lives here
- **Buyer packet / info pack** — staged disclosure package beyond the CIM: tax returns, P&Ls, lease agreements, key contracts
- **Q&A management** — field buyer questions, route to seller only what's appropriate, maintain info parity across buyers

***

## Phase 4 — Offer & Negotiation

- **LOI drafting & redlining** — structure the Letter of Intent: price, terms, exclusivity, contingencies, deposit
- **Offer comparison matrix** — side-by-side analysis of competing offers across price, structure, and risk
- **Negotiation facilitation** — shuttle diplomacy between buyer and seller; broker often does the "heavy" conversations so principals don't damage the relationship
- **Exclusivity period management** — track timelines, enforce no-shop provisions

***

## Phase 5 — Due Diligence

- **Due diligence checklist** — generate the master request list (financial, legal, operational, HR, IT, IP)
- **Data room setup & management** — organize and gate access to documents; track what's been reviewed
- **Buyer DD Q&A facilitation** — route questions, track open items, push for timely responses
- **Deal issue triage** — when a buyer finds a problem, help frame it and propose a remedy (price adjustment, escrow, reps & warranties)
- **Lender coordination** — if SBA or conventional financing, liaise with lender on CPA-prepared docs, business summaries, site visits

***

## Phase 6 — Closing

- **Purchase agreement review** — not legal advice, but brokers flag gaps between LOI and APA and push parties toward resolution
- **Closing checklist** — master task list across buyer, seller, attorneys, accountant, lender, landlord
- **Landlord/lease assignment coordination** — one of the most common deal killers; broker manages the timeline
- **Inventory count coordination** — if included in sale, broker arranges and reconciles
- **Training & transition plan** — document the seller's post-close obligations, build the handoff schedule
- **Wire/escrow coordination** — direct funds to escrow, confirm disbursements on close day

***

## Phase 7 — Post-Close

- **Commission reconciliation** — not relevant for Scorta but worth noting brokers earn 8-12% on sub-$1M deals
- **Seller referral / testimonial capture** — relationship follow-up
- **Deal tombstone / case study** — internal record keeping and marketing material

***

## Scorta Agent Surface Map

Based on this, here's how it maps to your build priority:

| Broker Function | Scorta Agent | Phase |
|---|---|---|
| Valuation + GAP Report | ✅ Already built | Intake |
| CIM generation | 🔨 Build next | Listing Prep |
| Teaser/blind profile | 🔨 Lightweight (derives from CIM) | Listing Prep |
| Marketplace listing drafts | 🔨 Build next | Listing Prep |
| NDA generation | 🔨 Template + agent | Listing Prep |
| Buyer qualification | 🔨 Build next | Buyer Outreach |
| Buyer packet (staged) | 🔨 Build next | Buyer Outreach |
| LOI drafting | 🔨 Build next | Offer |
| Offer comparison matrix | Agent-generated | Offer |
| DD checklist generation | Agent-generated | Due Diligence |
| Data room management | Infrastructure | Due Diligence |
| Closing checklist | Agent-generated | Closing |
| Transition plan | Agent-generated | Closing |

The CIM → marketplace listing → buyer qualification → LOI drafting chain is the core workflow that lets you take a seller all the way from "I want to sell" to "I have a qualified buyer with an LOI" without a human broker touching a document. That's the wedge. Want to start scoping the CIM generation agent first, since everything downstream derives from it?

Sources


