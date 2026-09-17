import { expect, type Page, test } from "@playwright/test"
import {
  advisorDialog,
  briefingRow,
  demoUrl,
  EXITIQ_ANSWERS,
  EXITIQ_EXPECTED,
  expectFilmAt,
  expectFilmHeld,
  expectPath,
  expectPinned,
  scrollScene,
  waitForFonts,
  watchConsole,
} from "./helpers"
import { QUESTIONS } from "../lib/site/exitiq/questions"

/** The hero graph's "$4.8M headline price" group: lit only on the offer path. */
const offerFigure = (page: Page) => page.getByTestId("hero-graph").locator("g").filter({ hasText: "HEADLINE PRICE" })

test.describe("home hero console", () => {
  test("offers three paths, highlights the hovered one, and shows the live graph", async ({ page }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
    // The mono header: the brand in caps, an empty progress slot on the route panel, no "Start over" yet.
    const brand = hero.getByText("Heirloom", { exact: true })
    await expect(brand).toHaveCSS("text-transform", "uppercase")
    await expect(brand).toHaveCSS("font-family", /^"IBM Plex Mono"/)
    await expect(hero.getByTestId("hero-progress")).toHaveText("")
    await expect(hero.getByRole("button", { name: "Start over" })).toBeHidden()
    const options = hero.getByRole("group", { name: "Choose where you are in the sale process" }).getByRole("button")
    await expect(options).toHaveCount(3)
    await expect(options.nth(0)).toContainText("I want to sell")
    await expect(options.nth(1)).toContainText("I already have a buyer or offer")
    await expect(options.nth(2)).toContainText("I'm not sure I'm ready")
    await expect(hero.getByText("A full private sale.")).toBeVisible()
    await expect(hero.getByText("A free review of the offer before you sign.")).toBeHidden()

    const graph = page.getByTestId("hero-graph")
    await expect(graph).toBeVisible()
    await expect(graph).toHaveAttribute("role", "img")
    await expect(graph).toHaveAttribute("aria-label", "Diagram of a private buyer process around one business")
    await expect(graph).toContainText("YOUR BUSINESS")
    // The sell path at rest: the three buyer rings are captioned and the offer figure is dark.
    await expect(graph.locator("ellipse + text")).toHaveText(["MATCHED", "NDA SIGNED", "FINALISTS"])
    await expect(offerFigure(page)).toHaveCount(1)
    expect(await offerFigure(page).evaluate((g) => (g as SVGGElement).style.opacity)).toBe("0")

    // Hovering previews a path: its subtitle appears, the other's folds, and the graph lights the offer figure.
    await hero.getByTestId("hero-option-offer").hover()
    await expect(hero.getByText("A free review of the offer before you sign.")).toBeVisible()
    await expect(hero.getByText("A full private sale.")).toBeHidden()
    await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
    await expect(hero.getByTestId("hero-progress")).toHaveText("")
    await expect.poll(() => offerFigure(page).evaluate((g) => (g as SVGGElement).style.opacity)).toBe("1")
    await expect(graph).toContainText("$4.8M")
    await expect(graph).toContainText("$3.6M CASH AT CLOSING")
    await hero.getByTestId("hero-option-ready").hover()
    await expect(hero.getByText("Seven questions on how buyers would see the business today.")).toBeVisible()
    await expect.poll(() => offerFigure(page).evaluate((g) => (g as SVGGElement).style.opacity)).toBe("0")
    await expect(graph.locator("ellipse + text")).toHaveText(["BUYER VIEW", "EVIDENCE", ""])
  })

  test("sell path: two questions, a result, and a carried-over advisor briefing", async ({ page }) => {
    const console = watchConsole(page)
    await page.goto("/")
    const hero = page.getByTestId("hero-console")

    await hero.getByTestId("hero-option-sell").click()
    await expect(hero.getByTestId("hero-progress")).toHaveText("QUESTION 1 OF 2")
    await expect(hero.getByRole("button", { name: "Start over" })).toBeVisible()
    await expect(hero.getByText("About your timing")).toBeVisible()
    await expect(hero.getByRole("heading", { name: "When are you thinking about selling?" })).toBeVisible()
    const timing = hero.getByRole("group").getByRole("button")
    await expect(timing).toHaveText(["Now or within 6 months", "In 6 to 18 months", "I am only exploring"])
    await hero.getByRole("button", { name: "In 6 to 18 months", exact: true }).click()
    await expect(hero.getByTestId("hero-progress")).toHaveText("QUESTION 2 OF 2")
    await expect(hero.getByText("About your revenue")).toBeVisible()
    await expect(
      hero.getByRole("heading", { name: "About how much revenue did the business generate last year?" })
    ).toBeVisible()
    await expect(hero.getByText("A rough answer is enough.")).toBeVisible()
    await expect(hero.getByRole("group").getByRole("button")).toHaveText([
      "Under $1M",
      "$1M to $3M",
      "$3M to $10M",
      "More than $10M",
    ])
    await hero.getByRole("button", { name: "$3M to $10M", exact: true }).click()

    await expect(hero.getByTestId("hero-progress")).toHaveText("YOUR RESULT")
    const done = hero.getByTestId("hero-sell-done")
    await expect(done.getByRole("heading", { name: "Timing and fit" })).toBeVisible()
    await expect(done).toContainText("This timing leaves room to prepare before buyers see the business.")
    await expect(done).toContainText("Your business is in Heirloom’s usual range.")
    await expect(done).toContainText(
      "An advisor can look at the business, describe the likely buyers, and give a view on timing."
    )
    await expect(done.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "/how-it-works")
    // The advisor trigger is a plain button carrying the site's advisor test id.
    const trigger = done.getByRole("button", { name: "Talk to an M&A advisor" })
    await expect(trigger).toHaveAttribute("data-testid", "open-advisor")
    expect(await trigger.evaluate((el) => el.tagName)).toBe("BUTTON")

    await trigger.click()
    const dialog = advisorDialog(page)
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText("Your earlier answers carried over. 2 questions left before booking.")).toBeVisible()
    await expect(dialog.getByText("QUESTION 1 OF 2", { exact: true })).toBeVisible()
    await expect(dialog.getByRole("heading", { name: "What kind of business is it?" })).toBeVisible()
    await expect(briefingRow(dialog, "Conversation")).toHaveText("Selling the business")
    await expect(briefingRow(dialog, "Revenue")).toHaveText("$3M to $10M")
    await expect(briefingRow(dialog, "Target timing")).toHaveText("In 1 to 2 years")
    await expect(briefingRow(dialog, "Business")).toHaveText("To be discussed")
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    await hero.getByRole("button", { name: "Start over" }).click()
    await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
    await expect(hero.getByTestId("hero-progress")).toHaveText("")
    await expect(hero.getByRole("button", { name: "Start over" })).toBeHidden()
    await expect(hero.getByTestId("hero-sell-done")).toHaveCount(0)
    console.assertClean()
  })

  test("the offer path deep-links into the review page with the paste tab open", async ({ page }) => {
    // The three ways to share and their hrefs are pinned by HeroConsole.test.tsx; what only a browser gives is
    // the client-side navigation carrying the query and the tab reading it after the route change.
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await hero.getByTestId("hero-option-offer").click()
    const offer = hero.getByTestId("hero-offer")
    const paste = offer.getByRole("link", { name: /Paste the terms/ })
    await expect(paste).toHaveAttribute("href", "/offer-review?mode=paste")
    await paste.click()
    await expectPath(page, "/offer-review?mode=paste")
    await expect(page.getByTestId("oi-tab-paste")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByLabel("Paste the offer or buyer email")).toBeVisible()
  })

  test("exitIQ runs in the hero and the result survives navigation to /score", async ({ page }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await hero.getByTestId("hero-option-ready").click()
    await expect(hero.getByTestId("hero-progress")).toHaveText("EXITIQ")
    const ready = hero.getByTestId("hero-ready")
    await expect(ready.getByText("exitIQ by Heirloom")).toBeVisible()
    await expect(ready.getByRole("heading", { name: "Is the business ready to sell?" })).toBeVisible()
    await expect(ready).toContainText(
      "Seven questions. You get the issues a buyer would raise first and a 90-day plan."
    )
    await expect(ready).toContainText("About 2 minutes. No name, email, or documents required.")
    await hero.getByRole("button", { name: "Start exitIQ" }).click()
    await expect(hero.getByText("exitIQ · Question 1 of 7")).toBeVisible()
    await expect(hero.getByRole("heading", { name: "Is the business ready to sell?" })).toBeHidden()
    const ticks = hero.getByRole("progressbar", { name: "Your progress" })
    await expect(ticks).toHaveAttribute("aria-valuemin", "0")
    await expect(ticks).toHaveAttribute("aria-valuemax", "7")
    await expect(ticks).toHaveAttribute("aria-valuenow", "0")
    await expect(ticks.locator("span")).toHaveCount(7)

    // Every question offers exactly its bank's chips, by label, and each answer lights one more tick.
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i]!
      await expect(hero.getByRole("heading", { name: q.q })).toBeVisible()
      await expect(hero.getByText(`exitIQ · Question ${i + 1} of 7`)).toBeVisible()
      const choices = hero.getByRole("group", { name: `Answer choices for question ${i + 1}` }).getByRole("button")
      await expect(choices).toHaveText(q.chips.map((c) => c.l))
      await hero.getByRole("button", { name: EXITIQ_ANSWERS[q.id], exact: true }).click()
      await expect(ticks).toHaveAttribute("aria-valuenow", String(i + 1))
    }

    const done = hero.getByTestId("hero-iq-done")
    await expect(done).toBeVisible()
    await expect(hero.getByTestId("exitiq-question")).toHaveCount(0)
    await expect(done).toContainText("Your result is ready.")
    await expect(done).toContainText(EXITIQ_EXPECTED.state)
    await expect(done).toContainText(`${EXITIQ_EXPECTED.findings[0]}. ${EXITIQ_EXPECTED.findingBodies[0]}`)
    const see = done.getByRole("link", { name: "See my findings and 90-day plan" })
    await expect(see).toHaveAttribute("href", "/score")
    await see.click()

    await expectPath(page, "/score")
    await expect(page.getByTestId("exitiq-done")).toBeVisible()
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EXPECTED.state)
    await expect(page.getByText("Your next 90 days")).toBeVisible()

    await page.reload()
    await expect(page.getByTestId("exitiq-done")).toBeVisible()
    await page.getByRole("button", { name: "Change answer 3" }).click()
    await expect(page.getByTestId("exitiq-question")).toContainText("Question 3 of 7")
    await expect(
      page
        .getByTestId("exitiq-question")
        .getByRole("heading", { name: "Over the last three years, what has happened to revenue?" })
    ).toBeVisible()
  })
})

