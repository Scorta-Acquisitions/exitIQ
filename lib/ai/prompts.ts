import { findIndustry } from "@/lib/assessment/industries"
import type { ReportData } from "@/lib/assessment/report-transform"
import { fmt } from "@/lib/assessment/scoring"
import type { AssessmentSession } from "@/lib/assessment/session"
import { appendWorkflowTrace } from "@/lib/debug/workflow-trace"

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
  long_term_lease: "Long-term lease (7+ years remaining)",
  short_lease: "Short lease (under 7 years — may need renegotiation)",
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
// Passed to Sonnet via streamText. Accepts the pre-frozen ReportData so the
// prompt and the visual renderer consume the exact same set of computed numbers.
// The model is explicitly prohibited from calculating or estimating any figure.
export function buildReportPrompt(
  session: AssessmentSession,
  reportData: ReportData,
  trace?: { sessionId: string }
): string {
  const s1 = session.stage1 ?? {}
  const gate = session.gate ?? {}
  const s2 = session.stage2 ?? {}
  const s3 = session.stage3 ?? {}
  const s4 = session.stage4 ?? {}

  // ── Read quantitative values exclusively from the frozen ReportData ──
  const {
    score,
    valuation,
    sba,
    transferability,
    drivers,
    detractors,
    growth,
    dealStructure,
    nextSteps,
    flags,
    meta,
    teaserValuation,
  } = reportData
  // methods[0] = SDE×multiple, [1] = revenue multiple, [2] = asset floor — always present
  const [mSde, mRev, mAsset] = valuation.methods as [
    (typeof valuation.methods)[0],
    (typeof valuation.methods)[0],
    (typeof valuation.methods)[0],
  ]
  const sdeMid = meta.sdeMidK * 1000
  const revMid = meta.revMidK * 1000
  const dimMap = Object.fromEntries(score.subscores.map((s) => [s.key, s.value]))
  const gradeLabel = { A: "A — Excellent", B: "B — Good", C: "C — Needs Preparation", D: "D — Early Stage" }[
    score.grade
  ]

  // ── Asking price context — uses frozen valuation values, not independent computation ──
  const numericAsk = parseAskingPrice(s4.askingPrice)
  let askingContext: string
  if (numericAsk === null) {
    askingContext = "Owner has no price in mind — an ideal opportunity to anchor at full market value."
  } else {
    const delta = ((numericAsk - valuation.mid) / valuation.mid) * 100
    if (delta > 30) {
      askingContext = `Owner expects ${fmt(numericAsk)}, which is ~${Math.round(delta)}% above the model range of ${fmt(valuation.lo)}–${fmt(valuation.hi)}. A diplomatic pricing conversation will be necessary.`
    } else if (delta < -20) {
      askingContext = `Owner expects ${fmt(numericAsk)}, which is ~${Math.round(Math.abs(delta))}% below the model range — they are likely undervaluing the business.`
    } else {
      askingContext = `Owner expects ${fmt(numericAsk)}, which falls within the model range of ${fmt(valuation.lo)}–${fmt(valuation.hi)}. Expectations are well-calibrated.`
    }
  }

  // ── SBA status string (derived from frozen sba.eligible + seller's self-report) ──
  const sbaVerdict =
    s3.sbaRestricted === "yes"
      ? "Not Eligible — owner self-reported a restricted industry category"
      : sba.eligible
        ? "Eligible"
        : "Not Eligible — exceeds size thresholds or industry restriction"

  // ── Qualitative answer formatting (these are labels, not computed numbers) ──
  const structureList = (s4.dealStructure ?? []).map((v) => DEAL_STRUCTURE_LABELS[v] ?? v).join(", ") || "Not specified"
  const ctaLine =
    s4.brokerStatus === "burned"
      ? "Schedule a free consultation — we help owners sell without brokers at exitiq.com"
      : s4.urgency === "asap" || gate.sellingTimeline === "already"
        ? "Join the waitlist for early marketplace access at exitiq.com"
        : "Subscribe for monthly Exit IQ updates as you prepare at exitiq.com"

  const ownerName = meta.name

  // ── Pre-format driver / detractor / growth / next-step blocks ──
  const driversBlock = drivers
    .map((d) => `  ${d.rank}. ${d.title}  |  Impact: ${d.impact}\n     ${d.detail}`)
    .join("\n")
  const detractorsBlock = detractors
    .map((d) => `  ${d.rank}. ${d.title}  |  Impact: ${d.impact}\n     ${d.detail}\n     Fix: ${d.fix}`)
    .join("\n")
  const growthBlock = growth.levers.map((g, i) => `  ${i + 1}. ${g.title}: ${g.detail}`).join("\n")
  const stepsBlock = nextSteps.map((s) => `  ${s.rank}. [${s.priority} — ${s.when}] ${s.title}`).join("\n")

  const prompt = `You are a senior sell-side M&A advisor at a boutique firm specializing in main-street and lower-middle-market business exits under $10M. You are authoring a personalized Exit IQ Report for ${ownerName}.

════════════════════════════════════════════════════════
ABSOLUTE PROHIBITION — READ BEFORE WRITING A SINGLE WORD
════════════════════════════════════════════════════════
You are FORBIDDEN from:
• Calculating, estimating, deriving, or inventing any numerical value
• Rounding any figure differently than shown in the registry below
• Contradicting, adjusting, or qualifying any number in the registry
• Inserting any dollar amount, score, percentage, or multiple not listed here

Your role is NARRATIVE ONLY. You interpret and explain what these frozen numbers mean for the seller. The numbers themselves are immutable. Think of this like a mail-merge: the data slots are already filled; you write the prose around them.

════════════════════════════════════════════════════════
LOCKED VARIABLE REGISTRY — copy these values verbatim
════════════════════════════════════════════════════════

EXIT IQ SCORE
  EXIT_IQ_SCORE   = ${score.composite} / 100
  EXIT_IQ_GRADE   = ${score.grade}  (${gradeLabel})
  DISTRESSED      = ${score.distressed ? "yes — treat sale context sensitively" : "no"}

DIMENSION SCORES (0–100, weights shown)
  DIM_FINANCIAL     = ${dimMap.financial ?? "N/A"}  (25%)
  DIM_OPERATIONAL   = ${dimMap.operational ?? "N/A"}  (25%)
  DIM_MARKET        = ${dimMap.market ?? "N/A"}  (20%)
  DIM_DEAL_READY    = ${dimMap.dealReadiness ?? "N/A"}  (15%)
  DIM_BUYER_ACCESS  = ${dimMap.buyerAccess ?? "N/A"}  (15%)

VALUATION — three independent methodologies (all pre-computed)
  INDUSTRY          = ${meta.industry}
  SDE_MIDPOINT      = ${fmt(sdeMid)}
  REV_MIDPOINT      = ${fmt(revMid)}

  Method 1 — SDE × Industry Multiple (PRIMARY for ${meta.industry})
    SDE_MULTI_LO    = ${meta.sdeMultiple[0]}×
    SDE_MULTI_HI    = ${meta.sdeMultiple[1]}×
    VAL_M1_LO       = ${fmt(mSde.lo)}
    VAL_M1_HI       = ${fmt(mSde.hi)}

  Method 2 — Revenue Multiple (SANITY REFERENCE — NOT signal-adjusted)
    REV_MULTI_LO    = ${meta.revenueMultiple[0]}×
    REV_MULTI_HI    = ${meta.revenueMultiple[1]}×
    VAL_M2_LO       = ${fmt(mRev.lo)}
    VAL_M2_HI       = ${fmt(mRev.hi)}
    NOTE: Static industry-median band. Does NOT move with recurring revenue,
    customer concentration, owner dependency, or any seller-specific signal.
    Use ONLY to confirm Method 1 sits within an industry corridor — never as
    a listing anchor and never as "upside" the seller can chase.

  Method 3 — Asset Floor (reference only)
    VAL_M3          = ${fmt(mAsset.lo)}  (25% of revenue)

  ★ BLENDED RECOMMENDED LISTING RANGE
    VALUATION_LO    = ${fmt(valuation.lo)}
    VALUATION_MID   = ${fmt(valuation.mid)}
    VALUATION_HI    = ${fmt(valuation.hi)}

  PRE-GATE ESTIMATE (shown to seller before submitting contact info)
    TEASER_LO       = ${fmt(teaserValuation.lo)}
    TEASER_HI       = ${fmt(teaserValuation.hi)}
    TEASER_SIGNALS  = "${teaserValuation.bridgeNote}"

  Asking price context: ${askingContext}

SBA 7(a) FINANCING
  SBA_VERDICT       = ${sbaVerdict}
  SBA_LOAN          = ${fmt(sba.loan)}
  SBA_DOWN          = ${fmt(sba.downPayment)}  (10%)
  SBA_MONTHLY       = ${fmt(sba.monthlyPayment)} / month  (10-yr term, ~10.5% APR)
  SBA_DSCR          = ${sba.dscr}×  (floor: ${sba.dscrFloor}×)
  SBA_BUYER_POOL    = ${sba.buyerPool}

TRANSFERABILITY
  TRANSFER_SCORE    = ${transferability.current} / 100
  TRANSFER_TARGET   = ${transferability.target} / 100  (achievable with documented ops)
  TRANSFER_IMPACT   = $${transferability.dollarImpact}K  (estimated dollar swing)
  TRANSFER_FIX      = "${transferability.fix}"

FLAGS IDENTIFIED (pre-classified — do not reclassify)
  Green (strengths):
${flags.green.length ? flags.green.map((f) => `    • ${f}`).join("\n") : "    • None identified"}
  Yellow (address before listing):
${flags.yellow.length ? flags.yellow.map((f) => `    • ${f}`).join("\n") : "    • None identified"}
  Red (deal risks):
${flags.red.length ? flags.red.map((f) => `    • ${f}`).join("\n") : "    • None identified"}

PRE-COMPUTED VALUE DRIVERS (titles and impact figures are locked)
${driversBlock}

PRE-COMPUTED VALUE DETRACTORS (titles, impact figures, and fix actions are locked)
${detractorsBlock}

PRE-COMPUTED GROWTH LEVERS
${growthBlock}

PRE-COMPUTED DEAL STRUCTURE RECOMMENDATION
  Primary:   ${dealStructure.primary.name}
             ${dealStructure.primary.detail}
  Secondary: ${dealStructure.secondary.name}
             ${dealStructure.secondary.detail}

PRE-COMPUTED NEXT STEPS (90-day checklist, priority-ordered)
${stepsBlock}

════════════════════════════════════════════════════════
SELLER'S QUALITATIVE ANSWERS (context only — not numbers)
════════════════════════════════════════════════════════

Seller:           ${ownerName}
Selling timeline: ${lbl(SELLING_TIMELINE_LABELS, gate.sellingTimeline)}
Segment tag:      ${gate.tag ?? "untagged"}

Stage 1 — Business Snapshot (all 10 UI answers live here or in stage2/3 below)
  Industry:        ${meta.industry}
  Years:           ${s1.years ?? "Not specified"}
  Facility type:   ${lbl(REAL_ESTATE_LABELS, s1.facilityType)}
  Revenue:         ${lbl(REVENUE_LABELS, s1.revenue)}
  SDE:             ${lbl(REVENUE_LABELS, s1.sde)}
  Financial docs:  ${lbl(DOC_LABELS, s1.docReadiness)}
  Employees:       ${lbl(EMPLOYEE_LABELS, s1.employees)}
  State:           ${s1.state ?? "Not specified"}

Stage 2 — Health Check (fields not collected in current 10-question flow show "Not specified")
  Owner dependency:       ${lbl(OWNER_DEP_LABELS, s2.ownerDependency)}
  Customer concentration: ${lbl(CUSTOMER_CONC_LABELS, s2.customerConcentration)}
  Revenue trend (3yr):    ${lbl(REVENUE_TREND_LABELS, s2.revenueTrend)}
  Recurring revenue:      ${lbl(RECURRING_LABELS, s2.recurringRevenue)}
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

════════════════════════════════════════════════════════
WRITING INSTRUCTIONS — use these exact ## section headers
════════════════════════════════════════════════════════

Output exactly 9 sections with these headers in this order:
  ## Executive Summary
  ## Valuation Analysis
  ## SBA 7(a) Eligibility
  ## Transferability Score
  ## Value Drivers
  ## Value Detractors
  ## Recommended Deal Structure
  ## Growth Levers
  ## Next Steps

Rules for every section:
• All numbers you write MUST match exactly a value from the LOCKED VARIABLE REGISTRY above.
• No number may be introduced that is not in the registry.
• Cite specific registry values (e.g. "your Exit IQ score of ${score.composite}/100") rather than paraphrasing.
• Tone: confident, direct, advisor-level. No hedging ("may", "could", "potentially").
• Add insight the owner doesn't already have — buyer perspective, market context, dollar implication.
• Do not re-state what the owner told you; interpret it for them.

# Exit IQ Report — ${ownerName}

## Executive Summary
4–5 sentences. First sentence: introduce this business to a sophisticated buyer — name the INDUSTRY, revenue band, SDE band, employee count, and years in one tight clause, then state what type of buyer it attracts and why. Second sentence: state EXIT_IQ_SCORE and EXIT_IQ_GRADE with the single most important insight for this exit. Third sentence: name the listing range VALUATION_LO–VALUATION_HI and the primary factor driving the spread. Final sentence: state the one action that would move the needle most before listing.

## Valuation Analysis
Open with exactly one sentence that confirms the recommended listing range VALUATION_LO–VALUATION_HI — the same range the seller saw on the pre-gate — and cites TEASER_SIGNALS as the factor(s) that explain why buyers will anchor toward VALUATION_LO rather than VALUATION_HI. Use the exact figures from the registry — no rounding differently. Do not narrate the range as "narrowed" or "refined" from a wider pre-gate estimate; the pre-gate already showed this exact band.

Then reference all three pre-computed methodologies as three separate paragraphs, each on its own line, separated by blank lines, in this exact format (preserve the bold pattern and the em-dash, and write one sentence of "why this matters for ${meta.industry}" after the bolded headline):

**Method 1 — SDE × Industry Multiple (${fmt(mSde.lo)}–${fmt(mSde.hi)}).** One sentence on why this is the primary methodology for ${meta.industry} businesses.

**Method 2 — Revenue Multiple (${fmt(mRev.lo)}–${fmt(mRev.hi)}).** One sentence that explicitly frames this as a static industry-median sanity reference — NOT adjusted for this seller's specific signals (recurring revenue, customer concentration, owner dependency do not move it) — used only to confirm Method 1 sits within a reasonable industry corridor. Do NOT describe Method 2 as "upside," "ceiling," "embedded value," or anything the seller can chase; it is a confirmation check, not a target.

**Method 3 — Asset Floor (${fmt(mAsset.lo)}).** One sentence framing this as the absolute floor / reference only.

After the three method paragraphs, state ${fmt(valuation.lo)}–${fmt(valuation.hi)} as the recommended listing range and explain what drives the spread. Include the asking price context: "${askingContext}". Close with 1–2 sentences on what specific improvements would move the multiple toward ${meta.sdeMultiple[1]}×.

## SBA 7(a) Eligibility
State the verdict: ${sbaVerdict}. ${sba.eligible && s3.sbaRestricted !== "yes" ? `Explain that a buyer can acquire with as little as ${fmt(sba.downPayment)} down at ${fmt(sba.monthlyPayment)}/month, and what this means for buyer pool size (${sba.buyerPool}). Note whether ${fmt(sdeMid)} SDE supports debt service on a ${fmt(sba.loan)} loan (DSCR ${sba.dscr}×, floor ${sba.dscrFloor}×).` : "Explain what financing path buyers will use instead and what that means for deal speed and buyer pool size."} One paragraph.

## Transferability Score
Operational Independence: ${transferability.current}/100. Write 3–4 sentences explaining what drives this specific score using the qualitative signals: owner dependency, SOPs, and long-tenured staff. Quantify the upside: reaching ${transferability.target}/100 with the fix described (${transferability.fix}) would unlock $${transferability.dollarImpact}K in additional deal value relative to the ${fmt(valuation.mid)} midpoint.

## Value Drivers
Use the 3 pre-computed driver titles and impact figures from the registry exactly as listed. Do NOT substitute or reorder. Format each as:
**[Driver title].** [Two sentences: first from the buyer's perspective, second on dollar or multiple implication. Reference the exact impact figure from the registry.]

## Value Detractors
Use the 3 pre-computed detractor titles, impact figures, and fix actions from the registry exactly as listed. Do NOT substitute or reorder. Format each as:
**[Detractor title].** [First sentence: what a buyer will say or discount for — use the exact impact figure. Second sentence: the fix action from the registry, stated as an imperative.]

## Recommended Deal Structure
Use the pre-computed deal structure above. Explain the rationale for the Primary structure in 2–3 sentences using specific numbers from the registry. Describe the Secondary structure in 1–2 sentences. Tailor language to this seller's urgency (${lbl(URGENCY_LABELS, s4.urgency)}) and the structures they are open to (${structureList}).

## Growth Levers
Open by referencing the owner's own words: "${s3.growthLevers ?? "not provided"}". Then expand on the 3 pre-computed growth levers using the titles and detail from the registry. Frame as buyer upside — premium buyers pay for identifiable, executable growth. 3–5 sentences total.

## Next Steps
Write exactly 3 numbered steps using the pre-computed next steps from the registry. Each step should be specific and actionable. Use the title and priority/when metadata from the registry. Step 3 must end with: "${ctaLine}."

---
*Report generated by Exit IQ — exitiq.com*`
  if (trace) {
    // Extract both count and actual titles — a title mismatch would be invisible from count alone
    const sectionHeaderTitles = ("\n" + prompt)
      .split("\n## ")
      .slice(1)
      .map((part) => {
        const nl = part.indexOf("\n")
        return nl === -1 ? part.trim() : part.slice(0, nl).trim()
      })
    appendWorkflowTrace({
      phase: "buildReportPrompt.built",
      surface: "server",
      sessionId: trace.sessionId,
      origin: "lib/ai/prompts",
      detail: {
        promptChars: prompt.length,
        sectionHeaderCount: sectionHeaderTitles.length,
        sectionHeaderTitles,
      },
    })
  }
  return prompt
}

// ─── DealIQ: listing extraction (Deal Inbox, item 5) ─────────────────────────
// TODO(content): placeholder wording — the content pass sharpens this prompt.
// Pure function so it is unit-testable and rewritable without touching the route.
export function buildDealExtractionPrompt(listing: string): string {
  return [
    "You are the Ingestion Agent for DealIQ, a buy-side tool that screens business-for-sale listings.",
    "Extract the structured facts of the listing below into the requested schema.",
    "",
    "Rules:",
    "- Report only what the listing states or directly implies. Never invent a figure.",
    "- `ask` and `claimedSde` are USD amounts as plain numbers (no separators, no currency symbols).",
    "- `highlights` restate the listing's own selling points, briefly (max 5).",
    "- `concerns` are risks visible in the listing text itself — concentration, owner dependency, missing costs (max 5).",
    "- Omit any optional field the listing does not support.",
    "",
    "LISTING:",
    listing,
  ].join("\n")
}
