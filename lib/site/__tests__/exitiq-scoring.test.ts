import { describe, expect, it } from "vitest"
import { chipLabel, insightFor } from "@/lib/site/exitiq/questions"
import {
  advisorReviewBody,
  EMPTY_STATE_LABEL,
  type ExitIqAnswers,
  planText,
  recommendationDescription,
  scoreExitIq,
} from "@/lib/site/exitiq/scoring"

const STRONG: ExitIqAnswers = {
  type: "recurring",
  rev: "3-5",
  trend: "up",
  sde: "d",
  books: "same",
  conc: "a",
  owner: "a",
}
const WEAK: ExitIqAnswers = { type: "prof", rev: "u1", trend: "down", sde: "a", books: "diff", conc: "d", owner: "d" }

describe("exitIQ question bank", () => {
  it("resolves chip labels and insights, and returns null for a chip it does not have", () => {
    expect(chipLabel("rev", "1-2")).toBe("$1M to $2M")
    expect(chipLabel("rev", "nope")).toBeNull()
    expect(chipLabel("rev", undefined)).toBeNull()
    expect(insightFor("rev", "u1")).toBe(
      "Full representation usually begins around $1M in annual revenue. The readiness findings are still useful."
    )
    expect(insightFor("type", "nope")).toBeNull()
  })
})

