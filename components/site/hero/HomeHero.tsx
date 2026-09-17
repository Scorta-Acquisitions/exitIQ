import Image from "next/image"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { HeroConsole } from "@/components/site/hero/HeroConsole"
import { HeroFilm } from "@/components/site/hero/HeroFilm"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { CONTACT, ROUTES } from "@/lib/site/routes"

/**
 * The home page's first tile, composed so the copy, the three-action row and the badge land above the fold on
 * first landing with the console visibly beginning on screen, while the film behind it runs on past the fold:
 * the tile's minimum height is the first viewport under the bar plus the tile rhythm, so its bottom edge (and
 * the film's) always sits at least 80px below the first viewport's bottom edge. Content stays top-aligned, so
 * the fold arithmetic below never moves. Two compositions, both fixed px rhythm (no vh clamps on the copy),
 * decided by the `short` height variant stacked with `nav:` so phones never see the second:
 *
 * - Composition A (viewports taller than the `short` threshold): the copy in the 980 content lock, the eyebrow
 *   and headline in the 692 reading column (three lines since the second clause lost its italic on 2026-09-17:
 *   upright glyphs are wider), the lead in an 800 column so it holds to two lines, then
 *   the CTA row holding the two pills and the buyers link; the tile opens at 64px instead of the tile's 80, the
 *   eyebrow-to-headline gap is 24, headline-to-lead 28, lead-to-row 40, row-to-badge 28, badge-to-console 24.
 * - Composition B (`short:nav:`: a desktop viewport no taller than the threshold): the eyebrow leaves, the
 *   headline and lead step one rung down (display-lg, tagline) and the gaps close to 16 · 0 · 14 · 22 · 18 · 22.
 *
 * Both compositions gained one line of air on 2026-09-16 at Suyash's request ("I like the spacing in the hero.
 * Maybe lets increase it by just one more line"): 8px on each of A's four gaps above the badge row (32px in
 * total) and 6px on each of B's four gaps above the console (24px). The tile's top and `--hero-air` did not
 * move, and the console's top still stands well over 120px above the fold at every desktop viewport, so the
 * product visibly begins on screen; the console's own bottom may now run under it.
 *
 * That extra line is the DESKTOP rhythm: under the `nav` breakpoint (`max-nav:`, where composition B never
 * applies, the 28px headline wraps to three lines and each of the three actions takes its own) A keeps the four
 * gaps it had, 16 · 20 · 32 · 20. Measured on the served build: with the line of air on every width the buyers
 * entry's bottom landed 17.95px UNDER a 320×640 fold; holding phones at the old rhythm brings it back inside it,
 * and no viewport at or above 834px wide — every viewport the request was made against — changes by a pixel.
 * Remeasured on 2026-09-17, after the buyers pill became a text link (which is 2.98px shorter, so the phone row
 * is 163.97 against 166.95 and everything under it rose by that much) and the headline's italic went (which
 * costs the phone one 30.8px line): the link's bottom is 633.95 of 640 at 320×640, 6.05px of room against the
 * pill's 3.06, and 390×844 keeps 210.05px of it.
 *
 * Both compositions breathe with the viewport's height through `--hero-air` (the `hero-air` utilities in
 * styles/site.css): 0 at the composition's tightest height (900 for A, 720 for B), a fifth of the extra height
 * per gap, capped at 16px, added to the tile's top and every gap above the console, so a 1920×1080 desktop
 * gets the first build's 80px tile top back while 1280×720 stays as tight as it must.
 *
 * The buyers link is the CTA row's third and last action (2026-09-16, the same request: the plate "seems in a
 * weird spot, maybe lets add it to the Talk to an M&A advisor, see how it works pill section"), and since
 * 2026-09-17 it is a TERTIARY one: a plain `TextLink` in the accent, no fill and no capsule, so the two owner
 * actions — the primary pill and the secondary ghost pill — read as the hero's calls to action and the buyers
 * line sits a rung under them. It carries the plate's testid so exactly one is on the page at every width, in a
 * row that wraps and stays centred, so a phone takes it onto its own line. The badge row under it
 * is the centred Y Combinator badge alone at every width. Behind it all, at 60% of its strength, the site's
 * original ambient film (a warm paper-toned tabletop model with glass blocks and glowing green paths),
 * leaning a few pixels toward the pointer: the surface visibly moves while the ink copy stays legible over
 * its light tones and the console rests on it as a dark card. The console is still the product on show
 * and keeps its own look.
 */
