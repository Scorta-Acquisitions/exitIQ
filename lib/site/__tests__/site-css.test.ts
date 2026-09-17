import { describe, expect, it } from "vitest"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { BRAND_WORD_SHIFT_EM } from "@/components/site/brand/BrandLockup"

/**
 * styles/site.css is the single declaration of the design system: the Heirloom-green palette, the
 * Reesha type ladder, the five radii, the one shadow, and the surface context. These tests pin the
 * token values and the global rules so a refactor cannot quietly reintroduce a second accent, a
 * gradient, a glow, or a weight the ladder does not have.
 */
const css = readFileSync("styles/site.css", "utf8")
const fonts = readFileSync("styles/fonts.css", "utf8")
const theme = css.match(/@theme \{([\s\S]*?)\n\}\n/)![1]!

const token = (name: string) => theme.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim() ?? null
const block = (selector: string) => {
  const match = css.match(new RegExp(`(^|\\n)[^{}]*${selector.replace(/[.*+?^$()[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`))
  return match?.[2] ?? null
}
const utility = (name: string) => css.match(new RegExp(`@utility ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? null

describe("palette", () => {
  it("replaces the system's blue with the Heirloom action green and its two siblings", () => {
    expect(token("color-primary")).toBe("#0f7a45")
    expect(token("color-primary-focus")).toBe("#128f51")
    expect(token("color-primary-on-dark")).toBe("#4ce27e")
    expect(token("color-primary-on-dark-focus")).toBe("#63e88c")
    expect(token("color-on-primary")).toBe("#ffffff")
  })

  it("declares the brand lockup's own green, darker on light than the on-dark reading", () => {
    // Chosen 2026-09-17 from a rendered panel: 4.9:1 on the parchment, 7.6:1 on the bar's surface-black,
    // where `primary-on-dark` at 11.4:1 read too bright.
    expect(token("color-heirloom")).toBe("#0f7a45")
    expect(token("color-heirloom-on-dark")).toBe("#4ca270")
  })

  it("declares the ink, the on-dark inks, and the two muted inks", () => {
    expect(token("color-ink")).toBe("#0e241b")
    expect(token("color-ink-muted-80")).toBe("#3b4a41")
    expect(token("color-ink-muted-48")).toBe("#5f6d63")
    expect(token("color-on-dark")).toBe("#f0f8f2")
    expect(token("color-on-dark-muted")).toBe("#b4c6ba")
    expect(token("color-on-dark-muted-48")).toBe("#8a9b92")
    expect(token("color-error")).toBe("#8a3b2e")
    expect(token("color-error-on-dark")).toBe("#e9a595")
  })

  it("declares the light canvases and the deep-green tiles as flat solids", () => {
    expect(token("color-canvas")).toBe("#ffffff")
    expect(token("color-canvas-parchment")).toBe("#f4f5ee")
    expect(token("color-surface-pearl")).toBe("#fbfcf8")
    expect(token("color-tile-1")).toBe("#0b241b")
    expect(token("color-tile-2")).toBe("#0f2e23")
    expect(token("color-tile-3")).toBe("#062314")
    expect(token("color-surface-black")).toBe("#04120c")
    expect(token("color-hairline")).toBe("#dfe3d9")
    expect(token("color-divider-soft")).toBe("#eef0e8")
  })

  it("resets Tailwind's default palette so only tokens exist", () => {
    expect(theme).toMatch(/--color-\*: initial;/)
    expect(theme).toMatch(/--font-\*: initial;/)
    expect(theme).toMatch(/--radius-\*: initial;/)
    expect(theme).toMatch(/--shadow-\*: initial;/)
  })

  it("defines no gradient anywhere", () => {
    expect(css).not.toMatch(/linear-gradient|radial-gradient|conic-gradient/)
  })
})

describe("surface context", () => {
  it("light values of the contextual tokens match the palette", () => {
    expect(token("color-fg")).toBe(token("color-ink"))
    expect(token("color-fg-2")).toBe(token("color-ink-muted-80"))
    expect(token("color-fg-3")).toBe(token("color-ink-muted-48"))
    expect(token("color-accent")).toBe(token("color-primary"))
    expect(token("color-accent-focus")).toBe(token("color-primary-focus"))
    expect(token("color-line")).toBe(token("color-hairline"))
    expect(token("color-surface")).toBe(token("color-canvas"))
    expect(token("color-surface-2")).toBe(token("color-canvas-parchment"))
  })

  it("on-dark re-points every contextual token to its dark counterpart", () => {
    const dark = block(".on-dark")
    expect(dark).toMatch(/--color-primary: var\(--color-primary-on-dark\);/)
    expect(dark).toMatch(/--color-primary-focus: var\(--color-primary-on-dark-focus\);/)
    expect(dark).toMatch(/--color-heirloom: var\(--color-heirloom-on-dark\);/)
    expect(dark).toMatch(/--color-on-primary: var\(--color-tile-1\);/)
    expect(dark).toMatch(/--color-fg: var\(--color-on-dark\);/)
    expect(dark).toMatch(/--color-fg-2: var\(--color-on-dark-muted\);/)
    expect(dark).toMatch(/--color-fg-3: var\(--color-on-dark-muted-48\);/)
    expect(dark).toMatch(/--color-accent: var\(--color-primary-on-dark\);/)
    expect(dark).toMatch(/--color-accent-focus: var\(--color-primary-on-dark\);/)
    expect(dark).toMatch(/--color-line: rgba\(240, 248, 242, 0\.14\);/)
    expect(dark).toMatch(/--color-surface: var\(--color-tile-2\);/)
    expect(dark).toMatch(/--color-error: var\(--color-error-on-dark\);/)
    expect(dark).toMatch(/color: var\(--color-fg\);/)
    expect(dark).toMatch(/color-scheme: dark;/)
  })

  it("on-light restores the light values for a light card inside a dark tile", () => {
    const light = block(".on-light")
    expect(light).toMatch(/--color-primary: #0f7a45;/)
    expect(light).toMatch(/--color-heirloom: #0f7a45;/)
    expect(light).toMatch(/--color-on-primary: #ffffff;/)
    expect(light).toMatch(/--color-fg: var\(--color-ink\);/)
    expect(light).toMatch(/--color-accent: var\(--color-primary\);/)
    expect(light).toMatch(/--color-surface: var\(--color-canvas\);/)
  })
})

describe("type", () => {
  it("sets Newsreader for display and IBM Plex Sans for text, each with a metric-matched fallback and the system stack behind it", () => {
    // The metric-matched fallback sits between the webfont and the system stack, so the swap never reflows.
    expect(token("font-display")).toMatch(/^"Newsreader", "Newsreader Fallback", Georgia, "Times New Roman", serif$/)
    expect(token("font-text")).toMatch(/^"IBM Plex Sans", "IBM Plex Sans Fallback", system-ui, -apple-system/)
    expect(css).toMatch(/@import "\.\/fonts\.css";/)
  })

  it("declares the third face for the wordmark alone: --font-brand is Mona Sans with its Arial fallback and the sans system stack, after the text token; nothing condensed", () => {
    expect(token("font-brand")).toMatch(
      /^"Mona Sans", "Mona Sans Fallback", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,\s+sans-serif$/
    )
    expect(new Set(theme.match(/--font-[a-z]+:/g))).toEqual(
      new Set(["--font-display:", "--font-text:", "--font-brand:", "--font-mono:"])
    )
    expect(css).not.toMatch(/Condensed/)
    expect(fonts).not.toMatch(/Condensed/)
    // Only the wordmark's utility reads the brand token.
    expect(css.match(/var\(--font-brand\)/g)).toHaveLength(1)
  })

  it("declares type-brand as the one sizeless rung: Mona Sans at weight 450 and width 90, line-height 1, no tracking and no shift (the face's box centres the word's ink on the mark)", () => {
    const brand = utility("type-brand")
    expect(brand).toBe(
      "\n  font-family: var(--font-brand);\n  font-weight: 450;\n  font-stretch: 90%;\n  line-height: 1;"
    )
    expect(BRAND_WORD_SHIFT_EM).toBe(0)
    expect(brand).not.toMatch(
      /font-size|text-transform|letter-spacing|margin|font-variation-settings|font-optical-sizing|position|top:/
    )
    // It follows the nav-link rung, the last sized step, and is the only type utility without a size.
    const sizeless = (css.match(/@utility type-[a-z-]+ \{[\s\S]*?\n\}/g) ?? []).filter((u) => !/font-size/.test(u))
    expect(sizeless.map((u) => /@utility (type-[a-z-]+)/.exec(u)![1])).toEqual(["type-brand"])
  })

  it("declares Newsreader as a variable face (upright and italic), IBM Plex Sans at the ladder's four weights and Mona Sans as a variable width-and-weight face for the wordmark, latin and latin-ext, upright, self-hosted, plus three metric-matched fallbacks, and no condensed cut", () => {
    const every = fonts.match(/@font-face \{[\s\S]*?\}/g) ?? []
    expect(every).toHaveLength(23)
    const news = every.filter((f) => /font-family: "Newsreader";/.test(f))
    const plexAll = every.filter((f) => /font-family: "IBM Plex Sans";/.test(f))
    const mono = every.filter((f) => /font-family: "IBM Plex Mono";/.test(f))
    const mona = every.filter((f) => /font-family: "Mona Sans";/.test(f))
    const fallbacks = every.filter((f) => /Fallback"/.test(f))
    expect([news.length, plexAll.length, mono.length, mona.length, fallbacks.length]).toEqual([4, 10, 4, 2, 3])
    // Every face is one of those five families: the wordmark's condensed cut left with the setting it served.
    expect(new Set(every.map((f) => /font-family: "([^"]+)";/.exec(f)![1]))).toEqual(
      new Set([
        "Newsreader",
        "IBM Plex Sans",
        "IBM Plex Mono",
        "Mona Sans",
        "Newsreader Fallback",
        "IBM Plex Sans Fallback",
        "Mona Sans Fallback",
      ])
    )
    // Mona Sans: the variable file per subset, both axes declared, upright, swap, self-hosted, in the wordmark's folder.
    for (const face of mona) {
      expect(face).toMatch(/font-style: normal;/)
      expect(face).toMatch(/font-weight: 200 900;/)
      expect(face).toMatch(/font-stretch: 75% 125%;/)
      expect(face).toMatch(/font-display: swap;/)
      expect(face).toMatch(/unicode-range:\s*U\+/)
      expect(face).not.toMatch(/local\(|googleapis|gstatic/)
    }
    expect(mona.map((f) => /url\("\/fonts\/([^"]+)"\)/.exec(f)![1])).toEqual([
      "mona-sans/MonaSans-variable-latin.woff2",
      "mona-sans/MonaSans-variable-latin-ext.woff2",
    ])
    // The restored exitIQ console alone uses Plex Mono (400 / 500) and Plex Sans 500; the ladder never does.
    expect(mono.map((f) => /font-weight: (\d+);/.exec(f)![1])).toEqual(["400", "400", "500", "500"])
    for (const face of mono)
      expect(face).toMatch(/url\("\/fonts\/ibm-plex-mono\/IBMPlexMono-[45]00-latin(-ext)?\.woff2"\)/)
    const plex500 = plexAll.filter((f) => /font-weight: 500;/.test(f))
    expect(plex500).toHaveLength(2)
    const plex = plexAll.filter((f) => !/font-weight: 500;/.test(f))
    for (const face of [...news, ...plex]) {
      expect(face).toMatch(/font-display: swap;/)
      expect(face).toMatch(/unicode-range:\s*U\+/)
      expect(face).not.toMatch(/local\(|googleapis|gstatic/)
    }
    // Plex is upright only; Newsreader also ships its italic for emphasis.
    for (const face of plex) expect(face).toMatch(/font-style: normal;/)
    expect(news.map((f) => /font-style: (\w+);/.exec(f)![1])).toEqual(["normal", "normal", "italic", "italic"])
    // Newsreader: one variable axis per subset carries every weight the ladder asks for.
    for (const face of news) expect(face).toMatch(/font-weight: 200 800;/)
    expect(news.map((f) => /url\("\/fonts\/([^"]+)"\)/.exec(f)![1])).toEqual([
      "newsreader/Newsreader-latin.woff2",
      "newsreader/Newsreader-latin-ext.woff2",
      "newsreader/Newsreader-Italic-latin.woff2",
      "newsreader/Newsreader-Italic-latin-ext.woff2",
    ])
    // IBM Plex Sans: static instances at exactly the ladder's weights, never 500.
    expect(plex.map((f) => /font-weight: (\d+);/.exec(f)![1])).toEqual([
      "300",
      "300",
      "400",
      "400",
      "600",
      "600",
      "700",
      "700",
    ])
    expect(plex.map((f) => /url\("\/fonts\/([^"]+)"\)/.exec(f)![1])).toEqual(
      ["300", "400", "600", "700"].flatMap((w) => [
        `ibm-plex-sans/IBMPlexSans-${w}-latin.woff2`,
        `ibm-plex-sans/IBMPlexSans-${w}-latin-ext.woff2`,
      ])
    )
    // The fallbacks: the system serif and sans with the overrides next/font/google computes for these families.
    const [newsFallback, plexFallback, monaFallback] = fallbacks
    expect(newsFallback).toMatch(/font-family: "Newsreader Fallback";[\s\S]*src: local\("Times New Roman"\);/)
    expect(newsFallback).toMatch(
      /ascent-override: 69\.68%;[\s\S]*descent-override: 25\.12%;[\s\S]*line-gap-override: 0%;[\s\S]*size-adjust: 105\.48%;/
    )
    expect(plexFallback).toMatch(/font-family: "IBM Plex Sans Fallback";[\s\S]*src: local\("Arial"\);/)
    expect(plexFallback).toMatch(
      /ascent-override: 101\.32%;[\s\S]*descent-override: 27\.18%;[\s\S]*line-gap-override: 0%;[\s\S]*size-adjust: 101\.17%;/
    )
    // Mona Sans: Arial with the overrides Next's capsize table gives the family (ascent 1090, descent 320, avg width 464).
    expect(monaFallback).toMatch(/font-family: "Mona Sans Fallback";[\s\S]*src: local\("Arial"\);/)
    expect(monaFallback).toMatch(
      /ascent-override: 104\.72%;[\s\S]*descent-override: 30\.74%;[\s\S]*line-gap-override: 0%;[\s\S]*size-adjust: 104\.08%;/
    )
    // The files and licences ship in the repo, so the faces render without any external request.
    for (const file of [
      "newsreader/Newsreader-latin.woff2",
      "newsreader/Newsreader-latin-ext.woff2",
      "newsreader/Newsreader-Italic-latin.woff2",
      "newsreader/Newsreader-Italic-latin-ext.woff2",
      "newsreader/OFL.txt",
      "ibm-plex-sans/LICENSE.txt",
      ...["300", "400", "600", "700"].flatMap((w) => [
        `ibm-plex-sans/IBMPlexSans-${w}-latin.woff2`,
        `ibm-plex-sans/IBMPlexSans-${w}-latin-ext.woff2`,
      ]),
    ]) {
      expect(existsSync(join(process.cwd(), "public/fonts", file)), file).toBe(true)
    }
    // The condensed cut (2026-09-12, one afternoon) is gone with its licence; Mona Sans (2026-09-13) is the wordmark's.
    expect(existsSync(join(process.cwd(), "public/fonts/ibm-plex-sans-condensed"))).toBe(false)
    expect(readdirSync(join(process.cwd(), "public/fonts")).sort()).toEqual([
      "README.md",
      "ibm-plex-mono",
      "ibm-plex-sans",
      "mona-sans",
      "newsreader",
    ])
    for (const file of ["MonaSans-variable-latin.woff2", "MonaSans-variable-latin-ext.woff2", "OFL.txt"])
      expect(existsSync(join(process.cwd(), "public/fonts/mona-sans", file)), file).toBe(true)
    expect(existsSync(join(process.cwd(), "public/fonts/plus-jakarta-sans"))).toBe(false)
    expect(existsSync(join(process.cwd(), "public/fonts/reesha"))).toBe(false)
  })

  it("runs body copy at 17px / 1.47 / no tracking in the text face", () => {
    const body = css.match(/\}\n  body \{([^}]*)\}/)?.[1] ?? null
    expect(body).toMatch(/font-family: var\(--font-text\);/)
    expect(body).toMatch(/font-size: 17px;/)
    expect(body).toMatch(/line-height: 1\.47;/)
    expect(body).toMatch(/letter-spacing: 0;/)
  })

  it.each([
    ["type-hero", "display", "56px", "400", "1.07", "-0.02em"],
    ["type-display-lg", "display", "40px", "400", "1.1", "-0.02em"],
    ["type-display-md", "display", "34px", "400", "1.18", "-0.015em"],
    ["type-lead", "display", "28px", "400", "1.14", "-0.01em"],
    ["type-lead-airy", "text", "24px", "300", "1.5", "0"],
    ["type-tagline", "display", "21px", "400", "1.19", "0"],
    ["type-body-strong", "text", "17px", "600", "1.24", "0"],
    ["type-body", "text", "17px", "400", "1.47", "0"],
    ["type-dense-link", "text", "17px", "400", "2.41", "0"],
    ["type-caption", "text", "14px", "400", "1.43", "0"],
    ["type-caption-strong", "text", "14px", "600", "1.29", "0"],
    ["type-fine-print", "text", "12px", "400", "1", "0.01em"],
    ["type-micro-legal", "text", "10px", "400", "1.3", "0.02em"],
    ["type-nav-link", "text", "12px", "400", "1", "0.01em"],
  ])("%s is %s %s / %s / %s / %s", (name, face, size, weight, leading, tracking) => {
    const u = utility(name)
    expect(u, name).not.toBeNull()
    expect(u).toMatch(new RegExp(`font-family: var\\(--font-${face}\\);`))
    expect(u).toMatch(new RegExp(`\\n  font-size: ${size};`))
    expect(u).toMatch(new RegExp(`\\n  font-weight: ${weight};`))
    expect(u).toMatch(new RegExp(`\\n  line-height: ${leading};`))
    expect(u).toMatch(new RegExp(`\\n  letter-spacing: ${tracking};`))
  })

  it("steps the hero headline down at 1068, 640, and 419px", () => {
    const hero = utility("type-hero")!
    expect(hero).toMatch(/@media \(max-width: 1068px\) \{\s*font-size: 40px;/)
    expect(hero).toMatch(/@media \(max-width: 640px\) \{\s*font-size: 34px;/)
    expect(hero).toMatch(/@media \(max-width: 419px\) \{\s*font-size: 28px;/)
  })

  it("never uses weight 500, and the only italic is the em rule: the serif italic in the accent, as the first build set the hero", () => {
    expect(css).not.toMatch(/font-weight: 500/)
    expect(css.match(/font-style: italic/g)).toHaveLength(1)
    expect(block("  em")).toMatch(/font-style: italic;/)
    expect(block("  em")).toMatch(/color: var\(--color-accent\);/)
    // No ladder step is italic; emphasis inside a step inherits it from the em rule alone.
    for (const step of css.match(/@utility type-[a-z-]+ \{[\s\S]*?\n\}/g) ?? []) expect(step).not.toMatch(/font-style/)
  })
})

describe("shape, elevation, rhythm", () => {
  it("declares exactly the five radii", () => {
    expect(token("radius-xs")).toBe("5px")
    expect(token("radius-sm")).toBe("8px")
    expect(token("radius-md")).toBe("11px")
    expect(token("radius-lg")).toBe("18px")
    expect(token("radius-pill")).toBe("9999px")
    expect(theme.match(/--radius-[a-z]+:/g)).toHaveLength(5)
  })

  it("declares the one product shadow and nothing else that casts", () => {
    expect(token("shadow-product")).toBe("3px 5px 30px 0 rgba(0, 0, 0, 0.22)")
    expect(theme.match(/--shadow-[a-z]+:/g)).toEqual(["--shadow-product:"])
    expect(css).not.toMatch(/text-shadow/)
  })

  it("sets the 80px section rhythm that tightens to 48px on phones", () => {
    expect(token("spacing-section")).toBe("80px")
    expect(token("spacing-section-phone")).toBe("48px")
    const tile = utility("tile")
    expect(tile).toMatch(/padding-block: var\(--spacing-section\);/)
    expect(tile).toMatch(/@media \(max-width: 735px\) \{\s*padding-block: var\(--spacing-section-phone\);/)
  })

  it("declares the home hero's two air utilities after `tile`: nothing at 900px (720 for the short composition) of viewport, a fifth of the extra height, capped at 16px", () => {
    expect(utility("hero-air")).toBe("\n  --hero-air: clamp(0px, (100svh - 900px) / 5, 16px);")
    expect(utility("hero-air-short")).toBe("\n  --hero-air: clamp(0px, (100svh - 720px) / 5, 16px);")
    expect(css.match(/--hero-air:/g)).toHaveLength(2)
  })

  it("names the system breakpoints", () => {
    expect(token("breakpoint-lphone")).toBe("641px")
    expect(token("breakpoint-tab")).toBe("736px")
    expect(token("breakpoint-nav")).toBe("834px")
    expect(token("breakpoint-desk")).toBe("1069px")
  })

  it("declares exactly two height variants outside the theme: `tall` at 832px (the 780px panel budget under the bar), then `short` at 889px (the hero's composition A holds 16px of fold clearance from 890px up)", () => {
    const variants = css.match(/@custom-variant [^\n]+/g) ?? []
    expect(variants).toEqual([
      "@custom-variant tall (@media (min-height: 832px));",
      "@custom-variant short (@media (max-height: 889px));",
    ])
    expect(theme).not.toMatch(/@custom-variant/)
    // They follow the theme block, so the tokens are declared before anything reads them, and precede :root.
    const themeEnd = css.indexOf("@theme {") + theme.length
    expect(css.indexOf("@custom-variant tall")).toBeGreaterThan(themeEnd)
    expect(css.indexOf("@custom-variant short")).toBeLessThan(css.indexOf(":root {"))
  })

  it("pins the one bar height the sticky scenes and anchors depend on: --bar-h, read by scene-pin and anchor-target", () => {
    const root = block(":root")
    expect(root).toMatch(/--bar-h: 52px;/)
    expect(css.match(/--bar-h:/g)).toHaveLength(1)
    // The two nav heights of the stacked header and sub-nav are retired with the sub-nav itself.
    expect(css).not.toMatch(/--globalnav-h|--subnav-h/)
    expect(utility("anchor-target")).toMatch(/scroll-margin-top: calc\(var\(--bar-h\) \+ 16px\);/)
    expect(utility("scene-pin")).toMatch(
      /position: sticky;\s*top: var\(--bar-h\);\s*height: calc\(100vh - var\(--bar-h\)\);\s*height: calc\(100dvh - var\(--bar-h\)\);/
    )
    // One pin utility on every route: the under-nav variant is gone.
    expect(css).not.toMatch(/scene-pin-under-nav/)
    expect(css.match(/@utility scene-pin\b/g)).toHaveLength(1)
  })

  it("declares the one glass surface: the near-black `glass-dark` of the condensed bar, over a saturating blur", () => {
    const glass = utility("glass-dark")
    expect(glass).toMatch(/background: color-mix\(in srgb, var\(--color-surface-black\) 78%, transparent\);/)
    expect(glass).toMatch(/-webkit-backdrop-filter: saturate\(180%\) blur\(20px\);/)
    expect(glass).toMatch(/\n\s*backdrop-filter: saturate\(180%\) blur\(20px\);/)
    expect(glass!.trim().split("\n")).toHaveLength(3)
  })

  it("staggers a dropdown card's rows by 40ms each as the menu opens, moving only opacity and transform, and settles them once open", () => {
    const row = block(".nav-dd > .nav-dd-menu .nav-dd-row")
    expect(row).toMatch(/opacity: 0;/)
    expect(row).toMatch(/transform: translateY\(4px\);/)
    expect(row).toMatch(/opacity 0\.18s ease calc\(var\(--i, 0\) \* 40ms\)/)
    expect(row).toMatch(/transform 0\.18s ease calc\(var\(--i, 0\) \* 40ms\)/)
    expect(row).toMatch(/background-color 0\.2s var\(--ease-e1\)/)
    expect(row).not.toMatch(/height|width|margin|padding|animation/)
    const open = css.match(
      /\.nav-dd:hover > \.nav-dd-menu \.nav-dd-row,\s*\.nav-dd:focus-within > \.nav-dd-menu \.nav-dd-row \{([^}]*)\}/
    )
    expect(open?.[1]).toMatch(/opacity: 1;\s*transform: none;/)
    // One block, next to the menu rules, and only the menu's own reveal opens the rows (the fourth mention is the
    // dismissed state below, which puts them back at their staggered start).
    expect(css.match(/\.nav-dd-row/g)).toHaveLength(4)
  })

  it("closes a dropdown Escape dismissed, after both open states and out of hit-testing when it is hidden", () => {
    // Hidden or dismissed the card takes no pointer; open it does, so the 10px bridge to the trigger still works.
    expect(block(".nav-dd > .nav-dd-menu")).toMatch(/pointer-events: none;/)
    const open = css.match(/\.nav-dd:hover > \.nav-dd-menu,\s*\.nav-dd:focus-within > \.nav-dd-menu \{([^}]*)\}/)
    expect(open?.[1]).toMatch(/visibility: visible;\s*opacity: 1;\s*pointer-events: auto;\s*transform: none;/)
    // SiteBar marks the group `data-closed` on Escape: same specificity as the open states, declared after them,
    // so it wins over both `:hover` and `:focus-within` while the trigger keeps the focus.
    const closed = block(".nav-dd[data-closed] > .nav-dd-menu")
    expect(closed).toMatch(/visibility: hidden;/)
    expect(closed).toMatch(/opacity: 0;/)
    expect(closed).toMatch(/pointer-events: none;/)
    expect(closed).toMatch(/transform: translateY\(6px\);/)
    expect(css.indexOf(".nav-dd[data-closed] > .nav-dd-menu {")).toBeGreaterThan(
      css.indexOf(".nav-dd:focus-within > .nav-dd-menu .nav-dd-row {")
    )
    expect(block(".nav-dd[data-closed] > .nav-dd-menu .nav-dd-row")).toMatch(
      /opacity: 0;\s*transform: translateY\(4px\);/
    )
  })
})

describe("interaction", () => {
  it("links inherit their colour with no underline; text links take the accent and underline on hover", () => {
    expect(block("  a")).toMatch(/color: inherit;/)
    expect(block("  a")).toMatch(/text-decoration: none;/)
    expect(block(".text-link")).toMatch(/color: var\(--color-accent\);/)
    expect(block(".text-link:hover")).toMatch(/text-decoration: underline;/)
  })

  it("keyboard focus is a 2px accent outline", () => {
    const focus = block(":focus-visible")
    expect(focus).toMatch(/outline: 2px solid var\(--color-accent-focus\);/)
    expect(focus).toMatch(/outline-offset: 2px;/)
  })

  it("pressing a control scales it to 95%", () => {
    expect(block(".pressable:active")).toMatch(/transform: scale\(0\.95\);/)
  })

  it("no hover rule adds a glow, shadow, or text-shadow", () => {
    const hoverRules = css.match(/[^{}]*:hover[^{]*\{[^}]*\}/g) ?? []
    expect(hoverRules).toHaveLength(5)
    for (const rule of hoverRules) expect(rule).not.toMatch(/shadow|glow/)
  })

  it("honours reduced motion by cutting every animation and transition to nothing", () => {
    const block = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(css)![1]!
    expect(block).toContain("animation-duration: 0.001ms !important;")
    expect(block).toContain("animation-iteration-count: 1 !important;")
    expect(block).toContain("transition-duration: 0.001ms !important;")
    expect(css.match(/@media \(prefers-reduced-motion: reduce\)/g)).toHaveLength(1)
  })
})

describe("motion", () => {
  it("declares the header mark reveal as a single 0.7s run on the system ease that holds its end state", () => {
    expect(token("ease-e1")).toBe("cubic-bezier(0.2, 0.7, 0.2, 1)")
    expect(token("animate-mark-in")).toBe("hl-mark-in 0.7s var(--ease-e1) both")
    expect(theme).toMatch(/@keyframes hl-mark-in \{\s*from \{\s*opacity: 0;\s*transform: scale\(0\.92\);\s*\}\s*\}/)
  })

  it("declares the two one-shot state animations: a panel staging in and a row arriving, both on the system ease", () => {
    expect(token("animate-stage-in")).toBe("hl-stage-in 0.36s var(--ease-e1) both")
    expect(token("animate-row-in")).toBe("hl-row-in 0.3s var(--ease-e1) both")
    expect(theme).toMatch(
      /@keyframes hl-stage-in \{\s*from \{\s*opacity: 0;\s*transform: translateY\(10px\);\s*\}\s*\}/
    )
    expect(theme).toMatch(/@keyframes hl-row-in \{\s*from \{\s*opacity: 0;\s*transform: translateX\(6px\);\s*\}\s*\}/)
    // Transform and opacity only: nothing in the keyframes animates layout, colour, or a shadow.
    const keyframes = theme.match(/@keyframes hl-(stage|row)-in \{[^}]*\{[^}]*\}\s*\}/g) ?? []
    expect(keyframes).toHaveLength(2)
    for (const k of keyframes) expect(k).not.toMatch(/height|width|margin|padding|color|shadow|filter/)
  })

  it("loops only the two hero-graph dashes: the live-dot blink is gone with every status light", () => {
    const animations = theme.match(/--animate-[a-z-]+:[^;]+;/g) ?? []
    expect(animations).toEqual([
      "--animate-dash: hl-dash 34s linear infinite;",
      "--animate-dash-fast: hl-dash 22s linear infinite;",
      "--animate-mark-in: hl-mark-in 0.7s var(--ease-e1) both;",
      "--animate-stage-in: hl-stage-in 0.36s var(--ease-e1) both;",
      "--animate-row-in: hl-row-in 0.3s var(--ease-e1) both;",
    ])
    expect(css.match(/infinite/g)).toHaveLength(2)
    // No blink anywhere: neither the token nor its keyframes survive.
    expect(css).not.toMatch(/blink/)
    expect(css.match(/@keyframes /g)).toHaveLength(4)
  })

  it("declares the restored exitIQ console's legacy tokens, mono face and second ease exactly once, for those components alone", () => {
    for (const [name, value] of [
      ["color-ground", "#0b241b"],
      ["color-dfull", "#f0f8f2"],
      ["color-filament", "#4ce27e"],
      ["color-signal", "#8fe0b2"],
      ["color-cta", "#f7faf3"],
      ["ease-e2", "cubic-bezier(0.34, 1.3, 0.64, 1)"],
    ] as const) {
      expect(token(name), name).toBe(value)
    }
    expect(token("color-d1")).toBe("rgba(240, 248, 242, 0.96)")
    expect(token("color-dhair-2")).toBe("rgba(240, 248, 242, 0.07)")
    expect(token("font-mono")).toBe('"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace')
    expect(theme).toMatch(/legacy exitIQ console \(restored 2026-09-11/)
    // The console's mono eyebrow and hover swap are utilities, so the components can name them as the first build did.
    expect(utility("eyebrow")).toMatch(
      /font-family: var\(--font-mono\);\s*font-size: 11px;\s*letter-spacing: 1\.1px;\s*text-transform: uppercase;/
    )
    expect(utility("hover-green-dark")).toMatch(/color: var\(--color-filament\);/)
    expect(css).toMatch(/\.hero-svg text \{\s*font-size: 13px !important;/)
  })

  it("reveals arrive once over 600ms on the system ease, moving only transform and opacity, with a per-item delay", () => {
    const pending = block(".reveal-pending")
    expect(pending).toMatch(/opacity: 0;/)
    expect(pending).toMatch(/transform: translateY\(14px\);/)
    const done = block(".reveal-in")
    expect(done).toMatch(/opacity: 1;/)
    expect(done).toMatch(/transform: none;/)
    expect(done).toMatch(/opacity 0\.6s var\(--ease-e1\) var\(--reveal-delay, 0ms\)/)
    expect(done).toMatch(/transform 0\.6s var\(--ease-e1\) var\(--reveal-delay, 0ms\)/)
    expect(done).not.toMatch(/infinite|animation/)
    // The pending state is only ever applied from JavaScript, so the stylesheet never hides server markup.
    expect(css.match(/\.reveal-pending/g)).toHaveLength(1)
  })
})
