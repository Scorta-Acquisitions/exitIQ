import { findIndustry } from "@/lib/assessment/industries"
import { computeSBASnapshot } from "@/lib/assessment/sba"
import { computeScore, fmt, getTeaserRange, getValuationRange } from "@/lib/assessment/scoring"
import type { AssessmentSession } from "@/lib/assessment/session"

// ─── Band → label lookup tables ──────────────────────────────────────────────
// These mirror the option values defined in questions.ts / segmentation.ts so
// Claude receives human-readable labels, not opaque enum strings.

const REVENUE_LABELS: Record<string, string> = {
  under_250: "Under $250K",
  "250_500": "$250K–$500K",
  "500_1m": "$500K–$1M",
  "1m_2m": "$1M–$2M",
  "2m_5m": "$2M–$5M",
  "5m_10m": "$5M–$10M",
}

const EMPLOYEE_LABELS: Record<string, string> = {
  solo: "Solo / no employees",
  "1_5": "1–5 employees",
  "6_15": "6–15 employees",
  "16_50": "16–50 employees",
  "50plus": "50+ employees",
}

const OWNER_DEP_LABELS: Record<string, string> = {
  everything_stops: "Everything stops — owner handles most things",
  significant_impact: "Significant impact — revenue declines but business doesn't stop",
  minor_impact: "Minor impact — team handles most with light supervision",
  runs_independently: "Runs independently — team handles day-to-day without the owner",
}

const CUSTOMER_CONC_LABELS: Record<string, string> = {
  over_50: "Over 50% from top 3 customers — high concentration",
  "25_50": "25–50% from top 3 customers — moderate concentration",
  "10_25": "10–25% — well diversified",
  under_10: "Under 10% — highly diversified",
}

const REVENUE_TREND_LABELS: Record<string, string> = {
  grew_significantly: "Grown significantly (20%+ per year)",
  grew_slightly: "Grown slightly (5–20% per year)",
  flat: "Flat — within ±5%",
  declined_slightly: "Declined slightly (5–20%)",
  declined_significantly: "Declined significantly (over 20%)",
}

const RECURRING_LABELS: Record<string, string> = {
  over_75: "Over 75% recurring / contracted",
  "50_75": "50–75% recurring",
  "25_50": "25–50% recurring (mixed model)",
  "10_25": "10–25% recurring — mostly project-based",
  under_10: "Under 10% — almost entirely transactional",
}

const DOC_LABELS: Record<string, string> = {
  clean_docs: "Yes — clean P&Ls and tax returns ready to share",
  partial_docs: "Partial — documents exist but need cleanup",
  no_docs: "No — would need to work with CPA first",
}

const REAL_ESTATE_LABELS: Record<string, string> = {
  owns_location: "Owns the property (included or separable)",
  long_term_lease: "Long-term lease (3+ years remaining)",
  short_lease: "Short lease (under 3 years — may need renegotiation)",
  no_fixed_location: "No fixed location (remote / home-based / mobile)",
}

const REASON_LABELS: Record<string, string> = {
  retirement: "Retirement",
  burnout: "Burnout / lifestyle change",
  new_opportunity: "Moving on to a new opportunity",
  health: "Health reasons",
  partner_dispute: "Partner / ownership dispute",
  struggling: "Business is struggling — strategic exit",
  exploring: "Just exploring options",
}

const KPR_LABELS: Record<string, string> = {
  none: "None — new team or high turnover",
  one: "1 employee with 3+ years tenure",
  two_three: "2–3 employees with 3+ years tenure",
  four_plus: "4 or more employees with 3+ years tenure",
}

const SOPS_LABELS: Record<string, string> = {
  fully_docs: "Fully documented — clear processes for all major workflows",
  mostly_docs: "Mostly documented — key processes written, some gaps",
  some_docs: "Some documentation — a few checklists or guides",
  no_docs: "Not documented — knowledge lives in the owner's head",
}

const LEGAL_LABELS: Record<string, string> = {
  no_issues: "No — clean record",
  minor_resolved: "Had issues, now resolved — no active exposure",
  yes_issues: "Yes — active pending matters to disclose",
}

const DEAL_STRUCTURE_LABELS: Record<string, string> = {
  seller_financing: "Seller financing",
  sba_loan: "SBA loan",
  earnout: "Earnout / performance payments",
  all_cash: "All-cash only",
  dont_know: "Open / undecided",
}

