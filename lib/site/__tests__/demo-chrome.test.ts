import { describe, expect, it } from "vitest"
import {
  DEMO_COMPANY,
  DEMO_WORD_CAPS,
  demoFrameHeading,
  overLongDemoWords,
  wordCount,
  WORKED_EXAMPLE,
} from "@/lib/site/demo/chrome"

describe("demo chrome", () => {
  it("names the one fictional company and labels every screen a worked example", () => {
    expect(DEMO_COMPANY).toBe("Project Ridgeline")
    expect(WORKED_EXAMPLE).toBe("Worked example")
  })

  it("heads a screen with the company and its subject", () => {
    expect(demoFrameHeading("Adjusted earnings")).toBe("Project Ridgeline · Adjusted earnings")
    expect(demoFrameHeading("Company record")).toBe("Project Ridgeline · Company record")
    expect(demoFrameHeading("")).toBe("Project Ridgeline · ")
  })
})

describe("demo word caps", () => {
  it("caps a section at eight words of heading and thirty of sentence", () => {
    expect(DEMO_WORD_CAPS).toEqual({ heading: 8, sentence: 30 })
  })

  it("counts the words of a line, whatever its spacing", () => {
    expect(wordCount("Financial preparation")).toBe(2)
    expect(wordCount("Four records. One figure buyers can test.")).toBe(7)
    expect(wordCount("  Who   sees what  ")).toBe(3)
    expect(wordCount("")).toBe(0)
    expect(wordCount("   ")).toBe(0)
  })

  it("passes words inside the caps and names every part that runs past one", () => {
    expect(
      overLongDemoWords({
        heading: "Four records. One figure buyers can test.",
        sentence:
          "Before any buyer looks, we reconcile the books, tax return and payroll, and attach a record to every adjustment.",
      })
    ).toEqual([])
    expect(
      overLongDemoWords({
        heading: "Six levels, and nothing at all opens by itself, ever",
        sentence: "One short line.",
      })
    ).toEqual(["heading"])
    expect(
      overLongDemoWords({
        heading: "Six levels, and nothing at all opens by itself, ever",
        sentence: Array.from({ length: 31 }, () => "word").join(" "),
      })
    ).toEqual(["heading", "sentence"])
  })
})
