import { findIndustry } from "@/lib/assessment/industries"
import { computeSBASnapshot } from "@/lib/assessment/sba"
import { computeScore, fmt, getValuationRange } from "@/lib/assessment/scoring"
import type { Stage1Answers } from "@/lib/assessment/session"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportSubscore {
  key: string
  label: string
  value: number
  color: string
}

export interface ValuationMethod {
  name: string
  weight: string
  lo: number
  hi: number
  note: string
  primary?: boolean
}

export interface ReportDriver {
  rank: number
  title: string
  impact: string
  detail: string
}

export interface ReportDetractor {
  rank: number
  title: string
  impact: string
  detail: string
  fix: string
}

export interface ReportData {
  meta: {
    name: string
    generated: string
    industry: string
    revenue: string
    sde: string
    sdeMidK: number
    yearsInBusiness: number
    employees: string
    timeline: string
  }
  score: {
    composite: number
    grade: string
    gradeLabel: string
    headline: string
    subscores: ReportSubscore[]
  }
  valuation: {
    lo: number
    mid: number
    hi: number
    methods: ValuationMethod[]
  }
  sba: {
    eligible: boolean
    loan: number
    downPayment: number
    monthlyPayment: number
    dscr: number
    dscrFloor: number
    term: number
    apr: number
    annualDebtService: number
    buyerPool: string
  }
  transferability: {
    current: number
    target: number
    targetLow: number
    targetHigh: number
    fix: string
    dollarImpact: number
  }
  drivers: ReportDriver[]
  detractors: ReportDetractor[]
  growth: {
    levers: Array<{ title: string; detail: string }>
    framed: string
  }
  dealStructure: {
    primary: { name: string; detail: string }
    secondary: { name: string; detail: string }
  }
  nextSteps: Array<{
    rank: number
    when: string
    title: string
    detail: string
    priority: string
    impact: string
  }>
}

// ── Local midpoint tables (mirrors scoring.ts private constants) ──────────────

const SDE_MIDS: Record<string, number> = {
  under_250: 125000,
  "250_500": 375000,
  "500_1m": 750000,
  "1m_2m": 1500000,
  "2m_5m": 3500000,
  "5m_10m": 7500000,
}

const REV_MIDS: Record<string, number> = { ...SDE_MIDS }

const REVENUE_LABELS: Record<string, string> = {
  under_250: "Under $250K",
  "250_500": "$250K – $500K",
  "500_1m": "$500K – $1M",
  "1m_2m": "$1M – $3M",
  "2m_5m": "$3M – $10M",
  "5m_10m": "$10M+",
}

const SDE_LABELS: Record<string, string> = {
  under_250: "Under $250K",
  "250_500": "$250K – $500K",
  "500_1m": "$500K – $1M",
  "1m_2m": "$1M – $2M",
  "2m_5m": "$2M – $5M",
  "5m_10m": "$5M – $10M",
}

const EMPLOYEE_LABELS: Record<string, string> = {
  solo: "Just me",
  "1_5": "2 – 5",
  "6_15": "6 – 15",
  "16_50": "16 – 50",
  "50plus": "50+",
}

const TIMELINE_LABELS: Record<string, string> = {
  already: "Already selling",
  "6_12mo": "6–12 months",
  "1_2yr": "1–2 years",
  "3plus": "3+ years",
  curious: "Just exploring",
}

const GRADE_LABELS: Record<string, string> = {
  A: "Exit-Ready",
  B: "Well-Positioned",
  C: "Needs Prep",
  D: "Early Stage",
}

const SUBSCORE_LABELS: Record<string, string> = {
  financial: "Financial Attractiveness",
  operational: "Operational Independence",
  market: "Market Positioning",
  dealReadiness: "Deal Readiness",
  buyerAccess: "Buyer Accessibility",
}

function scoreColor(v: number): string {
  if (v >= 70) return "#2c8c70"
  if (v >= 45) return "#b86a3e"
  return "#c44e2c"
}

// ── Drivers / Detractors builders ─────────────────────────────────────────────

