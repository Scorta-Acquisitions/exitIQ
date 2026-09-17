import { describe, expect, it, vi } from "vitest"
import { FIELD_COLOUR_TOKENS, parseHexColour, readFieldColours } from "@/lib/site/instrument/colour"
import { advisorFieldTarget, FIELD_TEXTURES } from "@/lib/site/instrument/level"

/* Mirrors of the tokens in styles/site.css, as 0..1 components. */
const TILE_1 = [11 / 255, 36 / 255, 27 / 255]
const PRIMARY = [15 / 255, 122 / 255, 69 / 255]
const PRIMARY_ON_DARK = [76 / 255, 226 / 255, 126 / 255]

describe("parseHexColour", () => {
  it("parses six-digit hex colours into 0..1 components", () => {
    expect(parseHexColour("#0b241b")).toEqual(TILE_1)
    expect(parseHexColour("#4ce27e")).toEqual(PRIMARY_ON_DARK)
    expect(parseHexColour("#000000")).toEqual([0, 0, 0])
    expect(parseHexColour("#ffffff")).toEqual([1, 1, 1])
  })

  it("expands three-digit shorthand by doubling each digit", () => {
    expect(parseHexColour("#fff")).toEqual([1, 1, 1])
    expect(parseHexColour("#f80")).toEqual([1, 136 / 255, 0])
  })

  it("accepts upper-case digits and surrounding whitespace, the way getComputedStyle returns them", () => {
    expect(parseHexColour("  #4CE27E\n")).toEqual(PRIMARY_ON_DARK)
    expect(parseHexColour(" #FFF ")).toEqual([1, 1, 1])
  })

  it("returns null for anything that is not an #rgb or #rrggbb colour", () => {
    for (const bad of [
      "",
      " ",
      "#",
      "#ab",
      "#abcd",
      "#abcde",
      "#1234567",
      "#12345678",
      "#ggg",
      "0b241b",
      "rgb(11, 36, 27)",
      "green",
      "# fff",
    ]) {
      expect(parseHexColour(bad)).toBeNull()
    }
  })
})

describe("readFieldColours", () => {
  it("reads the surface, the contextual accent, and the on-dark green through the callback, in that order", () => {
    const read = vi.fn(
      (name: string) =>
        ({ "--color-tile-1": "#0b241b", "--color-primary": "#4ce27e", "--color-primary-on-dark": "#4ce27e" })[name] ??
        ""
    )
    expect(readFieldColours(read)).toEqual({ base: TILE_1, accent: PRIMARY_ON_DARK, highlight: PRIMARY_ON_DARK })
    expect(read.mock.calls.map((c) => c[0])).toEqual(["--color-tile-1", "--color-primary", "--color-primary-on-dark"])
    expect(FIELD_COLOUR_TOKENS).toEqual({
      base: "--color-tile-1",
      accent: "--color-primary",
      highlight: "--color-primary-on-dark",
    })
  })

  it("falls back per colour to the token defaults when a value is empty", () => {
    expect(readFieldColours(() => "")).toEqual({ base: TILE_1, accent: PRIMARY, highlight: PRIMARY_ON_DARK })
  })

  it("falls back only for the colour that cannot be parsed and keeps the others", () => {
    const read = (name: string) => (name === "--color-tile-1" ? "#102030" : "var(--color-primary-on-dark)")
    expect(readFieldColours(read)).toEqual({
      base: [16 / 255, 32 / 255, 48 / 255],
      accent: PRIMARY,
      highlight: PRIMARY_ON_DARK,
    })
  })
})

describe("advisorFieldTarget", () => {
  it("brightens from a lit floor to a full briefing, one fifth of the range per answer", () => {
    expect(advisorFieldTarget(0)).toBe(0.15)
    expect(advisorFieldTarget(1)).toBe(0.29)
    expect(advisorFieldTarget(2)).toBeCloseTo(0.43, 10)
    expect(advisorFieldTarget(3)).toBe(0.57)
    expect(advisorFieldTarget(4)).toBe(0.71)
    expect(advisorFieldTarget(5)).toBe(0.85)
    // The strip prints the level to two decimals, which is what the dialog's tests read.
    expect([0, 1, 2, 3, 4, 5].map((n) => advisorFieldTarget(n).toFixed(2))).toEqual([
      "0.15",
      "0.29",
      "0.43",
      "0.57",
      "0.71",
      "0.85",
    ])
  })
})

describe("FIELD_TEXTURES", () => {
  it("lists the three glass textures, calm to bright", () => {
    expect(FIELD_TEXTURES).toEqual([
      "/generated/field-calm.webp",
      "/generated/field-mid.webp",
      "/generated/field-bright.webp",
    ])
  })
})
