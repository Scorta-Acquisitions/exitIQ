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
                Is the business ready to sell?
              </h1>
              <p className="text-d2 mb-5 max-w-[600px] text-[16px] leading-[1.55]">
                Seven questions on financing, whether the business runs without you, and how much a buyer could verify.
                You get findings and a 90-day plan.
              </p>
              <p className="text-d3 font-mono text-[11.5px]">About 2 minutes. No name, email, or documents required.</p>
            </div>
            <ExitIqRun />
            <p className="text-d3 mt-[18px] max-w-[820px] font-mono text-[11.5px] leading-[1.65]">
              exitIQ is a readiness screen based on your answers. It is not a valuation, appraisal, financing decision,
              or assurance that a business will sell.
            </p>
          </Container>
        </section>
      </div>

      <section className="bg-paper text-ink px-6 py-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="mb-[30px] max-w-[720px]">
            <h2 className="font-display mb-4 text-[clamp(28px,3.8vw,44px)] leading-[1.1] font-normal tracking-[-.9px]">
              Next steps
            </h2>
            <p className="text-l2 max-w-[620px] text-[16.5px] leading-[1.65]">A call with an advisor is optional.</p>
          </div>
          <div className="border-hair-2 mb-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] border-t">
            <div className="border-hair border-b py-[22px] pr-[26px]">
              <div className="font-display mb-2 text-[22px] leading-[1.18]">Keep the plan</div>
              <p className="text-l2 text-[14px] leading-[1.62]">The actions are useful whether or not you sell.</p>
            </div>
            <Link href={ROUTES.howItWorks} className="border-hair block border-b border-l px-[26px] py-[22px]">
              <div className="font-display mb-2 text-[22px] leading-[1.18]">See how it works</div>
              <p className="text-l2 text-[14px] leading-[1.62]">The eight stages from preparation to closing.</p>
            </Link>
            <ReviewWithAdvisorCard />
          </div>
          <div className="max-w-[720px]">
            <h3 className="font-display mb-3.5 text-[27px] leading-[1.16] font-normal">What an advisor review adds</h3>
            <p className="text-l2 mb-[18px] text-[15px] leading-[1.6]">
              An advisor checks the financials, tests who would buy the business, and gives you a valuation range. If
              the business should wait, you get the milestones to hit and a date to revisit.
            </p>
            <ReviewWithAdvisorButton />
            <div className="flex flex-wrap gap-x-[22px] gap-y-2.5">
              <TextLink href={ROUTES.fees} className="text-[15px]">
                See fees →
              </TextLink>
              <TextLink href={ROUTES.howItWorks} className="text-[15px]">
                See how it works →
              </TextLink>
              <TextLink href={ROUTES.offerReview} className="text-[15px]">
                Review my offer
              </TextLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
