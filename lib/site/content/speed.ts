/** The Speed section on the home page: the headline comparison, the bar pair beneath it, and the five steps. */

export const SPEED_RANGE = { figure: "40%", unit: "faster than a traditional sale." } as const

/** Relative sale length. Heirloom at 60 means 40% shorter than the traditional baseline of 100. */
export const SPEED_COMPARISON = {
  ariaLabel:
    "Sale length compared: a traditional sale takes six to nine months, Heirloom three to four on average, 40% shorter",
  bars: [
    { key: "traditional", label: "Traditional sale", pct: 100, note: "6 to 9 months" },
    { key: "heirloom", label: "Heirloom", pct: 60, note: "3 to 4 months on average" },
  ],
} as const

export interface SpeedStep {
  title: string
  body: string
}

export const SPEED_STEPS: SpeedStep[] = [
  {
    title: "Prepare before market",
    body: "Books, tax returns, and payroll are reconciled before any buyer sees them.",
  },
  {
    title: "Qualify before meetings",
    body: "Buyers sign an NDA and show financing before they take your time.",
  },
  {
    title: "Answer from organized records",
    body: "Routine diligence questions are answered from approved records.",
  },
  {
    title: "Run financing and diligence together",
    body: "Lender work and buyer diligence run in parallel.",
  },
  {
    title: "Escalate decisions quickly",
    body: "Decisions that need you are raised quickly, and you get a weekly update.",
  },
]
