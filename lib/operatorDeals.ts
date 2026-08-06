/**
 * Operator Deals — the "20 deals per operator vs industry's 4–6" claim,
 * rendered rather than merely asserted (P2.1). `.claude/Product Roadmap -
 * Current and Next Three Quarters.md` and `.claude/Scorta-AI-Agent-Native.md`
 * both cite this as the core unit-economics argument for the agent-native
 * model, but nothing in the product actually showed it before this module —
 * it only ever lived in prose.
 *
 * This is the OPERATOR's view — a Scorta team member managing many sellers'
 * deals concurrently — not the seller's own view (Amara only ever sees
 * Fieldstone; see `lib/persona.ts` / `STATIONS`). It deliberately does
 * NOT live in `STATIONS`: mixing "one seller's own deal stations" with
 * "every seller's deal, including other people's" in the same rail would be
 * a category error. It gets its own route (`/deals`) and its own access
 * point in `AppShell.tsx`.
 *
 * 7 of the 8 tiles are fictional demo seed data — clearly marked as such
 * below, per the same allowance already used for `lib/buyerNetwork.ts`'s
 * ~37-record pool. Their verticals are drawn only from the roadmap's actual
 * Phase-1 set — home services, restaurants/franchises, digital marketing
 * agencies — never a fourth. Elapsed-day counts and blockers are invented
 * but written in the same register as the real blockers already documented
 * in `lib/caseChat.ts` / `lib/auditTrail.ts` (a named account or vendor, a
 * concrete percentage, a specific document) rather than generic
 * "waiting on documents" filler.
 *
 * Stage + owning agent for every tile — fictional and real — are derived
 * from `STATIONS` (`lib/persona.ts`) by href, never hand-typed twice, so a
 * deal's stage label can never drift from the rail's own wording.
 *
 * The 8th tile is Amara's real deal: business name and industry come
 * verbatim from `PERSONA`, the day count comes live from `getDealClock()`
 * (the same function driving the Deal Clock pill in `AppShell.tsx`), and the
 * blocker mirrors the Garden State Auto Group / Search Fund hold already
 * documented in `lib/caseChat.ts`'s `OPENING_MESSAGE` and
 * `lib/auditTrail.ts`'s entries. That Amara reaches Buyer Outreach in 4 days
 * while several fictional deals are still earlier in the lifecycle on day
 * 13-24 is the point of the view, not a data inconsistency: it's the visual
 * proof of "we rebuilt the agent stack around speed to close." (Note: the
 * live deal's vertical is `digital_marketing`, same as 3 of the seed deals —
 * that makes 4 of 8 tiles "digital marketing." Still fine: all three roadmap
 * verticals remain represented, just less evenly split than before.)
 */

import { getDealClock } from "@/lib/dealClock"
import { PERSONA, type Station, STATIONS } from "@/lib/persona"

export type OperatorVertical = "home_services" | "restaurants_franchises" | "digital_marketing"

/** The roadmap's exact Phase-1 vertical set (`Product Roadmap` line 7) — never a fourth. */
export const VERTICAL_LABEL: Record<OperatorVertical, string> = {
  home_services: "Home Services",
  restaurants_franchises: "Restaurants / Franchises",
  digital_marketing: "Digital Marketing Agencies",
}

/**
 * Vertical accent colors — plain data, lives here (not in a `"use client"`
 * component) so both a client component (`OperatorDealsStation`) and a server
 * component (`DealSnapshotStation`) can import it directly. A server
 * component importing a plain constant from a client module doesn't survive
 * the RSC boundary reliably — keep shared data in `lib/`, not in a client file.
 */
export const VERTICAL_ACCENT: Record<OperatorVertical, { accent: string; soft: string; edge: string }> = {
  home_services: { accent: "var(--sky, #4a7ba8)", soft: "rgba(74,123,168,.10)", edge: "var(--sky-edge, rgba(74,123,168,.26))" },
  restaurants_franchises: { accent: "var(--mint, #2c8c70)", soft: "rgba(44,140,112,.10)", edge: "var(--mint-edge, rgba(44,140,112,.28))" },
  digital_marketing: { accent: "var(--lav, #6b5db0)", soft: "rgba(107,93,176,.10)", edge: "var(--lav-edge, rgba(107,93,176,.26))" },
}

export type OperatorDeal = {
  id: string
  businessName: string
  vertical: OperatorVertical
  /** Display industry line — Amara's is `PERSONA.business.industry` verbatim. */
  industry: string
  /** Current lifecycle stage — sourced from `STATIONS[].label`, never hand-typed. */
  stage: string
  /** Owning agent for the current stage — sourced from `STATIONS[].agent`. */
  agent: string
  elapsedDays: number
  blocker: string
  /** True only for Fieldstone — the one tile backed by live persona/deal-clock data. */
  isLiveDeal?: boolean
}

