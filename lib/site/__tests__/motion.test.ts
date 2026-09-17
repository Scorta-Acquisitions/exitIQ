import { describe, expect, it } from "vitest"
import {
  belowFold,
  countAt,
  damp,
  FRAME_MS,
  pointerOffset,
  pointerUnit,
  RACE,
  RACE_FINAL,
  raceFrame,
  settled,
  staggerDelay,
  turntableDrift,
  turntableElapsedFor,
} from "@/lib/site/motion"

describe("FRAME_MS", () => {
  it("is one 60fps frame, the unit a rate is expressed in and a loop's first frame assumes", () => {
    expect(FRAME_MS).toBe(1000 / 60)
    expect(FRAME_MS).toBeCloseTo(16.6667, 4)
  })
})

describe("damp", () => {
  it("covers `rate` of the remaining distance in one 60fps frame", () => {
    expect(damp(0, 100, 0.1, 1000 / 60)).toBeCloseTo(10, 6)
    expect(damp(50, 100, 0.5, 1000 / 60)).toBeCloseTo(75, 6)
  })
  it("covers the same ground in a 30fps frame as in two 60fps frames: 1 - 0.9 squared of the distance", () => {
    expect(damp(0, 100, 0.1, 1000 / 30)).toBeCloseTo(19, 6)
  })
  it("moves nothing for a zero-length frame and everything at a rate of one", () => {
    expect(damp(0, 100, 0.1, 0)).toBe(0)
    expect(damp(0, 100, 1, 16)).toBe(100)
    expect(damp(0, 100, 1.5, 16)).toBe(100)
  })
  it("never overshoots and stays put when already at the target", () => {
    expect(damp(100, 100, 0.2, 16)).toBe(100)
    expect(damp(99.9, 100, 0.99, 1000)).toBeLessThanOrEqual(100)
  })
})

describe("settled", () => {
  it("is true within the epsilon and false outside it", () => {
    expect(settled(0.96, 1)).toBe(true)
    expect(settled(0.94, 1)).toBe(false)
    expect(settled(0.5, 1, 0.6)).toBe(true)
    expect(settled(1, 1)).toBe(true)
  })
})

describe("staggerDelay", () => {
  it("steps 60ms per item, capped at 300ms, never negative", () => {
    expect([0, 1, 2, 5, 6, 40].map((i) => staggerDelay(i))).toEqual([0, 60, 120, 300, 300, 300])
    expect(staggerDelay(-3)).toBe(0)
    expect(staggerDelay(2, 40, 1000)).toBe(80)
    expect(staggerDelay(2, 0)).toBe(0)
  })
})

describe("pointerOffset", () => {
  const rect = { left: 100, top: 200, width: 400, height: 200 }
  it("is zero at the centre and ±max at the edges, clamped beyond them", () => {
    expect(pointerOffset(300, 300, rect, 6)).toEqual({ dx: 0, dy: 0 })
    expect(pointerOffset(500, 400, rect, 6)).toEqual({ dx: 6, dy: 6 })
    expect(pointerOffset(100, 200, rect, 6)).toEqual({ dx: -6, dy: -6 })
    expect(pointerOffset(900, -50, rect, 6)).toEqual({ dx: 6, dy: -6 })
    expect(pointerOffset(400, 250, rect, 8)).toEqual({ dx: 4, dy: -4 })
  })
  it("yields nothing for a rect without area or a zero max", () => {
    expect(pointerOffset(10, 10, { left: 0, top: 0, width: 0, height: 100 }, 6)).toEqual({ dx: 0, dy: 0 })
    expect(pointerOffset(10, 10, { left: 0, top: 0, width: 100, height: 0 }, 6)).toEqual({ dx: 0, dy: 0 })
    expect(pointerOffset(10, 10, rect, 0)).toEqual({ dx: 0, dy: 0 })
  })
})

describe("pointerUnit", () => {
  const rect = { left: 100, top: 200, width: 400, height: 200 }
  it("maps the rect to the unit square from the top left and clamps outside it", () => {
    expect(pointerUnit(100, 200, rect)).toEqual({ u: 0, v: 0 })
    expect(pointerUnit(500, 400, rect)).toEqual({ u: 1, v: 1 })
    expect(pointerUnit(300, 250, rect)).toEqual({ u: 0.5, v: 0.25 })
    expect(pointerUnit(-10, 900, rect)).toEqual({ u: 0, v: 1 })
  })
  it("sits at the centre for a rect without area", () => {
    expect(pointerUnit(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ u: 0.5, v: 0.5 })
  })
})

