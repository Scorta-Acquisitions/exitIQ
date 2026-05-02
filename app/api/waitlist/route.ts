import { after } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { waitlist } from "@/lib/db/schema"
import { logger } from "@/lib/logger"

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["seller", "buyer", "advisor", "both"]).optional(),
  source: z.string().optional(),
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

  const { email, role, source } = parsed.data

  logger.info("waitlist.signup", { role: role ?? "unknown", source: source ?? "direct" })

  after(async () => {
    try {
      await db
        .insert(waitlist)
        .values({ email, role: role ?? null, source: source ?? null })
        .onConflictDoNothing({ target: waitlist.email })
    } catch (err) {
      logger.error("waitlist.save_failed", {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  return Response.json({ success: true })
}