function buildDrivers(
  dims: Array<{ key: string; score: number }>,
  s1: Partial<Stage1Answers>,
  valLo: number,
  valHi: number,
  sbaEligible: boolean
): ReportDriver[] {
  const drivers: ReportDriver[] = []
  const sdeMid = SDE_MIDS[s1.sde ?? "500_1m"] ?? 750000
  const industry = findIndustry(s1.industry ?? "other")
  const dimMap = Object.fromEntries(dims.map((d) => [d.key, d.score]))

  const years = s1.years ?? 0

  if (years >= 10) {
    const ceiling = fmt(Math.round((valHi - (valLo + valHi) / 2) * 0.6) + Math.round((valLo + valHi) / 2))
    drivers.push({
      rank: 1,
      title: `${years}+ years of operating history`,
      impact: `+${ceiling} ceiling`,
      detail: `Direct evidence of customer retention, vendor durability, and management resilience through cycles. Supports the upper half of the SDE multiple range and reduces buyer due-diligence friction.`,
    })
  } else if (years >= 5) {
    drivers.push({
      rank: 1,
      title: `${years} years of operating history`,
      impact: "Multiple support",
      detail: `Established tenure demonstrates market viability and reduces buyer transition risk. Supports mid-range SDE multiples.`,
    })
  }

  if ((dimMap.market ?? 0) >= 65) {
    drivers.push({
      rank: drivers.length + 1,
      title: `Market Positioning ${dimMap.market}/100`,
      impact: "Lender confidence",
      detail: `${industry.label} businesses with strong market positioning support SBA underwriting of the full loan amount and signal lower customer churn risk to buyers.`,
    })
  }

  if (sbaEligible) {
    const down = fmt(Math.round(Math.min((valLo + valHi) / 2, 5000000) * 0.09))
    drivers.push({
      rank: drivers.length + 1,
      title: "SBA 7(a)-financeable acquisition",
      impact: "3× buyer pool",
      detail: `With as little as ${down} down, your business is accessible to the broadest pool of individual operators — not just cash-heavy buyers or PE firms.`,
    })
  }

  if ((dimMap.financial ?? 0) >= 55 && drivers.length < 3) {
    drivers.push({
      rank: drivers.length + 1,
      title: `Financial profile: ${dimMap.financial}/100`,
      impact: "+Multiple support",
      detail: `SDE fundamentals support mid-to-upper multiple range and pass lender underwriting without major price adjustments.`,
    })
  }

  if (s1.facilityType === "owns" || s1.facilityType === "owns_location") {
    drivers.push({
      rank: drivers.length + 1,
      title: "Business owns its location",
      impact: "Real asset value",
      detail: `Owning the premises adds tangible asset value to the deal, provides buyer security, and removes the single most common SBA financing risk.`,
    })
  }

  // Fill with SDE driver if still short
  if (drivers.length < 2) {
    drivers.push({
      rank: drivers.length + 1,
      title: `${industry.label} industry profile`,
      impact: `${industry.sdeMultiple[0]}×–${industry.sdeMultiple[1]}× SDE range`,
      detail: `Industry multiples of ${industry.sdeMultiple[0]}×–${industry.sdeMultiple[1]}× on your SDE midpoint (${fmt(sdeMid)}) establish a defensible listing range that buyers and lenders recognize.`,
    })
  }

  return drivers.slice(0, 3).map((d, i) => ({ ...d, rank: i + 1 }))
}

