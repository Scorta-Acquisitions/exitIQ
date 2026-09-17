import { describe, expect, it } from "vitest"
import { DEMO_WORD_CAPS, overLongDemoWords, wordCount } from "@/lib/site/demo/chrome"
import {
  FIGURE_LABELS,
  FINANCIAL_LINK_LABEL,
  FINANCIAL_SUBJECT,
  FINANCIAL_TITLE,
  FINANCIAL_WORDS,
  FOOT_CAPTIONS,
  RECORDS_APART,
  REVENUE_STATUS_WORD,
  RIDGELINE_BASE,
  RIDGELINE_LINES,
  RIDGELINE_RANGE_AFTER,
  RIDGELINE_RANGE_BEFORE,
  RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT,
  STATUS_WORD,
  USED_IN_ITEMS,
} from "@/lib/site/financial/data"

/** Every line of copy the demo can show, with where it came from, for the copy-rule scans. */
function copyLines(): Array<[string, string]> {
  const out: Array<[string, string]> = [
    ["words.heading", FINANCIAL_WORDS.heading],
    ["words.sentence", FINANCIAL_WORDS.sentence],
    ["link", FINANCIAL_LINK_LABEL],
    ["caption.base", FOOT_CAPTIONS.base],
    ["caption.note", FOOT_CAPTIONS.note],
    ["caption.register", FOOT_CAPTIONS.register("$27,600")],
    ["caption.receipts", FOOT_CAPTIONS.receipts("$9,400")],
    ["caption.shown", FOOT_CAPTIONS.shown],
    ["caption.leftInCosts", FOOT_CAPTIONS.leftInCosts],
    ["records.apart", RECORDS_APART("$22,000")],
  ]
  USED_IN_ITEMS.forEach((item) => out.push([`usedIn.item ${item}`, item]))
  Object.values(FIGURE_LABELS).forEach((label) => out.push([`figure.label ${label}`, label]))
  Object.values(STATUS_WORD).forEach((word) => out.push([`status ${word}`, word]))
  Object.values(REVENUE_STATUS_WORD).forEach((word) => out.push([`revenue status ${word}`, word]))
  RIDGELINE_LINES.forEach((line) => {
    out.push([`${line.id}.label`, line.label], [`${line.id}.evidence`, line.evidence])
    line.records.forEach(([name]) => out.push([`${line.id}.record ${name}`, name]))
  })
  return out
}

describe("financial data: the few words beside the screen", () => {
  it("keeps the heading and sentence inside the demo's word caps", () => {
    expect(overLongDemoWords(FINANCIAL_WORDS)).toEqual([])
    expect(wordCount(FINANCIAL_WORDS.heading)).toBe(2)
    expect(wordCount(FINANCIAL_WORDS.sentence)).toBe(23)
    expect(DEMO_WORD_CAPS.sentence).toBe(30)
  })

  it("names the section, its screen and its one link", () => {
    expect(FINANCIAL_TITLE).toBe("Financial preparation")
    expect(FINANCIAL_WORDS.heading).toBe(FINANCIAL_TITLE)
    expect(FINANCIAL_WORDS.sentence).toBe(
      "Before any buyer sees the business, we reconcile the books, tax returns, and payroll. Buyers, lenders, and diligence all get the same figures."
    )
    expect(FINANCIAL_LINK_LABEL).toBe("How the reconciliation works")
    expect(FINANCIAL_SUBJECT).toBe("Adjusted earnings")
  })
})

