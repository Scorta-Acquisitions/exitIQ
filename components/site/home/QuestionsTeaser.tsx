// use client: accordion open state
"use client"

import { useState } from "react"
import { Disclosure } from "@/components/site/ui/Disclosure"
import { Container } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { HOME_TEASER } from "@/lib/site/questions/data"
import { ROUTES } from "@/lib/site/routes"

export function QuestionsTeaser() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="bg-paper px-6 pt-[clamp(36px,4vw,56px)]">
      <Container className="border-hair border-b pb-[clamp(44px,5vw,64px)]">
        <div className="mb-[18px] max-w-[720px]">
          <h2 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.06] font-normal tracking-[-.9px]">
            Questions owners ask before they sell.
          </h2>
        </div>
        <div className="border-hair-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-x-12 border-t">
          {HOME_TEASER.map((qa, i) => (
            <Disclosure
              key={qa.q}
              question={qa.q}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
              questionClassName="font-display text-[clamp(18px,2vw,22px)] leading-[1.2]"
            >
              <p className="text-l2 max-w-[660px] text-[14.5px] leading-[1.65]">{qa.a}</p>
            </Disclosure>
          ))}
        </div>
        <div className="mt-5">
          <TextLink href={ROUTES.questions} className="text-[14px]">
            Read every answer →
          </TextLink>
        </div>
      </Container>
    </section>
  )
}
