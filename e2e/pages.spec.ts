import { expect, test } from "@playwright/test"
import {
  DESKTOP,
  expectFilmAt,
  expectPinned,
  PHONE,
  scrollScene,
  STAGE_4_MID,
  waitForInquiry,
  watchConsole,
} from "./helpers"

/* The forms below confirm a copy only when the clipboard write lands, so the context is granted the
   clipboard the way score.spec and advisor.spec grant it. */
test.use({ permissions: ["clipboard-read", "clipboard-write"] })

test.describe("fees", () => {
  test("the calculator is hydrated: the path, the price range and the quoted rate all recompute the fee", async ({
    page,
  }) => {
    // Every figure below is pinned by FeeCalculator.test.tsx; here it is the served page recomputing on a real
    // click, a real range drag and a real number entry.
    await page.goto("/fees")
    const calc = page.getByTestId("fee-calculator")
    await expect(calc.getByTestId("fee-price")).toHaveText("$2,400,000")
    await expect(calc.getByTestId("fee-total")).toHaveText("$120,000")

    await calc.getByTestId("fee-path-execution").click()
    await expect(calc.getByTestId("fee-total")).toHaveText("$60,000")

    await page.locator("#fees-price").fill("4000000")
    await expect(calc.getByTestId("fee-price")).toHaveText("$4,000,000")
    await expect(calc.getByTestId("fee-total")).toHaveText("$100,000")

    await calc.getByRole("button", { name: "Enter quoted rate" }).click()
    await expect(calc.getByTestId("fee-traditional")).toHaveText("Enter a rate to compare.")
    await page.locator("#fees-rate").fill("12")
    await expect(calc.getByTestId("fee-traditional")).toHaveText("$480,000")
    await expect(calc.getByTestId("fee-difference")).toHaveText("$380,000")
    // One range everywhere: a rate outside the input's own 1–25 bounds is refused in those words.
    await page.locator("#fees-rate").fill("26")
    await expect(calc.getByTestId("fee-traditional")).toHaveText("Enter a rate between 1 and 25.")
    await expect(calc.getByTestId("fee-difference")).toHaveText("–")
  })
})

test.describe("confidentiality", () => {
  test("the disclosure panel is hydrated: a stop opens the record a level further", async ({ page }) => {
    // The level-by-level walk is Panels.test.tsx l.40; here the served panel answers a real click.
    await page.goto("/confidentiality")
    const panel = page.getByTestId("disclosure-levels")
    await panel.scrollIntoViewIfNeeded()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 1 of 5")
    await panel.getByTestId("perm-stop-4").click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 4 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText("Selected buyer or approved finalist")
    await expect(panel.getByTestId("company-record")).toContainText("Carolina Foods Group, 14%, contract attached")
  })
})

test.describe("buyers", () => {
  test("the registration form sends the passport request", async ({ page }) => {
    // The passport tiers are walked by Panels.test.tsx l.150; this is the form's one real POST.
    await page.goto("/buyers")
    const form = page.getByTestId("buyer-register-form")
    await form.scrollIntoViewIfNeeded()
    await form.getByLabel("Your name").fill("Test Buyer")
    await form.getByLabel("Email").fill("buyer@example.com")
    await form.getByLabel("Industries you pursue").fill("HVAC")
    await form.getByLabel("Target transaction size").fill("$2M to $5M")
    await form.getByLabel("What kind of buyer are you?").selectOption("Family office")
    await form.getByLabel(/I confirm that this information/).check()
    const inquiry = waitForInquiry(page)
    await form.getByTestId("buyer-register-submit").click()
    expect((await inquiry).postDataJSON()).toEqual({
      kind: "buyer_passport",
      email: "buyer@example.com",
      source: "buyers",
      body:
        "I would like to create a Buyer Passport.\n\nName: Test Buyer\nFirm: Independent buyer\nEmail: buyer@example.com" +
        "\nAcquisition focus: HVAC\nTarget size: $2M to $5M\nWhat kind of buyer are you?: Family office" +
        "\n\nPlease send the verification steps.",
    })
    await expect(form.getByTestId("buyer-register-sent")).toBeVisible()
    await expect(form.getByTestId("buyer-register-sent")).toContainText(
      "If your email app did not open, paste the copied registration into a message to buyers@heirloom.com."
    )
  })

  test("the registration form refuses to submit without the required fields", async ({ page }) => {
    await page.goto("/buyers")
    const form = page.getByTestId("buyer-register-form")
    await form.scrollIntoViewIfNeeded()
    let requests = 0
    page.on("request", (req) => {
      if (req.url().endsWith("/api/inquiry")) requests++
    })
    await form.getByTestId("buyer-register-submit").click()
    expect(await form.evaluate((el) => (el as HTMLFormElement).checkValidity())).toBe(false)
    await expect(form.getByLabel("Your name")).toBeFocused()
    await expect(form.getByTestId("buyer-register-sent")).toBeHidden()
    expect(requests).toBe(0)

    await form.getByLabel("Your name").fill("Only Name")
    await form.getByLabel("Email").fill("not-an-email")
    await form.getByTestId("buyer-register-submit").click()
    expect(await form.evaluate((el) => (el as HTMLFormElement).checkValidity())).toBe(false)
    await expect(form.getByLabel("Email")).toBeFocused()
    expect(requests).toBe(0)
  })
})

