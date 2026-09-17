// Screenshot every public route at desktop and phone widths against a running server (pnpm build && pnpm start).
// Usage: node e2e/tools/screenshots.mjs http://127.0.0.1:3000 ./.screenshots
import { chromium } from "@playwright/test"
import { mkdirSync } from "node:fs"

const [base = "http://127.0.0.1:3000", out = "./shots"] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const ROUTES = [
  "/",
  "/score",
  "/offer-review",
  "/how-it-works",
  "/fees",
  "/confidentiality",
  "/buyers",
  "/who-we-are",
  "/questions",
  "/why",
  "/nothing-here",
]
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "phone", width: 390, height: 844 },
]
const browser = await chromium.launch()
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: "networkidle" })
    await page.evaluate(() => document.fonts.ready)
    // Scroll through so scroll-driven scenes have advanced and lazy content is laid out, then return to top.
    await page.evaluate(async () => {
      const step = window.innerHeight
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      window.scrollTo(0, 0)
      await new Promise((r) => setTimeout(r, 200))
    })
    const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z-]/g, "_")
    await page.screenshot({ path: `${out}/${name}-${vp.name}.png`, fullPage: true })
    // Viewport-only shot of the top of the page (what a visitor sees first).
    await page.screenshot({ path: `${out}/${name}-${vp.name}-fold.png`, fullPage: false })
  }
  await ctx.close()
}
await browser.close()
console.log("done", out)
