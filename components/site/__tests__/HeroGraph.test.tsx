import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HeroGraph } from "@/components/site/hero/HeroGraph"
import type { HeroPath } from "@/lib/site/hero/funnel"
import { HERO_CX, HERO_CY, heroGeometry } from "@/lib/site/hero/geometry"

const ACCENT = "var(--color-primary-on-dark)"
const MONO = "var(--font-mono)"
const DISPLAY = "var(--font-display)"
const EASE = "var(--ease-e1)"

function mount(path: HeroPath, tick = 0, boot = false) {
  const { container } = render(<HeroGraph path={path} tick={tick} boot={boot} />)
  const svg = container.querySelector("svg")!
  const top = Array.from(svg.children)
  // Document order: defs, three rings, six edges, twelve nodes, four evidence markers, four modules,
  // the offer figures, the sealed centre.
  return {
    svg,
    top,
    rings: top.slice(1, 4) as SVGGElement[],
    edges: top.slice(4, 10) as SVGPathElement[],
    nodes: top.slice(10, 22) as SVGGElement[],
    evidence: top.slice(22, 26) as SVGGElement[],
    modules: top.slice(26, 30) as SVGGElement[],
    offer: top[30] as SVGGElement,
    centre: top[31] as SVGGElement,
  }
}

describe("<HeroGraph />", () => {
  it("is one labelled image filling its pane, in the first build's viewBox", () => {
    const { svg, top } = mount("sell")
    expect(svg).toHaveAttribute("role", "img")
    expect(svg).toHaveAttribute("aria-label", "Diagram of a private buyer process around one business")
    expect(svg).toHaveAttribute("data-testid", "hero-graph")
    expect(svg).toHaveAttribute("viewBox", "240 100 600 460")
    expect(Array.from(svg.classList)).toEqual(["hero-svg", "absolute", "inset-0", "h-full", "w-full"])
    expect(top).toHaveLength(32)
    expect(top.map((el) => el.tagName)).toEqual([
      "defs",
      ...Array<string>(3).fill("g"),
      ...Array<string>(6).fill("path"),
      ...Array<string>(12).fill("g"),
      ...Array<string>(4).fill("g"),
      ...Array<string>(4).fill("g"),
      "g",
      "g",
    ])
  })

  it("draws the three rings from heroGeometry: dashed ellipses with mono caps captions above them", () => {
    const g = heroGeometry("sell", 0, false)
    const { rings } = mount("sell")
    expect(g.rings.map((r) => [r.r, r.ry, r.ly, r.l, r.o])).toEqual([
      [205, 168, 134, "MATCHED", 0.9],
      [150, 123, 179, "NDA SIGNED", 0.9],
      [95, 78, 224, "FINALISTS", 0.9],
    ])
    rings.forEach((ring, i) => {
      const r = g.rings[i]!
      expect(ring.style.opacity).toBe(String(r.o))
      expect(ring.style.transition).toBe(`opacity 1s ${EASE}`)
      const ellipse = ring.querySelector("ellipse")!
      expect(ellipse).toHaveAttribute("cx", String(HERO_CX))
      expect(ellipse).toHaveAttribute("cy", String(HERO_CY))
      expect(ellipse).toHaveAttribute("rx", String(r.r))
      expect(ellipse).toHaveAttribute("ry", String(r.ry))
      expect(ellipse).toHaveAttribute("stroke-dasharray", "3 7")
      expect(ellipse).toHaveAttribute("stroke-opacity", ".2")
      expect(Array.from(ellipse.classList)).toEqual(["animate-dash", "motion-reduce:animate-none"])
      const caption = ring.querySelector("text")!
      expect(caption.textContent).toBe(r.l)
      expect(caption).toHaveAttribute("x", String(HERO_CX))
      expect(caption).toHaveAttribute("y", String(r.ly))
      expect(caption).toHaveAttribute("text-anchor", "middle")
      expect(caption.style.font).toBe(`600 11.5px ${MONO}`)
      expect(caption.style.letterSpacing).toBe("1.6px")
    })
  })

  it("fades the rings to nothing while booting and dims them to 7% off the sell path", () => {
    expect(mount("sell", 0, true).rings.map((r) => r.style.opacity)).toEqual(["0", "0", "0"])
    expect(mount("offer").rings.map((r) => r.style.opacity)).toEqual(["0.07", "0.07", "0.07"])
    const ready = mount("ready")
    expect(ready.rings.map((r) => r.style.opacity)).toEqual(["0.8", "0.8", "0"])
    expect(ready.rings.map((r) => r.querySelector("text")!.textContent)).toEqual(["BUYER VIEW", "EVIDENCE", ""])
  })

  it("draws the six edges from heroGeometry, the live offer's in the accent", () => {
    const g = heroGeometry("sell", 0)
    const { edges } = mount("sell")
    edges.forEach((edge, i) => {
      const e = g.edges[i]!
      expect(edge).toHaveAttribute("d", e.d)
      expect(edge).toHaveAttribute("stroke", e.c)
      expect(edge).toHaveAttribute("stroke-width", "1.1")
      expect(edge).toHaveAttribute("fill", "none")
      expect(edge.style.opacity).toBe(String(e.o))
      expect(edge.style.transition).toBe(`opacity .9s ${EASE}`)
    })
    // The six edge slots belong to buyers 2, 5, 6, 7, 8, 9 (tier two and up); the live offer, buyer 6, is the third.
    expect(edges.map((e) => e.style.opacity)).toEqual(["0.22", "0.22", "0.55", "0.22", "0.22", "0.22"])
    expect(edges.filter((e) => e.getAttribute("stroke") === ACCENT)).toEqual([edges[2]])
    expect(edges[2]!.getAttribute("d")!.startsWith("M588.2 322.9 L")).toBe(true)
  })

  it("places the twelve buyer nodes by translate, with tooltips and a haloed accent offer node", () => {
    const g = heroGeometry("sell", 0)
    const { nodes } = mount("sell")
    nodes.forEach((node, i) => {
      const n = g.nodes[i]!
      expect(node.style.transform).toBe(`translate(${n.x}px,${n.y}px)`)
      expect(node.style.opacity).toBe(String(n.o))
      expect(node.style.transition).toBe(`transform 1.1s ${EASE}, opacity .9s ${EASE}`)
      const [dot, halo] = Array.from(node.querySelectorAll("circle"))
      expect(dot).toHaveAttribute("r", String(n.r))
      expect(dot).toHaveAttribute("fill", n.f)
      expect(dot).toHaveAttribute("stroke", n.s)
      expect(halo).toHaveAttribute("r", String(n.gr))
      expect(halo).toHaveAttribute("stroke-opacity", String(n.go))
      const label = node.querySelector("text")!
      expect(label.textContent).toBe(n.l)
      expect(label.style.font).toBe(`600 11px ${MONO}`)
      expect(label.style.fill).toBe(n.tc)
      expect(node.querySelector("title")!.textContent).toBe(n.tip)
    })
    const live = nodes[6]!
    expect(live.style.transform).toBe("translate(588.2px,322.9px)")
    expect(live.style.opacity).toBe("1")
    expect(live.querySelector("text")!.textContent).toBe("OFFER")
    expect(live.querySelectorAll("circle")[0]).toHaveAttribute("fill", ACCENT)
    expect(live.querySelectorAll("circle")[1]).toHaveAttribute("r", "11")
    expect(live.querySelector("title")!.textContent).toBe("Written offer received")
    expect(nodes.filter((n) => n.querySelector("text")!.textContent !== "")).toHaveLength(1)
  })

  it("hides every node and edge while booting", () => {
    const boot = mount("sell", 0, true)
    expect(boot.nodes.map((n) => n.style.opacity)).toEqual(Array<string>(12).fill("0"))
    expect(boot.edges.map((e) => e.style.opacity)).toEqual(Array<string>(6).fill("0"))
  })

  it("on the offer path shows one buyer east of the business, the four term modules, and the price figures", () => {
    const g = heroGeometry("offer", 0)
    const { nodes, modules, offer, evidence } = mount("offer")
    expect(nodes.filter((n) => n.style.opacity !== "0")).toEqual([nodes[6]])
    expect(nodes[6]!.style.transform).toBe("translate(742.0px,310.0px)")
    expect(nodes[6]!.querySelector("text")!.textContent).toBe("THE BUYER")
    modules.forEach((module, i) => {
      const m = g.modules[i]!
      expect(module.style.transform).toBe(`translate(${m.x}px,${m.y}px)`)
      expect(module.style.opacity).toBe("1")
      expect(module.style.transition).toBe(`transform 1s ${EASE}, opacity .8s ${EASE}`)
      const pill = module.querySelector("rect")!
      expect(pill).toHaveAttribute("width", "120")
      expect(pill).toHaveAttribute("height", "24")
      expect(pill).toHaveAttribute("rx", "12")
      expect(pill).toHaveAttribute("stroke", m.hs)
      expect(pill.style.transition).toBe(`stroke .6s ${EASE}`)
      const label = module.querySelector("text")!
      expect(label.textContent).toBe(m.l)
      expect(label.style.font).toBe(`600 10px ${MONO}`)
    })
    expect(modules.map((m) => m.querySelector("text")!.textContent)).toEqual([
      "PRICE",
      "CASH AT CLOSING",
      "FINANCING",
      "CLOSING RISK",
    ])
    expect(modules.map((m) => m.querySelector("rect")!.getAttribute("stroke"))).toEqual([
      ACCENT,
      "color-mix(in srgb, var(--color-on-dark) 25%, transparent)",
      "color-mix(in srgb, var(--color-on-dark) 25%, transparent)",
      "color-mix(in srgb, var(--color-on-dark) 25%, transparent)",
    ])
    expect(offer.style.opacity).toBe("1")
    expect(offer.style.transition).toBe(`opacity .9s ${EASE}`)
    const [price, cash] = Array.from(offer.children).filter((el) => el.tagName === "text")
    expect(price!.textContent).toBe("$4.8M HEADLINE PRICE")
    expect((price as SVGTextElement).style.font).toBe(`500 26px ${DISPLAY}`)
    expect(price).toHaveAttribute("x", "713")
    expect(price).toHaveAttribute("y", "486")
    const unit = price!.querySelector("tspan")!
    expect(unit.textContent).toBe("HEADLINE PRICE")
    expect(unit.style.font).toBe(`600 9.5px ${MONO}`)
    expect(cash!.textContent).toBe("$3.6M CASH AT CLOSING")
    expect((cash as SVGTextElement).style.font).toBe(`600 11px ${MONO}`)
    expect(cash).toHaveAttribute("y", "508")
    expect(evidence.map((v) => v.style.opacity)).toEqual(["0", "0", "0", "0"])
  })

  it("lights the module for the tick and hides the price figures and modules off the offer path", () => {
    const tick3 = mount("offer", 3)
    expect(tick3.modules.map((m) => m.querySelector("rect")!.getAttribute("stroke") === ACCENT)).toEqual([
      false,
      false,
      false,
      true,
    ])
    for (const path of ["sell", "ready"] as const) {
      const { offer, modules } = mount(path)
      expect(offer.style.opacity).toBe("0")
      expect(modules.map((m) => m.style.opacity)).toEqual(["0", "0", "0", "0"])
    }
  })

  it("on the ready path shows the four evidence markers with their labels set away from the centre", () => {
    const g = heroGeometry("ready", 0)
    const { evidence, nodes } = mount("ready")
    expect(nodes.map((n) => n.style.opacity)).toEqual(Array<string>(12).fill("0"))
    evidence.forEach((marker, i) => {
      const v = g.evidence[i]!
      expect(marker.style.transform).toBe(`translate(${v.x}px,${v.y}px)`)
      expect(marker.style.opacity).toBe("1")
      expect(marker.style.transition).toBe(`transform 1.1s ${EASE}, opacity .9s ${EASE}`)
      const ring = marker.querySelector("circle")!
      expect(ring).toHaveAttribute("r", "10")
      expect(ring).toHaveAttribute("stroke-opacity", String(v.go))
      expect(ring.style.transition).toBe(`stroke-opacity .6s ${EASE}`)
      const diamond = marker.querySelector("rect")!
      expect(diamond).toHaveAttribute("transform", "rotate(45)")
      expect(diamond).toHaveAttribute("fill", v.f)
      const label = marker.querySelector("text")!
      expect(label.textContent).toBe(v.l)
      expect(label).toHaveAttribute("x", String(v.tx))
      expect(label).toHaveAttribute("text-anchor", v.ta)
      expect(label.style.font).toBe(`600 11px ${MONO}`)
      expect(label.style.fill).toBe(v.tc)
    })
    expect(evidence.map((v) => v.querySelector("text")!.getAttribute("text-anchor"))).toEqual([
      "start",
      "start",
      "end",
      "end",
    ])
    expect(evidence.map((v) => v.querySelector("text")!.getAttribute("x"))).toEqual(["14", "14", "-14", "-14"])
    expect(evidence.map((v) => v.querySelector("circle")!.getAttribute("stroke-opacity"))).toEqual([
      "0.8",
      "0",
      "0",
      "0",
    ])
    expect(mount("ready", 2).evidence.map((v) => v.querySelector("circle")!.getAttribute("stroke-opacity"))).toEqual([
      "0",
      "0",
      "0.8",
      "0",
    ])
  })

  it("seals the centre: ticks, a fast dashed ring, the accent core, and the YOUR BUSINESS caption", () => {
    const { centre } = mount("sell")
    expect(centre.style.transform).toBe(`translate(${HERO_CX}px,${HERO_CY}px)`)
    const circles = Array.from(centre.querySelectorAll("circle"))
    expect(circles.map((c) => c.getAttribute("r"))).toEqual(["64", "52", "19", "19", "3"])
    expect(Array.from(circles[1]!.classList)).toEqual(["animate-dash-fast", "motion-reduce:animate-none"])
    expect(circles[1]).toHaveAttribute("stroke-dasharray", "2 6")
    expect(circles[2]).toHaveAttribute("fill", "url(#hlSeal)")
    expect(circles[4]).toHaveAttribute("fill", "#4CE27E")
    expect(centre.querySelectorAll("line")).toHaveLength(4)
    const caption = centre.querySelector("text")!
    expect(caption.textContent).toBe("YOUR BUSINESS")
    expect(caption).toHaveAttribute("y", "90")
    expect(caption.style.font).toBe(`600 11px ${MONO}`)
    expect(caption.style.letterSpacing).toBe("1.8px")
  })

  it("animates only the four dashed strokes, each switched off under reduced motion", () => {
    const { svg } = mount("sell")
    const animated = Array.from(svg.querySelectorAll("[class*='animate-']"))
    expect(animated).toHaveLength(4)
    expect(animated.map((el) => el.tagName)).toEqual(["ellipse", "ellipse", "ellipse", "circle"])
    for (const el of animated) expect(el.classList.contains("motion-reduce:animate-none")).toBe(true)
    expect(animated.filter((el) => el.classList.contains("animate-dash"))).toHaveLength(3)
    expect(animated.filter((el) => el.classList.contains("animate-dash-fast"))).toHaveLength(1)
  })

  it("sets every mono label in the mono face and only the price in the display face", () => {
    const { svg } = mount("offer")
    const texts = Array.from(svg.querySelectorAll("text")) as SVGTextElement[]
    // 3 ring captions + 12 node labels + 4 evidence labels + 4 module labels + 2 price lines + the seal caption.
    expect(texts).toHaveLength(26)
    const display = texts.filter((t) => t.style.font.includes(DISPLAY))
    expect(display).toHaveLength(1)
    expect(display[0]!.textContent).toBe("$4.8M HEADLINE PRICE")
    expect(texts.filter((t) => t.style.font.includes(MONO))).toHaveLength(25)
    expect(texts.filter((t) => /['"]|Plex|Newsreader/.test(t.style.font))).toEqual([])
  })
})
