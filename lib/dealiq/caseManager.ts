/**
 * Case Manager — the next step for any deal, at any point in the pipeline.
 *
 * Rules, not facts. The step for a deal is a pure function of its stage and
 * verdict, so the widget can never disagree with the board: both read the same
 * derived deal list. Step prose is trade craft — it names stages, tabs, and
 * process, never a business name or a figure — which is what lets it live in an
 * engine module rather than the content seam (same precedent as `RULE_LABEL`
 * and the diligence bank's rationale strings).
 */

import type { DealTabKey, PipelineDeal, PipelineStage, Verdict } from "@/lib/dealiq/types"

/** How the widget renders the step's status dot. */
export type CaseUrgency = "act" | "waiting" | "watch"

export type CaseNextStep = {
  readonly dealId: string
  /** Imperative, one line — what the buyer does next on this deal. */
  readonly headline: string
  /** Why that is the step, one or two sentences. */
  readonly detail: string
  /** Workspace tab where the step happens — the widget deep-links to it. */
  readonly tab: DealTabKey
  readonly urgency: CaseUrgency
}

/**
 * Briefing order: closest to money first. A deal at LOI outranks one in
 * diligence, which outranks the screens; within a stage the one that has sat
 * longest floats up, because sitting is what kills deals.
 */
export const STAGE_PRIORITY: Record<PipelineStage, number> = {
  loi: 0,
  diligence: 1,
  screened: 2,
  sourced: 3,
}

function screenedStep(dealId: string, verdict: Verdict | null): CaseNextStep {
  switch (verdict) {
    case "PURSUE":
      return {
        dealId,
        headline: "Draft the LOI",
        detail:
          "The screen says pursue. Price off defensible SDE — not the ask — and get paper out before the open market sees it.",
        tab: "loi",
        urgency: "act",
      }
    case "DIG":
      return {
        dealId,
        headline: "Send the diligence pack",
        detail:
          "The verdict holds only if the promoted questions come back clean. Send the ranked pack and let the fastest killers answer first.",
        tab: "diligence",
        urgency: "act",
      }
    case "PASS":
      return {
        dealId,
        headline: "Pass — unless the price moves",
        detail:
          "The numbers do not defend the ask. Archive it, or reopen the conversation at the fair-value line in the recast.",
        tab: "recast",
        urgency: "watch",
      }
    default:
      return {
        dealId,
        headline: "Finish the screen",
        detail: "The deal is captured but the engines have not run. Screen it to get a score and a verdict.",
        tab: "score",
        urgency: "act",
      }
  }
}

/** The next step for one deal. Pure over the card the board already renders. */
export function nextStepFor(deal: PipelineDeal): CaseNextStep {
  switch (deal.stage) {
    case "loi":
      return {
        dealId: deal.id,
        headline: "Hold for the seller's response",
        detail:
          "The offer is out. Use the wait: line up the lender file and the diligence-to-close checklist so acceptance starts the clock, not the scramble.",
        tab: "loi",
        urgency: "waiting",
      }
    case "diligence":
      return {
        dealId: deal.id,
        headline: "Chase the open diligence requests",
        detail:
          "Unanswered questions are the deal's clock. Push the outstanding items — the promoted ones resolve the recast findings the verdict rests on.",
        tab: "diligence",
        urgency: "act",
      }
    case "screened":
      return screenedStep(deal.id, deal.verdict)
    case "sourced":
      return {
        dealId: deal.id,
        headline: "Run the screen",
        detail:
          "Captured but unscreened. Paste the listing into the Deal Inbox and the engines return a verdict in seconds.",
        tab: "score",
        urgency: "watch",
      }
  }
}

export type CaseBriefingItem = {
  readonly deal: PipelineDeal
  readonly step: CaseNextStep
}

/** The whole board, one step per deal, in briefing order. Stable under ties. */
export function caseBriefing(deals: ReadonlyArray<PipelineDeal>): ReadonlyArray<CaseBriefingItem> {
  return deals
    .map((deal, index) => ({ deal, step: nextStepFor(deal), index }))
    .sort((a, b) => {
      const byStage = STAGE_PRIORITY[a.deal.stage] - STAGE_PRIORITY[b.deal.stage]
      if (byStage !== 0) return byStage
      const byAge = b.deal.daysInStage - a.deal.daysInStage
      if (byAge !== 0) return byAge
      return a.index - b.index
    })
    .map(({ deal, step }) => ({ deal, step }))
}
