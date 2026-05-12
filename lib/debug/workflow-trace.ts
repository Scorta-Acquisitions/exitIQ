/**
 * Server-side NDJSON workflow tracer — local dev only.
 *
 * Output layout:
 *   .exitiq-debug/
 *     sessions/<sessionId>.ndjson  ← one file per session, all events for that session
 *     workflow.ndjson              ← catch-all for events with no sessionId
 *
 * Guards:
 *   - Only active when EXITIQ_WORKFLOW_LOG=true
 *   - Never writes on Vercel (VERCEL=1 is set automatically)
 *   - All writes are synchronous but the function never throws
 *
 * Usage:
 *   traceEvent("api.generate.stream_finished", { sessionId, durationMs, textLength })
 */

import * as fs from "fs"
import * as path from "path"

// Read directly — bypasses t3-env server guard so Vitest and Edge-bundled
// helpers can call this without hitting the server-only env schema.
const ENABLED = process.env.EXITIQ_WORKFLOW_LOG === "true" && process.env.VERCEL !== "1"

const LOG_DIR = path.join(process.cwd(), ".exitiq-debug")
const SESSION_DIR = path.join(LOG_DIR, "sessions")
const CATCHALL_FILE = path.join(LOG_DIR, "workflow.ndjson")

/** Sanitise a sessionId so it is safe to use as a filename. */
function safeSessionId(sid: string): string {
  return sid.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80)
}

export function traceEvent(phase: string, payload?: Record<string, unknown>): void {
  if (!ENABLED) return
  const entry = JSON.stringify({
    ts: Date.now(),
    iso: new Date().toISOString(),
    src: "server",
    phase,
    ...payload,
  })
  try {
    const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId : null
    if (sessionId) {
      fs.mkdirSync(SESSION_DIR, { recursive: true })
      fs.appendFileSync(path.join(SESSION_DIR, `${safeSessionId(sessionId)}.ndjson`), entry + "\n")
    } else {
      fs.mkdirSync(LOG_DIR, { recursive: true })
      fs.appendFileSync(CATCHALL_FILE, entry + "\n")
    }
  } catch {
    // Tracing must never crash the app.
  }
}

/** Redacts PII from gate data before tracing. Only records presence, not values. */
export function redactGateForTrace(gate: {
  firstName?: string
  email?: string
  sellingTimeline?: string
  tag?: string
}): Record<string, unknown> {
  return {
    firstNamePresent: !!gate.firstName,
    emailPresent: !!gate.email,
    sellingTimeline: gate.sellingTimeline,
    tag: gate.tag,
  }
}

/** Structured event writer used by server-side pipeline stages (report page, prompts, transform). */
export function appendWorkflowTrace({
  phase,
  ...rest
}: {
  phase: string
  surface?: string
  sessionId?: string
  origin?: string
  detail?: Record<string, unknown>
}): void {
  traceEvent(phase, rest as Record<string, unknown>)
}

/**
 * Returns a compact summary of stage2/3/4 for a trace detail object.
 * Includes both key presence (for quick boolean checks) AND actual values
 * (all stage2/3/4 fields are non-PII slugs like "25_50", "one", "over_75").
 * Spread the result into a trace `detail` object.
 */
export function compactStagesForTrace(
  s2?: Record<string, unknown>,
  s3?: Record<string, unknown>,
  s4?: Record<string, unknown>
): Record<string, unknown> {
  const presentVals = (obj?: Record<string, unknown>) =>
    obj
      ? Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ""))
      : {}
  const s2v = presentVals(s2)
  const s3v = presentVals(s3)
  const s4v = presentVals(s4)
  return {
    hasStage2: Object.keys(s2v).length > 0,
    hasStage3: Object.keys(s3v).length > 0,
    hasStage4: Object.keys(s4v).length > 0,
    s2: s2v,
    s3: s3v,
    s4: s4v,
  }
}
