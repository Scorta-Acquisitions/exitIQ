/**
 * Pure math for the scroll-driven scenes. Components measure the DOM; these functions turn a
 * scene progress value (0..1) into the frame each scene should show.
 */

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Progress of a tall sticky scene: 0 when its top reaches the viewport top, 1 when it has scrolled through. */
export function sceneProgress(top: number, height: number, viewportHeight: number): number {
  if (height <= viewportHeight) return 0
  return clamp01(-top / (height - viewportHeight))
}

/** The home privacy scene maps progress to disclosure levels 1–5. */
export function privacyLevel(p: number): number {
  return 1 + Math.max(0, Math.min(4, Math.floor(p * 4.999)))
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

export interface Transform {
  opacity: number
  transform: string
  zIndex?: number
}

export interface MarketFrame {
  letter: Transform
  slips: Array<Transform & { ndaOpacity: number }>
  lois: Transform[]
}

/**
 * The "private market" letter choreography. One inbound letter appears, teaser slips fan out and are
 * filtered, every fourth survivor flips to an NDA face, then four letters of intent land like dealt cards.
 */
export function marketFrame(p: number, width: number, height: number, slipCount: number, loiCount = 4): MarketFrame {
  const wide = width > 760
  const cx = wide ? width * 0.66 : width * 0.5
  const cy = wide ? height * 0.46 : height * 0.68
  const p0 = clamp01(p / 0.16)
  const pm = easeOutCubic(clamp01((p - 0.2) / 0.26))
  const pf = easeOutCubic(clamp01((p - 0.48) / 0.24))
  const po = easeOutCubic(clamp01((p - 0.74) / 0.22))

  const letterOpacity = (p < 0.02 ? 0 : Math.min(1, p0 * 1.4)) * (1 - pm)
  const letter: Transform = {
    opacity: +letterOpacity.toFixed(3),
    transform: `translate(${cx - 100}px,${cy - 70 + (1 - p0) * 70}px) rotate(${-4 + pm * 10}deg) scale(${1 - pm * 0.25})`,
  }

  const slips = Array.from({ length: slipCount }, (_, i) => {
    const surv = i % 4 === 0
    const ang = ((-100 + i * (200 / Math.max(1, slipCount - 1))) * Math.PI) / 180
    const r = pm * (95 + (i % 5) * 46) * (1 - (surv ? 0.45 : 0) * pf)
    const x = cx + Math.cos(ang) * r * 1.25 - 60
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

  const lois = Array.from({ length: loiCount }, (_, j) => {
    const oj = clamp01((po - j * 0.14) / 0.34)
    const fx = cx - 85 + (j - 1.5) * (wide ? 118 : 44)
    const fy = cy - 60 + Math.abs(j - 1.5) * 6 + (1 - oj) * 60
    const rot = (j - 1.5) * 4 * oj
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

export interface MarketStep {
  from: number
  to: number
}

export const MARKET_STEPS: MarketStep[] = [
  { from: 0, to: 0.22 },
  { from: 0.22, to: 0.48 },
  { from: 0.48, to: 0.74 },
  { from: 0.74, to: 1.01 },
]

export function activeStep(p: number, steps: MarketStep[] = MARKET_STEPS): number {
  return steps.findIndex((s) => p >= s.from && p < s.to)
}

/** Veil overlay opacity: the design scales linearly with progress up to `max`. */
export function veilOpacity(p: number, max = 0.22): number {
  return +(p * max).toFixed(3)
}
