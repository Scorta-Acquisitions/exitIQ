// use client: priority, selection, and preview state; the re-order and the figure's lean write transforms to the DOM
"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useFlipRows } from "@/components/site/motion/useFlipRows"
import { usePointerParallax } from "@/components/site/motion/usePointerParallax"
import { Chip, CHIP_IDLE, CHIP_SELECTED } from "@/components/site/ui/Chip"
import { Card, CARD_CLASS, CARD_PADDING, Container, Eyebrow, KeyValueRow, Tile } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { formatMillions, padIndex } from "@/lib/site/format"
import {
  letterTitle,
  OFFER_COPY,
  type OfferId,
  OFFERS,
  PRIORITIES,
  type Priority,
  PRIORITY_WHY,
} from "@/lib/site/offers/data"
import {
  certaintyLabel,
  closingRisk,
  findOffer,
  paidLater,
  rankFor,
  rankOffers,
  retained,
} from "@/lib/site/offers/score"

const OFFER_BUSY_MS = 340

/**
 * The border a card wears while a hovered or focused priority would make it the strongest fit: the idle
 * hover tone, drawn as an inset ring so nothing shifts. Never drawn over the accent ring of the current fit.
 */
const PREVIEW_RING = "bg-surface-2 ring-1 ring-inset ring-fg-2"

/** One line of an offer card: the key/value row over a hairline, a step tighter than the record default. */
const OFFER_LINE = "border-line gap-2.5 border-t py-2"

/** One term of the detail panel: label over value, over a hairline. `className` sets the value's type. */
function Term({ label, value, className = "type-body text-fg" }: { label: string; value: string; className?: string }) {
  return (
    <div className="border-line border-t py-2">
      <span className="type-caption text-fg-3 mb-0.5 block">{label}</span>
      <span className={cn("block", className)}>{value}</span>
    </div>
  )
}

/**
 * Four letters of intent for Project Ridgeline on a parchment tile. Choosing a priority re-ranks them and the
 * cards travel to their new places (FLIP, in CSS order, so the DOM and tab order stay A to D): the strongest
 * fit takes the selected-chip border, the highest headline price a neutral badge, and each card wears its rank.
 * Hovering or focusing a priority previews which card it would lift. Pressing a card reads its full terms into
 * the panel below.
 */
