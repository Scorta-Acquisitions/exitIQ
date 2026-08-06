"use client"

/**
 * Client boundary for the deal workspace.
 *
 * The page that renders this is a server component — it resolves `?tab=` from
 * `searchParams` and decides whether the id exists at all. What it cannot do is
 * see sessionStorage, and the pipeline the stepper walks depends on whether the
 * focus deal has been screened yet. So the merge happens here, one level in, and
 * the panels stay server-rendered children passed through untouched.
 *
 * A deal that is valid but not yet in the pipeline (deep-linked before it has
 * been screened) renders its own bar with the stepper disabled rather than
 * erroring — `dealPosition` returns null and the bar says so.
 */

import React from "react"

import { DealContextBar } from "@/components/dealiq/DealContextBar"
import { FOCUS_PIPELINE_DEAL, usePipelineDeals } from "@/components/dealiq/usePipelineDeals"
import type { DealTabKey, PipelineDeal } from "@/lib/dealiq/types"

export function DealWorkspace({
  dealId,
  activeTab,
  children,
}: {
  dealId: string
  activeTab: DealTabKey
  children: React.ReactNode
}) {
  const { deals } = usePipelineDeals()

  const deal = React.useMemo<PipelineDeal>(() => {
    const found = deals.find((candidate) => candidate.id === dealId)
    if (found) return found
    // The server already validated the id against the fixture set, so the only
    // way to land here is the focus deal before it has been screened.
    return { ...FOCUS_PIPELINE_DEAL, score: null, verdict: null, lastAgentAction: "Not yet screened" }
  }, [deals, dealId])

  return (
    <>
      <DealContextBar deal={deal} deals={deals} activeTab={activeTab} />
      {children}
    </>
  )
}
