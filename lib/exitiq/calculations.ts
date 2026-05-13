import { CONFIDENCE_BY_STEP, EMPLOYEE_OPTIONS, HOT_STATES, INDUSTRIES, INDUSTRY_MULTIPLES, REVENUE_RANGES, SDE_RANGES } from "./data"
import type { Industry } from "./data"

export interface BuyerMatch {
  persona: string
  score: number
  likelihood: number
  keyReasons: string[]
}

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

export type SdeMarginStatus = "green" | "yellow" | "red"

export interface SdeMarginCheck {
  margin: number          // SDE / Revenue as a decimal, e.g. 0.22 = 22%
  pct: string             // formatted, e.g. "22%"
  status: SdeMarginStatus
  headline: string        // short label shown in the banner badge
  message: string         // one-sentence explanation for the flag
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
  sdeMarginCheck: SdeMarginCheck | null  // null when revenue or SDE not yet answered
  exitReadinessScore: number             // 0–100, weighted composite of 7 radar axes
  exitReadinessGrade: "A" | "B" | "C" | "D" | "—"
}

// Double Lehman / Modern Lehman tiered broker fee (IBBA/Main Street M&A standard, 2026)
export function computeBuyerMatchLikelihoods(answers: Record<string, string>): BuyerMatch[] {
  const { customerConc, facilityType, keyMan, docReadiness, recurringRev, years, revenue, employees, industry, sde } =
    answers

  // ── Searcher (SBA 7(a), $500K–$2M sweet spot) ───────────────────────────────
  // 40% SBA-financeability
  let sbaBase = 70
  if (customerConc === "concentrated") sbaBase -= 20
  if (customerConc === "high_risk") sbaBase -= 40
  if (facilityType === "short_lease") sbaBase -= 15
  if (facilityType === "owns") sbaBase += 10
  if (facilityType === "long_lease") sbaBase += 5
  if (keyMan === "1") sbaBase -= 25
  if (keyMan === "2") sbaBase -= 12
  if (keyMan === "4") sbaBase += 8
  if (keyMan === "5") sbaBase += 12
  if (docReadiness === "excellent") sbaBase += 20
  if (docReadiness === "good") sbaBase += 8
  if (docReadiness === "fair") sbaBase -= 10
  if (docReadiness === "poor") sbaBase -= 25
  // SDE in $250K–$1M is the SBA 7(a) sweet spot
  const sdeSbaScore: Record<string, number> = {
    "Under $100K": 25,
    "$100K – $250K": 60,
    "$250K – $500K": 90,
    "$500K – $1M": 85,
    "$1M+": 55,
  }
  const sdeBoost = sdeSbaScore[sde ?? ""] ?? 55
  const sbaScore = Math.max(0, Math.min(100, sbaBase * 0.6 + sdeBoost * 0.4))

  // 30% recurring revenue (SBA lenders reward predictable cash flow)
  const recurSearcherScore: Record<string, number> = { high: 95, medium_high: 78, medium: 52, low: 20 }
  const recurSearcher = recurSearcherScore[recurringRev ?? ""] ?? 35

  // 20% revenue trend proxy — years in business as stability signal
  const trendScore: Record<string, number> = {
    "10+ years": 88,
    "5 – 10 years": 72,
    "2 – 5 years": 48,
    "Under 2 years": 18,
  }
  const trend = trendScore[years ?? ""] ?? 45

  // 10% doc readiness
  const docSearcherScore: Record<string, number> = { excellent: 100, good: 70, fair: 40, poor: 10 }
  const docSearcher = docSearcherScore[docReadiness ?? ""] ?? 40

  const rawSearcher = sbaScore * 0.4 + recurSearcher * 0.3 + trend * 0.2 + docSearcher * 0.1

  const searcherReasons: string[] = []
  if (docReadiness === "excellent" || docReadiness === "good") searcherReasons.push("Deal-ready financials")
  if (facilityType === "owns" || facilityType === "long_lease") searcherReasons.push("Strong lease position")
  if (recurringRev === "high" || recurringRev === "medium_high") searcherReasons.push("Recurring revenue base")
  if (sde === "$250K – $500K" || sde === "$500K – $1M") searcherReasons.push("SBA sweet-spot SDE")
  if (customerConc === "high_risk" || customerConc === "concentrated") searcherReasons.push("Concentration risk")
  if (facilityType === "short_lease") searcherReasons.push("Short lease flags SBA lenders")
  if (keyMan === "1" || keyMan === "2") searcherReasons.push("Owner dependency risk")
  if (docReadiness === "poor") searcherReasons.push("Financials not SBA-ready")

  // ── Strategic (roll-up / PE add-on) ─────────────────────────────────────────
  // 45% recurring + contracted revenue
  const recurStrategicScore: Record<string, number> = { high: 100, medium_high: 82, medium: 50, low: 15 }
  const recurStrategic = recurStrategicScore[recurringRev ?? ""] ?? 30

  // 25% low customer concentration
  const concStrategicScore: Record<string, number> = { diversified: 100, moderate: 72, concentrated: 32, high_risk: 8 }
  const concStrategic = concStrategicScore[customerConc ?? ""] ?? 50

  // 20% scale signals: revenue tier + employee count
  const revScaleScore: Record<string, number> = {
    "Under $250K": 10,
    "$250K – $500K": 28,
    "$500K – $1M": 55,
    "$1M – $3M": 82,
    "$3M – $10M": 95,
    "$10M+": 100,
  }
  const empScaleScore: Record<string, number> = {
    "Just me": 15,
    "2 – 5": 35,
    "6 – 15": 65,
    "16 – 50": 85,
    "50+": 95,
  }
  const scaleStrategic = (revScaleScore[revenue ?? ""] ?? 40) * 0.55 + (empScaleScore[employees ?? ""] ?? 40) * 0.45

  // 10% industry vertical fit
  const industryStrategicScore: Record<string, number> = {
    "Tech / SaaS": 98,
    "Staffing / Recruiting": 88,
    "Healthcare / Medical": 86,
    "Financial Services": 82,
    "Manufacturing": 78,
    "Home Services": 72,
    "Landscaping / Grounds": 72,
    "Childcare / Education": 68,
    "Professional Services": 62,
    "E-commerce / DTC": 80,
    "Dental / Optometry": 84,
  }
  const indStrategic = industryStrategicScore[industry ?? ""] ?? 42

  const rawStrategic = recurStrategic * 0.45 + concStrategic * 0.25 + scaleStrategic * 0.2 + indStrategic * 0.1

  const strategicReasons: string[] = []
  if (recurringRev === "high" || recurringRev === "medium_high") strategicReasons.push("Strong recurring revenue")
  if (customerConc === "diversified" || customerConc === "moderate") strategicReasons.push("Diversified customer base")
  if (revenue === "$1M – $3M" || revenue === "$3M – $10M" || revenue === "$10M+")
    strategicReasons.push("Revenue at PE threshold")
  if (employees === "16 – 50" || employees === "50+") strategicReasons.push("Scalable team infrastructure")
  if (indStrategic >= 80) strategicReasons.push(`${industry} is a PE target sector`)
  if (customerConc === "high_risk") strategicReasons.push("Concentration deters strategics")
  if (recurringRev === "low") strategicReasons.push("Transactional rev limits PE interest")

  // ── Operator (family office / cash buyer) ───────────────────────────────────
  // 40% cash-flow stability: low-volatility vertical + recurring revenue
  const stableIndustryScore: Record<string, number> = {
    "Home Services": 92,
    "Landscaping / Grounds": 90,
    "Auto Services": 86,
    "Childcare / Education": 78,
    "Beauty / Wellness": 74,
    "Restaurant / Food Service": 72,
    "Construction / Trades": 70,
    "Retail (Brick & Mortar)": 65,
    "Specialty Retail": 62,
    "Fitness / Gym": 60,
  }
  const indStability = stableIndustryScore[industry ?? ""] ?? 50
  const recurOperatorScore: Record<string, number> = { high: 100, medium_high: 80, medium: 55, low: 30 }
  const recurOperator = recurOperatorScore[recurringRev ?? ""] ?? 40
  const cashFlowStability = indStability * 0.5 + recurOperator * 0.5

  // 30% owner independence: keyMan
  const kmScore: Record<string, number> = { "5": 100, "4": 82, "3": 58, "2": 30, "1": 12 }
  const km = kmScore[keyMan ?? ""] ?? 50

  // 20% longevity
  const longevityScore: Record<string, number> = {
    "10+ years": 100,
    "5 – 10 years": 78,
    "2 – 5 years": 42,
    "Under 2 years": 10,
  }
  const longevity = longevityScore[years ?? ""] ?? 42

  // 10% facility stability (operator buyers value fixed, established locations)
  const facilityOpScore: Record<string, number> = { owns: 100, long_lease: 80, no_location: 55, short_lease: 30 }
  const facilityOp = facilityOpScore[facilityType ?? ""] ?? 55

  const rawOperator = cashFlowStability * 0.4 + km * 0.3 + longevity * 0.2 + facilityOp * 0.1

  const operatorReasons: string[] = []
  if (indStability >= 80) operatorReasons.push(`${industry} is a cash-flow operator target`)
  if (keyMan === "4" || keyMan === "5") operatorReasons.push("Business runs without owner")
  if (years === "10+ years" || years === "5 – 10 years") operatorReasons.push("Proven operating history")
  if (facilityType === "owns") operatorReasons.push("Owns real estate — no lease risk")
  if (facilityType === "long_lease") operatorReasons.push("Stable long-term lease")
  if (keyMan === "1" || keyMan === "2") operatorReasons.push("Owner dependency limits appeal")
  if (facilityType === "short_lease") operatorReasons.push("Lease expiry is a risk flag")

  // ── Softmax normalization ────────────────────────────────────────────────────
  const T = 22 // temperature: controls spread between scores
  const raws = [rawSearcher, rawStrategic, rawOperator]
  const exps = raws.map((r) => Math.exp(r / T))
  const sumExp = exps.reduce((a, b) => a + b, 0)
  const likelihoods = exps.map((e) => Math.round((e / sumExp) * 100))
  // Correct rounding drift so sum === 100
  const diff = 100 - likelihoods.reduce((a, b) => a + b, 0)
  const maxIdx = likelihoods.indexOf(Math.max(likelihoods[0] ?? 0, likelihoods[1] ?? 0, likelihoods[2] ?? 0))
  likelihoods[maxIdx] = (likelihoods[maxIdx] ?? 0) + diff

  const topN = (reasons: string[], n: number) => reasons.slice(0, n)

  return [
    {
      persona: "Searcher / SBA Buyer",
      score: Math.round(rawSearcher),
      likelihood: likelihoods[0] ?? 33,
      keyReasons: topN(searcherReasons, 3),
    },
    {
      persona: "Strategic / PE Add-on",
      score: Math.round(rawStrategic),
      likelihood: likelihoods[1] ?? 33,
      keyReasons: topN(strategicReasons, 3),
    },
    {
      persona: "Operator / Cash Buyer",
      score: Math.round(rawOperator),
      likelihood: likelihoods[2] ?? 34,
      keyReasons: topN(operatorReasons, 3),
    },
  ]
}

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

