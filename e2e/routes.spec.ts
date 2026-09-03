import { expect, test } from "@playwright/test"
import { DESKTOP, expectRouteRenders, PHONE, watchConsole } from "./helpers"
import { ALL_ROUTES } from "../lib/site/routes"

const LAYOUTS = [
  { name: "desktop", viewport: DESKTOP, layout: "desktop" as const },
  { name: "phone", viewport: PHONE, layout: "mobile" as const },
]

for (const { name, viewport, layout } of LAYOUTS) {
  test.describe(`${name} ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport })

    for (const path of ALL_ROUTES) {
      test(`${path} renders its metadata, heading, header, and footer with no console errors or failed requests`, async ({
        page,
      }) => {
        const console = watchConsole(page)
        await expectRouteRenders(page, path, layout)
        console.assertClean()
      })
    }
  })
}

test("unknown paths show the site 404 page", async ({ page }) => {
  const response = await page.goto("/nothing-here")
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle("Heirloom | Page not found")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page is not part of the record.")
  await expect(
    page.getByText("The address may have changed. Start from the home page, or go straight to the sale process.")
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/")
  await expect(page.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "/how-it-works")
  const robots = page.locator("meta[name='robots']")
  await expect(robots.first()).toHaveAttribute("content", "noindex")
  for (const content of await robots.evaluateAll((els) => els.map((el) => el.getAttribute("content")))) {
    expect(content).toBe("noindex")
  }
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
  await expect(page.getByRole("contentinfo")).toContainText("We represent sellers.")
})

test("every link on every page resolves: internal paths return 200 and anchors exist", async ({ page, request }) => {
  const internal = new Set<string>()
  for (const path of ALL_ROUTES) {
    await page.goto(path)
    const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""))
    expect(
      hrefs.filter((h) => h === "" || h === "#"),
      `empty hrefs on ${path}`
    ).toEqual([])
    for (const href of hrefs) {
      if (href.startsWith("#")) {
        await expect(page.locator(`#${href.slice(1)}`), `${path} anchor ${href}`).toHaveCount(1)
      } else if (href.startsWith("/")) {
        const [target, hash] = href.split("#")
        internal.add(target!)
        if (hash) {
          const res = await request.get(target!)
          expect(await res.text(), `${target} should contain id="${hash}"`).toContain(`id="${hash}"`)
        }
      } else {
        expect(href, `${path} link ${href}`).toMatch(/^(https?:|mailto:)/)
      }
    }
  }
  for (const target of Array.from(internal)) {
    const res = await request.get(target.split("?")[0]!)
    expect(res.status(), target).toBe(200)
  }
})

test("the footer links home, shows a clickable email, and carries the current year", async ({ page }) => {
  await page.goto("/why")
  const footer = page.getByRole("contentinfo")
  await expect(footer.getByRole("link", { name: "Heirloom home" })).toHaveAttribute("href", "/")
  await expect(footer.getByRole("link", { name: "hello@heirloom.com" })).toHaveAttribute(
    "href",
    "mailto:hello@heirloom.com"
  )
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Heirloom. All rights reserved.`)
  await expect(footer).toContainText(
    "Worked examples on this site, including Project Ridgeline, use fictional companies, people, buyers, and figures and do not describe a Heirloom client or transaction."
  )
  await expect(footer.getByRole("link", { name: "Get Heirloom Verified" })).toHaveAttribute(
    "href",
    "/buyers#buyer-register"
  )
  await expect(footer.getByTestId("open-advisor")).toHaveText("Talk to an M&A advisor")
})

test("legacy routes are no longer served", async ({ page }) => {
  for (const legacy of ["/login", "/dashboard", "/about", "/dealiq", "/report/abc", "/api/assessment/session"]) {
    const response = await page.goto(legacy)
    expect(response?.status(), legacy).toBe(404)
  }
})
