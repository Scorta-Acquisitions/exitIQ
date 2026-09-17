import { expect, type Locator, type Page, test } from "@playwright/test"
import { NARROW_PHONE, PHONE, waitForFonts } from "./helpers"
import { BAR_H } from "../lib/site/scroll"

/**
 * The home hero's fold contract, rewritten on 2026-09-16 with the extra line of air and the buyers link's move
 * into the CTA row. On first landing, with no scrolling and the bar at rest: the copy, the action row (the
 * buyers link included) and the Y Combinator badge sit inside the first viewport, the console's top edge stands
 * at least 120px above the fold so the product visibly begins on screen, and the hero tile itself (and the film
 * behind it) runs on at least 80px past the fold. The console's own bottom is no longer held above the fold:
 * composition A at its own threshold height now carries it a few pixels under.
 *
 * TWO CHANGES ON 2026-09-17, both remeasured on the served build and re-pinned below.
 *
 * 1. The buyers entry is no longer a pill. It is the row's TERTIARY action, a `TextLink standalone` in the
 *    accent with no fill, border, padding or capsule, so the two owner actions read as the calls to action.
 *    Its box is 44 × 225.97 at every viewport (`STANDALONE_LINK`'s `min-h-11`), against the pearl pill's
 *    46.98 × 269.97, and nothing about it is sized to the primary's box any more — the assertion that the two
 *    matched to the hundredth of a pixel was deleted with the pill. On a DESKTOP the row's height is unchanged
 *    (48.98, the ghost pill with its border is the tallest member), so nothing below the row moved: every
 *    console-top and tile-bottom number here is the one it was. On a PHONE, where each action takes its own
 *    line, the row loses the 2.98px the link is shorter (166.95 → 163.97) and everything under it rises by
 *    that much.
 * 2. The headline's second clause lost its italic (`<em>` → a plain `<span>`, Suyash's request). Upright
 *    glyphs are wider, so the 56px headline of composition A now wraps to THREE lines instead of two, at
 *    1440×900, 1440×890 and 1920×1080 (+59.91px, one 59.92 line), and so does the 28px phone headline at
 *    390×844 (+30.8px, one 30.8 line; 320×640 was three lines already). Composition B's 40px headline still
 *    holds two lines at every width. That is why `headlineLines` below is 2 in B and 3 everywhere else, and
 *    why the console stands lower on those four viewports than it did (1440×900 337.11 → 277.20 above the
 *    fold, 1920×1080 421.11 → 361.20, 390×844 149.81 → 122.00, all still clear of the 120px floor).
 *
 * The buyers link is inside the fold at EVERY viewport here, the 320×640 phone included (measured 633.95 of
 * 640 on the served build, 6.05px of room against the pill's 3.06), which is what the phone rhythm below buys;
 * only the desktops keep the 16px of clearance.
 *
 * Two compositions share the tile, decided by the `short` height variant in styles/site.css: A (the eyebrow,
 * 56px headline, 24px lead) from `SHORT_MAX_HEIGHT + 1` up; B (no eyebrow, 40px headline, 21px lead, tight
 * gaps) at `SHORT_MAX_HEIGHT` and under. Both breathe with the viewport's height through `--hero-air`, added to
 * the tile's top and every gap above the console.
 */

/**
 * The `short` variant's `max-height` (styles/site.css): composition B applies at and under it. Unchanged by the
 * added air — it was derived from the first build's spacing and is the height at which the type steps down.
 */
export const SHORT_MAX_HEIGHT = 889
/** The room the buyers link keeps above the viewport's bottom edge. */
const CLEARANCE = 16
/** The buyers link's box on every viewport: `STANDALONE_LINK`'s 44px touch target, no padding, its text's width. */
const BUYERS_BOX = { height: 44, width: 225.97 }
/** The console's top edge stands at least this far above the fold, so the instrument visibly begins on screen. */
const CONSOLE_HEAD = 120
/** The tile's overrun past the fold: its minimum height is the viewport under the bar plus the 80px tile rhythm. */
const TILE_OVERRUN = 80

