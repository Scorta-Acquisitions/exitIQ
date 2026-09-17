import { describe, expect, it } from "vitest"
import {
  beatAnnouncement,
  beatIdAt,
  beatIndexAt,
  beatsPlayedInOrder,
  DEMO_HOLD_MS,
  DEMO_IDLE_MS,
  DEMO_REKEY_MS,
  DEMO_VISIBLE_RATIO,
  demoDuration,
  demoFrameAt,
  type DemoScript,
  demoStillFor,
  demoVisible,
  elapsedForIndex,
  indexOfBeat,
  sameDemoFrame,
  stepIndex,
} from "@/lib/site/demo/clock"

/** A four-beat stand-in for a section's script: the marks and the still a real demo carries. */
const SCRIPT: DemoScript = {
  prefix: "fin",
  beats: [
    { id: "arrived", at: 0 },
    { id: "note", at: 1600 },
    { id: "register", at: 3400, say: "The payroll register is attached" },
    { id: "used", at: 8600 },
  ],
  still: "used",
  label: "Financial preparation, a worked example that plays itself",
}

/** The whole cycle a replay runs on: the script's own length plus the hold at its end state. */
const CYCLE = 8600 + DEMO_HOLD_MS

describe("demo clock constants", () => {
  it("holds an ended demo for 8 seconds, re-keys over 240ms, runs at 30% visible and beats every 2.4s", () => {
    expect(DEMO_HOLD_MS).toBe(8000)
    expect(DEMO_REKEY_MS).toBe(240)
    expect(DEMO_VISIBLE_RATIO).toBe(0.3)
    expect(DEMO_IDLE_MS).toBe(2400)
  })

  it("reads the script's length as its last beat's mark", () => {
    expect(demoDuration(SCRIPT)).toBe(8600)
    expect(demoDuration({ ...SCRIPT, beats: [] })).toBe(0)
  })
})

describe("beatIndexAt", () => {
  it("holds each beat until the next one's mark, at every boundary of the script", () => {
    const marks: Array<[number, number, string]> = [
      [0, 0, "arrived"],
      [1599, 0, "arrived"],
      [1600, 1, "note"],
      [3399, 1, "note"],
      [3400, 2, "register"],
      [8599, 2, "register"],
      [8600, 3, "used"],
      [40_000, 3, "used"],
    ]
    for (const [elapsed, index, id] of marks) {
      expect(beatIndexAt(elapsed, SCRIPT), `index at ${elapsed}`).toBe(index)
      expect(beatIdAt(beatIndexAt(elapsed, SCRIPT), SCRIPT), `beat at ${elapsed}`).toBe(id)
    }
  })

  it("reads the first beat before the play starts and for an unusable clock", () => {
    expect(beatIdAt(beatIndexAt(-500, SCRIPT), SCRIPT)).toBe("arrived")
    expect(beatIndexAt(Number.NaN, SCRIPT)).toBe(0)
    expect(beatIndexAt(0, { ...SCRIPT, beats: [] })).toBe(0)
    expect(beatIdAt(0, { ...SCRIPT, beats: [] })).toBe("")
  })
})

describe("beat identity and steps", () => {
  it("names a beat by index, clamped to the script at both ends", () => {
    expect(beatIdAt(0, SCRIPT)).toBe("arrived")
    expect(beatIdAt(3, SCRIPT)).toBe("used")
    expect(beatIdAt(-2, SCRIPT)).toBe("arrived")
    expect(beatIdAt(9, SCRIPT)).toBe("used")
  })

  it("finds a beat by id and reports -1 for one the script does not have", () => {
    expect(indexOfBeat("register", SCRIPT)).toBe(2)
    expect(indexOfBeat("nope", SCRIPT)).toBe(-1)
  })

  it("steps by a beat and never falls off either end", () => {
    expect(stepIndex(1, 1, SCRIPT)).toBe(2)
    expect(stepIndex(1, -1, SCRIPT)).toBe(0)
    expect(stepIndex(0, -1, SCRIPT)).toBe(0)
    expect(stepIndex(3, 1, SCRIPT)).toBe(3)
    expect(stepIndex(Number.NaN, 1, SCRIPT)).toBe(0)
  })

  it("speaks a beat's own words, or its place in the script", () => {
    expect(beatAnnouncement(2, SCRIPT)).toBe("The payroll register is attached")
    expect(beatAnnouncement(0, SCRIPT)).toBe("Step 1 of 4")
    expect(beatAnnouncement(9, SCRIPT)).toBe("Step 4 of 4")
  })
})

