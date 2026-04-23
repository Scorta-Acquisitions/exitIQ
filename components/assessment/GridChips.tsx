// use client: interactive chip grid with auto-advance selection state management
"use client"

import { cva } from "class-variance-authority"

const chipVariants = cva(
  "border-[1.5px] rounded-[10px] text-center cursor-pointer transition-all duration-[130ms] ease-in font-[inherit] p-2.5",
  {
    variants: {
      selected: {
        true: "bg-matcha-800 border-matcha-800",
        false: "bg-cream border-oat hover:border-matcha-800 hover:bg-[#f0faf5]",
      },
    },
    defaultVariants: { selected: false },
  }
)

const chipLabelVariants = cva("text-[13px] font-semibold", {
  variants: {
    selected: {
      true: "text-white",
      false: "text-near-black",
    },
  },
  defaultVariants: { selected: false },
})

const chipSubVariants = cva("text-[10px] mt-0.5", {
  variants: {
    selected: {
      true: "text-white/70",
      false: "text-warm-silver",
    },
  },
  defaultVariants: { selected: false },
})

interface GridChipsProps {
  label: string
  options: { value: string; label: string; sub?: string }[]
  value: string
  onSelect: (value: string) => void
  columns?: number
}

export function GridChips({ label, options, value, onSelect, columns = 2 }: GridChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <div className="text-warm-charcoal text-[13px] font-semibold">{label}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "7px" }}>
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button key={opt.value} onClick={() => onSelect(opt.value)} className={chipVariants({ selected })}>
              <div className={chipLabelVariants({ selected })}>{opt.label}</div>
              {opt.sub && <div className={chipSubVariants({ selected })}>{opt.sub}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
