# exitIQ / Scorta — Engineering Contract

> **Deployable app as of September 2026: the Heirloom marketing site.** Root `app/` now serves the
> Heirloom website (home, exitIQ readiness screen, offer review, how it works, fees, confidentiality,
> buyer passport, who we are, questions, why) built from the Claude Design "Heirloom v7" file. The
> previous Scorta/exitIQ application (marketing pages, authenticated `(app)` workspace, DealIQ,
> `api/*`) was moved, not deleted, to [`legacy/`](../legacy/README.md) and is not routed or deployed.
> Its shared libraries (`lib/assessment`, `lib/db`, `lib/supabase`, `lib/ai`, `lib/dealiq`,
> `components/scorta`, `components/exitiq`, `components/dealiq`) remain in place and stay type-checked.
> See **"Heirloom site (current)"** below; the sections after it describe the legacy codebase.

## Heirloom site (current)

```
app/
  layout.tsx                 metadata incl. the Open Graph / Twitter share card (public/og/heirloom-og.png, 1200×630;
                             needs NEXT_PUBLIC_SITE_URL in prod), SiteStateProvider, SiteBar (the one sticky bar),
                             `<main id="main">` (the skip link's target), SiteFooter, AdvisorDialog. Type is Newsreader
                             (display) + IBM Plex Sans (text) + Mona Sans (the wordmark alone) via styles/fonts.css (self-hosted
                             WOFF2; four files preloaded — the serif, the sans, the wordmark's Mona Sans and the
                             console's mono — no next/font).
  page.tsx                   Home — HomeHero (glass film behind the tile, HeroConsole funnel + SVG market graph),
                             TermsStrip (five turntable objects), MarketScene (desk loop), then the THREE SELF-RUNNING
                             DEMOS — FinancialPrep (the ledger settling line by line onto Ridgeline's adjusted
                             earnings), PrivacyScene (the company record opening a level at a time for four buyers),
                             SellerWorkload (the eight stages lighting while four letters resolve to one winner) —
                             with OfferComparison (FLIP ranks) between the first two and the third, SpeedSection (the
                             race), TransactionCarries, QuestionsTeaser, CloseSection. On 2026-09-16 Suyash rejected
                             the three form flows as "immensely complex and boring" and asked for a few words and a
                             self-running demo per section; nothing pins but MarketScene. Later the same day he asked
                             for the demos "a tiny bit faster ... just 10% faster" (every beat's `at` × 0.9; the 8s
                             hold and the 240ms re-key are unchanged) and for the LAST DEPLOYED BUILD's words back
                             (e35fbbe) in place of "AI slop": "Financial preparation", "Who sees what" and "The whole
                             sale asks four decisions of you.", each with its own sentence verbatim and NO EYEBROW,
                             so `DemoWords` is a heading and a sentence and nothing else.
  score/                     exitIQ — seven-question readiness run (ExitIqRun) + result panel
  offer-review/              Free Offer Review intake (OfferIntake; `?mode=forward|paste|verbal`)
  how-it-works/              StagesScene (8-stage scroll roadmap) + BusinessBrain reconciliation demo
  fees/                      FeeCalculator + fee copy
  confidentiality/           DisclosureLevels (6 levels · company record · access log)
  buyers/                    Buyer Passport — PassportTiers + BuyerRegisterForm
  who-we-are/ · questions/ · why/
  not-found.tsx (the stacked lockup at a 72px mark above the eyebrow) · sitemap.ts · robots.ts · icon.svg
  api/health/route.ts        liveness (rewrites for /healthz etc. still in next.config.ts)
  api/inquiry/route.ts       POST — Zod-validated site inquiry; logs; forwards via Resend when RESEND_API_KEY is set

components/site/
  ui/          Button (CVA, Link-aware) · Chip · TextLink · TextButton · Disclosure · Dialog (Radix wrapper) ·
               AmbientVideo (one mode: a native loop whose source attaches 100px before the viewport, pauses off
               screen, retries a refused autoplay on a 4s timer and runs no rAF) · ScrubVideo (a film scrubbed by progress: `ref.seek(p)`,
               lazy src, poster under reduced motion, removes itself on error) · ProgressTicks (own client file; newly lit
               ticks stagger 60ms) · primitives (Container · Tile · Card · Eyebrow · KeyValueRow · VisuallyHidden; the
               live-dot primitive is gone, fix 5: no live dots anywhere)
  brand/       BrandLockup (server; the mark as inline SVG geometry filled with `currentColor` and, in the horizontal
               variant, the word Heirloom set as TEXT in Mona Sans at weight 450 and width 90 (`type-brand` on `--font-brand`, the
               site's third face, the wordmark's alone; font-stretch drives the variable font's wdth axis); both `aria-hidden` so the wrapper carries the name; variants
               horizontal · mark · stacked, `markHeight` the only size prop. The COLOUR comes from the call site, which
               carries `text-heirloom`: the mark and the word are the Heirloom green everywhere, #0f7a45 on light
               surfaces and #4ca270 under `on-dark` (Suyash chose the pair on 2026-09-17 from a rendered panel; the
               dark reading measures 7.6:1 on the bar's `surface-black`, where `primary-on-dark` #4ce27e at 11.4:1
               read too bright). The same day he found that first dark value, #35b96c, "too bright and cartoonish"
               against the black bar and asked to mute it, and asked for a light gradient; the gradient is not
               built — every file in `app/` and `components/site/` is scanned by `DesignSystem.test.ts` for the
               literal word "gradient" (`Generated imagery may contain gradients; the DOM may not`, this same
               file below), a rule Suyash himself set during the redesign, so the mark and the word stay a flat
               fill. The mute is a −35% desaturation of the same hue (#4ca270, 6.1:1 on the bar), chosen from a
               second rendered panel; the on-light value is unchanged, since the same desaturation read pastel on
               parchment. Horizontal: font-size = 0.9821 × markHeight
               (`BRAND_SIZE_RATIO`: 27.5px in the bar, 23.57 in the footer), line-height 1, no tracking, no shift
               (`BRAND_WORD_SHIFT_EM` 0: Mona Sans's box centres the ascender-to-baseline ink on the mark by itself,
               measured 4px of mark above and below the word's 20px of ink at 28, 3 / 3 at 24, ink gap 8 at 28); the gap
               0.2143 × markHeight (6 / 5.14). `BRAND_WORD_ADVANCE_EM` 3.7313 (102.61px / 27.5, measured), so
               `lockupMetrics` reports 135.9 × 28 in the bar (Chromium reads 135.89) and 116.48 × 24 in the footer
               (116.45 rendered). The SIZING (the word's ink 20px tall, centred, with no ratio to explain) is the one
               Suyash approved on 2026-09-12 ("ok perfect. the sizing is perfect now"), found by a rendered panel of twelve
               settings after his fourth note rejected the condensed grotesk at 600 with its cap at the mark's height
               ("grotesquely big and gross and bold compared to everything else on the page ... some finesse, with some
               class, while being symmetrical with the logo"); the earlier rounds were three reductions of the traced
               PNG glyphs (294 / 204 / 155px) and the 240px condensed setting. The FACE is his 2026-09-13 request for "a
               cooler or more unique font associated with tech and fintech companies": a second panel rendered
               open-licence faces at the approved sizing (Geist, Mona Sans, Host Grotesk, Inter Tight, Hanken, Schibsted,
               Familjen, Instrument, Albert, Bricolage, Space Grotesk, Red Hat Display, Manrope, Sora, DM Sans, Urbanist,
               Wix Madefor and others; Fontshare faces are ineligible, their licence forbids self-hosting) and Mona Sans at
               a narrow width won: GitHub's face, still uncommon on the web, whose narrow set reads like the bespoke
               fintech wordmarks, with 3px stems equal to the mark's crossbar. Runners-up: Schibsted Grotesk 500 and
               Geist 450. The stacked variant keeps the PNG's eight
               glyph paths (`WORDMARK_GLYPHS`, `WORDMARK_TRACKING.stacked` 71), untouched; `reveal` puts the one-shot
               `animate-mark-in` on a group nested inside the mark's layout group, the wordmark never animates;
               `MARK_PATH` / `WORDMARK_GLYPHS` / `lockupMetrics` / `BRAND_SIZE_RATIO` / `BRAND_WORD_ADVANCE_EM` /
               `BRAND_WORD_SHIFT_EM` are exported; the horizontal wrapper is a span with `data-testid="brand-lockup"` and
               `data-variant`, the word `data-testid="brand-wordmark"`). Derivation in public/brand/README.md
  layout/      SiteBar (the ONE sticky bar, whose pure math and every width below — `nextBarState`, `currentSection`,
               `pageProgress`, `NAV_WIDTH`, `LOCKUP_WIDTH`, `WIDEST_CLUSTER`, `CLUSTER_RESERVE` and the three lockup
               thresholds — live in `lib/site/bar.ts`: `h-[var(--bar-h)]`, a 52px
               flow box on every route, `sticky top-0 z-50`, `on-dark`, so the page never shifts; everything visible is
               an absolutely positioned surface inside it. `data-state` landing|scrolled with hysteresis, condensing at
               scrollY 44 and expanding again at 16 (`nextBarState`; one passive scroll listener + rAF, React state only
               on a flip); landing is opaque `surface-black`, scrolled is `glass-dark` with a hairline fading in (0.3s
               colours). `data-context` site|page from `SUBNAV[pathname]`: a desktop context page carries the page SCRUBBER
               and the page pill in the global row in BOTH states, from landing (the title, or title · current section,
               a 2px `bg-accent` reading rule for page progress written from the rAF, a menu of the sections plus the
               advisor entry when the page CTA is an anchor; the current section is the last anchor whose top is within
               24px under the bar). There is no second row: the surface is 52px on every route in every state and a
               scroll changes only the material (the user asked for the scrolled arrangement as the default, 2026-09-11).
               From the nav breakpoint the row is a three-column grid,
               `grid-cols-[minmax(0,1fr)_auto_minmax(auto,1fr)]` with `gap-6` inside `px-6`: the brand at the left edge
               and the action cluster (scrubber, pill) at the right edge each sit 24px in from their edge, and the primary
               navigation (`NAV_WIDTH` 366.95) sits in the exact centre of the viewport, the cluster capped at
               `max-w-[calc(100vw-490.95px)]` (`CLUSTER_RESERVE`: the insets, the mark, the gaps and the nav) so a long
               scrubber title truncates instead of pushing the nav off centre, and the scrubber's menu aligns to its
               trigger's end (the user asked for the logo and the CTA equidistant from their edges with the rest
               centred, 2026-09-12). The brand is the horizontal lockup (28px mark, 135.9px wide, `LOCKUP_WIDTH`) where
               the side columns hold it and the mark alone where they do not: on home and the 404 the equal share holds
               it from 735px (`HOME_LOCKUP_FROM`, under the 834 nav breakpoint, so the lockup shows at every desktop
               width and no class carries a home rule), on desktop context pages from 970px (`CONTEXT_LOCKUP_FROM`, the
               widest cluster `WIDEST_CLUSTER` 370.31 beside the centred nav; `max-[970px]` shows the mark under it), on
               phones whenever the row carries no pill (it fits from 236px, `PHONE_LOCKUP_FROM`, under the narrowest
               phone, so no width rule); the lockup is 28px in both states, nothing about the brand scales, and
               nothing in the row changes width at a flip, so nothing moves. A skip link to
               `#main` is the first Tab stop. Below
               834px the groups fold into an overlay menu (`#mobile-nav`, mounted only while open: the page's sections
               first, every destination, then the advisor, filled only when the row carries no pill; html overflow
               locked while open, Escape closes and returns focus, a route change closes it; a route change also blurs
               the active element when it sits inside one of the bar's `.nav-dd` groups, so a clicked dropdown link
               cannot hold its menu open over the new page through `:focus-within`, and Escape inside a group marks it
               `data-closed` — the CSS rule that beats both open states — keeping the focus on its trigger, cleared when
               the focus leaves the group, the pointer enters it, or the trigger is pressed again with Enter, Space or
               ArrowDown) and the row carries at most
               one filled pill, a 34px visual pill in a 44px hit box (the page's, or the advisor's once scrolled on
               home/404). The bar carries no margin: `main#main` starts at 52px on every route)
               · SiteFooter (parchment; the horizontal lockup at a 24px mark in `text-heirloom`, #0f7a45 there)
  providers/   SiteStateProvider — cross-route client state (exitIQ run, hero funnel, advisor dialog), sessionStorage-
               persisted through `persistableState` on the way out and `parsePersistedState`'s Zod schema on the way
               back (`lib/site/state/persisted.ts`: anything that does not fit the shape starts the visitor over,
               silently); `openAdvisor()` takes nothing (the advisor flow seam went with the form flows on 2026-09-16)
  advisor/     AdvisorDialog (5 questions → note → briefing + booking link; the sheet stages in, questions and
               briefing rows arrive keyed, the current question's briefing label is lit `data-current`, the header
               carries the title, the progress label and ticks with no dot, an instrument strip under the header
               (tablet up) brightens 0.15→0.85 with the answers; the briefing is six rows, the five questions and the
               note, and ends there) · AdvisorCtaButton (the `Button`'s own props, its label defaulting to "Talk to an
               M&A advisor") / AdvisorTrigger (an unstyled button: children, `className`, the rest of a button's props)
  demo/        the shared grammar of the three home DEMOS: DemoSection (server
               shell: `Tile` + `anchor-target`, words left in a `tab:grid-cols-[300px_minmax(0,1fr)]` — an h2
               `type-display-lg`, one `type-body` sentence and one `TextLink standalone`, capped by
               `DEMO_WORD_CAPS`, and no eyebrow — and the screen right, full width
               under `tab`) · DemoFrame (the software's screen:
               `Card padded={false}` `on-dark bg-tile-1`, header "Project Ridgeline · {subject}" left and "Worked
               example" right over a hairline, the film absolute behind it inside `hidden tab:block` as
               `{testid}-film`, no shadow) · classes.ts (`ROW_IN` · `STAGE_IN` · `BAND` · `METER_TRACK` /
               `METER_FILL` · `REKEY` for a replay's cross-fade (`duration-240`, `DEMO_REKEY_MS`) ·
               `demoStagger(cycle, index)`, 60ms on the first play and 0 on a replay) · usePreviewHandlers
               (`previewProps(value, active)`: the one pointer/tap/focus grammar SellerWorkload's priority words and
               `LetterRow` share: a mouse previews by resting and releases by leaving, a keyboard focus previews
               (`:focus-visible`), and a tap, which can rest on nothing, toggles it from the press). Testids
               `{prefix}-demo|-frame|-frame-film` with prefixes fin · priv · dec
  hero/        HomeHero (server; TWO compositions of fixed px rhythm decided by the `short` height variant stacked with
               `nav:` so phones never see the second, both breathing with the viewport through `--hero-air`. The tile
               carries `min-h-[calc(100svh-var(--bar-h)+var(--spacing-section))]`, so the tile and the film behind it
               always reach at least 80px below the first viewport's bottom edge while the content stays top-aligned
               (the user wants the background to run past the fold with the copy, the action row and the badge inside
               it). A, viewports taller than 889px: the first build's spacing plus the line of air Suyash asked for on
               2026-09-16 (tile top 64, eyebrow → h1 24, h1 → lead 28, lead → CTA 40, CTA → badge row 28, badge row →
               console 24: +8 on each of the four gaps above the badge row, 32px in all), eyebrow and two-line headline
               in 692 (two lines until the headline's second clause lost its italic on 2026-09-17: upright glyphs are
               wider, so A's 56px headline and the 28px phone headline each gained a line), the lead in 800 so it holds
               two lines, the CTA row with its THREE actions, the YC badge alone on its own centred row under them. B, `short:nav:`, 889px and under at 834px wide and up (most laptop
               browsers, a 1536×864 laptop included): the eyebrow hidden, the headline at `type-display-lg` and the
               lead at `type-tagline`, tile top 16 and gaps 14 / 22 / 18 / 22 (+6 on each, 24px in all).
               Air: the `hero-air` / `hero-air-short` utilities set `--hero-air` to clamp(0px, (100svh − 900px | 720px)
               / 5, 16px) and every gap above the console is `mt-[calc(Npx+var(--hero-air))]`, so 1280×720 is tight,
               1440×788 gains 68px, 1440×900 none, 1920×1080 96px (its tile top lands on the first build's 80). The
               CTA row holds THREE actions on two rungs: the advisor's primary pill, the ghost secondary, and the
               buyers entry, which on 2026-09-17 stopped being a pill. Suyash asked for it smaller and quieter so the
               two owner actions read as the hero's calls to action, so it is now the site's tertiary pattern (the one
               /fees, /why and /score already use): a `TextLink href={ROUTES.buyers} standalone`, testid
               `hero-buyers-plate`, rendering `class="text-link inline-flex min-h-11 items-center"` — the accent from
               the global `.text-link` rule (#0f7a45 on this light tile), no fill, no border, no padding, no radius,
               and no type rung of its own, so it inherits the body's 17px and measures 44 × 225.97 against the pearl
               pill's 46.98 × 269.97. The row wraps and stays centred, so a phone takes the link onto its own line.
               The row's own height is unchanged on a desktop (48.98, the ghost pill with its border is the tallest
               member), so nothing below it moved; on a phone the row is 163.97 against 166.95 and everything under it
               rose 2.98px. Nothing sits under the console or reads the `nav` breakpoint any more. The +8 is the
               DESKTOP rhythm: under the nav breakpoint (`max-nav:`, four classes) composition A keeps the gaps it had,
               64 / 16 / 20 / 32 / 20 / 24, which is what holds the buyers link inside a 320×640 fold. Fold contract
               (2026-09-16, remeasured 2026-09-17): the buyers link is inside the first viewport at EVERY viewport, the
               console's TOP stands ≥120px above the fold (its bottom may run under), the tile's bottom ≥79px below it.
               Measured on the served build — buyers link bottom / console top, both above the fold: 1280×720 432/345,
               1440×788 459/345, 1440×900 376/277, 1536×729 435/345, 1536×864 528/409, 1920×1080 492/361,
               390×844 210/122, 320×640 6/−82 (the one viewport whose console head cannot fit, as before). The four
               numbers that moved by more than the link's 3px are the headline's, not the row's: the italic left the
               second clause on 2026-09-17 and the taller headline carries the console 59.91px lower at 1440×900,
               1440×890 and 1920×1080 and 30.8px lower at 390×844. The tile's bottom is 80px below the fold at every
               desktop viewport but 1440×900, where the three-line headline makes the content taller and it is 145) ·
               HeroFilm (client leaf: the site's original ambient film `hero-ambient.mp4`, restored at the user's
               request in place of the Higgsfield caustics, a 14s ping-pong loop at 60% in a layer that leans ≤8px
               toward the pointer over the tile) · HeroConsole and HeroGraph: RESTORED 2026-09-11 from the first build
               (e35fbbe) at the user's request, verbatim look (near-black card, fractal WebGL field `useConsoleField`,
               mono uppercase labels, serif question, dark chips, the buyer-view graph with hex colours); they and
               components/site/exitiq/* are the "legacy exitIQ console", exempt from the design-system guard and
               fed by the legacy token block in styles/site.css. The phase-3 console (stage-in, idle tick, lean,
               InstrumentField) is gone from the hero. The exemption is exactly six files: HeroConsole.tsx,
               HeroGraph.tsx, exitiq/ExitIqRun.tsx, ExitIqQuestion.tsx, ConsoleChrome.tsx, useConsoleField.ts
  exitiq/      ExitIqQuestion · ExitIqRun (the first build's exitIQ card, restored: mono header with the label and
               ticks (its live dot went on 2026-09-11 with every other status light), question pane, SCORES /
               RECOMMENDATION panel with meters, findings, 90-day plan) · ConsoleChrome (the console's own pills, dark
               chip and ticks) · useConsoleField (the first build's fractal WebGL field) · ExitIqActions ·
               ReviewWithAdvisor
  instrument/  (now only the advisor dialog's strip) InstrumentField (`"use client"` canvas leaf: `target` 0..1, `pulseKey`) · useInstrumentField (WebGL 1,
               low-power, textures from public/generated blended calm→mid→bright by the level, procedural fallback,
               static frame under reduced motion, null without WebGL; the warp leans toward the pointer over the
               canvas's positioned parent through the `M` uniform, off on touch and under reduced motion; the two
               GLSL sources are the hook's own `VERTEX` / `FRAGMENT` constants, there is no shaders module)
  motion/      the hooks every living section is built from (pure math in lib/site/motion.ts): useReveal (arrive-once
               reveals of `[data-reveal]` items with a 60ms stagger; pending classes are applied only from JavaScript) ·
               usePointerParallax (a layer leans ≤N px toward the pointer, damped, off on touch/reduced motion) ·
               useIdleTick (a beat while on screen and visible) · useCountUp (a figure counts up once when first seen) ·
               useTurntable (drives a ScrubVideo: idle drift, the pointer's x takes over) · useRaceLoop (the speed
               race) · usePrevious (the value at the last committed render, seeded with the current one so nothing
               staggers on mount: ProgressTicks and StageStrip) · useDemoClock (the three demos' one rAF: `{ beat, cycle, state, announce, rootProps }`
               from a `DemoScript`; advances only while ≥30% on screen and the document is visible, React state only
               on a beat/cycle/state flip, pauses on pointer-in or focus-within, ArrowLeft/Right step, Home replays,
               End stills, and reduced motion or a matching `?demo=…` renders the still with no rAF) · useFlipRows
               (the FLIP measure lifted out of OfferComparison, which now imports it, so a re-rank travels 500ms) ·
               reducedMotion helpers
  scenes/      useSceneProgress(ref, onFrame, measure = pinnedSceneProgress), whose default measure is the panel's
               travel under the bar, `sceneProgress(top, height, vh, BAR_H)` · MarketScene (the desk LOOP behind the
               paper, 60%, tablet up, in a `filmParallax` layer that drifts ±3% with scroll; on phones `marketFrame`
               scales the fan by `width/760`, clamps slips to the band, and deals the LOIs as a 2×2 hand:
               `MARKET_WIDE_MIN`, `MARKET_NARROW` in lib/site/scroll.ts; the pin applies only where copy and band fit,
               `tab:scene-pin tall:max-tab:scene-pin`, so a short phone flows with the band after the copy;
               `marketProgress` (scroll.ts) picks the measure by `scenePins`, `activeStep(p, MARKET_STEPS)` the step,
               and every string, letter, slip and LOI it renders comes from lib/site/market/data.ts) · PrivacyScene (the "Who sees what" DEMO, and NOTHING
               pins: a `DemoSection` whose screen (`priv-demo`, `data-level|viewer|preview`) is a `DemoFrame` with
               `privacy/BuyerList` (the four stand-in buyers in reach order, 44px rows) beside the record column,
               where the room loop sits FRAMED at 60% with `object-right`, tablet up, under `CompanyRecord` (opt-in
               `animated` + `banded`), the `priv-level` line "Level n · {stage} · Visible n of 7" and
               `privacy/AccessLogLines` (the latest two, re-keying 40ms apart). Six beats open the record a level at
               a time for a buyer who reached it; resting on a buyer row previews that buyer's own furthest level,
               the competitor's being level 0 with its revocation leading the log. Seven fields from the tablet
               breakpoint, four compact rows under it, `privacyFieldCount(innerWidth)` measured on mount and resize) ·
               StagesScene (framed path film, tablet up; a 460vh tile whose panel pins with
               the one `scene-pin`)
  home/        TermsStrip + ObjectFilm (five framed 1:1 turntable films with `shadow-product`, decorative inside the
               links; `useTurntable` drifts them and the pointer's x steers; `RevealGroup` staggers the cards) ·
               FinancialPrep (the "Financial preparation" DEMO: a `DemoSection` whose screen (`fin-demo`,
               `data-foot`) is a `DemoFrame` over the ledger-glass loop at 35%, holding four `financial/LedgerLine`s
               (label · records · status word · 3px meter · the evidence line once settled), a foot of two
               `KeyValueRow`s — the adjusted-earnings figure `fin-foot` with its caption, and the valuation range —
               and the `fin-used` row. Six beats attach one record at a time and the figure walks $795,200 →
               $822,800 → $832,200 → $845,000, every step computed from `ledgerAt`, never typed; the first figure
               counts up once and the rest arrive where they stand. Resting on a line bands it; resting on the
               family-payroll line once it is settled previews the one alternative the data holds, $817,400 with the
               add-back left in costs) · OfferComparison (rank order by `offerScore`,
               FLIP travel on re-rank, chip hover previews the strongest fit, parallax on the envelopes) ·
               SellerWorkload (the "The whole sale asks four decisions of you." DEMO: a `DemoSection` whose screen (`dec-demo`,
               `data-on-table|lit|preview`) is a `DemoFrame` over the status-board loop at 20%, one column of
               `decisions/StageStrip` (eight 2px rules, `{ lit, current }`; ticks and one "Stage n of 8 · {label}"
               line on phones) · `DecisionLine` (the decision the owner is making, or "Heirloom is working" between
               them) · four `LetterRow`s (`data-state="sealed|on|removed|filtered|winner"`) · `dec-handled` ·
               the priority row · `dec-timing`, the plan's one timing fact, which stands at every beat. Seven beats play the four answers:
               one exclusion strikes the $4.65M competitor, the meeting rule filters the contingent buyer, and the
               priority FLIPs its winner to the top through `useFlipRows`. Resting on a priority word ghost-ranks all
               four letters by `ghostRank`; resting on a face-up row reads the figures the ranking weighs.
               The previews come from `usePreviewHandlers` and the stage cells fold to the ticks plus the stage line
               under the tablet breakpoint in CSS alone (`tab:grid` / `tab:hidden`), so nothing reads matchMedia; the idle
               beat, `useIdleTick` at `DEMO_IDLE_MS` (2400ms), walks a `bg-line-soft` band down the letter rows and
               changes no text) · SpeedSection (`useRaceLoop` race on two tracks with runners and month ticks, count-up 40%, staggered
               steps, and the framed hourglass film SCRUBBED by the race: `seek(frame.traditional)`, fading with the
               tracks) · SealFilm (the close's framed seal film, scrubbed by `revealProgress` as it scrolls into view)
  offer-review/ · how-it-works/ · fees/ · confidentiality/ · buyers/ · who-we-are/ · questions/
  __tests__/   RTL component tests (vitest + jsdom; browser API stand-ins live in vitest.setup.ts; scene-test-utils
               drives pinned scenes against `BAR_H` and holds the one `stubMatchMedia` / `restoreMatchMedia` pair
               every file that answers a media query uses)

lib/site/
  routes.ts        ROUTES · PAGE_META · NAV_GROUPS · MOBILE_NAV_LINKS · FOOTER_GROUPS · SUBNAV (per-page title, section
                   anchors, CTA: what the bar's scrubber, pill and menu read) · ANCHORS · CONTACT (emails, cal.com
                   link). Flat lists list each destination once (unit-tested).
  state/reducer.ts pure reducer for the shared client state (unit-tested); `advisor/open` takes only
                   `ctx.onScorePage`; `hydrate` spreads what it is given, so the shape is guarded before it
  state/persisted.ts one Zod object mirroring exactly what `persistableState` writes (`iq` · `funnel` · `advisor`,
                   every enum read from the questions', chips' and funnel's own tables, `phase` 0..QUESTION_COUNT,
                   `tick` 0..11, `step` 0..ADVISOR_DONE_STEP) and `parsePersistedState(raw)` → state or null, never
                   throwing; `PersistedState = SiteState`, so drift is a compile error. Unknown keys are stripped at
                   every level, which is why a stale `advisor.flow` in an older session's sessionStorage is ignored
                   and never written back; anything invalid falls to `INITIAL_SITE_STATE`, silently
  cn.ts            tailwind-merge configured with the `type-*` ladder as one class group and `pill` · `xs` added to the
                   radius scale (the two radii Tailwind has no name for, so `rounded-md` + `rounded-pill` used to keep
                   both and leave the corner to stylesheet order); unit-tested
  exitiq/          questions.ts (bank + insights) · scoring.ts (scoreExitIq, findings, 90-day plan, text exports)
  advisor/         data.ts · intake.ts (prefill, step logic, briefing text, agenda. The prefill reads the hero funnel,
                   the exitIQ answers and the score page and nothing else; the briefing is six rows, the five questions
                   and the note, and ends there)
  hero/            funnel.ts (stages, chips, copy) · geometry.ts (heroGeometry for the SVG; colours are CSS variables)
  instrument/      level.ts (advisorFieldTarget, the one live level — 0.15 before any answer to 0.85 at five —
                   and FIELD_TEXTURES) · colour.ts (parseHexColour, readFieldColours from the CSS tokens)
  bar.ts           the one bar's pure math and measured widths, so no literal lives only in a class or a test:
                   nextBarState (44 / 16 hysteresis), currentSection, pageProgress, CURRENT_SECTION_OFFSET 24,
                   NAV_WIDTH 366.95, LOCKUP_WIDTH 135.9, WIDEST_CLUSTER 370.31, CLUSTER_RESERVE 490.95,
                   HOME_LOCKUP_FROM 735, CONTEXT_LOCKUP_FROM 970, PHONE_LOCKUP_FROM 236
  market/data.ts   the market scene's copy, its letter, slip and NDA lines, the four LOIs and the four steps, each
                   carrying its own scroll window (`MARKET_STEPS`, read by `activeStep`)
  motion.ts        pure motion math that scroll does not drive: clamp01 and easeOutCubic (their one home; scroll.ts
                   imports them and nothing imports back), FRAME_MS, damp (frame-rate independent), settled,
                   staggerDelay, pointerOffset/pointerUnit, belowFold, countAt, raceFrame/RACE/RACE_FINAL,
                   turntableDrift/turntableElapsedFor
  demo/            the demos' shared kernel: clock.ts (pure, unit-tested: `DemoBeat` · `DemoScript` · `demoDuration` ·
                   `beatIndexAt` / `beatIdAt` / `indexOfBeat` · `stepIndex` · `beatAnnouncement` · `demoFrameAt` /
                   `elapsedForIndex` / `sameDemoFrame` for the play-hold-replay cycle · `demoVisible` ·
                   `demoStillFor(search, script)` for `?demo=still` and `?demo=fin:note` · `beatsPlayedInOrder`, the
                   run the e2e autoplay assertion is built on · `DEMO_HOLD_MS` 8000 · `DEMO_REKEY_MS` 240 ·
                   `DEMO_VISIBLE_RATIO` 0.3 · `DEMO_IDLE_MS` 2400) · chrome.ts (`DEMO_COMPANY` "Project Ridgeline",
                   `WORKED_EXAMPLE`, `demoFrameHeading`, `DEMO_WORD_CAPS` heading 8 / sentence 30, `wordCount` and
                   `overLongDemoWords`, which each section's test holds its own words to)
  financial/       data.ts · demo.ts — the financial demo: every string and figure (Project Ridgeline worked-example
                   figures, fictional, labelled "Worked example" on the screen; the four ledger lines reconcile to
                   $845,000 from `RIDGELINE_BASE` 795,200: revenue $4,262,000 in the books against $4,240,000 on the
                   return, $27,600 of family payroll, $9,400 of personal charges, a $12,800 legal fee) and the pure
                   view: `FINANCIAL_SCRIPT` (six beats at 0 / 1440 / 3060 / 4680 / 6300 / 7740, still `used`), `ledgerAt(beat, leftInCosts)` →
                   `{ lines, foot, usedIn }` with every foot figure summed, never typed, `footLeftInCosts()` = 817,400,
                   `money` · `recordsLine` · `statusWord`
  decisions/       data.ts · demo.ts — the four-decisions demo: every figure computed from the four letters in
                   offers/data.ts (`rankOffers` / `rankOrder` over the letters the rules and the meeting filter leave on
                   the table), the eight stages in content/stages.ts and the two timing notes in content/speed.ts (6 to
                   9 against 3 to 4 months, the only timing facts); `DECISIONS_SCRIPT` (seven beats at 0 / 1800 / 3600 / 5400 / 6750 / 8100 / 9450, still `close`),
                   `boardAt(beat)` → `{ lit, current, decision, letters, onTable, handled, priorities, timing }`,
                   `ghostRank(priority)` for the hover preview, `letterDetail`, and the strip helpers `litStageCount` /
                   `stageState` / `stageLine`; `OWNER_ANSWERS` is the one owner the demo plays
  confidentiality/ data.ts (the six levels, record fields and access log, the stand-in organisations drawn from the
                   access log, `PRIVACY_TITLE`) · demo.ts (`PRIVACY_SCRIPT`, six beats at 0 / 1800 / 3600 / 5400 / 7200 / 9000, still `expired`;
                   `recordAt(beat)` → `{ level, viewer, title, rows, log }` with values read only from
                   `RECORD_FIELDS[i].v[level]` and the count only from `HOME_FIELD_OPEN_AT`, `previewFor(key)` for a
                   buyer row's own furthest level, `visibleCount`, `levelLine`, `logLine`, `privacyFieldCount` 7 or 4
                   at the tablet breakpoint, `privacyLogLimit`)
  offers/ · fees/ · buyers/ · questions/ · content/stages.ts · content/speed.ts · format.ts   page data + pure
                   helpers, and every visitor-read string of the sections that render them: `OFFER_COPY` /
                   `letterTitle` in offers/data.ts with `rankFor` / `closingRisk` in offers/score.ts,
                   `STAGES_SCENE_COPY` in content/stages.ts, and in content/speed.ts `SPEED_COPY` with
                   `SPEED_PERCENT` 40 / `speedPercent` (no figure is parsed back out of a string) and
                   `SPEED_MONTHS` 9 / `SPEED_MONTH_TICKS`
  scroll.ts        scene math, and no data: `BAR_H = 52`, which must equal `--bar-h` (unit-tested);
                   `sceneProgress(top, height, vh, barHeight = 0)` measures the panel under the bar; revealProgress,
                   marketProgress, marketFrame + MARKET_WIDE_MIN/MARKET_NARROW, marketSlipIds, `type MarketStep` +
                   `activeStep(p, steps)`, stageFrame + STAGE_COUNT, filmParallax; pin-or-flow: `scenePins(width,
                   vh)` = tablet up or `vh − BAR_H ≥ TALL_MIN_HEIGHT` (780, the panel budget), flowProgress,
                   MARKET_FLOW, TAB_BREAKPOINT
  mailto.ts        mailto/clipboard/download helpers + form body builders
  inquiry.ts       shared Zod schema + client beacon for /api/inquiry
  __tests__/       Vitest unit tests for every module above

styles/site.css    Tailwind v4 `@theme` tokens: the Heirloom-green design system (palette, contextual surface tokens,
                   Newsreader / IBM Plex Sans type ladder as `type-*` utilities, five radii, the one product shadow, tile rhythm, nav
                   dropdown CSS with the `.nav-dd-row` 40ms stagger, a closed card that takes no pointer and a
                   `.nav-dd[data-closed]` rule last in the block so Escape wins over `:hover` and `:focus-within`, the one-shot `animate-stage-in` / `animate-row-in` state
                   animations and the `.reveal-pending` / `.reveal-in` arrival classes). `:root { --bar-h: 52px }` is the one
                   bar height; ONE `scene-pin` (sticky at `--bar-h`, `100vh` / `100dvh` less the bar); `anchor-target` =
                   `scroll-margin-top: calc(var(--bar-h) + 16px)`
                   (the html has NO `scroll-padding-top`: it would stack with it); `glass-dark` is the bar's one
                   translucent material (`frosted` went with the sub-nav); two custom variants, `tall` (min-height 832 = 780 + 52) and `short`
                   (max-height 889, composition A's measured console bottom 873 + 16 − 1), the `hero-air` / `hero-air-short` utilities after `tile`; `--animate-blink` / `hl-blink` gone.
                   `lib/site/__tests__/site-css.test.ts` pins the animation list so nothing loops but the two hero-graph
                   dashes, the two variants in that order, `--bar-h` and both utilities. `styles/fonts.css` declares the
                   self-hosted Newsreader, IBM Plex Sans, Mona Sans and IBM Plex Mono faces with their metric-matched
                   fallbacks. The legacy stylesheet now lives at `legacy/styles/tailwind.css` and nothing here imports it.
public/brand/      1.png · 3.png (the two stacked lockups Suyash delivered on 2026-09-11, the source of the mark's geometry and the
                   stacked variant's glyphs; the horizontal wordmark is live text since 2026-09-12) ·
                   yc-logo.svg (the home hero's badge) ·
                   README.md (the derivation, the diffs against the PNGs, the ratios, and where the lockup appears)
public/media/      14 films and 14 first-frame posters: the restored original hero film (hero-ambient, not Higgsfield)
                   and the Higgsfield films (five term objects, market-desk-live, ledger-glass, privacy-room,
                   status-board, speed-hourglasses, stages-path, seal-press, archive-hall; fees.png).
                   `archive-hall-poster.jpg` was drawn from the film's first frame by
                   `.screenshots/tools/first-frame.mjs` (Playwright's Chromium; ffmpeg is not installed here).
                   README.md records every prompt, model, and the ffmpeg normalisation.
public/generated/  Higgsfield objects on transparent backgrounds (passport, envelopes) and the three 512px
                   field textures the WebGL instrument blends. All media is optional at runtime (e2e ignores misses).
public/og/         heirloom-og.png, the 1200×630 share card, rendered with Playwright by e2e/tools/og-card.mjs as the served bar
                   lockup magnified 120/28 in a CSS scale (pixel-faithful to the bar; 582px wide; 14,865 bytes, the e2e
                   floor is 10 KB): the lockup
                   in the Heirloom green (#4ca270, the card's own inline `color`, since the clone drops its classes) on
                   the deep-green tile (the brass seal was tried and left out)
public/fonts/           newsreader/ (variable WOFF2 with the opsz axis, upright + italic, OFL; display), ibm-plex-sans/
                   (300/400/500/600/700, OFL; text), mona-sans/ (one variable WOFF2 per subset with the wdth and wght
                   axes, OFL; the wordmark alone, since 2026-09-13) and ibm-plex-mono/ (400/500, for the restored exitIQ
                   console only); no condensed cut (added and removed 2026-09-12); README explains the tokens
e2e/               Playwright: 295 tests in 15 files (590 runs with --repeat-each=2), no sleeps anywhere — neither
                   `waitForTimeout` nor `setTimeout` has a single hit in `e2e/`, every wait is an `expect` or an
                   `expect.poll` on measured state: routes.spec (every route at desktop + phone with console/failed-request hygiene, 404, link
                   crawl, footer, legacy 404s), api.spec (inquiry validation matrix, health + rewrites, sitemap, robots),
                   score.spec (full exitIQ run, edit/restart, download, cal.com popup via page.route; the card header has
                   no dot), offer-review.spec (all three modes), advisor.spec (five-question briefing, note, email,
                   prefill from /score and hero), navigation.spec (every bar/footer/card link, anchors landing under the
                   bar, back/forward), mobile.spec (390 + 320: menu, no horizontal scroll, the market scene's pin-or-flow
                   by `vp.height − BAR_H ≥ TALL_MIN_HEIGHT`, stage panel fit, dialog fit), accessibility.spec
                   (h1/landmarks, names, labels, tab order starting at "Skip to content", the context-page order For buyers →
                   the scrubber → its sections → the advisor entry → the page pill at landing and once scrolled, focus
                   trap + return), home.spec, pages.spec, bar.spec (the flip points by stepping 1px, both materials, the
                   52px surface on every route in both states with main starting at 52, the lockup/mark rules (the mark
                   on context pages in both states, the groups never moving at the flip, /why's widest reading inside
                   the lock), the scrubber and the pill from landing (title at landing, title · section once current,
                   the menu's links landing under the bar with `aria-current`, the advisor entry on anchor-CTA pages),
                   anchors below the bar, one filled pill, the menu, a dropdown link's navigation leaving no card behind
                   and Escape closing the card the keyboard opened with the focus kept on its trigger), hero-fold.spec (six desktop viewports
                   incl. 1440×788 and 1536×729, composition B at 889 and A at 890, the CTA row's two pills and tertiary
                   text link (its 44 × 225.97 box, its accent, and nothing of the button grammar), the buyers link
                   inside the fold at every viewport, the console's top ≥ 120px above it, the headline's line count by
                   composition (3, or 2 in B), every gap = base + air (the
                   desktop rhythm above the nav breakpoint, the phone one under it), the tile's bottom ≥ viewport + 79,
                   the link on its own centred line on phones), demo-financial.spec, demo-privacy.spec,
                   demo-decisions.spec (each: the autoplay order and the replay, the pointer's pause on a playing
                   screen, the hover preview, the keyboard's step and its announcement, the still URL, and 390 / 320
                   fit; reduced motion is asserted once for the whole page, in home.spec's sweep). helpers.ts: `expectPinned(page,
                   id)` asserts the panel's top at `BAR_H` ±1, `scrollScene` measures with the bar formula,
                   `expectAnchorLanding(page, hash)` / `expectAnchorTarget(page, href)` require the anchor's top at
                   `BAR_H + 16` ±1 (only "under the bar" where the page cannot scroll that far), and every in-page
                   anchor on the site lands at exactly 68,
                   `openAdvisorFromHeader` knows the pill, the scrubber entry and the menu, `briefingRow` reads a
                   briefing value, and the demos are driven by `demoUrl(path, still?)` (`?demo=still` freezes every
                   demo, `?demo=fin:note` one beat of one), `expectAutoplay(page, testid, beatIds)` (a MutationObserver
                   records the beats, so one passing between polls is still seen, and `beatsPlayedInOrder` from
                   lib/site/demo/clock.ts decides the run), `expectReplay` and `stepDemo(page,
                   testid, beatId)`. Two facts every home-page assertion respects: `ROW_IN` travels 6px, which Chromium
                   keeps in the scrollable-overflow region afterwards (so fit is asserted as "no element computes
                   overflow auto/scroll and no child box sticks out of its frame", not `scrollWidth <= clientWidth`),
                   and `document.getAnimations()` never settles on the full home page (the hero graph loops), so a wait
                   is scoped to the section's own tile
```

Conventions for the site (the design system, September 2026 redesign):

- **Tokens only.** Every colour, radius, shadow, and type style comes from `styles/site.css`
  (`@theme`). No raw hex/rgba, no gradients, no arbitrary `rounded-[…]`, `text-[Npx]`, or
  `tracking-[…]` in components. `components/site/__tests__/DesignSystem.test.ts` scans `app/` and
  `components/site/` and fails on any of these, on `font-mono`/`font-medium` (the weight ladder is
  300 / 400 / 600 / 700), on CSS `uppercase`, and on any retired token name; it runs the same rules
  against a fixture written to break every one of them, the positive control that proves the guard can
  still fail.
  **One exemption:** the restored exitIQ console, exactly six files (`components/site/hero/HeroConsole.tsx`,
  `HeroGraph.tsx`, `components/site/exitiq/ExitIqRun.tsx`, `ExitIqQuestion.tsx`, `ConsoleChrome.tsx`,
  `useConsoleField.ts`; `ExitIqActions.tsx` and `ReviewWithAdvisor.tsx` are scanned), which the user asked to
  bring back faithfully from the first build on 2026-09-11. Those files open with the marker comment `// legacy exitIQ console: …`, keep the first
  build's tokens (`d1…d4`, `dfull`, `dhair`, `filament`, `signal`, `cta`, `ground`, the `eyebrow` and
  `hover-green-dark` utilities, IBM Plex Mono) declared in the "legacy exitIQ console" block of
  `styles/site.css`, and are skipped by the guard, which also asserts that exactly those files carry the
  marker. Both card roots carry `console-legacy`, which scopes the first build's focus ring, pretty
  headings and filament link hover to them; the console sits in a 1132px lock and the /score card in a
  1180px lock, the first build's widths. The only look change since the restoration is the card header's
  live dot, removed on 2026-09-11 at the user's request (fix 5): the header now reads the mono label and the
  ticks alone, and `ConsoleChrome` no longer exports a dot. Nothing else may use the legacy set.
- **Palette.** One accent: `primary` #0f7a45 (Heirloom action green) with `primary-focus` and
  `primary-on-dark` #4ce27e; beside it the brand lockup's own pair, `heirloom` #0f7a45 and
  `heirloom-on-dark` #4ca270 (muted on 2026-09-17 from the first #35b96c, judged too bright), which `.on-dark`
  and `.on-light` remap the way they remap `primary`, used by
  nothing but the mark and the word Heirloom. Ink `ink` #0e241b; light canvases `canvas` / `canvas-parchment` /
  `surface-pearl`; deep-green tiles `tile-1` / `tile-2` / `tile-3`; `surface-black` is the bar (opaque at
  landing, `glass-dark` at 78% once condensed).
  Components use the **contextual tokens** `text-fg` / `text-fg-2` / `text-fg-3`, `text-accent`,
  `border-line` / `border-line-soft`, `bg-surface` / `bg-surface-2`, `text-error`; a dark `Tile` adds
  `on-dark`, which re-points them (including `bg-primary` / `text-on-primary`, so a filled pill on a
  dark tile is the bright green with deep-green text), so components never carry light/dark variants.
- **Type.** The faces the site launched with: Newsreader for display (`--font-display`, weight 400 on every
  display step) and IBM Plex Sans for text (`--font-text`), self-hosted from `public/fonts/` (see its README);
  metric-matched Times New Roman / Arial fallback faces keep the swap from reflowing, then the system stacks;
  the ladder's tracking is in `em`. The user asked for these back on 2026-09-11 after a day in Plus Jakarta
  Sans. A third face, Mona Sans (`--font-brand`: GitHub's OFL grotesk, self-hosted as the variable file with its
  width and weight axes), is used only by the brand's wordmark through the sizeless `type-brand` utility (weight 450,
  width 90 through `font-stretch`, line-height 1, no tracking, no shift; the size comes inline at 0.9821 of the mark's
  height, 27.5px in the bar), never for copy. Sizes come only from the ladder
  utilities `type-hero` (56) · `type-display-lg` (40) · `type-display-md` (34) · `type-lead` (28) ·
  `type-lead-airy` (24/300) · `type-tagline` (21) · `type-body-strong` · `type-body` (17, the default)
  · `type-dense-link` · `type-caption` / `type-caption-strong` (14) ·
  `type-fine-print` (12) · `type-micro-legal` (10) · `type-nav-link` (12).
  Numbers use `tabular`. The hero's short composition adds no rung: under `short:nav:` the headline steps
  to `type-display-lg` and the lead to `type-tagline`.
- **Layout.** Pages are stacks of full-bleed `<Tile tone=light|parchment|dark|dark-3>`
  (80px vertical padding, 48px on phones, no radius, no border, no shadow): the colour change is the
  divider, and light and dark tiles alternate. Content sits in `<Container size=text|default>`
  (692 / 980). Cards are `<Card>` (surface, 1px hairline, 18px radius, 24px padding).
  Grids that stack on phones use `minmax(min(100%,Npx),1fr)`.
- **Chrome.** `SiteBar` is the one sticky bar on every route (see the tree): a 52px flow box that never
  changes height, a 52px surface on every route in both states, an alpha-only material change (opaque
  surface-black at landing, glass-dark with a hairline from scrollY 44, back at 16), the brand 24px from the left edge and the action cluster 24px from the right with the
  primary navigation centred on the viewport, and the brand yielding to the mark where the side columns cannot
  hold the lockup (desktop context pages under 970px, and phones carrying a pill; home holds it at every desktop
  width and a phone with no pill holds it from 236px, so neither carries a width rule).
  Page context (`SUBNAV` in `lib/site/routes.ts`: title, section anchors whose `href`s match ids carrying
  `anchor-target`, one CTA) lives in the bar's scrubber and page pill in both states on desktops; phones
  reach the sections from the menu. At most one filled pill is visible in the bar at a time, and the
  advisor dialog is reachable from the bar on every page at every width (pill, scrubber entry, or menu
  entry). Every pinned scene pins with `scene-pin` at `--bar-h`; every anchor lands 16px below it through
  `anchor-target`, and the html carries NO `scroll-padding-top`, which would stack with that margin. The
  bar carries no margin: the page starts at 52px on every route.
  SiteHeader, SubNav, `scene-pin-under-nav`, `--globalnav-h`, `--subnav-h` and the e2e `SUBNAV_HEIGHT` were retired with it.
- **Buttons and links.** `<Button variant=primary|secondary|pearl|icon size=md|compact|nav>`
  (`nav` is 26px and only for the bar's desktop pills; `compact` is the 14px card-level pill that keeps
  the 44px touch target); `<Chip selected>` (exports `CHIP_SELECTED` / `CHIP_IDLE` for other selectable
  cells); `<TextLink standalone>` (accent, underline on hover; `standalone` gives an action-row link its
  44px hit area) and `<TextButton>` (its button form, always standalone: every caller is an action row). Every control presses to
  95% (`pressable`); filled buttons keep their text colour on hover; nothing glows or lifts. Touch
  targets are 44px; the exceptions are `size="nav"` pills (only in the bar, from 834px up), the bar's phone
  pill (a 34px visual pill inside a 44px hit box), the advisor dialog's 32px close (`variant="icon"`
  `size="compact"`, its only caller) and the legacy exitIQ console's own pills and chips, which
  keep the first build's 38–42px (its advisor pill is merged to 44).
  The single shadow, `shadow-product`, is reserved for imagery resting on a surface (photographs, the
  framed films and generated objects: the seal film, the passport and envelope figures); the legacy console
  and card carry the first build's own shadow. Merge classes with `cn` from `lib/site/cn.ts`, which knows the
  `type-*` utilities conflict (plain `twMerge` does not). `<Card>` exports `CARD_CLASS` / `CARD_PADDING`
  for controls that must be a card themselves; `<Eyebrow as tone>` and `<KeyValueRow valueClassName>`
  cover header captions and row lists.
- **No tells.** No pulsing dots, no "LIVE" labels, no fake status indicators, no sparkle icons anywhere:
  the user reads them as the tell of AI-generated design. Status is a word; liveness is a row highlight,
  a meter, a check. The dot primitives and the blink keyframes are gone, and the site-css test fails on
  any `blink`.
- Every `"use client"` file carries a one-line justification; page data lives in `lib/site/**` and
  components render it; every form opens the visitor's mail client **and** beacons `/api/inquiry`,
  and shows sending, success, and error copy. `copyText` (mailto.ts) resolves a boolean and never rejects,
  so every copy site READS it and shows its failure sentence when it is false — nothing
  tells a visitor the summary was copied when it was not — and the two timer forms (OfferIntake, AskForm)
  start the write in the click's own task, which is the only task WebKit allows it in.
  `AmbientVideo` degrades silently (missing media,
  reduced motion). `NEXT_PUBLIC_SITE_URL` (optional) sets `metadataBase`, sitemap, and robots origins.
- **Motion (September 2026, phase 3: the living home page).** The home hero is the one light tile with a film:
  the site's original ambient film (`hero-ambient.mp4`, a paper-toned tabletop model with glass blocks and green
  paths, transcoded from HEVC and looped as a ping-pong) at `opacity-60` in a layer that leans toward the
  pointer, behind `relative` content columns, with its poster under reduced motion. The user asked for this
  film back on 2026-09-11 in place of the Higgsfield caustics, and for no Higgsfield generation for the hero; an
  earlier 20% caustics version had read as a white block, so the film must stay clearly visible while the copy
  stays legible. Environment films the user asked to move continuously LOOP through `AmbientVideo` (the desk under the
  market paper, the room framed beside the privacy record, the two interface materials inside the dark consoles);
  films a loop in code can drive are scrubbed by `ScrubVideo`: the close's `SealFilm` by `revealProgress`, the
  how-it-works path by scene progress, the five term objects by `useTurntable` (idle drift plus the pointer's x),
  the speed hourglasses by the race itself. Films sit either behind copy at reduced opacity on a dark surface
  (30–60%; the review measured 45% under body copy as failing, so nothing with copy over lit areas) or inside a
  frame on the side away from the copy (`rounded-lg`); never under body text at full strength. A film that must
  visibly change is storyboarded (a GPT Image 2 start and end frame, Seedance between them) rather than prompted
  from one still, which twice returned a near-still (`public/media/README.md`). Apple's grammar for state: panels and rows arrive once
  (`animate-stage-in` / `animate-row-in`, re-keyed on change), reveals arrive once with ≤60ms stagger
  (`useReveal`), figures count up once (`useCountUp`); WisprFlow's grammar for rest: instruments keep an idle beat
  (`useIdleTick`), the speed race runs while on screen (`useRaceLoop`), and hover previews consequences (offer
  chips, the briefing cursor). **The three home demos (phase 5, 2026-09-16)** follow one grammar, and it is a
  demo's grammar, not a form's: each is a few words beside the software's screen, which PLAYS ITSELF once it is
  ≥30% on screen — six or seven beats over 7.74 to 9.45 seconds, each beat changing exactly one thing — then HOLDS
  its end state for `DEMO_HOLD_MS` (8s), during which an idle band walks its rows and no text changes, and then
  SOFTLY REPLAYS (`data-cycle` rises; on a replay nothing re-staggers from nothing, values cross-fade where they
  stand over `REKEY`'s 240ms, so the frame and the words never jump). The visitor need do nothing. A POINTER
  INSIDE the screen, or focus within it, pauses the clock and may preview one consequence (the ledger's $817,400
  with the add-back left in costs, the competitor's empty record, the ranking a different priority would give);
  leaving resumes with no timer, and where hover is unavailable a tap previews and a second tap releases. The
  KEYBOARD steps it: the root is one `role="group"` tab stop, ArrowLeft/Right step and pause, Home replays, End
  stills, and only a keyboard step speaks, in the section's own polite live region. Scroll never drives a demo and
  none of them pins. REDUCED MOTION, and the `?demo=…` FREEZE the e2e suite uses, render the still with no rAF at
  all (`data-demo-state="still"`), every figure in place and posters instead of films, with the previews still
  working. Every figure comes from `lib/site/**` through one `*At(beat)` function; no digit is typed into a
  component, and `useCountUp` runs only on a screen's first-sight figure (changed figures arrive, they never
  count). There are no chips, no Continue, no Back, no summary and no advisor call to action inside a demo: the
  bar's pill is the way to an advisor. The bar's
  landing→scrolled change is one staged transition (rows leave over 0.24s, the material over 0.3s, alpha only)
  with hysteresis, condensing at 44px and expanding at 16px, so a bounce at the top never flickers it; a page
  opened scrolled starts condensed without animating. The lockup's mark-in runs once per page load, on the bar's
  lockup only. Pointer effects (`usePointerParallax`, the field's lens, the turntables) switch off
  on touch, on hover-less devices, and under reduced motion; continuous values are written to the DOM from one rAF
  per section, never React state per frame. Every film ships a first-frame poster (`<name>-poster.jpg`), which is
  what reduced-motion visitors see; all 14 have one. A missing or failing film removes its element and the DOM
  choreography stands alone. The WebGL
  `InstrumentField` is an instrument, not a backdrop: since the console restoration it lives only in the
  advisor dialog's strip, its level is a pure function of the visitor's answers
  (`advisorFieldTarget` in `lib/site/instrument/level.ts`, the module's one level function since the hero's and
  the run's went with the console restoration), it pulses once per answer, reads its three colours from the CSS tokens,
  mixes toward `tile-1` so it never approaches the brightness of copy, and renders nothing without WebGL.
  The legacy console and card paint the first build's fractal field (`useConsoleField`) on their own canvas. Generated imagery may contain gradients; the DOM
  may not. The one-shot mark reveal (`animate-mark-in`) and the hero graph's dashed rings are the only looping
  or one-shot CSS animations besides `stage-in` / `row-in` (the legacy console's live-dot blink went with the
  dot); all switch off under `motion-reduce`. Generated objects rest inside a framed
  surface (`rounded-lg` + `shadow-product`), which is how a transparent PNG earns the product shadow.
  Playwright's bundled Chromium plays H.264 here, so the e2e suite can assert on the films directly. Below the
  tablet breakpoint the films step aside where they cannot earn their space: the market scene folds inactive
  step bodies (`hidden tab:block`) instead of scrolling inside the pin, every demo frame's film is
  `hidden tab:block` and the privacy record drops to four compact rows and one log line, the advisor dialog's
  instrument strip is `hidden tab:block`, the
  market scene pins only where it fits (`tab:scene-pin tall:max-tab:scene-pin`, otherwise it flows with a
  viewport-anchored progress window; MarketScene is the home page's only pin, and no demo pins), and
  the stages scene shows its poster as a still only on tall phones through the `tall:` custom variant
  (`@custom-variant tall (@media (min-height: 832px))`, the 780px panel budget plus the 52px bar, stacked as
  `tall:max-tab:` because custom variants outrank the breakpoint variants; the `short` variant at 889px serves
  only the hero). Without WebGL the advisor strip shows the calm field texture as a static
  `next/image` stand-in beneath the canvas; the legacy console's canvas simply stays dark.

Verification: `pnpm typecheck` · `pnpm lint` · `pnpm prettier` · `pnpm test` (Vitest over the whole repository, the
site suites and the legacy / DealIQ files together: 1,923 tests in 94 files, of which the two DB integration files
and their 15 tests are skipped without `RUN_DB_INTEGRATION_TESTS`) · `pnpm test:site` (the
site run, and site-only since its `include` is assigned after the merge: 1,537 tests in 67 files, with coverage gates
of 97% lines/statements and 95% branches/functions over app/, components/site/, lib/site/ — raise,
never lower; 2026-09-17: 100% lines/statements, 98.68% branches, 100% functions) · `pnpm build` · `npx playwright test --project=chromium --repeat-each=2` against `pnpm start`
(Playwright: 295 tests, 590 runs; retries are 0 locally so flakes surface; set `PLAYWRIGHT_BASE_URL` to point the
suite at another port). The chromium project
launches with `--ignore-gpu-blocklist --enable-unsafe-swiftshader` so headless Chromium has WebGL and the
instrument field's `data-live` mark can be asserted. Before rebuilding, stop any server by port (the Next
server renames itself `next-server`, so `pkill -f "next start"` only kills the wrapper and leaves it serving the
old HTML against new CSS hashes): `for p in $(lsof -tnP -iTCP:3000 -sTCP:LISTEN); do kill $p; done`, then
`rm -rf .next` (a `next dev` writing to `.next` corrupts a fresh build with a missing `[turbopack]_runtime.js`).
Run the screenshot pass before Playwright on a fresh build: it warms Next's image-optimizer cache. On a cold
cache, a test that navigates away while `/_next/image?…fees.png&w=640` is still optimising leaves the coalesced
variant pending for later pages in the same server, and `page.goto("/fees")` then times out waiting for `load`.
Run the gate on an idle machine: three agents building at once drive the load average past 100 and Playwright's
rAF-dependent tests time out. Build slots outside the repo (`rsync` without node_modules plus a symlinked
node_modules) let an agent serve its own copy without touching `.next`.

Test rigor rules (all site tests follow them): every `it` asserts a concrete value (exact text, href, number,
or the class that _is_ the behaviour); unhappy paths and boundaries are covered; time-based behaviour uses fake
timers; no snapshots, no "renders without crashing", no sleeps in e2e. No expectation is computed by the code under
test, and no assertion that cannot fail (the audit of 2026-09-17 removed ≈ 150 unit tests and 129 e2e tests of that
kind and rewrote the weak ones to literals). Scene components are driven in jsdom via
`components/site/__tests__/scene-test-utils.ts`, which also holds the one matchMedia stub; seeded site state via
`renderWithSeededSite` in `test-utils.tsx`.

---

Read this at the start of every session. It is the single source of truth for the stack,
architecture boundaries, conventions, and the engineering standards this codebase holds itself to.
When the code and this document disagree, trust the code and fix this document.

---

## What this project is

**Scorta** is an AI-native broker for sub-$2M Main Street businesses — underwriter, prep shop, and
broker-of-record run by a coordinated fleet of specialized agents (Ingestion, Recast,
Owner-Dependency, Concentration, Case Manager / CASE, Boardroom, CIM, VDR, Lender Ops, Outreach)
with humans on the approval and relationship layer.

The codebase began as **exitIQ** — the public Exit IQ Assessment (stage 1 + email gate are live;
stages 2–4 are schema-ready but not yet wired into the live flow). That assessment plus the GAP
report it generates is the kept foundation. Current build direction (see `plans/`) is
**brokerage-first**: build the full broker workflow — CIM generation, marketplace listings, buyer
qualification, LOI drafting, data room — as agent surfaces, while the seller relationship stays
human-in-the-loop.

Engineering reality to keep in mind: much of the authenticated `(app)` workspace currently renders
against a **single locked mock persona** (`lib/persona.ts`) rather than live per-user data. That is
acceptable scaffolding, but it is _debt_, not a standard. New work should move data flows toward
real, per-session/per-user data wherever feasible, and must not deepen the mock coupling without a
reason.

Build plans live in [`plans/`](../plans):

- `plans/Scorta Brokerage Build.md` — strategic pivot + broker responsibility map
- `plans/Phase 1 — Intake & Valuation.md`, `Phase 2 — Listing Preparation.md`, `Phase 3 — Buyer Outreach & Qualification.md`

**DealIQ (buy-side, in progress).** A standalone buyer application under `lib/dealiq/` +
`components/dealiq/` + `app/(dealiq)/` — separate IA, separate sign-in, _no_ product switcher and no
link from the seller workspace into it. Three documents, read in this order:

- `plans/DealIQ — Product Boundary & Data Flow.md` — what DealIQ is and where its edges are
- `plans/DealIQ — Execution Plan.md` — the 14 build items, the data seam (§1), and the settled
  architecture decisions (§2). **Do not relitigate §2 mid-build.**
- `plans/DealIQ — Build Log.md` — **running decision record.** Standing decisions that bind later
  items, engine semantics, repo gotchas, and per-item status. Read it before starting any DealIQ
  item, and append to it when you finish one.

Two DealIQ rules worth stating here because they are easy to break by habit: nothing under
`lib/dealiq/` may import anything outside `lib/dealiq/` (enforced by a test), and no business fact
may appear in a component — all content lives in `lib/dealiq/data/` behind a placeholder banner.

---

## Engineering standards (non-negotiable)

These apply to all new and modified code. They replace the prior "demo sprint / happy-path-only" rules.

1. **The build stays green.** `pnpm typecheck` and `pnpm lint` must pass. No type errors, no
   `@ts-ignore` without a one-line justification, no dead routes, no console errors in normal flows.
2. **Type safety is real.** TypeScript is strict with `noUncheckedIndexedAccess`. No `any` to silence
   the compiler — model the type. Validate all external input (request bodies, params, env) with Zod.
3. **Handle the unhappy path.** Route handlers and server actions must handle invalid input, missing
   rows, and upstream failures with explicit status codes and structured logs — not crashes. Client
   surfaces need loading **and** error states. (Existing demo code may not; new code must.)
4. **Respect the architecture boundaries** below (env surface, server-only DB, no upward imports,
   `@/*` alias). Breaking these creates cascading bugs.
5. **Tests for logic.** Pure logic in `lib/` (scoring, segmentation, SBA, transforms) is unit-tested
   with Vitest. DB schema/RLS behavior has integration tests. Add/extend tests when you touch this logic.
6. **Migrations are append-only and ship with their RLS.** Never edit an applied migration; generate a
   new one. Any new user-data table ships its RLS policies in the _same_ migration.
7. **No secrets in code or logs.** Read config only through `@/env.mjs`. Redact PII before tracing.
8. **Small, reviewable changes.** Match existing file conventions. Don't reformat unrelated code or
   introduce new libraries/palettes/AI providers without cause.

A related but separate document, [`AGENTS.md`](../AGENTS.md) at the repo root, is the **read-only PR
review contract** (server/client/hooks/bundle/design-token/a11y rules). Treat its rules as the target
state for frontend code; note that the current inline-style station UI predates several of them.

---

## Stack (verified from `package.json`)

| Layer           | Choice                                                                                                                                          | Pin                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Framework       | Next.js 15 App Router (RSC-first)                                                                                                               | `next@15.5.10`                          |
| Dev bundler     | Turbopack (`next dev --turbo`)                                                                                                                  | —                                       |
| Language        | TypeScript strict, `noUncheckedIndexedAccess`                                                                                                   | `typescript@^5.9`                       |
| Runtime         | React 19                                                                                                                                        | `react@^19.2.4`                         |
| Styling         | Tailwind CSS v4 (`@tailwindcss/postcss`) + CSS-variable design tokens in `styles/tailwind.css`                                                  | `tailwindcss@^4.2`                      |
| Primitives      | Radix UI (accordion, dialog, dropdown, popover, select, slider, switch, tabs, tooltip, checkbox, radio, scroll-area, toggle-group, label, form) | `@radix-ui/*`                           |
| Variants        | CVA + `tailwind-merge`                                                                                                                          | `class-variance-authority@^0.7`         |
| Package manager | **pnpm** (node ≥ 20) — never `npm`/`yarn`                                                                                                       | `pnpm@10.0.0`                           |
| ORM             | Drizzle ORM + postgres.js                                                                                                                       | `drizzle-orm@^0.45`, `postgres@^3.4`    |
| DB              | Supabase Postgres — transaction pooler at runtime                                                                                               | —                                       |
| Auth            | Supabase Auth via `@supabase/ssr` (publishable key, cookie sessions)                                                                            | `@supabase/ssr@^0.10`                   |
| Env             | `@t3-oss/env-nextjs` via `env.mjs` (single surface)                                                                                             | `@t3-oss/env-nextjs@^0.13`              |
| AI              | AI SDK v6 + `@ai-sdk/anthropic` (direct provider — **not** AI Gateway)                                                                          | `ai@^6.0`, `@ai-sdk/anthropic@^3.0`     |
| AI models       | `claude-sonnet-4-6` (reports), `claude-haiku-4-5-20251001` (fast paths) — constants in `lib/ai/index.ts`                                        | —                                       |
| Email           | Resend (no-op until `RESEND_API_KEY` set)                                                                                                       | `resend@^6.12`                          |
| Validation      | Zod                                                                                                                                             | `zod@^3.24`                             |
| Observability   | `@vercel/otel` + structured logger (`lib/logger.ts`)                                                                                            | `@vercel/otel@^1.12`                    |
| Testing         | Vitest + RTL + Playwright                                                                                                                       | `vitest@^3.2`, `@playwright/test@^1.58` |
| Stories         | Storybook 8                                                                                                                                     | `storybook@^8.6`                        |

**Do not introduce a new color palette, component library, or AI provider.** Inherit what's in place.

---

## Environment Variables — `env.mjs` is the ONLY surface

**Never read `process.env` directly in application code.** The single exception is
`lib/debug/workflow-trace.ts`, which reads `EXITIQ_WORKFLOW_LOG` and `VERCEL` directly by design, to
stay outside the t3-env server guard so it can run from edge-bundled helpers and tests.

```ts
import { env } from "@/env.mjs"
// ✅ env.DATABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL, …
// ❌ process.env.DATABASE_URL
```

| Variable                                                  | Scope            | Purpose                                                                                                                      |
| --------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                            | server           | Postgres — **transaction pooler (6543)** at runtime; session pooler (5432) only for local `drizzle-kit`                      |
| `SUPABASE_URL`                                            | server           | Project URL — declared, not currently consumed by runtime code                                                               |
| `SUPABASE_SERVICE_SECRET_KEY`                             | server           | Service-role key — **only** used in the RLS integration test. No runtime code uses it; don't add service-role calls casually |
| `NEXT_PUBLIC_SUPABASE_URL`                                | client           | Used by browser + server Supabase clients                                                                                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                    | client           | Used by browser + server Supabase clients (server uses publishable + cookies, **not** the service key)                       |
| `ANTHROPIC_API_KEY`                                       | server           | Consumed in `lib/ai/index.ts`                                                                                                |
| `RESEND_API_KEY`                                          | server, optional | When missing, `lib/email/index.ts` is a no-op                                                                                |
| `EXITIQ_WORKFLOW_LOG` / `NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG` | both             | NDJSON workflow tracing to `.exitiq-debug/` (local dev only; auto-off on Vercel)                                             |
| `ANALYZE`                                                 | server           | Toggles `@next/bundle-analyzer` in `next.config.ts`                                                                          |
| `SKIP_ENV_VALIDATION`                                     | special          | Bypasses `createEnv` validation in CI / lint envs without creds                                                              |

`.env.local.example` is the canonical template. When you add/remove a variable, update **both**
`env.mjs` and `.env.local.example`.

**`prepare: false` in `lib/db/index.ts` is mandatory** — `DATABASE_URL` is the transaction-mode pooler
(PgBouncer in transaction mode doesn't support prepared statements). Never remove it.

---

## Architecture Boundaries (hard rules)

### 1. Import alias `@/*` → repo root

```ts
import { env } from "@/env.mjs"
import { db } from "@/lib/db"
```

No relative `../../` imports for repo-internal modules.

### 2. Database access is server-only

`lib/db/index.ts` exports a module-level `db` singleton (one `postgres()` client reused across
requests). Import it **only** in Route Handlers (`app/api/**/route.ts`), Server Actions
(`"use server"`), or server-only utility modules. **Never** import `db` from a Client Component.

### 3. Supabase client split (`lib/supabase/`)

| Client     | File                                                           | Use                                     |
| ---------- | -------------------------------------------------------------- | --------------------------------------- |
| Browser    | `client.ts` (`createBrowserClient`)                            | Client Components, browser-side auth    |
| Server     | `server.ts` (`createServerClient` + `next/headers` cookies)    | Server Components, Route Handlers       |
| Middleware | `middleware.ts` (`createServerClient` + `NextRequest` cookies) | session refresh in root `middleware.ts` |

All three use the **publishable** key. RLS gatekeeps the `anon` role; Drizzle bypasses RLS via the
direct `DATABASE_URL` connection. The root [`middleware.ts`](../middleware.ts) calls
`supabase.auth.getUser()` on every non-static request to keep server-component auth state fresh.

### 4. Module layering (no upward imports)

```
app/          (pages, layouts, route handlers, server actions)
  └── components/   (UI; must not import db)
  └── lib/          (assessment, ai, supabase, db, email, debug, exitiq, persona, logger)
        └── env.mjs (sole env surface)
```

A module in `lib/` must not import from `app/`. UI components must not import `db`.

---

## Routes & API contract (legacy — now under `legacy/app/`)

```
legacy/app/
  page.tsx                         → components/scorta/LandingPage   (marketing)
  about/page.tsx                   → components/scorta/AboutPage
  login/page.tsx                   → components/scorta/LoginPanel     (redirects to /dashboard if signed in)
  report/[sessionId]/page.tsx      → assessment report page
  (app)/                           authenticated seller workspace
    layout.tsx                     → guards via supabase.auth.getUser() → redirect("/login"); wraps AppShell
    dashboard/page.tsx             → SellerHome           (Station 02 — Case Manager)
    connect/page.tsx               → ConnectStation       (Platform Connectors — Ingestion)
    ingestion/page.tsx             → IngestionStation      (Data Processing — Ingestion)
    recast/page.tsx                → RecastStation         (Financials Recast — Recast · Boardroom)
    risk/page.tsx                  → RiskStation           (Owner-Dependency · Concentration)
    boardroom/page.tsx             → BoardroomStation      (dispatches the agent fleet)
    score/page.tsx                 → Scorta Score          (Case Manager)
    documents/page.tsx             → DocumentsStation      (CIM & Docs — CIM Agent)
    vdr/page.tsx                   → VDRStation            (Virtual Data Room)
    lenders/page.tsx               → LendersStation        (Lender Outreach — Lender Ops)
    buyers/page.tsx                → BuyersStation         (Buyer Outreach — Outreach)
    upload/page.tsx                → UploadStation
    case/page.tsx                  → CaseChatPage          (CASE conversation)
  api/
    health/route.ts                          GET    liveness probe
    waitlist/route.ts                        POST   waitlist signup
    assessment/session/route.ts              POST   upsert session (one route, all stages)
    assessment/session/[session_id]/route.ts GET    read session row
    assessment/generate/route.ts             POST   stream Sonnet report (text/plain)
    assessment/report/[session_id]/route.ts  GET    read cached report markdown
    debug/workflow-trace/route.ts            POST   client → server trace event sink
```

`next.config.ts` rewrites `/healthz`, `/api/healthz`, `/health`, `/ping` → `/api/health`.
The station rail / order / lock state is defined by `STATIONS` in `lib/persona.ts`. None of these legacy routes are served by the deployed app; the root `middleware.ts` that guarded them now lives at `legacy/middleware.ts`.

### Assessment data flow

1. Client persists stage answers to `localStorage` (in-session source of truth) via `lib/assessment/session.ts`.
2. Client `POST`s a `SessionPatch` to `/api/assessment/session` (`lib/assessment/api.ts`).
3. Server validates with Zod, computes `score` + `sbaEligible` only when `completedAt` is present, and
   returns `200` **before** the DB write completes — the write runs in `after()`.
4. Client `POST`s `/api/assessment/generate`, which streams Sonnet output and persists the final
   markdown in another `after()` callback.

**Known race (deliberate):** `/generate` can be called before the session upsert from step 3 finishes
(the upsert runs in `after()` after the 200). In that case the route returns `404 not_found` — see the
`traceEvent("api.generate.session_not_found", …)` block in
[`app/api/assessment/generate/route.ts`](../app/api/assessment/generate/route.ts) and the
`api.session.http_200_sent_before_after` trace in `session/route.ts`. Do **not** "fix" this by removing
`after()` without coordinating — it's an intentional latency/UX tradeoff.

### Stage data — JSONB everywhere

`assessment_sessions` stores `stage1`, `gate`, `stage2`, `stage3`, `stage4` as JSONB. Per-stage Zod
schemas live in `app/api/assessment/session/route.ts`; TS types in `lib/assessment/session.ts`
(`Stage1Answers`…`Stage4Answers`, `GateAnswers`). Adding a stage field means updating **both** the Zod
schema and the TS interface.

### Naming quirk

`SegmentTag` was renamed to `leadQuality` in TypeScript, but the DB column stays `segment_tag`
(`.$type<SegmentTag>()` on the Drizzle column — see [`lib/db/schema/assessments.ts`](../lib/db/schema/assessments.ts):23).
No migration is needed for this rename; preserve the column name.

---

## Database

### Schema (`lib/db/schema/`) — three tables, all RLS-enabled

| Table                 | Purpose                | Notable columns                                                                                            |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `assessment_sessions` | One row per assessment | `session_id` (text, unique), stage1-4 + gate JSONB, `segment_tag`, `score`, `sba_eligible`, `completed_at` |
| `assessment_reports`  | One report per session | `session_id` (FK, unique), `report_md`, `model_used`, `generation_ms`                                      |
| `waitlist`            | Email capture          | `email` (unique), `role`, `source`                                                                         |

### RLS posture (public, anon role only)

- `anon_insert_sessions`, `anon_insert_reports`, `anon_insert_waitlist` — anon can INSERT.
- Anon SELECT/UPDATE on assessment tables were **dropped** in `0001_drop_anon_rw_policies.sql`. All
  reads route through API routes using the Drizzle `DATABASE_URL` connection (which bypasses RLS).
- **Any new user-data table must ship its RLS policies in the same migration.**

### Migrations (`lib/db/migrations/`)

```
0000_colossal_gravity.sql               initial schema + RLS
0001_drop_anon_rw_policies.sql          remove anon SELECT/UPDATE
0003_jazzy_dormammu.sql                 waitlist table + RLS
0004_fine_fixer.sql                     drop teaser_json column
0005_rainy_devos.sql                    session_id idx → UNIQUE constraint
0006_restore_assessment_anon_policies_idx.sql   idempotent repair
```

`0002` is intentionally skipped (squashed during early dev). Don't renumber. Migrations are
append-only — never edit an applied one.

### Commands

```bash
pnpm db:generate   # generate migration SQL from schema changes
pnpm db:migrate    # apply migrations — use SESSION pooler URL (5432) locally
pnpm db:push       # DEV/LOCAL ONLY — never staging/prod
pnpm db:studio     # Drizzle Studio
```

`drizzle.config.ts` loads `DATABASE_URL` via `env.mjs`; swap to a session-pooler URL in `.env.local`
for migration commands only.

---

## AI

- Provider + model constants live in `lib/ai/index.ts` (one module-level `anthropic` instance — never
  per-request). `SONNET_MODEL` for report generation, `HAIKU_MODEL` for fast paths.
- Prompts live in `lib/ai/prompts.ts`.
- Report generation streams (`text/plain`) and persists in `after()`. Keep streaming responses
  cancellation-safe and never block the response on the persistence write.

---

## Observability & Debug

- **`instrumentation.ts`** — registers `@vercel/otel` (`serviceName: "scorta-api"`) and an
  `unhandledRejection` handler that emits structured JSON.
- **`lib/logger.ts`** — `logger.info/warn/error(event, ctx)` emits one JSON line per call; `timed(name, fn)`
  wraps an async fn with success/error duration logging. Use it for anything worth observing in prod.
- **`lib/debug/workflow-trace.ts`** — `traceEvent(phase, payload)` appends NDJSON to
  `.exitiq-debug/sessions/<sessionId>.ndjson`. **Local dev only** (gated by `EXITIQ_WORKFLOW_LOG=true`
  AND `VERCEL !== "1"`). Tracing must never crash the app — errors are swallowed by design.
- **Client tracing** — `lib/debug/workflow-trace-client.ts` POSTs events to `/api/debug/workflow-trace`
  when `NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG=true`.
- **PII redaction** — gate data must go through `redactGateForTrace()` before reaching `traceEvent`.

---

## Components & lib map

```
components/
  scorta/        platform shell + brokerage stations + marketing
    AppShell.tsx           left rail + top bar + CASE chat + agent panel (wraps every (app) route)
    AgentActivityPanel.tsx · AgentFleetContext.tsx · AuditTrailModal.tsx
    CASEChat.tsx · CaseChatPage.tsx · CaseHero.tsx
    SellerHome.tsx · LoginPanel.tsx · LandingPage.tsx · AboutPage.tsx
    ConnectStation · IngestionStation · RecastStation · RiskStation · BoardroomStation
    DocumentsStation · VDRStation · LendersStation · BuyersStation · OutreachStation
    UploadStation · LockedStation
  exitiq/        public assessment flow (client-heavy, WebGL canvas)
    ExitIQApp.tsx          master state machine + WebGL lifecycle
    questions · dashboard · preview · report · report-visual · radar · bento · ui

lib/
  persona.ts               locked mock persona (PERSONA) + STATIONS rail definition
  assessment/              questions, scoring, sba, segmentation, session, transform, api,
                           states, industries, readiness-axes, report-transform
  ai/                      index (provider + models), prompts
  db/                      index (singleton), schema/, migrations/, __tests__/
  supabase/                client, server, middleware
  exitiq/                  calculations, webgl, data
  email/ · debug/ · logger.ts
  auditTrail.ts · agentActivity.ts · caseChat.ts   (agent-fleet UI data)
```

### Styling reality

Design tokens are CSS variables in `styles/tailwind.css` (`--t1`…`--t4`, `--glass-bg`, `--mint`,
`--peach`, `--scan-color`, …). Dark is the default theme; `[data-theme="cream"]` is the light variant
(the `(app)` workspace pins `cream`). Much of the `scorta/` station UI is written with **inline-style
React using these CSS variables** rather than Tailwind utility classes. That is the current
convention for those files — when extending them, reuse the existing tokens and inline-style patterns
for consistency rather than mixing paradigms mid-component. New standalone components should prefer
Tailwind utilities + tokens per `AGENTS.md`. Never hardcode raw hex outside the token definitions.
Fonts (`EB Garamond` serif, `Inter` sans, `JetBrains Mono`) are loaded via `next/font/google` in
`app/layout.tsx`.

---

## Commands

```bash
pnpm dev                # Next dev (Turbopack)
pnpm build              # Production build
pnpm start              # Production server
pnpm lint  / lint:fix   # ESLint (flat config: typescript-eslint + next + storybook + import-order)
pnpm prettier / :fix    # Prettier
pnpm typecheck          # tsc --noEmit
pnpm test               # Vitest (RUN_DB_INTEGRATION_TESTS=1)
pnpm test:integration   # DB schema + RLS integration tests
pnpm e2e:headless       # Playwright
pnpm storybook
pnpm db:studio
```

---

## Definition of Done

A change is done when:

- [ ] `pnpm typecheck` and `pnpm lint` pass clean
- [ ] `pnpm prettier` is satisfied (run `:fix` if not)
- [ ] New/changed `lib/` logic has unit tests; DB/RLS changes have integration tests; all green
- [ ] Invalid input, missing rows, and upstream failures are handled with explicit status + structured logs
- [ ] Client surfaces have loading and error states
- [ ] No `process.env` outside `env.mjs`; no `db` import in client components; no `../../` imports
- [ ] Schema changes ship a new migration (with RLS where applicable); `env.mjs` + `.env.local.example` updated together
- [ ] No new palette / component library / AI provider introduced without cause
- [ ] The relevant flow was actually exercised (no console errors, no dead links, no 404s)
