import { expect, type Locator, type Page, test } from "@playwright/test"
import {
  advisorDialog,
  expectAnchorLanding,
  expectPath,
  NARROW_PHONE,
  PHONE,
  scrollScene,
  waitForFonts,
} from "./helpers"
import { lockupMetrics } from "../components/site/brand/BrandLockup"
import {
  CLUSTER_RESERVE,
  CONTEXT_LOCKUP_FROM,
  HOME_LOCKUP_FROM,
  NAV_WIDTH,
  PHONE_LOCKUP_FROM,
  WIDEST_CLUSTER,
} from "../lib/site/bar"
import { MOBILE_NAV_LINKS, type RoutePath, SUBNAV } from "../lib/site/routes"
import { BAR_H } from "../lib/site/scroll"

/**
 * The one sticky bar (Phase 4, fixes 1–3): its 52px flow box and surface in both states, the two states and
 * their thresholds, the brand lockup, the page context (the scrubber and the pill from landing on desktops, the
 * menu on phones), the page's one pill, the advisor from the bar, and the phone menu. Everything measured is
 * read from the served page.
 */

const DESKTOP_WIDE = { width: 1440, height: 900 }
const DESKTOP_SMALL = { width: 1280, height: 720 }
const CONTEXT_ROUTES = Object.keys(SUBNAV) as RoutePath[]
const ANCHOR_CTA_ROUTES = CONTEXT_ROUTES.filter((r) => SUBNAV[r]!.cta.href)
const ADVISOR_CTA_ROUTES = CONTEXT_ROUTES.filter((r) => !SUBNAV[r]!.cta.href)

/** A CSS locator, not a role query: the bar stays reachable while the advisor dialog hides the page behind it. */
const banner = (page: Page) => page.locator("header[role='banner']")
const surface = (page: Page) => page.getByTestId("bar-surface")
const visibleCta = (page: Page) => banner(page).locator('[data-testid="bar-cta"]:visible')
const visibleLockup = (page: Page) =>
  banner(page).getByRole("link", { name: "Heirloom home" }).locator("[data-testid='brand-lockup']:visible")
const primaryNav = (page: Page) => banner(page).getByRole("navigation", { name: "Primary navigation" })

/** The row's inset from both viewport edges and the grid gap that keeps each cluster clear of the navigation. */
const INSET = 24
const NAV_CLEAR = 24
/** The lockup's width at the bar's 28px mark, from the same function the component draws with. */
const LOCKUP_WIDTH_28 = lockupMetrics("horizontal", 28).width

/**
 * The contract's own numbers, written out once so the constants the tests below are expressed in are
 * themselves under test: a change to `BRAND_WORD_ADVANCE_EM` or to one of SiteBar's thresholds moves the
 * rendered page AND the expectation with it, and only these lines would notice.
 */
test("the bar's constants are the contract's numbers", () => {
  expect(LOCKUP_WIDTH_28, "the horizontal lockup at a 28px mark").toBeCloseTo(135.9, 1)
  expect(NAV_WIDTH, "the primary navigation").toBeCloseTo(366.95, 2)
  expect(WIDEST_CLUSTER, "the widest scrubber-and-pill cluster").toBeCloseTo(370.31, 2)
  expect(HOME_LOCKUP_FROM, "home's equal share holds the lockup from").toBe(735)
  expect(CONTEXT_LOCKUP_FROM, "a context page holds it from").toBe(970)
  expect(PHONE_LOCKUP_FROM, "a phone with no pill holds it from").toBe(236)
  expect(CLUSTER_RESERVE, "the insets, the mark, the gaps and the navigation").toBeCloseTo(490.95, 2)
})

async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
}

/** Three frames: the scroll event, the bar's own frame, and one more so a non-flip can be read as a fact. */
async function settleFrames(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      )
  )
}

async function expectState(page: Page, state: "landing" | "scrolled") {
  await expect(banner(page)).toHaveAttribute("data-state", state)
}

/** After the frames have settled the state is still `state`: the threshold was not crossed. */
async function expectStillState(page: Page, state: "landing" | "scrolled") {
  await settleFrames(page)
  expect(await banner(page).getAttribute("data-state")).toBe(state)
}

const boxOf = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, height: r.height, left: r.left, right: r.right, width: r.width }
  })

interface ReaderBoxes {
  scrubber: { top: number; height: number; left: number; width: number }
  track: { top: number; height: number; left: number; width: number }
  fill: { top: number; height: number; left: number; width: number }
}

/**
 * The scrubber, its reading track and the accent fill measured in ONE evaluation, so a label whose width
 * changes between two reads (the bar writes the current section from its own frame loop) cannot make the
 * three boxes disagree.
 */
const readerBoxes = (page: Page): Promise<ReaderBoxes> =>
  page.evaluate(() => {
    const read = (testid: string) => {
      const el = document.querySelector(`[data-testid='${testid}']`)
      if (!el) throw new Error(`no ${testid} in the bar`)
      const r = el.getBoundingClientRect()
      return { top: r.top, height: r.height, left: r.left, width: r.width }
    }
    return { scrubber: read("bar-scrubber"), track: read("bar-track"), fill: read("bar-progress") }
  })

/**
 * The page's own controls (every link and button in `main`) whose centre is on screen and NOT covered by the bar or
 * its open menu: with the menu open this must be empty, or the page's pill shows under the menu's own.
 */
function pageControlsShowingThroughMenu(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header[role='banner']")!
    const offenders: string[] = []
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("main a, main button"))) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (cx < 0 || cy < 0 || cx >= window.innerWidth || cy >= window.innerHeight) continue
      const hit = document.elementFromPoint(cx, cy)
      if (!hit || !header.contains(hit))
        offenders.push(`${el.tagName} "${(el.textContent ?? "").trim()}" at ${Math.round(cy)}`)
    }
    return offenders
  })
}

/** Filled pills a visitor can see in the banner (≥ 20×20 and visible; the sr-only skip link is not one). */
function visibleFilledPills(page: Page) {
  return banner(page).evaluate(
    (el) =>
      Array.from(el.querySelectorAll<HTMLElement>(".bg-primary")).filter((p) => {
        const r = p.getBoundingClientRect()
        return r.width >= 20 && r.height >= 20 && getComputedStyle(p).visibility !== "hidden"
      }).length
  )
}

/* ------------------------------------------------------------------------------------------------
 * One bar, sticky, a constant flow box, two states with hysteresis
 * ---------------------------------------------------------------------------------------------- */

/**
 * The bar is one layout component, so a cell of this matrix is unique only where the ROW's content differs:
 * the site row and a context row at a desktop and at a phone, the 404 (the only `data-context=site` page with
 * a scrolled phone pill), and the narrowest phone carrying the longest page pill beside the mark. The other
 * 37 cells of the original 4 × 11 grid were repeats of these seven.
 */
