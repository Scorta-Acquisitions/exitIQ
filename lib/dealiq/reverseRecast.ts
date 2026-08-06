/**
 * Reverse Recast — the seller's add-back schedule, challenged line by line.
 *
 * Rules, not facts. Every business fact arrives as an argument; every threshold
 * is an exported constant so the content pass can tune it without touching logic.
 * No I/O, no LLM, no imports outside `lib/dealiq/`.
 *
 * Three rules reduce what is *accepted* and compose multiplicatively (role split ×
 * mixed use × documentation). Two rules emit their own `omitted_cost` lines
 * instead of reducing acceptance — replacement cost and reserve — because the
 * money they represent was never claimed by the seller at all. The occupancy rule
 * emits a flag, not an adjustment; it is priced in the Returns model's occupancy
 * scenario.
 *
 * The reserve rule deliberately *accepts* a recurring "one-time" claim and then
 * charges the annualised reserve as an omitted cost. Rejecting the claim **and**
 * booking the reserve would double-count the same dollars.
 */

import type {
  ClaimedAddBack,
  DocumentationQuality,
  OccupancyInput,
  RecastFlag,
  RecastLine,
  RecastRule,
  RecastVerdict,
  ReverseRecastInput,
  ReverseRecastResult,
} from "@/lib/dealiq/types"

// ─── Tunable constants ───────────────────────────────────────────────────────

/** Share of a claim withheld at each documentation quality. `1` rejects outright. */
export const DOCUMENTATION_HAIRCUT: Record<DocumentationQuality, number> = {
  verified: 0,
  partial: 0.5,
  none: 1,
}

/** Years of the history window an expense must appear in before "one-time" fails. */
export const RESERVE_RECURRENCE_THRESHOLD = 2

