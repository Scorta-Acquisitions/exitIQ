/**
 * DealIQ — the single type module.
 *
 * Every shape the buy-side renders, computes, or transports is declared here and
 * nowhere else (Execution Plan §3 item 1 DoD: "every type exported from one
 * module"). Engine modules import their input/output types from here rather than
 * declaring their own, which is what lets the surfaces in `components/dealiq/`
 * be built against signatures before the engines exist.
 *
 * Two rules this file exists to enforce:
 *
 * 1. **No business facts.** Types describe shape, never value. Content lives in
 *    `lib/dealiq/data/` behind the placeholder banner and is swapped wholesale.
 * 2. **No sell-side coupling.** Nothing under `lib/dealiq/` imports the seller
 *    workspace's persona module, or anything else outside `lib/dealiq/`. If the
 *    two products need to agree on something, that agreement is authored in the
 *    content pass — not created as a code dependency here. Enforced
 *    mechanically by `__tests__/data.structure.test.ts`.
 *
 * Derived figures are deliberately absent from the seed types. `DealCard` carries
 * `ask` and `claimedSde` but not the multiple; `PipelineDeal` carries a stage but
 * the funnel counts are computed. Nothing that can be derived is storable.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Screen verdict. Color mapping lives in `format.ts` — never inline in a component. */
export type Verdict = "PASS" | "DIG" | "PURSUE"

export const VERDICTS: ReadonlyArray<Verdict> = ["PASS", "DIG", "PURSUE"]

/** Evidence quality behind a claimed add-back. Drives the documentation rule. */
export type DocumentationQuality = "verified" | "partial" | "none"

export const DOCUMENTATION_QUALITIES: ReadonlyArray<DocumentationQuality> = ["verified", "partial", "none"]

/** Where a deal sits on the buyer's own board. Ordered by `PIPELINE_STAGES` in `navigation.ts`. */
export type PipelineStage = "sourced" | "screened" | "diligence" | "loi"

export const PIPELINE_STAGE_KEYS: ReadonlyArray<PipelineStage> = ["sourced", "screened", "diligence", "loi"]

/** Returns-model scenarios. Input modifiers into one engine — never UI branches. */
export type ScenarioKey = "base" | "transition" | "stress" | "occupancy"

export const SCENARIO_KEYS: ReadonlyArray<ScenarioKey> = ["base", "transition", "stress", "occupancy"]

/** Band a 0-100 score falls into. Drives bar/dial color without per-deal special-casing. */
export type ScoreBand = "weak" | "mixed" | "strong"

/** Where a rendered figure or string came from. Surfaced as a neutral mono chip. */
export type Provenance = "live" | "fallback" | "fixture"

