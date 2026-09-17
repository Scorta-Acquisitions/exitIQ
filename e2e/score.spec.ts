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
import { CONTACT } from "../lib/site/routes"

test.use({ permissions: ["clipboard-read", "clipboard-write"] })

const CAL = CONTACT.advisorCalendar
const SENT_COPY =
  "The booking page opened in a new tab with your result attached. If it is missing, paste the copied text into the notes."

const meter = (page: Page, label: string) =>
  page.getByTestId("exitiq-result").getByText(label, { exact: true }).locator("xpath=following-sibling::span")

/** The filled bar under a meter's label row. */
const meterFill = (page: Page, label: string) =>
  page.getByTestId("exitiq-result").getByText(label, { exact: true }).locator("xpath=../following-sibling::div[1]/div")

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
    await expect(question).toContainText("Estimates are fine. You can change any answer before finishing.")
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
    await expect(done.getByRole("heading", { name: "What a buyer would question first" })).toBeVisible()
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
    await expect(result).toContainText("Records can change the result in either direction.")
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

    // What the changed answer scores is pinned in exitiq-scoring.test.ts (84 / 59 / 80, Market Ready);
    // here the served run only has to come back to a result at all.
    await expect(page.getByTestId("exitiq-done")).toBeVisible()
    await expect(page.getByTestId("exitiq-state")).toHaveText("Market Ready")
  })

  test("Start over clears the run out of the session, so a reload opens on question 1", async ({ page }) => {
    // The reset itself is ExitIqRun.test.tsx l.658; what only a browser proves is that the stored run went
    // with it, which the reload reads back.
    await page.goto("/score")
    await answerExitIq(page.getByTestId("exitiq-run"))
    await page.getByTestId("exitiq-done").getByRole("button", { name: "Start over" }).click()
    await expect(page.getByTestId("exitiq-question")).toContainText("Question 1 of 7")

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
    expect(content).toBe(EXITIQ_EXPECTED.planText)

    await expect(result.getByText("Your plan was downloaded and copied.")).toBeVisible()
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
    await done.getByRole("button", { name: "Review my result with an advisor" }).click()

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

  test("the card is the dark instrument: a mono caps header, the field canvas sized by WebGL, and a meter whose bar matches its score", async ({
    page,
  }) => {
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    const label = run.getByText("exitIQ by Heirloom", { exact: true })
    // The legacy console's own type, as the browser computes it from the restored token block.
    await expect(label).toHaveCSS("text-transform", "uppercase")
    await expect(label).toHaveCSS("font-family", /^"IBM Plex Mono"/)
    // No live dot: the wordmark is the header's first child, nothing precedes it, and the ticks follow it.
    await expect(label.locator("xpath=preceding-sibling::*")).toHaveCount(0)
    await expect(label.locator("xpath=..").locator(":scope > *")).toHaveCount(2)
    await expect(label.locator("xpath=following-sibling::*[1]")).toHaveRole("progressbar")

    // The field sizes its drawing buffer to the card only once a WebGL context came up; an unsized canvas is 300×150.
    const canvas = run.locator("canvas")
    await expect(canvas).toHaveCount(1)
    await expect(canvas).toHaveAttribute("aria-hidden", "true")
    const runBox = (await run.boundingBox())!
    await expect
      .poll(() => canvas.evaluate((c) => (c as HTMLCanvasElement).width), { message: "field buffer width" })
      .toBe(Math.round(runBox.width - 2))
    await expect(run.locator(":scope > *").first()).toHaveAttribute("aria-hidden", "true")

    const result = page.getByTestId("exitiq-result")
    for (const caption of ["Scores", "Recommendation"]) {
      await expect(result.getByText(caption, { exact: true })).toHaveCSS("text-transform", "uppercase")
    }
    for (const m of ["Financeability", "Transferability", "Evidence quality"]) {
      await expect(meter(page, m)).toHaveText("–")
      await expect(meterFill(page, m)).toHaveAttribute("style", /width:\s*0%/)
    }

    // One answer in: the insight for it is read out, and every meter's bar is drawn to the number beside it.
    await run.getByRole("button", { name: EXITIQ_ANSWERS.type, exact: true }).click()
    await expect(page.getByTestId("exitiq-question")).toContainText("Question 2 of 7")
    await expect(
      page
        .getByTestId("exitiq-question")
        .getByText("Buyers will test whether client relationships belong to the firm or depend on you personally.")
    ).toBeVisible()
    for (const m of ["Financeability", "Transferability", "Evidence quality"]) {
      const value = await meter(page, m).textContent()
      expect(value, `${m} reads a score`).toMatch(/^\d{1,3}$/)
      await expect(meterFill(page, m)).toHaveAttribute("style", new RegExp(`width:\\s*${value}%`))
    }
    await expect(meter(page, "Transferability")).toHaveText("47")
  })

  test("under reduced motion the field still draws its one frame", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/score")
    const run = page.getByTestId("exitiq-run")
    await expect(run.getByText("exitIQ by Heirloom", { exact: true })).toBeVisible()
    const runBox = (await run.boundingBox())!
    await expect
      .poll(() => run.locator("canvas").evaluate((c) => (c as HTMLCanvasElement).width), { message: "field drew" })
      .toBe(Math.round(runBox.width - 2))
    // The run itself is untouched by the preference.
    await run.getByRole("button", { name: EXITIQ_ANSWERS.type, exact: true }).click()
    await expect(page.getByTestId("exitiq-question")).toContainText("Question 2 of 7")
    await expect(meter(page, "Transferability")).toHaveText("47")
  })
})
