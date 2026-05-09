export type StageQuestionType = "radio-cards" | "multi-checkbox" | "free-text" | "sba-check"

export interface StageOption {
  value: string
  label: string
  sub?: string
}

export interface StageQuestion {
  id: string
  headline: string
  sub?: string
  type: StageQuestionType
  options?: StageOption[]
  placeholder?: string
}

export type StageAnswer = string | string[]

// ─── Stage 2 — Health Check ───────────────────────────────────────────────────
export const STAGE2_QUESTIONS: StageQuestion[] = [
  {
    id: "ownerDependency",
    headline: "If you stepped away for 3 months, what would happen to revenue?",
    sub: "This is the single factor buyers weight most heavily.",
    type: "radio-cards",
    options: [
      {
        value: "everything_stops",
        label: "Everything stops",
        sub: "Revenue would drop significantly — I handle most things",
      },
      {
        value: "significant_impact",
        label: "Significant impact",
        sub: "Revenue would decline but the business wouldn't stop",
      },
      { value: "minor_impact", label: "Minor impact", sub: "Team mostly handles it with some supervision" },
      { value: "runs_independently", label: "Runs independently", sub: "Team handles day-to-day without me" },
    ],
  },
  {
    id: "customerConcentration",
    headline: "What percentage of revenue comes from your top 3 customers?",
    sub: "High concentration is the #2 concern for most buyers.",
    type: "radio-cards",
    options: [
      { value: "over_50", label: "Over 50%", sub: "Top 3 customers drive most of the business" },
      { value: "25_50", label: "25–50%", sub: "Meaningful but manageable concentration" },
      { value: "10_25", label: "10–25%", sub: "Well-diversified customer base" },
      { value: "under_10", label: "Under 10%", sub: "Highly diversified — minimal concentration risk" },
    ],
  },
  {
    id: "revenueTrend",
    headline: "Over the last 3 years, your revenue has...",
    sub: "Trend matters as much as the number.",
    type: "radio-cards",
    options: [
      { value: "grew_significantly", label: "Grown significantly", sub: "20%+ annual growth" },
      { value: "grew_slightly", label: "Grown slightly", sub: "5–20% annual growth" },
      { value: "flat", label: "Stayed flat", sub: "Within ±5%" },
      { value: "declined_slightly", label: "Declined slightly", sub: "5–20% decline" },
      { value: "declined_significantly", label: "Declined significantly", sub: "Over 20% decline" },
    ],
  },
  {
    id: "recurringRevenue",
    headline: "What percentage of revenue is recurring or contracted?",
    sub: "Recurring revenue is one of the highest value-add attributes.",
    type: "radio-cards",
    options: [
      { value: "over_75", label: "Over 75%", sub: "Mostly subscription or contract-based" },
      { value: "50_75", label: "50–75%", sub: "Strong recurring base with some project work" },
      { value: "25_50", label: "25–50%", sub: "Mixed model — recurring and transactional" },
      { value: "10_25", label: "10–25%", sub: "Mostly project or transactional" },
      { value: "under_10", label: "Under 10%", sub: "Almost entirely transactional revenue" },
    ],
  },
  {
    id: "docReadiness",
    headline: "Do you have clean financial statements for the last 3 years?",
    sub: "Tax returns, P&Ls, and balance sheets. 'Clean' means they match.",
    type: "radio-cards",
    options: [
      { value: "clean_docs", label: "Yes — clean and organized", sub: "Tax returns and P&Ls are ready to share" },
      { value: "partial_docs", label: "Partial — needs cleanup", sub: "We have docs but they need to be organized" },
      { value: "no_docs", label: "No — not prepared yet", sub: "I'd need to work with my CPA first" },
    ],
  },
  {
    id: "realEstate",
    headline: "Does the business own or lease its location?",
    type: "radio-cards",
    options: [
      {
        value: "owns_location",
        label: "We own the property",
        sub: "Real estate is included or can be sold separately",
      },
      {
        value: "long_term_lease",
        label: "Long-term lease (7+ years remaining)",
        sub: "Stable tenancy — buyers will be comfortable",
      },
      { value: "short_lease", label: "Short lease (under 7 years)", sub: "May need to renegotiate before listing" },
      { value: "no_fixed_location", label: "No fixed location", sub: "Remote, home-based, or mobile business" },
    ],
  },
  {
    id: "reasonForSelling",
    headline: "What's driving your interest in selling?",
    sub: "Buyers will ask — having a clear answer builds trust.",
    type: "radio-cards",
    options: [
      { value: "retirement", label: "Retirement", sub: "Ready to step back from the business" },
      { value: "burnout", label: "Burnout / lifestyle change", sub: "Ready for a new chapter" },
      { value: "new_opportunity", label: "New opportunity", sub: "Moving on to another venture" },
      { value: "health", label: "Health reasons" },
      { value: "partner_dispute", label: "Partner / ownership dispute" },
      { value: "struggling", label: "Business is struggling", sub: "Looking for a strategic exit" },
      { value: "exploring", label: "Just exploring options", sub: "Curious about what the business is worth" },
    ],
  },
]

