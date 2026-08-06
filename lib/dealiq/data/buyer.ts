/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import type { BuyerProfile } from "@/lib/dealiq/types"

/**
 * The signed-in buyer. Shape-truthful: a two-word firm name, a seven-figure
 * capital commitment, and a rank inside a pool large enough for the rank to
 * mean something — so wrapping, truncation, and chip widths are being tested for
 * real. Deliberately not mistakable for a real person or firm.
 */
export const BUYER: BuyerProfile = {
  id: "buyer-placeholder-1",
  name: "Buyer Name",
  initials: "BN",
  title: "Managing Partner",
  firmName: "Placeholder Holdings",
  location: "Placeholder Metro, ST",
  archetype: "search_fund",
  committedCapital: 2_400_000,
  capitalVerified: true,
  verificationMethod: "proof_of_funds",
  verifiedOn: "2026-07-14",
  poolRank: 12,
  poolSize: 340,
  bio: "Provisional two-line operator background — replaced in the content pass with the buyer's actual track record, prior operating roles, and what they intend to run themselves after close.",
  mandate: {
    industries: [
      "Placeholder Industry A",
      "Placeholder Industry B",
      "Placeholder Industry C",
      "Placeholder Industry D",
    ],
    geographies: ["Placeholder Region North", "Placeholder Region East"],
    evBand: { low: 1_000_000, high: 4_000_000 },
    sdeFloor: 400_000,
    maxOwnerDependency: 55,
    minDscr: 1.25,
  },
} as const