export function computeSdeMultiple(answers: Record<string, string>): {
  base: number
  adjusted: number
  low: number
  high: number
} {
  const entry = INDUSTRY_MULTIPLES[answers.industry ?? ""]
  const base = entry?.base ?? 2.5

  let adj = 0

  if (answers.recurringRev === "high")             adj += 0.50
  else if (answers.recurringRev === "medium_high") adj += 0.25

  const km = parseInt(answers.keyMan ?? "0", 10)
  if (km === 4 || km === 5)       adj += 0.40
  else if (km === 1 || km === 2)  adj -= 0.30

  if (answers.customerConc === "diversified")       adj += 0.40
  else if (answers.customerConc === "moderate")     adj += 0.20
  else if (answers.customerConc === "concentrated") adj -= 0.30
  else if (answers.customerConc === "high_risk")    adj -= 0.60

  if (answers.docReadiness === "excellent")  adj += 0.30
  else if (answers.docReadiness === "good")  adj += 0.15
  else if (answers.docReadiness === "fair")  adj -= 0.15
  else if (answers.docReadiness === "poor")  adj -= 0.30

  if (answers.facilityType === "owns" || answers.facilityType === "long_lease") adj += 0.30
  else if (answers.facilityType === "short_lease") adj -= 0.30

  if (answers.years === "10+ years")                                      adj += 0.20
  else if (answers.years === "Under 2 years" || answers.years === "2 – 5 years") adj -= 0.20

  const clampedAdj = Math.max(-1.5, Math.min(1.5, adj))
  const adjusted = Math.round((base + clampedAdj) * 100) / 100

  return {
    base,
    adjusted,
    low:  Math.round((adjusted - 0.25) * 100) / 100,
    high: Math.round((adjusted + 0.25) * 100) / 100,
  }
}

