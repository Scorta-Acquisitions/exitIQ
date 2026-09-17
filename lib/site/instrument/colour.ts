/**
 * Colours for the WebGL instrument field. The shader takes its three tones as uniforms; the component
 * reads them from the design tokens as declared on the document root (`getComputedStyle(document.documentElement)`),
 * so the field is painted from `styles/site.css` and never carries a colour of its own. Pure; unit-tested in
 * `lib/site/__tests__/instrument.test.ts`.
 */

/** One colour as 0..1 red, green, blue components, the way a GLSL `vec3` takes them. */
export type FieldColour = [number, number, number]

export interface FieldColours {
  /** The card's surface (`--color-tile-1`): what the field rests on and fades back to. */
  base: FieldColour
  /** The action green (`--color-primary` as declared on the root, not the dark tile's re-pointed value). */
  accent: FieldColour
  /** The brightest green in the system (`--color-primary-on-dark`), for the flare and the top of the range. */
  highlight: FieldColour
}

/** The token each tone is read from, in the order `base`, `accent`, `highlight`. */
export const FIELD_COLOUR_TOKENS = {
  base: "--color-tile-1",
  accent: "--color-primary",
  highlight: "--color-primary-on-dark",
} as const

/*
 * Fallbacks when a token cannot be read (a stylesheet that has not loaded, or a test runtime that does
 * not resolve custom properties). They mirror the tokens in styles/site.css:
 *   --color-tile-1          #0b241b  → 11, 36, 27
 *   --color-primary         #0f7a45  → 15, 122, 69
 *   --color-primary-on-dark #4ce27e  → 76, 226, 126
 */
const DEFAULT_BASE: FieldColour = [11 / 255, 36 / 255, 27 / 255]
const DEFAULT_ACCENT: FieldColour = [15 / 255, 122 / 255, 69 / 255]
const DEFAULT_HIGHLIGHT: FieldColour = [76 / 255, 226 / 255, 126 / 255]

const HEX_COLOUR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Parses a CSS hex colour (`#rgb` or `#rrggbb`, surrounding whitespace allowed) into 0..1 components.
 * Anything else (named colours, `rgb()`, alpha forms, malformed input) is `null` so the caller can fall back.
 */
export function parseHexColour(value: string): FieldColour | null {
  const trimmed = value.trim()
  if (!HEX_COLOUR.test(trimmed)) return null
  const hex = trimmed.slice(1)
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex
  const channel = (i: number) => parseInt(full.slice(i, i + 2), 16) / 255
  return [channel(0), channel(2), channel(4)]
}

/**
 * Reads the field's three tones through `read` (typically `getComputedStyle(el).getPropertyValue`),
 * falling back per colour to the token's default when the value is missing or not a hex colour.
 */
export function readFieldColours(read: (name: string) => string): FieldColours {
  return {
    base: parseHexColour(read(FIELD_COLOUR_TOKENS.base)) ?? DEFAULT_BASE,
    accent: parseHexColour(read(FIELD_COLOUR_TOKENS.accent)) ?? DEFAULT_ACCENT,
    highlight: parseHexColour(read(FIELD_COLOUR_TOKENS.highlight)) ?? DEFAULT_HIGHLIGHT,
  }
}
