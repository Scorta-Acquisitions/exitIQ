import { describe, expect, it } from "vitest"
import { SPEED_COMPARISON, SPEED_RANGE, SPEED_STEPS } from "@/lib/site/content/speed"

const wordCount = (s: string) => s.trim().split(/\s+/).length

describe("SPEED_RANGE", () => {
  it("states the headline comparison as a figure and its continuation", () => {
    expect(SPEED_RANGE.figure).toBe("40%")
    expect(SPEED_RANGE.unit).toBe("faster than a traditional sale.")
    expect(`${SPEED_RANGE.figure} ${SPEED_RANGE.unit}`).toBe("40% faster than a traditional sale.")
  })

  it("draws the comparison as a 100 baseline and a Heirloom bar 40 points shorter", () => {
    expect(SPEED_COMPARISON.bars.map((b) => b.key)).toEqual(["traditional", "heirloom"])
    expect(SPEED_COMPARISON.bars[0]).toEqual({
      key: "traditional",
      label: "Traditional sale",
      pct: 100,
      note: "6 to 9 months",
    })
    expect(SPEED_COMPARISON.bars[1]).toEqual({
      key: "heirloom",
      label: "Heirloom",
      pct: 60,
      note: "3 to 4 months on average",
    })
    expect(100 - SPEED_COMPARISON.bars[1].pct).toBe(40)
    expect(SPEED_COMPARISON.ariaLabel).toBe(
      "Sale length compared: a traditional sale takes six to nine months, Heirloom three to four on average, 40% shorter"
    )
  })
})

describe("SPEED_STEPS", () => {
  it("publishes five steps with unique titles in the order Heirloom works", () => {
    expect(SPEED_STEPS.map((s) => s.title)).toEqual([
      "Prepare before market",
      "Qualify before meetings",
      "Answer from organized records",
      "Run financing and diligence together",
      "Escalate decisions quickly",
    ])
    expect(new Set(SPEED_STEPS.map((s) => s.title)).size).toBe(5)
  })

  it("keeps every title at most five words and every body a single sentence of at most fourteen words", () => {
    for (const s of SPEED_STEPS) {
      expect(wordCount(s.title), s.title).toBeLessThanOrEqual(5)
      expect(wordCount(s.body), s.title).toBeLessThanOrEqual(14)
      expect(s.body.endsWith("."), s.title).toBe(true)
      expect(s.body.slice(0, -1).includes("."), s.title).toBe(false)
    }
  })
})