for (const [path, vp, hasTouch] of [
  ["/", DESKTOP_WIDE, false],
  ["/", PHONE, true],
  ["/fees", DESKTOP_WIDE, false],
  ["/fees", PHONE, true],
  ["/nothing-here", DESKTOP_WIDE, false],
  ["/nothing-here", PHONE, true],
  ["/buyers", NARROW_PHONE, true],
] as const) {
  test.describe(`${path} at ${vp.width}×${vp.height}`, () => {
    test.use({ viewport: vp, hasTouch })

    const context = Boolean(SUBNAV[path as RoutePath])
    test(`one bar, sticky at 0, a ${BAR_H}px flow box and a ${BAR_H}px surface in both states, flipping at 44 and back at 16`, async ({
      page,
    }) => {
      await page.goto(path)
      await waitForFonts(page)
      await expect(banner(page)).toHaveCount(1)
      await expect(banner(page)).toHaveAttribute("data-context", context ? "page" : "site")

      await scrollTo(page, 2000)
      await expectState(page, "scrolled")
      const scrolled = await boxOf(banner(page))
      expect(scrolled.top, "the bar's top after 2000px").toBe(0)
      expect(scrolled.height, "the bar's flow box").toBe(BAR_H)
      expect((await boxOf(surface(page))).top, "the surface's top").toBe(0)
      expect((await boxOf(surface(page))).height, "the surface once scrolled").toBe(BAR_H)

      await scrollTo(page, 0)
      await expectState(page, "landing")
      expect((await boxOf(banner(page))).height, "the flow box at landing").toBe(BAR_H)
      expect((await boxOf(surface(page))).height, "the surface at landing: no second row").toBe(BAR_H)
      // The page starts directly under the bar: main's top is the bar's bottom edge.
      expect((await boxOf(page.locator("main#main"))).top, "main starts under the bar").toBe(BAR_H)

      await scrollTo(page, 43)
      await expectStillState(page, "landing")
      await scrollTo(page, 44)
      await expectState(page, "scrolled")
      await scrollTo(page, 17)
      await expectStillState(page, "scrolled")
      await scrollTo(page, 16)
      await expectState(page, "landing")
      expect((await boxOf(banner(page))).height, "the flow box never changes").toBe(BAR_H)
    })
  })
}

/* ------------------------------------------------------------------------------------------------
 * The row: the brand and the pill equidistant from their edges, the navigation centred on the viewport
 * ---------------------------------------------------------------------------------------------- */

interface RowGeometry {
  vw: number
  scrollWidth: number
  brand: { left: number; right: number; width: number }
  lockup: { variant: string | null; left: number; right: number; width: number; height: number }
  nav: { left: number; right: number; width: number; centre: number } | null
  cluster: { left: number; right: number; width: number }
  /** The right-most visible control's right edge (the page pill, or the advisor pill). */
  pillRight: number
  scrubber: { left: number; right: number; width: number; text: string; truncatedBy: number } | null
  /** Every element in the banner whose box leaves the viewport sideways. */
  outside: string[]
}

/** Reads the row from the served page: boxes, the navigation's centre against the viewport's, the overflow. */
function rowGeometry(page: Page): Promise<RowGeometry> {
  return banner(page).evaluate((header) => {
    const vw = document.documentElement.clientWidth
    const box = (el: Element) => {
      const r = el.getBoundingClientRect()
      return { left: r.left, right: r.right, width: r.width, height: r.height }
    }
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"
    }
    const brand = header.querySelector("a[aria-label='Heirloom home']")!
    const lockupEl = Array.from(brand.querySelectorAll("[data-testid='brand-lockup']")).find(visible)!
    const navEl = header.querySelector("nav[aria-label='Primary navigation']")!
    const navBox = visible(navEl) ? box(navEl) : null
    const clusterEl = brand.parentElement!.lastElementChild!
    const pills = Array.from(
      header.querySelectorAll<HTMLElement>("[data-testid='bar-cta'], [data-testid='open-advisor']")
    ).filter(visible)
    const scrubberEl = header.querySelector<HTMLElement>("[data-testid='bar-scrubber']")
    const label = scrubberEl?.firstElementChild as HTMLElement | undefined
    // Visually hidden text (the skip link, the brand's word for readers) sits in a clipped 1px box; it is not layout.
    const outside = Array.from(header.querySelectorAll<HTMLElement>("*"))
      .filter((el) => visible(el) && el.id !== "mobile-nav" && !el.classList.contains("sr-only"))
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.left < -0.5 || r.right > vw + 0.5
      })
      .map(
        (el) => `${el.tagName}.${el.className.toString().split(" ")[0]} ${(el.textContent ?? "").trim().slice(0, 24)}`
      )
    return {
      vw,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      brand: box(brand),
      lockup: { variant: lockupEl.getAttribute("data-variant"), ...box(lockupEl) },
      nav: navBox ? { ...navBox, centre: (navBox.left + navBox.right) / 2 } : null,
      cluster: box(clusterEl),
      pillRight: Math.max(...pills.map((p) => p.getBoundingClientRect().right)),
      scrubber:
        scrubberEl && visible(scrubberEl) && label
          ? {
              ...box(scrubberEl),
              text: scrubberEl.textContent ?? "",
              truncatedBy: Math.max(0, label.scrollWidth - label.clientWidth),
            }
          : null,
      outside,
    }
  })
}

/** Lands the page's last section under the bar (bar + 16), so the scrubber reads its widest `title · section`. */
async function landSection(page: Page, hash: string) {
  await page.evaluate((sel) => {
    const top = document.querySelector(sel)!.getBoundingClientRect().top + window.scrollY - 68
    window.scrollTo({ top, behavior: "instant" })
  }, hash)
}

/** The equal share each side column gets when both clusters fit: (viewport − insets − gaps − navigation) / 2. */
const shareAt = (vw: number) => (vw - 2 * INSET - 2 * NAV_CLEAR - NAV_WIDTH) / 2

/** The whole contract of the centred row, in one place; `expectedOffset` is the model's navigation shift (0 when all fits). */
async function expectCentredRow(page: Page, label: string, expectedOffset = 0) {
  const g = await rowGeometry(page)
  expect(g.brand.left, `${label}: the brand at the left inset`).toBe(INSET)
  expect(g.lockup.left, `${label}: the visible brand variant at the inset`).toBe(INSET)
  expect(Math.abs(g.pillRight - (g.vw - INSET)), `${label}: the pill at the right inset`).toBeLessThanOrEqual(0.5)
  expect(g.nav, `${label}: the primary navigation is in the row`).not.toBeNull()
  expect(
    Math.abs(g.nav!.centre - g.vw / 2 - expectedOffset),
    `${label}: the navigation's centre against the viewport's (offset ${g.nav!.centre - g.vw / 2}, expected ${expectedOffset})`
  ).toBeLessThanOrEqual(1)
  expect(g.nav!.left - g.lockup.right, `${label}: clear between the brand and the navigation`).toBeGreaterThanOrEqual(
    NAV_CLEAR - 0.5
  )
  expect(
    g.cluster.left - g.nav!.right,
    `${label}: clear between the navigation and the cluster`
  ).toBeGreaterThanOrEqual(NAV_CLEAR - 0.5)
  expect(g.outside, `${label}: nothing in the bar leaves the viewport`).toEqual([])
  expect(g.scrollWidth, `${label}: no horizontal scroll`).toBeLessThanOrEqual(g.vw)
  return g
}

