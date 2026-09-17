import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  BrandLockup,
  lockupMetrics,
  MARK_BOX,
  MARK_PATH,
  WORDMARK_BOX,
  WORDMARK_GLYPHS,
} from "@/components/site/brand/BrandLockup"

/** `translate(x y) scale(s)` → numbers. */
function parseTransform(el: Element | null) {
  const t = el?.getAttribute("transform") ?? ""
  const m = /^translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)$/.exec(t)
  if (!m) throw new Error(`unexpected transform: ${t}`)
  return { x: Number(m[1]), y: Number(m[2]), scale: Number(m[3]) }
}

/** The horizontal lockup: a span holding the mark's svg and the text word. */
function mountHorizontal(ui: React.ReactElement) {
  const { container } = render(ui)
  const lockup = container.querySelector('[data-testid="brand-lockup"]')! as HTMLElement
  const svg = lockup.querySelector("svg")!
  return {
    lockup,
    svg,
    mark: svg.querySelector('[data-testid="brand-mark"]'),
    word: lockup.querySelector('[data-testid="brand-wordmark"]') as HTMLElement | null,
    paths: Array.from(lockup.querySelectorAll("path")).map((p) => p.getAttribute("d")),
  }
}

/** The svg variants (mark, stacked). */
function mountSvg(ui: React.ReactElement) {
  const { container } = render(ui)
  const svg = container.querySelector("svg")!
  const wordmark = svg.querySelector('[data-testid="brand-wordmark"]')
  return {
    svg,
    mark: svg.querySelector('[data-testid="brand-mark"]'),
    wordmark,
    /** The eight glyph groups' own transforms (each glyph's move from its PNG advance to the variant's tracking). */
    glyphShifts: wordmark ? Array.from(wordmark.children).map((g) => g.getAttribute("transform")) : [],
    paths: Array.from(svg.querySelectorAll("path")).map((p) => p.getAttribute("d")),
  }
}

// The eight glyph paths in order, as the stacked variant draws them.
const GLYPH_PATHS = WORDMARK_GLYPHS.map((g) => g.path)

/**
 * Every on-path point of an absolute M/L/A path, in the path's own units (arc radii and flags skipped): what
 * decides whether the drawing fits the box every scale in the component is derived from.
 */
function pathPoints(d: string): Array<[number, number]> {
  const tokens = d.match(/[MLAZ]|-?\d*\.?\d+/g) ?? []
  const points: Array<[number, number]> = []
  let command = ""
  let i = 0
  while (i < tokens.length) {
    const token = tokens[i]!
    if (/^[MLAZ]$/.test(token)) {
      command = token
      i += 1
    } else if (command === "M" || command === "L") {
      points.push([Number(tokens[i]), Number(tokens[i + 1])])
      i += 2
    } else if (command === "A") {
      // rx ry rotation large-arc sweep x y — only the endpoint is on the path.
      points.push([Number(tokens[i + 5]), Number(tokens[i + 6])])
      i += 7
    } else {
      throw new Error(`unexpected path token: ${token}`)
    }
  }
  return points
}

