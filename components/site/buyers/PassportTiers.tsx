// use client: verification tier selection and the share action
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { Card, Eyebrow, KeyValueRow } from "@/components/site/ui/primitives"
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

/** Hairline row shared by the Passport card and the "How Buyer Passport works" list; values sit beside the label. */
const ROW = "border-line justify-start border-b last:border-b-0"
/** Two-column record rows: the label keeps a fixed basis and the value takes the rest, as CompanyRecord does. */
const ROW_LABEL = "flex-[0_1_150px]"
const ROW_VALUE = "type-body flex-[2_1_190px] min-w-0"

export function PassportTiers() {
  const [tier, setTier] = useState<PassportTierIndex>(DEFAULT_PASSPORT_TIER)
  const [busy, setBusy] = useState(false)
  const [shared, setShared] = useState(false)
  const [shareError, setShareError] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (t: PassportTierIndex) => {
    setTier(t)
    setBusy(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setBusy(false), BUSY_MS)
  }

  return (
    <Card padded={false} className="overflow-hidden" data-testid="passport-tiers">
      <div className="border-line-soft border-b px-6 py-4">
        <Eyebrow>Verification levels</Eyebrow>
        <div role="group" aria-label="Choose a Buyer Passport verification level" className="mt-3 flex flex-wrap gap-2">
          {PASSPORT_TIERS.map((t, i) => (
            <Chip
              key={t}
              selected={i === tier}
              aria-label={`View ${t}`}
              onClick={() => choose(i as PassportTierIndex)}
              className="min-w-[132px] flex-1 justify-center text-center"
              data-testid={`passport-tier-${i}`}
            >
              {t}
            </Chip>
          ))}
          {/* Always mounted so the meter and panes below do not jump while a tier loads. */}
          <p aria-live="polite" className="type-caption text-fg-3 min-h-5 w-full">
            {busy ? "Loading the selected verification level..." : ""}
          </p>
        </div>
        <div aria-hidden="true" className="bg-fg/15 rounded-pill mt-4 h-[3px] overflow-hidden">
          <div
            className="bg-accent ease-e1 rounded-pill h-full transition-[width] duration-300"
            style={{ width: passportProgress(tier) }}
          />
        </div>
      </div>

      <div className="tab:grid-cols-2 grid grid-cols-1">
        <div className="px-6 py-6">
          <p className="type-display-md text-fg" data-testid="passport-tier-name">
            {PASSPORT_TIERS[tier]}
          </p>
          <p className="type-body text-fg-2 mt-3">{PASSPORT_TIER_DESCRIPTIONS[tier]}</p>

          <Card padded={false} className="mt-6 overflow-hidden">
            <div className="border-line-soft border-b px-5 py-3">
              <Eyebrow as="span">Buyer Passport card · details shared in this view</Eyebrow>
            </div>
            <div className="px-5 pt-0.5 pb-1.5">
              {PASSPORT_ROWS.map((r) => {
                const value = r.v[tier]
                return (
                  <KeyValueRow
                    key={`${tier}-${r.l}`}
                    label={r.l}
                    className={ROW}
                    labelClassName={ROW_LABEL}
                    valueClassName={`${ROW_VALUE} ${isMutedPassportValue(value) ? "text-fg-3" : "text-fg"}`}
                  >
                    {value}
                  </KeyValueRow>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="border-line-soft tab:border-t-0 tab:border-l border-t px-6 py-6">
          <Eyebrow>How Buyer Passport works</Eyebrow>
          <div className="mt-2">
            {PASSPORT_HOW.map((h) => (
              <KeyValueRow
                key={h.label}
                label={h.label}
                className={ROW}
                labelClassName={ROW_LABEL}
                valueClassName={`${ROW_VALUE} text-fg`}
              >
                {h.body}
              </KeyValueRow>
            ))}
          </div>
        </div>
      </div>

      {/* The card's single action row, in a footer so neither pane carries a trailing orphan. */}
      <div className="border-line-soft flex flex-wrap items-center gap-2 border-t px-6 py-4">
        <Button
          variant="secondary"
          size="compact"
          onClick={async () => {
            // The clipboard is the whole action here: a refused write resolves false (copyText never
            // rejects), and the row says so instead of confirming a copy that never happened.
            const copied = await copyText(passportShareText(tier))
            setShared(copied)
            setShareError(!copied)
          }}
        >
          Share this Passport
        </Button>
        <Button
          variant="secondary"
          size="compact"
          href={`mailto:${CONTACT.buyers}?subject=Request%20updated%20verification`}
        >
          Request updated verification
        </Button>
        <Button variant="secondary" size="compact" href={`mailto:${CONTACT.buyers}?subject=Verify%20this%20Passport`}>
          Verify this Passport
        </Button>
        {shared ? (
          <p aria-live="polite" className="type-caption text-accent">
            A shareable Passport summary has been copied.
          </p>
        ) : null}
        {shareError ? (
          <p aria-live="polite" className="type-caption text-error">
            We could not copy the summary. Email {CONTACT.buyers} directly.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
