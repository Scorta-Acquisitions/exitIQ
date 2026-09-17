import { expect, type Page, test } from "@playwright/test"
import {
  demoUrl,
  expectAutoplay,
  expectNoHorizontalScroll,
  expectReplay,
  NARROW_PHONE,
  PHONE,
  stepDemo,
  waitForFonts,
} from "./helpers"
import { TIMING_LINE } from "../lib/site/decisions/data"
import { BAR_H } from "../lib/site/scroll"

/** Every beat of the demo, in the order it plays them. */
const BEATS = ["goals", "numbers", "privacy", "market", "meetings", "offers", "close"]

const demo = (page: Page) => page.getByTestId("dec-demo")
const letter = (page: Page, id: string) => page.getByTestId(`dec-letter-${id}`)

/** How many of this section's own animations are still running; the rest of the page is left out of it. */
function running(page: Page) {
  return page.evaluate(() => {
    const tile = document.querySelector('[data-testid="seller-workload"]')!
    return tile.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length
  })
}

/** The demo's frame, once every arrival, colour change and travel in this section has finished. */
async function settled(page: Page) {
  await expect(demo(page)).toBeVisible()
  await expect.poll(() => running(page)).toBe(0)
}

/** The frame's height now, to a tenth of a pixel. */
function frameHeight(page: Page) {
  return page.evaluate(
    () => Math.round(document.querySelector('[data-testid="dec-frame"]')!.getBoundingClientRect().height * 10) / 10
  )
}

/** The four letters in the order a visitor reads them down the screen. */
function rowOrder(page: Page) {
  return page.evaluate(() =>
    ["A", "B", "C", "D"]
      .map((id) => {
        const el = document.querySelector(`[data-testid="dec-letter-${id}"]`)!
        return { id, y: el.getBoundingClientRect().y }
      })
      .sort((a, b) => a.y - b.y)
      .map((row) => row.id)
  )
}

/** Every row the frame carries, by testid: what must not change as the demo plays. */
function frameRows(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-testid="dec-frame"] [data-testid]'))
      .map((el) => el.getAttribute("data-testid")!)
      .sort()
  )
}

/**
 * The largest vertical gap between two adjacent bands of text inside the frame. A demo that reserves space it
 * never fills shows up here as a hole, so the assertion is the reviewer's measure of an unfinished screen.
 */
function largestGap(page: Page) {
  return page.evaluate(() => {
    const frame = document.querySelector('[data-testid="dec-frame"]')!
    const rows: Array<{ top: number; bottom: number }> = []
    for (const el of Array.from(frame.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const meter = /^dec-stage-\d/.test((el as HTMLElement).dataset.testid ?? "")
      const text = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim())
      if (!text && !meter) continue
      rows.push({ top: r.top, bottom: r.bottom })
    }
    rows.sort((a, b) => a.top - b.top)
    const bands: Array<{ top: number; bottom: number }> = []
    for (const row of rows) {
      const last = bands[bands.length - 1]
      if (last && row.top < last.bottom - 0.5) last.bottom = Math.max(last.bottom, row.bottom)
      else bands.push({ ...row })
    }
    let worst = 0
    for (let i = 1; i < bands.length; i++) worst = Math.max(worst, bands[i]!.top - bands[i - 1]!.bottom)
    return Math.round(worst)
  })
}

