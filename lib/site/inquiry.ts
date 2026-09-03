import { z } from "zod"

/**
 * Every form on the site opens the visitor's email client. In parallel, the page sends a small
 * structured record to `/api/inquiry` so the team sees the request even when the mail client never
 * opens. The schema is shared by the client beacon and the route handler.
 */

export const INQUIRY_KINDS = [
  "offer_review",
  "question",
  "buyer_passport",
  "advisor_briefing",
  "exitiq_review",
] as const
export type InquiryKind = (typeof INQUIRY_KINDS)[number]

export const inquirySchema = z.object({
  kind: z.enum(INQUIRY_KINDS),
  /** Reply-to address when the visitor provided one. */
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  /** The same text placed in the mailto body, capped so a runaway paste cannot flood logs or mail. */
  body: z.string().trim().min(1).max(6000),
  /** Page the request came from, for triage. */
  source: z.string().trim().max(120).optional(),
})

export type InquiryPayload = z.infer<typeof inquirySchema>

/**
 * Fire-and-forget submission from the browser. Never throws and never blocks the mailto handoff.
 * Returns true when the request was accepted, false otherwise.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<boolean> {
  try {
    if (typeof fetch === "undefined") return false
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    return res.ok
  } catch {
    return false
  }
}
