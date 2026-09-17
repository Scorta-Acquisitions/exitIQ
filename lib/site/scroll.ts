/**
 * Pure math for the scroll-driven scenes. Components measure the DOM; these functions turn a
 * scene progress value (0..1) into the frame each scene should show.
 */

import { clamp01, easeOutCubic } from "@/lib/site/motion"

/**
 * The bar's condensed height in px: the one constant every pin, anchor and scene measure reads. It must equal
 * `--bar-h` in styles/site.css (a unit test holds the two together). Any taller state the bar has exists
 * only near the top of the page, so scenes always pin against this height.
 */
export const BAR_H = 52

/**
 * Progress of a tall sticky scene whose panel pins under a bar `barHeight` px tall: 0 when its top reaches
 * the bar's bottom edge, 1 when the scene has scrolled through. The panel is the viewport minus the bar, so
 * the travel is `height - (viewportHeight - barHeight)`; a scene no taller than the panel is static.
 */
export function sceneProgress(top: number, height: number, viewportHeight: number, barHeight = 0): number {
  const panel = viewportHeight - barHeight
  if (height <= panel) return 0
  return clamp01((barHeight - top) / (height - panel))
}

/** The `tab` breakpoint from styles/site.css, as a number the scene math can test. */
export const TAB_BREAKPOINT = 736
/**
 * The PANEL budget a phone needs to pin a home scene: the viewport minus the bar must be at least this tall.
 * The `tall` custom variant in styles/site.css is derived from it (`TALL_MIN_HEIGHT + BAR_H` = 832px; a unit
 * test holds the two together), so the CSS and the math agree on which phones pin.
 */
export const TALL_MIN_HEIGHT = 780

/**
 * Whether a home scene pins its panel at this viewport: from the tablet breakpoint, or on a phone whose
 * panel under the bar meets the budget (390×844 pins: 844 − 52 = 792 ≥ 780; 320×640 flows). A short phone
 * cannot hold a scene's copy and its stage in one panel, so there the scene flows instead
 * (`tab:scene-pin tall:max-tab:scene-pin` in the components) and its progress comes from `flowProgress`.
 */
export function scenePins(width: number, viewportHeight: number): boolean {
  return width >= TAB_BREAKPOINT || viewportHeight - BAR_H >= TALL_MIN_HEIGHT
}

/**
 * The window of scrolling over which a flowing (unpinned) scene plays, in viewport heights: it starts when
 * the scene's top is `start` viewport heights below the viewport's top and runs for `travel` viewport
 * heights. Anchoring the window to the viewport rather than the scene's own height matters: a flowing
 * scene's height changes with its state (a longer value wraps, a step body unfolds), and progress measured
 * against that height would feed back into the state at every boundary.
 */
export interface FlowWindow {
  start: number
  travel: number
}
/** The market scene flowing on a short phone: its 400px paper band follows about 480px of copy, so the choreography plays while the band crosses the viewport. */
export const MARKET_FLOW: FlowWindow = { start: 0.25, travel: 1 }

export function flowProgress(top: number, viewportHeight: number, window: FlowWindow): number {
  if (viewportHeight <= 0 || window.travel <= 0) return 0
  return clamp01((viewportHeight * window.start - top) / (viewportHeight * window.travel))
}

/**
 * The market scene's progress: the pinned panel's travel under the bar where the panel pins (tablet up, or a
 * tall phone), and a viewport-anchored window (`MARKET_FLOW`) where the scene flows, so the unfolding step
 * body can never feed back into the step.
 */
export function marketProgress(top: number, height: number, viewportHeight: number, width: number): number {
  return scenePins(width, viewportHeight)
    ? sceneProgress(top, height, viewportHeight, BAR_H)
    : flowProgress(top, viewportHeight, MARKET_FLOW)
}

/**
 * Progress of a film that reveals as its frame scrolls into view (the close): 0 while its top is still
 * below the viewport, 1 once its bottom has risen to 65% of the viewport height, so the last frame is
 * on screen with room beneath it for what comes next.
 */
export function revealProgress(top: number, height: number, viewportHeight: number): number {
  const travel = height + viewportHeight * 0.35
  if (travel <= 0) return 0
  return clamp01((viewportHeight - top) / travel)
}

export const STAGE_COUNT = 8

export interface StageFrame {
  idx: number
  local: number
  /** Number of "in your hands" artifacts that have been delivered. */
  artifactsDelivered: number
  hintVisible: boolean
  railPercent: number
}

export function stageFrame(p: number): StageFrame {
  const f = Math.max(0, Math.min(0.9999, p)) * STAGE_COUNT
  const idx = Math.floor(f)
  const local = f - idx
  return {
    idx,
    local,
    artifactsDelivered: idx + (local > 0.82 ? 1 : 0),
    hintVisible: p < 0.03,
    railPercent: p * 100,
  }
}

interface Transform {
  opacity: number
  transform: string
  zIndex?: number
}

export interface MarketFrame {
  letter: Transform
  slips: Array<Transform & { ndaOpacity: number }>
  lois: Transform[]
}

/** A stage at least this wide (the `tab` breakpoint) plays the paper across the whole panel; narrower stages are the phone band. */
export const MARKET_WIDE_MIN = 736
/** The width the fan's radii were drawn for; a narrow stage scales the fan by its share of it. */
const FAN_DESIGN_WIDTH = 760
/**
 * Paper sizes on a narrow stage, matching MarketScene's phone classes, so the fan can be kept inside the band:
 * a 120px slip whose NDA face overhangs it by 13px a side, and 150px letters of intent dealt as a two-by-two
 * hand whose first row is 132px tall and whose second (the badged letters, whose lines wrap) is 220px.
 */
