import { formatDollars } from "@/lib/site/format"

/**
 * Fee calculator model. Two engagement paths, a transaction value, and a traditional comparison
 * rate that is either a 10% illustration (valid through $5M) or a quoted rate typed by the visitor.
 */

type FeePath = "market" | "execution"
type RateMode = "illu" | "quoted"

export const FEE_PRICE_MIN = 500_000
export const FEE_PRICE_MAX = 10_000_000
export const FEE_PRICE_STEP = 50_000
/** The one quoted-rate range: the input's bounds, the values the calculator accepts, and the message's figures. */
export const FEE_RATE_MIN = 1
export const FEE_RATE_MAX = 25
export const FEE_RATE_STEP = 0.5
const FEE_PRICE_DEFAULT = 2_400_000
const ILLUSTRATION_RATE = 10
const ILLUSTRATION_CEILING = 5_000_000
const ENGAGEMENT_COMMITMENT = 5000

const SUCCESS_FEE: Record<FeePath, number> = { market: 0.05, execution: 0.025 }

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

export const RATE_INVALID = `Enter a rate between ${FEE_RATE_MIN} and ${FEE_RATE_MAX}.`
export const RATE_PENDING = "Enter a rate to compare."
export const RATE_LARGE = "Above $5M, enter the quoted rate to compare."
/** Shown in the difference row whenever the traditional row carries an instruction instead of a figure. */
export const NO_COMPARISON = "–"

/**
 * Parse the quoted rate; `null` when blank, `NaN` when out of range or not a number. The bounds are
 * inclusive, so the input's own `min` and `max` are exactly the rates the calculator compares.
 */
function quotedRate(altRate: string): number | null {
  if (altRate === "") return null
  const r = parseFloat(altRate)
  if (!isFinite(r) || r < FEE_RATE_MIN || r > FEE_RATE_MAX) return NaN
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
    difference = r !== null && Number.isNaN(r) ? NO_COMPARISON : ""
  } else if (i.price <= ILLUSTRATION_CEILING) {
    traditional = formatDollars(i.price * (ILLUSTRATION_RATE / 100))
    effective = ILLUSTRATION_RATE
    difference = ""
  } else {
    traditional = RATE_LARGE
    difference = ""
  }

  if (!difference) {
    difference = effective === null ? NO_COMPARISON : formatDollars((i.price * effective) / 100 - heirloom)
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