/**
 * Each composition's base gaps, in DOM order: tile top → eyebrow (A) or headline (B), eyebrow → headline,
 * headline → lead, lead → CTA row, CTA row → badge row, badge row → console. A's four gaps above the badge row
 * each gained 8px and B's four above the console each gained 6px on 2026-09-16 ("increase it by just one more
 * line"): 32px of extra height in A, 24px in B.
 *
 * The 8px is the desktop rhythm. Under the `nav` breakpoint (`max-nav:` in HomeHero, the widths where the
 * headline is 28px, wraps to three lines and each of the three actions takes its own) composition A keeps the
 * four gaps it had, which is what holds the buyers link inside a 320×640 fold; every viewport 834px wide and up
 * is unchanged. `A_PHONE` is that rhythm.
 *
 * Which composition a viewport is in follows its HEIGHT alone (`short` is a `max-height: 889` media query), so
 * 1440×900 and 1920×1080 are composition A and the four viewports at or under 889 are B: the +32 measured
 * between the old and new builds at 1440×900 (console top 532 → 564) and at 1920×1080 (969 → 1001.14) is A's,
 * and B's +24 is read off its gaps here (14 · 22 · 18 · 22 against the previous 8 · 16 · 12 · 16).
 */
const GAPS = {
  A: { top: 64, h1: 24, lead: 28, cta: 40, row: 28, console: 24 },
  A_PHONE: { top: 64, h1: 16, lead: 20, cta: 32, row: 20, console: 24 },
  B: { top: 16, h1: 0, lead: 14, cta: 22, row: 18, console: 22 },
}
/** The width the `nav` breakpoint opens at: under it composition A runs at the `A_PHONE` gaps. */
const NAV_BREAKPOINT = 834
/** The viewport height at which each composition has no air (`hero-air` / `hero-air-short` in styles/site.css). */
const AIR_ZERO = { A: 900, A_PHONE: 900, B: 720 }
type Composition = keyof typeof GAPS
/** The air each gap gains: a fifth of the height beyond the composition's zero, capped at 16px. */
const airFor = (height: number, composition: Composition) =>
  Math.min(16, Math.max(0, (height - AIR_ZERO[composition]) / 5))
/** The height picks the composition; under the nav breakpoint A runs at its phone rhythm. */
const compositionFor = (height: number, width = Infinity): Composition =>
  height <= SHORT_MAX_HEIGHT && width >= NAV_BREAKPOINT ? "B" : width < NAV_BREAKPOINT ? "A_PHONE" : "A"

/**
 * The Direction's four viewports plus the two real laptop browser viewports (a 1440×900 Mac and a 1536×864
 * Windows laptop). A needs 890px of height, so 1536×864 gets B (with its air at the 16px cap).
 */
const DESKTOPS = [
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 1440, height: 788 },
  { width: 1536, height: 729 },
]

const EYEBROW = "Technology-enabled sell-side M&A for established business owners"

/** Land on the home page as a first visit: `load`, fonts in place, no scrolling. */
async function land(page: Page) {
  await page.goto("/", { waitUntil: "load" })
  await waitForFonts(page)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
}

/** The element's box in viewport coordinates (at scrollY 0 these are page coordinates too). */
async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error("element has no box")
  return { top: b.y, bottom: b.y + b.height, height: b.height, left: b.x, right: b.x + b.width, width: b.width }
}

/** The one buyers link: the CTA row's third member at every width. */
const buyersLink = (page: Page) => page.locator("[data-testid=hero-buyers-plate]:visible")
const lead = (page: Page) => page.locator("p", { hasText: "We prepare the company" })
const badge = (page: Page) => page.getByRole("link", { name: "BACKED BY Y COMBINATOR" })
const heroTile = (page: Page) => page.locator("section[data-tone=light]").first()
const consoleHeader = (page: Page) =>
  page.getByTestId("hero-progress").locator("xpath=ancestor::*[contains(@class,'border-b')][1]")

/** Rendered line count: the element's height over its computed line-height. */
const lineCount = (locator: Locator) =>
  locator.evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)))

/** The layout viewport's width (what centred content is centred in), so a scrollbar could never skew the check. */
const layoutWidth = (page: Page) => page.evaluate(() => document.documentElement.clientWidth)

