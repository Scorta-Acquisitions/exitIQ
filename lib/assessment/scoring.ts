import { findIndustry } from "@/lib/assessment/industries"
import type { AssessmentSession, Stage1Answers, Stage2Answers, Stage3Answers, Stage4Answers } from "@/lib/assessment/session"
import { getStateMarketBonus } from "@/lib/assessment/states"

export type Grade = "A" | "B" | "C" | "D"

export interface RadarDimension {
  key: string
  name: string
  score: number // 0–100
  weight: number
}

export interface ScoreResult {
  composite: number
  grade: Grade
  narrative: string
  dimensions: RadarDimension[]
  distressed: boolean
  flags: {
    green: string[]
    yellow: string[]
    red: string[]
  }
  checklist: string[]
}

// ─── Revenue band midpoints ──────────────────────────────────────────────────
const SDE_MIDPOINTS: Record<string, number> = {
  under_250: 125000,
  "250_500": 375000,
  "500_1m": 750000,
  "1m_2m": 1500000,
  "2m_5m": 3500000,
  "5m_10m": 7500000,
}

const REVENUE_MIDPOINTS: Record<string, number> = { ...SDE_MIDPOINTS }

// ─── Dimension: Financial Attractiveness (25%) ───────────────────────────────
function scoreFinancial(s1: Partial<Stage1Answers>, s2: Partial<Stage2Answers>): number {
  const sdeScores: Record<string, number> = {
    under_250: 20, "250_500": 38, "500_1m": 52, "1m_2m": 66, "2m_5m": 80, "5m_10m": 92,
  }
  let score = sdeScores[s1.sde ?? ""] ?? 35

  const trendDeltas: Record<string, number> = {
    declined_significantly: -22, declined_slightly: -10, flat: 0, grew_slightly: 10, grew_significantly: 22,
  }
  score += trendDeltas[s2.revenueTrend ?? ""] ?? 0

  const recurringBonus: Record<string, number> = {
    under_10: 0, "10_25": 8, "25_50": 16, "50_75": 26, over_75: 36,
  }
  score += recurringBonus[s2.recurringRevenue ?? ""] ?? 0

  return Math.min(100, Math.max(0, score))
}

// ─── Dimension: Operational Independence (25%) ───────────────────────────────
function scoreOperational(s2: Partial<Stage2Answers>, s3: Partial<Stage3Answers>): number {
  const ownerScores: Record<string, number> = {
    everything_stops: 10, significant_impact: 35, minor_impact: 65, runs_independently: 90,
  }
  const kprScores: Record<string, number> = { none: 15, one: 42, two_three: 68, four_plus: 90 }
  const sopScores: Record<string, number> = { no_docs: 10, some_docs: 38, mostly_docs: 65, fully_docs: 90 }

  const a = ownerScores[s2.ownerDependency ?? ""] ?? 35
  const b = kprScores[s3.keyPersonRisk ?? ""] ?? 42
  const c = sopScores[s3.sops ?? ""] ?? 38
  return Math.round((a + b + c) / 3)
}

// ─── Dimension: Market Positioning (20%) ─────────────────────────────────────
function scoreMarket(s1: Partial<Stage1Answers>): number {
  const industry = findIndustry(s1.industry ?? "other")
  let score = industry.marketScore

  const years = s1.years ?? 0
  if (years <= 2) score -= 12
  else if (years <= 5) score += 0
  else if (years <= 10) score += 8
  else if (years <= 20) score += 14
  else score += 20

  score += getStateMarketBonus(s1.state ?? "")

  return Math.min(100, Math.max(0, score))
}

// ─── Dimension: Deal Readiness (15%) ─────────────────────────────────────────
function scoreDealReadiness(s2: Partial<Stage2Answers>, s3: Partial<Stage3Answers>): number {
  const docScores: Record<string, number> = { no_docs: 10, partial_docs: 42, clean_docs: 88 }
  const legalScores: Record<string, number> = { yes_issues: 15, no_issues: 88 }

  const doc = docScores[s2.docReadiness ?? ""] ?? 42
  const legal = legalScores[s3.legal ?? ""] ?? 88
  let score = Math.round((doc + legal) / 2)

  const leaseDeltas: Record<string, number> = {
    owns_location: 10, long_term_lease: 0, short_lease: -12, no_fixed_location: 5,
  }
  score += leaseDeltas[s2.realEstate ?? ""] ?? 0

  return Math.min(100, Math.max(0, score))
}

