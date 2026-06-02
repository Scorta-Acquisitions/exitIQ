Here is the complete broker rulebook for Phase 3, mapped to a high-level agent architecture for each responsibility cluster.

***

## The Gate Into Phase 3

Before a single buyer is contacted, a broker confirms:

- CIM is finalized and approved by seller
- Blind teaser is ready
- NDA template is executed and ready to send
- Seller has agreed on a **process type**: open market (anyone who qualifies can submit an offer) vs. controlled auction (limited buyer list, deadline for offers, bid comparison)
- Seller has confirmed **no-contact rule**: all buyer communication routes through the broker, zero direct seller contact until broker authorizes a management call

The process type decision is significant — it shapes how aggressive outreach is and how much leverage the seller has at the offer stage.

***

## Responsibility 1: Buyer Identification & Sourcing

### What a Broker Does

This is a research and targeting exercise. A broker segments the buyer universe for this specific business across four archetypes, then builds a tiered contact list.

**Archetype 1 — Individual / Owner-Operator Buyers**
- First-time acquirers using personal capital or SBA financing
- Often searching on BizBuySell, BizQuest, or through broker databases
- Qualification bar: proof of liquid capital (typically 10-20% of purchase price for SBA down payment), clean credit, some industry or operational experience
- Best reached through marketplace listings and broker network

**Archetype 2 — Search Funds / Entrepreneurship Through Acquisition (ETA)**
- Funded or self-funded searchers, often MBA graduates, looking for a platform business to operate
- Typically targeting $500K-$3M EBITDA deals
- Sophisticated buyers with financial training; underwrite deals rigorously
- Best reached through ETA networks: Axial, SearchFunder, Stanford/HBS alumni networks, direct LinkedIn outreach

**Archetype 3 — Strategic / Corporate Buyers**
- Existing businesses in the same or adjacent industry looking to acquire for customer base, geography, talent, or capability
- Often the highest-value buyers because of synergy; also the highest confidentiality risk (they're your seller's competitors or customers)
- Broker must get explicit seller permission before approaching any strategic buyer and must assess whether each specific strategic is acceptable to the seller
- Best reached through industry association member lists, trade publications, LinkedIn by company/industry

**Archetype 4 — Financial Sponsors (PE, Family Office, Search Funds)**
- Private equity firms, family offices, independent sponsors
- Typically target $1M+ EBITDA for traditional PE; sub-$1M EBITDA deals go to fundless sponsors and independent sponsors
- Process-oriented buyers; expect a clean CIM, data room, and defined LOI deadline
- Best reached through Axial, DealStream, direct outreach via firm websites, placement agent networks

### Broker Rules for Buyer Sourcing

- **Strategic buyer pre-clearance rule**: Before adding any competitor or customer to the outreach list, the broker must get explicit written approval from the seller. This is non-negotiable. A seller's competitor receiving a CIM without permission is grounds for termination of the listing agreement and potential legal liability.
- **List size discipline**: A targeted list of 30-50 genuinely qualified buyers outperforms a spray of 500 marginally relevant contacts. Brokers who blast 500 emails create noise, burn credibility, and generate unqualified inquiry volume that wastes everyone's time.
- **Buyer database maintenance**: Professional brokers maintain a proprietary buyer database of past inquirers, past clients (who might buy again), and contacts sorted by industry interest and capital capacity. This database is one of the core assets of a brokerage operation.
- **No double-contact rule**: If a buyer is already in the broker's database as a past contact for a different deal, they get a personalized note referencing the prior interaction, not a cold template.

### Agent Architecture: Buyer Identification Agent