describe("financial data: Ridgeline's figures reconcile", () => {
  it("sums the four lines to $71,800 and the three that rest on earnings to $49,800", () => {
    expect(RIDGELINE_LINES.map((l) => l.id)).toEqual(["revenue", "ownerComp", "personal", "oneoff"])
    expect(RIDGELINE_LINES.reduce((s, l) => s + l.amount, 0)).toBe(71_800)
    expect(RIDGELINE_LINES.filter((l) => l.countsInOpen).reduce((s, l) => s + l.amount, 0)).toBe(49_800)
    expect(RIDGELINE_LINES.find((l) => l.id === "revenue")!.countsInOpen).toBe(false)
  })

  it("opens on $795,200 of adjusted earnings that never needed an adjustment", () => {
    expect(RIDGELINE_BASE).toBe(795_200)
  })

  it("puts the family payroll between the two adjusted-earnings figures", () => {
    expect(845_000 - 27_600).toBe(RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT)
    expect(RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT).toBe(817_400)
  })

  it("keeps each line's amount as the difference of its two records, or the one record's value", () => {
    RIDGELINE_LINES.forEach((line) => {
      const values = line.records.map(([, v]) => v)
      const expected = values.length === 2 ? Math.abs(values[0]! - values[1]!) : values[0]
      expect(line.amount, line.id).toBe(expected)
    })
  })

  it("writes the two valuation ranges as X to Y", () => {
    expect(RIDGELINE_RANGE_BEFORE).toBe("$2.86M to $3.38M")
    expect(RIDGELINE_RANGE_AFTER).toBe("$2.96M to $3.49M")
  })
})

describe("financial data: the words on the screen", () => {
  it("writes the status words as nouns, one vocabulary for the revenue timing", () => {
    expect(STATUS_WORD).toEqual({ supported: "Supported", open: "Open", removed: "Left in costs" })
    expect(REVENUE_STATUS_WORD).toEqual({ open: "Not counted", supported: "Timing, explained" })
    expect(RIDGELINE_LINES.find((l) => l.id === "revenue")!.statusWords).toBe(REVENUE_STATUS_WORD)
    RIDGELINE_LINES.filter((l) => l.id !== "revenue").forEach((l) => expect(l.statusWords, l.id).toBeUndefined())
    expect(RECORDS_APART("$22,000")).toBe("$22,000 apart")
  })

  it("captions the figure with what moved it, or why it did not move", () => {
    expect(FOOT_CAPTIONS.base).toBe("Before these four lines")
    expect(FOOT_CAPTIONS.note).toBe("A note, not an add-back. The figure does not move.")
    expect(FOOT_CAPTIONS.register("$27,600")).toBe("$27,600 supported by the register")
    expect(FOOT_CAPTIONS.receipts("$9,400")).toBe("$9,400 supported by receipts")
    expect(FOOT_CAPTIONS.shown).toBe("Shown to buyers, every line supported")
    expect(FOOT_CAPTIONS.leftInCosts).toBe("if the family payroll stays in costs")
  })

  it("labels the foot and lists the four places the figure is used", () => {
    expect(FIGURE_LABELS).toEqual({
      earnings: "Adjusted earnings",
      valuation: "Valuation",
      usedIn: "Used in",
    })
    expect(USED_IN_ITEMS).toEqual(["Valuation", "Buyer materials", "Lender package", "Diligence answers"])
  })
})

describe("financial data: the copy rules", () => {
  const lines = copyLines()

  it("keeps every line to at most two sentences", () => {
    lines.forEach(([where, text]) => expect(text.split(". ").length, where).toBeLessThanOrEqual(2))
  })

  it("never uses a dash, a semicolon, an exclamation mark, or the word LIVE", () => {
    lines.forEach(([where, text]) => {
      expect(text, where).not.toMatch(/[—;!]/)
      expect(text, where).not.toMatch(/\bLIVE\b/)
    })
  })

  it("writes ranges as X to Y, never with a dash between the figures", () => {
    lines.forEach(([where, text]) => expect(text, where).not.toMatch(/\$[\d.,]+[MK]?\s?[–-]\s?\$/))
    expect(RIDGELINE_RANGE_BEFORE).toContain(" to ")
    expect(RIDGELINE_RANGE_AFTER).toContain(" to ")
  })

  it("states no market statistic and no stage duration: no percentage, no span of months or weeks", () => {
    lines.forEach(([where, text]) => {
      expect(text, where).not.toMatch(/\d\s?%/)
      expect(text, where).not.toMatch(/\b\d+ to \d+ (months?|weeks?)\b/)
      expect(text, where).not.toMatch(/\b(takes|within|in about) \d+ (months?|weeks?)\b/)
    })
  })

  it("makes no frequency claim beyond the site's data: nothing is common, usual, typical, or true of most owners", () => {
    lines.forEach(([where, text]) => {
      expect(text, where).not.toMatch(/\b(common|commonly|usually|often|typically|most owners|for most)\b/i)
    })
  })
})
