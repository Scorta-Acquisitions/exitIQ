// use client: expands and collapses an answer on click
"use client"

import { useId } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/site/cn"

/** Accessible accordion row: a button with `aria-expanded` controlling a region, divided by a hairline. */
export function Disclosure({
  question,
  open,
  onToggle,
  children,
  questionClassName,
}: {
  question: string
  open: boolean
  onToggle: () => void
  children: ReactNode
  questionClassName?: string
}) {
  const id = useId()
  return (
    <div className="border-line border-b">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="hover:text-accent flex w-full items-baseline justify-between gap-[18px] py-4 text-left transition-colors duration-200"
      >
        <span className={cn("type-body-strong", questionClassName)}>{question}</span>
        <span aria-hidden="true" className="text-fg-3 type-body flex-none">
          {open ? "−" : "+"}
        </span>
      </button>
      <div id={id} role="region" hidden={!open} className="max-w-[692px] pb-5">
        {children}
      </div>
    </div>
  )
}
