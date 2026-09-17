import { cn } from "@/lib/site/cn"

/**
 * The Heirloom brand lockup: the mark (two inward-facing bracket wedges around a double-lozenge spindle) as inline
 * SVG geometry filled with `currentColor`, and the word beside or under it, so one component serves the dark bar,
 * the parchment footer, the 404 and the share card. The mark was measured from `public/brand/1.png` (see
 * `public/brand/README.md`) and redrawn as straight segments with filleted corners (0.17% of its box differs from
 * the PNG). Everything drawn is decorative (`aria-hidden`); whatever wraps the lockup carries the accessible name
 * (the bar's link keeps `aria-label="Heirloom home"`).
 *
 * Two words. The **horizontal** lockup (the bar at a 28px mark, the footer at 24, the share card at 120) sets the word
 * Heirloom as text in Mona Sans at weight 450 and width 90 (`type-brand`, the site's third face, the wordmark's
 * alone), title case written in the markup, at a font-size of 0.9821 × the mark's height (`BRAND_SIZE_RATIO`: 27.5px
 * at 28, 23.57 at 24), line-height 1, no tracking, and no shift (`BRAND_WORD_SHIFT_EM` 0): the face's own box centres
 * the ink from the ascender to the baseline on the mark (20px of ink with 4px of mark above and below it at 28, 17
 * with 3 / 3 at 24). The SIZING is the one Suyash approved on 2026-09-12 ("the sizing is perfect now"), reached by a
 * rendered panel after his fourth note on the wordmark (a condensed grotesk at 600 with its cap at the mark's height
 * read "grotesquely big and gross and bold"; he asked for finesse, class and symmetry with the logo). The FACE is his
 * 2026-09-13 request for "a cooler or more unique font associated with tech and fintech companies": a second rendered
 * panel of open-licence faces at the approved sizing (Geist, Mona Sans, Host Grotesk, Hanken, Schibsted, Albert,
 * Bricolage, Space Grotesk, Red Hat Display, Manrope, Sora, DM Sans, Urbanist and others) chose Mona Sans at a narrow
 * width: GitHub's brand face, still uncommon on the web, whose narrow set reads like the bespoke wordmarks of the
 * fintechs he named, with 3px stems equal to the mark's crossbar. The **stacked** variant (the 404) keeps the
 * PNG's own wordmark as delivered artwork: eight outlined glyph paths on a 53-unit cap height (0.9–2.8% per glyph),
 * at the PNG's tracking.
 */

/** The mark's own box, in mark units. Its square viewBox is `MARK_BOX.height` wide with the mark centred. */
export const MARK_BOX = { width: 812, height: 833 } as const

/** Three subpaths: left wedge, right wedge, spindle. Fillets: wedge tips r20, spindle tips r9, lobes r97. */
export const MARK_PATH =
  "M0 0L6.8 0L158.8 201.7A20 20 0 0 1 158.7 225.8L50 369L50 464L158.7 607.2A20 20 0 0 1 158.8 631.3L6.8 833L0 833Z" +
  "M812 833L805.2 833L653.2 631.3A20 20 0 0 1 653.3 607.2L762 464L762 369L653.3 225.8A20 20 0 0 1 653.2 201.7L805.2 0L812 0Z" +
  "M59 425.1A9 9 0 0 1 59 407.9L264.6 342.5A97 97 0 0 1 323.4 342.5L406 368.8L488.6 342.5A97 97 0 0 1 547.4 342.5L753 407.9A9 9 0 0 1 753 425.1L547.4 490.5A97 97 0 0 1 488.6 490.5L406 464.2L323.4 490.5A97 97 0 0 1 264.6 490.5Z"

/** The wordmark's box in wordmark units as the PNG sets it: 1046 wide on a 53-unit cap height (the PNG's pixels). */
export const WORDMARK_BOX = { width: 1046, cap: 53 } as const

/**
 * The gap between glyph boxes, in wordmark units: the PNG's own 71, which only the stacked variant draws (the
 * horizontal word has been live text since 2026-09-12).
 */
export const WORDMARK_TRACKING = { stacked: 71 } as const