/** The four letters of intent in the order a visitor reads them across the row. */
function cardOrder(page: Page) {
  return page.evaluate(() =>
    ["A", "B", "C", "D"]
      .map((id) => {
        const box = document.querySelector(`[data-testid="offer-card-${id}"]`)!.getBoundingClientRect()
        return { id, x: box.x, y: box.y }
      })
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((card) => card.id)
  )
}

test.describe("home sections", () => {
  test("market scene advances its steps with scroll", async ({ page }) => {
    await page.goto("/")
    await scrollScene(page, "market-scene", 0.05)
    await expect(page.getByTestId("market-step-0")).toHaveAttribute("data-active", "true")
    await expect(page.getByTestId("market-step-0")).toContainText("Inbound offer")
    await expect(page.getByTestId("market-step-1")).toHaveAttribute("data-active", "false")
    await scrollScene(page, "market-scene", 0.6)
    await expectPinned(page, "market-scene")
    await expect(page.getByTestId("market-step-2")).toHaveAttribute("data-active", "true")
    await expect(page.getByTestId("market-step-2")).toContainText("NDA and qualification")
    await scrollScene(page, "market-scene", 0.95)
    await expect(page.getByTestId("market-step-3")).toHaveAttribute("data-active", "true")
    await expect(page.getByTestId("market-step-3").getByRole("link", { name: "See how it works →" })).toHaveAttribute(
      "href",
      "/how-it-works"
    )
  })

  test("who sees what never pins: the section scrolls away with the page", async ({ page }) => {
    // The one guard for the contract's "NOTHING pins" on this section (MarketScene is the home page's only
    // pin). Measured, not read off a class: the scene travels with the scroll and nothing inside it sticks.
    await page.goto(demoUrl("/", "still"))
    await waitForFonts(page)
    const scene = page.getByTestId("privacy-scene")
    await scene.scrollIntoViewIfNeeded()
    const before = (await scene.boundingBox())!.y
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "instant" }))
    await expect
      .poll(async () => Math.round((await scene.boundingBox())!.y), { message: "the scene scrolls away" })
      .toBe(Math.round(before) - 300)
    const stuck = await scene.evaluate((el) =>
      Array.from(el.querySelectorAll("*"))
        .filter((child) => /sticky|fixed/.test(getComputedStyle(child).position))
        .map((child) => child.getAttribute("data-testid") ?? child.tagName)
    )
    expect(stuck, "nothing in the section pins").toEqual([])
  })

  test("offer comparison re-ranks and the cards travel to the new order", async ({ page }) => {
    await page.goto("/")
    const section = page.getByTestId("offer-comparison")
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByTestId("offer-card-C")).toHaveAttribute("data-best", "true")
    // The order a visitor reads, which is CSS `order` laid out: the ranks themselves are OfferComparison's own
    // test. Certainty puts C first.
    expect(await cardOrder(page), "ranked by certainty").toEqual(["C", "A", "D", "B"])
    // Hovering a priority chip previews the strongest fit it would produce, without changing the ranking.
    const team = section.getByRole("button", { name: "Protect employees and the company name" })
    await team.hover()
    await expect(section.getByTestId("offer-card-A")).toHaveAttribute("data-preview", "true")
    await expect(section.getByTestId("offer-card-C")).toHaveAttribute("data-best", "true")
    await team.click()
    await expect(section.getByTestId("offer-card-A")).toHaveAttribute("data-best", "true")
    // The cards TRAVEL to their new places: `useFlipRows` puts the transform on them and a real `transitionend`
    // takes it off again, after which the row reads in the new order.
    expect(await section.getByTestId("offer-card-B").getAttribute("class"), "the cards carry the travel").toContain(
      "transition-transform"
    )
    await expect(section.getByTestId("offer-card-B")).not.toHaveClass(/transition-transform/)
    expect(await cardOrder(page), "the order the new priority gives").toEqual(["A", "B", "C", "D"])
    await section.getByTestId("offer-card-B").click()
    await expect(section.getByTestId("offer-detail")).toContainText("Letter of intent B · Independent searcher")
  })
})

