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
