import { describe, expect, it } from "vitest"
import { chipLabel, insightFor, QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
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
  it("has seven questions with unique ids and non-empty chips", () => {
    expect(QUESTION_COUNT).toBe(7)
    const ids = new Set(QUESTIONS.map((q) => q.id))
    expect(ids.size).toBe(7)
    for (const q of QUESTIONS) expect(q.chips.length).toBeGreaterThan(1)
  })

  it("has an insight for every chip", () => {
    for (const q of QUESTIONS) for (const c of q.chips) expect(insightFor(q.id, c.v)).toBeTruthy()
  })

  it("resolves chip labels", () => {
    expect(chipLabel("rev", "1-2")).toBe("$1M to $2M")
    expect(chipLabel("rev", "nope")).toBeNull()
    expect(chipLabel("rev", undefined)).toBeNull()
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

  it("rates a strong, documented business as Market Ready", () => {
    const r = scoreExitIq(STRONG)
    expect(r.state).toBe("Market Ready")
    expect(r.fin).toBeGreaterThan(90)
    expect(r.evi).toBeGreaterThan(85)
    expect(r.conf).toBeGreaterThan(0.74)
    expect(r.answered).toBe(7)
  })

  it("puts a sub-$1M declining business outside the full-representation fit", () => {
    const r = scoreExitIq(WEAK)
    expect(r.state).toBe("Outside Our Current Full-Representation Fit")
    expect(r.fin).toBeGreaterThanOrEqual(4)
    expect(r.tra).toBeGreaterThanOrEqual(4)
  })

  it("clamps every sub-score to the 4..97 band", () => {
    for (const a of [STRONG, WEAK]) {
      const r = scoreExitIq(a)
      for (const v of [r.fin, r.tra, r.evi]) {
        expect(v).toBeGreaterThanOrEqual(4)
        expect(v).toBeLessThanOrEqual(97)
      }
    }
  })

  it("selects Prepare First for a middling profile", () => {
    const r = scoreExitIq({ type: "field", rev: "1-2", trend: "flat", sde: "b", books: "close", conc: "b", owner: "c" })
    expect(r.state).toBe("Prepare First")
  })

  it("returns at most three findings sorted by weight, with the heaviest issue first", () => {
    const r = scoreExitIq(WEAK)
    expect(r.findings).toHaveLength(3)
    expect(r.findings[0]?.t).toBe("Books and tax returns need a closer look")
    expect(r.findings[1]?.t).toBe("One customer carries most of the revenue")
    expect(r.findings[2]?.t).toBe("The business depends heavily on you")
  })

  it("pads findings with the unverified-answers note when few issues exist", () => {
    const r = scoreExitIq(STRONG)
    expect(r.findings.map((f) => f.t)).toContain("The answers are still unverified")
  })

  it("builds a five-step plan that always includes the personal-expenses action", () => {
    for (const a of [STRONG, WEAK, { books: "unsure" } as ExitIqAnswers]) {
      const plan = scoreExitIq(a).plan
      expect(plan.length).toBeLessThanOrEqual(5)
      expect(plan).toContain(
        "Stop running personal expenses through the business at the start of the next accounting period."
      )
    }
    expect(scoreExitIq(WEAK).plan[0]).toMatch(/IRS tax transcripts/)
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
  it("describes every recommendation state", () => {
    expect(recommendationDescription("Market Ready")).toMatch(/buyer and lender/)
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
