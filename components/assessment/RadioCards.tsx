// use client: interactive radio card selection with per-option highlight state
"use client"

import { cva } from "class-variance-authority"
import type { StageAnswer, StageQuestion } from "@/lib/assessment/questions"

const radioCardVariants = cva("scorta-option-card w-full", {
  variants: {
    selected: {
      true: "selected",
      false: "",
    },
  },
  defaultVariants: { selected: false },
})

const radioIndicatorVariants = cva(
  "shrink-0 flex items-center justify-center rounded-full border-2 w-5 h-5 transition-all duration-150",
  {
    variants: {
      selected: {
        true: "border-matcha-300 bg-matcha-300",
        false: "border-white/30 bg-transparent",
      },
    },
    defaultVariants: { selected: false },
  }
)

const radioLabelVariants = cva("text-[15px] font-semibold", {
  variants: {
    selected: {
      true: "text-matcha-300",
      false: "text-white",
    },
  },
  defaultVariants: { selected: false },
})

interface RadioCardsProps {
  question: StageQuestion
  value: StageAnswer
  onChange: (value: string) => void
}

export function RadioCards({ question, value, onChange }: RadioCardsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {question.options?.map((opt) => {
        const selected = value === opt.value
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} className={radioCardVariants({ selected })}>
            <div className={radioIndicatorVariants({ selected })} aria-hidden="true">
              {selected && <div className="bg-matcha-800 h-2 w-2 rounded-full" />}
            </div>
            <div className="flex-1 text-left">
              <div className={radioLabelVariants({ selected })}>{opt.label}</div>
              {opt.sub && <div className="mt-0.5 text-[13px] leading-snug text-white/55">{opt.sub}</div>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
