import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { SALE_STAGES } from "@/lib/site/content/stages"
import {
  AS_ONE_OWNER,
  BEFORE_CONTACT_LINE,
  CLOSE_LINE,
  DECISION_IDS,
  DECISIONS,
  OWNER_ANSWERS,
  READY_BEFORE,
  TIMING_LINE,
} from "@/lib/site/decisions/data"
import {
  answeredAt,
  boardAt,
  DECISIONS_SCRIPT,
  ghostRank,
  handledAt,
  letterDetail,
  lettersAt,
  lettersMet,
  lettersOnTable,
  litStageCount,
  ownerAnswer,
  ownerPriority,
  stageLine,
  stageState,
  winnerAt,
} from "@/lib/site/decisions/demo"
import { demoDuration, demoStillFor } from "@/lib/site/demo/clock"
import { formatMillions } from "@/lib/site/format"
import { OFFERS } from "@/lib/site/offers/data"

const BEATS = ["goals", "numbers", "privacy", "market", "meetings", "offers", "close"]

/** The state of each letter at a beat, letter order A to D. */
const states = (beat: string) => lettersAt(beat).map((l) => l.state)
const letter = (beat: string, id: string) => lettersAt(beat).find((l) => l.id === id)!

describe("decisions demo: the script", () => {
  it("plays seven beats named for their stages, in order, inside ten seconds", () => {
    expect(DECISIONS_SCRIPT.prefix).toBe("dec")
    expect(DECISIONS_SCRIPT.beats.map((b) => b.id)).toEqual(BEATS)
    expect(DECISIONS_SCRIPT.beats.map((b) => b.at)).toEqual([0, 1800, 3600, 5400, 6750, 8100, 9450])
    expect(demoDuration(DECISIONS_SCRIPT)).toBe(9450)
    expect(demoDuration(DECISIONS_SCRIPT)).toBeLessThanOrEqual(10_000)
  })

  it("rests on the close, and freezes there for a still", () => {
    expect(DECISIONS_SCRIPT.still).toBe("close")
    expect(demoStillFor("?demo=still", DECISIONS_SCRIPT)).toBe("close")
    expect(demoStillFor("?demo=dec:meetings", DECISIONS_SCRIPT)).toBe("meetings")
    expect(demoStillFor("?demo=fin:note", DECISIONS_SCRIPT)).toBeNull()
  })

  it("speaks each beat as the decision and the owner's answer, or the line on screen", () => {
    const said = Object.fromEntries(DECISIONS_SCRIPT.beats.map((b) => [b.id, b.say]))
    expect(said.goals).toBe("Decision 1 of 4 · Goals. In 1 to 2 years")
    expect(said.privacy).toBe("Decision 2 of 4 · Privacy. Competitors in my service area")
    expect(said.meetings).toBe("Decision 3 of 4 · Meetings. Buyers who have shown their financing")
    expect(said.offers).toBe("Decision 4 of 4 · Offers. Highest chance of closing")
    expect(said.numbers).toBe("Heirloom is working")
    expect(said.market).toBe("Heirloom is working")
    expect(said.close).toBe(CLOSE_LINE)
  })

  it("stands on the first beat when a beat it does not have is asked for", () => {
    expect(boardAt("nonsense")).toEqual(boardAt("goals"))
    expect(litStageCount("nonsense")).toBe(1)
    expect(answeredAt("nonsense")).toEqual(["when"])
  })
})

describe("decisions demo: the owner's path", () => {
  it("plays one owner's four answers, each a real answer of its decision", () => {
    expect(OWNER_ANSWERS).toEqual({
      when: "when:mid",
      rules: "rules:competitors",
      meet: "meet:financed",
      priority: "priority:certainty",
    })
    DECISION_IDS.forEach((id) => {
      const decision = DECISIONS.find((d) => d.id === id)!
      expect(decision.chips.map((c) => c.v)).toContain(OWNER_ANSWERS[id])
    })
    expect(ownerAnswer("when")).toBe("In 1 to 2 years")
    expect(ownerAnswer("rules")).toBe("Competitors in my service area")
    expect(ownerAnswer("meet")).toBe("Buyers who have shown their financing")
    expect(ownerAnswer("priority")).toBe("Highest chance of closing")
    expect(ownerPriority()).toBe("certainty")
  })

  it("answers one more decision at each decision beat and keeps them at the working beats", () => {
    expect(answeredAt("goals")).toEqual(["when"])
    expect(answeredAt("numbers")).toEqual(["when"])
    expect(answeredAt("privacy")).toEqual(["when", "rules"])
    expect(answeredAt("market")).toEqual(["when", "rules"])
    expect(answeredAt("meetings")).toEqual(["when", "rules", "meet"])
    expect(answeredAt("offers")).toEqual(["when", "rules", "meet", "priority"])
    expect(answeredAt("close")).toEqual(["when", "rules", "meet", "priority"])
  })
})

