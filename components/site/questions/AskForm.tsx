// use client: question form with clipboard and mailto handoff
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { Card, HoneypotField } from "@/components/site/ui/primitives"
import { submitInquiry } from "@/lib/site/inquiry"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { ASK_SENT_COPY, askQuestionBody } from "@/lib/site/questions/data"
import { CONTACT } from "@/lib/site/routes"

const SEND_DELAY_MS = 420

export function AskForm() {
  const [question, setQuestion] = useState("")
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /* A refused clipboard (copyText resolves false, it never throws) changes only the line under the
     confirmation: the question still goes. */
  const [copyFailed, setCopyFailed] = useState(false)
  /* The honeypot's value: empty for every visitor, so it is left out of the record they send. */
  const [website, setWebsite] = useState("")
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const send = () => {
    setSending(true)
    setSent(false)
    setError(null)
    // The clipboard write belongs to the click's own task: WebKit refuses a write made from the timer
    // below, outside the user gesture. Nothing visible moves with it — a write has no output, and its
    // result is read when the timer fires.
    const body = askQuestionBody(question, email)
    const copied = copyText(body)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        // The copy is a convenience; the mail draft and the logged inquiry are the delivery. A refused
        // clipboard therefore never stops the send — it only changes which of the two the sent copy names.
        setCopyFailed(!(await copied))
        void submitInquiry({ kind: "question", body, email, source: "questions", ...(website ? { website } : {}) })
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
    <Card id="q-ask" className="anchor-target" data-testid="ask-form">
      <h2 className="type-tagline text-fg">Ask a question</h2>
      <p className="type-body text-fg-2 mt-2">Send one question and the email address for the answer.</p>
      <p className="type-caption text-fg-3 mt-1.5">
        A person replies once by email. Your address is not added to a list.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <HoneypotField value={website} onChange={setWebsite} />
        <label className="block">
          <span className="type-caption-strong text-fg-2 mb-2 block">Your question</span>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Fees, privacy, fit, timing, or your offer."
            className="border-line bg-surface type-body text-fg placeholder:text-fg-3 w-full resize-y rounded-lg border px-5 py-3"
          />
        </label>
        <label className="block">
          <span className="type-caption-strong text-fg-2 mb-2 block">Email for the reply</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-line bg-surface type-body text-fg placeholder:text-fg-3 rounded-pill h-11 w-full border px-5"
          />
        </label>
        <Button onClick={send} disabled={sending} className="self-start" data-testid="ask-send">
          Send my question
        </Button>
        {sending ? (
          <p aria-live="polite" className="type-caption text-fg-3">
            Preparing your message...
          </p>
        ) : null}
        {error ? (
          <p aria-live="polite" className="type-caption text-error">
            We could not prepare the message. Email {error} directly.
          </p>
        ) : null}
        {sent ? (
          <div aria-live="polite" data-testid="ask-sent">
            <p className="type-caption text-accent">Your email app opened with the question filled in.</p>
            <p className="type-caption text-fg-3 mt-1.5">
              {copyFailed ? ASK_SENT_COPY.notCopied : ASK_SENT_COPY.copied}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
