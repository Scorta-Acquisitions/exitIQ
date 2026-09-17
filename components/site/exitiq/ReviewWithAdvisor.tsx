// use client: opens the booking page with the exitIQ result attached
"use client"

import { ADVISOR_ERROR_COPY, ADVISOR_SENT_COPY, useAdvisorReview } from "@/components/site/exitiq/ExitIqActions"
import { Button } from "@/components/site/ui/Button"
import { CARD_CLASS, CARD_PADDING } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"

/**
 * The third card in the /score next-steps grid: a whole-card button in the Card recipe (surface,
 * hairline, 18px radius, 24px padding). The title carries the accent so the card reads as a control next
 * to the static "Keep the plan" card without relying on hover; the blurb stays muted.
 */
export function ReviewWithAdvisorCard() {
  const { send } = useAdvisorReview()
  return (
    <button type="button" onClick={send} className={cn(CARD_CLASS, CARD_PADDING, "pressable block w-full text-left")}>
      <span className="type-tagline text-accent block">Review it with an advisor</span>
      <p className="type-body text-fg-2 mt-2">Book a call with Suyash. Your result goes into the booking notes.</p>
    </button>
  )
}

/** The primary review button with its note, plus the success and error lines that follow a click. */
export function ReviewWithAdvisorButton() {
  const { sent, error, send } = useAdvisorReview()
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button onClick={send}>Review my result with an advisor</Button>
        <span className="type-caption text-fg-3 max-w-[420px]">Your result goes into the booking notes.</span>
      </div>
      {sent ? (
        <p aria-live="polite" className="type-caption text-accent mt-3">
          {ADVISOR_SENT_COPY}
        </p>
      ) : null}
      {error ? (
        <p aria-live="polite" className="type-caption text-error mt-3">
          {ADVISOR_ERROR_COPY}
        </p>
      ) : null}
    </>
  )
}
