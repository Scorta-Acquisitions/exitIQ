/**
 * The hero console is a short funnel: choose a path, answer up to two questions, land on a result.
 * This module holds the stage graph and the copy for each stage; the reducer applies transitions.
 */

export type HeroStage = "route" | "sellQ1" | "sellQ2" | "sellDone" | "offer" | "ready"
export type HeroPath = "sell" | "offer" | "ready"
export type SellTiming = "now" | "mid" | "explore"
export type SellRevenue = "u1" | "1-3" | "3-10" | "10+"

export const STAGE_PROGRESS_LABEL: Record<HeroStage, string> = {
  route: "",
  sellQ1: "QUESTION 1 OF 2",
  sellQ2: "QUESTION 2 OF 2",
  sellDone: "YOUR RESULT",
  offer: "FREE OFFER REVIEW",
  ready: "EXITIQ",
}

/** Instrument-field intensity per stage for the restored console (the `ready` stage uses the live exitIQ confidence instead). */
export const STAGE_INTENSITY: Record<Exclude<HeroStage, "ready">, number> = {
  route: 0.1,
  sellQ1: 0.35,
  sellQ2: 0.55,
  sellDone: 0.85,
  offer: 0.5,
}

export function pathForStage(stage: HeroStage): HeroPath {
  if (stage === "offer") return "offer"
  if (stage === "ready") return "ready"
  return "sell"
}

export interface HeroOption {
  k: HeroPath
  num: string
  title: string
  sub: string
  stage: HeroStage
}

export const HERO_OPTIONS: HeroOption[] = [
  {
    k: "sell",
    num: "01",
    title: "I want to sell",
    sub: "A full private sale.",
    stage: "sellQ1",
  },
  {
    k: "offer",
    num: "02",
    title: "I already have a buyer or offer",
    sub: "A free review of the offer before you sign.",
    stage: "offer",
  },
  {
    k: "ready",
    num: "03",
    title: "I'm not sure I'm ready",
    sub: "Seven questions on how buyers would see the business today.",
    stage: "ready",
  },
]

export const SELL_TIMING_CHIPS: Array<[SellTiming, string]> = [
  ["now", "Now or within 6 months"],
  ["mid", "In 6 to 18 months"],
  ["explore", "I am only exploring"],
]

export const SELL_REVENUE_CHIPS: Array<[SellRevenue, string]> = [
  ["u1", "Under $1M"],
  ["1-3", "$1M to $3M"],
  ["3-10", "$3M to $10M"],
  ["10+", "More than $10M"],
]

export function sellDoneTitle(timing: SellTiming | null): string {
  if (timing === "now") return "You could start a full sale process now."
  if (timing === "mid") return "This timing leaves room to prepare before buyers see the business."
  return "An advisor call does not commit you to selling."
}

export function sellDoneSubtitle(rev: SellRevenue | null): string {
  if (rev === "u1")
    return "Full representation usually begins around $1M in annual revenue. An advisor can still suggest a next step."
  if (rev === "10+") return "We review larger businesses individually."
  return "Your business is in Heirloom’s usual range."
}
