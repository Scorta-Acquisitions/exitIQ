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
  bio: "Former regional operations director for a national facility-services platform; searching full-time to buy and operate one Texas services business with an SBA 7(a) structure and committed personal and family-office capital.",
  mandate: {
    industries: [
      "Commercial HVAC & Mechanical",
      "Commercial Janitorial & Facility Services",
      "Route-Based Distribution",
      "Specialty Trade Contracting",
    ],
    geographies: ["Houston, TX", "Dallas–Fort Worth, TX", "San Antonio, TX", "Austin, TX"],
    evBand: { low: 1_000_000, high: 4_000_000 },
    sdeFloor: 400_000,
    maxOwnerDependency: 55,
    minDscr: 1.25,
  },
} as const