describe("belowFold", () => {
  it("is true only when the top edge has not yet entered the viewport", () => {
    expect(belowFold(800, 800)).toBe(true)
    expect(belowFold(1200, 800)).toBe(true)
    expect(belowFold(799, 800)).toBe(false)
    expect(belowFold(-100, 800)).toBe(false)
    expect(belowFold(0, 0)).toBe(true)
  })
})

describe("countAt", () => {
  it("eases from zero to the target and clamps its progress", () => {
    expect(countAt(0, 40)).toBe(0)
    expect(countAt(1, 40)).toBe(40)
    expect(countAt(0.5, 40)).toBe(35)
    expect(countAt(2, 40)).toBe(40)
    expect(countAt(-1, 40)).toBe(0)
  })
})

describe("raceFrame", () => {
  it("runs both runners at the same pace so Heirloom is home when the traditional runner is 60% along", () => {
    expect(raceFrame(0)).toEqual({ traditional: 0, heirloom: 0, phase: "run", opacity: 1 })
    expect(raceFrame(1800)).toEqual({ traditional: 0.3, heirloom: 0.5, phase: "run", opacity: 1 })
    expect(raceFrame(3600)).toEqual({ traditional: 0.6, heirloom: 1, phase: "run", opacity: 1 })
    expect(raceFrame(5400)).toEqual({ traditional: 0.9, heirloom: 1, phase: "run", opacity: 1 })
  })
  it("holds both runners home after the run, then fades the tracks through the reset", () => {
    expect(raceFrame(6000)).toEqual(RACE_FINAL)
    expect(raceFrame(7799)).toEqual(RACE_FINAL)
    expect(raceFrame(7800)).toEqual({ traditional: 1, heirloom: 1, phase: "reset", opacity: 1 })
    expect(raceFrame(8050)).toEqual({ traditional: 1, heirloom: 1, phase: "reset", opacity: 0.5 })
    expect(raceFrame(8299).opacity).toBeCloseTo(0.002, 3)
  })
  it("loops every run + hold + reset and tolerates negative time", () => {
    expect(RACE.runMs + RACE.holdMs + RACE.resetMs).toBe(8300)
    expect(raceFrame(8300)).toEqual(raceFrame(0))
    expect(raceFrame(8300 + 1800)).toEqual(raceFrame(1800))
    expect(raceFrame(-6500)).toEqual(raceFrame(1800))
  })
  it("returns the final still for a degenerate timing or a non-finite time", () => {
    expect(raceFrame(100, { runMs: 0, holdMs: 0, resetMs: 0, heirloomPct: 60 })).toEqual(RACE_FINAL)
    expect(raceFrame(Number.NaN)).toEqual(RACE_FINAL)
    expect(raceFrame(Number.POSITIVE_INFINITY)).toEqual(RACE_FINAL)
  })
  it("guards a zero Heirloom share so the runner still finishes", () => {
    const f = raceFrame(60, { runMs: 6000, holdMs: 0, resetMs: 0, heirloomPct: 0 })
    expect(f.heirloom).toBe(1)
    expect(f.traditional).toBe(0.01)
  })
})

describe("turntableDrift", () => {
  it("rises to 1 over one period and falls back over the next, forever", () => {
    expect(turntableDrift(0, 1000)).toBe(0)
    expect(turntableDrift(500, 1000)).toBe(0.5)
    expect(turntableDrift(1000, 1000)).toBe(1)
    expect(turntableDrift(1500, 1000)).toBe(0.5)
    expect(turntableDrift(2000, 1000)).toBe(0)
    expect(turntableDrift(2250, 1000)).toBe(0.25)
    expect(turntableDrift(-250, 1000)).toBe(0.25)
  })
  it("stays at 0 for a degenerate period or time", () => {
    expect(turntableDrift(500, 0)).toBe(0)
    expect(turntableDrift(Number.NaN, 1000)).toBe(0)
  })
  it("resumes an ascending drift from a given progress", () => {
    expect(turntableDrift(turntableElapsedFor(0.3, 1000), 1000)).toBe(0.3)
    expect(turntableElapsedFor(1.5, 1000)).toBe(1000)
    expect(turntableElapsedFor(0.5, -1)).toBe(0)
  })
})