test.describe("home films and instrument", () => {
  test("the desk loop plays and drifts against the scroll under the market scene, and the room film plays behind the record", async ({
    page,
  }) => {
    const console = watchConsole(page)
    await page.goto("/")
    const scene = page.getByTestId("market-scene")
    const desk = scene.getByTestId("ambient-video")
    await expect(desk).toHaveAttribute("poster", "/media/market-desk-live-poster.jpg")
    await expect(desk).toHaveAttribute("preload", "metadata")
    await expect(desk).toHaveClass(/opacity-60/)
    const layer = scene.getByTestId("market-film-layer")
    await scrollScene(page, "market-scene", 0.05)
    await expect
      .poll(() => layer.evaluate((el) => (el as HTMLElement).style.transform))
      .toMatch(/^translate3d\(0(?:px)?, ?2\.\d+%, ?0(?:px)?\) scale\(1\.06\d?\)$/)
    await scrollScene(page, "market-scene", 0.5)
    await expectPinned(page, "market-scene")
    await expect(desk).toHaveAttribute("src", "/media/market-desk-live.mp4")
    expect(await desk.evaluate((v) => (v as HTMLVideoElement).loop)).toBe(true)
    await expect.poll(() => desk.evaluate((v) => (v as HTMLVideoElement).paused), { timeout: 10_000 }).toBe(false)
    const t1 = await desk.evaluate((v) => (v as HTMLVideoElement).currentTime)
    await expect.poll(() => desk.evaluate((v) => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(t1)
    await scrollScene(page, "market-scene", 0.95)
    await expect
      .poll(() => layer.evaluate((el) => (el as HTMLElement).style.transform))
      .toMatch(/^translate3d\(0(?:px)?, ?-2\.\d+%, ?0(?:px)?\) scale\(1\.06\d?\)$/)
    // The paper choreography still plays above the film.
    await expect(page.getByTestId("market-step-3")).toHaveAttribute("data-active", "true")

    const privacy = page.getByTestId("privacy-scene")
    const room = privacy.getByTestId("ambient-video")
    await expect(room).toHaveAttribute("poster", "/media/privacy-room-poster.jpg")
    await expect(room).toHaveClass(/opacity-60/)
    await expect(room).toHaveClass(/object-right/)
    await privacy.scrollIntoViewIfNeeded()
    await expect(room).toHaveAttribute("src", "/media/privacy-room.mp4")
    await expect
      .poll(() => room.evaluate((v) => (v as HTMLVideoElement).loop && !(v as HTMLVideoElement).paused), {
        timeout: 10_000,
      })
      .toBe(true)
    // The film is framed inside the record column, on the side away from the copy: its left edge sits at or right
    // of the copy column's right edge, so no line of copy is ever over the lit glass. Nothing else in the scene is a film.
    const frame = privacy.getByTestId("privacy-room-frame")
    await expect(frame).toHaveClass(/rounded-lg/)
    const frameBox = (await frame.boundingBox())!
    const copyBox = (await privacy.getByRole("heading", { name: "Who sees what" }).boundingBox())!
    expect(frameBox.x, "film starts right of the copy column").toBeGreaterThanOrEqual(copyBox.x + copyBox.width)
    await expect(privacy.locator("video")).toHaveCount(1)
    await expect(page.getByTestId("privacy-record-frame").locator("video")).toHaveCount(1)
    console.assertClean()
  })

  test("the close's seal film scrubs into its last frame as the frame rises and the four next steps follow", async ({
    page,
  }) => {
    await page.goto("/")
    const film = page.getByTestId("seal-film")
    await expect(film).not.toHaveAttribute("aria-hidden")
    await expect(film).toHaveClass(/shadow-product/)
    const video = film.getByRole("img", {
      name: "A brass Heirloom seal presses a cream wax seal on a deep green desk.",
    })
    await expect(video).toHaveAttribute("poster", "/media/seal-press-poster.jpg")
    // The page's end is measured after the webfont is in place, so a late swap cannot leave the scroll short of it.
    await waitForFonts(page)
    await film.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }))
    await expectFilmAt(video, 10)
    await expect(page.getByRole("heading", { name: "Choose a next step." })).toBeVisible()
    // The four next-step cards follow the film: the advisor card, then three route cards.
    await expect(page.getByRole("button", { name: "Ready to sell Talk to an M&A advisor" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Offer in hand Review my offer" })).toHaveAttribute(
      "href",
      "/offer-review"
    )
    await expect(page.getByRole("link", { name: "Still deciding Check sale readiness" })).toHaveAttribute(
      "href",
      "/score"
    )
    await expect(page.getByRole("link", { name: "The process See how it works" })).toHaveAttribute(
      "href",
      "/how-it-works"
    )
  })

  test("the hero's glass film plays behind the copy at sixty percent, loops, and leans toward the pointer", async ({
    page,
  }) => {
    const console = watchConsole(page)
    await page.goto("/")
    const tile = page.locator("section[data-tone='light']").first()
    const film = tile.locator("video")
    await expect(film).toHaveAttribute("aria-hidden", "true")
    await expect(film).toHaveAttribute("poster", "/media/hero-ambient-poster.jpg")
    await expect(film).toHaveAttribute("src", "/media/hero-ambient.mp4")
    await expect(film).toHaveCSS("opacity", "0.6")
    await expect.poll(() => film.evaluate((v) => (v as HTMLVideoElement).paused), { timeout: 10_000 }).toBe(false)
    expect(await film.evaluate((v) => (v as HTMLVideoElement).loop)).toBe(true)
    expect(await film.evaluate((v) => (v as HTMLVideoElement).muted)).toBe(true)
    // The copy and the console sit above the film and stay fully legible: the headline is black-on-white ink.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(14, 36, 27)")
    // The film's layer leans up to 8px toward the pointer anywhere over the tile, and rests when it leaves.
    const layer = page.getByTestId("hero-film-layer")
    const tileBox = (await tile.boundingBox())!
    // The pointer must stay inside the tile, so the lean settles a hair short of the 8px maximum.
    await tile.hover({ position: { x: tileBox.width - 1, y: tileBox.height - 1 } })
    await expect
      .poll(() => layer.evaluate((el) => (el as HTMLElement).style.transform), { timeout: 5_000 })
      .toMatch(/^translate3d\(7\.9\dpx, 7\.9\dpx, 0(?:px)?\)$/)
    // Hovering the corner scrolled the tile to the top of the viewport; scroll back so (4, 4) is the header, off the tile.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
    await page.mouse.move(4, 4)
    await expect.poll(() => layer.evaluate((el) => (el as HTMLElement).style.transform), { timeout: 5_000 }).toBe("")
    console.assertClean()
  })

  test("the console's field canvas runs on WebGL behind the panels and the graph's rings turn and follow the path", async ({
    page,
  }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    const canvas = hero.locator("canvas")
    await expect(canvas).toHaveCount(1)
    await expect(canvas).toHaveAttribute("aria-hidden", "true")
    // The field sizes its drawing buffer to the card only once a WebGL context came up; an unsized canvas is 300×150.
    const heroBox = (await hero.boundingBox())!
    await expect
      .poll(() => canvas.evaluate((c) => (c as HTMLCanvasElement).width), { message: "field buffer width" })
      .toBe(Math.round(heroBox.width - 2))
    expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).height)).toBeGreaterThan(150)
    // The canvas is the card's first layer; every panel sits above it.
    await expect(hero.locator(":scope > *").first()).toHaveAttribute("aria-hidden", "true")
    // The rings' dashes are the console's only looping animation.
    const ring = page.getByTestId("hero-graph").locator("ellipse").first()
    await expect(ring).toHaveCSS("animation-name", "hl-dash")
    await expect(ring).toHaveCSS("animation-duration", "34s")
    await expect(ring).toHaveCSS("animation-iteration-count", "infinite")
    // The graph follows the chosen path, not just the hover: the offer stage lights the price figure and the four
    // offer modules, and Start over puts them out.
    await hero.getByTestId("hero-option-offer").click()
    await expect(hero.getByTestId("hero-offer")).toBeVisible()
    await expect.poll(() => offerFigure(page).evaluate((g) => (g as SVGGElement).style.opacity)).toBe("1")
    const modules = page.getByTestId("hero-graph").locator("rect[rx='12'] + text")
    await expect(modules).toHaveText(["PRICE", "CASH AT CLOSING", "FINANCING", "CLOSING RISK"])
    for (let i = 0; i < 4; i++) {
      expect(await modules.nth(i).evaluate((t) => (t.parentElement as HTMLElement).style.opacity), `module ${i}`).toBe(
        "1"
      )
    }
    await hero.getByRole("button", { name: "Start over" }).click()
    await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
    await expect.poll(() => offerFigure(page).evaluate((g) => (g as SVGGElement).style.opacity)).toBe("0")
    expect(await modules.nth(0).evaluate((t) => (t.parentElement as HTMLElement).style.opacity)).toBe("0")
  })

  test("under reduced motion every film holds its poster and the header mark does not animate", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    const mark = page
      .getByRole("banner")
      .getByRole("link", { name: "Heirloom home" })
      .locator("[data-testid='brand-lockup']:visible .animate-mark-in")
    await expect(mark).toHaveCount(1)
    await expect(mark).toHaveCSS("animation-name", "none")
    const heroFilm = page.locator("section[data-tone='light']").first().locator("video")
    await expect(heroFilm).toHaveAttribute("poster", "/media/hero-ambient-poster.jpg")
    await expect(heroFilm).not.toHaveAttribute("src")
    // The graph's rings stand still, the field still draws its one frame, and no pointer lean runs without motion.
    await expect(page.getByTestId("hero-graph").locator("ellipse").first()).toHaveCSS("animation-name", "none")
    const heroBox = (await page.getByTestId("hero-console").boundingBox())!
    await expect
      .poll(() =>
        page
          .getByTestId("hero-console")
          .locator("canvas")
          .evaluate((c) => (c as HTMLCanvasElement).width)
      )
      .toBe(Math.round(heroBox.width - 2))
    const tile = page.locator("section[data-tone='light']").first()
    const tileBox = (await tile.boundingBox())!
    await tile.hover({ position: { x: tileBox.width - 2, y: tileBox.height - 2 } })
    await expect(page.getByTestId("hero-film-layer")).toHaveCSS("transform", "none")
    // The five term objects stand still on their posters.
    for (const key of ["seal", "envelope", "scale", "stack", "hourglass"]) {
      await expectFilmHeld(page.getByTestId(`terms-figure-${key}`).locator("video"), `/media/term-${key}-poster.jpg`)
    }
    await scrollScene(page, "market-scene", 0.5)
    await expectFilmHeld(
      page.getByTestId("market-scene").getByTestId("ambient-video"),
      "/media/market-desk-live-poster.jpg"
    )
    await expect(page.getByTestId("market-step-2")).toHaveAttribute("data-active", "true")
    // The three demos render their stills with no clock: every figure is in place and the films hold their posters.
    await page.getByTestId("fin-demo").scrollIntoViewIfNeeded()
    await expect(page.getByTestId("fin-demo")).toHaveAttribute("data-demo-state", "still")
    await expect(page.getByTestId("fin-foot")).toHaveText("$845,000")
    await expect(page.getByTestId("fin-foot")).toHaveCSS("animation-name", "none")
    await expectFilmHeld(page.getByTestId("fin-frame-film").locator("video"), "/media/ledger-glass-poster.jpg")
    await page.getByTestId("privacy-scene").scrollIntoViewIfNeeded()
    await expect(page.getByTestId("priv-demo")).toHaveAttribute("data-demo-state", "still")
    await expect(page.getByTestId("priv-level")).toHaveText("Level 4 · Final diligence · Visible 6 of 7")
    await expect(page.getByTestId("priv-level")).toHaveCSS("animation-name", "none")
    await expectFilmHeld(
      page.getByTestId("privacy-scene").getByTestId("ambient-video"),
      "/media/privacy-room-poster.jpg"
    )
    await page.getByTestId("dec-demo").scrollIntoViewIfNeeded()
    await expect(page.getByTestId("dec-demo")).toHaveAttribute("data-demo-state", "still")
    // `dec-timing` reads the same at every beat, so the still is pinned by the beat it landed on.
    await expect(page.getByTestId("dec-demo")).toHaveAttribute("data-beat", "close")
    await expect(page.getByTestId("dec-timing")).toHaveCSS("animation-name", "none")
    const boardFilm = page.getByTestId("dec-frame-film").locator("video")
    await expectFilmHeld(boardFilm, "/media/status-board-poster.jpg")
    expect(await boardFilm.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true)
    // Nothing in that section moves at all: not one of its own animations is running.
    expect(
      await page
        .getByTestId("seller-workload")
        .evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length),
      "the decisions section runs no animation"
    ).toBe(0)
    // The race is a still at its finish and the counter never counts.
    await page.getByTestId("speed-section").scrollIntoViewIfNeeded()
    await expect(page.getByTestId("speed-fill-traditional")).toHaveAttribute("style", /scaleX\(1\)/)
    await expect(page.getByTestId("speed-fill-heirloom")).toHaveAttribute("style", /scaleX\(0\.6\)/)
    await expect(page.getByTestId("speed-range")).toHaveText("40%")
    await expectFilmHeld(page.getByTestId("speed-film").locator("video"), "/media/speed-hourglasses-poster.jpg")
    // The archive tile's loop, the last film on the page to gain a poster, holds its own first frame.
    await expectFilmHeld(
      page.getByRole("img", { name: "Private business records prepared for a confidential ownership transfer." }),
      "/media/archive-hall-poster.jpg"
    )
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }))
    await expectFilmHeld(page.getByTestId("seal-film").locator("video"), "/media/seal-press-poster.jpg")
  })

  test("the bar's mark forms once on load inside the horizontal lockup and the footer's lockup stays still", async ({
    page,
  }) => {
    await page.goto("/")
    const lockup = page
      .getByRole("banner")
      .getByRole("link", { name: "Heirloom home" })
      .locator("[data-testid='brand-lockup']:visible")
    await expect(lockup).toHaveAttribute("data-variant", "horizontal")
    const headerMark = lockup.locator("[data-testid='brand-mark'] > g")
    await expect(headerMark).toHaveClass(/animate-mark-in/)
    await expect(headerMark).toHaveCSS("animation-name", "hl-mark-in")
    await expect(headerMark).toHaveCSS("animation-iteration-count", "1")
    await expect(lockup.locator("[data-testid='brand-wordmark']")).not.toHaveClass(/animate-/)
    const footerLockup = page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Heirloom home" })
      .locator("[data-testid='brand-lockup']")
    await expect(footerLockup).toHaveAttribute("data-variant", "horizontal")
    // Parchment carries the darker half of the pair: `text-heirloom` under `on-light` is #0f7a45.
    await expect(footerLockup).toHaveCSS("color", "rgb(15, 122, 69)")
    await expect(footerLockup.locator(".animate-mark-in")).toHaveCount(0)
    await expect(footerLockup.locator("[data-testid='brand-mark'] > g")).toHaveCSS("animation-name", "none")
  })
})

