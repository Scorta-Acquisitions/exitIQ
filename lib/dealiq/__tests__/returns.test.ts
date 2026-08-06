/**
 * Synthetic fixtures only — no import from `lib/dealiq/data/`.
 */

import { describe, expect, it } from "vitest"

import { amortizedPayment, applyScenario, computeReturns, DEFAULT_FINANCING, SCENARIOS } from "@/lib/dealiq/returns"
import type { FinancingTerms, ReturnsInput } from "@/lib/dealiq/types"

function terms(overrides: Partial<FinancingTerms> = {}): FinancingTerms {
  return { ...DEFAULT_FINANCING, ...overrides }
}

function input(overrides: Partial<ReturnsInput> = {}): ReturnsInput {
  return { price: 1_500_000, defensibleSde: 500_000, terms: terms(), ...overrides }
}

describe("amortizedPayment", () => {
  it("matches the known value for a 10-year 12% loan", () => {
    expect(amortizedPayment(100_000, 0.12, 10)).toBeCloseTo(1_434.71, 2)
  })

  it("degrades to straight-line principal at a zero rate", () => {
    expect(amortizedPayment(120_000, 0, 10)).toBeCloseTo(1_000, 6)
  })

  it("returns zero rather than NaN for a zero principal or a zero term", () => {
    expect(amortizedPayment(0, 0.1, 10)).toBe(0)
    expect(amortizedPayment(100_000, 0.1, 0)).toBe(0)
    expect(amortizedPayment(-5, 0.1, 10)).toBe(0)
  })

  it("rises with rate and falls with term", () => {
    expect(amortizedPayment(100_000, 0.14, 10)).toBeGreaterThan(amortizedPayment(100_000, 0.1, 10))
    expect(amortizedPayment(100_000, 0.12, 20)).toBeLessThan(amortizedPayment(100_000, 0.12, 10))
  })
})

describe("computeReturns — capital stack", () => {
  it("splits the price across three segments that sum to it", () => {
    const result = computeReturns(input())
    expect(result.stack).toHaveLength(3)
    expect(result.stack.reduce((sum, seg) => sum + seg.amount, 0)).toBeCloseTo(result.price, 6)
    expect(result.stack.reduce((sum, seg) => sum + seg.share, 0)).toBeCloseTo(1, 6)
  })

  it("gives every segment a terms string for the label beneath it", () => {
    for (const segment of computeReturns(input()).stack) {
      expect(segment.terms.length).toBeGreaterThan(0)
    }
  })

  it("collapses the SBA tranche to zero rather than negative when equity and seller note fill the price", () => {
    const result = computeReturns(input({ terms: terms({ equityShare: 0.7, sellerNoteShare: 0.5 }) }))
    expect(result.stack[0]?.amount).toBe(0)
    expect(result.stack.every((seg) => seg.amount >= 0)).toBe(true)
  })
})

describe("computeReturns — coverage", () => {
  it("keeps annual debt service consistent with the monthly figure shown beside it", () => {
    const result = computeReturns(input())
    expect(result.annualDebtService).toBeCloseTo(result.monthlyDebtService * 12, 6)
  })

  it("computes DSCR off cash flow after the buyer's own salary", () => {
    const result = computeReturns(input())
    expect(result.cashFlowBeforeDebtService).toBeCloseTo(result.adjustedSde - result.buyerCompensation, 6)
    expect(result.dscr).toBeCloseTo(result.cashFlowBeforeDebtService / result.annualDebtService, 6)
  })

  it("falls monotonically as price rises", () => {
    const low = computeReturns(input({ price: 1_000_000 })).dscr
    const mid = computeReturns(input({ price: 1_500_000 })).dscr
    const high = computeReturns(input({ price: 2_000_000 })).dscr
    expect(low).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(high)
  })

  it("agrees with its own floor test", () => {
    const result = computeReturns(input())
    expect(result.meetsDscrFloor).toBe(result.dscr >= result.dscrFloor)
  })
})

