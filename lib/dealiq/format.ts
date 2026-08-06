/**
 * DealIQ display formatters — the single module every buy-side surface renders through.
 *
 * The point is not convenience. It is that when real content replaces the
 * placeholders in `lib/dealiq/data/`, the new figures inherit the same typography
 * without any component being reopened (Execution Plan §1: "Formatting goes
 * through one shared module so real numbers inherit consistent typography the
 * moment they arrive").
 *
 * Every formatter pins `en-US` explicitly. `Intl` defaults to the runtime locale,
 * which differs between the Node render and the browser hydrate and produces a
 * hydration mismatch on any figure rendered from a server component.
 *
 * Non-finite input formats as an em dash rather than "NaN" or "∞". The returns
 * engine guards its own division, but a slider at an extreme should never be able
 * to put the string "Infinity" on screen.
 */

import type { ScoreBand, Verdict } from "@/lib/dealiq/types"

const EM_DASH = "—"

const currency0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const decimal0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

const decimal1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const decimal2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateLong = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function isRenderable(n: number): boolean {
  return Number.isFinite(n)
}

/** `$1,900,000`. */
export function formatCurrency(n: number): string {
  return isRenderable(n) ? currency0.format(n) : EM_DASH
}

/**
 * `$1.9M` / `$725K` / `$840`. Compact form for cards, chips, and axis ticks —
 * never for a figure the buyer is expected to reconcile.
 */
export function formatCompactCurrency(n: number): string {
  if (!isRenderable(n)) return EM_DASH
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000
    return `${sign}$${millions >= 100 ? decimal0.format(millions) : decimal1.format(millions)}M`
  }
  if (abs >= 1_000) return `${sign}$${decimal0.format(abs / 1_000)}K`
  return `${sign}$${decimal0.format(abs)}`
}

/** `+$310,000` / `−$310,000`. Uses a true minus sign, not a hyphen. */
export function formatSignedCurrency(n: number): string {
  if (!isRenderable(n)) return EM_DASH
  if (n === 0) return formatCurrency(0)
  return `${n > 0 ? "+" : "−"}${currency0.format(Math.abs(n))}`
}

/** `2.4×`. */
export function formatMultiple(n: number): string {
  return isRenderable(n) ? `${decimal1.format(n)}×` : EM_DASH
}

/** `1.24×` — DSCR carries two decimals because lenders read it that way. */
export function formatDscr(n: number): string {
  return isRenderable(n) ? `${decimal2.format(n)}×` : EM_DASH
}

/** `2.0×–3.0×`. */
export function formatMultipleBand(low: number, high: number): string {
  if (!isRenderable(low) || !isRenderable(high)) return EM_DASH
  return `${decimal1.format(low)}×–${decimal1.format(high)}×`
}

/**
 * `34%` from a 0-1 decimal share. Pass `digits: 1` for `12.5%`.
 * Inputs are decimals throughout DealIQ — a share is never stored as `34`.
 */
export function formatPercent(share: number, digits: 0 | 1 = 0): string {
  if (!isRenderable(share)) return EM_DASH
  const pct = share * 100
  return `${digits === 1 ? decimal1.format(pct) : decimal0.format(Math.round(pct))}%`
}

/** `+6%` / `−3%` from a 0-1 decimal. */
export function formatSignedPercent(share: number, digits: 0 | 1 = 0): string {
  if (!isRenderable(share)) return EM_DASH
  if (share === 0) return formatPercent(0, digits)
  return `${share > 0 ? "+" : "−"}${formatPercent(Math.abs(share), digits)}`
}

/** `58` — scores are integers on screen regardless of engine precision. */
export function formatScore(n: number): string {
  return isRenderable(n) ? decimal0.format(Math.round(n)) : EM_DASH
}

/** `4.2 yrs` — `null` payback (never recovers) renders as an em dash. */
export function formatYears(n: number | null): string {
  if (n === null || !isRenderable(n)) return EM_DASH
  return `${decimal1.format(n)} yrs`
}

/** `1,247`. */
export function formatCount(n: number): string {
  return isRenderable(n) ? decimal0.format(n) : EM_DASH
}

/** `Aug 5, 2026` from an ISO date. Fixed to UTC so the day never shifts by timezone. */
export function formatDate(iso: string): string {
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? EM_DASH : dateLong.format(new Date(ms))
}

/** Whole days between two ISO dates, `to − from`. Negative when `to` is in the past. */
export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso)
  const to = Date.parse(toIso)
  if (Number.isNaN(from) || Number.isNaN(to)) return 0
  return Math.round((to - from) / 86_400_000)
}

/** `12 days` / `1 day` / `today`. */
export function formatDayCount(days: number): string {
  if (!isRenderable(days)) return EM_DASH
  const whole = Math.round(days)
  if (whole === 0) return "today"
  return `${decimal0.format(Math.abs(whole))} ${Math.abs(whole) === 1 ? "day" : "days"}`
}

/** `1.8s` / `840ms` — the provenance chip's latency half. */
export function formatLatency(ms: number): string {
  if (!isRenderable(ms) || ms < 0) return EM_DASH
  return ms >= 1000 ? `${decimal1.format(ms / 1000)}s` : `${decimal0.format(Math.round(ms))}ms`
}

/**
 * Verdict → CSS variable. The one mapping shared by the score panel, the deal
 * context bar, and the pipeline board, so a verdict can never render in two
 * different colors. Mint is deliberately absent — it is the sell-side's signature.
 */
export function verdictAccentVar(verdict: Verdict): string {
  switch (verdict) {
    case "PURSUE":
      return "var(--dq-accent)"
    case "DIG":
      return "var(--gold)"
    case "PASS":
      return "var(--crit)"
  }
}

/** Band → CSS variable, for sub-score bars and the dial arc. */
export function bandAccentVar(band: ScoreBand): string {
  switch (band) {
    case "strong":
      return "var(--dq-accent)"
    case "mixed":
      return "var(--gold)"
    case "weak":
      return "var(--crit)"
  }
}