describe("decisions demo: the stage strip", () => {
  it("lights the decision's own stage, then the stages Heirloom runs after it", () => {
    expect(BEATS.map(litStageCount)).toEqual([1, 3, 4, 5, 6, 7, 8])
    expect(litStageCount("close")).toBe(SALE_STAGES.length)
  })

  it("marks the decision's stage current, the stages behind it done and the rest later", () => {
    expect(boardAt("privacy").current).toBe(3)
    expect(boardAt("numbers").current).toBeNull()
    const cells = SALE_STAGES.map((_, i) => stageState(i, 4, 3))
    expect(cells).toEqual(["done", "done", "done", "current", "later", "later", "later", "later"])
    expect(SALE_STAGES.map((_, i) => stageState(i, 8, null))).toEqual(Array(8).fill("done"))
  })

  it("writes the phone line from the stage the beat stands in", () => {
    expect(stageLine(4, 3)).toBe("Stage 4 of 8 · Privacy")
    expect(stageLine(3, null)).toBe("Stage 3 of 8 · Value")
    expect(stageLine(8, null)).toBe("Stage 8 of 8 · Close")
  })
})

describe("decisions demo: the decision line", () => {
  it("reads the question and the owner's answer at each decision beat", () => {
    const goals = boardAt("goals").decision
    expect(goals.eyebrow).toBe("Decision 1 of 4 · Goals")
    expect(goals.line).toBe("When would you want the sale to close?")
    expect(goals.answer).toBe("In 1 to 2 years")
    expect(goals.caption).toBe(AS_ONE_OWNER)
    const offers = boardAt("offers").decision
    expect(offers.eyebrow).toBe("Decision 4 of 4 · Offers")
    expect(offers.line).toBe("What matters most when you choose the offer?")
    expect(offers.answer).toBe("Highest chance of closing")
  })

  it("adds the stages-before-contact note to the privacy decision only", () => {
    expect(boardAt("privacy").decision.caption).toBe(`${AS_ONE_OWNER} · ${BEFORE_CONTACT_LINE}`)
    expect(boardAt("meetings").decision.caption).toBe(AS_ONE_OWNER)
  })

  it("names the next decision's stage while Heirloom works, and what those stages hand over", () => {
    expect(boardAt("numbers").decision).toEqual({
      eyebrow: "Heirloom is working",
      line: "Next decision at Privacy",
      answer: "Financials, Valuation",
      caption: READY_BEFORE,
    })
    expect(boardAt("market").decision.line).toBe("Next decision at Meetings")
    expect(boardAt("market").decision.answer).toBe("Buyer group")
    expect(SALE_STAGES[1]!.artifact).toBe("Financials")
    expect(SALE_STAGES[2]!.artifact).toBe("Valuation")
    expect(SALE_STAGES[4]!.artifact).toBe("Buyer group")
    expect(READY_BEFORE).toBe("ready before the next decision")
  })

  it("fills the same four lines at the middle beats, so the screen never reserves empty space", () => {
    expect(boardAt("privacy").decision).toEqual({
      eyebrow: "Decision 2 of 4 · Privacy",
      line: "Which buyers must never hear the business is for sale?",
      answer: "Competitors in my service area",
      caption: `${AS_ONE_OWNER} · ${BEFORE_CONTACT_LINE}`,
    })
    expect(boardAt("meetings").decision).toEqual({
      eyebrow: "Decision 3 of 4 · Meetings",
      line: "Which qualified buyers do you want to meet?",
      answer: "Buyers who have shown their financing",
      caption: AS_ONE_OWNER,
    })
    expect(boardAt("market").decision.caption).toBe(READY_BEFORE)
  })

  it("closes on the count of the four decisions against the nine tasks", () => {
    expect(boardAt("close").decision.answer).toBe(CLOSE_LINE)
    expect(boardAt("close").decision.line).toBe("A completed ownership transfer.")
    expect(boardAt("close").decision.caption).toBe(AS_ONE_OWNER)
    expect(boardAt("close").decision.eyebrow).toBe("Diligence, financing, and closing")
    expect(CLOSE_LINE).toBe("Four decisions were yours. Nine tasks were not.")
  })
})