export function HomeHero() {
  return (
    <Tile
      tone="light"
      className="hero-air short:nav:hero-air-short short:nav:pt-[calc(16px+var(--hero-air))] min-h-[calc(100svh-var(--bar-h)+var(--spacing-section))] overflow-hidden pt-[calc(64px+var(--hero-air))]"
    >
      {/* The film paints first; the two content columns are positioned so they sit above it. The tile's minimum
          height (the first viewport under the 52px bar, plus the 80px tile rhythm) carries the film 80px past the
          fold at every desktop height; the copy and console stay top-aligned in it. */}
      <HeroFilm />
      <Container size="default" className="relative text-center">
        <div className="mx-auto max-w-[692px]">
          {/* One tone up from the usual eyebrow: the muted tone measured 3.6–4.0:1 over the film's paper tones. */}
          <Eyebrow className="text-fg-2 short:nav:hidden">
            Technology-enabled sell-side M&amp;A for established business owners
          </Eyebrow>
          <h1 className="type-hero text-fg short:nav:type-display-lg short:nav:mt-0 max-nav:mt-[calc(16px+var(--hero-air))] mt-[calc(24px+var(--hero-air))]">
            Sell your business privately, <span>with qualified buyers competing.</span>
          </h1>
        </div>
        {/* 800px holds the lead to two lines at 24/1.5 (about 66 characters a line); the tagline rung is two lines at 692 already. */}
        <p className="type-lead-airy text-fg-2 short:nav:type-tagline short:nav:mt-[calc(14px+var(--hero-air))] max-nav:mt-[calc(20px+var(--hero-air))] mx-auto mt-[calc(28px+var(--hero-air))] max-w-[800px]">
          We prepare the company, bring qualified buyers into a private process, and manage the transaction through
          closing. You choose the offer.
        </p>
        {/* One action row of three actions on two rungs: the primary pill, the secondary ghost pill, then the buyers
            text link, wrapping and staying centred, so a phone takes the link onto its own line under the two pills. */}
        <div
          className="short:nav:mt-[calc(22px+var(--hero-air))] max-nav:mt-[calc(32px+var(--hero-air))] mt-[calc(40px+var(--hero-air))] flex flex-wrap items-center justify-center gap-3"
          data-testid="hero-cta-row"
        >
          <AdvisorCtaButton />
          {/* The ghost pill keeps its outline but rests on canvas here (over the film its accent measured 3.1–3.6:1), and
              hovers to the second surface instead of the variant's 10% tint, which would let the film back through. */}
          <Button href={ROUTES.howItWorks} variant="secondary" className="bg-canvas hover:bg-surface-2">
            See how it works
          </Button>
          {/* The buyers entry is the row's TERTIARY action (2026-09-17, Suyash: the visitors this hero is written for
              are owners, so the two owner actions should read as the calls to action and the buyers line should not
              compete with them): the site's plain text link in the accent, no fill, no border and no capsule, with
              `standalone` for the 44px touch target an action-row link needs. It keeps the row's third place and the
              plate's testid, so exactly one is on the page at every width, and the row reads primary → secondary →
              text link, the pattern /fees, /why and /score already use. */}
          <TextLink href={ROUTES.buyers} standalone data-testid="hero-buyers-plate">
            Buyers: Get Heirloom Verified
          </TextLink>
        </div>
      </Container>
      {/* The first build's console sat in a 1132px lock (1180 less gutters), wider than the 980 content lock, so its
          copy and graph keep the proportions they were drawn at. The badge row shares the lock; the lock follows the
          action row at 28px (18 in the short composition). */}
      <Container className="short:nav:mt-[calc(18px+var(--hero-air))] max-nav:mt-[calc(20px+var(--hero-air))] relative mt-[calc(28px+var(--hero-air))] max-w-[1132px]">
        {/* The badge row, 24px above the console (22 in the short composition; the gap is the row's bottom margin so the
            console stays the lock's own child): the Y Combinator badge alone, centred, at every width. */}
        <div
          className="short:nav:mb-[calc(22px+var(--hero-air))] mb-[calc(24px+var(--hero-air))] flex items-center justify-center"
          data-testid="hero-badge-row"
        >
          {/* Neutral outlined badge on a canvas fill, never the accent and never the old pearl panel: the muted caption
              and the hairline both need a known surface over the film. py-3 on the 14px caption gives the 44px target. */}
          <a
            href={CONTACT.ycombinator}
            target="_blank"
            rel="noopener"
            className="type-caption-strong text-fg-3 border-line bg-canvas rounded-pill hover:text-accent inline-flex items-center gap-2 border px-4 py-3 transition-colors duration-200"
          >
            <Image src="/brand/yc-logo.svg" alt="" width={16} height={16} className="block rounded-xs" />
            BACKED BY Y COMBINATOR
          </a>
        </div>
        <HeroConsole />
      </Container>
    </Tile>
  )
}
