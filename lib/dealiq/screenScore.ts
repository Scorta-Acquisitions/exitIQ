/**
 * Screen Score — six weighted sub-scores into one composite and a verdict.
 *
 * Rules, not facts. Every sub-score is a pure function of figures the other two
 * engines produced, and each returns a `basis` string the panel renders verbatim,
 * so the UI never has to explain a number it did not compute.
 *
 * The panel renders `result.subScores` as a list. Adding a seventh sub-score means
 * adding a weight and a function here — no JSX change (Execution Plan item 6).
 */

import type {
  DealRiskInputs,
  MultipleBand,
  ScoreBand,
  ScreenCondition,
  ScreenScoreInput,
  ScreenScoreResult,
  SubScore,
  SubScoreKey,
  Verdict,
} from "@/lib/dealiq/types"

// ─── Tunable constants ───────────────────────────────────────────────────────

/** Must sum to 1. Asserted by the test suite. */
export const WEIGHTS: Record<SubScoreKey, number> = {
  sde_quality: 0.25,
  add_back_aggressiveness: 0.15,
  customer_concentration: 0.15,
  owner_dependency: 0.15,
  sba_financeability: 0.2,
  price_vs_comp: 0.1,
}

export const SUB_SCORE_LABEL: Record<SubScoreKey, string> = {
  sde_quality: "SDE Quality",
  add_back_aggressiveness: "Add-Back Aggressiveness",
  customer_concentration: "Customer Concentration",
  owner_dependency: "Owner Dependency",
  sba_financeability: "SBA Financeability",
  price_vs_comp: "Price vs Comp",
}

/** Composite floors. Below `DIG` is a PASS; at or above `PURSUE` is a PURSUE. */
export const VERDICT_BANDS = { DIG: 45, PURSUE: 70 } as const

/** Sub-score and dial colour bands. Below `mixed` is weak. */
export const SCORE_BANDS = { mixed: 40, strong: 70 } as const

/** A concentration this high scores zero on its own axis. */
export const CONCENTRATION_ZERO_AT = 0.5

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator > 0 && Number.isFinite(numerator) ? numerator / denominator : 0
}

export function bandFor(score: number): ScoreBand {
  if (score >= SCORE_BANDS.strong) return "strong"
  if (score >= SCORE_BANDS.mixed) return "mixed"
  return "weak"
}

export function verdictFor(composite: number): Verdict {
  if (composite >= VERDICT_BANDS.PURSUE) return "PURSUE"
  if (composite >= VERDICT_BANDS.DIG) return "DIG"
  return "PASS"
}

function pct(share: number): string {
  return `${Math.round(clampScore(share * 100))}%`
}

// ─── Sub-scores ──────────────────────────────────────────────────────────────

/** How much of the seller's claimed SDE survived the challenge. */
export function sdeQualityScore(claimedSde: number, defensibleSde: number): { score: number; basis: string } {
  const survival = safeDivide(Math.max(0, defensibleSde), claimedSde)
  return {
    score: clampScore(survival * 100),
    basis: `${pct(survival)} of the claimed cash flow survived the recast.`,
  }
}

/** How hard the seller leaned on add-backs, measured by what the challenge removed. */
export function addBackAggressivenessScore(
  claimedAddBacks: number,
  adjustedAddBacks: number
): { score: number; basis: string } {
  if (claimedAddBacks <= 0) {
    return { score: 100, basis: "No add-backs claimed — the cash flow is presented as reported." }
  }
  const rejected = safeDivide(adjustedAddBacks, claimedAddBacks)
  return {
    score: clampScore((1 - rejected) * 100),
    basis: `${pct(rejected)} of the claimed add-back value did not withstand challenge.`,
  }
}

/** Concentration scored against a zero point, not linearly — a third of revenue is not "67% fine". */
export function customerConcentrationScore(risk: DealRiskInputs): { score: number; basis: string } {
  const score = clampScore((1 - safeDivide(risk.topCustomerShare, CONCENTRATION_ZERO_AT)) * 100)
  return {
    score,
    basis: `Top customer is ${pct(risk.topCustomerShare)} of revenue; top three are ${pct(risk.topThreeCustomerShare)}.`,
  }
}

/**
 * Owner dependency — hours, relationship ownership, documented process, and bench
 * depth. Each factor is a deduction from a clean slate so the basis line can name
 * the one that hurt most.
 */
export function ownerDependencyScore(risk: DealRiskInputs): { score: number; basis: string } {
  // Coefficients are deliberately gentle: an owner-operated Main Street business
  // is *expected* to be owner-dependent, so a typical one must land low without
  // pinning at zero — an axis that saturates stops telling deals apart.
  const hoursPenalty = clampScore(Math.max(0, risk.ownerHoursPerWeek - 20) * 1.0)
  const relationshipPenalty = risk.ownerHoldsKeyRelationships ? 20 : 0
  const sopPenalty = risk.documentedSops >= 10 ? 0 : (10 - Math.max(0, risk.documentedSops)) * 1.5
  const benchPenalty = clampScore((1 - safeDivide(risk.longTenuredStaff, Math.max(1, risk.employees))) * 12)
  const score = clampScore(100 - hoursPenalty - relationshipPenalty - sopPenalty - benchPenalty)
  return {
    score,
    basis: risk.ownerHoldsKeyRelationships
      ? `Owner works ${Math.round(risk.ownerHoursPerWeek)} hrs/wk and personally holds the key relationships.`
      : `Owner works ${Math.round(risk.ownerHoursPerWeek)} hrs/wk with ${risk.documentedSops} documented processes on record.`,
  }
}