describe("computeReturns — maxPriceAtDscrFloor", () => {
  it("inverts correctly: pricing at the maximum lands DSCR on the floor", () => {
    const base = computeReturns(input())
    const atMax = computeReturns(input({ price: base.maxPriceAtDscrFloor }))
    expect(atMax.dscr).toBeCloseTo(atMax.dscrFloor, 6)
  })

  it("is independent of the price the model was run at", () => {
    const a = computeReturns(input({ price: 900_000 })).maxPriceAtDscrFloor
    const b = computeReturns(input({ price: 3_000_000 })).maxPriceAtDscrFloor
    expect(a).toBeCloseTo(b, 6)
  })

  it("is never negative when the deal cannot service any debt", () => {
    expect(computeReturns(input({ defensibleSde: 0 })).maxPriceAtDscrFloor).toBe(0)
  })
})

describe("computeReturns — guards", () => {
  it("produces no NaN or Infinity at a zero price", () => {
    const result = computeReturns(input({ price: 0 }))
    for (const value of [
      result.dscr,
      result.cashOnCash,
      result.monthlyDebtService,
      result.annualDebtService,
      result.cashRequired,
      result.maxPriceAtDscrFloor,
    ]) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })

  it("survives zero equity without dividing by zero on cash-on-cash", () => {
    const result = computeReturns(input({ terms: terms({ equityShare: 0, closingCostsShare: 0, workingCapital: 0 }) }))
    expect(result.cashRequired).toBe(0)
    expect(result.cashOnCash).toBe(0)
    expect(Number.isFinite(result.cashOnCash)).toBe(true)
  })

  it("survives zero debt service without dividing by zero on DSCR", () => {
    const result = computeReturns(input({ terms: terms({ equityShare: 1, sellerNoteShare: 0 }) }))
    expect(result.annualDebtService).toBe(0)
    expect(result.dscr).toBe(0)
  })

  it("returns null payback rather than Infinity when the deal never recovers its cash", () => {
    expect(computeReturns(input({ defensibleSde: 100_000 })).yearsToPayback).toBeNull()
  })

  it("returns a finite payback when cash flow is positive after debt service", () => {
    const result = computeReturns(input({ price: 800_000, defensibleSde: 500_000 }))
    expect(result.cashFlowAfterDebtService).toBeGreaterThan(0)
    expect(result.yearsToPayback).not.toBeNull()
    expect(Number.isFinite(result.yearsToPayback ?? Number.NaN)).toBe(true)
  })
})

describe("scenarios", () => {
  it("declares all four, and only base leaves the inputs untouched", () => {
    expect(SCENARIOS.map((s) => s.key)).toEqual(["base", "transition", "stress", "occupancy"])
    const base = SCENARIOS.find((s) => s.key === "base")
    expect(base?.sdeHaircut).toBe(0)
    expect(base?.occupancyShare).toBe(0)
  })

  it("haircuts SDE on transition and stress, and charges rent on occupancy", () => {
    const applied = SCENARIOS.map((scenario) => applyScenario(input(), scenario, 66_000))
    expect(applied.map((a) => a.sdeHaircut)).toEqual([0, 0.1, 0.25, 0])
    expect(applied.map((a) => a.annualCostAddition)).toEqual([0, 0, 0, 66_000])
  })

  it("reduces coverage under every non-base scenario", () => {
    const base = computeReturns(input()).dscr
    for (const scenario of SCENARIOS.filter((s) => s.key !== "base")) {
      expect(computeReturns(applyScenario(input(), scenario, 66_000)).dscr).toBeLessThan(base)
    }
  })

  it("produces no NaN in any scenario at either end of the slider range", () => {
    for (const scenario of SCENARIOS) {
      for (const price of [1_125_000, 1_875_000]) {
        const result = computeReturns(applyScenario(input({ price }), scenario, 66_000))
        for (const value of [result.dscr, result.cashOnCash, result.adjustedSde, result.maxPriceAtDscrFloor]) {
          expect(Number.isFinite(value)).toBe(true)
        }
        expect(result.yearsToPayback === null || Number.isFinite(result.yearsToPayback)).toBe(true)
      }
    }
  })
})
