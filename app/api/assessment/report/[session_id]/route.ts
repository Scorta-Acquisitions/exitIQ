import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { traceEvent } from "@/lib/debug/workflow-trace"
import { db } from "@/lib/db"
import { assessmentReports } from "@/lib/db/schema"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params

  traceEvent("api.report_get.request", { sessionId: session_id })

  const row = await db.query.assessmentReports.findFirst({
    where: eq(assessmentReports.sessionId, session_id),
  })

  if (!row) {
    traceEvent("api.report_get.not_found", { sessionId: session_id })
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  traceEvent("api.report_get.found", {
    sessionId: session_id,
    hasReportMd: !!row.reportMd,
    reportMdLength: row.reportMd?.length ?? 0,
  })

  return Response.json({
    status: "ready",
    reportMd: row.reportMd,
    createdAt: row.createdAt,
  })
}
