// use client: interactive flag columns (pure display, but co-located with client report page)
"use client"

import { cva } from "class-variance-authority"

const columnVariants = cva("border-[1.5px] rounded-[14px] p-[18px]", {
  variants: {
    tone: {
      green: "bg-matcha-300/8 border-matcha-300/20",
      yellow: "bg-lemon/8 border-lemon/25",
      red: "bg-[#ff6b6b]/8 border-[#ff6b6b]/25",
    },
  },
})

const headerIconVariants = cva(
  "w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-bold shrink-0",
  {
    variants: {
      tone: {
        green: "bg-matcha-300/8 border-matcha-300 text-matcha-300",
        yellow: "bg-lemon/8 border-lemon text-lemon",
        red: "bg-[#ff6b6b]/8 border-[#ff6b6b] text-[#ff6b6b]",
      },
    },
  }
)

const headerLabelVariants = cva("text-[13px] font-bold", {
  variants: {
    tone: {
      green: "text-matcha-300",
      yellow: "text-lemon",
      red: "text-[#ff6b6b]",
    },
  },
})

const dotVariants = cva("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5", {
  variants: {
    tone: {
      green: "bg-matcha-300",
      yellow: "bg-lemon",
      red: "bg-[#ff6b6b]",
    },
  },
})

const dividerVariants = cva("border-t", {
  variants: {
    tone: {
      green: "border-matcha-300/20",
      yellow: "border-lemon/25",
      red: "border-[#ff6b6b]/25",
    },
  },
})

const COLUMNS = [
  { key: "green" as const, label: "Strengths", icon: "✓", tone: "green" as const },
  { key: "yellow" as const, label: "Watch Items", icon: "!", tone: "yellow" as const },
  { key: "red" as const, label: "Deal Risks", icon: "✕", tone: "red" as const },
]

interface FlagColumnsProps {
  flags: {
    green: string[]
    yellow: string[]
    red: string[]
  }
}

export function FlagColumns({ flags }: FlagColumnsProps) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {COLUMNS.map((col) => {
        const items = flags[col.key]
        if (items.length === 0) return null
        return (
          <div key={col.key} className={columnVariants({ tone: col.tone })}>
            <div className="mb-3.5 flex items-center gap-2">
              <div className={headerIconVariants({ tone: col.tone })} aria-hidden="true">
                {col.icon}
              </div>
              <span className={headerLabelVariants({ tone: col.tone })}>
                {col.label} ({items.length})
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 pb-2.5 ${i < items.length - 1 ? dividerVariants({ tone: col.tone }) : ""}`}
                >
                  <div className={dotVariants({ tone: col.tone })} aria-hidden="true" />
                  <p className="m-0 text-[13px] leading-[1.55] text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
