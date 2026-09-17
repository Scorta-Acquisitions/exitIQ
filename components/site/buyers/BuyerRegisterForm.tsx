// use client: controlled registration form with a mailto handoff
"use client"

import { useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { HoneypotField } from "@/components/site/ui/primitives"
import {
  BUYER_SENT_COPY,
  BUYER_TYPES,
  type BuyerRegistration,
  buyerRegistrationBody,
  EMPTY_BUYER_REGISTRATION,
} from "@/lib/site/buyers/passport"
import { submitInquiry } from "@/lib/site/inquiry"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"

const label = "type-caption-strong text-fg-2 mb-2 block"
const input = "h-11 w-full rounded-pill border border-line bg-surface px-5 type-body text-fg placeholder:text-fg-3"
const textarea =
  "w-full rounded-lg border border-line bg-surface px-5 py-3 type-body text-fg placeholder:text-fg-3 resize-y"

type Key = keyof BuyerRegistration

export function BuyerRegisterForm() {
  const [form, setForm] = useState<BuyerRegistration>(EMPTY_BUYER_REGISTRATION)
  const [confirmed, setConfirmed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /* A refused clipboard (copyText resolves false, it never throws) changes only what the confirmation
     says about the text: the registration still goes. */
  const [copyFailed, setCopyFailed] = useState(false)
  /* The honeypot's value: empty for every visitor, so it is left out of the record they send. */
  const [website, setWebsite] = useState("")

  const bind = (key: Key) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setSent(false)
    setError(null)
    try {
      const body = buyerRegistrationBody(form)
      // A refused clipboard resolves false (copyText never rejects). The copy is a convenience; the mail
      // draft and the logged inquiry are the delivery, so the send goes on and the confirmation drops its
      // claim that the text was copied.
      setCopyFailed(!(await copyText(body)))
      void submitInquiry({
        kind: "buyer_passport",
        body,
        email: form.email,
        source: "buyers",
        ...(website ? { website } : {}),
      })
      setSending(false)
      setSent(true)
      openMail(mailtoHref(CONTACT.buyers, "Buyer Passport registration", body, 1600))
    } catch {
      setSending(false)
      setError(CONTACT.buyers)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={submit} data-testid="buyer-register-form">
      <HoneypotField value={website} onChange={setWebsite} />
      <label className="block">
        <span className={label}>Your name</span>
        <input type="text" className={input} required {...bind("name")} />
      </label>
      <label className="block">
        <span className={label}>Firm and role</span>
        <input type="text" className={input} {...bind("firm")} />
      </label>
      <label className="block">
        <span className={label}>What kind of buyer are you?</span>
        <select className={input} {...bind("buyerType")}>
          {BUYER_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5">
        <label className="block">
          <span className={label}>Target transaction size</span>
          <input type="text" placeholder="For example, $2M to $8M" className={input} {...bind("targetSize")} />
        </label>
        <label className="block">
          <span className={label}>Geography</span>
          <input type="text" className={input} {...bind("geography")} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Industries you pursue</span>
        <input type="text" className={input} {...bind("industries")} />
      </label>
      <label className="block">
        <span className={label}>Financing plan</span>
        <input type="text" className={input} {...bind("financing")} />
      </label>
      <label className="block">
        <span className={label}>Current evidence of funds or lender support</span>
        <textarea rows={3} className={textarea} {...bind("evidence")} />
      </label>
      <label className="block">
        <span className={label}>Prior acquisitions</span>
        <input
          type="text"
          placeholder="Include none if this would be your first acquisition."
          className={input}
          {...bind("priorAcquisitions")}
        />
      </label>
      <label className="block">
        <span className={label}>Plans for employees, the company name, and locations</span>
        <textarea rows={3} className={textarea} {...bind("plans")} />
      </label>
      <label className="block">
        <span className={label}>Email</span>
        <input type="email" className={input} required {...bind("email")} />
      </label>
      <label className="type-caption text-fg-2 flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          className="accent-accent h-4 w-4 flex-none"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          required
        />
        I confirm that this information is accurate and may be verified.
      </label>
      <Button type="submit" className="self-start" disabled={sending} data-testid="buyer-register-submit">
        Register my criteria
      </Button>
      {sending ? (
        <p aria-live="polite" className="type-caption text-fg-3">
          Preparing your registration...
        </p>
      ) : null}
      {error ? (
        <p aria-live="polite" className="type-caption text-error" data-testid="buyer-register-error">
          We could not prepare the registration. Email {error} directly and we will help.
        </p>
      ) : null}
      {sent ? (
        <div aria-live="polite" data-testid="buyer-register-sent">
          <p className="type-caption text-accent">
            {(copyFailed ? BUYER_SENT_COPY.notCopied : BUYER_SENT_COPY.copied).lead}
          </p>
          <p className="type-caption text-fg-3 mt-1.5">
            {(copyFailed ? BUYER_SENT_COPY.notCopied : BUYER_SENT_COPY.copied).line}
          </p>
        </div>
      ) : null}
    </form>
  )
}
