/**
 * Synthetic fixtures only — no import from `lib/dealiq/data/`.
 */

import { describe, expect, it } from "vitest"

import { computeReturns, DEFAULT_FINANCING } from "@/lib/dealiq/returns"
import { reverseRecast } from "@/lib/dealiq/reverseRecast"
import {
  addBackAggressivenessScore,
  bandFor,
  customerConcentrationScore,
  ownerDependencyScore,
  priceVsCompScore,
  sbaFinanceabilityScore,
  SCORE_BANDS,
  screenScore,
  sdeQualityScore,
  SUB_SCORE_LABEL,
  VERDICT_BANDS,
  verdictFor,
  WEIGHTS,
} from "@/lib/dealiq/screenScore"
import { type DealRiskInputs, type ScreenScoreInput, SUB_SCORE_KEYS } from "@/lib/dealiq/types"

function risk(overrides: Partial<DealRiskInputs> = {}): DealRiskInputs {
  return {
    topCustomerShare: 0.1,
    topThreeCustomerShare: 0.25,
    ownerHoursPerWeek: 20,
    ownerHoldsKeyRelationships: false,
    documentedSops: 10,
    longTenuredStaff: 8,
    employees: 10,
    recurringRevenueShare: 0.5,
    sbaEligible: true,
    yearsOperating: 10,
    revenueTrend3yr: 0.05,
    ...overrides,
  }
}

function scoreInput(overrides: Partial<ScreenScoreInput> = {}): ScreenScoreInput {
  const recast = reverseRecast({
    claimedSde: 500_000,
    ask: 1_200_000,
    addBacks: [],
    historyWindowYears: 3,
    occupancy: {
      costInPandL: 60_000,
      marketAnnualRent: 60_000,
      premisesOwnedBySeller: false,
      realEstateIncludedInAsk: false,
    },
    compMultiple: { low: 2, high: 3 },
  })
  const returns = computeReturns({ price: 1_200_000, defensibleSde: recast.defensibleSde, terms: DEFAULT_FINANCING })
  return { ask: 1_200_000, recast, returns, risk: risk(), compMultiple: { low: 2, high: 3 }, ...overrides }
}

// ─── Constants ───────────────────────────────────────────────────────────────

describe("constants", () => {
  it("weights sum to 1", () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
  })

  it("weights and labels cover exactly the six sub-score keys", () => {
    expect(Object.keys(WEIGHTS).sort()).toEqual([...SUB_SCORE_KEYS].sort())
    expect(Object.keys(SUB_SCORE_LABEL).sort()).toEqual([...SUB_SCORE_KEYS].sort())
  })

  it("orders the verdict bands below the strong score band", () => {
    expect(VERDICT_BANDS.DIG).toBeLessThan(VERDICT_BANDS.PURSUE)
    expect(SCORE_BANDS.mixed).toBeLessThan(SCORE_BANDS.strong)
  })
})

describe("verdictFor", () => {
  it("returns the right verdict at each band boundary and one either side", () => {
    expect(verdictFor(VERDICT_BANDS.DIG - 1)).toBe("PASS")
    expect(verdictFor(VERDICT_BANDS.DIG)).toBe("DIG")
    expect(verdictFor(VERDICT_BANDS.DIG + 1)).toBe("DIG")
    expect(verdictFor(VERDICT_BANDS.PURSUE - 1)).toBe("DIG")
    expect(verdictFor(VERDICT_BANDS.PURSUE)).toBe("PURSUE")
    expect(verdictFor(VERDICT_BANDS.PURSUE + 1)).toBe("PURSUE")
  })

  it("handles the extremes", () => {
    expect(verdictFor(0)).toBe("PASS")
    expect(verdictFor(100)).toBe("PURSUE")
  })
})

describe("bandFor", () => {
  it("returns the right band at each boundary and one either side", () => {
    expect(bandFor(SCORE_BANDS.mixed - 1)).toBe("weak")
    expect(bandFor(SCORE_BANDS.mixed)).toBe("mixed")
    expect(bandFor(SCORE_BANDS.strong - 1)).toBe("mixed")
    expect(bandFor(SCORE_BANDS.strong)).toBe("strong")
    expect(bandFor(0)).toBe("weak")
    expect(bandFor(100)).toBe("strong")
  })
})

// ─── Sub-scores ──────────────────────────────────────────────────────────────

