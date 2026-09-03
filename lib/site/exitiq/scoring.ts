import { type QuestionId, QUESTIONS } from "./questions"

/**
 * exitIQ readiness model.
 *
 * Three sub-scores (financeability, transferability, evidence quality) start at 50 and move with each
 * answer. A weighted composite selects one of four recommendation states, then the answers drive a
 * ranked list of findings and a five-step 90-day plan. Pure function; unit-tested in
 * `lib/site/__tests__/exitiq-scoring.test.ts`.
 */

export type ExitIqAnswers = Partial<Record<QuestionId, string>>

export type RecommendationState =
  | "Market Ready"
  | "Prepare First"
  | "More Evidence Needed"
  | "Outside Our Current Full-Representation Fit"

export const EMPTY_STATE_LABEL = "Answer seven questions to see your result."

export interface Finding {
  w: number
  t: string
  b: string
}

export interface ExitIqResult {
  fin: number
  tra: number
  evi: number
  state: RecommendationState | typeof EMPTY_STATE_LABEL
  /** Composite confidence 0..1 — drives the WebGL instrument field. */
  conf: number
  answered: number
  findings: Finding[]
  plan: string[]
}

export const RECOMMENDATION_DESCRIPTIONS: Record<RecommendationState, string> = {
  "Market Ready":
    "Your answers suggest a buyer and lender could evaluate the business now. The next step is to verify the numbers, value the company, and decide whether to enter the market.",
  "Prepare First":
    "The business may be sellable, but a few issues are likely to weaken price, financing, or buyer confidence. Address them before the market sees the company.",
  "More Evidence Needed":
    "The business may be ready, but the current answers do not give a buyer enough support. Gather the missing records and review the result again.",
  "Outside Our Current Full-Representation Fit":
    "Heirloom may not be the right firm to run a full sale today. The findings can still help you improve the business or choose another sale path.",
}

const clampScore = (v: number) => Math.max(4, Math.min(97, Math.round(v)))

function contribution(a: ExitIqAnswers, key: QuestionId, map: Record<string, number>): number {
  const v = a[key]
  if (v === undefined) return 0
  return map[v] ?? 0
}

