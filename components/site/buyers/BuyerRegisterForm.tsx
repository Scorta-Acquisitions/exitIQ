// use client: controlled registration form with a mailto handoff
"use client"

import { useState } from "react"
import { Button } from "@/components/site/ui/Button"
import {
  BUYER_TYPES,
  type BuyerRegistration,
  buyerRegistrationBody,
  EMPTY_BUYER_REGISTRATION,
} from "@/lib/site/buyers/passport"
import { submitInquiry } from "@/lib/site/inquiry"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"

const label = "mb-1.5 block font-mono text-[11.5px] uppercase tracking-[.9px] text-l4"
const input =
  "h-11 w-full rounded-[9px] border border-hair-2 bg-card px-[13px] text-[15px] text-ink placeholder:text-l4"
const textarea =
  "w-full resize-y rounded-[9px] border border-hair-2 bg-card px-[13px] py-[11px] text-[15px] text-ink placeholder:text-l4"

type Key = keyof BuyerRegistration

export function BuyerRegisterForm() {
  const [form, setForm] = useState<BuyerRegistration>(EMPTY_BUYER_REGISTRATION)
  const [confirmed, setConfirmed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      await copyText(body)
      void submitInquiry({ kind: "buyer_passport", body, email: form.email, source: "buyers" })
      setSending(false)
      setSent(true)
      openMail(mailtoHref(CONTACT.buyers, "Buyer Passport registration", body, 1600))
    } catch {
      setSending(false)
      setError(CONTACT.buyers)
    }
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={submit} data-testid="buyer-register-form">
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
        <select className={`${input} px-[11px]`} {...bind("buyerType")}>
          {BUYER_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(140px,45%)),1fr))] gap-3.5">
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
      <label className="text-l2 flex items-start gap-2.5 text-[13.5px] leading-[1.5]">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          required
        />
        I confirm that this information is accurate and may be verified.
      </label>
      <Button type="submit" size="xl" className="self-start" disabled={sending} data-testid="buyer-register-submit">
        Register my criteria
      </Button>
      {sending ? (
        <p aria-live="polite" className="text-l3 font-mono text-[11.5px]">
          Preparing your registration...
        </p>
      ) : null}
      {error ? (
        <p aria-live="polite" className="text-error text-[13px]" data-testid="buyer-register-error">
          We could not prepare the registration. Email {error} directly and we will help.
        </p>
      ) : null}
      {sent ? (
        <div aria-live="polite" data-testid="buyer-register-sent">
          <p className="text-filament-ink text-[13px]">
            Your email app opened with the registration filled in. Send it to begin. The text has also been copied.
          </p>
          <p className="text-l3 mt-1.5 font-mono text-[11.5px] leading-[1.6]">
            If your email app did not open, paste the copied registration into a message to {CONTACT.buyers}.
          </p>
        </div>
      ) : null}
    </form>
  )
}
