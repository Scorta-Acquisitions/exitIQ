/**
 * The Speed section on the home page: the headline comparison, the bar pair beneath it, the five steps, and
 * every other word the section prints. The two timing facts (six to nine months against three to four) live
 * here and nowhere else, in figures for the bars and in words for the paragraph.
 */

/** How much shorter a Heirloom sale is, as a percentage: the number the counter climbs to. */
export const SPEED_PERCENT = 40

/** A percentage as the section prints it — the headline figure and every frame the counter draws toward it. */
export const speedPercent = (n: number) => `${Math.round(n)}%`

export const SPEED_RANGE = { figure: speedPercent(SPEED_PERCENT), unit: "faster than a traditional sale." } as const

/** The longest a traditional sale runs, in months: one tick per month marks the traditional track. */
export const SPEED_MONTHS = 9

/** Month marks under the traditional track: months 0 to 9, so ten marks, each a ninth of the track apart. */
export const SPEED_MONTH_TICKS: number[] = Array.from(
  { length: SPEED_MONTHS + 1 },
  (_, month) => +((month / SPEED_MONTHS) * 100).toFixed(1)
)

/** Relative sale length. Heirloom at 60 means 40% shorter than the traditional baseline of 100. */
export const SPEED_COMPARISON = {
  ariaLabel:
    "Sale length compared: a traditional sale takes six to nine months, Heirloom three to four on average, 40% shorter",
  bars: [
    { key: "traditional", label: "Traditional sale", pct: 100, note: "6 to 9 months" },
    { key: "heirloom", label: "Heirloom", pct: 60, note: "3 to 4 months on average" },
  ],
} as const

/** The words around the bars: the eyebrow, the film's label, the paragraph, the two links, and the steps' name. */
export const SPEED_COPY = {
  eyebrow: "Speed",
  filmLabel: "Two brass hourglasses on green lacquer; the right one runs through faster.",
  explainer:
    "A traditional sale takes six to nine months from launch to closing. Heirloom closes in three to four on average, because the financial work is finished before launch and buyers are qualified before they take your time.",
  howItWorks: "See how it works →",
  fees: "See fees →",
  stepsLabel: "How Heirloom keeps a sale moving",
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
