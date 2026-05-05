// All data constants for ExitIQ Engine

export interface Industry {
  label: string
  multiple: [number, number]
  color: string
  buyerLead: string
}

export interface YearOption {
  label: string
  key: string
  buyerConfidence: number
}

export interface RevenueRange {
  label: string
  mid: number
  brokerLow: number
  brokerHigh: number
}

export interface SDERange {
  label: string
  mid: number
}

export interface EmployeeOption {
  label: string
  count: number
  dots: number
  transferability: number
}

export interface BuyerCard {
  type: string
  icon: string
  base: string
  color: string
}

export interface RiskArea {
  label: string
  status: string
  desc: string
}

export interface SimpleOption {
  value: string
  label: string
  sub?: string
}

export const INDUSTRIES: Industry[] = [
  { label: "Restaurant / Food Service", multiple: [1.5, 3.0], color: "var(--peach)", buyerLead: "Operator buyers" },
  { label: "Retail (Brick & Mortar)", multiple: [1.5, 2.5], color: "var(--lavender)", buyerLead: "Strategic acquirers" },
  { label: "E-commerce / DTC", multiple: [2.5, 4.5], color: "var(--sky)", buyerLead: "Strategic & PE buyers" },
  { label: "Home Services", multiple: [2.5, 4.5], color: "var(--mint)", buyerLead: "PE-backed rollups" },
  { label: "Healthcare / Medical", multiple: [3.0, 5.0], color: "var(--sky)", buyerLead: "DSO / group buyers" },
  { label: "Dental / Optometry", multiple: [3.5, 6.0], color: "var(--mint)", buyerLead: "DSO acquirers" },
  { label: "Auto Services", multiple: [2.5, 4.0], color: "var(--lavender)", buyerLead: "Regional rollups" },
  { label: "Beauty / Wellness", multiple: [2.0, 3.5], color: "var(--peach)", buyerLead: "Operator buyers" },
  { label: "Childcare / Education", multiple: [2.0, 4.0], color: "var(--sky)", buyerLead: "PE & strategic" },
  { label: "Professional Services", multiple: [2.5, 4.0], color: "var(--lavender)", buyerLead: "Strategic buyers" },
  { label: "Financial Services", multiple: [3.0, 5.0], color: "var(--mint)", buyerLead: "RIA consolidators" },
  { label: "Manufacturing", multiple: [3.0, 5.0], color: "var(--sky)", buyerLead: "PE & strategics" },
  { label: "Construction / Trades", multiple: [2.0, 3.5], color: "var(--lavender)", buyerLead: "Operator buyers" },
  { label: "Landscaping / Grounds", multiple: [2.5, 4.5], color: "var(--mint)", buyerLead: "PE-backed rollups" },
  { label: "Tech / SaaS", multiple: [4.0, 8.0], color: "var(--sky)", buyerLead: "Strategic & PE buyers" },
  { label: "Fitness / Gym", multiple: [2.0, 3.5], color: "var(--peach)", buyerLead: "Franchise rollups" },
  { label: "Staffing / Recruiting", multiple: [2.5, 4.0], color: "var(--lavender)", buyerLead: "PE consolidators" },
  { label: "Specialty Retail", multiple: [2.0, 3.5], color: "var(--peach)", buyerLead: "Strategic acquirers" },
]

export const YEAR_OPTIONS: YearOption[] = [
  { label: "Under 2 years", key: "under2", buyerConfidence: 0.38 },
  { label: "2 – 5 years", key: "2to5", buyerConfidence: 0.58 },
  { label: "5 – 10 years", key: "5to10", buyerConfidence: 0.76 },
  { label: "10+ years", key: "10plus", buyerConfidence: 0.9 },
]

export const REVENUE_RANGES: RevenueRange[] = [
  { label: "Under $250K", mid: 175000, brokerLow: 17500, brokerHigh: 30000 },
  { label: "$250K – $500K", mid: 375000, brokerLow: 37500, brokerHigh: 60000 },
  { label: "$500K – $1M", mid: 750000, brokerLow: 75000, brokerHigh: 120000 },
  { label: "$1M – $3M", mid: 2000000, brokerLow: 200000, brokerHigh: 360000 },
  { label: "$3M – $10M", mid: 5000000, brokerLow: 500000, brokerHigh: 1200000 },
  { label: "$10M+", mid: 12000000, brokerLow: 1200000, brokerHigh: 1440000 },
]

export const SDE_RANGES: SDERange[] = [
  { label: "Under $100K", mid: 75000 },
  { label: "$100K – $250K", mid: 175000 },
  { label: "$250K – $500K", mid: 375000 },
  { label: "$500K – $1M", mid: 750000 },
  { label: "$1M+", mid: 1250000 },
]

