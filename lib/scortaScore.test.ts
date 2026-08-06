import { describe, expect, it } from "vitest"

import { PERSONA } from "@/lib/persona"
import {
  customerConcentrationScore,
  getPointsToCertified,
  getScortaSubScores,
  ownerIndependenceScore,
  sbaLendabilityScore,
  SCORTA_CERTIFIED_THRESHOLD,
} from "@/lib/scortaScore"

describe("ownerIndependenceScore", () => {
  it("passes through the owner-dependency score unchanged", () => {
    expect(ownerIndependenceScore(38)).toBe(38)
  })

  it("clamps out-of-range input into 0-100", () => {
    expect(ownerIndependenceScore(-5)).toBe(0)
    expect(ownerIndependenceScore(140)).toBe(100)
  })
})

describe("customerConcentrationScore", () => {
  it("computes 100 minus the top-customer share for Fieldstone's 19%", () => {
    expect(customerConcentrationScore(19)).toBe(81)
  })

  it("scores a 0% share as perfectly diversified", () => {
    expect(customerConcentrationScore(0)).toBe(100)
  })

  it("clamps a >100% share at 0, not negative", () => {
    expect(customerConcentrationScore(150)).toBe(0)
  })
})

describe("sbaLendabilityScore", () => {
  it("returns a flat low floor when the business is not SBA eligible, regardless of DSCR", () => {
    expect(sbaLendabilityScore({ eligible: false, dscr: 4.4, dscrFloor: 1.25 })).toBe(25)
    expect(sbaLendabilityScore({ eligible: false, dscr: 0.1, dscrFloor: 1.25 })).toBe(25)
  })

  it("scores a DSCR sitting exactly at the floor as a bare pass (55)", () => {
    expect(sbaLendabilityScore({ eligible: true, dscr: 1.25, dscrFloor: 1.25 })).toBe(55)
  })

  it("computes Fieldstone's real DSCR headroom (4.4x vs 1.25x floor) as 93", () => {
    // headroom ratio = 4.4 / 1.25 = 3.52; 40 + 3.52 * 15 = 92.8 → rounds to 93
    expect(sbaLendabilityScore({ eligible: true, dscr: 4.4, dscrFloor: 1.25 })).toBe(93)
  })

  it("caps eligible businesses at 95 even with enormous DSCR headroom", () => {
    expect(sbaLendabilityScore({ eligible: true, dscr: 100, dscrFloor: 1.25 })).toBe(95)
  })
})

describe("getScortaSubScores", () => {
  it("returns all 7 pillars from the roadmap's own definition", () => {
    const subScores = getScortaSubScores()
    expect(subScores).toHaveLength(7)
    expect(subScores.map((s) => s.label)).toEqual([
      "Financial Defensibility",
      "Owner Independence",
      "Customer Concentration",
      "SBA Lendability",
      "Operational & Legal Cleanliness",
      "Market Position",
      "Transferability",
    ])
  })

  it("traces the 4 direct fields to PERSONA.scorta unchanged", () => {
    const subScores = getScortaSubScores()
    const byKey = Object.fromEntries(subScores.map((s) => [s.key, s.value]))
    expect(byKey.financial).toBe(PERSONA.scorta.financialHealth)
    expect(byKey.operationalCleanliness).toBe(PERSONA.scorta.documentationQuality)
    expect(byKey.marketPosition).toBe(PERSONA.scorta.marketPosition)
    expect(byKey.transferability).toBe(PERSONA.scorta.transferability)
  })

  it("derives the 3 computed pillars from real persona fields", () => {
    const subScores = getScortaSubScores()
    const byKey = Object.fromEntries(subScores.map((s) => [s.key, s.value]))
    expect(byKey.ownerIndependence).toBe(PERSONA.risk.ownerDependencyScore)
    expect(byKey.customerConcentration).toBe(100 - PERSONA.risk.topCustomerShare)
    expect(byKey.sbaLendability).toBe(93)
  })
})

describe("getPointsToCertified", () => {
  it("computes 13 points for Fieldstone's real 71/100 overall", () => {
    expect(getPointsToCertified(PERSONA.scorta.overall)).toBe(13)
  })

  it("exposes the certified threshold as 84, matching lib/caseChat.ts's stated fact", () => {
    expect(SCORTA_CERTIFIED_THRESHOLD).toBe(84)
  })

  it("goes negative once a score clears the certified threshold", () => {
    expect(getPointsToCertified(90)).toBe(-6)
  })
})
