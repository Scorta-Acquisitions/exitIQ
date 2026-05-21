/**
 * Permanent audit trail — hard-coded chronological log of every agent action
 * taken on Chandan's deal. Traces from Exit IQ intake (2026-05-17) through
 * the next-steps recommendations surfaced on the Seller Home today (2026-05-20).
 *
 * Demo only. The narrative is locked against the persona files in
 * .exitiq-debug/sessions/ — do not invent numbers.
 */

export type AuditSeverity = "info" | "flag" | "review"

export type AuditThinking = {
  /** Free-text reasoning trace the agent emitted while making the decision. */
  readonly reasoning: string
  /** Structured metadata — model used, processing duration, hashes, etc. */
  readonly metadata?: ReadonlyArray<{ label: string; value: string }>
}

export type AuditEntry = {
  readonly id: string
  readonly dateLabel: string
  readonly timeLabel: string
  readonly agent: string
  readonly agentAccent: "mint" | "peach" | "sky" | "lav" | "neutral"
  readonly action: string
  readonly detail: string
  readonly inputs?: ReadonlyArray<string>
  readonly output?: string
  readonly severity?: AuditSeverity
  /** Optional deep link into the station that owns this action. */
  readonly href?: string
  /** Optional expanded "More" panel — agent reasoning + structured metadata. */
  readonly thinking?: AuditThinking
}

/** Session-storage key set by RecastStation when its surface finishes loading. */
export const RECAST_THINKING_FLAG = "audit:recast_thinking_logged"
/** The id of the entry that contains the full Recast thought-process trace. */
export const RECAST_THINKING_ENTRY_ID = "a23"

