// use client: one open answer at a time across every category
"use client"

import { useState } from "react"
import { Disclosure } from "@/components/site/ui/Disclosure"
import { QUESTION_CATEGORIES } from "@/lib/site/questions/data"

/**
 * Every category opens with a section heading (the sub-nav and the hero pills point at these headings);
 * the questions beneath it divide on hairlines and reveal one answer at a time.
 */
export function QuestionsAccordion() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div data-testid="questions-accordion">
      {QUESTION_CATEGORIES.map((cat, ci) => (
        <div key={cat.id} className={ci ? "mt-20" : undefined}>
          <h2 id={cat.id} className="anchor-target type-display-md text-fg">
            {cat.label}
          </h2>
          <div className="border-line mt-6 border-t">
            {cat.items.map((item, i) => {
              const key = `${cat.id}-${i}`
              return (
                <Disclosure
                  key={key}
                  question={item.q}
                  open={open === key}
                  onToggle={() => setOpen(open === key ? null : key)}
                  questionClassName="type-tagline"
                >
                  <p className="type-body text-fg-2">{item.a}</p>
                </Disclosure>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
