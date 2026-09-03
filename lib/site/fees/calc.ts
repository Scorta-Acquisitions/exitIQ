import { formatDollars } from "@/lib/site/format"

/**
 * Fee calculator model. Two engagement paths, a transaction value, and a traditional comparison
 * rate that is either a 10% illustration (valid through $5M) or a quoted rate typed by the visitor.
 */

export type FeePath = "market" | "execution"
export type RateMode = "illu" | "quoted"

export const FEE_PRICE_MIN = 500_000
export const FEE_PRICE_MAX = 10_000_000
export const FEE_PRICE_STEP = 50_000
export const FEE_PRICE_DEFAULT = 2_400_000
export const ILLUSTRATION_RATE = 10
export const ILLUSTRATION_CEILING = 5_000_000
export const ENGAGEMENT_COMMITMENT = 5000

export const SUCCESS_FEE: Record<FeePath, number> = { market: 0.05, execution: 0.025 }

export interface FeeInputs {
  path: FeePath
  price: number
  rateMode: RateMode
  altRate: string
}

export const DEFAULT_FEE_INPUTS: FeeInputs = {
  path: "market",
  price: FEE_PRICE_DEFAULT,
  rateMode: "illu",
  altRate: "",
}

export interface FeeBreakdown {
  rateLabel: string
  upfront: string
  credit: string
  atClose: string
  total: string
  traditional: string
  difference: string
}

export const RATE_INVALID = "We cannot calculate a reliable comparison for this value."
export const RATE_PENDING = "Comparison available after rate is entered"
export const RATE_LARGE = "Traditional fees vary at this transaction size. Enter the quoted rate to compare."

/** Parse the quoted rate; `null` when blank, `NaN` when out of range or not a number. */
function quotedRate(altRate: string): number | null {
  if (altRate === "") return null
  const r = parseFloat(altRate)
  if (!isFinite(r) || r <= 0 || r > 50) return NaN
  return r
}

export function computeFees(i: FeeInputs): FeeBreakdown {
  const rate = SUCCESS_FEE[i.path]
  const heirloom = i.price * rate
  const commitment = i.path === "market" ? ENGAGEMENT_COMMITMENT : 0

  let traditional: string
  let difference: string
  let effective: number | null = null

  if (i.rateMode === "quoted") {
    const r = quotedRate(i.altRate)
    if (r === null) {
      traditional = RATE_PENDING
    } else if (Number.isNaN(r)) {
      traditional = RATE_INVALID
    } else {
      traditional = formatDollars((i.price * r) / 100)
      effective = r
    }
    difference = r !== null && Number.isNaN(r) ? RATE_INVALID : ""
  } else if (i.price <= ILLUSTRATION_CEILING) {
    traditional = formatDollars(i.price * (ILLUSTRATION_RATE / 100))
    effective = ILLUSTRATION_RATE
    difference = ""
  } else {
    traditional = RATE_LARGE
    difference = ""
  }

  if (!difference) {
    difference = effective === null ? RATE_PENDING : formatDollars((i.price * effective) / 100 - heirloom)
  }

  return {
    rateLabel: i.path === "market" ? "5%" : "2.5%",
    upfront: formatDollars(commitment),
    credit: formatDollars(commitment),
    atClose: formatDollars(heirloom - commitment),
    total: formatDollars(heirloom),
    traditional,
    difference,
  }
}
