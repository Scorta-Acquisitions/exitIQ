// use client: opens the booking page with the exitIQ result attached
"use client"

import { ADVISOR_ERROR_COPY, ADVISOR_SENT_COPY, useAdvisorReview } from "@/components/site/exitiq/ExitIqActions"
import { Button } from "@/components/site/ui/Button"

export function ReviewWithAdvisorCard() {
  const { send } = useAdvisorReview()
  return (
    <button
      type="button"
      onClick={send}
      className="hover-green border-hair block w-full border-b border-l py-[22px] pl-[26px] text-left"
    >
      <div className="font-display mb-2 text-[22px] leading-[1.18]">Ask an advisor to review the result</div>
      <p className="text-l2 text-[14px] leading-[1.62]">
        Book a call with Suyash. Your result rides along in the booking notes.
      </p>
    </button>
  )
}

export function ReviewWithAdvisorButton() {
  const { sent, error, send } = useAdvisorReview()
  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center gap-x-[18px] gap-y-3">
        <Button onClick={send}>Review my result with an advisor</Button>
        <span className="text-l3 max-w-[420px] font-mono text-[11.5px] leading-[1.6]">
          Your exitIQ result rides along in the booking notes so you do not have to repeat it.
        </span>
      </div>
      {sent ? (
        <p aria-live="polite" className="text-filament-ink -mt-2 mb-4 text-[13px] leading-[1.6]">
          {ADVISOR_SENT_COPY}
        </p>
      ) : null}
      {error ? (
        <p aria-live="polite" className="text-error -mt-2 mb-4 text-[13px] leading-[1.6]">
          {ADVISOR_ERROR_COPY}
        </p>
      ) : null}
    </>
  )
}
