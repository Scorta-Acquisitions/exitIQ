/**
 * CASE Chat — Case Manager conversation data.
 *
 * The hand-written QA_MAP below is a fast-path cache: seeded questions and
 * the starter chips resolve instantly against it. Anything that doesn't
 * match falls through to a live model call (see buildCaseSystemPrompt below
 * and app/api/case/chat/route.ts) grounded in the same persona/audit-trail
 * facts. All numbers here trace to `lib/persona.ts` (the locked demo
 * persona) and upstream station outputs (Recast, Risk, Boardroom, VDR).
 *
 * Spec: CASE_CHAT.md (pasted into chat session 2026-05-18).
 */

import { AUDIT_TRAIL } from "@/lib/auditTrail"
import { PERSONA } from "@/lib/persona"

export type Trigger = ReadonlyArray<string>

export type QAEntry = {
  readonly triggers: Trigger
  readonly response: string
}

// Ordered most-specific to least-specific. Matching uses `.includes()` on the
// lowercased input — the first entry whose any-trigger is a substring wins.
// Greetings sit last so unrelated phrases that happen to contain "hi"/"hey"
// fall through to the meaningful answers first.
export const QA_MAP: ReadonlyArray<QAEntry> = [
  {
    triggers: ["garden state auto", "concentration", "search fund"],
    response: `Garden State Auto Group accounts for 19% of your annual revenue — within the SBA's acceptable threshold, so it's not a lender problem. But it is a Search Fund deal-breaker.

The Search Fund buyer requires a 3-year written contract to build their recurring revenue thesis. Right now you have a month-to-month arrangement on a 6-year relationship. The Concentration Agent has drafted a contract extension proposal. Until that's confirmed, the Search Fund outreach sequence is on hold.

Once the contract is signed: the Search Fund pathway opens, their LOI process can start, and you have three active buyer profiles competing for the deal instead of two.`,
  },
  {
    triggers: ["exit iq", "49", "original score", "first score"],
    response: `Your original Exit IQ assessment scored 49/100 — C grade, "Needs Preparation." Here's the axis breakdown:

Documentation:      3.0/10 ← critical gap
Owner Independence: 3.0/10 ← critical gap
Financial Clarity:  5.9/10 — moderate
Market Position:    7.0/10 — solid
Operating History: 10.0/10 — perfect (15 years)
Deal Readiness:     4.65/10 — moderate
SOP Coverage:       0.82/10 ← near zero

The two critical gaps (Documentation + Owner Independence) are exactly what the Risk Analysis station and the Owner-Dependency remediation plan are built to close. Operating History at 10/10 is your strongest asset — 15 years with repeat corporate clients is rare.

Your Scorta Score (71/100) reflects the work done since that initial assessment. The gap between 49 and 71 is what Scorta's agent fleet built in this session.`,
  },
  {
    triggers: ["recast", "financials", "add-back", "sde", "earnings"],
    response: `Your normalized financials are solid. Here's the 3-year SDE trend:

Year 1 (2022): $827,000
Year 2 (2023): $934,000
Year 3 (2024): $962,000

Revenue grew 18% over 3 years — from $1.78M to $2.1M. The Recast Agent identified $147,000 in Year 3 add-backs:
· Owner compensation: +$120,000
· Personal vehicle: +$18,000
· Personal travel: +$9,000

EBITDA as reported (Year 3) was $815,000. Normalized SDE after add-backs: $962,000. That's the number your valuation is built on.`,
  },
  {
    triggers: ["cim", "document", "memorandum"],
    response: `Your CIM is published — 12 sections, built from the approved Recast financials, Risk profile, and Boardroom buyer targeting. It's live in the VDR.

The two sections buyers spend the most time on are Section 1 (Executive Summary) and Section 6 (Deal Structure & Terms). The engagement data confirms the SBA-Backed Operator profile is focused on financing terms — which is exactly what the Boardroom predicted.

Marcus Rivera (SBA-Backed Operator) has requested CIM access. His NDA is pending your approval on the VDR station.`,
  },
  {
    triggers: ["vdr", "data room", "access"],
    response: `Your VDR is live with two published documents:
· CIM (Buyer-Facing) — 1 view, NDA pending
· P&L Recast (Lender-Facing) — 1 view, access pending

Two access requests are pending your approval:
1. Marcus Rivera (SBA-Backed Operator) — wants CIM access. NDA not yet signed. Approve to send him the NDA link.
2. Northeast Community Bank — wants P&L Recast + CIM. NDA waived for SBA lenders — approval = immediate access.

Head to the VDR station to approve both. The lender access in particular is time-sensitive — bank reviewers typically move to the next file if they don't hear back within 24 hours.`,
  },
  {
    triggers: ["property", "facility", "building", "real estate", "office", "lease"],
    response: `Fieldstone leases a Class B office suite in Northern New Jersey — you don't own the building. That's normal for a digital marketing agency; the deal isn't anchored by real estate.

For the SBA-Backed Operator: the loan structure doesn't require a property pledge — it's built on cash flow, not collateral.
For the Micro-PE buyer: the 38% recurring retainer base (including Garden State Auto Group) plays the role real estate would elsewhere — annuity-like cash flow that anchors the platform acquisition thesis.
For valuation: the $500K asset floor holds regardless — it's built from working capital and equipment, not property.

The lease terms are documented for buyer due diligence as part of the $1.75M deal.`,
  },
  {
    triggers: ["lender", "sba", "bank", "financing", "loan"],
    response: `Fieldstone is SBA 7(a) eligible. Here's the deal structure:

Loan amount:          $1,090,000 (87.5% financed)
Buyer down payment:   $106,000 minimum
Monthly debt service: $14,200/month
DSCR:                 4.4× — well above the 1.25× floor
Loan term:            10 years

Three lenders have been matched:
· Northeast Community Bank — 94% match (NJ digital marketing agency specialist, SBA preferred lender, VDR access pending)
· First National Business Capital — 87% match (15-day commitment SLA)
· ReadyCap Commercial — 81% match (flexible down payment)

The lender package — P&L Recast + add-back schedule + DSCR worksheet — is live in the VDR. Northeast Community Bank has an access request pending your approval.`,
  },
  {
    triggers: ["revenue", "$2.1", "2.1m"],
    response: `Fieldstone generated $2,100,000 in gross revenue in 2024 — up from $1,780,000 in 2022 and $1,970,000 in 2023. That's an 18% compound growth rate over 3 years.

Revenue mix: approximately 38% recurring (retainer contracts including Garden State Auto Group). The recurring component is what drives the SBA-Backed Operator and Search Fund interest — both buyer profiles want predictable cash flow to service their acquisition debt.`,
  },
  {
    triggers: ["valuation", "worth", "price", "listing"],
    response: `Fieldstone is listed at $1.75M — a 2.4× multiple on your Year 3 normalized SDE of $962K.

Valuation range: $1.6M – $1.9M.
Asset floor: $500K (working capital and equipment — most agency sellers don't have hard asset backing at all).

The gap between $1.75M and $1.9M is the owner-dependency discount. The Boardroom's analysis puts the fix value at +$450K if you complete the 5 SOP tasks. At 3.0× on $962K that's a $1.9M exit. At your current 2.4× with no SOPs it's $1.75M. The difference is $150K and about 6 weeks of documentation work.`,
  },
  {
    triggers: [
      "sop",
      "remediation",
      "tasks",
      "owner depend",
      "transferability",
      "documentation",
    ],
    response: `The 5-task owner-dependency remediation plan is the single highest-leverage thing you can do right now. Here's what's outstanding:

1. Client account management & new-business pitching playbook — how key client relationships are managed and new-business pitches are run without you. (+8 pts)
2. Vendor negotiation SOP — your top 5 vendor contacts (media platforms, freelance talent, software), terms, and renewal process. (+5 pts)
3. Invoice & AR reconciliation delegation — monthly billing reconciliation any staff member can run. (+4 pts)
4. Account staffing SOP — who reassigns client coverage when you're unavailable. (+4 pts)
5. Client data & compliance protocol — who responds and how, without you. (+3 pts)

Total: +24 transferability points. 38 → 62/100. The Owner-Dependency Agent has templates drafted for tasks 1 and 3. Tasks 2, 4, and 5 need your input. Fix value: +$450,000 in deal value.`,
  },
  {
    triggers: ["staff", "employees", "team"],
    response: `Fieldstone has 11 employees. One of them has 3+ years of tenure. The rest are shorter-tenured — which is a contributing factor to the owner-dependency risk.

No SOPs are documented. That means the institutional knowledge of how this business runs is entirely in your head. A buyer can't operate it confidently without you, and a lender models that risk into the loan terms.

The 5-task remediation plan partially addresses this by creating written processes that any trained hire can follow. It doesn't fix the tenure gap, but it makes the business operable without you — which is what buyers and lenders need to see.`,
  },
  {
    triggers: ["score", "scorta score", "71"],
    response: `Your Scorta Score is 71/100 — Strong SBA Candidate. Here's the breakdown:
· Financial Health: 68/100
· Market Position: 74/100
· Transferability: 38/100 ← primary drag
· Documentation Quality: 65/100

The Transferability score is the only sub-score below 60. Completing the 5-task SOP remediation plan raises it to 62/100, which moves your overall score to 84/100 — Scorta Certified. That certification is what gets you premium buyer attention and the upper end of your $1.9M valuation range.`,
  },
  {
    triggers: ["buyer", "buyers", "outreach", "who"],
    response: `The Boardroom identified three buyer profiles. Here's the current status:

[PROCEED] SBA-Backed Operator — Marcus Rivera
  First-time buyer, SBA pre-qualified, NJ-based.
  Sequence: 4-touch. CIM access requested (NDA pending).
  Conditional: complete the SOP remediation plan.

[PROCEED] Micro-PE Buyer — David Chen
  Independent sponsor, platform acquisition thesis.
  Interested in your recurring retainer base + 15-year brand.
  Seller note: $175K–$229K modeled into deal structure.

[ON HOLD] Search Fund
  Held pending Garden State Auto Group 3-year contract confirmation.
  Outreach launches automatically when contract is signed.

Bottom line: two sequences are ready to launch, one is held. Authorizing outreach from the Outreach station puts the deal in front of the right people immediately.`,
  },
  {
    triggers: ["timeline", "how long", "when", "close"],
    response: `Amara, you indicated a 6–12 month exit window. Here's the realistic timeline from today:

Weeks 1–2:   Approve VDR access, authorize lender + buyer outreach
Weeks 3–6:   SOP documentation (5 tasks — agent-assisted, your input needed on 3 of 5)
Weeks 4–8:   Lender commitment letters (Northeast Community Bank targets 15-day SLA)
Weeks 6–10:  First LOIs from qualified buyers
Weeks 8–14:  Due diligence + purchase agreement
Weeks 12–20: Closing

The SOP work is the only item on the critical path that requires your time. Everything else the agent fleet is managing. If you start the SOP tasks this week, you're on track for a close inside your 6–12 month window.`,
  },
  {
    triggers: [
      "progress",
      "status",
      "where",
      "next",
      "what's left",
      "whats left",
      "checklist",
    ],
    response: `Here's where Fieldstone's exit stands:

✓ Intake & assessment complete (Exit IQ 49/100)
✓ Platform connectors live (QuickBooks + Plaid)
✓ Ingestion Agent run (1,247 transactions, 2 flags)
✓ Financial Recast approved ($962K SDE, $1.75M listing)
✓ Risk Analysis complete (38/100, 5-task plan)
✓ Boardroom complete (3 buyer profiles, 4 work orders)
✓ CIM published (12 sections, live in VDR)
✓ VDR live (2 documents, 2 access requests pending)
⬜ Scorta Score station (71/100 — ready to view)
⬜ Lender submission (package ready, pending auth)
⬜ Buyer outreach (2 sequences ready, 1 held)
⬜ SOP remediation (5 tasks, +$450K unlock)
⬜ Garden State Auto Group contract (Search Fund hold condition)

Critical path: approve the two VDR access requests, then authorize lender + buyer outreach. Those two actions move the deal from "prepared" to "in market."`,
  },
  {
    triggers: ["thank", "thanks"],
    response: `Of course. Let me know when you're ready to move on the VDR approvals or the SOP tasks — those are the two highest-leverage actions right now.`,
  },
  {
    triggers: ["hi", "hello", "hey"],
    response: `Hi Amara. Still here — what do you need?`,
  },
]