/** Whether a lender will fund it: eligibility first, then coverage against the floor. */
export function sbaFinanceabilityScore(
  risk: DealRiskInputs,
  dscr: number,
  dscrFloor: number
): { score: number; basis: string } {
  if (!risk.sbaEligible) {
    return { score: 20, basis: "Structure is not SBA-eligible, which removes the cheapest capital available." }
  }
  const headroom = safeDivide(dscr - dscrFloor, Math.max(0.01, dscrFloor))
  const score = clampScore(50 + headroom * 100)
  return {
    score,
    basis:
      dscr >= dscrFloor
        ? `Coverage of ${dscr.toFixed(2)}× clears the ${dscrFloor.toFixed(2)}× floor at this price.`
        : `Coverage of ${dscr.toFixed(2)}× is short of the ${dscrFloor.toFixed(2)}× floor at this price.`,
  }
}

/** The ask against the comp band, measured on defensible SDE rather than claimed. */
export function priceVsCompScore(
  impliedMultiple: number,
  compMultiple: MultipleBand
): { score: number; basis: string } {
  const span = Math.max(0.1, compMultiple.high - compMultiple.low)
  if (impliedMultiple <= 0) {
    return { score: 0, basis: "No defensible cash flow to price against." }
  }
  // 100 at or below the band floor, 50 at the ceiling, 0 one full span above it.
  const position = (impliedMultiple - compMultiple.low) / span
  return {
    score: clampScore(100 - position * 50),
    basis: `Ask is ${impliedMultiple.toFixed(1)}× defensible SDE against a ${compMultiple.low.toFixed(1)}×–${compMultiple.high.toFixed(1)}× comp band.`,
  }
}

// ─── Composite ───────────────────────────────────────────────────────────────

function toSubScore(key: SubScoreKey, computed: { score: number; basis: string }): SubScore {
  const score = clampScore(computed.score)
  return { key, label: SUB_SCORE_LABEL[key], score, weight: WEIGHTS[key], band: bandFor(score), basis: computed.basis }
}

/** Conditions the verdict rests on, each deep-linked to the tab that proves it. */
function buildConditions(subScores: ReadonlyArray<SubScore>, input: ScreenScoreInput): ReadonlyArray<ScreenCondition> {
  const conditions: ScreenCondition[] = []
  const weakest = subScores.filter((sub) => sub.band === "weak")

  for (const sub of weakest) {
    const tab = sub.key === "sde_quality" || sub.key === "add_back_aggressiveness" ? "recast" : "diligence"
    conditions.push({
      id: `cond-${sub.key}`,
      text: `${sub.label} scores ${Math.round(sub.score)}. ${sub.basis}`,
      tab: sub.key === "sba_financeability" || sub.key === "price_vs_comp" ? "returns" : tab,
    })
  }

  if (!input.returns.meetsDscrFloor) {
    conditions.push({
      id: "cond-dscr",
      text: `Debt service does not clear the ${input.returns.dscrFloor.toFixed(2)}× floor at the ask. Price has to move or the structure does.`,
      tab: "returns",
    })
  }

  for (const flag of input.recast.flags) {
    conditions.push({ id: `cond-${flag.id}`, text: flag.detail, tab: "returns" })
  }

  return conditions
}

export function screenScore(input: ScreenScoreInput): ScreenScoreResult {
  const { recast, returns, risk, compMultiple } = input

  const claimedAddBacks = recast.lines
    .filter((line) => line.kind === "add_back_challenge")
    .reduce((sum, line) => sum + line.claimed, 0)
  const adjustedAddBacks = recast.lines.reduce((sum, line) => sum + line.adjusted, 0)

  const subScores: ReadonlyArray<SubScore> = [
    toSubScore("sde_quality", sdeQualityScore(recast.claimedSde, recast.defensibleSde)),
    toSubScore("add_back_aggressiveness", addBackAggressivenessScore(claimedAddBacks, adjustedAddBacks)),
    toSubScore("customer_concentration", customerConcentrationScore(risk)),
    toSubScore("owner_dependency", ownerDependencyScore(risk)),
    toSubScore("sba_financeability", sbaFinanceabilityScore(risk, returns.dscr, returns.dscrFloor)),
    toSubScore("price_vs_comp", priceVsCompScore(recast.impliedMultiple, compMultiple)),
  ]

  const composite = clampScore(subScores.reduce((sum, sub) => sum + sub.score * sub.weight, 0))

  return {
    composite,
    verdict: verdictFor(composite),
    band: bandFor(composite),
    subScores,
    conditions: buildConditions(subScores, input),
  }
}
