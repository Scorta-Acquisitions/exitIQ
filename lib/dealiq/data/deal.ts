/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import type { DealSeed } from "@/lib/dealiq/types"

/**
 * The focus deal — the one the demo screens, recasts, models, and offers on.
 *
 * This file carries **claims, not conclusions**. There is no defensible SDE here,
 * no fair value, no score, no verdict: those are produced by `reverseRecast()`,
 * `computeReturns()`, and `screenScore()` from the claims below. Change a single
 * add-back amount and every figure on every tab moves — which is the test the
 * data seam has to pass.
 *
 * The add-back schedule is built so that each of the six challenge rules has
 * something to fire on, and so that some claims survive. A recast where every
 * line is rejected reads as a hit piece; the product's credibility is that it
 * also agrees. Two lines here are accepted in full.
 */
export const FOCUS_DEAL: DealSeed = {
  card: {
    id: "focus-placeholder-1",
    name: "Placeholder HVAC Services",
    industry: "Placeholder Industry A",
    geography: "Placeholder Region North",
    ask: 1_900_000,
    claimedSde: 650_000,
    revenue: 4_100_000,
    yearsOperating: 18,
    employees: 14,
    realEstateIncluded: false,
    reasonForSale: "Provisional reason-for-sale line, replaced in the content pass.",
    listingSource: "Placeholder Listing Marketplace",
    highlights: [
      "Provisional highlight the listing leads with — length matched to a real one",
      "Second provisional highlight, phrased the way a broker writes it",
      "Third provisional highlight covering the recurring-revenue claim",
    ],
    concerns: [
      "Provisional concern the screen surfaced from the listing text itself",
      "Second provisional concern, longer, so the card's wrapping behaviour is exercised properly",
    ],
  },

  /**
   * Six claimed add-backs. Mapped to the rules they are meant to exercise:
   *   ab-1 role split + replacement cost · ab-2 mixed use · ab-3 reserve
   *   ab-4 documentation (reject) · ab-5 documentation (haircut) · ab-6 accepted in full
   */
  addBacks: [
    {
      id: "ab-1",
      label: "Owner salary and payroll taxes",
      annualAmount: 180_000,
      category: "compensation",
      documentation: "verified",
      roleVacatedShare: 0.6,
      replacementCost: 130_000,
      sourceNote: "Provisional source note — where the claim appears in the seller's package.",
    },
    {
      id: "ab-2",
      label: "Vehicle, fuel and maintenance",
      annualAmount: 24_000,
      category: "mixed_use",
      documentation: "partial",
      businessUseShare: 0.35,
      sourceNote: "Provisional source note for a mixed-use claim with a documented split.",
    },
    {
      id: "ab-3",
      label: "One-time equipment repair",
      annualAmount: 40_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 3,
      recurringAnnualAverage: 38_000,
      sourceNote: "Provisional source note for a claim the history window contradicts.",
    },
    {
      id: "ab-4",
      label: "Owner travel and entertainment",
      annualAmount: 18_000,
      category: "discretionary",
      documentation: "none",
      sourceNote: "Provisional source note for an undocumented discretionary claim.",
    },
    {
      id: "ab-5",
      label: "Family member on payroll",
      annualAmount: 45_000,
      category: "related_party",
      documentation: "partial",
      sourceNote: "Provisional source note for a related-party payroll claim.",
    },
    {
      id: "ab-6",
      label: "Non-recurring legal and advisory fees",
      annualAmount: 28_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 1,
      sourceNote: "Provisional source note for a genuinely non-recurring expense.",
    },
  ],

  /** No occupancy cost in the P&L while the seller owns the building — the classic omission. */
  occupancy: {
    costInPandL: 0,
    marketAnnualRent: 66_000,
    premisesOwnedBySeller: true,
    realEstateIncludedInAsk: false,
  },

  risk: {
    topCustomerShare: 0.34,
    topThreeCustomerShare: 0.61,
    ownerHoursPerWeek: 55,
    ownerHoldsKeyRelationships: true,
    documentedSops: 2,
    longTenuredStaff: 3,
    employees: 14,
    recurringRevenueShare: 0.22,
    sbaEligible: true,
    yearsOperating: 18,
    revenueTrend3yr: 0.06,
  },

  /** Provisional comp band for the industry. The content pass supplies the real one. */
  compMultiple: { low: 2.0, high: 3.0 },

  historyWindowYears: 3,
} as const
