/**
 * The demo clock: the pure math behind the three home demos. A demo is a script of beats — named moments
 * measured in milliseconds from the start of a play — that the section renders one at a time. Nothing here
 * touches the DOM or the clock: `useDemoClock` owns the one requestAnimationFrame per section and reads its
 * frame from `demoFrameAt`.
 *
 * The client asked for constant movement, so a play does not stop at the last beat: the demo holds its end
 * state for `DEMO_HOLD_MS`, then replays from the first beat with a soft re-key (`DEMO_REKEY_MS`), counting
 * the plays in `DemoFrame.cycle`. Unit-tested in `lib/site/__tests__/demo-clock.test.ts`.
 */

/** The testid and query-string prefix of each demo: financial · privacy · decisions. */
export type DemoPrefix = "fin" | "priv" | "dec"

/** One named moment of a demo, `at` milliseconds from the start of a play. The first beat is always at 0. */
export interface DemoBeat {
  id: string
  at: number
  /** What a keyboard step announces in the live region; the position line is spoken when it is absent. */
  say?: string
}

/** A demo's whole script: its beats in order, the beat the still renders, and the name assistive tech reads. */
export interface DemoScript {
  prefix: DemoPrefix
  beats: DemoBeat[]
  /** The beat `?demo=still` and reduced motion render: the demo's finished state. */
  still: string
  /** The accessible name of the demo's root ("Financial preparation, a worked example that plays itself"). */
  label: string
}

/** How long a finished demo holds its end state before it replays from the first beat. */
export const DEMO_HOLD_MS = 8000

/** How long a value takes to cross-fade or count to its new figure when a replay re-keys it. */
export const DEMO_REKEY_MS = 240

/** The share of a demo that must be on screen before its clock advances. */
export const DEMO_VISIBLE_RATIO = 0.3

/** How often the idle band steps down the rows of a demo that has reached its end state. */
export const DEMO_IDLE_MS = 2400

/** The last beat of a script; scripts are never empty, but a defensive fallback keeps the callers total. */
const FALLBACK_BEAT: DemoBeat = { id: "", at: 0 }

function beatAtIndex(index: number, s: DemoScript): DemoBeat {
  return s.beats[index] ?? s.beats[0] ?? FALLBACK_BEAT
}

/** How long one play of the script runs: the last beat's mark. */
export function demoDuration(s: DemoScript): number {
  return s.beats.length === 0 ? 0 : beatAtIndex(s.beats.length - 1, s).at
}

/** The index of the last beat whose mark has passed; 0 before the first beat and for an empty script. */
export function beatIndexAt(elapsedMs: number, s: DemoScript): number {
  if (!Number.isFinite(elapsedMs)) return 0
  let index = 0
  for (let i = 0; i < s.beats.length; i++) {
    if (beatAtIndex(i, s).at <= elapsedMs) index = i
    else break
  }
  return index
}

/** The id of the beat at `index`, clamped into the script. */
export function beatIdAt(index: number, s: DemoScript): string {
  return beatAtIndex(clampIndex(index, s), s).id
}

/** The index of the beat with this id, or -1 when the script has no such beat. */
export function indexOfBeat(id: string, s: DemoScript): number {
  return s.beats.findIndex((b) => b.id === id)
}

/** `index` moved `delta` beats and clamped to the script, so a keyboard step never falls off either end. */
export function stepIndex(index: number, delta: number, s: DemoScript): number {
  return clampIndex(index + delta, s)
}

function clampIndex(index: number, s: DemoScript): number {
  const last = Math.max(0, s.beats.length - 1)
  if (!Number.isFinite(index)) return 0
  return Math.max(0, Math.min(last, Math.trunc(index)))
}

/** What a keyboard step speaks: the beat's own words, or its place in the script. */
export function beatAnnouncement(index: number, s: DemoScript): string {
  const i = clampIndex(index, s)
  const beat = beatAtIndex(i, s)
  return beat.say ?? `Step ${i + 1} of ${s.beats.length}`
}