// Inverse of the slug maps in components/exitiq/ExitIQApp.tsx (CUSTOMER_CONC_MAP,
// RECURRING_REV_MAP, KEY_MAN_MAP). Lets the server reconstruct the client-side
// signal codes from stage2/stage3 server slugs so it can call computeSdeMultiple
// with the same inputs the pre-gate UI used.
const CUSTOMER_CONC_INVERSE: Record<string, string> = {
  under_10: "diversified",
  "10_25": "moderate",
  "25_50": "concentrated",
  over_50: "high_risk",
}

const RECURRING_REV_INVERSE: Record<string, string> = {
  over_75: "high",
  "50_75": "medium_high",
  "25_50": "medium",
  under_10: "low",
}

// keyPersonRisk → keyMan numeric string. "two_three" is lossy (was 3 or 4); pick
// the lower bound "3" so the multiple-adj branch (km === 4 || km === 5) is not
// triggered — matches the conservative-toward-discount default.
const KPR_INVERSE: Record<string, string> = {
  none: "1",
  one: "2",
  two_three: "3",
  four_plus: "5",
}

function yearsNumberToLabel(years: number | undefined): string {
  if (years == null) return ""
  if (years >= 10) return "10+ years"
  if (years >= 5) return "5 – 10 years"
  if (years >= 2) return "2 – 5 years"
  return "Under 2 years"
}