function buildDetractors(
  dims: Array<{ key: string; score: number }>,
  s1: Partial<Stage1Answers>,
  checklist: string[],
  sdeMid: number,
  industry: ReturnType<typeof findIndustry>
): ReportDetractor[] {
  const detractors: ReportDetractor[] = []
  const dimMap = Object.fromEntries(dims.map((d) => [d.key, d.score]))
  const multipleSwing = fmt(Math.round(sdeMid * (industry.sdeMultiple[1] - industry.sdeMultiple[0])))

  if ((dimMap.operational ?? 100) < 65) {
    const opCheckItem =
      checklist.find((c) => c.toLowerCase().includes("operations manual") || c.toLowerCase().includes("owner")) ??
      "Write a one-page operations manual for your top 5 owner-dependent tasks."
    detractors.push({
      rank: 1,
      title: `Operational Independence ${dimMap.operational}/100`,
      impact: `−${multipleSwing} on multiple`,
      detail: `A score below 65 signals to buyers that this business is a job, not a system. Offers anchor at the low end of the SDE multiple range — a swing of ${multipleSwing} in enterprise value.`,
      fix: opCheckItem,
    })
  }

  if ((dimMap.dealReadiness ?? 100) < 65) {
    const docFix =
      checklist.find((c) => c.toLowerCase().includes("p&l") || c.toLowerCase().includes("financial")) ??
      "Get clean P&L statements and tax returns for the last 3 years."
    detractors.push({
      rank: detractors.length + 1,
      title: "Incomplete deal documentation",
      impact: "−$200K–$400K offers",
      detail:
        "Without CPA-prepared normalized financials, lenders won't underwrite to the high end. Buyers will offer at floor or insert re-trade clauses at signing.",
      fix: docFix,
    })
  }

  if (s1.facilityType === "short_lease") {
    detractors.push({
      rank: detractors.length + 1,
      title: "Short or unresolved lease",
      impact: "Kills SBA loan",
      detail:
        "SBA lenders require lease term ≥ loan term. On a 10-year loan, a short lease is a hard financing contingency — discovered at final approval, it kills deals at the worst possible moment.",
      fix: "Negotiate a lease extension of at least 7–10 years before listing.",
    })
  }

  if ((dimMap.financial ?? 100) < 45 && detractors.length < 3) {
    const finFix =
      checklist.find((c) => c.toLowerCase().includes("add-back") || c.toLowerCase().includes("ebitda")) ??
      "Prepare a normalized EBITDA/SDE add-back schedule showing true owner earnings."
    detractors.push({
      rank: detractors.length + 1,
      title: "SDE requires substantiation",
      impact: "Buyer discounts offer",
      detail:
        "Without a formal add-back schedule, buyers assume the worst. Unsubstantiated SDE shrinks your buyer pool and gives every buyer a re-trade opportunity.",
      fix: finFix,
    })
  }

  if ((dimMap.buyerAccess ?? 100) < 40 && detractors.length < 3) {
    detractors.push({
      rank: detractors.length + 1,
      title: "Narrow buyer accessibility",
      impact: "Fewer bidders",
      detail:
        "Limited deal structure flexibility and buyer pool size reduce competitive tension — fewer bidders means less leverage to achieve the high end of your valuation range.",
      fix: "Get a preliminary SBA 7(a) feasibility letter. Offer a 10–15% seller note to expand your qualified buyer pool.",
    })
  }

  return detractors.slice(0, 3).map((d, i) => ({ ...d, rank: i + 1 }))
}

function buildGrowthLevers(
  s1: Partial<Stage1Answers>,
  _industry: ReturnType<typeof findIndustry>
): Array<{ title: string; detail: string }> {
  const years = s1.years ?? 0
  const levers: Array<{ title: string; detail: string }> = []

  levers.push({
    title: "Geographic or service-line expansion",
    detail:
      years >= 10
        ? `${years}-year operating history demonstrates a proven model. A buyer who can replicate it in an adjacent market or add a complementary service line can justify a premium multiple.`
        : `An established customer base typically has not exhausted its addressable market. A buyer with capital can expand faster than you can organically.`,
  })

  levers.push({
    title: "Pricing optimization",
    detail:
      years >= 8
        ? `Businesses operating ${years} years often have pricing that hasn't kept pace with inflation or competitive benchmarks. A 10–15% rate increase may be achievable with minimal churn.`
        : `Benchmarking your pricing against market rates is a low-effort, high-impact lever that a buyer will identify in their first 90 days.`,
  })

  const empSlugs = ["6_15", "16_50", "50plus"]
  const hasEmployees = empSlugs.includes(s1.employees ?? "")
  levers.push({
    title: "Operational leverage",
    detail: hasEmployees
      ? `Adding one supervisory layer below the owner frees up capacity for business development and reduces owner-dependency risk simultaneously.`
      : `Hiring a single senior employee or manager creates the organizational depth that transitions this from a self-employed practice to a transferable business.`,
  })

  return levers
}

