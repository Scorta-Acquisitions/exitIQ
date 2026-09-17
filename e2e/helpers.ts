import { expect, type Locator, type Page } from "@playwright/test"
import { beatsPlayedInOrder } from "../lib/site/demo/clock"
import { type QuestionId, QUESTIONS } from "../lib/site/exitiq/questions"
import { PAGE_META, type PageMeta, type RoutePath, ROUTES } from "../lib/site/routes"
import { BAR_H, type FlowWindow } from "../lib/site/scroll"

/* ------------------------------------------------------------------------------------------------
 * Viewports
 * ---------------------------------------------------------------------------------------------- */

export const DESKTOP = { width: 1280, height: 720 }
export const PHONE = { width: 390, height: 844 }
export const NARROW_PHONE = { width: 320, height: 640 }

/* ------------------------------------------------------------------------------------------------
 * Route facts
 * ---------------------------------------------------------------------------------------------- */

const META_BY_PATH = Object.fromEntries(
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

function escapeRegExp(s: string): string {
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
  // The films, their posters, and the generated objects and textures are
  // optional: the site renders without them.
  const isOptionalMedia = (url: string) => /\/media\/[^/]+\.(mp4|jpg)|\/generated\//.test(url)
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
 * The page rendered: 200, metadata, h1, the bar's chrome for the layout (the primary navigation from the
 * nav breakpoint, the menu button below it), and the footer. Ends by opening and closing the advisor dialog
 * from the bar (`openAdvisorFromHeader`), which proves the page hydrated (a server-rendered button does
 * nothing until React attaches its handler).
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

  await openAdvisorFromHeader(page, layout)
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

/** Where `anchor-target` puts an anchor: `scroll-margin-top: calc(var(--bar-h) + 16px)`. */
const ANCHOR_LANDING = BAR_H + 16

/**
 * The element `hash` points at exists once and has landed exactly where `anchor-target` puts it:
 * `ANCHOR_LANDING` px from the viewport's top, ±1px for the browser's rounding. The one exception is an
 * anchor the document cannot scroll that far (a section at the very bottom): once the scroll is at its
 * maximum the only fact left is that the target sits under the bar rather than behind it.
 */
export async function expectAnchorLanding(page: Page, hash: string) {
  await expect(page.locator(hash)).toHaveCount(1)
  const measure = () =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel)
      const doc = document.documentElement
      return {
        top: el ? Math.round(el.getBoundingClientRect().top) : Number.NaN,
        atBottom: window.scrollY >= doc.scrollHeight - window.innerHeight - 1,
      }
    }, hash)
  const landed = async () => {
    const { top, atBottom } = await measure()
    if (atBottom) return top >= BAR_H ? "landed" : `top ${top}, page fully scrolled (wanted ≥ ${BAR_H})`
    return Math.abs(top - ANCHOR_LANDING) <= 1 ? "landed" : `top ${top} (wanted ${ANCHOR_LANDING} ±1)`
  }
  await expect
    .poll(landed, { message: `${hash} should land ${ANCHOR_LANDING}px down: the bar plus anchor-target's 16px` })
    .toBe("landed")
}

/** `expectAnchorLanding` for a full href: the URL carries the hash too. */
export async function expectAnchorTarget(page: Page, href: string) {
  await expectPath(page, href)
  await expectAnchorLanding(page, href.slice(href.indexOf("#")))
}

/* ------------------------------------------------------------------------------------------------
 * Scroll scenes
 * ---------------------------------------------------------------------------------------------- */

/** Resolves once every webfont the page uses has loaded, so measurements see the final layout. */
export async function waitForFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

/**
 * The scene's progress as the components measure it (`lib/site/scroll.ts#sceneProgress` with the bar): against
 * the pinned panel's travel under the bar (the panel is the viewport minus `BAR_H`, and progress starts when
 * the scene's top reaches the bar's bottom edge), or, given `flow` (a scene that flows on a short phone),
 * against the viewport-anchored window (`flowProgress`). The bar height is the constant the math uses, not a
 * value read from the page, so the test and the components agree by construction.
 */
function measureSceneProgress(page: Page, testId: string, flow?: FlowWindow) {
  return page.evaluate(
    ([id, w, bar]) => {
      const el = document.querySelector(`[data-testid="${id}"]`)
      if (!el) throw new Error(`scene ${id} not found`)
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      if (w) return Math.max(0, Math.min(1, (vh * w.start - rect.top) / (vh * w.travel)))
      const panel = vh - bar
      if (rect.height <= panel) return 0
      return Math.max(0, Math.min(1, (bar - rect.top) / (rect.height - panel)))
    },
    [testId, flow ?? null, BAR_H] as const
  )
}

