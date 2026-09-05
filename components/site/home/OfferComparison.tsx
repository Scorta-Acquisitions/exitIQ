// use client: priority and selected-offer state
"use client"

import { useEffect, useRef, useState } from "react"
import { Chip } from "@/components/site/ui/Chip"
import { Container } from "@/components/site/ui/primitives"
import { formatMillions } from "@/lib/site/format"
import { type OfferId, OFFERS, PRIORITIES, type Priority, PRIORITY_WHY } from "@/lib/site/offers/data"
import { certaintyLabel, findOffer, paidLater, rankOffers, retained } from "@/lib/site/offers/score"

const OFFER_BUSY_MS = 340

function Term({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="border-dhair-2 border-t py-1.5">
      <span className="text-d4 mb-[3px] block font-mono text-[10.5px] tracking-[.5px]">{label}</span>
      <span className={className ?? "text-d1 text-[13.5px]"}>{value}</span>
    </div>
  )
}

export function OfferComparison() {
  const [priority, setPriority] = useState<Priority>("certainty")
  const [selected, setSelected] = useState<OfferId | null>(null)
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const pick = (id: OfferId) => {
    if (selected === id) {
      setSelected(null)
      return
    }
    setSelected(id)
    setBusy(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setBusy(false), OFFER_BUSY_MS)
  }

  const { bestId, highestHeadlineId } = rankOffers(priority)
  const sel = findOffer(selected)

  return (
    <section className="bg-scene-paper-offers px-3 py-[clamp(40px,5vw,64px)]" data-testid="offer-comparison">
      <Container className="aurora panel-offers border-dfull/8 text-d1 max-w-[1156px] overflow-hidden rounded-[26px] border px-[clamp(16px,3vw,38px)] py-[clamp(26px,4vw,46px)] shadow-[inset_0_1px_0_rgba(240,248,243,.06),0_30px_70px_rgba(11,36,27,.16)]">
        <div className="mb-5 max-w-[760px]">
          <h2 className="font-display text-d1 mb-2.5 text-[clamp(26px,3.4vw,40px)] leading-[1.06] font-normal tracking-[-.8px]">
            Compare offers
          </h2>
          <p className="text-d3 text-[14.5px] leading-[1.6]">
            The highest price is not always the best offer. We rank offers on what you receive, when, and how likely the
            deal is to close.
          </p>
        </div>
        <div
          role="group"
          aria-label="Choose your most important deal priority"
          className="mb-2.5 flex flex-wrap items-center gap-2"
        >
          <span className="text-d3 mr-1 font-mono text-[11.5px] tracking-[.6px]">What matters most to you?</span>
          {PRIORITIES.map((p) => (
            <Chip
              key={p.v}
              selected={priority === p.v}
              onClick={() => setPriority(p.v)}
              className={priority === p.v ? "font-normal" : "border-dhair text-dfull/72 bg-transparent font-normal"}
            >
              {p.l}
            </Chip>
          ))}
        </div>
        <p className="text-d4 mb-[18px] max-w-[640px] font-mono text-[11px] leading-[1.6]">{PRIORITY_WHY[priority]}</p>
        <div
          role="group"
          aria-label="Compare cash, terms, conditions, and closing risk"
          className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-3"
        >
          {OFFERS.map((o) => {
            const best = o.id === bestId
            const isSel = selected === o.id
            return (
              <div
                key={o.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                onClick={() => pick(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    pick(o.id)
                  }
                }}
                className={`ease-e1 cursor-pointer rounded-[14px] border p-4 transition-[border-color,background,box-shadow] duration-300 ${
                  best
                    ? "border-filament/50 bg-filament/[7%] shadow-[0_0_40px_rgba(76,226,126,.13)]"
                    : isSel
                      ? "border-dfull/40 bg-[rgba(4,15,10,.4)]"
                      : "border-dhair bg-[rgba(4,15,10,.4)]"
                }`}
                data-testid={`offer-card-${o.id}`}
                data-best={best}
              >
                <div className="mb-2.5 flex min-h-[22px] flex-wrap gap-[5px]">
                  {best ? (
                    <span className="bg-filament text-ground-deep rounded-full px-[9px] py-1 font-mono text-[9.5px] tracking-[.8px] uppercase">
                      Strongest fit
                    </span>
                  ) : null}
                  {o.id === highestHeadlineId ? (
                    <span className="border-dhair text-d3 rounded-full border px-[9px] py-[3px] font-mono text-[9.5px] tracking-[.8px] uppercase">
                      Highest headline price
                    </span>
                  ) : null}
                </div>
                <div className="text-d1 text-[14.5px] font-semibold">{o.who}</div>
                <div className="text-d4 mt-[3px] mb-3 font-mono text-[10.5px] tracking-[.4px]">{o.sub}</div>
                <div className="border-dhair-2 flex items-baseline justify-between gap-2.5 border-t py-1.5">
                  <span className="text-d4 font-mono text-[10.5px] tracking-[.5px]">Headline price</span>
                  <span className="font-display text-d1 text-[21px]">{formatMillions(o.head)}</span>
                </div>
                <div className="border-dhair-2 flex items-baseline justify-between gap-2.5 border-t py-1.5">
                  <span className="text-d4 font-mono text-[10.5px] tracking-[.5px]">Cash at closing</span>
                  <span className="text-filament font-mono text-[13.5px]">{formatMillions(o.cash)}</span>
                </div>
                <div className="border-dhair-2 flex items-baseline justify-between gap-2.5 border-t pt-1.5 pb-2">
                  <span className="text-d4 font-mono text-[10.5px] tracking-[.5px]">Closing risk</span>
                  <span className="text-d2 font-mono text-[12px]">{certaintyLabel(o.cert)}</span>
                </div>
                <div className="bg-dfull/10 h-[3px] overflow-hidden rounded-full">
                  <div
                    className="bg-signal ease-e1 h-[3px] rounded-full shadow-[0_0_8px_rgba(143,224,178,.45)] transition-[width] duration-700"
                    style={{ width: `${Math.round(o.cert * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        {!sel && !busy ? (
          <p className="border-dhair text-d4 mb-3.5 rounded-[11px] border border-dashed px-4 py-[13px] font-mono text-[11.5px]">
            Choose an offer.
          </p>
        ) : null}
        {busy ? (
          <p
            aria-live="polite"
            className="border-dhair text-signal mb-3.5 rounded-[11px] border border-dashed px-4 py-[13px] font-mono text-[11.5px]"
          >
            Reading the offer terms...
          </p>
        ) : null}
        {sel && !busy ? (
          <div
            className="border-dhair mb-3.5 rounded-[14px] border bg-[rgba(4,15,10,.45)] px-[18px] py-4"
            data-testid="offer-detail"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              <span className="text-d1 text-[14.5px] font-semibold">
                Letter of intent {sel.id} · {sel.who}
              </span>
              <span className="text-d4 font-mono text-[10.5px]">{sel.sub}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-[22px] gap-y-2">
              <Term label="Headline price" value={formatMillions(sel.head)} />
              <Term label="Cash at closing" value={formatMillions(sel.cash)} className="text-filament text-[13.5px]" />
              <Term label="Money paid later" value={paidLater(sel)} />
              <Term label="Retained ownership" value={retained(sel)} />
              <Term label="Buyer financing" value={sel.fin} />
              <Term label="Time you stay" value={sel.trans} />
              <Term label="Team and company name" value={sel.staffNote} className="text-d1 text-[13px] leading-[1.5]" />
              <Term label="Closing risk" value={`${certaintyLabel(sel.cert)} · ${sel.excl} exclusivity`} />
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
