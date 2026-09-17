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
      // A refused clipboard resolves false (copyText never rejects), and the success line promises the
      // copied text: the visitor gets the fallback address instead of a copy that never happened.
      if (!(await copyText(body))) {
        setSent(false)
        setError(true)
        return
      }
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

/** The plan's confirmation when the clipboard took the text as well as the downloaded file. */
export const PLAN_SAVED_COPY = "Your plan was downloaded and copied."

/** The same confirmation when the browser refused the clipboard: the downloaded file is the save. */
export const PLAN_DOWNLOADED_COPY = "Your plan was downloaded."

/**
 * Hook behind "Save my plan": the downloaded file, plus the clipboard when the browser allows it.
 * A refused clipboard resolves false (copyText never rejects), so `copied` decides which of the two
 * confirmations the console reads; the download is the save either way.
 */
export function useSavePlan() {
  const { state } = useSiteState()
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const save = async () => {
    const text = planText(scoreExitIq(state.iq.answers))
    const gotClipboard = await copyText(text)
    downloadTextFile("exitIQ-90-day-plan.txt", text)
    setCopied(gotClipboard)
    setSaved(true)
  }
  return { saved, copied, save }
}
