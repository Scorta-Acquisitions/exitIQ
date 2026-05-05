import {
  CONFIDENCE_BY_STEP,
  EMPLOYEE_OPTIONS,
  HOT_STATES,
  INDUSTRIES,
  SDE_RANGES,
  YEAR_OPTIONS,
} from "./data"
import type { Industry } from "./data"

export interface ValuationRange {
  low: number
  high: number
  text: string
}

export interface BrokerFee {
  low: number
  high: number
  text: string
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

    // Owner role modifier
    const roleAdj: Record<string, number> = {
      passive: 1.10,
      mostly_hands_off: 1.04,
      partial: 0.97,
      operator: 0.88,
    }
    midMultiple *= roleAdj[answers.ownerRole ?? ""] ?? 1.0

    // Revenue trend modifier
    const trendAdj: Record<string, number> = {
      growing_fast: 1.14,
      growing: 1.07,
      flat: 1.0,
      declining_slight: 0.89,
      declining_fast: 0.76,
    }
    midMultiple *= trendAdj[answers.revenueTrend ?? ""] ?? 1.0

    // Customer concentration modifier
    const concAdj: Record<string, number> = {
      diversified: 1.08,
      moderate: 1.02,
      concentrated: 0.92,
      high_risk: 0.80,
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
      low: 0.90,
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

  // Broker fee: 8–10% of the valuation range (traditional 10% commission benchmark)
  let brokerFee: BrokerFee | null = null
  if (valuationRange) {
    const feeLow = Math.round(valuationRange.low * 0.08)
    const feeHigh = Math.round(valuationRange.high * 0.10)
    brokerFee = { low: feeLow, high: feeHigh, text: fmtRange(feeLow, feeHigh) }
  }

  const transferability = empOption ? empOption.transferability : null
  const isHotState = answers.state ? HOT_STATES.includes(answers.state) : false

  const radarScores = [
    sde && industry ? Math.min((sde.mid * industry.multiple[0]) / 2_000_000, 1) : 0,
    industry ? 0.55 : 0,
    answers.revenue ? 0.45 : 0,
    empOption ? empOption.transferability : 0,
    answers.recurringRev ? (answers.recurringRev === "high" ? 0.9 : answers.recurringRev === "medium_high" ? 0.75 : 0.5) : 0,
    answers.years ? (years ? years.buyerConfidence : 0) : 0,
  ]

  return { confidence, valuationRange, multiple, brokerFee, transferability, industry, isHotState, radarScores }
}
