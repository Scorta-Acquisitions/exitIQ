/**
 * Pipeline derivations, tested against synthetic fixtures declared here.
 *
 * Nothing in this file imports `lib/dealiq/data/`. A total content swap must
 * leave it untouched — that is the acceptance criterion for the data seam
 * (Execution Plan §1).
 */

import { describe, expect, it } from "vitest"

import { adjacentDeals, countByStage, dealPosition, dealsInStage, funnel, orderedDeals } from "@/lib/dealiq/pipeline"
import type { PipelineDeal, PipelineStage, Verdict } from "@/lib/dealiq/types"

function deal(
  id: string,
  stage: PipelineStage,
  score: number | null = null,
  verdict: Verdict | null = null
): PipelineDeal {
  return {
    id,
    name: `Fixture ${id}`,
    industry: "Fixture Industry",
    geography: "Fixture Region",
    ask: 1_000_000,
    claimedSde: 300_000,
    score,
    verdict,
    stage,
    daysInStage: 1,
    lastAgentAction: "Fixture action",
  }
}

const FIXTURE: ReadonlyArray<PipelineDeal> = [
  deal("d1", "sourced"),
  deal("d2", "sourced"),
  deal("d3", "screened", 40, "PASS"),
  deal("d4", "screened", 65, "DIG"),
  deal("d5", "screened", 55, "DIG"),
  deal("d6", "diligence", 72, "PURSUE"),
  deal("d7", "loi", 80, "PURSUE"),
]

describe("countByStage", () => {
  it("counts every stage, including stages with no deals", () => {
    expect(countByStage(FIXTURE)).toEqual({ sourced: 2, screened: 3, diligence: 1, loi: 1 })
  })

  it("returns zeros for an empty pipeline rather than an empty object", () => {
    expect(countByStage([])).toEqual({ sourced: 0, screened: 0, diligence: 0, loi: 0 })
  })

  it("sums to the deal count", () => {
    const counts = countByStage(FIXTURE)
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(FIXTURE.length)
  })
})

describe("funnel", () => {
  it("emits one step per stage in board order", () => {
    expect(funnel(FIXTURE).map((s) => s.key)).toEqual(["sourced", "screened", "diligence", "loi"])
  })

  it("scales shares against the widest step", () => {
    const steps = funnel(FIXTURE)
    const widest = steps.find((s) => s.key === "screened")
    expect(widest?.share).toBe(1)
    expect(steps.find((s) => s.key === "sourced")?.share).toBeCloseTo(2 / 3)
    expect(steps.find((s) => s.key === "loi")?.share).toBeCloseTo(1 / 3)
  })

  it("yields zero shares on an empty pipeline rather than dividing by zero", () => {
    for (const step of funnel([])) {
      expect(step.count).toBe(0)
      expect(step.share).toBe(0)
      expect(Number.isFinite(step.share)).toBe(true)
    }
  })

  it("moves when a deal is added — no counter is stored", () => {
    const before = funnel(FIXTURE).find((s) => s.key === "loi")?.count ?? 0
    const after = funnel([...FIXTURE, deal("d8", "loi", 90, "PURSUE")]).find((s) => s.key === "loi")?.count ?? 0
    expect(after).toBe(before + 1)
  })
})

describe("dealsInStage", () => {
  it("filters to one stage", () => {
    expect(dealsInStage(FIXTURE, "screened").map((d) => d.id)).toEqual(["d3", "d4", "d5"])
  })

  it("returns empty for a stage with no deals", () => {
    expect(dealsInStage([deal("x", "sourced")], "loi")).toEqual([])
  })
})

describe("orderedDeals", () => {
  it("orders furthest-along stage first, then by score descending", () => {
    expect(orderedDeals(FIXTURE).map((d) => d.id)).toEqual(["d7", "d6", "d4", "d5", "d3", "d1", "d2"])
  })

  it("sorts unscored deals last within their stage", () => {
    const mixed = [deal("b", "screened", null), deal("a", "screened", 10, "PASS")]
    expect(orderedDeals(mixed).map((d) => d.id)).toEqual(["a", "b"])
  })

  it("breaks ties by id so the order is stable across renders", () => {
    const tied = [deal("z", "screened", 50, "DIG"), deal("a", "screened", 50, "DIG")]
    expect(orderedDeals(tied).map((d) => d.id)).toEqual(["a", "z"])
  })

  it("does not mutate the input array", () => {
    const input = [...FIXTURE]
    orderedDeals(input)
    expect(input.map((d) => d.id)).toEqual(FIXTURE.map((d) => d.id))
  })

  it("preserves every deal exactly once", () => {
    const ordered = orderedDeals(FIXTURE)
    expect(ordered).toHaveLength(FIXTURE.length)
    expect(new Set(ordered.map((d) => d.id)).size).toBe(FIXTURE.length)
  })
})

describe("dealPosition", () => {
  it("is 1-indexed and agrees with the canonical order", () => {
    expect(dealPosition(FIXTURE, "d7")).toBe(1)
    expect(dealPosition(FIXTURE, "d2")).toBe(FIXTURE.length)
  })

  it("returns null for a deal that is not in the pipeline", () => {
    expect(dealPosition(FIXTURE, "missing")).toBeNull()
  })
})

describe("adjacentDeals", () => {
  it("walks the canonical order", () => {
    const { prev, next } = adjacentDeals(FIXTURE, "d6")
    expect(prev?.id).toBe("d7")
    expect(next?.id).toBe("d4")
  })

  it("does not wrap at either end", () => {
    expect(adjacentDeals(FIXTURE, "d7").prev).toBeNull()
    expect(adjacentDeals(FIXTURE, "d2").next).toBeNull()
  })

  it("returns both null for an unknown deal", () => {
    expect(adjacentDeals(FIXTURE, "missing")).toEqual({ prev: null, next: null })
  })

  it("returns both null for a single-deal pipeline", () => {
    expect(adjacentDeals([deal("only", "screened", 50, "DIG")], "only")).toEqual({ prev: null, next: null })
  })
})