test.describe("questions", () => {
  test("the ask form sends the question", async ({ page }) => {
    // One answer open at a time is Panels.test.tsx l.253 and accessibility.spec's disclosure test.
    await page.goto("/questions")
    const ask = page.getByTestId("ask-form")
    await ask.getByLabel("Your question").fill("Do you work with franchises?")
    await ask.getByLabel("Email for the reply").fill("owner@example.com")
    const inquiry = waitForInquiry(page)
    await ask.getByTestId("ask-send").click()
    await expect(ask.getByTestId("ask-send")).toBeDisabled()
    expect((await inquiry).postDataJSON()).toEqual({
      kind: "question",
      email: "owner@example.com",
      source: "questions",
      body: "Question: Do you work with franchises?\n\nReply to: owner@example.com",
    })
    await expect(ask.getByTestId("ask-sent")).toContainText("Your email app opened with the question filled in.")
    await expect(ask.getByTestId("ask-send")).toBeEnabled()
  })
})

test.describe("how it works", () => {
  test("the roadmap advances with scroll and the reconciliation example resolves", async ({ page }) => {
    const console = watchConsole(page)
    await page.goto("/how-it-works")
    await scrollScene(page, "stages-scene", 0.02)
    await expect(page.getByTestId("stage-node-0")).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("stage-panel-0")).toContainText("Your goals and timing")
    await expect(page.getByTestId("stage-panel-0")).toContainText("A sale plan and information request.")
    await expect(page.getByText("Scroll to move through the stages.")).toBeVisible()

    await scrollScene(page, "stages-scene", STAGE_4_MID)
    await expectPinned(page, "stages-scene")
    await expect(page.getByTestId("stage-node-4")).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("stage-node-3")).toHaveAttribute("data-state", "done")
    await expect(page.getByTestId("stage-node-5")).toHaveAttribute("data-state", "pending")
    await expect(page.getByTestId("stage-panel-4")).toContainText("Buyer market")
    await expect(page.getByTestId("stage-panel-4")).toContainText("Nothing until qualified buyers are ready.")

    await scrollScene(page, "stages-scene", 0.99)
    await expect(page.getByTestId("stage-node-7")).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("stage-panel-7")).toContainText("Diligence, financing, and closing")

    const brain = page.getByTestId("business-brain")
    await brain.scrollIntoViewIfNeeded()
    await expect(brain.getByTestId("brain-status")).toHaveText("Advisor review required")
    await expect(
      brain.getByText("Adjusted earnings", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("$817,400")
    await brain.getByRole("button", { name: /Show the resolution/ }).click()
    await expect(brain.getByTestId("brain-status")).toHaveText("Resolved by the advisor")
    await expect(
      brain.getByText("Adjusted earnings", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("$845,000")
    await brain.getByRole("button", { name: "Reset example" }).click()
    await expect(brain.getByTestId("brain-status")).toHaveText("Advisor review required")
    console.assertClean()
  })
})

test.describe("generated films and objects on the pages", () => {
  test("the travertine film beside the stage card scrubs one lamp per stage from the tablet breakpoint", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto("/how-it-works")
    const film = page.getByTestId("stages-film")
    await expect(film).toHaveCount(1)
    const video = film.getByTestId("scrub-video")
    await expect(video).toHaveAttribute("poster", "/media/stages-path-poster.jpg")
    await scrollScene(page, "stages-scene", STAGE_4_MID)
    await expectPinned(page, "stages-scene")
    await expectFilmAt(video, 5.6)
    // The film frame sits above the stage card, both inside the pinned panel, and never over the copy.
    const panel = page.locator('[data-testid="stages-scene"] > *')
    const filmBox = (await film.boundingBox())!
    const cardBox = (await page
      .getByTestId("stage-panel-4")
      .getByText("YOU RECEIVE")
      .locator("xpath=..")
      .boundingBox())!
    const copyBox = (await page
      .getByTestId("stage-panel-4")
      .getByRole("heading", { name: "Buyer market" })
      .boundingBox())!
    const panelBox = (await panel.boundingBox())!
    expect(filmBox.y, "film inside the panel").toBeGreaterThanOrEqual(panelBox.y)
    expect(filmBox.y + filmBox.height, "film above the card").toBeLessThanOrEqual(cardBox.y + 0.5)
    expect(filmBox.x, "film clear of the copy column").toBeGreaterThanOrEqual(copyBox.x + copyBox.width)
    await scrollScene(page, "stages-scene", 0.98)
    await expectFilmAt(video, 9.8)
  })

  test("the buyers hero shows the passport booklet as an object beside the copy", async ({ page, request }) => {
    await page.goto("/buyers")
    const figure = page.getByTestId("passport-figure")
    const img = figure.getByRole("img", {
      name: "A deep green Buyer Passport booklet with a brass Heirloom seal on the cover",
    })
    await expect(img).toBeVisible()
    const object = await request.get("/generated/passport.webp")
    expect(object.status()).toBe(200)
    expect(object.headers()["content-type"]).toBe("image/webp")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A verified record of who you are and what you buy"
    )
  })

  test("the envelopes rest beside the offer comparison headline on desktop and step aside on phones", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto("/")
    const figure = page.getByTestId("offers-figure")
    await figure.scrollIntoViewIfNeeded()
    await expect(figure.getByRole("img", { name: "Four sealed cream envelopes with brass clasps" })).toBeVisible()
    await page.setViewportSize(PHONE)
    await expect(figure).toBeHidden()
    await expect(page.getByRole("heading", { name: "Compare offers" })).toBeVisible()
  })
})