export const FALLBACK_RESPONSE =
  `I don't have a specific answer for that right now — but I can walk you through your deal status, your score, the remediation tasks, or the lender package. What do you need?`

/** Fast-path cache lookup only — returns `null` (no fallback) when nothing matches. */
export function matchQAEntry(input: string): string | null {
  const lower = input.toLowerCase()
  for (const entry of QA_MAP) {
    for (const trigger of entry.triggers) {
      if (lower.includes(trigger)) return entry.response
    }
  }
  return null
}

export function matchResponse(input: string): string {
  return matchQAEntry(input) ?? FALLBACK_RESPONSE
}

/**
 * Typing-indicator timing — proportional to response length so longer
 * answers feel like CASE is "reading and thinking" longer. Spec: 600ms /
 * 750ms / 900ms by line count.
 */
export function typingDelayFor(response: string): number {
  const lines = response.split("\n").length
  if (lines <= 3) return 600
  if (lines <= 8) return 750
  return 900
}

// ── Route-aware quick-question chips ──────────────────────────────────
const DEFAULT_CHIPS: ReadonlyArray<string> = [
  "What's my deal worth?",
  "What's my Scorta Score?",
  "How long will this take?",
]

const QUICK_CHIPS: Record<string, ReadonlyArray<string>> = {
  "/dashboard": [
    "What's my deal worth?",
    "What should I do first?",
    "What's my Scorta Score?",
    "How long will this take?",
  ],
  "/connect": [
    "What's my deal worth?",
    "What should I do first?",
    "What's my Scorta Score?",
    "How long will this take?",
  ],
  "/ingestion": [
    "What did the agent find?",
    "What are add-backs?",
    "How is my SDE calculated?",
  ],
  "/recast": [
    "What's my normalized SDE?",
    "Why 2.4× multiple?",
    "What did you add back?",
  ],
  "/risk": [
    "What's owner dependency?",
    "How do I fix it?",
    "What's the Garden State Auto risk?",
  ],
  "/boardroom": [
    "Who are my buyers?",
    "What's the SBA-Backed Operator condition?",
    "What's the Search Fund hold?",
  ],
  "/documents": [
    "Who sees the CIM?",
    "What's in Section 6?",
    "When does it go to buyers?",
  ],
  "/vdr": [
    "Who requested access?",
    "Should I approve the lender?",
    "What's the lender's SLA?",
  ],
  "/score": [
    "Why is Transferability low?",
    "What gets me to 84?",
    "What's Scorta Certified?",
  ],
  "/lenders": [
    "Which lender is best?",
    "What's the lender SLA?",
    "When do we submit?",
  ],
  "/buyers": [
    "Who's on the buyer list?",
    "When does outreach launch?",
    "What's the Search Fund hold?",
  ],
}