describe("sdeQualityScore", () => {
  it("scores the share of claimed cash flow that survived", () => {
    expect(sdeQualityScore(500_000, 400_000).score).toBeCloseTo(80)
    expect(sdeQualityScore(500_000, 500_000).score).toBe(100)
  })

  it("clamps at zero when nothing survived, and guards a zero claim", () => {
    expect(sdeQualityScore(500_000, -100_000).score).toBe(0)
    expect(sdeQualityScore(0, 0).score).toBe(0)
  })

  it("states a basis the panel can render", () => {
    expect(sdeQualityScore(500_000, 400_000).basis.length).toBeGreaterThan(0)
  })
})

describe("addBackAggressivenessScore", () => {
  it("scores what withstood challenge", () => {
    expect(addBackAggressivenessScore(200_000, 50_000).score).toBeCloseTo(75)
    expect(addBackAggressivenessScore(200_000, 0).score).toBe(100)
    expect(addBackAggressivenessScore(200_000, 200_000).score).toBe(0)
  })

  it("scores a schedule with no add-backs as clean rather than dividing by zero", () => {
    expect(addBackAggressivenessScore(0, 0).score).toBe(100)
  })

  it("clamps when omitted costs push adjustments past the claimed total", () => {
    expect(addBackAggressivenessScore(100_000, 250_000).score).toBe(0)
  })
})

describe("customerConcentrationScore", () => {
  it("scores a diversified book at 100 and clamps a concentrated one at 0", () => {
    expect(customerConcentrationScore(risk({ topCustomerShare: 0 })).score).toBe(100)
    expect(customerConcentrationScore(risk({ topCustomerShare: 0.8 })).score).toBe(0)
  })

  it("falls as concentration rises", () => {
    const light = customerConcentrationScore(risk({ topCustomerShare: 0.1 })).score
    const heavy = customerConcentrationScore(risk({ topCustomerShare: 0.34 })).score
    expect(heavy).toBeLessThan(light)
  })
})

describe("ownerDependencyScore", () => {
  it("scores an absentee owner with a documented business near the top", () => {
    const score = ownerDependencyScore(
      risk({ ownerHoursPerWeek: 10, ownerHoldsKeyRelationships: false, documentedSops: 12, longTenuredStaff: 10 })
    ).score
    expect(score).toBeGreaterThan(SCORE_BANDS.strong)
  })

  it("scores a hands-on owner who holds the relationships near the bottom", () => {
    const score = ownerDependencyScore(
      risk({ ownerHoursPerWeek: 60, ownerHoldsKeyRelationships: true, documentedSops: 0, longTenuredStaff: 0 })
    ).score
    expect(score).toBeLessThan(SCORE_BANDS.mixed)
  })

  it("never leaves 0-100 even at absurd inputs", () => {
    expect(ownerDependencyScore(risk({ ownerHoursPerWeek: 200, employees: 0, longTenuredStaff: 0 })).score).toBe(0)
    expect(ownerDependencyScore(risk({ ownerHoursPerWeek: 0, documentedSops: 500 })).score).toBeLessThanOrEqual(100)
  })
})

describe("sbaFinanceabilityScore", () => {
  it("floors an ineligible structure regardless of coverage", () => {
    expect(sbaFinanceabilityScore(risk({ sbaEligible: false }), 4.4, 1.25).score).toBe(20)
  })

  it("sits at the midpoint exactly on the floor and rises above it", () => {
    expect(sbaFinanceabilityScore(risk(), 1.25, 1.25).score).toBeCloseTo(50)
    expect(sbaFinanceabilityScore(risk(), 1.5, 1.25).score).toBeGreaterThan(50)
    expect(sbaFinanceabilityScore(risk(), 1.0, 1.25).score).toBeLessThan(50)
  })

  it("guards a zero floor rather than dividing by it", () => {
    expect(Number.isFinite(sbaFinanceabilityScore(risk(), 1.2, 0).score)).toBe(true)
  })
})

describe("priceVsCompScore", () => {
  it("scores at the band floor, the ceiling, and a full span above it", () => {
    expect(priceVsCompScore(2, { low: 2, high: 3 }).score).toBe(100)
    expect(priceVsCompScore(3, { low: 2, high: 3 }).score).toBeCloseTo(50)
    expect(priceVsCompScore(4, { low: 2, high: 3 }).score).toBe(0)
  })

  it("clamps below the band floor rather than exceeding 100", () => {
    expect(priceVsCompScore(1, { low: 2, high: 3 }).score).toBe(100)
  })

  it("scores zero when there is no defensible cash flow to price against", () => {
    expect(priceVsCompScore(0, { low: 2, high: 3 }).score).toBe(0)
  })

  it("guards a degenerate comp band", () => {
    expect(Number.isFinite(priceVsCompScore(2.5, { low: 3, high: 3 }).score)).toBe(true)
  })
})

