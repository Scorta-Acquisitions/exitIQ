/**
 * Mandate ↔ listing matching — Certified Deal Flow's ranking engine
 * (Execution Plan item 12).
 *
 * `matchScore` returns both the weighted 0-100 score and the per-component
 * breakdown so the card can show *why* a listing matched, not just how well.
 * The score is never stored (the seed test enforces it) — recomputing against
 * the mandate is what lets a mandate edit re-rank the feed.
 *
 * Pure and content-free: listings and the mandate arrive as arguments.
 */

import { formatCompactCurrency } from "@/lib/dealiq/format"
import type { CertifiedListing, ListingMatch, Mandate, MatchComponent, MatchComponentKey } from "@/lib/dealiq/types"

/** Weights sum to 1. Industry fit dominates: a searcher can stretch geography before thesis. */
export const MATCH_WEIGHTS: Record<MatchComponentKey, number> = {
  industry: 0.35,
  geography: 0.25,
  ev_band: 0.25,
  sde_floor: 0.15,
}

export const COMPONENT_LABEL: Record<MatchComponentKey, string> = {
  industry: "Industry",
  geography: "Geography",
  ev_band: "EV band",
  sde_floor: "SDE floor",
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/**
 * 1 inside the band; outside, a linear decay over one band-width of distance,
 * so a near-miss still registers and a far miss scores 0.
 */
function bandFit(value: number, low: number, high: number): number {
  if (value >= low && value <= high) return 1
  const width = Math.max(1, high - low)
  const distance = value < low ? low - value : value - high
  return clamp01(1 - distance / width)
}

export function matchScore(listing: CertifiedListing, mandate: Mandate): ListingMatch {
  const industryFit = mandate.industries.includes(listing.industry) ? 1 : 0
  const geographyFit = mandate.geographies.includes(listing.geography) ? 1 : 0
  const evFit = bandFit(listing.ask, mandate.evBand.low, mandate.evBand.high)
  const sdeFit = listing.sde >= mandate.sdeFloor ? 1 : clamp01(listing.sde / Math.max(1, mandate.sdeFloor))

  const components: ReadonlyArray<MatchComponent> = [
    {
      key: "industry",
      label: COMPONENT_LABEL.industry,
      score: industryFit,
      weight: MATCH_WEIGHTS.industry,
      basis:
        industryFit === 1
          ? `${listing.industry} is inside the mandate`
          : `${listing.industry} sits outside the mandate's industries`,
    },
    {
      key: "geography",
      label: COMPONENT_LABEL.geography,
      score: geographyFit,
      weight: MATCH_WEIGHTS.geography,
      basis:
        geographyFit === 1
          ? `${listing.geography} is a mandate geography`
          : `${listing.geography} sits outside the mandate's geographies`,
    },
    {
      key: "ev_band",
      label: COMPONENT_LABEL.ev_band,
      score: evFit,
      weight: MATCH_WEIGHTS.ev_band,
      basis:
        evFit === 1
          ? `Ask ${formatCompactCurrency(listing.ask)} sits inside ${formatCompactCurrency(mandate.evBand.low)}–${formatCompactCurrency(mandate.evBand.high)}`
          : `Ask ${formatCompactCurrency(listing.ask)} falls outside ${formatCompactCurrency(mandate.evBand.low)}–${formatCompactCurrency(mandate.evBand.high)}`,
    },
    {
      key: "sde_floor",
      label: COMPONENT_LABEL.sde_floor,
      score: sdeFit,
      weight: MATCH_WEIGHTS.sde_floor,
      basis:
        sdeFit === 1
          ? `SDE ${formatCompactCurrency(listing.sde)} clears the ${formatCompactCurrency(mandate.sdeFloor)} floor`
          : `SDE ${formatCompactCurrency(listing.sde)} is under the ${formatCompactCurrency(mandate.sdeFloor)} floor`,
    },
  ]

  const score = 100 * components.reduce((sum, component) => sum + component.weight * component.score, 0)

  return { listingId: listing.id, score, components }
}

export type RankedListing = {
  readonly listing: CertifiedListing
  readonly match: ListingMatch
}

/** Sorted by match score, descending; equal scores keep input order. Input untouched. */
export function rankListings(
  listings: ReadonlyArray<CertifiedListing>,
  mandate: Mandate
): ReadonlyArray<RankedListing> {
  return listings
    .map((listing): RankedListing => ({ listing, match: matchScore(listing, mandate) }))
    .sort((a, b) => b.match.score - a.match.score)
}