```
INPUTS:
  - Recast financials (SDE, revenue, margin profile)
  - Industry/NAICS code
  - Deal size (asking price)
  - Geography
  - Deal structure parameters (SBA eligible? Seller note? RE attached?)
  - Seller-approved strategic buyer criteria

PIPELINE:
  Step 1 → Buyer Universe Classifier
    - Determine which archetypes are relevant for this deal size/structure
    - Flag if SBA eligibility expands individual buyer pool
    - Flag if deal size requires institutional buyer presence

  Step 2 → Buyer List Builder
    - Query internal buyer database for matching criteria
    - Generate LinkedIn search parameters for each archetype
    - Generate Axial/DealStream search filters
    - Output: tiered buyer list (A-list: warm/vetted, B-list: cold/targeted, C-list: marketplace)

  Step 3 → Strategic Buyer Screener
    - Cross-reference any strategics against seller's approved/blocked list
    - Flag any relationship conflicts (existing customers, known competitors)
    - Hold strategics pending seller approval workflow before outreach

OUTPUT:
  - Tiered buyer contact list with archetype tags
  - Strategic buyer approval queue for human review
  - Recommended outreach channel per contact
```

***

## Responsibility 2: Outreach Campaigns

### What a Broker Does

Outreach is multi-channel and sequenced. A broker doesn't send one email and wait — they run a structured campaign across several channels simultaneously with defined follow-up cadences.

**Channel 1 — Marketplace Listings (passive inbound)**
Already live from Phase 2. Listings on BizBuySell, BizQuest, DealStream generate inbound inquiry. Broker's job is to respond to every inquiry within 24 hours (slow response is one of the most common broker failures — buyers move on).

**Channel 2 — Broker Network Distribution**
Professional brokers are members of IBBA (International Business Brokers Association), M&A Source, and state-level broker associations. Co-brokering — where the seller's broker splits the commission with a buyer's broker who brings a qualified buyer — is common, especially for higher-value deals. The seller's broker sends deal summaries to the broker network and co-brokers the deal if the right buyer is represented.

**Channel 3 — Direct Email Outreach**
Personalized emails to the targeted buyer list. Not newsletters — individual outreach referencing why this specific deal matches this specific buyer's stated criteria or history.

**Channel 4 — LinkedIn Outreach**
For search funds and individual operators. Direct InMail or connection request with a deal-specific message. More personal than email for this archetype.

**Channel 5 — Axial / DealStream Campaign**
For financial sponsors. The CIM or teaser is posted to the platform as a "deal" and matched to buyers whose criteria filters align. Buyers on these platforms are active acquirers; response rates are higher than cold email.

### Outreach Content Rules

- **Teaser only, pre-NDA** — all outreach content at first contact contains only teaser-level information. No CIM, no financials, no business name.
- **Personalization floor**: Every outreach message must reference at minimum (a) why the deal matches the buyer's profile and (b) one specific financial or operational hook. Generic blast emails have <5% open rates; personalized deal-specific emails average 25-40%.
- **Single call to action**: "Execute the attached NDA to receive the full CIM and recast financials." Nothing else.
- **Follow-up cadence**: Day 1 (initial outreach), Day 5 (follow-up if no response), Day 12 (final follow-up). After three touches with no response, the contact is moved to inactive. Brokers who send 7+ follow-ups damage deal reputation.
- **Info parity rule**: Every buyer in the active process must receive the same information at the same stage. If one buyer asks a question that reveals a material fact, that fact must be disclosed to all active buyers. This is both an ethical obligation and a legal one in many states.

### Agent Architecture: Outreach Campaign Agent

