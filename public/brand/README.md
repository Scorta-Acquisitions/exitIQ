# Brand files

## Sources

- `1.png` and `3.png` (2000 × 2000, RGB, no alpha) are the two stacked lockups Suyash delivered on 2026-09-11.
  `1.png` is the mark in `#2d3706` on `#f8f9f0`; `3.png` the mark in black on `#fcf9da`. The wordmark is black in both.
  In both files the mark's dark pixels span x 594–1405, y 500–1332 (812 × 833) and the wordmark spans
  x 478–1523, y 1441–1493 (1046 × 53); the gap between them is 109 px (0.13 of the mark's height) and the
  wordmark's cap height is 0.064 of the mark's height.
- `heirloom-mark.svg`, the first build's traced mark (1095 viewBox, two 41 KB paths), was deleted on 2026-09-17: it
  had no reader. Rasterised at the PNG mark's box it had differed from `1.png` on 2.31% of the box pixels (6.95% of
  the ink), so it was the same drawing; the redrawn geometry below is what the site draws.
- `yc-logo.svg` is the Y Combinator mark in the home hero's badge (`components/site/hero/HomeHero.tsx`).

`yc-logo.svg` is the only file here a page requests: the lockup is inline SVG, and the two PNGs are the derivation's
sources.

## The redrawn mark (`MARK_PATH` in `components/site/brand/BrandLockup.tsx`)

Measured on `1.png` at full resolution (coordinates in the 812 × 833 box; the drawing is symmetric about both axes):

- Left wedge: outer edge x 0; top edge to x 6.8; the two diagonals run at dx/dy 0.7533 and −0.76 (53° from horizontal)
  and meet at (167.9, 213.8), filleted r 20 so the tip reaches x 163; the inner vertical is x 50 from y 369 to 464.
  The right wedge mirrors it at x 812 − x.
- Spindle: tips at (32, 416.5) filleted r 9 (the arc reaches x 52.9), lobes rising at dy/dx 0.318 (17.6°) to apexes at
  (294, 333.2) and (518, 333.2) filleted r 97, a sharp centre dip at (406, 368.8); the lower half mirrors at y 833 − y.

The path is three closed subpaths of straight segments and arcs, 487 bytes; rendered at the PNG's size it differs from
the crop on 0.17% of the box pixels (0.51% of the ink), all sub-pixel edge coverage. A square viewBox is
`0 0 833 833` with the mark at x 10.5.

## The PNG wordmark (`WORDMARK_GLYPHS`, the stacked variant)