export const MARKET_NARROW = {
  slipWidth: 120,
  ndaOverhang: 13,
  loiWidth: 150,
  loiRow: 132,
  loiTallRow: 220,
  gap: 10,
  edge: 8,
} as const

const clampTo = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * The "private market" letter choreography. One inbound letter appears, teaser slips fan out and are
 * filtered, every fourth survivor flips to an NDA face, then four letters of intent land like dealt cards.
 * A wide stage (the tablet breakpoint up) anchors the play at (66%, 46%) and fans the letters of intent
 * 118px apart. A narrow stage (the phone band) centres it, scales the fan by `width / 760`, clamps every
 * slip so it and its NDA face stay inside the band, and deals the four letters as a two-by-two hand
 * resting 8px above the band's bottom edge, clear of the copy above (its top never above 4px), each rising
 * 60px onto its mark.
 */
export function marketFrame(p: number, width: number, height: number, slipCount: number, loiCount = 4): MarketFrame {
  const wide = width >= MARKET_WIDE_MIN
  const k = wide ? 1 : Math.min(1, width / FAN_DESIGN_WIDTH)
  const cx = wide ? width * 0.66 : width * 0.5
  const cy = wide ? height * 0.46 : height * 0.5
  const p0 = clamp01(p / 0.16)
  const pm = easeOutCubic(clamp01((p - 0.2) / 0.26))
  const pf = easeOutCubic(clamp01((p - 0.48) / 0.24))
  const po = easeOutCubic(clamp01((p - 0.74) / 0.22))

  const letterOpacity = (p < 0.02 ? 0 : Math.min(1, p0 * 1.4)) * (1 - pm)
  const letter: Transform = {
    opacity: +letterOpacity.toFixed(3),
    transform: `translate(${cx - 100}px,${cy - 70 + (1 - p0) * 70}px) rotate(${-4 + pm * 10}deg) scale(${1 - pm * 0.25})`,
  }

  const { slipWidth, ndaOverhang, loiWidth, loiRow, loiTallRow, gap, edge } = MARKET_NARROW
  const slipInset = edge + ndaOverhang
  const slips = Array.from({ length: slipCount }, (_, i) => {
    const surv = i % 4 === 0
    const ang = ((-100 + i * (200 / Math.max(1, slipCount - 1))) * Math.PI) / 180
    const r = pm * (95 + (i % 5) * 46) * k * (1 - (surv ? 0.45 : 0) * pf)
    let x = cx + Math.cos(ang) * r * 1.25 - 60
    if (!wide) x = clampTo(x, slipInset, width - slipWidth - slipInset)
    let y = cy + Math.sin(ang) * r * 0.8 - 30 - pm * 8
    let rot = Math.cos(ang) * 14 * pm + ((i % 3) - 1) * 3
    let o = pm
    if (!surv) {
      y += pf * pf * height * 0.55
      rot += pf * 55
      o *= 1 - pf
    } else {
      o *= 1 - po
    }
    return {
      opacity: +Math.max(0, o).toFixed(3),
      transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`,
      ndaOpacity: +(surv ? pf : 0).toFixed(3),
    }
  })

  const handTop = Math.max(4, height - (loiRow + gap + loiTallRow) - edge)
  const lois = Array.from({ length: loiCount }, (_, j) => {
    const oj = clamp01((po - j * 0.14) / 0.34)
    const rise = (1 - oj) * 60
    let fx: number
    let fy: number
    let rot: number
    if (wide) {
      fx = cx - 85 + (j - 1.5) * 118
      fy = cy - 60 + Math.abs(j - 1.5) * 6 + rise
      rot = (j - 1.5) * 4 * oj
    } else {
      const col = j % 2
      fx = clampTo(cx - loiWidth - gap / 2 + col * (loiWidth + gap), 4, width - loiWidth - 4)
      fy = handTop + (j >> 1) * (loiRow + gap) + rise
      rot = (col - 0.5) * 3 * oj
    }
    return {
      opacity: +oj.toFixed(3),
      transform: `translate(${fx.toFixed(1)}px,${fy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`,
      zIndex: j === 2 ? 5 : 3 - Math.abs(j - 2),
    }
  })

  return { letter, slips, lois }
}

/** Buyer slip ids shown on the fanned teaser cards. */
export function marketSlipIds(count = 18): string[] {
  return Array.from({ length: count }, (_, i) => "BUYER " + String((11 + i * 23) % 87).padStart(3, "0"))
}

/** One step's window of the market scene's progress: it is the active step from `from` until `to`. */
export interface MarketStep {
  from: number
  to: number
}

/** Which step a progress value falls in, or -1 past the last window. The windows are `MARKET_STEPS` (market/data.ts). */
export function activeStep(p: number, steps: readonly MarketStep[]): number {
  return steps.findIndex((s) => p >= s.from && p < s.to)
}

/**
 * A film's scroll parallax inside a pinned scene: it drifts `travel`% of its height against the scroll
 * (down at the start, up at the end) and is scaled up just enough to keep its edges covered while it does.
 * Transform only, so the compositor carries it.
 */
export function filmParallax(p: number, travel = 3): string {
  const shift = (0.5 - clamp01(p)) * 2 * travel
  const scale = 1 + (travel * 2) / 100
  return `translate3d(0,${shift.toFixed(2)}%,0) scale(${scale.toFixed(3)})`
}