/** Within a pixel: layout boxes carry sub-pixel text heights. */
const expectWithinPx = (actual: number, expected: number, tolerance = 1) =>
  expect(Math.abs(actual - expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance)

/** The hero's stack as boxes, top to bottom. */
async function stack(page: Page) {
  return {
    tile: await box(heroTile(page)),
    eyebrow: (await page.getByText(EYEBROW).isVisible()) ? await box(page.getByText(EYEBROW)) : null,
    h1: await box(page.locator("h1")),
    lead: await box(lead(page)),
    cta: await box(page.getByTestId("hero-cta-row")),
    buyers: await box(buyersLink(page)),
    badgeRow: await box(page.getByTestId("hero-badge-row")),
    badge: await box(badge(page)),
    console: await box(page.getByTestId("hero-console")),
  }
}

/** Every gap above the console is its composition's base plus the viewport's air. */
async function expectGaps(page: Page, vp: { width: number; height: number }, composition: Composition) {
  const s = await stack(page)
  const air = airFor(vp.height, composition)
  const gaps = GAPS[composition]
  expect(s.tile.top).toBe(BAR_H)
  if (composition !== "B") {
    expect(s.eyebrow).not.toBeNull()
    expectWithinPx(s.eyebrow!.top - s.tile.top, gaps.top + air)
    expectWithinPx(s.h1.top - s.eyebrow!.bottom, gaps.h1 + air)
  } else {
    expect(s.eyebrow).toBeNull()
    expectWithinPx(s.h1.top - s.tile.top, gaps.top + air)
  }
  expectWithinPx(s.lead.top - s.h1.bottom, gaps.lead + air)
  expectWithinPx(s.cta.top - s.lead.bottom, gaps.cta + air)
  expectWithinPx(s.badgeRow.top - s.cta.bottom, gaps.row + air)
  expectWithinPx(s.console.top - s.badgeRow.bottom, gaps.console + air)
  // At composition A's two air extremes (none at 900, the 16px cap at 1080) the number is whole, so the tile
  // opens on an exact gap: 64px and the first build's 80.
  if (composition === "A" && Number.isInteger(air)) {
    expect(s.eyebrow!.top - s.tile.top, "the tile's top gap").toBe(gaps.top + air)
  }
  return s
}

/** The tile runs at least 80px past the fold and the badge sits alone and centred in its row. */
async function expectFilmPastFoldAndBadgeRow(page: Page, vp: { width: number; height: number }) {
  const tile = await box(heroTile(page))
  expect(tile.bottom).toBeGreaterThanOrEqual(vp.height + TILE_OVERRUN - 1)
  const row = page.getByTestId("hero-badge-row")
  const cta = await box(page.getByTestId("hero-cta-row"))
  const yc = await box(badge(page))
  expect(yc.top).toBeGreaterThanOrEqual(cta.bottom)
  expect(await badge(page).evaluate((el) => el.parentElement?.getAttribute("data-testid"))).toBe("hero-badge-row")
  await expect(row.locator(":scope > *")).toHaveCount(1)
  expectWithinPx(yc.left + yc.width / 2, (await layoutWidth(page)) / 2, 2)
}

/**
 * The CTA row holds its three actions in order, the buyers link last and alone on the page: two pills and,
 * since 2026-09-17, a plain text link a rung under them.
 */
async function expectActionRow(page: Page) {
  const row = page.getByTestId("hero-cta-row")
  const members = row.locator(":scope > *:visible")
  await expect(members).toHaveCount(3)
  await expect(members.nth(0)).toHaveText("Talk to an M&A advisor")
  await expect(members.nth(1)).toHaveText("See how it works")
  await expect(members.nth(2)).toHaveText("Buyers: Get Heirloom Verified")
  const link = buyersLink(page)
  await expect(link).toHaveCount(1)
  await expect(link).toHaveAttribute("href", "/buyers")
  expect(await link.evaluate((el) => el.parentElement?.getAttribute("data-testid"))).toBe("hero-cta-row")
  // The two capsules are the row's primary and secondary; all three sit on the 17px body rung, so the demotion
  // is carried by surface and box alone, not by shrinking the type.
  for (const i of [0, 1]) await expect(members.nth(i)).toHaveCSS("border-top-left-radius", "9999px")
  for (const i of [0, 1, 2]) await expect(members.nth(i)).toHaveCSS("font-size", "17px")
  // The buyers link carries no button grammar at all: no fill, no border, no padding, no capsule. What it does
  // carry is the accent (#0f7a45, the light tile's) and `STANDALONE_LINK`'s 44px touch target, which is its
  // whole height — measured 44 × 225.97 at every viewport, against the pearl pill's 46.98 × 269.97.
  await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  await expect(link).toHaveCSS("border-top-width", "0px")
  await expect(link).toHaveCSS("border-top-left-radius", "0px")
  await expect(link).toHaveCSS("padding-top", "0px")
  await expect(link).toHaveCSS("padding-left", "0px")
  await expect(link).toHaveCSS("min-height", "44px")
  await expect(link).toHaveCSS("color", "rgb(15, 122, 69)")
  const [primary, secondary, buyers] = await Promise.all([0, 1, 2].map((i) => box(members.nth(i))))
  expectWithinPx(buyers!.height, BUYERS_BOX.height, 0.01)
  expectWithinPx(buyers!.width, BUYERS_BOX.width, 0.01)
  // Shorter than both pills, which is the point of the change: it reads as the quiet third action.
  expect(buyers!.height).toBeLessThan(primary!.height)
  expect(buyers!.height).toBeLessThan(secondary!.height)
  return buyers!
}

/**
 * The headline's rendered line count, by composition. Since the second clause lost its italic on 2026-09-17
 * (`<em>` → `<span>`; upright glyphs are wider) A's 56px headline takes three lines in the 692px reading column
 * and the phone's 28px headline takes three in its; B's 40px headline still takes two. Measured on the served
 * build at every viewport below.
 */
const headlineLines = (composition: Composition) => (composition === "B" ? 2 : 3)

for (const vp of DESKTOPS) {
  const composition = compositionFor(vp.height)
  test.describe(`${vp.width}×${vp.height}`, () => {
    test.use({ viewport: vp })

    test(`lands in composition ${composition} with the two pills and the buyers link inside the fold, the console's top ${CONSOLE_HEAD}px above it, every gap at base plus ${airFor(vp.height, composition)}px of air, the film 80px past the fold`, async ({
      page,
    }) => {
      await land(page)
      const buyers = await expectActionRow(page)
      expect(buyers.bottom, "the buyers link is fully inside the first viewport").toBeLessThanOrEqual(
        vp.height - CLEARANCE
      )
      const hero = await box(page.getByTestId("hero-console"))
      expect(vp.height - hero.top, "the console's head above the fold").toBeGreaterThanOrEqual(CONSOLE_HEAD)
      expect(await lineCount(lead(page))).toBe(2)
      expect(await lineCount(page.locator("h1"))).toBe(headlineLines(composition))
      await expectFilmPastFoldAndBadgeRow(page, vp)
      // The composition follows the height alone: B at the threshold and under, A above it.
      const short = composition === "B"
      await expect(page.getByText(EYEBROW)).toBeVisible({ visible: !short })
      expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize)).toBe(short ? "40px" : "56px")
      expect(await lead(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe(short ? "21px" : "24px")
      await expectGaps(page, vp, composition)
    })
  })
}

test.describe("1280×720", () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test("keeps the console's header and its 300px body inside the viewport, the three actions on one line, and no air", async ({
    page,
  }) => {
    await land(page)
    const header = await box(consoleHeader(page))
    expect(header.top).toBeGreaterThanOrEqual(0)
    expect(header.bottom).toBeLessThanOrEqual(720)
    expect(header.height).toBeGreaterThan(30)
    const body = await box(consoleHeader(page).locator("xpath=following-sibling::*[1]"))
    expect(body.height).toBeGreaterThanOrEqual(300)
    expect(body.top).toBe(header.bottom)
    expect(body.bottom).toBeLessThanOrEqual(720)
    // One line: the row is exactly as tall as its tallest member, and all three sit inside it, left to right.
    const row = page.getByTestId("hero-cta-row")
    const members = row.locator(":scope > *:visible")
    await expect(members).toHaveCount(3)
    const rowBox = await box(row)
    const boxes = await Promise.all([0, 1, 2].map((i) => box(members.nth(i))))
    const tallest = Math.max(...boxes.map((b) => b.height))
    expect(rowBox.height).toBeLessThanOrEqual(tallest + 0.5)
    boxes.forEach((b) => {
      expect(b.top).toBeGreaterThanOrEqual(rowBox.top)
      expect(b.bottom).toBeLessThanOrEqual(rowBox.bottom + 0.5)
    })
    expect(boxes[0]!.right).toBeLessThanOrEqual(boxes[1]!.left)
    expect(boxes[1]!.right).toBeLessThanOrEqual(boxes[2]!.left)
    // On one line the buyers link no longer shares the primary's box — it is 44px tall against the pill's 46.98
    // (2026-09-17) — so what the row guarantees is that the shorter member is CENTRED on the pill's centre line,
    // which `items-center` gives it: measured 266.46 against the primary's 266.46 here.
    expect(boxes[2]!.height).toBeLessThan(boxes[0]!.height)
    expectWithinPx(boxes[2]!.top + boxes[2]!.height / 2, boxes[0]!.top + boxes[0]!.height / 2, 0.02)
    // B's tightest viewport: the base gaps exactly, 16 · 14 · 22 · 18 · 22, no air.
    const s = await expectGaps(page, { width: 1280, height: 720 }, "B")
    expect(s.h1.top - s.tile.top).toBe(16)
    expect(s.lead.top - s.h1.bottom).toBe(14)
  })
})