export const AUDIT_TRAIL: ReadonlyArray<AuditEntry> = [
  // ── 2026-05-17 — Exit IQ intake handoff ──────────────────────────────────
  {
    id: "a01",
    dateLabel: "May 17, 2026",
    timeLabel: "9:42 AM",
    agent: "Case Manager",
    agentAccent: "mint",
    action: "Exit IQ intake received",
    detail:
      "Session mp91it7xqthbf6b handed off from Exit IQ Assessment. Deal file opened for Palace Kitchen & Catering, Northern New Jersey.",
    inputs: [
      "Exit IQ score: 49/100 · Grade C · Needs Preparation",
      "Segment tag: hot_seller · routing path: Guided Readiness Track",
      "Completed: 2026-05-17 by Chandan Patel",
    ],
    output: "Operator workspace provisioned · all 11 stations initialized",
    thinking: {
      reasoning:
        "Intake payload validated against the Exit IQ schema (v6). Composite Exit IQ score of 49 placed Chandan in the Needs Preparation band; segment_tag of hot_seller derived from the 6–12 month timeline answer + no-price-in-mind flag. Routed to the Guided Readiness Track rather than the Direct-to-Market track because Documentation Quality and Transferability sub-scores both trailed the SBA-fundable threshold (≥55).",
      metadata: [
        { label: "Model", value: "claude-sonnet-4-6" },
        { label: "Schema version", value: "exit-iq/v6" },
        { label: "Audit hash", value: "sha256:7a3e…b91c" },
        { label: "Processing time", value: "412 ms" },
      ],
    },
  },
  {
    id: "a02",
    dateLabel: "May 17, 2026",
    timeLabel: "9:43 AM",
    agent: "Case Manager",
    agentAccent: "mint",
    action: "Persona classification locked",
    detail:
      "Business profile derived from intake answers. 15-year operating history, owner-operator structure, owns the property, 6–15 employee range, 6–12 month selling timeline, no price in mind.",
    output: "Persona file written · downstream agents authorized to read",
    thinking: {
      reasoning:
        "Cross-referenced industry (Restaurant / Food Service) against the Scorta industry taxonomy to attach standard SBA add-back categories, lender-preference clusters, and the buyer-segment templates the Boardroom would later use. Locked the persona record so downstream agents read from a single source instead of re-deriving from intake.",
      metadata: [
        { label: "Industry taxonomy", value: "NAICS 722330 → Scorta IFOOD-04" },
        { label: "Audit hash", value: "sha256:c81f…2d44" },
      ],
    },
  },
  {
    id: "a03",
    dateLabel: "May 17, 2026",
    timeLabel: "9:44 AM",
    agent: "Case Manager",
    agentAccent: "mint",
    action: "Initial gap analysis surfaced",
    detail:
      "Crossed Exit IQ answers against SBA 7(a) eligibility baseline. Identified Transferability and Documentation Quality as the two suppressing levers on the multiple.",
    output: "Two priority gaps flagged for the agent fleet · ranked by value impact",
    severity: "flag",
    thinking: {
      reasoning:
        "Multiple-suppression model ranked candidate gaps by estimated $/point recovery. Transferability scored highest impact ($1.1M downside per current state) because the 1-of-11 tenured-staff signal and 0-of-5 SOPs answer both compound into key-person risk for any SBA lender. Documentation Quality came in second because absent add-back evidence forces a defensive recast posture. Other gaps (Financial Health, Market Position) ranked below the action threshold.",
      metadata: [
        { label: "Model", value: "claude-sonnet-4-6" },
        { label: "Ranking method", value: "multiple-suppression-v3" },
        { label: "Audit hash", value: "sha256:9f2a…7e10" },
      ],
    },
  },

  // ── 2026-05-18 — Connect + Ingestion ────────────────────────────────────
  {
    id: "a04",
    dateLabel: "May 18, 2026",
    timeLabel: "10:11 AM",
    agent: "Ingestion Agent",
    agentAccent: "sky",
    action: "QuickBooks connector authorized",
    detail:
      "OAuth grant received from Chandan. 36 months of access scoped to Palace Kitchen & Catering company file.",
    output: "Ingestion endpoint provisioned · pull queued",
    href: "/connect",
  },
  {
    id: "a05",
    dateLabel: "May 18, 2026",
    timeLabel: "10:12 AM",
    agent: "Ingestion Agent",
    agentAccent: "sky",
    action: "Plaid connector authorized",
    detail: "Two business banking accounts linked · 36 months of activity scoped.",
    output: "Bank-level transaction stream ready for reconciliation",
    href: "/connect",
  },
  {
    id: "a06",
    dateLabel: "May 18, 2026",
    timeLabel: "10:48 AM",
    agent: "Ingestion Agent",
    agentAccent: "sky",
    action: "1,247 transactions ingested",
    detail:
      "Pulled and indexed 1,247 transactions across 36 months from QuickBooks and Plaid. Cross-referenced ledger entries against bank-side counterparts.",
    inputs: [
      "QuickBooks general ledger · 36 months",
      "Plaid bank activity · 2 accounts · 36 months",
    ],
    output: "Reconciled transaction set written to deal file",
    thinking: {
      reasoning:
        "Reconciliation ran in three passes. (1) Exact-match on amount + posting date — captured 1,062 of 1,247. (2) Fuzzy match with ±3-day window for weekend-posted items — captured another 168. (3) Composite match on memo + counterparty for the remaining 17. Three GL-only entries with no bank-side counterpart were quarantined for human review — none material individually but flagged in the deal file. Zero bank-side entries unmatched, which is the directional signal we want before recast.",
      metadata: [
        { label: "Match rate", value: "1244 / 1247 (99.76%)" },
        { label: "Quarantined", value: "3 GL-only entries" },
        { label: "Processing time", value: "37,118 ms" },
        { label: "Audit hash", value: "sha256:4d11…a8c2" },
      ],
    },
  },
  {
    id: "a07",
    dateLabel: "May 18, 2026",
    timeLabel: "11:09 AM",
    agent: "Ingestion Agent",
    agentAccent: "sky",
    action: "Classification pass complete",
    detail:
      "1,247 transactions classified by type. 94 marked owner-personal (vehicle, travel, meals) and queued for add-back review by the Recast Agent.",
    output: "Add-back candidates handed off · Recast Agent triggered",
  },
  {
    id: "a08",
    dateLabel: "May 18, 2026",
    timeLabel: "11:14 AM",
    agent: "Ingestion Agent",
    agentAccent: "sky",
    action: "Concentration flag raised",
    detail:
      "Customer revenue distribution showed NJ Transit Corporate Catering at 19% of top-line revenue across a 6-year relationship. Flagged within SBA monitoring threshold.",
    output: "Flag posted to Concentration Agent queue",
    severity: "flag",
  },
  {
    id: "a09",
    dateLabel: "May 18, 2026",
    timeLabel: "11:14 AM",
    agent: "Ingestion Agent",
    agentAccent: "sky",
    action: "Key-person flag raised",
    detail:
      "Staff tenure analysis returned 1 of 11 employees tenured ≥ 3 years. Combined with 0 documented SOPs from intake, escalated to Owner-Dependency Agent as high-priority.",
    output: "Flag posted to Owner-Dependency Agent queue",
    severity: "flag",
  },

  // ── 2026-05-19 — Recast + Risk ──────────────────────────────────────────
  {
    id: "a10",
    dateLabel: "May 19, 2026",
    timeLabel: "8:32 AM",
    agent: "Recast Agent",
    agentAccent: "mint",
    action: "P&L recast complete",
    detail:
      "Three-year P&L rebuilt SBA-style. Year-3 normalized SDE computed at $962,000 against $2.1M top-line revenue.",
    inputs: [
      "36 months of reconciled GL + bank activity",
      "94 owner-personal transactions ($127,400 total add-backs)",
      "SBA SOP 50 10 8 normalization rules",
    ],
    output: "Normalized SDE $962K · ready for human approval",
    href: "/recast",
    thinking: {
      reasoning:
        "Recast posture chosen: defensive-but-fundable. Goal was a number that holds up under lender QofE scrutiny without leaving SDE on the table. Started from reported owner compensation, added back the 94 classified personal items, then layered on standard SBA add-backs (one-time legal $14K, equipment depreciation $32K, owner health $11K). Tested two scenarios: aggressive ($1.04M) and conservative ($891K). Settled on $962K because it (a) clears the SBA DSCR ≥1.25× threshold at 4.4×, (b) leaves Northeast Community Bank's underwriting buffer intact at their typical 15% haircut, and (c) supports the $1.75M ask at the 1.82× multiple Boardroom modeled. The detailed thought-process trace for each add-back is in the next entry.",
      metadata: [
        { label: "Model", value: "claude-sonnet-4-6" },
        { label: "Recast posture", value: "defensive-fundable" },
        { label: "Scenarios tested", value: "3 ($891K / $962K / $1.04M)" },
        { label: "DSCR at SDE", value: "4.4× (floor 1.25×)" },
        { label: "Audit hash", value: "sha256:2b18…d04f" },
      ],
    },
  },
  {
    id: "a11",
    dateLabel: "May 19, 2026",
    timeLabel: "8:34 AM",
    agent: "Recast Agent",
    agentAccent: "mint",
    action: "Add-back schedule generated",
    detail:
      "Eleven add-back categories built with line-level evidence. Personal travel ($9K) flagged as the highest lender-scrutiny line; defensibility narrative drafted with calendar + receipt cross-references.",
    output: "Add-back schedule · 11 categories · $127,400 total",
  },
  {
    id: "a12",
    dateLabel: "May 19, 2026",
    timeLabel: "9:01 AM",
    agent: "Owner-Dependency Agent",
    agentAccent: "peach",
    action: "Transferability scored",
    detail:
      "Composite of owner-time concentration, SOP coverage, staff tenure, and cross-training depth. Transferability landed at 38/100 — the single largest suppressor on the deal multiple.",
    inputs: [
      "Staff tenure: 1 of 11 employees tenured ≥ 3 years",
      "SOPs documented: 0 of 5 owner-dependent tasks",
      "Estimated owner hours/week: 62",
    ],
    output: "Transferability 38/100 · value impact -$1.1M without remediation",
    severity: "flag",
    href: "/risk",
    thinking: {
      reasoning:
        "Used Scorta's transferability composite (weighted: 35% SOP coverage, 30% staff-tenure depth, 20% owner-hours, 15% cross-training). Chandan's score breakdown — SOP coverage contributed 0/35 (zero documented), staff tenure 8/30 (1 of 11 ≥3yr), owner hours 17/20 (62 hr/wk is high but not red-line), cross-training 13/15 (informal coverage exists). Net 38/100. Modeled the post-remediation score assuming all 5 SOPs complete: would jump to 73/100 and re-rate the multiple from 2.4× to 2.85×, hence the +$450K unlock estimate.",
      metadata: [
        { label: "Composite version", value: "transferability/v4" },
        { label: "Sensitivity floor", value: "55/100 = SBA-fundable" },
        { label: "Post-remediation forecast", value: "73/100" },
        { label: "Audit hash", value: "sha256:8e44…f190" },
      ],
    },
  },
  {
    id: "a13",
    dateLabel: "May 19, 2026",
    timeLabel: "9:07 AM",
    agent: "Owner-Dependency Agent",
    agentAccent: "peach",
    action: "Remediation playbook drafted",
    detail:
      "Five SOP templates pre-filled against the top owner-dependent tasks: catering sales process, vendor negotiation, kitchen open/close, payroll close, monthly P&L review. Each requires Chandan to fill in business-specific details.",
    output: "5 SOP templates ready · estimated value unlock +$450K at close",
    severity: "review",
    href: "/risk",
  },
  {
    id: "a14",
    dateLabel: "May 19, 2026",
    timeLabel: "9:18 AM",
    agent: "Concentration Agent",
    agentAccent: "lav",
    action: "NJ Transit account reviewed",
    detail:
      "Six-year relationship with NJ Transit Corporate Catering examined. Account anchored on a month-to-month arrangement — material risk if a buyer needs contract continuity for thesis.",
    inputs: [
      "Top-customer share: 19% of revenue",
      "Tenure: 6 years",
      "Contract structure: month-to-month (no written term)",
    ],
    output: "Within SBA threshold · contract-extension proposal drafted for review",
    severity: "review",
  },

  // ── 2026-05-20 — Boardroom + CIM + downstream ───────────────────────────
  {
    id: "a15",
    dateLabel: "May 20, 2026",
    timeLabel: "7:48 AM",
    agent: "Boardroom",
    agentAccent: "mint",
    action: "SBA-Backed Operator red-team complete",
    detail:
      "First buyer persona evaluated Chandan's deal from a single-buyer operator perspective. Verdict: highest-probability close at $1.75M list with the SOP remediation completed.",
    output: "Persona advances to Outreach with no blocking conditions",
  },
  {
    id: "a16",
    dateLabel: "May 20, 2026",
    timeLabel: "7:49 AM",
    agent: "Boardroom",
    agentAccent: "sky",
    action: "Search Fund red-team complete",
    detail:
      "Search Fund persona evaluated the deal for recurring-revenue thesis fit. Raised deal-breaker objection on NJ Transit contract-structure risk. Held pending Concentration Agent's extension confirmation.",
    output: "Persona held · auto-launches once contract status confirmed",
    severity: "flag",
  },
  {
    id: "a17",
    dateLabel: "May 20, 2026",
    timeLabel: "7:50 AM",
    agent: "Boardroom",
    agentAccent: "peach",
    action: "Micro-PE red-team complete",
    detail:
      "Micro-PE persona evaluated the deal for platform-acquisition fit. Verdict: workable with seller-note structure of $175K–$229K to bridge negotiation gap.",
    output: "Persona advances to Outreach with seller-note condition noted",
  },
  {
    id: "a18",
    dateLabel: "May 20, 2026",
    timeLabel: "7:51 AM",
    agent: "Boardroom",
    agentAccent: "mint",
    action: "Work orders dispatched to fleet",
    detail:
      "Four work orders generated from the red-team consensus: Owner-Dependency (SOP completion), Concentration (NJ Transit contract), Recast (personal-travel hardening), Outreach (sequence prep). Audit hash signed.",
    output: "Fleet dispatched · Case Manager monitoring · routed seller to command center",
    href: "/boardroom",
    thinking: {
      reasoning:
        "Each red-team objection was converted to a falsifiable work order with a named owner, an expected output, and a measurable exit criterion. Owner-Dependency was assigned 5 SOPs because the Search Fund + Micro-PE personas both raised the same gap, weighted highest. Concentration drew the NJ Transit contract draft because the Search Fund objection was the only deal-breaker on the table. Recast's personal-travel hardening came from Micro-PE's request for QofE-defensible add-back narratives. Outreach prep was sequenced last because launching it before the SOP work would land buyers on a deal that wasn't ready to defend itself.",
      metadata: [
        { label: "Work orders", value: "4 (sequenced, not parallel where critical)" },
        { label: "Routing target", value: "/dashboard (command center)" },
        { label: "Signed by", value: "Boardroom · 3-persona consensus" },
        { label: "Audit hash", value: "sha256:3a91…c2e7" },
      ],
    },
  },
  {
    id: "a19",
    dateLabel: "May 20, 2026",
    timeLabel: "8:02 AM",
    agent: "CIM Agent",
    agentAccent: "mint",
    action: "CIM outline drafted",
    detail:
      "Twelve-section CIM outline assembled from approved financials, risk profile, and Boardroom buyer-fit notes. Section 1 (Executive Summary) and Section 6 (Deal Structure) drafted for seller review.",
    output: "CIM draft v0.9 · sections 1, 6 populated · 7 deliverables on standby",
    href: "/documents",
  },
  {
    id: "a20",
    dateLabel: "May 20, 2026",
    timeLabel: "8:14 AM",
    agent: "Lender Ops Agent",
    agentAccent: "mint",
    action: "Lender shortlist matched",
    detail:
      "Three SBA-preferred lenders ranked against Chandan's deal profile. Northeast Community Bank — 94% fit (NJ food service specialist). First National Business Capital — 87% (15-day commitment SLA). ReadyCap Commercial — 81% (flexible down payment).",
    inputs: [
      "Normalized SDE $962K · DSCR 4.4× · Min down $106K",
      "Industry: Restaurant / Food Service · Location: Northern New Jersey",
      "Borrower profile: Owner-Operator · 15-year history",
    ],
    output: "3 lenders shortlisted · Northeast + First National marked Package Sent",
    href: "/lenders",
    thinking: {
      reasoning:
        "Scored Scorta's 38-lender network against this deal on 6 dimensions: industry specialization, geography fit, deal-size band, SBA preferred-lender status, historical commitment SLA, and DSCR sensitivity. Northeast Community Bank ranked first because (1) NJ food service is their declared vertical, (2) average commitment <12 days for deals in this size band, (3) they have approved 4 of the last 5 deals Scorta has sent in this profile. First National Business Capital provided timeline insurance: their 15-day SLA is the backstop if Northeast slows. ReadyCap was included for buyer optionality — their flex-down structure opens the deal to operators who can't hit the $106K minimum.",
      metadata: [
        { label: "Network size scored", value: "38 lenders" },
        { label: "Cutoff", value: "Top 3 above 75% match" },
        { label: "Routing strategy", value: "Primary + backstop + flex-buyer" },
        { label: "Audit hash", value: "sha256:6c22…8b13" },
      ],
    },
  },
  {
    id: "a21",
    dateLabel: "May 20, 2026",
    timeLabel: "8:21 AM",
    agent: "Outreach Agent",
    agentAccent: "peach",
    action: "Buyer sequences drafted",
    detail:
      "Two buyer sequences built from the Boardroom personas. Marcus Rivera (SBA-Backed Operator) — 4-touch sequence. David Chen (Micro-PE) — 3-touch sequence. Search Fund sequence drafted but held pending Concentration confirmation.",
    output: "2 sequences ready · 1 held · awaiting authorization",
    severity: "review",
    href: "/buyers",
  },
  {
    id: "a22",
    dateLabel: "May 20, 2026",
    timeLabel: "8:23 AM",
    agent: "Case Manager",
    agentAccent: "mint",
    action: "Seller next-steps surfaced",
    detail:
      "Cross-checked every open agent task against actions that only Chandan can take. Three live items routed to the Seller Home next-steps queue.",
    inputs: [
      "Owner-Dependency: 5 SOP templates ready · seller input required",
      "Outreach: 3 NDA signatures · seller signatory",
      "CIM: draft ready for seller review before VDR publish",
    ],
    output: "Three items pinned to home page · ranked by deal-value impact",
    severity: "review",
    href: "/dashboard",
    thinking: {
      reasoning:
        "Filter applied: actions where the seller is the only legitimate signatory OR the agent's confidence is below the auto-execute threshold. Ranked by $/effort: SOP completion topped the queue at +$450K for ~3 hours of seller input; NDA signatures second because they unblock the entire Brokerage Services stage; CIM review third because it's blocking VDR publish. Trimmed from 7 candidates to 3 — the other 4 were re-queued to background agents (e.g., NJ Transit contract draft is still on the Concentration Agent's plate; not a seller-facing action yet).",
      metadata: [
        { label: "Candidates considered", value: "7" },
        { label: "Surfaced", value: "3 (top by $/effort)" },
        { label: "Filter", value: "seller-only OR confidence<0.85" },
        { label: "Audit hash", value: "sha256:e571…0a99" },
      ],
    },
  },

  // ── 2026-05-20 — Recast Agent thought-process trace ──────────────────────
  // Logged when the seller first opens /recast — surfaces the agent's full
  // reasoning behind each add-back and the final SDE figure. Most recent
  // entry; rendered first in the audit trail.
  {
    id: RECAST_THINKING_ENTRY_ID,
    dateLabel: "May 20, 2026",
    timeLabel: "8:31 AM",
    agent: "Recast Agent",
    agentAccent: "mint",
    action: "Add-back reasoning surfaced for seller review",
    detail:
      "Full thought-process trace published as the seller opened the Recast station. Every add-back line is paired with the rule it was justified under, the lender-defensibility tier, and the alternative the agent considered and rejected.",
    inputs: [
      "94 classified owner-personal transactions",
      "11 SBA add-back categories evaluated",
      "Lender-scrutiny tiering from Northeast / First National historical pushback patterns",
    ],
    output:
      "11 add-back categories totaling $127,400 · normalized SDE $962K · seller review queued",
    severity: "review",
    href: "/recast",
    thinking: {
      reasoning: `Each add-back category was decided in three steps: identify, justify, defend.

(1) Vehicle expense — $24,200. Identified via classified GL entries against an owner-titled vehicle. Justified under SBA SOP 50 10 8 §5.B as a clean owner-perk add-back. Defensibility tier: high. Rejected alternative: pro-rating by mileage log — Chandan doesn't keep one, so the full amount holds up better than a split that invites underwriter questions.

(2) Personal travel — $9,000. Identified via 38 calendar entries tagged personal that paired with corporate-card charges. Justified under SOP 50 10 8 §5.D. Defensibility tier: MEDIUM — this is the line lenders most often push back on. Drafted a defensive narrative with calendar cross-references baked in. Rejected alternative: hiding it in T&E — keeping it explicit is safer than burying it.

(3) Owner health insurance — $11,300. Identified via payroll classification. Justified under SOP 50 10 8 §5.A. Defensibility tier: high. No alternative considered — this is a standard line.

(4) One-time legal — $14,000. Identified as 2024 lease-renewal counsel + LLC restructure fees, non-recurring. Justified under one-time add-back rules. Defensibility tier: high. Rejected alternative: classifying as ordinary operating expense — would have under-counted SDE by $14K with no upside.

(5) Equipment depreciation — $32,000. Standard SBA cash-flow add-back. High defensibility. Decision: include at full schedule depreciation, not the accelerated MACRS figure — lenders prefer the cleaner number.

(6–11) Remaining six categories (owner meals, owner phone, owner internet, owner training, owner-paid family wages, one-time CPA fees) — totaling $36,900. Each below the $10K line and uncontroversial under standard SBA recast rules.

Composite sanity check: $127,400 total add-backs equals 13.2% of the recast SDE base. Cross-checked against the Scorta historical band for NJ food service deals (median 11.4%, p75 14.8%). The deal lands in the defensible zone — not aggressive enough to draw heightened underwriter scrutiny, not conservative enough to leave value on the table.

Final position: $962K Year-3 normalized SDE. This number was chosen over the conservative scenario ($891K, which would have dragged the asking price to $1.59M) and the aggressive scenario ($1.04M, which would have triggered Northeast's 15% defensive haircut and effectively closed at the conservative number anyway with a slower commitment).

Seller approval required before publish to lender package — Chandan's signature is the chain-of-custody event that locks this for downstream agents.`,
      metadata: [
        { label: "Model", value: "claude-sonnet-4-6" },
        { label: "Add-back categories", value: "11 (5 high-defensibility, 1 medium, 5 standard)" },
        { label: "Add-back ratio", value: "13.2% of recast base (median 11.4%, p75 14.8%)" },
        { label: "Scenarios run", value: "3 ($891K conservative / $962K chosen / $1.04M aggressive)" },
        { label: "SBA reference", value: "SOP 50 10 8 §5.A–§5.F" },
        { label: "Audit hash", value: "sha256:f0c7…3a82" },
        { label: "Processing time", value: "14,802 ms" },
      ],
    },
  },
]