```
INPUTS:
  - Tiered buyer list from Buyer Identification Agent
  - Approved blind teaser
  - NDA document
  - Seller-defined outreach constraints (strategics approved/blocked)
  - Deal timeline / offer deadline if controlled auction

PIPELINE:
  Step 1 → Message Personalization Agent
    - For each contact: pull archetype, prior interaction history, stated criteria
    - Generate personalized outreach message (email or LinkedIn)
    - Human review queue for A-list contacts (high-value, warm relationships)
    - Auto-send approved for B/C-list with personalization tokens

  Step 2 → Channel Router
    - Route each contact to optimal channel (email / LinkedIn / Axial / broker network)
    - Attach teaser + NDA as appropriate for channel
    - Log send timestamp and channel for tracking

  Step 3 → Follow-Up Sequencer
    - Monitor for NDA execution (webhook from DocuSign or equivalent)
    - If no response: trigger follow-up at Day 5, Day 12
    - After 3 touches no response: mark inactive, flag for quarterly reactivation
    - If NDA executed: trigger handoff to Buyer Qualification Agent

  Step 4 → Info Parity Monitor
    - Track every material fact disclosed to any buyer
    - When new disclosure occurs, audit active buyer list
    - Generate supplemental disclosure queue for all active buyers who haven't received it

OUTPUT:
  - Campaign send log with timestamps and channels
  - NDA execution tracker (pending / executed / declined)
  - Follow-up queue with scheduled send dates
  - Info parity disclosure log
```

***

## Responsibility 3: Buyer Qualification

### What a Broker Does

This is the most consequential step in Phase 3. Unqualified buyers are the #1 cause of deals falling apart after LOI — they waste months of everyone's time, expose confidential information, and often cause the seller's business to suffer because the owner was mentally "checked out" in anticipation of closing.

### Qualification Dimensions

**Dimension 1 — Financial Capacity**

The broker must verify the buyer can actually close the deal. This is not a trust exercise — it requires documentation.

- **For SBA-financed deals**: SBA pre-qualification letter from an approved lender, or a letter of intent to lend from an SBA Preferred Lender Program (PLP) bank. The buyer must have 10-20% of the purchase price in verified liquid assets.
- **For cash buyers**: Proof of funds in the form of a bank or brokerage statement dated within 30 days. The broker confirms the funds are liquid (not locked in a 401K, a house, or a note receivable).
- **For PE/sponsor buyers**: Evidence of fund size, available capital, or LP commitments. Investment mandate documents confirming the deal fits their criteria.
- **Debt capacity check**: For leveraged buyers, broker does a rough DSCR (Debt Service Coverage Ratio) calculation. The business must generate enough cash flow to service the acquisition debt plus the buyer's salary at a ratio of at least 1.25x. If the math doesn't work, the buyer can't close regardless of how qualified they seem.

The broker rule: **No buyer packet is released until financial capacity is verified.** This is the single most frequently violated rule by amateur brokers, and the single most important one.

**Dimension 2 — Acquisition Experience & Operational Fit**

- Has the buyer acquired a business before? If yes, in what industry, at what price point, and what was the outcome?
- Does the buyer have operational experience running a business, or are they coming purely from a financial background?
- For owner-operator buyers: does their work history suggest they can run this specific type of business?
- For search funds: are they self-funded (higher commitment signal) or funded (institutional backing but operator is less tested)?
- **Industry fit rule**: A buyer with zero relevant experience buying a highly technical or regulated business (HVAC, healthcare, commercial food service) is a risk. Brokers assess whether the learning curve creates deal risk post-close and whether a transition period and seller note can bridge the gap.

**Dimension 3 — Intent & Timeline**

- Is this buyer actively looking to close within a defined timeframe, or are they "exploring"?
- Do they have advisors engaged (attorney, CPA, M&A advisor)? Buyers without advisors move slower, make more errors in LOI/APA, and create more deal friction.
- Is this the decision-maker, or are they buying on behalf of a family office, fund, or entity where someone else controls the check?
- **Stalking horse rule**: Brokers are trained to identify "professional lookers" — buyers who execute NDAs, receive CIMs, ask extensive questions, and never make offers. These buyers consume broker time and create confidentiality risk. After two deals with the same buyer that never resulted in an offer, brokers typically add a screening call before releasing materials.

**Dimension 4 — Cultural Fit (Seller-Dependent)**

Many sellers — especially those with long tenures, family businesses, or tight employee communities — care deeply about who buys the business. A broker must understand and honor seller preferences:

