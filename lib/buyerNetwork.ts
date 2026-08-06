/**
 * Buyer Network — the capital-verified buyer pool behind `/network` (P1.2).
 *
 * This is the direct answer to the "we built the pool of verified buyers
 * first" claim: a ~40-buyer pool, filtered against Fieldstone's own deal
 * mandate (industry, geography, EV band — all sourced from `PERSONA`), that
 * resolves to a match funnel.
 *
 * The top 3 entries (`tier: "shortlisted"`) are the same three buyers
 * already defined in `components/scorta/OutreachStation.tsx`'s `BUYERS`
 * const — Marcus Rivera, David Chen, and Graham Voss (Kestrel Search Fund)
 * — reproduced here with the mandate metadata Outreach doesn't carry
 * (industries/geographies/EV band) so this module can run its own
 * mandate-match filter. Per the module-layering rule in CLAUDE.md
 * ("a module in lib/ must not import from app/" — and by extension not from
 * components/, which sits above lib/ in the dependency graph), this file
 * cannot import OutreachStation.tsx directly. `NetworkStation.tsx` (a
 * component, free to import both) is the one place that cross-references
 * OutreachStation's `held` flag for the live sequence detail — the
 * `sequenceHeld` field below is a hand-kept mirror of that same fact, kept
 * in sync by hand: Marcus and David are live (not held), the Graham Voss /
 * Kestrel Search Fund profile is held pending the Garden State Auto Group
 * contract (Boardroom WO 2).
 *
 * The remaining ~37 pool entries are demo seed data — not real buyers — but
 * built in the same tone/format as the shortlisted three, per the build
 * plan's explicit allowance for seeded pool records.
 *
 * The funnel numbers are computed, not asserted: with this pool, exactly 9
 * buyers (the 3 shortlisted + 6 more in the pool) satisfy `matchesMandate`
 * against Fieldstone's deal profile, 3 are shortlisted, and 2 of those 3
 * have a live (non-held) sequence — i.e. "9 mandate matches → 3 shortlisted
 * → 2 sequences live", the exact funnel the build plan calls for.
 *
 * Industry tagging note: `MATCH_INDUSTRIES` below and every buyer's
 * `mandate.industries` were originally written for a restaurant/catering
 * deal (e.g. "Restaurant / Food Service"). They've been retagged to
 * marketing/agency-appropriate strings so the same buyers — same count —
 * still resolve as matches under the new "Digital Marketing Agency"
 * mandate. Buyers deliberately built as non-matches (wrong industry group)
 * were left untouched — their industries (home services, healthcare, SaaS,
 * etc.) are still correctly unrelated to a marketing agency.
 */

import { PERSONA } from "@/lib/persona"

export type BuyerArchetype = "sba" | "search" | "micro_pe" | "independent_sponsor"

export const BUYER_ARCHETYPE_LABEL: Record<BuyerArchetype, string> = {
  sba: "SBA-Backed Operator",
  search: "Search Fund",
  micro_pe: "Micro-PE",
  independent_sponsor: "Independent Sponsor",
}

export type CapitalVerification =
  | { kind: "sba_prequal"; detail: string }
  | { kind: "proof_of_funds"; detail: string }

export type BuyerMandate = {
  industries: ReadonlyArray<string>
  geographies: ReadonlyArray<string>
  evLow: number
  evHigh: number
}

export type NetworkBuyer = {
  id: string
  name: string
  archetype: BuyerArchetype
  descriptor: string
  mandate: BuyerMandate
  verification: CapitalVerification
  /** 0 = active today. Rendered via `daysAgoLabel`. */
  lastActiveDaysAgo: number
  tier: "shortlisted" | "pool"
  /** Only meaningful for `tier: "shortlisted"` — mirrors OutreachStation.tsx's BUYERS[].held (inverted). */
  sequenceHeld?: boolean
}

/**
 * Fieldstone's own deal mandate — every field traces to `PERSONA`, never
 * invented. `evLow`/`evHigh` use the valuation range (not the single
 * recommended-listing figure) so a buyer whose band brackets the range on
 * either side still counts as a mandate match.
 */
