import { describe, expect, it } from "vitest"
import {
  SPEED_COMPARISON,
  SPEED_COPY,
  SPEED_MONTH_TICKS,
  SPEED_MONTHS,
  SPEED_PERCENT,
  SPEED_RANGE,
  SPEED_STEPS,
  speedPercent,
} from "@/lib/site/content/speed"

describe("SPEED_RANGE", () => {
  it("states the headline comparison as a figure and its continuation", () => {
    expect(SPEED_RANGE.figure).toBe("40%")
    expect(SPEED_RANGE.unit).toBe("faster than a traditional sale.")
    expect(`${SPEED_RANGE.figure} ${SPEED_RANGE.unit}`).toBe("40% faster than a traditional sale.")
  })

  it("states the figure as a number the counter can climb to, and prints every step of the climb", () => {
    expect(SPEED_PERCENT).toBe(40)
    expect(speedPercent(SPEED_PERCENT)).toBe("40%")
    expect(speedPercent(0)).toBe("0%")
    expect(speedPercent(12.4)).toBe("12%")
    expect(speedPercent(12.5)).toBe("13%")
  })

  it("marks one month of a traditional sale per tick, from 0 to the ninth, as percentages of the track", () => {
    expect(SPEED_MONTHS).toBe(9)
    expect(SPEED_MONTH_TICKS).toEqual([0, 11.1, 22.2, 33.3, 44.4, 55.6, 66.7, 77.8, 88.9, 100])
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
    expect(SPEED_COMPARISON.ariaLabel).toBe(
      "Sale length compared: a traditional sale takes six to nine months, Heirloom three to four on average, 40% shorter"
    )
  })
})

describe("SPEED_COPY", () => {
  it("holds every other word the section prints, the two timing facts among them", () => {
    expect(SPEED_COPY.eyebrow).toBe("Speed")
    expect(SPEED_COPY.filmLabel).toBe("Two brass hourglasses on green lacquer; the right one runs through faster.")
    expect(SPEED_COPY.explainer).toBe(
      "A traditional sale takes six to nine months from launch to closing. Heirloom closes in three to four on average, because the financial work is finished before launch and buyers are qualified before they take your time."
    )
    expect(SPEED_COPY.howItWorks).toBe("See how it works →")
    expect(SPEED_COPY.fees).toBe("See fees →")
    expect(SPEED_COPY.stepsLabel).toBe("How Heirloom keeps a sale moving")
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

  it("gives each step one sentence of body copy", () => {
    expect(SPEED_STEPS.map((s) => s.body)).toEqual([
      "Books, tax returns, and payroll are reconciled before any buyer sees them.",
      "Buyers sign an NDA and show financing before they take your time.",
      "Routine diligence questions are answered from approved records.",
      "Lender work and buyer diligence run in parallel.",
      "Decisions that need you are raised quickly, and you get a weekly update.",
    ])
  })
})