/** Looks up a station's stage label + owning agent by href — the single source of truth for both. */
function stationMeta(href: string): { stage: string; agent: string } {
  const station = STATIONS.find((s) => s.href === href)
  if (!station) {
    throw new Error(`operatorDeals: unknown station href "${href}"`)
  }
  return { stage: station.label, agent: station.agent }
}

type SeedDeal = Omit<OperatorDeal, "stage" | "agent"> & { stationHref: string }

/** 7 fictional demo deals — seed data, not real buyers or sellers. */
const SEED_DEALS: ReadonlyArray<SeedDeal> = [
  {
    id: "crestwood-electrical",
    businessName: "Crestwood Electrical Services",
    vertical: "home_services",
    industry: VERTICAL_LABEL.home_services,
    stationHref: "/connect",
    elapsedDays: 2,
    blocker:
      "QuickBooks connector re-authorization pending after the seller's bookkeeper migrated to a new company file",
  },
  {
    id: "harbor-co-media",
    businessName: "Harbor & Co. Media",
    vertical: "digital_marketing",
    industry: VERTICAL_LABEL.digital_marketing,
    stationHref: "/ingestion",
    elapsedDays: 5,
    blocker:
      "Ingestion Agent flagged $42K of unreconciled ad-spend pass-through billing pending client invoice matching",
  },
  {
    id: "golden-wok-franchise",
    businessName: "Golden Wok Franchise Group",
    vertical: "restaurants_franchises",
    industry: VERTICAL_LABEL.restaurants_franchises,
    stationHref: "/recast",
    elapsedDays: 8,
    blocker:
      "Golden Wok Corporate's royalty statement reconciliation pending — required to normalize SDE add-backs across all 3 units",
  },
  {
    id: "ferretti-hvac",
    businessName: "Ferretti HVAC & Plumbing",
    vertical: "home_services",
    industry: VERTICAL_LABEL.home_services,
    stationHref: "/risk",
    elapsedDays: 13,
    blocker:
      "Meridian Property Group's commercial maintenance contract (31% of revenue) needs a 3-year renewal before the Concentration Agent clears risk",
  },
  {
    id: "bright-path-digital",
    businessName: "Bright Path Digital Marketing",
    vertical: "digital_marketing",
    industry: VERTICAL_LABEL.digital_marketing,
    stationHref: "/boardroom",
    elapsedDays: 15,
    blocker:
      "Alden Health Systems retainer renewal (22% of revenue) pending signature before the Boardroom dispatches the buyer fleet",
  },
  {
    id: "northline-growth",
    businessName: "Northline Growth Partners",
    vertical: "digital_marketing",
    industry: VERTICAL_LABEL.digital_marketing,
    stationHref: "/documents",
    elapsedDays: 19,
    blocker: "Client concentration disclosure schedule awaiting the seller's attorney sign-off before CIM publication",
  },
  {
    id: "summit-lawn-landscape",
    businessName: "Summit Lawn & Landscape",
    vertical: "home_services",
    industry: VERTICAL_LABEL.home_services,
    stationHref: "/lenders",
    elapsedDays: 24,
    blocker:
      "SBA lender (Northeast Community Bank) awaiting an updated equipment-lien payoff letter from CNH Capital",
  },
]

/**
 * The 8th, real tile — Fieldstone Digital Marketing. Sourced from `PERSONA`
 * and `getDealClock()`, not invented, so the multi-deal view visibly
 * connects back to the exact deal the rest of the demo just walked through.
 */
function getFieldstoneDeal(): SeedDeal {
  const clock = getDealClock()
  return {
    id: "fieldstone-digital",
    businessName: PERSONA.identity.businessName,
    vertical: "digital_marketing",
    industry: PERSONA.business.industry,
    stationHref: "/buyers",
    elapsedDays: clock.dayNumber,
    blocker:
      "Garden State Auto Group's 3-year contract confirmation pending — the Search Fund outreach sequence is held until it clears",
    isLiveDeal: true,
  }
}

/** All 8 concurrent deals — 7 seeded + Fieldstone (live), stage/agent resolved from `STATIONS`. */
export function getOperatorDeals(): ReadonlyArray<OperatorDeal> {
  const seeds = [...SEED_DEALS, getFieldstoneDeal()]
  return seeds.map(({ stationHref, ...rest }) => ({
    ...rest,
    ...stationMeta(stationHref),
  }))
}

