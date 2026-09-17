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
    const second = run([{ type: "iq/answer", value: "field" }, { type: "iq/advance" }])
    expect(second.iq.phase).toBe(1)
    const first = siteReducer(second, { type: "iq/back" })
    expect(first.iq.phase).toBe(0)
    expect(first.iq.insight).toBeNull()
    expect(siteReducer(INITIAL_SITE_STATE, { type: "iq/back" })).toBe(INITIAL_SITE_STATE)
  })

  it("edits a specific answer and restarts cleanly", () => {
    const done = answerAll()
    const edit = siteReducer(done, { type: "iq/edit", index: 2 })
    expect(edit.iq.phase).toBe(2)
    expect(edit.iq.done).toBe(false)
    // The index is clamped to the seven questions, so a stale control cannot leave the run.
    expect(siteReducer(done, { type: "iq/edit", index: -1 }).iq.phase).toBe(0)
    expect(siteReducer(done, { type: "iq/edit", index: 99 }).iq.phase).toBe(QUESTION_COUNT - 1)
    const restart = siteReducer(done, { type: "iq/restart" })
    expect(restart.iq.answers).toEqual({})
    expect(restart.iq.phase).toBe(0)
    expect(restart.iq.started).toBe(true)
  })
})

describe("exitIQ guards", () => {
  it("marks the run started without answering anything", () => {
    const s = siteReducer(INITIAL_SITE_STATE, { type: "iq/start" })
    expect(s.iq.started).toBe(true)
    expect(s.iq.phase).toBe(0)
    expect(s.iq.answers).toEqual({})
  })

  it("ignores an answer for a phase past the last question", () => {
    const past = siteReducer(INITIAL_SITE_STATE, {
      type: "hydrate",
      state: { iq: { ...INITIAL_SITE_STATE.iq, phase: QUESTION_COUNT } },
    })
    expect(past.iq.phase).toBe(QUESTION_COUNT)
    expect(siteReducer(past, { type: "iq/answer", value: "field" })).toBe(past)
  })

  it("returns the state it was given for an action it does not know", () => {
    expect(siteReducer(INITIAL_SITE_STATE, { type: "nothing/here" } as unknown as SiteAction)).toBe(INITIAL_SITE_STATE)
  })
})

describe("hero funnel", () => {
  it("wraps the hero tick at twelve, the number of shapes the graph draws", () => {
    let st = INITIAL_SITE_STATE
    for (let i = 0; i < 11; i++) st = siteReducer(st, { type: "funnel/stage", stage: "sellQ1" })
    expect(st.funnel.tick).toBe(11)
    expect(siteReducer(st, { type: "funnel/stage", stage: "sellQ1" }).funnel.tick).toBe(0)
  })

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

describe("advisor guards", () => {
  function opened(): SiteState {
    return siteReducer(INITIAL_SITE_STATE, { type: "advisor/open", ctx: { onScorePage: false } })
  }

  it("closing a dialog that is already closed changes nothing", () => {
    expect(siteReducer(INITIAL_SITE_STATE, { type: "advisor/close" })).toBe(INITIAL_SITE_STATE)
  })

  it("records an answer it has no acknowledgement line for, with nothing to say", () => {
    const s = siteReducer(opened(), { type: "advisor/answer", id: "topic", value: "mystery" })
    expect(s.advisor.answers.topic).toBe("mystery")
    expect(s.advisor.ack).toBeNull()
    expect(s.advisor.busy).toBe(true)
  })

  it("advancing with no answer waiting changes nothing", () => {
    const s = opened()
    expect(s.advisor.busy).toBe(false)
    expect(siteReducer(s, { type: "advisor/advance" })).toBe(s)
  })

  it("steps back to the previous question the visitor answered, clearing the acknowledgement", () => {
    let s = opened()
    s = siteReducer(s, { type: "advisor/answer", id: "topic", value: "sell" })
    s = siteReducer(s, { type: "advisor/advance" })
    expect(s.advisor.step).toBe(1)
    const back = siteReducer(s, { type: "advisor/back" })
    expect(back.advisor.step).toBe(0)
    expect(back.advisor.ack).toBeNull()
  })

  it("cannot step back from the first question, and counts no more answers than there are questions", () => {
    expect(advisorCanGoBack(INITIAL_SITE_STATE.advisor)).toBe(false)
    expect(advisorAnsweredCount(INITIAL_SITE_STATE.advisor)).toBe(0)
    expect(
      advisorAnsweredCount({
        ...INITIAL_SITE_STATE.advisor,
        answers: { topic: "sell", type: "field", rev: "1-2", when: "soon", care: "cash" },
      })
    ).toBe(5)
  })
})

describe("persistence", () => {
  it("stores the session without the four flags hydrate sets for itself", () => {
    const saved = persistableState({
      ...answerAll(),
      advisor: { ...INITIAL_SITE_STATE.advisor, open: true, busy: true, answers: { topic: "sell" } },
    })
    expect(Object.keys(saved).sort()).toEqual(["advisor", "funnel", "iq"])
    expect("busy" in saved.iq).toBe(false)
    expect("boot" in saved.funnel).toBe(false)
    expect("open" in saved.advisor).toBe(false)
    expect("busy" in saved.advisor).toBe(false)
    // Everything the visitor told us is still there.
    expect(saved.iq.done).toBe(true)
    expect(saved.advisor.answers.topic).toBe("sell")
  })

  it("hydrates saved answers without reopening the dialog or restoring busy flags", () => {
    const saved = persistableState({
      ...answerAll(),
      advisor: { ...INITIAL_SITE_STATE.advisor, open: true, busy: true, answers: { topic: "sell" } },
    })
    const s = siteReducer(INITIAL_SITE_STATE, {
      type: "hydrate",
      state: { ...saved, advisor: { ...saved.advisor, note: "Avoid Northgate." } },
    })
    expect(s.advisor.note).toBe("Avoid Northgate.")
    expect(s.iq.done).toBe(true)
    expect(s.iq.busy).toBe(false)
    expect(s.advisor.open).toBe(false)
    expect(s.advisor.busy).toBe(false)
    expect(s.advisor.answers.topic).toBe("sell")
    expect(s.funnel.boot).toBe(true)
  })

  it("hydrates a record from the build that still stored those flags, ignoring them", () => {
    const older = {
      iq: { ...persistableState(answerAll()).iq, busy: true },
      funnel: { ...persistableState(answerAll()).funnel, boot: false },
      advisor: { ...persistableState(answerAll()).advisor, open: true, busy: true },
    }
    const s = siteReducer(INITIAL_SITE_STATE, { type: "hydrate", state: older })
    expect(s.iq.busy).toBe(false)
    expect(s.iq.done).toBe(true)
    expect(s.funnel.boot).toBe(true)
    expect(s.advisor.open).toBe(false)
    expect(s.advisor.busy).toBe(false)
  })
})
