/**
 * Audit Trail velocity — the "speed to close" claim made concrete per entry.
 *
 * Per-entry human-minutes are a modeled estimate, not a measured figure (the
 * audit trail doesn't log wall-clock human time). The model is deliberately
 * simple and keyed off the one signal every entry already carries —
 * `severity` — so it stays honest about being an estimate rather than
 * dressing up an invented number as fact:
 *
 *   "review" — the entry is staged for an explicit seller approve/decline
 *              decision (e.g. an add-back schedule, a contract draft).
 *              Modeled at 15 min: read the recommendation, decide.
 *   "flag"   — a risk surfaced for awareness (e.g. concentration, key-person
 *              risk). Modeled at 5 min: skimmed, not acted on immediately.
 *   unmarked — a routine agent log line. Modeled at 2 min: a quick glance.
 *
 * These weights are demo assumptions, documented so they can be revisited —
 * not a claim about actual time-on-task.
 */

import { AUDIT_TRAIL, type AuditEntry } from "@/lib/auditTrail"

type Severity = "review" | "flag" | "info"

const HUMAN_MINUTES_BY_SEVERITY: Readonly<Record<Severity, number>> = {
  review: 15,
  flag: 5,
  info: 2,
}

function severityOf(entry: AuditEntry): Severity {
  return entry.severity === "review" || entry.severity === "flag" ? entry.severity : "info"
}

/** Modeled human-minutes cost of a single audit entry. */
export function getEntryMinutes(entry: AuditEntry): number {
  return HUMAN_MINUTES_BY_SEVERITY[severityOf(entry)]
}

export type EntryVelocity = {
  minutes: number
  /** Running total of human-minutes through this entry, in chronological order. */
  cumulativeMinutes: number
}

/**
 * Cumulative human-minutes-so-far, keyed by entry id. `AUDIT_TRAIL` is stored
 * oldest-first (the UI reverses it for newest-first display), so iterating it
 * in source order is the correct chronological accumulation.
 */
export function getVelocityById(): ReadonlyMap<string, EntryVelocity> {
  const map = new Map<string, EntryVelocity>()
  let running = 0
  for (const entry of AUDIT_TRAIL) {
    running += getEntryMinutes(entry)
    map.set(entry.id, { minutes: getEntryMinutes(entry), cumulativeMinutes: running })
  }
  return map
}

export type AuditVelocitySummary = {
  totalActions: number
  totalHumanMinutes: number
  totalHumanHours: number
}

export function getAuditVelocitySummary(): AuditVelocitySummary {
  const velocity = getVelocityById()
  const totalHumanMinutes = Array.from(velocity.values()).reduce((sum, v) => sum + v.minutes, 0)
  return {
    totalActions: AUDIT_TRAIL.length,
    totalHumanMinutes,
    totalHumanHours: Math.round((totalHumanMinutes / 60) * 10) / 10,
  }
}
