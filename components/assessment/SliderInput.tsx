// use client: range slider with real-time thumb position and value display
"use client"

import { cva } from "class-variance-authority"

const trackFillVariants = cva("h-full rounded-sm transition-[width] duration-100", {
  variants: {
    active: {
      true: "bg-matcha-800",
      false: "bg-oat",
    },
  },
  defaultVariants: { active: true },
})

interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  displayValue: string
  onChange: (value: number) => void
}

export function SliderInput({ label, value, min, max, displayValue, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-warm-charcoal text-[13px] font-semibold">{label}</label>
        <span className="bg-matcha-800 text-matcha-300 rounded-[1584px] px-3 py-0.5 font-mono text-[13px] font-bold">
          {displayValue}
        </span>
      </div>

      <div className="relative flex h-7 items-center">
        {/* Track background */}
        <div className="bg-oat-light absolute inset-x-0 h-1 overflow-hidden rounded-sm">
          <div className={trackFillVariants({ active: true })} style={{ width: `${pct}%` }} />
        </div>
        {/* Native range input (invisible, handles interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="absolute inset-x-0 z-[1] h-7 w-full cursor-pointer opacity-0"
        />
        {/* Thumb visual */}
        <div
          className="bg-matcha-800 pointer-events-none absolute z-[2] h-5 w-5 rounded-full border-[3px] border-white shadow-sm transition-[left] duration-100"
          style={{ left: `calc(${pct}% - 10px)` }}
          aria-hidden="true"
        />
      </div>

      <div className="text-warm-silver flex justify-between text-[11px]">
        <span>{min} yr</span>
        <span>{max}+ yr</span>
      </div>
    </div>
  )
}
