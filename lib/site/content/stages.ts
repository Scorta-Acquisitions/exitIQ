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
    title: "Understand your goals",
    heirloom:
      "We learn the business, your timing, the outcome you want, your privacy rules, and any buyers you want excluded.",
    you: "Join one working conversation and introduce the approved accountant, bookkeeper, or other information contacts.",
    receive: "A sale plan and focused information request.",
    artifact: "Sale plan",
  },
  {
    label: "Numbers",
    title: "Get the numbers ready",
    heirloom:
      "We organize the books, tax returns, payroll, owner adjustments, customer concentration, contracts, and lender questions before market.",
    you: "Explain the items only you can explain. We work directly with approved professionals for the rest.",
    receive: "Adjusted financials and support for the earnings presented to buyers.",
    artifact: "Financials",
  },
  {
    label: "Value",
    title: "Value and position the business",
    heirloom: "We set a defensible valuation range, identify the strongest buyer case, and prepare the sale materials.",
    you: "Review the facts and approve how the business is presented.",
    receive: "Valuation, anonymous overview, and full buyer materials.",
    artifact: "Valuation",
  },
  {
    label: "Privacy",
    title: "Set the privacy rules",
    heirloom: "We turn your exclusions and disclosure choices into rules for outreach and buyer access.",
    you: "Approve the rules once and decide only genuine exceptions.",
    receive: "A buyer plan and clear disclosure boundaries.",
    artifact: "Access rules",
  },
  {
    label: "Market",
    title: "Build the buyer market",
    heirloom:
      "We research likely acquirers, contact them without naming the business, and screen for fit, interest, and ability to close.",
    you: "Nothing until serious buyers are ready.",
    receive: "A qualified group of prospective buyers.",
    artifact: "Buyer group",
  },
  {
    label: "Meetings",
    title: "Meet serious buyers",
    heirloom: "We answer routine questions, prepare you for each meeting, and keep the process competitive.",
    you: "Meet the buyers you choose and judge their fit for the company.",
    receive: "Buyer meetings and written indications of interest.",
    artifact: "Indications",
  },
  {
    label: "Offers",
    title: "Compare and negotiate offers",
    heirloom:
      "We compare full economics, financing, conditions, transition, and closing risk, then negotiate around your priorities.",
    you: "Choose the offer and approve the major terms.",
    receive: "A negotiated letter of intent.",
    artifact: "Signed LOI",
  },
  {
    label: "Close",
    title: "Complete diligence, financing, and closing",
    heirloom:
      "We coordinate the buyer, lender, lawyers, accountants, and specialists, defend the deal against late price cuts, and keep alternatives available when practical.",
    you: "Answer the few questions only you can answer and approve the final documents.",
    receive: "A completed ownership transfer.",
    artifact: "Ownership transfer",
  },
]

export const HARD_PARTS: Array<{ title: string; body: string }> = [
  {
    title: "The buyer's lender says no",
    body: "We review financing readiness before serious buyer meetings and keep other qualified buyers engaged when practical. If one lender or buyer fails, the sale has somewhere to go.",
  },
  {
    title: "Diligence finds a problem",
    body: "We look for accounting gaps, customer concentration, lease issues, unsupported owner adjustments, and missing contracts before market. A problem found early can be explained and addressed before it becomes a late price cut.",
  },
  {
    title: "The buyer tries to lower the price",
    body: "We compare the stated reason with the records, challenge unsupported changes, and return to alternative buyers when the process still supports it.",
  },
  {
    title: "You change your mind",
    body: "We stop outreach, revoke buyer access, tell buyers only that the owner withdrew, and follow the retention rules in your agreement. The decision remains yours.",
  },
]

export const TIMING_ROWS: Array<[string, string]> = [
  ["Preparation", "Front-loaded before buyer outreach"],
  ["Buyer process", "Driven by market interest and the quality of the business"],
  ["Diligence and financing", "Coordinated in parallel where practical"],
  ["Closing", "Managed against one shared list of conditions and owners"],
]
