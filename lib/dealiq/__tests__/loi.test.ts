/**
 * LOI derivation — synthetic fixtures only, per Execution Plan §1: a total swap
 * of `lib/dealiq/data/` must not touch this file.
 */

import { describe, expect, it } from "vitest"

import { buildLoi, CONTINGENCY_BY_RULE, DEPOSIT_SHARE, EARNOUT_CAP_SHARE, SECTION_LABEL } from "@/lib/dealiq/loi"
import type {
  FinancingTerms,
  LoiInput,
  RecastFlag,
  RecastLine,
  RecastRule,
  RecastVerdict,
  ReverseRecastResult,
} from "@/lib/dealiq/types"

// ── Fixtures ─────────────────────────────────────────────────────────────────

const FINANCING: FinancingTerms = {
  equityShare: 0.1,
  sellerNoteShare: 0.15,
  sellerNoteRate: 0.08,
  sellerNoteYears: 7,
  sellerNoteStandbyMonths: 24,
  sbaRate: 0.11,
  sbaYears: 10,
  closingCostsShare: 0.03,
  workingCapital: 50_000,
  buyerCompensation: 100_000,
  dscrFloor: 1.25,
}

let lineSeq = 0

function line(rule: RecastRule, verdict: RecastVerdict): RecastLine {
  lineSeq += 1
  return {
    id: `line-${lineSeq}`,
    kind: "add_back_challenge",
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

function recastWith(
  lines: RecastLine[],
  flags: RecastFlag[] = [],
  overrides: Partial<ReverseRecastResult> = {}
): ReverseRecastResult {
  return {
    claimedSde: 500_000,
    defensibleSde: 400_000,
    totalAdjusted: 100_000,
    lines,
    flags,
    claimedMultiple: 3,
    impliedMultiple: 3.75,
    fairValue: 1_000_000,
    negotiationDelta: 500_000,
    ...overrides,
  }
}

function inputWith(recast: ReverseRecastResult, ask = 1_500_000): LoiInput {
  return {
    dealId: "synthetic-deal",
    dealName: "Synthetic Deal Co",
    ask,
    buyerName: "Synthetic Buyer",
    firmName: "Synthetic Holdings",
    recast,
    financing: FINANCING,
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("buildLoi", () => {
  it("prices the offer at the recast's fair value, with the discount derived", () => {
    const draft = buildLoi(inputWith(recastWith([line("documentation", "rejected")])))
    expect(draft.price).toBe(1_000_000)
    expect(draft.discountToAsk).toBe(500_000)
  })

  it("builds a capital stack that sums to the offer price, not the ask", () => {
    const draft = buildLoi(inputWith(recastWith([])))
    const stackTotal = draft.terms
      .filter((term) => term.id.startsWith("stack-"))
      .reduce((sum, term) => {
        const amount = Number((term.value.split("·")[0] ?? "").replace(/[^0-9]/g, ""))
        return sum + amount
      }, 0)
    // Parse-free cross-check: the three segments' formatted amounts must sum to price.
    expect(Math.round(stackTotal)).toBe(draft.price)
  })

  it("gives every term a unique id and a non-empty rationale", () => {
    const draft = buildLoi(inputWith(recastWith([line("reserve", "partial")], [flag("occupancy")])))
    const ids = draft.terms.map((term) => term.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const term of draft.terms) {
      expect(term.rationale.trim().length).toBeGreaterThan(0)
      expect(term.label.trim().length).toBeGreaterThan(0)
      expect(term.value.trim().length).toBeGreaterThan(0)
      expect(SECTION_LABEL[term.section]).toBeDefined()
    }
  })

  it("derives contingencies from fired rules — the set varies with the recast input", () => {
    const docsOnly = buildLoi(inputWith(recastWith([line("documentation", "rejected")])))
    const occupancyToo = buildLoi(
      inputWith(recastWith([line("documentation", "rejected"), line("role_split", "partial")], [flag("occupancy")]))
    )
    const conditionIds = (draft: ReturnType<typeof buildLoi>) =>
      draft.terms.filter((term) => term.section === "conditions").map((term) => term.id)

    expect(conditionIds(docsOnly)).toEqual(["cond-financing", "cond-documentation"])
    expect(conditionIds(occupancyToo)).toEqual([
      "cond-financing",
      "cond-documentation",
      "cond-role_split",
      "cond-occupancy",
    ])
  })

  it("does not raise a contingency for a rule whose only line was accepted", () => {
    const draft = buildLoi(inputWith(recastWith([line("mixed_use", "accepted")])))
    expect(draft.terms.some((term) => term.id === "cond-mixed_use")).toBe(false)
  })

  it("always includes the financing condition, exclusivity, diligence, and deposit", () => {
    const draft = buildLoi(inputWith(recastWith([])))
    for (const id of ["cond-financing", "proc-exclusivity", "proc-diligence", "proc-deposit"]) {
      expect(draft.terms.some((term) => term.id === id)).toBe(true)
    }
  })

  it("caps the earnout at its share of price and drops it when the offer meets the ask", () => {
    const wideGap = buildLoi(inputWith(recastWith([]), 2_000_000))
    const earnout = wideGap.terms.find((term) => term.id === "earnout")
    expect(earnout).toBeDefined()
    expect(earnout?.value).toContain((EARNOUT_CAP_SHARE * 1_000_000).toLocaleString("en-US"))

    const atAsk = buildLoi(inputWith(recastWith([]), 1_000_000))
    expect(atAsk.terms.some((term) => term.id === "earnout")).toBe(false)
    expect(atAsk.discountToAsk).toBe(0)
  })

  it("sizes the deposit from the exported share of the offer price", () => {
    const draft = buildLoi(inputWith(recastWith([])))
    const deposit = draft.terms.find((term) => term.id === "proc-deposit")
    expect(deposit?.value).toContain((DEPOSIT_SHARE * draft.price).toLocaleString("en-US"))
  })

  it("covers every recast rule with a contingency definition", () => {
    const rules: ReadonlyArray<RecastRule> = [
      "role_split",
      "mixed_use",
      "documentation",
      "replacement_cost",
      "reserve",
      "occupancy",
    ]
    for (const rule of rules) {
      expect(CONTINGENCY_BY_RULE[rule].label.trim().length).toBeGreaterThan(0)
      expect(CONTINGENCY_BY_RULE[rule].requirement.trim().length).toBeGreaterThan(0)
    }
  })

  it("carries the deal and buyer identity through unchanged", () => {
    const draft = buildLoi(inputWith(recastWith([])))
    expect(draft.dealId).toBe("synthetic-deal")
    expect(draft.dealName).toBe("Synthetic Deal Co")
    expect(draft.buyerName).toBe("Synthetic Buyer")
    expect(draft.firmName).toBe("Synthetic Holdings")
  })
})