test.describe("the four decisions demo", () => {
  test("plays its seven beats in order, rests on the close, then plays again", async ({ page }) => {
    await page.goto("/")
    await waitForFonts(page)
    await expectAutoplay(page, "dec-demo", BEATS)
    await expect(demo(page)).toHaveAttribute("data-beat", "close")
    await expect(page.getByTestId("dec-timing")).toHaveText(TIMING_LINE)
    await settled(page)
    const atClose = await frameHeight(page)
    const rows = await frameRows(page)
    await expectReplay(page, "dec-demo", "goals")
    // The screen that comes round again is the one that finished: every row still there, the same height.
    await expect.poll(() => frameRows(page), { message: "no row leaves at the replay" }).toEqual(rows)
    await settled(page)
    expect(
      Math.abs((await frameHeight(page)) - atClose),
      `frame height at the replay vs ${atClose}`
    ).toBeLessThanOrEqual(2)
  })

  /**
   * A real pointer over the playing screen, with nothing focused: the clock stops where it is (a focused root
   * would pause it too, which is why this test never focuses anything), and leaving starts it again with no
   * timer of its own.
   */
  test("the pointer resting on the screen pauses the play, and leaving resumes it", async ({ page }) => {
    await page.goto("/")
    await waitForFonts(page)
    await demo(page).scrollIntoViewIfNeeded()
    const started = await demo(page).getAttribute("data-beat")
    await expect
      .poll(() => demo(page).getAttribute("data-beat"), { message: "the demo should play on its own" })
      .not.toBe(started)

    await demo(page).hover({ position: { x: 8, y: 8 } })
    await expect(demo(page)).toHaveAttribute("data-demo-state", "paused")
    const held = await demo(page).getAttribute("data-beat")
    // A paused clock runs no frame: the beat's own arrivals finish, nothing starts the next one, and the beat
    // is still the one the pointer landed on.
    await expect.poll(() => running(page), { message: "the paused demo should settle" }).toBe(0)
    await expect(demo(page)).toHaveAttribute("data-beat", held ?? "")

    await page.mouse.move(2, 2)
    await expect.poll(() => demo(page).getAttribute("data-demo-state"), { message: "the demo resumes" }).toBe("playing")
    await expect.poll(() => demo(page).getAttribute("data-beat"), { message: "and plays on" }).not.toBe(held)
  })

  /**
   * The priority decision re-ranks the letters and the chosen one TRAVELS to the top: `useFlipRows` writes the
   * CSS `order` and animates each row from where it stood, which only a browser lays out. Resting on a
   * priority word then ranks all four by that priority alone, on a real mouse, which is what `fromMouse`
   * (components/site/demo/usePreviewHandlers.ts) gates.
   */
  test("the chosen letter travels to the top, and a priority word ranks all four envelopes", async ({ page }) => {
    await page.goto("/")
    await waitForFonts(page)
    await stepDemo(page, "dec-demo", "meetings")
    await settled(page)
    expect(await rowOrder(page), "the letters stand in the order they arrived").toEqual(["A", "B", "C", "D"])

    await stepDemo(page, "dec-demo", "offers")
    await settled(page)
    expect(await rowOrder(page), "the winner has travelled to the top").toEqual(["C", "A", "B", "D"])

    await page.getByTestId("dec-priority-cash").hover()
    await expect(demo(page)).toHaveAttribute("data-preview", "cash")
    await expect(letter(page, "D")).toHaveAttribute("data-rank", "1")
    await expect(letter(page, "C")).toHaveAttribute("data-rank", "2")
    await expect(letter(page, "A")).toHaveAttribute("data-rank", "3")
    await expect(letter(page, "B")).toHaveAttribute("data-rank", "4")

    await page.getByTestId("dec-frame").hover({ position: { x: 10, y: 10 } })
    await expect(demo(page)).toHaveAttribute("data-preview", "")
    await expect(letter(page, "C")).toHaveAttribute("data-rank", "1")
  })

  test("holds one height and one row set through every beat, with no hole in the screen", async ({ page }) => {
    await page.goto("/")
    await waitForFonts(page)
    await stepDemo(page, "dec-demo", "goals")
    await settled(page)
    const first = await frameHeight(page)
    const rows = await frameRows(page)
    for (const id of BEATS) {
      await stepDemo(page, "dec-demo", id)
      await settled(page)
      expect(Math.abs((await frameHeight(page)) - first), `frame height at ${id}`).toBeLessThanOrEqual(2)
      expect(await frameRows(page), `rows at ${id}`).toEqual(rows)
      expect(await largestGap(page), `largest gap at ${id}`).toBeLessThanOrEqual(48)
    }
  })
})

for (const vp of [PHONE, NARROW_PHONE]) {
  test.describe(`the four decisions demo at ${vp.width}×${vp.height}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: true })

    test("fits one screen with no scroller inside it", async ({ page }) => {
      await page.goto(demoUrl("/", "still"))
      await waitForFonts(page)
      await settled(page)
      await expectNoHorizontalScroll(page, `the four decisions demo at ${vp.width}`)

      const frame = page.getByTestId("dec-frame")
      const box = (await frame.boundingBox())!
      expect(box.width).toBeLessThanOrEqual(vp.width)
      expect(box.height).toBeLessThanOrEqual(vp.height - BAR_H)

      // Nothing inside the section is a scroller of its own, and nothing sticks out of the frame it sits in.
      const inside = await page.evaluate(() => {
        const root = document.querySelector('[data-testid="seller-workload"]')!
        const frame = document.querySelector('[data-testid="dec-frame"]')!.getBoundingClientRect()
        const name = (el: Element) => (el as HTMLElement).dataset.testid ?? el.tagName
        const all = Array.from(root.querySelectorAll<HTMLElement>("*"))
        return {
          scrollers: all
            .filter((el) => /auto|scroll/.test(getComputedStyle(el).overflowX + getComputedStyle(el).overflowY))
            .map(name),
          outside: all
            .filter((el) => el.getBoundingClientRect().width > 0)
            .filter((el) => el.closest('[data-testid="dec-frame"]'))
            .filter((el) => el.getBoundingClientRect().right > frame.right + 1)
            .map(name),
        }
      })
      expect(inside.scrollers).toEqual([])
      expect(inside.outside).toEqual([])
    })

    test("holds one height through every beat of the play", async ({ page }) => {
      await page.goto("/")
      await waitForFonts(page)
      await stepDemo(page, "dec-demo", "goals")
      await settled(page)
      const first = await frameHeight(page)
      for (const id of BEATS) {
        await stepDemo(page, "dec-demo", id)
        await settled(page)
        expect(Math.abs((await frameHeight(page)) - first), `frame height at ${id}`).toBeLessThanOrEqual(2)
        expect(await frameHeight(page)).toBeLessThanOrEqual(vp.height - BAR_H)
      }
    })

    test("steps the story with a tap, and every control it offers is a 44px target", async ({ page }) => {
      await page.goto(demoUrl("/", "dec:close"))
      await waitForFonts(page)
      await settled(page)
      await expect(page.getByTestId("dec-stage-line")).toBeVisible()
      await expect(page.getByTestId("dec-stage-line")).toHaveText("Stage 8 of 8 · Close")

      const row = letter(page, "A").getByRole("button")
      const size = (await row.boundingBox())!
      expect(size.height).toBeGreaterThanOrEqual(44)
      await row.tap()
      await expect(demo(page)).toHaveAttribute("data-preview", "A")
      await expect(letter(page, "A")).toContainText("Headline $4.30M")
      await row.tap()
      await expect(demo(page)).toHaveAttribute("data-preview", "")
    })
  })
}
