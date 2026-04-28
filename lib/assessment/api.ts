/**
 * Client-side fetch wrappers for the assessment API routes.
 *
 * Pattern: call these immediately after the matching localStorage save so the
 * UI is never blocked by a network round-trip. All functions swallow errors —
 * localStorage is the source of truth for the active session; the database is
 * the durable, server-side record.
 *
 * Browser → /api/assessment/* → Supabase (service key, server-side)
 */

import type { GateAnswers, Stage1Answers, Stage2Answers, Stage3Answers, Stage4Answers } from "./session"

export type SessionPatch = {
  sessionId: string
  stage1?: Partial<Stage1Answers>
  gate?: Partial<GateAnswers>
  stage2?: Partial<Stage2Answers>
  stage3?: Partial<Stage3Answers>
  stage4?: Partial<Stage4Answers>
  /** Unix ms — triggers server-side score + SBA computation when present. */
  completedAt?: number
}

/**
 * Upserts a session patch to `assessment_sessions` via the API (service key
 * on the server). When `completedAt` is included the server also computes the
 * composite score and SBA snapshot.
 *
 * Fire-and-forget: `void persistSession(...)`.
 */
export async function persistSession(patch: SessionPatch): Promise<void> {
  try {
    await fetch("/api/assessment/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  } catch {
    // Network or server errors must not interrupt the user flow.
  }
}

export type TeaserResult = {
  headline: string
  valuationRange: string
  topStrength: string
  topRisk: string
  segmentTag: "hot_seller" | "warm_explorer" | "nurture" | "burned_by_broker"
}

/**
 * Requests a teaser card from Haiku and persists it to `assessment_reports`.
 * Resolves with the parsed object, or `null` on any error.
 *
 * Fire-and-forget: `void requestTeaser(sessionId)`.
 */
export async function requestTeaser(sessionId: string): Promise<TeaserResult | null> {
  try {
    const res = await fetch("/api/assessment/teaser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) return null
    return (await res.json()) as TeaserResult
  } catch {
    return null
  }
}

/**
 * Kicks off full AI report generation via Sonnet and returns the streaming
 * `Response` so the caller can consume it, or `null` on any error. The server
 * automatically upserts the finished report into `assessment_reports`.
 *
 * Fire-and-forget: `void requestGenerate(sessionId)`.
 */
export async function requestGenerate(sessionId: string): Promise<Response | null> {
  try {
    const res = await fetch("/api/assessment/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) return null
    return res
  } catch {
    return null
  }
}