const URGENCY_LABELS: Record<string, string> = {
  asap: "As soon as possible — ready to list now",
  "3_6mo": "3–6 months — preparing to go to market",
  "6_12mo": "6–12 months — taking time to prepare",
  no_rush: "No rush — exploring at own pace",
}

const BROKER_LABELS: Record<string, string> = {
  active_broker: "Currently has an active broker / listing agent",
  burned: "Had a broker — relationship ended without a sale",
  no_self: "No broker — wants to sell independently",
  no_exploring: "No broker — just exploring options",
}

const SELLING_TIMELINE_LABELS: Record<string, string> = {
  already: "Already trying to sell",
  "6_12mo": "6–12 months",
  "1_2yr": "1–2 years",
  "3plus": "3+ years",
  curious: "Just curious",
}

// Mirrors SDE_MIDPOINTS in scoring.ts (not exported there)
const SDE_MIDPOINTS: Record<string, number> = {
  under_250: 125_000,
  "250_500": 375_000,
  "500_1m": 750_000,
  "1m_2m": 1_500_000,
  "2m_5m": 3_500_000,
  "5m_10m": 7_500_000,
}

function lbl(map: Record<string, string>, val: string | undefined | null, fallback = "Not specified"): string {
  if (!val) return fallback
  return map[val] ?? val
}

// ─── Parse asking price to a numeric dollar amount ───────────────────────────
function parseAskingPrice(raw: string | undefined): number | null {
  if (!raw || /no\s*(idea|price)/i.test(raw)) return null
  const cleaned = raw.replace(/[^0-9.]/g, "")
  const n = parseFloat(cleaned)
  if (isNaN(n) || n <= 0) return null
  if (/m/i.test(raw)) return n * 1_000_000
  if (/k/i.test(raw)) return n * 1_000
  // Plain number over 10,000 → assume full dollars; under → assume thousands
  return n >= 10_000 ? n : n * 1_000
}

