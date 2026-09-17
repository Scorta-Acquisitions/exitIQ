// use client: interactive fee calculator
"use client"

import { useState } from "react"
import { Chip, CHIP_IDLE, CHIP_SELECTED } from "@/components/site/ui/Chip"
import { Card, CARD_CLASS, Eyebrow, KeyValueRow } from "@/components/site/ui/primitives"
import { TextButton } from "@/components/site/ui/TextButton"
import { cn } from "@/lib/site/cn"
import {
  computeFees,
  DEFAULT_FEE_INPUTS,
  FEE_PRICE_MAX,
  FEE_PRICE_MIN,
  FEE_PRICE_STEP,
  FEE_RATE_MAX,
  FEE_RATE_MIN,
  FEE_RATE_STEP,
  type FeeInputs,
} from "@/lib/site/fees/calc"
import { formatDollars } from "@/lib/site/format"

/** The form-label recipe, shared by the group headings and the two input labels. */
const LABEL = "type-caption-strong text-fg-2 mb-2 block"

/** Path cards are option chips grown into cards: the card recipe at compact padding, with the chip's selected ring. */
const PATH_BASE = cn(CARD_CLASS, "pressable p-4 text-left")

/** Dollar figures read as tabular numerals; an instruction or a dash reads as a right-aligned caption so the row never looks like a broken value. */
function valueClass(value: string, figure: string): string {
  return value.startsWith("$") ? figure : "type-caption text-fg-3 max-w-[230px] text-right"
}

function Row({
  label,
  value,
  divider = true,
  valueClassName,
  testId,
}: {
  label: string
  value: string
  divider?: boolean
  valueClassName?: string
  testId?: string
}) {
  return (
    <KeyValueRow
      label={label}
      className={cn("py-3", divider && "border-line border-b")}
      labelClassName="flex-[1_1_190px]"
    >
      <span className={valueClassName ?? "tabular type-body text-fg"} data-testid={testId}>
        {value}
      </span>
    </KeyValueRow>
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
        className={cn(PATH_BASE, on ? CHIP_SELECTED : CHIP_IDLE)}
        data-testid={`fee-path-${path}`}
      >
        {/* The slot is always rendered (one caption line tall) so choosing a path never shifts the slider block. */}
        <Eyebrow as="span" tone="accent" className="mb-1 min-h-[18px]">
          {on ? selectedLabel : ""}
        </Eyebrow>
        <span className="type-body-strong text-fg block">{title}</span>
        <span className="type-caption text-fg-2 mt-1 block">{body}</span>
      </button>
    )
  }

  return (
    <Card padded={false} className="overflow-hidden" data-testid="fee-calculator">
      {/* Two panes side by side from the tablet breakpoint (343px each inside the 736px viewport), stacked below it. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,343px),1fr))]">
        <div className="p-6">
          <div className={LABEL}>Which situation applies?</div>
          <div role="group" aria-label="Choose full sale process or existing buyer" className="flex flex-col gap-2">
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

          <label htmlFor="fees-price" className={cn(LABEL, "mt-8")}>
            Expected transaction value
          </label>
          <div className="type-caption text-fg-3">Assume the business sells for</div>
          <div className="type-display-md tabular text-fg mt-1" data-testid="fee-price">
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
            className="mt-3 h-11 w-full cursor-pointer"
          />
          <div className="type-caption text-fg-3 tabular flex justify-between">
            <span>$500K</span>
            <span>$10M</span>
          </div>

          <label htmlFor="fees-rate" className={cn(LABEL, "mt-8")}>
            Traditional comparison rate
          </label>
          <div role="group" aria-label="Choose the traditional comparison basis" className="flex flex-wrap gap-2">
            <Chip selected={inputs.rateMode === "illu"} onClick={() => update({ rateMode: "illu" })}>
              Use 10% illustration
            </Chip>
            <Chip selected={inputs.rateMode === "quoted"} onClick={() => update({ rateMode: "quoted" })}>
              Enter quoted rate
            </Chip>
          </div>
          {inputs.rateMode === "quoted" ? (
            <div className="mt-3 flex items-center gap-2">
              <input
                id="fees-rate"
                type="number"
                min={FEE_RATE_MIN}
                max={FEE_RATE_MAX}
                step={FEE_RATE_STEP}
                value={inputs.altRate}
                onChange={(e) => update({ altRate: e.target.value })}
                placeholder="Quoted rate"
                aria-label="Traditional comparison rate"
                className="type-body text-fg placeholder:text-fg-3 border-line bg-surface rounded-pill h-11 w-[150px] border px-5"
              />
              <span className="type-caption text-fg-3">%</span>
            </div>
          ) : null}
          <p className="type-caption text-fg-3 mt-3">
            Enter the rate from a proposal if you have one. Through $5M the calculator starts at a 10% illustration.
            Above $5M, enter a quoted rate, since traditional schedules often decline as deals get larger.
          </p>
          <TextButton onClick={() => setInputs(DEFAULT_FEE_INPUTS)} className="mt-2 -mb-3">
            Reset calculator
          </TextButton>
        </div>

        <div className="bg-surface-2 border-line tab:border-t-0 tab:border-l border-t p-6">
          <Eyebrow className="mb-4">What Heirloom is paid</Eyebrow>
          <Row label="Engagement commitment" value={fees.upfront} />
          <Row label="Success fee rate" value={fees.rateLabel} />
          <Row label="Credit at closing" value={fees.credit} />
          <Row label="Still due at closing" value={fees.atClose} />
          <div className="border-line flex items-baseline justify-between gap-4 border-b pt-5 pb-3">
            <span className="type-body-strong text-fg flex-[1_1_140px]">Total Heirloom fee</span>
            <span className="type-lead tabular text-fg" data-testid="fee-total">
              {fees.total}
            </span>
          </div>
          <Row
            label="Traditional fee at selected rate"
            value={fees.traditional}
            valueClassName={valueClass(fees.traditional, "tabular type-body text-fg-3")}
            testId="fee-traditional"
          />
          <Row
            label="Estimated difference"
            value={fees.difference}
            divider={false}
            valueClassName={valueClass(fees.difference, "tabular type-body text-accent")}
            testId="fee-difference"
          />
          <p className="type-caption text-fg-3 mt-4">The 10% rate is an illustration, not a quote.</p>
        </div>
      </div>
    </Card>
  )
}