/** Low/high band of an SDE multiple, used for comp framing and fair value. */
export type MultipleBand = {
  readonly low: number
  readonly high: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation keys (values live in `navigation.ts`)
// ─────────────────────────────────────────────────────────────────────────────

/** The five deal-workspace tabs. These are the literal `?tab=` values. */
export type DealTabKey = "score" | "recast" | "returns" | "diligence" | "loi"

export const DEAL_TAB_KEYS: ReadonlyArray<DealTabKey> = ["score", "recast", "returns", "diligence", "loi"]

/** The four global destinations. Icon is a key; the shell owns the glyph. */
export type DealIqNavIcon = "pipeline" | "screen" | "flow" | "verify"

export type DealIqNavItem = {
  readonly href: string
  readonly label: string
  readonly icon: DealIqNavIcon
}

export type DealTabItem = {
  readonly key: DealTabKey
  readonly label: string
  /** Short form for narrow viewports. */
  readonly shortLabel: string
}

export type PipelineStageMeta = {
  readonly key: PipelineStage
  readonly label: string
  /** One-line description of what "being in this stage" means, for the board header. */
  readonly meaning: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Buyer
// ─────────────────────────────────────────────────────────────────────────────

export type BuyerArchetype = "search_fund" | "sba_operator" | "micro_pe" | "independent_sponsor"

export type VerificationMethod = "proof_of_funds" | "sba_prequal" | "fund_commitment"

/** The buyer's acquisition criteria. Drives certified-flow matching. */
export type Mandate = {
  readonly industries: ReadonlyArray<string>
  readonly geographies: ReadonlyArray<string>
  readonly evBand: MultipleBand
  readonly sdeFloor: number
  /** Reject above this owner-dependency score (0-100, higher = more dependent). */
  readonly maxOwnerDependency: number
  /** Optional floor the buyer's lender imposes. */
  readonly minDscr?: number
}

export type BuyerProfile = {
  readonly id: string
  readonly name: string
  readonly initials: string
  readonly title: string
  readonly firmName: string
  readonly location: string
  readonly archetype: BuyerArchetype
  readonly committedCapital: number
  readonly capitalVerified: boolean
  readonly verificationMethod: VerificationMethod
  /** ISO date. Seeded, never `Date.now()` — the demo must not drift. */
  readonly verifiedOn: string
  /** Rank within the verified buyer pool, 1 = strongest. */
  readonly poolRank: number
  readonly poolSize: number
  readonly mandate: Mandate
  readonly bio?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline
// ─────────────────────────────────────────────────────────────────────────────

export type PipelineDeal = {
  readonly id: string
  readonly name: string
  readonly industry: string
  readonly geography: string
  readonly ask: number
  readonly claimedSde: number
  /** `null` until the deal has been screened — the board must render that state. */
  readonly score: number | null
  readonly verdict: Verdict | null
  readonly stage: PipelineStage
  readonly daysInStage: number
  readonly lastAgentAction: string
  /** Present only on deals the buyer killed; renders as the card's reason line. */
  readonly killReason?: string
}

/** One computed funnel step. Counts are derived from the deal list, never typed. */
export type FunnelStep = {
  readonly key: PipelineStage
  readonly label: string
  readonly count: number
  /** Share of the widest step, 0-1 — drives the bar width. */
  readonly share: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Deal card (ingestion output)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The structured result of screening a listing. This is both the `POST
 * /api/dealiq/screen` response payload and the header-fact source for the deal
 * workspace. No derived figure appears here — the multiple is computed.
 */
export type DealCard = {
  readonly id: string
  readonly name: string
  readonly industry: string
  readonly geography: string
  readonly ask: number
  readonly claimedSde: number
  readonly revenue?: number
  readonly yearsOperating?: number
  readonly employees?: number
  readonly realEstateIncluded?: boolean
  readonly reasonForSale?: string
  readonly listingSource?: string
  readonly highlights: ReadonlyArray<string>
  readonly concerns: ReadonlyArray<string>
}

/**
 * Everything the engines need about one deal, in one object.
 *
 * A seed carries *claims and facts only*. It never carries a defensible SDE, a
 * fair value, a score, or a verdict — those are engine outputs, and typing one
 * here by hand would be the exact violation §1 rule 4 exists to prevent.
 */
export type DealSeed = {
  readonly card: DealCard
  readonly addBacks: ReadonlyArray<ClaimedAddBack>
  readonly occupancy: OccupancyInput
  readonly risk: DealRiskInputs
  readonly compMultiple: MultipleBand
  /** Trailing years the add-back schedule was built from — the reserve rule's window. */
  readonly historyWindowYears: number
  /** Per-deal overrides on the exported financing defaults in `returns.ts`. */
  readonly financing?: Partial<FinancingTerms>
}

export type ScreenRequest = {
  readonly source: "text" | "url"
  readonly value: string
}

export type ScreenResponse = {
  readonly deal: DealCard
  readonly provenance: Provenance
  readonly latencyMs: number
  readonly model?: string
  /** Set when a URL could not be resolved to a fixture — the client asks for pasted text. */
  readonly needsText?: boolean
  readonly guidance?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Reverse Recast
// ─────────────────────────────────────────────────────────────────────────────

export type AddBackCategory = "compensation" | "discretionary" | "mixed_use" | "one_time" | "related_party"

/** The six challenge rules. Each is a separately exported, separately tested function. */
export type RecastRule = "role_split" | "mixed_use" | "documentation" | "replacement_cost" | "reserve" | "occupancy"

/** A line the seller put on the add-back schedule. Everything here is a *claim*. */
export type ClaimedAddBack = {
  readonly id: string
  readonly label: string
  readonly annualAmount: number
  readonly category: AddBackCategory
  readonly documentation: DocumentationQuality
  /** 0-1 documented share of the expense that genuinely serves the business (mixed-use rule). */
  readonly businessUseShare?: number
  /** 0-1 share of the compensated role actually vacated at close (role-split rule). */
  readonly roleVacatedShare?: number
  /** Market cost to re-hire the vacated portion of the role (replacement-cost rule). */
  readonly replacementCost?: number
  /** How many years of the history window this "one-time" expense appeared in (reserve rule). */
  readonly recurredYears?: number
  /** Average annual amount across the years it recurred (reserve rule). */
  readonly recurringAnnualAverage?: number
  /** Where the claim came from — rendered in the expandable provenance row. */
  readonly sourceNote?: string
}

export type RecastLineKind = "add_back_challenge" | "omitted_cost"

export type RecastVerdict = "accepted" | "partial" | "rejected"

export type RecastLine = {
  readonly id: string
  readonly kind: RecastLineKind
  readonly label: string
  readonly verdict: RecastVerdict
  /** What the seller claimed. `0` on an omitted cost — the seller claimed nothing. */
  readonly claimed: number
  /** What survives the challenge. `0` on an omitted cost. */
  readonly accepted: number
  /** How much this line moves SDE down. Always non-negative. */
  readonly adjusted: number
  readonly rule: RecastRule
  /** Deterministic engine prose. LLM narration (item 7) is additive, never load-bearing. */
  readonly rationale: string
  readonly sourceNote?: string
}

export type FlagSeverity = "info" | "warn" | "critical"

export type RecastFlag = {
  readonly id: string
  readonly rule: RecastRule
  readonly label: string
  readonly detail: string
  readonly severity: FlagSeverity
  /** Returns scenario that models this flag, if one does. */
  readonly scenario?: ScenarioKey
}

/** Occupancy facts. A P&L carrying no rent while the seller owns the premises is the classic trap. */
export type OccupancyInput = {
  /** Annual occupancy cost actually carried in the P&L. `0` means none. */
  readonly costInPandL: number
  readonly marketAnnualRent: number
  readonly premisesOwnedBySeller: boolean
  readonly realEstateIncludedInAsk: boolean
}

export type ReverseRecastInput = {
  readonly claimedSde: number
  readonly ask: number
  readonly addBacks: ReadonlyArray<ClaimedAddBack>
  /** Number of trailing years the schedule was built from — the reserve rule's window. */
  readonly historyWindowYears: number
  readonly occupancy: OccupancyInput
  readonly compMultiple: MultipleBand
}

export type ReverseRecastResult = {
  readonly claimedSde: number
  readonly defensibleSde: number
  /** Sum of every line's `adjusted`. Invariant: `claimedSde - totalAdjusted === defensibleSde`. */
  readonly totalAdjusted: number
  readonly lines: ReadonlyArray<RecastLine>
  readonly flags: ReadonlyArray<RecastFlag>
  readonly claimedMultiple: number
  readonly impliedMultiple: number
  readonly fairValue: number
  /** `ask - fairValue`. Positive means the ask is above what the defensible SDE supports. */
  readonly negotiationDelta: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns
// ─────────────────────────────────────────────────────────────────────────────

/** Financing assumptions. Defaults are exported constants in `returns.ts`, overridable per deal. */
export type FinancingTerms = {
  /** 0-1 share of price funded by buyer equity. */
  readonly equityShare: number
  /** 0-1 share of price funded by a seller note. */
  readonly sellerNoteShare: number
  readonly sellerNoteRate: number
  readonly sellerNoteYears: number
  readonly sellerNoteStandbyMonths: number
  readonly sbaRate: number
  readonly sbaYears: number
  /** 0-1 of price. */
  readonly closingCostsShare: number
  readonly workingCapital: number
  /** Salary the buyer draws — comes out of SDE before debt-service coverage. */
  readonly buyerCompensation: number
  readonly dscrFloor: number
}

export type ReturnsInput = {
  readonly price: number
  readonly defensibleSde: number
  readonly terms: FinancingTerms
  /** 0-1 haircut applied to `defensibleSde` (transition/stress scenarios). */
  readonly sdeHaircut?: number
  /** Annual cost the scenario adds — e.g. market rent under the occupancy scenario. */
  readonly annualCostAddition?: number
}

export type CapitalStackKey = "sba" | "seller_note" | "buyer_cash"

export type CapitalStackSegment = {
  readonly key: CapitalStackKey
  readonly label: string
  readonly amount: number
  /** 0-1 of price. */
  readonly share: number
  /** Rendered beneath the segment — "10 yr · 11.0%" etc. */
  readonly terms: string
}

export type ReturnsResult = {
  readonly price: number
  readonly stack: ReadonlyArray<CapitalStackSegment>
  /** Equity + closing costs + working capital — what actually leaves the buyer's account. */
  readonly cashRequired: number
  readonly monthlyDebtService: number
  readonly annualDebtService: number
  /** `defensibleSde` after haircut and scenario cost additions. */
  readonly adjustedSde: number
  readonly buyerCompensation: number
  /** `adjustedSde - buyerCompensation`. The numerator of DSCR. */
  readonly cashFlowBeforeDebtService: number
  readonly cashFlowAfterDebtService: number
  readonly dscr: number
  readonly dscrFloor: number
  readonly meetsDscrFloor: boolean
  /** Year-1 cash-on-cash, pre-transition-risk. `0` when no cash is at risk. */
  readonly cashOnCash: number
  /** `Infinity` is never returned — a non-positive free cash flow yields `null`. */
  readonly yearsToPayback: number | null
  /** Highest price at which DSCR still clears the floor. */
  readonly maxPriceAtDscrFloor: number
}

export type ScenarioDef = {
  readonly key: ScenarioKey
  readonly label: string
  readonly description: string
  readonly sdeHaircut: number
  /** Multiplier on the deal's market occupancy cost — `0` unless the scenario models it. */
  readonly occupancyShare: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen Score
// ─────────────────────────────────────────────────────────────────────────────

export type SubScoreKey =
  | "sde_quality"
  | "add_back_aggressiveness"
  | "customer_concentration"
  | "owner_dependency"
  | "sba_financeability"
  | "price_vs_comp"

export const SUB_SCORE_KEYS: ReadonlyArray<SubScoreKey> = [
  "sde_quality",
  "add_back_aggressiveness",
  "customer_concentration",
  "owner_dependency",
  "sba_financeability",
  "price_vs_comp",
]

export type SubScore = {
  readonly key: SubScoreKey
  readonly label: string
  /** 0-100, clamped. */
  readonly score: number
  /** 0-1. The six weights sum to 1. */
  readonly weight: number
  readonly band: ScoreBand
  /** One renderable line explaining what produced the score. */
  readonly basis: string
}

/** A thing that must be true for the verdict to hold, deep-linked to the tab that proves it. */
export type ScreenCondition = {
  readonly id: string
  readonly text: string
  readonly tab: DealTabKey
}

/** Risk facts the seller's listing implies. Inputs only — no scores. */
export type DealRiskInputs = {
  /** 0-1 revenue share held by the largest customer. */
  readonly topCustomerShare: number
  readonly topThreeCustomerShare: number
  readonly ownerHoursPerWeek: number
  readonly ownerHoldsKeyRelationships: boolean
  readonly documentedSops: number
  readonly longTenuredStaff: number
  readonly employees: number
  /** 0-1 share of revenue under contract or recurring. */
  readonly recurringRevenueShare: number
  readonly sbaEligible: boolean
  readonly yearsOperating: number
  /** 3-year revenue trend as a decimal — `0.06` is +6%. */
  readonly revenueTrend3yr: number
}

export type ScreenScoreInput = {
  readonly ask: number
  readonly recast: ReverseRecastResult
  readonly returns: ReturnsResult
  readonly risk: DealRiskInputs
  readonly compMultiple: MultipleBand
}

export type ScreenScoreResult = {
  /** 0-100 weighted composite. */
  readonly composite: number
  readonly verdict: Verdict
  readonly band: ScoreBand
  readonly subScores: ReadonlyArray<SubScore>
  readonly conditions: ReadonlyArray<ScreenCondition>
}

// ─────────────────────────────────────────────────────────────────────────────
// Diligence
// ─────────────────────────────────────────────────────────────────────────────

export type DiligenceCategory = "financial" | "customer" | "operational" | "legal" | "people" | "market"

export type DiligenceAskOf = "seller" | "broker" | "accountant" | "lender"

export type DiligenceQuestion = {
  readonly id: string
  readonly question: string
  readonly category: DiligenceCategory
  /** 1-5. How fast an unfavourable answer kills the deal. */
  readonly killSpeed: number
  readonly rationale: string
  /** When this recast rule fires, the question is promoted to the top of the pack. */
  readonly sourceFinding?: RecastRule
  readonly askOf: DiligenceAskOf
}

export type RankedDiligenceQuestion = DiligenceQuestion & {
  /** Computed: `killSpeed × categoryWeight × unresolvedFlag`. Never hand-ordered. */
  readonly killScore: number
  readonly promoted: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// LOI
// ─────────────────────────────────────────────────────────────────────────────

export type LoiSectionKey = "price" | "structure" | "conditions" | "process"

export type LoiTerm = {
  readonly id: string
  readonly section: LoiSectionKey
  readonly label: string
  readonly value: string
  /** Every term names the line or metric that produced it. Non-empty by contract. */
  readonly rationale: string
}

export type LoiDraft = {
  readonly dealId: string
  readonly dealName: string
  readonly buyerName: string
  readonly firmName: string
  readonly price: number
  /** `ask - price`, for the "why this price, not the ask" callout. */
  readonly discountToAsk: number
  readonly terms: ReadonlyArray<LoiTerm>
}

// ─────────────────────────────────────────────────────────────────────────────
// Certified Deal Flow
// ─────────────────────────────────────────────────────────────────────────────

export type CertifiedListing = {
  readonly id: string
  readonly name: string
  readonly industry: string
  readonly geography: string
  readonly ask: number
  readonly sde: number
  /** Sell-side readiness score that earned certification. */
  readonly scortaScore: number
  /** ISO date. */
  readonly certifiedOn: string
  /** ISO date the listing hits the open market — the countdown target. */
  readonly openMarketOn: string
  readonly certificationBasis: ReadonlyArray<string>
  readonly ownerDependencyScore: number
  readonly topCustomerShare: number
  readonly sbaEligible: boolean
}

export type MatchComponentKey = "industry" | "geography" | "ev_band" | "sde_floor"

export type MatchComponent = {
  readonly key: MatchComponentKey
  readonly label: string
  /** 0-1 fit on this component alone. */
  readonly score: number
  readonly weight: number
  readonly basis: string
}

export type ListingMatch = {
  readonly listingId: string
  /** 0-100 weighted match. */
  readonly score: number
  readonly components: ReadonlyArray<MatchComponent>
}

// ─────────────────────────────────────────────────────────────────────────────
// Streaming log + session state
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape-compatible with the sell-side ingestion log (`IngestionStation.tsx`) so the
 * script is authored the same way — but `accent` is a boolean, not `"mint"`.
 * Mint is the sell-side's signature and never appears in DealIQ.
 */
export type LogLine = {
  readonly ts: string
  readonly text: string
  readonly accent?: boolean
  readonly flag?: "red" | "amber"
}

export type SessionScreenedDeal = {
  readonly card: DealCard
  readonly screenedAtIso: string
  readonly provenance: Provenance
}

export type ApprovePhase = "idle" | "approving" | "approved"