// ─── buildReportPrompt ────────────────────────────────────────────────────────
// Passed to Sonnet via streamText. Injects ALL deterministic metrics so the
// model writes narrative only — it never recalculates financial figures.
export function buildReportPrompt(session: AssessmentSession): string {
  const s1 = session.stage1 ?? {}
  const gate = session.gate ?? {}
  const s2 = session.stage2 ?? {}
  const s3 = session.stage3 ?? {}
  const s4 = session.stage4 ?? {}

  // ── Deterministic computations ──
  const score = computeScore(session)
  const [valLow, valHigh] = getValuationRange(s1)
  const valMid = Math.round((valLow + valHigh) / 2)
  const sba = computeSBASnapshot(s1)
  const industry = findIndustry(s1.industry ?? "other")
  const sdeMid = SDE_MIDPOINTS[s1.sde ?? "500_1m"] ?? 750_000
  const revMid = SDE_MIDPOINTS[s1.revenue ?? "500_1m"] ?? 750_000

  const sdeMethodLow = Math.round(sdeMid * industry.sdeMultiple[0])
  const sdeMethodHigh = Math.round(sdeMid * industry.sdeMultiple[1])
  const revMethodLow = Math.round(revMid * industry.revenueMultiple[0])
  const revMethodHigh = Math.round(revMid * industry.revenueMultiple[1])
  const assetFloor = Math.round(revMid * 0.25)

  const dimMap = Object.fromEntries(score.dimensions.map((d) => [d.key, d.score]))

  // ── Asking price context ──
  const numericAsk = parseAskingPrice(s4.askingPrice)
  let askingContext: string
  if (numericAsk === null) {
    askingContext = "Owner has no price in mind — an ideal opportunity to anchor at full market value."
  } else {
    const delta = ((numericAsk - valMid) / valMid) * 100
    if (delta > 30) {
      askingContext = `Owner expects ${fmt(numericAsk)}, which is ~${Math.round(delta)}% above the estimated market range of ${fmt(valLow)}–${fmt(valHigh)}. A diplomatic pricing conversation will be necessary.`
    } else if (delta < -20) {
      askingContext = `Owner expects ${fmt(numericAsk)}, which is ~${Math.round(Math.abs(delta))}% below the estimated market range — they are likely undervaluing the business.`
    } else {
      askingContext = `Owner expects ${fmt(numericAsk)}, which falls within the estimated market range of ${fmt(valLow)}–${fmt(valHigh)}. Expectations are well-calibrated.`
    }
  }

  // ── SBA status string ──
  const sbaVerdict =
    s3.sbaRestricted === "yes"
      ? "Not Eligible — owner self-reported a restricted industry category"
      : sba.eligible
        ? "Eligible"
        : "Not Eligible — exceeds size thresholds or industry restriction"

  // ── Deal structures ──
  const structureList = (s4.dealStructure ?? []).map((v) => DEAL_STRUCTURE_LABELS[v] ?? v).join(", ") || "Not specified"

  // ── Next-steps CTA line based on broker status + urgency ──
  const ctaLine =
    s4.brokerStatus === "burned"
      ? "Schedule a free consultation — we help owners sell without brokers at exitiq.com"
      : s4.urgency === "asap" || gate.sellingTimeline === "already"
        ? "Join the waitlist for early marketplace access at exitiq.com"
        : "Subscribe for monthly Exit IQ updates as you prepare at exitiq.com"

  const ownerName = gate.firstName ?? "Business Owner"
  const gradeLabel = { A: "A — Excellent", B: "B — Good", C: "C — Needs Preparation", D: "D — Early Stage" }[score.grade]

  return `You are a senior sell-side M&A advisor at a boutique firm specializing in main-street and lower-middle-market business exits under $10M. You are authoring a personalized Exit IQ Report for ${ownerName}.

CRITICAL RULES — read before writing a single word:
1. ALL financial figures, scores, and ranges below are pre-calculated and authoritative. Do NOT recalculate, round differently, or contradict them.
2. Every sentence must be grounded in the actual data provided. No generic language ("strong foundation", "great opportunity") unless immediately followed by a specific data point that justifies it.
3. Tone: confident, direct, advisor-level. Write as if you personally reviewed this business. No hedging ("this may", "potentially", "could be").
4. Avoid re-stating what the owner already told you. Add insight they don't have — buyer perspective, market context, dollar implication.
5. This report will be shared with the owner's spouse, CPA, and attorney. It must be specific enough to hold up to scrutiny.
6. Use the exact ## section headers listed below. No additions, no omissions.

════════════════════════════════════════════════
PRE-CALCULATED METRICS — authoritative ground truth
════════════════════════════════════════════════

EXIT IQ SCORE
  Composite:  ${score.composite} / 100  (Grade: ${gradeLabel})
  Distressed: ${score.distressed ? "Yes — treat sale context sensitively" : "No"}

DIMENSION SCORES (0–100)
  Financial Attractiveness  ${dimMap.financial ?? "N/A"}  (weight 25%)
  Operational Independence  ${dimMap.operational ?? "N/A"}  (weight 25%)
  Market Positioning        ${dimMap.market ?? "N/A"}  (weight 20%)
  Deal Readiness            ${dimMap.dealReadiness ?? "N/A"}  (weight 15%)
  Buyer Accessibility       ${dimMap.buyerAccess ?? "N/A"}  (weight 15%)

VALUATION — three methodologies
  Industry:  ${industry.label}  |  SDE band midpoint: ${fmt(sdeMid)}  |  Revenue band midpoint: ${fmt(revMid)}

  Method 1 — SDE × Industry Multiple (PRIMARY for ${industry.label})
    Multiple range: ${industry.sdeMultiple[0]}x – ${industry.sdeMultiple[1]}x
    Range:          ${fmt(sdeMethodLow)} – ${fmt(sdeMethodHigh)}

  Method 2 — Revenue Multiple
    Multiple range: ${industry.revenueMultiple[0]}x – ${industry.revenueMultiple[1]}x
    Range:          ${fmt(revMethodLow)} – ${fmt(revMethodHigh)}
    ${industry.revenueMultiple[1] < 0.6 ? "Note: revenue multiples are secondary for this industry — use for sanity-check only." : ""}

  Method 3 — Asset Floor
    25% of revenue: ${fmt(assetFloor)}

  ★ BLENDED RANGE (use this as the recommended listing range):  ${fmt(valLow)} – ${fmt(valHigh)}
    Midpoint: ${fmt(valMid)}

  Asking price context: ${askingContext}

SBA 7(a) FINANCING
  Verdict:          ${sbaVerdict}
  ${
    sba.eligible && s3.sbaRestricted !== "yes"
      ? `Loan amount:      ${fmt(sba.loanAmount)}
  Down payment:     ${fmt(sba.downPayment)} (10%)
  Monthly payment:  ${fmt(sba.monthlyPayment)} / month (10-year term ~10.5% APR)
  Buyer pool size:  ${sba.buyerPoolLabel}`
      : `Financing path:   ${sba.note}`
  }

FLAGS IDENTIFIED
  Green (buyer strengths):
${score.flags.green.length ? score.flags.green.map((f) => `    • ${f}`).join("\n") : "    • None identified"}

  Yellow (address before listing):
${score.flags.yellow.length ? score.flags.yellow.map((f) => `    • ${f}`).join("\n") : "    • None identified"}

  Red (deal risks):
${score.flags.red.length ? score.flags.red.map((f) => `    • ${f}`).join("\n") : "    • None identified"}

90-DAY CHECKLIST (pre-generated — include top 3 in Next Steps, verbatim)
${score.checklist.map((item, i) => `  ${i + 1}. ${item}`).join("\n")}

════════════════════════════════════════════════
SELLER'S RESPONSES
════════════════════════════════════════════════

Seller:           ${ownerName}
Selling timeline: ${lbl(SELLING_TIMELINE_LABELS, gate.sellingTimeline)}
Segment tag:      ${gate.tag ?? "untagged"}

Stage 1 — Business Snapshot
  Industry:   ${industry.label}
  Years:      ${s1.years ?? "Not specified"}
  Revenue:    ${lbl(REVENUE_LABELS, s1.revenue)}
  SDE:        ${lbl(REVENUE_LABELS, s1.sde)}
  Employees:  ${lbl(EMPLOYEE_LABELS, s1.employees)}
  State:      ${s1.state ?? "Not specified"}

Stage 2 — Health Check
  Owner dependency:       ${lbl(OWNER_DEP_LABELS, s2.ownerDependency)}
  Customer concentration: ${lbl(CUSTOMER_CONC_LABELS, s2.customerConcentration)}
  Revenue trend (3yr):    ${lbl(REVENUE_TREND_LABELS, s2.revenueTrend)}
  Recurring revenue:      ${lbl(RECURRING_LABELS, s2.recurringRevenue)}
  Financial docs:         ${lbl(DOC_LABELS, s2.docReadiness)}
  Real estate:            ${lbl(REAL_ESTATE_LABELS, s2.realEstate)}
  Reason for selling:     ${lbl(REASON_LABELS, s2.reasonForSelling)}

Stage 3 — Buyer Lens
  SBA restricted industry:  ${s3.sbaRestricted === "yes" ? "Yes — self-reported restricted category" : "No"}
  Long-tenured staff:        ${lbl(KPR_LABELS, s3.keyPersonRisk)}
  SOPs / documentation:      ${lbl(SOPS_LABELS, s3.sops)}
  Growth levers (verbatim):  "${s3.growthLevers ?? "Not provided"}"
  Legal / regulatory:        ${lbl(LEGAL_LABELS, s3.legal)}

Stage 4 — Deal Goals
  Asking price:    ${s4.askingPrice ?? "No idea / not specified"}
  Deal structures: ${structureList}
  Urgency:         ${lbl(URGENCY_LABELS, s4.urgency)}
  Broker status:   ${lbl(BROKER_LABELS, s4.brokerStatus)}

════════════════════════════════════════════════
WRITE THE REPORT NOW — use these exact ## headers
════════════════════════════════════════════════

# Exit IQ Report — ${ownerName}

## Executive Summary
3–4 sentences. Open with the score (${score.composite}/100, Grade ${score.grade}) and the single most important insight — what makes or breaks this exit. Name the estimated valuation range (${fmt(valLow)}–${fmt(valHigh)}). End with the one action that would move the needle most before listing.

## Business Profile
2–3 sentences introducing this business to a sophisticated buyer. Include: industry, revenue band, SDE band, years in operation, employee count, state. Frame the business's market position — what kind of owner it suits and why it would attract buyers.

## Valuation Analysis
Reference all three pre-calculated methodologies. Explain in one sentence why the SDE × multiple method is the primary method for ${industry.label} businesses. State the blended range (${fmt(valLow)}–${fmt(valHigh)}) as the recommended listing range and explain what drives the spread between low and high. Include the asking price context verbatim: "${askingContext}". Close with 1–2 sentences on what specific changes would move the multiple toward the high end.

## SBA Eligibility Assessment
State the verdict: ${sbaVerdict}. ${sba.eligible && s3.sbaRestricted !== "yes" ? `Explain that a buyer can acquire with as little as ${fmt(sba.downPayment)} down at ${fmt(sba.monthlyPayment)}/month — and specifically what that means for buyer pool size (${sba.buyerPoolLabel}). If DSCR is relevant, note whether the SDE supports the debt service on a ${fmt(sba.loanAmount)} loan.` : "Explain what financing path buyers will use instead (conventional, seller financing, PE) and what that means for deal speed and buyer pool size."} One paragraph.

## Transferability Score
Operational Independence score: ${dimMap.operational ?? "N/A"}/100. Write 3–4 sentences explaining what drives this specific number — reference: owner dependency (${lbl(OWNER_DEP_LABELS, s2.ownerDependency)}), SOPs (${lbl(SOPS_LABELS, s3.sops)}), and long-tenured staff (${lbl(KPR_LABELS, s3.keyPersonRisk)}). Quantify the upside: what the score would become with specific improvements, and what that translates to in dollar terms relative to the ${fmt(valMid)} midpoint.

## Deal Structure Recommendation
Based on: structures the seller is open to (${structureList}), urgency (${lbl(URGENCY_LABELS, s4.urgency)}), SBA eligibility (${sbaVerdict}). Recommend 1–2 specific structures with concrete rationale — use specific numbers, e.g., "A 10–15% seller note expands your qualified buyer pool by roughly 3x and typically accelerates closing by 20–30%." Tailor to this seller's situation; do not give generic advice.

## Top 3 Value Drivers
Exactly 3 numbered items drawn from the Green flags and high-scoring dimensions. Format each as: **Bold label.** Two sentences — first from the buyer's perspective (what they see), second on the dollar implication or multiple impact.

## Top 3 Value Detractors
Exactly 3 numbered items drawn from the Red/Yellow flags and lowest-scoring dimensions. Format each as: **Bold label.** First sentence: what a buyer will say or discount for. Second sentence: the single most effective mitigation before listing. Be direct — do not soften critical issues.

## Growth Levers
Start by referencing the owner's own words: "${s3.growthLevers ?? "not provided"}". Expand on 2–3 concrete growth angles a new owner could execute. Frame as upside — buyers pay a premium for identifiable, executable growth. 2–4 sentences total.

## Next Steps
Tailored to: ${lbl(BROKER_LABELS, s4.brokerStatus)}, timeline ${lbl(SELLING_TIMELINE_LABELS, gate.sellingTimeline)}. Write exactly 3 numbered steps, each specific and immediately actionable. Step 1 must be the highest-priority item from the 90-day checklist above. Step 3 must end with: "${ctaLine}."

---
*Report generated by Exit IQ — exitiq.com*`
}