- Is the seller willing to sell to a financial buyer who will cut costs, or do they insist on a strategic who will grow the team?
- Is the seller comfortable with a foreign national buyer (common in certain industries)?
- Are there any employees the seller wants protected? Do they want the buyer to commit to retention?

These are soft criteria that can't be formalized into a scoring rubric, but they kill deals if ignored.

### The Qualification Interview

Before releasing the buyer packet, brokers conduct a qualification call. Standard questions:

1. Tell me about your acquisition background — have you bought a business before?
2. What type of business are you looking for and why does this one fit?
3. What is your timeline for closing a deal?
4. How are you planning to finance this acquisition?
5. Can you confirm you have the liquidity for a down payment in this range?
6. Who else is involved in the decision — partners, family, fund LPs?
7. Do you have an attorney and CPA engaged for acquisitions?
8. Are you looking at other deals right now? (Helps assess urgency and competition)

### Agent Architecture: Buyer Qualification Agent

```
INPUTS:
  - Executed NDA + buyer contact record
  - Deal parameters (asking price, SBA eligible, deal structure)
  - Seller qualification preferences (industry experience required, cultural fit flags)
  - Buyer's responses to intake form (submitted post-NDA, pre-CIM release)

PIPELINE:
  Step 1 → Financial Capacity Screener
    - Parse proof of funds document or SBA pre-qual letter
    - Run DSCR calculation: recast SDE ÷ estimated annual debt service (asking price × 0.07 for SBA)
    - Flag if liquid assets < 10% of asking price (hard disqualify for SBA path)
    - Flag if DSCR < 1.25x (marginal qualification — human review required)
    - Output: financial capacity score (Qualified / Conditional / Disqualified)

  Step 2 → Experience & Fit Scorer
    - Parse buyer intake form responses
    - Score acquisition experience (0 = none, 1 = one prior deal, 2 = multiple deals)
    - Score industry fit (0 = no relevant experience, 1 = adjacent, 2 = direct)
    - Score advisor engagement (0 = no advisors, 1 = partial, 2 = full team engaged)
    - Output: experience score + fit narrative

  Step 3 → Qualification Decision Engine
    - Combine financial capacity + experience + fit scores
    - Apply seller's stated soft criteria
    - Classify: Fully Qualified → release buyer packet
               Conditionally Qualified → schedule human qualification call
               Disqualified → send decline communication, log reason

  Step 4 → Qualification Interview Prep (for Conditional)
    - Generate personalized interview brief for human reviewer
    - Surface specific gaps to probe (e.g., "no prior acquisitions, probe operational experience")
    - Post-call: human inputs outcome, agent updates qualification status

OUTPUT:
  - Qualification status per buyer (Qualified / Conditional / Disqualified)
  - DSCR calculation and financial summary
  - Experience + fit score card
  - Interview brief for conditional buyers (human review queue)
  - Decline communication drafts for disqualified buyers
```

***

## Responsibility 4: Buyer Packet (Staged Disclosure)

### What a Broker Does

The buyer packet is not a dump of all documents at once. It is a **staged disclosure protocol** — information is released in tranches based on buyer qualification level and deal progression. This protects the seller's confidential information from being broadly distributed before a serious buyer emerges.

### The Three Disclosure Stages

**Stage 1 — Post-NDA (Teaser → Full CIM)**
- Full CIM with identity revealed
- Recast P&L summary (3 years + TTM)
- Business overview photos (interior only)
- Seller FAQ document

**Stage 2 — Post-Qualification (Buyer Packet)**
Released only to fully qualified buyers. Contains:
- Full 3-year federal tax returns
- Full 3-year P&L statements (detailed, not summary)
- Balance sheets (3 years + current)
- Current lease agreement (redacted for landlord contact info)
- Equipment list
- Payroll summary by role (not individual names)
- Top customer concentration breakdown (anonymized — "Customer A = 22% of revenue")
- Org chart

**Stage 3 — Post-LOI (Due Diligence Data Room)**
Released only to the buyer under exclusivity. Full data room access including employee names, customer contracts, vendor agreements, bank statements. This is Phase 5 territory — not Phase 3.