export function scoreExitIq(a: ExitIqAnswers): ExitIqResult {
  const answered = Object.keys(a).length
  if (!answered) {
    return { fin: 0, tra: 0, evi: 0, state: EMPTY_STATE_LABEL, conf: 0, answered: 0, findings: [], plan: [] }
  }
  const g = (k: QuestionId, m: Record<string, number>) => contribution(a, k, m)

  const fin = clampScore(
    50 +
      g("rev", { u1: -12, "1-2": 4, "2-3": 8, "3-5": 10, "5+": 10 }) +
      g("trend", { up: 12, flat: 2, down: -14 }) +
      g("sde", { a: -9, b: 6, c: 12, d: 14 }) +
      g("books", { same: 14, close: 6, diff: -10, unsure: -7 }) +
      g("conc", { a: 8, b: 2, c: -10, d: -14 }) +
      g("owner", { a: 6, b: 2, c: -4, d: -10 })
  )
  const tra = clampScore(
    50 +
      g("owner", { a: 22, b: 10, c: -8, d: -16 }) +
      g("conc", { a: 10, b: 2, c: -10, d: -18 }) +
      g("trend", { up: 8, flat: 0, down: -8 }) +
      g("type", { recurring: 7, prof: -3, field: 2, dist: 3, other: 0 }) +
      g("sde", { a: -4, b: 0, c: 5, d: 7 })
  )
  const evi = clampScore(
    50 +
      g("books", { same: 30, close: 14, diff: -14, unsure: -12 }) +
      g("type", { recurring: 4, dist: 2, field: 0, prof: -2, other: 0 }) +
      g("rev", { u1: -6, "1-2": 0, "2-3": 2, "3-5": 4, "5+": 5 })
  )

  const composite = fin * 0.42 + tra * 0.34 + evi * 0.24
  const state: RecommendationState =
    a.rev === "u1" && composite < 55
      ? "Outside Our Current Full-Representation Fit"
      : composite >= 74
        ? "Market Ready"
        : composite >= 40
          ? "Prepare First"
          : "More Evidence Needed"

  const F: Finding[] = []
  if (a.books === "diff")
    F.push({
      w: 96,
      t: "Books and tax returns need a closer look",
      b: "A lender relies heavily on filed tax returns. Until the gap is explained line by line, a financed buyer may be able to borrow against less earnings than the business actually produces.",
    })
  if (a.books === "unsure")
    F.push({
      w: 78,
      t: "Book-to-tax differences are still unknown",
      b: "A buyer’s accountant and lender will ask for this comparison early. Resolving it now can prevent a late dispute over earnings and price.",
    })
  if (a.conc === "d")
    F.push({
      w: 94,
      t: "One customer carries most of the revenue",
      b: "A buyer and lender will ask what happens if that customer leaves. A durable contract that can transfer to a buyer can materially improve the answer.",
    })
  if (a.conc === "c")
    F.push({
      w: 72,
      t: "Customer concentration will shape the deal",
      b: "When one customer represents 25% to 50% of revenue, contract length, renewal history, and the strength of the relationship become central diligence questions.",
    })
  if (a.owner === "d")
    F.push({
      w: 92,
      t: "The business depends heavily on you",
      b: "A buyer is paying for earnings that continue after you leave. Heavy owner dependence can lead to more money being paid later and a longer required transition.",
    })
  if (a.owner === "c")
    F.push({
      w: 64,
      t: "The business slows without you",
      b: "This does not prevent a sale. It can increase the time a buyer asks you to stay and the portion of price tied to a successful transition.",
    })
  if (a.trend === "down")
    F.push({
      w: 88,
      t: "Revenue has declined",
      b: "Buyers and lenders will focus on the most recent performance. A clear explanation, current monthly results, and evidence of recovery will matter.",
    })
  if (a.trend === "flat")
    F.push({
      w: 38,
      t: "Revenue has been flat",
      b: "Stable revenue can be financeable. Retention, repeat business, contracts, and margins need to demonstrate durability.",
    })
  if (a.sde === "a")
    F.push({
      w: 66,
      t: "Earnings may limit the buyer pool",
      b: "At lower earnings, fewer financed buyers can meet debt payments and their own income needs. That can make buyer competition harder to create.",
    })
  if (a.rev === "u1")
    F.push({
      w: 70,
      t: "Revenue is below our usual full-sale range",
      b: "Heirloom’s full representation usually begins around $1M in annual revenue. The business may still be sellable through another path, and the readiness work can improve the options.",
    })
  if (a.type === "prof")
    F.push({
      w: 46,
      t: "Client relationships may depend on you",
      b: "Professional-services buyers test whether clients belong to the firm or to the owner. Written engagement terms and a second relationship owner can reduce that risk.",
    })
  if (F.length < 3 && a.books === "close")
    F.push({
      w: 34,
      t: "Minor book-to-tax differences need documentation",
      b: "Small differences are common. Documented early, they become an explanation. Discovered late, they can become a reason to reduce the offer.",
    })
  if (F.length < 3)
    F.push({
      w: 26,
      t: "The answers are still unverified",
      b: "These findings use the estimates you provided. Tax transcripts, payroll records, contracts, and adjusted-earnings support turn the story into evidence a buyer and lender can rely on.",
    })
  F.sort((x, y) => y.w - x.w)

  const plan: string[] = []
  if (a.books === "diff" || a.books === "unsure" || a.books === "close")
    plan.push(
      "Download two years of IRS tax transcripts and compare them with the business profit and loss statements."
    )
  if (a.books === "diff") plan.push("Separate owner pay and family payroll from normal employee payroll.")
  if (a.conc === "c" || a.conc === "d")
    plan.push("Put your top three customer agreements in writing and confirm they can transfer to a buyer.")
  if (a.owner === "c" || a.owner === "d")
    plan.push("Give a second leader clear decision-making authority and document the role.")
  plan.push("Stop running personal expenses through the business at the start of the next accounting period.")
  if (a.trend === "down" || a.trend === "flat")
    plan.push("Document customer retention and repeat revenue for the last 36 months.")
  if (plan.length < 5) plan.push("Prepare monthly profit and loss statements for the last 12 months.")

  return {
    fin,
    tra,
    evi,
    state,
    conf: composite / 100,
    answered,
    findings: F.slice(0, 3),
    plan: plan.slice(0, 5),
  }
}

export function recommendationDescription(state: ExitIqResult["state"]): string {
  return state in RECOMMENDATION_DESCRIPTIONS ? RECOMMENDATION_DESCRIPTIONS[state as RecommendationState] : ""
}

/** Plain-text export used by "Save my plan" (clipboard + downloaded .txt). */
export function planText(r: ExitIqResult): string {
  return (
    "exitIQ result and 90-day plan\n\nRecommendation: " +
    r.state +
    "\n\nTop findings:\n" +
    r.findings.map((f, i) => `${i + 1}. ${f.t}\n   ${f.b}`).join("\n") +
    "\n\nYour next 90 days:\n" +
    r.plan.map((p, i) => `${i + 1}. ${p}`).join("\n") +
    "\n\nexitIQ is an educational readiness screen based on answers you provide. It is not a valuation, appraisal, financing decision, or assurance that a business will sell."
  )
}

/** Body attached to the advisor booking when a completed result is sent for review. */
export function advisorReviewBody(a: ExitIqAnswers): string {
  const r = scoreExitIq(a)
  const lines = QUESTIONS.map((q) => {
    const c = q.chips.find((x) => x.v === a[q.id])
    return `- ${q.q} ${c ? c.l : "Skipped"}`
  })
  return (
    "exitIQ result review\nRecommendation: " +
    r.state +
    "\nFinanceability: " +
    r.fin +
    "\nTransferability: " +
    r.tra +
    "\nEvidence quality: " +
    r.evi +
    "\n\nTop findings:\n" +
    r.findings.map((f, i) => `${i + 1}. ${f.t}`).join("\n") +
    "\n\nMy answers:\n" +
    lines.join("\n")
  )
}
