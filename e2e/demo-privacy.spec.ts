import { expect, type Page, test } from "@playwright/test"
import { demoUrl, expectAutoplay, expectReplay, stepDemo, watchConsole } from "./helpers"
import { BAR_H } from "../lib/site/scroll"

/** The beats of "Who sees what", in the order the demo plays them. */
const BEATS = ["rules", "overview", "nda", "qualified", "selected", "expired"]

const demo = (page: Page) => page.getByTestId("priv-demo")
const level = (page: Page) => page.getByTestId("priv-level")
/** The record's value cell for one field, by the row's label. */
const cell = (page: Page, label: string) =>
  page.getByTestId("company-record").locator("div", { hasText: label }).last().locator("span").last()

/** How many of this section's own animations are still running; the rest of the page is left out of it. */
function running(page: Page) {
  return page.evaluate(() => {
    const tile = document.querySelector('[data-testid="privacy-scene"]')!
    return tile.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length
  })
}

/** The screen, once every arrival, level change and log re-key in this section has finished. */
async function settled(page: Page) {
  await expect(demo(page)).toBeVisible()
  await expect.poll(() => running(page), { message: "the section's own animations should settle" }).toBe(0)
}

/** The frame's height now, to a tenth of a pixel. */
function frameHeight(page: Page) {
  return page.evaluate(
    () => Math.round(document.querySelector('[data-testid="priv-frame"]')!.getBoundingClientRect().height * 10) / 10
  )
}

/**
 * Anything in the section that would scroll sideways or clip its own content: a nested scroller (an element
 * whose horizontal overflow is scrollable) or a child cut off by an ancestor that hides its overflow. A
 * finished `animate-row-in` leaves Chromium's scrollWidth 6px past the client width for good, so the scroll
 * check reads the overflow style rather than the width alone.
 */
async function overflowing(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const section = document.querySelector('[data-testid="privacy-scene"]')
    if (!section) throw new Error("privacy section not found")
    const name = (el: Element) => el.getAttribute("data-testid") ?? `${el.tagName}.${el.className.slice(0, 32)}`
    const bad: string[] = []
    for (const el of Array.from(section.querySelectorAll("*"))) {
      const style = getComputedStyle(el)
      if ((style.overflowX === "auto" || style.overflowX === "scroll") && el.scrollWidth > el.clientWidth)
        bad.push(`scroller: ${name(el)}`)
      if (style.overflowX !== "hidden") continue
      const box = el.getBoundingClientRect()
      for (const child of Array.from(el.children)) {
        const rect = child.getBoundingClientRect()
        if (rect.width > 0 && (rect.right > box.right + 1 || rect.left < box.left - 1))
          bad.push(`clipped: ${name(child)}`)
      }
    }
    return bad
  })
}

test.describe("who sees what: the demo plays itself", () => {
  test("opens the record one level at a time, rests on its end state, then plays again", async ({ page }) => {
    const hygiene = watchConsole(page)
    await page.goto("/")
    await expectAutoplay(page, "priv-demo", BEATS)
    await expect(demo(page)).toHaveAttribute("data-level", "4")
    await expect(demo(page)).toHaveAttribute("data-viewer", "pe")
    await expect(level(page)).toHaveText("Level 4 · Final diligence · Visible 5 of 5")
    await expect(page.getByTestId("priv-log").locator("li")).toHaveCount(2)
    await settled(page)
    const ended = await frameHeight(page)
    await expectReplay(page, "priv-demo", "rules")
    await expect(level(page)).toHaveText("Level 0 · Nothing public · Visible 0 of 5")
    // The screen that comes round again is the same size as the one that finished: no reflow at the re-key.
    await settled(page)
    expect(Math.abs((await frameHeight(page)) - ended), `frame height at the replay vs ${ended}`).toBeLessThanOrEqual(2)
    hygiene.assertClean()
  })

  test("holds under the pointer and runs on when it leaves", async ({ page }) => {
    await page.goto("/")
    await demo(page).scrollIntoViewIfNeeded()
    await demo(page).hover()
    await expect(demo(page)).toHaveAttribute("data-demo-state", "paused")
    const held = await demo(page).getAttribute("data-beat")
    // A paused clock runs no frame, so the beat's own arrivals finish and nothing starts the next one: the
    // section's animations settling to none is the measured proof that the demo stopped where it was.
    await expect.poll(() => running(page), { message: "the paused demo should settle" }).toBe(0)
    await expect(demo(page)).toHaveAttribute("data-beat", held ?? "")
    await page.mouse.move(0, 0)
    await expect.poll(() => demo(page).getAttribute("data-demo-state"), { message: "the demo resumes" }).toBe("playing")
  })
})

