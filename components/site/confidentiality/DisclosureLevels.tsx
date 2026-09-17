// use client: the visitor changes the viewer's disclosure level
"use client"

import { useEffect, useRef, useState } from "react"
import { CompanyRecord } from "@/components/site/confidentiality/CompanyRecord"
import { Button } from "@/components/site/ui/Button"
import { CHIP_SELECTED } from "@/components/site/ui/Chip"
import { Card, Eyebrow } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { ACCESS_LOG, MAX_PERMISSION_LEVEL, PERMISSION_LEVELS } from "@/lib/site/confidentiality/data"

const BUSY_MS = 320

/**
 * The disclosure instrument: one card with a control header (level readout, step buttons, the
 * segmented stop row, and a range slider), then two panes divided by a hairline: who the viewer is
 * with the company record as they see it, and the access history. Lives on the dark tile of the
 * Confidentiality page, so every colour resolves through the on-dark tokens.
 */
export function DisclosureLevels() {
  const [level, setLevel] = useState(1)
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (next: number, withBusy = false) => {
    setLevel(Math.max(0, Math.min(MAX_PERMISSION_LEVEL, next)))
    if (withBusy) {
      setBusy(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setBusy(false), BUSY_MS)
    }
  }

  const perm = PERMISSION_LEVELS[level] ?? PERMISSION_LEVELS[1]!

  return (
    <Card padded={false} id="conf-levels" className="anchor-target overflow-hidden" data-testid="disclosure-levels">
      <div className="border-line-soft border-b px-6 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Eyebrow as="span">Change viewer</Eyebrow>
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="type-caption text-fg-3 tabular" data-testid="perm-level">
              View level {level} of 5
            </span>
            <Button variant="secondary" size="compact" onClick={() => choose(level + 1)}>
              Move to next level
            </Button>
            <Button variant="secondary" size="compact" onClick={() => choose(1)}>
              Return to anonymous view
            </Button>
          </span>
        </div>
        <div
          role="group"
          aria-label="Choose what this buyer can see"
          className="bg-surface-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,100px),1fr))] gap-1 rounded-lg p-1"
        >
          {PERMISSION_LEVELS.map((p, i) => {
            const on = i === level
            return (
              <button
                key={p.t}
                type="button"
                aria-pressed={on}
                onClick={() => choose(i, true)}
                className={cn(
                  // A transparent hairline keeps the cell size fixed and lets the selected stop draw the chip recipe's 2px accent.
                  "pressable type-caption min-w-0 rounded-sm border border-transparent px-2 py-3 text-center",
                  on ? cn("bg-surface text-accent", CHIP_SELECTED) : "text-fg-3 hover:text-fg"
                )}
                data-testid={`perm-stop-${i}`}
              >
                {i} · {p.t}
              </button>
            )
          })}
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PERMISSION_LEVEL}
          step={1}
          value={level}
          onChange={(e) => choose(parseInt(e.target.value, 10))}
          aria-label="Choose what this buyer can see"
          className="mt-4 h-[22px] w-full cursor-pointer"
        />
        {/* Always mounted so the panes below do not jump while the rules apply. */}
        <p aria-live="polite" className="type-caption text-fg-3 mt-2 min-h-5">
          {busy ? "Applying the selected access rules..." : ""}
        </p>
      </div>
      <div className="bg-line-soft grid grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))] gap-px">
        <div className="bg-surface px-6 py-6">
          <Eyebrow tone="accent">Who this is</Eyebrow>
          <div className="type-display-md text-fg mt-2" data-testid="perm-who">
            {perm.who}
          </div>
          <p className="type-body text-fg-2 mt-4">
            <strong className="text-fg">What they see:</strong> {perm.see}
          </p>
          <p className="type-body text-fg-2 mt-2">
            <strong className="text-fg">What moves access:</strong> {perm.trig}
          </p>
          <div className="mt-6">
            <CompanyRecord level={level} title="Company record · Project Ridgeline" />
          </div>
        </div>
        <div className="bg-surface px-6 py-6">
          <Eyebrow as="span">Access history</Eyebrow>
          <h3 className="type-tagline text-fg mt-4">Who opened what</h3>
          <p className="type-caption text-fg-2 mt-2">Each entry shows the person, file, time, and access decision.</p>
          <div role="group" aria-label="Buyer access history" className="mt-4">
            {ACCESS_LOG.map((e) => (
              <div
                key={`${e.t}-${e.act}`}
                className="border-line-soft flex flex-wrap items-start gap-x-4 gap-y-1 border-b py-3 last:border-b-0"
              >
                <span className="type-caption text-fg-3 tabular flex-[0_0_148px] pt-0.5">{e.t}</span>
                <div className="min-w-0 flex-[1_1_180px]">
                  <div className="type-body text-fg">{e.act}</div>
                  <div className="type-caption text-fg-3 mt-0.5">
                    {e.who}, {e.org}
                    {e.note ? ` · ${e.note}` : ""}
                  </div>
                </div>
                <span className="type-caption text-accent tabular flex-none pt-0.5 text-right">L{e.lvl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
