/**
 * The How it works page's copy: the eight-stage sale roadmap and the words the scene sets around the
 * stages, the reconciliation example under it, the four hard parts, and the timing rows.
 */

import { FINANCIAL_TITLE } from "@/lib/site/financial/data"

/** The roadmap scene's own words: its eyebrow, its column labels, the scroll hint, and the still note. */
export const STAGES_SCENE_COPY = {
  eyebrow: "The eight stages",
  /**
   * Shown only under reduced motion. The scene renders no controls, so the note says only what is true:
   * this is the same information as a still (the clause that promised controls was cut, 2026-09-17).
   */
  stillNote: "The same information, shown without animation.",
  /** The prefix on the line of what Heirloom does; the trailing space sets it off from the sentence. */
  heirloom: "HEIRLOOM · ",
  you: "YOU",
  receive: "YOU RECEIVE",
  tally: "IN YOUR HANDS",
  hint: "Scroll to move through the stages.",
} as const

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

/** One of the four records that disagree, as the reconciliation prints it. */
export interface ReconciliationRecord {
  name: string
  note: string
  value: string
}

/** A row of what the resolved figure updates: what it reads while the advisor is still reviewing, and after. */
export interface ReconciliationRow {
  label: string
  open: string
  resolved: string
}

/**
 * The reconciliation example on How it works (`BusinessBrain`), which prints the same Project Ridgeline
 * owner-compensation figures the home page's financial demo plays: $186,400 of officer compensation on the
 * return against $214,000 on the payroll register, the $27,600 of family payroll between them, and the
 * adjusted earnings that move from $817,400 to $845,000 once the advisor records the resolution.
 * `lib/site/__tests__/content-stages.test.ts` pins every string and checks the figures against
 * `lib/site/financial/data.ts`.
 */
export const RECONCILIATION = {
  heading: FINANCIAL_TITLE,
  intro:
    "The books, payroll, tax return, and your own explanation often disagree. Your advisor records the resolution and the evidence for it, and every buyer document, lender package, and diligence answer uses that figure.",
  subject: "Owner compensation · Project Ridgeline",
  statusOpen: "Advisor review required",
  statusResolved: "Resolved by the advisor",
  recordsTitle: "The records disagree",
  records: [
    { name: "Books", note: "QuickBooks · officer compensation", value: "$186,400" },
    { name: "Payroll", note: "Payroll register, including a family member with no recorded hours", value: "$214,000" },
    { name: "Tax return", note: "Filed return, provided by the accountant", value: "$186,400" },
    { name: "Owner explanation", note: "Working conversation, March", value: "$214,000" },
  ] as ReconciliationRecord[],
  resolveLabel: "Show the resolution →",
  resolutionTitle: "Resolution, recorded with support",
  resolution: "$214,000, including $27,600 of documented family payroll with no recorded hours.",
  resolutionSupport: "Support: Payroll register and tax return attached",
  resetLabel: "Reset example",
  updatedTitle: "Updated in",
  rows: [
    { label: "Owner compensation adjustment", open: "On hold", resolved: "$27,600, documented" },
    { label: "Adjusted earnings", open: "$817,400", resolved: "$845,000" },
    { label: "Valuation", open: "$2.86M – $3.38M", resolved: "$2.96M – $3.49M" },
    { label: "Buyer materials", open: "On hold", resolved: "Updated" },
    { label: "Lender package", open: "On hold", resolved: "Updated" },
    { label: "Diligence answers", open: "On hold", resolved: "Updated" },
  ] as ReconciliationRow[],
  buyerQuestion: "Buyer question: Why is owner compensation adjusted to $214,000?",
  /** What the buyer answer reads before the advisor has resolved the figure; the page sets it in italics. */
  answerPending: "Advisor review required.",
  answer:
    "The tax return reports $186,400 of officer compensation. Payroll records show another $27,600 paid to a family member with no recorded hours. Both amounts are included in the adjustment, with the payroll lines attached for review.",
  answerSupport: "Support: payroll register and tax return attached",
} as const
