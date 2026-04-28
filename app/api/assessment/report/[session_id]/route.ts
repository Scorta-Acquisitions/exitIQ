import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { db } from "@/lib/db"
import { assessmentReports } from "@/lib/db/schema"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params

  const row = await db.query.assessmentReports.findFirst({
    where: eq(assessmentReports.sessionId, session_id),
  })

  if (!row) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  return Response.json({
    reportMd: row.reportMd,
    teaserJson: row.teaserJson,
    createdAt: row.createdAt,
  })
}
