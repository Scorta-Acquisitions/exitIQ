/**
 * Diligence ranking — synthetic fixtures only, per Execution Plan §1: a total
 * swap of `lib/dealiq/data/` must not touch this file.
 */

import { describe, expect, it } from "vitest"

import {
  ASK_OF_LABEL,
  CATEGORY_LABEL,
  CATEGORY_WEIGHT,
  diligencePackMarkdown,
  firedRules,
  rankQuestions,
  UNRESOLVED_FINDING_MULTIPLIER,
} from "@/lib/dealiq/diligence"
import type {
  DiligenceCategory,
  DiligenceQuestion,
  RecastFlag,
  RecastLine,
  RecastRule,
  RecastVerdict,
  ReverseRecastResult,
} from "@/lib/dealiq/types"

// ── Fixtures ─────────────────────────────────────────────────────────────────

let lineSeq = 0

function line(rule: RecastRule, verdict: RecastVerdict): RecastLine {
  lineSeq += 1
  return {
    id: `line-${lineSeq}`,
    kind: verdict === "accepted" ? "add_back_challenge" : "omitted_cost",
    label: `Line ${lineSeq}`,
    verdict,
    claimed: 10_000,
    accepted: verdict === "accepted" ? 10_000 : 0,
    adjusted: verdict === "accepted" ? 0 : 10_000,
    rule,
    rationale: "synthetic",
  }
}

function flag(rule: RecastRule): RecastFlag {
  return { id: `flag-${rule}`, rule, label: "synthetic", detail: "synthetic", severity: "warn" }
}

function recastWith(lines: RecastLine[], flags: RecastFlag[] = []): ReverseRecastResult {
  return {
    claimedSde: 100_000,
    defensibleSde: 80_000,
    totalAdjusted: 20_000,
    lines,
    flags,
    claimedMultiple: 3,
    impliedMultiple: 3.75,
    fairValue: 200_000,
    negotiationDelta: 100_000,
  }
}

function question(
  id: string,
  killSpeed: number,
  category: DiligenceCategory,
  sourceFinding?: RecastRule
): DiligenceQuestion {
  return {
    id,
    question: `Synthetic question ${id}?`,
    category,
    killSpeed,
    rationale: `Synthetic rationale for ${id}.`,
    sourceFinding,
    askOf: "seller",
  }
}

// ── firedRules ───────────────────────────────────────────────────────────────

describe("firedRules", () => {
  it("collects rules from challenged lines and flags, deduplicated", () => {
    const recast = recastWith(
      [line("documentation", "rejected"), line("documentation", "partial"), line("role_split", "partial")],
      [flag("occupancy")]
    )
    expect(firedRules(recast)).toEqual(["documentation", "role_split", "occupancy"])
  })

  it("does not fire a rule whose only line was accepted", () => {
    const recast = recastWith([line("mixed_use", "accepted"), line("reserve", "rejected")])
    expect(firedRules(recast)).toEqual(["reserve"])
  })

  it("is empty when every claim survived and nothing was flagged", () => {
    expect(firedRules(recastWith([line("documentation", "accepted")]))).toEqual([])
  })
})

// ── rankQuestions ────────────────────────────────────────────────────────────

describe("rankQuestions", () => {
  it("computes killScore as killSpeed × categoryWeight × unresolved multiplier", () => {
    const ranked = rankQuestions([question("a", 4, "financial", "reserve")], ["reserve"])
    expect(ranked[0]?.killScore).toBe(4 * CATEGORY_WEIGHT.financial * UNRESOLVED_FINDING_MULTIPLIER)
    const unpromoted = rankQuestions([question("a", 4, "market")], ["reserve"])
    expect(unpromoted[0]?.killScore).toBe(4 * CATEGORY_WEIGHT.market)
  })

  it("sorts by killScore descending", () => {
    const ranked = rankQuestions(
      [question("low", 1, "market"), question("high", 5, "financial"), question("mid", 3, "legal")],
      []
    )
    const scores = ranked.map((q) => q.killScore)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    expect(ranked.map((q) => q.id)).toEqual(["high", "mid", "low"])
  })

  it("keeps bank order for equal scores — the sort is stable", () => {
    const ranked = rankQuestions(
      [question("first", 3, "financial"), question("second", 3, "financial"), question("third", 3, "financial")],
      []
    )
    expect(ranked.map((q) => q.id)).toEqual(["first", "second", "third"])
  })

  it("promotes a question when its sourceFinding fired, floating it up the pack", () => {
    const bank = [question("big", 5, "financial"), question("tied", 3, "financial", "reserve")]
    const resting = rankQuestions(bank, [])
    expect(resting.map((q) => q.id)).toEqual(["big", "tied"])
    expect(resting.every((q) => !q.promoted)).toBe(true)

    const promoted = rankQuestions(bank, ["reserve"])
    expect(promoted.map((q) => q.id)).toEqual(["tied", "big"])
    expect(promoted[0]?.promoted).toBe(true)
    expect(promoted[1]?.promoted).toBe(false)
  })

  it("does not promote a tagged question whose rule did not fire", () => {
    const ranked = rankQuestions([question("tagged", 3, "customer", "occupancy")], ["reserve"])
    expect(ranked[0]?.promoted).toBe(false)
  })

  it("does not mutate the bank and preserves every question exactly once", () => {
    const bank = [question("a", 5, "financial"), question("b", 1, "market"), question("c", 3, "people")]
    const before = bank.map((q) => q.id)
    const ranked = rankQuestions(bank, [])
    expect(bank.map((q) => q.id)).toEqual(before)
    expect([...ranked.map((q) => q.id)].sort()).toEqual(["a", "b", "c"])
  })

  it("weights every category positively, at most 1", () => {
    for (const weight of Object.values(CATEGORY_WEIGHT)) {
      expect(weight).toBeGreaterThan(0)
      expect(weight).toBeLessThanOrEqual(1)
    }
  })
})

// ── diligencePackMarkdown ────────────────────────────────────────────────────

describe("diligencePackMarkdown", () => {
  it("renders the title and every question, numbered in rank order", () => {
    const ranked = rankQuestions([question("a", 5, "financial"), question("b", 2, "market", "reserve")], ["reserve"])
    const md = diligencePackMarkdown(ranked, "Synthetic Pack")
    expect(md.startsWith("# Synthetic Pack")).toBe(true)
    ranked.forEach((q, i) => {
      expect(md).toContain(`${i + 1}. **${q.question}**`)
      expect(md).toContain(q.rationale)
    })
  })

  it("names the promoting finding on promoted rows only", () => {
    const ranked = rankQuestions([question("p", 3, "financial", "reserve"), question("u", 3, "financial")], ["reserve"])
    const md = diligencePackMarkdown(ranked, "Pack")
    expect(md).toContain("promoted by the")
    expect(md.match(/promoted by the/g)).toHaveLength(1)
  })

  it("labels categories and recipients through the exported records", () => {
    const md = diligencePackMarkdown(rankQuestions([question("a", 3, "legal")], []), "Pack")
    expect(md).toContain(CATEGORY_LABEL.legal)
    expect(md).toContain(`ask ${ASK_OF_LABEL.seller}`)
  })
})
