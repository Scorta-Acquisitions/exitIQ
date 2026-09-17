import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { beatIdAt, beatIndexAt, demoDuration, demoStillFor } from "@/lib/site/demo/clock"
import {
  FOOT_CAPTIONS,
  RIDGELINE_LINES,
  RIDGELINE_RANGE_AFTER,
  RIDGELINE_RANGE_BEFORE,
} from "@/lib/site/financial/data"
import {
  FINANCIAL_SCRIPT,
  type FinancialBeatId,
  footLeftInCosts,
  ledgerAt,
  money,
  recordsLine,
  statusWord,
} from "@/lib/site/financial/demo"

const BEATS: FinancialBeatId[] = ["arrived", "note", "register", "receipts", "invoice", "used"]

const at = (beat: FinancialBeatId) => ledgerAt(beat)
const line = (beat: FinancialBeatId, id: string) => at(beat).lines.find((l) => l.id === id)!
const statuses = (beat: FinancialBeatId) => at(beat).lines.map((l) => l.statusText)

describe("the financial script", () => {
  it("plays six beats in order, the last at 7.74 seconds", () => {
    expect(FINANCIAL_SCRIPT.prefix).toBe("fin")
    expect(FINANCIAL_SCRIPT.beats.map((b) => b.id)).toEqual(BEATS)
    expect(FINANCIAL_SCRIPT.beats.map((b) => b.at)).toEqual([0, 1440, 3060, 4680, 6300, 7740])
    expect(demoDuration(FINANCIAL_SCRIPT)).toBe(7740)
  })

  it("rests on the settled ledger, which is what a still renders", () => {
    expect(FINANCIAL_SCRIPT.still).toBe("used")
    expect(demoStillFor("?demo=still", FINANCIAL_SCRIPT)).toBe("used")
    expect(demoStillFor("?demo=fin:note", FINANCIAL_SCRIPT)).toBe("note")
    expect(demoStillFor("?demo=priv:nda", FINANCIAL_SCRIPT)).toBeNull()
  })

  it("names the demo for assistive technology and speaks each beat on a keyboard step", () => {
    expect(FINANCIAL_SCRIPT.label).toBe("Financial preparation, a worked example that plays itself")
    expect(FINANCIAL_SCRIPT.beats.map((b) => b.say)).toEqual([
      "Four lines as they arrived, none of them settled",
      "Revenue timing, explained by a one-page note",
      "Owner and family compensation, supported by the payroll register",
      "Personal charges, supported by receipts",
      "One-time items, supported by the invoice",
      "Every line supported, and the four places the figure is used",
    ])
  })

  it("reaches every beat by its mark", () => {
    const beatAt = (ms: number) => beatIdAt(beatIndexAt(ms, FINANCIAL_SCRIPT), FINANCIAL_SCRIPT)
    expect(beatAt(0)).toBe("arrived")
    expect(beatAt(1439)).toBe("arrived")
    expect(beatAt(1440)).toBe("note")
    expect(beatAt(6300)).toBe("invoice")
    expect(beatAt(20_000)).toBe("used")
  })
})

describe("ledgerAt: the screen at every beat", () => {
  it("opens with four lines open, nothing settled, and the base figure", () => {
    const view = at("arrived")
    expect(view.lines.map((l) => l.id)).toEqual(["revenue", "ownerComp", "personal", "oneoff"])
    expect(statuses("arrived")).toEqual(["Not counted", "Open", "Open", "Open"])
    expect(view.lines.map((l) => l.settled)).toEqual([false, false, false, false])
    expect(view.lines.map((l) => l.evidence)).toEqual([null, null, null, null])
    expect(view.lines.map((l) => l.meter)).toEqual([0, 0, 0, 0])
    expect(view.lines.map((l) => l.current)).toEqual([false, false, false, false])
    expect(view.foot.figure).toBe(795_200)
    expect(view.foot.figureText).toBe("$795,200")
    expect(view.foot.caption).toBe("Before these four lines")
    expect(view.foot.range).toBe(RIDGELINE_RANGE_BEFORE)
    expect(view.foot.alt).toBeNull()
    expect(view.usedIn.map((u) => u.lit)).toEqual([false, false, false, false])
  })

  it("explains the revenue timing without moving the figure", () => {
    const view = at("note")
    const revenue = line("note", "revenue")
    expect(revenue.statusText).toBe("Timing, explained")
    expect(revenue.evidence).toBe("A one-page note on the basis difference, attached")
    expect(revenue.meter).toBe(100)
    expect(revenue.current).toBe(true)
    expect(view.lines.filter((l) => l.current)).toHaveLength(1)
    expect(view.foot.figure).toBe(795_200)
    expect(view.foot.caption).toBe("A note, not an add-back. The figure does not move.")
    expect(view.foot.range).toBe(RIDGELINE_RANGE_BEFORE)
  })

  it("supports the family payroll with the register and moves the figure to $822,800", () => {
    const view = at("register")
    expect(line("register", "ownerComp").statusText).toBe("Supported")
    expect(line("register", "ownerComp").evidence).toBe("The payroll lines and the return, attached")
    expect(line("register", "ownerComp").current).toBe(true)
    expect(statuses("register")).toEqual(["Timing, explained", "Supported", "Open", "Open"])
    expect(view.foot.figure).toBe(822_800)
    expect(view.foot.figureText).toBe("$822,800")
    expect(view.foot.caption).toBe("$27,600 supported by the register")
    expect(view.foot.range).toBe(RIDGELINE_RANGE_BEFORE)
  })

  it("supports the personal charges with receipts and moves the figure to $832,200", () => {
    const view = at("receipts")
    expect(line("receipts", "personal").evidence).toBe("A receipt and a reason for each charge, attached")
    expect(view.foot.figure).toBe(832_200)
    expect(view.foot.caption).toBe("$9,400 supported by receipts")
    expect(view.foot.range).toBe(RIDGELINE_RANGE_BEFORE)
  })

  it("supports the one-time item and lifts the valuation range with the last line", () => {
    const view = at("invoice")
    expect(line("invoice", "oneoff").evidence).toBe(
      "The invoice and the settlement letter, with 2025 legal costs beside them"
    )
    expect(statuses("invoice")).toEqual(["Timing, explained", "Supported", "Supported", "Supported"])
    expect(view.foot.figure).toBe(845_000)
    expect(view.foot.figureText).toBe("$845,000")
    expect(view.foot.caption).toBe("Shown to buyers, every line supported")
    expect(view.foot.range).toBe(RIDGELINE_RANGE_AFTER)
    expect(view.foot.alt).toBeNull()
  })

  it("lights the four places the figure is used, and names the figure without the register", () => {
    const view = at("used")
    expect(view.usedIn).toEqual([
      { label: "Valuation", lit: true },
      { label: "Buyer materials", lit: true },
      { label: "Lender package", lit: true },
      { label: "Diligence answers", lit: true },
    ])
    expect(view.foot.figure).toBe(845_000)
    expect(view.foot.alt).toBe("$817,400 if the family payroll stays in costs")
    expect(view.lines.map((l) => l.current)).toEqual([false, false, false, false])
  })

  it("reads an unknown beat as the first one, so a stale URL never renders a blank screen", () => {
    expect(ledgerAt("nonsense").foot.figure).toBe(795_200)
    expect(ledgerAt("nonsense").foot.caption).toBe(FOOT_CAPTIONS.base)
  })
})

