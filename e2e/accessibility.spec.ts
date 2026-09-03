import { expect, type Page, test } from "@playwright/test"
import { NARROW_PHONE, PHONE } from "./helpers"
import { ALL_ROUTES } from "../lib/site/routes"

const PAGES = [...ALL_ROUTES, "/offer-review?mode=paste", "/offer-review?mode=verbal", "/nothing-here"]

/** Presses Tab until `until` is focused (or `max` presses), returning a short description of each stop. */
async function tabSequence(page: Page, until: string, max = 30): Promise<string[]> {
  const stops: string[] = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return "(body)"
      const label = el.getAttribute("aria-label")
      if (label) return label
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove())
      const span = clone.querySelector("span")
      return (span?.textContent ?? clone.textContent ?? "").trim()
    })
    stops.push(stop)
    if (stop === until) break
  }
  return stops
}

test.describe("landmarks and text alternatives", () => {
  for (const path of PAGES) {
    test(`${path} has one h1, one main, a banner, a contentinfo, and lang=en`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator("html")).toHaveAttribute("lang", "en")
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.locator("main")).toHaveCount(1)
      await expect(page.getByRole("banner")).toHaveCount(1)
      await expect(page.getByRole("contentinfo")).toHaveCount(1)
    })

    test(`${path}: every image has an alt attribute and every role=img has a label`, async ({ page }) => {
      await page.goto(path)
      const offenders = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"))
          .filter((img) => !img.hasAttribute("alt"))
          .map((img) => `img: ${img.outerHTML.slice(0, 120)}`)
        const roleImgs = Array.from(document.querySelectorAll("[role='img']"))
          .filter((el) => !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby"))
          .map((el) => `role=img: ${el.outerHTML.slice(0, 120)}`)
        return [...imgs, ...roleImgs]
      })
      expect(offenders).toEqual([])
    })

    test(`${path}: every link and button has an accessible name`, async ({ page }) => {
      await page.goto(path)
      const offenders = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("a[href], button"))
          .filter((el) => {
            const text = el.textContent?.trim() ?? ""
            const alt = Array.from(el.querySelectorAll("img"))
              .map((img) => img.getAttribute("alt")?.trim() ?? "")
              .join("")
            const name = text || el.getAttribute("aria-label")?.trim() || el.getAttribute("title")?.trim() || alt
            return !name
          })
          .map((el) => el.outerHTML.slice(0, 160))
      )
      expect(offenders).toEqual([])
    })

    test(`${path}: every form control has a label`, async ({ page }) => {
      await page.goto(path)
      const offenders = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            "input:not([type='hidden']), textarea, select"
          )
        )
          .filter((el) => {
            if (el.getAttribute("aria-label")?.trim() || el.getAttribute("aria-labelledby")) return false
            if (el.closest("label")) return false
            return !(el.id && document.querySelector(`label[for="${el.id}"]`))
          })
          .map((el) => el.outerHTML.slice(0, 160))
      )
      expect(offenders).toEqual([])
    })
  }

  test("the fee calculator's quoted-rate input is labelled once it appears", async ({ page }) => {
    await page.goto("/fees")
    await page.getByRole("button", { name: "Enter quoted rate" }).click()
    const rate = page.locator("#fees-rate")
    await expect(rate).toBeVisible()
    await expect(rate).toHaveAttribute("aria-label", "Traditional comparison rate")
    await expect(page.locator("label[for='fees-rate']")).toHaveText("Traditional comparison rate")
    await expect(page.getByRole("spinbutton", { name: "Traditional comparison rate" })).toHaveAttribute("min", "1")
    await expect(page.getByRole("spinbutton", { name: "Traditional comparison rate" })).toHaveAttribute("max", "15")
  })

  test("question disclosures expose their expanded state and control a region", async ({ page }) => {
    await page.goto("/questions")
    const button = page.getByRole("button", { name: "How much does Heirloom charge?" })
    const regionId = await button.getAttribute("aria-controls")
    expect(regionId).toBeTruthy()
    const region = page.locator(`[id="${regionId}"]`)
    await expect(button).toHaveAttribute("aria-expanded", "false")
    await expect(region).toHaveAttribute("role", "region")
    await expect(region).toBeHidden()
    await button.click()
    await expect(button).toHaveAttribute("aria-expanded", "true")
    await expect(region).toBeVisible()
    await expect(region).toContainText(
      "For a full private sale, you pay a $5,000 engagement commitment and a 5% success fee."
    )
    await button.press("Enter")
    await expect(button).toHaveAttribute("aria-expanded", "false")
    await expect(region).toBeHidden()
  })
})

