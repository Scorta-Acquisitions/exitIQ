// use client: accordion open state
"use client"

import { useState } from "react"
import { Disclosure } from "@/components/site/ui/Disclosure"
import { Container, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { HOME_TEASER } from "@/lib/site/questions/data"
import { ROUTES } from "@/lib/site/routes"

/**
 * Five questions from the questions page, as disclosure rows in one reading column (the questions
 * page's own layout). One answer is open at a time.
 */
export function QuestionsTeaser() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <Tile tone="parchment">
      <Container>
        <h2 className="type-display-lg text-fg">Questions</h2>
        <div className="border-line mt-8 max-w-[692px] border-t">
          {HOME_TEASER.map((qa, i) => (
            <Disclosure key={qa.q} question={qa.q} open={open === i} onToggle={() => setOpen(open === i ? null : i)}>
              <p className="type-body text-fg-2">{qa.a}</p>
            </Disclosure>
          ))}
        </div>
        {/* 44px touch target: mt-3 plus the centred 44px box puts the text where mt-6 did; -mb-3 keeps the tile padding. */}
        <div className="mt-3 -mb-3">
          <TextLink href={ROUTES.questions} standalone>
            See all questions
          </TextLink>
        </div>
      </Container>
    </Tile>
  )
}