test.describe("the centred row", () => {
  for (const vp of [DESKTOP_WIDE, DESKTOP_SMALL]) {
    for (const path of ["/", "/fees"] as const) {
      test(`${path} at ${vp.width}: the brand 24px from the left edge, the pill 24px from the right, the navigation centred on the viewport with 24px clear each side, in both states`, async ({
        page,
      }) => {
        await page.setViewportSize(vp)
        await page.goto(path)
        await waitForFonts(page)
        const landing = await expectCentredRow(page, "landing")
        expect(landing.lockup.variant, "the lockup at this width").toBe("horizontal")
        // The share each side column gets: the brand and the pill both fit theirs here, so the centre is exact.
        const share = shareAt(vp.width)
        expect(landing.lockup.width).toBeLessThanOrEqual(share)
        expect(landing.cluster.width).toBeLessThanOrEqual(share)
        expect(Math.abs(landing.nav!.width - NAV_WIDTH), "the navigation's width").toBeLessThanOrEqual(0.5)
        expect(
          Math.abs(landing.nav!.left - (INSET + share + NAV_CLEAR)),
          "the navigation starts after the share"
        ).toBeLessThanOrEqual(1)
        await scrollTo(page, 2000)
        await expectState(page, "scrolled")
        const scrolled = await expectCentredRow(page, "scrolled")
        expect(scrolled.nav, "the navigation holds its place across the flip").toEqual(landing.nav)
        expect(scrolled.lockup, "the brand holds across the flip").toEqual(landing.lockup)
        expect(scrolled.pillRight, "the pill holds across the flip").toBe(landing.pillRight)
        // And back again: the flip is alpha only in both directions, so every group returns to where it was.
        await scrollTo(page, 0)
        await expectState(page, "landing")
        const returned = await expectCentredRow(page, "back at landing")
        expect(returned.nav, "the navigation is where it started").toEqual(landing.nav)
        expect(returned.lockup, "the brand is where it started").toEqual(landing.lockup)
        expect(returned.pillRight, "the pill is where it started").toBe(landing.pillRight)
        if (path === "/fees") {
          // 2000px down the calculator is the current section, so the scrubber reads title · section.
          expect(scrolled.scrubber!.text, "the scrubber's reading once scrolled").toBe("Fees · Calculator")
          expect(scrolled.scrubber!.truncatedBy, "the label is whole").toBe(0)
        }
      })
    }
  }

  test("at 1920 the same 24px insets hold and the navigation stays on the viewport's centre", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 })
    await page.goto("/why")
    await waitForFonts(page)
    await landSection(page, "#today")
    const g = await expectCentredRow(page, "1920 /why widest reading")
    expect(g.lockup.variant).toBe("horizontal")
    expect(g.scrubber!.text).toBe("Why Heirloom · How businesses sell today")
    expect(g.scrubber!.truncatedBy).toBe(0)
    expect(Math.abs(g.cluster.width - WIDEST_CLUSTER), "the widest cluster on the site").toBeLessThanOrEqual(0.5)
  })

  test("where the widest cluster outgrows its share the navigation gives way by exactly the difference, whole labels, nothing overflowing: /why at 900 and 1024", async ({
    page,
  }) => {
    for (const width of [900, 1024]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/why")
      await waitForFonts(page)
      await landSection(page, "#today")
      await expect(page.getByTestId("bar-scrubber")).toHaveText("Why Heirloom · How businesses sell today")
      const shortfall = WIDEST_CLUSTER - shareAt(width)
      expect(shortfall, `${width}: the cluster is wider than its share`).toBeGreaterThan(0)
      const g = await expectCentredRow(page, `${width} /why widest reading`, -shortfall)
      // Under 970 the first column cannot hold the lockup beside this cluster; at 1024 it holds it with 54px to spare.
      expect(g.lockup.variant, `${width}: the brand variant`).toBe(width >= CONTEXT_LOCKUP_FROM ? "horizontal" : "mark")
      expect(g.scrubber!.truncatedBy, `${width}: the label is whole`).toBe(0)
      expect(Math.abs(g.cluster.width - WIDEST_CLUSTER)).toBeLessThanOrEqual(0.5)
      // At landing the cluster is narrow again and the navigation is back on the centre.
      await scrollTo(page, 0)
      await expectState(page, "landing")
      await expect(page.getByTestId("bar-scrubber")).toHaveText("Why Heirloom")
      await expectCentredRow(page, `${width} /why landing`)
    }
  })

  test(`at 834 the row cannot hold the mark, the navigation and the widest cluster whole (${Math.ceil(CLUSTER_RESERVE + WIDEST_CLUSTER)}px would), so the cluster is capped and the label truncates by the shortfall while nothing overlaps`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 834, height: 900 })
    await page.goto("/why")
    await waitForFonts(page)
    await landSection(page, "#today")
    await expect(page.getByTestId("bar-scrubber")).toContainText("Why Heirloom")
    const cap = 834 - CLUSTER_RESERVE
    const g = await expectCentredRow(page, "834 /why widest reading", -(cap - shareAt(834)))
    expect(g.lockup.variant).toBe("mark")
    expect(Math.abs(g.cluster.width - cap), "the cluster at its cap").toBeLessThanOrEqual(0.5)
    expect(g.scrubber!.truncatedBy, "the label truncates by the shortfall").toBeGreaterThan(0)
    expect(g.scrubber!.truncatedBy).toBeLessThanOrEqual(WIDEST_CLUSTER - cap + 1)
    await expect(page.getByTestId("bar-scrubber").locator("> span").first()).toHaveCSS("text-overflow", "ellipsis")
    // One section earlier the cluster fits under the cap again and the label is whole.
    await landSection(page, "#building")
    await expect(page.getByTestId("bar-scrubber")).toHaveText("Why Heirloom · What we are building")
    const whole = await rowGeometry(page)
    expect(whole.scrubber!.truncatedBy).toBe(0)
    expect(whole.outside).toEqual([])
  })

  test("every context page at 834 and 1440, at landing: the brand at the inset, the pill at the inset, nothing outside the viewport, the label whole", async ({
    page,
  }) => {
    for (const width of [834, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const path of CONTEXT_ROUTES) {
        await page.goto(path)
        await waitForFonts(page)
        const g = await rowGeometry(page)
        expect(g.brand.left, `${path} at ${width}`).toBe(INSET)
        expect(
          Math.abs(g.pillRight - (width - INSET)),
          `${path} at ${width}: the pill at the inset`
        ).toBeLessThanOrEqual(0.5)
        expect(g.outside, `${path} at ${width}`).toEqual([])
        expect(g.scrubber!.truncatedBy, `${path} at ${width}: the title is whole`).toBe(0)
        expect(g.cluster.left - g.nav!.right, `${path} at ${width}: clear to the navigation`).toBeGreaterThanOrEqual(
          NAV_CLEAR - 0.5
        )
        expect(g.nav!.left - g.lockup.right, `${path} at ${width}: clear from the brand`).toBeGreaterThanOrEqual(
          NAV_CLEAR - 0.5
        )
        expect(g.lockup.variant, `${path} at ${width}`).toBe(width >= CONTEXT_LOCKUP_FROM ? "horizontal" : "mark")
      }
    }
  })
})

/* ------------------------------------------------------------------------------------------------
 * The brand lockup and its thresholds
 * ---------------------------------------------------------------------------------------------- */