interface WordmarkGlyph {
  /** The glyph's outlined path (fill, no stroke) at its measured advance in the PNG. */
  path: string
  /** Where the glyph box starts in the PNG (its baked x). */
  x: number
  /** The glyph box's width: 74 for the capitals, the e and the L; 10.65 for the i; 95 for the m. */
  width: number
}

/**
 * H · e · i · R · L · O · O · m, each an outlined path already at its PNG advance: 74-unit glyph boxes
 * (the i 10.65, the m 95) with 71 units between them, a 10.65-unit stroke, 12-unit outer corners, 1.5-unit
 * inner corners, 10-unit bowl corners on the e and R, and a 4-unit notch on the m.
 */
export const WORDMARK_GLYPHS: readonly WordmarkGlyph[] = [
  {
    x: 0,
    width: 74,
    path: "M0 0L10.7 0L10.7 21.2L63.4 21.2L63.4 0L74 0L74 53L63.4 53L63.4 31.8L10.7 31.8L10.7 53L0 53Z",
  },
  {
    x: 145,
    width: 74,
    path: "M157 0L207 0A12 12 0 0 1 219 12L219 21.8A10 10 0 0 1 209 31.8L166.5 31.8L166.5 21.2L208.4 21.2L208.4 12.2A1.5 1.5 0 0 0 206.9 10.7L157.2 10.7A1.5 1.5 0 0 0 155.7 12.2L155.7 42.4L219 42.4L219 53L157 53A12 12 0 0 1 145 41L145 12A12 12 0 0 1 157 0Z",
  },
  { x: 290, width: 10.65, path: "M290 0L300.7 0L300.7 10.7L290 10.7ZM290 16L300.7 16L300.7 53L290 53Z" },
  {
    x: 371,
    width: 74,
    path: "M371 0L433 0A12 12 0 0 1 445 12L445 21.8A10 10 0 0 1 435 31.8L433.5 31.8L441 53L429 53L422 31.8L381.7 31.8L381.7 53L371 53ZM381.7 10.7L381.7 21.2L434.4 21.2L434.4 12.2A1.5 1.5 0 0 0 432.9 10.7Z",
  },
  {
    x: 516,
    width: 74,
    path: "M516 0L526.7 0L526.7 40.9A1.5 1.5 0 0 0 528.2 42.4L590 42.4L590 53L528 53A12 12 0 0 1 516 41Z",
  },
  {
    x: 661,
    width: 74,
    path: "M673 0L723 0A12 12 0 0 1 735 12L735 41A12 12 0 0 1 723 53L673 53A12 12 0 0 1 661 41L661 12A12 12 0 0 1 673 0ZM673.2 10.7A1.5 1.5 0 0 0 671.7 12.2L671.7 40.9A1.5 1.5 0 0 0 673.2 42.4L722.9 42.4A1.5 1.5 0 0 0 724.4 40.9L724.4 12.2A1.5 1.5 0 0 0 722.9 10.7Z",
  },
  {
    x: 806,
    width: 74,
    path: "M818 0L868 0A12 12 0 0 1 880 12L880 41A12 12 0 0 1 868 53L818 53A12 12 0 0 1 806 41L806 12A12 12 0 0 1 818 0ZM818.2 10.7A1.5 1.5 0 0 0 816.7 12.2L816.7 40.9A1.5 1.5 0 0 0 818.2 42.4L867.9 42.4A1.5 1.5 0 0 0 869.4 40.9L869.4 12.2A1.5 1.5 0 0 0 867.9 10.7Z",
  },
  {
    x: 951,
    width: 95,
    path: "M963 0L994.3 0A4 4 0 0 1 998.3 4A4 4 0 0 1 1002.3 0L1034 0A12 12 0 0 1 1046 12L1046 53L1035.4 53L1035.4 12.2A1.5 1.5 0 0 0 1033.9 10.7L1005.1 10.7A1.5 1.5 0 0 0 1003.6 12.2L1003.6 53L993 53L993 12.2A1.5 1.5 0 0 0 991.5 10.7L963.2 10.7A1.5 1.5 0 0 0 961.7 12.2L961.7 53L951 53L951 12A12 12 0 0 1 963 0Z",
  },
]

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Each glyph's x in wordmark units: the PNG's own measured advances, untouched — the PNG sets its R 0.65
 * units closer after the narrow i — so the stacked variant is the PNG's wordmark exactly.
 */
