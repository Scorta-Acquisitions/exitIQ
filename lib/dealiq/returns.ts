/**
 * Returns model — capital stack, debt service, DSCR, cash-on-cash, payback.
 *
 * Rules, not facts. Financing defaults are exported constants, overridable per
 * deal from `data/deal.ts`. Pure: the sensitivity slider calls `computeReturns`
 * inside a `useMemo` on every frame, so this module must stay allocation-light
 * and free of I/O.
 *
 * Debt service is steady-state — `annualDebtService === monthlyDebtService × 12`.
 * A seller note on standby pays nothing in year one, which would make a year-one
 * annual figure disagree with the monthly figure shown beside it; the standby is
 * surfaced in the seller-note segment's terms string instead. Consistency on
 * screen beats a more precise number nobody can reconcile.
 *
 * Nothing here returns `NaN` or `Infinity`. Every division is guarded, and a deal
 * that never recovers its cash returns `yearsToPayback: null` rather than a
 * number that means "never".
 */

import type { CapitalStackSegment, FinancingTerms, ReturnsInput, ReturnsResult, ScenarioDef } from "@/lib/dealiq/types"

// ─── Tunable constants ───────────────────────────────────────────────────────

/** Provisional SBA 7(a)-shaped structure. Per-deal overrides live in `data/deal.ts`. */
export const DEFAULT_FINANCING: FinancingTerms = {
  equityShare: 0.12,
  sellerNoteShare: 0.15,
  sellerNoteRate: 0.08,
  sellerNoteYears: 7,
  sellerNoteStandbyMonths: 24,
  sbaRate: 0.11,
  sbaYears: 10,
  closingCostsShare: 0.03,
  workingCapital: 75_000,
  buyerCompensation: 120_000,
  dscrFloor: 1.25,
}

/** Scenarios are input modifiers into one engine — never branches in the UI. */
export const SCENARIOS: ReadonlyArray<ScenarioDef> = [
  {
    key: "base",
    label: "Base",
    description: "Defensible SDE as computed, occupancy unchanged.",
    sdeHaircut: 0,
    occupancyShare: 0,
  },
  {
    key: "transition",
    label: "Transition",
    description: "First-year customer and staff attrition after the owner leaves.",
    sdeHaircut: 0.1,
    occupancyShare: 0,
  },
  {
    key: "stress",
    label: "Stress",
    description: "A material revenue shock on top of transition losses.",
    sdeHaircut: 0.25,
    occupancyShare: 0,
  },
  {
    key: "occupancy",
    label: "Occupancy",
    description: "Market rent charged where the P&L carried none.",
    sdeHaircut: 0,
    occupancyShare: 1,
  },
] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeDivide(numerator: number, denominator: number): number {
  return denominator > 0 && Number.isFinite(numerator) ? numerator / denominator : 0
}

function clampShare(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

// ─── Amortization ────────────────────────────────────────────────────────────

/**
 * Level monthly payment on an amortizing loan.
 * `amortizedPayment(100_000, 0.12, 10)` ≈ `1_434.71`.
 *
 * A zero rate degrades to straight-line principal repayment rather than dividing
 * by zero. Zero principal or a non-positive term returns `0`.
 */
export function amortizedPayment(principal: number, annualRate: number, years: number): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0
  if (!Number.isFinite(years) || years <= 0) return 0
  const months = years * 12
  if (!Number.isFinite(annualRate) || annualRate <= 0) return principal / months
  const monthlyRate = annualRate / 12
  const growth = Math.pow(1 + monthlyRate, months)
  const denominator = growth - 1
  if (denominator <= 0) return principal / months
  return (principal * monthlyRate * growth) / denominator
}

/** Annual debt service produced by one dollar of principal on these terms. */
function annualServicePerDollar(annualRate: number, years: number): number {
  return amortizedPayment(1, annualRate, years) * 12
}

// ─── The model ───────────────────────────────────────────────────────────────