test.describe("the lockup", () => {
  test("home at 1440: the horizontal lockup at a 28px mark in both states, the mark forming once, the word beside it at the mark's height", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_WIDE)
    await page.goto("/")
    await waitForFonts(page)
    const lockup = visibleLockup(page)
    await expect(lockup).toHaveCount(1)
    await expect(lockup).toHaveAttribute("data-variant", "horizontal")
    const mark = lockup.locator("[data-testid='brand-mark']")
    await expect(mark.locator("> g")).toHaveClass(/animate-mark-in/)
    await expect(mark.locator("> g")).toHaveCSS("animation-name", "hl-mark-in")
    const wordmark = lockup.locator("[data-testid='brand-wordmark']")
    await expect(wordmark).toBeVisible()
    await expect(wordmark).toHaveText("Heirloom")
    // The word in Mona Sans at 450 and width 90, 27.5px (0.9821 of the mark), no tracking, no shift.
    await expect(wordmark).toHaveCSS("font-family", /^"Mona Sans"/)
    await expect(wordmark).toHaveCSS("font-weight", "450")
    await expect(wordmark).toHaveCSS("font-stretch", "90%")
    await expect(wordmark).toHaveCSS("font-size", "27.5px")
    await expect(wordmark).toHaveCSS("line-height", "27.5px")
    await expect(wordmark).toHaveCSS("letter-spacing", "normal")
    await expect(wordmark).toHaveCSS("position", "static")
    expect(
      Math.abs((await boxOf(wordmark)).width - lockupMetrics("horizontal", 28).word!.width),
      "the word's box"
    ).toBeLessThanOrEqual(0.5)
    expect(
      Math.abs((await boxOf(wordmark)).height - lockupMetrics("horizontal", 28).word!.fontSize),
      "the word's em box is its font-size"
    ).toBeLessThanOrEqual(0.5)
    await expect
      .poll(async () => (await boxOf(mark)).height, { message: "the mark at its full height once the mark-in ends" })
      .toBeGreaterThanOrEqual(27.99)
    expect(Math.round((await boxOf(mark)).height), "the mark's rendered height").toBe(28)
    // The lockup is the Heirloom green on the bar's dark surface (`text-heirloom` under `on-dark`, #4ca270),
    // in both states: only the bar's material changes at the flip, never the brand's colour.
    await expect(lockup).toHaveCSS("color", "rgb(76, 162, 112)")
    const landing = await boxOf(lockup)
    expect(Math.abs(landing.width - LOCKUP_WIDTH_28), "the lockup's width at 28").toBeLessThanOrEqual(0.5)
    expect(landing.left, "the lockup at the inset").toBe(INSET)
    const brand = banner(page).getByRole("link", { name: "Heirloom home" })
    expect(
      Math.abs((await boxOf(brand)).width - LOCKUP_WIDTH_28),
      "the brand link is the lockup's width"
    ).toBeLessThanOrEqual(0.5)
    await expect(lockup).toHaveCSS("transform", "none")
    const firstGroup = primaryNav(page).locator("> *").first()
    const gapAtLanding = (await boxOf(firstGroup)).left - landing.right
    expect(gapAtLanding, "the gap from the lockup to the first group").toBeGreaterThanOrEqual(NAV_CLEAR)
    await scrollTo(page, 2000)
    await expectState(page, "scrolled")
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "horizontal")
    await expect(lockup).toHaveCSS("color", "rgb(76, 162, 112)")
    const scrolled = await boxOf(lockup)
    expect(scrolled.width, "the same lockup once scrolled").toBe(landing.width)
    expect(scrolled.left).toBe(INSET)
    await expect(lockup).toHaveCSS("transform", "none")
    expect(Math.round((await boxOf(mark)).height), "the mark once scrolled").toBe(28)
    await expect(primaryNav(page)).toHaveCSS("transform", "none")
    expect((await boxOf(firstGroup)).left - scrolled.right, "the gap holds across the flip").toBe(gapAtLanding)
  })

  test(`home holds the lockup at every desktop width: its equal share reaches the lockup at ${HOME_LOCKUP_FROM}px, under the 834px nav breakpoint, so at 834 and 900 the lockup shows in both states with the row centred`, async ({
    page,
  }) => {
    for (const width of [834, 900]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/")
      await waitForFonts(page)
      await expect(visibleLockup(page)).toHaveAttribute("data-variant", "horizontal")
      const at = await expectCentredRow(page, `home at ${width}`)
      expect(at.lockup.variant).toBe("horizontal")
      expect(Math.abs(at.lockup.width - LOCKUP_WIDTH_28), `${width}: the lockup's width`).toBeLessThanOrEqual(0.5)
      expect(at.lockup.width, `${width}: the lockup inside its share`).toBeLessThanOrEqual(shareAt(width))
      await scrollTo(page, 2000)
      await expectState(page, "scrolled")
      await expect(visibleLockup(page)).toHaveAttribute("data-variant", "horizontal")
      const scrolled = await expectCentredRow(page, `home at ${width} scrolled`)
      expect(scrolled.lockup, `${width}: the brand holds across the flip`).toEqual(at.lockup)
    }
  })

  test(`a page with context shows the lockup from ${CONTEXT_LOCKUP_FROM}px wide, where the first column holds it beside the site's widest cluster, and the mark one pixel under`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: CONTEXT_LOCKUP_FROM, height: 900 })
    await page.goto("/why")
    await waitForFonts(page)
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "horizontal")
    // The widest reading on the site: the cluster takes its column, the lockup still has its 24px to the navigation.
    await landSection(page, "#today")
    await expect(page.getByTestId("bar-scrubber")).toHaveText("Why Heirloom · How businesses sell today")
    const shortfall = WIDEST_CLUSTER - shareAt(CONTEXT_LOCKUP_FROM)
    const at = await expectCentredRow(page, `${CONTEXT_LOCKUP_FROM} /why widest reading`, -shortfall)
    expect(at.lockup.variant).toBe("horizontal")
    expect(at.scrubber!.truncatedBy).toBe(0)
    expect(at.nav!.left - at.lockup.right, "the lockup's clear to the navigation").toBeLessThanOrEqual(NAV_CLEAR + 1)
    await page.setViewportSize({ width: CONTEXT_LOCKUP_FROM - 1, height: 900 })
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "mark")
    const under = await expectCentredRow(
      page,
      `${CONTEXT_LOCKUP_FROM - 1} /why widest reading`,
      -(WIDEST_CLUSTER - shareAt(CONTEXT_LOCKUP_FROM - 1))
    )
    expect(under.lockup.width).toBe(28)
    // Other pages read narrower, yet the rule is static: /fees shows the mark at the same width in both states.
    await page.goto("/fees")
    await waitForFonts(page)
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "mark")
    await scrollTo(page, 2000)
    await expectState(page, "scrolled")
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "mark")
    await page.setViewportSize({ width: CONTEXT_LOCKUP_FROM, height: 900 })
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "horizontal")
  })

  test(`home at 320 shows the lockup whole at landing (it needs only ${PHONE_LOCKUP_FROM}px beside the menu button) and the mark with the pill once scrolled`, async ({
    page,
  }) => {
    // The phone threshold: 24 + 135.9 + 8 + 44 + 24 = 235.9, so from 236, under the narrowest phone: no rule carries it.
    expect(INSET + LOCKUP_WIDTH_28 + 8 + 44 + INSET).toBeLessThanOrEqual(PHONE_LOCKUP_FROM)
    expect(INSET + LOCKUP_WIDTH_28 + 8 + 44 + INSET).toBeGreaterThan(PHONE_LOCKUP_FROM - 1)
    expect(PHONE_LOCKUP_FROM).toBeLessThan(NARROW_PHONE.width)
    await page.setViewportSize(NARROW_PHONE)
    await page.goto("/")
    await waitForFonts(page)
    const lockup = visibleLockup(page)
    await expect(lockup).toHaveAttribute("data-variant", "horizontal")
    expect(await visibleFilledPills(page), "no pill in the row at landing").toBe(0)
    const box = await boxOf(lockup)
    expect(box.left, "the lockup at the left inset").toBe(INSET)
    expect(Math.abs(box.width - LOCKUP_WIDTH_28), "the lockup whole").toBeLessThanOrEqual(0.5)
    await expect(lockup.locator("[data-testid='brand-wordmark']")).toHaveText("Heirloom")
    const burger = page.getByTestId("nav-burger")
    expect((await boxOf(burger)).left, "the menu button clears the lockup").toBeGreaterThanOrEqual(box.right + 8)
    expect((await boxOf(burger)).right, "the menu button inside the viewport").toBeLessThanOrEqual(NARROW_PHONE.width)
    await scrollTo(page, 2000)
    await expectState(page, "scrolled")
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "mark")
    expect(await visibleFilledPills(page), "the advisor pill in the row").toBe(1)
    const mark = await boxOf(visibleLockup(page))
    expect(mark.left).toBe(INSET)
    expect(mark.width).toBe(28)
    // The pill stands between the mark and the menu button, clear of both.
    const pill = banner(page).locator('[data-testid="open-advisor"]:visible')
    expect((await boxOf(pill)).left, "the pill clears the mark").toBeGreaterThanOrEqual(INSET + 28 + 8)
    expect((await boxOf(pill)).right, "the pill before the menu button").toBeLessThanOrEqual(
      (await boxOf(burger)).left - 8
    )
    await scrollTo(page, 0)
    await expectState(page, "landing")
    await expect(visibleLockup(page)).toHaveAttribute("data-variant", "horizontal")
    expect((await boxOf(visibleLockup(page))).width).toBe(box.width)
  })
})

