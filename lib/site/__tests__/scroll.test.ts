import { describe, expect, it } from "vitest"
import {
  activeStep,
  marketFrame,
  marketSlipIds,
  privacyLevel,
  sceneProgress,
  stageFrame,
  veilOpacity,
} from "@/lib/site/scroll"

describe("sceneProgress", () => {
  it("is zero before the scene pins and one once it has scrolled through", () => {
    expect(sceneProgress(200, 3000, 1000)).toBe(0)
    expect(sceneProgress(0, 3000, 1000)).toBe(0)
    expect(sceneProgress(-1000, 3000, 1000)).toBe(0.5)
    expect(sceneProgress(-2000, 3000, 1000)).toBe(1)
    expect(sceneProgress(-5000, 3000, 1000)).toBe(1)
  })
  it("treats a scene shorter than the viewport as static", () => {
    expect(sceneProgress(-100, 800, 1000)).toBe(0)
  })
})

describe("privacyLevel", () => {
  it("walks levels 1 through 5", () => {
    expect(privacyLevel(0)).toBe(1)
    expect(privacyLevel(0.25)).toBe(2)
    expect(privacyLevel(0.5)).toBe(3)
    expect(privacyLevel(0.99)).toBe(5)
    expect(privacyLevel(1)).toBe(5)
  })
})

describe("stageFrame", () => {
  it("indexes eight stages and delivers artifacts late in each stage", () => {
    expect(stageFrame(0).idx).toBe(0)
    expect(stageFrame(0).hintVisible).toBe(true)
    expect(stageFrame(0.5).idx).toBe(4)
    expect(stageFrame(1).idx).toBe(7)
    expect(stageFrame(0.99).artifactsDelivered).toBe(8)
    expect(stageFrame(0.13).artifactsDelivered).toBe(1)
    expect(stageFrame(0.05).artifactsDelivered).toBe(0)
    expect(stageFrame(0.5).railPercent).toBe(50)
  })
})

describe("marketFrame", () => {
  it("shows the inbound letter first, then hides it as slips fan out", () => {
    expect(marketFrame(0, 1000, 700, 18).letter.opacity).toBe(0)
    expect(marketFrame(0.1, 1000, 700, 18).letter.opacity).toBeGreaterThan(0.5)
    expect(marketFrame(0.5, 1000, 700, 18).letter.opacity).toBeLessThan(0.05)
    expect(marketFrame(0.1, 1000, 700, 18).slips.every((s) => s.opacity === 0)).toBe(true)
  })

  it("filters non-survivors and flips survivors to the NDA face", () => {
    const f = marketFrame(0.72, 1000, 700, 18)
    expect(f.slips[0]?.ndaOpacity).toBe(1)
    expect(f.slips[1]?.ndaOpacity).toBe(0)
    expect(f.slips[1]?.opacity).toBe(0)
    expect(f.slips[0]?.opacity).toBeGreaterThan(0.5)
  })

  it("lands four letters of intent at the end with the committed one on top", () => {
    const f = marketFrame(1, 1000, 700, 18)
    expect(f.lois).toHaveLength(4)
    expect(f.lois.every((l) => l.opacity === 1)).toBe(true)
    expect(f.lois[2]?.zIndex).toBe(5)
    expect(marketFrame(0.5, 1000, 700, 18).lois.every((l) => l.opacity === 0)).toBe(true)
  })

  it("adapts the anchor point to narrow stages", () => {
    const wide = marketFrame(0.1, 1000, 700, 18).letter.transform
    const narrow = marketFrame(0.1, 500, 700, 18).letter.transform
    expect(wide).not.toBe(narrow)
  })
})

describe("helpers", () => {
  it("generates stable slip ids and step indexes", () => {
    const ids = marketSlipIds(3)
    expect(ids).toEqual(["BUYER 011", "BUYER 034", "BUYER 057"])
    expect(activeStep(0.1)).toBe(0)
    expect(activeStep(0.3)).toBe(1)
    expect(activeStep(0.6)).toBe(2)
    expect(activeStep(1)).toBe(3)
    expect(veilOpacity(0.5)).toBe(0.11)
  })
})