/**
 * Scroll the window so that `fraction` (0..1) of a tall scene has been scrolled through, then wait
 * until the measured progress is within 0.02 of the request.
 */
export async function scrollScene(page: Page, testId: string, fraction: number, flow?: FlowWindow) {
  // The scroll target is computed from the page's layout, so the webfont must be in place first: a swap after
  // the target is computed reflows the copy above the scene and moves it.
  await waitForFonts(page)
  await page.evaluate(
    ([id, f, w, bar]) => {
      const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null
      if (!el) throw new Error(`scene ${id} not found`)
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const vh = window.innerHeight
      // A pinned scene's travel starts a bar's height above its top (where the bar's edge meets it) and runs
      // its height less the panel; a flowing scene's window is anchored to the viewport.
      const target = w
        ? top - vh * w.start + Number(f) * vh * w.travel
        : top - bar + (rect.height - (vh - bar)) * Number(f)
      window.scrollTo({ top: target, behavior: "instant" })
    },
    [testId, String(fraction), flow ?? null, BAR_H] as const
  )
  // A scroll position is a whole pixel, so the reached progress can sit a hair past the tolerance.
  await expect
    .poll(async () => Math.abs((await measureSceneProgress(page, testId, flow)) - fraction), {
      message: `scene ${testId} should reach progress ${fraction} (±0.02)`,
    })
    .toBeLessThanOrEqual(0.0201)
}

/**
 * Assert the scene's sticky panel is pinned exactly under the bar (`BAR_H`, ±1px) while the scene is in
 * progress: one offset on every route, since the sticky bar's condensed height is the one constant
 * `scene-pin` reads (`--bar-h`).
 */
export async function expectPinned(page: Page, testId: string) {
  const top = await page.evaluate((id) => {
    const panel = document.querySelector(`[data-testid="${id}"] > *`) as HTMLElement | null
    return panel ? Math.round(panel.getBoundingClientRect().top) : Number.NaN
  }, testId)
  expect(top, `${testId} panel top`).toBeGreaterThanOrEqual(BAR_H - 1)
  expect(top, `${testId} panel top`).toBeLessThanOrEqual(BAR_H + 1)
}

/**
 * The scroll-scrubbed film inside `scope` has loaded its source and shows the frame at `seconds`
 * (within a third of a second: seeks land on the nearest decodable frame). Waits for metadata first.
 */
export async function expectFilmAt(video: Locator, seconds: number) {
  await expect(video).toHaveAttribute("src", /\/media\/[a-z-]+\.mp4$/)
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).readyState), { message: "film metadata" })
    .toBeGreaterThanOrEqual(1)
  // Scrubbed films converge on their target through a damped loop and land on the nearest decodable frame, so
  // the poll itself waits for the film to settle within a third of a second of the mark.
  await expect
    .poll(() => video.evaluate((v, s) => Math.abs((v as HTMLVideoElement).currentTime - s), seconds), {
      message: `film should settle at ${seconds}s (±0.34s)`,
      timeout: 10_000,
    })
    .toBeLessThanOrEqual(0.34)
}

/** A film that must never load: no `src`, only its poster, whatever the scroll position. */
export async function expectFilmHeld(video: Locator, poster: string) {
  await expect(video).toHaveAttribute("poster", poster)
  await expect(video).not.toHaveAttribute("src")
  expect(await video.evaluate((v) => (v as HTMLVideoElement).currentTime)).toBe(0)
}

/**
 * Scene progress in the middle of stage 5 of 8 (index 4). Stage boundaries sit at multiples of 1/8, so a
 * test that aims at exactly 0.5 lands on the stage-3/4 boundary and rounding decides which stage shows.
 */
export const STAGE_4_MID = 0.56

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

/**
 * Open the advisor dialog from the bar, the way a visitor at this layout can. Desktop: the bar's visible
 * advisor control (the home pill, or the advisor pill beside the scrubber on the five advisor-CTA pages, in
 * both states), or, when the page's own pill is an anchor, the advisor entry in the scrubber's menu, revealed
 * by focusing its trigger. Mobile: the menu button, then the menu's advisor entry.
 */
