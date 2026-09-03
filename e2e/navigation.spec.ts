import { expect, type Page, test } from "@playwright/test"
import {
  advisorDialog,
  answerExitIq,
  EXITIQ_EXPECTED,
  expectAnchorTarget,
  expectPath,
  H1_BY_PATH,
  h1For,
} from "./helpers"
import { QUESTION_CATEGORY_LINKS } from "../lib/site/questions/data"
import { ALL_ROUTES, FOOTER_GROUPS, NAV_GROUPS } from "../lib/site/routes"

const h1 = (page: Page) => page.getByRole("heading", { level: 1 })

test.describe("header navigation", () => {
  for (const group of NAV_GROUPS) {
    for (const link of group.links) {
      test(`"${group.label}" › "${link.label}" navigates to ${link.href}`, async ({ page }) => {
        await page.goto("/")
        const nav = page.getByRole("navigation", { name: "Primary navigation" })
        const groupButton = nav.getByRole("button", { name: group.label, exact: true })
        await expect(groupButton).toHaveAttribute("aria-haspopup", "true")
        const menuLink = nav.getByRole("link").filter({ has: page.getByText(link.label, { exact: true }) })
        await expect(menuLink).toBeHidden()

        await groupButton.hover()
        await expect(menuLink).toBeVisible()
        await expect(menuLink).toHaveAttribute("href", link.href)
        await expect(menuLink).toContainText(link.note)
        await menuLink.click()

        await expectPath(page, link.href)
        await expect(h1(page)).toHaveText(h1For(link.href))
      })
    }
  }

  test("the For buyers link opens the Buyer Passport page", async ({ page }) => {
    await page.goto("/")
    const link = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "For buyers" })
    await expect(link).toHaveAttribute("href", "/buyers")
    await link.click()
    await expectPath(page, "/buyers")
    await expect(h1(page)).toHaveText(H1_BY_PATH["/buyers"])
  })

  test("focusing a group button with the keyboard reveals its menu and Tab moves into it", async ({ page }) => {
    await page.goto("/")
    const nav = page.getByRole("navigation", { name: "Primary navigation" })
    const howItWorks = nav.getByRole("link").filter({ has: page.getByText("How it works", { exact: true }) })
    await expect(howItWorks).toBeHidden()
    await nav.getByRole("button", { name: "The process", exact: true }).focus()
    await expect(howItWorks).toBeVisible()
    await page.keyboard.press("Tab")
    await expect(howItWorks).toBeFocused()
    await page.keyboard.press("Enter")
    await expectPath(page, "/how-it-works")
    await expect(h1(page)).toHaveText(H1_BY_PATH["/how-it-works"])
  })

  test("the wordmark returns home from every page", async ({ page }) => {
    for (const path of ALL_ROUTES) {
      await page.goto(path)
      await expect(h1(page)).toHaveText(H1_BY_PATH[path])
      const wordmark = page.getByRole("banner").getByRole("link", { name: "Heirloom home" })
      await expect(wordmark).toHaveAttribute("href", "/")
      await expect(wordmark).toHaveText("Heirloom")
      await wordmark.click()
      await expectPath(page, "/")
      await expect(h1(page)).toHaveText(H1_BY_PATH["/"])
    }
  })
})

test.describe("footer navigation", () => {
  for (const group of FOOTER_GROUPS) {
    for (const link of group.links) {
      test(`"${group.label}" › "${link.label}" navigates to ${link.href}`, async ({ page }) => {
        await page.goto("/")
        const footerLink = page
          .getByRole("navigation", { name: "Footer" })
          .getByRole("link", { name: link.label, exact: true })
        await expect(footerLink).toHaveAttribute("href", link.href)
        await footerLink.click()
        if (link.href.includes("#")) {
          await expectAnchorTarget(page, link.href)
        } else {
          await expectPath(page, link.href)
        }
        await expect(h1(page)).toHaveText(h1For(link.href))
      })
    }
  }

  test("the footer advisor button opens the dialog", async ({ page }) => {
    await page.goto("/why")
    await page.getByRole("contentinfo").getByTestId("open-advisor").click()
    await expect(advisorDialog(page)).toBeVisible()
    await expect(advisorDialog(page).getByText("QUESTION 1 OF 5", { exact: true })).toBeVisible()
  })
})

