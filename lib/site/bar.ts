/**
 * The one sticky bar's pure math and measured widths: the two scroll thresholds it flips its material at,
 * the current section and the page's reading rule, and the seven widths the brand rules are derived from.
 * The bar itself measures the DOM; nothing here touches it. Unit-tested in `lib/site/__tests__/bar.test.ts`.
 */

import { clamp01 } from "@/lib/site/motion"

/** `scrolled` from this scrollY, `landing` again at `BAR_EXPAND_AT` and under. */
export const BAR_CONDENSE_AT = 44
export const BAR_EXPAND_AT = 16
/** A section is current while its top sits within this many px under the bar (an anchor lands at bar + 16). */
export const CURRENT_SECTION_OFFSET = 24

export type BarState = "landing" | "scrolled"

/** The bar's state after reading `scrollY`, with hysteresis so a bounce at the top never flickers it. */
export function nextBarState(current: BarState, scrollY: number): BarState {
  if (current === "landing") return scrollY >= BAR_CONDENSE_AT ? "scrolled" : "landing"
  return scrollY <= BAR_EXPAND_AT ? "landing" : "scrolled"
}

/** The last section whose top is at or above `limit` (viewport px), or null before the first. */
export function currentSection(sections: Array<{ href: string; top: number }>, limit: number): string | null {
  let current: string | null = null
  sections.forEach((s) => {
    if (s.top <= limit) current = s.href
  })
  return current
}

/** How far through the document the visitor is, 0..1. */
export function pageProgress(scrollY: number, scrollHeight: number, innerHeight: number): number {
  const travel = scrollHeight - innerHeight
  return travel <= 0 ? 0 : clamp01(scrollY / travel)
}

/** The navigation's width with fonts loaded, px (three groups and For buyers at their 28px gaps). */
export const NAV_WIDTH = 366.95
/** The lockup's width at the bar's 28px mark, px (`lockupMetrics("horizontal", 28).width`; Chromium reads 135.89). */
export const LOCKUP_WIDTH = 135.9
/** The widest action cluster on the site, px: /why's scrubber at its longest reading (232.28), the 20px gap, its pill (118.03). */
export const WIDEST_CLUSTER = 370.31
/**
 * What the row holds beside the desktop cluster at its narrowest, px: the insets, the mark, the two grid gaps and
 * the navigation. The cluster's cap is `max-w-[calc(100vw-490.95px)]` (a literal, the guard scans classes), so under
 * 862px the scrubber's label truncates instead of the grid overflowing.
 */
export const CLUSTER_RESERVE = 24 + 28 + 24 + NAV_WIDTH + 24 + 24
/**
 * The home row holds the lockup from this viewport width: 48 + 48 + NAV_WIDTH + 2 × LOCKUP_WIDTH = 734.75. Below the
 * 834px nav breakpoint, so it never applies: home and the 404 show the lockup at every desktop width, and no class
 * carries it.
 */
export const HOME_LOCKUP_FROM = 735
/** A page with context holds the lockup from this viewport width: 96 + NAV_WIDTH + WIDEST_CLUSTER + LOCKUP_WIDTH = 969.16. */
export const CONTEXT_LOCKUP_FROM = 970
/**
 * A phone row with no pill holds the lockup from this viewport width: 24 + LOCKUP_WIDTH + 8 + 44 + 24 = 235.9. Below
 * the narrowest phone the site lays out for (320), so it never applies and no class carries it.
 */
export const PHONE_LOCKUP_FROM = 236
