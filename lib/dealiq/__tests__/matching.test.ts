/**
 * Mandate ↔ listing matching — synthetic fixtures only, per Execution Plan §1:
 * a total swap of `lib/dealiq/data/` must not touch this file.
 */

import { describe, expect, it } from "vitest"

import { COMPONENT_LABEL, MATCH_WEIGHTS, matchScore, rankListings } from "@/lib/dealiq/matching"
import type { CertifiedListing, Mandate, MatchComponentKey } from "@/lib/dealiq/types"

// ── Fixtures ─────────────────────────────────────────────────────────────────

const MANDATE: Mandate = {
  industries: ["Synthetic Industry A", "Synthetic Industry B"],
  geographies: ["Synthetic Region One"],
  evBand: { low: 1_000_000, high: 3_000_000 },
  sdeFloor: 300_000,
  maxOwnerDependency: 60,
}

function listing(overrides: Partial<CertifiedListing>): CertifiedListing {
  return {
    id: "synthetic-listing",
    name: "Synthetic Listing Co",
    industry: "Synthetic Industry A",
    geography: "Synthetic Region One",
    ask: 2_000_000,
    sde: 500_000,
    scortaScore: 80,
    certifiedOn: "2026-01-01",
    openMarketOn: "2026-02-01",
    certificationBasis: ["Synthetic basis"],
    ownerDependencyScore: 30,
    topCustomerShare: 0.2,
    sbaEligible: true,
    ...overrides,
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("matchScore", () => {
  it("weights sum to 1", () => {
    const total = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(1, 10)
  })

  it("scores a full-fit listing at 100 with every component at 1", () => {
    const match = matchScore(listing({}), MANDATE)
    expect(match.score).toBeCloseTo(100, 6)
    for (const component of match.components) {
      expect(component.score).toBe(1)
    }
  })

  it("drops exactly the industry weight on an industry mismatch", () => {
    const match = matchScore(listing({ industry: "Unrelated Industry" }), MANDATE)
    expect(match.score).toBeCloseTo(100 * (1 - MATCH_WEIGHTS.industry), 6)
  })

  it("drops exactly the geography weight on a geography mismatch", () => {
    const match = matchScore(listing({ geography: "Unrelated Region" }), MANDATE)
    expect(match.score).toBeCloseTo(100 * (1 - MATCH_WEIGHTS.geography), 6)
  })

  it("decays the EV component with distance outside the band and floors it at 0", () => {
    const inside = matchScore(listing({ ask: 2_500_000 }), MANDATE)
    const near = matchScore(listing({ ask: 3_500_000 }), MANDATE)
    const far = matchScore(listing({ ask: 9_000_000 }), MANDATE)
    const evOf = (m: typeof inside) => m.components.find((c) => c.key === "ev_band")?.score ?? -1
    expect(evOf(inside)).toBe(1)
    expect(evOf(near)).toBeCloseTo(0.75, 6) // 500K over a 2M band width
    expect(evOf(far)).toBe(0)
  })

  it("scores a near-miss SDE proportionally rather than zero", () => {
    const match = matchScore(listing({ sde: 240_000 }), MANDATE)
    const sde = match.components.find((c) => c.key === "sde_floor")
    expect(sde?.score).toBeCloseTo(0.8, 6)
  })

  it("scores 0 when nothing fits at all", () => {
    const match = matchScore(
      listing({ industry: "Unrelated", geography: "Unrelated", ask: 50_000_000, sde: 0 }),
      MANDATE
    )
    expect(match.score).toBe(0)
  })

  it("keeps every component inside 0-1 with a labelled, non-empty basis", () => {
    const keys: ReadonlyArray<MatchComponentKey> = ["industry", "geography", "ev_band", "sde_floor"]
    const match = matchScore(listing({ industry: "Unrelated", ask: 3_400_000, sde: 100_000 }), MANDATE)
    expect(match.components.map((c) => c.key)).toEqual(keys)
    for (const component of match.components) {
      expect(component.score).toBeGreaterThanOrEqual(0)
      expect(component.score).toBeLessThanOrEqual(1)
      expect(component.basis.trim().length).toBeGreaterThan(0)
      expect(component.label).toBe(COMPONENT_LABEL[component.key])
    }
  })
})

describe("rankListings", () => {
  it("sorts by score descending and keeps input order on ties", () => {
    const listings = [
      listing({ id: "weak", industry: "Unrelated", geography: "Unrelated" }),
      listing({ id: "full-first" }),
      listing({ id: "full-second" }),
      listing({ id: "partial", geography: "Unrelated Region" }),
    ]
    const ranked = rankListings(listings, MANDATE)
    expect(ranked.map((r) => r.listing.id)).toEqual(["full-first", "full-second", "partial", "weak"])
    const scores = ranked.map((r) => r.match.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it("does not mutate the input and pairs every listing with its own match", () => {
    const listings = [listing({ id: "a" }), listing({ id: "b", industry: "Unrelated" })]
    const before = listings.map((l) => l.id)
    const ranked = rankListings(listings, MANDATE)
    expect(listings.map((l) => l.id)).toEqual(before)
    for (const row of ranked) {
      expect(row.match.listingId).toBe(row.listing.id)
    }
  })
})
