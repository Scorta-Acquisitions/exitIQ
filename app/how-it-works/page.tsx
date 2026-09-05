import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { BusinessBrain } from "@/components/site/how-it-works/BusinessBrain"
import { StagesScene } from "@/components/site/scenes/StagesScene"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, KeyValueRow } from "@/components/site/ui/primitives"
import { HARD_PARTS, TIMING_ROWS } from "@/lib/site/content/stages"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.howItWorks.title, description: PAGE_META.howItWorks.description }

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(40px,5vw,60px)]">
        <Container className="max-w-[820px]">
          <Eyebrow className="mb-[18px]">How Heirloom sells a business</Eyebrow>
          <h1 className="font-display mb-[22px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
            The eight stages of a private sale.
          </h1>
          <p className="text-l2 mb-5 text-[17px] leading-[1.6]">
            Heirloom prepares the company, finds and qualifies buyers, negotiates the offers, and manages diligence,
            financing, and closing. Each stage below shows where you are needed.
          </p>
          <div className="mb-4 flex flex-wrap gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.fees} variant="outline-plain" className="px-5">
              See fees
            </Button>
          </div>
          <p className="text-l3 font-mono text-[11.5px] leading-[1.65]">
            Three to four months on average from launch to closing, 40% faster than a traditional sale.
          </p>
        </Container>
      </section>

      <StagesScene />
      <BusinessBrain />

      <section className="bg-paper px-6 py-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="mb-8 max-w-[720px]">
            <h2 className="font-display mb-3.5 text-[clamp(28px,3.8vw,44px)] leading-[1.1] font-normal tracking-[-.9px]">
              When a sale runs into trouble
            </h2>
          </div>
          <div className="border-hair-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] border-t">
            {HARD_PARTS.map((h, i) => (
              <div
                key={h.title}
                className={`border-hair border-b py-[22px] ${i % 2 === 0 ? "pr-[26px]" : "border-l pl-[26px]"}`}
              >
                <div className="mb-2 text-[16px] font-semibold">{h.title}</div>
                <p className="text-l2 text-[14.5px] leading-[1.65]">{h.body}</p>
              </div>
            ))}
          </div>
          <div className="border-hair-2 mt-11 max-w-[720px] border-t pt-[30px]">
            <Eyebrow className="mb-3.5">Timing</Eyebrow>
            <h3 className="font-display mb-3.5 text-[27px] leading-[1.16] font-normal">What sets the timeline</h3>
            <p className="text-l2 mb-4 text-[15.5px] leading-[1.68]">
              A traditional sale of this size takes six to nine months. Heirloom closes in three to four months on
              average from launch to closing. Timing depends on how ready the business is, buyer interest, financing,
              diligence, and legal work.
            </p>
            <div className="mb-3.5">
              {TIMING_ROWS.map(([k, v], i) => (
                <KeyValueRow
                  key={k}
                  label={k}
                  className={`border-hair border-t py-2.5 ${i === TIMING_ROWS.length - 1 ? "border-b" : ""}`}
                >
                  <span className="text-ink flex-[1_1_220px] text-right text-[13.5px]">{v}</span>
                </KeyValueRow>
              ))}
            </div>
            <p className="text-l3 mb-[34px] font-mono text-[11px]">
              This is an expectation, not a guaranteed closing date.
            </p>
            <Eyebrow className="mb-3.5">Track record</Eyebrow>
            <h3 className="font-display mb-3.5 text-[27px] leading-[1.16] font-normal">
              Millions in enterprise value already transacted.
            </h3>
            <p className="text-l2 mb-5 text-[15.5px] leading-[1.68]">
              Heirloom has closed sales for owners like you, and our founder, Suyash Agrawal, bought and ran small
              businesses himself before starting the firm. Your sale is prepared the way a buyer will test it, by people
              who have been the buyer.
            </p>
            <div className="flex flex-wrap gap-3">
              <AdvisorCtaButton />
              <Button href={ROUTES.score} variant="outline-plain" className="px-5">
                Check sale readiness
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
