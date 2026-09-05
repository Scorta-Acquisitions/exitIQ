// use client: verification tier selection and the share action
"use client"

import { useEffect, useRef, useState } from "react"
import {
  DEFAULT_PASSPORT_TIER,
  isMutedPassportValue,
  PASSPORT_HOW,
  PASSPORT_ROWS,
  PASSPORT_TIER_DESCRIPTIONS,
  PASSPORT_TIERS,
  passportProgress,
  passportShareText,
  type PassportTierIndex,
} from "@/lib/site/buyers/passport"
import { copyText } from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"

const BUSY_MS = 320
const pill = "hover-green-dark rounded-full border border-dhair px-[13px] py-[7px] font-mono text-[11px] text-d2"

export function PassportTiers() {
  const [tier, setTier] = useState<PassportTierIndex>(DEFAULT_PASSPORT_TIER)
  const [busy, setBusy] = useState(false)
  const [shared, setShared] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (t: PassportTierIndex) => {
    setTier(t)
    setBusy(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setBusy(false), BUSY_MS)
  }

  return (
    <div
      className="border-dhair overflow-hidden rounded-[18px] border bg-[rgba(3,12,8,.5)]"
      data-testid="passport-tiers"
    >
      <div className="border-dhair-2 border-b px-[18px] py-4">
        <div className="text-d4 mb-2.5 font-mono text-[11.5px] tracking-[1px] uppercase">Verification levels</div>
        <div role="group" aria-label="Choose a Buyer Passport verification level" className="flex flex-wrap gap-1.5">
          {PASSPORT_TIERS.map((t, i) => {
            const on = i === tier
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                aria-label={`View ${t}`}
                onClick={() => choose(i as PassportTierIndex)}
                className={`ease-e1 min-w-[132px] flex-1 rounded-[9px] border px-3 py-[11px] text-center text-[13px] font-medium transition-all duration-200 ${
                  on ? "border-filament/55 bg-filament/12 text-filament" : "border-dhair text-dfull/62"
                }`}
                data-testid={`passport-tier-${i}`}
              >
                {t}
              </button>
            )
          })}
          {busy ? (
            <p aria-live="polite" className="text-d4 mt-2 w-full font-mono text-[10.5px]">
              Loading the selected verification level...
            </p>
          ) : null}
        </div>
        <div aria-hidden="true" className="bg-dfull/8 mt-2.5 h-[2px] overflow-hidden rounded-full">
          <div
            className="bg-filament ease-e1 h-full shadow-[0_0_10px_rgba(76,226,126,.5)] transition-[width] duration-[550ms]"
            style={{ width: passportProgress(tier) }}
          />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))]">
        <div className="border-dhair-2 border-r px-[22px] py-6">
          <div
            className="text-signal mb-1.5 font-mono text-[11.5px] tracking-[1px] uppercase"
            data-testid="passport-tier-name"
          >
            {PASSPORT_TIERS[tier]}
          </div>
          <p className="text-d2 mb-5 text-[15px] leading-[1.65]">{PASSPORT_TIER_DESCRIPTIONS[tier]}</p>
          <div className="border-dhair-2 bg-dfull/[2.5%] overflow-hidden rounded-xl border">
            <div className="border-dhair-2 flex items-center justify-between border-b px-4 py-[11px]">
              <span className="text-d4 font-mono text-[11.5px] tracking-[1px] uppercase">
                Buyer Passport card · details shared in this view
              </span>
            </div>
            <div className="px-4 pt-1.5 pb-3.5">
              {PASSPORT_ROWS.map((r, i) => {
                const value = r.v[tier]
                return (
                  <div
                    key={`${tier}-${r.l}`}
                    className="border-dfull/5 flex flex-wrap gap-x-3.5 gap-y-1 border-b py-2.5"
                  >
                    <span className="text-d4 flex-[0_1_168px] font-mono text-[11px] leading-[1.5]">{r.l}</span>
                    <span
                      className={`animate-row text-[14px] leading-[1.5] motion-reduce:animate-none ${
                        isMutedPassportValue(value) ? "text-dfull/30" : "text-d1"
                      }`}
                      style={{ animationDelay: `${(i * 0.045).toFixed(3)}s` }}
                    >
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                await copyText(passportShareText(tier))
                setShared(true)
              }}
              className={pill}
            >
              Share this Passport
            </button>
            <a href={`mailto:${CONTACT.buyers}?subject=Request%20updated%20verification`} className={pill}>
              Request updated verification
            </a>
            <a href={`mailto:${CONTACT.buyers}?subject=Verify%20this%20Passport`} className={pill}>
              Verify this Passport
            </a>
          </div>
          {shared ? (
            <p aria-live="polite" className="text-signal mt-2.5 font-mono text-[10.5px]">
              A shareable Passport summary has been copied.
            </p>
          ) : null}
        </div>
        <div className="px-[22px] py-6">
          <div className="text-d4 mb-3.5 font-mono text-[11.5px] tracking-[1px] uppercase">
            How Buyer Passport works
          </div>
          <div className="flex flex-col">
            {PASSPORT_HOW.map((h, i) => (
              <div
                key={h.label}
                className={`flex flex-wrap items-baseline gap-x-3.5 gap-y-0.5 py-2.5 ${i < PASSPORT_HOW.length - 1 ? "border-dhair-2 border-b" : ""}`}
              >
                <span className="text-d4 flex-[0_0_130px] font-mono text-[11px] tracking-[.7px] uppercase">
                  {h.label}
                </span>
                <span className="text-d1 flex-[1_1_200px] text-[14.5px] leading-[1.5]">{h.body}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
