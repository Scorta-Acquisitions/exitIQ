import { expect, type Locator, type Page } from "@playwright/test"
import { type QuestionId, QUESTIONS } from "../lib/site/exitiq/questions"
import { PAGE_META, type PageMeta, type RoutePath, ROUTES } from "../lib/site/routes"

/* ------------------------------------------------------------------------------------------------
 * Viewports
 * ---------------------------------------------------------------------------------------------- */

export const DESKTOP = { width: 1280, height: 720 }
export const PHONE = { width: 390, height: 844 }
export const NARROW_PHONE = { width: 320, height: 640 }

/* ------------------------------------------------------------------------------------------------
 * Route facts
 * ---------------------------------------------------------------------------------------------- */

export const META_BY_PATH = Object.fromEntries(
  (Object.keys(ROUTES) as Array<keyof typeof ROUTES>).map((k) => [ROUTES[k], PAGE_META[k]])
) as Record<RoutePath, PageMeta>

/** The exact h1 of every public page, read from `app/**\/page.tsx`. */
export const H1_BY_PATH: Record<RoutePath, string> = {
  "/": "Sell your business privately, with qualified buyers competing.",
  "/score": "Is the business ready to sell?",
  "/offer-review": "Know what the offer pays before you sign.",
  "/how-it-works": "The eight stages of a private sale.",
  "/fees": "Fees",
  "/confidentiality": "Confidentiality",
  "/buyers": "A verified record of who you are and what you buy",
  "/who-we-are": "Who we are",
  "/questions": "Questions owners ask.",
  "/why": "The buyer usually has more experience.",
}