describe("the one alternative: the family payroll left in costs", () => {
  it("shows $817,400 and the lower range with no record behind the add-back", () => {
    expect(footLeftInCosts()).toEqual({
      figure: 817_400,
      figureText: "$817,400",
      caption: "if the family payroll stays in costs",
      range: RIDGELINE_RANGE_BEFORE,
      alt: null,
    })
  })

  it("re-keys the family payroll line to Left in costs and drops its meter and record", () => {
    const view = ledgerAt("used", true)
    const owner = view.lines.find((l) => l.id === "ownerComp")!
    expect(owner.status).toBe("removed")
    expect(owner.statusText).toBe("Left in costs")
    expect(owner.meter).toBe(0)
    expect(owner.evidence).toBeNull()
    expect(view.foot.figureText).toBe("$817,400")
    expect(view.foot.range).toBe(RIDGELINE_RANGE_BEFORE)
    expect(view.lines.filter((l) => l.status === "supported").map((l) => l.id)).toEqual([
      "revenue",
      "personal",
      "oneoff",
    ])
  })

  it("previews nothing before the demo has settled that line", () => {
    expect(ledgerAt("arrived", true)).toEqual(ledgerAt("arrived"))
    expect(ledgerAt("note", true)).toEqual(ledgerAt("note"))
    expect(ledgerAt("register", true).foot.figureText).toBe("$817,400")
  })
})

describe("the line strings", () => {
  it("writes the revenue records with the difference closing them", () => {
    expect(recordsLine(RIDGELINE_LINES[0]!)).toBe("Books $4,262,000 · Tax return $4,240,000 · $22,000 apart")
  })

  it("writes a counted line's records as its two figures, or its one", () => {
    expect(recordsLine(RIDGELINE_LINES[1]!)).toBe("Tax return $186,400 · Payroll register $214,000")
    expect(recordsLine(RIDGELINE_LINES[2]!)).toBe("Vehicle and travel, 2025 $9,400")
  })

  it("puts the amount in the column for every line but the revenue timing", () => {
    expect(at("arrived").lines.map((l) => l.amount)).toEqual([null, "$27,600", "$9,400", "$12,800"])
  })

  it("gives the revenue line its own words and every other line the shared nouns", () => {
    expect(statusWord(RIDGELINE_LINES[0]!, "open")).toBe("Not counted")
    expect(statusWord(RIDGELINE_LINES[0]!, "supported")).toBe("Timing, explained")
    expect(statusWord(RIDGELINE_LINES[1]!, "open")).toBe("Open")
    expect(statusWord(RIDGELINE_LINES[1]!, "removed")).toBe("Left in costs")
    expect(money(845_000)).toBe("$845,000")
  })
})

describe("no figure is typed into a component", () => {
  /** The file with its comments taken out: what a visitor can read is what ships in the markup. */
  const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
  const sources = ["components/site/home/FinancialPrep.tsx", "components/site/home/financial/LedgerLine.tsx"].map(
    (path) => [path, code(readFileSync(join(process.cwd(), path), "utf8"))] as const
  )

  it("holds no dollar figure and no thousands literal", () => {
    sources.forEach(([path, src]) => {
      expect(src, path).not.toMatch(/\$\s?\d/)
      expect(src, path).not.toMatch(/\b\d{3}[,_]\d{3}\b/)
      expect(src, path).not.toMatch(/\b\d{4,}\b/)
    })
  })

  it("holds none of the words the data owns", () => {
    sources.forEach(([path, src]) => {
      expect(src, path).not.toMatch(/Supported|Left in costs|Not counted|Worked example|Ridgeline/)
    })
  })
})
