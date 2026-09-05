import { expect, test } from "@playwright/test"
import {
  advisorDialog,
  answerExitIq,
  briefingRow,
  EXITIQ_EXPECTED,
  expectPath,
  expectPinned,
  scrollScene,
  watchConsole,
} from "./helpers"

test.describe("home hero console", () => {
  test("offers three paths, highlights the hovered one, and shows the live graph", async ({ page }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await expect(hero.getByRole("heading", { name: "Where are you today?" })).toBeVisible()
    await expect(hero.getByTestId("hero-progress")).toHaveText("")
    await expect(hero.getByRole("button", { name: "Start over" })).toBeHidden()
    const options = hero.getByRole("group", { name: "Choose where you are in the sale process" }).getByRole("button")
    await expect(options).toHaveCount(3)
    await expect(options.nth(0)).toContainText("I want to sell")
    await expect(options.nth(1)).toContainText("I already have a buyer or offer")
    await expect(options.nth(2)).toContainText("I'm not sure I'm ready")
    await expect(hero.getByText("A full private sale.")).toBeVisible()
    await expect(hero.getByText("A free review of the offer before you sign.")).toBeHidden()

    await hero.getByTestId("hero-option-offer").hover()
    await expect(hero.getByText("A free review of the offer before you sign.")).toBeVisible()
    await expect(hero.getByText("A full private sale.")).toBeHidden()

    const graph = page.getByTestId("hero-graph")
    await expect(graph).toBeVisible()
    await expect(graph).toHaveAttribute("aria-label", "Diagram of a private buyer process around one business")
    await expect(graph).toContainText("YOUR BUSINESS")
  })

  test("sell path: two questions, a result, and a carried-over advisor briefing", async ({ page }) => {
    const console = watchConsole(page)
    await page.goto("/")
    const hero = page.getByTestId("hero-console")

    await hero.getByTestId("hero-option-sell").click()
    await expect(hero.getByTestId("hero-progress")).toHaveText("QUESTION 1 OF 2")
    await expect(hero.getByRole("heading", { name: "When are you thinking about selling?" })).toBeVisible()
    await hero.getByRole("button", { name: "In 6 to 18 months", exact: true }).click()
    await expect(hero.getByTestId("hero-progress")).toHaveText("QUESTION 2 OF 2")
    await expect(
      hero.getByRole("heading", { name: "About how much revenue did the business generate last year?" })
    ).toBeVisible()
    await hero.getByRole("button", { name: "$3M to $10M", exact: true }).click()

    await expect(hero.getByTestId("hero-progress")).toHaveText("YOUR RESULT")
    const done = hero.getByTestId("hero-sell-done")
    await expect(done).toContainText("This timing leaves room to prepare before buyers see the business.")
    await expect(done).toContainText("Your business is in Heirloom’s usual range.")
    await expect(done.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "/how-it-works")

    await done.getByTestId("open-advisor").click()
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
    console.assertClean()
  })

  test("sell path copy follows the timing and revenue chosen", async ({ page }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await hero.getByTestId("hero-option-sell").click()
    await hero.getByRole("button", { name: "I am only exploring", exact: true }).click()
    await hero.getByRole("button", { name: "More than $10M", exact: true }).click()
    const done = hero.getByTestId("hero-sell-done")
    await expect(done).toContainText("An advisor call does not commit you to selling.")
    await expect(done).toContainText("We review larger businesses individually.")
  })

  test("offer path lists the three ways to share and deep-links into the review page with the paste tab open", async ({
    page,
  }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await hero.getByTestId("hero-option-offer").click()
    await expect(hero.getByTestId("hero-progress")).toHaveText("FREE OFFER REVIEW")
    const offer = hero.getByTestId("hero-offer")
    await expect(offer.getByRole("heading", { name: "What the offer pays" })).toBeVisible()
    await expect(offer.getByRole("link", { name: /Forward or attach the offer/ })).toHaveAttribute(
      "href",
      "mailto:offers@heirloom.com"
    )
    await expect(offer.getByRole("link", { name: /Tell us what was said/ })).toHaveAttribute(
      "href",
      "/offer-review?mode=verbal"
    )
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
    await expect(hero.getByRole("heading", { name: "Is the business ready to sell?" })).toBeVisible()
    await hero.getByRole("button", { name: "Start exitIQ" }).click()
    await expect(hero.getByText("exitIQ · Question 1 of 7")).toBeVisible()

    await answerExitIq(hero)

    const done = hero.getByTestId("hero-iq-done")
    await expect(done).toBeVisible()
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

  test("Start over in the hero result clears the exitIQ run", async ({ page }) => {
    await page.goto("/")
    const hero = page.getByTestId("hero-console")
    await hero.getByTestId("hero-option-ready").click()
    await hero.getByRole("button", { name: "Start exitIQ" }).click()
    await answerExitIq(hero)
    await hero.getByTestId("hero-iq-done").getByRole("button", { name: "Start over" }).click()
    await expect(hero.getByText("exitIQ · Question 1 of 7")).toBeVisible()
    await expect(hero.locator("[aria-pressed='true']")).toHaveCount(0)
    await expect(hero.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "0")
  })
})

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

  test("privacy scene walks disclosure levels with scroll", async ({ page }) => {
    await page.goto("/")
    await scrollScene(page, "privacy-scene", 0.02)
    await expect(page.getByTestId("privacy-level")).toHaveText("L1")
    await expect(page.getByTestId("privacy-scene")).toContainText("Anonymous overview")
    await scrollScene(page, "privacy-scene", 0.5)
    await expectPinned(page, "privacy-scene")
    await expect(page.getByTestId("privacy-level")).toHaveText("L3")
    await scrollScene(page, "privacy-scene", 0.98)
    await expect(page.getByTestId("privacy-level")).toHaveText("L5")
    await expect(page.getByTestId("privacy-scene").getByTestId("company-record")).toContainText(
      "Ridgeline Mechanical Services"
    )
    await expect(
      page.getByTestId("privacy-scene").getByRole("link", { name: "See who can access what" })
    ).toHaveAttribute("href", "/confidentiality")
  })

  test("offer comparison re-ranks and expands a letter of intent", async ({ page }) => {
    await page.goto("/")
    const section = page.getByTestId("offer-comparison")
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByTestId("offer-card-C")).toHaveAttribute("data-best", "true")
    await section.getByRole("button", { name: "Protect employees and the company name" }).click()
    await expect(section.getByTestId("offer-card-A")).toHaveAttribute("data-best", "true")
    await expect(section.getByTestId("offer-card-C")).toHaveAttribute("data-best", "false")
    await section.getByTestId("offer-card-B").click()
    await expect(section.getByTestId("offer-detail")).toContainText("Letter of intent B · Independent searcher")
    await expect(section.getByTestId("offer-detail")).toContainText("Lower · 90 days exclusivity")
  })

  test("questions teaser toggles an answer open and closed", async ({ page }) => {
    await page.goto("/")
    const q = page.getByRole("button", { name: "Will my employees find out?" })
    await q.scrollIntoViewIfNeeded()
    await expect(q).toHaveAttribute("aria-expanded", "false")
    const answer = page.getByText(
      "Not from Heirloom. We do not contact employees, customers, or suppliers without your approval."
    )
    await expect(answer).toBeHidden()
    await q.click()
    await expect(q).toHaveAttribute("aria-expanded", "true")
    await expect(answer).toBeVisible()
    await q.click()
    await expect(q).toHaveAttribute("aria-expanded", "false")
    await expect(answer).toBeHidden()
  })
})
