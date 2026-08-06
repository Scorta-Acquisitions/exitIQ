/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import type { DealPlacement } from "@/lib/dealiq/types"

/**
 * Where each seeded deal sits on the board — one placement per seed in
 * `data/deal.ts`, one deal per active stage.
 *
 * Nothing here is a conclusion. A placement records process facts only: the
 * stage, how long the deal has sat there, and what the agent did last. Scores
 * and verdicts are computed by running the engines on the deal's seed
 * (`buildPipelineDeals` in `lib/dealiq/analyze.ts`), so the number on a board
 * card and the number on the deal's Screen Score tab are the same call.
 *
 * No funnel counters live here either. Counts, shares, and ordering are computed
 * by `lib/dealiq/pipeline.ts` from the derived list, so adding or removing a
 * placement moves every dependent figure with no other edit.
 */
export const DEAL_PLACEMENTS: ReadonlyArray<DealPlacement> = [
  {
    dealId: "deal-gulfcoast-mechanical",
    stage: "screened",
    daysInStage: 4,
    lastAgentAction: "Screened — the recast challenged most of the add-back schedule and flagged the missing rent",
  },
  {
    dealId: "deal-bluebonnet-facility",
    stage: "diligence",
    daysInStage: 11,
    lastAgentAction: "Diligence pack sent — awaiting the hospital contract, payroll register and lease terms",
  },
  {
    dealId: "deal-lonestar-routes",
    stage: "loi",
    daysInStage: 3,
    lastAgentAction: "LOI delivered — priced off defensible SDE, earnout bridges the gap to the ask",
  },
] as const