// ─── Stage 3 — Buyer Lens ─────────────────────────────────────────────────────
export const STAGE3_QUESTIONS: StageQuestion[] = [
  {
    id: "sbaRestricted",
    headline: "Is your business in any of these restricted categories?",
    sub: "SBA 7(a) loans are unavailable for certain industries — we've pre-screened yours.",
    type: "sba-check",
    options: [
      { value: "no", label: "No — none of the above apply" },
      {
        value: "yes",
        label: "Yes — one or more apply",
        sub: "Cannabis, gambling, speculative investment, adult content, or political lobbying",
      },
    ],
  },
  {
    id: "keyPersonRisk",
    headline: "How many employees have been with you 3+ years?",
    sub: "Long-tenured staff signals stability and reduces transition risk for buyers.",
    type: "radio-cards",
    options: [
      { value: "none", label: "None", sub: "New team or high turnover" },
      { value: "one", label: "1 person", sub: "At least one key employee" },
      { value: "two_three", label: "2–3 people", sub: "A stable core team" },
      { value: "four_plus", label: "4 or more", sub: "Strong, tenured team — a major asset" },
    ],
  },
  {
    id: "sops",
    headline: "Are your operations documented in SOPs or process guides?",
    sub: "Documentation is the fastest way to improve your valuation.",
    type: "radio-cards",
    options: [
      { value: "fully_docs", label: "Yes — fully documented", sub: "Clear processes for all major workflows" },
      { value: "mostly_docs", label: "Mostly documented", sub: "Key processes written down, some gaps" },
      { value: "some_docs", label: "Some documentation", sub: "A few checklists or guides exist" },
      { value: "no_docs", label: "Nothing formal", sub: "Knowledge lives in my head" },
    ],
  },
  {
    id: "growthLevers",
    headline: "What's the most obvious way a new owner could grow this business?",
    sub: "Be candid — buyers love seeing unlocked potential. This is your chance to frame the upside.",
    type: "free-text",
    placeholder:
      "E.g., 'Add a second service truck and hire one technician — the demand is there. We're leaving 20% on the table every month.'",
  },
  {
    id: "legal",
    headline: "Any pending lawsuits, regulatory investigations, or compliance issues?",
    type: "radio-cards",
    options: [
      { value: "no_issues", label: "No — clean record", sub: "No known legal or regulatory exposure" },
      { value: "minor_resolved", label: "Had issues, now resolved", sub: "Past matters closed — no active exposure" },
      { value: "yes_issues", label: "Yes — active issues", sub: "We have pending matters to disclose" },
    ],
  },
]

// ─── Stage 4 — Goals ──────────────────────────────────────────────────────────
export const STAGE4_QUESTIONS: StageQuestion[] = [
  {
    id: "askingPrice",
    headline: "What asking price do you have in mind?",
    sub: "Round number is fine. We'll compare this to your estimated range.",
    type: "free-text",
    placeholder: "E.g., $1,200,000 — or type 'I have no idea'",
  },
  {
    id: "dealStructure",
    headline: "Which deal structures are you open to?",
    sub: "Select all that apply — flexibility expands your buyer pool.",
    type: "multi-checkbox",
    options: [
      { value: "seller_financing", label: "Seller financing" },
      { value: "sba_loan", label: "SBA loan" },
      { value: "earnout", label: "Earnout / performance payments" },
      { value: "all_cash", label: "All cash only" },
      { value: "dont_know", label: "I don't know yet" },
    ],
  },
  {
    id: "urgency",
    headline: "How urgent is the timeline for you?",
    type: "radio-cards",
    options: [
      { value: "asap", label: "As soon as possible", sub: "Ready to list now" },
      { value: "3_6mo", label: "3–6 months", sub: "Preparing to go to market soon" },
      { value: "6_12mo", label: "6–12 months", sub: "Taking time to prepare" },
      { value: "no_rush", label: "No rush", sub: "Exploring options at my own pace" },
    ],
  },
  {
    id: "brokerStatus",
    headline: "Have you worked with a broker before?",
    type: "radio-cards",
    options: [
      { value: "active_broker", label: "Yes — I have an active listing agent" },
      { value: "burned", label: "Yes — but it didn't work out", sub: "Broker relationship ended without a sale" },
      { value: "no_self", label: "No — I want to sell myself" },
      { value: "no_exploring", label: "No — just exploring my options" },
    ],
  },
]
