import { expect, type Locator, test } from "@playwright/test"
import { answerExitIq, briefingRow, openAdvisorFromHeader, waitForInquiry, watchConsole } from "./helpers"
import { CONTACT } from "../lib/site/routes"

test.use({ permissions: ["clipboard-read", "clipboard-write"] })

const CAL = CONTACT.advisorCalendar
const DIALOG_NAME = "Talk to an M&A advisor"

const STEPS = [
  {
    q: "Where should the conversation start?",
    chip: "Selling the business",
    ack: "The call covers your likely buyer market and what preparation would happen before any outreach.",
    row: "Conversation",
  },
  {
    q: "What kind of business is it?",
    chip: "Home or field services",
    ack: "We will prepare the buyer categories that usually pursue field-service companies.",
    row: "Business",
  },
  {
    q: "About how much revenue last year?",
    chip: "$1M to $2M",
    ack: "This range draws individual and SBA-financed buyers.",
    row: "Revenue",
  },
  {
    q: "When would you want a sale to close?",
    chip: "In 1 to 2 years",
    ack: "There is time to fix what buyers would flag before they see the business.",
    row: "Target timing",
  },
  {
    q: "What matters most in the outcome?",
    chip: "Cash at closing",
    ack: "We will separate headline price from cash at closing on the call.",
    row: "Matters most",
  },
]

const FULL_BRIEFING =
  "Advisor call briefing\nConversation: Selling the business\nBusiness: Home or field services\nRevenue: $1M to $2M" +
  "\nTarget timing: In 1 to 2 years\nMatters most: Cash at closing\nNote for the advisor: Buyer X is off limits."

const EMPTY_BRIEFING =
  "Advisor call briefing\nConversation: Not answered\nBusiness: Not answered\nRevenue: Not answered" +
  "\nTarget timing: Not answered\nMatters most: Not answered"

const agendaItem = (dialog: Locator, index: string) =>
  dialog.getByText(index, { exact: true }).locator("xpath=following-sibling::span")

const progress = (dialog: Locator) => dialog.getByRole("progressbar", { name: "Briefing progress" })

