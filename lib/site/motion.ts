/**
 * Pure math for motion that scroll progress does not drive: frame-rate independent damping, arrival
 * staggers, pointer offsets, one-shot counters, the speed race, and the turntable drift. Components
 * measure the DOM and write the results; nothing here touches it. The two values every other module's
 * math passes through, `clamp01` and `easeOutCubic`, have their one home here, so `lib/site/scroll.ts`
 * imports them from this module and nothing imports back. Unit-tested in
 * `lib/site/__tests__/motion.test.ts`.
 */

/** Clamp a value into 0..1: the guard every progress and ratio in the site's pure math passes through. */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** The one ease the pure math shares: a cubic settling toward its target, clamped to 0..1 first. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)

/** One frame at 60fps: the unit `rate` is expressed in, and what a loop assumes for its first frame. */
export const FRAME_MS = 1000 / 60

/**
 * Exponential smoothing toward `target`, frame-rate independent: `rate` is the fraction of the remaining
 * distance covered in one 60fps frame, and `dtMs` scales it so a 30fps frame covers twice as much.
 */
export function damp(current: number, target: number, rate: number, dtMs: number): number {
  if (rate >= 1 || (dtMs <= 0 && rate > 0 && dtMs !== 0)) return target
  const frames = Math.max(0, dtMs) / FRAME_MS
  const k = 1 - Math.pow(1 - clamp01(rate), frames)
  return current + (target - current) * k
}

/** Whether a smoothing step has arrived: within `epsilon` of the target. */
export function settled(current: number, target: number, epsilon = 0.05): boolean {
  return Math.abs(target - current) < epsilon
}

/** Arrival delay for the `index`th item of a group, `step` ms apart, never more than `cap` ms. */
export function staggerDelay(index: number, step = 60, cap = 300): number {
  return Math.min(cap, Math.max(0, index) * step)
}

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * The pointer's offset from a rect's centre, scaled so the rect's edges map to ±`max` pixels and clamped
 * there. A rect without area yields no offset.
 */
export function pointerOffset(x: number, y: number, rect: Rect, max: number): { dx: number; dy: number } {
  if (rect.width <= 0 || rect.height <= 0 || max <= 0) return { dx: 0, dy: 0 }
  const u = (x - rect.left) / rect.width - 0.5
  const v = (y - rect.top) / rect.height - 0.5
  const clampUnit = (n: number) => Math.max(-0.5, Math.min(0.5, n))
  return { dx: clampUnit(u) * 2 * max, dy: clampUnit(v) * 2 * max }
}

/** The pointer's position across a rect as 0..1 from the left (and from the top), clamped to the rect. */
export function pointerUnit(x: number, y: number, rect: Rect): { u: number; v: number } {
  if (rect.width <= 0 || rect.height <= 0) return { u: 0.5, v: 0.5 }
  return { u: clamp01((x - rect.left) / rect.width), v: clamp01((y - rect.top) / rect.height) }
}

/** An element whose top edge sits at or beyond the viewport's bottom edge has not been seen yet. */
export function belowFold(top: number, viewportHeight: number): boolean {
  return top >= viewportHeight
}

/** A counter's value at `progress` (0..1) of its run toward `target`, easing out so the last digits settle slowly. */
export function countAt(progress: number, target: number): number {
  return easeOutCubic(progress) * target
}

/* ------------------------------------------------------------------------------------------------
 * The speed race: two runners on two tracks, the same pace, Heirloom's track 60% as long.
 * ---------------------------------------------------------------------------------------------- */

export interface RaceTiming {
  /** How long the traditional sale takes to run its track. */
  runMs: number
  /** How long both runners rest at the end before the tracks clear. */
  holdMs: number
  /** How long the tracks take to fade before the next run. */
  resetMs: number
  /** Heirloom's track as a percentage of the traditional one. */
  heirloomPct: number
}

export const RACE: RaceTiming = { runMs: 6000, holdMs: 1800, resetMs: 500, heirloomPct: 60 }

export interface RaceFrame {
  /** How far along its own track the traditional runner is, 0..1. */
  traditional: number
  /** How far along its own (shorter) track the Heirloom runner is, 0..1. */
  heirloom: number
  phase: "run" | "hold" | "reset"
  /** The tracks' fill opacity: 1 while running and holding, fading to 0 through the reset. */
  opacity: number
}

/** The frame at the end of a run: both runners home, tracks full. Also the reduced-motion still. */
export const RACE_FINAL: RaceFrame = { traditional: 1, heirloom: 1, phase: "hold", opacity: 1 }

/**
 * The race at `elapsedMs` since it began, looping every run + hold + reset. Both runners move at the same
 * pace, so Heirloom reaches the end of its track when the traditional runner is `heirloomPct`% of the way
 * along; then both hold, then the tracks fade and the next run starts from zero.
 */
export function raceFrame(elapsedMs: number, timing: RaceTiming = RACE): RaceFrame {
  const cycle = timing.runMs + timing.holdMs + timing.resetMs
  if (cycle <= 0 || !Number.isFinite(elapsedMs)) return RACE_FINAL
  const t = ((elapsedMs % cycle) + cycle) % cycle
  if (t < timing.runMs) {
    const p = t / timing.runMs
    const share = Math.max(0.01, timing.heirloomPct / 100)
    return { traditional: +p.toFixed(4), heirloom: +Math.min(1, p / share).toFixed(4), phase: "run", opacity: 1 }
  }
  if (t < timing.runMs + timing.holdMs) return { ...RACE_FINAL }
  const r = (t - timing.runMs - timing.holdMs) / Math.max(1, timing.resetMs)
  return { traditional: 1, heirloom: 1, phase: "reset", opacity: +(1 - clamp01(r)).toFixed(4) }
}

/* ------------------------------------------------------------------------------------------------
 * The turntable: an object film that drifts back and forth while nobody is touching it.
 * ---------------------------------------------------------------------------------------------- */

/** Progress of an idle turntable at `elapsedMs`: 0 → 1 over `periodMs`, then back to 0, forever. */
export function turntableDrift(elapsedMs: number, periodMs: number): number {
  if (periodMs <= 0 || !Number.isFinite(elapsedMs)) return 0
  const phase = (((elapsedMs / periodMs) % 2) + 2) % 2
  return +(phase <= 1 ? phase : 2 - phase).toFixed(4)
}

/** The elapsed time at which an ascending drift sits at `progress`, so a drift can resume from where a pointer left it. */
export function turntableElapsedFor(progress: number, periodMs: number): number {
  return clamp01(progress) * Math.max(0, periodMs)
}
