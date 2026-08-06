/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 *
 * (Content-pass note: these three deals are the authored fixture set — fictional
 * businesses, but every figure is internally coherent and every claim is written
 * the way a real broker package states it. The banner stays because the values
 * remain swappable as a unit; nothing downstream may hardcode them.)
 */

import type { DealSeed } from "@/lib/dealiq/types"

/**
 * The three pipeline deals — one per active stage, each carrying a complete seed
 * so every workspace tab (score, recast, returns, diligence, LOI) runs the real
 * engines on real claims. No deal here stores a conclusion: there is no
 * defensible SDE, no fair value, no score, no verdict in this file. Change one
 * add-back amount and every figure on every surface moves.
 *
 *   1. Gulf Coast Mechanical — screened. The classic broker package: aggressive
 *      add-backs, seller-owned building with no rent in the P&L, owner-held
 *      relationships. Every one of the six challenge rules has something to
 *      fire on. This is also the Deal Inbox's sample-listing deal (FOCUS_DEAL).
 *   2. Bluebonnet Facility Group — in diligence. Contract-cleaning revenue is
 *      genuinely recurring, but the ask prices the claimed SDE, a third of which
 *      does not survive challenge, and coverage misses the lender floor at the
 *      ask. The diligence pack is where this deal lives or dies.
 *   3. Lone Star Route Distribution — at LOI. Clean books, documented routes,
 *      verified add-backs. The LOI prices off defensible SDE with an earnout
 *      bridging the modest gap to the ask.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Deal 1 — Gulf Coast Mechanical Services · screened · the focus deal
// ─────────────────────────────────────────────────────────────────────────────

export const FOCUS_DEAL: DealSeed = {
  card: {
    id: "deal-gulfcoast-mechanical",
    name: "Gulf Coast Mechanical Services",
    industry: "Commercial HVAC & Mechanical",
    geography: "Houston, TX",
    ask: 1_850_000,
    claimedSde: 610_000,
    revenue: 4_650_000,
    yearsOperating: 21,
    employees: 16,
    realEstateIncluded: false,
    reasonForSale: "Owner is 61 and relocating to be near family; willing to support a 90-day transition.",
    listingSource: "Harborview Business Advisors (broker listing)",
    highlights: [
      "21 years serving light-industrial and commercial clients across the Houston metro",
      "38% of revenue under preventive-maintenance agreements that renew annually",
      "TACLA-licensed technicians on staff; license transfers with a qualifying manager",
      "Long-standing relationships with three regional property-management groups",
      "Fleet of 11 wrapped service vehicles included in the sale",
    ],
    concerns: [
      "P&L carries no rent — the shop and yard are owned by the seller personally and are not included in the ask",
      "Largest customer (a petrochemical services group) is roughly a quarter of revenue",
      "Owner personally holds the three property-management relationships and still quotes all commercial bids",
    ],
  },

  /**
   * Six claimed add-backs, exactly as a broker package states them. Mapped to the
   * challenge rules they exercise:
   *   gc-ab-1 role split + replacement cost · gc-ab-2 mixed use · gc-ab-3 reserve
   *   gc-ab-4 documentation (reject) · gc-ab-5 documentation (haircut) · gc-ab-6 accepted in full
   */
  addBacks: [
    {
      id: "gc-ab-1",
      label: "Owner salary, payroll taxes and benefits",
      annualAmount: 165_000,
      category: "compensation",
      documentation: "verified",
      roleVacatedShare: 0.6,
      replacementCost: 118_000,
      sourceNote:
        "W-2 and benefits ledger in the broker package. Seller estimates 60% of his week is general management a buyer absorbs; the rest is senior estimating and PM account work that has to be re-hired.",
    },
    {
      id: "gc-ab-2",
      label: "Personal vehicles, fuel and maintenance",
      annualAmount: 24_000,
      category: "mixed_use",
      documentation: "partial",
      businessUseShare: 0.35,
      sourceNote:
        "Two trucks run through the company. Mileage logs exist for one; the seller concedes roughly a third of combined use is genuine service work.",
    },
    {
      id: "gc-ab-3",
      label: "One-time chiller compressor rebuild",
      annualAmount: 38_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 3,
      recurringAnnualAverage: 34_000,
      sourceNote:
        "Invoice on file. The general ledger shows a major equipment repair of similar size in each of the last three years — the fleet and loaner-chiller pool are old enough that this is a run rate, not an event.",
    },
    {
      id: "gc-ab-4",
      label: "Owner travel, meals and entertainment",
      annualAmount: 16_000,
      category: "discretionary",
      documentation: "none",
      sourceNote: "Line item on the recast schedule. No receipts or card statements provided on request.",
    },
    {
      id: "gc-ab-5",
      label: "Spouse on payroll — office administration",
      annualAmount: 42_000,
      category: "related_party",
      documentation: "partial",
      sourceNote:
        "Payroll register confirms the salary. The role covers AP/AR and dispatch roughly three days a week; the seller provided no time records, and some of the work will need to be re-staffed.",
    },
    {
      id: "gc-ab-6",
      label: "Legal fees — resolved workers' comp dispute",
      annualAmount: 24_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 1,
      sourceNote:
        "Settled in full last year; engagement letter and closing statement in the data room. Genuinely non-recurring.",
    },
  ],

  /** The classic omission: seller owns the building personally, P&L carries no rent. */
  occupancy: {
    costInPandL: 0,
    marketAnnualRent: 72_000,
    premisesOwnedBySeller: true,
    realEstateIncludedInAsk: false,
  },

  risk: {
    topCustomerShare: 0.26,
    topThreeCustomerShare: 0.54,
    ownerHoursPerWeek: 48,
    ownerHoldsKeyRelationships: true,
    documentedSops: 5,
    longTenuredStaff: 4,
    employees: 16,
    recurringRevenueShare: 0.38,
    sbaEligible: true,
    yearsOperating: 21,
    revenueTrend3yr: 0.04,
  },

  /** Commercial HVAC service businesses this size trade in this band on defensible SDE. */
  compMultiple: { low: 2.3, high: 3.2 },

  historyWindowYears: 3,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Deal 2 — Bluebonnet Facility Group · in diligence