export function h1For(path: string): string {
  const [pathname] = path.split(/[?#]/)
  const h1 = H1_BY_PATH[pathname as RoutePath]
  if (!h1) throw new Error(`no h1 recorded for ${path}`)
  return h1
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Assert the current URL is exactly `path` (query and hash included) on whatever origin serves the site. */
export async function expectPath(page: Page, path: string) {
  await expect(page).toHaveURL(new RegExp(`^https?://[^/]+${escapeRegExp(path)}$`))
}

/* ------------------------------------------------------------------------------------------------
 * Console hygiene
 * ---------------------------------------------------------------------------------------------- */

/**
 * Collects console errors, uncaught exceptions, and failed requests for the life of a page. Network
 * failures for the optional ambient videos are ignored; everything else fails the test when
 * `assertClean` runs. `assertClean` does not wait: assert the page state you care about first, then
 * call it.
 */
export function watchConsole(page: Page) {
  const errors: string[] = []
  const failedUrls: string[] = []
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`))
  page.on("response", (res) => {
    if (res.status() >= 400) failedUrls.push(res.url())
  })
  page.on("requestfailed", (req) => {
    const reason = req.failure()?.errorText ?? "failed"
    // An aborted request is a cancellation (Next.js drops a route prefetch when navigation moves on), not a failure.
    if (reason === "net::ERR_ABORTED") return
    failedUrls.push(`${req.url()} (${reason})`)
  })
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  const isOptionalMedia = (url: string) => /\/media\/[^/]+\.mp4/.test(url)
  return {
    errors,
    assertClean() {
      const unexpectedFailures = failedUrls.filter((u) => !isOptionalMedia(u))
      const relevant = errors.filter((text) => {
        // Chrome reports resource 404s without the URL; only ignore them when every failed request was optional media.
        if (/Failed to load resource/.test(text)) return unexpectedFailures.length > 0
        return true
      })
      expect(unexpectedFailures, `unexpected failed requests:\n${unexpectedFailures.join("\n")}`).toEqual([])
      expect(relevant, `console errors:\n${relevant.join("\n")}`).toEqual([])
    },
  }
}

/* ------------------------------------------------------------------------------------------------
 * Page-level expectations
 * ---------------------------------------------------------------------------------------------- */

/**
 * The page rendered: 200, metadata, h1, the header chrome for the layout, and the footer. Ends by
 * opening and closing the advisor dialog from the header, which proves the page hydrated (a
 * server-rendered button does nothing until React attaches its handler).
 */
export async function expectRouteRenders(page: Page, path: RoutePath, layout: "desktop" | "mobile") {
  const response = await page.goto(path)
  expect(response?.status(), `${path} status`).toBe(200)
  await expect(page).toHaveTitle(META_BY_PATH[path].title)
  await expect(page.locator("meta[name='description']")).toHaveAttribute("content", META_BY_PATH[path].description)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(H1_BY_PATH[path])
  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" })
  const burger = page.getByTestId("nav-burger")
  if (layout === "desktop") {
    await expect(primaryNav).toBeVisible()
    await expect(burger).toBeHidden()
  } else {
    await expect(primaryNav).toBeHidden()
    await expect(burger).toBeVisible()
  }
  await expect(page.getByRole("contentinfo")).toContainText("Heirloom works for sellers only.")

  await page.getByRole("banner").getByTestId("open-advisor").click()
  const dialog = page.getByRole("dialog", { name: "Talk to an M&A advisor" })
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
}

/** The document never scrolls sideways. Waits for web fonts first because a font swap can change widths. */
export async function expectNoHorizontalScroll(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready)
  const widths = await page.evaluate(() => ({
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    viewport: document.documentElement.clientWidth,
  }))
  expect(
    widths.scroll,
    `${label}: scrollWidth ${widths.scroll} exceeds viewport ${widths.viewport}`
  ).toBeLessThanOrEqual(widths.viewport)
}

/**
 * The element `hash` points at exists once, the URL carries the hash, and the element has been
 * scrolled to the top band of the viewport (0..200px, which covers the sticky header offset).
 */
export async function expectAnchorTarget(page: Page, href: string) {
  const hash = href.slice(href.indexOf("#"))
  await expectPath(page, href)
  await expect(page.locator(hash)).toHaveCount(1)
  const top = () => page.evaluate((sel) => document.querySelector(sel)?.getBoundingClientRect().top ?? Number.NaN, hash)
  await expect
    .poll(top, { message: `${hash} should scroll into the top band of the viewport` })
    .toBeLessThanOrEqual(200)
  expect(await top(), `${hash} top`).toBeGreaterThanOrEqual(0)
}

/* ------------------------------------------------------------------------------------------------
 * Scroll scenes
 * ---------------------------------------------------------------------------------------------- */

/** Scene progress as `lib/site/scroll.ts#sceneProgress` computes it, measured in the page. */
function measureSceneProgress(page: Page, testId: string) {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`)
    if (!el) throw new Error(`scene ${id} not found`)
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || 1
    if (rect.height <= vh) return 0
    return Math.max(0, Math.min(1, -rect.top / (rect.height - vh)))
  }, testId)
}

/**
 * Scroll the window so that `fraction` (0..1) of a tall scene has been scrolled through, then wait
 * until the measured progress is within 0.02 of the request.
 */
export async function scrollScene(page: Page, testId: string, fraction: number) {
  await page.evaluate(
    ([id, f]) => {
      const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null
      if (!el) throw new Error(`scene ${id} not found`)
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const travel = rect.height - window.innerHeight
      window.scrollTo({ top: top + travel * Number(f), behavior: "instant" })
    },
    [testId, String(fraction)] as const
  )
  await expect
    .poll(async () => Math.abs((await measureSceneProgress(page, testId)) - fraction), {
      message: `scene ${testId} should reach progress ${fraction} (±0.02)`,
    })
    .toBeLessThanOrEqual(0.02)
}

/** Assert the scene's sticky panel is pinned just below the header while the scene is in progress. */
export async function expectPinned(page: Page, testId: string) {
  const top = await page.evaluate((id) => {
    const panel = document.querySelector(`[data-testid="${id}"] > *`) as HTMLElement | null
    return panel ? Math.round(panel.getBoundingClientRect().top) : Number.NaN
  }, testId)
  expect(top, `${testId} panel top`).toBeGreaterThanOrEqual(70)
  expect(top, `${testId} panel top`).toBeLessThanOrEqual(90)
}

/* ------------------------------------------------------------------------------------------------
 * exitIQ
 * ---------------------------------------------------------------------------------------------- */

/** One deterministic run: seven chip labels that score "Prepare First" with exactly three findings. */
export const EXITIQ_ANSWERS: Record<QuestionId, string> = {
  type: "Business or professional services",
  rev: "$2M to $3M",
  trend: "Stayed about the same",
  sde: "$150K to $350K",
  books: "Close, with explainable differences",
  conc: "10% to 25%",
  owner: "It would run with a few calls from me",
}

const FINDING_BODIES = [
  "Professional-services buyers test whether clients belong to the firm or to the owner. Written engagement terms and a second relationship owner can reduce that risk.",
  "Stable revenue can be financeable. Retention, repeat business, contracts, and margins need to demonstrate durability.",
  "Small differences are common. Documented early, they become an explanation. Discovered late, they can become a reason to reduce the offer.",
]

/** What `EXITIQ_ANSWERS` must produce, written out rather than recomputed from the scoring module. */
export const EXITIQ_EXPECTED = {
  state: "Prepare First",
  description:
    "The business may be sellable, but a few issues are likely to weaken price, financing, or buyer confidence. Address them before the market sees the company.",
  fin: "76",
  tra: "59",
  evi: "64",
  findings: [
    "Client relationships may depend on you",
    "Revenue has been flat",
    "Minor book-to-tax differences need documentation",
  ],
  findingBodies: FINDING_BODIES,
  plan: [
    "Download two years of IRS tax transcripts and compare them with the business profit and loss statements.",
    "Stop running personal expenses through the business at the start of the next accounting period.",
    "Document customer retention and repeat revenue for the last 36 months.",
    "Prepare monthly profit and loss statements for the last 12 months.",
  ],
  planText:
    "exitIQ result and 90-day plan\n\nRecommendation: Prepare First\n\nTop findings:\n" +
    `1. Client relationships may depend on you\n   ${FINDING_BODIES[0]}\n` +
    `2. Revenue has been flat\n   ${FINDING_BODIES[1]}\n` +
    `3. Minor book-to-tax differences need documentation\n   ${FINDING_BODIES[2]}` +
    "\n\nYour next 90 days:\n" +
    "1. Download two years of IRS tax transcripts and compare them with the business profit and loss statements.\n" +
    "2. Stop running personal expenses through the business at the start of the next accounting period.\n" +
    "3. Document customer retention and repeat revenue for the last 36 months.\n" +
    "4. Prepare monthly profit and loss statements for the last 12 months." +
    "\n\nexitIQ is a readiness screen based on your answers. It is not a valuation, appraisal, financing decision, or assurance that a business will sell.",
  reviewBody:
    "exitIQ result review\nRecommendation: Prepare First\nFinanceability: 76\nTransferability: 59\nEvidence quality: 64\n\nTop findings:\n" +
    "1. Client relationships may depend on you\n2. Revenue has been flat\n3. Minor book-to-tax differences need documentation" +
    "\n\nMy answers:\n" +
    "- What kind of business do you run? Business or professional services\n" +
    "- About how much revenue did the business generate last year? $2M to $3M\n" +
    "- Over the last three years, what has happened to revenue? Stayed about the same\n" +
    "- About how much did the business earn before your pay and income taxes? $150K to $350K\n" +
    "- If a buyer compared your books with your tax returns, how closely would they match? Close, with explainable differences\n" +
    "- How much of last year’s revenue came from your largest customer? 10% to 25%\n" +
    "- If you stepped away for one month, what would happen? It would run with a few calls from me",
} as const

export const EXITIQ_EMPTY_STATE = "Answer seven questions to see your result."

/**
 * Answer the seven exitIQ questions inside `scope` (the /score run or the hero console). Waits for
 * each question heading before choosing, which also covers the short "reading your answer" pause.
 */
export async function answerExitIq(scope: Locator, answers: Record<QuestionId, string> = EXITIQ_ANSWERS) {
  for (const q of QUESTIONS) {
    await expect(scope.getByRole("heading", { name: q.q })).toBeVisible()
    await scope.getByRole("button", { name: answers[q.id], exact: true }).click()
  }
}

/* ------------------------------------------------------------------------------------------------
 * Advisor dialog
 * ---------------------------------------------------------------------------------------------- */

export function advisorDialog(page: Page): Locator {
  return page.getByTestId("advisor-dialog")
}

export async function openAdvisorFromHeader(page: Page): Promise<Locator> {
  await page.getByRole("banner").getByTestId("open-advisor").click()
  const dialog = advisorDialog(page)
  await expect(dialog).toBeVisible()
  return dialog
}

/** The value cell of one "Advisor briefing" row (`Conversation`, `Business`, `Revenue`, …). */
export function briefingRow(dialog: Locator, label: string): Locator {
  return dialog.getByText(label, { exact: true }).locator("xpath=following-sibling::span")
}

/* ------------------------------------------------------------------------------------------------
 * Forms
 * ---------------------------------------------------------------------------------------------- */

/** Resolves with the next POST to /api/inquiry. Call before the click that triggers it. */
export function waitForInquiry(page: Page) {
  return page.waitForRequest((req) => req.url().endsWith("/api/inquiry") && req.method() === "POST")
}
