import { describe, expect, it } from "vitest"
import { HARD_PARTS, SALE_STAGES, type SaleStage, TIMING_ROWS } from "@/lib/site/content/stages"

const STAGE_FIELDS: Array<keyof SaleStage> = ["label", "title", "heirloom", "you", "receive", "artifact"]
const wordCount = (s: string) => s.trim().split(/\s+/).length

describe("SALE_STAGES", () => {
  it("has exactly eight stages in the published order", () => {
    expect(SALE_STAGES).toHaveLength(8)
    expect(SALE_STAGES.map((s) => s.label)).toEqual([
      "Goals",
      "Numbers",
      "Value",
      "Privacy",
      "Market",
      "Meetings",
      "Offers",
      "Close",
    ])
  })

  it("fills every field of every stage with non-empty text", () => {
    for (const stage of SALE_STAGES) {
      for (const field of STAGE_FIELDS) {
        expect(typeof stage[field], `${stage.label}.${field}`).toBe("string")
        expect(stage[field].trim().length, `${stage.label}.${field}`).toBeGreaterThan(0)
      }
    }
  })

  it("uses unique labels, titles, and artifact names so the roadmap never repeats a step", () => {
    for (const field of ["label", "title", "artifact"] as const) {
      const values = SALE_STAGES.map((s) => s[field])
      expect(new Set(values).size, field).toBe(values.length)
    }
  })

  it("keeps every label a single word and every title at most five words", () => {
    for (const stage of SALE_STAGES) {
      expect(wordCount(stage.label), stage.label).toBe(1)
      expect(wordCount(stage.title), stage.title).toBeLessThanOrEqual(5)
      expect(wordCount(stage.title), stage.title).toBeGreaterThanOrEqual(3)
    }
  })

  it("keeps the artifact names short enough for the roadmap badge (at most two words)", () => {
    for (const stage of SALE_STAGES) expect(wordCount(stage.artifact), stage.artifact).toBeLessThanOrEqual(2)
  })

  it("writes the Heirloom, you, and receive lines as complete sentences", () => {
    for (const stage of SALE_STAGES) {
      for (const field of ["heirloom", "you", "receive"] as const) {
        expect(stage[field].endsWith("."), `${stage.label}.${field}`).toBe(true)
        expect(stage[field].charAt(0), `${stage.label}.${field}`).toMatch(/[A-Z]/)
      }
    }
  })

  it("opens every Heirloom line with 'We' and never opens the owner's line with 'We'", () => {
    for (const stage of SALE_STAGES) {
      expect(stage.heirloom.startsWith("We "), stage.label).toBe(true)
      expect(stage.you.startsWith("We "), stage.label).toBe(false)
    }
  })

  it("ends the roadmap with a completed ownership transfer and starts it with the sale plan", () => {
    expect(SALE_STAGES[0]).toMatchObject({ label: "Goals", artifact: "Sale plan" })
    expect(SALE_STAGES[7]).toMatchObject({
      label: "Close",
      artifact: "Ownership transfer",
      receive: "A completed ownership transfer.",
    })
  })

  it("asks nothing of the owner during buyer-market building until serious buyers are ready", () => {
    const market = SALE_STAGES.find((s) => s.label === "Market")
    expect(market?.you).toBe("Nothing until serious buyers are ready.")
  })
})

describe("HARD_PARTS", () => {
  it("lists four failure scenarios with distinct titles and full-sentence bodies", () => {
    expect(HARD_PARTS).toHaveLength(4)
    const titles = HARD_PARTS.map((h) => h.title)
    expect(new Set(titles).size).toBe(4)
    expect(titles).toEqual([
      "The buyer's lender says no",
      "Diligence finds a problem",
      "The buyer tries to lower the price",
      "You change your mind",
    ])
    for (const h of HARD_PARTS) {
      expect(h.body.trim().length, h.title).toBeGreaterThan(40)
      expect(h.body.endsWith("."), h.title).toBe(true)
    }
  })

  it("promises the owner keeps the decision when they withdraw", () => {
    const change = HARD_PARTS.find((h) => h.title === "You change your mind")
    expect(change?.body.endsWith("The decision remains yours.")).toBe(true)
  })
})

describe("TIMING_ROWS", () => {
  it("has four [phase, timing] pairs with unique phase names", () => {
    expect(TIMING_ROWS).toHaveLength(4)
    for (const row of TIMING_ROWS) {
      expect(row).toHaveLength(2)
      expect(row[0].trim().length).toBeGreaterThan(0)
      expect(row[1].trim().length).toBeGreaterThan(0)
    }
    expect(TIMING_ROWS.map((r) => r[0])).toEqual(["Preparation", "Buyer process", "Diligence and financing", "Closing"])
  })

  it("does not promise a fixed number of weeks or months for any phase", () => {
    for (const [, timing] of TIMING_ROWS) expect(timing).not.toMatch(/\d/)
  })
})
