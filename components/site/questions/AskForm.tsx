// use client: question form with clipboard and mailto handoff
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { submitInquiry } from "@/lib/site/inquiry"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { askQuestionBody } from "@/lib/site/questions/data"
import { CONTACT } from "@/lib/site/routes"

const SEND_DELAY_MS = 420

export function AskForm() {
  const [question, setQuestion] = useState("")
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const send = () => {
    if (sending) return
    setSending(true)
    setSent(false)
    setError(null)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        const body = askQuestionBody(question, email)
        await copyText(body)
        void submitInquiry({ kind: "question", body, email, source: "questions" })
        setSending(false)
        setSent(true)
        openMail(mailtoHref(CONTACT.hello, "Question for Heirloom", body, 1400))
      } catch {
        setSending(false)
        setError(CONTACT.hello)
      }
    }, SEND_DELAY_MS)
  }

  return (
    <div
      id="q-ask"
      className="border-hair-2 bg-card mt-[38px] [scroll-margin-top:100px] rounded-[14px] border px-[26px] py-6"
      data-testid="ask-form"
    >
      <h2 className="mb-2 text-[18px] font-semibold">Ask a question</h2>
      <p className="text-l2 mb-1.5 text-[15px] leading-[1.62]">
        Send one question and the email address for the answer.
      </p>
      <p className="text-l3 mb-4 font-mono text-[11px] leading-[1.6]">
        A person replies once by email. Your address is not added to a list.
      </p>
      <div className="flex max-w-[560px] flex-col gap-3">
        <label className="block">
          <span className="text-l3 mb-1.5 block font-mono text-[11.5px] tracking-[.8px] uppercase">Your question</span>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Fees, privacy, fit, timing, or your offer."
            className="border-hair-2 bg-paper-2 placeholder:text-l4 w-full resize-y rounded-[9px] border px-[13px] py-[11px] text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-l3 mb-1.5 block font-mono text-[11.5px] tracking-[.8px] uppercase">
            Email for the reply
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-hair-2 bg-paper-2 placeholder:text-l4 h-11 w-full rounded-[9px] border px-[13px] text-[15px]"
          />
        </label>
        <Button onClick={send} disabled={sending} className="self-start" data-testid="ask-send">
          Send my question
        </Button>
        {sending ? (
          <p aria-live="polite" className="text-l3 font-mono text-[11.5px]">
            Preparing your message...
          </p>
        ) : null}
        {error ? (
          <p aria-live="polite" className="text-error text-[13px]">
            We could not prepare the message. Email {error} directly.
          </p>
        ) : null}
        {sent ? (
          <div aria-live="polite" data-testid="ask-sent">
            <p className="text-filament-ink text-[13px]">Your email app opened with the question filled in.</p>
            <p className="text-l3 mt-1.5 font-mono text-[11px] leading-[1.6]">
              If your email app did not open, paste the copied question into a message to {CONTACT.hello}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
