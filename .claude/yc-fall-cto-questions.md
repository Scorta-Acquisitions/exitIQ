# Scorta — YC Fall 2026
## CTO Question Bank (Puneet)

Product, AI architecture, agent workings, human-time, and live-product questions extracted from the master interview prep.

**Ownership:** Puneet leads these. Suyash can hand off with: “Puneet built that part—Puneet, take it.”

**Answer shape:** Direct answer → one concrete fact → stop. 20–40 seconds. “If they push” is backup only.

---

## Core CTO Anchors

Memorize these three before the rest:

1. **How the system works:** Two agent teams (prep + market). Humans approve every material action.
2. **AI boundary:** Deterministic math, traced to source docs. LLM writes explanation/narrative, not the numbers.
3. **Proof it’s real:** Operator stack ran both closed deals end to end. Under 45 human hours, ~$600 inference. Show one redacted live deal in ≤60 seconds.

---

## Speakable Scripts — “Tell me about the product / ExitIQ / DealIQ”

Use the matching opener, then stop. Expand only if they ask how it works.

### “Tell me about your product” / “What are you building?” / “What does Scorta do?”

- Scorta replaces the small business broker for $500K–$2M businesses
- Two agent teams run the sale end to end
- Prep team: recast financials, owner dependency, SBA package → financeable asset
- Market team: match capital-verified buyers, deal room, lender process, close
- Owners pay $3K–$5K upfront and 5% on close
- Same engine powers DealIQ on the buy side to grow the verified buyer pool
- **Stop.** If they want proof → first closed deal ($950K failed listing → $1.3M close)

### “How does the product work?” / “Walk me through the system”

- Prep agents ingest books/contracts → rebuild P&L the way a lender sees it → flag concentration + owner dependency → remediation + financeable package
- Market agents run buyer red-team → match verified pool → outreach, VDR, lender submissions, close workflow
- Humans approve every material action before it goes out
- Numbers are deterministic and source-traced; LLM writes the explanation, not the math
- Operator-facing first — seller buys a managed outcome, not a dashboard
- **If they ask agents by name:** Ingestion, Recast, Owner-Dependency, Concentration, Case Manager, Boardroom, Lender Ops, Outreach

### “What is ExitIQ?” / “How do sellers find you?” / “What’s the assessment?”

- ExitIQ is the free intake assessment — top of the seller funnel
- ~6 minutes; adapts by answer; not a generic form
- Output is a GAP Report: valuation, buyer view, lendability roadmap, 90-day fix list
- Converts to a founder call → paid Diagnostic → brokerage if ready
- Also the CPA channel surface (white-label / co-branded)
- ExitIQ is intake. Scorta is the paid prep + brokerage that actually sells the business

### “What is DealIQ?” / “What’s the buyer product?” / “Why a second product?”

- DealIQ is the same recast/diligence engine pointed at buyers
- Customer: searchers, ETA, search funds, independent sponsors under $5M — not big PE
- Reverse-recasts claimed SDE, screens deals PASS/DIG/PURSUE, models SBA returns, drafts diligence + LOI
- Three search funds on $1,250 pilots
- Revenue is small; strategic job is capital-verified buyer pool for the sell-side
- **Clean line:** Buy side is acquisition. Sell side is the business.

### “How do ExitIQ and DealIQ relate?” / “Are these two products?”

- One company, one engine, two surfaces
- ExitIQ → sellers into prep/brokerage
- DealIQ → buyers into the capital-verified pool
- No in-app switcher; landing page is the only bridge
- Data that crosses: verified buyer profile into sell-side outreach — not deal data both ways

### “Is this AI / agents / software / services?”

- AI-native services company — unit is a closed transaction, not a seat
- Agents do the mechanical underwriting and coordination work
- Humans own judgment: don’t-list calls, negotiation, approval of anything external
- First cradle-to-close: under 45 human hours, ~$600 inference
- Software changes the labor curve; revenue is still $50K–$70K per close

### One-liner ladder (pick one)

- **Scorta:** Agent-native broker that makes a Main Street business financeable, then sells it into verified demand
- **ExitIQ:** Free assessment that answers worth / who buys / what to fix — then becomes intake
- **DealIQ:** Buy-side of the same engine — reverse-recast deals and grow the verified buyer pool

---

## 1. How does the product actually work?

**Answer:** There are two agent teams. The prep team ingests the books and contracts, rebuilds the P&L the way a lender will view it, identifies concentration and owner-dependency risks, and produces the remediation plan and financeable deal package. The market team runs the buyer red-team, matches the company to the verified pool, manages outreach, the data room, lender submissions, and the closing workflow. We approve every material action before it goes out.

**If they push:**
- The system is operator-facing first. Sellers do not need to live in a dashboard.
- Every dollar figure is deterministic and traceable to a source document; the LLM writes the explanation, not the math.
- Avoid listing all eight agent names unless they ask how the system works.

**Agent stack (if asked):** Ingestion, Recast, Owner-Dependency, Concentration, Case Manager / CASE, Boardroom, CIM, VDR, Lender Ops, Outreach.