describe("scoreExitIq", () => {
  it("returns the empty state with zero scores when nothing is answered", () => {
    const r = scoreExitIq({})
    expect(r.state).toBe(EMPTY_STATE_LABEL)
    expect(r.fin).toBe(0)
    expect(r.conf).toBe(0)
    expect(r.findings).toEqual([])
    expect(r.plan).toEqual([])
  })

  it("rates a strong, documented business as Market Ready, at the 97 upper clamp", () => {
    const r = scoreExitIq(STRONG)
    expect(r.state).toBe("Market Ready")
    expect(r.fin).toBe(97)
    expect(r.tra).toBe(97)
    expect(r.evi).toBe(88)
    expect(r.conf).toBeCloseTo(0.9484, 4)
    expect(r.answered).toBe(7)
  })

  it("puts a sub-$1M declining business outside the full-representation fit, at the 4 lower clamp", () => {
    const r = scoreExitIq(WEAK)
    expect(r.state).toBe("Outside Our Current Full-Representation Fit")
    expect(r.fin).toBe(4)
    expect(r.tra).toBe(4)
    expect(r.evi).toBe(28)
  })

  it("selects Prepare First for a middling profile", () => {
    const r = scoreExitIq({ type: "field", rev: "1-2", trend: "flat", sde: "b", books: "close", conc: "b", owner: "c" })
    expect(r.state).toBe("Prepare First")
  })

  it("asks for more evidence when the same weak profile sits inside the revenue range", () => {
    // WEAK's answers with $1M-$2M revenue instead of under $1M: the fit gate no longer applies, and the
    // composite of 11.2 is below the 40 the Prepare First band starts at.
    const r = scoreExitIq({ ...WEAK, rev: "1-2" })
    expect(r.state).toBe("More Evidence Needed")
    expect(r.fin).toBe(4)
    expect(r.tra).toBe(4)
    expect(r.evi).toBe(34)
    expect(r.conf).toBeCloseTo(0.112, 4)
  })

  it("raises the customer-concentration finding at a quarter to a half of revenue, and not below it", () => {
    const quarter = scoreExitIq({ ...STRONG, conc: "c" })
    expect(quarter.findings.map((f) => [f.w, f.t])).toEqual([
      [72, "Customer concentration will shape the deal"],
      [26, "The answers are still unverified"],
    ])
    expect(quarter.findings[0]?.b).toBe(
      "When one customer represents 25% to 50% of revenue, contract length, renewal history, and the strength of the relationship become central diligence questions."
    )
    expect(quarter.state).toBe("Market Ready")
    expect(scoreExitIq({ ...STRONG, conc: "b" }).findings.map((f) => f.t)).toEqual(["The answers are still unverified"])
  })

  it("flips a Prepare First profile to Market Ready when the books match the returns", () => {
    // The seven answers the end-to-end run gives, with question 5 changed from "Close, with explainable
    // differences" to "They match": matching books lift financeability 76 -> 84 and evidence 64 -> 80.
    const prepare: ExitIqAnswers = {
      type: "prof",
      rev: "2-3",
      trend: "flat",
      sde: "b",
      books: "close",
      conc: "b",
      owner: "b",
    }
    const before = scoreExitIq(prepare)
    expect([before.state, before.fin, before.tra, before.evi]).toEqual(["Prepare First", 76, 59, 64])
    const after = scoreExitIq({ ...prepare, books: "same" })
    expect(after.state).toBe("Market Ready")
    expect([after.fin, after.tra, after.evi]).toEqual([84, 59, 80])
    expect(after.findings.map((f) => f.t)).toEqual([
      "Client relationships may depend on you",
      "Revenue has been flat",
      "The answers are still unverified",
    ])
    expect(after.plan).toEqual([
      "Stop running personal expenses through the business at the start of the next accounting period.",
      "Document customer retention and repeat revenue for the last 36 months.",
      "Prepare monthly profit and loss statements for the last 12 months.",
    ])
  })

  it("returns at most three findings sorted by weight, with the heaviest issue first", () => {
    const r = scoreExitIq(WEAK)
    expect(r.findings).toHaveLength(3)
    expect(r.findings[0]?.t).toBe("Books and tax returns need a closer look")
    expect(r.findings[1]?.t).toBe("One customer carries most of the revenue")
    expect(r.findings[2]?.t).toBe("The business depends heavily on you")
  })

  it("pads findings with the unverified-answers note when few issues exist", () => {
    expect(scoreExitIq(STRONG).findings.map((f) => f.t)).toEqual(["The answers are still unverified"])
  })

  it("builds a plan of at most five steps, dropping the sixth a weak profile earns", () => {
    expect(scoreExitIq(WEAK).plan).toEqual([
      "Download two years of IRS tax transcripts and compare them with the business profit and loss statements.",
      "Separate owner pay and family payroll from normal employee payroll.",
      "Put your top three customer agreements in writing and confirm they can transfer to a buyer.",
      "Give a second leader clear decision-making authority and document the role.",
      "Stop running personal expenses through the business at the start of the next accounting period.",
    ])
    expect(scoreExitIq(STRONG).plan).toEqual([
      "Stop running personal expenses through the business at the start of the next accounting period.",
      "Prepare monthly profit and loss statements for the last 12 months.",
    ])
    expect(scoreExitIq({ books: "unsure" } as ExitIqAnswers).plan).toEqual([
      "Download two years of IRS tax transcripts and compare them with the business profit and loss statements.",
      "Stop running personal expenses through the business at the start of the next accounting period.",
      "Prepare monthly profit and loss statements for the last 12 months.",
    ])
  })

  it("scores partial answer sets without throwing", () => {
    const r = scoreExitIq({ books: "same" })
    expect(r.answered).toBe(1)
    expect(r.evi).toBe(80)
    expect(r.fin).toBe(64)
  })

  it("ignores unknown chip values", () => {
    expect(scoreExitIq({ rev: "zzz" }).fin).toBe(50)
  })
})

describe("exitIQ text exports", () => {
  it("describes a recommendation state, and says nothing before there is one", () => {
    expect(recommendationDescription("Market Ready")).toBe(
      "Your answers suggest a buyer and lender could evaluate the business now. The next step is to verify the numbers, value the company, and decide whether to enter the market."
    )
    expect(recommendationDescription("More Evidence Needed")).toBe(
      "The business may be ready, but the current answers do not give a buyer enough support. Gather the missing records and review the result again."
    )
    expect(recommendationDescription(EMPTY_STATE_LABEL)).toBe("")
  })

  it("writes the plan and the advisor review body", () => {
    const r = scoreExitIq(WEAK)
    const text = planText(r)
    expect(text).toContain("Recommendation: Outside Our Current Full-Representation Fit")
    expect(text).toContain("1. Books and tax returns need a closer look")
    const body = advisorReviewBody(WEAK)
    expect(body).toContain("Financeability:")
    expect(body).toContain("- What kind of business do you run? Business or professional services")
    expect(advisorReviewBody({ type: "field" })).toContain("Skipped")
  })
})
