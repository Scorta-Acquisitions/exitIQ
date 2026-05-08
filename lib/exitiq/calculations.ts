import { CONFIDENCE_BY_STEP, EMPLOYEE_OPTIONS, HOT_STATES, INDUSTRIES, SDE_RANGES, YEAR_OPTIONS } from "./data"
import type { Industry } from "./data"

export interface ValuationRange {
  low: number
  high: number
  text: string
}

export interface BrokerFee {
  low: number
  high: number
  text: string      // range e.g. "$120K – $155K" (backward compat)
  midFee: number    // fee at midpoint EV
  blendedPct: number // blended % at midpoint EV (e.g. 9.4)
  midText: string   // e.g. "~$132K (9.4%)"
}

export interface Derived {
  confidence: number
  valuationRange: ValuationRange | null
  multiple: string | null
  brokerFee: BrokerFee | null
  transferability: number | null
  industry: Industry | null
  isHotState: boolean
  radarScores: number[]
}

// Double Lehman / Modern Lehman tiered broker fee (IBBA/Main Street M&A standard, 2026)
export function calcBrokerFee(ev: number): { fee: number; blendedPct: number } {
  if (ev <= 0) return { fee: 0, blendedPct: 0 }

  if (ev < 1_000_000) {
    // Sub-$1M deals: flat 11% (midpoint of 10–12% home-services wedge)
    const fee = Math.round(ev * 0.11)
    return { fee, blendedPct: 11 }
  }

  // Tiered Double Lehman: 10/8/6/4/2% on successive $1M bands
  const tiers: Array<{ ceiling: number; rate: number }> = [
    { ceiling: 1_000_000, rate: 0.1 },
    { ceiling: 2_000_000, rate: 0.08 },
    { ceiling: 3_000_000, rate: 0.06 },
    { ceiling: 4_000_000, rate: 0.04 },
    { ceiling: Infinity, rate: 0.02 },
  ]

  let fee = 0
  let prev = 0
  for (const { ceiling, rate } of tiers) {
    if (ev <= prev) break
    const slice = Math.min(ev, ceiling) - prev
    fee += slice * rate
    prev = ceiling
  }

  fee = Math.round(fee)

  // Cap blended rate at 8% for deals above $5M (rare in our wedge)
  if (ev > 5_000_000) fee = Math.min(fee, Math.round(ev * 0.08))

  const blendedPct = Math.round((fee / ev) * 1000) / 10
  return { fee, blendedPct }
}

export function fmtMoney(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "K"
  return "$" + n
}

export function fmtRange(lo: number, hi: number): string {
  return fmtMoney(lo) + " – " + fmtMoney(hi)
}

