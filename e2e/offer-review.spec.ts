import { expect, test } from "@playwright/test"
import { waitForInquiry, watchConsole } from "./helpers"

const OFFER_ASK =
  "Please explain what I would receive, what is missing, and which terms deserve attention before I respond."
const SIGN_OFF = "\n\nSent from the Heirloom Offer Review page."
const FORWARD_BODY =
  "I received an offer or indication of interest for my business. The original message or document is attached.\n\n" +
  OFFER_ASK +
  SIGN_OFF
const FORWARD_MAILTO = `mailto:offers@heirloom.com?subject=Free%20Offer%20Review&body=${encodeURIComponent(FORWARD_BODY)}`

const VERBAL = {
  "Price or range discussed": "$4.5M",
  "How much would be paid at closing?": "$3.4M at closing",
  "Would any amount be paid later?": "$1.1M seller note",
  "Does the buyer already have financing?": "SBA loan, not yet approved",
  "What does the buyer want you to sign or do next?": "Sign a 90-day exclusivity letter",
  "Anything else that concerns you?": "They want me to stay two years",
  "Email for your review": "owner@example.com",
}

const VERBAL_BODY =
  "I received a verbal offer with these terms:\nHeadline price: $4.5M" +
  "\nCash at close and later payments: $3.4M at closing · Paid later: $1.1M seller note" +
  "\nFinancing status: SBA loan, not yet approved" +
  "\nWhat the buyer requested next: Sign a 90-day exclusivity letter" +
  "\nOther concerns: They want me to stay two years" +
  `\n\n${OFFER_ASK}\n\nEmail for your review: owner@example.com${SIGN_OFF}`

