// Extracts a film's first frame as a JPEG poster with Playwright's bundled Chromium, because ffmpeg is not
// installed on this machine. A one-file http server puts the mp4 on a real origin (a file:// video taints the
// canvas), the page loads it in a muted, inline <video>, seeks to 0, waits for `loadeddata`, draws the frame to a
// canvas at the video's intrinsic size and encodes it as JPEG.
// Usage: node e2e/tools/first-frame.mjs public/media/archive-hall.mp4 public/media/archive-hall-poster.jpg [quality]
import { chromium } from "@playwright/test"
import { createReadStream, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { resolve } from "node:path"

const [film, out, quality = "0.82"] = process.argv.slice(2)
if (!film || !out) {
  console.error("usage: node e2e/tools/first-frame.mjs <film.mp4> <poster.jpg> [quality]")
  process.exit(1)
}
const filmPath = resolve(film)

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "video/mp4" })
  createReadStream(filmPath).pipe(res)
})
await new Promise((ok) => server.listen(0, "127.0.0.1", ok))
const { port } = server.address()

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${port}/blank`)
const result = await page.evaluate(
  async ([src, q]) => {
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.preload = "auto"
    video.src = src
    await new Promise((ok, fail) => {
      video.addEventListener("loadeddata", ok, { once: true })
      video.addEventListener("error", () => fail(new Error("the film did not load")), { once: true })
    })
    if (video.currentTime !== 0) {
      video.currentTime = 0
      await new Promise((ok) => video.addEventListener("seeked", ok, { once: true }))
    }
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return {
      width: canvas.width,
      height: canvas.height,
      dataUrl: canvas.toDataURL("image/jpeg", Number(q)),
    }
  },
  [`http://127.0.0.1:${port}/film.mp4`, quality]
)
await browser.close()
server.close()

const bytes = Buffer.from(result.dataUrl.split(",")[1], "base64")
writeFileSync(out, bytes)
console.log(`${out}: ${result.width}×${result.height}, ${bytes.length} bytes (quality ${quality})`)