### Staged Disclosure Rules

- **No skipping stages** — a buyer who seems highly qualified and pushes for full due diligence materials before submitting an LOI gets Stage 2 and nothing more. Releasing Stage 3 materials pre-LOI gives the buyer all the information they need to walk away without any commitment.
- **Buyer-specific watermarking** — all Stage 2 documents are watermarked with the buyer's name/ID before release. If a document from Stage 2 appears in a competitor's hands, the source is traceable.
- **Tracking every release** — every document released, to every buyer, at every stage, is logged with timestamp. This log becomes critical if a buyer later claims they weren't told something, or if there's a confidentiality breach.
- **Simultaneous release rule**: If multiple buyers are in the qualified pool, they must receive Stage 2 materials at approximately the same time if a controlled auction process is running. Giving one buyer a 3-week head start creates information asymmetry that disadvantages the seller.

### Agent Architecture: Buyer Packet Agent

```
INPUTS:
  - Buyer qualification status from Qualification Agent
  - Seller's document repository (from intake/ingestion phase)
  - Deal stage per buyer (post-NDA, post-qualification, post-LOI)
  - Buyer-specific watermark ID

PIPELINE:
  Step 1 → Disclosure Stage Gatekeeper
    - Map each buyer to their current disclosure stage
    - Validate that qualification requirements are met before advancing stage
    - Block any request to advance stage without proper qualification event

  Step 2 → Document Package Builder
    - Pull documents appropriate for the buyer's current stage
    - Apply buyer-specific watermark to each document
    - Generate cover page with disclosure legend and buyer name
    - Bundle into staged package

  Step 3 → Delivery & Tracking Agent
    - Send via secure document portal (DocuSend, Digify, or equivalent)
    - Log: document name, version, buyer ID, timestamp, delivery channel
    - Monitor for document opens and time-spent signals
    - Alert if document forwarded to unregistered email (DRM capability)

  Step 4 → Simultaneous Release Coordinator (auction process)
    - Track release timestamps across all qualified buyers
    - Flag if one buyer is >5 days ahead of others in document access
    - Generate release schedule to maintain info parity in controlled process

OUTPUT:
  - Per-buyer document release log
  - Watermarked document packages
  - Engagement signals (opened, time spent, forwarded)
  - Info parity status across buyer pool
```

***

## Responsibility 5: Q&A Management

### What a Broker Does

From the moment the CIM is released to the moment an LOI is signed, buyers generate a continuous stream of questions. Managing this is one of the most labor-intensive parts of the broker's job and one of the places where deals are most often damaged.

### The Rules of Q&A Management

**Rule 1 — Broker is the sole channel**
All buyer questions route through the broker. No buyer communicates directly with the seller, employees, customers, or vendors until the broker authorizes a management call (which happens only after a qualified buyer indicates serious interest). This rule protects the seller from being pressured, from inadvertently disclosing confidential information, or from making representations that could later create legal liability.

**Rule 2 — Questions get answered, not deflected**
A broker who routinely responds to buyer questions with "we'll address that in due diligence" loses buyers. Questions at the CIM stage deserve substantive answers. Buyers are evaluating whether to spend hundreds of hours and tens of thousands in advisor fees on this deal. They need enough to make that commitment.

**Rule 3 — Material answers go to all active buyers (info parity)**
If a buyer asks a question whose answer reveals a material fact — something that would affect a reasonable buyer's valuation or decision to proceed — that answer must be distributed to all buyers who have received the CIM. This is both an ethical broker obligation and, in many states, a legal disclosure obligation tied to broker licensing requirements.

**Rule 4 — Seller-touching questions get pre-approved**
Before a broker answers any question that requires seller input, the broker pre-qualifies whether the answer should come from the broker (using information already on record) or requires direct seller consultation. Sellers are not peppered with 30 individual buyer questions — the broker batches questions, presents them once, gets answers, and distributes.