export const EMPLOYEE_OPTIONS: EmployeeOption[] = [
  { label: "Just me", count: 1, dots: 1, transferability: 0.4 },
  { label: "2 – 5", count: 3, dots: 4, transferability: 0.62 },
  { label: "6 – 15", count: 8, dots: 9, transferability: 0.74 },
  { label: "16 – 50", count: 25, dots: 16, transferability: 0.83 },
  { label: "50+", count: 60, dots: 25, transferability: 0.9 },
]

export const OWNER_ROLE_OPTIONS: SimpleOption[] = [
  { value: "operator", label: "Day-to-day operator", sub: "I run everything — open to close" },
  { value: "partial", label: "Partially involved", sub: "I manage the team and handle key relationships" },
  { value: "mostly_hands_off", label: "Mostly hands-off", sub: "Strong team in place, I step back regularly" },
  { value: "passive", label: "Silent / investor role", sub: "Fully passive — minimal day-to-day involvement" },
]

export const REVENUE_TREND_OPTIONS: SimpleOption[] = [
  { value: "growing_fast", label: "Growing 20%+ annually", sub: "Strong upward momentum" },
  { value: "growing", label: "Growing 5–20% annually", sub: "Steady positive trajectory" },
  { value: "flat", label: "Flat — within ±5%", sub: "Stable and consistent" },
  { value: "declining_slight", label: "Declining 5–20%", sub: "Some softness in recent years" },
  { value: "declining_fast", label: "Declining 20%+", sub: "Meaningful revenue headwinds" },
]

export const CUSTOMER_CONC_OPTIONS: SimpleOption[] = [
  { value: "diversified", label: "Top customer is <10% of revenue", sub: "Highly diversified — minimal concentration risk" },
  { value: "moderate", label: "10–25% from top customer", sub: "Well-diversified customer base" },
  { value: "concentrated", label: "25–50% from top customer", sub: "Manageable but buyers will flag this" },
  { value: "high_risk", label: "50%+ from top customer", sub: "High concentration — significant buyer discount" },
]

export const KEY_MAN_OPTIONS: SimpleOption[] = [
  { value: "1", label: "1 — Everything runs through me", sub: "Buyers will apply a significant discount" },
  { value: "2", label: "2 — Most key relationships are mine", sub: "Some team depth, but I'm still the center" },
  { value: "3", label: "3 — Shared between me and the team", sub: "Balanced — buyers will see manageable transition risk" },
  { value: "4", label: "4 — Team handles most of it", sub: "Good depth — buyers view this as a strength" },
  { value: "5", label: "5 — Fully team-driven operations", sub: "Exceptional — commands a premium in the market" },
]

export const RECURRING_REV_OPTIONS: SimpleOption[] = [
  { value: "high", label: "Over 75% recurring or contracted", sub: "Mostly subscription or contract-based" },
  { value: "medium_high", label: "50–75% recurring", sub: "Strong recurring base with some project work" },
  { value: "medium", label: "25–50% recurring", sub: "Mixed model — recurring and transactional" },
  { value: "low", label: "Under 25% recurring", sub: "Mostly transactional or project-based revenue" },
]

export const US_STATES: string[] = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
]

export const HOT_STATES: string[] = [
  "California", "Texas", "Florida", "New York", "Georgia", "Illinois",
  "Colorado", "Arizona", "Washington", "North Carolina",
]

export const BUYER_CARDS: BuyerCard[] = [
  { type: "SBA-backed operator", icon: "◉", base: "high", color: "var(--mint)" },
  { type: "Local strategic buyer", icon: "◎", base: "medium", color: "var(--lavender)" },
  { type: "Acquisition entrepreneur", icon: "◈", base: "medium", color: "var(--sky)" },
  { type: "Institutional buyer", icon: "○", base: "low", color: "var(--t4)" },
]

export const RADAR_AXES: string[] = [
  "Valuation",
  "Buyer Demand",
  "Financials",
  "Independence",
  "Market Timing",
  "Deal Structure",
]

// 11 values: index 0–10 answers answered
export const CONFIDENCE_BY_STEP: number[] = [0, 10, 20, 32, 44, 56, 66, 74, 80, 85, 90]

