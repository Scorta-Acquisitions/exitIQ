import { expect, type Page, test } from "@playwright/test"
import {
  advisorDialog,
  expectNoHorizontalScroll,
  expectPath,
  H1_BY_PATH,
  NARROW_PHONE,
  PHONE,
  scrollScene,
  waitForInquiry,
  watchConsole,
} from "./helpers"
import { ALL_ROUTES, MOBILE_NAV_LINKS } from "../lib/site/routes"

const VIEWPORTS = [
  { ...PHONE, headerCta: true },
  { ...NARROW_PHONE, headerCta: false },
]

for (const vp of VIEWPORTS) {
  test.describe(`${vp.width}×${vp.height}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: true })

    /** Opens the advisor dialog the way a visitor at this width can: header button, or the menu's button. */
    async function openAdvisor(page: Page) {
      const header = page.getByRole("banner")
      if (vp.headerCta) {
        await header.getByTestId("open-advisor").tap()
      } else {
        await page.getByTestId("nav-burger").tap()
        await header.getByRole("button", { name: "Talk to an M&A advisor" }).tap()
      }
      const dialog = advisorDialog(page)
      await expect(dialog).toBeVisible()
      return dialog
    }

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

    test(`the header ${vp.headerCta ? "shows" : "hides"} the advisor button and the menu carries one that opens the dialog`, async ({
      page,
    }) => {
      await page.goto("/")
      const header = page.getByRole("banner")
      const headerCta = header.getByTestId("open-advisor")
      if (vp.headerCta) {
        await expect(headerCta).toBeVisible()
        await expect(headerCta).toHaveText("Talk to an M&A advisorTalk to an advisor")
      } else {
        await expect(headerCta).toBeHidden()
      }
      const burger = page.getByTestId("nav-burger")
      await burger.tap()
      const menuCta = header.getByRole("button", { name: "Talk to an M&A advisor" })
      await expect(menuCta).toBeVisible()
      await menuCta.tap()
      await expect(advisorDialog(page)).toBeVisible()
      await expect(burger).toHaveAttribute("aria-expanded", "false")
    })

    test("no route scrolls horizontally and every route keeps the menu button", async ({ page }) => {
      for (const path of [...ALL_ROUTES, "/nothing-here"]) {
        await page.goto(path)
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        await expect(page.getByRole("contentinfo")).toBeAttached()
        await expectNoHorizontalScroll(page, `${path} at ${vp.width}px`)
        await expect(page.getByTestId("nav-burger")).toBeVisible()
        await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden()
      }
    })

    test("the hero graph is hidden and the sell path runs through to its result", async ({ page }) => {
      const console = watchConsole(page)
      await page.goto("/")
      const hero = page.getByTestId("hero-console")
      await expect(page.getByTestId("hero-graph")).toBeHidden()
      await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
      await expect(hero.getByTestId("hero-progress")).toHaveText("")

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
      await expect(done.getByRole("heading", { name: "See what your sale would require." })).toBeVisible()
      await expect(done).toContainText("You may be ready to begin a full sale process.")
      await expect(done).toContainText(
        "Full representation usually begins around $1M in annual revenue. We can still help you identify the right next step."
      )
      await expect(done.getByRole("link", { name: "See the sale process →" })).toHaveAttribute("href", "/how-it-works")
      await expect(done.getByTestId("open-advisor")).toBeVisible()
      await expectNoHorizontalScroll(page, `sell result at ${vp.width}px`)

      await hero.getByRole("button", { name: "Start over" }).tap()
      await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
      await expect(hero.getByTestId("hero-progress")).toHaveText("")
      console.assertClean()
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

    test("the how-it-works stage slip fits inside the pinned panel at mid-scroll", async ({ page }) => {
      await page.goto("/how-it-works")
      await scrollScene(page, "stages-scene", 0.5)
      const panel = page.locator('[data-testid="stages-scene"] > *')
      const stage = page.getByTestId("stage-panel-4")
      await expect(page.getByTestId("stage-node-4")).toHaveAttribute("data-state", "active")
      await expect(stage.getByRole("heading", { name: "Build the buyer market" })).toBeVisible()
      // The stage panel fades and slides in over 500ms; measure only once that transition has settled.
      await expect(stage).toHaveCSS("opacity", "1")
      await expect(stage).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)")
      const receive = stage.getByText("A qualified group of prospective buyers.")
      await expect(receive).toBeVisible()
      const slip = stage.getByText("YOU RECEIVE").locator("xpath=../..")
      await expect(slip).toContainText("A qualified group of prospective buyers.")

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

    test("the buyer registration form submits", async ({ page }) => {
      await page.goto("/buyers")
      const form = page.getByTestId("buyer-register-form")
      await form.scrollIntoViewIfNeeded()
      await form.getByLabel("Your name").fill("Mobile Buyer")
      await form.getByLabel("Email").fill("mobile@example.com")
      await form.getByLabel("Industries you pursue").fill("Landscaping")
      await form.getByLabel("Target transaction size").fill("$1M to $3M")
      await form.getByLabel(/I confirm that this information/).check()
      const inquiry = waitForInquiry(page)
      await form.getByTestId("buyer-register-submit").tap()
      expect((await inquiry).postDataJSON()).toEqual({
        kind: "buyer_passport",
        email: "mobile@example.com",
        source: "buyers",
        body:
          "I would like to create a Buyer Passport.\n\nName: Mobile Buyer\nFirm: Independent buyer\nEmail: mobile@example.com" +
          "\nAcquisition focus: Landscaping\nTarget size: $1M to $3M\nWhat kind of buyer are you?: Individual buyer or searcher" +
          "\n\nPlease send the verification steps.",
      })
      await expect(form.getByTestId("buyer-register-sent")).toContainText(
        "Your email app opened with the registration filled in. Send it to begin. The text has also been copied."
      )
    })

    test("the offer intake paste flow sends the terms", async ({ page }) => {
      await page.goto("/offer-review")
      const intake = page.getByTestId("offer-intake")
      await page.getByTestId("oi-tab-paste").tap()
      await expect(page.getByTestId("oi-tab-paste")).toHaveAttribute("aria-pressed", "true")
      await intake.getByLabel("Paste the offer or buyer email").fill("$3.1M, half at closing, 60 days exclusivity.")
      const inquiry = waitForInquiry(page)
      await intake.getByTestId("oi-send").tap()
      expect((await inquiry).postDataJSON()).toEqual({
        kind: "offer_review",
        email: "",
        source: "offer-review",
        body:
          "I received the following terms for my business:\n\n$3.1M, half at closing, 60 days exclusivity.\n\n" +
          "Please explain what I would receive, what is missing, and which terms deserve attention before I respond." +
          "\n\nSent from the Heirloom Offer Review page.",
      })
      await expect(intake.getByTestId("oi-sent")).toBeVisible()
      await expectNoHorizontalScroll(page, `offer intake at ${vp.width}px`)
    })

    test("the advisor dialog fits the viewport and scrolls internally", async ({ page }) => {
      await page.goto("/fees")
      const dialog = await openAdvisor(page)
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

      const footnote = dialog.getByText("Read by your advisor before the call. Not shared outside Heirloom.")
      await footnote.scrollIntoViewIfNeeded()
      await expect(footnote).toBeInViewport()
    })
  })
}