// ─── Dimension: Buyer Accessibility (15%) ────────────────────────────────────
function scoreBuyerAccess(
  s1: Partial<Stage1Answers>,
  s3: Partial<Stage3Answers>,
  s4: Partial<Stage4Answers>,
  sbaEligible: boolean,
): number {
  let score = sbaEligible && s3.sbaRestricted !== "yes" ? 30 : 0

  const structures = s4.dealStructure ?? []
  if (structures.length >= 4) score += 40
  else if (structures.length >= 2) score += 25
  else if (structures.length === 1) score += 10

  const asking = s4.askingPrice ?? "no_idea"
  const sdeMid = SDE_MIDPOINTS[s1.sde ?? "500_1m"] ?? 750000
  const industry = findIndustry(s1.industry ?? "other")
  const midMultiple = (industry.sdeMultiple[0] + industry.sdeMultiple[1]) / 2
  const estimatedHigh = sdeMid * midMultiple * 1.25

  if (asking === "no_idea") {
    score += 20
  } else {
    const numericAsk = parseFloat(asking.replace(/[^0-9.]/g, "")) * 1000
    if (!isNaN(numericAsk)) {
      if (numericAsk <= estimatedHigh) score += 30
      else if (numericAsk <= estimatedHigh * 1.25) score += 15
    }
  }

  return Math.min(100, Math.max(0, score))
}

// ─── SDE × industry multiple valuation ──────────────────────────────────────
export function getValuationRange(s1: Partial<Stage1Answers>): [number, number] {
  const sdeMid = SDE_MIDPOINTS[s1.sde ?? "500_1m"] ?? 750000
  const industry = findIndustry(s1.industry ?? "other")

  const sdeMethod: [number, number] = [
    Math.round(sdeMid * industry.sdeMultiple[0]),
    Math.round(sdeMid * industry.sdeMultiple[1]),
  ]

  const revMid = REVENUE_MIDPOINTS[s1.revenue ?? "500_1m"] ?? 750000
  const revenueMethod: [number, number] = [
    Math.round(revMid * industry.revenueMultiple[0]),
    Math.round(revMid * industry.revenueMultiple[1]),
  ]

  const assetFloor = Math.round(revMid * 0.25)

  const low = Math.max(assetFloor, Math.round((sdeMethod[0] + revenueMethod[0]) / 2))
  const high = Math.round((sdeMethod[1] + revenueMethod[1]) / 2)

  return [low, high]
}

// ─── Wide teaser range (before email gate) ───────────────────────────────────
export function getTeaserRange(s1: Partial<Stage1Answers>): [number, number] {
  const [low, high] = getValuationRange(s1)
  return [Math.round(low * 0.75), Math.round(high * 1.25)]
}