export async function openAdvisorFromHeader(page: Page, layout: "desktop" | "mobile" = "desktop"): Promise<Locator> {
  const header = page.getByRole("banner")
  if (layout === "desktop") {
    const visible = header.locator('[data-testid="open-advisor"]:visible, button[data-testid="bar-cta"]:visible')
    if ((await visible.count()) > 0) {
      await visible.first().click()
    } else {
      await page.getByTestId("bar-scrubber").focus()
      await header.getByTestId("open-advisor").click()
    }
  } else {
    await page.getByTestId("nav-burger").click()
    await page.locator("#mobile-nav").getByTestId("open-advisor").click()
  }
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

/* ------------------------------------------------------------------------------------------------
 * Demos
 * ---------------------------------------------------------------------------------------------- */

/** How long a demo may take to reach a beat: one whole play plus its hold, and the replay after it. */
const DEMO_TIMEOUT = 30_000

/** The beats each recorded demo has written, kept on the page by `recordDemoBeats`. */
interface DemoBeatLog {
  __demoBeats?: Record<string, string[]>
}

/**
 * The URL a demo page is opened at. Without `still` the demos play; `demoUrl("/", "still")` freezes every
 * demo on its own still, and `demoUrl("/", "fin:note")` freezes one demo on one beat and leaves the rest
 * playing.
 */
export function demoUrl(path: string, still?: string): string {
  if (!still) return path
  const [base = "", hash] = path.split("#")
  const url = `${base}${base.includes("?") ? "&" : "?"}demo=${still}`
  return hash ? `${url}#${hash}` : url
}

/** Start recording the beats the demo writes, so one that passes between two polls is still seen, in order. */
async function recordDemoBeats(page: Page, testid: string) {
  await page.evaluate((id) => {
    const store = window as unknown as DemoBeatLog
    store.__demoBeats ??= {}
    if (store.__demoBeats[id]) return
    const el = document.querySelector(`[data-testid="${id}"]`)
    if (!el) throw new Error(`demo ${id} not found`)
    const seen: string[] = []
    const push = () => {
      const beat = el.getAttribute("data-beat") ?? ""
      if (beat && seen[seen.length - 1] !== beat) seen.push(beat)
    }
    push()
    new MutationObserver(push).observe(el, { attributes: true, attributeFilter: ["data-beat"] })
    store.__demoBeats[id] = seen
  }, testid)
}

/**
 * The demo plays itself: scrolled into view it runs `beatIds` in order with nothing touching it, and comes to
 * rest on its end state. The demo replays after its hold, so a beat missed on the first play is recorded on
 * the next one and the assertion is never a race.
 */
export async function expectAutoplay(page: Page, testid: string, beatIds: string[]) {
  const root = page.getByTestId(testid)
  await root.scrollIntoViewIfNeeded()
  await recordDemoBeats(page, testid)
  await expect
    .poll(
      async () => {
        const seen = await page.evaluate((id) => (window as unknown as DemoBeatLog).__demoBeats?.[id] ?? [], testid)
        return beatsPlayedInOrder(seen, beatIds)
      },
      { message: `${testid} should play ${beatIds.join(" → ")}`, timeout: DEMO_TIMEOUT }
    )
    .toEqual(beatIds)
  await expect
    .poll(() => root.getAttribute("data-demo-state"), {
      message: `${testid} should rest on its end state`,
      timeout: DEMO_TIMEOUT,
    })
    .toBe("ended")
}

/** The demo never stops: after its hold it plays again from the first beat, one cycle further on. */
export async function expectReplay(page: Page, testid: string, firstBeat: string) {
  const root = page.getByTestId(testid)
  await expect
    .poll(() => root.getAttribute("data-cycle"), { message: `${testid} should replay`, timeout: DEMO_TIMEOUT })
    .toBe("1")
  await expect(root).toHaveAttribute("data-beat", firstBeat)
}

/**
 * Step the demo to one beat with the keyboard: focus its root, press Home to go back to the first beat, then
 * ArrowRight until it reads `beatId`. Stepping pauses the demo, so the beat holds for whatever the test asserts.
 */
export async function stepDemo(page: Page, testid: string, beatId: string, maxBeats = 12) {
  const root = page.getByTestId(testid)
  await root.focus()
  await root.press("Home")
  for (let step = 0; step < maxBeats; step++) {
    if ((await root.getAttribute("data-beat")) === beatId) break
    await root.press("ArrowRight")
  }
  await expect(root, `${testid} should step to ${beatId}`).toHaveAttribute("data-beat", beatId)
}