/** Where a demo stands at `elapsedMs`: which beat, which play, and whether the play has finished. */
export interface DemoFrame {
  index: number
  beat: string
  /** Plays completed before this one: 0 for the first play, 1 after the first replay. */
  cycle: number
  /** True through the hold after the last beat, where the demo rests before replaying. */
  ended: boolean
}

/** Whether two frames describe the same moment, so a render can be skipped. */
export function sameDemoFrame(a: DemoFrame, b: DemoFrame): boolean {
  return a.index === b.index && a.cycle === b.cycle && a.ended === b.ended && a.beat === b.beat
}

/**
 * The demo's frame `elapsedMs` after the first play began. Each play runs the beats, then holds its end state
 * for `holdMs`; the next play starts from the first beat with the cycle counter one higher. A hold of zero (or
 * less) never replays: the demo rests on its last beat for good.
 */
export function demoFrameAt(elapsedMs: number, s: DemoScript, holdMs = DEMO_HOLD_MS): DemoFrame {
  const duration = demoDuration(s)
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0
  const cycleMs = duration + Math.max(0, holdMs)
  if (holdMs <= 0 || cycleMs <= 0) {
    const index = beatIndexAt(elapsed, s)
    return { index, beat: beatIdAt(index, s), cycle: 0, ended: elapsed >= duration }
  }
  const cycle = Math.floor(elapsed / cycleMs)
  const t = elapsed - cycle * cycleMs
  const index = beatIndexAt(t, s)
  return { index, beat: beatIdAt(index, s), cycle, ended: t >= duration }
}

/** The elapsed time at which a play stands on beat `index` of cycle `cycle`: where a keyboard step resumes from. */
export function elapsedForIndex(index: number, s: DemoScript, cycle = 0, holdMs = DEMO_HOLD_MS): number {
  const cycleMs = demoDuration(s) + Math.max(0, holdMs)
  const base = holdMs <= 0 ? 0 : Math.max(0, cycle) * cycleMs
  return base + beatAtIndex(clampIndex(index, s), s).at
}

/**
 * Whether enough of the demo is on screen for its clock to run. A panel taller than the viewport can never
 * reach `threshold` of itself, so it counts as visible once it fills nine tenths of what it can: the demo on a
 * 320px phone runs like the one on a desktop. A panel reported entirely off screen never runs.
 */
export function demoVisible(
  ratio: number,
  height: number,
  viewportHeight: number,
  threshold = DEMO_VISIBLE_RATIO
): boolean {
  if (!(ratio > 0)) return false
  if (ratio >= threshold) return true
  if (height <= 0 || viewportHeight <= 0) return false
  const reach = viewportHeight / height
  return reach < threshold && ratio >= reach * 0.9
}

/**
 * The beat a URL freezes this demo on, for a screenshot or an end-to-end assertion: `?demo=still` stills every
 * demo on its own `still` beat, and `?demo=fin:note,dec:offers` stills the named demos on the named beats.
 * An absent parameter, another demo's prefix, or a beat this script does not have yields null (it plays).
 */
export function demoStillFor(search: string, s: DemoScript): string | null {
  if (!search) return null
  const raw = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("demo")
  if (!raw) return null
  if (raw.trim() === "still") return s.still
  for (const part of raw.split(",")) {
    const [prefix, id] = part.split(":")
    if (prefix?.trim() !== s.prefix) continue
    const beat = id?.trim() ?? ""
    if (indexOfBeat(beat, s) >= 0) return beat
  }
  return null
}

/**
 * The longest run of `wanted` that a recorded beat sequence played in order: equal to `wanted` once the demo
 * has played all of it. A beat recorded twice in a row costs nothing (the run carries on from where it was),
 * a beat that never arrives ends the run there, and an empty recording matches nothing.
 */
export function beatsPlayedInOrder(seen: readonly string[], wanted: readonly string[]): string[] {
  const matched: string[] = []
  for (const beat of seen) {
    if (beat === wanted[matched.length]) matched.push(beat)
  }
  return matched
}