test.describe("focus order", () => {
  test("desktop: Tab visits the wordmark, each nav group and its links, For buyers, then the advisor button", async ({
    page,
  }) => {
    await page.goto("/")
    const stops = await tabSequence(page, "Talk to an M&A advisor")
    expect(stops).toEqual([
      "Heirloom home",
      "For owners",
      "Sell my business",
      "Review my offer",
      "Check my business",
      "The process",
      "How it works",
      "Fees",
      "Confidentiality",
      "The firm",
      "Who we are",
      "Questions",
      "Why Heirloom",
      "For buyers",
      "Talk to an M&A advisor",
    ])
    await expect(page.getByRole("banner").getByTestId("open-advisor")).toBeFocused()
  })

  test.describe("phone", () => {
    test.use({ viewport: PHONE })
    test("Tab visits the wordmark, the advisor button, then the menu button, and Enter opens the menu", async ({
      page,
    }) => {
      await page.goto("/")
      const stops = await tabSequence(page, "Open navigation menu")
      expect(stops).toEqual(["Heirloom home", "Talk to an M&A advisor", "Open navigation menu"])
      await page.keyboard.press("Enter")
      await expect(page.getByTestId("nav-burger")).toHaveAttribute("aria-expanded", "true")
      await page.keyboard.press("Tab")
      await expect(page.locator("#mobile-nav").getByRole("link", { name: "Sell my business" })).toBeFocused()
    })
  })

  test.describe("narrow phone", () => {
    test.use({ viewport: NARROW_PHONE })
    test("Tab visits the wordmark then the menu button", async ({ page }) => {
      await page.goto("/")
      const stops = await tabSequence(page, "Open navigation menu")
      expect(stops).toEqual(["Heirloom home", "Open navigation menu"])
    })
  })
})

test.describe("advisor dialog", () => {
  test("focus is trapped inside the dialog while it is open", async ({ page }) => {
    await page.goto("/fees")
    const trigger = page.getByRole("banner").getByTestId("open-advisor")
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Talk to an M&A advisor" })
    await expect(dialog).toBeVisible()

    const focusInsideDialog = () =>
      page.evaluate(() => {
        const el = document.activeElement
        return !!el && el !== document.body && !!el.closest("[role='dialog']")
      })
    await expect.poll(focusInsideDialog, { message: "initial focus lands inside the dialog" }).toBe(true)
    for (let i = 1; i <= 25; i++) {
      await page.keyboard.press("Tab")
      expect(await focusInsideDialog(), `after Tab ${i}`).toBe(true)
    }
    for (let i = 1; i <= 5; i++) {
      await page.keyboard.press("Shift+Tab")
      expect(await focusInsideDialog(), `after Shift+Tab ${i}`).toBe(true)
    }

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })

  test("focus returns to the button that opened the dialog when it closes", async ({ page }) => {
    await page.goto("/fees")
    const trigger = page.getByRole("banner").getByTestId("open-advisor")
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Talk to an M&A advisor" })
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("the dialog is labelled and its controls carry roles and names", async ({ page }) => {
    await page.goto("/fees")
    await page.getByRole("banner").getByTestId("open-advisor").click()
    const dialog = page.getByRole("dialog", { name: "Talk to an M&A advisor" })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("group", { name: "Answer choices" }).getByRole("button")).toHaveText([
      "Selling the business",
      "An offer or buyer I already have",
      "Value and timing",
      "Confidentiality concerns",
      "Something else",
    ])
    await expect(dialog.getByRole("group", { name: "Answer choices" }).locator("[aria-pressed]")).toHaveCount(5)
    const progress = dialog.getByRole("progressbar", { name: "Briefing progress" })
    await expect(progress).toHaveAttribute("aria-valuemin", "0")
    await expect(progress).toHaveAttribute("aria-valuemax", "5")
    await expect(progress).toHaveAttribute("aria-valuenow", "0")
    await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible()
  })
})
