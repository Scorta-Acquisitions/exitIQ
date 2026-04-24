import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { db } from "@/lib/db"
import { assessmentSessions } from "@/lib/db/schema"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params

  const row = await db.query.assessmentSessions.findFirst({
    where: eq(assessmentSessions.sessionId, session_id),
  })

  if (!row) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  return Response.json(row)
}
