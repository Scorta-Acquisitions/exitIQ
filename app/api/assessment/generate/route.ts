import { streamText } from "ai"
import { eq } from "drizzle-orm"
import { after } from "next/server"
import { z } from "zod"

import { anthropic, SONNET_MODEL } from "@/lib/ai"
import { buildReportPrompt } from "@/lib/ai/prompts"
import type { AssessmentSession } from "@/lib/assessment/session"
import { db } from "@/lib/db"
import { assessmentReports, assessmentSessions } from "@/lib/db/schema"

const generateBodySchema = z.object({
  sessionId: z.string().min(1),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = generateBodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  const { sessionId } = parsed.data

  // Fetch the session
  const session = await db.query.assessmentSessions.findFirst({
    where: eq(assessmentSessions.sessionId, sessionId),
  })

  if (!session) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  // Validate all 4 stages + gate are present
  const missing: string[] = []
  if (!session.stage1) missing.push("stage1")
  if (!session.gate) missing.push("gate")
  if (!session.stage2) missing.push("stage2")
  if (!session.stage3) missing.push("stage3")
  if (!session.stage4) missing.push("stage4")

  if (missing.length > 0) {
    return Response.json({ error: "incomplete_session", missing }, { status: 422 })
  }

  // Check for cached report
  const existingReport = await db.query.assessmentReports.findFirst({
    where: eq(assessmentReports.sessionId, sessionId),
  })

  if (existingReport?.reportMd) {
    // Stream the cached report back
    const cached = existingReport.reportMd
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(cached))
        controller.close()
      },
    })
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  // Build the prompt
  const assessmentSession: AssessmentSession = {
    sessionId: session.sessionId,
    createdAt: session.createdAt.getTime(),
    stage1: session.stage1 ?? undefined,
    gate: session.gate ?? undefined,
    stage2: session.stage2 ?? undefined,
    stage3: session.stage3 ?? undefined,
    stage4: session.stage4 ?? undefined,
    completedAt: session.completedAt?.getTime(),
  }

  const prompt = buildReportPrompt(assessmentSession)
  const startMs = Date.now()

  const result = streamText({
    model: anthropic(SONNET_MODEL),
    prompt,
    onFinish: ({ text }) => {
      const generationMs = Date.now() - startMs
      after(async () => {
        await db
          .insert(assessmentReports)
          .values({
            sessionId,
            reportMd: text,
            teaserJson: null,
            modelUsed: SONNET_MODEL,
            generationMs,
          })
          .onConflictDoUpdate({
            target: assessmentReports.sessionId,
            set: {
              reportMd: text,
              modelUsed: SONNET_MODEL,
              generationMs,
            },
          })
      })
    },
  })

  return result.toTextStreamResponse()
}