export function wordmarkAdvances(): number[] {
  return WORDMARK_GLYPHS.map((g) => g.x)
}

/** The wordmark's width in wordmark units at the PNG's tracking: 1046. */
export function wordmarkWidth(): number {
  return WORDMARK_BOX.width
}

type BrandLockupVariant = "horizontal" | "mark" | "stacked"

/**
 * The horizontal word's font-size relative to the mark's height: 0.9821, so the word is 27.5px at the bar's 28px
 * mark, 23.57 at the footer's 24, 117.85 at the share card's 120. Mona Sans's cap stands 0.729em, so at 27.5px the
 * capital H and the ascenders read 20px of ink: the height Suyash approved for the word beside the 28px mark.
 */
export const BRAND_SIZE_RATIO = 0.9821

/**
 * The word Heirloom's advance in em at Mona Sans 450, width 90: 102.61px / 27.5, measured on the served bar. No
 * tracking, so the box is the advances alone: 102.61px at 28, 87.95 at 24, 439.73 at 120; the ink inside it is
 * 99.5px wide at 28. The rendered width is the browser's (the footer measures 116.45 against the rule's 116.48); this
 * is what the layout expects, and `lockupMetrics` reports it.
 */
export const BRAND_WORD_ADVANCE_EM = 3.7313

/**
 * How far the utility shifts the word, in em: none. With line-height 1 Mona Sans's box (ascent 1090, descent 320 per
 * 1000) centres the cap-to-baseline ink on the mark's centre by itself, measured as 4px of mark above the H and 4px
 * below at 28, 3 / 3 at 24, with the word's ink 8px clear of the mark's right bracket at 28. Kept as a constant so the
 * utility's declarations can be checked against it (nothing inline, no `top`).
 */
export const BRAND_WORD_SHIFT_EM = 0

/**
 * The lockup's proportions, all relative to the mark's height. Horizontal: the word's box starts 0.2143 of the
 * mark's height after the mark's box (6px at 28, 5.14 at 24, 25.72 at 120) and is centred on it (`items-center`).
 * Stacked: the PNG wordmark reads under the mark at 0.13 of its height (the PNG's own 0.064 is unreadable at bar
 * sizes) after a 0.13 gap, at the PNG's tracking.
 */
export const LOCKUP_RATIOS = {
  horizontal: { gap: 0.2143 },
  stacked: { cap: 0.13, gap: 0.13 },
} as const

interface LockupMetrics {
  /** Intrinsic size in px (the horizontal width from the face's advances at opsz 28; the browser's own drifts with the optical size). */
  width: number
  height: number
  /** Where the 812×833 mark box sits and the factor that maps mark units to px. */
  mark: { x: number; y: number; scale: number }
  /** The stacked variant's PNG wordmark (its width in units is `wordmarkWidth()`), or null. */
  wordmark: { x: number; y: number; scale: number; tracking: number } | null
  /** The horizontal variant's text word: its font-size, the gap before it, and its expected box width, or null. */
  word: { fontSize: number; gap: number; width: number } | null
}

