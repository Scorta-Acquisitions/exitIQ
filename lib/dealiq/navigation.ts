/**
 * DealIQ navigation structure — four global destinations, five workspace tabs.
 *
 * This is deliberately *not* `STATIONS` from `lib/persona.ts`. The seller
 * workspace is a linear walk through one engagement: eleven numbered stations,
 * each with an owning agent and a lock state, rendered in a 280px explanatory
 * rail. DealIQ is a triage tool — a searcher moves between many deals fast — so
 * navigation is flat, unnumbered, agent-free, and lives in a horizontal bar
 * (Execution Plan §3 item 3).
 *
 * Nothing here is content. Labels are structural product vocabulary, not the
 * placeholder copy that lives in `lib/dealiq/data/`.
 */

import type { DealIqNavItem, DealTabItem, DealTabKey, PipelineStage, PipelineStageMeta } from "@/lib/dealiq/types"

/** Root of the buy-side URL space. Every DealIQ path is under this prefix. */
export const DEALIQ_ROOT = "/dealiq"

export const DEALIQ_SIGNIN_PATH = "/dealiq/signin"

/**
 * The four global destinations. Order is the bar order.
 * `Screen a deal` is a primary action in the shell, not a nav item — but it
 * routes here, so `/dealiq/screen` stays addressable on its own.
 */
export const DEALIQ_NAV: ReadonlyArray<DealIqNavItem> = [
  { href: "/dealiq", label: "Pipeline", icon: "pipeline" },
  { href: "/dealiq/screen", label: "Screen", icon: "screen" },
  { href: "/dealiq/flow", label: "Flow", icon: "flow" },
  { href: "/dealiq/verify", label: "Verify", icon: "verify" },
] as const

/**
 * The five deal-workspace tabs. `key` is the literal `?tab=` value, so a deep
 * link is `/dealiq/deal/<id>?tab=recast`.
 */
export const DEAL_TABS: ReadonlyArray<DealTabItem> = [
  { key: "score", label: "Screen Score", shortLabel: "Score" },
  { key: "recast", label: "Reverse Recast", shortLabel: "Recast" },
  { key: "returns", label: "Returns", shortLabel: "Returns" },
  { key: "diligence", label: "Diligence", shortLabel: "Diligence" },
  { key: "loi", label: "LOI", shortLabel: "LOI" },
] as const

export const DEFAULT_DEAL_TAB: DealTabKey = "score"

/** Narrows an untrusted `?tab=` value. Anything unrecognised falls back to the score tab. */
export function resolveDealTab(raw: string | null | undefined): DealTabKey {
  const match = DEAL_TABS.find((tab) => tab.key === raw)
  return match ? match.key : DEFAULT_DEAL_TAB
}

/** Deep link to a specific tab of a specific deal. */
export function dealPath(dealId: string, tab: DealTabKey = DEFAULT_DEAL_TAB): string {
  return `${DEALIQ_ROOT}/deal/${encodeURIComponent(dealId)}?tab=${tab}`
}

/**
 * Pipeline stages, in board order. `meaning` is the column subhead — it says what
 * being in the stage costs the buyer, which is the whole reason a searcher looks
 * at a board rather than a list.
 */
export const PIPELINE_STAGES: ReadonlyArray<PipelineStageMeta> = [
  { key: "sourced", label: "Sourced", meaning: "Listing captured, not yet screened" },
  { key: "screened", label: "Screened", meaning: "Scored and triaged — most die here" },
  { key: "diligence", label: "Diligence", meaning: "Questions out, answers pending" },
  { key: "loi", label: "LOI", meaning: "Offer drafted or delivered" },
] as const

export function pipelineStageLabel(stage: PipelineStage): string {
  return PIPELINE_STAGES.find((s) => s.key === stage)?.label ?? stage
}
