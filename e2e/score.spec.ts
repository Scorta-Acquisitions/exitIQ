import { expect, type Page, test } from "@playwright/test"
import { readFileSync } from "node:fs"
import {
  answerExitIq,
  EXITIQ_ANSWERS,
  EXITIQ_EMPTY_STATE,
  EXITIQ_EXPECTED,
  waitForInquiry,
  watchConsole,
} from "./helpers"
import { QUESTIONS } from "../lib/site/exitiq/questions"

test.use({ permissions: ["clipboard-read", "clipboard-write"] })

const CAL = "https://heirloom.cal.com/suyash/m-a-advisory-meeting"
const SENT_COPY =
  "The booking page opened in a new tab with your result attached. It is also copied; paste it into the booking notes if it is missing."

const meter = (page: Page, label: string) =>
  page.getByTestId("exitiq-result").getByText(label, { exact: true }).locator("xpath=following-sibling::span")

const indexed = (scope: ReturnType<Page["getByTestId"]>, index: string) =>
  scope.getByText(index, { exact: true }).locator("xpath=following-sibling::span")

test.describe("/score exitIQ run", () => {
  test("answering all seven questions shows the recommendation, three findings, the meters, and a 90-day plan", async ({
    page,
  }) => {
    const console = watchConsole(page)
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    const question = page.getByTestId("exitiq-question")
    const result = page.getByTestId("exitiq-result")
    const progress = run.getByRole("progressbar", { name: "Your progress" })

    await expect(question).toContainText("Question 1 of 7")
    await expect(question.getByRole("heading", { name: "What kind of business do you run?" })).toBeVisible()
    await expect(question).toContainText(
      "Choose the closest answer. Estimates are fine. You can change any answer before finishing."
    )
    await expect(progress).toHaveAttribute("aria-valuemax", "7")
    await expect(progress).toHaveAttribute("aria-valuenow", "0")
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EMPTY_STATE)
    await expect(meter(page, "Financeability")).toHaveText("–")
    await expect(meter(page, "Transferability")).toHaveText("–")
    await expect(meter(page, "Evidence quality")).toHaveText("–")
    await expect(question.getByRole("button", { name: "Change my last answer" })).toBeHidden()
    await expect(question.getByRole("button", { name: "Start over" })).toBeHidden()
    await expect(result.getByText("Your next 90 days")).toBeHidden()

    await answerExitIq(run)

    const done = page.getByTestId("exitiq-done")
    await expect(done).toBeVisible()
    await expect(question).toBeHidden()
    await expect(done).toContainText("Your result is ready.")
    await expect(done.getByRole("heading", { name: "What a buyer is likely to question first." })).toBeVisible()
    await expect(progress).toHaveAttribute("aria-valuenow", "7")
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EXPECTED.state)
    await expect(result).toContainText(EXITIQ_EXPECTED.description)
    await expect(meter(page, "Financeability")).toHaveText(EXITIQ_EXPECTED.fin)
    await expect(meter(page, "Transferability")).toHaveText(EXITIQ_EXPECTED.tra)
    await expect(meter(page, "Evidence quality")).toHaveText(EXITIQ_EXPECTED.evi)

    for (let i = 0; i < EXITIQ_EXPECTED.findings.length; i++) {
      const title = EXITIQ_EXPECTED.findings[i]!
      await expect(indexed(done, `0${i + 1}`)).toHaveText(title)
      await expect(done.getByText(EXITIQ_EXPECTED.findingBodies[i]!, { exact: true })).toBeVisible()
    }
    await expect(done.getByText("04", { exact: true })).toHaveCount(0)

    await expect(result.getByText("Your next 90 days")).toBeVisible()
    await expect(result).toContainText("Start with the actions tied to your highest-priority findings.")
    for (let i = 0; i < EXITIQ_EXPECTED.plan.length; i++) {
      const step = EXITIQ_EXPECTED.plan[i]!
      await expect(indexed(result, `0${i + 1}`)).toHaveText(step)
    }
    await expect(result.getByText("05", { exact: true })).toHaveCount(0)
    for (let i = 1; i <= 7; i++) {
      await expect(done.getByRole("button", { name: `Change answer ${i}` })).toHaveText(String(i))
    }
    console.assertClean()
  })

  test("the insight for the previous answer is shown on the next question", async ({ page }) => {
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    const question = page.getByTestId("exitiq-question")
    await expect(question.getByText("What this tells a buyer")).toBeHidden()
    await run.getByRole("button", { name: EXITIQ_ANSWERS.type, exact: true }).click()
    await expect(
      question.getByRole("heading", { name: "About how much revenue did the business generate last year?" })
    ).toBeVisible()
    await expect(question).toContainText("Question 2 of 7")
    await expect(question.getByText("What this tells a buyer")).toBeVisible()
    await expect(
      question.getByText(
        "Buyers will test whether client relationships belong to the firm or depend on you personally."
      )
    ).toBeVisible()
    await expect(run.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "1")
    await expect(page.getByTestId("exitiq-state")).not.toHaveText(EXITIQ_EMPTY_STATE)
    await expect(meter(page, "Transferability")).toHaveText("47")
  })

  test("Change my last answer steps back one question with the chosen chip still pressed and the insight cleared", async ({
    page,
  }) => {
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    const question = page.getByTestId("exitiq-question")
    await run.getByRole("button", { name: EXITIQ_ANSWERS.type, exact: true }).click()
    await expect(question).toContainText("Question 2 of 7")
    await question.getByRole("button", { name: "Change my last answer" }).click()
    await expect(question).toContainText("Question 1 of 7")
    await expect(question.getByRole("button", { name: EXITIQ_ANSWERS.type, exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    await expect(question.getByRole("button", { name: "Home or field services", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    await expect(question.getByText("What this tells a buyer")).toBeHidden()
    await expect(question.getByRole("button", { name: "Change my last answer" })).toBeHidden()
    await expect(question.getByRole("button", { name: "Start over" })).toBeVisible()
  })

  test("the result survives a reload of the page", async ({ page }) => {
    await page.goto("/score")
    await answerExitIq(page.getByTestId("exitiq-run"))
    await expect(page.getByTestId("exitiq-done")).toBeVisible()
    await page.reload()
    await expect(page.getByTestId("exitiq-done")).toBeVisible()
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EXPECTED.state)
    await expect(indexed(page.getByTestId("exitiq-done"), "01")).toHaveText(EXITIQ_EXPECTED.findings[0])
    await expect(page.getByTestId("exitiq-run").getByRole("progressbar", { name: "Your progress" })).toHaveAttribute(
      "aria-valuenow",
      "7"
    )
  })

  test("Change answer 5 reopens question 5 with the chosen chip pressed, and a new answer continues from question 6", async ({
    page,
  }) => {
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    const question = page.getByTestId("exitiq-question")
    await answerExitIq(run)
    await page.getByTestId("exitiq-done").getByRole("button", { name: "Change answer 5" }).click()

    await expect(question).toContainText("Question 5 of 7")
    await expect(
      question.getByRole("heading", {
        name: "If a buyer compared your books with your tax returns, how closely would they match?",
      })
    ).toBeVisible()
    await expect(question.getByRole("button", { name: EXITIQ_ANSWERS.books, exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    await expect(question.getByRole("button", { name: "They match", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    await expect(question.getByText("What this tells a buyer")).toBeHidden()
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EXPECTED.state)

    await question.getByRole("button", { name: "They match", exact: true }).click()
    await expect(question).toContainText("Question 6 of 7")
    await expect(question.getByRole("button", { name: EXITIQ_ANSWERS.conc, exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    await question.getByRole("button", { name: EXITIQ_ANSWERS.conc, exact: true }).click()
    await expect(question).toContainText("Question 7 of 7")
    await question.getByRole("button", { name: EXITIQ_ANSWERS.owner, exact: true }).click()

    const done = page.getByTestId("exitiq-done")
    await expect(done).toBeVisible()
    await expect(page.getByTestId("exitiq-state")).toHaveText("Market Ready")
    await expect(meter(page, "Financeability")).toHaveText("84")
    await expect(meter(page, "Transferability")).toHaveText("59")
    await expect(meter(page, "Evidence quality")).toHaveText("80")
    await expect(indexed(done, "01")).toHaveText("Client relationships may depend on you")
    await expect(indexed(done, "02")).toHaveText("Revenue has been flat")
    await expect(indexed(done, "03")).toHaveText("The answers are still unverified")
    const result = page.getByTestId("exitiq-result")
    await expect(indexed(result, "01")).toHaveText(
      "Stop running personal expenses through the business at the start of the next accounting period."
    )
    await expect(indexed(result, "03")).toHaveText("Prepare monthly profit and loss statements for the last 12 months.")
    await expect(result.getByText("04", { exact: true })).toHaveCount(0)
  })

  test("Start over clears every answer and returns to question 1", async ({ page }) => {
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    await answerExitIq(run)
    await page.getByTestId("exitiq-done").getByRole("button", { name: "Start over" }).click()

    const question = page.getByTestId("exitiq-question")
    await expect(question).toContainText("Question 1 of 7")
    await expect(question.getByRole("heading", { name: "What kind of business do you run?" })).toBeVisible()
    await expect(question.locator("[aria-pressed='true']")).toHaveCount(0)
    await expect(question.getByRole("button", { name: "Start over" })).toBeHidden()
    await expect(run.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "0")
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EMPTY_STATE)
    await expect(meter(page, "Financeability")).toHaveText("–")
    await expect(page.getByTestId("exitiq-result").getByText("Your next 90 days")).toBeHidden()

    await page.reload()
    await expect(page.getByTestId("exitiq-question")).toContainText("Question 1 of 7")
    await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EMPTY_STATE)
  })

  test("Save my plan downloads exitIQ-90-day-plan.txt with the recommendation, copies it, and confirms", async ({
    page,
  }) => {
    await page.goto("/score")
    await answerExitIq(page.getByTestId("exitiq-run"))
    const result = page.getByTestId("exitiq-result")

    const downloadPromise = page.waitForEvent("download")
    await result.getByRole("button", { name: "Save my plan" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("exitIQ-90-day-plan.txt")
    const content = readFileSync((await download.path())!, "utf8")
    expect(content).toContain("Recommendation: Prepare First")
    expect(content).toBe(EXITIQ_EXPECTED.planText)

    await expect(
      result.getByText("Your plan was downloaded as a text file and copied, ready to paste anywhere.")
    ).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EXITIQ_EXPECTED.planText)
  })

  test("Review my result with an advisor opens the booking page with the result in the notes and beacons the inquiry", async ({
    page,
    context,
  }) => {
    await context.route("https://heirloom.cal.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>Booking stub</title><p>stub</p>" })
    )
    await page.goto("/score")
    await answerExitIq(page.getByTestId("exitiq-run"))
    const done = page.getByTestId("exitiq-done")

    const popupPromise = context.waitForEvent("page")
    const inquiry = waitForInquiry(page)
    await done.getByRole("button", { name: "Review my result with an advisor →" }).click()

    const popup = await popupPromise
    await popup.waitForURL(/heirloom\.cal\.com/)
    const url = new URL(popup.url())
    expect(url.origin + url.pathname).toBe(CAL)
    expect(url.searchParams.get("notes")).toBe(EXITIQ_EXPECTED.reviewBody.slice(0, 700))

    expect((await inquiry).postDataJSON()).toEqual({
      kind: "exitiq_review",
      body: EXITIQ_EXPECTED.reviewBody,
      source: "score",
    })
    await expect(done.getByText(SENT_COPY)).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EXITIQ_EXPECTED.reviewBody)
    await popup.close()
  })

  test("the page-level review button works before any answers and sends a sheet of skipped answers", async ({
    page,
    context,
  }) => {
    await context.route("https://heirloom.cal.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>Booking stub</title>" })
    )
    await page.goto("/score")
    const expectedBody =
      `exitIQ result review\nRecommendation: ${EXITIQ_EMPTY_STATE}\nFinanceability: 0\nTransferability: 0\nEvidence quality: 0` +
      "\n\nTop findings:\n\n\nMy answers:\n" +
      QUESTIONS.map((q) => `- ${q.q} Skipped`).join("\n")

    const popupPromise = context.waitForEvent("page")
    const inquiry = waitForInquiry(page)
    await page.getByRole("main").getByRole("button", { name: "Review my result with an advisor", exact: true }).click()

    const popup = await popupPromise
    await popup.waitForURL(/heirloom\.cal\.com/)
    expect(new URL(popup.url()).searchParams.get("notes")).toBe(expectedBody.slice(0, 700))
    expect((await inquiry).postDataJSON()).toEqual({ kind: "exitiq_review", body: expectedBody, source: "score" })
    await expect(page.getByRole("main").getByText(SENT_COPY)).toBeVisible()
    await popup.close()
  })

  test("the page explains what the result is and links to fees, the process, and the offer review", async ({
    page,
  }) => {
    await page.goto("/score")
    const main = page.getByRole("main")
    await expect(main).toContainText("About 2 minutes. No name, email, phone number, or documents required.")
    await expect(main).toContainText(
      "exitIQ is an educational readiness screen based on answers you provide. It is not a valuation, appraisal, financing decision, or assurance that a business will sell."
    )
    await expect(main.getByRole("link", { name: "See fees →" })).toHaveAttribute("href", "/fees")
    await expect(main.getByRole("link", { name: "Ready to sell? See how Heirloom runs the process." })).toHaveAttribute(
      "href",
      "/how-it-works"
    )
    await expect(
      main.getByRole("link", { name: "Already have a buyer? Have the offer reviewed first." })
    ).toHaveAttribute("href", "/offer-review")
    await expect(main.getByRole("link", { name: /See how Heirloom runs a sale/ })).toHaveAttribute(
      "href",
      "/how-it-works"
    )
  })
})
