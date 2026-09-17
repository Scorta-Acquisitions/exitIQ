# Handoff prompt: Heirloom site, phase 2 (motion, Higgsfield assets, WebGL instrument)

You are picking up the Heirloom marketing site (Next.js 15 App Router, React 19, Tailwind v4) in
`/Users/suyashagrawal/Documents/GitHub/exitIQ` on branch `new-website`. A full redesign to an Apple-style
"gallery" design system, translated to Heirloom greens and set in Reesha, was completed in the previous
session and is sitting **uncommitted** in the working tree (83 files). Everything is green: typecheck,
lint, Prettier, 1196 Vitest tests (coverage 99.9% statements / 97.5% branches), and the Playwright
chromium suite run twice against `pnpm build && pnpm start` (426 runs, 0 flaky). Start by running
`git status` and, if the user wants, committing that work before you change anything.

## Read these first, in order

1. `.claude/CLAUDE.md`, section "Conventions for the site" (the binding rules and the map of the site).
2. `plans/Heirloom Design System Brief.md` (the vocabulary, recipes, and hard rules every page follows).
3. `styles/site.css` (every token, the `type-*` ladder, `on-dark` surface context) and
   `components/site/ui/primitives.tsx`, `Button.tsx`, `Chip.tsx`, `TextLink.tsx`, `TextButton.tsx`,
   `lib/site/cn.ts`.
4. `components/site/__tests__/DesignSystem.test.ts` and `lib/site/__tests__/site-css.test.ts`: the
   guards that fail on any raw colour, gradient, shadow (other than `shadow-product`), arbitrary
   radius/type, weight 500, mono, uppercase, or retired token. When the user's tweak deliberately
   changes the system, change the token and the guard together; never work around a guard in a component.
5. `plans/Heirloom Design Review 2026-09 (resolved).txt` for the taste bar the last review applied.
6. `.agents/skills/higgsfield-generate/SKILL.md` (image/video generation), then
   `higgsfield-product-photoshoot`, `higgsfield-brandkit`, `higgsfield-video-explainer`. Discover the
   live tools with `ToolSearch "higgsfield"`; the skills describe the `higgsfield` CLI if no MCP tools
   are mounted. Do not use `higgsfield-websites`: this site stays in this repo, on Next.js.

## What exists that you will build on

- **Pages** are stacks of `<Tile tone=light|parchment|dark|dark-2|dark-3>` (80px/48px padding, no
  borders, alternating tones). Content sits in `<Container size=text|default|wide>` (692/980/1440).
- **Chrome**: 44px global nav (`components/site/layout/SiteHeader.tsx`, not sticky), 52px sticky
  frosted `SubNav` driven by `SUBNAV` in `lib/site/routes.ts`, parchment `SiteFooter`. Exactly one
  pill in the chrome per page.
- **Scroll scenes**: `components/site/scenes/{MarketScene,PrivacyScene,StagesScene}.tsx` use
  `useSceneProgress` (rAF + IntersectionObserver) and the pure math in `lib/site/scroll.ts`
  (`sceneProgress`, `marketFrame`, `stageFrame`, `privacyLevel`). Panels pin with `scene-pin` (home)
  or `scene-pin-under-nav` (pages with a sub-nav). e2e drives them with `scrollScene()` and
  `expectPinned()` in `e2e/helpers.ts`.
- **Hero**: `components/site/hero/HomeHero.tsx`, `HeroConsole.tsx` (the dark instrument card: the
  only element besides photographs that carries `shadow-product`), `HeroGraph.tsx` (pure SVG driven
  by `lib/site/hero/geometry.ts`, colours are CSS variables, the dashed rings are the one permitted
  looping animation).
- **exitIQ**: `components/site/exitiq/{ExitIqRun,ExitIqQuestion,ExitIqActions,ReviewWithAdvisor}.tsx`,
  scoring in `lib/site/exitiq/scoring.ts`, shared client state in
  `components/site/providers/SiteStateProvider.tsx` + `lib/site/state/reducer.ts`.
