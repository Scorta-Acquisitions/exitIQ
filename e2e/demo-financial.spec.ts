import { expect, test } from "@playwright/test"
import {
  demoUrl,
  DESKTOP,
  expectAutoplay,
  expectNoHorizontalScroll,
  expectReplay,
  NARROW_PHONE,
  PHONE,
  stepDemo,
  watchConsole,
} from "./helpers"
import { BAR_H } from "../lib/site/scroll"

/** Every beat of the financial demo, in the order one play runs them. */
const BEATS = ["arrived", "note", "register", "receipts", "invoice", "used"]

const demo = (page: import("@playwright/test").Page) => page.getByTestId("fin-demo")

/** The screen, once every arrival and travel in this section has finished. */
async function settled(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    const section = document.querySelector('[data-testid="fin-section"]')
    return !!section && section.getAnimations({ subtree: true }).every((a) => a.playState !== "running")
  })
}

test.describe("the financial demo", () => {
  test("plays its six beats in order, rests on the settled ledger, and comes round again", async ({ page }) => {
    const console_ = watchConsole(page)
    await page.setViewportSize(DESKTOP)
    await page.goto("/")
    await expectAutoplay(page, "fin-demo", BEATS)
    await expect(demo(page)).toHaveAttribute("data-foot", "845000")
    await expect(page.getByTestId("fin-foot")).toHaveText("$845,000")
    await expect(page.getByTestId("fin-foot-alt")).toHaveText("$817,400 if the family payroll stays in costs")
    await expectReplay(page, "fin-demo", "arrived")
    console_.assertClean()
  })

  /**
   * A real pointer over a settled line, which is what the preview is gated on: the family payroll goes back
   * into costs, the figure and its meter follow, and leaving restores the ledger. The strings the preview
   * writes are pinned by FinancialPrep.test.tsx; the meter's width is a computed style only a browser gives.
   */
  test("the pointer previews the family payroll left in costs, and leaving restores the figure", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto("/")
    await stepDemo(page, "fin-demo", "used")
    const fill = page.getByTestId("fin-fill-ownerComp")
    const supported = (await fill.boundingBox())!.width
    expect(supported, "the settled line's meter is full").toBeGreaterThan(0)

    await page.getByTestId("fin-line-ownerComp").hover()
    await expect(demo(page)).toHaveAttribute("data-preview", "ownerComp")
    await expect(demo(page)).toHaveAttribute("data-foot", "817400")
    await expect(page.getByTestId("fin-foot")).toHaveText("$817,400")
    await expect
      .poll(async () => (await fill.boundingBox())!.width, { message: "the record's meter empties" })
      .toBeLessThanOrEqual(1)

    // Only the family payroll holds an alternative: the one-time item previews nothing and releases the figure.
    await page.getByTestId("fin-line-oneoff").hover()
    await expect.poll(() => demo(page).getAttribute("data-preview"), { message: "the preview is released" }).toBeNull()
    await expect(demo(page)).toHaveAttribute("data-foot", "845000")
    await expect(page.getByTestId("fin-foot")).toHaveText("$845,000")
    await expect
      .poll(async () => (await fill.boundingBox())!.width, { message: "and fills again" })
      .toBeGreaterThanOrEqual(supported - 1)
  })

  test("the pointer resting on the screen pauses the play, and leaving resumes it", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto("/")
    await demo(page).scrollIntoViewIfNeeded()
    await demo(page).hover()
    await expect(demo(page)).toHaveAttribute("data-demo-state", "paused")
    const held = await demo(page).getAttribute("data-beat")
    await page.mouse.move(2, 2)
    await expect
      .poll(() => demo(page).getAttribute("data-beat"), { message: "the demo should play on after the pointer left" })
      .not.toBe(held)
  })

  test("the keyboard reaches the screen, steps it, and speaks where it landed", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto(demoUrl("/", "fin:arrived"))
    await demo(page).focus()
    await expect(demo(page)).toBeFocused()
    await demo(page).press("ArrowRight")
    await expect(demo(page)).toHaveAttribute("data-beat", "note")
    await expect(demo(page).locator("[aria-live='polite']")).toHaveText("Revenue timing, explained by a one-page note")
    await demo(page).press("ArrowLeft")
    await expect(demo(page)).toHaveAttribute("data-beat", "arrived")
    await demo(page).press("End")
    await expect(demo(page)).toHaveAttribute("data-beat", "used")
  })

  test("a still URL freezes the demo on its settled ledger", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto(demoUrl("/", "still"))
    await expect(demo(page)).toHaveAttribute("data-demo-state", "still")
    await expect(demo(page)).toHaveAttribute("data-beat", "used")
    await expect(page.getByTestId("fin-foot")).toHaveText("$845,000")
  })

  for (const vp of [PHONE, NARROW_PHONE]) {
    test(`fits ${vp.width}×${vp.height} with nothing scrolling inside it`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto(demoUrl("/", "still"))
      const frame = page.getByTestId("fin-frame")
      await frame.scrollIntoViewIfNeeded()
      await settled(page)
      await expectNoHorizontalScroll(page, `financial demo at ${vp.width}`)

      const box = await frame.boundingBox()
      expect(box, "the frame should have a box").not.toBeNull()
      expect(box!.height, `frame height at ${vp.width}`).toBeLessThanOrEqual(vp.height - BAR_H)

      const overflowing = await page.evaluate(() => {
        const section = document.querySelector('[data-testid="fin-section"]')
        if (!section) throw new Error("no financial section")
        const name = (el: Element) => `${el.tagName}#${(el as HTMLElement).dataset.testid ?? ""}`
        const bad: string[] = []
        for (const el of Array.from(section.querySelectorAll("*"))) {
          const style = getComputedStyle(el)
          // A finished `animate-row-in` leaves Chromium's scrollWidth 6px past the client width for good, so
          // sideways overflow is read from the overflow style and the children's own boxes, never the width.
          if (/auto|scroll/.test(style.overflowX) && el.scrollWidth > el.clientWidth) bad.push(`scroller: ${name(el)}`)
          if (style.overflowX === "hidden") {
            const box = el.getBoundingClientRect()
            for (const child of Array.from(el.children)) {
              const rect = child.getBoundingClientRect()
              if (rect.width > 0 && (rect.right > box.right + 1 || rect.left < box.left - 1))
                bad.push(`clipped: ${name(child)}`)
            }
          }
          // Downwards there is no such travel: a box taller than the one it sits in is text cut off.
          if (el.scrollHeight > el.clientHeight + 1) bad.push(`clipped down: ${name(el)}`)
        }
        return bad
      })
      expect(overflowing, "nothing in the section may scroll or clip inside itself").toEqual([])

      // The film is a desktop material: on a phone the screen needs its whole width.
      await expect(page.getByTestId("fin-frame-film")).toBeHidden()
      const link = page.getByTestId("fin-section").getByRole("link")
      expect((await link.boundingBox())!.height, "the section's link is a 44px target").toBeGreaterThanOrEqual(44)
    })
  }
})
