import { describe, expect, it } from "vitest"
import {
  BAR_CONDENSE_AT,
  BAR_EXPAND_AT,
  CLUSTER_RESERVE,
  CONTEXT_LOCKUP_FROM,
  CURRENT_SECTION_OFFSET,
  currentSection,
  HOME_LOCKUP_FROM,
  LOCKUP_WIDTH,
  NAV_WIDTH,
  nextBarState,
  pageProgress,
  PHONE_LOCKUP_FROM,
  WIDEST_CLUSTER,
} from "@/lib/site/bar"
import { BAR_H } from "@/lib/site/scroll"

describe("bar math", () => {
  it("condenses at 44px and expands again only at 16px and under", () => {
    expect(BAR_CONDENSE_AT).toBe(44)
    expect(BAR_EXPAND_AT).toBe(16)
    expect(nextBarState("landing", 43)).toBe("landing")
    expect(nextBarState("landing", 44)).toBe("scrolled")
    expect(nextBarState("scrolled", 17)).toBe("scrolled")
    expect(nextBarState("scrolled", 16)).toBe("landing")
    expect(nextBarState("scrolled", 30)).toBe("scrolled")
    expect(nextBarState("landing", 30)).toBe("landing")
    expect(nextBarState("scrolled", 0)).toBe("landing")
    expect(nextBarState("landing", 2000)).toBe("scrolled")
  })

  it("names the current section as the last one whose top sits within 24px under the bar, or none", () => {
    expect(CURRENT_SECTION_OFFSET).toBe(24)
    const limit = BAR_H + CURRENT_SECTION_OFFSET
    expect(limit).toBe(76)
    const at = (a: number, b: number, c: number) => [
      { href: "#a", top: a },
      { href: "#b", top: b },
      { href: "#c", top: c },
    ]
    expect(currentSection(at(400, 900, 1400), limit)).toBeNull()
    expect(currentSection(at(77, 900, 1400), limit)).toBeNull()
    expect(currentSection(at(76, 900, 1400), limit)).toBe("#a")
    expect(currentSection(at(-300, 68, 900), limit)).toBe("#b")
    expect(currentSection(at(-900, -300, 76), limit)).toBe("#c")
    expect(currentSection([], limit)).toBeNull()
  })

  it("reads page progress as scrollY over the document's travel, clamped, and 0 when nothing scrolls", () => {
    expect(pageProgress(0, 3000, 1000)).toBe(0)
    expect(pageProgress(500, 3000, 1000)).toBe(0.25)
    expect(pageProgress(2000, 3000, 1000)).toBe(1)
    expect(pageProgress(2600, 3000, 1000)).toBe(1)
    expect(pageProgress(100, 800, 1000)).toBe(0)
    expect(pageProgress(100, 1000, 1000)).toBe(0)
  })

  it("derives the brand thresholds from the measured widths: the lockup's, the navigation's and the widest cluster's", () => {
    // The mark 27.29 + the 6px gap + the word Heirloom 102.61 (Mona Sans 450, width 90, 27.5px): 135.9 by the rule, 135.89 in Chromium.
    expect(LOCKUP_WIDTH).toBe(135.9)
    expect(NAV_WIDTH).toBe(366.95)
    // /why reading "Why Heirloom · How businesses sell today" (232.28) + the 20px gap + its advisor pill (118.03).
    expect(WIDEST_CLUSTER).toBe(370.31)
    // Home: both clusters fit their equal shares, so the first column is (W − 48 insets − 48 gaps − nav) / 2. That
    // reaches the lockup at 734.75, under the 834px nav breakpoint: the threshold never applies on a desktop.
    expect(HOME_LOCKUP_FROM).toBe(Math.ceil(96 + NAV_WIDTH + 2 * LOCKUP_WIDTH))
    expect(HOME_LOCKUP_FROM).toBe(735)
    expect(HOME_LOCKUP_FROM).toBeLessThan(834)
    // A page with context: the widest cluster takes its column first, the first column holds what is left.
    expect(CONTEXT_LOCKUP_FROM).toBe(Math.ceil(96 + NAV_WIDTH + WIDEST_CLUSTER + LOCKUP_WIDTH))
    expect(CONTEXT_LOCKUP_FROM).toBe(970)
    expect(CONTEXT_LOCKUP_FROM).toBeGreaterThan(834)
    // A phone row with no pill: the inset, the lockup, the 8px gap, the 44px menu button, the inset: 235.9, under
    // the narrowest phone (320), so the phone threshold never applies either.
    expect(PHONE_LOCKUP_FROM).toBe(Math.ceil(24 + LOCKUP_WIDTH + 8 + 44 + 24))
    expect(PHONE_LOCKUP_FROM).toBe(236)
    expect(PHONE_LOCKUP_FROM).toBeLessThan(320)
    // The desktop cluster's cap: everything the row holds beside it at its narrowest.
    expect(CLUSTER_RESERVE).toBe(24 + 28 + 24 + NAV_WIDTH + 24 + 24)
    expect(CLUSTER_RESERVE).toBe(490.95)
    // Under this width even the mark, the navigation and the widest cluster cannot all stand whole.
    expect(Math.ceil(CLUSTER_RESERVE + WIDEST_CLUSTER)).toBe(862)
  })
})