- **Media**: `components/site/ui/AmbientVideo.tsx` (lazy, plays only on screen, hides on failure,
  respects reduced motion), `public/media/` (archive-hall.mp4 in use; hero-ambient.mp4 and reveal.mp4
  unused; fees.png), `public/brand/heirloom-mark.svg` (the logo mark), `public/og/heirloom-og.png`
  (share card, still the old design).
- **Screenshots**: `node e2e/tools/screenshots.mjs http://127.0.0.1:3000 ./.screenshots` against a
  production server writes desktop/phone full-page and fold captures of every route (gitignored).
- **Removed on purpose last time**: the WebGL "instrument field" (`useInstrumentField`, a fractal-noise
  backdrop behind the console and the exitIQ run), aurora/panel gradients, hero and privacy backdrop
  videos, glows. `git log -p -- components/site/hero/useInstrumentField.ts` shows the old shader if
  you want its intensity/pulse API as a starting point.
- **Reesha** is self-hosted via `styles/fonts.css`; the licensed WOFF2 files are not in the repo
  (`public/fonts/reesha/README.md`). The site renders in the system stack until they are dropped in.
- **`legacy/`** holds the source of the previous Scorta/exitIQ/DealIQ product (station UIs, DealIQ,
  the old assessment). It contains code only, no screenshots. To use product visuals as generation
  references, render those components (a scratch route or Storybook) and capture them, or capture the
  current site with the screenshot tool.

## Your mission

1. **Apply the user's intentional design tweaks** exactly as asked. Copy is frozen unless the user
   changes it. Every id, `data-testid`, role, aria attribute, href, and interaction is an e2e contract.
2. **Bring the site alive with Higgsfield-generated assets and Apple-style scroll motion**, staying
   inside the design principles: generated imagery is where atmosphere lives (photography-first),
   chrome stays flat; one accent; tiles still alternate; nothing decorative competes with the copy;
   every motion has a reduced-motion fallback; phones stay under the viewport width with 44px targets.
3. **Bring WebGL back as an instrument, not a backdrop**: a generative layer inside the exitIQ run and
   the hero console (and the advisor briefing if it earns it) that responds to the visitor's answers,
   the way an Apple product page's hero object responds to scroll. Use Higgsfield-generated textures,
   objects, or films as its material; keep it in an isolated `"use client"` leaf with a static
   reduced-motion frame and a no-WebGL fallback, and never let it lower the legibility of the copy.
4. **Maximise conversion** on the advisor CTA and exitIQ entry: one primary per band, the console and
   the run reachable above the fold, every generated film ending in a clear next action.

## Higgsfield prompt framework for Heirloom

