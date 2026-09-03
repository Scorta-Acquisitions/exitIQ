import { after } from "next/server"
import { Resend } from "resend"
import { env } from "@/env.mjs"
import { logger } from "@/lib/logger"
import { inquirySchema } from "@/lib/site/inquiry"
import { CONTACT } from "@/lib/site/routes"

/**
 * POST /api/inquiry — records a site inquiry (offer review, question, buyer registration, advisor
 * briefing, exitIQ review). Validates the body, logs a redacted structured event, and when Resend is
 * configured forwards the text to the team inbox after the response is sent. Without a Resend key the
 * route still accepts the request so the page behaves identically in every environment.
 */

const MAX_BODY_BYTES = 32 * 1024

const INBOX: Record<string, string> = {
  offer_review: CONTACT.offers,
  buyer_passport: CONTACT.buyers,
}

export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") ?? 0)
  if (length > MAX_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = inquirySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
  }

  const { kind, email, body, source } = parsed.data
  logger.info("site.inquiry.received", {
    kind,
    source: source ?? "unknown",
    hasEmail: Boolean(email),
    bodyLength: body.length,
  })

  if (env.RESEND_API_KEY) {
    const apiKey = env.RESEND_API_KEY
    after(async () => {
      try {
        const resend = new Resend(apiKey)
        const to = INBOX[kind] ?? CONTACT.hello
        const result = await resend.emails.send({
          from: "Heirloom Site <noreply@heirloom.com>",
          to,
          replyTo: email || undefined,
          subject: `[site] ${kind.replace(/_/g, " ")}${source ? ` · ${source}` : ""}`,
          text: body,
        })
        if (result.error) {
          logger.error("site.inquiry.send_failed", { kind, error: result.error.message })
        } else {
          logger.info("site.inquiry.sent", { kind, resendId: result.data?.id })
        }
      } catch (err) {
        logger.error("site.inquiry.send_failed", { kind, error: err instanceof Error ? err.message : String(err) })
      }
    })
  }

  return Response.json({ accepted: true, forwarded: Boolean(env.RESEND_API_KEY) }, { status: 202 })
}