test.describe("advisor dialog", () => {
  test("five answers build the briefing row by row, the note attaches, and the booking link carries the whole briefing", async ({
    page,
  }) => {
    const console = watchConsole(page)
    await page.goto("/who-we-are")
    const dialog = await openAdvisorFromHeader(page)
    await expect(page.getByRole("dialog", { name: DIALOG_NAME })).toBeVisible()

    await expect(dialog.getByText("QUESTION 1 OF 5", { exact: true })).toBeVisible()
    await expect(dialog.getByText("Before you book · question 1 of 5")).toBeVisible()
    await expect(dialog.getByText("This only sets the agenda.")).toBeVisible()
    await expect(dialog.getByText("To be discussed", { exact: true })).toHaveCount(6)
    await expect(progress(dialog)).toHaveAttribute("aria-valuemax", "5")
    await expect(progress(dialog)).toHaveAttribute("aria-valuenow", "0")
    await expect(dialog.getByRole("button", { name: "Change my last answer" })).toBeHidden()
    await expect(dialog.getByRole("button", { name: "Skip the questions, just book" })).toBeVisible()
    await expect(agendaItem(dialog, "01")).toHaveText("The likely buyer market for your business")
    await expect(agendaItem(dialog, "03")).toHaveText("How valuation is built and defended")

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i]!
      await expect(dialog.getByRole("heading", { name: step.q })).toBeVisible()
      await expect(dialog.getByText(`QUESTION ${i + 1} OF 5`, { exact: true })).toBeVisible()
      await expect(briefingRow(dialog, step.row)).toHaveText("To be discussed")
      await dialog.getByRole("button", { name: step.chip, exact: true }).click()
      await expect(briefingRow(dialog, step.row)).toHaveText(step.chip)
      await expect(progress(dialog)).toHaveAttribute("aria-valuenow", String(i + 1))
      if (i < STEPS.length - 1) {
        // The acknowledgement stays on screen while the next question is asked.
        await expect(dialog.getByRole("heading", { name: STEPS[i + 1]!.q })).toBeVisible()
        await expect(dialog.getByText("On the call")).toBeVisible()
        await expect(dialog.getByText(step.ack)).toBeVisible()
      }
    }

    await expect(agendaItem(dialog, "03")).toHaveText("Cash at closing versus money paid later")
    await expect(dialog.getByText("OPTIONAL NOTE", { exact: true })).toBeVisible()
    await expect(dialog.getByText("Last one · optional")).toBeVisible()
    await expect(
      dialog.getByRole("heading", { name: "Anything the advisor should read before the call?" })
    ).toBeVisible()
    await expect(dialog.getByText("On the call")).toBeHidden()
    await expect(briefingRow(dialog, "Advisor note")).toHaveText("To be discussed")
    await dialog.getByLabel("Note for the advisor").fill("Buyer X is off limits.")
    await expect(briefingRow(dialog, "Advisor note")).toHaveText("Attached")

    const inquiry = waitForInquiry(page)
    await dialog.getByRole("button", { name: "Finish" }).click()
    expect((await inquiry).postDataJSON()).toEqual({ kind: "advisor_briefing", body: FULL_BRIEFING, source: "advisor" })
    await expect(dialog.getByText("BRIEFING READY", { exact: true })).toBeVisible()
    await expect(dialog.getByRole("heading", { name: "Your advisor reads this before the call." })).toBeVisible()
    const book = dialog.getByRole("link", { name: "Book the call" })
    await expect(book).toHaveAttribute("href", `${CAL}?notes=${encodeURIComponent(FULL_BRIEFING)}`)
    await expect(book).toHaveAttribute("target", "_blank")
    await expect(book).toHaveAttribute("rel", "noopener")
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(FULL_BRIEFING)
    await expect(dialog.getByRole("button", { name: "Change my last answer" })).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Skip the questions, just book" })).toBeHidden()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    console.assertClean()
  })

  test("Skip the questions, just book after one answer marks the rest as not answered", async ({ page }) => {
    await page.goto("/fees")
    const dialog = await openAdvisorFromHeader(page)
    await dialog.getByRole("button", { name: "Confidentiality concerns", exact: true }).click()
    await expect(
      dialog.getByText("The call itself is confidential. No one is contacted afterward without your approval.")
    ).toBeVisible()
    await expect(dialog.getByRole("heading", { name: "What kind of business is it?" })).toBeVisible()
    await dialog.getByRole("button", { name: "Skip the questions, just book" }).click()
    await expect(dialog.getByText("BRIEFING READY", { exact: true })).toBeVisible()
    const expected =
      "Advisor call briefing\nConversation: Confidentiality concerns\nBusiness: Not answered\nRevenue: Not answered" +
      "\nTarget timing: Not answered\nMatters most: Not answered"
    await expect(dialog.getByRole("link", { name: "Book the call" })).toHaveAttribute(
      "href",
      `${CAL}?notes=${encodeURIComponent(expected)}`
    )
    await expect(agendaItem(dialog, "01")).toHaveText("Who would learn about a sale, and when")
    await expect(agendaItem(dialog, "02")).toHaveText("Your exclusions and information limits")
    await expect(agendaItem(dialog, "03")).toHaveText("How outreach works without naming the business")
    await expect(briefingRow(dialog, "Business")).toHaveText("To be discussed")
    await dialog.getByRole("button", { name: "Close" }).click()
    await expect(dialog).toBeHidden()
  })

  test("Send by email copies the briefing with a call request and confirms the handoff", async ({ page }) => {
    await page.goto("/fees")
    const dialog = await openAdvisorFromHeader(page)
    await dialog.getByRole("button", { name: "Skip the questions, just book" }).click()
    await expect(dialog.getByText("BRIEFING READY", { exact: true })).toBeVisible()
    await dialog.getByRole("button", { name: "Send the briefing by email instead" }).click()
    await expect(
      dialog.getByText(
        "Your email app opened with the briefing. If it did not, the text is copied. Paste it into a message to suyash@heirloomadvisory.ai."
      )
    ).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `${EMPTY_BRIEFING}\n\nPlease reply with times for a call.`
    )
  })

  test("Start over clears the briefing but keeps the dialog open", async ({ page }) => {
    await page.goto("/confidentiality")
    const dialog = await openAdvisorFromHeader(page)
    await dialog.getByRole("button", { name: "Value and timing", exact: true }).click()
    await expect(dialog.getByRole("heading", { name: "What kind of business is it?" })).toBeVisible()
    await dialog.getByRole("button", { name: "Skip the questions, just book" }).click()
    await expect(dialog.getByText("BRIEFING READY", { exact: true })).toBeVisible()
    await expect(briefingRow(dialog, "Conversation")).toHaveText("Value and timing")

    await dialog.getByRole("button", { name: "Start over" }).click()
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText("QUESTION 1 OF 5", { exact: true })).toBeVisible()
    await expect(dialog.getByRole("heading", { name: "Where should the conversation start?" })).toBeVisible()
    await expect(dialog.getByText("To be discussed", { exact: true })).toHaveCount(6)
    await expect(progress(dialog)).toHaveAttribute("aria-valuenow", "0")
    await expect(dialog.locator("[aria-pressed='true']")).toHaveCount(0)
    await expect(dialog.getByRole("button", { name: "Change my last answer" })).toBeHidden()
  })

  test("the briefing continues on another page in the same tab and does not leak into a fresh browser context", async ({
    page,
    browser,
  }) => {
    await page.goto("/why")
    const dialog = await openAdvisorFromHeader(page)
    await dialog.getByRole("button", { name: "Selling the business", exact: true }).click()
    await expect(dialog.getByRole("heading", { name: "What kind of business is it?" })).toBeVisible()
    await dialog.getByRole("button", { name: "Manufacturing or distribution", exact: true }).click()
    await expect(dialog.getByRole("heading", { name: "About how much revenue last year?" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    await page.goto("/fees")
    const again = await openAdvisorFromHeader(page)
    await expect(again.getByText("QUESTION 3 OF 5", { exact: true })).toBeVisible()
    await expect(again.getByRole("heading", { name: "About how much revenue last year?" })).toBeVisible()
    await expect(briefingRow(again, "Conversation")).toHaveText("Selling the business")
    await expect(briefingRow(again, "Business")).toHaveText("Manufacturing or distribution")
    await expect(again.getByText("Inventory and working capital will come up.")).toBeVisible()

    const fresh = await browser.newContext()
    try {
      const other = await fresh.newPage()
      await other.goto("/fees")
      const freshDialog = await openAdvisorFromHeader(other)
      await expect(freshDialog.getByText("QUESTION 1 OF 5", { exact: true })).toBeVisible()
      await expect(freshDialog.getByText("To be discussed", { exact: true })).toHaveCount(6)
    } finally {
      await fresh.close()
    }
  })

  test("opening from /score after a completed run prefills the topic, business, and revenue and asks only what is left", async ({
    page,
  }) => {
    await page.goto("/score")
    await answerExitIq(page.getByTestId("exitiq-run"))
    await expect(page.getByTestId("exitiq-done")).toBeVisible()

    const dialog = await openAdvisorFromHeader(page)
    await expect(dialog.getByText("Your earlier answers carried over. 2 questions left before booking.")).toBeVisible()
    await expect(dialog.getByText("QUESTION 1 OF 2", { exact: true })).toBeVisible()
    await expect(dialog.getByRole("heading", { name: "When would you want a sale to close?" })).toBeVisible()
    await expect(briefingRow(dialog, "Conversation")).toHaveText("Value and timing")
    await expect(briefingRow(dialog, "Business")).toHaveText("Business or professional services")
    await expect(briefingRow(dialog, "Revenue")).toHaveText("$2M to $3M")
    await expect(briefingRow(dialog, "Target timing")).toHaveText("To be discussed")
    await expect(progress(dialog)).toHaveAttribute("aria-valuenow", "3")
    await expect(dialog.getByRole("button", { name: "Change my last answer" })).toBeHidden()
    await expect(agendaItem(dialog, "01")).toHaveText("How buyers and lenders would view the business today")

    await dialog.getByRole("button", { name: "Within a year", exact: true }).click()
    await expect(dialog.getByText("QUESTION 2 OF 2", { exact: true })).toBeVisible()
    await dialog.getByRole("button", { name: "Certainty it closes", exact: true }).click()
    await expect(dialog.getByText("OPTIONAL NOTE", { exact: true })).toBeVisible()
    await dialog.getByRole("button", { name: "Nothing to add" }).click()
    const expected =
      "Advisor call briefing\nConversation: Value and timing\nBusiness: Business or professional services\nRevenue: $2M to $3M" +
      "\nTarget timing: Within a year\nMatters most: Certainty it closes"
    await expect(dialog.getByRole("link", { name: "Book the call" })).toHaveAttribute(
      "href",
      `${CAL}?notes=${encodeURIComponent(expected)}`
    )
  })

  test("choosing the offer path in the hero prefills the conversation topic", async ({ page }) => {
    await page.goto("/")
    await page.getByTestId("hero-option-offer").click()
    await expect(page.getByTestId("hero-offer")).toBeVisible()
    const dialog = await openAdvisorFromHeader(page)
    await expect(dialog.getByText("Your earlier answers carried over. 4 questions left before booking.")).toBeVisible()
    await expect(dialog.getByText("QUESTION 1 OF 4", { exact: true })).toBeVisible()
    await expect(dialog.getByRole("heading", { name: "What kind of business is it?" })).toBeVisible()
    await expect(briefingRow(dialog, "Conversation")).toHaveText("An offer or buyer I already have")
    await expect(agendaItem(dialog, "01")).toHaveText("A first read of the offer in front of you")
  })

  test("the dialog closes with Escape, the close button, and the overlay", async ({ page }) => {
    await page.goto("/questions")
    const dialog = await openAdvisorFromHeader(page)
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    await openAdvisorFromHeader(page)
    await dialog.getByRole("button", { name: "Close" }).click()
    await expect(dialog).toBeHidden()

    await openAdvisorFromHeader(page)
    // Radix arms its "pointer down outside" listener in a timer after the dialog mounts, so the first click on
    // the overlay can land before it is listening. Clicking until the dialog is gone waits on the state, not on
    // a timer turn; a dialog that ignored its overlay would keep it visible until the poll gave up.
    await expect
      .poll(
        async () => {
          await page.mouse.click(8, 400)
          return dialog.isHidden()
        },
        { message: "a click on the overlay closes the dialog" }
      )
      .toBe(true)
  })
})
