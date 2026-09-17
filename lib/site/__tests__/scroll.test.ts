import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { MARKET_STEPS } from "@/lib/site/market/data"
import {
  activeStep,
  BAR_H,
  filmParallax,
  flowProgress,
  MARKET_FLOW,
  MARKET_NARROW,
  MARKET_WIDE_MIN,
  marketFrame,
  marketProgress,
  marketSlipIds,
  revealProgress,
  scenePins,
  sceneProgress,
  stageFrame,
  TAB_BREAKPOINT,
  TALL_MIN_HEIGHT,
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
  it("measures against the panel under the bar: zero at the bar's bottom edge, travel = height − (viewport − bar)", () => {
    expect(BAR_H).toBe(52)
    // The scene's top at the bar's bottom edge: nothing has played yet; above it, nothing either.
    expect(sceneProgress(52, 3000, 1000, 52)).toBe(0)
    expect(sceneProgress(300, 3000, 1000, 52)).toBe(0)
    // Travel is 3000 − 948 = 2052px; halfway is the top 1026px above the bar's edge.
    expect(sceneProgress(52 - 1026, 3000, 1000, 52)).toBe(0.5)
    expect(sceneProgress(52 - 513, 3000, 1000, 52)).toBe(0.25)
    expect(sceneProgress(52 - 2052, 3000, 1000, 52)).toBe(1)
    expect(sceneProgress(-5000, 3000, 1000, 52)).toBe(1)
    // A scene that fits the panel is static, even though it is taller than the panel minus nothing.
    expect(sceneProgress(-100, 948, 1000, 52)).toBe(0)
    expect(sceneProgress(-100, 949, 1000, 52)).toBe(1)
    // Without a bar the panel is the viewport: the default measures 2000px of travel, so half is 1000px up.
    expect(sceneProgress(-1000, 3000, 1000)).toBe(0.5)
  })
})

describe("revealProgress", () => {
  it("is zero until the frame's top reaches the viewport bottom and one once its bottom rises to 65% of the viewport", () => {
    expect(revealProgress(1200, 500, 1000)).toBe(0)
    expect(revealProgress(1000, 500, 1000)).toBe(0)
    expect(revealProgress(575, 500, 1000)).toBe(0.5)
    expect(revealProgress(150, 500, 1000)).toBe(1)
    expect(revealProgress(-400, 500, 1000)).toBe(1)
  })
  it("scales its travel with the frame height so a taller frame finishes lower on the page", () => {
    expect(revealProgress(500, 1000, 1000)).toBeCloseTo(0.37, 2)
    expect(revealProgress(500, 200, 1000)).toBeCloseTo(0.909, 3)
  })
  it("treats a degenerate frame in a zero-height viewport as static", () => {
    expect(revealProgress(0, 0, 0)).toBe(0)
  })
})

describe("stageFrame", () => {
  it("indexes eight stages and delivers artifacts late in each stage", () => {
    expect(stageFrame(0).idx).toBe(0)
    expect(stageFrame(0).hintVisible).toBe(true)
    expect(stageFrame(0.03).hintVisible).toBe(false)
    expect(stageFrame(0.5).idx).toBe(4)
    expect(stageFrame(1).idx).toBe(7)
    // Progress past the end clamps to the last stage rather than running off the strip.
    expect(stageFrame(5).idx).toBe(7)
    expect(stageFrame(0.99).artifactsDelivered).toBe(8)
    expect(stageFrame(0.13).artifactsDelivered).toBe(1)
    expect(stageFrame(0.05).artifactsDelivered).toBe(0)
    // The artifact lands at 82% through a stage: 0.1025 is still empty, 0.1026 has delivered one.
    expect(stageFrame(0.1025).artifactsDelivered).toBe(0)
    expect(stageFrame(0.1026).artifactsDelivered).toBe(1)
    expect(stageFrame(0.5).railPercent).toBe(50)
  })
})