export function OfferComparison() {
  const [priority, setPriority] = useState<Priority>("certainty")
  const [hovered, setHovered] = useState<Priority | null>(null)
  const [focused, setFocused] = useState<Priority | null>(null)
  const [selected, setSelected] = useState<OfferId | null>(null)
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const gridRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLElement>(null)
  const figureLayerRef = useRef<HTMLDivElement>(null)

  const snapshot = useFlipRows(gridRef, priority)
  usePointerParallax(figureRef, figureLayerRef, { max: 6 })

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (p: Priority) => {
    if (p === priority) return
    snapshot()
    setPriority(p)
  }

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
  const ranks = rankFor(priority)
  const preview = hovered ?? focused
  const previewId = preview ? rankOffers(preview).bestId : null
  const sel = findOffer(selected)

  return (
    <Tile tone="parchment" data-testid="offer-comparison">
      <Container>
        <div className="desk:grid-cols-[minmax(0,1fr)_280px] grid grid-cols-1 items-center gap-x-12 gap-y-8">
          <div className="max-w-[692px]">
            <h2 className="type-display-lg text-fg">{OFFER_COPY.heading}</h2>
            <p className="type-body text-fg-2 mt-4">{OFFER_COPY.lead}</p>
          </div>
          {/* The four letters as objects, beside the header from the desktop breakpoint; phones lose nothing. The deep-green plate (the SealFilm frame tone) keeps the cream and brass legible on parchment. The envelopes lean a few pixels toward the pointer. */}
          <figure ref={figureRef} className="desk:block m-0 hidden" data-testid="offers-figure">
            <div className="bg-tile-1 shadow-product relative aspect-[3/2] overflow-hidden rounded-lg">
              <div ref={figureLayerRef} className="absolute inset-0" data-testid="offers-figure-layer">
                <Image
                  src="/generated/envelopes.webp"
                  alt={OFFER_COPY.figureAlt}
                  fill
                  sizes="280px"
                  className="object-contain p-5"
                />
              </div>
            </div>
          </figure>
        </div>
        <div role="group" aria-label={OFFER_COPY.priorityGroup} className="mt-8 flex flex-wrap items-center gap-2">
          <span className="type-caption text-fg-2 basis-full">{OFFER_COPY.priorityPrompt}</span>
          {PRIORITIES.map((p) => (
            <Chip
              key={p.v}
              selected={priority === p.v}
              onClick={() => choose(p.v)}
              onMouseEnter={() => setHovered(p.v)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setFocused(p.v)}
              onBlur={() => setFocused(null)}
            >
              {p.l}
            </Chip>
          ))}
        </div>
        <p className="type-caption text-fg-3 mt-3 max-w-[692px]">{PRIORITY_WHY[priority]}</p>
        <div
          ref={gridRef}
          role="group"
          aria-label={OFFER_COPY.cardsGroup}
          className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-6"
        >
          {OFFERS.map((o) => {
            const best = o.id === bestId
            const isSel = selected === o.id
            const previewed = o.id === previewId
            const rank = ranks[o.id]
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
                className={cn(
                  CARD_CLASS,
                  CARD_PADDING,
                  "pressable cursor-pointer",
                  best ? CHIP_SELECTED : isSel ? "border-fg" : CHIP_IDLE,
                  previewed && !best && PREVIEW_RING
                )}
                style={{ order: rank }}
                data-testid={`offer-card-${o.id}`}
                data-best={best}
                data-preview={previewed}
                data-rank={rank}
              >
                <div className="mb-3 flex min-h-14 items-start justify-between gap-x-3">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {best ? (
                      <Eyebrow
                        key={`best-${o.id}`}
                        as="span"
                        tone="accent"
                        className="border-accent rounded-pill animate-row-in border px-3 py-1 motion-reduce:animate-none"
                      >
                        {OFFER_COPY.bestBadge}
                      </Eyebrow>
                    ) : null}
                    {o.id === highestHeadlineId ? (
                      <Eyebrow
                        key={`head-${o.id}`}
                        as="span"
                        className="border-line rounded-pill animate-row-in border px-3 py-1 motion-reduce:animate-none"
                      >
                        {OFFER_COPY.headlineBadge}
                      </Eyebrow>
                    ) : null}
                  </div>
                  <span
                    key={rank}
                    aria-hidden="true"
                    className="type-caption text-fg-3 tabular animate-row-in shrink-0 py-1 motion-reduce:animate-none"
                    data-testid={`offer-rank-${o.id}`}
                  >
                    {padIndex(rank)}
                  </span>
                </div>
                {/* Two title lines are reserved so the figure rows line up across the four cards. */}
                <div className="type-tagline text-fg min-h-[50px]">{o.who}</div>
                <div className="type-caption text-fg-3 mt-1 mb-4">{o.sub}</div>
                <KeyValueRow
                  label={OFFER_COPY.terms.head}
                  className={OFFER_LINE}
                  valueClassName="type-body text-fg tabular"
                >
                  {formatMillions(o.head)}
                </KeyValueRow>
                <KeyValueRow
                  label={OFFER_COPY.terms.cash}
                  className={OFFER_LINE}
                  valueClassName="type-body-strong text-fg tabular"
                >
                  {formatMillions(o.cash)}
                </KeyValueRow>
                <KeyValueRow label={OFFER_COPY.terms.risk} className={OFFER_LINE} valueClassName="type-body text-fg-2">
                  {certaintyLabel(o.cert)}
                </KeyValueRow>
                <div className="rounded-pill bg-fg/15 mt-1 h-[3px]">
                  <div
                    className="rounded-pill bg-accent ease-e1 h-full transition-[width] duration-300"
                    style={{ width: `${Math.round(o.cert * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        {!sel && !busy ? <p className="type-caption text-fg-3 mt-6">{OFFER_COPY.choose}</p> : null}
        {busy ? (
          <p aria-live="polite" className="type-caption text-fg-3 mt-6">
            {OFFER_COPY.reading}
          </p>
        ) : null}
        {sel && !busy ? (
          <Card key={sel.id} className="animate-stage-in mt-6 motion-reduce:animate-none" data-testid="offer-detail">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              <span className="type-tagline text-fg">{letterTitle(sel)}</span>
              <span className="type-caption text-fg-3">{sel.sub}</span>
            </div>
            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-6 gap-y-2">
              <Term
                label={OFFER_COPY.terms.head}
                value={formatMillions(sel.head)}
                className="type-body text-fg tabular"
              />
              <Term
                label={OFFER_COPY.terms.cash}
                value={formatMillions(sel.cash)}
                className="type-body-strong text-fg tabular"
              />
              <Term label={OFFER_COPY.terms.later} value={paidLater(sel)} className="type-body text-fg tabular" />
              <Term label={OFFER_COPY.terms.retained} value={retained(sel)} className="type-body text-fg tabular" />
              <Term label={OFFER_COPY.terms.financing} value={sel.fin} />
              <Term label={OFFER_COPY.terms.stay} value={sel.trans} />
              <Term label={OFFER_COPY.terms.team} value={sel.staffNote} className="type-caption text-fg-2" />
              <Term label={OFFER_COPY.terms.risk} value={closingRisk(sel)} />
            </div>
          </Card>
        ) : null}
      </Container>
    </Tile>
  )
}