describe("decisions demo: the four letters", () => {
  it("keeps every letter sealed until the exclusion rule turns the competitor's over", () => {
    expect(states("goals")).toEqual(["sealed", "sealed", "sealed", "sealed"])
    expect(states("numbers")).toEqual(["sealed", "sealed", "sealed", "sealed"])
    expect(letter("goals", "A").note).toBe("Not yet received")
    expect(letter("goals", "A").who).toBe("")
    expect(letter("goals", "A").headline).toBe("")
  })

  it("removes the highest headline at the privacy beat, and says so on its own row", () => {
    expect(states("privacy")).toEqual(["sealed", "sealed", "sealed", "removed"])
    const d = letter("privacy", "D")
    expect(d.name).toBe("Offer D")
    expect(d.who).toBe("Strategic buyer")
    expect(d.headline).toBe("$4.65M")
    expect(d.note).toBe("Left the table · Competitor in an overlapping service area")
    expect(d.struck).toBe(true)
    const highest = OFFERS.reduce((a, b) => (b.head > a.head ? b : a), OFFERS[0]!)
    expect(highest.id).toBe("D")
    expect(formatMillions(highest.head)).toBe("$4.65M")
  })

  it("turns the rest face up at the meetings beat and keeps the contingent buyer off the calendar", () => {
    expect(states("meetings")).toEqual(["on", "filtered", "on", "removed"])
    const b = letter("meetings", "B")
    expect(b.note).toBe("Not on the calendar · SBA 7(a), contingent, no prior closes")
    expect(b.shortNote).toBe("Not on the calendar")
    // Only an owner's exclusion strikes a letter through; a buyer kept off the calendar is dimmed, not struck.
    expect(b.struck).toBe(false)
    expect(letter("meetings", "A").note).toBe("On the table · Owns four contractors in the Carolinas")
    expect(letter("meetings", "A").shortNote).toBe("On the table")
    expect(letter("meetings", "A").headline).toBe("$4.30M")
  })

  it("gives the priority's letter the top place and the offer page's closing-risk word", () => {
    expect(states("offers")).toEqual(["on", "filtered", "winner", "removed"])
    const c = letter("offers", "C")
    expect(c.note).toBe("Chosen · High certainty")
    expect(c.rank).toBe(1)
    expect(lettersAt("offers").map((l) => l.rank)).toEqual([2, 3, 1, 4])
    expect(winnerAt(answeredAt("offers"))).toBe("C")
    expect(winnerAt(answeredAt("meetings"))).toBeNull()
    expect(states("close")).toEqual(["on", "filtered", "winner", "removed"])
  })

  it("counts the letters on the table down as the rules and the meeting filter apply", () => {
    expect(lettersOnTable(answeredAt("goals"))).toEqual(["A", "B", "C", "D"])
    expect(lettersOnTable(answeredAt("privacy"))).toEqual(["A", "B", "C"])
    expect(boardAt("goals").onTable).toEqual(["A", "B", "C", "D"])
    expect(boardAt("privacy").onTable).toEqual(["A", "B", "C"])
    expect(boardAt("meetings").onTable).toEqual(["A", "C"])
    expect(boardAt("close").onTable).toEqual(["A", "C"])
    expect(lettersMet(answeredAt("close"))).toEqual(["A", "C"])
  })
})

describe("decisions demo: Heirloom's nine tasks", () => {
  it("counts the tasks each answered decision unlocked, naming the last of them", () => {
    expect(BEATS.map((b) => handledAt(b).count)).toEqual([2, 2, 5, 5, 6, 9, 9])
    expect(handledAt("goals").last).toBe("Build the valuation and sale materials")
    expect(handledAt("privacy").last).toBe("Answer routine diligence questions from approved records")
    expect(handledAt("meetings").last).toBe("Prepare you for buyer meetings")
    expect(handledAt("close").last).toBe("Send a weekly update")
    expect(handledAt("close").total).toBe(9)
  })

  it("writes the handled row as the label, the count and the last task", () => {
    expect(boardAt("privacy").handled.line).toBe(
      "Handled without you · 5 of 9 · Answer routine diligence questions from approved records"
    )
    expect(boardAt("close").handled.line).toBe("Handled without you · 9 of 9 · Send a weekly update")
  })
})

