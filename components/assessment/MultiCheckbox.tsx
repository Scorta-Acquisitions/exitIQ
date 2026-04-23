// use client: multi-select checkbox chips with toggle state management
"use client"

import { cva } from "class-variance-authority"
import type { StageQuestion } from "@/lib/assessment/questions"

const checkChipVariants = cva("scorta-option-chip flex items-center gap-2", {
  variants: {
    selected: {
      true: "selected",
      false: "",
    },
  },
  defaultVariants: { selected: false },
})

const checkboxVariants = cva(
  "shrink-0 w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all duration-150",
  {
    variants: {
      checked: {
        true: "border-matcha-300 bg-matcha-300",
        false: "border-white/30 bg-transparent",
      },
    },
    defaultVariants: { checked: false },
  }
)

interface MultiCheckboxProps {
  question: StageQuestion
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiCheckbox({ question, value, onChange }: MultiCheckboxProps) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {question.options?.map((opt) => {
        const selected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={checkChipVariants({ selected })}
            aria-pressed={selected}
          >
            <div className={checkboxVariants({ checked: selected })} aria-hidden="true">
              {selected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="#02492a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