export type AttentionItem = {
  id: string
  businessName: string
  blocker: string
  elapsedDays: number
}

/**
 * Every deal's current blocker, surfaced as a flat "Attention Needed" queue
 * for the operator console — sorted by `elapsedDays` descending (oldest-stuck
 * deal first). That's a derivable ordering from data that already exists on
 * `OperatorDeal`, not an invented priority score, and reuses the exact
 * `blocker` string `OperatorDealsStation`'s deal cards already render — no new
 * field, no separate approval-registry data model.
 */
export function getAttentionQueue(): ReadonlyArray<AttentionItem> {
  return [...getOperatorDeals()]
    .sort((a, b) => b.elapsedDays - a.elapsedDays)
    .map(({ id, businessName, blocker, elapsedDays }) => ({ id, businessName, blocker, elapsedDays }))
}

const FIELDSTONE_DEAL_ID = "fieldstone-digital"

/** True iff `dealId` is the one live deal — compare via this, never a hardcoded string. */
export function isLiveDeal(dealId: string): boolean {
  return dealId === FIELDSTONE_DEAL_ID
}

// ── Snapshot data model — a lightweight "click into a deal" view, deliberately
// NOT the full `Persona` shape. Forcing sparse seed data into that type would
// mean inventing values for dozens of fields the snapshot never shows. ──────
export type DealSnapshotFinancials = {
  revenueDisplay: string
  sdeDisplay: string
  valuationLowDisplay: string
  valuationHighDisplay: string
  appliedMultiple: number
}

export type DealSnapshotScore = {
  overall: number
  grade: "A" | "B" | "C" | "D"
  label: string
}

export type DealSnapshotNextStep = { label: string; done: boolean }

export type DealSnapshot = OperatorDeal & {
  ownerFirstName: string
  financials: DealSnapshotFinancials
  score: DealSnapshotScore
  nextSteps: ReadonlyArray<DealSnapshotNextStep>
}

type SnapshotExtras = {
  ownerFirstName: string
  financials: DealSnapshotFinancials
  score: DealSnapshotScore
  nextSteps: ReadonlyArray<DealSnapshotNextStep>
}

/**
 * Per-deal snapshot extras for the 7 fictional deals — headline numbers only,
 * scaled against each deal's own `elapsedDays`/`blocker` (already authored
 * above) so later-stage deals read as more prepared. Not a second narrative
 * pass — a handful of numbers per deal, same register as the existing
 * `blocker` strings (named accounts/vendors/percentages, not generic filler).
 */
