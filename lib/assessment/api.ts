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

import { traceClient } from "@/lib/debug/workflow-trace-client"
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
  traceClient("client.persist_session_http_start", {
    sessionId: patch.sessionId,
    isCompletion: patch.completedAt !== undefined,
    hasGate: !!patch.gate,
    emailPresent: !!patch.gate?.email,
    tag: patch.gate?.tag,
  })
  try {
    const res = await fetch("/api/assessment/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    traceClient("client.persist_session_http_done", { sessionId: patch.sessionId, ok: res.ok, status: res.status })
  } catch (err) {
    traceClient("client.persist_session_http_error", {
      sessionId: patch.sessionId,
      error: err instanceof Error ? err.message : "network_error",
    })
    // Network or server errors must not interrupt the user flow.
  }
}

export type TeaserResult = {
  headline: string
  valuationRange: string
  multipleContext: string
  buyerPoolPrimary: string
  strength1Title: string
  strength1Desc: string
  strength2Title: string
  strength2Desc: string
  risk1Title: string
  risk1Desc: string
  risk2Title: string
  risk2Desc: string
  revenueTrendSignal: "Bullish" | "Positive" | "Neutral" | "Softening" | "Bearish"
  teamSignal: "Scales without owner" | "Manageable depth" | "Transition risk" | "Key-man risk"
  recurringSignal: "Strong" | "Moderate-strong" | "Moderate" | "Low"
  brokerFeeNarrative: string
  topStrength: string
  topRisk: string
  segmentTag: "hot_seller" | "warm_explorer" | "nurture" | "burned_by_broker"
}

export type ReportResult = {
  status: "pending" | "ready"
  reportMd: string | null
  teaserJson: TeaserResult | null
  createdAt: string | null
}

/**
 * Polls `GET /api/assessment/report/[sessionId]` once and returns the result.
 * Returns `null` on any network or server error.
 */
export async function fetchReport(sessionId: string): Promise<ReportResult | null> {
  try {
    const res = await fetch(`/api/assessment/report/${encodeURIComponent(sessionId)}`)
    if (!res.ok) return null
    return (await res.json()) as ReportResult
  } catch {
    return null
  }
}

/**
 * Requests a teaser card from Haiku and persists it to `assessment_reports`.
 * Resolves with the parsed object, or `null` on any error.
 *
 * Fire-and-forget: `void requestTeaser(sessionId)`.
 */
export async function requestTeaser(sessionId: string): Promise<TeaserResult | null> {
  traceClient("client.request_teaser_start", { sessionId })
  try {
    const res = await fetch("/api/assessment/teaser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) {
      traceClient("client.request_teaser_error", { sessionId, status: res.status })
      return null
    }
    traceClient("client.request_teaser_ok", { sessionId, status: res.status })
    return (await res.json()) as TeaserResult
  } catch (err) {
    traceClient("client.request_teaser_network_error", {
      sessionId,
      error: err instanceof Error ? err.message : "network_error",
    })
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
  traceClient("client.request_generate_start", { sessionId })
  try {
    const res = await fetch("/api/assessment/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) {
      traceClient("client.request_generate_error", { sessionId, status: res.status })
      return null
    }
    traceClient("client.request_generate_stream_response_received", { sessionId, status: res.status })
    return res
  } catch (err) {
    traceClient("client.request_generate_network_error", {
      sessionId,
      error: err instanceof Error ? err.message : "network_error",
    })
    return null
  }
}