---

## 2. How much of this is actually AI, and how much is you two?

**Answer:** The first full close took under 45 hours of human time and about $600 of inference. The important boundary is that the LLM never invents the financial math. Valuation inputs, recast calculations, sub-scores, and lender checks are deterministic and traced to source documents. The models handle ingestion, classification, narrative, edge-case reasoning, and coordination. We retain approval gates for every material action.

**If they push:**
- Agents run ingestion, recast support, owner-dependency analysis, concentration review, buyer red-team, lender operations, and outreach.
- Do not say “fully autonomous.” Human approval is part of the design.

---

## 3. Which parts are still manual?

**Answer:** The high-judgment and high-trust moments are still founder-led: telling an owner not to list, setting deal strategy, negotiating material terms, and handling sensitive buyer-seller fit. We also review the financial output and approve anything that leaves the system. The mechanical work upstream—document ingestion, normalization, first-pass recast, risk analysis, data-room organization, and outreach coordination—is agent-driven.

---

## 4. How much human involvement is there in one transaction?

**Answer:** Our first cradle-to-close transaction took under 45 hours of human time. The agents handle the repetitive analytical and coordination work, but humans still own the moments where judgment matters: the “do not list” conversation, deal strategy, negotiation, and approval of anything material sent to a buyer, lender, or seller. We are not trying to remove accountability; we are trying to remove the 200-plus hours of mechanical work around it.

**If they push:**
- Reconcile May’s “4–6 plus 1–2 hours” answer if challenged: that was an estimate of founder time on the prep and early brokerage stages before a full close; 45 hours is the measured cradle-to-close total.
- Target: 20 concurrent deals per operator versus roughly 4–6 in a traditional shop.

---

## 5. What breaks if deal volume goes up 10x tomorrow?

**Answer:** The first bottleneck would be the human approval queue, especially around lender submissions, exceptions in the recast, and negotiation. The core analysis can scale faster than the judgment layer. The next product work is therefore less about adding another flashy agent and more about better exception routing, confidence thresholds, and operator queues so one person can safely supervise more deals.

**If they push:**
- If lender portals are still manual, say so directly.
- Name the real current bottleneck rather than claiming nothing breaks.

---

## 6. Is the product live?

**Answer:** In May, what we showed was a demo with sample data. That is no longer the whole story. The operator stack ran both closed deals end to end: ingestion, recast, lender package, data room, buyer outreach, and closing workflow. It is still operator-facing first because we are the daily user. The seller-facing surface is intentionally lighter; the seller is buying a managed outcome, not a dashboard.

**If they push:**
- Have one real closed deal open with the company name redacted.
- Say which panels are live and which, if any, still use sample data before they ask.
- The public demo company remains sample data; disclose that immediately.

---

## 7. Can you show me a real customer?

**Answer:** Yes. Show the redacted live deal, then narrate only the mechanism: source documents, recast traceability, lender package, buyer matching, and status/approval log. Keep the tour under a minute. The purpose is to prove that the system ran a real transaction, not to demonstrate every screen.

**If they push:**
- Do not show confidential seller information or claim mock data is live.
- Prepare the exact tab and login path before the interview.

**Demo script (≤60 seconds):**
1. Source documents ingested
2. Recast with traceability to docs
3. Lender package
4. Buyer matching
5. Status / approval log

---

## 8. How many sellers have actually logged in?

**Answer:** Three sellers have logged into the live seller-facing surface. All 15 sell-side engagements, including both closed deals, have been processed through the operator-facing production system. The low seller-login number is deliberate: the primary software user is Scorta, while the seller’s experience is providing information, making decisions, and getting the deal closed.

**If they push:**
- Working login count: 3 sellers. Show the redacted $1.3M agency deal.
- Final check: confirm seller accounts, unique logins, and which production panels are safe to display without violating an NDA.

---

## 9. Why can’t a traditional broker just buy your software?

**Answer:** First, it is not currently sold as a tool. More importantly, their economics and incentives are different. A traditional broker can support a 10% to 15% fee because the process is labor-heavy and often rewards taking the listing. We charge 5% and do substantial prep before market. That price only works if the operating model—not just one analyst task—is rebuilt around agents.

**If they push:**
- The strongest moat claim today is the operating dataset, workflow, and buyer/lender relationships—not a generic claim that brokers cannot learn AI.

---

## 10. How much time are you spending on DealIQ?

**Answer:** Roughly 12% of total founder time is going into DealIQ right now—about 18% of Puneet’s time and under 5% of Suyash’s. Most of that is onboarding serious buyers and capturing acquisition criteria, not building a separate SaaS roadmap. We intend to keep the total below 15% unless we can show that it is directly increasing buyer-pool growth or sell-side close speed.

**If they push:**
- Working answer: approximately 12% of combined founder time; Puneet approximately 18%, Suyash under 5%. Verify against the last four weeks of calendars and commits.
- If it is above 20%, explain why that is temporary and what milestone ends the investment.
- “Roughly 10% to 15%” is fine if that is what the data supports.

