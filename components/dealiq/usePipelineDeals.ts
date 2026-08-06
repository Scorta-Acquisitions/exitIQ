"use client"

/**
 * The one place the board and the deal workspace agree on what is in the pipeline.
 *
 * Every seeded deal's card is derived — `buildPipelineDeals` joins each placement
 * in `data/pipeline.ts` to its seed in `data/deal.ts` and runs the engines, so
 * the score on a board card and the score on that deal's workspace tabs come
 * from the same call. Session state then overlays two facts sessionStorage
 * carries: a deal screened this session (marked "new", or appended if it is not
 * a seeded deal), and an LOI sent this session (moves that card to the LOI
 * stage). Both surfaces perform the same merge or the board's card order and
 * the context bar's "2 of 3" stepper would disagree.
 */

import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { analyzeDeal, buildPipelineDeals, type DealAnalysis } from "@/lib/dealiq/analyze"
import { PIPELINE_COPY } from "@/lib/dealiq/data/copy"
import { DEAL_SEEDS, FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { DEAL_PLACEMENTS } from "@/lib/dealiq/data/pipeline"
import type { PipelineDeal } from "@/lib/dealiq/types"

/** Pure over static seeds, so it is computed once per module load, not per render. */
export const SEEDED_PIPELINE_DEALS: ReadonlyArray<PipelineDeal> = buildPipelineDeals(DEAL_SEEDS, DEAL_PLACEMENTS)

/** The Deal Inbox's sample-listing analysis — the fixture path pins to this seed. */
export const FOCUS_ANALYSIS: DealAnalysis = analyzeDeal(FOCUS_DEAL)

export const FOCUS_DEAL_ID = FOCUS_DEAL.card.id

export type PipelineView = {
  deals: ReadonlyArray<PipelineDeal>
  /** Id of the deal screened in this session, for the "new" treatment on its card. */
  screenedId: string | null
  /** `false` until sessionStorage has been read — gate anything that would differ from SSR. */
  hydrated: boolean
}

export function usePipelineDeals(): PipelineView {
  const { screened, loiSentDealId, hydrated } = useDealIQSession()

  const deals = React.useMemo<ReadonlyArray<PipelineDeal>>(() => {
    let merged: ReadonlyArray<PipelineDeal> = SEEDED_PIPELINE_DEALS

    // A deal screened this session that is not in the seed set still belongs on
    // the board; it has no engine result behind it yet, which renders unscored.
    // Screening a seeded deal (the sample listing, a certified prefill) changes
    // nothing here — its card is already derived; the "new" badge marks it.
    if (screened && !merged.some((deal) => deal.id === screened.card.id)) {
      merged = [
        ...merged,
        {
          id: screened.card.id,
          name: screened.card.name,
          industry: screened.card.industry,
          geography: screened.card.geography,
          ask: screened.card.ask,
          claimedSde: screened.card.claimedSde,
          score: null,
          verdict: null,
          stage: "screened",
          daysInStage: 0,
          lastAgentAction: PIPELINE_COPY.justScreenedAction,
        },
      ]
    }

    // The LOI gate (item 10) moves the card; the funnel counters derive from the
    // stage, so the LOI column increments with no counter stored anywhere.
    if (loiSentDealId) {
      merged = merged.map((deal) =>
        deal.id === loiSentDealId && deal.stage !== "loi"
          ? { ...deal, stage: "loi" as const, daysInStage: 0, lastAgentAction: PIPELINE_COPY.loiSentAction }
          : deal
      )
    }

    return merged
  }, [screened, loiSentDealId])

  return { deals, screenedId: screened?.card.id ?? null, hydrated }
}