/**
 * Server-side valuation range that matches the pre-gate UI exactly.
 *
 * Returns the same `(adjusted ± 0.25) × SDE-midpoint` band the client computes
 * in `calcDerived`, so the seller sees one number across both surfaces. Accepts
 * raw stage1 (with frontend labels and numeric years) plus stage2/stage3 in
 * their server-slug form; translates those slugs back to the client-side signal
 * codes that `computeSdeMultiple` expects.
 *
 * Returns null if the industry or SDE bucket is unknown — caller should fall
 * back to the legacy `getValuationRange` model.
 */
export function computeSignalAdjustedValuation(input: {
  industryLabel?: string
  sdeLabel?: string
  yearsNumber?: number
  facilityType?: string
  docReadiness?: string
  customerConcentration?: string // server stage2 slug
  recurringRevenue?: string // server stage2 slug
  keyPersonRisk?: string // server stage3 slug
}): { lo: number; hi: number; adjustedMultiple: number; sdeMid: number } | null {
  const sdeBucket = SDE_RANGES.find((r) => r.label === input.sdeLabel)
  const industryEntry = INDUSTRY_MULTIPLES[input.industryLabel ?? ""]
  if (!sdeBucket || !industryEntry) return null

  const answers: Record<string, string> = {
    industry: input.industryLabel ?? "",
    sde: input.sdeLabel ?? "",
    years: yearsNumberToLabel(input.yearsNumber),
    facilityType: input.facilityType ?? "",
    docReadiness: input.docReadiness ?? "",
    customerConc: CUSTOMER_CONC_INVERSE[input.customerConcentration ?? ""] ?? "",
    recurringRev: RECURRING_REV_INVERSE[input.recurringRevenue ?? ""] ?? "",
    keyMan: KPR_INVERSE[input.keyPersonRisk ?? ""] ?? "",
  }

  const { adjusted, low: multiLo, high: multiHi } = computeSdeMultiple(answers)
  return {
    lo: Math.round(sdeBucket.mid * multiLo),
    hi: Math.round(sdeBucket.mid * multiHi),
    adjustedMultiple: adjusted,
    sdeMid: sdeBucket.mid,
  }
}

