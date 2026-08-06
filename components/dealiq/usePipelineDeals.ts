"use client"

/**
 * The one place the board and the deal workspace agree on what is in the pipeline.
 *
 * The seeded deals are static; the focus deal arrives mid-session when the Inbox
 * screens it (§1 standing decision 6), so the list is a merge and both surfaces
 * have to perform the same merge or the board's card order and the context bar's
 * "4 of 12" stepper will disagree.
 *
 * The focus deal's score and verdict are computed by the engines here rather than
 * stored anywhere — the number on its board card and the number on its Screen
 * Score tab come from the same call.
 */

import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { analysisToPipelineDeal, analyzeDeal, type DealAnalysis } from "@/lib/dealiq/analyze"
import { PIPELINE_COPY } from "@/lib/dealiq/data/copy"
import { FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { PIPELINE_DEALS } from "@/lib/dealiq/data/pipeline"
import type { PipelineDeal } from "@/lib/dealiq/types"

/** Pure over a static seed, so it is computed once per module load, not per render. */
export const FOCUS_ANALYSIS: DealAnalysis = analyzeDeal(FOCUS_DEAL)

export const FOCUS_DEAL_ID = FOCUS_DEAL.card.id

/** The focus deal as it appears on the board once screened. */
export const FOCUS_PIPELINE_DEAL: PipelineDeal = analysisToPipelineDeal(FOCUS_ANALYSIS, {
  stage: "screened",
  daysInStage: 0,
  lastAgentAction: PIPELINE_COPY.justScreenedAction,
})

export type PipelineView = {
  deals: ReadonlyArray<PipelineDeal>
  /** Id of the deal screened in this session, for the "new" treatment on its card. */
  screenedId: string | null
  /** `false` until sessionStorage has been read — gate anything that would differ from SSR. */
  hydrated: boolean
}

export function usePipelineDeals(): PipelineView {
  const { screened, hydrated } = useDealIQSession()

  const deals = React.useMemo<ReadonlyArray<PipelineDeal>>(() => {
    if (!screened) return PIPELINE_DEALS
    if (screened.card.id === FOCUS_DEAL_ID) return [...PIPELINE_DEALS, FOCUS_PIPELINE_DEAL]
    // A card the fixture set does not cover still belongs on the board; it simply
    // has no engine result behind it yet, which the board renders as unscored.
    return [
      ...PIPELINE_DEALS,
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
  }, [screened])

  return { deals, screenedId: screened?.card.id ?? null, hydrated }
}