describe("demoFrameAt", () => {
  it("plays the beats, then holds the end state for the whole hold", () => {
    expect(demoFrameAt(0, SCRIPT)).toEqual({ index: 0, beat: "arrived", cycle: 0, ended: false })
    expect(demoFrameAt(3400, SCRIPT)).toEqual({ index: 2, beat: "register", cycle: 0, ended: false })
    expect(demoFrameAt(8600, SCRIPT)).toEqual({ index: 3, beat: "used", cycle: 0, ended: true })
    expect(demoFrameAt(CYCLE - 1, SCRIPT)).toEqual({ index: 3, beat: "used", cycle: 0, ended: true })
  })

  it("replays from the first beat when the hold runs out, counting the cycle", () => {
    expect(demoFrameAt(CYCLE, SCRIPT)).toEqual({ index: 0, beat: "arrived", cycle: 1, ended: false })
    expect(demoFrameAt(CYCLE + 1600, SCRIPT)).toEqual({ index: 1, beat: "note", cycle: 1, ended: false })
    expect(demoFrameAt(CYCLE + 8600, SCRIPT)).toEqual({ index: 3, beat: "used", cycle: 1, ended: true })
    expect(demoFrameAt(2 * CYCLE, SCRIPT)).toEqual({ index: 0, beat: "arrived", cycle: 2, ended: false })
  })

  it("rests on its last beat for good when nothing holds it", () => {
    expect(demoFrameAt(100_000, SCRIPT, 0)).toEqual({ index: 3, beat: "used", cycle: 0, ended: true })
    expect(demoFrameAt(1000, SCRIPT, 0)).toEqual({ index: 0, beat: "arrived", cycle: 0, ended: false })
    expect(demoFrameAt(100_000, SCRIPT, -5)).toEqual({ index: 3, beat: "used", cycle: 0, ended: true })
  })

  it("starts at the first beat before the clock runs and for an unusable clock", () => {
    expect(demoFrameAt(-100, SCRIPT)).toEqual({ index: 0, beat: "arrived", cycle: 0, ended: false })
    expect(demoFrameAt(Number.NaN, SCRIPT)).toEqual({ index: 0, beat: "arrived", cycle: 0, ended: false })
  })

  it("tells two moments of the same play apart by beat, cycle and end state", () => {
    const first = demoFrameAt(8600, SCRIPT)
    expect(sameDemoFrame(first, demoFrameAt(CYCLE - 1, SCRIPT))).toBe(true)
    expect(sameDemoFrame(first, demoFrameAt(8599, SCRIPT))).toBe(false)
    expect(sameDemoFrame(first, demoFrameAt(CYCLE + 8600, SCRIPT))).toBe(false)
    expect(sameDemoFrame(demoFrameAt(8599, SCRIPT), demoFrameAt(8000, SCRIPT))).toBe(true)
  })

  it("puts a keyboard step back on the clock at that beat's mark of that cycle", () => {
    expect(elapsedForIndex(0, SCRIPT)).toBe(0)
    expect(elapsedForIndex(2, SCRIPT)).toBe(3400)
    expect(elapsedForIndex(2, SCRIPT, 1)).toBe(CYCLE + 3400)
    expect(elapsedForIndex(9, SCRIPT, 0)).toBe(8600)
    expect(elapsedForIndex(2, SCRIPT, 3, 0)).toBe(3400)
    expect(demoFrameAt(elapsedForIndex(1, SCRIPT, 2), SCRIPT)).toEqual({
      index: 1,
      beat: "note",
      cycle: 2,
      ended: false,
    })
  })
})