// ─── Flag generation ─────────────────────────────────────────────────────────
function generateFlags(
  dims: RadarDimension[],
  s2: Partial<Stage2Answers>,
  s3: Partial<Stage3Answers>,
  distressed: boolean,
): ScoreResult["flags"] {
  const green: string[] = []
  const yellow: string[] = []
  const red: string[] = []

  const dimMap = Object.fromEntries(dims.map((d) => [d.key, d.score]))

  if ((dimMap.financial ?? 0) >= 70) green.push("Strong SDE — attractive to buyers financing through SBA")
  else if ((dimMap.financial ?? 0) < 50) red.push("SDE level limits your buyer pool — consider optimizing expenses pre-sale")
  else yellow.push("Revenue fundamentals are solid — document trends clearly for buyers")

  if (s2.recurringRevenue === "over_75" || s2.recurringRevenue === "50_75") {
    green.push("High recurring revenue significantly de-risks the deal for buyers")
  } else if (s2.recurringRevenue === "under_10") {
    yellow.push("Low recurring revenue — document client retention data to offset risk")
  }

  if (s2.ownerDependency === "runs_independently") green.push("Business runs independently — maximizes your negotiating leverage")
  else if (s2.ownerDependency === "everything_stops") red.push("High owner dependency is the #1 valuation killer — start cross-training now")
  else if (s2.ownerDependency === "significant_impact") yellow.push("Moderate owner dependency — a documented transition plan helps buyers")

  if (s3.sops === "fully_docs") green.push("Fully documented operations — reduces buyer due diligence friction")
  else if (s3.sops === "no_docs") yellow.push("Lack of SOPs extends deal timelines — 30 days of documentation pays off significantly")

  if (s2.docReadiness === "clean_docs") green.push("Clean financials ready — deal can move fast once a buyer is found")
  else if (s2.docReadiness === "no_docs") red.push("No financial documentation — this will delay or kill most deals")

  if (s3.legal === "yes_issues") red.push("Pending legal issues must be resolved before going to market")
  else green.push("Clean legal standing — no deal-blockers identified")

  if (s2.customerConcentration === "over_50") red.push("Top 3 customers > 50% of revenue — buyer will require a price adjustment")
  else if (s2.customerConcentration === "25_50") yellow.push("Customer concentration is manageable but worth disclosing early")

  if (s2.realEstate === "owns_location") green.push("Business owns its location — adds asset value and buyer security")
  else if (s2.realEstate === "short_lease") yellow.push("Short lease term — negotiate an extension before listing")

  if (distressed) red.push("Distressed sale context noted — focus on asset value and deal structure flexibility")

  if ((dimMap.market ?? 0) >= 75) green.push("Industry has strong buyer demand and favorable SDE multiples")

  return { green, yellow, red }
}

// ─── 90-day checklist ────────────────────────────────────────────────────────
function generateChecklist(dims: RadarDimension[], s2: Partial<Stage2Answers>, s3: Partial<Stage3Answers>): string[] {
  const items: Array<{ text: string; priority: number }> = []
  const dimMap = Object.fromEntries(dims.map((d) => [d.key, d.score]))

  if ((dimMap.dealReadiness ?? 100) < 70) {
    if (s2.docReadiness !== "clean_docs") items.push({ text: "Get clean P&L statements and tax returns for the last 3 years from your CPA", priority: 10 })
    if (s3.legal === "yes_issues") items.push({ text: "Consult your attorney to resolve any pending legal or regulatory issues", priority: 9 })
    if (s2.realEstate === "short_lease") items.push({ text: "Negotiate a lease extension of at least 3–5 years before listing", priority: 8 })
    items.push({ text: "Create a current inventory list and equipment valuation", priority: 5 })
  }

  if ((dimMap.operational ?? 100) < 70) {
    if (s2.ownerDependency !== "runs_independently") items.push({ text: "Write a one-page operations manual for your top 5 owner-dependent tasks", priority: 9 })
    if (s3.sops !== "fully_docs") items.push({ text: "Document recurring workflows in simple SOPs — even 3-page guides add significant value", priority: 7 })
    if (s3.keyPersonRisk === "none") items.push({ text: "Cross-train at least one employee who can manage day-to-day operations", priority: 7 })
  }

  if ((dimMap.financial ?? 100) < 70) {
    items.push({ text: "Prepare a normalized EBITDA/SDE add-back schedule showing true owner earnings", priority: 8 })
    if (s2.recurringRevenue === "under_10") items.push({ text: "Create a client retention summary — even informal recurring relationships can be documented", priority: 6 })
    items.push({ text: "Review and reduce any non-essential owner expenses running through the business", priority: 5 })
  }

  if ((dimMap.buyerAccess ?? 100) < 65) {
    items.push({ text: "Get a preliminary SBA 7(a) feasibility letter from a participating lender", priority: 7 })
    items.push({ text: "Consult your CPA on seller financing structures — offering 10–20% note expands your buyer pool significantly", priority: 6 })
  }

  if ((dimMap.market ?? 100) < 65) {
    items.push({ text: "Research 3 comparable business sales in your industry to benchmark your expectations", priority: 5 })
    items.push({ text: "Build a one-page business overview highlighting your competitive advantages", priority: 4 })
  }

  if (s2.customerConcentration === "over_50") {
    items.push({ text: "Actively grow your customer base to reduce concentration risk before going to market", priority: 8 })
  }

  return items
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8)
    .map((i) => i.text)
}