export function calcDerived(answers: Record<string, string>): Derived {
  const stepCount = Object.keys(answers).length
  const industry = INDUSTRIES.find((i) => i.label === answers.industry) ?? null
  const sde = SDE_RANGES.find((r) => r.label === answers.sde) ?? null
  const empOption = EMPLOYEE_OPTIONS.find((e) => e.label === answers.employees) ?? null

  const confidence = CONFIDENCE_BY_STEP[Math.min(stepCount, 10)] ?? 0

  let valuationRange: ValuationRange | null = null
  let multiple: string | null = null

  if (sde && industry) {
    const { adjusted, low: multiLo, high: multiHi } = computeSdeMultiple(answers)

    const valLo = Math.round(sde.mid * multiLo)
    const valHi = Math.round(sde.mid * multiHi)

    valuationRange = { low: valLo, high: valHi, text: fmtRange(valLo, valHi) }
    multiple = adjusted.toFixed(2) + "×"
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

  // ── Radar scores: 7 axes, each normalized 0–10, weights per Exit Readiness Score spec ──────
  //
  // Axis 0 — Financial Documentation (20%)
  // Source: docReadiness answer directly maps to a 0–10 scale.
  // excellent=10, good=7, fair=3, poor=1. Missing=0 (not yet answered).
  const axis0_finDocs = answers.docReadiness
    ? ({ excellent: 10, good: 7, fair: 3, poor: 1 } as Record<string, number>)[answers.docReadiness] ?? 0
    : 0

  // Axis 1 — Owner Dependency (18%)
  // Source: keyMan 1–5 scale (higher = more independent = better score).
  // 1→1, 2→3, 3→5, 4→8, 5→10. Missing=0.
  const axis1_ownerDep = answers.keyMan
    ? ({ "1": 1, "2": 3, "3": 5, "4": 8, "5": 10 } as Record<string, number>)[answers.keyMan] ?? 0
    : 0

  // Axis 2 — Revenue Quality (17%)
  // Source: recurringRev (primary) + years as growth-trajectory proxy.
  // Recurring component (0–10): high=10, medium_high=7.5, medium=4.5, low=1.5
  // Longevity trajectory bonus (0–2): 10+ yrs=2, 5–10=1.5, 2–5=0.75, <2=0
  // Blended = 0.75 * recurScore + 0.25 * trajectoryBonus(scaled to 10)
  const recurScore: Record<string, number> = { high: 10, medium_high: 7.5, medium: 4.5, low: 1.5 }
  const revTrajectoryBonus: Record<string, number> = { "10+ years": 2, "5 – 10 years": 1.5, "2 – 5 years": 0.75, "Under 2 years": 0 }
  const revRecurRaw = answers.recurringRev ? recurScore[answers.recurringRev] ?? 0 : null
  const revTrajRaw = answers.years ? revTrajectoryBonus[answers.years] ?? 0 : 0
  const axis2_revQuality =
    revRecurRaw !== null
      ? Math.min(10, revRecurRaw * 0.75 + (revTrajRaw / 2) * 10 * 0.25)
      : 0

  // Axis 3 — Customer Concentration (15%)
  // Source: customerConc. Lower concentration = higher score (inverted risk signal).
  // diversified=10, moderate=7, concentrated=3, high_risk=1. Missing=0.
  const axis3_custConc = answers.customerConc
    ? ({ diversified: 10, moderate: 7, concentrated: 3, high_risk: 1 } as Record<string, number>)[answers.customerConc] ?? 0
    : 0

  // Axis 4 — Business Longevity (12%)
  // Source: years in business (buyerConfidence proxy scaled to 0–10).
  // Under 2 = 2, 2–5 = 4.5, 5–10 = 7.5, 10+ = 10. Missing=0.
  const axis4_longevity = answers.years
    ? ({ "Under 2 years": 2, "2 – 5 years": 4.5, "5 – 10 years": 7.5, "10+ years": 10 } as Record<string, number>)[answers.years] ?? 0
    : 0

  // Axis 5 — Operational Depth (10%)
  // Source: employees (depth) + keyMan (key-person dependency).
  // Employee component (0–10): Just me=1, 2–5=3.5, 6–15=6, 16–50=8.5, 50+=10
  // keyMan component reused from axis1 (0–10).
  // Blended = 0.55 * empScore + 0.45 * keyManScore.
  const empDepthScore: Record<string, number> = { "Just me": 1, "2 – 5": 3.5, "6 – 15": 6, "16 – 50": 8.5, "50+": 10 }
  const empDepthRaw = answers.employees ? empDepthScore[answers.employees] ?? 0 : null
  const axis5_opsDepth =
    empDepthRaw !== null
      ? Math.min(10, empDepthRaw * 0.55 + axis1_ownerDep * 0.45)
      : axis1_ownerDep > 0
        ? Math.min(10, axis1_ownerDep * 0.45)
        : 0

  // Axis 6 — Positioning (8%)
  // Source: industry multiple tier (premium vertical = higher score) + state (NJ/NY metro = +1 bonus).
  // Industry multiple midpoint mapped to 0–10 against the observable range of 1.75 (low) to 6.0 (high).
  // State bonus: NJ, NY, CA, TX, FL, IL = +1 (hot M&A geo), else 0.
  const PREMIUM_STATES = new Set(["New Jersey", "New York", "California", "Texas", "Florida", "Illinois", "Colorado", "Georgia", "Washington", "North Carolina"])
  const industryMidMultiple = industry ? (industry.multiple[0] + industry.multiple[1]) / 2 : null
  const industryPositioningScore = industryMidMultiple
    ? Math.min(10, Math.max(0, ((industryMidMultiple - 1.75) / (6.0 - 1.75)) * 10))
    : null
  const stateBonus = answers.state && PREMIUM_STATES.has(answers.state) ? 1 : 0
  const axis6_positioning =
    industryPositioningScore !== null
      ? Math.min(10, industryPositioningScore + stateBonus)
      : 0

  // Weighted overall Exit Readiness Score (0–10) — used for radar polygon
  // Weights: 20% + 18% + 17% + 15% + 12% + 10% + 8% = 100%
  const radarScores = [
    axis0_finDocs,
    axis1_ownerDep,
    axis2_revQuality,
    axis3_custConc,
    axis4_longevity,
    axis5_opsDepth,
    axis6_positioning,
  ]

  // ── Exit Readiness Score (0–100) ──────────────────────────────────────────
  // Exact weighted dot product: each axis is 0–10, weight sums to 1.0.
  // Multiply by 10 to normalize the weighted result (max 10×1.0) → 0–100.
  const AXIS_WEIGHTS = [0.20, 0.18, 0.17, 0.15, 0.12, 0.10, 0.08] as const
  const weightedSum =
    axis0_finDocs   * AXIS_WEIGHTS[0] +
    axis1_ownerDep  * AXIS_WEIGHTS[1] +
    axis2_revQuality* AXIS_WEIGHTS[2] +
    axis3_custConc  * AXIS_WEIGHTS[3] +
    axis4_longevity * AXIS_WEIGHTS[4] +
    axis5_opsDepth  * AXIS_WEIGHTS[5] +
    axis6_positioning * AXIS_WEIGHTS[6]
  // weightedSum is 0–10 (each axis max 10 × weight sum 1.0). Scale to 0–100.
  const exitReadinessScore = Math.round(weightedSum * 10)
  const exitReadinessGrade: Derived["exitReadinessGrade"] =
    exitReadinessScore >= 75 ? "A"
    : exitReadinessScore >= 55 ? "B"
    : exitReadinessScore >= 35 ? "C"
    : exitReadinessScore > 0  ? "D"
    : "—"

  // ── SDE / Revenue margin sanity check ────────────────────────────────────────
  // Uses bucket midpoints so the check is as accurate as the data available.
  // Green: 12–35% (home-services norm per 2026 sold-deal data)
  // Yellow: 8–12% or 35–45% (soft flag — aggressive add-backs or missed expenses)
  // Red: <8% or >45% (prominent warning — likely data entry error or outlier)
  let sdeMarginCheck: SdeMarginCheck | null = null
  const revRange = REVENUE_RANGES.find((r) => r.label === answers.revenue) ?? null
  if (sde && revRange) {
    const margin = sde.mid / revRange.mid
    const pct = Math.round(margin * 100) + "%"
    let status: SdeMarginStatus
    let headline: string
    let message: string

    if (margin < 0.08) {
      status = "red"
      headline = "Very low margin"
      message =
        "SDE below 8% of revenue is unusual — buyers and SBA lenders will question it. Check that owner compensation add-backs are fully captured and one-time expenses haven't been overlooked."
    } else if (margin <= 0.12) {
      status = "yellow"
      headline = "Below typical range"
      message =
        "SDE margin of 8–12% is below the 15–30% norm for home services. Common causes: aggressive expense classification or missed add-backs. Worth reviewing before going to market."
    } else if (margin <= 0.35) {
      status = "green"
      headline = "Margin looks healthy"
      message =
        "SDE margin of 12–35% is squarely within the range buyers and lenders expect for home-services businesses based on 2026 sold-deal data."
    } else if (margin <= 0.45) {
      status = "yellow"
      headline = "Above typical range"
      message =
        "SDE margin of 35–45% is higher than the typical 15–30% for home services. This can reflect lean operations, but buyers may ask for documentation on aggressive add-backs."
    } else {
      status = "red"
      headline = "Unusually high margin"
      message =
        "SDE above 45% of revenue is a flag buyers and lenders will scrutinize. Verify add-backs are defensible and that no significant expenses have been excluded from the SDE calculation."
    }

    sdeMarginCheck = { margin, pct, status, headline, message }
  }

  return { confidence, valuationRange, multiple, brokerFee, transferability, industry, isHotState, radarScores, sdeMarginCheck, exitReadinessScore, exitReadinessGrade }
}
