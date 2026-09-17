/**
 * Project Ridgeline worked-example figures (fictional). The financial demo plays Ridgeline's adjustment
 * schedule as it was settled: four lines where the books, the tax return and the payroll disagreed, each
 * one ending with a record attached, and one adjusted-earnings figure the valuation, the buyer materials,
 * the lender package and the diligence answers all read.
 *
 * Every figure reconciles: 845,000 − 27,600 − 9,400 − 12,800 = 795,200 of adjusted earnings that never
 * needed an adjustment, and 845,000 − 27,600 = 817,400 with the family payroll left in costs. The revenue
 * timing ($22,000) is explained, never counted, so it moves no figure at all.
 */

import type { DemoWords } from "@/lib/site/demo/chrome"

/** The section's heading, and the name the how-it-works reconciliation and the demo's label carry. */
export const FINANCIAL_TITLE = "Financial preparation"

/** The few words beside the screen: heading and sentence, no eyebrow, held to `DEMO_WORD_CAPS` by the tests. */
export const FINANCIAL_WORDS: DemoWords = {
  heading: FINANCIAL_TITLE,
  sentence:
    "Before any buyer sees the business, we reconcile the books, tax returns, and payroll. Buyers, lenders, and diligence all get the same figures.",
}

/** The one link under the words: the full reconciliation on the how-it-works page. */
export const FINANCIAL_LINK_LABEL = "How the reconciliation works"

/** Adjusted earnings before any of the four lines is settled: the figure the demo opens on. */
export const RIDGELINE_BASE = 795_200
export const RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT = 817_400
export const RIDGELINE_RANGE_BEFORE = "$2.86M to $3.38M"
export const RIDGELINE_RANGE_AFTER = "$2.96M to $3.49M"
/** The four places the finished figure goes, in the order the foot lights them. */
export const USED_IN_ITEMS = ["Valuation", "Buyer materials", "Lender package", "Diligence answers"]

export type LedgerLineId = "revenue" | "ownerComp" | "personal" | "oneoff"
/** A line is open until its record is attached, then supported; the family payroll can be left in costs instead. */
export type LineStatus = "supported" | "open" | "removed"

export interface LedgerLineData {
  id: LedgerLineId
  label: string
  records: Array<[string, number]>
  amount: number
  /**
   * Whether the amount rests on adjusted earnings and sits in the amount column. The revenue timing does not: it is
   * explained, never counted, so its $22,000 closes the records line ("$22,000 apart") and moves no figure.
   */
  countsInOpen: boolean
  /** A line's own status vocabulary where the shared words would mislead (the revenue timing is never "Open"). */
  statusWords?: Partial<Record<LineStatus, string>>
  evidence: string
}

/** The revenue line's status words: the timing is explained, not supported, and not counted rather than open. */
export const REVENUE_STATUS_WORD: Partial<Record<LineStatus, string>> = {
  open: "Not counted",
  supported: "Timing, explained",
}

export const RIDGELINE_LINES: LedgerLineData[] = [
  {
    id: "revenue",
    label: "Revenue, books against return",
    records: [
      ["Books", 4_262_000],
      ["Tax return", 4_240_000],
    ],
    amount: 22_000,
    countsInOpen: false,
    statusWords: REVENUE_STATUS_WORD,
    evidence: "A one-page note on the basis difference, attached",
  },
  {
    id: "ownerComp",
    label: "Owner and family compensation",
    records: [
      ["Tax return", 186_400],
      ["Payroll register", 214_000],
    ],
    amount: 27_600,
    countsInOpen: true,
    evidence: "The payroll lines and the return, attached",
  },
  {
    id: "personal",
    label: "Personal charges",
    records: [["Vehicle and travel, 2025", 9_400]],
    amount: 9_400,
    countsInOpen: true,
    evidence: "A receipt and a reason for each charge, attached",
  },
  {
    id: "oneoff",
    label: "One-time items",
    records: [["Legal fee, 2024 lease dispute", 12_800]],
    amount: 12_800,
    countsInOpen: true,
    evidence: "The invoice and the settlement letter, with 2025 legal costs beside them",
  },
]

export const STATUS_WORD: Record<LineStatus, string> = {
  supported: "Supported",
  open: "Open",
  removed: "Left in costs",
}

/** Closes the records line of a line whose amount is not in the column: "Books … · Tax return … · $22,000 apart". */
export const RECORDS_APART = (amount: string) => `${amount} apart`

/**
 * The caption under the adjusted-earnings figure, one per beat: what the figure is, and why the last press
 * moved it or left it alone. `leftInCosts` closes both the hover preview and the demo's last caption.
 */
export const FOOT_CAPTIONS = {
  base: "Before these four lines",
  note: "A note, not an add-back. The figure does not move.",
  register: (amount: string) => `${amount} supported by the register`,
  receipts: (amount: string) => `${amount} supported by receipts`,
  shown: "Shown to buyers, every line supported",
  leftInCosts: "if the family payroll stays in costs",
}

/** The labels of the foot: the two figures the four lines produce, and where the finished figure goes. */
export const FIGURE_LABELS = {
  earnings: "Adjusted earnings",
  valuation: "Valuation",
  usedIn: "Used in",
}

/** What the screen shows, in the frame's header: "Project Ridgeline · Adjusted earnings". */
export const FINANCIAL_SUBJECT = FIGURE_LABELS.earnings
