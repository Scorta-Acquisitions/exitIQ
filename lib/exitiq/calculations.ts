import {
  CONFIDENCE_BY_STEP,
  EMPLOYEE_OPTIONS,
  HOT_STATES,
  INDUSTRIES,
  REVENUE_RANGES,
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
  const revenue = REVENUE_RANGES.find((r) => r.label === answers.revenue) ?? null
  const sde = SDE_RANGES.find((r) => r.label === answers.sde) ?? null
  const empOption = EMPLOYEE_OPTIONS.find((e) => e.label === answers.employees) ?? null
  const years = YEAR_OPTIONS.find((y) => y.label === answers.years) ?? null

  const confidence = CONFIDENCE_BY_STEP[Math.min(stepCount, 6)] ?? 0

  let valuationRange: ValuationRange | null = null
  let multiple: string | null = null
  if (sde && industry) {
    const [mLo, mHi] = industry.multiple
    const yearBoost = years ? years.buyerConfidence : 0.6
    const adjMHi = mHi * (0.85 + yearBoost * 0.15)
    const valLo = Math.round(sde.mid * mLo)
    const valHi = Math.round(sde.mid * adjMHi)
    valuationRange = { low: valLo, high: valHi, text: fmtRange(valLo, valHi) }
    multiple = ((mLo + adjMHi) / 2).toFixed(1) + "×"
  }

  let brokerFee: BrokerFee | null = null
  if (revenue) {
    brokerFee = {
      low: revenue.brokerLow,
      high: revenue.brokerHigh,
      text: fmtRange(revenue.brokerLow, revenue.brokerHigh),
    }
  }

  const transferability = empOption ? empOption.transferability : null
  const isHotState = answers.state ? HOT_STATES.includes(answers.state) : false

  const radarScores = [
    sde && industry ? Math.min((sde.mid * industry.multiple[0]) / 2_000_000, 1) : 0,
    industry ? 0.55 : 0,
    answers.revenue ? 0.45 : 0,
    empOption ? empOption.transferability : 0,
    answers.state ? (isHotState ? 0.8 : 0.6) : 0,
    answers.years ? (years ? years.buyerConfidence : 0) : 0,
  ]

  return { confidence, valuationRange, multiple, brokerFee, transferability, industry, isHotState, radarScores }
}