/* ------------------------------------------------------------------------------------------------
 * The menus stay inside the viewport: the groups' under their triggers, the scrubber's from its end
 * ---------------------------------------------------------------------------------------------- */

test.describe("the menus", () => {
  for (const width of [834, 1440]) {
    test(`at ${width} every group's menu opens under its trigger inside the viewport, and the scrubber's hangs from its end`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/why")
      await waitForFonts(page)
      // The navigation at its left-most: the widest reading shifts it left at 834.
      await landSection(page, "#today")
      const triggers = primaryNav(page).getByRole("button")
      await expect(triggers).toHaveCount(3)
      for (let i = 0; i < 3; i++) {
        const trigger = triggers.nth(i)
        const card = trigger.locator("xpath=following-sibling::*[1]/*[1]")
        await trigger.focus()
        await expect(card).toBeVisible()
        const t = await boxOf(trigger)
        const c = await boxOf(card)
        expect(c.left, `menu ${i} starts 16px before its trigger`).toBe(t.left - 16)
        expect(c.left, `menu ${i} inside the viewport`).toBeGreaterThanOrEqual(0)
        expect(c.right, `menu ${i} inside the viewport`).toBeLessThanOrEqual(width)
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
        await expect(card).toBeHidden()
      }
      const scrubber = page.getByTestId("bar-scrubber")
      const card = scrubber.locator("xpath=following-sibling::*[1]/*[1]")
      await scrubber.focus()
      await expect(card).toBeVisible()
      const s = await boxOf(scrubber)
      const c = await boxOf(card)
      expect(Math.abs(c.right - (s.right + 16)), "the scrubber's menu ends 16px past its trigger").toBeLessThanOrEqual(
        0.5
      )
      expect(c.right, "inside the viewport").toBeLessThanOrEqual(width)
      expect(c.left).toBeGreaterThanOrEqual(0)
      expect(c.width, "the card's minimum width").toBeGreaterThanOrEqual(240)
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      await expect(card).toBeHidden()
      // At landing on /fees the trigger is at its narrowest and the end-aligned card still ends past it, inside the viewport.
      await page.goto("/fees")
      await waitForFonts(page)
      await page.getByTestId("bar-scrubber").focus()
      const fees = await boxOf(page.getByTestId("bar-scrubber"))
      const feesCard = await boxOf(page.getByTestId("bar-scrubber").locator("xpath=following-sibling::*[1]/*[1]"))
      expect(Math.abs(feesCard.right - (fees.right + 16))).toBeLessThanOrEqual(0.5)
      expect(feesCard.right).toBeLessThanOrEqual(width)
      // Hung from the trigger's start (16px before it, 240 wide) the card would have left the viewport: the reason it hangs from the end.
      expect(fees.left - 16 + 240, "a start-hung card's right edge").toBeGreaterThan(width)
    })
  }

  test("a dropdown link's navigation leaves no menu on screen once the pointer moves off the bar", async ({ page }) => {
    await page.setViewportSize(DESKTOP_WIDE)
    await page.goto("/")
    await waitForFonts(page)
    const group = primaryNav(page).locator(".nav-dd").nth(1)
    const trigger = group.getByRole("button")
    const card = group.locator(".nav-dd-menu")
    await expect(trigger).toHaveText(/The process/)
    await trigger.hover()
    await expect(card).toBeVisible()

    await group.getByRole("link", { name: "How it works" }).click()
    await expectPath(page, "/how-it-works")
    // The clicked link kept the focus through the client-side navigation, and `.nav-dd:focus-within` held the
    // card open over the new page until the visitor clicked elsewhere. The bar blurs it on the route change.
    await page.mouse.move(DESKTOP_WIDE.width / 2, DESKTOP_WIDE.height / 2)
    // Visibility flips at once (it is not in the transition), the opacity eases out over 0.18s.
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).opacity), { message: "the menu's opacity" })
      .toBe("0")
    expect(await card.evaluate((el) => getComputedStyle(el).visibility)).toBe("hidden")
    await expect(card).toBeHidden()
    expect(await trigger.evaluate((el) => el === document.activeElement), "the trigger is not focused").toBe(false)
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest("header[role='banner'] .nav-dd"))),
      "nothing inside a bar dropdown holds the focus"
    ).toBe(false)
  })

  test("Escape closes the menu the keyboard opened and keeps the focus on its trigger", async ({ page }) => {
    await page.setViewportSize(DESKTOP_WIDE)
    await page.goto("/")
    await waitForFonts(page)
    const group = primaryNav(page).locator(".nav-dd").first()
    const trigger = group.getByRole("button")
    const card = group.locator(".nav-dd-menu")
    const opacity = () => card.evaluate((el) => getComputedStyle(el).opacity)
    await trigger.focus()
    await expect(card).toBeVisible()
    await expect.poll(opacity, { message: "the menu's opacity once focused" }).toBe("1")

    // Before the fix Escape did nothing here: the card is opened by CSS alone (`.nav-dd:focus-within`), so with
    // the trigger focused it stayed visible at opacity 1 and only Tab could dismiss it.
    await page.keyboard.press("Escape")
    await expect.poll(opacity, { message: "the menu's opacity after Escape" }).toBe("0")
    expect(await card.evaluate((el) => getComputedStyle(el).visibility)).toBe("hidden")
    await expect(card).toBeHidden()
    // The visitor keeps their place in the tab order, and only this group is dismissed.
    await expect(trigger).toBeFocused()
    expect(await group.getAttribute("data-closed")).toBe("true")
    const other = primaryNav(page).locator(".nav-dd").nth(1)
    expect(await other.getAttribute("data-closed")).toBeNull()

    // Pressing the trigger again opens it, and so does leaving the group and coming back with the keyboard.
    await page.keyboard.press("ArrowDown")
    await expect(card).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(card).toBeHidden()
    await page.keyboard.press("Shift+Tab")
    await page.keyboard.press("Tab")
    await expect(trigger).toBeFocused()
    await expect(card).toBeVisible()
    // Tab on through the card's rows: the menu the visitor is inside stays open.
    await page.keyboard.press("Tab")
    await expect(group.getByRole("link", { name: "Sell my business" })).toBeFocused()
    await expect(card).toBeVisible()
    // And leaving the group backwards takes the menu with the focus.
    await page.keyboard.press("Shift+Tab")
    await expect(trigger).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(banner(page).getByRole("link", { name: "Heirloom home" })).toBeFocused()
    await expect(card).toBeHidden()
  })
})

