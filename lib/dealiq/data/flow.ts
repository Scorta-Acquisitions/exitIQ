/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import type { CertifiedListing } from "@/lib/dealiq/types"

/**
 * The seeded "now" the pre-market countdown measures against.
 *
 * Certified Deal Flow shows a clock ticking down to open-market release. Deriving
 * that from `Date.now()` means the demo drifts — every listing eventually reads
 * "released", and the surface quietly becomes a list of nothing. Countdowns are
 * `openMarketOn − FLOW_AS_OF`, so the feed shows the same days remaining forever.
 */
export const FLOW_AS_OF = "2026-08-01"

/**
 * Six pre-market certified listings. Mandate fit is deliberately mixed — two
 * strong, two partial, two weak — so the match score has a visible spread and the
 * sort order is doing observable work rather than presenting a flat list.
 *
 * `matchScore` is NOT stored. `lib/dealiq/matching.ts` computes it against the
 * buyer's mandate, which is what lets a mandate edit re-rank the feed.
 */
export const CERTIFIED_LISTINGS: ReadonlyArray<CertifiedListing> = [
  {
    id: "cf-01",
    name: "Hill Country Commercial Cleaning",
    industry: "Commercial Janitorial & Facility Services",
    geography: "Austin, TX",
    ask: 2_300_000,
    sde: 760_000,
    scortaScore: 84,
    certifiedOn: "2026-07-22",
    openMarketOn: "2026-08-19",
    certificationBasis: [
      "Financials recast and reconciled to bank deposits",
      "Owner-dependency remediation completed before listing",
      "SBA pre-qualification letter on file",
    ],
    ownerDependencyScore: 24,
    topCustomerShare: 0.14,
    sbaEligible: true,
  },
  {
    id: "cf-02",
    name: "Trinity Plumbing & Backflow",
    industry: "Specialty Trade Contracting",
    geography: "Dallas\u2013Fort Worth, TX",
    ask: 1_700_000,
    sde: 540_000,
    scortaScore: 79,
    certifiedOn: "2026-07-25",
    openMarketOn: "2026-08-12",
    certificationBasis: [
      "Three years of reviewed statements in the data room",
      "Documented SOPs for every revenue-generating role",
      "Top-customer share verified under 20%",
    ],
    ownerDependencyScore: 31,
    topCustomerShare: 0.18,
    sbaEligible: true,
  },
  {
    id: "cf-03",
    name: "Bayou City Electrical Contractors",
    industry: "Specialty Trade Contracting",
    geography: "Houston, TX",
    ask: 3_600_000,
    sde: 1_050_000,
    scortaScore: 81,
    certifiedOn: "2026-07-18",
    openMarketOn: "2026-08-26",
    certificationBasis: [
      "Add-back schedule independently challenged and re-issued",
      "Backlog verified against signed contracts",
    ],
    ownerDependencyScore: 29,
    topCustomerShare: 0.22,
    sbaEligible: true,
  },
  {
    id: "cf-04",
    name: "Metroplex Courier Network",
    industry: "Route-Based Distribution",
    geography: "Oklahoma City, OK",
    ask: 1_150_000,
    sde: 390_000,
    scortaScore: 74,
    certifiedOn: "2026-07-28",
    openMarketOn: "2026-08-08",
    certificationBasis: ["Route-level margin detail reconciled", "Driver contracts and classification reviewed"],
    ownerDependencyScore: 42,
    topCustomerShare: 0.27,
    sbaEligible: true,
  },
  {
    id: "cf-05",
    name: "Pecan Creek Coffee Roasters",
    industry: "Food & Beverage Production",
    geography: "Waco, TX",
    ask: 900_000,
    sde: 280_000,
    scortaScore: 71,
    certifiedOn: "2026-07-30",
    openMarketOn: "2026-08-15",
    certificationBasis: ["Wholesale and retail revenue split verified separately"],
    ownerDependencyScore: 48,
    topCustomerShare: 0.31,
    sbaEligible: false,
  },
  {
    id: "cf-06",
    name: "Clear Lake Marine Services",
    industry: "Marine Repair & Storage",
    geography: "Galveston, TX",
    ask: 4_800_000,
    sde: 1_320_000,
    scortaScore: 77,
    certifiedOn: "2026-07-20",
    openMarketOn: "2026-09-02",
    certificationBasis: ["Seasonal working-capital cycle modelled and disclosed", "Yard lease assignable to a buyer"],
    ownerDependencyScore: 36,
    topCustomerShare: 0.11,
    sbaEligible: true,
  },
] as const
