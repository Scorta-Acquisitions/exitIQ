/**
 * Client-side workflow trace helper — local dev only.
 *
 * POSTs events to POST /api/debug/workflow-trace, which appends them to the
 * same .exitiq-debug/workflow.ndjson file as the server tracer. This lets you
 * correlate browser events (gate submit, stream start, report render) with
 * server events (session upsert, AI generation) in a single timeline.
 *
 * Gated behind NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG=true. On Vercel the server
 * route is a no-op so no data is persisted even if the flag leaks through.
 *
 * Usage (fire-and-forget):
 *   traceClient("client.email_gate_submit_start", { emailPresent: true, tag })
 */

const ENABLED =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG === "true"

export function traceClient(phase: string, payload?: Record<string, unknown>): void {
  if (!ENABLED) return
  void fetch("/api/debug/workflow-trace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ts: Date.now(),
      iso: new Date().toISOString(),
      src: "client",
      phase,
      ...payload,
    }),
  }).catch(() => undefined)
}

/** Object-style wrapper used by components that prefer named args over positional. */
export function workflowTraceClient({
  phase,
  ...rest
}: {
  phase: string
  sessionId?: string
  origin?: string
  detail?: Record<string, unknown>
}): void {
  traceClient(phase, rest as Record<string, unknown>)
}
