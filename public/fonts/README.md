# Webfonts

The Heirloom site is set in the faces it launched with, restored at the user's request on 2026-09-11 after a day
in Plus Jakarta Sans: **Newsreader** (Production Type, [SIL Open Font License 1.1](./newsreader/OFL.txt)) for
display and **IBM Plex Sans** (IBM, [OFL 1.1](./ibm-plex-sans/LICENSE.txt)) for text, plus a third face for one
word: **Mona Sans** (GitHub, [OFL 1.1](./mona-sans/OFL.txt)) for the wordmark beside the mark, since 2026-09-13. All
are self-hosted here as the WOFF2 files Google Fonts serves, downloaded once and checked in, so no request leaves the
site and no build depends on Google (the first build loaded them through `next/font/google`).

| Folder           | Files                                                                             | Weights                          | Used for                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `newsreader/`    | `Newsreader-{latin,latin-ext}.woff2`, `Newsreader-Italic-{latin,latin-ext}.woff2` | 200–800 (variable, opsz)         | `--font-display`: every heading, lead and tagline, at 400; the italic for `em`                              |
| `ibm-plex-sans/` | `IBMPlexSans-{300,400,500,600,700}-{latin,latin-ext}.woff2`                       | 300 / 400 / 500 / 600 / 700      | `--font-text`: body, captions, buttons, nav, fine print; 500 only inside the restored exitIQ console        |
| `ibm-plex-mono/` | `IBMPlexMono-{400,500}-{latin,latin-ext}.woff2`                                   | 400 / 500                        | `--font-mono`: the restored exitIQ console's labels only (see "legacy exitIQ console" in `styles/site.css`) |
| `mona-sans/`     | `MonaSans-variable-{latin,latin-ext}.woff2`                                       | 200–900, width 75–125 (variable) | `--font-brand`: the wordmark alone, Heirloom beside the mark at weight 450 and width 90 (`type-brand`)      |

`styles/fonts.css` declares them (`font-display: swap`, latin and latin-ext by unicode-range; Newsreader upright and
italic, Plex upright only: `em` is the serif italic in the accent colour, as the first build's hero set it) and
three metric-matched fallbacks, `"Newsreader Fallback"`
(Times New Roman), `"IBM Plex Sans Fallback"` (Arial) and `"Mona Sans Fallback"` (Arial), with the `size-adjust` and
ascent / descent / line-gap overrides `next/font/google` computes for these families (Next ships the table as
`next/dist/server/capsize-font-metrics.json` and the formula as `calculateSizeAdjustValues` in
`next/dist/server/font-utils.js`), so text set before a file arrives occupies the same lines. `app/layout.tsx` preloads
the latin files the first paint needs: the serif, the regular sans, the wordmark's face (in the bar on every route) and
the console's mono.

**The third face.** The wordmark beside the mark (the bar, the footer, the share card) is the word Heirloom in Mona
Sans at weight 450 and width 90, set through the sizeless `type-brand` utility with its font-size 0.9821 of the mark's
height (`components/site/brand/BrandLockup.tsx`, `public/brand/README.md`). The face is the client's 2026-09-13 request
for "a cooler or more unique font associated with tech and fintech companies" after he approved the wordmark's sizing
in Newsreader 400 the day before; a rendered panel of open-licence faces at that sizing chose Mona Sans, GitHub's brand
grotesk, at a narrow width. Both files are the variable font (weight 200–900, width 75–125): the width axis is what the
setting needs, so a static instance would have to be cut and renamed under the OFL's reserved-name clause; the two
files together are 131 KB and only the latin one is preloaded. Before it, IBM Plex Sans Condensed 600 was added for that
word on 2026-09-12 and removed the same day after the client's fourth note ("grotesquely big and gross and bold compared
to everything else on the page"). The share card magnifies the bar's 28px lockup rather than setting 120px text.

## How the ladder uses them

```
--font-display: "Newsreader", "Newsreader Fallback", Georgia, "Times New Roman", serif
--font-text:    "IBM Plex Sans", "IBM Plex Sans Fallback", <system sans stack>
```

The `type-*` ladder in `styles/site.css` keeps its sizes and line heights. Its display steps (hero, display-lg,
display-md, lead, tagline) are the serif at weight 400, as the first build set its headlines; the text steps are
Plex Sans at 300 / 400 / 600 (700 is reserved). Tracking is in em: −0.02em at the display sizes, −0.015em for
display-md, −0.01em for lead, none for text, and +0.01–0.02em for fine print, legal and nav type. The first build
also set small labels in IBM Plex Mono; the design system has no mono or uppercase rung, so site-wide labels stay
in Plex Sans. The one place the mono returns is the exitIQ console and card, restored faithfully from the first
build on 2026-09-11 (`components/site/hero/HeroConsole.tsx`, `components/site/exitiq/*`), which the guard
exempts. The ladder's one sizeless rung is `type-brand` (Mona Sans at weight 450 and width 90, line-height 1, no
tracking and no shift — the face's own box centres the word's ink on the mark): `BrandLockup` sets its size to
0.9821 of the mark's height, and nothing else may use it. Adjust the ladder, never a component, when the type needs tuning.