const SNAPSHOT_EXTRAS: Record<string, SnapshotExtras> = {
  "crestwood-electrical": {
    ownerFirstName: "Dana",
    financials: {
      revenueDisplay: "$890K",
      sdeDisplay: "$195K",
      valuationLowDisplay: "$290K",
      valuationHighDisplay: "$350K",
      appliedMultiple: 1.6,
    },
    score: { overall: 28, grade: "D", label: "Early Intake" },
    nextSteps: [
      { label: "Re-authorize QuickBooks connector under new company file", done: false },
      { label: "Confirm bank + POS feed mapping with the Ingestion Agent", done: false },
    ],
  },
  "harbor-co-media": {
    ownerFirstName: "Priya",
    financials: {
      revenueDisplay: "$1.3M",
      sdeDisplay: "$340K",
      valuationLowDisplay: "$510K",
      valuationHighDisplay: "$610K",
      appliedMultiple: 1.7,
    },
    score: { overall: 33, grade: "D", label: "Early Intake" },
    nextSteps: [
      { label: "Authorize platform connectors (QuickBooks, Stripe)", done: true },
      { label: "Resolve $42K unreconciled ad-spend billing", done: false },
      { label: "Clear Ingestion Agent classification pass", done: false },
    ],
  },
  "golden-wok-franchise": {
    ownerFirstName: "Wei",
    financials: {
      revenueDisplay: "$2.6M",
      sdeDisplay: "$480K",
      valuationLowDisplay: "$820K",
      valuationHighDisplay: "$960K",
      appliedMultiple: 1.9,
    },
    score: { overall: 41, grade: "D", label: "Early Intake" },
    nextSteps: [
      { label: "Authorize connectors across all 3 units", done: true },
      { label: "Reconcile Golden Wok Corporate royalty statements", done: false },
      { label: "Normalize SDE add-backs per unit", done: false },
    ],
  },
  "ferretti-hvac": {
    ownerFirstName: "Tony",
    financials: {
      revenueDisplay: "$1.7M",
      sdeDisplay: "$410K",
      valuationLowDisplay: "$740K",
      valuationHighDisplay: "$860K",
      appliedMultiple: 2.0,
    },
    score: { overall: 47, grade: "C", label: "Needs Preparation" },
    nextSteps: [
      { label: "Complete financials recast and add-back schedule", done: true },
      { label: "Secure 3-year renewal on the Meridian Property Group contract", done: false },
      { label: "Clear Concentration Agent risk review", done: false },
    ],
  },
  "bright-path-digital": {
    ownerFirstName: "Jordan",
    financials: {
      revenueDisplay: "$1.9M",
      sdeDisplay: "$520K",
      valuationLowDisplay: "$940K",
      valuationHighDisplay: "$1.09M",
      appliedMultiple: 2.1,
    },
    score: { overall: 53, grade: "C", label: "Needs Preparation" },
    nextSteps: [
      { label: "Clear Owner-Dependency and Concentration risk review", done: true },
      { label: "Get signature on the Alden Health Systems retainer renewal", done: false },
      { label: "Boardroom dispatch of the buyer fleet", done: false },
    ],
  },
  "northline-growth": {
    ownerFirstName: "Sam",
    financials: {
      revenueDisplay: "$2.3M",
      sdeDisplay: "$610K",
      valuationLowDisplay: "$1.16M",
      valuationHighDisplay: "$1.34M",
      appliedMultiple: 2.2,
    },
    score: { overall: 58, grade: "C", label: "Needs Preparation" },
    nextSteps: [
      { label: "Boardroom dispatches the agent fleet", done: true },
      { label: "Attorney sign-off on the client concentration disclosure schedule", done: false },
      { label: "Publish CIM to the Virtual Data Room", done: false },
    ],
  },
  "summit-lawn-landscape": {
    ownerFirstName: "Carlos",
    financials: {
      revenueDisplay: "$1.55M",
      sdeDisplay: "$430K",
      valuationLowDisplay: "$810K",
      valuationHighDisplay: "$940K",
      appliedMultiple: 2.0,
    },
    score: { overall: 64, grade: "B", label: "Well-Positioned" },
    nextSteps: [
      { label: "Publish CIM to the Virtual Data Room", done: true },
      { label: "Obtain updated equipment-lien payoff letter from CNH Capital", done: false },
      { label: "Clear SBA lender (Northeast Community Bank) underwriting", done: false },
    ],
  },
}

/** Looks up a station's index in STATIONS by label — throws on miss, same posture as `stationMeta()`. */
function stationIndexByLabel(label: string): number {
  const idx = STATIONS.findIndex((s) => s.label === label)
  if (idx === -1) {
    throw new Error(`operatorDeals: unknown STATIONS label "${label}"`)
  }
  return idx
}

export type StationProgress = {
  reached: ReadonlyArray<Station>
  notReached: ReadonlyArray<Station>
}

/**
 * Given a deal's current `stage` (a STATIONS label), split STATIONS into what
 * the deal has reached vs. not — skipping index 0 ("Seller Home") since every
 * deal is implicitly past it. This is the "honest gating" mechanism: a deal
 * that's only reached Ingestion genuinely hasn't had a Boardroom red-team done
 * yet, so we say so rather than inventing content for it.
 */
export function getStationProgress(stage: string): StationProgress {
  const currentIndex = stationIndexByLabel(stage)
  return {
    reached: STATIONS.filter((_, i) => i > 0 && i <= currentIndex),
    notReached: STATIONS.filter((_, i) => i > currentIndex),
  }
}

/** Resolves a deal id to its lightweight snapshot, or null if unknown. */
export function getDealSnapshot(dealId: string): DealSnapshot | null {
  const deal = getOperatorDeals().find((d) => d.id === dealId)
  if (!deal) return null

  if (isLiveDeal(dealId)) {
    return {
      ...deal,
      ownerFirstName: PERSONA.identity.firstName,
      financials: {
        revenueDisplay: PERSONA.financials.revenueDisplay,
        sdeDisplay: PERSONA.financials.sdeDisplay,
        valuationLowDisplay: PERSONA.financials.valuationLowDisplay,
        valuationHighDisplay: PERSONA.financials.valuationHighDisplay,
        appliedMultiple: PERSONA.financials.appliedMultiple,
      },
      score: { overall: PERSONA.exitIQ.score, grade: PERSONA.exitIQ.grade, label: PERSONA.exitIQ.label },
      nextSteps: PERSONA.nextSteps.map((s) => ({ label: s.action, done: s.status === "done" })),
    }
  }

  const extras = SNAPSHOT_EXTRAS[dealId]
  if (!extras) return null // defensive; every SEED_DEALS id has an extras entry
  return { ...deal, ...extras }
}
