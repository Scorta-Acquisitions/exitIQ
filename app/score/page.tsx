import type { Metadata } from "next"
import Link from "next/link"
import { ExitIqRun } from "@/components/site/exitiq/ExitIqRun"
import { ReviewWithAdvisorButton, ReviewWithAdvisorCard } from "@/components/site/exitiq/ReviewWithAdvisor"
import { Card, CARD_CLASS, CARD_PADDING, Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { cn } from "@/lib/site/cn"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.score.title, description: PAGE_META.score.description }

/**
 * /score: a centered page hero with the exitIQ instrument resting beneath it on the light tile, a
 * parchment tile of next steps, and a closing light tile on what an advisor review adds. The run is
 * the page's action, so the hero carries no call-to-action pair.
 */
export default function ScorePage() {
  return (
    <>
      <Tile tone="light">
        <Container size="text" className="text-center">
          <Eyebrow className="mb-4">exitIQ by Heirloom</Eyebrow>
          <h1 className="type-hero text-fg">Is the business ready to sell?</h1>
          <p className="type-lead-airy text-fg-2 mt-5 text-balance">
            Seven questions on financing, whether the business runs without you, and how much a buyer could verify. You
            get findings and a 90-day plan.
          </p>
          <p className="type-caption text-fg-3 mt-5">About 2 minutes. No name, email, or documents required.</p>
        </Container>
        {/* The first build's card sat in a 1180px lock; its shadow is the console's (the first build's own dark-card-on-light
            recipe), and the footnote sits clear of it, where the muted caption measures 4.7:1 over the shadow's edge. */}
        <Container className="mt-14 max-w-[1180px]">
          <ExitIqRun />
          <p className="type-caption text-fg-3 mt-16 max-w-[692px]">
            exitIQ is a readiness screen based on your answers. It is not a valuation, appraisal, financing decision, or
            assurance that a business will sell.
          </p>
        </Container>
      </Tile>

      <Tile tone="parchment" id="next-steps" className="anchor-target">
        <Container>
          <h2 className="type-display-lg text-fg">Next steps</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">A call with an advisor is optional.</p>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6">
            <Card>
              <span className="type-tagline text-fg block">Keep the plan</span>
              <p className="type-body text-fg-2 mt-2">The actions are useful whether or not you sell.</p>
            </Card>
            <Link href={ROUTES.howItWorks} className={cn(CARD_CLASS, CARD_PADDING, "pressable block")}>
              <span className="type-tagline text-accent block">See how it works</span>
              <p className="type-body text-fg-2 mt-2">The eight stages from preparation to closing.</p>
            </Link>
            <ReviewWithAdvisorCard />
          </div>
        </Container>
      </Tile>

      <Tile tone="light">
        <Container>
          <h3 className="type-display-md text-fg">What an advisor review adds</h3>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            An advisor checks the financials, tests who would buy the business, and gives you a valuation range. If the
            business should wait, you get the milestones to hit and a date to revisit.
          </p>
          <div className="mt-8">
            <ReviewWithAdvisorButton />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
            <TextLink href={ROUTES.fees}>See fees →</TextLink>
            <TextLink href={ROUTES.howItWorks}>See how it works →</TextLink>
            <TextLink href={ROUTES.offerReview}>Review my offer</TextLink>
          </div>
        </Container>
      </Tile>
    </>
  )
}
