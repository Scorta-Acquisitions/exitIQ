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

export const INDUSTRIES: Industry[] = [
  { label: "Restaurant", multiple: [1.5, 3.0], color: "#f4c5a8", buyerLead: "Operator buyers" },
  { label: "Retail", multiple: [2.0, 3.5], color: "#c8b8e0", buyerLead: "Strategic acquirers" },
  { label: "Home Services", multiple: [2.5, 4.0], color: "#a7e5d3", buyerLead: "PE-backed rollups" },
  { label: "Medical", multiple: [3.0, 5.0], color: "#a8c8e8", buyerLead: "DSO / group buyers" },
  { label: "Manufacturing", multiple: [3.0, 5.0], color: "#a8c8e8", buyerLead: "PE & strategics" },
  { label: "Professional Services", multiple: [2.5, 4.0], color: "#c8b8e0", buyerLead: "Strategic buyers" },
  { label: "Other", multiple: [2.0, 3.5], color: "#a7e5d3", buyerLead: "Individual acquirers" },
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

export const US_STATES: string[] = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

export const HOT_STATES: string[] = [
  "California",
  "Texas",
  "Florida",
  "New York",
  "Georgia",
  "Illinois",
  "Colorado",
  "Arizona",
  "Washington",
  "North Carolina",
]

export const BUYER_CARDS: BuyerCard[] = [
  { type: "SBA-backed operator", icon: "◉", base: "high", color: "#a7e5d3" },
  { type: "Local strategic buyer", icon: "◎", base: "medium", color: "#c8b8e0" },
  { type: "Acquisition entrepreneur", icon: "◈", base: "medium", color: "#a8c8e8" },
  { type: "Institutional buyer", icon: "○", base: "low", color: "rgba(245,245,245,.25)" },
]

export const RADAR_AXES: string[] = [
  "Valuation",
  "Buyer Demand",
  "Financials",
  "Independence",
  "Market Timing",
  "Deal Structure",
]

export const CONFIDENCE_BY_STEP: number[] = [0, 12, 26, 44, 64, 76, 86]

export const INSIGHTS: Record<string, Record<string, string> | ((s: string) => string)> = {
  industry: {
    Restaurant:
      "Restaurant M&A is active. Operator buyers dominate — location, lease terms, and trailing revenue are the key value signals.",
    Retail:
      "Retail exits are increasingly driven by omnichannel integration value. Strategic consolidators are actively acquiring.",
    "Home Services":
      "PE-backed rollup activity in home services is at a 5-year high. Recurring revenue commands premium multiples.",
    Medical:
      "Medical practice M&A sees some of the highest multiples in lower-middle market. DSO and group structures are competing actively.",
    Manufacturing:
      "Manufacturing businesses with proprietary processes attract PE and strategic buyers at 3–5× SDE. Recurring customers are key.",
    "Professional Services":
      "Services firms with transferable client relationships and documented workflows exit at 2.5–4× SDE.",
    Other: "Your business profile will be matched against current buyer demand across multiple active sectors.",
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
  revenue: "Calculating valuation baseline…",
  sde: "Modeling SDE multiple range…",
  employees: "Updating transferability signal…",
  state: "Activating geographic market data…",
}

export const ANSWER_KEYS = ["industry", "years", "revenue", "sde", "employees", "state"] as const
export type AnswerKey = (typeof ANSWER_KEYS)[number]
