import { describe, expect, it } from "vitest"
import { ADVISOR_ACK, ADVISOR_QUESTIONS } from "@/lib/site/advisor/data"
import {
  ADVISOR_DONE_STEP,
  ADVISOR_NOTE_STEP,
  bookingUrl,
  briefingRows,
  briefingText,
  callAgenda,
  INITIAL_ADVISOR_STATE,
  nextStep,
  openAdvisor,
  type PrefillContext,
  prefillFromSite,
  prevStep,
  progressLabel,
} from "@/lib/site/advisor/intake"

const BLANK: PrefillContext = { stage: "route", onScorePage: false, iqAnswers: {}, sellTiming: null, sellRevenue: null }

describe("the acknowledgement table", () => {
  const keys = ADVISOR_QUESTIONS.flatMap((q) => q.chips.map(([v]) => `${q.id}:${v}`))

  it("answers all 24 chips of the five questions, and holds a line for nothing else", () => {
    expect(keys).toHaveLength(24)
    expect(Object.keys(ADVISOR_ACK)).toHaveLength(24)
    expect([...Object.keys(ADVISOR_ACK)].sort()).toEqual([...keys].sort())
  })

  it("says something in a full sentence for every one of them", () => {
    for (const k of keys) {
      const line = ADVISOR_ACK[k]
      expect(typeof line, k).toBe("string")
      expect(line!.length, k).toBeGreaterThan(20)
      expect(line!.endsWith("."), k).toBe(true)
    }
  })
})

describe("prefillFromSite", () => {
  it("prefills nothing from a cold visit", () => {
    expect(prefillFromSite(BLANK)).toEqual({ answers: {}, labels: {} })
  })

  it("carries the offer path into the topic", () => {
    const p = prefillFromSite({ ...BLANK, stage: "offer" })
    expect(p.answers.topic).toBe("offer")
    expect(p.labels.topic).toBe("An offer or buyer I already have")
  })

  it("carries exitIQ answers and the sell funnel", () => {
    const p = prefillFromSite({
      ...BLANK,
      stage: "sellDone",
      iqAnswers: { type: "dist" },
      sellTiming: "now",
      sellRevenue: "3-10",
    })
    expect(p.answers).toEqual({ topic: "sell", type: "dist", when: "soon", rev: "3-10" })
    expect(p.labels.rev).toBe("$3M to $10M")
    expect(p.labels.type).toBe("Manufacturing or distribution")
  })

  it("prefers an exitIQ revenue answer over the funnel revenue", () => {
    const p = prefillFromSite({ ...BLANK, iqAnswers: { rev: "1-2" }, sellRevenue: "10+" })
    expect(p.answers.rev).toBe("1-2")
  })

  it("uses the value topic on the score page once answers exist", () => {
    expect(prefillFromSite({ ...BLANK, onScorePage: true, iqAnswers: { rev: "1-2" } }).answers.topic).toBe("value")
    expect(prefillFromSite({ ...BLANK, onScorePage: true }).answers.topic).toBeUndefined()
  })
})

describe("step navigation", () => {
  it("finds the first unanswered question", () => {
    expect(nextStep(0, {})).toBe(0)
    expect(nextStep(0, { topic: "sell" })).toBe(1)
    expect(nextStep(0, { topic: "sell", type: "field", rev: "1-2", when: "soon", care: "cash" })).toBe(
      ADVISOR_NOTE_STEP
    )
    expect(nextStep(3, { when: "soon" })).toBe(4)
  })

  it("skips prefilled questions when stepping back", () => {
    expect(prevStep(2, {})).toBe(1)
    expect(prevStep(2, { type: true })).toBe(0)
    expect(prevStep(1, { topic: true })).toBe(-1)
    expect(prevStep(ADVISOR_DONE_STEP, {})).toBe(4)
  })
})

