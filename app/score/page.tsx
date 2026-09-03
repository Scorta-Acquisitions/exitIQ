import type { Metadata } from "next"
import Link from "next/link"
import { ExitIqRun } from "@/components/site/exitiq/ExitIqRun"
import { ReviewWithAdvisorButton, ReviewWithAdvisorCard } from "@/components/site/exitiq/ReviewWithAdvisor"
import { Container } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.score.title, description: PAGE_META.score.description }

export default function ScorePage() {
  return (
    <>
      <div className="aurora panel-hero text-d1 relative overflow-hidden">
        <section className="px-6 pt-[clamp(48px,6vw,76px)] pb-[clamp(56px,7vw,90px)]">
          <Container>
            <div className="mb-[34px] max-w-[800px]">
              <div className="eyebrow text-signal mb-[18px]">exitIQ by Heirloom</div>
              <h1 className="font-display mb-5 text-[clamp(34px,5.4vw,64px)] leading-[1.04] font-normal tracking-[-1.3px]">
                See how buyers would view your business today.
              </h1>
              <p className="text-d2 mb-5 max-w-[600px] text-[16px] leading-[1.55]">
                Answer seven questions to understand financeability, transferability, and the evidence behind your
                numbers. You will get practical findings and a 90-day action plan.
              </p>
              <p className="text-d3 font-mono text-[11.5px]">
                About 2 minutes. No name, email, phone number, or documents required.
              </p>
            </div>
            <ExitIqRun />
            <p className="text-d3 mt-[18px] max-w-[820px] font-mono text-[11.5px] leading-[1.65]">
              exitIQ is an educational readiness screen based on answers you provide. It is not a valuation, appraisal,
              financing decision, or assurance that a business will sell. Heirloom reviews supporting records and
              performs a full analysis before giving transaction advice.
            </p>
          </Container>
        </section>
      </div>

      <section className="bg-paper text-ink px-6 py-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="mb-[30px] max-w-[720px]">
            <h2 className="font-display mb-4 text-[clamp(28px,3.8vw,44px)] leading-[1.1] font-normal tracking-[-.9px]">
              What to do with the result
            </h2>
            <p className="text-l2 max-w-[620px] text-[16.5px] leading-[1.65]">
              You already have the useful part. A conversation is optional.
            </p>
          </div>
          <div className="border-hair-2 mb-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] border-t">
            <div className="border-hair border-b py-[22px] pr-[26px]">
              <div className="font-display mb-2 text-[22px] leading-[1.18]">Keep the plan</div>
              <p className="text-l2 text-[14px] leading-[1.62]">
                The 90-day actions are worth completing whether or not you sell and whether or not you speak with
                Heirloom.
              </p>
            </div>
            <Link href={ROUTES.howItWorks} className="border-hair block border-b border-l px-[26px] py-[22px]">
              <div className="font-display mb-2 text-[22px] leading-[1.18]">See how Heirloom runs a sale</div>
              <p className="text-l2 text-[14px] leading-[1.62]">
                Follow the process from financial preparation and buyer outreach through diligence, financing, and
                closing.
              </p>
            </Link>
            <ReviewWithAdvisorCard />
          </div>
          <div className="max-w-[720px]">
            <h3 className="font-display mb-3.5 text-[27px] leading-[1.16] font-normal">What an advisor review adds</h3>
            <p className="text-l2 mb-[18px] text-[15px] leading-[1.6]">
              An advisor review verifies the financials, tests the likely buyer market, identifies what could improve
              value, and produces a defensible valuation range. If the business should wait, we will give you the
              milestones and tell you when to revisit the decision.
            </p>
            <ReviewWithAdvisorButton />
            <div className="flex flex-wrap gap-x-[22px] gap-y-2.5">
              <TextLink href={ROUTES.fees} className="text-[15px]">
                See fees →
              </TextLink>
              <TextLink href={ROUTES.howItWorks} className="text-[15px]">
                Ready to sell? See how Heirloom runs the process. <span aria-hidden="true">→</span>
              </TextLink>
              <TextLink href={ROUTES.offerReview} className="text-[15px]">
                Already have a buyer? Have the offer reviewed first. <span aria-hidden="true">→</span>
              </TextLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
