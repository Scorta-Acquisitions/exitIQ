import { describe, expect, it } from "vitest"

import {
  daysAgoLabel,
  FIELDSTONE_MANDATE,
  getMandateMatches,
  getNetworkFunnel,
  getShortlistedBuyers,
  matchesMandate,
  NETWORK_BUYERS,
} from "@/lib/buyerNetwork"

describe("daysAgoLabel", () => {
  it("labels 0 as Today", () => {
    expect(daysAgoLabel(0)).toBe("Today")
  })

  it("labels 1 as Yesterday", () => {
    expect(daysAgoLabel(1)).toBe("Yesterday")
  })

  it("labels n>1 as 'n days ago'", () => {
    expect(daysAgoLabel(5)).toBe("5 days ago")
    expect(daysAgoLabel(14)).toBe("14 days ago")
  })
})

describe("matchesMandate", () => {
  it("matches a buyer whose industry, geography, and EV band all align with the deal", () => {
    expect(
      matchesMandate({
        mandate: {
          industries: ["Digital Marketing Agency"],
          geographies: ["Northern New Jersey"],
          evLow: 1_000_000,
          evHigh: 2_000_000,
        },
      }),
    ).toBe(true)
  })

  it("rejects a buyer with the right geography/EV but an unrelated industry", () => {
    expect(
      matchesMandate({
        mandate: {
          industries: ["B2B SaaS"],
          geographies: ["Northern New Jersey"],
          evLow: 1_000_000,
          evHigh: 2_000_000,
        },
      }),
    ).toBe(false)
  })

  it("rejects a buyer with the right industry/EV but an out-of-region geography", () => {
    expect(
      matchesMandate({
        mandate: {
          industries: ["Digital Marketing Agency"],
          geographies: ["Texas"],
          evLow: 1_000_000,
          evHigh: 2_000_000,
        },
      }),
    ).toBe(false)
  })

  it("rejects a buyer with the right industry/geography but a non-overlapping EV band", () => {
    expect(
      matchesMandate({
        mandate: {
          industries: ["Digital Marketing Agency"],
          geographies: ["Northern New Jersey"],
          evLow: 5_000_000,
          evHigh: 10_000_000,
        },
      }),
    ).toBe(false)
  })

  it("treats 'National' as covering Fieldstone's Northern NJ geography", () => {
    expect(
      matchesMandate({
        mandate: {
          industries: ["Digital Marketing Agency"],
          geographies: ["National"],
          evLow: 1_000_000,
          evHigh: 2_000_000,
        },
      }),
    ).toBe(true)
  })

  it("treats an EV band that only partially overlaps the deal range as a match", () => {
    // Deal range is $1.6M-$1.9M; a buyer band of $900K-$1.8M overlaps at the top end.
    expect(
      matchesMandate({
        mandate: {
          industries: ["Digital Marketing Agency"],
          geographies: ["Northern New Jersey"],
          evLow: 900_000,
          evHigh: 1_800_000,
        },
      }),
    ).toBe(true)
  })

  it("uses FIELDSTONE_MANDATE as the default deal profile, sourced from PERSONA", () => {
    expect(FIELDSTONE_MANDATE.industries).toEqual(["Digital Marketing Agency"])
    expect(FIELDSTONE_MANDATE.geographies).toEqual(["Northern New Jersey"])
    expect(FIELDSTONE_MANDATE.evLow).toBe(1_600_000)
    expect(FIELDSTONE_MANDATE.evHigh).toBe(1_900_000)
  })
})

describe("NETWORK_BUYERS pool", () => {
  it("contains 40 total buyers — 3 shortlisted + 37 seeded pool records", () => {
    expect(NETWORK_BUYERS).toHaveLength(40)
    expect(NETWORK_BUYERS.filter((b) => b.tier === "pool")).toHaveLength(37)
  })

  it("has unique ids across the whole pool", () => {
    const ids = NETWORK_BUYERS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("getShortlistedBuyers", () => {
  it("returns exactly the 3 buyers mirrored from OutreachStation.tsx's BUYERS", () => {
    const shortlisted = getShortlistedBuyers()
    expect(shortlisted.map((b) => b.name)).toEqual([
      "Marcus Rivera",
      "David Chen",
      "Graham Voss",
    ])
  })
})

describe("getNetworkFunnel", () => {
  it("resolves to 9 mandate matches → 3 shortlisted → 2 sequences live", () => {
    const funnel = getNetworkFunnel()
    expect(funnel.totalBuyers).toBe(40)
    expect(funnel.mandateMatches).toBe(9)
    expect(funnel.shortlisted).toBe(3)
    expect(funnel.sequencesLive).toBe(2)
  })

  it("includes all 3 shortlisted buyers in the mandate-match set", () => {
    const matchIds = new Set(getMandateMatches().map((b) => b.id))
    expect(matchIds.has("marcus")).toBe(true)
    expect(matchIds.has("david")).toBe(true)
    expect(matchIds.has("search_fund")).toBe(true)
  })
})