function buildStack(price: number, terms: FinancingTerms): ReadonlyArray<CapitalStackSegment> {
  const equityShare = clampShare(terms.equityShare)
  const sellerNoteShare = clampShare(terms.sellerNoteShare)
  const sbaShare = Math.max(0, 1 - equityShare - sellerNoteShare)
  const standby = terms.sellerNoteStandbyMonths > 0 ? ` · ${terms.sellerNoteStandbyMonths}mo standby` : " · no standby"

  return [
    {
      key: "sba",
      label: "SBA loan",
      amount: price * sbaShare,
      share: sbaShare,
      terms: `${terms.sbaYears} yr · ${(terms.sbaRate * 100).toFixed(1)}%`,
    },
    {
      key: "seller_note",
      label: "Seller note",
      amount: price * sellerNoteShare,
      share: sellerNoteShare,
      terms: `${terms.sellerNoteYears} yr · ${(terms.sellerNoteRate * 100).toFixed(1)}%${standby}`,
    },
    {
      key: "buyer_cash",
      label: "Buyer cash",
      amount: price * equityShare,
      share: equityShare,
      terms: "At close",
    },
  ]
}

export function computeReturns(input: ReturnsInput): ReturnsResult {
  const terms = input.terms
  const price = Number.isFinite(input.price) && input.price > 0 ? input.price : 0

  const stack = buildStack(price, terms)
  const sbaAmount = stack[0]?.amount ?? 0
  const sellerNoteAmount = stack[1]?.amount ?? 0
  const equityAmount = stack[2]?.amount ?? 0

  const monthlyDebtService =
    amortizedPayment(sbaAmount, terms.sbaRate, terms.sbaYears) +
    amortizedPayment(sellerNoteAmount, terms.sellerNoteRate, terms.sellerNoteYears)
  const annualDebtService = monthlyDebtService * 12

  const haircut = clampShare(input.sdeHaircut ?? 0)
  const costAddition = Number.isFinite(input.annualCostAddition ?? 0) ? (input.annualCostAddition ?? 0) : 0
  const adjustedSde = input.defensibleSde * (1 - haircut) - costAddition

  const cashFlowBeforeDebtService = adjustedSde - terms.buyerCompensation
  const cashFlowAfterDebtService = cashFlowBeforeDebtService - annualDebtService

  const cashRequired = equityAmount + price * clampShare(terms.closingCostsShare) + terms.workingCapital
  const dscr = safeDivide(cashFlowBeforeDebtService, annualDebtService)

  // Debt service is linear in price, so the DSCR constraint inverts directly.
  const servicePerDollar =
    (stack[0]?.share ?? 0) * annualServicePerDollar(terms.sbaRate, terms.sbaYears) +
    (stack[1]?.share ?? 0) * annualServicePerDollar(terms.sellerNoteRate, terms.sellerNoteYears)
  const maxPriceAtDscrFloor = safeDivide(cashFlowBeforeDebtService, terms.dscrFloor * servicePerDollar)

  return {
    price,
    stack,
    cashRequired,
    monthlyDebtService,
    annualDebtService,
    adjustedSde,
    buyerCompensation: terms.buyerCompensation,
    cashFlowBeforeDebtService,
    cashFlowAfterDebtService,
    dscr,
    dscrFloor: terms.dscrFloor,
    meetsDscrFloor: dscr >= terms.dscrFloor,
    cashOnCash: safeDivide(cashFlowAfterDebtService, cashRequired),
    yearsToPayback: cashFlowAfterDebtService > 0 ? safeDivide(cashRequired, cashFlowAfterDebtService) : null,
    maxPriceAtDscrFloor: Math.max(0, maxPriceAtDscrFloor),
  }
}

/**
 * Applies a scenario to a base input. The occupancy scenario charges the rent the
 * P&L never carried, which is why it needs the deal's uncovered occupancy figure
 * rather than a percentage.
 */
export function applyScenario(input: ReturnsInput, scenario: ScenarioDef, uncoveredOccupancy: number): ReturnsInput {
  return {
    ...input,
    sdeHaircut: scenario.sdeHaircut,
    annualCostAddition: Math.max(0, uncoveredOccupancy) * clampShare(scenario.occupancyShare),
  }
}