export function calcDerived(answers: Record<string, string>): Derived {
  const stepCount = Object.keys(answers).length
  const industry = INDUSTRIES.find((i) => i.label === answers.industry) ?? null
  const sde = SDE_RANGES.find((r) => r.label === answers.sde) ?? null
  const empOption = EMPLOYEE_OPTIONS.find((e) => e.label === answers.employees) ?? null
  const years = YEAR_OPTIONS.find((y) => y.label === answers.years) ?? null

  const confidence = CONFIDENCE_BY_STEP[Math.min(stepCount, 10)] ?? 0

  let valuationRange: ValuationRange | null = null
  let multiple: string | null = null

  if (sde && industry) {
    const [baseLo, baseHi] = industry.multiple
    const yearBoost = years ? years.buyerConfidence : 0.6

    // ── Step 1: apply modifier signals to the midpoint ────────────────────────
    let midMultiple = (baseLo + baseHi) / 2

    // Year confidence boosts or penalizes midpoint
    midMultiple *= 0.82 + yearBoost * 0.22

    // Facility type modifier: owned property = premium, short lease = risk flag
    const facilityAdj: Record<string, number> = {
      owns: 1.06,
      long_lease: 1.0,
      short_lease: 0.9,
      no_location: 1.02,
    }
    midMultiple *= facilityAdj[answers.facilityType ?? ""] ?? 1.0

    // Documentation readiness: score 1–10 maps to multiplier 0.84–1.08
    const docScoreMap: Record<string, number> = { excellent: 10, good: 7, fair: 4, poor: 1 }
    const docScore = docScoreMap[answers.docReadiness ?? ""] ?? 5
    midMultiple *= 0.84 + (docScore / 10) * 0.24

    // Customer concentration modifier
    const concAdj: Record<string, number> = {
      diversified: 1.08,
      moderate: 1.02,
      concentrated: 0.92,
      high_risk: 0.8,
    }
    midMultiple *= concAdj[answers.customerConc ?? ""] ?? 1.0

    // Key-man dependency modifier
    const keyManAdj: Record<string, number> = {
      "1": 0.84,
      "2": 0.92,
      "3": 1.0,
      "4": 1.06,
      "5": 1.12,
    }
    midMultiple *= keyManAdj[answers.keyMan ?? ""] ?? 1.0

    // Recurring revenue modifier
    const recurAdj: Record<string, number> = {
      high: 1.13,
      medium_high: 1.07,
      medium: 1.0,
      low: 0.9,
    }
    midMultiple *= recurAdj[answers.recurringRev ?? ""] ?? 1.0

    // ── Step 2: confidence-based range narrowing ──────────────────────────────
    // At low confidence the band is wide; narrows as more signals come in.
    // At 90% confidence the spread collapses to ~35% of the base industry spread.
    const baseHalfSpread = (baseHi - baseLo) / 2
    const confFactor = Math.max(0.35, 1 - (confidence / 100) * 0.68)
    const halfSpread = baseHalfSpread * confFactor

    const finalLo = Math.max(0.5, midMultiple - halfSpread)
    const finalHi = midMultiple + halfSpread

    const valLo = Math.round(sde.mid * finalLo)
    const valHi = Math.round(sde.mid * finalHi)

    valuationRange = { low: valLo, high: valHi, text: fmtRange(valLo, valHi) }
    multiple = midMultiple.toFixed(1) + "×"
  }

  // Broker fee: Double Lehman tiered (traditional broker benchmark)
  let brokerFee: BrokerFee | null = null
  if (valuationRange) {
    const { fee: feeLow } = calcBrokerFee(valuationRange.low)
    const { fee: feeHigh } = calcBrokerFee(valuationRange.high)
    const midEV = Math.round((valuationRange.low + valuationRange.high) / 2)
    const { fee: midFee, blendedPct } = calcBrokerFee(midEV)
    brokerFee = {
      low: feeLow,
      high: feeHigh,
      text: fmtRange(feeLow, feeHigh),
      midFee,
      blendedPct,
      midText: `~${fmtMoney(midFee)} (${blendedPct}%)`,
    }
  }

  const transferability = empOption ? empOption.transferability : null
  const isHotState = answers.state ? HOT_STATES.includes(answers.state) : false

  // Financials axis: weighted by doc readiness (0.2 floor + up to 0.7 from doc score)
  const docScoreForRadar = { excellent: 10, good: 7, fair: 4, poor: 1 }[answers.docReadiness ?? ""] ?? 0
  const financialsScore = answers.docReadiness
    ? 0.2 + (docScoreForRadar / 10) * 0.7
    : answers.revenue
      ? 0.45
      : 0

  // Deal Structure axis: facility type signals lease stability
  const facilityScore = answers.facilityType
    ? ({ owns: 0.92, long_lease: 0.72, short_lease: 0.42, no_location: 0.78 }[answers.facilityType] ?? 0.65)
    : answers.years
      ? (years ? years.buyerConfidence : 0)
      : 0

  const radarScores = [
    sde && industry ? Math.min((sde.mid * industry.multiple[0]) / 2_000_000, 1) : 0,
    industry ? 0.55 : 0,
    financialsScore,
    empOption ? empOption.transferability : 0,
    answers.recurringRev
      ? answers.recurringRev === "high"
        ? 0.9
        : answers.recurringRev === "medium_high"
          ? 0.75
          : 0.5
      : 0,
    facilityScore,
  ]

  return { confidence, valuationRange, multiple, brokerFee, transferability, industry, isHotState, radarScores }
}
