/**
 * Synthetic fixtures only — no import from `lib/dealiq/data/`.
 */

import { describe, expect, it } from "vitest"

import { analysisToPipelineDeal, analyzeDeal, financingFor, uncoveredOccupancyFor } from "@/lib/dealiq/analyze"
import { DEFAULT_FINANCING } from "@/lib/dealiq/returns"
import type { DealSeed } from "@/lib/dealiq/types"

function seed(overrides: Partial<DealSeed> = {}): DealSeed {
  return {
    card: {
      id: "fixture-1",
      name: "Fixture Co",
      industry: "Fixture Industry",
      geography: "Fixture Region",
      ask: 1_500_000,
      claimedSde: 500_000,
      highlights: [],
      concerns: [],
    },
    addBacks: [
      {
        id: "ab-1",
        label: "Owner compensation",
        annualAmount: 120_000,
        category: "compensation",
        documentation: "partial",
        roleVacatedShare: 0.5,
      },
    ],
    occupancy: {
      costInPandL: 0,
      marketAnnualRent: 60_000,
      premisesOwnedBySeller: true,
      realEstateIncludedInAsk: false,
    },
    risk: {
      topCustomerShare: 0.2,
      topThreeCustomerShare: 0.4,
      ownerHoursPerWeek: 40,
      ownerHoldsKeyRelationships: true,
      documentedSops: 4,
      longTenuredStaff: 3,
      employees: 10,
      recurringRevenueShare: 0.3,
      sbaEligible: true,
      yearsOperating: 12,
      revenueTrend3yr: 0.04,
    },
    compMultiple: { low: 2, high: 3 },
    historyWindowYears: 3,
    ...overrides,
  }
}

describe("financingFor", () => {
  it("uses the defaults when the seed states no overrides", () => {
    expect(financingFor(seed())).toEqual(DEFAULT_FINANCING)
  })

  it("merges per-deal overrides over the defaults without dropping the rest", () => {
    const terms = financingFor(seed({ financing: { dscrFloor: 1.4, sbaRate: 0.09 } }))
    expect(terms.dscrFloor).toBe(1.4)
    expect(terms.sbaRate).toBe(0.09)
    expect(terms.sbaYears).toBe(DEFAULT_FINANCING.sbaYears)
  })
})

describe("uncoveredOccupancyFor", () => {
  it("is the gap between market rent and what the P&L carries", () => {
    expect(uncoveredOccupancyFor(seed())).toBe(60_000)
  })

  it("is zero when occupancy is fully carried or the real estate is in the ask", () => {
    const covered = seed()
    expect(uncoveredOccupancyFor({ ...covered, occupancy: { ...covered.occupancy, costInPandL: 90_000 } })).toBe(0)
    expect(
      uncoveredOccupancyFor({ ...covered, occupancy: { ...covered.occupancy, realEstateIncludedInAsk: true } })
    ).toBe(0)
  })
})

describe("analyzeDeal", () => {
  it("prices the returns model off the defensible SDE, not the claimed one", () => {
    const analysis = analyzeDeal(seed())
    expect(analysis.recast.defensibleSde).toBeLessThan(analysis.recast.claimedSde)
    expect(analysis.returns.adjustedSde).toBe(analysis.recast.defensibleSde)
  })

  it("models the ask by default and an override when one is given", () => {
    expect(analyzeDeal(seed()).returns.price).toBe(1_500_000)
    expect(analyzeDeal(seed(), { price: 1_100_000 }).returns.price).toBe(1_100_000)
  })

  it("moves the verdict when a single add-back changes — the seam's whole point", () => {
    const strong = analyzeDeal(seed({ addBacks: [] }))
    const weak = analyzeDeal(
      seed({
        addBacks: [
          {
            id: "ab-1",
            label: "Undocumented claim",
            annualAmount: 300_000,
            category: "discretionary",
            documentation: "none",
          },
        ],
      })
    )
    expect(weak.recast.defensibleSde).toBeLessThan(strong.recast.defensibleSde)
    expect(weak.score.composite).toBeLessThan(strong.score.composite)
  })

  it("is deterministic", () => {
    expect(analyzeDeal(seed())).toEqual(analyzeDeal(seed()))
  })

  it("produces no NaN across the surfaces that render it", () => {
    const { recast, returns, score } = analyzeDeal(seed())
    for (const value of [
      recast.defensibleSde,
      recast.impliedMultiple,
      recast.fairValue,
      returns.dscr,
      returns.cashOnCash,
      score.composite,
    ]) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })
})

describe("analysisToPipelineDeal", () => {
  it("takes score and verdict from the engine, never from a stored field", () => {
    const analysis = analyzeDeal(seed())
    const card = analysisToPipelineDeal(analysis, {
      stage: "screened",
      daysInStage: 0,
      lastAgentAction: "Fixture action",
    })
    expect(card.score).toBe(Math.round(analysis.score.composite))
    expect(card.verdict).toBe(analysis.score.verdict)
    expect(card.id).toBe("fixture-1")
    expect(card.ask).toBe(1_500_000)
    expect(card.stage).toBe("screened")
  })

  it("carries no kill reason — that is a buyer decision, not an engine output", () => {
    const card = analysisToPipelineDeal(analyzeDeal(seed()), {
      stage: "screened",
      daysInStage: 0,
      lastAgentAction: "Fixture action",
    })
    expect(card.killReason).toBeUndefined()
  })
})
