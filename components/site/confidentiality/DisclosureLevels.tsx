// use client: the visitor changes the viewer's disclosure level
"use client"

import { useEffect, useRef, useState } from "react"
import { CompanyRecord } from "@/components/site/confidentiality/CompanyRecord"
import { ACCESS_LOG, MAX_PERMISSION_LEVEL, PERMISSION_LEVELS } from "@/lib/site/confidentiality/data"

const BUSY_MS = 320

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
    <div
      id="conf-levels"
      className="border-dhair [scroll-margin-top:90px] overflow-hidden rounded-[18px] border bg-[rgba(3,12,8,.5)]"
      data-testid="disclosure-levels"
    >
      <div className="border-dhair-2 border-b px-[22px] py-[18px]">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3.5">
          <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">Change viewer</span>
          <span className="inline-flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
            <span className="text-d4 font-mono text-[11px]" data-testid="perm-level">
              View level {level} of 5
            </span>
            <button
              type="button"
              onClick={() => choose(level + 1)}
              className="hover-green-dark border-signal/40 text-signal rounded-full border px-[11px] py-1 font-mono text-[11px]"
            >
              Move to next level
            </button>
            <button
              type="button"
              onClick={() => choose(1)}
              className="hover-green-dark border-dhair text-d3 rounded-full border px-[11px] py-1 font-mono text-[11px]"
            >
              Return to anonymous view
            </button>
          </span>
        </div>
        <div
          role="group"
          aria-label="Choose what this buyer can see"
          className="bg-dfull/[4%] flex flex-wrap gap-1 rounded-[10px] p-1"
        >
          {PERMISSION_LEVELS.map((p, i) => {
            const on = i === level
            return (
              <button
                key={p.t}
                type="button"
                aria-pressed={on}
                onClick={() => choose(i, true)}
                className={`ease-e1 min-w-0 flex-1 rounded-[7px] border px-1 py-[7px] text-center font-mono text-[11px] tracking-[.5px] uppercase transition-all duration-200 ${
                  on ? "border-filament/50 bg-filament/12 text-filament" : "text-dfull/42 border-transparent"
                }`}
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
          className="range-dark mt-3 h-[22px] w-full cursor-pointer"
        />
        {busy ? (
          <p aria-live="polite" className="text-d4 mt-2 font-mono text-[10.5px]">
            Applying the selected access rules...
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))]">
        <div className="border-dhair-2 border-r px-[22px] py-6">
          <div className="text-signal mb-1 font-mono text-[11.5px] tracking-[1px] uppercase">Who this is</div>
          <div className="font-display text-d1 mb-1.5 text-[27px] leading-[1.15]" data-testid="perm-who">
            {perm.who}
          </div>
          <p className="text-d3 mb-2 text-[13.5px] leading-[1.6]">
            <strong className="text-d2 font-medium">What they see:</strong> {perm.see}
          </p>
          <p className="text-d3 mb-[22px] text-[13.5px] leading-[1.6]">
            <strong className="text-d2 font-medium">What moves access:</strong> {perm.trig}
          </p>
          <CompanyRecord level={level} title="Company record · Project Ridgeline" />
        </div>
        <div className="px-[22px] py-6">
          <div className="mb-3.5 flex items-center gap-[9px]">
            <span className="bg-signal h-1.5 w-1.5 rounded-full" />
            <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">Access history</span>
          </div>
          <h3 className="font-display text-d1 mb-2 text-[22px] leading-[1.15] font-normal">See who opened what.</h3>
          <p className="text-d3 mb-2 text-[13.5px] leading-[1.6]">
            Each entry shows the person, file, time, and access decision. You can see new access, downloads, expiry, and
            revocation.
          </p>
          <div role="group" aria-label="Buyer access history">
            {ACCESS_LOG.map((e) => (
              <div
                key={`${e.t}-${e.act}`}
                className="border-dhair-2 flex flex-wrap items-start gap-x-3 gap-y-1 border-b py-2.5"
              >
                <span className="text-d4 flex-[0_0_106px] pt-0.5 font-mono text-[11px]">{e.t}</span>
                <div className="min-w-0 flex-[1_1_190px]">
                  <div className="text-d1 text-[13.5px] leading-[1.45]">{e.act}</div>
                  <div className="text-d3 mt-[3px] font-mono text-[11px]">
                    {e.who}, {e.org}
                    {e.note ? ` · ${e.note}` : ""}
                  </div>
                </div>
                <span className="text-signal flex-[0_0_30px] pt-0.5 text-right font-mono text-[11px]">L{e.lvl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
