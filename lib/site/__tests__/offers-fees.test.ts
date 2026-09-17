import { describe, expect, it } from "vitest"
import {
  computeFees,
  DEFAULT_FEE_INPUTS,
  FEE_RATE_MAX,
  FEE_RATE_MIN,
  FEE_RATE_STEP,
  NO_COMPARISON,
  RATE_INVALID,
  RATE_LARGE,
  RATE_PENDING,
} from "@/lib/site/fees/calc"
import { formatDollars, formatMillions, padIndex } from "@/lib/site/format"
import { letterTitle, type Offer, PRIORITIES } from "@/lib/site/offers/data"
import {
  certaintyLabel,
  closingRisk,
  findOffer,
  offerScore,
  paidLater,
  rankFor,
  rankOffers,
  rankOrder,
  retained,
} from "@/lib/site/offers/score"

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

  it("orders every letter for a priority, the strongest fit first", () => {
    expect(rankOrder("cash")).toEqual(["D", "C", "A", "B"])
    expect(rankOrder("certainty")).toEqual(["C", "A", "D", "B"])
    expect(rankOrder("upside")).toEqual(["B", "C", "D", "A"])
    expect(rankOrder("team")).toEqual(["A", "B", "C", "D"])
    expect(rankOrder("certainty", [findOffer("A")!, findOffer("C")!])).toEqual(["C", "A"])
  })

  it("keeps the letters' own order when two score the same, whichever way they are given", () => {
    const a = findOffer("A")!
    // The same letter twice: one score, so only the input order can decide the ranking.
    const twin: Offer = { ...a, id: "B" }
    expect(offerScore(twin, "cash")).toBe(offerScore(a, "cash"))
    expect(rankOrder("cash", [a, twin])).toEqual(["A", "B"])
    expect(rankOrder("cash", [twin, a])).toEqual(["B", "A"])
  })

  it("refuses to rank no letters at all", () => {
    expect(() => rankOffers("cash", [])).toThrow("rankOffers requires at least one offer")
  })

  it("numbers every letter's place for a priority, 1 for the strongest fit", () => {
    expect(rankFor("cash")).toEqual({ A: 3, B: 4, C: 2, D: 1 })
    expect(rankFor("certainty")).toEqual({ A: 2, B: 4, C: 1, D: 3 })
    expect(rankFor("upside")).toEqual({ A: 4, B: 1, C: 2, D: 3 })
    expect(rankFor("team")).toEqual({ A: 1, B: 2, C: 3, D: 4 })
  })

  it("flags the highest headline price separately from the best fit", () => {
    for (const p of PRIORITIES) expect(rankOffers(p.v).highestHeadlineId).toBe("D")
  })

  it("scores risk-adjusted value, one figure per priority", () => {
    expect(offerScore(findOffer("C")!, "cash")).toBeCloseTo(3.29, 5)
    expect(offerScore(findOffer("C")!, "certainty")).toBeCloseTo(3.3651, 3)
    expect(offerScore(findOffer("B")!, "upside")).toBeCloseTo(4.846, 3)
    expect(offerScore(findOffer("A")!, "team")).toBeCloseTo(4.7435, 4)
  })

  it("labels certainty bands at their boundaries and derives the amounts a letter shows", () => {
    expect(certaintyLabel(0.93)).toBe("High")
    expect(certaintyLabel(0.88)).toBe("High")
    expect(certaintyLabel(0.8799)).toBe("Moderate")
    expect(certaintyLabel(0.7)).toBe("Moderate")
    expect(certaintyLabel(0.6999)).toBe("Lower")
    expect(paidLater(findOffer("C")!)).toBe("$0.15M")
    expect(paidLater({ ...findOffer("C")!, note: 0, earn: 0 })).toBe("None")
    expect(retained(findOffer("C")!)).toBe("$0.80M")
    expect(retained(findOffer("D")!)).toBe("None")
    expect(closingRisk(findOffer("A")!)).toBe("Moderate · 60 days exclusivity")
    expect(closingRisk(findOffer("C")!)).toBe("High · 45 days exclusivity")
    expect(closingRisk(findOffer("B")!)).toBe("Lower · 90 days exclusivity")
    expect(findOffer("A")!.id).toBe("A")
    expect(findOffer(null)).toBeNull()
  })
})

describe("letterTitle", () => {
  it("heads a letter's terms with its own letter and the buyer behind it", () => {
    expect(letterTitle(findOffer("A")!)).toBe("Letter of intent A · Regional consolidator")
    expect(letterTitle(findOffer("D")!)).toBe("Letter of intent D · Strategic buyer")
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

  it("illustrates up to the $5M ceiling and asks for a quoted rate above it", () => {
    const at = computeFees({ ...DEFAULT_FEE_INPUTS, price: 5_000_000 })
    expect(at.traditional).toBe("$500,000")
    expect(at.difference).toBe("$250,000")
    const over = computeFees({ ...DEFAULT_FEE_INPUTS, price: 5_050_000 })
    expect(over.traditional).toBe(RATE_LARGE)
    expect(over.difference).toBe(NO_COMPARISON)
  })

  it("uses a valid quoted rate", () => {
    const f = computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "8" })
    expect(f.traditional).toBe("$192,000")
    expect(f.difference).toBe("$72,000")
  })

  it("takes both ends of the 1–25 range the input offers", () => {
    expect(FEE_RATE_MIN).toBe(1)
    expect(FEE_RATE_MAX).toBe(25)
    expect(FEE_RATE_STEP).toBe(0.5)
    const low = computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "1" })
    expect(low.traditional).toBe("$24,000")
    expect(low.difference).toBe("$-96,000")
    const high = computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "25" })
    expect(high.traditional).toBe("$600,000")
    expect(high.difference).toBe("$480,000")
  })

  it("waits for a quoted rate and rejects impossible ones", () => {
    expect(computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "" }).traditional).toBe(RATE_PENDING)
    expect(computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: "" }).difference).toBe(NO_COMPARISON)
    expect(NO_COMPARISON).toBe("–")
    expect(RATE_INVALID).toBe("Enter a rate between 1 and 25.")
    for (const bad of ["0", "0.5", "26", "abc"]) {
      const f = computeFees({ ...DEFAULT_FEE_INPUTS, rateMode: "quoted", altRate: bad })
      expect(f.traditional).toBe(RATE_INVALID)
      expect(f.difference).toBe(NO_COMPARISON)
    }
  })
})