The example prompts the user works from read like: "Build the VELLARO garden soda website from the
attached ribbed bottles. Use olive, terracotta, reed beige, Cabinet Grotesk, and Inter Tight with
honey amber as the only accent. Show the harvest-to-packshot process across six chapters …". Translate
that structure into Heirloom's world: **materials** (brass, hand-cut glass, travertine, cream paper,
wax seals, dark green lacquer), **palette** (deep green #0b241b, tile greens #0f2e23/#062314, cream
#f4f5ee, the single accent #0f7a45 on light and #4ce27e on dark), **type** is never rendered inside
generated media (Reesha lives in the DOM), **no people, no readable text, IP-free**, 16:9 for films,
1:1 or 4:5 for objects on transparent backgrounds (so `shadow-product` can do its work), seamless
loops of 8 to 12 seconds at 24fps for scroll-scrub. Prompts to start from (adapt, do not paste blindly):

- **Logo as a scroll object.** "Generate a 10s seamless film of the Heirloom mark (attached SVG) as a
  small brass seal on deep-green lacquer; it lifts, turns a quarter, and presses a cream wax seal.
  Deep green #0b241b background, brass and cream only, soft studio light, no text. Also a 4:5 PNG of the
  brass seal alone on a transparent background." Use it as the sticky object that travels from the hero
  into the close section, and as the mark that forms in the header on first load.
- **The private market (MarketScene).** "Generate a 12s film on a deep-green table: one sealed cream
  letter arrives; eighteen small anonymous cards fan out and most slide away; the four that remain turn
  over as sealed letters of intent. Top-down, soft light, brass and cream on #0b241b, no text." Drive
  `video.currentTime` from `useSceneProgress` so it scrubs with the existing four steps.
- **Who sees what (PrivacyScene).** "Generate five stills and one 8s film of a cream company record
  behind stacked frosted-glass panes; each pane clears in turn from an anonymous overview to full
  disclosure. Deep-green surround, glass and paper only, no text." Map the five clears to `privacyLevel`.
- **The eight stages (StagesScene).** "Generate a 12s slow travelling shot along eight brass markers
  set into a travertine path, each lighting a small green lamp as the camera passes. Deep-green
  atmosphere, no text." Scrub it with `stageFrame`.
- **exitIQ instrument material.** "Generate three seamless 8s loops of a slow luminous green field seen
  through hand-cut glass, calm to bright: #0b241b base, #0f7a45 mid, #4ce27e highlights, no shapes,
  no text." Feed these to the WebGL layer as textures; blend from calm to bright with the exitIQ
  confidence, flash briefly on each answer, hold a still frame under reduced motion.
- **Fees and offers.** "Generate 4:5 transparent PNGs of financial ledgers bound between sheets of
  glass, and a set of four sealed cream envelopes with brass clasps, studio light on travertine, no
  text." Objects for the fees hero and the offer cards; each rests on a tile with `shadow-product`.
- **Buyer Passport.** "Generate a 4:5 transparent PNG and a 6s turn of a deep-green passport-sized
  booklet with a brass Heirloom seal on the cover, no text." The object for the buyers hero.
- **Close.** "Generate a 6s film of the brass seal pressing cream wax on deep green and lifting away,
  ending on the mark." The final beat before the four next-step cards.

## How to ship motion without breaking the system

- Scroll-scrub video: extend `AmbientVideo` (or add a sibling) with a `progress` prop that sets
  `currentTime = progress * duration` inside the rAF loop `useSceneProgress` already runs; keep
  play/pause off screen, lazy `src`, `onError` hide, and a poster still for reduced motion.
- Sticky objects that persist across chapters: one pinned element per scene (first child of the scene
  root, the e2e measures `[data-testid=…] > *`), transforms computed in `lib/site/scroll.ts` as pure
  functions with unit tests, written straight to the DOM (no React state for continuous values).
- WebGL: one `useInstrumentField`-style hook, one canvas per instrument card, `powerPreference:
"low-power"`, resize with `ResizeObserver`, stop when off screen, static frame under
  `prefers-reduced-motion`, and a `null` return when `getContext` fails. Cover it with a jsdom test
  using a fake GL (the deleted `useInstrumentField.test.tsx` in git history shows how).
- Assets: put films in `public/media/` and objects in `public/generated/`, add each prompt and model to
  `public/media/README.md`, keep films under ~4 MB, and add new optional-media paths to `isOptionalMedia`
  in `e2e/helpers.ts` so console hygiene ignores a missing file. Update the tile sequence comment in
  `app/page.tsx` if tones change.
- Keep the copy freeze, the type ladder, and the accent discipline. Generated imagery may contain
  gradients; the DOM may not.

## Verification (all of it, before you report done)

```
pnpm typecheck && pnpm lint && pnpm prettier
SKIP_ENV_VALIDATION=true npx vitest run --config vitest.site.config.ts --coverage   # gates 97/95/95, currently 99.9/97.5
pnpm build && pnpm start &
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npx playwright test --project=chromium --repeat-each=2
node e2e/tools/screenshots.mjs http://127.0.0.1:3000 ./.screenshots   # then look at them
```

Work the way the last phase did: scout inline, fan out disjoint file groups in parallel when the task
is large, keep shared test files (`pages.test.tsx`, `Panels.test.tsx`, `HomeSections.test.tsx`) with
one owner, run an adversarial design review from the screenshots before calling anything finished, and
append what you learn to `.claude/CLAUDE.md` and the memory directory
(`/Users/suyashagrawal/.claude/projects/-Users-suyashagrawal-Documents-GitHub-exitIQ/memory/`,
see `heirloom-design-system.md`).

## Loose ends you may be asked about

- Reesha WOFF2 files are not installed; the OG share image is the old design; `skills-lock.json` and
  `.agents/skills/higgsfield-*` were added by the skill installer, not by the redesign; nothing has been
  committed yet.
