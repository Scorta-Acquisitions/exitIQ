import { after } from "next/server"
import { z } from "zod"

import { computeSBASnapshot } from "@/lib/assessment/sba"
import { computeScore } from "@/lib/assessment/scoring"
import type { GateAnswers, Stage1Answers, Stage2Answers, Stage3Answers, Stage4Answers } from "@/lib/assessment/session"
import { mapStage1ForScoring } from "@/lib/assessment/transform"
import { compactStagesForTrace, redactGateForTrace, traceEvent } from "@/lib/debug/workflow-trace"
import { db } from "@/lib/db"
import { assessmentSessions } from "@/lib/db/schema"
import { sendWelcomeEmail } from "@/lib/email"
import { logger } from "@/lib/logger"

const sessionBodySchema = z.object({
  sessionId: z.string().min(1),
  stage1: z
    .object({
      industry: z.string().optional(),
      // years may come in as a number (from client mapping) or string (legacy)
      years: z.union([z.number(), z.string()]).optional(),
      revenue: z.string().optional(),
      sde: z.string().optional(),
      employees: z.string().optional(),
      state: z.string().optional(),
      facilityType: z.string().optional(),
      docReadiness: z.string().optional(),
    })
    .optional(),
  gate: z
    .object({
      firstName: z.string().optional(),
      email: z.string().optional(),
      sellingTimeline: z.string().optional(),
      tag: z.enum(["hot_seller", "warm_explorer", "nurture", "burned_by_broker"]).optional(),
    })
    .optional(),
  stage2: z
    .object({
      ownerDependency: z.string().optional(),
      customerConcentration: z.string().optional(),
      revenueTrend: z.string().optional(),
      recurringRevenue: z.string().optional(),
      docReadiness: z.string().optional(),
      realEstate: z.string().optional(),
      reasonForSelling: z.string().optional(),
    })
    .optional(),
  stage3: z
    .object({
      sbaRestricted: z.string().optional(),
      keyPersonRisk: z.string().optional(),
      sops: z.string().optional(),
      growthLevers: z.string().optional(),
      legal: z.string().optional(),
    })
    .optional(),
  stage4: z
    .object({
      askingPrice: z.string().optional(),
      dealStructure: z.array(z.string()).optional(),
      urgency: z.string().optional(),
      brokerStatus: z.string().optional(),
    })
    .optional(),
  completedAt: z.number().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    traceEvent("api.session.parse_failed", { reason: "invalid_json" })
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = sessionBodySchema.safeParse(body)
  if (!parsed.success) {
    traceEvent("api.session.validation_failed", { issueCount: parsed.error.issues.length })
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data

  let score: number | undefined
  let sbaEligible: boolean | undefined

  if (data.completedAt !== undefined) {
    // Translate frontend labels to scoring slugs without altering stored stage1
    const scoringStage1 = data.stage1 ? mapStage1ForScoring(data.stage1 as Partial<Stage1Answers>) : {}

    const scoreResult = computeScore({
      sessionId: data.sessionId,
      createdAt: Date.now(),
      stage1: scoringStage1,
      gate: data.gate,
      stage2: data.stage2,
      stage3: data.stage3,
      stage4: data.stage4,
    })
    score = scoreResult.composite

    const sbaSnapshot = computeSBASnapshot(scoringStage1)
    sbaEligible = sbaSnapshot.eligible
  }

  const completedAtDate = data.completedAt !== undefined ? new Date(data.completedAt) : undefined

  // Cast partial types — JSONB columns store whatever shape is provided
  const s1 = data.stage1 as Stage1Answers | undefined
  const gateData = data.gate as GateAnswers | undefined
  const s2 = data.stage2 as Stage2Answers | undefined
  const s3 = data.stage3 as Stage3Answers | undefined
  const s4 = data.stage4 as Stage4Answers | undefined

  const isCompletion = data.completedAt !== undefined

  traceEvent("api.session.post_received", {
    sessionId: data.sessionId,
    isCompletion,
    hasStage1: !!data.stage1,
    hasGate: !!data.gate,
    gate: gateData ? redactGateForTrace(gateData) : undefined,
    score: score ?? undefined,
    sbaEligible: sbaEligible ?? undefined,
    // Stage2/3 presence and actual signal values — critical for verifying Signal Mapping Fix
    ...compactStagesForTrace(
      data.stage2 as Record<string, unknown> | undefined,
      data.stage3 as Record<string, unknown> | undefined,
      data.stage4 as Record<string, unknown> | undefined
    ),
  })

  logger.info("session.upsert", {
    sessionId: data.sessionId,
    isCompletion,
    score: score ?? undefined,
    sbaEligible: sbaEligible ?? undefined,
    leadQuality: gateData?.tag ?? undefined,
  })

  after(async () => {
    try {
      await db
        .insert(assessmentSessions)
        .values({
          sessionId: data.sessionId,
          stage1: s1 ?? null,
          gate: gateData ?? null,
          stage2: s2 ?? null,
          stage3: s3 ?? null,
          stage4: s4 ?? null,
          leadQuality: gateData?.tag ?? null,
          score: score ?? null,
          sbaEligible: sbaEligible ?? null,
          completedAt: completedAtDate ?? null,
        })
        .onConflictDoUpdate({
          target: assessmentSessions.sessionId,
          set: {
            ...(s1 !== undefined ? { stage1: s1 } : {}),
            ...(gateData !== undefined ? { gate: gateData, leadQuality: gateData.tag } : {}),
            ...(s2 !== undefined ? { stage2: s2 } : {}),
            ...(s3 !== undefined ? { stage3: s3 } : {}),
            ...(s4 !== undefined ? { stage4: s4 } : {}),
            ...(score !== undefined ? { score } : {}),
            ...(sbaEligible !== undefined ? { sbaEligible } : {}),
            ...(completedAtDate !== undefined ? { completedAt: completedAtDate } : {}),
          },
        })
      traceEvent("api.session.db_upsert_ok_in_after", {
        sessionId: data.sessionId,
        score: score ?? undefined,
        sbaEligible: sbaEligible ?? undefined,
        isCompletion,
        // Confirms whether stage2/3 were actually written (key for Signal Mapping Fix verification)
        wroteStage2: s2 != null,
        wroteStage3: s3 != null,
        ...compactStagesForTrace(
          s2 as unknown as Record<string, unknown> | undefined,
          s3 as unknown as Record<string, unknown> | undefined,
          s4 as unknown as Record<string, unknown> | undefined
        ),
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      logger.error("session.save_failed", { sessionId: data.sessionId, error: errorMsg })
      traceEvent("api.session.db_upsert_failed_in_after", { sessionId: data.sessionId, error: errorMsg })
    }

    if (isCompletion && gateData) {
      traceEvent("api.session.email_send_started", { sessionId: data.sessionId, tag: gateData.tag })
      try {
        await sendWelcomeEmail({
          gate: gateData,
          stage1: s1,
          leadQuality: gateData.tag ?? "nurture",
        })
        traceEvent("api.session.email_send_ok", { sessionId: data.sessionId })
      } catch (err) {
        traceEvent("api.session.email_send_failed", {
          sessionId: data.sessionId,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
  })

  // IMPORTANT: HTTP 200 is returned HERE, before after() runs the DB upsert.
  // If a client immediately calls /api/assessment/generate after receiving this
  // response, the session may not yet exist in the DB (race window).
  traceEvent("api.session.http_200_sent_before_after", {
    sessionId: data.sessionId,
    note: "DB upsert runs in after() — generate race window starts now",
  })
  return Response.json({ sessionId: data.sessionId, score: score ?? null, sbaEligible: sbaEligible ?? null })
}
