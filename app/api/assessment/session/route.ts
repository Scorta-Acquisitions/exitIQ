import { after } from "next/server"
import { z } from "zod"

import { computeSBASnapshot } from "@/lib/assessment/sba"
import { computeScore } from "@/lib/assessment/scoring"
import type { GateAnswers, Stage1Answers, Stage2Answers, Stage3Answers, Stage4Answers } from "@/lib/assessment/session"
import { db } from "@/lib/db"
import { assessmentSessions } from "@/lib/db/schema"

const sessionBodySchema = z.object({
  sessionId: z.string().min(1),
  stage1: z
    .object({
      industry: z.string().optional(),
      years: z.number().optional(),
      revenue: z.string().optional(),
      sde: z.string().optional(),
      employees: z.string().optional(),
      state: z.string().optional(),
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
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = sessionBodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data

  let score: number | undefined
  let sbaEligible: boolean | undefined

  if (data.completedAt !== undefined) {
    const scoreResult = computeScore({
      sessionId: data.sessionId,
      createdAt: Date.now(),
      stage1: data.stage1,
      gate: data.gate,
      stage2: data.stage2,
      stage3: data.stage3,
      stage4: data.stage4,
    })
    score = scoreResult.composite

    const sbaSnapshot = computeSBASnapshot(data.stage1 ?? {})
    sbaEligible = sbaSnapshot.eligible
  }

  const completedAtDate = data.completedAt !== undefined ? new Date(data.completedAt) : undefined

  // Cast partial types to full types for Drizzle (jsonb columns store whatever shape is provided)
  const s1 = data.stage1 as Stage1Answers | undefined
  const gateData = data.gate as GateAnswers | undefined
  const s2 = data.stage2 as Stage2Answers | undefined
  const s3 = data.stage3 as Stage3Answers | undefined
  const s4 = data.stage4 as Stage4Answers | undefined

  after(async () => {
    await db
      .insert(assessmentSessions)
      .values({
        sessionId: data.sessionId,
        stage1: s1 ?? null,
        gate: gateData ?? null,
        stage2: s2 ?? null,
        stage3: s3 ?? null,
        stage4: s4 ?? null,
        segmentTag: gateData?.tag ?? null,
        score: score ?? null,
        sbaEligible: sbaEligible ?? null,
        completedAt: completedAtDate ?? null,
      })
      .onConflictDoUpdate({
        target: assessmentSessions.sessionId,
        set: {
          ...(s1 !== undefined ? { stage1: s1 } : {}),
          ...(gateData !== undefined ? { gate: gateData, segmentTag: gateData.tag } : {}),
          ...(s2 !== undefined ? { stage2: s2 } : {}),
          ...(s3 !== undefined ? { stage3: s3 } : {}),
          ...(s4 !== undefined ? { stage4: s4 } : {}),
          ...(score !== undefined ? { score } : {}),
          ...(sbaEligible !== undefined ? { sbaEligible } : {}),
          ...(completedAtDate !== undefined ? { completedAt: completedAtDate } : {}),
        },
      })
  })

  return Response.json({ sessionId: data.sessionId, score: score ?? null, sbaEligible: sbaEligible ?? null })
}