test.describe("home shortcuts", () => {
  const TERMS = [
    { label: "Representation", text: "We work for the seller.", href: "/who-we-are" },
    { label: "Confidentiality", text: "Your company is never publicly listed.", href: "/confidentiality" },
    {
      label: "Company fit",
      text: "Established businesses, usually with $1M or more in annual revenue.",
      href: "/questions",
    },
    { label: "Experience", text: "Millions in enterprise value transacted through Heirloom.", href: "/who-we-are" },
    { label: "Economics", text: "Roughly half many traditional broker and M&A fees.", href: "/fees" },
  ]

  for (const term of TERMS) {
    test(`the "${term.label}" term links to ${term.href}`, async ({ page }) => {
      await page.goto("/")
      const link = page
        .getByRole("main")
        .getByRole("link")
        .filter({ has: page.getByText(term.label, { exact: true }) })
        .filter({ hasText: term.text })
      await expect(link).toHaveAttribute("href", term.href)
      await link.click()
      await expectPath(page, term.href)
      await expect(h1(page)).toHaveText(h1For(term.href))
    })
  }

  const CARDS = [
    { title: "Review my offer", href: "/offer-review", eyebrow: "Offer in hand" },
    { title: "Start exitIQ", href: "/score", eyebrow: "Still deciding" },
    { title: "See how it works", href: "/how-it-works", eyebrow: "Want the details" },
  ]

  for (const card of CARDS) {
    test(`the closing "${card.title}" card links to ${card.href}`, async ({ page }) => {
      await page.goto("/")
      const section = page.locator("section").filter({ hasText: "No public listing. No obligation to sell." })
      await expect(section.getByRole("heading", { name: "Start where you are." })).toBeVisible()
      const link = section.getByRole("link").filter({ has: page.getByText(card.title, { exact: true }) })
      await expect(link).toContainText(card.eyebrow)
      await expect(link).toHaveAttribute("href", card.href)
      await link.click()
      await expectPath(page, card.href)
      await expect(h1(page)).toHaveText(h1For(card.href))
    })
  }

  test("the closing advisor card opens the dialog", async ({ page }) => {
    await page.goto("/")
    const section = page.locator("section").filter({ hasText: "No public listing. No obligation to sell." })
    const card = section.getByTestId("open-advisor")
    await expect(card).toContainText("Ready to sell")
    await expect(card).toContainText("Find out whether Heirloom is the right firm for your business.")
    await card.click()
    await expect(advisorDialog(page)).toBeVisible()
  })
})