/* ------------------------------------------------------------------------------------------------
 * Page context: the scrubber and the pill from landing on desktops, the menu on phones
 * ---------------------------------------------------------------------------------------------- */

test.describe("page context at 1440", () => {
  test.use({ viewport: DESKTOP_WIDE })

  for (const path of CONTEXT_ROUTES) {
    const entry = SUBNAV[path]!
    test(`${path}: the scrubber reads the title at landing, then title · section once one is current, every section landing under the bar and lit as current, and the advisor entry where the pill is an anchor`, async ({
      page,
    }) => {
      await page.goto(path)
      await waitForFonts(page)
      await expectState(page, "landing")
      const scrubber = page.getByTestId("bar-scrubber")
      await expect(scrubber).toBeVisible()
      await expect(scrubber).toHaveText(entry.title)
      await expect(scrubber).toHaveAttribute("aria-haspopup", "true")
      const pageNav = page.getByRole("navigation", { name: "Page navigation" })
      await expect(pageNav).toHaveCount(1)
      await expect(pageNav).toContainText(entry.title)
      expect((await boxOf(scrubber)).height, "the scrubber's hit height").toBe(44)
      expect((await boxOf(scrubber)).top, "in the global row").toBe((BAR_H - 44) / 2)
      // The pill beside it, at landing, ends at the viewport's right inset.
      const pill = visibleCta(page)
      await expect(pill).toHaveText(entry.cta.label)
      expect(Math.abs((await boxOf(pill)).right - (DESKTOP_WIDE.width - INSET))).toBeLessThanOrEqual(0.5)
      expect((await boxOf(pill)).left).toBeGreaterThanOrEqual((await boxOf(scrubber)).right + 20)
      const menu = scrubber.locator("xpath=following-sibling::*[1]")
      const menuLinks = menu.getByRole("link")
      const advisorEntry = menu.getByTestId("open-advisor")
      // Closed until the trigger takes focus: the card's rows are not in the accessibility tree.
      await expect(menuLinks.first().or(advisorEntry).first()).toBeHidden()
      await expect(advisorEntry).toHaveCount(entry.cta.href ? 1 : 0)
      await scrubber.focus()
      await expect(menuLinks).toHaveCount(entry.links.length)
      await expect(menuLinks).toHaveText(entry.links.map((l) => l.label))
      for (let i = 0; i < entry.links.length; i++) {
        await expect(menuLinks.nth(i)).toHaveAttribute("href", entry.links[i]!.href)
        await expect(menuLinks.nth(i)).toBeVisible()
        await expect(menuLinks.nth(i)).not.toHaveAttribute("aria-current", "true")
      }
      if (entry.cta.href) {
        await expect(advisorEntry).toBeVisible()
        await expect(advisorEntry).toHaveText("Talk to an advisor")
        await advisorEntry.click()
        await expect(advisorDialog(page)).toBeVisible()
        await page.keyboard.press("Escape")
        await expect(advisorDialog(page)).toBeHidden()
      }
      // Leave the trigger (the dialog handed focus back to it) so the card closes before the scroll.
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      await page.mouse.move(0, 0)
      await expect(menuLinks.first().or(advisorEntry).first()).toBeHidden()

      await scrollTo(page, 2000)
      await expectState(page, "scrolled")
      await expect(scrubber).toBeVisible()
      await expect(scrubber).toContainText(entry.title)
      await expect(pageNav).toHaveCount(1)
      expect((await boxOf(scrubber)).height, "the scrubber's hit height once scrolled").toBe(44)
      const rule = page.getByTestId("bar-progress")
      const ruleWidth = await rule.evaluate((el) => parseFloat((el as HTMLElement).style.width))
      expect(ruleWidth, "the reading rule follows page progress").toBeGreaterThan(0)
      expect(ruleWidth).toBeLessThanOrEqual(100)
      await expect(rule).toHaveCSS("height", "2px")
      // The rule reads against a visible hairline track the label's width; the accent fill sits inside it.
      const track = page.getByTestId("bar-track")
      await expect(track).toHaveCSS("height", "2px")
      await expect(track).toHaveCSS("background-color", "rgba(240, 248, 242, 0.14)")
      // All three boxes in one measurement: the scrubber's label can change width between reads (the current
      // section is written from the bar's own frame loop), which made three separate reads a race.
      const rowBoxes = await readerBoxes(page)
      expect(Math.abs(rowBoxes.track.width - rowBoxes.scrubber.width), "the track spans the label").toBeLessThanOrEqual(
        0.5
      )
      expect(rowBoxes.track.left, "the track starts with the label").toBe(rowBoxes.scrubber.left)
      // Sub-pixel layout: the rule's bottom edge and the hit box's bottom minus 12 agree to within half a pixel.
      expect(
        Math.abs(rowBoxes.track.top + rowBoxes.track.height - (rowBoxes.scrubber.top + rowBoxes.scrubber.height - 12)),
        "the track sits 12px up from the hit box's bottom"
      ).toBeLessThanOrEqual(0.5)
      expect(rowBoxes.fill.left, "the fill starts where the track does").toBeCloseTo(rowBoxes.track.left, 1)
      expect(rowBoxes.fill.width, "the fill is inside the track").toBeLessThanOrEqual(rowBoxes.track.width)
      expect(rowBoxes.fill.width).toBeGreaterThan(0)
      await expect(rule).toHaveCSS("background-color", "rgb(76, 226, 126)")

      // Where the page's own pill is an anchor, the advisor is reachable from the scrubber's menu once
      // scrolled too: the bar carries a way to an advisor on every page, in both states.
      if (entry.cta.href) {
        await scrubber.focus()
        await advisorEntry.click()
        await expect(advisorDialog(page)).toBeVisible()
        await page.keyboard.press("Escape")
        await expect(advisorDialog(page)).toBeHidden()
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
        await page.mouse.move(0, 0)
      }

      if (entry.links.length === 0) {
        await expect(scrubber).toHaveText(entry.title)
        return
      }
      for (let i = 0; i < entry.links.length; i++) {
        const link = entry.links[i]!
        await scrubber.focus()
        await expect(menuLinks.nth(i)).toBeVisible()
        await menuLinks.nth(i).click()
        await expectPath(page, `${path}${link.href}`)
        await expectAnchorLanding(page, link.href)
        await expect(menuLinks.nth(i)).toHaveAttribute("aria-current", "true")
        for (let j = 0; j < entry.links.length; j++) {
          if (j !== i) await expect(menuLinks.nth(j)).not.toHaveAttribute("aria-current", "true")
        }
        await expect(scrubber).toHaveText(`${entry.title} · ${link.label}`)
      }
    })
  }

  test("how it works: half way through the stages scene the eight stages are the current section", async ({ page }) => {
    await page.goto("/how-it-works")
    await scrollScene(page, "stages-scene", 0.5)
    await expectState(page, "scrolled")
    const scrubber = page.getByTestId("bar-scrubber")
    await expect(scrubber).toHaveText("How it works · The eight stages")
    const menu = scrubber.locator("xpath=following-sibling::*[1]")
    await scrubber.focus()
    await expect(menu.getByRole("link", { name: "The eight stages" })).toHaveAttribute("aria-current", "true")
    await expect(menu.getByRole("link", { name: "Financial preparation" })).not.toHaveAttribute("aria-current", "true")
    await expect(menu.getByRole("link", { name: "Timing" })).not.toHaveAttribute("aria-current", "true")
  })

  test("the material turns to glass with a hairline at the flip while the scrubber and the pill stay where they are", async ({
    page,
  }) => {
    await page.goto("/fees")
    await waitForFonts(page)
    await expect(surface(page)).toHaveCSS("background-color", "rgb(4, 18, 12)")
    await expect(surface(page)).toHaveCSS("backdrop-filter", "none")
    const hairline = surface(page).locator("> span[aria-hidden='true']").first()
    await expect(hairline).toHaveCSS("opacity", "0")
    const scrubber = page.getByTestId("bar-scrubber")
    await expect(scrubber).toBeVisible()
    const landing = { scrubber: await boxOf(scrubber), pill: await boxOf(visibleCta(page)) }
    expect((await boxOf(surface(page))).height, "the landing surface").toBe(BAR_H)
    await scrollTo(page, 60)
    await expectState(page, "scrolled")
    await expect(scrubber).toBeVisible()
    await expect(page.getByTestId("bar-scrubber")).toHaveCount(1)
    await expect(surface(page)).toHaveCSS("backdrop-filter", "saturate(1.8) blur(20px)")
    await expect(surface(page)).toHaveCSS("background-color", "color(srgb 0.0156863 0.0705882 0.0470588 / 0.78)")
    await expect(hairline).toHaveCSS("opacity", "1")
    expect((await boxOf(hairline)).height).toBe(1)
    expect((await boxOf(surface(page))).height, "the condensed surface").toBe(BAR_H)
    expect(await boxOf(scrubber), "the scrubber has not moved").toEqual(landing.scrubber)
    expect(await boxOf(visibleCta(page)), "the pill has not moved").toEqual(landing.pill)
    await expect(scrubber).toHaveCSS("transform", "none")
    await scrollTo(page, 0)
    await expectState(page, "landing")
    await expect(surface(page)).toHaveCSS("background-color", "rgb(4, 18, 12)")
    expect(await boxOf(scrubber)).toEqual(landing.scrubber)
  })
})