Eight outlined paths on a 53-unit cap height, one per glyph, each at its measured advance in the PNG: H 0 · e 145 ·
i 290 · R 371 · L 516 · O 661 · O 806 · m 951 (glyph boxes 74 wide, the i 10.65, the m 95; 71 between boxes except
70.35 after the narrow i, so the pitch is 145 = 2.74 × cap). Stroke 10.65 (coverage-weighted; 0.2 × cap), middle
strokes y 21.2–31.8, outer corners r 12 (measured on the O's row profile), inner corners r 1.5, the e's and R's bowl
corner r 10, the R's leg from x 51–62.5 at the bowl to 58–70 at the baseline, the i's dot 10.65 tall over a 5.3 gap,
the m's arches meeting in a 4-unit notch. Fill with `currentColor`; the counters are separate subpaths wound the other
way, and the group also sets `fill-rule="evenodd"`.

Diff against each glyph's crop at 4× (binary at 50%, percentage of the glyph box): H 1.32 · e 1.78 · i 0.94 · R 2.79 ·
L 1.25 · O 1.15 · O 1.16 · m 1.35. The whole wordmark is 1499 bytes.

### The horizontal word is text now; the PNG glyphs draw the stacked variant only

Decided 2026-09-12 after Suyash's third note ("the word and the logo should at least be the same height and the width of
the name needs to be condensed further", with the freedom to change the face): at the mark's height the PNG's glyphs
would run 4.8 mark-heights of pitch alone (≈ 450px at 28), so the horizontal lockup no longer draws them. It first set
HEIRLOOM in IBM Plex Sans Condensed 600 with the cap at the mark's height (240px wide at 28), which his fourth note
rejected the same day: "grotesquely big and gross and bold compared to everything else on the page, i want it there with
some finesse, with some class, while being symmetrical with the logo". A design panel then rendered twelve settings onto
the live bar (`scratchpad/wordmark2/`: faces, cases, weights, sizes, gaps and vertical shifts, each measured to the
ink) and chose the word Heirloom in Newsreader at 400 at a font-size equal to the mark's height, its 20px of ink
centred on the mark, which Suyash approved on 2026-09-13: "ok perfect. the sizing is perfect now. Can we use a cooler
or more unique font associated with tech and fintech companies for it." A second panel then rendered open-licence
faces onto the live bar at that sizing (the word's ink 20px tall, 4px of mark above and below, ink gap about 8.5,
width under 135px): Geist, Mona Sans, Host Grotesk, Inter Tight, Reddit Sans, Public Sans, Hanken Grotesk, Schibsted
Grotesk, Familjen Grotesk, Instrument Sans, Albert Sans, Golos, Bricolage Grotesque, Space Grotesk, Syne, Unbounded,
Funnel Display, Red Hat Display, Lexend, Manrope, Sora, Onest, Figtree, Outfit, Urbanist, DM Sans, Wix Madefor
(Fontshare's Satoshi, General Sans and Switzer were ineligible: their licence forbids self-hosting). What ships is
**the word Heirloom in Mona Sans at weight 450 and width 90** (GitHub's brand grotesk, OFL, the variable font's wdth
axis through `font-stretch`), title case written in the markup, at a font-size of **0.9821 × the mark's height**
(`BRAND_SIZE_RATIO`: 27.5px in the bar, 23.57 in the footer), line-height 1, **no tracking**, the word's box 0.2143 of
the mark's height after the mark's box (`LOCKUP_RATIOS.horizontal.gap`: 6px at 28), and **no shift**
(`BRAND_WORD_SHIFT_EM` 0: the face's box centres the ascender-to-baseline ink on the mark by itself). The narrow width
is what makes it read as a wordmark rather than a line of interface type, it answers the width he asked for twice, and
its 3px stems equal the mark's crossbar; runners-up were Schibsted Grotesk 500 and Geist 450. The third face is back
for this one word (`--font-brand`, `public/fonts/mona-sans/`). The mark keeps its redrawn geometry. The **stacked** variant (the 404) keeps the
eight glyph paths at the PNG's own tracking as delivered artwork, untouched by any of this; `WORDMARK_TRACKING` now
carries `stacked` (71) alone, and `wordmarkAdvances()` / `wordmarkWidth()` take no tracking (the 34-unit re-advance
was the horizontal word's from the second note until the third, and went with the paths that drew it on 2026-09-17).

| tracking           | advances H · e · i · R · L · O · O · m                     | shifts from the PNG (dx)                                        | width (units) |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------- | ------------- |
| 71 (`stacked`)     | 0 · 145 · 290 · 371 · 516 · 661 · 806 · 951                | all 0                                                           | 1046          |
| 34 (history, gone) | 0 · 108 · 216 · 260.65 · 368.65 · 476.65 · 584.65 · 692.65 | 0 · −37 · −74 · −110.35 · −147.35 · −184.35 · −221.35 · −258.35 | 787.65        |

## `BrandLockup` ratios and metrics

All relative to `markHeight` (px), which is the only size prop:

| variant      | word                                                  | gap                   | placement                                                                                   | intrinsic size                                                                                                             |
| ------------ | ----------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `horizontal` | text, Mona Sans 450 / width 90 at markHeight × 0.9821 | 0.2143 (mark to word) | `inline-flex items-center`; the face's own box centres the word's ink on the mark, no shift | mark 812/833 + 0.2143 + 0.9821 × 3.7313 = 4.854 × markHeight wide (the rule; the browser's drifts, below), markHeight tall |
| `mark`       | —                                                     | —                     | —                                                                                           | a markHeight square, mark centred                                                                                          |
| `stacked`    | the PNG glyphs at a 0.13 cap                          | 0.13 (under the mark) | centred under the mark, tracking 71                                                         | 2.5657 × markHeight wide, 1.26 tall                                                                                        |

The horizontal word's box is the face's advances alone: `BRAND_WORD_ADVANCE_EM` 3.7313, Mona Sans 450's "Heirloom" at
width 90 measured on the served bar (102.61px / 27.5), no tracking and nothing taken back. `lockupMetrics("horizontal", h)`
reports `word.fontSize` (0.9821 × h), `word.gap`, `word.width` and the lockup's `width` from that one rule; the rendered
width is the browser's and drifts by a fraction of a pixel with the size (the footer reads 116.45 against the rule's
116.48); the share card magnifies the bar's 28px lockup rather than setting a 120px word.

| markHeight | where          | font-size (px)      | gap (px) | word box: rule / rendered (px) | word ink (px) | lockup box: rule / rendered (px) | ink gap (px) | mark above / below the word's ink (px) | ink centre − mark centre |
| ---------- | -------------- | ------------------- | -------- | ------------------------------ | ------------- | -------------------------------- | ------------ | -------------------------------------- | ------------------------ |
| 28         | the bar        | 27.5                | 6        | 102.61 / 102.61                | 99.5          | 135.9 / 135.89                   | 8            | 4 / 4                                  | 0.0                      |
| 24         | the footer     | 23.57               | 5.14     | 87.95 / 87.92                  | 85            | 116.48 / 116.45                  | 7            | 3 / 3                                  | 0.0                      |
| 120        | the share card | 27.5, scaled 120/28 | 25.7     | 439.73 / 439.8                 | 424           | 582.42 / 582.4                   | 36           | 17 / 16                                | +0.5                     |

Measured on the served build at 1440 (Chromium, 2× device scale, ink boxes read from the screenshot; the panel's
renderer in measure-only mode, `scratchpad/wordmark2/render.mjs`). At 28 the cap height is 20.25px (0.723 of the mark),
the x-height 14.75, the H's stem 3px against the mark's 3px crossbar and 1.6px thinnest stems. The word's history at
the bar's 28px mark: 294px wide with a 12.9px cap on delivery (2026-09-11), 204px with an 8.4px cap after the first note,
155px (the word 116.5) with a 7.84px cap and the 34-unit tracking after the second, 240px (the word 197 of ink, a 28px
cap) in the condensed grotesk after the third, 145px (the word 109.5 of ink, a 20.25px cap inside the mark's box) in
Newsreader after the fourth, and now 136px (the word 99.5 of ink, the same 20.25px cap) in Mona Sans after the fifth
("a cooler or more unique font associated with tech and fintech companies"; the earlier Newsreader setting's 145px
(the word 109.5 of ink, a 20.25px cap inside the mark's
height) in the display face after the fourth and the panel.

`reveal` puts `animate-mark-in motion-reduce:animate-none` on a group nested inside the mark's layout group (so the
CSS transform never replaces the layout transform), scaling from the mark's own centre; the word never animates.

## The lockup's colour

Both variants fill with `currentColor`, so the colour is the call site's: every one of them carries `text-heirloom`,
the token pair declared in `styles/site.css` beside `primary` — `--color-heirloom` #0f7a45 on light surfaces and
`--color-heirloom-on-dark` #4ca270, which `.on-dark` swaps in (and `.on-light` swaps back) the way it remaps
`primary`. Suyash chose the first pair on 2026-09-17 from a rendered panel of candidates measured against the bar's
`surface-black` #04120c and the parchment #f4f5ee: #35b96c read at 7.6:1 on the bar, where the existing
`primary-on-dark` #4ce27e at 11.4:1 was too bright, and #0f7a45 at 4.9:1 on the parchment. The same day, once it
was live, he judged #35b96c itself "too bright and cartoonish" and asked to mute it and add a light gradient. The
gradient is out of scope: `DesignSystem.test.ts` scans every file in `app/` and `components/site/` for the literal
word "gradient" and fails on it, a rule from the September redesign (`Generated imagery may contain gradients; the
DOM may not`), so the lockup keeps a flat fill. The mute is `#4ca270`, the same hue at −35% saturation (6.1:1 on the
bar), from a second rendered panel; the on-light `#0f7a45` is unchanged, since the same desaturation read pastel on
parchment rather than muted. Nothing but the mark and the word Heirloom uses the pair.

## Where the lockup appears

The bar (`horizontal`, 28px mark in `text-heirloom` under `on-dark`, so #4ca270 in both states; the mark alone where the row needs the room: the thresholds
live in `lib/site/bar.ts` (`LOCKUP_WIDTH`, `HOME_LOCKUP_FROM`, `CONTEXT_LOCKUP_FROM`, `PHONE_LOCKUP_FROM`) and are
re-derived from the 135.9px lockup, which fits beside the
menu button at 320px and inside home's equal share at every desktop width, so only context pages under 970px show the
mark on a desktop), the footer (`horizontal`, 24px, `text-heirloom` on the parchment: #0f7a45), the 404 (`stacked`, 72px, the same) and the share card
`public/og/heirloom-og.png` (1200 × 630: `#0b241b` tile, the bar's own 28px lockup in `#4ca270` magnified 120/28 in a CSS scale, so the card is pixel-faithful to the bar: 582px wide, the word's ink 17px under the mark's top and 15px above its bottom; 14,865 bytes, the e2e floor is 10 KB; rendered with Playwright against the served build by `e2e/tools/og-card.mjs`, which clones the served lockup's markup and prints the card's ink boxes). The brass seal was tried at the lower right
and left out: `public/generated/seal.webp` was a tall stamp, 439 px high at 180 px wide, and it covered the wordmark's
last letters (the file was deleted on 2026-09-17, unreferenced). The legacy exitIQ console keeps
its own mono-caps headers.
