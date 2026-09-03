import { streamText } from "ai"
import { z } from "zod"

import { anthropic, SONNET_MODEL } from "@/lib/ai"
import { buildChallengeMemoPrompt } from "@/lib/ai/prompts"
import { analyzeDeal } from "@/lib/dealiq/analyze"
import { DEAL_SEEDS } from "@/lib/dealiq/data/deal"
import { logger } from "@/lib/logger"

/**
 * POST { dealId } → streams a Sonnet challenge memo grounded in the computed
 * recast lines. The server recomputes `reverseRecast()` from the seed — it never
 * trusts client-supplied figures. On upstream failure the client falls back to
 * the placeholder memo (`FALLBACK_CHALLENGE_MEMO`); the table never waits on
 * this stream either way.
 */

const bodySchema = z.object({
  dealId: z.string().trim().min(1).max(200),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  // Any seeded deal can be narrated — the seed is what grounds the memo.
  const seed = DEAL_SEEDS.find((candidate) => candidate.card.id === parsed.data.dealId)
  if (!seed) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  try {
    const { recast } = analyzeDeal(seed)
    const result = streamText({
      model: anthropic(SONNET_MODEL),
      prompt: buildChallengeMemoPrompt({
        dealName: seed.card.name,
        claimedSde: recast.claimedSde,
        defensibleSde: recast.defensibleSde,
        totalAdjusted: recast.totalAdjusted,
        ask: seed.card.ask,
        fairValue: recast.fairValue,
        negotiationDelta: recast.negotiationDelta,
        lines: recast.lines,
      }),
    })
    return result.toTextStreamResponse()
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    logger.error("dealiq.narrate.stream_failed", { reason })
    return Response.json({ error: "upstream_error" }, { status: 502 })
  }
}