export const FIELDSTONE_MANDATE: BuyerMandate = {
  industries: [PERSONA.business.industry], // "Digital Marketing Agency"
  geographies: [PERSONA.identity.location], // "Northern New Jersey" — see MATCH_GEOGRAPHIES below for what counts as covering it
  evLow: PERSONA.financials.valuationLow,
  evHigh: PERSONA.financials.valuationHigh,
}

/** Industry tags treated as "marketing/agency adjacent" for mandate matching. */
const MATCH_INDUSTRIES: ReadonlySet<string> = new Set([
  "Digital Marketing Agency",
  "Marketing & Advertising Services",
  "B2B Marketing Services",
  "Multi-Location Agency Groups",
])

/** Geography tags treated as covering Fieldstone's Northern NJ location. */
const MATCH_GEOGRAPHIES: ReadonlySet<string> = new Set([
  "Northern New Jersey",
  "Tri-State (NY/NJ/CT)",
  "Northeast",
  "National",
])

/**
 * A buyer matches Fieldstone's mandate when all three hold:
 *  - at least one of the buyer's target industries is marketing/agency adjacent
 *  - at least one of the buyer's target geographies covers Northern NJ
 *  - the buyer's EV band overlaps the deal's $1.6M–$1.9M valuation range
 */
export function matchesMandate(
  buyer: Pick<NetworkBuyer, "mandate">,
  deal: BuyerMandate = FIELDSTONE_MANDATE,
): boolean {
  const industryMatch = buyer.mandate.industries.some((i) => MATCH_INDUSTRIES.has(i))
  const geographyMatch = buyer.mandate.geographies.some((g) => MATCH_GEOGRAPHIES.has(g))
  const evOverlap = deal.evLow <= buyer.mandate.evHigh && deal.evHigh >= buyer.mandate.evLow
  return industryMatch && geographyMatch && evOverlap
}

