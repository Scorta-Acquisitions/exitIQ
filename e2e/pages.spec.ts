import { expect, test } from "@playwright/test"
import { expectPinned, scrollScene, waitForInquiry, watchConsole } from "./helpers"

test.describe("fees", () => {
  test("calculator responds to path, price, and quoted rate", async ({ page }) => {
    await page.goto("/fees")
    const calc = page.getByTestId("fee-calculator")
    await expect(calc.getByTestId("fee-price")).toHaveText("$2,400,000")
    await expect(calc.getByTestId("fee-total")).toHaveText("$120,000")
    await expect(calc.getByTestId("fee-traditional")).toHaveText("$240,000")
    await expect(calc.getByTestId("fee-difference")).toHaveText("$120,000")
    await expect(calc.getByText("Full private sale selected")).toBeVisible()
    await expect(
      calc.getByText("Success fee rate", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("5%")
    await expect(
      calc.getByText("Engagement commitment", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("$5,000")
    await expect(
      calc.getByText("Still due at closing", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("$115,000")

    await calc.getByTestId("fee-path-execution").click()
    await expect(calc.getByTestId("fee-total")).toHaveText("$60,000")
    await expect(
      calc.getByText("Success fee rate", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("2.5%")
    await expect(
      calc.getByText("Engagement commitment", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("$0")

    await page.locator("#fees-price").fill("4000000")
    await expect(calc.getByTestId("fee-price")).toHaveText("$4,000,000")
    await expect(calc.getByTestId("fee-total")).toHaveText("$100,000")

    await calc.getByRole("button", { name: "Enter quoted rate" }).click()
    await expect(calc.getByTestId("fee-traditional")).toHaveText("Comparison available after rate is entered")
    await expect(calc.getByTestId("fee-difference")).toHaveText("Comparison available after rate is entered")
    await page.locator("#fees-rate").fill("12")
    await expect(calc.getByTestId("fee-traditional")).toHaveText("$480,000")
    await expect(calc.getByTestId("fee-difference")).toHaveText("$380,000")
  })

  test("calculator explains an invalid quoted rate and a large deal, and resets", async ({ page }) => {
    await page.goto("/fees")
    const calc = page.getByTestId("fee-calculator")
    await calc.getByRole("button", { name: "Enter quoted rate" }).click()
    await page.locator("#fees-rate").fill("0")
    await expect(calc.getByTestId("fee-traditional")).toHaveText(
      "We cannot calculate a reliable comparison for this value."
    )
    await expect(calc.getByTestId("fee-difference")).toHaveText(
      "We cannot calculate a reliable comparison for this value."
    )

    await calc.getByRole("button", { name: "Use 10% illustration" }).click()
    await page.locator("#fees-price").fill("6000000")
    await expect(calc.getByTestId("fee-price")).toHaveText("$6,000,000")
    await expect(calc.getByTestId("fee-total")).toHaveText("$300,000")
    await expect(calc.getByTestId("fee-traditional")).toHaveText(
      "Traditional fees vary at this transaction size. Enter the quoted rate to compare."
    )
    await expect(calc.getByTestId("fee-difference")).toHaveText("Comparison available after rate is entered")

    await calc.getByRole("button", { name: "Reset calculator" }).click()
    await expect(calc.getByTestId("fee-price")).toHaveText("$2,400,000")
    await expect(calc.getByTestId("fee-total")).toHaveText("$120,000")
    await expect(calc.getByTestId("fee-traditional")).toHaveText("$240,000")
    await expect(calc.getByTestId("fee-path-market")).toHaveAttribute("aria-pressed", "true")
    await expect(page.locator("#fees-rate")).toBeHidden()
  })
})

test.describe("confidentiality", () => {
  test("disclosure levels reveal more of the record", async ({ page }) => {
    await page.goto("/confidentiality")
    const panel = page.getByTestId("disclosure-levels")
    await panel.scrollIntoViewIfNeeded()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 1 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText("Prospective buyer matching your approved criteria")
    await expect(panel.getByTestId("company-record")).toContainText("Hidden")

    await panel.getByTestId("perm-stop-4").click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 4 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText("Selected buyer or approved finalist")
    await expect(panel.getByTestId("company-record")).toContainText("Carolina Foods Group, 14%, contract attached")

    await panel.getByRole("button", { name: "Return to anonymous view" }).click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 1 of 5")
    await expect(panel).toContainText("Viewed 2025 payroll register")
  })

  test("the slider, Move to next level, and the top level clamp all drive the same view", async ({ page }) => {
    await page.goto("/confidentiality")
    const panel = page.getByTestId("disclosure-levels")
    await panel.scrollIntoViewIfNeeded()
    await panel.getByRole("button", { name: "Move to next level" }).click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 2 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText("Interested buyer who passes initial review")
    await expect(panel.getByTestId("perm-stop-2")).toHaveAttribute("aria-pressed", "true")

    await panel.getByRole("slider", { name: "Choose what this buyer can see" }).fill("3")
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 3 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText(
      "Serious buyer whose identity, fit, and ability to close have been reviewed"
    )

    await panel.getByTestId("perm-stop-5").click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 5 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText("People with a confirmed role in closing")
    await panel.getByRole("button", { name: "Move to next level" }).click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 5 of 5")

    await panel.getByTestId("perm-stop-0").click()
    await expect(panel.getByTestId("perm-level")).toHaveText("View level 0 of 5")
    await expect(panel.getByTestId("perm-who")).toHaveText("Anyone")
  })
})

test.describe("buyers", () => {
  test("passport tiers switch and the registration form submits", async ({ page }) => {
    await page.goto("/buyers")
    const tiers = page.getByTestId("passport-tiers")
    await expect(tiers.getByTestId("passport-tier-name")).toHaveText("Heirloom Verified")
    await expect(tiers.getByTestId("passport-tier-2")).toHaveAttribute("aria-pressed", "true")
    await expect(tiers).toContainText("Verified capacity range: $3M to $6M")
    await tiers.getByTestId("passport-tier-0").click()
    await expect(tiers.getByTestId("passport-tier-name")).toHaveText("Network Member")
    await expect(tiers).toContainText("Provided, not verified")
    await expect(tiers).toContainText("Not checked")
    await tiers.getByTestId("passport-tier-3").click()
    await expect(tiers.getByTestId("passport-tier-name")).toHaveText("Deal Qualified")
    await expect(tiers).toContainText("Matched to this transaction")
    await expect(tiers.getByRole("link", { name: "Verify this Passport" })).toHaveAttribute(
      "href",
      "mailto:buyers@heirloom.com?subject=Verify%20this%20Passport"
    )

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
  test("only one answer is open at a time and the ask form sends the question", async ({ page }) => {
    await page.goto("/questions")
    const first = page.getByRole("button", { name: "Does Heirloom represent buyers?" })
    const second = page.getByRole("button", { name: "Do buyers pay Heirloom?" })
    await first.scrollIntoViewIfNeeded()
    await first.click()
    await expect(first).toHaveAttribute("aria-expanded", "true")
    await expect(
      page.getByText(
        "No. Heirloom represents sellers in transactions and never buys a represented business for its own account. Buyer Passport verifies buyers; it does not advise them on a Heirloom-represented transaction."
      )
    ).toBeVisible()
    await second.click()
    await expect(second).toHaveAttribute("aria-expanded", "true")
    await expect(first).toHaveAttribute("aria-expanded", "false")
    await expect(
      page.getByText(
        "Buyers do not pay Heirloom a transaction fee on a business we represent. Buyer Passport is currently free."
      )
    ).toBeVisible()

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
    await expect(ask.getByTestId("ask-sent")).toContainText(
      "Your email app opened with the question filled in. Send it to reach Heirloom."
    )
    await expect(ask.getByTestId("ask-send")).toBeEnabled()
  })
})

test.describe("offer review", () => {
  test("paste mode sends the terms", async ({ page }) => {
    await page.goto("/offer-review")
    await expect(page.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
    await page.getByTestId("oi-tab-paste").click()
    await page.getByLabel("Paste the offer or buyer email").fill("We propose an enterprise value of $4,650,000.")
    const inquiry = waitForInquiry(page)
    await page.getByTestId("oi-send").click()
    expect((await inquiry).postDataJSON()).toEqual({
      kind: "offer_review",
      email: "",
      source: "offer-review",
      body:
        "I received the following terms for my business:\n\nWe propose an enterprise value of $4,650,000.\n\n" +
        "Please explain what I would receive, what is missing, and which terms deserve attention before I respond." +
        "\n\nSent from the Heirloom Offer Review page.",
    })
    await expect(page.getByTestId("oi-sent")).toBeVisible()
  })
})

test.describe("how it works", () => {
  test("the roadmap advances with scroll and the reconciliation example resolves", async ({ page }) => {
    const console = watchConsole(page)
    await page.goto("/how-it-works")
    await scrollScene(page, "stages-scene", 0.02)
    await expect(page.getByTestId("stage-node-0")).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("stage-panel-0")).toContainText("Understand your goals")
    await expect(page.getByTestId("stage-panel-0")).toContainText("A sale plan and focused information request.")
    await expect(
      page.getByText("Move through the stages to see what Heirloom handles and when you are needed.")
    ).toBeVisible()

    await scrollScene(page, "stages-scene", 0.5)
    await expectPinned(page, "stages-scene")
    await expect(page.getByTestId("stage-node-4")).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("stage-node-3")).toHaveAttribute("data-state", "done")
    await expect(page.getByTestId("stage-node-5")).toHaveAttribute("data-state", "pending")
    await expect(page.getByTestId("stage-panel-4")).toContainText("Build the buyer market")
    await expect(page.getByTestId("stage-panel-4")).toContainText("Nothing until serious buyers are ready.")

    await scrollScene(page, "stages-scene", 0.99)
    await expect(page.getByTestId("stage-node-7")).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("stage-panel-7")).toContainText("Complete diligence, financing, and closing")

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
    await expect(brain).toContainText(
      "$214,000, including $27,600 of documented family payroll with no recorded hours."
    )
    await brain.getByRole("button", { name: "Reset example" }).click()
    await expect(brain.getByTestId("brain-status")).toHaveText("Advisor review required")
    console.assertClean()
  })
})