function buildNextSteps(
  checklist: string[],
  _dims: Array<{ key: string; score: number }>,
  s1: Partial<Stage1Answers>
): ReportData["nextSteps"] {

  interface EnrichedStep {
    title: string
    detail: string
    priority: string
    impact: string
    when: string
    order: number
  }

  const steps: EnrichedStep[] = checklist.slice(0, 5).map((item, i) => {
    const lower = item.toLowerCase()
    let priority = "High"
    let impact = "Improves composite score"
    let when = "Month 1–2"
    let order = i

    if (lower.includes("p&l") || lower.includes("tax return") || lower.includes("financial")) {
      priority = "Critical"
      impact = "Unlocks every other step"
      when = "Week 1"
      order = 0
    } else if (lower.includes("lease")) {
      priority = "Critical"
      impact = "Protects SBA loan"
      when = "Month 1–3"
      order = 1
    } else if (lower.includes("operations manual") || lower.includes("owner-dependent")) {
      priority = "High"
      const sdeMid = SDE_MIDS[s1.sde ?? "500_1m"] ?? 750000
      const industry = findIndustry(s1.industry ?? "other")
      const swing = fmt(Math.round(sdeMid * (industry.sdeMultiple[1] - industry.sdeMultiple[0]) * 0.4))
      impact = `+${swing} midpoint shift`
      when = "Month 1–2"
      order = 2
    } else if (lower.includes("sba") || lower.includes("lender")) {
      priority = "High"
      impact = "Widens buyer pool"
      when = "Month 1"
      order = 3
    } else if (lower.includes("legal") || lower.includes("attorney")) {
      priority = "Critical"
      impact = "Removes deal blocker"
      when = "Week 1"
      order = 0.5
    }

    return {
      title: item,
      detail: `Completing this step before going to market gives you negotiating leverage and prevents deal-killers from appearing during buyer due diligence.`,
      priority,
      impact,
      when,
      order,
    }
  })

  return steps
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((s, i) => ({ rank: i + 1, ...s }))
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Builds the full `ReportData` struct from a Stage1Answers object that has
 * already been through `mapStage1ForScoring()` (i.e., slugs, not human labels).
 */
export function buildReportData(
  s1Scored: Partial<Stage1Answers>,
  firstName: string,
  sellingTimeline?: string
): ReportData {
  const industry = findIndustry(s1Scored.industry ?? "other")
  const sdeMid = SDE_MIDS[s1Scored.sde ?? "500_1m"] ?? 750000
  const revMid = REV_MIDS[s1Scored.revenue ?? "500_1m"] ?? 750000

  // ── Scoring ──────────────────────────────────────────────────────────────────
  const scoreResult = computeScore({ stage1: s1Scored })
  const sba = computeSBASnapshot(s1Scored)
  const [valLo, valHi] = getValuationRange(s1Scored)
  const valMid = Math.round((valLo + valHi) / 2)

  // ── Valuation methods ────────────────────────────────────────────────────────
  const sdeMethodLo = Math.round(sdeMid * industry.sdeMultiple[0])
  const sdeMethodHi = Math.round(sdeMid * industry.sdeMultiple[1])
  const revMethodLo = Math.round(revMid * industry.revenueMultiple[0])
  const revMethodHi = Math.round(revMid * industry.revenueMultiple[1])
  const assetFloor = Math.round(revMid * 0.25)

  const methods: ValuationMethod[] = [
    {
      name: "SDE × Industry Multiple",
      weight: "Primary",
      lo: sdeMethodLo,
      hi: sdeMethodHi,
      note: `SDE midpoint ${fmt(sdeMid)} × ${industry.sdeMultiple[0]}×–${industry.sdeMultiple[1]}× multiple. Directly prices the acquired cash flow — this is the number that drives the offer.`,
      primary: true,
    },
    {
      name: "Revenue Multiple",
      weight: "Secondary",
      lo: revMethodLo,
      hi: revMethodHi,
      note: `${industry.revenueMultiple[0]}×–${industry.revenueMultiple[1]}× against ${fmt(revMid)} revenue midpoint. A floor-check and sanity test, not a listing anchor.`,
    },
    {
      name: "Asset Floor",
      weight: "Reference",
      lo: assetFloor,
      hi: assetFloor,
      note: `25% of revenue. Minimum liquidation value — referenced by buyer counsel only. Sets an absolute floor, not a realistic offer.`,
    },
  ]

  // ── SBA stats ────────────────────────────────────────────────────────────────
  const annualDebtService = sba.monthlyPayment * 12
  const dscr = annualDebtService > 0 ? Math.round((sdeMid / annualDebtService) * 10) / 10 : 0

  // ── Transferability ──────────────────────────────────────────────────────────
  const opDim = scoreResult.dimensions.find((d) => d.key === "operational")
  const opScore = opDim?.score ?? 38
  const targetScore = Math.min(opScore + 24, 72)
  const opFix =
    scoreResult.checklist.find(
      (c) => c.toLowerCase().includes("operations manual") || c.toLowerCase().includes("owner")
    ) ?? "Write a one-page operations manual for your top 5 owner-dependent tasks."

  const dollarImpact = Math.round(sdeMid * (industry.sdeMultiple[1] - industry.sdeMultiple[0]) * 0.4)

  // ── Growth levers ────────────────────────────────────────────────────────────
  const growthLevers = buildGrowthLevers(s1Scored, industry)
  const growthFramed = `A buyer who sees these levers documented prices closer to ${industry.sdeMultiple[1]}×. A buyer who has to find them independently prices at ${industry.sdeMultiple[0]}× and treats the upside as their compensation.`

  // ── Deal structure ───────────────────────────────────────────────────────────
  const sellerNote = fmt(Math.round(valMid * 0.13))
  const primary = sba.eligible
    ? {
        name: "SBA 7(a) acquisition + seller note",
        detail: `10–15% seller note (~${sellerNote}) signals confidence in post-close performance, reduces lender LTV exposure, and typically accelerates closing by 20–30%. Broadest buyer pool, fastest timeline.`,
      }
    : {
        name: "Seller-financed acquisition",
        detail: `Offering 20–30% seller financing at market rates expands your buyer pool to operators who can't write large equity checks and typically achieves a higher blended price.`,
      }

  const secondary =
    (sellingTimeline === "1_2yr" || sellingTimeline === "3plus") && valMid > 500000
      ? {
          name: "Earnout on growth above baseline",
          detail: `12–18 month earnout capped at 15–20% of purchase price, tied to SDE exceeding current baseline. Clean, enforceable, and commonly accepted at this deal size when the seller believes in future upside.`,
        }
      : {
          name: "Conventional financing + larger down",
          detail: `For buyers who don't qualify for SBA or prefer speed, conventional financing with a larger buyer equity check (25–35%) trades timeline for simplicity and fewer lender conditions.`,
        }

  // ── Subscores ────────────────────────────────────────────────────────────────
  const subscores: ReportSubscore[] = scoreResult.dimensions.map((d) => ({
    key: d.key,
    label: SUBSCORE_LABELS[d.key] ?? d.name,
    value: d.score,
    color: scoreColor(d.score),
  }))

  // ── Drivers / Detractors ─────────────────────────────────────────────────────
  const drivers = buildDrivers(scoreResult.dimensions, s1Scored, valLo, valHi, sba.eligible)
  const detractors = buildDetractors(scoreResult.dimensions, s1Scored, scoreResult.checklist, sdeMid, industry)

  // ── Next steps ───────────────────────────────────────────────────────────────
  const nextSteps = buildNextSteps(scoreResult.checklist, scoreResult.dimensions, s1Scored)

  return {
    meta: {
      name: firstName,
      generated: "Generated just now",
      industry: industry.label,
      revenue: REVENUE_LABELS[s1Scored.revenue ?? ""] ?? s1Scored.revenue ?? "—",
      sde: SDE_LABELS[s1Scored.sde ?? ""] ?? s1Scored.sde ?? "—",
      sdeMidK: Math.round(sdeMid / 1000),
      yearsInBusiness: s1Scored.years ?? 0,
      employees: EMPLOYEE_LABELS[s1Scored.employees ?? ""] ?? s1Scored.employees ?? "—",
      timeline: TIMELINE_LABELS[sellingTimeline ?? ""] ?? "Not specified",
    },
    score: {
      composite: scoreResult.composite,
      grade: scoreResult.grade,
      gradeLabel: GRADE_LABELS[scoreResult.grade] ?? "Early Stage",
      headline: scoreResult.narrative,
      subscores,
    },
    valuation: { lo: valLo, mid: valMid, hi: valHi, methods },
    sba: {
      eligible: sba.eligible,
      loan: sba.loanAmount,
      downPayment: sba.downPayment,
      monthlyPayment: sba.monthlyPayment,
      dscr,
      dscrFloor: 1.25,
      term: 10,
      apr: 10.5,
      annualDebtService,
      buyerPool: sba.buyerPoolLabel,
    },
    transferability: {
      current: opScore,
      target: targetScore,
      targetLow: targetScore - 3,
      targetHigh: Math.min(targetScore + 3, 80),
      fix: opFix,
      dollarImpact: Math.round(dollarImpact / 1000),
    },
    drivers,
    detractors,
    growth: { levers: growthLevers, framed: growthFramed },
    dealStructure: { primary, secondary },
    nextSteps,
  }
}
