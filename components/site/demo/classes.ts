import { staggerDelay } from "@/lib/site/motion"

/**
 * The one set of motion and meter classes the three home demos share, so a row that arrives, a band that
 * marks the line under discussion and a meter that draws look the same in all three. Sections import from
 * here; nothing in a demo reaches into another section's files.
 *
 * Arrivals are one-shot: re-key the element (a `key` carrying the beat id) to play them again, and give the
 * element nothing else that moves. Under reduced motion every one of them is still.
 */

/** A row arriving: one 0.3s step in. Re-key per beat; stagger siblings by no more than 60ms. */
export const ROW_IN = "animate-row-in motion-reduce:animate-none"

/** A panel arriving: one 0.36s step in, for a pane that replaces another. */
export const STAGE_IN = "animate-stage-in motion-reduce:animate-none"

/** The band that marks the row a demo is on, and the one the idle beat walks: a tint, never a dot or a light. */
export const BAND = "bg-line-soft"

/** The track every meter draws on (3px, the hairline tint). */
export const METER_TRACK = "bg-fg/15 rounded-pill block h-[3px] overflow-hidden"

/** The fill of every meter: the accent, drawn over 500ms, instant under reduced motion. */
export const METER_FILL =
  "bg-accent ease-e1 rounded-pill block h-full transition-[width,opacity] duration-500 motion-reduce:transition-none"

/**
 * The soft re-key of a replay: a figure or a word that changes when the demo comes round again cross-fades to
 * its new value over `DEMO_REKEY_MS` instead of arriving from nothing, so the frame and the words stay put.
 * `duration-240` is `DEMO_REKEY_MS`, asserted in `components/site/__tests__/DemoFrame.test.tsx`.
 */
export const REKEY = "transition-opacity duration-240 ease-e1 motion-reduce:transition-none"

/**
 * The delay a row waits before it arrives, in milliseconds. On the first play rows arrive in order, 60ms
 * apart; on a replay nothing re-staggers from nothing — the values change where they stand, so every row
 * arrives at once and the frame and the words stay put.
 */
export function demoStagger(cycle: number, index: number, step = 60): number {
  return cycle === 0 ? staggerDelay(index, step) : 0
}
