import { expect, type Page, test } from "@playwright/test"
import { demoUrl, PHONE } from "./helpers"
import { ALL_ROUTES } from "../lib/site/routes"
import { BAR_H } from "../lib/site/scroll"

const PAGES = [...ALL_ROUTES, "/nothing-here"]
/** The two intake modes render different fields, so the label sweep runs on them; nothing else about them differs. */
const FORM_PAGES = [...PAGES, "/offer-review?mode=paste", "/offer-review?mode=verbal"]

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
      // Counted through Playwright's own accessible-name resolution (what `getByRole({ name })` matches on), so a
      // control named by `aria-labelledby` counts and text hidden from the accessibility tree does not.
      for (const role of ["link", "button"] as const) {
        const all = page.getByRole(role)
        const total = await all.count()
        expect(total, `${path} should have ${role}s to name`).toBeGreaterThan(0)
        const named = await page.getByRole(role, { name: /\S/ }).count()
        if (named !== total) {
          const markup = await all.evaluateAll((els) => els.map((el) => el.outerHTML.slice(0, 160)))
          expect(named, `${path}: a ${role} has no accessible name, among:\n${markup.join("\n")}`).toBe(total)
        }
        expect(named, `${path}: every ${role} has an accessible name`).toBe(total)
      }
    })
  }

  // Each intake mode renders its own fields, so the label sweep runs on the two `?mode=` variants too.
  for (const path of FORM_PAGES) {
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
    await expect(page.getByRole("spinbutton", { name: "Traditional comparison rate" })).toHaveAttribute("max", "25")
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
    await expect(region).toContainText("A full private sale costs a $5,000 engagement commitment and a 5% success fee.")
    await button.press("Enter")
    await expect(button).toHaveAttribute("aria-expanded", "false")
    await expect(region).toBeHidden()
  })
})

test.describe("focus order", () => {
  test("desktop: Tab visits the skip link, the brand, each nav group and its links, For buyers, then the advisor pill (home carries it in the bar)", async ({
    page,
  }) => {
    await page.goto("/")
    const stops = await tabSequence(page, "Talk to an M&A advisor")
    expect(stops).toEqual([
      "Skip to content",
      "Heirloom home",
      "For owners",
      "Sell my business",
      "Review my offer",
      "Check sale readiness",
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

  test("each home demo is one named tab stop, and the arrows step it without moving focus", async ({ page }) => {
    await page.goto(demoUrl("/", "still"))
    const DEMOS: Array<[testid: string, name: string, firstBeat: string]> = [
      ["fin-demo", "Financial preparation, a worked example that plays itself", "arrived"],
      ["priv-demo", "Who sees what, a worked example that plays itself", "rules"],
      ["dec-demo", "The four decisions, a worked example that plays itself", "goals"],
    ]
    for (const [testid, name, firstBeat] of DEMOS) {
      const demo = page.getByRole("group", { name })
      await expect(demo).toHaveAttribute("data-testid", testid)
      await expect(demo).toHaveAttribute("tabindex", "0")
      await demo.focus()
      await expect(demo).toBeFocused()
      await demo.press("Home")
      await expect(demo).toHaveAttribute("data-beat", firstBeat)
      await expect(demo).toBeFocused()
      // The step is spoken in the demo's own live region, and the demo has exactly one.
      await expect(demo.locator("[aria-live='polite']")).toHaveCount(1)
    }
  })

  test("the skip link is the first stop, shows under the bar while focused, and hands the page over to main", async ({
    page,
  }) => {
    await page.goto("/fees")
    const skip = page.getByRole("banner").getByRole("link", { name: "Skip to content" })
    await page.keyboard.press("Tab")
    await expect(skip).toBeFocused()
    const box = (await skip.boundingBox())!
    expect(box.height, "a 44px control while focused").toBe(44)
    expect(box.y, "sits under the 52px bar with a 12px gap").toBe(BAR_H + 12)
    expect(box.x, "starts at the gutter").toBe(24)
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/#main$/)
    await page.keyboard.press("Tab")
    expect(
      await page.evaluate(() => document.activeElement?.closest("main") !== null),
      "the next stop is inside main"
    ).toBe(true)
  })

  test("desktop, a page with context at landing: after For buyers come the scrubber (reading the title), its sections, the advisor entry, then the page pill", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/fees")
    await expect(page.getByRole("banner")).toHaveAttribute("data-state", "landing")
    const scrubber = page.getByTestId("bar-scrubber")
    await expect(scrubber).toBeVisible()
    await expect(scrubber).toHaveText("Fees")
    const stops = await tabSequence(page, "Calculate my fee")
    expect(stops).toEqual([
      "Skip to content",
      "Heirloom home",
      "For owners",
      "Sell my business",
      "Review my offer",
      "Check sale readiness",
      "The process",
      "How it works",
      "Fees",
      "Confidentiality",
      "The firm",
      "Who we are",
      "Questions",
      "Why Heirloom",
      "For buyers",
      "Fees",
      "Calculator",
      "Other costs",
      "Questions",
      "Talk to an advisor",
      "Calculate my fee",
    ])
    await expect(page.getByRole("banner").locator('[data-testid="bar-cta"]:visible')).toBeFocused()
    await expect(page.getByRole("banner")).toHaveAttribute("data-state", "landing")
  })

  {
    // 320 is the same tab order at a narrower width (mobile.spec measures what changes there: the mark, the pill).
    test.describe("phone", () => {
      test.use({ viewport: PHONE })
      test("Tab visits the skip link, the brand, then the menu button, and Enter opens the menu onto its first link", async ({
        page,
      }) => {
        await page.goto("/")
        const stops = await tabSequence(page, "Open navigation menu")
        expect(stops).toEqual(["Skip to content", "Heirloom home", "Open navigation menu"])
        await page.keyboard.press("Enter")
        await expect(page.getByTestId("nav-burger")).toHaveAttribute("aria-expanded", "true")
        await page.keyboard.press("Tab")
        await expect(page.locator("#mobile-nav").getByRole("link", { name: "Sell my business" })).toBeFocused()
        await page.keyboard.press("Shift+Tab")
        await page.keyboard.press("Shift+Tab")
        await expect(page.getByRole("banner").getByRole("link", { name: "Heirloom home" })).toBeFocused()
      })

      test("on a page with context the page pill sits between the brand and the menu button", async ({ page }) => {
        await page.goto("/buyers")
        const stops = await tabSequence(page, "Open navigation menu")
        expect(stops).toEqual(["Skip to content", "Heirloom home", "Get Heirloom Verified", "Open navigation menu"])
        await page.goto("/why")
        expect(await tabSequence(page, "Open navigation menu")).toEqual([
          "Skip to content",
          "Heirloom home",
          "Talk to an advisor",
          "Open navigation menu",
        ])
      })
    })
  }
})

test.describe("advisor dialog", () => {
  test("focus is trapped inside the dialog while it is open", async ({ page }) => {
    await page.goto("/")
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
    await page.goto("/")
    const trigger = page.getByRole("banner").getByTestId("open-advisor")
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Talk to an M&A advisor" })
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("the dialog is labelled and its controls carry roles and names", async ({ page }) => {
    await page.goto("/")
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