describe("<BrandLockup markHeight={28} /> horizontal (the bar, the footer, the share card)", () => {
  it("is an inline-flex span, tagged for tests, holding the mark's svg then the word, 0.2143 mark-heights apart, at a 28px mark", () => {
    const { lockup, svg, word } = mountHorizontal(<BrandLockup markHeight={28} />)
    expect(lockup.tagName).toBe("SPAN")
    expect(lockup).toHaveAttribute("data-variant", "horizontal")
    expect(lockup).toHaveClass("inline-flex", "items-center", "shrink-0")
    expect(lockup.children).toHaveLength(2)
    expect(lockup.children[0]).toBe(svg)
    expect(lockup.children[1]).toBe(word)
    // 0.2143 × 28 = 6px between the mark's box and the word's box.
    expect(lockup).toHaveStyle({ gap: "6px" })
    expect(lockup.getAttribute("style")).toBe("gap: 6px;")
  })

  it("draws the mark alone in the svg: decorative, currentColor, 27.29 × 28 for a 28px mark, the path at scale 28/833", () => {
    const { svg, mark, paths } = mountHorizontal(<BrandLockup markHeight={28} />)
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg).toHaveAttribute("fill", "currentColor")
    expect(svg).toHaveAttribute("fill-rule", "evenodd")
    expect(svg).toHaveAttribute("width", "27.29")
    expect(svg).toHaveAttribute("height", "28")
    expect(svg).toHaveAttribute("viewBox", "0 0 27.29 28")
    expect(svg).toHaveClass("block", "shrink-0")
    expect(svg).not.toHaveAttribute("data-testid")
    expect(paths).toEqual([MARK_PATH])
    expect(parseTransform(mark)).toEqual({ x: 0, y: 0, scale: 0.033613 })
    expect(svg.querySelector('[data-testid="brand-wordmark"]')).toBeNull()
  })

  it("sets the word Heirloom as text in the brand rung, hidden from the accessibility tree, at 0.9821 of the mark: 27.5px at 28", () => {
    const { word } = mountHorizontal(<BrandLockup markHeight={28} />)
    expect(word!.tagName).toBe("SPAN")
    expect(word!.textContent).toBe("Heirloom")
    expect(word).toHaveAttribute("aria-hidden", "true")
    expect(word!.getAttribute("class")).toBe("type-brand")
    expect(word).toHaveStyle({ fontSize: "27.5px" })
    expect(word!.getAttribute("style")).toBe("font-size: 27.5px;")
    // Title case is in the markup, never a transform; no size class, no tracking class, no weight class.
    expect(word!.outerHTML).not.toMatch(
      /uppercase|capitalize|text-\[|tracking-|font-(thin|light|normal|medium|semibold|bold)/
    )
    // The face, its weight and width live in the utility: nothing inline but the size, and no shift at all.
    expect(word!.style.top).toBe("")
    expect(word!.style.position).toBe("")
    expect(word!.style.letterSpacing).toBe("")
    expect(word!.style.fontFamily).toBe("")
    expect(word!.style.fontWeight).toBe("")
  })

  it("at the footer's 24px mark the word is 23.57px, the gap 5.14px and the mark 23.39 wide", () => {
    const { lockup, svg, word } = mountHorizontal(<BrandLockup markHeight={24} />)
    expect(word).toHaveStyle({ fontSize: "23.57px" })
    expect(lockup).toHaveStyle({ gap: "5.14px" })
    expect(svg).toHaveAttribute("height", "24")
    expect(svg).toHaveAttribute("width", "23.39")
  })

  it("reveal animates the mark group only, from its own centre; the word never animates", () => {
    const { lockup, mark, word } = mountHorizontal(<BrandLockup markHeight={28} reveal />)
    const animated = lockup.querySelectorAll(".animate-mark-in")
    expect(animated).toHaveLength(1)
    const inner = animated[0]!
    expect(inner).toHaveClass("animate-mark-in", "motion-reduce:animate-none")
    expect(mark!.contains(inner)).toBe(true)
    expect(inner.querySelectorAll("path")).toHaveLength(1)
    expect(inner).toHaveStyle({ transformBox: "fill-box", transformOrigin: "center" })
    // The layout transform stays on the outer group, untouched by the CSS animation.
    expect(inner.getAttribute("transform")).toBeNull()
    expect(mark!.getAttribute("transform")).toBe("translate(0 0) scale(0.033613)")
    expect(word!.outerHTML).not.toContain("animate-")
    expect(word!.getAttribute("class")).toBe("type-brand")
  })

  it("without reveal nothing carries an animate- class, and the only styles are the gap and the font-size", () => {
    const { lockup } = mountHorizontal(<BrandLockup markHeight={28} />)
    expect(lockup.outerHTML).not.toContain("animate-")
    expect(Array.from(lockup.querySelectorAll("[style]")).map((el) => el.getAttribute("style"))).toEqual([
      "font-size: 27.5px;",
    ])
  })

  it("merges className onto the wrapper span, not the svg or the word, and keeps inline-flex under a prefixed hide", () => {
    const { lockup, svg, word } = mountHorizontal(<BrandLockup markHeight={28} className="text-ink" />)
    expect(lockup).toHaveClass("text-ink")
    expect(svg).not.toHaveClass("text-ink")
    expect(word).not.toHaveClass("text-ink")
    // The bar hides the horizontal lockup only through variant-prefixed `hidden`, so `inline-flex` must survive it.
    const { lockup: hidden } = mountHorizontal(
      <BrandLockup markHeight={28} className="max-nav:group-data-[state=scrolled]:hidden" />
    )
    expect(hidden).toHaveClass("inline-flex", "max-nav:group-data-[state=scrolled]:hidden")
  })
})