---

## Adjacent Product Questions (CTO should own or co-own)

These may be asked of either founder, but Puneet should be ready to take them — especially when they turn into architecture, engine, or live-product follow-ups.

### What is DealIQ?

**Answer:** DealIQ uses the same recast and diligence engine, but points it at a business a searcher is evaluating rather than one an owner is selling. Three search funds are paying $1,250 each for pilots. The revenue is useful but small; the strategic value is that every serious buyer who uses it joins the capital-verified pool and gives us live acquisition criteria.

**If they push:**
- Same engine, both directions: the recast is an artifact both the seller and buyer need.
- Do not lead with the future $49/$199 pricing ladder.

### Why not just become the buy-side tool? / Why is DealIQ not a second company?

**Answer:** Because the economics are dramatically better on the transaction. A small monthly subscription is not a good trade for $50K to $70K on a closed deal. And a buy-side tool without proprietary sell-side inventory eventually stops at the same public listings everyone else sees. We use the buy-side product to acquire and understand buyers; the sell-side close is where the differentiated inventory and the revenue come together.

**Clean line:** “Buy side is acquisition. Sell side is the business.”

### Are you raising software money for a services business?

**Answer:** We are an AI-native services company. The unit is a completed transaction that produces roughly $50K to $70K of revenue against about $600 of inference and under 45 measured human hours on the first close. Software is what changes the labor curve and the margins; it is not a reason to pretend the revenue is SaaS.

### Are customers emailing documents that you upload and analyze?

**Answer:** Point back to Q1 + Q2. Documents are ingested into the operator system; agents run ingestion, normalization, first-pass recast, and risk analysis; humans approve material outputs. Both closed deals ran through that production path.

### Why did you build a polished product no one had used? *(May critique)*

**Answer:** In May that was fair — we showed a demo. Since then the operator stack has run two real closes end to end. The polished seller-facing surface is still intentionally light; the production system is the operator workflow, not a consumer dashboard.

### How much are customers using the product? Do they stick around?

**Answer:** This is not SaaS usage. The relevant measure is how deeply we stay involved in the transaction. A seller works with us for two to four weeks during prep, then potentially for several more months through brokerage and close. The conversion from prep to brokerage is currently five of 15. The real retention event is not a daily login; it is whether the owner trusts us to run the sale after the diagnostic.

**If asked how many sellers log in:** 3 — and explain Scorta is the primary software user.

---

## May Interview Product Sequence (rehearsal map)

These are the exact product/agent questions from the May interview, in order:

| Partner | Question | Answer above |
|---|---|---|
| Vivian | How much human involvement is there in one transaction? | §4, also §2–§3 |
| Jared | Can you show us the platform? | §6–§8 |
| Jared | How many people have used the report/product flow? | §8 |
| Vivian | Is this live? Is this the production version? | §6 |
| Vivian | Can you show a live customer, even if it is ugly? | §7 |
| Vivian | Is this company real or dummy data? | §6–§7 |
| Jared | Are customers emailing documents that you upload and analyze? | §1, §2–§3 |
| Jared | Why did you build a polished product no one had used? | §6–§8 |

---

## Numbers Puneet Must Have Cold

| Metric | Working number |
|---|---|
| Human hours cradle-to-close (first deal) | Under 45 |
| Inference / infra cost (first full deal) | ~$600 |
| Traditional broker hours (estimate) | 250–300 |
| Concurrent deals per operator (target) | 20 vs industry 4–6 |
| Sellers logged into seller surface | 3 |
| Sell-side engagements through operator system | All 15, including both closes |
| DealIQ founder time | ~12% combined; Puneet ~18%, Suyash &lt;5% |
| DealIQ pilots | 3 × $1,250 |
| Revenue per typical close | $50K–$70K |
| Success fee | 5% (vs ~10–15% traditional) |

---

## Room Rules for Product

- Do not say “fully autonomous.” Human approval is a feature.
- Closes first if the question is about traction; product second.
- If they ask to see the product: one real redacted deal, ≤60 seconds.
- Disclose sample/demo data before they ask.
- When unknown: “I do not know yet. Here is how we are measuring it.”

---

## Working Facts Still to Confirm

| Item | Working answer | Action |
|---|---|---|
| Seller logins | 3 | Verify unique logins + safe-to-show panels |
| Live demo deal | Redacted $1.3M agency | Confirm NDA-safe path before call |
| DealIQ time | ~12% / Puneet ~18% | Check last 4 weeks of calendars + commits |
| Lender portals | May still be manual | Be ready to say so if asked about 10x scale |
| Puneet prior metrics | Claims Concierge: 200+ carriers, ~8,500 MAU, 2.8M invocations; SWE Concierge: ~250 engineers, ~200K requests | Always name the system before the metric |

---

## 5-Minute CTO Rehearsal

1. How does the product actually work?
2. How much is actually AI?
3. Which parts are still manual?
4. Is the product live? Show me.
5. What breaks at 10x volume?
6. Why is DealIQ not a second company?
