// use client: the reconciliation example toggles between open and resolved
"use client"

import { useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { Card, Container, Eyebrow, KeyValueRow, Tile } from "@/components/site/ui/primitives"
import { TextButton } from "@/components/site/ui/TextButton"
import { cn } from "@/lib/site/cn"
import { RECONCILIATION } from "@/lib/site/content/stages"

/** Nested callout inside a pane: a compact card on the secondary surface. */
const CALLOUT = "bg-surface-2"

/**
 * The Project Ridgeline reconciliation: a record card on the parchment tile with a header row, the four
 * disagreeing records on the left, and everything that updates from the resolved figure on the right.
 * Resolving the example turns the status pill and the updated values to the accent; nothing else moves.
 */
export function BusinessBrain() {
  const [resolved, setResolved] = useState(false)

  return (
    <Tile tone="parchment" id="financial-preparation" className="anchor-target">
      <Container>
        <h2 className="type-display-lg text-fg">{RECONCILIATION.heading}</h2>
        <p className="type-body text-fg-2 mt-4 max-w-[692px]">{RECONCILIATION.intro}</p>

        <Card padded={false} className="mt-10 overflow-hidden" data-testid="business-brain">
          <div className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
            <Eyebrow as="span">{RECONCILIATION.subject}</Eyebrow>
            <span
              className={cn(
                "type-caption-strong rounded-pill ease-e1 border px-3 py-1 transition-colors duration-300",
                resolved ? "text-accent border-accent" : "text-fg-3 border-line"
              )}
              data-testid="brain-status"
            >
              {resolved ? RECONCILIATION.statusResolved : RECONCILIATION.statusOpen}
            </span>
          </div>

          {/* The 1px gap paints the hairline between the panes whether they sit side by side or stack. */}
          <div className="bg-line grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-px">
            <div className="bg-surface p-6">
              <Eyebrow>{RECONCILIATION.recordsTitle}</Eyebrow>
              <div className="mt-2">
                {RECONCILIATION.records.map((r) => (
                  <div key={r.name} className="border-line flex items-baseline justify-between gap-4 border-b py-3">
                    <div className="min-w-0">
                      <div className="type-body text-fg">{r.name}</div>
                      <div className="type-caption text-fg-3 mt-0.5">{r.note}</div>
                    </div>
                    <span className="type-body text-fg tabular shrink-0">{r.value}</span>
                  </div>
                ))}
              </div>
              {!resolved ? (
                <Card padded="compact" className={cn(CALLOUT, "mt-5")}>
                  <Eyebrow>{RECONCILIATION.statusOpen}</Eyebrow>
                  <Button className="mt-3 text-center whitespace-normal" onClick={() => setResolved(true)}>
                    {RECONCILIATION.resolveLabel}
                  </Button>
                </Card>
              ) : (
                <Card padded="compact" className={cn(CALLOUT, "mt-5")}>
                  <Eyebrow tone="accent">{RECONCILIATION.resolutionTitle}</Eyebrow>
                  <p className="type-body text-fg mt-2">{RECONCILIATION.resolution}</p>
                  <p className="type-caption text-fg-3 mt-2">{RECONCILIATION.resolutionSupport}</p>
                  <TextButton onClick={() => setResolved(false)} className="-mb-3">
                    {RECONCILIATION.resetLabel}
                  </TextButton>
                </Card>
              )}
            </div>

            <div className="bg-surface p-6">
              <Eyebrow>{RECONCILIATION.updatedTitle}</Eyebrow>
              <div className="mt-2">
                {RECONCILIATION.rows.map((row) => (
                  <KeyValueRow
                    key={row.label}
                    label={row.label}
                    className="border-line border-b py-3"
                    valueClassName={cn(
                      "type-body tabular ease-e1 text-right transition-colors duration-300",
                      resolved ? "text-accent" : "text-fg"
                    )}
                  >
                    {resolved ? row.resolved : row.open}
                  </KeyValueRow>
                ))}
              </div>
              <div className="mt-5">
                <Eyebrow>{RECONCILIATION.buyerQuestion}</Eyebrow>
                {!resolved ? (
                  <Card padded="compact" className={cn(CALLOUT, "mt-3")}>
                    <p className="type-body text-fg-3">
                      <em>{RECONCILIATION.answerPending}</em>
                    </p>
                  </Card>
                ) : (
                  <Card padded="compact" className={cn(CALLOUT, "mt-3")}>
                    <p className="type-body text-fg">&quot;{RECONCILIATION.answer}&quot;</p>
                    <p className="type-caption text-fg-3 mt-2">{RECONCILIATION.answerSupport}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </Tile>
  )
}
