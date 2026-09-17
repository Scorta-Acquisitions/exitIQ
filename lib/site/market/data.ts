/**
 * The "private market" scene on the home page: every word it prints on paper or beside it, and the four
 * steps with the window of scene progress each one is active for. The letters of intent are the same
 * fictional Project Ridgeline letters the offer comparison shows, printed as a mailed page would be
 * (the capitals are typed, so no component carries an `uppercase` class). The rendering is pinned in
 * `components/site/__tests__/MarketScene.test.tsx`; the step windows in `lib/site/__tests__/scroll.test.ts`.
 */

import type { MarketStep } from "@/lib/site/scroll"

/** The section's words: the eyebrow, the headline and the one paragraph under them, then the step link. */
export const MARKET_COPY = {
  eyebrow: "A private market for your business",
  heading: "Several buyers compete privately.",
  body: "We find and qualify several buyers for your business and run the process privately. You compare their offers instead of negotiating with whoever approached you.",
  link: "See how it works →",
  /**
   * Shown only under reduced motion. The scene renders no controls, so the note says only what is true:
   * this is the same information as a still (the clause that promised controls was cut, 2026-09-17).
   */
  stillNote: "The same information, shown without animation.",
} as const

/** The inbound letter that opens the scene: one buyer, one number, arriving by mail. */
export const MARKET_LETTER = {
  from: "BY MAIL · TO THE OWNER",
  quoteBefore: '"We are prepared to offer ',
  /** The number the one buyer names. A round figure on a mailed page, not one of the four letters' prices. */
  amount: "$4.1M",
  quoteAfter: ' for your business…"',
  foot: "ONE BUYER · ONE NUMBER",
} as const

/** The anonymous teaser slip that fans out, and the NDA face every fourth slip flips to. */
export const MARKET_SLIP = {
  title: "PROJECT RIDGELINE",
  note: "ANONYMOUS TEASER · NO NAME",
  ndaBadge: "NDA SIGNED",
  ndaNote: "IDENTITY RELEASED · LEVEL 2",
} as const

/** A slip's line once its buyer has signed: the buyer's own id, ticked. */
export function marketNdaLine(id: string): string {
  return `${id} ✓`
}

export interface MarketLoi {
  tag: string
  amount: string
  who: string
  badge?: string
}

/** The four letters of intent dealt at the end of the scene, in the letters' own order. */
export const MARKET_LOIS: MarketLoi[] = [
  { tag: "LETTER OF INTENT · A", amount: "$4.30M", who: "REGIONAL ACQUIRER" },
  { tag: "LETTER OF INTENT · B", amount: "$4.55M", who: "INDIVIDUAL BUYER" },
  {
    tag: "LETTER OF INTENT · C",
    amount: "$4.05M",
    who: "INVESTMENT GROUP · COMMITTED FINANCING",
    badge: "MOST CERTAIN",
  },
  { tag: "LETTER OF INTENT · D", amount: "$4.65M", who: "STRATEGIC ACQUIRER", badge: "HIGHEST HEADLINE" },
]

export interface MarketSceneStep extends MarketStep {
  title: string
  body: string
}

/**
 * The four steps beside the paper: the words and the window of scene progress each is active for, as one
 * dataset (`activeStep` in lib/site/scroll.ts reads the windows, the scene renders the words). The last
 * window runs past 1 so the closing step stays lit while the scene finishes scrolling through.
 */
export const MARKET_STEPS: MarketSceneStep[] = [
  {
    from: 0,
    to: 0.22,
    title: "Inbound offer",
    body: "A single buyer names the price and the terms.",
  },
  {
    from: 0.22,
    to: 0.48,
    title: "Buyer research",
    body: "We research acquirers, investment groups, and individuals that fit the business.",
  },
  {
    from: 0.48,
    to: 0.74,
    title: "NDA and qualification",
    body: "Buyers sign an NDA and show financing before seeing sensitive records.",
  },
  {
    from: 0.74,
    to: 1.01,
    title: "Offer comparison",
    body: "We compare the economics, buyer fit, and closing risk of each offer.",
  },
]
