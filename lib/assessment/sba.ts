import { fmt, getValuationRange, isSBAEligible } from "@/lib/assessment/scoring"
import type { Stage1Answers } from "@/lib/assessment/session"

export interface SBASnapshot {
  eligible: boolean
  loanAmount: number
  downPayment: number
  monthlyPayment: number
  buyerPoolLabel: string
  note: string
}

const MONTHLY_RATE = 0.105 / 12
const LOAN_TERM_MONTHS = 120

function calcMonthlyPayment(principal: number): number {
  const r = MONTHLY_RATE
  const n = LOAN_TERM_MONTHS
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

const BUYER_POOL: Record<string, string> = {
  under_250: "Very large — most individual buyers qualify",
  "250_500": "Large — strong SBA buyer pool",
  "500_1m": "Solid — most qualified SBA borrowers can access this range",
  "1m_2m": "Moderate — requires stronger buyer profile",
  "2m_5m": "Selective — strategic buyers and PE-backed searches",
  "5m_10m": "Narrow — institutional and PE buyer market",
}

export function computeSBASnapshot(s1: Partial<Stage1Answers>): SBASnapshot {
  const eligible = isSBAEligible(s1)

  if (!eligible) {
    return {
      eligible: false,
      loanAmount: 0,
      downPayment: 0,
      monthlyPayment: 0,
      buyerPoolLabel: "Varies by structure",
      note: "This business may not qualify for SBA 7(a) financing based on industry or size. Buyers will likely use conventional financing, seller financing, or private equity.",
    }
  }

  const [low, high] = getValuationRange(s1)
  const valuationMid = Math.round((low + high) / 2)
  const loanAmount = Math.round(Math.min(valuationMid * 0.9, 5000000))
  const downPayment = Math.round(loanAmount * 0.1)
  const monthlyPayment = calcMonthlyPayment(loanAmount)

  const leaseWarning =
    s1.facilityType === "short_lease"
      ? " Note: your lease expiring within 7 years is a risk flag for SBA lenders — negotiate an extension before listing."
      : ""

  return {
    eligible: true,
    loanAmount,
    downPayment,
    monthlyPayment,
    buyerPoolLabel: BUYER_POOL[s1.revenue ?? "500_1m"] ?? "Moderate",
    note: `Based on your revenue and industry, this business likely qualifies for SBA 7(a) financing. A buyer could acquire with as little as ${fmt(downPayment)} down, dramatically expanding your buyer pool.${leaseWarning}`,
  }
}