describe("openAdvisor", () => {
  it("opens at the first question with no acknowledgement on a cold visit", () => {
    const s = openAdvisor(INITIAL_ADVISOR_STATE, BLANK)
    expect(s.open).toBe(true)
    expect(s.step).toBe(0)
    expect(s.ack).toBeNull()
  })

  it("carries prefills, skips them, and explains how many questions remain", () => {
    const s = openAdvisor(INITIAL_ADVISOR_STATE, { ...BLANK, stage: "offer", iqAnswers: { type: "field", rev: "2-3" } })
    expect(s.answers).toEqual({ topic: "offer", type: "field", rev: "2-3" })
    expect(s.prefilled).toEqual({ topic: true, type: true, rev: true })
    expect(s.step).toBe(3)
    expect(s.ack).toBe("Your earlier answers carried over. 2 questions left before booking.")
  })

  it("uses singular copy when one question remains", () => {
    const s = openAdvisor(INITIAL_ADVISOR_STATE, {
      ...BLANK,
      stage: "sellDone",
      iqAnswers: { type: "field", rev: "2-3" },
      sellTiming: "mid",
    })
    expect(s.ack).toMatch(/One question left/)
    expect(s.step).toBe(4)
  })

  it("keeps answers the visitor gave inside the dialog over fresh prefills", () => {
    const typed = { ...INITIAL_ADVISOR_STATE, answers: { topic: "conf" }, step: 1 }
    const s = openAdvisor(typed, { ...BLANK, stage: "offer" })
    expect(s.answers.topic).toBe("conf")
    expect(s.prefilled.topic).toBeUndefined()
  })

  it("replaces an older prefill with a fresh one", () => {
    const prefilled = { ...INITIAL_ADVISOR_STATE, answers: { topic: "sell" }, prefilled: { topic: true as const } }
    const s = openAdvisor(prefilled, { ...BLANK, stage: "offer" })
    expect(s.answers.topic).toBe("offer")
  })

  it("does not rewind a finished briefing", () => {
    const done = { ...INITIAL_ADVISOR_STATE, step: ADVISOR_DONE_STEP }
    expect(openAdvisor(done, { ...BLANK, stage: "offer" }).step).toBe(ADVISOR_DONE_STEP)
  })
})

describe("briefing", () => {
  const state = {
    ...INITIAL_ADVISOR_STATE,
    answers: { topic: "sell", rev: "3-10", care: "team" },
    labels: { rev: "$3M to $10M" },
    note: "Avoid Northgate.",
  }

  it("renders labels from chips or carried labels and marks unanswered rows", () => {
    const text = briefingText(state)
    expect(text).toContain("Conversation: Selling the business")
    expect(text).toContain("Revenue: $3M to $10M")
    expect(text).toContain("Business: Not answered")
    expect(text).toContain("Note for the advisor: Avoid Northgate.")
    const rows = briefingRows(state)
    expect(rows.find((r) => r.label === "Advisor note")?.value).toBe("Attached")
    expect(rows.find((r) => r.label === "Target timing")?.value).toBeNull()
  })

  it("builds the agenda from the topic and swaps the last item for the priority", () => {
    expect(callAgenda({})).toHaveLength(3)
    expect(callAgenda({ topic: "offer" })[0]).toBe("A first read of the offer in front of you")
    expect(callAgenda({ topic: "offer", care: "team" })[2]).toBe(
      "Protecting employees and the company name in buyer selection"
    )
    expect(callAgenda({ topic: "unknown" })[0]).toBe("The likely buyer market for your business")
  })

  it("attaches the briefing to the booking link and cuts a long note at 700 characters", () => {
    const url = bookingUrl(state)
    expect(url).toContain("heirloom.cal.com")
    expect(decodeURIComponent(url)).toContain("Revenue: $3M to $10M")
    const long = new URL(bookingUrl({ ...state, note: "x".repeat(900) }))
    expect(long.searchParams.get("notes")).toHaveLength(700)
  })

  it("carries the five questions and the note, and ends at the note", () => {
    const rows = briefingRows(state)
    expect(rows.map((r) => r.label)).toEqual([
      "Conversation",
      "Business",
      "Revenue",
      "Target timing",
      "Matters most",
      "Advisor note",
    ])
    expect(briefingText(state).endsWith("Note for the advisor: Avoid Northgate.")).toBe(true)
    expect(briefingText({ ...state, note: "" }).endsWith("Matters most: Employees and the company name")).toBe(true)
  })

  it("reports progress against the questions actually asked", () => {
    expect(progressLabel({ step: 0, prefilled: {} })).toEqual({ progress: "QUESTION 1 OF 5", position: 1, total: 5 })
    expect(progressLabel({ step: 3, prefilled: { topic: true, type: true, rev: true } })).toEqual({
      progress: "QUESTION 1 OF 2",
      position: 1,
      total: 2,
    })
    expect(progressLabel({ step: ADVISOR_NOTE_STEP, prefilled: {} }).progress).toBe("OPTIONAL NOTE")
    expect(progressLabel({ step: ADVISOR_DONE_STEP, prefilled: {} }).progress).toBe("BRIEFING READY")
  })
})