/** Where fair value sits in the comp band — `0.5` is the midpoint. */
export const FAIR_VALUE_BAND_POSITION = 0.5

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampShare(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** Division that yields `0` rather than `Infinity` or `NaN`. No screen may show either. */
function safeDivide(numerator: number, denominator: number): number {
  return denominator > 0 && Number.isFinite(numerator) ? numerator / denominator : 0
}

function round(n: number): number {
  return Math.round(n)
}

// ─── Rules that reduce acceptance ────────────────────────────────────────────

/** What one rule did to a claim: the share it lets through, and why. */
export type RuleOutcome = {
  readonly rule: RecastRule
  /** 0-1 share of the claim this rule accepts. */
  readonly acceptedShare: number
  readonly rationale: string
}

/**
 * Role split — accept only the portion of a compensation add-back tied to roles
 * actually vacated at close. A buyer who has to re-hire the work has not saved
 * the salary. Silent (accepts everything) when the claim declares no split.
 */
export function roleSplitRule(addBack: ClaimedAddBack): RuleOutcome | null {
  if (addBack.roleVacatedShare === undefined) return null
  const acceptedShare = clampShare(addBack.roleVacatedShare)
  return {
    rule: "role_split",
    acceptedShare,
    rationale:
      acceptedShare >= 1
        ? "The entire compensated role is vacated at close, so the full amount is a genuine saving."
        : `Only ${Math.round(acceptedShare * 100)}% of this role is vacated at close. The rest is work a buyer still has to pay for.`,
  }
}

/**
 * Mixed use — split a claimed add-back by its documented business-use share.
 * Note the inversion: `businessUseShare` is the part that *serves the business*
 * and therefore stays in the cost base. What is accepted is the remainder.
 */
export function mixedUseRule(addBack: ClaimedAddBack): RuleOutcome | null {
  if (addBack.businessUseShare === undefined) return null
  const businessUse = clampShare(addBack.businessUseShare)
  const acceptedShare = 1 - businessUse
  return {
    rule: "mixed_use",
    acceptedShare,
    rationale:
      businessUse <= 0
        ? "No business use documented against this expense, so the whole amount is discretionary."
        : `${Math.round(businessUse * 100)}% of this expense is documented business use. That portion is an operating cost, not an add-back.`,
  }
}

/** Documentation — haircut or reject by the evidence behind the claim. */
export function documentationRule(addBack: ClaimedAddBack): RuleOutcome {
  const haircut = DOCUMENTATION_HAIRCUT[addBack.documentation]
  const rationale: Record<DocumentationQuality, string> = {
    verified: "Supported by documentation in the seller's package.",
    partial: "Partially documented. Half the claim is withheld until the underlying records are produced.",
    none: "No supporting documentation. An undocumented add-back is a number, not a cash flow.",
  }
  return {
    rule: "documentation",
    acceptedShare: 1 - clampShare(haircut),
    rationale: rationale[addBack.documentation],
  }
}

// ─── Rules that emit omitted costs ───────────────────────────────────────────

/**
 * Replacement cost — when re-hiring the vacated portion of a role costs more than
 * the compensation added back for it, the gap is a permanent cost the P&L never
 * carried. Measured against the role-split portion, before any documentation
 * haircut, because the hire happens regardless of the seller's paperwork.
 */
export function replacementCostRule(addBack: ClaimedAddBack): RecastLine | null {
  if (addBack.replacementCost === undefined) return null
  const vacatedComp = addBack.annualAmount * clampShare(addBack.roleVacatedShare ?? 1)
  const gap = addBack.replacementCost - vacatedComp
  if (gap <= 0) return null
  return {
    id: `${addBack.id}-replacement`,
    kind: "omitted_cost",
    label: `Replacement cost — ${addBack.label}`,
    verdict: "rejected",
    claimed: 0,
    accepted: 0,
    adjusted: round(gap),
    rule: "replacement_cost",
    rationale:
      "The market cost of re-hiring this role exceeds the compensation added back for it. The difference is an operating cost the P&L has never carried.",
    sourceNote: addBack.sourceNote,
  }
}

/**
 * Reserve — a "one-time" expense that recurs across the history window is a
 * recurring cost with a temporary label. The claim itself still stands for the
 * year it occurred; what is charged is the annualised reserve it implies.
 */
export function reserveRule(addBack: ClaimedAddBack, historyWindowYears: number): RecastLine | null {
  const recurred = addBack.recurredYears ?? 0
  if (recurred < RESERVE_RECURRENCE_THRESHOLD) return null
  const reserve = addBack.recurringAnnualAverage ?? addBack.annualAmount
  if (reserve <= 0) return null
  return {
    id: `${addBack.id}-reserve`,
    kind: "omitted_cost",
    label: `Annual reserve — ${addBack.label}`,
    verdict: "rejected",
    claimed: 0,
    accepted: 0,
    adjusted: round(reserve),
    rule: "reserve",
    rationale: `Presented as one-time, but present in ${recurred} of the last ${historyWindowYears} years. A cost that recurs needs a reserve, and the reserve belongs in the cost base.`,
    sourceNote: addBack.sourceNote,
  }
}

/**
 * Occupancy — a P&L carrying no rent while the seller owns the premises overstates
 * cash flow by the full market rent, every year. Emits a flag rather than an
 * adjustment: the buyer's actual exposure depends on the lease they negotiate,
 * which is what the Returns model's occupancy scenario prices.
 */
export function occupancyRule(occupancy: OccupancyInput): RecastFlag | null {
  const uncovered = occupancy.marketAnnualRent - occupancy.costInPandL
  if (uncovered <= 0) return null
  if (occupancy.realEstateIncludedInAsk) return null
  const severity = occupancy.costInPandL === 0 ? "critical" : "warn"
  return {
    id: "flag-occupancy",
    rule: "occupancy",
    label: occupancy.costInPandL === 0 ? "No occupancy cost in the P&L" : "Occupancy cost below market",
    detail: occupancy.premisesOwnedBySeller
      ? "The seller owns the premises and the business pays below market rent — or none. A buyer signs a lease at market, and the difference comes straight out of cash flow."
      : "Occupancy is carried below market. Renewal at market repricing is a cash-flow event the current P&L does not show.",
    severity,
    scenario: "occupancy",
  }
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

function verdictFor(claimed: number, accepted: number): RecastVerdict {
  if (accepted <= 0) return "rejected"
  if (accepted >= claimed) return "accepted"
  return "partial"
}

/**
 * Composes the rules over one claimed add-back into a single challenge line.
 * The governing rule — the one named on the row — is whichever reduced the claim
 * most; ties break toward the earlier rule in application order. When nothing
 * reduced it, the documentation rule governs and the row reads as accepted.
 */
function challengeLine(addBack: ClaimedAddBack): RecastLine {
  const outcomes: ReadonlyArray<RuleOutcome> = [
    roleSplitRule(addBack),
    mixedUseRule(addBack),
    documentationRule(addBack),
  ].filter((outcome): outcome is RuleOutcome => outcome !== null)

  const acceptedShare = outcomes.reduce((share, outcome) => share * clampShare(outcome.acceptedShare), 1)
  const claimed = round(addBack.annualAmount)
  const accepted = round(addBack.annualAmount * acceptedShare)
  const adjusted = claimed - accepted

  const governing = outcomes.reduce<RuleOutcome | null>((worst, outcome) => {
    if (worst === null) return outcome
    return outcome.acceptedShare < worst.acceptedShare ? outcome : worst
  }, null)

  return {
    id: addBack.id,
    kind: "add_back_challenge",
    label: addBack.label,
    verdict: verdictFor(claimed, accepted),
    claimed,
    accepted,
    adjusted,
    rule: governing?.rule ?? "documentation",
    rationale: governing?.rationale ?? "Accepted as claimed.",
    sourceNote: addBack.sourceNote,
  }
}

/**
 * The whole challenge. Invariant: `claimedSde - totalAdjusted === defensibleSde`,
 * and `totalAdjusted` is the sum of every line's `adjusted`.
 */
export function reverseRecast(input: ReverseRecastInput): ReverseRecastResult {
  const challenges = input.addBacks.map(challengeLine)

  const omitted: RecastLine[] = []
  for (const addBack of input.addBacks) {
    const replacement = replacementCostRule(addBack)
    if (replacement) omitted.push(replacement)
    const reserve = reserveRule(addBack, input.historyWindowYears)
    if (reserve) omitted.push(reserve)
  }

  const lines: ReadonlyArray<RecastLine> = [...challenges, ...omitted]
  const totalAdjusted = lines.reduce((sum, line) => sum + line.adjusted, 0)
  const claimedSde = round(input.claimedSde)
  const defensibleSde = claimedSde - totalAdjusted

  const occupancyFlag = occupancyRule(input.occupancy)
  const flags: ReadonlyArray<RecastFlag> = occupancyFlag ? [occupancyFlag] : []

  const bandPosition = clampShare(FAIR_VALUE_BAND_POSITION)
  const fairMultiple = input.compMultiple.low + (input.compMultiple.high - input.compMultiple.low) * bandPosition
  const fairValue = round(Math.max(0, defensibleSde) * fairMultiple)

  return {
    claimedSde,
    defensibleSde,
    totalAdjusted,
    lines,
    flags,
    claimedMultiple: safeDivide(input.ask, claimedSde),
    impliedMultiple: safeDivide(input.ask, defensibleSde),
    fairValue,
    negotiationDelta: input.ask - fairValue,
  }
}