test.describe("page context at 390: in the menu", () => {
  test.use({ viewport: PHONE, hasTouch: true })

  for (const path of CONTEXT_ROUTES) {
    const entry = SUBNAV[path]!
    if (entry.links.length === 0) continue
    test(`${path}: the menu lists the sections first under the title, and each lands its target under the bar`, async ({
      page,
    }) => {
      await page.goto(path)
      await waitForFonts(page)
      await expect(page.getByRole("navigation", { name: "Page navigation" })).toHaveCount(0)
      await page.getByTestId("nav-burger").tap()
      const menu = page.locator("#mobile-nav")
      await expect(menu).toBeVisible()
      await expect(menu.locator("> span").first()).toHaveText(entry.title)
      const links = menu.getByRole("link")
      await expect(links).toHaveText([...entry.links.map((l) => l.label), ...MOBILE_NAV_LINKS.map((l) => l.label)])
      for (let i = 0; i < entry.links.length; i++) {
        const link = entry.links[i]!
        if (i > 0) await page.getByTestId("nav-burger").tap()
        await expect(links.nth(i)).toHaveAttribute("href", link.href)
        expect((await boxOf(links.nth(i))).height, `${link.label} row height`).toBeGreaterThanOrEqual(44)
        await links.nth(i).tap()
        await expect(menu).toBeHidden()
        await expectPath(page, `${path}${link.href}`)
        await expectAnchorLanding(page, link.href)
        expect(await page.evaluate(() => document.documentElement.style.overflow), "scrolling restored").toBe("")
      }
    })
  }
})

/* ------------------------------------------------------------------------------------------------
 * The page's one pill
 * ---------------------------------------------------------------------------------------------- */

for (const layout of [
  { name: "1440", viewport: DESKTOP_WIDE, desktop: true },
  { name: "390", viewport: PHONE, desktop: false },
]) {
  test.describe(`the page pill at ${layout.name}`, () => {
    test.use({ viewport: layout.viewport, hasTouch: !layout.desktop })

    for (const path of ANCHOR_CTA_ROUTES) {
      const cta = SUBNAV[path]!.cta
      test(`${path}: the pill is the page's anchor, ${cta.label}, and lands it under the bar in both states`, async ({
        page,
      }) => {
        await page.goto(path)
        await waitForFonts(page)
        const pill = visibleCta(page)
        await expect(pill).toHaveCount(1)
        await expect(pill).toHaveAttribute("href", cta.href!)
        await expect(pill).toHaveText(cta.label)
        expect(await visibleFilledPills(page)).toBe(1)
        await pill.click()
        await expectPath(page, `${path}${cta.href}`)
        await expectAnchorLanding(page, cta.href!)
        await expectState(page, "scrolled")
        // Once condensed the pill sits in the global row and still works.
        await page.goto(path)
        await scrollTo(page, 2000)
        await expectState(page, "scrolled")
        const condensed = visibleCta(page)
        await expect(condensed).toHaveCount(1)
        await expect(condensed).toHaveAttribute("href", cta.href!)
        await expect(condensed).toHaveText(cta.label)
        await condensed.click()
        await expectAnchorLanding(page, cta.href!)
        expect(await visibleFilledPills(page)).toBe(1)
      })
    }

    for (const path of ADVISOR_CTA_ROUTES) {
      test(`${path}: the pill is a button, Talk to an advisor, that opens the dialog in both states`, async ({
        page,
      }) => {
        await page.goto(path)
        await waitForFonts(page)
        const pill = visibleCta(page)
        await expect(pill).toHaveCount(1)
        await expect(pill).toHaveText("Talk to an advisor")
        expect(await pill.evaluate((el) => el.tagName)).toBe("BUTTON")
        expect(await visibleFilledPills(page), "one filled pill at landing").toBe(1)
        await pill.click()
        await expect(advisorDialog(page)).toBeVisible()
        await page.keyboard.press("Escape")
        await expect(advisorDialog(page)).toBeHidden()
        await scrollTo(page, 2000)
        await expectState(page, "scrolled")
        const condensed = visibleCta(page)
        await expect(condensed).toHaveCount(1)
        expect(await condensed.evaluate((el) => el.tagName)).toBe("BUTTON")
        await condensed.click()
        await expect(advisorDialog(page)).toBeVisible()
        expect(await visibleFilledPills(page)).toBe(1)
      })
    }

    test(`home: the advisor pill${layout.desktop ? " in both states" : " only once scrolled, 34px in a 44px hit box"}`, async ({
      page,
    }) => {
      await page.goto("/")
      await waitForFonts(page)
      const pill = banner(page).locator('[data-testid="open-advisor"]:visible')
      if (layout.desktop) {
        await expect(pill).toHaveCount(1)
        await expect(pill).toHaveText("Talk to an M&A advisor")
        expect((await boxOf(pill)).height).toBe(26)
        await scrollTo(page, 2000)
        await expectState(page, "scrolled")
        await expect(pill).toHaveCount(1)
        await pill.click()
        await expect(advisorDialog(page)).toBeVisible()
      } else {
        await expect(pill).toHaveCount(0)
        expect(await visibleFilledPills(page)).toBe(0)
        await scrollTo(page, 2000)
        await expectState(page, "scrolled")
        await expect(pill).toHaveCount(1)
        await expect(pill).toHaveText("Talk to an M&A advisor")
        const hit = await boxOf(pill)
        expect(hit.height, "the hit box").toBeGreaterThanOrEqual(44)
        expect((await boxOf(pill.locator("> span"))).height, "the visual pill").toBe(34)
        expect(await visibleFilledPills(page)).toBe(1)
        await pill.tap()
        await expect(advisorDialog(page)).toBeVisible()
      }
    })
  })
}