// ─── Score narrative ─────────────────────────────────────────────────────────
function buildNarrative(composite: number, grade: Grade, distressed: boolean, dims: RadarDimension[]): string {
  if (distressed) {
    return `Your Exit IQ score of ${composite} reflects the current challenges in the business. Buyers will be sensitive to the distress context — the opportunity is to frame this as a turnaround with identifiable levers. Focus on asset value, deal structure flexibility, and realistic pricing.`
  }
  if (grade === "A") {
    return `Your Exit IQ score of ${composite} puts you in the top tier of seller-ready businesses. Your strongest dimensions are ${getTopDim(dims)} — exactly what sophisticated buyers and SBA lenders want to see. You have real negotiating leverage.`
  }
  if (grade === "B") {
    const weakDim = dims.reduce((a, b) => (a.score < b.score ? a : b))
    return `Your Exit IQ score of ${composite} reflects a fundamentally strong business with room to optimize. Addressing ${weakDim.name.toLowerCase()} before listing could meaningfully improve your multiple.`
  }
  if (grade === "C") {
    return `Your Exit IQ score of ${composite} shows a business with good bones that needs preparation. The checklist below identifies the highest-ROI actions to take in the next 90 days before going to market.`
  }
  return `Your Exit IQ score of ${composite} indicates this business is in early exit preparation. The good news: most of the gaps are solvable. The 90-day checklist below gives you a clear action plan.`
}

function getTopDim(dims: RadarDimension[]): string {
  const top2 = [...dims].sort((a, b) => b.score - a.score).slice(0, 2)
  return top2.map((d) => d.name.toLowerCase()).join(" and ")
}

// ─── SBA eligibility (used by scoring + SBA snapshot) ────────────────────────
export function isSBAEligible(s1: Partial<Stage1Answers>): boolean {
  const restricted = new Set(["saas_tech", "real_estate_svcs", "legal"])
  if (restricted.has(s1.industry ?? "")) return false

  const employeeMap: Record<string, number> = {
    solo: 0, "1_5": 3, "6_15": 10, "16_50": 33, "50plus": 75,
  }
  if ((employeeMap[s1.employees ?? ""] ?? 0) >= 75) return false

  const revMap: Record<string, number> = {
    under_250: 125000, "250_500": 375000, "500_1m": 750000,
    "1m_2m": 1500000, "2m_5m": 3500000, "5m_10m": 7500000,
  }
  if ((revMap[s1.revenue ?? ""] ?? 0) > 5000000) return false

  return true
}

// ─── Main scoring function ────────────────────────────────────────────────────
export function computeScore(session: Partial<AssessmentSession>): ScoreResult {
  const s1 = session.stage1 ?? {}
  const s2 = session.stage2 ?? {}
  const s3 = session.stage3 ?? {}
  const s4 = session.stage4 ?? {}

  const distressed = s2.reasonForSelling === "struggling"
  const sbaEligible = isSBAEligible(s1)

  const dimensions: RadarDimension[] = [
    { key: "financial", name: "Financial Attractiveness", score: scoreFinancial(s1, s2), weight: 0.25 },
    { key: "operational", name: "Operational Independence", score: scoreOperational(s2, s3), weight: 0.25 },
    { key: "market", name: "Market Positioning", score: scoreMarket(s1), weight: 0.20 },
    { key: "dealReadiness", name: "Deal Readiness", score: scoreDealReadiness(s2, s3), weight: 0.15 },
    { key: "buyerAccess", name: "Buyer Accessibility", score: scoreBuyerAccess(s1, s3, s4, sbaEligible), weight: 0.15 },
  ]

  if (distressed) {
    const finDim = dimensions.find((d) => d.key === "financial")
    if (finDim) finDim.score = Math.min(finDim.score, 40)
  }

  const composite = Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0))

  let grade: Grade = "D"
  if (composite >= 85) grade = "A"
  else if (composite >= 70) grade = "B"
  else if (composite >= 55) grade = "C"

  const flags = generateFlags(dimensions, s2, s3, distressed)
  const checklist = generateChecklist(dimensions, s2, s3)
  const narrative = buildNarrative(composite, grade, distressed, dimensions)

  return { composite, grade, narrative, dimensions, distressed, flags, checklist }
}

export function fmt(n: number): string {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1000) return "$" + Math.round(n / 1000) + "K"
  return "$" + n.toLocaleString()
}