export function daysAgoLabel(daysAgo: number): string {
  if (daysAgo <= 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  return `${daysAgo} days ago`
}

// ── Shortlisted tier — mirrors OutreachStation.tsx's BUYERS ─────────────────
const SHORTLISTED: ReadonlyArray<NetworkBuyer> = [
  {
    id: "marcus",
    name: "Marcus Rivera",
    archetype: "sba",
    descriptor: "First-time buyer · SBA 7(a) pre-qualified · digital marketing agency operations background · NJ-based",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Northern New Jersey", "Tri-State (NY/NJ/CT)"],
      evLow: 1_000_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 0,
    tier: "shortlisted",
    sequenceHeld: false,
  },
  {
    id: "david",
    name: "David Chen",
    archetype: "micro_pe",
    descriptor: "Independent sponsor · platform acquisition focus · recurring-retainer annuity thesis · 2 prior deals",
    mandate: {
      industries: ["Digital Marketing Agency", "B2B Marketing Services"],
      geographies: ["Northeast", "Tri-State (NY/NJ/CT)"],
      evLow: 1_500_000,
      evHigh: 3_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.5M committed capital" },
    lastActiveDaysAgo: 1,
    tier: "shortlisted",
    sequenceHeld: false,
  },
  {
    id: "search_fund",
    name: "Graham Voss",
    archetype: "search",
    descriptor: "Search Fund operator · principal at Kestrel Search Fund · single-target acquisition · contract-quality focus",
    mandate: {
      industries: ["Digital Marketing Agency", "Business Services"],
      geographies: ["National"],
      evLow: 1_500_000,
      evHigh: 2_500_000,
    },
    verification: {
      kind: "proof_of_funds",
      detail: "Committed capital confirmed — contract-quality contingent",
    },
    lastActiveDaysAgo: 3,
    tier: "shortlisted",
    sequenceHeld: true,
  },
]

// ── Pool tier — 37 seed records. Demo data, per the build plan's allowance ──
// Group 1 (6 records): match all 3 mandate dimensions — brings the total
// mandate-match count to 9 (3 shortlisted + these 6).
const POOL_MATCHING: ReadonlyArray<NetworkBuyer> = [
  {
    id: "priya-nair",
    name: "Priya Nair",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · seeking first acquisition in digital marketing",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Northern New Jersey", "Tri-State (NY/NJ/CT)"],
      evLow: 1_000_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 2,
    tier: "pool",
  },
  {
    id: "cedarbrook-search",
    name: "Cedarbrook Search Partners",
    archetype: "search",
    descriptor: "Traditional search fund · marketing & advertising services mandate",
    mandate: {
      industries: ["Marketing & Advertising Services", "Business Services"],
      geographies: ["Northeast"],
      evLow: 1_200_000,
      evHigh: 2_200_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $1.8M committed capital" },
    lastActiveDaysAgo: 5,
    tier: "pool",
  },
  {
    id: "ridgeline-micro-cap",
    name: "Ridgeline Micro-Cap Partners",
    archetype: "micro_pe",
    descriptor: "B2B marketing services platform thesis · 3 prior acquisitions",
    mandate: {
      industries: ["B2B Marketing Services", "Retail / E-commerce"],
      geographies: ["Tri-State (NY/NJ/CT)"],
      evLow: 1_500_000,
      evHigh: 2_500_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $3M committed capital" },
    lastActiveDaysAgo: 1,
    tier: "pool",
  },
  {
    id: "whitfield-cole",
    name: "Whitfield & Cole (Independent Sponsor)",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · multi-location agency group roll-up thesis",
    mandate: {
      industries: ["Multi-Location Agency Groups"],
      geographies: ["National"],
      evLow: 900_000,
      evHigh: 1_800_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2M committed capital" },
    lastActiveDaysAgo: 0,
    tier: "pool",
  },
  {
    id: "tariq-osei",
    name: "Tariq Osei",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · Northeast digital marketing focus",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Northeast"],
      evLow: 1_600_000,
      evHigh: 3_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 4,
    tier: "pool",
  },
  {
    id: "blue-harbor-search",
    name: "Blue Harbor Search Fund",
    archetype: "search",
    descriptor: "Traditional search fund · NJ-based marketing & advertising mandate",
    mandate: {
      industries: ["Marketing & Advertising Services"],
      geographies: ["Northern New Jersey"],
      evLow: 800_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.2M committed capital" },
    lastActiveDaysAgo: 6,
    tier: "pool",
  },
]

// Group 2 (10 records): right geography + EV band, wrong industry.
const POOL_WRONG_INDUSTRY: ReadonlyArray<NetworkBuyer> = [
  {
    id: "jordan-pierce",
    name: "Jordan Pierce",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · home services mandate",
    mandate: {
      industries: ["Home Services"],
      geographies: ["Northern New Jersey"],
      evLow: 1_000_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 7,
    tier: "pool",
  },
  {
    id: "hearth-home-holdings",
    name: "Hearth & Home Holdings",
    archetype: "micro_pe",
    descriptor: "Healthcare services platform thesis",
    mandate: {
      industries: ["Healthcare Services"],
      geographies: ["Tri-State (NY/NJ/CT)"],
      evLow: 1_200_000,
      evHigh: 2_200_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.6M committed capital" },
    lastActiveDaysAgo: 2,
    tier: "pool",
  },
  {
    id: "norwood-search",
    name: "Norwood Search Group",
    archetype: "search",
    descriptor: "Traditional search fund · B2B SaaS mandate",
    mandate: {
      industries: ["B2B SaaS"],
      geographies: ["Northeast"],
      evLow: 1_500_000,
      evHigh: 2_500_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.9M committed capital" },
    lastActiveDaysAgo: 9,
    tier: "pool",
  },
  {
    id: "elena-cho",
    name: "Elena Cho",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · light manufacturing mandate",
    mandate: {
      industries: ["Manufacturing"],
      geographies: ["National"],
      evLow: 900_000,
      evHigh: 1_800_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 0,
    tier: "pool",
  },
  {
    id: "fenwick-capital",
    name: "Fenwick Capital",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · auto services roll-up thesis",
    mandate: {
      industries: ["Auto Services"],
      geographies: ["Northern New Jersey"],
      evLow: 1_600_000,
      evHigh: 3_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $3.2M committed capital" },
    lastActiveDaysAgo: 3,
    tier: "pool",
  },
  {
    id: "briarwood-partners",
    name: "Briarwood Partners",
    archetype: "micro_pe",
    descriptor: "Fitness & wellness platform thesis",
    mandate: {
      industries: ["Fitness & Wellness"],
      geographies: ["Tri-State (NY/NJ/CT)"],
      evLow: 800_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.1M committed capital" },
    lastActiveDaysAgo: 4,
    tier: "pool",
  },
  {
    id: "diego-fuentes",
    name: "Diego Fuentes",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · pet services mandate",
    mandate: {
      industries: ["Pet Services"],
      geographies: ["Northeast"],
      evLow: 1_000_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 5,
    tier: "pool",
  },
  {
    id: "halcyon-search",
    name: "Halcyon Search Partners",
    archetype: "search",
    descriptor: "Traditional search fund · commercial cleaning mandate",
    mandate: {
      industries: ["Commercial Cleaning"],
      geographies: ["National"],
      evLow: 1_200_000,
      evHigh: 2_200_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.4M committed capital" },
    lastActiveDaysAgo: 1,
    tier: "pool",
  },
  {
    id: "brianna-walsh",
    name: "Brianna Walsh",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · IT services mandate",
    mandate: {
      industries: ["IT Services"],
      geographies: ["Northern New Jersey"],
      evLow: 1_500_000,
      evHigh: 2_500_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 6,
    tier: "pool",
  },
  {
    id: "redstone-holdings",
    name: "Redstone Independent Holdings",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · construction services roll-up thesis",
    mandate: {
      industries: ["Construction Services"],
      geographies: ["Tri-State (NY/NJ/CT)"],
      evLow: 900_000,
      evHigh: 1_800_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2M committed capital" },
    lastActiveDaysAgo: 8,
    tier: "pool",
  },
]

// Group 3 (10 records): right industry + EV band, wrong (out-of-region) geography.
const POOL_WRONG_GEOGRAPHY: ReadonlyArray<NetworkBuyer> = [
  {
    id: "caleb-simmons",
    name: "Caleb Simmons",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · Southeast digital marketing focus",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Southeast (GA/FL)"],
      evLow: 1_000_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 3,
    tier: "pool",
  },
  {
    id: "palmetto-search",
    name: "Palmetto Search Partners",
    archetype: "search",
    descriptor: "Traditional search fund · Texas marketing & advertising mandate",
    mandate: {
      industries: ["Marketing & Advertising Services"],
      geographies: ["Texas"],
      evLow: 1_200_000,
      evHigh: 2_200_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.5M committed capital" },
    lastActiveDaysAgo: 5,
    tier: "pool",
  },
  {
    id: "ironwood-micro",
    name: "Ironwood Micro Partners",
    archetype: "micro_pe",
    descriptor: "B2B marketing services platform thesis · Pacific Northwest",
    mandate: {
      industries: ["B2B Marketing Services"],
      geographies: ["Pacific Northwest"],
      evLow: 1_500_000,
      evHigh: 2_500_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.8M committed capital" },
    lastActiveDaysAgo: 2,
    tier: "pool",
  },
  {
    id: "renata-ford",
    name: "Renata Ford",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · Midwest digital marketing focus",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Midwest (IL/OH)"],
      evLow: 900_000,
      evHigh: 1_800_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 0,
    tier: "pool",
  },
  {
    id: "vantage-point",
    name: "Vantage Point Sponsors",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · Southern California multi-location agency thesis",
    mandate: {
      industries: ["Multi-Location Agency Groups"],
      geographies: ["Southern California"],
      evLow: 1_600_000,
      evHigh: 3_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $3.4M committed capital" },
    lastActiveDaysAgo: 7,
    tier: "pool",
  },
  {
    id: "summit-search",
    name: "Summit Search Co.",
    archetype: "search",
    descriptor: "Traditional search fund · Mountain West digital marketing mandate",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Mountain West (CO/UT)"],
      evLow: 800_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.3M committed capital" },
    lastActiveDaysAgo: 4,
    tier: "pool",
  },
  {
    id: "owen-blackwell",
    name: "Owen Blackwell",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · Gulf Coast marketing & advertising focus",
    mandate: {
      industries: ["Marketing & Advertising Services"],
      geographies: ["Gulf Coast"],
      evLow: 1_000_000,
      evHigh: 2_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 9,
    tier: "pool",
  },
  {
    id: "northbridge-capital",
    name: "Northbridge Capital Partners",
    archetype: "micro_pe",
    descriptor: "B2B marketing services platform thesis · Upper Midwest",
    mandate: {
      industries: ["B2B Marketing Services"],
      geographies: ["Upper Midwest (MN/WI)"],
      evLow: 1_200_000,
      evHigh: 2_200_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.7M committed capital" },
    lastActiveDaysAgo: 1,
    tier: "pool",
  },
  {
    id: "sasha-klein",
    name: "Sasha Klein",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · Mid-Atlantic digital marketing focus",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Mid-Atlantic (VA/MD)"],
      evLow: 1_500_000,
      evHigh: 2_500_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 6,
    tier: "pool",
  },
  {
    id: "lighthouse-independent",
    name: "Lighthouse Independent Partners",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · New England multi-location agency thesis",
    mandate: {
      industries: ["Multi-Location Agency Groups"],
      geographies: ["New England (non-NY/NJ/CT)"],
      evLow: 900_000,
      evHigh: 1_800_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $2.2M committed capital" },
    lastActiveDaysAgo: 3,
    tier: "pool",
  },
]

// Group 4 (6 records): right industry + geography, wrong (out-of-band) EV.
const POOL_WRONG_EV: ReadonlyArray<NetworkBuyer> = [
  {
    id: "nathaniel-brooks",
    name: "Nathaniel Brooks",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · seeking a larger platform deal",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Northern New Jersey"],
      evLow: 3_000_000,
      evHigh: 8_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 2,
    tier: "pool",
  },
  {
    id: "meridian-search",
    name: "Meridian Search Fund",
    archetype: "search",
    descriptor: "Traditional search fund · larger-check marketing & advertising mandate",
    mandate: {
      industries: ["Marketing & Advertising Services"],
      geographies: ["Northeast"],
      evLow: 4_000_000,
      evHigh: 10_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $6M committed capital" },
    lastActiveDaysAgo: 5,
    tier: "pool",
  },
  {
    id: "cobalt-micro-cap",
    name: "Cobalt Micro-Cap",
    archetype: "micro_pe",
    descriptor: "B2B marketing services platform thesis · smaller-check focus",
    mandate: {
      industries: ["B2B Marketing Services"],
      geographies: ["Tri-State (NY/NJ/CT)"],
      evLow: 250_000,
      evHigh: 900_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $700K committed capital" },
    lastActiveDaysAgo: 0,
    tier: "pool",
  },
  {
    id: "grace-odom",
    name: "Grace Odom",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · smaller-check digital marketing focus",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["National"],
      evLow: 300_000,
      evHigh: 1_000_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 4,
    tier: "pool",
  },
  {
    id: "anchorpoint-sponsors",
    name: "Anchorpoint Sponsors",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · larger-check multi-location agency thesis",
    mandate: {
      industries: ["Multi-Location Agency Groups"],
      geographies: ["Northern New Jersey"],
      evLow: 5_000_000,
      evHigh: 12_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $8M committed capital" },
    lastActiveDaysAgo: 6,
    tier: "pool",
  },
  {
    id: "deepwater-search",
    name: "Deepwater Search Partners",
    archetype: "search",
    descriptor: "Traditional search fund · smaller-check digital marketing focus",
    mandate: {
      industries: ["Digital Marketing Agency"],
      geographies: ["Northeast"],
      evLow: 200_000,
      evHigh: 800_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $500K committed capital" },
    lastActiveDaysAgo: 8,
    tier: "pool",
  },
]

// Group 5 (5 records): out of scope on every dimension — rounds out the pool.
const POOL_OUT_OF_SCOPE: ReadonlyArray<NetworkBuyer> = [
  {
    id: "titan-industrial",
    name: "Titan Industrial Partners",
    archetype: "micro_pe",
    descriptor: "Manufacturing platform thesis · national large-cap focus",
    mandate: {
      industries: ["Manufacturing"],
      geographies: ["Texas"],
      evLow: 5_000_000,
      evHigh: 15_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $12M committed capital" },
    lastActiveDaysAgo: 12,
    tier: "pool",
  },
  {
    id: "coastal-health-search",
    name: "Coastal Health Search Group",
    archetype: "search",
    descriptor: "Traditional search fund · healthcare services mandate",
    mandate: {
      industries: ["Healthcare Services"],
      geographies: ["Southern California"],
      evLow: 2_500_000,
      evHigh: 6_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $4M committed capital" },
    lastActiveDaysAgo: 10,
    tier: "pool",
  },
  {
    id: "yusuf-rahman",
    name: "Yusuf Rahman",
    archetype: "sba",
    descriptor: "SBA pre-qualified operator · IT services mandate",
    mandate: {
      industries: ["IT Services"],
      geographies: ["Pacific Northwest"],
      evLow: 500_000,
      evHigh: 1_200_000,
    },
    verification: { kind: "sba_prequal", detail: "SBA 7(a) pre-qualified" },
    lastActiveDaysAgo: 11,
    tier: "pool",
  },
  {
    id: "granite-state-sponsors",
    name: "Granite State Sponsors",
    archetype: "independent_sponsor",
    descriptor: "Independent sponsor · construction services roll-up thesis",
    mandate: {
      industries: ["Construction Services"],
      geographies: ["Mountain West (CO/UT)"],
      evLow: 4_000_000,
      evHigh: 9_000_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $6M committed capital" },
    lastActiveDaysAgo: 14,
    tier: "pool",
  },
  {
    id: "palisade-capital",
    name: "Palisade Capital",
    archetype: "micro_pe",
    descriptor: "B2B SaaS platform thesis",
    mandate: {
      industries: ["B2B SaaS"],
      geographies: ["Midwest (IL/OH)"],
      evLow: 600_000,
      evHigh: 1_500_000,
    },
    verification: { kind: "proof_of_funds", detail: "Proof of funds on file — $1.4M committed capital" },
    lastActiveDaysAgo: 13,
    tier: "pool",
  },
]

/** Full pool — 3 shortlisted + 37 seed records = 40 buyers. */
export const NETWORK_BUYERS: ReadonlyArray<NetworkBuyer> = [
  ...SHORTLISTED,
  ...POOL_MATCHING,
  ...POOL_WRONG_INDUSTRY,
  ...POOL_WRONG_GEOGRAPHY,
  ...POOL_WRONG_EV,
  ...POOL_OUT_OF_SCOPE,
]

export function getShortlistedBuyers(): ReadonlyArray<NetworkBuyer> {
  return NETWORK_BUYERS.filter((b) => b.tier === "shortlisted")
}

export function getMandateMatches(
  deal: BuyerMandate = FIELDSTONE_MANDATE,
): ReadonlyArray<NetworkBuyer> {
  return NETWORK_BUYERS.filter((b) => matchesMandate(b, deal))
}

export type NetworkFunnel = {
  totalBuyers: number
  mandateMatches: number
  shortlisted: number
  sequencesLive: number
}

/** "9 mandate matches → 3 shortlisted → 2 sequences live" — computed, not asserted. */
export function getNetworkFunnel(): NetworkFunnel {
  const shortlisted = getShortlistedBuyers()
  return {
    totalBuyers: NETWORK_BUYERS.length,
    mandateMatches: getMandateMatches().length,
    shortlisted: shortlisted.length,
    sequencesLive: shortlisted.filter((b) => b.sequenceHeld === false).length,
  }
}
