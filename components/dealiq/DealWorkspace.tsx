"use client"

/**
 * Client boundary for the deal workspace.
 *
 * The page that renders this is a server component — it resolves `?tab=` from
 * `searchParams` and decides whether the id exists at all. What it cannot do is
 * see sessionStorage, and the pipeline the stepper walks carries session
 * overlays (the "new" badge, an LOI-stage move). So the merge happens here, one
 * level in, and the panels stay server-rendered children passed through
 * untouched.
 */

import React from "react"

import { DealContextBar } from "@/components/dealiq/DealContextBar"
import { SEEDED_PIPELINE_DEALS, usePipelineDeals } from "@/components/dealiq/usePipelineDeals"
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
    // The server already validated the id against the seed set, and every seed
    // is placed on the board, so this fallback should be unreachable — but a
    // session-state edge must degrade to a bar, not an error.
    const seeded = SEEDED_PIPELINE_DEALS.find((candidate) => candidate.id === dealId) ?? SEEDED_PIPELINE_DEALS[0]
    if (!seeded) throw new Error("No seeded deals configured")
    return seeded
  }, [deals, dealId])

  return (
    <>
      <DealContextBar deal={deal} deals={deals} activeTab={activeTab} />
      {children}
    </>
  )
}
