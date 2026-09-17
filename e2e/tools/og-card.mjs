// The share card, public/og/heirloom-og.png: the bar's own lockup, magnified. The served 28px lockup (its markup, its
// CSS, the opsz-28 master the bar uses) sits inside a CSS scale of 120/28, in the Heirloom green the bar draws it in
// (#4ca270, `heirloom-on-dark`) on the deep-green tile, centred in 1200×630, so the card is pixel-faithful to the bar.
// The clone drops its class attribute, so the colour comes from the card's own inline `color` and the mark's
// `currentColor` fill. Setting 120px text instead would let automatic optical sizing pick
// the wider opsz-72 master, which measured 657px wide with the word 4px high.
// Usage: BASE=http://127.0.0.1:3000 node e2e/tools/og-card.mjs [outPath]   (against a served build)
import { chromium } from "@playwright/test"
import { statSync } from "node:fs"

const BASE = process.env.BASE ?? "http://127.0.0.1:3000"
const out = process.argv[2] ?? "public/og/heirloom-og.png"
const MARK = 120
const k = MARK / 28

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(BASE + "/", { waitUntil: "networkidle" })
await page.waitForTimeout(900)
const html = await page.evaluate(() => {
  const lockup = [...document.querySelectorAll("header [data-testid='brand-lockup']")].find(
    (e) => e.getClientRects().length
  )
  const clone = lockup.cloneNode(true)
  clone.querySelectorAll(".animate-mark-in").forEach((g) => g.classList.remove("animate-mark-in"))
  clone.removeAttribute("class")
  clone.style.display = "inline-flex"
  clone.style.alignItems = "center"
  clone.style.flexShrink = "0"
  return clone.outerHTML
})
await page.evaluate(
  ({ html, k }) => {
    document.documentElement.style.background = "#0b241b"
    document.body.style.margin = "0"
    document.body.style.background = "#0b241b"
    document.body.innerHTML = `<div style="width:1200px;height:630px;background:#0b241b;color:#4ca270;display:flex;align-items:center;justify-content:center;overflow:hidden"><div id="lk" style="transform:scale(${k});transform-origin:center center;line-height:0">${html}</div></div>`
  },
  { html, k }
)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(200)
const box = await page.evaluate(() => {
  const r = document.querySelector("#lk").getBoundingClientRect()
  return { x: +r.left.toFixed(2), y: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }
})
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } })
// The mark's and the word's ink boxes in the card, split at the widest empty column run between them.
const png = (await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } })).toString("base64")
const ink = await page.evaluate(async (png) => {
  const img = new Image()
  img.src = "data:image/png;base64," + png
  await img.decode()
  const c = document.createElement("canvas")
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext("2d")
  ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, c.width, c.height).data
  const lit = (x, y) => {
    const i = (y * c.width + x) * 4
    return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] > 140
  }
  const cols = new Array(c.width).fill(false)
  for (let x = 0; x < c.width; x++)
    for (let y = 0; y < c.height; y++)
      if (lit(x, y)) {
        cols[x] = true
        break
      }
  const first = cols.indexOf(true)
  const last = cols.lastIndexOf(true)
  let bestS = -1
  let bestL = 0
  let s = -1
  for (let x = first; x <= last; x++) {
    if (!cols[x]) {
      if (s < 0) s = x
    } else if (s >= 0) {
      if (x - s > bestL) {
        bestL = x - s
        bestS = s
      }
      s = -1
    }
  }
  const bbox = (x0, x1) => {
    let minY = 1e9
    let maxY = -1
    for (let y = 0; y < c.height; y++)
      for (let x = x0; x <= x1; x++)
        if (lit(x, y)) {
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
    return { left: x0, right: x1 + 1, top: minY, bottom: maxY + 1 }
  }
  const mark = bbox(first, bestS - 1)
  const word = bbox(bestS + bestL, last)
  return {
    mark,
    word,
    gap: bestL,
    lockupInkWidth: last - first + 1,
    wordTopBelowMarkTop: word.top - mark.top,
    wordBottomAboveMarkBottom: mark.bottom - word.bottom,
    wordCentreBelowMarkCentre: (word.top + word.bottom) / 2 - (mark.top + mark.bottom) / 2,
  }
}, png)
await browser.close()
console.log(JSON.stringify({ out, bytes: statSync(out).size, scaledBox: box, ink }, null, 1))
