/**
 * LOI derivation — screen → offer inside one product (Execution Plan item 10).
 *
 * Every term is derived: price from the recast's fair value, structure from the
 * capital stack repriced at that offer, contingencies from the recast rules that
 * actually fired, and exclusivity/deposit/earnout from the exported constants
 * below. Each term carries a `rationale` naming the line or metric that produced
 * it — the negotiation argument travels with the term.
 *
 * The draft is non-binding by contract (§7: no binding legal content); the
 * surface labels it that way and this module makes no attempt at legal language.
 *
 * Pure and content-free: identity and figures arrive as arguments.
 */

import { firedRules } from "@/lib/dealiq/diligence"
import { formatCurrency, formatDscr, formatMultiple, formatPercent } from "@/lib/dealiq/format"
import { computeReturns } from "@/lib/dealiq/returns"
import { RULE_LABEL } from "@/lib/dealiq/reverseRecast"
import type { LoiDraft, LoiInput, LoiSectionKey, LoiTerm, RecastRule } from "@/lib/dealiq/types"

// ─── Tunable constants ───────────────────────────────────────────────────────

export const EXCLUSIVITY_DAYS = 45
export const DILIGENCE_DAYS = 30
/** Good-faith deposit, as a share of the offer price. Held in escrow, refundable. */
export const DEPOSIT_SHARE = 0.025
/** Ceiling on the earnout bridge, as a share of the offer price. */
export const EARNOUT_CAP_SHARE = 0.1

export const SECTION_LABEL: Record<LoiSectionKey, string> = {
  price: "Price",
  structure: "Structure",
  conditions: "Conditions to close",
  process: "Process",
}

/**
 * One contingency per recast rule that fired. The set therefore varies with the
 * recast input — which is the test that proves the draft is generated, not
 * templated. Uses the same firing definition as the diligence pack
 * (standing decision 36: a non-accepted line or a flag).
 */
export const CONTINGENCY_BY_RULE: Record<RecastRule, { label: string; requirement: string }> = {
  documentation: {
    label: "Financials verified",
    requirement: "Filed tax returns reconciled to the P&L for every year of the review window.",
  },
  role_split: {
    label: "Role transition plan",
    requirement: "Written transition plan for each compensated role not fully vacated at close.",
  },
  mixed_use: {
    label: "Expense classification schedule",
    requirement: "Documented business-use share for every mixed-personal expense claimed as an add-back.",
  },
  replacement_cost: {
    label: "Replacement hiring plan",
    requirement: "Signed offer or hiring plan covering the vacated role at the market cost carried in the model.",
  },
  reserve: {
    label: "Recurring-cost reserve",
    requirement: "Working-capital reserve at close covering the annualized cost of recurring 'one-time' expenses.",
  },
  occupancy: {
    label: "Market-rate lease",
    requirement: "Executed lease at market rent, assignable or with a term at least as long as the loan.",
  },
}

// ─── Derivation ──────────────────────────────────────────────────────────────

export function buildLoi(input: LoiInput): LoiDraft {
  const { recast, financing } = input
  const price = recast.fairValue
  const discountToAsk = input.ask - price

  // The stack the seller is shown is the one that finances the *offer*.
  const returns = computeReturns({ price, defensibleSde: recast.defensibleSde, terms: financing })

  const terms: LoiTerm[] = []

  // Price
  terms.push({
    id: "price",
    section: "price",
    label: "Purchase price",
    value: formatCurrency(price),
    rationale: `The comp multiple band applied to the defensible SDE of ${formatCurrency(recast.defensibleSde)} from the reverse recast. The ask of ${formatCurrency(input.ask)} implies ${formatMultiple(recast.impliedMultiple)} on that same figure — ${formatCurrency(Math.abs(recast.negotiationDelta))} ${recast.negotiationDelta >= 0 ? "above" : "below"} what it supports.`,
  })

  const earnout = Math.min(discountToAsk, EARNOUT_CAP_SHARE * price)
  if (earnout > 0) {
    terms.push({
      id: "earnout",
      section: "price",
      label: "Performance earnout",
      value: `Up to ${formatCurrency(earnout)}`,
      rationale: `Bridges part of the ${formatCurrency(discountToAsk)} gap between this offer and the ask — paid only if the performance the schedule claims actually holds through the first year. Capped at ${formatPercent(EARNOUT_CAP_SHARE)} of price.`,
    })
  }

  // Structure — one term per stack segment, plus the cash the buyer brings.
  for (const segment of returns.stack) {
    terms.push({
      id: `stack-${segment.key}`,
      section: "structure",
      label: segment.label,
      value: `${formatCurrency(segment.amount)} · ${formatPercent(segment.share)}`,
      rationale:
        segment.key === "sba"
          ? `${segment.terms}. At this price the structure covers debt service at ${formatDscr(returns.dscr)} against the ${formatDscr(returns.dscrFloor)} lender floor.`
          : segment.key === "seller_note"
            ? `${segment.terms}. Seller financing keeps the seller invested in the transition the model prices.`
            : `${segment.terms}. Total cash required at close, with closing costs and working capital, is ${formatCurrency(returns.cashRequired)}.`,
    })
  }

  // Conditions — financing first, then one per fired recast rule.
  terms.push({
    id: "cond-financing",
    section: "conditions",
    label: "Financing approval",
    value: `DSCR ≥ ${formatDscr(returns.dscrFloor)}`,
    rationale: `Offer is contingent on loan approval at the modeled structure. The highest price that still clears the floor is ${formatCurrency(returns.maxPriceAtDscrFloor)} — the ceiling the returns model computed.`,
  })
  for (const rule of firedRules(recast)) {
    const contingency = CONTINGENCY_BY_RULE[rule]
    terms.push({
      id: `cond-${rule}`,
      section: "conditions",
      label: contingency.label,
      value: "Condition to close",
      rationale: `${contingency.requirement} Raised because the ${RULE_LABEL[rule]} rule fired in the reverse recast.`,
    })
  }

  // Process
  terms.push({
    id: "proc-exclusivity",
    section: "process",
    label: "Exclusivity",
    value: `${EXCLUSIVITY_DAYS} days`,
    rationale:
      "Long enough to complete diligence and financing; short enough that the seller is not off-market on a maybe.",
  })
  terms.push({
    id: "proc-diligence",
    section: "process",
    label: "Diligence period",
    value: `${DILIGENCE_DAYS} days`,
    rationale: "Scoped by the diligence pack — the questions are already ranked, so the period starts on day one.",
  })
  terms.push({
    id: "proc-deposit",
    section: "process",
    label: "Good-faith deposit",
    value: formatCurrency(DEPOSIT_SHARE * price),
    rationale: `${formatPercent(DEPOSIT_SHARE, 1)} of the offer price, held in escrow, refundable if a condition to close fails.`,
  })

  return {
    dealId: input.dealId,
    dealName: input.dealName,
    buyerName: input.buyerName,
    firmName: input.firmName,
    price,
    discountToAsk,
    terms,
  }
}
