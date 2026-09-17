import { describe, expect, it } from "vitest"
import { type HeroStage, pathForStage, sellDoneSubtitle, sellDoneTitle, STAGE_INTENSITY } from "@/lib/site/hero/funnel"
import { dimOnDark, HERO_CX, HERO_CY, heroGeometry } from "@/lib/site/hero/geometry"

const ACCENT = "var(--color-primary-on-dark)"
const INK = "var(--color-on-dark)"
/** Every colour the geometry emits is a token reference or a color-mix over one. */
const TOKEN_COLOUR = /^(var\(--color-[a-z0-9-]+\)|color-mix\(in srgb, var\(--color-on-dark\) \d+%, transparent\))$/

describe("heroGeometry", () => {
  it("places twelve nodes, six edges, three rings, four evidence markers, and four modules", () => {
    const g = heroGeometry("sell", 0, false)
    expect(g.nodes).toHaveLength(12)
    expect(g.edges).toHaveLength(6)
    expect(g.rings).toHaveLength(3)
    expect(g.evidence).toHaveLength(4)
    expect(g.modules).toHaveLength(4)
  })

  it("labels only the live offer node on the sell path and captions the rings in one or two words", () => {
    const g = heroGeometry("sell", 0)
    expect(g.nodes.filter((n) => n.l !== "").map((n) => n.l)).toEqual(["OFFER"])
    expect(g.rings.map((r) => r.l)).toEqual(["MATCHED", "NDA SIGNED", "FINALISTS"])
  })

  it("keeps the evidence markers off the vertical axis so labels clear the ring captions", () => {
    const g = heroGeometry("ready", 0)
    expect(g.evidence.map((e) => e.l)).toEqual([
      "FINANCIALS RECONCILED",
      "RECURRING REVENUE",
      "DOCUMENTATION GAPS",
      "OWNER DEPENDENCE",
    ])
    expect(g.evidence.map((e) => e.ta)).toEqual(["start", "start", "end", "end"])
    // 90.9px either side of the axis, so a marker label never sits under a ring caption.
    expect(g.evidence.map((e) => e.x)).toEqual(["610.9", "610.9", "429.1", "429.1"])
  })

  it("lays the four offer modules out as a two-by-two grid under the buyer edge", () => {
    const g = heroGeometry("offer", 0)
    expect(g.modules.map((m) => [m.l, +m.x, +m.y])).toEqual([
      ["PRICE", 650, 392],
      ["CASH AT CLOSING", 776, 392],
      ["FINANCING", 650, 426],
      ["CLOSING RISK", 776, 426],
    ])
  })

  it("lights exactly one live offer node on the sell path and rotates it with the tick", () => {
    const live0 = heroGeometry("sell", 0).nodes.findIndex((n) => n.tier === 5)
    const live1 = heroGeometry("sell", 1).nodes.findIndex((n) => n.tier === 5)
    expect(live0).toBe(6)
    expect(live1).toBe(5)
    expect(heroGeometry("sell", 0).nodes.filter((n) => n.tier === 5)).toHaveLength(1)
  })

  it("steps the live offer one buyer westward per tick, at the exact positions, and wraps after twelve", () => {
    const live = (tick: number) => {
      const n = heroGeometry("sell", tick).nodes.find((node) => node.tier === 5)!
      return [n.x, n.y]
    }
    expect(live(0)).toEqual(["588.2", "322.9"])
    expect(live(1)).toEqual(["590.0", "310.0"])
    expect(live(2)).toEqual(["588.2", "297.1"])
    expect(live(12)).toEqual(live(0))
    // The console feeds `funnel.tick + idle`, which grows without bound while the visitor rests.
    expect(heroGeometry("sell", 1_000_003)).toEqual(heroGeometry("sell", 1_000_003 % 12))
    expect(heroGeometry("sell", 1_000_003).nodes.findIndex((n) => n.tier === 5)).toBe((6 - (1_000_003 % 12) + 12) % 12)
  })

  it("lights the offer modules and the evidence markers in turn, one per tick, wrapping after four", () => {
    const litModule = (tick: number) => heroGeometry("offer", tick).modules.findIndex((m) => m.hs === ACCENT)
    expect([0, 1, 2, 3, 4, 5].map(litModule)).toEqual([0, 1, 2, 3, 0, 1])
    const litEvidence = (tick: number) => heroGeometry("ready", tick).evidence.findIndex((e) => e.go === 0.8)
    expect([0, 1, 2, 3, 4, 7].map(litEvidence)).toEqual([0, 1, 2, 3, 0, 3])
    // Only the lit one carries the ring: exactly one module in the accent and one marker at 0.8 per tick.
    for (const tick of [0, 5, 10]) {
      expect(heroGeometry("offer", tick).modules.filter((m) => m.hs === ACCENT)).toHaveLength(1)
      expect(heroGeometry("ready", tick).evidence.filter((e) => e.go === 0.8)).toHaveLength(1)
      // The tick lights nothing off its own path.
      expect(heroGeometry("sell", tick).modules.filter((m) => m.hs === ACCENT)).toHaveLength(0)
      expect(heroGeometry("sell", tick).evidence.filter((e) => e.go > 0)).toHaveLength(0)
    }
  })

  it("collapses to a single buyer on the offer path and shows the offer modules", () => {
    const g = heroGeometry("offer", 0)
    const visible = g.nodes.filter((n) => n.o > 0)
    expect(visible).toHaveLength(1)
    expect(visible[0]?.l).toBe("THE BUYER")
    expect(+visible[0]!.x).toBe(HERO_CX + 222)
    expect(g.offerOpacity).toBe(1)
    expect(g.modules.every((m) => m.o === 1)).toBe(true)
    // Every edge slot points at the single buyer, so they overlap into one visible line.
    const lit = g.edges.filter((e) => e.o > 0)
    expect(lit).toHaveLength(6)
    expect(lit.every((e) => e.o === 0.6)).toBe(true)
    expect(new Set(lit.map((e) => e.d)).size).toBe(1)
  })

  it("hides buyers and shows evidence markers on the ready path", () => {
    const g = heroGeometry("ready", 0)
    expect(g.nodes.every((n) => n.o === 0)).toBe(true)
    expect(g.evidence.every((e) => e.o === 1)).toBe(true)
    expect(g.rings[0]?.l).toBe("BUYER VIEW")
    expect(g.evidence.filter((e) => e.go > 0)).toHaveLength(1)
  })

  it("starts everything faded while booting", () => {
    const g = heroGeometry("sell", 0, true)
    expect(g.nodes.every((n) => n.o === 0)).toBe(true)
    expect(g.rings.every((r) => r.o === 0)).toBe(true)
    expect(g.edges.every((e) => e.o === 0)).toBe(true)
  })

  it("draws edges toward the protected business, stopping short of the seal", () => {
    const g = heroGeometry("sell", 0)
    const live = g.edges.find((e) => e.c === ACCENT)!
    const [, end] = live.d.split(" L")
    const [ex, ey] = end!.split(" ").map(Number)
    // The edge stops 66px short of the seal at the centre.
    expect(Math.hypot(HERO_CX - ex!, HERO_CY - ey!)).toBeCloseTo(66, 0)
  })

  it("labels the module for the current tick as live and dims the others", () => {
    const g = heroGeometry("offer", 3)
    expect(g.modules[3]?.hs).toBe(ACCENT)
    expect(g.modules[0]?.hs).toBe("color-mix(in srgb, var(--color-on-dark) 25%, transparent)")
  })

  it("mixes light ink over the dark surface at the requested strength", () => {
    expect(dimOnDark(40)).toBe("color-mix(in srgb, var(--color-on-dark) 40%, transparent)")
    expect(dimOnDark(0)).toBe("color-mix(in srgb, var(--color-on-dark) 0%, transparent)")
  })

  it("colours the sell path by tier: accent for the live offer, light ink for reviewed buyers, dim ink for the rest", () => {
    const g = heroGeometry("sell", 0)
    const live = g.nodes.find((n) => n.tier === 5)!
    expect([live.f, live.s, live.tc]).toEqual([ACCENT, ACCENT, ACCENT])
    const reviewed = g.nodes.find((n) => n.tier === 3)!
    expect(reviewed.f).toBe(INK)
    expect(reviewed.s).toBe("color-mix(in srgb, var(--color-on-dark) 55%, transparent)")
    const faded = g.nodes.find((n) => n.tier === 0)!
    expect(faded.f).toBe("color-mix(in srgb, var(--color-on-dark) 14%, transparent)")
    expect(faded.tc).toBe("color-mix(in srgb, var(--color-on-dark) 55%, transparent)")
    expect(g.edges.filter((e) => e.c === INK)).toHaveLength(5)
  })

  it("marks passing evidence in the accent and gaps in dim ink", () => {
    const g = heroGeometry("ready", 0)
    expect(g.evidence.map((e) => e.f)).toEqual([
      ACCENT,
      ACCENT,
      "color-mix(in srgb, var(--color-on-dark) 15%, transparent)",
      "color-mix(in srgb, var(--color-on-dark) 15%, transparent)",
    ])
    // Labels rest at the strokes' 55%, as the first build drew them.
    expect(g.evidence.map((e) => e.tc)).toEqual([
      ACCENT,
      ACCENT,
      "color-mix(in srgb, var(--color-on-dark) 55%, transparent)",
      "color-mix(in srgb, var(--color-on-dark) 55%, transparent)",
    ])
  })

  it("emits only token colours on every path, tick, and boot state", () => {
    const colours: string[] = []
    for (const path of ["sell", "offer", "ready"] as const) {
      for (const tick of [0, 1, 5, 11]) {
        for (const boot of [false, true]) {
          const g = heroGeometry(path, tick, boot)
          for (const n of g.nodes) colours.push(n.f, n.s, n.tc)
          for (const e of g.edges) colours.push(e.c)
          for (const v of g.evidence) colours.push(v.f, v.tc)
          for (const m of g.modules) colours.push(m.hs)
        }
      }
    }
    expect(colours.length).toBeGreaterThan(1000)
    expect(colours.filter((c) => !TOKEN_COLOUR.test(c))).toEqual([])
    expect(colours.some((c) => /#|rgba?\(/.test(c))).toBe(false)
  })
})

describe("hero funnel copy", () => {
  it("maps every stage to the path it belongs to", () => {
    const stages: HeroStage[] = ["route", "sellQ1", "sellQ2", "sellDone", "offer", "ready"]
    expect(stages.map(pathForStage)).toEqual(["sell", "sell", "sell", "sell", "offer", "ready"])
  })

  it("writes the result copy from timing and revenue", () => {
    expect(sellDoneTitle("now")).toBe("You could start a full sale process now.")
    expect(sellDoneTitle("mid")).toBe("This timing leaves room to prepare before buyers see the business.")
    expect(sellDoneTitle(null)).toBe("An advisor call does not commit you to selling.")
    expect(sellDoneSubtitle("u1")).toBe(
      "Full representation usually begins around $1M in annual revenue. An advisor can still suggest a next step."
    )
    expect(sellDoneSubtitle("10+")).toBe("We review larger businesses individually.")
    expect(sellDoneSubtitle("1-3")).toBe("Your business is in Heirloom’s usual range.")
  })

  it("sets the console field's intensity per stage, rising along the sell path, with no entry for ready", () => {
    expect(STAGE_INTENSITY).toEqual({ route: 0.1, sellQ1: 0.35, sellQ2: 0.55, sellDone: 0.85, offer: 0.5 })
    // The ready stage takes its level from the live exitIQ confidence instead.
    expect("ready" in STAGE_INTENSITY).toBe(false)
  })
})