test.describe("/offer-review intake", () => {
  test("opens on the forward tab with three ways to share an offer and a prefilled email link", async ({ page }) => {
    const console = watchConsole(page)
    await page.goto("/offer-review")
    const intake = page.getByTestId("offer-intake")
    const tabs = intake.getByRole("group", { name: "Choose how to share your offer" }).getByRole("button")
    await expect(tabs).toHaveText(["Upload or forward it", "Paste the terms", "Tell us what was said"])
    await expect(page.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByTestId("oi-tab-paste")).toHaveAttribute("aria-pressed", "false")
    await expect(page.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "false")

    await expect(intake.getByLabel("Upload the offer, buyer email, or letter of intent")).toBeAttached()
    await expect(intake.getByText("No file chosen yet.")).toBeVisible()
    await expect(intake.getByText("PDF, Word document, image, or email export")).toBeVisible()
    await expect(intake.getByRole("link", { name: "offers@heirloom.com" })).toHaveAttribute(
      "href",
      "mailto:offers@heirloom.com"
    )
    const attach = intake.getByRole("link", { name: "Open an email to attach the offer" })
    await expect(attach).toHaveAttribute("href", FORWARD_MAILTO)
    expect((await attach.getAttribute("href"))!.startsWith("mailto:offers@heirloom.com")).toBe(true)
    await expect(intake.getByTestId("oi-send")).toBeHidden()
    await expect(intake).toContainText("Confidential. No commitment. We do not contact the buyer during the review.")
    console.assertClean()
  })

  test("choosing a file through the button names it next to the attach instruction", async ({ page }) => {
    await page.goto("/offer-review")
    const intake = page.getByTestId("offer-intake")
    const chooser = page.waitForEvent("filechooser")
    await intake.getByRole("button", { name: "Choose a file" }).click()
    await (
      await chooser
    ).setFiles({ name: "offer.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 stub") })
    await expect(intake.getByText("Selected: offer.pdf · attach it to the email that opens.")).toBeVisible()
    await expect(intake.getByText("No file chosen yet.")).toBeHidden()
    await expect(intake.getByRole("link", { name: "Open an email to attach the offer" })).toHaveAttribute(
      "href",
      FORWARD_MAILTO
    )
  })

  test("setting the hidden file input directly also names the file", async ({ page }) => {
    await page.goto("/offer-review")
    await page
      .locator("#oi-file")
      .setInputFiles({ name: "offer.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 stub") })
    await expect(page.getByTestId("offer-intake").getByText("Selected: offer.pdf", { exact: false })).toBeVisible()
  })

  test("verbal mode sends all seven fields in the inquiry body and shows the sent confirmation", async ({ page }) => {
    await page.goto("/offer-review")
    const intake = page.getByTestId("offer-intake")
    await page.getByTestId("oi-tab-verbal").click()
    await expect(page.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "true")
    for (const [label, value] of Object.entries(VERBAL)) {
      await intake.getByLabel(label).fill(value)
    }
    await expect(intake.getByLabel("Email for your review")).toHaveAttribute("type", "email")

    const send = intake.getByTestId("oi-send")
    const inquiry = waitForInquiry(page)
    await send.click()
    await expect(send).toBeDisabled()
    await expect(intake.getByText("Preparing your message...")).toBeVisible()

    const payload = (await inquiry).postDataJSON()
    expect(payload).toEqual({
      kind: "offer_review",
      body: VERBAL_BODY,
      email: "owner@example.com",
      source: "offer-review",
    })
    expect(payload.body).toContain("Headline price:")
    expect(payload.body).toContain("Email for your review:")

    const sent = intake.getByTestId("oi-sent")
    await expect(sent).toBeVisible()
    await expect(sent).toContainText("Your offer has been sent for review. We will reply to the email you provided.")
    await expect(sent).toContainText(
      "If your email app did not open, the summary has been copied. Paste it into a message to offers@heirloom.com."
    )
    await expect(send).toBeEnabled()
    await expect(intake.getByText("Preparing your message...")).toBeHidden()
  })

  test("verbal mode leaves out the optional later-payment and concern lines when they are blank", async ({ page }) => {
    await page.goto("/offer-review?mode=verbal")
    const intake = page.getByTestId("offer-intake")
    await intake.getByLabel("Price or range discussed").fill("$2M")
    await intake.getByLabel("How much would be paid at closing?").fill("All of it")
    await intake.getByLabel("Does the buyer already have financing?").fill("Cash")
    await intake.getByLabel("What does the buyer want you to sign or do next?").fill("A letter of intent")
    const inquiry = waitForInquiry(page)
    await intake.getByTestId("oi-send").click()
    expect((await inquiry).postDataJSON()).toEqual({
      kind: "offer_review",
      body:
        "I received a verbal offer with these terms:\nHeadline price: $2M\nCash at close and later payments: All of it" +
        `\nFinancing status: Cash\nWhat the buyer requested next: A letter of intent\n\n${OFFER_ASK}${SIGN_OFF}`,
      email: "",
      source: "offer-review",
    })
    await expect(intake.getByTestId("oi-sent")).toBeVisible()
  })

  test("?mode=verbal opens the verbal tab and an unknown mode falls back to forward", async ({ page }) => {
    await page.goto("/offer-review?mode=verbal")
    await expect(page.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "false")
    await expect(page.getByLabel("Price or range discussed")).toBeVisible()
    await expect(page.getByLabel("Paste the offer or buyer email")).toBeHidden()

    await page.goto("/offer-review?mode=bogus")
    await expect(page.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByText("No file chosen yet.")).toBeVisible()
  })

  test("switching tabs after sending clears the confirmation and keeps the typed terms", async ({ page }) => {
    await page.goto("/offer-review?mode=paste")
    const intake = page.getByTestId("offer-intake")
    const terms = "We propose an enterprise value of $4,650,000."
    await intake.getByLabel("Paste the offer or buyer email").fill(terms)
    const inquiry = waitForInquiry(page)
    await intake.getByTestId("oi-send").click()
    await inquiry
    await expect(intake.getByTestId("oi-sent")).toBeVisible()

    await page.getByTestId("oi-tab-verbal").click()
    await expect(intake.getByTestId("oi-sent")).toBeHidden()
    await expect(page.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "true")

    await page.getByTestId("oi-tab-paste").click()
    await expect(intake.getByTestId("oi-sent")).toBeHidden()
    await expect(intake.getByLabel("Paste the offer or buyer email")).toHaveValue(terms)
  })

  test("the worked example is labelled fictional and separates the headline from the terms", async ({ page }) => {
    await page.goto("/offer-review")
    const main = page.getByRole("main")
    await expect(main.getByText("Worked example", { exact: true })).toBeVisible()
    await expect(main.getByRole("heading", { name: "The number is only the first line." })).toBeVisible()
    await expect(
      main.getByText(
        "This fictional offer shows the phrases that determine what the seller receives, how long the buyer controls the process, and what can still change."
      )
    ).toBeVisible()
    await expect(main.getByText("Letter of intent · Project Ridgeline")).toBeVisible()
    await expect(main.getByText("Headline price", { exact: true }).locator("xpath=following-sibling::span")).toHaveText(
      "$4.65M"
    )
    await expect(
      main.getByText("Cash at closing", { exact: true }).locator("xpath=following-sibling::span")
    ).toHaveText("$3.45M, or 74% of the headline price")
    await expect(main.getByText("Exclusivity", { exact: true }).locator("xpath=following-sibling::span")).toHaveText(
      "90 days during which the seller cannot negotiate elsewhere"
    )
    await expect(main).toContainText("Existing-buyer engagement")
    await expect(main.getByText("2.5% success fee")).toBeVisible()
    await expect(main.getByRole("link", { name: "Forward it to offers@heirloom.com" })).toHaveAttribute(
      "href",
      "mailto:offers@heirloom.com"
    )
  })
})