test.describe("who sees what: the buyer preview", () => {
  /**
   * A real pointer, which is what `hoverUnavailable()` gates the preview on: entering the excluded
   * competitor's row empties the record, and leaving it restores the beat the demo rests on. The strings the
   * preview writes are pinned by PrivacyScene.test.tsx; what only a browser gives is the enter/leave pair.
   */
  test("shows the excluded competitor nothing, and restores the beat when the pointer leaves", async ({ page }) => {
    await page.goto(demoUrl("/", "still"))
    await demo(page).scrollIntoViewIfNeeded()
    await expect(demo(page)).toHaveAttribute("data-level", "4")

    await page.getByTestId("priv-buyer-competitor").hover()
    await expect(demo(page)).toHaveAttribute("data-preview", "competitor")
    await expect(demo(page)).toHaveAttribute("data-level", "0")
    await expect(cell(page, "Company name")).toHaveText("No sale record")

    await page.mouse.move(0, 0)
    await expect(demo(page)).toHaveAttribute("data-preview", "")
    await expect(demo(page)).toHaveAttribute("data-level", "4")
    await expect(cell(page, "Company name")).toHaveText("Ridgeline Mechanical Services, Inc.")
  })
})

test.describe("who sees what: the screen holds its shape", () => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [320, 640],
  ] as const) {
    test(`keeps the frame's height through every beat at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto("/")
      await demo(page).scrollIntoViewIfNeeded()

      // The keyboard walks the record open a level at a time; the frame may not grow or shrink as it does,
      // and on a phone it stays inside the fold at every beat.
      let first: number | undefined
      for (const beat of BEATS) {
        await stepDemo(page, "priv-demo", beat)
        await settled(page)
        const now = await frameHeight(page)
        first ??= now
        expect(Math.abs(now - first), `frame height at ${beat}: ${now} vs ${first}`).toBeLessThanOrEqual(2)
        if (width < 1440) expect(now, `frame height at ${beat} inside the fold`).toBeLessThanOrEqual(height - BAR_H)
      }
    })
  }
})

// The narrowest phone keeps the company's name alone, so the frame still stands inside one screen.
for (const [width, height, rows] of [
  [390, 844, 4],
  [320, 640, 1],
] as const) {
  test(`who sees what fits a ${width}x${height} phone with nothing scrolling inside it`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto(demoUrl("/", "still"))
    const frame = page.getByTestId("priv-frame")
    await frame.scrollIntoViewIfNeeded()

    const box = (await frame.boundingBox())!
    expect(box.width).toBeLessThanOrEqual(width)
    expect(box.height).toBeLessThanOrEqual(height - BAR_H)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    expect(await overflowing(page)).toEqual([])

    // The room film steps aside where the record needs the whole width, and the record drops to its compact
    // rows and one log line. (`priv-frame-film` does not exist: this demo's film is the framed room.)
    await expect(page.getByTestId("privacy-room-frame")).toBeHidden()
    await expect(page.getByTestId("company-record").locator("span.type-fine-print")).toHaveCount(rows)
    await expect(page.getByTestId("priv-closing")).toBeHidden()
    await expect(page.getByTestId("priv-log").locator("li")).toHaveCount(1)
  })
}