// ─────────────────────────────────────────────────────────────────────────────

export const BLUEBONNET_DEAL: DealSeed = {
  card: {
    id: "deal-bluebonnet-facility",
    name: "Bluebonnet Facility Group",
    industry: "Commercial Janitorial & Facility Services",
    geography: "San Antonio, TX",
    ask: 1_350_000,
    claimedSde: 472_000,
    revenue: 3_120_000,
    yearsOperating: 12,
    employees: 58,
    realEstateIncluded: false,
    reasonForSale: "Founding partners are splitting; the operating partner wants a full exit rather than a buyout.",
    listingSource: "Alamo City Business Brokerage (broker listing)",
    highlights: [
      "83% of revenue under recurring commercial cleaning contracts, most with 30-day-out clauses",
      "Medical-office niche: 14 clinic and surgery-center accounts with compliance-documented protocols",
      "Night-shift supervisor structure keeps the owner out of daily service delivery",
      "Revenue up 9% annually over the trailing three years without paid acquisition",
    ],
    concerns: [
      "A regional hospital network is 28% of revenue on a contract that rebids in 14 months",
      "The operating partner personally manages the hospital relationship and the two largest property accounts",
      "Wage pressure in the San Antonio janitorial labor market is compressing gross margin on older contracts",
    ],
  },

  /**
   * Seven claimed add-backs. The schedule leans hard enough that roughly a third
   * of the claimed value does not survive — which is exactly what the diligence
   * pack's promoted questions are chasing.
   *   bb-ab-1 role split + replacement cost · bb-ab-2 documentation (haircut, related party)
   *   bb-ab-3 mixed use · bb-ab-4 reserve · bb-ab-5 documentation (reject)
   *   bb-ab-6 accepted in full · bb-ab-7 accepted in full
   */
  addBacks: [
    {
      id: "bb-ab-1",
      label: "Operating partner salary and payroll taxes",
      annualAmount: 120_000,
      category: "compensation",
      documentation: "verified",
      roleVacatedShare: 0.7,
      replacementCost: 95_000,
      sourceNote:
        "Payroll register in the data room. The partner runs operations day to day; account management on the hospital contract survives him and must be re-hired at market.",
    },
    {
      id: "bb-ab-2",
      label: "Partner's brother — weekend floor-crew lead",
      annualAmount: 28_000,
      category: "related_party",
      documentation: "partial",
      sourceNote:
        "On payroll and genuinely works the weekend strip-and-wax crew. No time records; the crew still needs a lead after close, so at most the family premium comes out.",
    },
    {
      id: "bb-ab-3",
      label: "Company truck — partner's personal use",
      annualAmount: 15_000,
      category: "mixed_use",
      documentation: "partial",
      businessUseShare: 0.6,
      sourceNote: "One F-150 on the books. Fuel-card data shows roughly 60% of mileage is site visits and supply runs.",
    },
    {
      id: "bb-ab-4",
      label: "One-time floor equipment overhaul",
      annualAmount: 26_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 2,
      recurringAnnualAverage: 22_000,
      sourceNote:
        "Invoices on file — but the ledger shows comparable auto-scrubber and burnisher rebuilds in two of the last three years. A 58-person cleaning operation eats floor machines.",
    },
    {
      id: "bb-ab-5",
      label: "Marketing and sponsorships — discretionary",
      annualAmount: 12_000,
      category: "discretionary",
      documentation: "none",
      sourceNote:
        "Characterised as the partner's personal chamber-of-commerce and youth-sports sponsorships. No detail provided; some of this plausibly generates the referral flow the listing touts.",
    },
    {
      id: "bb-ab-6",
      label: "One-time rebrand and website rebuild",
      annualAmount: 30_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 1,
      sourceNote: "Agency contract and deliverables in the data room. Completed last year; genuinely non-recurring.",
    },
    {
      id: "bb-ab-7",
      label: "Owner health insurance premiums",
      annualAmount: 19_000,
      category: "compensation",
      documentation: "verified",
      roleVacatedShare: 1,
      sourceNote: "Carrier statements on file. A personal cost that does not transfer with the business.",
    },
  ],

  /** Leased at market on an assignable lease — occupancy is clean on this one. */
  occupancy: {
    costInPandL: 84_000,
    marketAnnualRent: 84_000,
    premisesOwnedBySeller: false,
    realEstateIncludedInAsk: false,
  },

  risk: {
    topCustomerShare: 0.28,
    topThreeCustomerShare: 0.52,
    ownerHoursPerWeek: 50,
    ownerHoldsKeyRelationships: true,
    documentedSops: 6,
    longTenuredStaff: 7,
    employees: 58,
    recurringRevenueShare: 0.83,
    sbaEligible: true,
    yearsOperating: 12,
    revenueTrend3yr: 0.09,
  },

  /** Recurring-contract janitorial trades a turn higher than project-based services. */
  compMultiple: { low: 2.5, high: 3.5 },

  historyWindowYears: 3,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Deal 3 — Lone Star Route Distribution · at LOI
// ─────────────────────────────────────────────────────────────────────────────

export const LONESTAR_DEAL: DealSeed = {
  card: {
    id: "deal-lonestar-routes",
    name: "Lone Star Route Distribution",
    industry: "Route-Based Distribution",
    geography: "Dallas–Fort Worth, TX",
    ask: 1_450_000,
    claimedSde: 505_000,
    revenue: 2_380_000,
    yearsOperating: 15,
    employees: 11,
    realEstateIncluded: false,
    reasonForSale:
      "Owner is consolidating into his other distribution company two counties east; clean handoff, no competing overlap.",
    listingSource: "North Texas Business Exchange (broker listing)",
    highlights: [
      "9 protected DSD routes serving 214 grocery, convenience and institutional accounts across DFW",
      "64% of revenue on standing weekly orders; no single account above 12% of revenue",
      "Route managers run daily operations — the owner works a four-day office week",
      "14 documented SOPs covering routing, vehicle maintenance, credit and account onboarding",
      "Reviewed financials for all three trailing years; books reconcile to distributor statements",
    ],
    concerns: [
      "Two delivery trucks are past 250k miles and due for replacement within 18 months",
      "The largest supplier agreement renews annually and carries a change-of-control notice clause",
    ],
  },

  /**
   * Five claimed add-backs — a clean schedule from a seller who has sold a
   * business before. Most of it survives challenge, which is the point: the
   * engines agreeing is what makes this deal's PURSUE credible.
   *   ls-ab-1 accepted (full role vacated) · ls-ab-2 accepted · ls-ab-3 accepted (true one-time)
   *   ls-ab-4 mixed use (small) · ls-ab-5 documentation (haircut, small)
   */
  addBacks: [
    {
      id: "ls-ab-1",
      label: "Owner salary and payroll taxes",
      annualAmount: 140_000,
      category: "compensation",
      documentation: "verified",
      roleVacatedShare: 1,
      sourceNote:
        "W-2 on file. The owner's role is general management in full — route managers and the office lead stay on — so an operator-buyer absorbs the entire role.",
    },
    {
      id: "ls-ab-2",
      label: "Owner health and disability premiums",
      annualAmount: 18_000,
      category: "compensation",
      documentation: "verified",
      roleVacatedShare: 1,
      sourceNote: "Carrier statements in the data room. Personal cost, does not transfer.",
    },
    {
      id: "ls-ab-3",
      label: "One-time box-truck engine replacement",
      annualAmount: 22_000,
      category: "one_time",
      documentation: "verified",
      recurredYears: 1,
      sourceNote:
        "Single event on the ledger — fleet maintenance otherwise runs through a documented per-mile reserve the P&L already carries.",
    },
    {
      id: "ls-ab-4",
      label: "Personal use of company pickup",
      annualAmount: 9_000,
      category: "mixed_use",
      documentation: "partial",
      businessUseShare: 0.55,
      sourceNote: "Mileage app covers most of the year; a little over half the use is warehouse and account runs.",
    },
    {
      id: "ls-ab-5",
      label: "Owner cell phones and home office",
      annualAmount: 6_000,
      category: "discretionary",
      documentation: "partial",
      sourceNote: "Statements provided for the phones; the home-office allocation is asserted, not documented.",
    },
  ],

  /** Leased cross-dock warehouse at market rent; lease assignable with landlord consent. */
  occupancy: {
    costInPandL: 54_000,
    marketAnnualRent: 54_000,
    premisesOwnedBySeller: false,
    realEstateIncludedInAsk: false,
  },

  risk: {
    topCustomerShare: 0.12,
    topThreeCustomerShare: 0.29,
    ownerHoursPerWeek: 44,
    ownerHoldsKeyRelationships: false,
    documentedSops: 14,
    longTenuredStaff: 6,
    employees: 11,
    recurringRevenueShare: 0.64,
    sbaEligible: true,
    yearsOperating: 15,
    revenueTrend3yr: 0.07,
  },

  /** Protected-route DSD businesses trade in a tight band on defensible SDE. */
  compMultiple: { low: 2.4, high: 3.1 },

  historyWindowYears: 3,
} as const

// ─────────────────────────────────────────────────────────────────────────────

/**
 * The canonical seed set. Everything that renders a deal — the board, the
 * workspace tabs, the narrate route — resolves deals from this array; their
 * stage placements live in `data/pipeline.ts`.
 */
export const DEAL_SEEDS: ReadonlyArray<DealSeed> = [FOCUS_DEAL, BLUEBONNET_DEAL, LONESTAR_DEAL] as const
