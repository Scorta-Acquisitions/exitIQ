/**
 * Synthetic fixtures only — no import from `lib/dealiq/data/`. A total content
 * swap must leave this file untouched (Execution Plan §1).
 */

import { describe, expect, it } from "vitest"

import {
  documentationRule,
  mixedUseRule,
  occupancyRule,
  replacementCostRule,
  RESERVE_RECURRENCE_THRESHOLD,
  reserveRule,
  reverseRecast,
  roleSplitRule,
} from "@/lib/dealiq/reverseRecast"
import type { ClaimedAddBack, OccupancyInput, ReverseRecastInput } from "@/lib/dealiq/types"

function addBack(overrides: Partial<ClaimedAddBack> = {}): ClaimedAddBack {
  return {
    id: "ab",
    label: "Fixture claim",
    annualAmount: 100_000,
    category: "discretionary",
    documentation: "verified",
    ...overrides,
  }
}

const CLEAN_OCCUPANCY: OccupancyInput = {
  costInPandL: 60_000,
  marketAnnualRent: 60_000,
  premisesOwnedBySeller: false,
  realEstateIncludedInAsk: false,
}

function input(overrides: Partial<ReverseRecastInput> = {}): ReverseRecastInput {
  return {
    claimedSde: 500_000,
    ask: 1_500_000,
    addBacks: [],
    historyWindowYears: 3,
    occupancy: CLEAN_OCCUPANCY,
    compMultiple: { low: 2, high: 3 },
    ...overrides,
  }
}

// ─── Individual rules ────────────────────────────────────────────────────────

describe("roleSplitRule", () => {
  it("is silent when the claim declares no split", () => {
    expect(roleSplitRule(addBack())).toBeNull()
  })

  it("accepts only the vacated portion of the role", () => {
    expect(roleSplitRule(addBack({ roleVacatedShare: 0.6 }))?.acceptedShare).toBeCloseTo(0.6)
  })

  it("handles both extremes", () => {
    expect(roleSplitRule(addBack({ roleVacatedShare: 1 }))?.acceptedShare).toBe(1)
    expect(roleSplitRule(addBack({ roleVacatedShare: 0 }))?.acceptedShare).toBe(0)
  })

  it("clamps a share outside 0-1", () => {
    expect(roleSplitRule(addBack({ roleVacatedShare: 1.8 }))?.acceptedShare).toBe(1)
    expect(roleSplitRule(addBack({ roleVacatedShare: -0.5 }))?.acceptedShare).toBe(0)
  })
})

describe("mixedUseRule", () => {
  it("inverts the share — business use is what stays in the cost base", () => {
    expect(mixedUseRule(addBack({ businessUseShare: 0.35 }))?.acceptedShare).toBeCloseTo(0.65)
  })

  it("handles a business-use share of 0 and of 1", () => {
    expect(mixedUseRule(addBack({ businessUseShare: 0 }))?.acceptedShare).toBe(1)
    expect(mixedUseRule(addBack({ businessUseShare: 1 }))?.acceptedShare).toBe(0)
  })

  it("is silent when no split is documented", () => {
    expect(mixedUseRule(addBack())).toBeNull()
  })
})

describe("documentationRule", () => {
  it("passes a verified claim, halves a partial one, and rejects an undocumented one", () => {
    expect(documentationRule(addBack({ documentation: "verified" })).acceptedShare).toBe(1)
    expect(documentationRule(addBack({ documentation: "partial" })).acceptedShare).toBe(0.5)
    expect(documentationRule(addBack({ documentation: "none" })).acceptedShare).toBe(0)
  })

  it("always fires, so every row carries a rule", () => {
    expect(documentationRule(addBack()).rule).toBe("documentation")
    expect(documentationRule(addBack()).rationale.length).toBeGreaterThan(0)
  })
})