test.describe("home living sections", () => {
  const TERMS = ["seal", "envelope", "scale", "stack", "hourglass"] as const

  test("the five term objects arrive once with a stagger, turn on their own, and follow the pointer", async ({
    page,
  }) => {
    const console = watchConsole(page)
    await page.goto("/")
    // Below the fold at load, the cards are pending; once seen they arrive 60ms apart and stay.
    await expect(page.getByTestId("terms-link-seal")).toHaveClass(/reveal-pending/)
    await page.getByTestId("terms-grid").scrollIntoViewIfNeeded()
    await expect(page.getByTestId("terms-link-seal")).toHaveClass(/reveal-in/)
    await expect(page.getByTestId("terms-link-hourglass")).toHaveClass(/reveal-in/)
    expect(
      await page.getByTestId("terms-link-hourglass").evaluate((el) => el.style.getPropertyValue("--reveal-delay"))
    ).toBe("240ms")
    for (const key of TERMS) {
      const figure = page.getByTestId(`terms-figure-${key}`)
      await expect(figure).toHaveClass(/shadow-product/)
      const video = figure.locator("video")
      await expect(video).toHaveAttribute("aria-hidden", "true")
      await expect(video).toHaveAttribute("poster", `/media/term-${key}-poster.jpg`)
      await expect(video).toHaveAttribute("src", `/media/term-${key}.mp4`)
    }
    // The drift turns the object while nobody touches it.
    const scale = page.getByTestId("terms-figure-scale").locator("video")
    await expect
      .poll(() => scale.evaluate((v) => (v as HTMLVideoElement).readyState), { message: "film metadata" })
      .toBeGreaterThanOrEqual(1)
    const t1 = await scale.evaluate((v) => (v as HTMLVideoElement).currentTime)
    await expect
      .poll(() => scale.evaluate((v) => (v as HTMLVideoElement).currentTime), { timeout: 10_000 })
      .not.toBe(t1)
    // The pointer takes the wheel: three quarters across the frame lands on three quarters of the film.
    const box = (await page.getByTestId("terms-figure-scale").boundingBox())!
    await page.getByTestId("terms-figure-scale").hover({ position: { x: box.width * 0.75, y: box.height / 2 } })
    await expectFilmAt(scale, 3.78)
    await page.getByTestId("terms-link-seal").click()
    await expectPath(page, "/who-we-are")
    console.assertClean()
  })

  test("the ledger film plays inside the financial screen at thirty-five percent", async ({ page }) => {
    // The words, the figures and the beats are FinancialPrep.test.tsx's and demo-financial.spec.ts's; the
    // film's lazy `src` and its computed opacity on a desktop are only here.
    await page.goto(demoUrl("/", "still"))
    await page.getByTestId("fin-section").scrollIntoViewIfNeeded()
    const film = page.getByTestId("fin-frame-film").locator("video")
    await expect(film).toHaveAttribute("poster", "/media/ledger-glass-poster.jpg")
    await expect(film).toHaveAttribute("src", "/media/ledger-glass.mp4")
    await expect(film).toHaveCSS("opacity", "0.35")
  })

  test("the status-board film plays inside the decisions screen at twenty percent", async ({ page }) => {
    // The words, the letters and the beats are SellerWorkload.test.tsx's and demo-decisions.spec.ts's.
    await page.goto(demoUrl("/", "still"))
    await page.getByTestId("seller-workload").scrollIntoViewIfNeeded()
    const film = page.getByTestId("dec-frame-film").locator("video")
    await expect(film).toHaveAttribute("poster", "/media/status-board-poster.jpg")
    await expect(film).toHaveAttribute("src", "/media/status-board.mp4")
    await expect(film).toHaveCSS("opacity", "0.2")
  })

  test("the speed race runs while on screen and the counter lands on 40%", async ({ page }) => {
    await page.goto("/")
    const section = page.getByTestId("speed-section")
    await section.scrollIntoViewIfNeeded()
    await expect(page.getByTestId("speed-range")).toHaveText("40%")
    const traditional = page.getByTestId("speed-fill-traditional")
    const t1 = await traditional.evaluate((el) => (el as HTMLElement).style.transform)
    await expect
      .poll(() => traditional.evaluate((el) => (el as HTMLElement).style.transform), { timeout: 5_000 })
      .not.toBe(t1)
    const heirloomScale = () =>
      page
        .getByTestId("speed-fill-heirloom")
        .evaluate((el) => Number(/scaleX\(([\d.]+)\)/.exec((el as HTMLElement).style.transform)?.[1] ?? Number.NaN))
    expect(await heirloomScale()).toBeLessThanOrEqual(0.6)
    await expect(page.getByTestId("speed-ticks").locator("span")).toHaveCount(10)
    await expect(page.getByTestId("speed-runner-heirloom")).toHaveAttribute("aria-hidden", "true")
    const film = page.getByTestId("speed-film").locator("video")
    await expect(film).toHaveAttribute("poster", "/media/speed-hourglasses-poster.jpg")
    await expect(film).toHaveAttribute("src", "/media/speed-hourglasses.mp4")
    // Scrubbed by the race, never played: the sand runs as the traditional runner advances.
    await expect
      .poll(() => film.evaluate((v) => (v as HTMLVideoElement).currentTime), { timeout: 10_000 })
      .toBeGreaterThan(0.5)
    expect(await film.evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true)
    await expect(page.getByTestId("speed-step-4")).toHaveClass(/reveal-in/)
  })

  test("the advisor sheet carries an instrument strip that brightens per answer and a cursor on the briefing", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByRole("banner").getByTestId("open-advisor").click()
    const dialog = advisorDialog(page)
    await expect(dialog).toBeVisible()
    const strip = dialog.getByTestId("advisor-field-strip")
    await expect(strip).toBeVisible()
    const field = strip.getByTestId("advisor-field")
    await expect(field).toHaveAttribute("data-target", "0.15")
    await expect(field).toHaveAttribute("data-live", "true")
    await expect(dialog.getByTestId("advisor-stage")).toHaveAttribute("data-step", "0")
    await expect(dialog.getByText("Conversation", { exact: true })).toHaveAttribute("data-current", "true")
    await expect(dialog.getByText("Business", { exact: true })).toHaveAttribute("data-current", "false")
    await dialog.getByRole("button", { name: "Selling the business", exact: true }).click()
    await expect(field).toHaveAttribute("data-target", "0.29")
    await expect(dialog.getByRole("heading", { name: "What kind of business is it?" })).toBeVisible()
    await expect(dialog.getByTestId("advisor-stage")).toHaveAttribute("data-step", "1")
    await expect(dialog.getByText("Business", { exact: true })).toHaveAttribute("data-current", "true")
    await expect(dialog.getByTestId("advisor-ack")).toContainText(
      "The call covers your likely buyer market and what preparation would happen before any outreach."
    )
    await expect(briefingRow(dialog, "Conversation")).toHaveText("Selling the business")
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })
})
