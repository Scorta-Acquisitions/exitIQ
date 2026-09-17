# Heirloom redesign brief (Phase 1: page migration)

Design read: **redesign (overhaul) of a premium advisory marketing site for owners of private businesses, in an
Apple-gallery language translated to Heirloom greens and set in Reesha.** Dials: VARIANCE 7 · MOTION 4 · DENSITY 3.
Photography-first grammar: the page is a stack of edge-to-edge tiles alternating light and dark; UI chrome recedes;
one accent colour; no decorative gradients, no shadows on chrome, no glows, no looping motion.

The foundation is already in place and tested. **Do not edit** `styles/site.css`, `styles/fonts.css`,
`components/site/ui/*`, `components/site/layout/*`, `app/layout.tsx`, `lib/site/routes.ts`,
`components/site/__tests__/{primitives,SiteHeader,SiteFooter,SubNav}.test.tsx`,
`components/site/__tests__/DesignSystem.test.ts`, `lib/site/__tests__/site-css.test.ts`. If a primitive is missing
something you need, compose with utilities in your own file and report it in `foundation_requests`.

Read `.claude/CLAUDE.md` → "Conventions for the site" first. Then this file. Then your assignment.

---

## 1. Hard rules (the source guard `components/site/__tests__/DesignSystem.test.ts` enforces these)

1. **Tokens only.** No hex/rgba, no `gradient`, no `shadow-*` except `shadow-product` (imagery resting on a surface),
   no `rounded-[…]`/`rounded-xl|2xl`, no `text-[Npx]`/`text-[clamp…]`, no `tracking-[…]`, no `font-mono`,
   no `font-medium` (weight ladder is 300/400/600/700 through the `type-*` utilities), no `font-serif`,
   no CSS `uppercase`, no `sm:|md:|lg:|xl:|2xl:` (use `phone:`/`lphone:`/`tab:`/`nav:`/`desk:`/`wide:`), and none
   of the retired tokens (`text-d1…d4`, `dfull`, `dhair`, `l2…l4`, `paper*`, `ground*`, `brand`, `filament*`,
   `signal`, `cta`, `hair*`, `card`, `slip*`, `aurora`, `panel-*`, `bg-scene-*`, `hover-green*`, `eyebrow`,
   `animate-blink|feed|row|fill`, `mask-*`, `text-glow-*`).
2. **Copy stays.** Every user-visible string stays byte-for-byte (the e2e suite asserts exact text). The only
   rendering change allowed is that labels are no longer forced uppercase by CSS. Do not reword, shorten, or add copy.
   Strings written in caps in source (e.g. `"QUESTION 1 OF 2"`, `"YOU RECEIVE"`) stay as they are.
3. **Behaviour and contracts stay.** Keep every `data-testid`, `id`, `aria-*`, role, `href`, heading level, and
   interaction exactly as it is. Add the new anchor `id`s listed in your assignment. Keep every `"use client"` file's
   one-line `// use client: …` justification directly above the directive.
4. **Weight 500 never; italics never; mono never.** Numbers use the `tabular` utility.
5. **Hover:** text links underline (built into `TextLink`); filled buttons only shift their fill; cards and rows
   never lift, glow, or change shadow. Hover may change text colour to the accent (`hover:text-accent`) or a row
   background to `hover:bg-line-soft`. Press feedback is `pressable` (scale 95%) on bespoke buttons.
6. **Motion:** scroll-driven scenes stay (they are content). State transitions ≤ 300ms with `ease-e1`. No looping
   animation except the hero graph's `animate-dash`. Respect `motion-reduce:`.
7. **Phones:** grids that stack use `grid-cols-[repeat(auto-fit,minmax(min(100%,Npx),1fr))]`; nothing may exceed a
   320px viewport; touch targets ≥ 44px.

## 2. Vocabulary

### Tiles (full-bleed sections) — `components/site/ui/primitives.tsx`

```tsx
<Tile tone="light | parchment | dark | dark-2 | dark-3" padded={true} as="section | div" id="…" className="…">
```

80px vertical padding (48 on phones), 24px gutter, no radius/border/shadow. Alternate tones down the page; the
colour change is the divider — **remove every `border-b border-hair` between sections**. Two dark tiles in a row use
`dark` then `dark-2`/`dark-3`. Dark tones add `on-dark`, which switches the contextual tokens for everything inside.

### Containers

`<Container size="text | default | wide">` → 692 / 980 / 1440px. Page heroes and prose: `text`. Most sections:
`default`. Card grids and wide instruments: `wide` only when needed.

### Contextual colour tokens (adapt to the tile)

| Use                                                                      | Class                                         |
| ------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------- |
| headline / primary text                                                  | `text-fg`                                     |
| secondary paragraph                                                      | `text-fg-2`                                   |
| caption, label, hint                                                     | `text-fg-3`                                   |
| the accent (links, selected, badges)                                     | `text-accent`, `border-accent`, `bg-accent`   |
| hairline                                                                 | `border-line`; softer: `border-line-soft`     |
| card / panel surface                                                     | `bg-surface`; secondary panel: `bg-surface-2` |
| meter track                                                              | `bg-fg/15`; meter fill `bg-accent`            |
| Literal tokens exist too (`bg-canvas`, `bg-canvas-parchment`, `bg-tile-1 | 2                                             | 3`, `bg-surface-black`, `text-ink`, |

`text-on-dark`, `bg-primary`, `text-on-primary`, `text-error`) — use them only where the surface is fixed.

### Type ladder (the only way to set type)