test.describe(`the threshold: composition B at ${SHORT_MAX_HEIGHT}, A at ${SHORT_MAX_HEIGHT + 1}`, () => {
  test.describe(`1440×${SHORT_MAX_HEIGHT}`, () => {
    test.use({ viewport: { width: 1440, height: SHORT_MAX_HEIGHT } })

    test("uses composition B: no eyebrow, the 40px headline on two lines, the row inside the fold, the badge alone", async ({
      page,
    }) => {
      await land(page)
      await expect(page.getByText(EYEBROW)).toBeHidden()
      expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize)).toBe("40px")
      expect(await lead(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe("21px")
      // B's 40px headline is the one that still holds two lines after the italic left the second clause.
      expect(await lineCount(page.locator("h1"))).toBe(headlineLines("B"))
      const buyers = await expectActionRow(page)
      expect(buyers.bottom).toBeLessThanOrEqual(SHORT_MAX_HEIGHT - CLEARANCE)
      const hero = await box(page.getByTestId("hero-console"))
      expect(SHORT_MAX_HEIGHT - hero.top).toBeGreaterThanOrEqual(CONSOLE_HEAD)
      await expectFilmPastFoldAndBadgeRow(page, { width: 1440, height: SHORT_MAX_HEIGHT })
      await expectGaps(page, { width: 1440, height: SHORT_MAX_HEIGHT }, "B")
    })
  })

  test.describe(`1440×${SHORT_MAX_HEIGHT + 1}`, () => {
    test.use({ viewport: { width: 1440, height: SHORT_MAX_HEIGHT + 1 } })

    test("uses composition A: the eyebrow, the 56px headline on three lines, the row inside the fold and the console's head on screen", async ({
      page,
    }) => {
      await land(page)
      await expect(page.getByText(EYEBROW)).toBeVisible()
      expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize)).toBe("56px")
      expect(await lead(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe("24px")
      // Three lines since the italic left the second clause on 2026-09-17, which is what carries the console
      // 59.91px lower here (its head above the fold measured 327.11 → 267.20, still clear of the 120px floor).
      expect(await lineCount(page.locator("h1"))).toBe(headlineLines("A"))
      const buyers = await expectActionRow(page)
      expect(buyers.bottom).toBeLessThanOrEqual(SHORT_MAX_HEIGHT + 1 - CLEARANCE)
      // A at its own threshold is the tightest A there is: the console's head still clears 120px, and its bottom
      // now runs under the fold, which the contract allows since the instrument visibly begins on screen.
      const hero = await box(page.getByTestId("hero-console"))
      expect(SHORT_MAX_HEIGHT + 1 - hero.top).toBeGreaterThanOrEqual(CONSOLE_HEAD)
      expect(hero.bottom).toBeGreaterThan(SHORT_MAX_HEIGHT + 1)
      await expectFilmPastFoldAndBadgeRow(page, { width: 1440, height: SHORT_MAX_HEIGHT + 1 })
      await expectGaps(page, { width: 1440, height: SHORT_MAX_HEIGHT + 1 }, "A")
    })
  })
})

