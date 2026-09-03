import { describe, expect, it } from "vitest"
import { ADVISOR_DONE_STEP, ADVISOR_NOTE_STEP } from "@/lib/site/advisor/intake"
import { QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import {
  advisorAnsweredCount,
  advisorCanGoBack,
  INITIAL_SITE_STATE,
  persistableState,
  type SiteAction,
  siteReducer,
  type SiteState,
} from "@/lib/site/state/reducer"

function run(actions: SiteAction[], from: SiteState = INITIAL_SITE_STATE): SiteState {
  return actions.reduce(siteReducer, from)
}

function answerAll(): SiteState {
  let s = INITIAL_SITE_STATE
  for (const q of QUESTIONS) {
    s = siteReducer(s, { type: "iq/answer", value: q.chips[0]!.v })
    s = siteReducer(s, { type: "iq/advance" })
  }
  return s
}

describe("exitIQ run", () => {
  it("records an answer, marks busy, stores the insight, and bumps the hero tick", () => {
    const s = siteReducer(INITIAL_SITE_STATE, { type: "iq/answer", value: "field" })
    expect(s.iq.answers.type).toBe("field")
    expect(s.iq.busy).toBe(true)
    expect(s.iq.started).toBe(true)
    expect(s.iq.insight).toMatch(/Service businesses/)
    expect(s.funnel.tick).toBe(1)
  })

  it("ignores a second answer while busy", () => {
    const s = run([
      { type: "iq/answer", value: "field" },
      { type: "iq/answer", value: "dist" },
    ])
    expect(s.iq.answers.type).toBe("field")
  })

  it("advances only when busy, and finishes after the last question", () => {
    expect(siteReducer(INITIAL_SITE_STATE, { type: "iq/advance" })).toBe(INITIAL_SITE_STATE)
    const s = answerAll()
    expect(s.iq.done).toBe(true)
    expect(s.iq.busy).toBe(false)
    expect(s.iq.phase).toBe(QUESTION_COUNT - 1)
    expect(Object.keys(s.iq.answers)).toHaveLength(QUESTION_COUNT)
  })

  it("steps back from the result and from a question, but not before the first", () => {
    const done = answerAll()
    const back = siteReducer(done, { type: "iq/back" })
    expect(back.iq.done).toBe(false)
    expect(back.iq.phase).toBe(QUESTION_COUNT - 1)
    expect(siteReducer(INITIAL_SITE_STATE, { type: "iq/back" })).toBe(INITIAL_SITE_STATE)
  })

  it("edits a specific answer and restarts cleanly", () => {
    const done = answerAll()
    const edit = siteReducer(done, { type: "iq/edit", index: 2 })
    expect(edit.iq.phase).toBe(2)
    expect(edit.iq.done).toBe(false)
    const restart = siteReducer(done, { type: "iq/restart" })
    expect(restart.iq.answers).toEqual({})
    expect(restart.iq.phase).toBe(0)
    expect(restart.iq.started).toBe(true)
  })
})

describe("hero funnel", () => {
  it("changes stage, derives the path, and remembers timing and revenue", () => {
    const s = run([
      { type: "funnel/stage", stage: "sellQ1" },
      { type: "funnel/stage", stage: "sellQ2", sellTiming: "now" },
      { type: "funnel/stage", stage: "sellDone", sellRevenue: "1-3" },
    ])
    expect(s.funnel.stage).toBe("sellDone")
    expect(s.funnel.path).toBe("sell")
    expect(s.funnel.sellTiming).toBe("now")
    expect(s.funnel.sellRevenue).toBe("1-3")
    expect(s.funnel.tick).toBe(3)
    expect(siteReducer(s, { type: "funnel/stage", stage: "offer" }).funnel.path).toBe("offer")
  })

  it("hovers paths and boots once", () => {
    const hover = siteReducer(INITIAL_SITE_STATE, { type: "funnel/hover", path: "ready" })
    expect(hover.funnel.path).toBe("ready")
    expect(siteReducer(hover, { type: "funnel/hover", path: "ready" })).toBe(hover)
    const booted = siteReducer(INITIAL_SITE_STATE, { type: "funnel/boot" })
    expect(booted.funnel.boot).toBe(false)
    expect(siteReducer(booted, { type: "funnel/boot" })).toBe(booted)
  })
})

describe("advisor dialog", () => {
  it("opens with prefill from the funnel and closes", () => {
    const s = run([
      { type: "funnel/stage", stage: "offer" },
      { type: "advisor/open", ctx: { onScorePage: false } },
    ])
    expect(s.advisor.open).toBe(true)
    expect(s.advisor.answers.topic).toBe("offer")
    expect(s.advisor.step).toBe(1)
    const closed = siteReducer(s, { type: "advisor/close" })
    expect(closed.advisor.open).toBe(false)
    expect(closed.advisor.answers.topic).toBe("offer")
  })

  it("answers, waits for advance, and walks to the note and done steps", () => {
    let s = siteReducer(INITIAL_SITE_STATE, { type: "advisor/open", ctx: { onScorePage: false } })
    s = siteReducer(s, { type: "advisor/answer", id: "topic", value: "sell" })
    expect(s.advisor.busy).toBe(true)
    expect(s.advisor.ack).toMatch(/likely buyer market/)
    expect(siteReducer(s, { type: "advisor/answer", id: "type", value: "field" }).advisor.answers.type).toBeUndefined()
    s = siteReducer(s, { type: "advisor/advance" })
    expect(s.advisor.step).toBe(1)
    for (const [id, value] of [
      ["type", "field"],
      ["rev", "1-2"],
      ["when", "soon"],
      ["care", "cash"],
    ] as const) {
      s = siteReducer(s, { type: "advisor/answer", id, value })
      s = siteReducer(s, { type: "advisor/advance" })
    }
    expect(s.advisor.step).toBe(ADVISOR_NOTE_STEP)
    expect(advisorAnsweredCount(s.advisor)).toBe(5)
    s = siteReducer(s, { type: "advisor/note", note: "hello" })
    s = siteReducer(s, { type: "advisor/finish" })
    expect(s.advisor.step).toBe(ADVISOR_DONE_STEP)
    expect(advisorCanGoBack(s.advisor)).toBe(true)
    expect(siteReducer(s, { type: "advisor/back" }).advisor.step).toBe(ADVISOR_NOTE_STEP)
    expect(siteReducer(s, { type: "advisor/emailed" }).advisor.emailed).toBe(true)
    const restarted = siteReducer(s, { type: "advisor/restart" })
    expect(restarted.advisor.answers).toEqual({})
    expect(restarted.advisor.open).toBe(true)
  })

  it("cannot go back past prefilled questions", () => {
    const s = run([
      { type: "funnel/stage", stage: "offer" },
      { type: "advisor/open", ctx: { onScorePage: false } },
    ])
    expect(advisorCanGoBack(s.advisor)).toBe(false)
    expect(siteReducer(s, { type: "advisor/back" })).toBe(s)
  })
})

describe("persistence", () => {
  it("hydrates saved answers without reopening the dialog or restoring busy flags", () => {
    const saved = persistableState({
      ...answerAll(),
      advisor: { ...INITIAL_SITE_STATE.advisor, open: true, busy: true, answers: { topic: "sell" } },
    })
    expect(saved.advisor?.open).toBe(false)
    const s = siteReducer(INITIAL_SITE_STATE, { type: "hydrate", state: saved })
    expect(s.iq.done).toBe(true)
    expect(s.iq.busy).toBe(false)
    expect(s.advisor.open).toBe(false)
    expect(s.advisor.answers.topic).toBe("sell")
    expect(s.funnel.boot).toBe(true)
  })
})