describe("marketFrame", () => {
  it("shows the inbound letter first, then hides it as slips fan out", () => {
    expect(marketFrame(0, 1000, 700, 18).letter.opacity).toBe(0)
    expect(marketFrame(0.1, 1000, 700, 18).letter.opacity).toBe(0.875)
    // By the time the slips have fanned out the letter is gone, not merely faint.
    expect(marketFrame(0.5, 1000, 700, 18).letter.opacity).toBe(0)
    expect(marketFrame(0.1, 1000, 700, 18).slips.every((s) => s.opacity === 0)).toBe(true)
  })

  it("filters non-survivors and flips survivors to the NDA face", () => {
    const f = marketFrame(0.72, 1000, 700, 18)
    expect(f.slips[0]?.ndaOpacity).toBe(1)
    expect(f.slips[1]?.ndaOpacity).toBe(0)
    expect(f.slips[1]?.opacity).toBe(0)
    expect(f.slips[0]?.opacity).toBe(1)
  })

  it("lands four letters of intent at the end with the committed one on top", () => {
    const f = marketFrame(1, 1000, 700, 18)
    expect(f.lois).toHaveLength(4)
    expect(f.lois.every((l) => l.opacity === 1)).toBe(true)
    expect(f.lois[2]?.zIndex).toBe(5)
    expect(marketFrame(0.5, 1000, 700, 18).lois.every((l) => l.opacity === 0)).toBe(true)
  })

  it("anchors a wide stage at (66%, 46%) and a narrow one at (50%, 50%): the letter at progress 0.1 lands on each", () => {
    // Wide: cx = 660, cy = 322; p0 = 0.625 lifts the letter 26.25px above its rest at cy - 70.
    expect(marketFrame(0.1, 1000, 700, 18).letter.transform).toBe("translate(560px,278.25px) rotate(-4deg) scale(1)")
    // Narrow: cx = 250, cy = 350; the centred anchor keeps the scaled fan inside the phone's 44% band.
    expect(marketFrame(0.1, 500, 700, 18).letter.transform).toBe("translate(150px,306.25px) rotate(-4deg) scale(1)")
    expect(marketFrame(0.1, 500, 700, 18).letter.opacity).toBe(0.875)
  })

  it("treats 735px as narrow and 736px (the tablet breakpoint) as wide", () => {
    expect(MARKET_WIDE_MIN).toBe(736)
    expect(marketFrame(0.1, 735, 700, 18).letter.transform).toBe("translate(267.5px,306.25px) rotate(-4deg) scale(1)")
    // 736 × 0.66 carries float noise past 385.76, so pin the wide anchor's y and the start of its x.
    const wide = marketFrame(0.1, 736, 700, 18).letter.transform
    expect(wide).toMatch(/^translate\(385\.76\d*px,278\.25px\) rotate\(-4deg\) scale\(1\)$/)
  })

  it("scales the fan by width / 760 on a narrow stage and keeps every slip, NDA face included, inside the band", () => {
    const x = (t: string) => Number(/translate\((-?[\d.]+)px/.exec(t)![1])
    // Slip 4 at full fan: the wide radius (187px, ×1.25) becomes 0.658 of itself on a 500px stage.
    expect(marketFrame(0.45, 1000, 700, 18).slips[4]?.transform).toBe("translate(810.2px,105.9px) rotate(8.4deg)")
    expect(marketFrame(0.45, 500, 700, 18).slips[4]?.transform).toBe("translate(328.3px,194.8px) rotate(8.4deg)")
    // A 320px band: no slip starts left of 21px (8px edge + the 13px NDA overhang) or right of 320 - 120 - 21.
    const xs = marketFrame(0.45, 320, 282, 18).slips.map((s) => x(s.transform))
    expect(Math.max(...xs)).toBe(179)
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(21)
    expect(MARKET_NARROW).toEqual({
      slipWidth: 120,
      ndaOverhang: 13,
      loiWidth: 150,
      loiRow: 132,
      loiTallRow: 220,
      gap: 10,
      edge: 8,
    })
    // A wide stage never clamps: the fan reaches past 760px of a 1000px stage.
    expect(Math.max(...marketFrame(0.45, 1000, 700, 18).slips.map((s) => x(s.transform)))).toBeGreaterThan(760)
  })

  it("deals the letters of intent as a two-by-two hand on a narrow stage (150px cards, 10px apart), 118px apart on a wide one", () => {
    const narrow = marketFrame(1, 500, 700, 18)
    // Columns at cx - 155 and cx + 5 around cx = 250; rows at 700 - 362 - 8 = 330 and 330 + 142.
    expect(narrow.lois.map((l) => l.transform)).toEqual([
      "translate(95.0px,330.0px) rotate(-1.5deg)",
      "translate(255.0px,330.0px) rotate(1.5deg)",
      "translate(95.0px,472.0px) rotate(-1.5deg)",
      "translate(255.0px,472.0px) rotate(1.5deg)",
    ])
    expect(narrow.lois.map((l) => l.opacity)).toEqual([1, 1, 1, 1])
    expect(narrow.lois.map((l) => l.zIndex)).toEqual([1, 2, 5, 2])
    // A 320px band 282px tall: the hand is 310px wide (clamped to 5px from the edges) and its top is held at 4px.
    expect(marketFrame(1, 320, 282, 18).lois.map((l) => l.transform)).toEqual([
      "translate(5.0px,4.0px) rotate(-1.5deg)",
      "translate(165.0px,4.0px) rotate(1.5deg)",
      "translate(5.0px,146.0px) rotate(-1.5deg)",
      "translate(165.0px,146.0px) rotate(1.5deg)",
    ])
    const wide = marketFrame(1, 1000, 700, 18)
    expect(wide.lois[0]?.transform).toBe("translate(398.0px,271.0px) rotate(-6.0deg)")
    expect(wide.lois[3]?.transform).toBe("translate(752.0px,271.0px) rotate(6.0deg)")
  })

  it("deals the letters of intent one after another, each rising 60px onto its mark as it fades in", () => {
    // p = 0.78: po ≈ 0.452, so A has landed, B is at 0.919, C at 0.507, and D has only just started.
    const f = marketFrame(0.78, 500, 700, 18)
    expect(f.lois.map((l) => l.opacity)).toEqual([1, 0.919, 0.507, 0.095])
    expect(f.lois.map((l) => l.transform)).toEqual([
      "translate(95.0px,330.0px) rotate(-1.5deg)",
      "translate(255.0px,334.9px) rotate(1.4deg)",
      "translate(95.0px,501.6px) rotate(-0.8deg)",
      "translate(255.0px,526.3px) rotate(0.1deg)",
    ])
    // Before the letters start (po = 0) every card waits 60px below its mark, flat and invisible.
    const early = marketFrame(0.7, 500, 700, 18)
    expect(early.lois.map((l) => l.opacity)).toEqual([0, 0, 0, 0])
    expect(early.lois[0]?.transform).toBe("translate(95.0px,390.0px) rotate(0.0deg)")
    expect(early.lois[3]?.transform).toBe("translate(255.0px,532.0px) rotate(0.0deg)")
    // The wide hand rises the same way onto its fan.
    const wide = marketFrame(0.78, 1000, 700, 18)
    expect(wide.lois[3]?.transform).toBe("translate(752.0px,325.3px) rotate(0.6deg)")
  })
})

describe("flow-mode scenes", () => {
  it("pins from the tablet breakpoint or on a phone whose panel under the bar meets the 780px budget, and flows below it", () => {
    expect(TAB_BREAKPOINT).toBe(736)
    expect(TALL_MIN_HEIGHT).toBe(780)
    expect(scenePins(1440, 700)).toBe(true)
    expect(scenePins(736, 640)).toBe(true)
    expect(scenePins(390, 844)).toBe(true)
    // The budget is a panel height: the viewport must clear it by the bar (780 + 52 = 832).
    expect(scenePins(390, 832)).toBe(true)
    expect(scenePins(390, 831)).toBe(false)
    expect(scenePins(390, 780)).toBe(false)
    expect(scenePins(735, 640)).toBe(false)
    expect(scenePins(320, 640)).toBe(false)
  })

  it("keeps the stylesheet and the math on one bar height and one tall threshold", () => {
    const css = readFileSync("styles/site.css", "utf8")
    expect(css).toContain(`--bar-h: ${BAR_H}px;`)
    expect(css).toContain(`@custom-variant tall (@media (min-height: ${TALL_MIN_HEIGHT + BAR_H}px));`)
    expect(css).toContain("@custom-variant tall (@media (min-height: 832px));")
  })

  it("measures a flowing scene against the viewport window, not its own height", () => {
    const w = { start: 0.25, travel: 1 }
    // The window opens when the scene's top is a quarter of the viewport down, and closes a viewport later.
    expect(flowProgress(160, 640, w)).toBe(0)
    expect(flowProgress(200, 640, w)).toBe(0)
    expect(flowProgress(0, 640, w)).toBe(0.25)
    expect(flowProgress(-160, 640, w)).toBe(0.5)
    expect(flowProgress(-480, 640, w)).toBe(1)
    expect(flowProgress(-900, 640, w)).toBe(1)
    expect(flowProgress(-100, 0, w)).toBe(0)
    expect(flowProgress(-100, 640, { start: 0.25, travel: 0 })).toBe(0)
    expect(MARKET_FLOW).toEqual({ start: 0.25, travel: 1 })
  })

  it("measures the market scene under the bar where it pins and through the flow window where it does not", () => {
    // Pinned: the panel under the bar is 948px, so a 2550px scene travels 1602px; halfway is 801px past the bar.
    expect(marketProgress(52 - 801, 2550, 1000, 1440)).toBe(0.5)
    expect(marketProgress(52, 2550, 1000, 1440)).toBe(0)
    // Flowing (320 × 640): the window alone decides, so the scene's own height changes nothing.
    expect(marketProgress(-160, 900, 640, 320)).toBe(0.5)
    expect(marketProgress(-160, 1400, 640, 320)).toBe(0.5)
    expect(marketProgress(200, 900, 640, 320)).toBe(0)
  })
})

describe("filmParallax", () => {
  it("drifts the film down 3% at the start, up 3% at the end, and rests at the middle, scaled to cover the travel", () => {
    expect(filmParallax(0)).toBe("translate3d(0,3.00%,0) scale(1.060)")
    expect(filmParallax(0.5)).toBe("translate3d(0,0.00%,0) scale(1.060)")
    expect(filmParallax(1)).toBe("translate3d(0,-3.00%,0) scale(1.060)")
    expect(filmParallax(0.25)).toBe("translate3d(0,1.50%,0) scale(1.060)")
  })
  it("clamps progress and takes a custom travel", () => {
    expect(filmParallax(-2)).toBe("translate3d(0,3.00%,0) scale(1.060)")
    expect(filmParallax(3)).toBe("translate3d(0,-3.00%,0) scale(1.060)")
    expect(filmParallax(0, 5)).toBe("translate3d(0,5.00%,0) scale(1.100)")
    expect(filmParallax(1, 0)).toBe("translate3d(0,0.00%,0) scale(1.000)")
  })
})

describe("helpers", () => {
  it("generates stable slip ids and step indexes", () => {
    expect(marketSlipIds(3)).toEqual(["BUYER 011", "BUYER 034", "BUYER 057"])
    // The id walk wraps at 87, so a fifth slip starts the count again.
    expect(marketSlipIds(5)[4]).toBe("BUYER 016")
    expect(activeStep(0.1, MARKET_STEPS)).toBe(0)
    expect(activeStep(0.3, MARKET_STEPS)).toBe(1)
    expect(activeStep(0.6, MARKET_STEPS)).toBe(2)
    expect(activeStep(1, MARKET_STEPS)).toBe(3)
    expect(activeStep(1.01, MARKET_STEPS)).toBe(-1)
  })
})
