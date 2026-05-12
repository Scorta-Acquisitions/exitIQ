/**
 * Client-event ingest endpoint for the local workflow tracer.
 *
 * Receives browser trace events and appends them to the same
 * .exitiq-debug/workflow.ndjson file as server-side traceEvent() calls,
 * producing a unified timeline sorted by `ts`.
 *
 * The underlying traceEvent() already guards against VERCEL=1, so this
 * endpoint is a no-op on hosted deployments even if the client flag leaks.
 */

import { traceEvent } from "@/lib/debug/workflow-trace"

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }

  if (typeof body === "object" && body !== null) {
    const { phase, ...rest } = body as Record<string, unknown>
    if (typeof phase === "string") {
      traceEvent(phase, rest as Record<string, unknown>)
    }
  }

  return Response.json({ ok: true })
}