// ─── Composite ───────────────────────────────────────────────────────────────

describe("screenScore", () => {
  it("returns exactly the six sub-scores, each with a label, weight, band and basis", () => {
    const result = screenScore(scoreInput())
    expect(result.subScores.map((s) => s.key)).toEqual([...SUB_SCORE_KEYS])
    for (const sub of result.subScores) {
      expect(sub.label.length).toBeGreaterThan(0)
      expect(sub.basis.length).toBeGreaterThan(0)
      expect(sub.weight).toBe(WEIGHTS[sub.key])
      expect(sub.band).toBe(bandFor(sub.score))
      expect(sub.score).toBeGreaterThanOrEqual(0)
      expect(sub.score).toBeLessThanOrEqual(100)
    }
  })

  it("composites as the weighted sum of its own sub-scores", () => {
    const result = screenScore(scoreInput())
    const expected = result.subScores.reduce((sum, sub) => sum + sub.score * sub.weight, 0)
    expect(result.composite).toBeCloseTo(expected, 6)
  })

  it("agrees with its own verdict and band functions", () => {
    const result = screenScore(scoreInput())
    expect(result.verdict).toBe(verdictFor(result.composite))
    expect(result.band).toBe(bandFor(result.composite))
  })

  it("scores a clean deal far above a broken one", () => {
    const clean = screenScore(scoreInput())
    const broken = screenScore(
      scoreInput({
        risk: risk({
          topCustomerShare: 0.45,
          ownerHoursPerWeek: 70,
          ownerHoldsKeyRelationships: true,
          documentedSops: 0,
          longTenuredStaff: 0,
          sbaEligible: false,
        }),
      })
    )
    expect(broken.composite).toBeLessThan(clean.composite)
  })

  it("raises a condition for every weak sub-score, deep-linked to a real tab", () => {
    const result = screenScore(
      scoreInput({
        risk: risk({
          topCustomerShare: 0.48,
          ownerHoursPerWeek: 70,
          ownerHoldsKeyRelationships: true,
          documentedSops: 0,
        }),
      })
    )
    const weak = result.subScores.filter((s) => s.band === "weak")
    expect(result.conditions.length).toBeGreaterThanOrEqual(weak.length)
    for (const condition of result.conditions) {
      expect(["score", "recast", "returns", "diligence", "loi"]).toContain(condition.tab)
      expect(condition.text.length).toBeGreaterThan(0)
    }
  })

  it("carries every recast flag through into the conditions", () => {
    const flagged = scoreInput()
    const recast = reverseRecast({
      claimedSde: 500_000,
      ask: 1_200_000,
      addBacks: [],
      historyWindowYears: 3,
      occupancy: {
        costInPandL: 0,
        marketAnnualRent: 66_000,
        premisesOwnedBySeller: true,
        realEstateIncludedInAsk: false,
      },
      compMultiple: { low: 2, high: 3 },
    })
    const result = screenScore({ ...flagged, recast })
    expect(recast.flags.length).toBeGreaterThan(0)
    for (const flag of recast.flags) {
      expect(result.conditions.some((c) => c.id.includes(flag.id))).toBe(true)
    }
  })

  it("gives unique condition ids so the list can be keyed", () => {
    const result = screenScore(scoreInput({ risk: risk({ topCustomerShare: 0.49, ownerHoursPerWeek: 70 }) }))
    expect(new Set(result.conditions.map((c) => c.id)).size).toBe(result.conditions.length)
  })

  it("never produces a composite outside 0-100, across a swept range of inputs", () => {
    for (let share = 0; share <= 1; share += 0.1) {
      const result = screenScore(
        scoreInput({ risk: risk({ topCustomerShare: share, ownerHoursPerWeek: share * 80, sbaEligible: share < 0.5 }) })
      )
      expect(result.composite).toBeGreaterThanOrEqual(0)
      expect(result.composite).toBeLessThanOrEqual(100)
      expect(Number.isFinite(result.composite)).toBe(true)
    }
  })
})
