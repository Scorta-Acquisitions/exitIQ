/**
 * Deal Clock — elapsed-time framing for the active engagement.
 *
 * Elapsed days are derived from the audit trail's own dated entries (not the
 * system clock), so the day count reflects the persona's frozen timeline —
 * intake through the most recently logged agent action — regardless of when
 * the demo runs.
 *
 * The broker-benchmark figures are sourced facts, not per-deal projections:
 * the 186-day average time-to-close is the same figure quoted in the landing
 * page's deal-comparison section; the human-hours range is Scorta's own
 * stated benchmark ("a traditional broker puts ~250–300 hours into a $1M
 * deal") from the YC application.
 */

import { AUDIT_TRAIL } from "@/lib/auditTrail"

const MS_PER_DAY = 1000 * 60 * 60 * 24

const MONTHS: Readonly<Record<string, number>> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
}

/** Parses the audit trail's `"MMM D, YYYY"` date labels into a UTC day timestamp. */
export function parseDateLabel(label: string): number {
  const match = /^(\w{3})\w* (\d{1,2}), (\d{4})$/.exec(label)
  const month = match ? MONTHS[match[1]!] : undefined
  if (!match || month === undefined) {
    throw new Error(`Deal Clock: unparseable audit date label "${label}"`)
  }
  return Date.UTC(Number(match[3]), month, Number(match[2]))
}

export const BROKER_AVG_DAYS_TO_CLOSE = 186
/** Midpoint of the "250–300 hours" range cited in the YC application. */
export const BROKER_AVG_HUMAN_HOURS = 275

export type DealClock = {
  /** 1-indexed day count from intake through the most recent logged action. */
  dayNumber: number
  agentActionCount: number
  brokerAvgDaysToClose: number
  brokerAvgHumanHours: number
}

export function getDealClock(): DealClock {
  const dates = AUDIT_TRAIL.map((entry) => parseDateLabel(entry.dateLabel))
  const first = Math.min(...dates)
  const last = Math.max(...dates)

  return {
    dayNumber: Math.round((last - first) / MS_PER_DAY) + 1,
    agentActionCount: AUDIT_TRAIL.length,
    brokerAvgDaysToClose: BROKER_AVG_DAYS_TO_CLOSE,
    brokerAvgHumanHours: BROKER_AVG_HUMAN_HOURS,
  }
}
