// use client: three intake modes, form state, and the mailto/clipboard handoff
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { submitInquiry } from "@/lib/site/inquiry"
import {
  copyText,
  EMPTY_OFFER_INTAKE,
  mailtoHref,
  OFFER_FORWARD_MAILTO,
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

const inputClass =
  "h-11 w-full rounded-[9px] border border-hair-2 bg-paper-2 px-[13px] text-[15px] text-ink placeholder:text-l4"
const labelClass = "mb-1.5 block font-mono text-[11.5px] uppercase tracking-[.8px] text-l3"

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
    if (sending) return
    setSending(true)
    setSent(false)
    setError(null)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        const body = offerReviewBody(fields)
        await copyText(body)
        void submitInquiry({ kind: "offer_review", body, email: fields.email, source: "offer-review" })
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
    <div
      id="offer-intake"
      className="border-hair-2 bg-card max-w-[820px] [scroll-margin-top:90px] overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(12,54,38,.08)]"
      data-testid="offer-intake"
    >
      <div
        role="group"
        aria-label="Choose how to share your offer"
        className="border-hair flex flex-wrap gap-1.5 border-b px-4 py-3.5"
      >
        {TABS.map(([v, l]) => (
          <Chip
            key={v}
            tone="light"
            selected={fields.mode === v}
            onClick={() => setMode(v)}
            data-testid={`oi-tab-${v}`}
          >
            {l}
          </Chip>
        ))}
      </div>
      <div className="px-5 pt-[18px] pb-5">
        {fields.mode === "paste" ? (
          <div>
            <label htmlFor="oi-text" className={`${labelClass} mb-2`}>
              Paste the offer or buyer email
            </label>
            <textarea
              id="oi-text"
              rows={7}
              value={fields.text}
              onChange={set("text")}
              placeholder="Paste whatever you have. Rough notes are fine."
              className="border-hair-2 bg-paper-2 text-ink placeholder:text-l4 w-full resize-y rounded-[10px] border px-3.5 py-3 text-[15px]"
            />
          </div>
        ) : null}

        {fields.mode === "verbal" ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(220px,45%)),1fr))] gap-3">
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
            <label htmlFor="oi-file" className={`${labelClass} mb-2`}>
              Upload the offer, buyer email, or letter of intent
            </label>
            <div className="mb-2 flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
              <input
                id="oi-file"
                ref={fileRef}
                type="file"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                className="sr-only"
              />
              <Button
                variant="outline-plain"
                size="md"
                className="bg-paper-2 h-11 text-[14.5px] font-medium"
                onClick={() => fileRef.current?.click()}
              >
                Choose a file
              </Button>
              <span className="text-l3 font-mono text-[11.5px]">
                {fileName ? `Selected: ${fileName} · attach it to the email that opens.` : "No file chosen yet."}
              </span>
            </div>
            <p className="text-l3 mb-3 font-mono text-[11.5px]">PDF, Word document, image, or email export</p>
            <p className="text-l2 mb-3 text-[15px] leading-[1.65]">
              Or forward it to{" "}
              <a href={`mailto:${CONTACT.offers}`} className="border-filament-ink/30 text-filament-ink border-b">
                {CONTACT.offers}
              </a>
              .
            </p>
            <Button href={OFFER_FORWARD_MAILTO} size="md" className="h-11 text-[14.5px]">
              Open an email to attach the offer
            </Button>
            <p className="text-l3 mt-3 font-mono text-[11.5px]">
              A person reviews it. You usually hear back the same business day.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <Button onClick={send} disabled={sending} data-testid="oi-send">
              Send for review
            </Button>
            <span className="text-l3 font-mono text-[11.5px]">
              A person reviews it. You usually hear back the same business day.
            </span>
          </div>
        )}

        {sending ? (
          <p aria-live="polite" className="text-l3 mt-3 font-mono text-[11.5px]">
            Preparing your message...
          </p>
        ) : null}
        {error ? (
          <p aria-live="polite" className="text-error mt-3 text-[13px]">
            We could not prepare the message. Email {error} directly.
          </p>
        ) : null}
        {sent ? (
          <div aria-live="polite" data-testid="oi-sent">
            <p className="text-filament-ink mt-3 text-[13px]">
              Your offer has been sent for review. We will reply to the email you provided.
            </p>
            <p className="text-l3 mt-1.5 font-mono text-[11.5px] leading-[1.6]">
              If your email app did not open, the summary has been copied. Paste it into a message to {CONTACT.offers}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
