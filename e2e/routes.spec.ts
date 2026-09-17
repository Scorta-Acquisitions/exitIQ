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
  const hygiene = watchConsole(page)
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
  await expect(page.getByRole("contentinfo")).toContainText("Heirloom works for sellers only.")
  // The one served page with no hygiene pass until now. `assertClean` cannot be used as it stands: the 404
  // status of the document itself is the point of the test and would count as a failed request, so what is
  // asserted here is the page's own console — a hydration error or a thrown exception in `not-found.tsx`.
  const thrown = hygiene.errors.filter((text) => !/Failed to load resource/.test(text))
  expect(thrown, `console errors on the 404 page:\n${thrown.join("\n")}`).toEqual([])
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

test("legacy routes are no longer served", async ({ page }) => {
  for (const legacy of ["/login", "/dashboard", "/about", "/dealiq", "/report/abc", "/api/assessment/session"]) {
    const response = await page.goto(legacy)
    expect(response?.status(), legacy).toBe(404)
  }
})

test("every page advertises the brand share image for link previews", async ({ page, request }) => {
  for (const path of ["/", "/fees"]) {
    await page.goto(path)
    const og = page.locator("meta[property='og:image']")
    await expect(og).toHaveCount(1)
    const url = (await og.getAttribute("content")) ?? ""
    expect(url).toMatch(/^https?:\/\/[^/]+\/og\/heirloom-og\.png$/)
    await expect(page.locator("meta[property='og:image:width']")).toHaveAttribute("content", "1200")
    await expect(page.locator("meta[property='og:image:height']")).toHaveAttribute("content", "630")
    await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", await page.title())
    await expect(page.locator("meta[property='og:site_name']")).toHaveAttribute("content", "Heirloom")
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary_large_image")
    await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", url)
    const image = await request.get(new URL(url).pathname)
    expect(image.status()).toBe(200)
    expect(image.headers()["content-type"]).toBe("image/png")
    // A real card, not a placeholder: the flat deep-green tile with the Heirloom-green lockup compresses to 15 KB.
    expect((await image.body()).byteLength).toBeGreaterThan(10_000)
  }
})
