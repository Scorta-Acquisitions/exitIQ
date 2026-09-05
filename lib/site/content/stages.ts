/** The eight-stage sale roadmap shown on How it works. */

export interface SaleStage {
  label: string
  title: string
  heirloom: string
  you: string
  receive: string
  artifact: string
}

export const SALE_STAGES: SaleStage[] = [
  {
    label: "Goals",
    title: "Your goals and timing",
    heirloom: "We learn the business, your timing, the outcome you want, and any buyers to exclude.",
    you: "Join one working conversation and introduce your accountant or bookkeeper.",
    receive: "A sale plan and information request.",
    artifact: "Sale plan",
  },
  {
    label: "Numbers",
    title: "Prepare the numbers",
    heirloom:
      "We organize the books, tax returns, payroll, owner adjustments, customer concentration, and contracts before market.",
    you: "Explain the items only you can explain.",
    receive: "Adjusted financials with support for the earnings shown to buyers.",
    artifact: "Financials",
  },
  {
    label: "Value",
    title: "Valuation and materials",
    heirloom: "We set a valuation range and prepare the anonymous overview and buyer materials.",
    you: "Approve how the business is presented.",
    receive: "Valuation, anonymous overview, and buyer materials.",
    artifact: "Valuation",
  },
  {
    label: "Privacy",
    title: "Privacy rules",
    heirloom: "We turn your exclusions and disclosure choices into rules for outreach and buyer access.",
    you: "Approve the rules once. Afterward you decide only exceptions.",
    receive: "A buyer plan and disclosure rules.",
    artifact: "Access rules",
  },
  {
    label: "Market",
    title: "Buyer market",
    heirloom:
      "We research likely acquirers, contact them without naming the business, and screen for fit and ability to close.",
    you: "Nothing until qualified buyers are ready.",
    receive: "A qualified group of buyers.",
    artifact: "Buyer group",
  },
  {
    label: "Meetings",
    title: "Buyer meetings",
    heirloom: "We answer routine questions and prepare you for each meeting.",
    you: "Meet the buyers you choose.",
    receive: "Written indications of interest.",
    artifact: "Indications",
  },
  {
    label: "Offers",
    title: "Compare the offers",
    heirloom:
      "We compare each offer’s economics, financing, conditions, and closing risk, then negotiate around your priorities.",
    you: "Choose the offer and approve the major terms.",
    receive: "A negotiated letter of intent.",
    artifact: "Signed LOI",
  },
  {
    label: "Close",
    title: "Diligence, financing, and closing",
    heirloom: "We coordinate the buyer, lender, lawyers, and accountants, and push back on late price cuts.",
    you: "Answer the questions only you can answer and approve the final documents.",
    receive: "A completed ownership transfer.",
    artifact: "Ownership transfer",
  },
]

export const HARD_PARTS: Array<{ title: string; body: string }> = [
  {
    title: "The buyer's lender says no",
    body: "We check financing readiness before meetings and keep other qualified buyers engaged where practical.",
  },
  {
    title: "Diligence finds a problem",
    body: "We look for accounting gaps, customer concentration, lease issues, and unsupported adjustments before market, so they are explained before they become a price cut.",
  },
  {
    title: "The buyer tries to lower the price",
    body: "We compare the stated reason with the records, challenge unsupported changes, and return to other buyers when the process supports it.",
  },
  {
    title: "You change your mind",
    body: "We stop outreach, revoke buyer access, tell buyers only that the owner withdrew, and follow the retention rules in your agreement.",
  },
]

export const TIMING_ROWS: Array<[string, string]> = [
  ["Preparation", "Before buyer outreach"],
  ["Buyer process", "Depends on buyer interest and the business"],
  ["Diligence and financing", "Run in parallel where practical"],
  ["Closing", "One shared list of conditions and owners"],
]
