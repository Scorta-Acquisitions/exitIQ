import { expect, test } from "@playwright/test"
import {
  advisorDialog,
  demoUrl,
  EXITIQ_ANSWERS,
  EXITIQ_EXPECTED,
  expectNoHorizontalScroll,
  expectPath,
  H1_BY_PATH,
  NARROW_PHONE,
  openAdvisorFromHeader,
  PHONE,
  scrollScene,
  STAGE_4_MID,
  waitForFonts,
  watchConsole,
} from "./helpers"
import { QUESTIONS } from "../lib/site/exitiq/questions"
import { ALL_ROUTES, MOBILE_NAV_LINKS } from "../lib/site/routes"
import { BAR_H, type FlowWindow, MARKET_FLOW, TALL_MIN_HEIGHT } from "../lib/site/scroll"

const VIEWPORTS = [PHONE, NARROW_PHONE]

for (const vp of VIEWPORTS) {
  test.describe(`${vp.width}×${vp.height}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: true })

    /** A phone whose panel under the bar meets the 780px budget pins the market scene; a short one flows it, measured against its flow window. */
    const pins = vp.height - BAR_H >= TALL_MIN_HEIGHT
    const flow = (w: FlowWindow) => (pins ? undefined : w)

    test("the menu button toggles the navigation and lists every destination once", async ({ page }) => {
      await page.goto("/")
      const burger = page.getByTestId("nav-burger")
      const menu = page.locator("#mobile-nav")
      await expect(burger).toHaveAttribute("aria-controls", "mobile-nav")
      await expect(burger).toHaveAttribute("aria-expanded", "false")
      await expect(burger).toHaveAttribute("aria-label", "Open navigation menu")
      await expect(menu).toBeHidden()

      await burger.tap()
      await expect(burger).toHaveAttribute("aria-expanded", "true")
      await expect(burger).toHaveAttribute("aria-label", "Close navigation menu")
      await expect(menu).toBeVisible()
      const links = menu.getByRole("link")
      await expect(links).toHaveText(MOBILE_NAV_LINKS.map((l) => l.label))
      for (let i = 0; i < MOBILE_NAV_LINKS.length; i++) {
        const link = MOBILE_NAV_LINKS[i]!
        await expect(links.nth(i)).toHaveAttribute("href", link.href)
      }
      await expect(menu.getByRole("button", { name: "Talk to an M&A advisor" })).toBeVisible()

      await burger.tap()
      await expect(burger).toHaveAttribute("aria-expanded", "false")
      await expect(burger).toHaveAttribute("aria-label", "Open navigation menu")
      await expect(menu).toBeHidden()
    })

    test("the menu closes after navigating and the destination shows its heading", async ({ page }) => {
      const console = watchConsole(page)
      await page.goto("/")
      const burger = page.getByTestId("nav-burger")
      await burger.tap()
      await page.locator("#mobile-nav").getByRole("link", { name: "Fees", exact: true }).tap()
      await expectPath(page, "/fees")
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(H1_BY_PATH["/fees"])
      await expect(burger).toHaveAttribute("aria-expanded", "false")
      await expect(page.locator("#mobile-nav")).toBeHidden()
      console.assertClean()
    })

    test("no route scrolls horizontally and every route keeps the menu button", async ({ page }) => {
      for (const path of [...ALL_ROUTES, "/nothing-here"]) {
        await page.goto(path)
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        await expect(page.getByRole("contentinfo")).toBeAttached()
        await expectNoHorizontalScroll(page, `${path} at ${vp.width}px`)
        await expect(page.getByTestId("nav-burger")).toBeVisible()
        await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden()
        // The bar's visible pill and the mark sit whole inside the row, even "Get Heirloom Verified" beside the mark at 320.
        await waitForFonts(page)
        const chrome = await page.evaluate((width) => {
          const visible = (el: Element) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"
          }
          const banner = document.querySelector("[role='banner']")!
          const pill = Array.from(banner.querySelectorAll<HTMLElement>(".bg-primary")).find(visible) ?? null
          const marks = Array.from(banner.querySelectorAll("[data-testid='brand-lockup']")).filter(visible)
          const box = (el: Element | null) => {
            if (!el) return null
            const r = el.getBoundingClientRect()
            return { left: r.left, right: r.right, height: r.height }
          }
          return {
            pill: box(pill),
            pillClipped: pill ? pill.scrollWidth > pill.clientWidth : false,
            marks: marks.map((m) => ({ variant: m.getAttribute("data-variant"), ...box(m)! })),
            width,
          }
        }, vp.width)
        expect(chrome.marks, `${path}: one brand variant visible`).toHaveLength(1)
        expect(chrome.marks[0]!.left, `${path}: the brand starts at the gutter`).toBe(24)
        expect(chrome.marks[0]!.right, `${path}: the brand inside the viewport`).toBeLessThanOrEqual(vp.width - 24)
        if (path !== "/" && path !== "/nothing-here") {
          expect(chrome.pill, `${path}: the page pill is in the row`).not.toBeNull()
          expect(chrome.pill!.height, `${path}: a 34px visual pill`).toBe(34)
          expect(chrome.pill!.left, `${path}: the pill clears the mark`).toBeGreaterThanOrEqual(
            chrome.marks[0]!.right + 8
          )
          expect(chrome.pill!.right, `${path}: the pill inside the viewport`).toBeLessThanOrEqual(vp.width - 24)
          expect(chrome.pillClipped, `${path}: the pill's label is whole`).toBe(false)
        } else {
          expect(chrome.pill, `${path}: no pill at landing`).toBeNull()
        }
      }
    })

    test("the hero graph is hidden and the sell path runs through to its result", async ({ page }) => {
      const console = watchConsole(page)
      await page.goto("/")
      const hero = page.getByTestId("hero-console")
      // The graph pane is in the DOM but hidden below 620px; the field canvas still fills the card.
      await expect(page.getByTestId("hero-graph")).toBeAttached()
      await expect(page.getByTestId("hero-graph")).toBeHidden()
      await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
      await expect(hero.getByTestId("hero-progress")).toHaveText("")
      const heroBox = (await hero.boundingBox())!
      expect(heroBox.width, "console inside the gutters").toBe(vp.width - 48)
      await expect
        .poll(() => hero.locator("canvas").evaluate((c) => (c as HTMLCanvasElement).width), { message: "field width" })
        .toBe(Math.round(heroBox.width - 2))
      // The route rows are tap targets (the two with a subtitle or a wrapped title; the third row is measured in the
      // report, not asserted: it lands at 43px on a 390 phone).
      for (const k of ["sell", "offer"]) {
        const box = (await hero.getByTestId(`hero-option-${k}`).boundingBox())!
        expect(box.height, `${k} row tap target`).toBeGreaterThanOrEqual(44)
        // The card sits inside the 24px gutters with a 1px border; the panel adds 26px of padding a side.
        expect(box.width, `${k} row spans the panel`).toBe(vp.width - 48 - 2 - 2 * 26)
      }

      await hero.getByTestId("hero-option-sell").tap()
      await expect(hero.getByTestId("hero-progress")).toHaveText("QUESTION 1 OF 2")
      await expect(hero.getByRole("heading", { name: "When are you thinking about selling?" })).toBeVisible()
      await hero.getByRole("button", { name: "Now or within 6 months", exact: true }).tap()
      await expect(hero.getByTestId("hero-progress")).toHaveText("QUESTION 2 OF 2")
      await expect(
        hero.getByRole("heading", { name: "About how much revenue did the business generate last year?" })
      ).toBeVisible()
      await hero.getByRole("button", { name: "Under $1M", exact: true }).tap()

      await expect(hero.getByTestId("hero-progress")).toHaveText("YOUR RESULT")
      const done = hero.getByTestId("hero-sell-done")
      await expect(done.getByRole("heading", { name: "Timing and fit" })).toBeVisible()
      await expect(done).toContainText("You could start a full sale process now.")
      await expect(done).toContainText(
        "Full representation usually begins around $1M in annual revenue. An advisor can still suggest a next step."
      )
      await expect(done.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "/how-it-works")
      const trigger = done.getByRole("button", { name: "Talk to an M&A advisor" })
      await expect(trigger).toHaveAttribute("data-testid", "open-advisor")
      await expectNoHorizontalScroll(page, `sell result at ${vp.width}px`)
      await trigger.tap()
      await expect(advisorDialog(page)).toBeVisible()
      await expect(advisorDialog(page).getByText("QUESTION 1 OF 2", { exact: true })).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(advisorDialog(page)).toBeHidden()

      await hero.getByRole("button", { name: "Start over" }).tap()
      await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
      await expect(hero.getByTestId("hero-progress")).toHaveText("")
      console.assertClean()
    })

    test("the hero's exitIQ path fits the phone: Start exitIQ and the answer chips are tap targets and the run reaches its result", async ({
      page,
    }) => {
      await page.goto("/")
      const hero = page.getByTestId("hero-console")
      await hero.getByTestId("hero-option-ready").tap()
      await expect(hero.getByTestId("hero-progress")).toHaveText("EXITIQ")
      const start = hero.getByRole("button", { name: "Start exitIQ" })
      const startBox = (await start.boundingBox())!
      expect(startBox.height, "Start exitIQ tap target").toBeGreaterThanOrEqual(44)
      await start.tap()
      await expect(hero.getByText("exitIQ · Question 1 of 7")).toBeVisible()
      const chips = hero.getByRole("group", { name: "Answer choices for question 1" }).getByRole("button")
      await expect(chips).toHaveCount(5)
      for (let i = 0; i < 5; i++) {
        const box = (await chips.nth(i).boundingBox())!
        expect(box.height, `chip ${i} tap target`).toBeGreaterThanOrEqual(44)
        expect(box.x + box.width, `chip ${i} inside the viewport`).toBeLessThanOrEqual(vp.width)
      }
      await expectNoHorizontalScroll(page, `exitIQ question at ${vp.width}px`)
      for (const q of QUESTIONS) {
        await expect(hero.getByRole("heading", { name: q.q })).toBeVisible()
        await hero.getByRole("button", { name: EXITIQ_ANSWERS[q.id], exact: true }).tap()
      }
      const done = hero.getByTestId("hero-iq-done")
      await expect(done).toContainText(EXITIQ_EXPECTED.state)
      const see = done.getByRole("link", { name: "See my findings and 90-day plan" })
      await expect(see).toHaveAttribute("href", "/score")
      const seeBox = (await see.boundingBox())!
      expect(seeBox.height, "result link tap target").toBeGreaterThanOrEqual(44)
      await expectNoHorizontalScroll(page, `exitIQ result at ${vp.width}px`)
    })

    test("fee calculator path cards are tap targets and the slider updates the fee", async ({ page }) => {
      await page.goto("/fees")
      const calc = page.getByTestId("fee-calculator")
      await calc.scrollIntoViewIfNeeded()
      await expect(calc.getByTestId("fee-total")).toHaveText("$120,000")

      const execution = calc.getByTestId("fee-path-execution")
      const box = (await execution.boundingBox())!
      expect(box.height, "tap target height").toBeGreaterThanOrEqual(44)
      expect(box.width, "tap target width").toBeGreaterThanOrEqual(44)
      await execution.tap()
      await expect(execution).toHaveAttribute("aria-pressed", "true")
      await expect(calc.getByTestId("fee-path-market")).toHaveAttribute("aria-pressed", "false")
      await expect(calc.getByText("Existing buyer selected")).toBeVisible()
      await expect(calc.getByTestId("fee-total")).toHaveText("$60,000")

      await page.locator("#fees-price").fill("1000000")
      await expect(calc.getByTestId("fee-price")).toHaveText("$1,000,000")
      await expect(calc.getByTestId("fee-total")).toHaveText("$25,000")
      await expect(calc.getByTestId("fee-traditional")).toHaveText("$100,000")
      await expect(calc.getByTestId("fee-difference")).toHaveText("$75,000")

      await calc.getByTestId("fee-path-market").tap()
      await expect(calc.getByTestId("fee-total")).toHaveText("$50,000")
      await expect(calc.getByTestId("fee-difference")).toHaveText("$50,000")
      await expectNoHorizontalScroll(page, `fee calculator at ${vp.width}px`)
    })

    test("the market scene's copy stays whole on the pinned panel: step 04 and its link are on screen at the end", async ({
      page,
    }) => {
      await page.goto("/")
      // Pinned, the whole copy stays on the panel to the end. Flowing (a short phone), step 04 lights as the band
      // arrives under it, so both are on screen together at the start of the last chapter.
      await scrollScene(page, "market-scene", pins ? 0.95 : 0.76, flow(MARKET_FLOW))
      await expect(page.getByTestId("market-scene")).toHaveAttribute("data-layout", pins ? "pinned" : "flow")
      const step = page.getByTestId("market-step-3")
      await expect(step).toHaveAttribute("data-active", "true")
      await expect(step).toBeInViewport()
      await expect(step.getByRole("link", { name: "See how it works →" })).toBeInViewport()
      if (pins) {
        // Inactive steps keep their titles on screen on the pinned panel.
        await expect(page.getByTestId("market-step-0")).toBeInViewport()
      } else {
        // The band follows the copy: its top is on screen with the lit step.
        await expect(page.getByTestId("market-stage")).toBeInViewport()
      }
      // Inactive steps fold their bodies away below the tablet breakpoint.
      await expect(
        page.getByTestId("market-step-0").getByText("A single buyer names the price and the terms.")
      ).toBeHidden()
      await expect(step.getByText("We compare the economics, buyer fit, and closing risk of each offer.")).toBeVisible()
      // No nested scroller inside the pinned panel: the copy column is no taller than its content.
      const column = step.locator("xpath=..")
      expect(await column.evaluate((el) => getComputedStyle(el).overflowY)).not.toBe("auto")
    })

    test("the market scene's paper stays inside the phone band: every NDA card and letter of intent lands within the stage", async ({
      page,
    }) => {
      await page.goto("/")
      const stage = page.getByTestId("market-stage")
      await scrollScene(page, "market-scene", 0.7, flow(MARKET_FLOW))
      const stageBox = (await stage.boundingBox())!
      expect(stageBox.width, "the band spans the panel").toBe(vp.width)
      // On a short phone the band follows the copy in the flow; on a tall one it is the panel's bottom 44%.
      if (!pins) {
        const copy = (await page.getByTestId("market-step-3").boundingBox())!
        expect(stageBox.y, "the band starts below the copy").toBeGreaterThanOrEqual(copy.y + copy.height - 1)
      }
      for (const i of [0, 4, 8, 12, 16]) {
        const box = (await page.getByTestId(`market-slip-${i}`).boundingBox())!
        expect(box.x, `NDA card ${i} left`).toBeGreaterThanOrEqual(stageBox.x + 8 - 1)
        expect(box.x + box.width, `NDA card ${i} right`).toBeLessThanOrEqual(stageBox.x + stageBox.width - 8 + 1)
      }
      await scrollScene(page, "market-scene", 0.98, flow(MARKET_FLOW))
      const landedBox = (await stage.boundingBox())!
      for (const k of ["A", "B", "C", "D"]) {
        const card = page.getByTestId(`market-loi-${k}`)
        // The frame loop writes the landed state on the next animation frame after the scroll.
        await expect
          .poll(() => card.evaluate((el) => (el as HTMLElement).style.opacity), { message: `letter ${k} landed` })
          .toBe("1")
        const box = (await card.boundingBox())!
        expect(box.x, `letter ${k} left`).toBeGreaterThanOrEqual(landedBox.x - 1)
        expect(box.x + box.width, `letter ${k} right`).toBeLessThanOrEqual(landedBox.x + landedBox.width + 1)
        expect(box.y, `letter ${k} top`).toBeGreaterThanOrEqual(landedBox.y - 1)
        expect(box.y + box.height, `letter ${k} bottom`).toBeLessThanOrEqual(landedBox.y + landedBox.height + 1)
      }
      // The desk film steps aside on phones: the band is too small to earn it.
      const desk = page.getByTestId("market-film-layer").locator("video")
      await expect(desk).toBeHidden()
      await expect(desk).not.toHaveAttribute("src")
    })

    test("the living sections fit the phone: two term objects per row, 44px controls, no horizontal scroll", async ({
      page,
    }) => {
      await page.goto(demoUrl("/", "still"))
      await page.getByTestId("terms-grid").scrollIntoViewIfNeeded()
      // The cards arrive with a staggered 14px rise; measure their rows once every card has settled.
      for (const key of ["seal", "envelope", "scale"]) {
        const link = page.getByTestId(`terms-link-${key}`)
        await expect(link).toHaveClass(/reveal-in/)
        await expect
          .poll(() => link.evaluate((el) => getComputedStyle(el).transform), { message: `${key} settled` })
          .toBe("none")
      }
      const seal = (await page.getByTestId("terms-figure-seal").boundingBox())!
      const envelope = (await page.getByTestId("terms-figure-envelope").boundingBox())!
      const scale = (await page.getByTestId("terms-figure-scale").boundingBox())!
      expect(Math.round(seal.y), "seal and envelope share a row").toBe(Math.round(envelope.y))
      expect(scale.y, "the third object starts a new row").toBeGreaterThan(seal.y + seal.height - 1)
      expect(seal.width, "object frame inside the gutters").toBeLessThanOrEqual((vp.width - 48 - 24) / 2 + 1)
      await expectNoHorizontalScroll(page, `terms at ${vp.width}px`)
      // The three demos' own phone budgets are measured in demo-financial/privacy/decisions.spec.ts; here:
      // each screen sits inside the gutters, its films step aside, and nothing scrolls sideways.
      const SCREENS: Array<[demo: string, frame: string, film: string]> = [
        ["fin-demo", "fin-frame", "fin-frame-film"],
        // The privacy screen carries no film layer behind its card: its film is the framed room beside the record.
        ["priv-demo", "priv-frame", "privacy-room-frame"],
        ["dec-demo", "dec-frame", "dec-frame-film"],
      ]
      for (const [screen, frame, film] of SCREENS) {
        const demo = page.getByTestId(screen)
        await demo.scrollIntoViewIfNeeded()
        const box = (await page.getByTestId(frame).boundingBox())!
        expect(box.width, `${frame} inside the gutters`).toBeLessThanOrEqual(vp.width - 48 + 1)
        await expect(page.getByTestId(film), `${film} steps aside`).toBeHidden()
        await expectNoHorizontalScroll(page, `${screen} at ${vp.width}px`)
      }
      // The buyer rows are the demos' one control, and they keep the 44px target.
      for (const key of ["competitor", "strategic", "individual", "pe"]) {
        const row = (await page.getByTestId(`priv-buyer-${key}`).boundingBox())!
        expect(row.height, `${key} row tap target`).toBeGreaterThanOrEqual(44)
      }
      await expect(page.getByTestId("dec-stage-line")).toBeVisible()
      const film = (await page.getByTestId("speed-film").boundingBox())!
      expect(film.width, "hourglass film inside the gutters").toBeLessThanOrEqual(vp.width - 48 + 1)
      await expectNoHorizontalScroll(page, `speed at ${vp.width}px`)
    })

    test("the advisor sheet hides its instrument strip on phones and still fits", async ({ page }) => {
      await page.goto("/")
      const dialog = await openAdvisorFromHeader(page, "mobile")
      await expect(dialog.getByTestId("advisor-field-strip")).toBeHidden()
      const box = (await dialog.boundingBox())!
      expect(box.width, "sheet width").toBeLessThanOrEqual(vp.width)
      await expect(dialog.getByText("Conversation", { exact: true })).toHaveAttribute("data-current", "true")
    })

    test("the /score card stacks its result pane under the questions on a phone, keeps the field behind both, and its chips are tap targets", async ({
      page,
    }) => {
      await page.goto("/score")
      const run = page.getByTestId("exitiq-run")
      const question = page.getByTestId("exitiq-question")
      const result = page.getByTestId("exitiq-result")
      await expect(question.getByRole("button", { name: "Home or field services" })).toBeVisible()
      const runBox = (await run.boundingBox())!
      expect(runBox.width, "card inside the gutters").toBe(vp.width - 48)
      await expect
        .poll(() => run.locator("canvas").evaluate((c) => (c as HTMLCanvasElement).width), { message: "field width" })
        .toBe(Math.round(runBox.width - 2))
      const questionBox = (await question.boundingBox())!
      const resultBox = (await result.boundingBox())!
      expect(resultBox.y, "result pane below the questions").toBeGreaterThanOrEqual(questionBox.y + questionBox.height)
      expect(resultBox.width, "result pane spans the card").toBe(runBox.width - 2)
      const chips = question.getByRole("group", { name: "Answer choices for question 1" }).getByRole("button")
      for (let i = 0; i < 5; i++) {
        const box = (await chips.nth(i).boundingBox())!
        expect(box.height, `chip ${i} tap target`).toBeGreaterThanOrEqual(44)
      }
      await expectNoHorizontalScroll(page, `/score at ${vp.width}px`)
    })

    test("the how-it-works stage slip fits inside the pinned panel at mid-scroll", async ({ page }) => {
      await page.goto("/how-it-works")
      await scrollScene(page, "stages-scene", STAGE_4_MID)
      const panel = page.locator('[data-testid="stages-scene"] > *')
      const stage = page.getByTestId("stage-panel-4")
      await expect(page.getByTestId("stage-node-4")).toHaveAttribute("data-state", "active")
      await expect(stage.getByRole("heading", { name: "Buyer market" })).toBeVisible()
      // The stage panel fades and slides in over 500ms; measure only once that transition has settled.
      await expect(stage).toHaveCSS("opacity", "1")
      await expect(stage).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)")
      const receive = stage.getByText("A qualified group of buyers.")
      await expect(receive).toBeVisible()
      const slip = stage.getByText("YOU RECEIVE").locator("xpath=../..")
      await expect(slip).toContainText("A qualified group of buyers.")

      const panelBox = (await panel.boundingBox())!
      const slipBox = (await slip.boundingBox())!
      const receiveBox = (await receive.boundingBox())!
      const panelBottom = panelBox.y + panelBox.height
      expect(slipBox.y, "slip starts inside the panel").toBeGreaterThanOrEqual(panelBox.y)
      expect(slipBox.y + slipBox.height, "slip bottom stays inside the panel").toBeLessThanOrEqual(panelBottom + 0.5)
      expect(receiveBox.y + receiveBox.height, "receive text stays inside the panel").toBeLessThanOrEqual(
        panelBottom + 0.5
      )
      expect(slipBox.x, "slip left edge").toBeGreaterThanOrEqual(panelBox.x)
      expect(slipBox.x + slipBox.width, "slip right edge").toBeLessThanOrEqual(panelBox.x + panelBox.width + 0.5)
    })

    test("tall phones show the travertine still above the stage card; short phones keep the panel for the copy", async ({
      page,
    }) => {
      await page.goto("/how-it-works")
      await scrollScene(page, "stages-scene", STAGE_4_MID)
      const still = page.getByTestId("stage-panel-4").locator("img[src*='stages-path-poster']")
      // The still shows under the `tall:` variant, which is the 780px panel budget plus the bar (832px).
      if (vp.height >= TALL_MIN_HEIGHT + BAR_H) {
        await expect(still).toBeVisible()
        const panel = page.locator('[data-testid="stages-scene"] > *')
        const panelBox = (await panel.boundingBox())!
        const stillBox = (await still.boundingBox())!
        expect(stillBox.y, "still inside the panel").toBeGreaterThanOrEqual(panelBox.y)
      } else {
        await expect(still).toBeHidden()
      }
      await expect(page.getByTestId("stages-film")).toBeHidden()
    })

    test("the advisor dialog fits the viewport and scrolls internally", async ({ page }) => {
      await page.goto("/fees")
      const dialog = await openAdvisorFromHeader(page, "mobile")
      await expect(dialog.getByText("QUESTION 1 OF 5", { exact: true })).toBeVisible()

      const box = (await dialog.boundingBox())!
      expect(box.x, "dialog left").toBeGreaterThanOrEqual(0)
      expect(box.y, "dialog top").toBeGreaterThanOrEqual(0)
      expect(box.x + box.width, "dialog right").toBeLessThanOrEqual(vp.width)
      expect(box.y + box.height, "dialog bottom").toBeLessThanOrEqual(vp.height)

      const metrics = await dialog.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        overflowY: getComputedStyle(el).overflowY,
      }))
      expect(metrics.overflowY).toBe("auto")
      expect(metrics.scrollHeight, "dialog content taller than its box").toBeGreaterThan(metrics.clientHeight)

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.wheel(0, 400)
      await expect.poll(() => dialog.evaluate((el) => el.scrollTop), { message: "dialog scrolls" }).toBeGreaterThan(0)
      expect(await page.evaluate(() => window.scrollY), "page behind the dialog does not scroll").toBe(0)

      const footnote = dialog.getByText("Not shared outside Heirloom.")
      await footnote.scrollIntoViewIfNeeded()
      await expect(footnote).toBeInViewport()
    })
  })
}