test.describe("in-page anchors", () => {
  for (const link of [...QUESTION_CATEGORY_LINKS, { href: "#q-ask", label: "Ask a question" }]) {
    test(`questions: "${link.label}" scrolls ${link.href} into view`, async ({ page }) => {
      await page.goto("/questions")
      const nav = page.getByRole("navigation", { name: "Question categories" })
      await nav.getByRole("link", { name: link.label, exact: true }).click()
      await expectAnchorTarget(page, `/questions${link.href}`)
    })
  }

  test("questions: every category anchor is a heading with the category name", async ({ page }) => {
    await page.goto("/questions")
    for (const link of QUESTION_CATEGORY_LINKS) {
      await expect(page.locator(link.href)).toHaveText(link.label)
      await expect(page.locator(link.href)).toHaveRole("heading")
    }
  })

  test("fees: Calculate my fee and Compare the fees jump to the calculator", async ({ page }) => {
    await page.goto("/fees")
    const main = page.getByRole("main")
    await main.getByRole("link", { name: "Calculate my fee" }).click()
    await expectAnchorTarget(page, "/fees#fees-calc")
    await expect(page.locator("#fees-calc")).toHaveText("What would Heirloom cost on your sale?")

    await page.goto("/fees")
    await main.getByRole("link", { name: "Compare the fees on my sale →" }).click()
    await expectAnchorTarget(page, "/fees#fees-calc")
  })

  test("buyers: all four calls to action jump to the registration form", async ({ page }) => {
    await page.goto("/buyers")
    const main = page.getByRole("main")
    const verified = main.getByRole("link", { name: "Get Heirloom Verified", exact: true })
    const register = main.getByRole("link", { name: "Register my criteria", exact: true })
    await expect(verified).toHaveCount(2)
    await expect(register).toHaveCount(2)
    for (const locator of [verified.nth(0), register.nth(0), verified.nth(1), register.nth(1)]) {
      await page.goto("/buyers")
      await expect(locator).toHaveAttribute("href", "#buyer-register")
      await locator.click()
      await expectAnchorTarget(page, "/buyers#buyer-register")
      await expect(page.getByTestId("buyer-register-form")).toBeInViewport()
    }
  })

  test("offer review: the Review my offer buttons jump to the intake", async ({ page }) => {
    await page.goto("/offer-review")
    const main = page.getByRole("main")
    const ctas = main.getByRole("link", { name: "Review my offer", exact: true })
    await expect(ctas).toHaveCount(2)
    for (const locator of [ctas.nth(0), ctas.nth(1), main.getByRole("link", { name: "Review my offer first →" })]) {
      await page.goto("/offer-review")
      await expect(locator).toHaveAttribute("href", "#offer-intake")
      await locator.click()
      await expectAnchorTarget(page, "/offer-review#offer-intake")
      await expect(page.getByTestId("offer-intake")).toBeInViewport()
    }
  })

  test("confidentiality: See the disclosure levels jumps to the levels panel", async ({ page }) => {
    await page.goto("/confidentiality")
    await page.getByRole("main").getByRole("link", { name: "See the disclosure levels" }).click()
    await expectAnchorTarget(page, "/confidentiality#conf-levels")
    await expect(page.getByTestId("disclosure-levels")).toBeInViewport()
  })
})

test.describe("404 page", () => {
  test("Back to the home page returns home", async ({ page }) => {
    await page.goto("/nothing-here")
    await page.getByRole("link", { name: "Back to the home page" }).click()
    await expectPath(page, "/")
    await expect(h1(page)).toHaveText(H1_BY_PATH["/"])
  })

  test("See how it works opens the process page", async ({ page }) => {
    await page.goto("/nothing-here")
    await page.getByRole("main").getByRole("link", { name: "See how it works" }).click()
    await expectPath(page, "/how-it-works")
    await expect(h1(page)).toHaveText(H1_BY_PATH["/how-it-works"])
  })
})

test("browser back and forward keep the exitIQ result", async ({ page }) => {
  await page.goto("/score")
  await answerExitIq(page.getByTestId("exitiq-run"))
  await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EXPECTED.state)

  await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Fees", exact: true }).click()
  await expectPath(page, "/fees")
  await expect(h1(page)).toHaveText(H1_BY_PATH["/fees"])

  await page.goBack()
  await expectPath(page, "/score")
  await expect(page.getByTestId("exitiq-done")).toBeVisible()
  await expect(page.getByTestId("exitiq-state")).toHaveText(EXITIQ_EXPECTED.state)

  await page.goForward()
  await expectPath(page, "/fees")
  await expect(h1(page)).toHaveText(H1_BY_PATH["/fees"])

  await page.goBack()
  await expectPath(page, "/score")
  await expect(page.getByTestId("exitiq-done")).toBeVisible()
  await expect(page.getByTestId("exitiq-done").getByText(EXITIQ_EXPECTED.findings[0], { exact: true })).toBeVisible()
})
