// use client: expands and collapses an answer on click
"use client"

import { useId } from "react"
import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

/** Accessible accordion row: a button with `aria-expanded` controlling a region. */
export function Disclosure({
  question,
  open,
  onToggle,
  children,
  questionClassName,
  className,
}: {
  question: string
  open: boolean
  onToggle: () => void
  children: ReactNode
  questionClassName?: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={twMerge("border-hair border-b", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="hover-green flex w-full items-baseline justify-between gap-[18px] px-0.5 py-4 text-left"
      >
        <span className={questionClassName}>{question}</span>
        <span aria-hidden="true" className="text-l4 font-mono text-[16px]">
          {open ? "−" : "+"}
        </span>
      </button>
      <div id={id} role="region" hidden={!open} className="max-w-[760px] px-0.5 pb-[18px]">
        {children}
      </div>
    </div>
  )
}