export const INSIGHTS: Record<string, Record<string, string> | ((s: string) => string)> = {
  industry: {
    "Restaurant / Food Service":
      "Restaurant M&A is active. Operator buyers dominate — location, lease terms, and trailing revenue are the key value signals.",
    "Retail (Brick & Mortar)":
      "Brick-and-mortar retail exits are increasingly driven by omnichannel integration value. Strategic consolidators are actively acquiring.",
    "E-commerce / DTC":
      "DTC brand M&A is surging. Buyers prize customer LTV, repeat purchase rate, and margin profile. Multiple expansion at strong cohorts.",
    "Home Services":
      "PE-backed rollup activity in home services is at a 5-year high. Recurring revenue commands premium multiples.",
    "Healthcare / Medical":
      "Medical practice M&A sees some of the highest multiples in the lower-middle market. DSO and group structures are competing actively.",
    "Dental / Optometry":
      "Dental and optometry are among the most competitive acquisition targets in healthcare. DSO consolidation is aggressive.",
    "Auto Services":
      "Auto services M&A is consolidating rapidly. Regional rollup buyers prioritize location density and service mix.",
    "Beauty / Wellness":
      "Wellness businesses with membership models attract franchise rollup and operator buyers. Recurring revenue is the key multiple driver.",
    "Childcare / Education":
      "Childcare and education assets attract both PE and strategic buyers. Licensed capacity and staff retention are the primary value signals.",
    "Professional Services":
      "Services firms with transferable client relationships and documented workflows exit at 2.5–4× SDE.",
    "Financial Services":
      "RIA consolidation is at an all-time high. AUM retention and fee structure drive valuation — clean compliance record is non-negotiable.",
    "Manufacturing":
      "Manufacturing businesses with proprietary processes attract PE and strategic buyers at 3–5× SDE. Recurring customers are key.",
    "Construction / Trades":
      "Licensed trades businesses are in high demand. Buyer focus is on backlog quality, bonding capacity, and crew retention.",
    "Landscaping / Grounds":
      "Landscaping PE rollups are aggressively acquiring in most major markets. Recurring contract revenue commands 4× or better.",
    "Tech / SaaS":
      "SaaS multiples are the highest in lower-middle market. Net revenue retention and churn are the primary value drivers.",
    "Fitness / Gym":
      "Fitness assets are recovering strongly. Franchise rollup buyers and regional operators are both active.",
    "Staffing / Recruiting":
      "Staffing M&A is active. PE consolidators prize recurring client relationships and gross margin above all else.",
    "Specialty Retail":
      "Specialty retail buyers look for defensible niches, loyal customer bases, and proprietary product mix.",
  },
  years: {
    "Under 2 years":
      "Early-stage businesses require a strong growth narrative. Buyers will weight your trajectory over historical revenue.",
    "2 – 5 years":
      "Two to five years demonstrates proof of concept. Consistent growth and retention data are your primary value signals.",
    "5 – 10 years":
      "Five-plus years of operation significantly reduces buyer risk perception. Premium multiples are achievable.",
    "10+ years":
      "A decade-plus track record commands the strongest buyer confidence. Resilience through economic cycles is a premium signal.",
  },
  ownerRole: {
    operator:
      "Owner-operators command loyal businesses — but buyers will carefully model the transition risk. A clear handover plan is essential.",
    partial:
      "Partial involvement is common and manageable. Documenting your team's responsibilities now accelerates buyer confidence.",
    mostly_hands_off:
      "Strong signal. A business that runs without constant owner oversight is exactly what sophisticated buyers want to acquire.",
    passive:
      "Passive ownership is the highest-value transfer profile. Your multiple ceiling is meaningfully higher than operator-run peers.",
  },
  revenue: {
    "Under $250K":
      "At this revenue level, individual acquirers and SBA-backed buyers are the primary market. Seller financing increases deal velocity.",
    "$250K – $500K":
      "This range attracts both individual buyers and search fund investors. Clean financials are the critical differentiator.",
    "$500K – $1M":
      "Your revenue matches 68% of active buyer mandates in Q2. Strong market fit across multiple buyer types.",
    "$1M – $3M":
      "This revenue band activates PE interest. Multiple buyer types are now competing for deals of this scale.",
    "$3M – $10M":
      "Lower-middle market — both PE and strategic acquirers are competing actively. Proprietary process drives the premium.",
    "$10M+": "Top-tier revenue. Institutional capital and strategic acquirers are actively engaged at this scale.",
  },
  sde: {
    "Under $100K":
      "This SDE level limits the buyer pool to owner-operators. A strong growth story and seller financing are key to a clean exit.",
    "$100K – $250K":
      "This SDE qualifies for SBA financing — significantly expanding your buyer pool. Deal structures often include earnouts.",
    "$250K – $500K":
      "Strong SDE. This profile attracts search fund operators and strategic buyers. Seller financing accelerates deal velocity.",
    "$500K – $1M": "Exceptional SDE. Premium multiples are achievable. PE firms enter your buyer pool at this level.",
    "$1M+":
      "Top-decile SDE. Institutional capital is engaged. Your business qualifies for competitive multi-buyer processes.",
  },
  revenueTrend: {
    growing_fast:
      "20%+ growth is a powerful buyer signal. Growing businesses command multiple expansion — buyers are paying for future earnings, not just trailing SDE.",
    growing:
      "Steady growth in the 5–20% range is exactly what most buyers look for. This profile supports premium multiples and competitive deal processes.",
    flat:
      "Flat revenue is neutral. Buyers won't penalize stability, but they'll look harder at margin, retention, and operational moats.",
    declining_slight:
      "Moderate decline narrows your buyer pool and compresses multiples. A clear explanation and operational plan are critical to maintaining valuation.",
    declining_fast:
      "Significant revenue decline materially impacts valuation. Buyers will price in risk heavily — a strong narrative and seller financing become essential tools.",
  },
  customerConc: {
    diversified:
      "Highly diversified revenue is one of the strongest buyer signals. No single-customer dependency means lower perceived risk and higher multiples.",
    moderate:
      "Moderate concentration is manageable. Buyers will review customer contract terms and tenure — long relationships offset the concentration.",
    concentrated:
      "Meaningful concentration will be flagged in diligence. Buyers will discount the multiple and often structure earnouts tied to customer retention post-close.",
    high_risk:
      "High customer concentration is the #2 concern for most buyers after owner dependency. Expect a meaningful multiple discount and complex deal structuring.",
  },
  employees: {
    "Just me":
      "Solo-operated businesses carry elevated owner-dependency risk. A documented transition plan significantly improves buyer confidence.",
    "2 – 5":
      "Small team — buyers will assess key-person risk carefully. Clear role documentation increases transferability and multiple.",
    "6 – 15": "A team of 6–15 signals operational maturity. Buyers value this depth for post-acquisition continuity.",
    "16 – 50":
      "Mid-scale team reduces transition risk significantly. This headcount range is attractive to both operator and PE buyers.",
    "50+":
      "Enterprise-scale team. Strong operational infrastructure is a significant value driver for institutional acquirers.",
  },
  keyMan: {
    "1": "Maximum key-man risk — buyers will apply a meaningful discount and push hard for a long transition period or earnout.",
    "2": "Elevated key-person dependency. Documenting your relationships and processes now is the fastest path to multiple improvement.",
    "3": "Balanced. Buyers see manageable transition risk. Team documentation and client introduction plans close the gap.",
    "4": "Strong team depth. Buyers at this level are more confident in post-close continuity — a genuine value driver.",
    "5": "Exceptional. A fully team-driven operation is the most transferable business profile and commands a premium in the market.",
  },
  recurringRev: {
    high: "Over 75% recurring revenue is the highest-value profile in the market. Buyers pay a meaningful premium for predictable contracted cash flows.",
    medium_high:
      "Strong recurring base. Buyers prize this — your blended multiple is materially higher than comparable transactional businesses.",
    medium:
      "Mixed revenue model. Highlight the recurring component clearly in your materials — buyers will weight it heavily in their offer.",
    low: "Predominantly transactional revenue compresses multiples. Consider restructuring offerings toward retainer or service contracts before going to market.",
  },
  state: (s: string) => {
    const hot = HOT_STATES.includes(s)
    return hot
      ? `${s} is one of the most active M&A markets in the country. Elevated buyer density and shorter deal timelines are typical in this region.`
      : `Geographic market signal activated for ${s}. Regional buyer demand and deal velocity data have been integrated into your profile.`
  },
}

export const RECALC_MESSAGES: Record<string, string> = {
  industry: "Mapping industry buyer demand…",
  years: "Adjusting buyer confidence signal…",
  ownerRole: "Modeling ownership transfer risk…",
  revenue: "Calculating valuation baseline…",
  sde: "Modeling SDE multiple range…",
  revenueTrend: "Factoring revenue trajectory…",
  customerConc: "Analyzing concentration risk…",
  employees: "Updating transferability signal…",
  keyMan: "Calibrating key-man dependency…",
  recurringRev: "Applying recurring revenue premium…",
}

// 10 questions across 3 phases
export const ANSWER_KEYS = [
  "industry",     // Phase 1: Business Identity
  "years",
  "ownerRole",
  "revenue",      // Phase 2: Financial Snapshot
  "sde",
  "revenueTrend",
  "customerConc",
  "employees",    // Phase 3: Operational Profile
  "keyMan",
  "recurringRev",
] as const
export type AnswerKey = (typeof ANSWER_KEYS)[number]