/** Pure layout for a variant at a mark height, in px; also used by the share-card script. */
export function lockupMetrics(variant: BrandLockupVariant, markHeight: number): LockupMetrics {
  const markScale = markHeight / MARK_BOX.height
  const markWidth = MARK_BOX.width * markScale
  if (variant === "mark") {
    return {
      width: round(markHeight),
      height: round(markHeight),
      mark: { x: round((markHeight - markWidth) / 2), y: 0, scale: markScale },
      wordmark: null,
      word: null,
    }
  }
  if (variant === "stacked") {
    const { cap, gap } = LOCKUP_RATIOS.stacked
    const tracking = WORDMARK_TRACKING.stacked
    const wordScale = (cap * markHeight) / WORDMARK_BOX.cap
    const wordWidth = wordmarkWidth() * wordScale
    const width = Math.max(markWidth, wordWidth)
    return {
      width: round(width),
      height: round(markHeight * (1 + gap + cap)),
      mark: { x: round((width - markWidth) / 2), y: 0, scale: markScale },
      wordmark: { x: round((width - wordWidth) / 2), y: round(markHeight * (1 + gap)), scale: wordScale, tracking },
      word: null,
    }
  }
  // 27.29 + 6 + 102.61 = 135.9 at 28 (Chromium reads 135.89); 23.39 + 5.14 + 87.95 = 116.48 at 24 (116.45 rendered).
  const fontSize = round(markHeight * BRAND_SIZE_RATIO)
  const gap = round(LOCKUP_RATIOS.horizontal.gap * markHeight)
  const wordWidth = round(fontSize * BRAND_WORD_ADVANCE_EM)
  return {
    width: round(round(markWidth) + gap + wordWidth),
    height: round(markHeight),
    mark: { x: 0, y: 0, scale: markScale },
    wordmark: null,
    word: { fontSize, gap, width: wordWidth },
  }
}

/** Offsets are in hundredths of a px; the unit scale keeps six decimals so a 1046-unit wordmark lands within 0.001px. */
const transform = ({ x, y, scale }: { x: number; y: number; scale: number }) =>
  `translate(${x} ${y}) scale(${Math.round(scale * 1e6) / 1e6})`

interface BrandLockupProps {
  variant?: BrandLockupVariant
  /** The mark's rendered height in px; every other dimension follows from it. */
  markHeight: number
  /** Let the mark form once on first paint (the 0.7s `animate-mark-in`, off under reduced motion). The word never animates. */
  reveal?: boolean
  className?: string
}

/** The mark's group: the animated group is nested so the CSS transform of the reveal never replaces the layout transform. */
function Mark({ placement, reveal }: { placement: LockupMetrics["mark"]; reveal: boolean }) {
  return (
    <g transform={transform(placement)} data-testid="brand-mark">
      <g
        className={reveal ? "animate-mark-in motion-reduce:animate-none" : undefined}
        style={reveal ? { transformBox: "fill-box", transformOrigin: "center" } : undefined}
      >
        <path d={MARK_PATH} />
      </g>
    </g>
  )
}

export function BrandLockup({ variant = "horizontal", markHeight = 28, reveal = false, className }: BrandLockupProps) {
  const m = lockupMetrics(variant, markHeight)
  if (m.word) {
    const markWidth = round(MARK_BOX.width * m.mark.scale)
    return (
      <span
        data-testid="brand-lockup"
        data-variant={variant}
        className={cn("inline-flex shrink-0 items-center", className)}
        style={{ gap: m.word.gap }}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          fill="currentColor"
          fillRule="evenodd"
          width={markWidth}
          height={m.height}
          viewBox={`0 0 ${markWidth} ${m.height}`}
          className="block shrink-0"
        >
          <Mark placement={m.mark} reveal={reveal} />
        </svg>
        {/* Title case in the markup, not a text-transform; the wrapper's sr-only name reads the word, so this one is hidden. */}
        <span
          data-testid="brand-wordmark"
          aria-hidden="true"
          className="type-brand"
          style={{ fontSize: m.word.fontSize }}
        >
          Heirloom
        </span>
      </span>
    )
  }
  const advances = m.wordmark ? wordmarkAdvances() : null
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      fillRule="evenodd"
      width={m.width}
      height={m.height}
      viewBox={`0 0 ${m.width} ${m.height}`}
      data-testid="brand-lockup"
      data-variant={variant}
      className={cn("block shrink-0", className)}
    >
      <Mark placement={m.mark} reveal={reveal} />
      {m.wordmark && advances ? (
        <g transform={transform(m.wordmark)} data-testid="brand-wordmark">
          {/* Each glyph keeps its measured coordinates and moves by the difference between its advance at this tracking and its PNG advance. */}
          {WORDMARK_GLYPHS.map((glyph, i) => (
            <g key={glyph.x} transform={`translate(${round(advances[i]! - glyph.x)} 0)`}>
              <path d={glyph.path} />
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  )
}
