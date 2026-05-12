import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { traceEvent } from "@/lib/debug/workflow-trace"
import { db } from "@/lib/db"
import { assessmentSessions } from "@/lib/db/schema"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params

  traceEvent("api.session_get.request", { sessionId: session_id })

  const row = await db.query.assessmentSessions.findFirst({
    where: eq(assessmentSessions.sessionId, session_id),
  })

  if (!row) {
    traceEvent("api.session_get.not_found", { sessionId: session_id })
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  traceEvent("api.session_get.found", {
    sessionId: session_id,
    hasStage1: !!row.stage1,
    hasGate: !!row.gate,
    isCompleted: !!row.completedAt,
    score: row.score ?? undefined,
  })

  return Response.json(row)
}
