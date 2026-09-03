import { describe, expect, it } from "vitest"
import {
  pathForStage,
  sellDoneSubtitle,
  sellDoneTitle,
  STAGE_INTENSITY,
  STAGE_PROGRESS_LABEL,
} from "@/lib/site/hero/funnel"
import { HERO_CX, HERO_CY, heroGeometry } from "@/lib/site/hero/geometry"

describe("heroGeometry", () => {
  it("places twelve nodes, six edges, three rings, six evidence markers, and seven modules", () => {
    const g = heroGeometry("sell", 0, false)
    expect(g.nodes).toHaveLength(12)
    expect(g.edges).toHaveLength(6)
    expect(g.rings).toHaveLength(3)
    expect(g.evidence).toHaveLength(6)
    expect(g.modules).toHaveLength(7)
  })

  it("lights exactly one live offer node on the sell path and rotates it with the tick", () => {
    const live0 = heroGeometry("sell", 0).nodes.findIndex((n) => n.tier === 5)
    const live1 = heroGeometry("sell", 1).nodes.findIndex((n) => n.tier === 5)
    expect(live0).toBe(6)
    expect(live1).toBe(5)
    expect(heroGeometry("sell", 0).nodes.filter((n) => n.tier === 5)).toHaveLength(1)
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
    expect(lit.length).toBeGreaterThan(0)
    expect(new Set(lit.map((e) => e.d)).size).toBe(1)
  })

  it("hides buyers and shows evidence markers on the ready path", () => {
    const g = heroGeometry("ready", 0)
    expect(g.nodes.every((n) => n.o === 0)).toBe(true)
    expect(g.evidence.every((e) => e.o === 1)).toBe(true)
    expect(g.rings[0]?.l).toBe("HOW BUYERS WOULD VIEW IT")
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
    const live = g.edges.find((e) => e.c === "#4CE27E")
    expect(live).toBeDefined()
    const [, end] = live!.d.split(" L")
    const [ex, ey] = end!.split(" ").map(Number)
    const dist = Math.hypot(HERO_CX - ex!, HERO_CY - ey!)
    expect(dist).toBeGreaterThan(60)
    expect(dist).toBeLessThan(72)
  })

  it("labels the module for the current tick as live", () => {
    const g = heroGeometry("offer", 3)
    expect(g.modules[3]?.hs).toBe("#4CE27E")
    expect(g.modules[0]?.hs).not.toBe("#4CE27E")
  })
})

describe("hero funnel copy", () => {
  it("maps every stage to a path and a progress label", () => {
    expect(pathForStage("offer")).toBe("offer")
    expect(pathForStage("ready")).toBe("ready")
    expect(pathForStage("sellQ2")).toBe("sell")
    expect(STAGE_PROGRESS_LABEL.route).toBe("")
    expect(STAGE_INTENSITY.sellDone).toBeGreaterThan(STAGE_INTENSITY.sellQ1)
  })

  it("writes the result copy from timing and revenue", () => {
    expect(sellDoneTitle("now")).toMatch(/ready to begin/)
    expect(sellDoneTitle(null)).toMatch(/without committing/)
    expect(sellDoneSubtitle("u1")).toMatch(/around \$1M/)
    expect(sellDoneSubtitle("10+")).toBe("We review larger businesses individually.")
    expect(sellDoneSubtitle("1-3")).toMatch(/core range/)
  })
})
