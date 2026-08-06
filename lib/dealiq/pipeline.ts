/**
 * Pipeline derivations — stage counts, the funnel, and the canonical deal order.
 *
 * Execution Plan §1 rule 4: "Everything is derived, nothing is asserted. Totals,
 * deltas, percentages, funnel counts, and match scores are computed from the seed
 * at render time." So `lib/dealiq/data/pipeline.ts` ships a list of deals and
 * nothing else — no counters, no totals. Every number the board shows comes from
 * here, which means adding or removing a seed deal moves the funnel without any
 * other edit.
 *
 * The ordering function is also what the deal-workspace prev/next stepper walks,
 * so "deal 4 of 12" in the context bar and the fourth card on the board are the
 * same deal by construction.
 */

import { PIPELINE_STAGES } from "@/lib/dealiq/navigation"
import type { FunnelStep, PipelineDeal, PipelineStage } from "@/lib/dealiq/types"

export type StageCounts = Record<PipelineStage, number>

export function countByStage(deals: ReadonlyArray<PipelineDeal>): StageCounts {
  const counts: StageCounts = { sourced: 0, screened: 0, diligence: 0, loi: 0 }
  for (const deal of deals) counts[deal.stage] += 1
  return counts
}

/**
 * The funnel, widest step first by definition of the stage order. `share` is
 * relative to the widest step so the bars are readable regardless of absolute
 * counts; an empty pipeline yields zero shares rather than a division by zero.
 */
export function funnel(deals: ReadonlyArray<PipelineDeal>): ReadonlyArray<FunnelStep> {
  const counts = countByStage(deals)
  const widest = Math.max(...PIPELINE_STAGES.map((stage) => counts[stage.key]), 0)
  return PIPELINE_STAGES.map((stage) => ({
    key: stage.key,
    label: stage.label,
    count: counts[stage.key],
    share: widest > 0 ? counts[stage.key] / widest : 0,
  }))
}

export function dealsInStage(deals: ReadonlyArray<PipelineDeal>, stage: PipelineStage): ReadonlyArray<PipelineDeal> {
  return deals.filter((deal) => deal.stage === stage)
}

const STAGE_RANK: Record<PipelineStage, number> = { loi: 0, diligence: 1, screened: 2, sourced: 3 }

/**
 * Canonical order: furthest-along stage first, then strongest score, then id.
 * Unscored deals sort last within their stage — a searcher should reach a deal
 * with a verdict before one without. Sorting by id last keeps the order stable
 * across renders when two deals tie.
 */
export function orderedDeals(deals: ReadonlyArray<PipelineDeal>): ReadonlyArray<PipelineDeal> {
  return [...deals].sort((a, b) => {
    const byStage = STAGE_RANK[a.stage] - STAGE_RANK[b.stage]
    if (byStage !== 0) return byStage
    const byScore = (b.score ?? -1) - (a.score ?? -1)
    if (byScore !== 0) return byScore
    return a.id.localeCompare(b.id)
  })
}

/** Position of a deal in canonical order, 1-indexed. `null` when it is not in the list. */
export function dealPosition(deals: ReadonlyArray<PipelineDeal>, dealId: string): number | null {
  const index = orderedDeals(deals).findIndex((deal) => deal.id === dealId)
  return index === -1 ? null : index + 1
}

/** Neighbours in canonical order, for the `[` / `]` stepper. Does not wrap. */
export function adjacentDeals(
  deals: ReadonlyArray<PipelineDeal>,
  dealId: string
): { prev: PipelineDeal | null; next: PipelineDeal | null } {
  const ordered = orderedDeals(deals)
  const index = ordered.findIndex((deal) => deal.id === dealId)
  if (index === -1) return { prev: null, next: null }
  return { prev: ordered[index - 1] ?? null, next: ordered[index + 1] ?? null }
}