export function getQuickChips(route: string): ReadonlyArray<string> {
  return QUICK_CHIPS[route] ?? DEFAULT_CHIPS
}

// ── Route-aware proactive messages ────────────────────────────────────
const PROACTIVE_MESSAGES: Record<string, string> = {
  "/connect": `Two connectors are live — QuickBooks and Plaid. Stripe and Google Drive are pending. You don't need them to proceed, but Google Drive would unlock your tax returns for the lender package.`,
  "/ingestion": `Ingestion Agent is running. 1,247 transactions across 36 months. Two flags coming — concentration risk on Garden State Auto Group and key-man dependency on you. Both are expected given the business type. Neither is a deal-stopper.`,
  "/recast": `The Recast Agent normalized your SDE to $962K on $147K in defensible add-backs. That's the number your $1.75M listing is built on. Review the add-back schedule — the personal travel line ($9K) is the most likely lender scrutiny point.`,
  "/risk": `Your transferability score is 38/100. That's the number suppressing your multiple from 3.0× to 2.4×. The fix is 5 written SOPs — the agent has templates for 2 of them. The other 3 need your input.`,
  "/boardroom": `The Boardroom identified 3 buyer profiles and dispatched 4 work orders. The SBA-Backed Operator is your highest-probability close. The Search Fund is your highest-value outcome — but it's conditional. Approve the fleet dispatch when you're ready.`,
  "/documents": `The CIM is being assembled from your approved financials and risk profile. 12 sections. Review Section 1 (Executive Summary) and Section 6 (Deal Structure) before approving — those are the two sections buyers read first.`,
  "/vdr": `Your VDR is live. Two access requests are pending — Marcus Rivera (buyer) and Northeast Community Bank (lender). Approve the lender first — their SLA clock starts on access, and 15 days to commitment means you want them reviewing now.`,
  "/score": `Scorta Score: 71/100. You're a Strong SBA Candidate. The 13 points between you and Scorta Certified are almost entirely owned by Transferability. Complete the 5 SOP tasks and you're at 84.`,
  "/lenders": `Lender package is ready. Northeast Community Bank is the highest match at 94% — NJ digital marketing agency specialist, SBA preferred lender. Submit to them first. First National is the backup with a 15-day commitment SLA if you need a timeline anchor.`,
  "/buyers": `Two buyer sequences are ready. Marcus Rivera (SBA-Backed Operator) and David Chen (Micro-PE). The Search Fund is held until the Garden State Auto Group contract is confirmed. Authorize outreach and the deal is officially in market.`,
}

