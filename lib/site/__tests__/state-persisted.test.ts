import { describe, expect, it } from "vitest"
import { ADVISOR_QUESTION_IDS } from "@/lib/site/advisor/data"
import { ADVISOR_DONE_STEP } from "@/lib/site/advisor/intake"
import { QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import { SELL_REVENUE_CHIPS, SELL_TIMING_CHIPS, STAGE_PROGRESS_LABEL } from "@/lib/site/hero/funnel"
import { parsePersistedState } from "@/lib/site/state/persisted"
import { INITIAL_SITE_STATE, persistableState, type SiteState } from "@/lib/site/state/reducer"

/** A session a visitor really leaves behind: three exitIQ answers, the sell funnel, a part-built briefing. */
const SAVED: SiteState = {
  iq: {
    phase: 3,
    answers: { type: "recurring", rev: "3-5", trend: "up" },
    busy: false,
    insight: "Expect questions about contracts and renewals. Buyers price them heavily.",
    done: false,
    started: true,
  },
  funnel: { stage: "sellQ2", path: "sell", tick: 5, boot: false, sellTiming: "mid", sellRevenue: "1-3" },
  advisor: {
    open: false,
    step: 2,
    answers: { topic: "sell", rev: "1-3" },
    labels: { topic: "Selling the business", rev: "$1M to $3M" },
    prefilled: { topic: true, rev: true },
    ack: "The call covers your likely buyer market and what preparation would happen before any outreach.",
    busy: false,
    note: "Call after 3pm.",
    emailed: false,
  },
}

/** Exactly what the provider hands the parser: the persisted slice after a round trip through JSON. */
function stored(state: SiteState = SAVED): Record<string, Record<string, unknown>> {
  return JSON.parse(JSON.stringify(persistableState(state))) as Record<string, Record<string, unknown>>
}

/** The stored record with one slice's fields overridden, the way a tampered or stale store reads. */
function patched(slice: "iq" | "funnel" | "advisor", patch: Record<string, unknown>): unknown {
  const base = stored()
  return { ...base, [slice]: { ...base[slice], ...patch } }
}

describe("parsePersistedState", () => {
  describe("a valid record", () => {
    it("returns the stored session unchanged, field for field", () => {
      const raw = stored()
      expect(parsePersistedState(raw)).toEqual(raw)
    })

    it("returns the initial state unchanged", () => {
      const raw = stored(INITIAL_SITE_STATE)
      expect(parsePersistedState(raw)).toEqual({
        iq: { phase: 0, answers: {}, insight: null, done: false, started: false },
        funnel: { stage: "route", path: "sell", tick: 0, sellTiming: null, sellRevenue: null },
        advisor: {
          step: 0,
          answers: {},
          labels: {},
          prefilled: {},
          ack: null,
          note: "",
          emailed: false,
        },
      })
    })

    it("keeps a finished run's own values", () => {
      const parsed = parsePersistedState(patched("iq", { phase: QUESTION_COUNT - 1, done: true }))
      expect(parsed?.iq.phase).toBe(6)
      expect(parsed?.iq.done).toBe(true)
      expect(parsed?.iq.answers).toEqual({ type: "recurring", rev: "3-5", trend: "up" })
    })

    it("restores a session written by the build that still stored the four in-flight flags", () => {
      // What `persistableState` wrote before this build: the flags `hydrate` overrides anyway. They are
      // unknown keys now, so the record still parses and they are simply dropped.
      const older = {
        iq: { ...stored().iq, busy: true },
        funnel: { ...stored().funnel, boot: false },
        advisor: { ...stored().advisor, open: true, busy: true },
      }
      const parsed = parsePersistedState(older)
      expect(parsed).toEqual(stored())
      expect(parsed?.iq.phase).toBe(3)
      expect(parsed?.iq.answers).toEqual({ type: "recurring", rev: "3-5", trend: "up" })
      expect(parsed?.advisor.note).toBe("Call after 3pm.")
      for (const key of ["busy", "boot", "open"]) {
        expect(key in parsed!.iq, `iq.${key}`).toBe(false)
        expect(key in parsed!.funnel, `funnel.${key}`).toBe(false)
        expect(key in parsed!.advisor, `advisor.${key}`).toBe(false)
      }
    })

    it("keeps an answer for every question in the bank", () => {
      const answers: Record<string, string> = {}
      for (const q of QUESTIONS) answers[q.id] = q.chips[0]!.v
      expect(parsePersistedState(patched("iq", { answers }))?.iq.answers).toEqual({
        type: "field",
        rev: "u1",
        trend: "up",
        sde: "a",
        books: "same",
        conc: "a",
        owner: "a",
      })
    })

    it("keeps an answer, a label and a prefill mark for every advisor question", () => {
      const answers: Record<string, string> = {}
      const prefilled: Record<string, true> = {}
      for (const id of ADVISOR_QUESTION_IDS) {
        answers[id] = "x"
        prefilled[id] = true
      }
      const parsed = parsePersistedState(patched("advisor", { answers, labels: answers, prefilled }))
      expect(parsed?.advisor.answers).toEqual({ topic: "x", type: "x", rev: "x", when: "x", care: "x" })
      expect(parsed?.advisor.labels).toEqual({ topic: "x", type: "x", rev: "x", when: "x", care: "x" })
      expect(parsed?.advisor.prefilled).toEqual({ topic: true, type: true, rev: true, when: true, care: true })
    })

    it.each(Object.keys(STAGE_PROGRESS_LABEL))("accepts the funnel stage %s", (stage) => {
      expect(parsePersistedState(patched("funnel", { stage }))?.funnel.stage).toBe(stage)
    })

    it.each(SELL_TIMING_CHIPS.map(([v]) => v))("accepts the remembered sell timing %s", (sellTiming) => {
      expect(parsePersistedState(patched("funnel", { sellTiming }))?.funnel.sellTiming).toBe(sellTiming)
    })

    it.each(SELL_REVENUE_CHIPS.map(([v]) => v))("accepts the remembered sell revenue %s", (sellRevenue) => {
      expect(parsePersistedState(patched("funnel", { sellRevenue }))?.funnel.sellRevenue).toBe(sellRevenue)
    })
  })

  describe("rejects anything that is not a stored session", () => {
    it.each([
      ["an array of sessions", [stored()]],
      ["an empty array", []],
      ["a string", "hello"],
      ["a number", 3],
      ["null", null],
      ["a boolean", true],
      ["an empty object", {}],
    ])("returns null for %s", (_label, raw) => {
      expect(parsePersistedState(raw)).toBeNull()
    })

    it.each(["iq", "funnel", "advisor"] as const)("returns null when the %s slice is missing", (slice) => {
      const base = stored()
      delete base[slice]
      expect(parsePersistedState(base)).toBeNull()
    })

    it.each(["phase", "answers", "insight", "done", "started"])("returns null when iq.%s is missing", (field) => {
      const base = stored()
      delete base.iq![field]
      expect(parsePersistedState(base)).toBeNull()
    })

    it("returns null when a slice is an array instead of a record", () => {
      expect(parsePersistedState({ ...stored(), funnel: [] })).toBeNull()
    })
  })

  describe("rejects a wrong-typed or out-of-range field", () => {
    it.each([
      ['iq.phase "3"', "iq", { phase: "3" }],
      ["iq.phase 99", "iq", { phase: 99 }],
      ["iq.phase -1", "iq", { phase: -1 }],
      ["iq.phase 2.5", "iq", { phase: 2.5 }],
      ["iq.done 1", "iq", { done: 1 }],
      ["iq.insight undefined", "iq", { insight: undefined }],
      ["iq.answers as an array", "iq", { answers: ["field"] }],
      ["an exitIQ answer that is not one of its chips", "iq", { answers: { type: "franchise" } }],
      ["an exitIQ answer taken from another question's chips", "iq", { answers: { trend: "field" } }],
      ["a numeric exitIQ answer", "iq", { answers: { type: 3 } }],
      ["a funnel stage outside the graph", "funnel", { stage: "sellQ3" }],
      ["a funnel path outside the three", "funnel", { path: "explore" }],
      ["a sell revenue from the exitIQ ranges", "funnel", { sellRevenue: "1-2" }],
      ["a sell timing that is a label", "funnel", { sellTiming: "Now or within 6 months" }],
      ["funnel.tick 12", "funnel", { tick: 12 }],
      ["funnel.tick -1", "funnel", { tick: -1 }],
      ["funnel.tick 0.5", "funnel", { tick: 0.5 }],
      ["a funnel path that is null", "funnel", { path: null }],
      ["advisor.step past the briefing", "advisor", { step: ADVISOR_DONE_STEP + 1 }],
      ["advisor.step -1", "advisor", { step: -1 }],
      ["advisor.note null", "advisor", { note: null }],
      ["advisor.ack as a number", "advisor", { ack: 7 }],
      ["advisor.prefilled marked false", "advisor", { prefilled: { topic: false } }],
      ["advisor.answers as a string", "advisor", { answers: "topic" }],
    ] as Array<[string, "iq" | "funnel" | "advisor", Record<string, unknown>]>)(
      "returns null for %s",
      (_label, slice, patch) => {
        expect(parsePersistedState(patched(slice, patch))).toBeNull()
      }
    )
  })

  describe("boundaries", () => {
    it("accepts phase 0 and phase QUESTION_COUNT and rejects one past it", () => {
      expect(parsePersistedState(patched("iq", { phase: 0 }))?.iq.phase).toBe(0)
      expect(parsePersistedState(patched("iq", { phase: QUESTION_COUNT }))?.iq.phase).toBe(7)
      expect(parsePersistedState(patched("iq", { phase: QUESTION_COUNT + 1 }))).toBeNull()
    })

    it("accepts tick 0 and tick 11, the wrap of the hero graph's twelve slots", () => {
      expect(parsePersistedState(patched("funnel", { tick: 0 }))?.funnel.tick).toBe(0)
      expect(parsePersistedState(patched("funnel", { tick: 11 }))?.funnel.tick).toBe(11)
    })

    it("accepts advisor step 0 and the briefing step and rejects one past it", () => {
      expect(parsePersistedState(patched("advisor", { step: 0 }))?.advisor.step).toBe(0)
      expect(parsePersistedState(patched("advisor", { step: ADVISOR_DONE_STEP }))?.advisor.step).toBe(6)
      expect(parsePersistedState(patched("advisor", { step: ADVISOR_DONE_STEP + 1 }))).toBeNull()
    })
  })

  describe("drops keys the current build does not know", () => {
    it("strips an unknown top-level key", () => {
      const raw = stored()
      expect(parsePersistedState({ ...raw, flow: { section: "financial", choice: "books" } })).toEqual(raw)
    })

    it("strips a stale advisor.flow left by an older session", () => {
      const raw = stored()
      const stale = { ...raw, advisor: { ...raw.advisor, flow: { section: "privacy", choice: "levels" } } }
      const parsed = parsePersistedState(stale)
      expect(parsed).toEqual(raw)
      expect(parsed && "flow" in parsed.advisor).toBe(false)
      expect(parsed?.advisor.note).toBe("Call after 3pm.")
    })

    it("strips an answer key that is not a question in the bank", () => {
      const parsed = parsePersistedState(patched("iq", { answers: { type: "recurring", margin: "high" } }))
      expect(parsed?.iq.answers).toEqual({ type: "recurring" })
    })

    it("strips an unknown field from a slice", () => {
      expect(parsePersistedState(patched("funnel", { veil: 0.4 }))?.funnel).toEqual({
        stage: "sellQ2",
        path: "sell",
        tick: 5,
        sellTiming: "mid",
        sellRevenue: "1-3",
      })
    })
  })
})
