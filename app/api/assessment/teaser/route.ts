import { generateObject } from "ai"
import { eq } from "drizzle-orm"
import { after } from "next/server"
import { z } from "zod"

import { anthropic, HAIKU_MODEL } from "@/lib/ai"
import { buildTeaserPrompt } from "@/lib/ai/prompts"
import type { AssessmentSession } from "@/lib/assessment/session"
import { db } from "@/lib/db"
import { assessmentReports, assessmentSessions } from "@/lib/db/schema"
import { logger, timed } from "@/lib/logger"

const teaserBodySchema = z.object({
  sessionId: z.string().min(1),
})

const teaserOutputSchema = z.object({
  headline: z.string(),
  valuationRange: z.string(),
  topStrength: z.string(),
  topRisk: z.string(),
  segmentTag: z.enum(["hot_seller", "warm_explorer", "nurture", "burned_by_broker"]),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = teaserBodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  const { sessionId } = parsed.data

  // Fetch the session
  const session = await db.query.assessmentSessions.findFirst({
    where: eq(assessmentSessions.sessionId, sessionId),
  })

  if (!session) {
    logger.warn("teaser.not_found", { sessionId })
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  // Validate stage1 + gate are present
  const missing: string[] = []
  if (!session.stage1) missing.push("stage1")
  if (!session.gate) missing.push("gate")

  if (missing.length > 0) {
    logger.warn("teaser.incomplete_session", { sessionId, missing: missing.join(",") })
    return Response.json({ error: "incomplete_session", missing }, { status: 422 })
  }

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

  const prompt = buildTeaserPrompt(assessmentSession)

  const { object } = await timed(
    "ai.teaser",
    () =>
      (
        generateObject as (opts: {
          model: unknown
          schema: unknown
          prompt: string
        }) => Promise<{ object: z.infer<typeof teaserOutputSchema> }>
      )({
        model: anthropic(HAIKU_MODEL),
        schema: teaserOutputSchema,
        prompt,
      }),
    { sessionId, model: HAIKU_MODEL }
  )

  after(async () => {
    try {
      // assessment_reports.session_id has no unique constraint — update first,
      // insert only if no row exists yet.
      const updated = await db
        .update(assessmentReports)
        .set({ teaserJson: object })
        .where(eq(assessmentReports.sessionId, sessionId))
        .returning({ id: assessmentReports.id })

      if (updated.length === 0) {
        await db.insert(assessmentReports).values({
          sessionId,
          reportMd: "",
          teaserJson: object,
          modelUsed: HAIKU_MODEL,
          generationMs: null,
        })
      }
    } catch (err) {
      logger.error("teaser.save_failed", {
        sessionId,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  return Response.json(object)
}
