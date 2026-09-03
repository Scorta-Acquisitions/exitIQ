import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

/**
 * The hover and focus treatment is a handful of global rules in styles/site.css rather than
 * per-element styling. These tests pin the rules so a refactor cannot quietly reintroduce
 * per-element glows or drop the global link hover.
 */
const css = readFileSync("styles/site.css", "utf8")
const block = (selector: string) => {
  const match = css.match(new RegExp(`(^|\\n)[^{}]*${selector.replace(/[.*+?^$()[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`))
  return match?.[2] ?? null
}

describe("styles/site.css hover and focus rules", () => {
  it("defines the two greens the rules rely on", () => {
    expect(css).toMatch(/--color-filament:\s*#4ce27e;/i)
    expect(css).toMatch(/--color-filament-ink:\s*#0f7a45;/i)
  })

  it("links inherit their colour, have no underline, and swap to the deep hover green", () => {
    expect(block("  a")).toMatch(/color: inherit;/)
    expect(block("  a")).toMatch(/text-decoration: none;/)
    expect(block("a:hover")).toMatch(/^\s*color: var\(--color-filament-ink\);\s*$/)
    expect(css).toMatch(/\n  a \{\n    transition: color 0\.2s var\(--ease-e1\);\n  \}/)
  })

  it("resolves the same hover to the bright filament on deep-green surfaces", () => {
    const dark = css.match(/\n(  \.aurora a:hover,[\s\S]*?)\{([^}]*)\}/)
    expect(dark).not.toBeNull()
    const selectors = dark![1]!.split(",").map((s) => s.trim())
    expect(selectors).toEqual(
      expect.arrayContaining([
        ".aurora a:hover",
        ".panel-hero a:hover",
        ".panel-foot a:hover",
        ".bg-ground a:hover",
        ".bg-brand a:hover",
      ])
    )
    expect(dark![2]!.trim()).toBe("color: var(--color-filament);")
  })

  it("offers hover-green and hover-green-dark for non-link text with the 200ms ease-out", () => {
    for (const [name, color] of [
      ["hover-green", "--color-filament-ink"],
      ["hover-green-dark", "--color-filament"],
    ] as const) {
      const utility = css.match(new RegExp(`@utility ${name} \\{([\\s\\S]*?)\\n\\}`))
      expect(utility, name).not.toBeNull()
      expect(utility![1]).toMatch(/transition: color 0\.2s var\(--ease-e1\);/)
      expect(utility![1]).toMatch(new RegExp(`&:hover \\{\\s*color: var\\(${color}\\);\\s*\\}`))
    }
  })

  it("keyboard focus is a 2px filament outline offset 3px", () => {
    const focus = block(":focus-visible")
    expect(focus).toMatch(/outline: 2px solid var\(--color-filament\);/)
    expect(focus).toMatch(/outline-offset: 3px;/)
    expect(focus).toMatch(/border-radius: 3px;/)
  })

  it("no hover rule uses a text shadow or a glow", () => {
    const hoverRules = css.match(/[^{}]*:hover[^{]*\{[^}]*\}/g) ?? []
    expect(hoverRules.length).toBeGreaterThan(3)
    for (const rule of hoverRules) expect(rule).not.toMatch(/text-shadow|glow/)
    expect(css).not.toMatch(/@utility glow/)
  })
})
