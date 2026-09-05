// use client: interactive fee calculator
"use client"

import { useState } from "react"
import { Chip } from "@/components/site/ui/Chip"
import {
  computeFees,
  DEFAULT_FEE_INPUTS,
  FEE_PRICE_MAX,
  FEE_PRICE_MIN,
  FEE_PRICE_STEP,
  type FeeInputs,
} from "@/lib/site/fees/calc"
import { formatDollars } from "@/lib/site/format"

/** Dollar figures read as tabular numerals; an instruction or a dash reads as small muted text so the row never looks like a broken value. */
function valueClass(value: string, figure: string): string {
  return value.startsWith("$") ? figure : "text-l3 max-w-[230px] text-right text-[12px] leading-[1.5]"
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="border-hair flex items-baseline justify-between border-b py-3">
      <span className={`flex-[1_1_190px] text-[14.5px] ${muted ? "text-l3" : "text-l2"}`}>{label}</span>
      <span className={`tabular font-mono text-[16px] ${muted ? "text-l3" : ""}`}>{value}</span>
    </div>
  )
}

export function FeeCalculator() {
  const [inputs, setInputs] = useState<FeeInputs>(DEFAULT_FEE_INPUTS)
  const fees = computeFees(inputs)
  const update = (patch: Partial<FeeInputs>) => setInputs((i) => ({ ...i, ...patch }))

  const pathCard = (path: FeeInputs["path"], selectedLabel: string, title: string, body: string) => {
    const on = inputs.path === path
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => update({ path })}
        className={`ease-e1 hover:bg-paper-2 rounded-[11px] border px-4 py-3.5 text-left transition-all duration-200 ${
          on ? "border-filament-ink/50" : "border-hair-2"
        }`}
        data-testid={`fee-path-${path}`}
      >
        {on ? (
          <span className="text-filament-ink mb-[5px] block font-mono text-[11px] tracking-[1px] uppercase">
            {selectedLabel}
          </span>
        ) : null}
        <span className="mb-1 block text-[16px] font-semibold">{title}</span>
        <span className="text-l3 block text-[13.5px] leading-[1.55]">{body}</span>
      </button>
    )
  }

  return (
    <div className="border-hair-2 bg-card overflow-hidden rounded-2xl border" data-testid="fee-calculator">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        <div className="border-hair border-r px-[26px] pt-[26px] pb-[30px]">
          <div className="text-l4 mb-3 font-mono text-[11.5px] tracking-[1px] uppercase">Which situation applies?</div>
          <div
            role="group"
            aria-label="Choose full sale process or existing buyer"
            className="mb-[26px] flex flex-col gap-2"
          >
            {pathCard(
              "market",
              "Full private sale selected",
              "Full private sale",
              "We prepare the business, find buyers, and close the sale."
            )}
            {pathCard(
              "execution",
              "Existing buyer selected",
              "I already have the buyer",
              "We negotiate and manage your existing deal to closing."
            )}
          </div>
          <label htmlFor="fees-price" className="text-l4 mb-2 block font-mono text-[11.5px] tracking-[1px] uppercase">
            Expected transaction value
          </label>
          <div className="text-l3 mb-1 text-[13px]">Assume the business sells for</div>
          <div className="tabular font-display mb-3 text-[42px] leading-none" data-testid="fee-price">
            {formatDollars(inputs.price)}
          </div>
          <input
            id="fees-price"
            type="range"
            min={FEE_PRICE_MIN}
            max={FEE_PRICE_MAX}
            step={FEE_PRICE_STEP}
            value={inputs.price}
            onChange={(e) => update({ price: parseInt(e.target.value, 10) })}
            aria-label="Expected transaction value"
            className="h-[22px] w-full cursor-pointer"
          />
          <div className="text-l4 mt-0.5 flex justify-between font-mono text-[11px]">
            <span>$500K</span>
            <span>$10M</span>
          </div>
          <label
            htmlFor="fees-rate"
            className="text-l4 mt-[22px] mb-2 block font-mono text-[11.5px] tracking-[1px] uppercase"
          >
            Traditional comparison rate
          </label>
          <div
            role="group"
            aria-label="Choose the traditional comparison basis"
            className="mb-2.5 flex flex-wrap gap-1.5"
          >
            <Chip
              tone="light-mono"
              size="sm"
              selected={inputs.rateMode === "illu"}
              onClick={() => update({ rateMode: "illu" })}
            >
              Use 10% illustration
            </Chip>
            <Chip
              tone="light-mono"
              size="sm"
              selected={inputs.rateMode === "quoted"}
              onClick={() => update({ rateMode: "quoted" })}
            >
              Enter quoted rate
            </Chip>
          </div>
          {inputs.rateMode === "quoted" ? (
            <div className="flex items-center gap-2">
              <input
                id="fees-rate"
                type="number"
                min={1}
                max={15}
                step={0.5}
                value={inputs.altRate}
                onChange={(e) => update({ altRate: e.target.value })}
                placeholder="Quoted rate"
                aria-label="Traditional comparison rate"
                className="border-hair-2 bg-paper-2 h-[42px] w-[150px] rounded-[9px] border px-3 text-[15px]"
              />
              <span className="text-l3 font-mono text-[13px]">%</span>
            </div>
          ) : null}
          <p className="text-l3 mt-2 text-[12px] leading-[1.6]">
            Enter the rate from a proposal if you have one. Through $5M the calculator starts at a 10% illustration.
            Above $5M, enter a quoted rate, since traditional schedules often decline as deals get larger.
          </p>
          <button
            type="button"
            onClick={() => setInputs(DEFAULT_FEE_INPUTS)}
            className="hover-green border-hair-2 text-l3 mt-4 border-b pb-0.5 font-mono text-[11.5px]"
          >
            Reset calculator
          </button>
        </div>
        <div className="bg-paper-2 p-[26px]">
          <div className="text-l4 mb-[18px] font-mono text-[11.5px] tracking-[1px] uppercase">
            What Heirloom is paid
          </div>
          <Row label="Engagement commitment" value={fees.upfront} />
          <Row label="Success fee rate" value={fees.rateLabel} />
          <Row label="Credit at closing" value={fees.credit} />
          <Row label="Still due at closing" value={fees.atClose} />
          <div className="border-ink flex items-baseline justify-between border-b-2 pt-4 pb-3">
            <span className="flex-[1_1_140px] text-[15px] font-semibold">Total Heirloom fee</span>
            <span className="tabular font-display text-[34px] leading-none" data-testid="fee-total">
              {fees.total}
            </span>
          </div>
          <div className="border-hair flex items-baseline justify-between border-b pt-3.5 pb-3">
            <span className="text-l3 text-[14.5px]">Traditional fee at selected rate</span>
            <span
              className={valueClass(fees.traditional, "tabular text-l3 font-mono text-[16px]")}
              data-testid="fee-traditional"
            >
              {fees.traditional}
            </span>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <span className="text-l2 flex-[1_1_190px] text-[14.5px]">Estimated difference</span>
            <span
              className={valueClass(fees.difference, "tabular text-filament-ink font-mono text-[16px]")}
              data-testid="fee-difference"
            >
              {fees.difference}
            </span>
          </div>
          <p className="text-l3 mt-3.5 font-mono text-[11px] leading-[1.65]">
            The 10% rate is an illustration, not a quote.
          </p>
        </div>
      </div>
    </div>
  )
}
