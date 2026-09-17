import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { BusinessBrain } from "@/components/site/how-it-works/BusinessBrain"
import { StagesScene } from "@/components/site/scenes/StagesScene"
import { Button } from "@/components/site/ui/Button"
import { Card, Container, Eyebrow, KeyValueRow, Tile } from "@/components/site/ui/primitives"
import { HARD_PARTS, TIMING_ROWS } from "@/lib/site/content/stages"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.howItWorks.title, description: PAGE_META.howItWorks.description }

/**
 * How it works: a centered page hero, the dark eight-stage scroll scene, the reconciliation demo on
 * parchment, the four hard parts as a two-up card grid on white, the timing record on parchment, and the
 * track record on white ahead of the parchment footer. Tiles touch; the tone change is the only divider.
 */
export default function HowItWorksPage() {
  return (
    <>
      <Tile tone="light">
        <Container size="text" className="text-center">
          <Eyebrow className="mb-4">How Heirloom sells a business</Eyebrow>
          <h1 className="type-hero text-fg">The eight stages of a private sale.</h1>
          <p className="type-lead-airy text-fg-2 mt-5">
            Heirloom prepares the company, finds and qualifies buyers, negotiates the offers, and manages diligence,
            financing, and closing. Each stage below shows where you are needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.fees} variant="secondary">
              See fees
            </Button>
          </div>
          <p className="type-caption text-fg-3 mt-5">
            Three to four months on average from launch to closing, 40% faster than a traditional sale.
          </p>
        </Container>
      </Tile>

      <div id="stages" className="anchor-target">
        <StagesScene />
      </div>

      <BusinessBrain />

      <Tile tone="light">
        <Container>
          <h2 className="type-display-lg text-fg">When a sale runs into trouble</h2>
          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-6">
            {HARD_PARTS.map((h) => (
              <Card key={h.title} as="article">
                <div className="type-tagline text-fg">{h.title}</div>
                <p className="type-body text-fg-2 mt-2">{h.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment" id="timing" className="anchor-target">
        <Container>
          <div className="max-w-[692px]">
            <Eyebrow className="mb-4">Timing</Eyebrow>
            <h3 className="type-display-md text-fg">What sets the timeline</h3>
            <p className="type-body text-fg-2 mt-4">
              A traditional sale of this size takes six to nine months. Heirloom closes in three to four months on
              average from launch to closing. Timing depends on how ready the business is, buyer interest, financing,
              diligence, and legal work.
            </p>
            <div className="border-line mt-8 border-t">
              {TIMING_ROWS.map(([k, v]) => (
                <KeyValueRow
                  key={k}
                  label={k}
                  className="border-line lphone:flex-row lphone:items-baseline flex-col items-start border-b py-3"
                  valueClassName="type-body text-fg lphone:flex-[1_1_240px] lphone:text-right"
                >
                  {v}
                </KeyValueRow>
              ))}
            </div>
            <p className="type-fine-print text-fg-3 mt-4 leading-[1.5]">
              This is an expectation, not a guaranteed closing date.
            </p>
          </div>
        </Container>
      </Tile>

      <Tile tone="light">
        <Container>
          <div className="max-w-[692px]">
            <Eyebrow className="mb-4">Track record</Eyebrow>
            <h3 className="type-display-md text-fg">Millions in enterprise value already transacted.</h3>
            <p className="type-body text-fg-2 mt-4">
              Heirloom has closed sales for owners like you, and our founder, Suyash Agrawal, bought and ran small
              businesses himself before starting the firm. Your sale is prepared the way a buyer will test it, by people
              who have been the buyer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AdvisorCtaButton />
              <Button href={ROUTES.score} variant="secondary">
                Check sale readiness
              </Button>
            </div>
          </div>
        </Container>
      </Tile>
    </>
  )
}