/* ------------------------------------------------------------------------------------------------
 * The phone menu
 * ---------------------------------------------------------------------------------------------- */

for (const vp of [PHONE, NARROW_PHONE]) {
  test.describe(`the phone menu at ${vp.width}`, () => {
    test.use({ viewport: vp, hasTouch: true })

    test("overlays the page as one opaque surface to the viewport's bottom, locks the page's scrolling while open, crosses the button's lines, closes on Escape back onto its button, and lists every destination once after the page's sections", async ({
      page,
    }) => {
      await page.goto("/fees")
      await waitForFonts(page)
      await scrollTo(page, 300)
      await expectState(page, "scrolled")
      const h1 = page.getByRole("heading", { level: 1 })
      const before = await boxOf(h1)
      const burger = page.getByTestId("nav-burger")
      // Closed: two 1px lines, 18px wide, at the top and bottom of a 7px box, neither turned.
      const glyph = burger.locator("> span[aria-hidden='true']")
      const lines = glyph.locator("> span")
      await expect(lines).toHaveCount(2)
      const closedGlyph = await boxOf(glyph)
      expect(closedGlyph.width).toBe(18)
      expect(closedGlyph.height).toBe(7)
      const closedTop = await boxOf(lines.nth(0))
      const closedBottom = await boxOf(lines.nth(1))
      expect(closedTop.height).toBe(1)
      expect(closedTop.width).toBe(18)
      expect(closedTop.top).toBe(closedGlyph.top)
      expect(closedBottom.top + closedBottom.height).toBe(closedGlyph.top + closedGlyph.height)
      await expect(lines.nth(0)).toHaveCSS("rotate", "none")
      await expect(lines.nth(1)).toHaveCSS("rotate", "none")
      await burger.tap()
      const menu = page.locator("#mobile-nav")
      await expect(menu).toBeVisible()
      await expect(banner(page)).toHaveAttribute("data-menu", "open")
      // Open: the lines meet at the box's centre and turn 45° each way, so the button reads as an X.
      await expect(lines.nth(0)).toHaveCSS("rotate", "45deg")
      await expect(lines.nth(1)).toHaveCSS("rotate", "-45deg")
      const openTop = await boxOf(lines.nth(0))
      const openBottom = await boxOf(lines.nth(1))
      const centre = (b: { top: number; height: number; left: number; width: number }) => [
        b.left + b.width / 2,
        b.top + b.height / 2,
      ]
      expect(centre(openTop).map(Math.round)).toEqual(centre(openBottom).map(Math.round))
      expect(centre(openTop).map(Math.round)).toEqual(centre(closedGlyph).map(Math.round))
      const after = await boxOf(h1)
      expect(after.top, "the page does not move under the overlay").toBe(before.top)
      expect(await page.evaluate(() => window.scrollY), "scroll position kept").toBe(300)
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden")
      expect((await boxOf(menu)).top, "the panel hangs under the bar").toBe(BAR_H)
      const menuBox = await boxOf(menu)
      expect(menuBox.top + menuBox.height, "the panel fits the viewport").toBeLessThanOrEqual(vp.height)
      // One opaque surface from the bar to the viewport's bottom: the page never shows through and none of its own
      // controls (the fees page's advisor pill sat right under the menu's) is reachable beside or below it.
      expect(menuBox.top + menuBox.height, "the panel reaches the viewport's bottom").toBeGreaterThanOrEqual(vp.height)
      expect(menuBox.width, "the panel spans the viewport").toBe(vp.width)
      await expect(menu).toHaveCSS("background-color", "rgb(4, 18, 12)")
      await expect(menu).toHaveCSS("backdrop-filter", "none")
      expect(await pageControlsShowingThroughMenu(page), "page controls showing through the menu").toEqual([])
      // The caption over the page's sections and the destinations under them read in the second tone on that surface.
      await expect(menu.locator("> span").first()).toHaveCSS("color", "rgb(180, 198, 186)")
      await expect(menu.getByRole("link", { name: "Calculator" })).toHaveCSS("color", "rgb(240, 248, 242)")
      await expect(menu.getByRole("link", { name: "Calculator" })).toHaveCSS("font-size", "21px")
      await expect(menu.getByRole("link", { name: "For buyers" })).toHaveCSS("color", "rgb(180, 198, 186)")
      await expect(menu.getByRole("link", { name: "Fees", exact: true })).toHaveCSS("color", "rgb(180, 198, 186)")
      await expect(menu.getByRole("link", { name: "Fees", exact: true })).toHaveCSS("font-size", "21px")

      const links = menu.getByRole("link")
      await expect(links).toHaveText([
        "Calculator",
        "Other costs",
        "Questions",
        ...MOBILE_NAV_LINKS.map((l) => l.label),
      ])
      for (let i = 0; i < MOBILE_NAV_LINKS.length; i++) {
        await expect(links.nth(i + 3)).toHaveAttribute("href", MOBILE_NAV_LINKS[i]!.href)
      }
      const advisor = menu.getByTestId("open-advisor")
      await expect(advisor).toHaveText("Talk to an M&A advisor")
      await expect(advisor).not.toHaveClass(/bg-primary/)
      expect(await visibleFilledPills(page), "the row's pill is the one filled pill").toBe(1)

      await page.keyboard.press("Escape")
      await expect(menu).toBeHidden()
      await expect(burger).toBeFocused()
      await expect(burger).toHaveAttribute("aria-expanded", "false")
      await expect(lines.nth(0)).toHaveCSS("rotate", "none")
      await expect(lines.nth(1)).toHaveCSS("rotate", "none")
      expect(await page.evaluate(() => document.documentElement.style.overflow), "restored").toBe("")
      expect(await page.evaluate(() => window.scrollY)).toBe(300)

      await burger.tap()
      await advisor.tap()
      await expect(advisorDialog(page)).toBeVisible()
      await expect(menu).toBeHidden()
    })

    test("home at landing: the menu's advisor entry is the filled pill and opens the dialog, on one opaque surface that covers the hero's own pills", async ({
      page,
    }) => {
      await page.goto("/")
      await waitForFonts(page)
      await page.getByTestId("nav-burger").tap()
      const menu = page.locator("#mobile-nav")
      await expect(menu.getByRole("link")).toHaveText(MOBILE_NAV_LINKS.map((l) => l.label))
      const menuBox = await boxOf(menu)
      expect(menuBox.top, "under the bar").toBe(BAR_H)
      expect(menuBox.top + menuBox.height, "to the viewport's bottom").toBeGreaterThanOrEqual(vp.height)
      expect(menuBox.top + menuBox.height).toBeLessThanOrEqual(vp.height)
      await expect(menu).toHaveCSS("background-color", "rgb(4, 18, 12)")
      expect(await pageControlsShowingThroughMenu(page), "page controls showing through the menu").toEqual([])
      const advisor = menu.getByTestId("open-advisor")
      await expect(advisor).toHaveClass(/bg-primary/)
      expect(await visibleFilledPills(page)).toBe(1)
      await advisor.tap()
      await expect(advisorDialog(page)).toBeVisible()
    })
  })
}