test.describe(`${PHONE.width}×${PHONE.height}`, () => {
  test.use({ viewport: PHONE, hasTouch: true })

  test("wraps the buyers link onto its own centred line inside the fold, with the badge alone under the pills", async ({
    page,
  }) => {
    await land(page)
    const buyers = await expectActionRow(page)
    await expect(page.getByText(EYEBROW)).toBeVisible()
    expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize)).toBe("28px")
    // Three lines of headline since the italic left the second clause on 2026-09-17 (the 28px rung wrapped to
    // two before), which carries everything under it 30.8px lower here.
    expect(await lineCount(page.locator("h1"))).toBe(headlineLines(compositionFor(PHONE.height, PHONE.width)))
    // Its own line: below the two pills, and centred in the layout viewport.
    const row = page.getByTestId("hero-cta-row")
    const members = row.locator(":scope > *:visible")
    const advisor = await box(members.nth(0))
    const how = await box(members.nth(1))
    expect(buyers.top).toBeGreaterThanOrEqual(how.bottom)
    expect(how.top).toBeGreaterThanOrEqual(advisor.bottom)
    expectWithinPx(buyers.left + buyers.width / 2, (await layoutWidth(page)) / 2, 2)
    expect(buyers.right).toBeLessThanOrEqual(PHONE.width)
    // Measured 633.95 of 844: the link's bottom, 210.05px of room. The row is 163.97px tall here, 2.98 under
    // the pill row's 166.95, so everything below it rose by that much on 2026-09-17.
    expectWithinPx(buyers.bottom, 633.95, 0.5)
    expect(buyers.bottom, "inside the first viewport").toBeLessThanOrEqual(PHONE.height - CLEARANCE)
    await expectFilmPastFoldAndBadgeRow(page, PHONE)
    // Composition A at the phone rhythm: 64 · 16 · 20 · 32 · 20 · 24, the gaps it had before the desktop line of
    // air, with no air of its own at 844px of height.
    await expectGaps(page, PHONE, compositionFor(PHONE.height, PHONE.width))
  })
})

