/**
 * Scorta Score sub-score derivations — pillar #3 of the roadmap's stated
 * defensibility moat (`.claude/Product Roadmap - Current and Next Three
 * Quarters.md`): "A public, methodology-transparent, letter-graded
 * certification of pre-market readiness built from 7 sub-scores (Financial
 * Defensibility, Owner Independence, Customer Concentration, SBA
 * Lendability, Operational & Legal Cleanliness, Market Position,
 * Transferability)."
 *
 * `PERSONA.scorta` already carries four of the seven as flat 0-100 fields:
 *   financialHealth      → Financial Defensibility
 *   marketPosition        → Market Position
 *   transferability        → Transferability
 *   documentationQuality  → Operational & Legal Cleanliness
 *
 * The other three don't have a dedicated persona field yet. The functions
 * below derive them deterministically from fields that DO already exist on
 * `PERSONA`, so every number the Scorta Score station shows still traces to
 * a sourced fact rather than an invented one — same discipline as
 * `lib/dealClock.ts`.
 *
 * `PERSONA.scorta.overall` (71) is NOT recomputed here. It's a weighted
 * composite the Case Manager Agent already produced — not a simple average
 * of the 7 sub-scores below. SBA-relevant risk pillars (Transferability
 * chief among them) are weighted more heavily than topline financial
 * performance, which is exactly why `lib/caseChat.ts`'s already-committed
 * `/score` message says the 13-point gap to Scorta Certified is "almost
 * entirely owned by Transferability" even though Transferability is only
 * one of seven inputs. This module deliberately does not publish numeric
 * weights — showing a formula that doesn't reconcile to the composite is a
 * worse credibility failure than describing the weighting qualitatively.
 */

import { PERSONA } from "@/lib/persona"

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/**
 * Owner Independence — reuses `PERSONA.risk.ownerDependencyScore` verbatim.
 * The persona doesn't yet model owner-independence and transferability as
 * separate 0-100 axes: RiskStation's remediation plan targets the same
 * number under the "Transferability" label (`PERSONA.scorta.transferability`
 * is also 38). Until the product splits them into distinct surveys, Owner
 * Independence and Transferability will show the same value here by
 * construction — a known simplification, not a bug. Disclosed in the
 * methodology drawer in `ScortaScoreStation.tsx`.
 */
export function ownerIndependenceScore(ownerDependencyScore: number): number {
  return clamp(ownerDependencyScore, 0, 100)
}

/**
 * Customer Concentration — derived from the top customer's share of annual
 * revenue (`PERSONA.risk.topCustomerShare`, 19%). Each point of concentration
 * costs exactly one point of score: a hypothetical 0%-share business scores
 * 100 (perfectly diversified); a 100%-share business scores 0 (total
 * dependency on one account). Fieldstone's 19% share yields 81 —
 * consistent with `PERSONA.risk.concentrationLevel` ("MODERATE") and
 * `concentrationRiskLabel` ("Within SBA threshold — monitor").
 */
export function customerConcentrationScore(topCustomerSharePct: number): number {
  return clamp(100 - topCustomerSharePct, 0, 100)
}

/**
 * SBA Lendability — derived from `PERSONA.sba.eligible`, `.dscr`, and
 * `.dscrFloor`. SBA eligibility is a binary gate: a business that fails it
 * can't be scored on DSCR headroom at all, so ineligible businesses get a
 * flat low floor (25) regardless of their DSCR math.
 *
 * Eligible businesses are scored on how far their DSCR clears the lender's
 * floor. A DSCR sitting exactly at the floor is a bare pass (55/100) —
 * every additional multiple of headroom above 1.0x adds 15 points, capped at
 * 95 (never a perfect 100 — DSCR headroom alone doesn't guarantee approval
 * terms; underwriting also weighs collateral, credit, and industry risk this
 * module doesn't model). Fieldstone's 4.4x DSCR against a 1.25x floor is
 * a 3.52x headroom ratio, which scores 93.
 */
export function sbaLendabilityScore(params: {
  eligible: boolean
  dscr: number
  dscrFloor: number
}): number {
  if (!params.eligible) return 25
  const headroomRatio = params.dscr / params.dscrFloor
  return clamp(Math.round(40 + headroomRatio * 15), 40, 95)
}

export type ScortaSubScoreKey =
  | "financial"
  | "ownerIndependence"
  | "customerConcentration"
  | "sbaLendability"
  | "operationalCleanliness"
  | "marketPosition"
  | "transferability"

export type ScortaSubScore = {
  key: ScortaSubScoreKey
  label: string
  value: number
  /** Where this number comes from — shown in the methodology drawer. */
  source: string
}

/** Reused verbatim from `lib/caseChat.ts`'s already-committed `/score` proactive message. */
export const SCORTA_CERTIFIED_THRESHOLD = 84

/**
 * The 7 pillar sub-scores, in the order the roadmap doc lists them. Four are
 * direct `PERSONA.scorta` reads; three (Owner Independence, Customer
 * Concentration, SBA Lendability) are derived above.
 */
export function getScortaSubScores(): ReadonlyArray<ScortaSubScore> {
  return [
    {
      key: "financial",
      label: "Financial Defensibility",
      value: PERSONA.scorta.financialHealth,
      source: "PERSONA.scorta.financialHealth",
    },
    {
      key: "ownerIndependence",
      label: "Owner Independence",
      value: ownerIndependenceScore(PERSONA.risk.ownerDependencyScore),
      source: "PERSONA.risk.ownerDependencyScore",
    },
    {
      key: "customerConcentration",
      label: "Customer Concentration",
      value: customerConcentrationScore(PERSONA.risk.topCustomerShare),
      source: "100 − PERSONA.risk.topCustomerShare",
    },
    {
      key: "sbaLendability",
      label: "SBA Lendability",
      value: sbaLendabilityScore({
        eligible: PERSONA.sba.eligible,
        dscr: PERSONA.sba.dscr,
        dscrFloor: PERSONA.sba.dscrFloor,
      }),
      source: "PERSONA.sba.dscr vs .dscrFloor, gated by .eligible",
    },
    {
      key: "operationalCleanliness",
      label: "Operational & Legal Cleanliness",
      value: PERSONA.scorta.documentationQuality,
      source: "PERSONA.scorta.documentationQuality",
    },
    {
      key: "marketPosition",
      label: "Market Position",
      value: PERSONA.scorta.marketPosition,
      source: "PERSONA.scorta.marketPosition",
    },
    {
      key: "transferability",
      label: "Transferability",
      value: PERSONA.scorta.transferability,
      source: "PERSONA.scorta.transferability",
    },
  ]
}

/** Points remaining to Scorta Certified. 84 − 71 = 13, per the already-stated `/score` fact. */
export function getPointsToCertified(overall: number): number {
  return SCORTA_CERTIFIED_THRESHOLD - overall
}
