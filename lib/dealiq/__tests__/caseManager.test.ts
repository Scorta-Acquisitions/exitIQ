import { describe, expect, it } from "vitest"

import { caseBriefing, nextStepFor, STAGE_PRIORITY } from "@/lib/dealiq/caseManager"
import { DEAL_TAB_KEYS, type PipelineDeal, type PipelineStage, type Verdict } from "@/lib/dealiq/types"

/** Synthetic fixtures only — this file must survive a total content swap untouched. */
function deal(overrides: Partial<PipelineDeal> & { id: string }): PipelineDeal {
  return {
    name: "Synthetic Deal",
    industry: "Synthetic Industry",
    geography: "Synthetic Metro",
    ask: 1_000_000,
    claimedSde: 300_000,
    score: 50,
    verdict: "DIG",
    stage: "screened",
    daysInStage: 5,
    lastAgentAction: "synthetic action",
    ...overrides,
  }
}

describe("nextStepFor", () => {
  const stages: ReadonlyArray<PipelineStage> = ["sourced", "screened", "diligence", "loi"]

  it.each(stages)("returns a complete step with a valid tab for the %s stage", (stage) => {
    const step = nextStepFor(deal({ id: "d1", stage }))
    expect(step.dealId).toBe("d1")
    expect(step.headline.trim().length).toBeGreaterThan(0)
    expect(step.detail.trim().length).toBeGreaterThan(0)
    expect(DEAL_TAB_KEYS).toContain(step.tab)
  })

  it("routes a screened deal by its verdict", () => {
    const byVerdict = (verdict: Verdict | null) => nextStepFor(deal({ id: "d1", stage: "screened", verdict }))
    expect(byVerdict("PURSUE").tab).toBe("loi")
    expect(byVerdict("DIG").tab).toBe("diligence")
    expect(byVerdict("PASS").tab).toBe("recast")
    expect(byVerdict(null).tab).toBe("score")
  })

  it("marks an out-for-signature deal as waiting, not acting", () => {
    expect(nextStepFor(deal({ id: "d1", stage: "loi" })).urgency).toBe("waiting")
  })

  it("states no figure — every number on screen is derived elsewhere", () => {
    const stagesAndVerdicts: ReadonlyArray<[PipelineStage, Verdict | null]> = [
      ["sourced", null],
      ["screened", "PURSUE"],
      ["screened", "DIG"],
      ["screened", "PASS"],
      ["screened", null],
      ["diligence", "DIG"],
      ["loi", "PURSUE"],
    ]
    for (const [stage, verdict] of stagesAndVerdicts) {
      const step = nextStepFor(deal({ id: "d1", stage, verdict }))
      expect(`${step.headline} ${step.detail}`).not.toMatch(/\$\s?[\d.]/)
    }
  })
})

describe("caseBriefing", () => {
  it("orders closest-to-money first, oldest first within a stage", () => {
    const briefing = caseBriefing([
      deal({ id: "sourced-new", stage: "sourced", daysInStage: 1 }),
      deal({ id: "screened-old", stage: "screened", daysInStage: 20 }),
      deal({ id: "screened-new", stage: "screened", daysInStage: 2 }),
      deal({ id: "loi-1", stage: "loi", daysInStage: 3 }),
      deal({ id: "diligence-1", stage: "diligence", daysInStage: 8 }),
    ])
    expect(briefing.map((item) => item.deal.id)).toEqual([
      "loi-1",
      "diligence-1",
      "screened-old",
      "screened-new",
      "sourced-new",
    ])
  })

  it("is stable for equal stage and age", () => {
    const briefing = caseBriefing([
      deal({ id: "a", stage: "screened", daysInStage: 5 }),
      deal({ id: "b", stage: "screened", daysInStage: 5 }),
    ])
    expect(briefing.map((item) => item.deal.id)).toEqual(["a", "b"])
  })

  it("returns one step per deal and never drops or invents one", () => {
    const deals = [deal({ id: "a" }), deal({ id: "b", stage: "loi" }), deal({ id: "c", stage: "diligence" })]
    const briefing = caseBriefing(deals)
    expect(briefing).toHaveLength(deals.length)
    expect(new Set(briefing.map((item) => item.step.dealId))).toEqual(new Set(["a", "b", "c"]))
  })

  it("covers every stage in the priority map", () => {
    for (const stage of ["sourced", "screened", "diligence", "loi"] as const) {
      expect(STAGE_PRIORITY[stage]).toBeGreaterThanOrEqual(0)
    }
  })
})