// ─── buildTeaserPrompt ────────────────────────────────────────────────────────
// Passed to Haiku via generateObject. Stage 1 + gate data only.
// Valuation range and segmentTag are pre-computed and injected as ground truth
// so Haiku writes copy, not math.
export function buildTeaserPrompt(session: Partial<AssessmentSession>): string {
  const s1 = session.stage1 ?? {}
  const gate = session.gate ?? {}

  const industry = findIndustry(s1.industry ?? "other")
  const [teaserLow, teaserHigh] = getTeaserRange(s1)
  const teaserRangeStr = `${fmt(teaserLow)} – ${fmt(teaserHigh)}`
  const segmentTag = gate.tag ?? "nurture"

  return `You are a sell-side M&A advisor generating a teaser card for a business owner who just completed a quick snapshot assessment.

PRE-CALCULATED VALUES — use exactly as provided, do not recalculate:
  valuationRange: "${teaserRangeStr}"
  segmentTag:     "${segmentTag}"

BUSINESS SNAPSHOT:
  Industry:   ${industry.label}  (SDE multiple benchmark: ${industry.sdeMultiple[0]}x – ${industry.sdeMultiple[1]}x)
  Revenue:    ${lbl(REVENUE_LABELS, s1.revenue)}
  SDE:        ${lbl(REVENUE_LABELS, s1.sde)}
  Employees:  ${lbl(EMPLOYEE_LABELS, s1.employees)}
  Years:      ${s1.years ?? "Not specified"}
  State:      ${s1.state ?? "Not specified"}
  Timeline:   ${lbl(SELLING_TIMELINE_LABELS, gate.sellingTimeline)}

INSTRUCTIONS:
Generate a 5-field teaser object. Be specific to this exact business — no generic language.

  headline       One sentence (max 15 words) that captures the exit opportunity. Lead with the industry and a compelling angle, e.g., "Established HVAC business in Texas with recurring contracts and SBA-eligible valuation."
  valuationRange Use exactly: "${teaserRangeStr}"
  topStrength    The single most attractive attribute for buyers — one sentence grounded in the snapshot data above.
  topRisk        The single most important issue to address before going to market — one sentence, specific and direct.
  segmentTag     Use exactly: "${segmentTag}"`
}