describe("<BrandLockup markHeight={28} /> mark and stacked (svg)", () => {
  it("the mark variant is a square of the mark height with the mark centred and no word", () => {
    const { svg, mark, wordmark, paths } = mountSvg(<BrandLockup variant="mark" markHeight={32} />)
    expect(svg).toHaveAttribute("data-testid", "brand-lockup")
    expect(svg).toHaveAttribute("data-variant", "mark")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg).toHaveAttribute("fill", "currentColor")
    expect(svg).toHaveAttribute("fill-rule", "evenodd")
    expect(svg).toHaveAttribute("width", "32")
    expect(svg).toHaveAttribute("height", "32")
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32")
    expect(svg).toHaveClass("block", "shrink-0")
    expect(wordmark).toBeNull()
    expect(svg.textContent).toBe("")
    expect(paths).toEqual([MARK_PATH])
    // (32 − 32 × 812/833) / 2 = 0.4px of side bearing keeps the square viewBox centred on the mark.
    expect(parseTransform(mark)).toEqual({ x: 0.4, y: 0, scale: 0.038415 })
  })

  it("the mark variant merges className onto the svg, where the bar's bare hidden replaces its block display", () => {
    const { svg } = mountSvg(<BrandLockup markHeight={28} variant="mark" className="text-ink" />)
    expect(svg).toHaveClass("block", "shrink-0", "text-ink")
    // `MARK_CLASS` opens with a bare `hidden`, which must beat the svg's own `block`.
    const { svg: hidden } = mountSvg(<BrandLockup markHeight={28} variant="mark" className="hidden" />)
    expect(hidden).toHaveClass("hidden")
    expect(hidden).not.toHaveClass("block")
  })

  it("the stacked variant sets the PNG wordmark under the mark at 0.13 of its height after a 0.13 gap, at the PNG's own tracking", () => {
    const { svg, mark, wordmark, glyphShifts, paths } = mountSvg(<BrandLockup variant="stacked" markHeight={72} />)
    expect(svg).toHaveAttribute("data-testid", "brand-lockup")
    expect(svg).toHaveAttribute("data-variant", "stacked")
    // Width is the wordmark's: 0.13 × 72 × 1046 / 53 = 184.73; height 72 × (1 + 0.13 + 0.13) = 90.72.
    expect(svg).toHaveAttribute("width", "184.73")
    expect(svg).toHaveAttribute("height", "90.72")
    expect(svg).toHaveAttribute("viewBox", "0 0 184.73 90.72")
    expect(paths).toHaveLength(9)
    expect(paths[0]).toBe(MARK_PATH)
    expect(paths.slice(1)).toEqual(GLYPH_PATHS)
    expect(mark!.querySelectorAll("path")).toHaveLength(1)
    expect(wordmark!.querySelectorAll("path")).toHaveLength(8)
    const m = parseTransform(mark)
    const w = parseTransform(wordmark)
    expect(m.y).toBe(0)
    expect(w.y).toBeCloseTo(72 * 1.13, 2)
    expect(w.y).toBeGreaterThan(m.y + 72)
    expect(w.x).toBe(0)
    // The 70.18px-wide mark is centred over the wordmark: (184.73 − 70.18) / 2.
    expect(m.x).toBeCloseTo(57.28, 1)
    expect(w.scale).toBeCloseTo((0.13 * 72) / 53, 4)
    // The PNG's lockup: every glyph stays on its measured advance, one path per glyph group.
    expect(glyphShifts).toEqual(Array<string>(8).fill("translate(0 0)"))
    Array.from(wordmark!.children).forEach((g, i) => {
      expect(g.querySelectorAll("path")).toHaveLength(1)
      expect(g.querySelector("path")).toHaveAttribute("d", GLYPH_PATHS[i]!)
    })
    // The stacked word is geometry: no text, no brand rung, and no class of its own to animate.
    expect(svg.textContent).toBe("")
    expect(svg.outerHTML).not.toContain("type-brand")
    expect(wordmark!.getAttribute("class")).toBeNull()
  })
})

describe("BrandLockup metrics and geometry", () => {
  it("lockupMetrics('horizontal') gives the font-size, the gap and the word's box width at the two live sizes", () => {
    // At 28 (the bar): mark 27.29 + gap 6 + word 27.5 × 3.7313 = 102.61 → 135.9 wide (Chromium reads 135.89).
    expect(lockupMetrics("horizontal", 28)).toEqual({
      width: 135.9,
      height: 28,
      mark: { x: 0, y: 0, scale: 28 / 833 },
      wordmark: null,
      word: { fontSize: 27.5, gap: 6, width: 102.61 },
    })
    // At 24 (the footer): 23.39 + 5.14 + 23.57 × 3.7313 = 87.95 → 116.48 (Chromium renders 116.45).
    expect(lockupMetrics("horizontal", 24)).toEqual({
      width: 116.48,
      height: 24,
      mark: { x: 0, y: 0, scale: 24 / 833 },
      wordmark: null,
      word: { fontSize: 23.57, gap: 5.14, width: 87.95 },
    })
  })

  it("keeps every drawn coordinate inside the two boxes the component scales by", () => {
    // Nothing else checks this: every width, viewBox and scale is derived from MARK_BOX and WORDMARK_BOX, never
    // from the paths, so a re-traced path wider than its box clips inside the viewBox with no other test failing.
    const mark = pathPoints(MARK_PATH)
    expect(mark).toHaveLength(34)
    expect(Math.min(...mark.map(([x]) => x))).toBe(0)
    expect(Math.min(...mark.map(([, y]) => y))).toBe(0)
    expect(Math.max(...mark.map(([x]) => x))).toBe(MARK_BOX.width)
    expect(Math.max(...mark.map(([, y]) => y))).toBe(MARK_BOX.height)

    // The eight glyph paths are drawn in one wordmark space: the H opens it at 0, the m closes it at 1046.
    expect(GLYPH_PATHS).toHaveLength(8)
    const word = GLYPH_PATHS.flatMap((d) => pathPoints(d))
    expect(Math.min(...word.map(([x]) => x))).toBe(0)
    expect(Math.min(...word.map(([, y]) => y))).toBe(0)
    expect(Math.max(...word.map(([x]) => x))).toBe(WORDMARK_BOX.width)
    expect(Math.max(...word.map(([, y]) => y))).toBe(WORDMARK_BOX.cap)
  })
})
