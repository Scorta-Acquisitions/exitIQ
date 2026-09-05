// use client: copies and downloads the plan, opens the booking page with the result attached
"use client"

import { useState } from "react"
import { useSiteState } from "@/components/site/providers/SiteStateProvider"
import { advisorReviewBody, planText, scoreExitIq } from "@/lib/site/exitiq/scoring"
import { submitInquiry } from "@/lib/site/inquiry"
import { copyText, downloadTextFile, openInNewTab } from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"

/** Hook shared by every "Review my result with an advisor" button. */
export function useAdvisorReview() {
  const { state } = useSiteState()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const send = async () => {
    setError(false)
    try {
      const body = advisorReviewBody(state.iq.answers)
      await copyText(body)
      setSent(true)
      void submitInquiry({ kind: "exitiq_review", body, source: "score" })
      openInNewTab(`${CONTACT.advisorCalendar}?notes=${encodeURIComponent(body.slice(0, 700))}`)
    } catch {
      setSent(false)
      setError(true)
    }
  }
  return { sent, error, send }
}

export const ADVISOR_SENT_COPY =
  "The booking page opened in a new tab with your result attached. If it is missing, paste the copied text into the notes."

export const ADVISOR_ERROR_COPY = `We could not open the booking page. Email ${CONTACT.hello} directly.`

/** Hook behind "Save my plan": clipboard plus a text download. */
export function useSavePlan() {
  const { state } = useSiteState()
  const [saved, setSaved] = useState(false)
  const save = async () => {
    const text = planText(scoreExitIq(state.iq.answers))
    await copyText(text)
    downloadTextFile("exitIQ-90-day-plan.txt", text)
    setSaved(true)
  }
  return { saved, save }
}
