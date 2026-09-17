// use client: three intake modes, form state, and the mailto/clipboard handoff
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { Card, HoneypotField } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { cn } from "@/lib/site/cn"
import { submitInquiry } from "@/lib/site/inquiry"
import {
  copyText,
  EMPTY_OFFER_INTAKE,
  mailtoHref,
  OFFER_FORWARD_MAILTO,
  OFFER_SENT_COPY,
  type OfferIntakeFields,
  offerReviewBody,
  openMail,
} from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"

export type OfferIntakeMode = OfferIntakeFields["mode"]

const TABS: Array<[OfferIntakeMode, string]> = [
  ["forward", "Upload or forward it"],
  ["paste", "Paste the terms"],
  ["verbal", "Tell us what was said"],
]

const SEND_DELAY_MS = 420

/* The design system's form recipe: strong caption labels, pill inputs, a soft-cornered textarea. */
const labelClass = "type-caption-strong text-fg-2 mb-2 block"
const inputClass = "type-body text-fg border-line bg-surface placeholder:text-fg-3 rounded-pill h-11 w-full border px-5"
const textareaClass =
  "type-body text-fg border-line bg-surface placeholder:text-fg-3 rounded-lg w-full resize-y border px-5 py-3"
const hintClass = "type-caption text-fg-3"

const REVIEW_NOTE = "A person reviews it. You usually hear back the same business day."

const VERBAL_FIELDS: Array<{ key: keyof OfferIntakeFields; label: string; placeholder?: string; type?: string }> = [
  { key: "price", label: "Price or range discussed", placeholder: "For example, $4.5M or a range" },
  { key: "structure", label: "How much would be paid at closing?" },
  { key: "later", label: "Would any amount be paid later?" },
  { key: "financing", label: "Does the buyer already have financing?" },
  { key: "next", label: "What does the buyer want you to sign or do next?" },
  { key: "concern", label: "Anything else that concerns you?" },
  { key: "email", label: "Email for your review", placeholder: "you@example.com", type: "email" },
]

export function OfferIntake({ initialMode = "forward" }: { initialMode?: OfferIntakeMode }) {
  const [fields, setFields] = useState<OfferIntakeFields>({ ...EMPTY_OFFER_INTAKE, mode: initialMode })
  const [fileName, setFileName] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /* A refused clipboard (copyText resolves false, it never throws) changes only the line under the
     confirmation: the offer still goes. False by default, so a first send reads as it always did. */
  const [copyFailed, setCopyFailed] = useState(false)
  /* The honeypot's value: empty for every visitor, so it is left out of the record they send. */
  const [website, setWebsite] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const set = (key: keyof OfferIntakeFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  const setMode = (mode: OfferIntakeMode) => {
    setFields((f) => ({ ...f, mode }))
    setSent(false)
    setError(null)
  }

  const send = () => {
    setSending(true)
    setSent(false)
    setError(null)
    // The clipboard write belongs to the click's own task: WebKit refuses a write made from the timer
    // below, outside the user gesture, so Safari failed to copy on every send. Nothing visible moves with
    // it — a write has no output, and its result is read when the timer fires.
    const body = offerReviewBody(fields)
    const copied = copyText(body)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        // The copy is a convenience; the mail draft and the logged inquiry are the delivery. A refused
        // clipboard therefore never stops the send — it only changes which of the two the sent copy names.
        setCopyFailed(!(await copied))
        void submitInquiry({
          kind: "offer_review",
          body,
          email: fields.email,
          source: "offer-review",
          ...(website ? { website } : {}),
        })
        setSending(false)
        setSent(true)
        openMail(mailtoHref(CONTACT.offers, "Free offer review", body))
      } catch {
        setSending(false)
        setError(CONTACT.offers)
      }
    }, SEND_DELAY_MS)
  }

  return (
    <Card padded={false} id="offer-intake" className="anchor-target overflow-hidden" data-testid="offer-intake">
      <div
        role="group"
        aria-label="Choose how to share your offer"
        className="border-line-soft tab:px-6 flex flex-wrap gap-2 border-b px-4 py-4"
      >
        {TABS.map(([v, l]) => (
          <Chip key={v} selected={fields.mode === v} onClick={() => setMode(v)} data-testid={`oi-tab-${v}`}>
            {l}
          </Chip>
        ))}
      </div>
      <div className="p-6">
        <HoneypotField value={website} onChange={setWebsite} />
        {fields.mode === "paste" ? (
          <div>
            <label htmlFor="oi-text" className={labelClass}>
              Paste the offer or buyer email
            </label>
            <textarea
              id="oi-text"
              rows={7}
              value={fields.text}
              onChange={set("text")}
              placeholder="Paste whatever you have. Rough notes are fine."
              className={textareaClass}
            />
          </div>
        ) : null}

        {fields.mode === "verbal" ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-4 gap-y-5">
            {VERBAL_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className={labelClass}>{f.label}</span>
                <input
                  type={f.type ?? "text"}
                  value={fields[f.key]}
                  onChange={set(f.key)}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        ) : null}

        {fields.mode === "forward" ? (
          <div>
            <label htmlFor="oi-file" className={labelClass}>
              Upload the offer, buyer email, or letter of intent
            </label>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
              <input
                id="oi-file"
                ref={fileRef}
                type="file"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                className="sr-only"
              />
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                Choose a file
              </Button>
              <span className={hintClass}>
                {fileName ? `Selected: ${fileName} · attach it to the email that opens.` : "No file chosen yet."}
              </span>
            </div>
            <p className={cn(hintClass, "mt-3")}>PDF, Word document, image, or email export</p>
            <p className="type-body text-fg-2 mt-6">
              Or forward it to <TextLink href={`mailto:${CONTACT.offers}`}>{CONTACT.offers}</TextLink>.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5">
              {/* The one long label: below the large-phone breakpoint it wraps to two centred lines instead of running
                  past the card's edge (a 304px pill in a 272px column at 320). */}
              <Button href={OFFER_FORWARD_MAILTO} className="max-lphone:whitespace-normal max-lphone:text-center">
                Open an email to attach the offer
              </Button>
              <span className={hintClass}>{REVIEW_NOTE}</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <Button onClick={send} disabled={sending} data-testid="oi-send">
              Send for review
            </Button>
            <span className={hintClass}>{REVIEW_NOTE}</span>
          </div>
        )}

        {sending ? (
          <p aria-live="polite" className={cn(hintClass, "mt-3")}>
            Preparing your message...
          </p>
        ) : null}
        {error ? (
          <p aria-live="polite" className="type-caption text-error mt-3">
            We could not prepare the message. Email {error} directly.
          </p>
        ) : null}
        {sent ? (
          <div aria-live="polite" data-testid="oi-sent" className="mt-3">
            <p className="type-caption text-accent">
              Your offer has been sent for review. We will reply to the email you provided.
            </p>
            <p className={cn(hintClass, "mt-1.5")}>{copyFailed ? OFFER_SENT_COPY.notCopied : OFFER_SENT_COPY.copied}</p>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