describe("demoVisible", () => {
  it("runs the clock from three tenths on screen and never for a panel that has left", () => {
    expect(demoVisible(0, 600, 800)).toBe(false)
    expect(demoVisible(0.29, 600, 800)).toBe(false)
    expect(demoVisible(0.3, 600, 800)).toBe(true)
    expect(demoVisible(1, 600, 800)).toBe(true)
  })

  it("counts a panel taller than the viewport as visible once it fills nine tenths of what it can", () => {
    // A 2000px panel in a 500px viewport can only ever report a quarter of itself.
    expect(demoVisible(0.225, 2000, 500)).toBe(true)
    expect(demoVisible(0.2, 2000, 500)).toBe(false)
    expect(demoVisible(0.29, 2000, 500)).toBe(true)
  })

  it("needs a measured panel and viewport before it makes that allowance", () => {
    expect(demoVisible(0.2, 0, 500)).toBe(false)
    expect(demoVisible(0.2, 2000, 0)).toBe(false)
    expect(demoVisible(0.2, 400, 800)).toBe(false)
  })
})

describe("demoStillFor", () => {
  it("stills every demo on its own still beat for ?demo=still", () => {
    expect(demoStillFor("?demo=still", SCRIPT)).toBe("used")
    expect(demoStillFor("demo=still", SCRIPT)).toBe("used")
    expect(demoStillFor("?demo=%20still%20", SCRIPT)).toBe("used")
  })

  it("stills the named demo on the named beat and leaves the others playing", () => {
    expect(demoStillFor("?demo=fin:note", SCRIPT)).toBe("note")
    expect(demoStillFor("?demo=priv:nda,fin:register", SCRIPT)).toBe("register")
    expect(demoStillFor("?demo=dec:offers", SCRIPT)).toBeNull()
  })

  it("plays on for an absent, unknown or malformed parameter", () => {
    expect(demoStillFor("", SCRIPT)).toBeNull()
    expect(demoStillFor("?ref=email", SCRIPT)).toBeNull()
    expect(demoStillFor("?demo=", SCRIPT)).toBeNull()
    expect(demoStillFor("?demo=fin:nope", SCRIPT)).toBeNull()
    expect(demoStillFor("?demo=fin", SCRIPT)).toBeNull()
  })
})

describe("beatsPlayedInOrder", () => {
  const WANTED = ["arrived", "note", "register", "used"]

  it("matches the whole script once every beat has been recorded in order", () => {
    expect(beatsPlayedInOrder(["arrived", "note", "register", "used"], WANTED)).toEqual(WANTED)
  })

  it("stops at the beat that never arrived, so a skipped beat fails the run", () => {
    expect(beatsPlayedInOrder(["arrived", "note", "used"], WANTED)).toEqual(["arrived", "note"])
    expect(beatsPlayedInOrder(["note", "register", "used"], WANTED)).toEqual([])
  })

  it("carries on through a beat recorded twice, and through a replay's second pass", () => {
    expect(beatsPlayedInOrder(["arrived", "arrived", "note", "note", "register", "used"], WANTED)).toEqual(WANTED)
    // A demo that dropped a beat on its first play records it on the replay and the run completes.
    expect(beatsPlayedInOrder(["arrived", "note", "used", "arrived", "note", "register", "used"], WANTED)).toEqual(
      WANTED
    )
  })

  it("matches nothing for an empty recording, and everything for an empty script", () => {
    expect(beatsPlayedInOrder([], WANTED)).toEqual([])
    expect(beatsPlayedInOrder(["arrived"], [])).toEqual([])
  })
})
