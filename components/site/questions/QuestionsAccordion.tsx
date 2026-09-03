// use client: one open answer at a time across every category
"use client"

import { useState } from "react"
import { Disclosure } from "@/components/site/ui/Disclosure"
import { QUESTION_CATEGORIES } from "@/lib/site/questions/data"

export function QuestionsAccordion() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div data-testid="questions-accordion">
      {QUESTION_CATEGORIES.map((cat, ci) => (
        <div key={cat.id}>
          <h2
            id={cat.id}
            className={`border-ink text-filament-ink [scroll-margin-top:100px] border-t pt-3 font-mono text-[11px] font-normal tracking-[1.2px] uppercase ${
              ci ? "mt-[38px] mb-1" : "mb-1"
            }`}
          >
            {cat.label}
          </h2>
          {cat.items.map((item, i) => {
            const key = `${cat.id}-${i}`
            return (
              <Disclosure
                key={key}
                question={item.q}
                open={open === key}
                onToggle={() => setOpen(open === key ? null : key)}
                questionClassName="text-left text-[17px] font-semibold leading-[1.4]"
              >
                <p className="text-l2 text-[15.5px] leading-[1.68]">{item.a}</p>
                {item.a2 ? <p className="text-l2 mt-2.5 text-[15.5px] leading-[1.68]">{item.a2}</p> : null}
              </Disclosure>
            )
          })}
        </div>
      ))}
    </div>
  )
}