describe("decisions demo: the priorities and the timing", () => {
  it("keeps the four priorities on screen from the first beat and lights one once the offer is chosen", () => {
    BEATS.forEach((beat) => {
      expect(
        boardAt(beat).priorities.map((p) => p.label),
        beat
      ).toEqual([
        "Most cash at closing",
        "Highest chance of closing",
        "Keep future upside",
        "Protect employees and the company name",
      ])
    })
    expect(boardAt("meetings").priorities.filter((p) => p.lit)).toEqual([])
    expect(
      boardAt("offers")
        .priorities.filter((p) => p.lit)
        .map((p) => p.v)
    ).toEqual(["certainty"])
    expect(
      boardAt("close")
        .priorities.filter((p) => p.lit)
        .map((p) => p.v)
    ).toEqual(["certainty"])
  })

  it("states the one timing fact at every beat: it is a fact of the plan, not a consequence", () => {
    expect(BEATS.map((b) => boardAt(b).timing)).toEqual(BEATS.map(() => TIMING_LINE))
  })
})

describe("decisions demo: the previews", () => {
  it("gives every letter a line at every beat, so no row is ever blank", () => {
    const shortNotes = (beat: string) => lettersAt(beat).map((l) => l.shortNote)
    expect(shortNotes("privacy")).toEqual([
      "Not yet received",
      "Not yet received",
      "Not yet received",
      "Left the table",
    ])
    expect(shortNotes("offers")).toEqual([
      "On the table",
      "Not on the calendar",
      "Chosen · High certainty",
      "Left the table",
    ])
    expect(shortNotes("close")).toEqual(shortNotes("offers"))
    expect(lettersAt("meetings").find((l) => l.id === "C")!.note).toBe(
      "On the table · Platform already owns two similar firms"
    )
  })

  it("ranks all four envelopes for cash: D, C, A, B, with the owner's own rules struck", () => {
    const rows = ghostRank("cash")
    const order = [...rows].sort((a, b) => a.rank - b.rank).map((r) => r.id)
    expect(order).toEqual(["D", "C", "A", "B"])
    const d = rows.find((r) => r.id === "D")!
    expect(d.note).toBe("Left the table · removed by your rules")
    expect(d.struck).toBe(true)
    const b = rows.find((r) => r.id === "B")!
    expect(b.note).toBe("Not on the calendar · not met")
    // Dimmed, not struck: the calendar did not take the letter away, the owner's exclusion did.
    expect(b.struck).toBe(false)
    expect(rows.find((r) => r.id === "C")!.struck).toBe(false)
  })

  it("ranks the four envelopes differently for each of the other three priorities", () => {
    const order = (p: "certainty" | "upside" | "team") =>
      [...ghostRank(p)].sort((a, b) => a.rank - b.rank).map((r) => r.id)
    expect(order("certainty")).toEqual(["C", "A", "D", "B"])
    expect(order("upside")).toEqual(["B", "C", "D", "A"])
    expect(order("team")).toEqual(["A", "B", "C", "D"])
  })

  it("reads a letter's four figures, and the record behind the exclusion on the letter it removed", () => {
    expect(letterDetail("A")).toEqual(["Headline $4.30M · Cash $2.75M · Certainty 0.82 · Staff plan 95 of 100"])
    expect(letterDetail("C")[0]).toBe("Headline $4.05M · Cash $3.10M · Certainty 0.93 · Staff plan 55 of 100")
    expect(letterDetail("D")).toEqual([
      "Headline $4.65M · Cash $3.45M · Certainty 0.75 · Staff plan 30 of 100",
      "Two prior acquisitions saw duplicate roles removed within a year.",
    ])
  })
})

describe("decisions demo: the figures live in the data", () => {
  it("types no figure into the section's components", () => {
    const sources = [
      "components/site/home/SellerWorkload.tsx",
      "components/site/home/decisions/StageStrip.tsx",
      "components/site/home/decisions/DecisionLine.tsx",
      "components/site/home/decisions/LetterRow.tsx",
    ].map((f) => readFileSync(f, "utf8"))
    sources.forEach((src, i) => {
      const body = src
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .join("\n")
        // Tailwind's own scale (gap-3, py-2.5, opacity-30, bg-fg/40, grid-cols-8) is layout, not a figure.
        .replace(/[\w-]*(-\[?|:|\/)[\d.]+(px|rem|%|\])?/g, "")
        .replace(/\bh-\d|\bw-\d/g, "")
      expect(body.match(/\$[\d,.]+|\b\d{2,}\b/g) ?? [], String(i)).toEqual([])
    })
  })
})
