import { streamText } from "ai"
import { z } from "zod"

import { anthropic, HAIKU_MODEL } from "@/lib/ai"
import { buildCaseSystemPrompt } from "@/lib/caseChat"
import { logger } from "@/lib/logger"

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  route: z.string().trim().min(1).max(200).default("/dashboard"),
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

  const { message, route } = parsed.data

  try {
    const result = streamText({
      model: anthropic(HAIKU_MODEL),
      system: buildCaseSystemPrompt(route),
      prompt: message,
    })
    return result.toTextStreamResponse()
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    logger.error("case_chat.stream_failed", { route, error: errorMsg })
    return Response.json({ error: "upstream_error" }, { status: 502 })
  }
}