describe("replacementCostRule", () => {
  it("charges the gap when re-hiring costs more than the compensation added back", () => {
    const line = replacementCostRule(
      addBack({ annualAmount: 180_000, roleVacatedShare: 0.6, replacementCost: 130_000 })
    )
    expect(line?.adjusted).toBe(22_000)
    expect(line?.kind).toBe("omitted_cost")
    expect(line?.claimed).toBe(0)
    expect(line?.accepted).toBe(0)
  })

  it("is silent when the replacement costs no more than the vacated compensation", () => {
    expect(replacementCostRule(addBack({ roleVacatedShare: 0.6, replacementCost: 50_000 }))).toBeNull()
  })

  it("is silent when no replacement cost is stated", () => {
    expect(replacementCostRule(addBack({ roleVacatedShare: 0.6 }))).toBeNull()
  })

  it("measures against the whole claim when no role split is declared", () => {
    expect(replacementCostRule(addBack({ annualAmount: 100_000, replacementCost: 140_000 }))?.adjusted).toBe(40_000)
  })
})

describe("reserveRule", () => {
  it("charges the annualised reserve once a one-time claim recurs", () => {
    const line = reserveRule(addBack({ recurredYears: 3, recurringAnnualAverage: 38_000 }), 3)
    expect(line?.adjusted).toBe(38_000)
    expect(line?.rule).toBe("reserve")
  })

  it("is silent below the recurrence threshold", () => {
    expect(reserveRule(addBack({ recurredYears: RESERVE_RECURRENCE_THRESHOLD - 1 }), 3)).toBeNull()
    expect(reserveRule(addBack(), 3)).toBeNull()
  })

  it("falls back to the claimed amount when no average is supplied", () => {
    expect(reserveRule(addBack({ annualAmount: 40_000, recurredYears: 2 }), 3)?.adjusted).toBe(40_000)
  })

  it("does not reduce the claim itself — accepting and reserving would double-count", () => {
    const result = reverseRecast(
      input({ addBacks: [addBack({ annualAmount: 40_000, recurredYears: 3, recurringAnnualAverage: 38_000 })] })
    )
    const challenge = result.lines.find((line) => line.kind === "add_back_challenge")
    expect(challenge?.verdict).toBe("accepted")
    expect(challenge?.accepted).toBe(40_000)
    expect(result.totalAdjusted).toBe(38_000)
  })
})