`type-hero` 56 · `type-display-lg` 40 (tile headlines) · `type-display-md` 34 (section heads) · `type-lead` 28
(one-line taglines) · `type-lead-airy` 24/300 (hero and editorial lead paragraphs) · `type-tagline` 21/600 (card
titles, sub-heads) · `type-body-strong` 17/600 · `type-body` 17 (default; body inherits it) · `type-dense-link` ·
`type-caption` 14 · `type-caption-strong` 14/600 · `type-button-large` · `type-button-utility` 14 ·
`type-fine-print` 12 · `type-micro-legal` 10 · `type-nav-link` 12. Multi-line fine print may add `leading-[1.5]`.

### Components

- `<Button variant="primary|secondary|utility|pearl|hero|icon" size="md|nav" href?>` — primary pill + secondary
  ghost pill side by side is the CTA pair. `AdvisorCtaButton` takes the same props.
- `<Chip selected onClick>` — answer/option pills (14px caption, pill, hairline; selected = 2px accent). No `tone`/`size`.
- `<TextLink href>` — inline accent link, underline on hover. No `tone`.
- `<Card padded as className>` — surface + hairline + 18px radius + 24px padding. `padded={false}` for cards with
  header rows (`border-b border-line-soft px-6 py-4`).
- `<Eyebrow>` — 14px/600 muted caption above a heading, sentence case.
- `<KeyValueRow label labelClassName className>` — label `type-caption text-fg-3`, value on the right.
- `<LiveDot>` static accent dot · `<ProgressTicks>` · `<Disclosure>` · `<Dialog>`.
- Utilities: `anchor-target` (every `id` a sub-nav or in-page link points at), `scene-pin` / `scene-pin-under-nav`
  (sticky scroll panels), `frosted`, `tabular`, `pressable`, `tile`.

### Recipes

**Page hero** (every subpage):

```tsx
<Tile tone="light">
  <Container size="text" className="text-center">
    <Eyebrow className="mb-4">…</Eyebrow>
    <h1 className="type-hero text-fg">…</h1>
    <p className="type-lead-airy text-fg-2 mt-5">…</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Button>…</Button>
      <Button variant="secondary">…</Button>
    </div>
    <p className="type-caption text-fg-3 mt-5">…fine print…</p>
  </Container>
</Tile>
```

**Section**: `<Tile tone=…><Container><h2 className="type-display-lg text-fg">…</h2><p className="type-body text-fg-2 mt-4 max-w-[692px]">…</p> … </Container></Tile>`.
Secondary sections use `type-display-md`; card titles `type-tagline`; list-item titles `type-body-strong`.

**Card grid**: `grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6` of `<Card>`; inside: title
`type-tagline text-fg`, body `type-body text-fg-2 mt-2`, link `<TextLink>`.

**Row list / record**: rows `flex justify-between gap-4 border-b border-line py-3`, label `type-caption text-fg-3`,
value `type-body text-fg tabular`.

**Instrument card** (the hero console, the exitIQ run — a dark product on a light tile):
`<Card padded={false} className="on-dark bg-tile-1 shadow-product overflow-hidden">`. Header row
`border-b border-line-soft px-6 py-3.5`, two panes divided by `border-line-soft`. This is the only place a shadow
appears outside photographs.

**Cards inside dark tiles**: plain `<Card>` (surface becomes tile-2, hairline translucent). No shadow.

**Badges / status**: outlined pills `type-caption-strong text-accent border border-accent rounded-pill px-3 py-1`;
neutral: `text-fg-3 border-line`. Never filled.

**Meters / bars**: track `h-[3px] rounded-pill bg-fg/15`, fill `h-full rounded-pill bg-accent transition-[width] duration-300 ease-e1`.

**Forms**: label `type-caption-strong text-fg-2 mb-2 block`; input/select
`h-11 w-full rounded-pill border border-line bg-surface px-5 type-body text-fg placeholder:text-fg-3`; textarea
`w-full rounded-lg border border-line bg-surface px-5 py-3 type-body text-fg placeholder:text-fg-3 resize-y`;
sending/success copy `type-caption text-fg-3`; success `text-accent`; error `text-error`.

**Photographs** (`next/image` figures, the founder portrait, the fees photograph): `rounded-lg overflow-hidden
shadow-product` — imagery is where the one shadow lives.

**Scroll scenes**: root `<Tile tone="dark" padded={false} as="div" className="h-[…vh]" data-testid=…>`; the sticky
panel is the **first child** with `scene-pin` (home) or `scene-pin-under-nav` (how-it-works) plus
`overflow-hidden`; contents in `<Container>` with `h-full flex flex-col py-…`. Remove veils, aurora, gradients,
rotations, slip shadows; keep the choreography (opacity/transform driven by `lib/site/scroll.ts`).

## 3. Verification (run from the repo root; only touch your files)

```
pnpm typecheck                                   # whole repo; ignore transient errors in files you do not own, re-run at the end
npx eslint <your files>                          # 0 errors, 0 warnings
npx prettier --write <your files>                # never run the repo-wide prettier:fix / lint:fix
SKIP_ENV_VALIDATION=true npx vitest run --config vitest.site.config.ts <your test files>
SKIP_ENV_VALIDATION=true npx vitest run --config vitest.site.config.ts components/site/__tests__/DesignSystem.test.ts 2>&1 | grep -E "<your paths>"
```

The design-system guard fails repo-wide until every agent finishes; you are done when **no offender line names a
file you own**. Update only the test files listed in your assignment; keep the test rigor rules (concrete values,
unhappy paths, fake timers, no snapshots). Do not edit `pages.test.tsx` or `Panels.test.tsx`; instead list in
`shared_test_notes` every assertion there that your change invalidates (file, test name, old → new expectation).
