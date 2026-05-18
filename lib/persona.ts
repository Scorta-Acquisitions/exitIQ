/**
 * Locked demo persona — Chandan Patel / Palace Kitchen & Catering.
 * Source of truth: .exitiq-debug/sessions/DEMO_PERSONA.md + demo-persona.json + demo-report.md.
 * Do not invent or alter values. If a value is missing, log an open question in DEMO_SPRINT.md.
 */

export const PERSONA = {
  identity: {
    displayName: "Chandan Patel",
    firstName: "Chandan",
    email: "chandan@palacekitchen.com",
    businessName: "Palace Kitchen & Catering",
    businessSlug: "palace-kitchen",
    role: "Owner-Operator",
    location: "Northern New Jersey",
    avatarInitials: "CP",
    avatarColor: "#1D9E75",
    avatarBg: "#E1F5EE",
  },
  business: {
    industry: "Restaurant / Food Service",
    yearsOperating: 15,
    facilityType: "Owns the property",
    employeesRange: "6–15",
    employees: 11,
    longTenuredStaff: 1,
    sopsOnRecord: 0,
    sellingTimeline: "6–12 months",
    sellerHasPriceInMind: false,
    segmentTag: "hot_seller",
  },
  financials: {
    revenue: 2_100_000,
    revenueDisplay: "$2.1M",
    sde: 725_000,
    sdeDisplay: "$725K",
    sdeMidpoint: 750_000,
    sdeMidpointDisplay: "$750K",
    sdeMultipleLow: 1.5,
    sdeMultipleHigh: 3.0,
    appliedMultiple: 2.4,
    valuationLow: 1_600_000,
    valuationLowDisplay: "$1.6M",
    valuationHigh: 1_900_000,
    valuationHighDisplay: "$1.9M",
    recommendedListing: 1_750_000,
    recommendedListingDisplay: "$1.75M",
    assetFloor: 500_000,
    assetFloorDisplay: "$500K",
    recurringRevenueMix: 38,
    customerConcentrationTop: 19,
    addBacksTotal: 127_400,
    normalizedSDEYear3: 962_000,
    normalizedSDEYear3Display: "$962K",
    revenueTrend3yr: 18,
  },
  exitIQ: {
    score: 49,
    grade: "C",
    label: "Needs Preparation",
    segment: "Hot Seller",
    routingPath: "Guided Readiness Track",
    sessionId: "mp91it7xqthbf6b",
    completedAt: "2026-05-17",
  },
  scorta: {
    overall: 71,
    label: "Strong SBA Candidate",
    financialHealth: 68,
    marketPosition: 74,
    transferability: 38,
    documentationQuality: 65,
  },
  risk: {
    keyPersonRiskLevel: "HIGH" as const,
    ownerDependencyScore: 38,
    staffTenuredCount: 1,
    staffTotal: 11,
    sopsDocumented: 0,
    valueImpactDollars: -1_100_000,
    fixDescription: "Write a 1-page operations manual for top 5 owner-dependent tasks",
    fixValueUnlock: 450_000,
    fixValueUnlockDisplay: "+$450K",
    targetTransferability: 62,
    topCustomerShare: 19,
    concentrationLevel: "MODERATE" as const,
    concentrationRiskLabel: "Within SBA threshold — monitor",
    topAccountName: "NJ Transit Corporate Catering",
    topAccountTenureYears: 6,
  },
  sba: {
    eligible: true,
    loanAmount: 1_093_750,
    loanAmountDisplay: "$1.1M",
    minDownPayment: 106_000,
    minDownPaymentDisplay: "$106K",
    altDownPayment: 159_000,
    altDownPaymentDisplay: "$159K",
    monthlyDebtService: 14_200,
    monthlyDebtServiceDisplay: "$14.2K",
    termYears: 10,
    dscr: 4.4,
    dscrFloor: 1.25,
    buyerPoolRating: "Moderate",
    sellerNoteLow: 175_000,
    sellerNoteHigh: 229_000,
  },
  nextSteps: [
    {
      priority: "critical" as const,
      action: "Get 3 years of P&L + tax returns from CPA",
      status: "done" as const,
      impact: "Unlocks lender review",
    },
    {
      priority: "critical" as const,
      action: "Write ops manual for top 5 owner-dependent tasks",
      status: "not_started" as const,
      impact: "+$450K deal value",
    },
    {
      priority: "high" as const,
      action: "Prepare normalized SDE add-back schedule",
      status: "done" as const,
      impact: "Supports asking price",
    },
    {
      priority: "high" as const,
      action: "Sign NDA with 3 qualified buyers",
      status: "in_progress" as const,
      impact: "Advances deal · 3 / 3",
    },
    {
      priority: "active" as const,
      action: "Review CIM draft",
      status: "ready" as const,
      impact: "CIM v1 generated",
    },
  ],
} as const

/**
 * Station Wayfinder — the 9-route platform shell.
 * Order matches DEMO_SPRINT.md Section 5. Mirrors the demo's left-rail spine.
 */
export type StationStatus = "shipped" | "active" | "locked"

export type Station = {
  href: string
  label: string
  sublabel: string
  agent: string
  /** Default state. The current route is always rendered as `active` regardless. */
  state: StationStatus
  /** What the user must complete before ARIA unlocks this station — shown in the locked tooltip. */
  prereq?: string
}

export const STATIONS: ReadonlyArray<Station> = [
  { href: "/dashboard", label: "Seller Home", sublabel: "Station 02", agent: "Case Manager", state: "shipped" },
  { href: "/connect", label: "Platform Connectors", sublabel: "Station 03", agent: "Ingestion", state: "shipped", prereq: "you approve the prep plan" },
  { href: "/ingestion", label: "Data Processing", sublabel: "Station 04", agent: "Ingestion", state: "shipped", prereq: "Platform Connectors are authorized" },
  { href: "/recast", label: "Financials Recast", sublabel: "Station 05", agent: "Recast · Boardroom", state: "shipped", prereq: "the Ingestion Agent finishes classifying" },
  { href: "/risk", label: "Risk Analysis", sublabel: "Station 06", agent: "Owner-Dependency · Concentration", state: "shipped", prereq: "the Recast Agent posts add-backs" },
  { href: "/boardroom", label: "The Boardroom", sublabel: "Station 06b", agent: "Boardroom", state: "active", prereq: "the Owner-Dependency remediation plan is reviewed" },
  { href: "/documents", label: "CIM & Docs", sublabel: "Station 07", agent: "CIM Agent", state: "active", prereq: "the Boardroom dispatches the agent fleet" },
  { href: "/vdr", label: "Virtual Data Room", sublabel: "Station 07b", agent: "VDR · Case Manager", state: "active" },
  { href: "/score", label: "Scorta Score", sublabel: "Station 08", agent: "Case Manager", state: "locked", prereq: "the CIM draft is reviewed" },
  { href: "/marketplace", label: "Lenders / Listings", sublabel: "Station 09", agent: "Lender Ops", state: "locked", prereq: "your Scorta Score is finalized" },
  { href: "/outreach", label: "Buyer & Lender Outreach", sublabel: "Station 10", agent: "Lender Ops · Outreach", state: "active", prereq: "lenders are matched" },
]