describe("occupancyRule", () => {
  it("flags a P&L carrying no rent, at critical severity", () => {
    const flag = occupancyRule({ ...CLEAN_OCCUPANCY, costInPandL: 0, premisesOwnedBySeller: true })
    expect(flag?.severity).toBe("critical")
    expect(flag?.scenario).toBe("occupancy")
  })

  it("warns rather than criticals when rent is carried but below market", () => {
    expect(occupancyRule({ ...CLEAN_OCCUPANCY, costInPandL: 30_000 })?.severity).toBe("warn")
  })

  it("is silent when occupancy is at or above market", () => {
    expect(occupancyRule(CLEAN_OCCUPANCY)).toBeNull()
    expect(occupancyRule({ ...CLEAN_OCCUPANCY, costInPandL: 90_000 })).toBeNull()
  })

  it("is silent when the real estate is inside the ask", () => {
    expect(occupancyRule({ ...CLEAN_OCCUPANCY, costInPandL: 0, realEstateIncludedInAsk: true })).toBeNull()
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe("reverseRecast", () => {
  it("holds the header invariant: claimed − adjusted === defensible", () => {
    const result = reverseRecast(
      input({
        addBacks: [
          addBack({ id: "a", annualAmount: 180_000, roleVacatedShare: 0.6, replacementCost: 130_000 }),
          addBack({ id: "b", annualAmount: 24_000, documentation: "partial", businessUseShare: 0.35 }),
          addBack({ id: "c", annualAmount: 18_000, documentation: "none" }),
        ],
      })
    )
    expect(result.claimedSde - result.totalAdjusted).toBe(result.defensibleSde)
  })

  it("makes line totals equal the header total", () => {
    const result = reverseRecast(
      input({ addBacks: [addBack({ id: "a", documentation: "none" }), addBack({ id: "b", businessUseShare: 0.5 })] })
    )
    expect(result.lines.reduce((sum, line) => sum + line.adjusted, 0)).toBe(result.totalAdjusted)
  })

  it("composes the acceptance rules multiplicatively", () => {
    // 100k × 0.6 vacated × 0.5 business-use remainder × 0.5 partial documentation = 15k
    const result = reverseRecast(
      input({
        addBacks: [
          addBack({ annualAmount: 100_000, roleVacatedShare: 0.6, businessUseShare: 0.5, documentation: "partial" }),
        ],
      })
    )
    const line = result.lines[0]
    expect(line?.accepted).toBe(15_000)
    expect(line?.adjusted).toBe(85_000)
    expect(line?.verdict).toBe("partial")
  })

  it("names the rule that reduced the claim most", () => {
    const result = reverseRecast(input({ addBacks: [addBack({ roleVacatedShare: 0.9, documentation: "none" })] }))
    expect(result.lines[0]?.rule).toBe("documentation")
  })

  it("marks a fully surviving claim accepted and a fully rejected one rejected", () => {
    const accepted = reverseRecast(input({ addBacks: [addBack()] })).lines[0]
    expect(accepted?.verdict).toBe("accepted")
    expect(accepted?.adjusted).toBe(0)

    const rejected = reverseRecast(input({ addBacks: [addBack({ documentation: "none" })] })).lines[0]
    expect(rejected?.verdict).toBe("rejected")
    expect(rejected?.accepted).toBe(0)
  })

  it("keeps every adjustment non-negative and every omitted cost claim-free", () => {
    const result = reverseRecast(
      input({
        addBacks: [
          addBack({ id: "a", roleVacatedShare: 0.2, replacementCost: 200_000 }),
          addBack({ id: "b", recurredYears: 3, recurringAnnualAverage: 30_000 }),
        ],
      })
    )
    for (const line of result.lines) {
      expect(line.adjusted).toBeGreaterThanOrEqual(0)
      if (line.kind === "omitted_cost") {
        expect(line.claimed).toBe(0)
        expect(line.accepted).toBe(0)
      }
    }
  })

  it("handles an empty schedule without producing NaN", () => {
    const result = reverseRecast(input({ addBacks: [] }))
    expect(result.totalAdjusted).toBe(0)
    expect(result.defensibleSde).toBe(result.claimedSde)
    expect(result.lines).toEqual([])
    expect(Number.isFinite(result.impliedMultiple)).toBe(true)
  })

  it("returns zero multiples rather than Infinity at zero claimed SDE", () => {
    const result = reverseRecast(input({ claimedSde: 0, addBacks: [] }))
    expect(result.claimedMultiple).toBe(0)
    expect(result.impliedMultiple).toBe(0)
    expect(result.fairValue).toBe(0)
  })

  it("returns a zero implied multiple when the challenge wipes out the cash flow", () => {
    const result = reverseRecast(
      input({ claimedSde: 50_000, addBacks: [addBack({ annualAmount: 50_000, documentation: "none" })] })
    )
    expect(result.defensibleSde).toBe(0)
    expect(Number.isFinite(result.impliedMultiple)).toBe(true)
    expect(result.fairValue).toBe(0)
  })

  it("prices fair value off defensible SDE at the comp midpoint", () => {
    const result = reverseRecast(input({ claimedSde: 400_000, addBacks: [], compMultiple: { low: 2, high: 3 } }))
    expect(result.fairValue).toBe(1_000_000)
    expect(result.negotiationDelta).toBe(500_000)
  })

  it("moves the implied multiple above the claimed one whenever the challenge bites", () => {
    const result = reverseRecast(input({ addBacks: [addBack({ documentation: "none" })] }))
    expect(result.impliedMultiple).toBeGreaterThan(result.claimedMultiple)
  })

  it("emits the occupancy flag without touching the adjustment total", () => {
    const withFlag = reverseRecast(
      input({ addBacks: [], occupancy: { ...CLEAN_OCCUPANCY, costInPandL: 0, premisesOwnedBySeller: true } })
    )
    expect(withFlag.flags).toHaveLength(1)
    expect(withFlag.totalAdjusted).toBe(0)
  })

  it("produces the same result for the same input, at two different profiles", () => {
    const lean = input({ claimedSde: 200_000, ask: 500_000, addBacks: [addBack({ annualAmount: 20_000 })] })
    const heavy = input({
      claimedSde: 2_000_000,
      ask: 8_000_000,
      addBacks: [addBack({ annualAmount: 600_000, roleVacatedShare: 0.4, replacementCost: 400_000 })],
    })
    expect(reverseRecast(lean)).toEqual(reverseRecast(lean))
    expect(reverseRecast(heavy).claimedSde - reverseRecast(heavy).totalAdjusted).toBe(
      reverseRecast(heavy).defensibleSde
    )
  })
})