test.describe(`${NARROW_PHONE.width}×${NARROW_PHONE.height}`, () => {
  test.use({ viewport: NARROW_PHONE, hasTouch: true })

  /**
   * The tightest viewport the site lays out for, and the one that decides the phone rhythm: at 320 each of the
   * three actions takes its own line (163.97px of row) and the copy wraps to three headline lines, so the
   * desktop line of air put the buyers entry 17.95px UNDER a 640px fold. With composition A held at its phone
   * gaps it is inside it again, and the 2026-09-17 demotion bought a further 2.98px, the difference between the
   * link's 44px box and the pill's 46.98: measured bottom 633.95, 6.05px of room, against the pill's 636.94 and
   * 3.06. Every viewport 834px wide and up keeps the added air. The console's head is the one thing this
   * viewport cannot fit, as it could not before (measured 82px under the fold).
   */
  test("keeps the buyers link whole, centred and inside the fold, at the phone rhythm", async ({ page }) => {
    await land(page)
    const buyers = await expectActionRow(page)
    await expect(page.getByText(EYEBROW)).toBeVisible()
    expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize)).toBe("28px")
    expect(await lineCount(page.locator("h1"))).toBe(
      headlineLines(compositionFor(NARROW_PHONE.height, NARROW_PHONE.width))
    )
    expectWithinPx(buyers.left + buyers.width / 2, (await layoutWidth(page)) / 2, 2)
    expect(buyers.right).toBeLessThanOrEqual(NARROW_PHONE.width)
    expect(buyers.left).toBeGreaterThanOrEqual(0)
    expectWithinPx(buyers.bottom, 633.95, 0.5)
    expect(buyers.bottom, "inside the first viewport").toBeLessThanOrEqual(NARROW_PHONE.height)
    const tile = await box(heroTile(page))
    expect(buyers.bottom).toBeLessThanOrEqual(tile.bottom)
    await expectFilmPastFoldAndBadgeRow(page, NARROW_PHONE)
    // The four gaps that carry it there: 16 · 20 · 32 · 20, each 8px under its desktop base.
    const s = await expectGaps(page, NARROW_PHONE, compositionFor(NARROW_PHONE.height, NARROW_PHONE.width))
    expect(s.h1.top - s.eyebrow!.bottom).toBe(GAPS.A.h1 - 8)
    expect(s.lead.top - s.h1.bottom).toBe(GAPS.A.lead - 8)
    expect(s.cta.top - s.lead.bottom).toBe(GAPS.A.cta - 8)
    expect(s.badgeRow.top - s.cta.bottom).toBe(GAPS.A.row - 8)
  })
})