**Rule 5 — No speculative answers**
A broker never answers a question with information they're not certain of. "I believe the lease is assignable" is not an acceptable answer. The answer is either a confirmed fact from a document, or "I'll confirm and get back to you within 48 hours."

**Rule 6 — Every answer is logged**
Every question asked, by every buyer, and every answer given, is logged. This creates the Q&A record that becomes part of the deal file and protects the broker and seller from later claims that information was misrepresented.

**Rule 7 — Management calls are earned, not given**
A management call — where a buyer speaks directly with the seller — is authorized only when:
- The buyer is fully qualified (financial capacity verified)
- The buyer has reviewed the full CIM and buyer packet
- The buyer has submitted a written indication of interest (IOI) or is clearly preparing to do so
- The seller has been briefed on the buyer and approved the call

The broker prepares the seller for the management call with: buyer background brief, list of likely questions, coaching on what not to say (don't discuss price, don't make representations about the business not in the CIM, don't discuss employees by name).

### Agent Architecture: Q&A Management Agent

```
INPUTS:
  - Inbound buyer questions (email, portal, any channel)
  - CIM content + Seller FAQ document (ground truth for answers)
  - Seller-approved Q&A log (running record of all answered questions)
  - Active buyer list with stage/status
  - Seller communication preferences (batch vs. real-time)

PIPELINE:
  Step 1 → Question Classifier
    - Classify each question:
        Type A: Answerable from CIM / FAQ / documents on record → auto-draft answer
        Type B: Requires seller input → batch into seller consultation queue
        Type C: Reveals seller's identity or specific customer/employee → flag for human review
        Type D: Asks for Stage 3 materials pre-LOI → decline with stage explanation
    - Flag any question that touches a material fact not previously disclosed

  Step 2 → Answer Drafter
    - For Type A: generate answer from CIM/FAQ knowledge base
    - Cite source document and section for every claim in the answer
    - Human review queue for any answer touching financials, legal, or deal terms
    - Auto-approve factual/operational answers within defined confidence threshold

  Step 3 → Info Parity Trigger
    - After each answer is finalized: assess if it contains a new material fact
    - If yes: generate supplemental disclosure package for all active buyers
    - Log material disclosure with timestamp and buyer distribution list

  Step 4 → Seller Consultation Batcher
    - Collect all Type B questions across all buyers over rolling 48-hour window
    - Deduplicate overlapping questions
    - Generate consolidated seller Q&A brief
    - Human delivers to seller; inputs answers; agent distributes

  Step 5 → Management Call Gatekeeper
    - Monitor buyer engagement signals (documents opened, questions submitted, IOI signals)
    - When buyer meets management call criteria: generate buyer background brief for seller
    - Schedule management call through human layer
    - Post-call: log topics discussed, any new disclosures made

OUTPUT:
  - Per-buyer Q&A log (question, answer, timestamp, source document)
  - Seller consultation brief (batched Type B questions)
  - Info parity disclosure queue
  - Management call brief (buyer background + coaching notes for seller)
  - Material disclosure log (running record for deal file)
```

***

## Phase 3 Agent Dependency Map

These five agents don't run independently — they form a pipeline with feedback loops:

```
Buyer Identification Agent
        ↓
Outreach Campaign Agent
        ↓ (NDA executed trigger)
Buyer Qualification Agent
        ↓ (Qualified status trigger)
Buyer Packet Agent ←──────────────────────────┐
        ↓                                      │
Q&A Management Agent ──(stage advance signal)──┘
        ↓ (IOI/serious interest signal)
→ Handoff to Phase 4: LOI Drafting Agent
```

The NDA execution event is the universal trigger that kicks off qualification. The qualification decision is the trigger for packet release. Engagement signals from the Q&A agent (volume of questions, documents reviewed, management call request) are the input signals that tell the LOI drafting agent a buyer is approaching offer readiness. Every agent in Phase 3 feeds data into Phase 4.

Sources
