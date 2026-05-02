import { Resend } from "resend"
import { env } from "@/env.mjs"
import type { GateAnswers, SegmentTag, Stage1Answers } from "@/lib/assessment/session"
import { logger } from "@/lib/logger"

const FROM = "Scorta <noreply@scorta.co>" // update once domain is verified in Resend

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null
  return new Resend(env.RESEND_API_KEY)
}

interface WelcomeEmailParams {
  gate: Partial<GateAnswers>
  stage1?: Partial<Stage1Answers>
  leadQuality: SegmentTag
}

function buildSubject(leadQuality: SegmentTag, firstName: string): string {
  if (leadQuality === "hot_seller") return `${firstName}, your ExitIQ valuation is ready`
  if (leadQuality === "burned_by_broker") return `${firstName}, here's a better path to your exit`
  return `${firstName}, your ExitIQ report is on its way`
}

function buildHtml(params: WelcomeEmailParams): string {
  const { gate, leadQuality } = params
  const name = gate.firstName ?? "there"

  const bodyBySegment: Record<SegmentTag, string> = {
    hot_seller: `
      <p>You're in the high-intent cohort — businesses selling within 6–12 months are our priority.</p>
      <p>Your full ExitIQ Report includes your valuation range, buyer risk scan, and a personalized 90-day exit prep plan.</p>
      <p>While your report generates, here's what to do next:</p>
      <ul>
        <li>Pull your last 3 years of P&amp;L and tax returns</li>
        <li>Note any owner-dependent tasks you handle personally</li>
        <li>Think about your minimum acceptable price — we'll pressure-test it against buyer data</li>
      </ul>
    `,
    warm_explorer: `
      <p>You're thinking ahead — that's exactly the right time to understand your exit options.</p>
      <p>Your full ExitIQ Report includes your valuation range, buyer risk scan, and a 90-day prep plan you can start now and revisit as you get closer.</p>
      <p>Owners who prepare 1–2 years early consistently achieve 20–40% higher multiples than those who rush to market.</p>
    `,
    burned_by_broker: `
      <p>We know broker experiences can be frustrating. Scorta is built for exactly your situation.</p>
      <p>Your full ExitIQ Report gives you the same intelligence a good broker would have — without the 10% fee or the information asymmetry.</p>
      <p>Your report includes what buyers will actually scrutinize, and a checklist of what to fix before going back to market.</p>
    `,
    nurture: `
      <p>Even if you're just exploring, understanding your business's value is one of the best things you can do as an owner.</p>
      <p>Your ExitIQ Report is generating now. It includes a valuation estimate, a buyer-readiness snapshot, and action items if you ever decide to sell.</p>
    `,
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="font-family:Inter,sans-serif;background:#0a0a0b;color:#e2e2e6;max-width:560px;margin:0 auto;padding:32px 24px;">
  <div style="margin-bottom:32px;">
    <span style="font-family:Georgia,serif;font-size:22px;font-weight:300;letter-spacing:-.3px;color:#f0f0f3;">Scorta</span>
  </div>
  <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;color:#f0f0f3;line-height:1.2;margin:0 0 16px;">
    Hi ${name}, your ExitIQ report is generating.
  </h1>
  ${bodyBySegment[leadQuality]}
  <div style="margin-top:32px;padding:20px;background:#141416;border:1px solid #262629;border-radius:12px;">
    <p style="margin:0 0 12px;font-size:13px;color:#9a9aa8;">For informational purposes only. Not financial advice.</p>
    <p style="margin:0;font-size:13px;color:#9a9aa8;">© 2025 Scorta. All rights reserved.</p>
  </div>
</body>
</html>`
}

/**
 * Sends the post-submission welcome email via Resend. Silently no-ops if
 * RESEND_API_KEY is not configured. Called from within an after() hook so
 * email failures never affect the HTTP response.
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const resend = getResend()
  if (!resend || !params.gate.email) return

  const firstName = params.gate.firstName ?? "there"
  const to = params.gate.email

  logger.info("email.sending", { leadQuality: params.leadQuality })

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: buildSubject(params.leadQuality, firstName),
      html: buildHtml(params),
    })
    logger.info("email.sent", { leadQuality: params.leadQuality, resendId: result.data?.id })
  } catch (err) {
    // Email failures must not surface to callers, but they must be visible in logs
    logger.error("email.failed", {
      leadQuality: params.leadQuality,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
