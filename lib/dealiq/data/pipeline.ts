/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import type { PipelineDeal } from "@/lib/dealiq/types"

/**
 * Twelve deals across four stages, with the distribution shape a real search
 * pipeline has: thin at the top (a searcher only sources what clears a first
 * glance), heavy at screened (most deals die there, and the killed ones stay
 * visible with their reason), thin at LOI.
 *
 * No funnel counters live here. Counts, shares, and ordering are computed by
 * `lib/dealiq/pipeline.ts` from this list, so adding or removing a deal moves
 * every dependent figure with no other edit.
 *
 * The focus deal is deliberately ABSENT. It arrives during the demo, when the
 * Deal Inbox screens it and writes `scorta:dealiq:screened` — which is what makes
 * the board visibly gain a card rather than merely containing one.
 *
 * Scores and verdicts here are provisional and must stay consistent with
 * `VERDICT_BANDS` in `lib/dealiq/screenScore.ts` when the content pass rewrites
 * them: PASS below the DIG floor, PURSUE at or above the PURSUE floor.
 */
export const PIPELINE_DEALS: ReadonlyArray<PipelineDeal> = [
  {
    id: "pl-01",
    name: "Placeholder Mechanical Services",
    industry: "Placeholder Industry A",
    geography: "Placeholder Region North",
    ask: 2_200_000,
    claimedSde: 720_000,
    score: null,
    verdict: null,
    stage: "sourced",
    daysInStage: 2,
    lastAgentAction: "Listing captured from broker email — not yet screened",
  },
  {
    id: "pl-02",
    name: "Sample Commercial Landscaping",
    industry: "Placeholder Industry B",
    geography: "Placeholder Region East",
    ask: 1_400_000,
    claimedSde: 460_000,
    score: null,
    verdict: null,
    stage: "sourced",
    daysInStage: 5,
    lastAgentAction: "Awaiting the seller's add-back schedule before screening",
  },
  {
    id: "pl-03",
    name: "Provisional Pest Control Group",
    industry: "Placeholder Industry C",
    geography: "Placeholder Region North",
    ask: 3_100_000,
    claimedSde: 880_000,
    score: null,
    verdict: null,
    stage: "sourced",
    daysInStage: 1,
    lastAgentAction: "Above mandate EV band — held for review",
  },
  {
    id: "pl-04",
    name: "Placeholder Auto Care Centers",
    industry: "Placeholder Industry D",
    geography: "Placeholder Region East",
    ask: 1_650_000,
    claimedSde: 520_000,
    score: 34,
    verdict: "PASS",
    stage: "screened",
    daysInStage: 19,
    lastAgentAction: "Reverse Recast rejected 41% of the claimed add-backs",
    killReason: "Defensible SDE will not carry SBA debt service at the ask",
  },
  {
    id: "pl-05",
    name: "Sample Dental Partners",
    industry: "Placeholder Industry B",
    geography: "Placeholder Region North",
    ask: 2_800_000,
    claimedSde: 740_000,
    score: 41,
    verdict: "PASS",
    stage: "screened",
    daysInStage: 26,
    lastAgentAction: "Owner-dependency sub-score below the mandate threshold",
    killReason: "Owner holds every clinical relationship and will not stay past 60 days",
  },
  {
    id: "pl-06",
    name: "Provisional Print & Signage",
    industry: "Placeholder Industry A",
    geography: "Placeholder Region East",
    ask: 1_100_000,
    claimedSde: 380_000,
    score: 38,
    verdict: "PASS",
    stage: "screened",
    daysInStage: 33,
    lastAgentAction: "Three-year revenue trend flagged negative",
    killReason: "Revenue declining across the full history window",
  },
  {
    id: "pl-07",
    name: "Placeholder Fitness Studios",
    industry: "Placeholder Industry C",
    geography: "Placeholder Region North",
    ask: 1_250_000,
    claimedSde: 410_000,
    score: 52,
    verdict: "DIG",
    stage: "screened",
    daysInStage: 8,
    lastAgentAction: "Diligence pack generated — 6 questions promoted from recast findings",
  },
  {
    id: "pl-08",
    name: "Sample Equipment Rental Co",
    industry: "Placeholder Industry D",
    geography: "Placeholder Region East",
    ask: 2_600_000,
    claimedSde: 810_000,
    score: 61,
    verdict: "DIG",
    stage: "screened",
    daysInStage: 4,
    lastAgentAction: "Returns model clears the DSCR floor only with a seller note",
  },
  {
    id: "pl-09",
    name: "Provisional Staffing Group",
    industry: "Placeholder Industry B",
    geography: "Placeholder Region North",
    ask: 1_800_000,
    claimedSde: 590_000,
    score: 47,
    verdict: "DIG",
    stage: "screened",
    daysInStage: 12,
    lastAgentAction: "Customer concentration flagged — top account carries a third of revenue",
  },
  {
    id: "pl-10",
    name: "Placeholder Facility Services",
    industry: "Placeholder Industry A",
    geography: "Placeholder Region East",
    ask: 2_100_000,
    claimedSde: 680_000,
    score: 72,
    verdict: "PURSUE",
    stage: "diligence",
    daysInStage: 6,
    lastAgentAction: "Diligence pack sent — 4 of 22 questions answered",
  },
  {
    id: "pl-11",
    name: "Sample Specialty Foods",
    industry: "Placeholder Industry C",
    geography: "Placeholder Region North",
    ask: 1_550_000,
    claimedSde: 470_000,
    score: 68,
    verdict: "DIG",
    stage: "diligence",
    daysInStage: 15,
    lastAgentAction: "Awaiting accountant confirmation on two one-time add-backs",
  },
  {
    id: "pl-12",
    name: "Provisional Route Distribution",
    industry: "Placeholder Industry D",
    geography: "Placeholder Region East",
    ask: 1_950_000,
    claimedSde: 640_000,
    score: 78,
    verdict: "PURSUE",
    stage: "loi",
    daysInStage: 3,
    lastAgentAction: "LOI draft delivered — price set off defensible SDE, not the ask",
  },
] as const