export function getProactiveMessage(route: string): string | null {
  return PROACTIVE_MESSAGES[route] ?? null
}

// ── Live fallback path — system prompt for questions the QA_MAP misses ──────
/** Most recent audit-trail entries carried into the live prompt, oldest last. */
const LIVE_PROMPT_AUDIT_ENTRIES = 8

/**
 * System prompt for the live model path (app/api/case/chat/route.ts). Grounds
 * the answer in the same persona and audit-trail facts the QA_MAP draws from,
 * so a question that falls through the fast-path cache still gets an answer
 * consistent with everything else CASE has said.
 */
export function buildCaseSystemPrompt(route: string): string {
  const p = PERSONA
  const recentActions = AUDIT_TRAIL.slice(-LIVE_PROMPT_AUDIT_ENTRIES)
    .map((e) => `- [${e.dateLabel}] ${e.agent}: ${e.action} — ${e.detail}${e.output ? ` → ${e.output}` : ""}`)
    .join("\n")
  const proactive = getProactiveMessage(route)

  return `You are CASE, the Case Manager Agent inside Scorta — the AI-native brokerage running ${p.identity.businessName}'s exit for its owner, ${p.identity.firstName}. You are talking directly to ${p.identity.firstName}.

Answer in CASE's voice: concise, confident, grounded in the deal's real numbers, never generic. Reference specific figures and station routes (e.g. "/risk", "/boardroom") the way a coordinator who has read the whole file would. Keep answers under ~120 words unless the question genuinely needs more.

DEAL FACTS (do not contradict these):
- Business: ${p.identity.businessName}, ${p.business.industry}, ${p.business.yearsOperating} years operating, ${p.identity.location}
- Revenue: ${p.financials.revenueDisplay} · Normalized SDE: ${p.financials.sdeDisplay} (Year 3: ${p.financials.normalizedSDEYear3Display}, +${p.financials.revenueTrend3yr}% 3yr trend)
- Valuation range: ${p.financials.valuationLowDisplay}–${p.financials.valuationHighDisplay} · Recommended listing: ${p.financials.recommendedListingDisplay} · Applied multiple: ${p.financials.appliedMultiple}×
- Scorta Score: ${p.scorta.overall}/100 (${p.scorta.label}) · Original Exit IQ score: ${p.exitIQ.score}/100 (Grade ${p.exitIQ.grade})
- Owner-dependency: ${p.risk.ownerDependencyScore}/100, ${p.risk.staffTenuredCount}/${p.risk.staffTotal} tenured staff, ${p.risk.sopsDocumented} SOPs documented — closing this gap unlocks ${p.risk.fixValueUnlockDisplay}
- Customer concentration: top account ${p.risk.topAccountName} at ${p.risk.topCustomerShare}% (${p.risk.concentrationLevel})
- SBA: ${p.sba.eligible ? "eligible" : "not eligible"}, DSCR ${p.sba.dscr}×, loan amount ${p.sba.loanAmountDisplay}
- Seller's timeline: ${p.business.sellingTimeline}

RECENT AGENT ACTIVITY (most recent last):
${recentActions}

${proactive ? `CONTEXT FOR THE CURRENT SCREEN (${route}): ${proactive}` : `The seller is currently on ${route}.`}

If asked something outside this deal file, or something you have no basis for, say so plainly rather than inventing numbers.`
}

// ── Opening message (always the first message in the thread) ──────────
export const OPENING_MESSAGE = `Hi Amara — I'm managing your Fieldstone exit from here. Your deal is at $1.75M listed, Scorta Score 71/100, and the agent fleet is active. Here's where things stand: two documents are live in the VDR, the owner-dependency remediation plan has 5 tasks outstanding, and the Garden State Auto Group contract confirmation is the current blocker for the Search Fund pathway.

What do you want to work on?`
