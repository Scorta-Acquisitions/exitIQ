import { describe, expect, it } from "vitest"
import { computeFees, DEFAULT_FEE_INPUTS, RATE_INVALID, RATE_LARGE, RATE_PENDING } from "@/lib/site/fees/calc"
import { formatDollars, formatMillions, padIndex } from "@/lib/site/format"
import { OFFERS, PRIORITIES } from "@/lib/site/offers/data"
import { certaintyLabel, findOffer, offerScore, paidLater, rankOffers, retained } from "@/lib/site/offers/score"

describe("format", () => {
  it("formats dollars, millions, and indexes", () => {
    expect(formatDollars(2400000)).toBe("$2,400,000")
    expect(formatDollars(119999.6)).toBe("$120,000")
    expect(formatMillions(4.3)).toBe("$4.30M")
    expect(padIndex(3)).toBe("03")
    expect(padIndex(12)).toBe("12")
  })
})

describe("offer ranking", () => {
  it("picks a different strongest fit for each priority", () => {
    expect(rankOffers("cash").bestId).toBe("D")
    expect(rankOffers("certainty").bestId).toBe("C")
    expect(rankOffers("upside").bestId).toBe("B")
    expect(rankOffers("team").bestId).toBe("A")
  })

  it("flags the highest headline price separately from the best fit", () => {
    for (const p of PRIORITIES) expect(rankOffers(p.v).highestHeadlineId).toBe("D")
  })

  it("scores risk-adjusted value", () => {
    const c = findOffer("C")!
    expect(offerScore(c, "certainty")).toBeGreaterThan(offerScore(findOffer("B")!, "certainty"))
    expect(offerScore(c, "cash")).toBeCloseTo(3.1 + 0.2 * 0.95, 5)
  })

  it("labels certainty bands and derived amounts", () => {
    expect(certaintyLabel(0.93)).toBe("High")
    expect(certaintyLabel(0.75)).toBe("Moderate")
    expect(certaintyLabel(0.62)).toBe("Lower")
    expect(paidLater(findOffer("C")!)).toBe("$0.15M")
    expect(paidLater({ ...findOffer("C")!, note: 0, earn: 0 })).toBe("None")
    expect(retained(findOffer("D")!)).toBe("None")
    expect(findOffer(null)).toBeNull()
    expect(OFFERS).toHaveLength(4)
  })
})

describe("computeFees", () => {
  it("computes the default full-sale case against the 10% illustration", () => {
    const f = computeFees(DEFAULT_FEE_INPUTS)
    expect(f.rateLabel).toBe("5%")
    expect(f.total).toBe("$120,000")
    expect(f.upfront).toBe("$5,000")
    expect(f.credit).toBe("$5,000")
    expect(f.atClose).toBe("$115,000")
    expect(f.traditional).toBe("$240,000")
    expect(f.difference).toBe("$120,000")
  })

  it("charges 2.5% with no commitment for an existing buyer", () => {
    const f = computeFees({ ...DEFAULT_FEE_INPUTS, path: "execution", price: 4_000_000 })
    expect(f.rateLabel).toBe("2.5%")
    expect(f.total).toBe("$100,000")
    expect(f.upfront).toBe("$0")
    expect(f.atClose).toBe("$100,000")
    expect(f.difference).toBe("$300,000")
  })

  it("asks for a quoted rate above the illustration ceiling", () => {
    const f = computeFees({ ...DEFAULT_FEE_INPUTS, price: 7_000_000 })
    expect(f.traditional).toBe(RATE_LARGE)
    expect(f.difference).toBe(RATE_PENDING)
  })

  it("uses a valid quoted rate", () => {
    const f = computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "8" })
    expect(f.traditional).toBe("$192,000")
    expect(f.difference).toBe("$72,000")
  })

  it("waits for a quoted rate and rejects impossible ones", () => {
    expect(computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "" }).traditional).toBe(RATE_PENDING)
    expect(computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "" }).difference).toBe(RATE_PENDING)
    for (const bad of ["0", "-3", "51", "abc"]) {
      const f = computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: bad })
      expect(f.traditional).toBe(RATE_INVALID)
      expect(f.difference).toBe(RATE_INVALID)
    }
  })
})
