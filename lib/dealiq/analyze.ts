/**
 * The composition root — one seed in, every engine result out.
 *
 * Each surface needs a different slice (the score panel wants sub-scores, the
 * board wants a verdict chip, the LOI wants both the recast and the returns), and
 * every one of them must be looking at the *same* numbers. Running the three
 * engines in one place, in the right order, is what guarantees that.
 *
 * Pure and content-free: the seed arrives as an argument. Callers pass
 * `FOCUS_DEAL` from `lib/dealiq/data/`; this module never imports it.
 */

import { computeReturns, DEFAULT_FINANCING } from "@/lib/dealiq/returns"
import { reverseRecast } from "@/lib/dealiq/reverseRecast"
import { screenScore } from "@/lib/dealiq/screenScore"
import type {
  DealSeed,
  FinancingTerms,
  PipelineDeal,
  PipelineStage,
  ReturnsResult,
  ReverseRecastResult,
  ScreenScoreResult,
} from "@/lib/dealiq/types"

export type DealAnalysis = {
  readonly seed: DealSeed
  readonly recast: ReverseRecastResult
  readonly returns: ReturnsResult
  readonly score: ScreenScoreResult
  /** Financing actually used — defaults merged with the seed's overrides. */
  readonly terms: FinancingTerms
  /** Market rent the P&L does not carry. Drives the occupancy scenario. */
  readonly uncoveredOccupancy: number
}

export type AnalyzeOptions = {
  /** Price to model, when it differs from the ask — the Returns sensitivity slider. */
  readonly price?: number
}

export function financingFor(seed: DealSeed): FinancingTerms {
  return { ...DEFAULT_FINANCING, ...seed.financing }
}

/** Market rent above what the P&L carries, floored at zero. Zero when the ask includes the real estate. */
export function uncoveredOccupancyFor(seed: DealSeed): number {
  if (seed.occupancy.realEstateIncludedInAsk) return 0
  return Math.max(0, seed.occupancy.marketAnnualRent - seed.occupancy.costInPandL)
}

/**
 * Runs recast → returns → score in dependency order. The returns model is priced
 * off the defensible SDE the recast produced, and the score reads both — so a
 * change to a single add-back moves the verdict, which is the point.
 */
export function analyzeDeal(seed: DealSeed, options: AnalyzeOptions = {}): DealAnalysis {
  const terms = financingFor(seed)
  const price = options.price ?? seed.card.ask

  const recast = reverseRecast({
    claimedSde: seed.card.claimedSde,
    ask: seed.card.ask,
    addBacks: seed.addBacks,
    historyWindowYears: seed.historyWindowYears,
    occupancy: seed.occupancy,
    compMultiple: seed.compMultiple,
  })

  const returns = computeReturns({ price, defensibleSde: recast.defensibleSde, terms })

  const score = screenScore({
    ask: seed.card.ask,
    recast,
    returns,
    risk: seed.risk,
    compMultiple: seed.compMultiple,
  })

  return { seed, recast, returns, score, terms, uncoveredOccupancy: uncoveredOccupancyFor(seed) }
}

export type PipelinePlacement = {
  readonly stage: PipelineStage
  readonly daysInStage: number
  readonly lastAgentAction: string
}

/**
 * Projects an analysis onto the pipeline board's card shape. Score and verdict
 * come from the engine, never from a stored field — a screened deal on the board
 * shows the same verdict its workspace does.
 */
export function analysisToPipelineDeal(analysis: DealAnalysis, placement: PipelinePlacement): PipelineDeal {
  const { card } = analysis.seed
  return {
    id: card.id,
    name: card.name,
    industry: card.industry,
    geography: card.geography,
    ask: card.ask,
    claimedSde: card.claimedSde,
    score: Math.round(analysis.score.composite),
    verdict: analysis.score.verdict,
    stage: placement.stage,
    daysInStage: placement.daysInStage,
    lastAgentAction: placement.lastAgentAction,
  }
}
