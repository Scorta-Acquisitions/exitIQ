import { streamText } from "ai"
import { eq } from "drizzle-orm"
import { after } from "next/server"
import { z } from "zod"

import { anthropic, SONNET_MODEL } from "@/lib/ai"
import { buildReportPrompt } from "@/lib/ai/prompts"
import { buildReportData } from "@/lib/assessment/report-transform"
import type { AssessmentSession } from "@/lib/assessment/session"
import { mapStage1ForScoring } from "@/lib/assessment/transform"
import { traceEvent } from "@/lib/debug/workflow-trace"
import { db } from "@/lib/db"
import { assessmentReports, assessmentSessions } from "@/lib/db/schema"
import { logger } from "@/lib/logger"

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

  traceEvent("api.generate.post_received", { sessionId })

  // Fetch the session — if missing here it is almost always the session/after() race:
  // the client called /generate before the DB upsert in after() completed.
  const session = await db.query.assessmentSessions.findFirst({
    where: eq(assessmentSessions.sessionId, sessionId),
  })

  if (!session) {
    logger.warn("generate.not_found", { sessionId })
    traceEvent("api.generate.session_not_found", {
      sessionId,
      note: "likely race: generate called before session after() upsert completed",
    })
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  traceEvent("api.generate.session_loaded", {
    sessionId,
    hasStage1: !!session.stage1,
    hasGate: !!session.gate,
    hasStage2: !!session.stage2,
  })

  // Require at minimum stage1 + gate; stages 2–4 are optional (Phase 1 only collects stage1 + gate)
  const missing: string[] = []
  if (!session.stage1) missing.push("stage1")
  if (!session.gate) missing.push("gate")

  if (missing.length > 0) {
    logger.warn("generate.incomplete_session", { sessionId, missing: missing.join(",") })
    traceEvent("api.generate.incomplete_session", { sessionId, missing })
    return Response.json({ error: "incomplete_session", missing }, { status: 422 })
  }

  // Check for cached report
  const existingReport = await db.query.assessmentReports.findFirst({
    where: eq(assessmentReports.sessionId, sessionId),
  })

  if (existingReport?.reportMd) {
    logger.info("generate.cache_hit", { sessionId, model: existingReport.modelUsed })
    traceEvent("api.generate.cache_hit", {
      sessionId,
      model: existingReport.modelUsed ?? undefined,
      reportMdLength: existingReport.reportMd.length,
    })
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

  // Build frozen ReportData once — shared by both the prompt and the visual renderer
  const s1Scored = mapStage1ForScoring({
    ...session.stage1,
    years: session.stage1?.years ?? 5,
  })
  const firstName = session.gate?.firstName ?? "there"
  const timeline = session.gate?.sellingTimeline

  const reportData = buildReportData(
    s1Scored,
    firstName,
    timeline,
    session.stage2 ?? undefined,
    session.stage3 ?? undefined,
    session.stage4 ?? undefined,
    { sessionId, origin: "api.generate" }
  )

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

  const prompt = buildReportPrompt(assessmentSession, reportData, { sessionId })
  traceEvent("api.generate.prompt_built", { sessionId, promptLength: prompt.length })

  const startMs = Date.now()

  logger.info("generate.started", { sessionId, model: SONNET_MODEL })
  traceEvent("api.generate.streamText_starting", { sessionId, model: SONNET_MODEL })

  const result = streamText({
    model: anthropic(SONNET_MODEL),
    prompt,
    onFinish: ({ text }) => {
      const generationMs = Date.now() - startMs
      logger.info("generate.finished", { sessionId, model: SONNET_MODEL, durationMs: generationMs })
      traceEvent("api.generate.stream_finished", {
        sessionId,
        model: SONNET_MODEL,
        durationMs: generationMs,
        textLength: text.length,
      })
      after(async () => {
        try {
          await db
            .insert(assessmentReports)
            .values({
              sessionId,
              reportMd: text,
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
          traceEvent("api.generate.report_md_persisted_in_after", { sessionId, textLength: text.length })
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          logger.error("generate.save_failed", { sessionId, error: errorMsg })
          traceEvent("api.generate.persist_failed_in_after", { sessionId, error: errorMsg })
        }
      })
    },
  })

  return result.toTextStreamResponse()
}
