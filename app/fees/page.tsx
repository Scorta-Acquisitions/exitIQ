import type { Metadata } from "next"
import Image from "next/image"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { FeeCalculator } from "@/components/site/fees/FeeCalculator"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.fees.title, description: PAGE_META.fees.description }

const OTHER_COSTS: Array<{ title: string; body: string }> = [
  {
    title: "Readiness work",
    body: "If the business needs material preparation before market, Heirloom scopes the work and price before it begins. Eligible readiness fees may receive partial credit toward a later full-sale engagement. If the issue only requires a focused accountant or legal fix, we will say so.",
  },
  {
    title: "Your lawyer",
    body: "Legal fees are separate. Your lawyer handles the letter of intent, purchase agreement, disclosure schedules, and other legal work. Heirloom coordinates the process and preserves your choice of counsel.",
  },
  {
    title: "Your accountant or quality-of-earnings provider",
    body: "Accounting costs are separate when the books need assembly, complex adjustments need validation, or a formal earnings review is required.",
  },
  {
    title: "Tax advice",
    body: "Transaction tax planning is separate and can materially affect what you keep. A qualified tax advisor should review the structure before final terms are set.",
  },
  {
    title: "Other specialists",
    body: "Insurance, benefits, environmental, licensing, or industry-specific work may be required for a particular business. Heirloom identifies the need and coordinates the timeline.",
  },
]

const FEE_QUESTIONS: Array<{ q: string; a: string }> = [
  {
    q: "Why is there a $5,000 engagement commitment?",
    a: "Most of the work that determines whether a sale is ready happens before buyer outreach. The commitment pays for financial preparation, valuation, positioning, materials, and buyer research. It also allows Heirloom to limit engagements and give each sale serious attention.",
  },
  {
    q: "Is the $5,000 refundable if the business does not sell?",
    a: "No. It is credited toward the success fee if the business sells and is not refunded if no sale occurs. You keep the work produced for your business.",
  },
  {
    q: "What does the 5% apply to?",
    a: "Purchase value you receive, including cash, seller financing, earnouts, and retained ownership under the engagement terms. Heirloom collects fees tied to later payments as those payments arrive. Genuine post-close salary is excluded.",
  },
  {
    q: "Why pay 2.5% if I found the buyer?",
    a: "Finding a buyer does not complete the sale. Price, cash, financing, working capital, diligence, transition, legal terms, and closing risk can all change after the first offer. The fee covers representation through that work.",
  },
  { q: "Is there a minimum fee?", a: "No. The percentage applies without a minimum success fee." },
]

function BigNumber({ value, note, brand = false }: { value: string; note: string; brand?: boolean }) {
  return (
    <div className="max-w-[240px]">
      <span
        className={`tabular font-display block text-[clamp(38px,4.6vw,58px)] leading-none ${brand ? "text-brand" : ""}`}
      >
        {value}
      </span>
      <span className="text-l3 mt-[7px] block font-mono text-[11.5px] leading-[1.6] tracking-[.4px]">{note}</span>
    </div>
  )
}

export default function FeesPage() {
  return (
    <>
      <section className="bg-paper overflow-hidden px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(36px,4vw,52px)]">
        <Container className="relative">
          <Image
            src="/brand/heirloom-mark.svg"
            alt=""
            aria-hidden="true"
            width={500}
            height={500}
            className="mask-seal pointer-events-none absolute top-1/2 -right-[50px] hidden w-[min(48%,500px)] -translate-y-1/2 opacity-[.14] backdrop:block"
          />
          <div className="relative max-w-[720px]">
            <Eyebrow className="mb-[18px]">Full sale, existing buyer, and readiness work</Eyebrow>
            <h1 className="font-display mb-[18px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              What Heirloom costs.
            </h1>
            <p className="text-l2 mb-5 max-w-[620px] text-[16.5px] leading-[1.6]">
              Full sell-side representation, often at roughly half the high single-digit or low double-digit fees common
              in this market.
            </p>
            <div className="mt-2.5 mb-[18px] flex flex-wrap items-start gap-x-11 gap-y-[18px]">
              <BigNumber value="5%" note="Full private sale, paid when the transaction closes" brand />
              <BigNumber
                value="$5,000"
                note="Engagement commitment, credited in full toward the 5% success fee if the business sells"
              />
              <BigNumber
                value="2.5%"
                note="Existing-buyer transaction, with a free offer review first and no upfront fee"
                brand
              />
            </div>
            <div className="mb-3.5 flex flex-wrap gap-3">
              <Button href="#fees-calc">Calculate my fee</Button>
              <AdvisorCtaButton variant="outline-plain" className="px-5" />
            </div>
            <p className="text-l3 font-mono text-[11.5px]">
              No monthly retainer. No listing fee. No minimum success fee.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 pb-[clamp(56px,7vw,84px)]">
        <Container>
          <div className="mb-[30px] max-w-[720px]">
            <Eyebrow className="mb-3.5">The comparison</Eyebrow>
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              Keep more of the value you created.
            </h2>
            <p className="text-l2 mb-3 text-[15.5px] leading-[1.65]">
              Traditional small-business brokers and M&amp;A firms can charge high single digits or low double digits,
              often with minimum fees or a rate that declines as the deal gets larger. Heirloom’s full-sale success fee
              is 5% with no minimum.
            </p>
            <p className="text-l2 mb-3.5 text-[15.5px] leading-[1.65]">
              At many transactions in Heirloom’s core market, that can put our fee at roughly half the traditional
              alternative. Compare the actual agreements because firm, deal size, and fee structure matter.
            </p>
            <TextLink href="#fees-calc" className="text-[14px]">
              Compare the fees on my sale →
            </TextLink>
          </div>
          <h2
            id="fees-calc"
            className="font-display mb-4 [scroll-margin-top:90px] text-[clamp(22px,2.6vw,30px)] leading-[1.14] font-normal"
          >
            What would Heirloom cost on your sale?
          </h2>
          <FeeCalculator />

          <div className="border-hair-2 mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] gap-9 border-t pt-[34px]">
            <div>
              <Eyebrow className="mb-3">Full private sale</Eyebrow>
              <h2 className="font-display mb-3.5 text-[30px] leading-[1.14] font-normal">
                5% when the business sells.
              </h2>
              <p className="text-l2 mb-3 text-[15px] leading-[1.6]">
                You pay a $5,000 engagement commitment when the work begins. If the business sells, every dollar of that
                commitment is credited toward the 5% success fee.
              </p>
              <p className="text-l2 mb-3 text-[15px] leading-[1.6]">
                The commitment pays for the work completed before buyers see the company: financial preparation,
                valuation, positioning, sale materials, buyer research, and launch preparation. If the business does not
                sell, the commitment is not refunded and you keep the work produced for your business.
              </p>
              <p className="text-l2 mb-3.5 text-[15px] leading-[1.6]">
                The fee applies to purchase value you receive, including cash at closing, seller financing, earnouts,
                and retained ownership under the engagement terms. Fees tied to a seller note or earnout are collected
                as those payments arrive. Genuine post-close salary is excluded.
              </p>
              <p className="text-l3 font-mono text-[11.5px] leading-[1.7]">
                Engagement commitment: $5,000 · Success fee: 5% · Credit if the business sells: $5,000 · Monthly
                retainer: None · Minimum success fee: None · Payment timing: Heirloom is paid as you are paid
              </p>
            </div>
            <div>
              <Eyebrow className="mb-3">You already have the buyer</Eyebrow>
              <h2 className="font-display mb-3.5 text-[30px] leading-[1.14] font-normal">
                Free review first. 2.5% if we run the transaction.
              </h2>
              <p className="text-l2 mb-3 text-[15px] leading-[1.6]">
                We review the offer for free. If you hire Heirloom, we negotiate the full deal, coordinate diligence and
                buyer financing, challenge late price cuts, manage specialists, and carry the transaction through
                closing.
              </p>
              <p className="text-l3 mb-3.5 font-mono text-[11.5px] leading-[1.7]">
                Offer Review: Free · Upfront fee: $0 · Success fee: 2.5% · Included: Negotiation, diligence, financing
                coordination, working-capital and closing terms, transition terms, late price-cut defense, specialist
                coordination, and closing management
              </p>
              <TextLink href={ROUTES.offerReview} className="mb-2.5 inline-block text-[14px]">
                Review my offer →
              </TextLink>
              <p className="text-l3 text-[13px] leading-[1.6]">
                If broader buyer competition would likely improve the outcome, we will explain that option before you
                decide.
              </p>
            </div>
          </div>

          <div className="border-hair-2 mt-11 max-w-[760px] border-t pt-[34px]">
            <h2 className="font-display mb-5 text-[30px] leading-[1.14] font-normal">Other costs you may encounter</h2>
            <div className="mb-2.5 flex flex-col">
              {OTHER_COSTS.map((c, i) => (
                <div
                  key={c.title}
                  className={`border-hair border-t py-4 ${i === OTHER_COSTS.length - 1 ? "border-b" : ""}`}
                >
                  <div className="mb-1.5 text-[15.5px] font-semibold">{c.title}</div>
                  <p className="text-l2 text-[14.5px] leading-[1.65]">{c.body}</p>
                </div>
              ))}
            </div>
            <p className="text-l3 mb-[34px] font-mono text-[11.5px]">
              Third-party costs depend on the business and transaction. You approve them before the work begins.
            </p>
            <h2 className="font-display mb-5 text-[30px] leading-[1.14] font-normal">Common fee questions</h2>
            <div className="mb-[34px] flex flex-col">
              {FEE_QUESTIONS.map((f, i) => (
                <div
                  key={f.q}
                  className={`border-hair border-t py-4 ${i === FEE_QUESTIONS.length - 1 ? "border-b" : ""}`}
                >
                  <div className="mb-1.5 text-[15.5px] font-semibold">{f.q}</div>
                  <p className="text-l2 text-[14.5px] leading-[1.65]">{f.a}</p>
                </div>
              ))}
            </div>
            <h2 className="font-display mb-4 text-[30px] leading-[1.14] font-normal">
              Ask about the fee on your sale.
            </h2>
            <div className="mb-3.5 flex flex-wrap gap-3">
              <AdvisorCtaButton />
              <Button href={ROUTES.offerReview} variant="outline-plain" className="px-5">
                Review my offer
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2.5">
              <TextLink href={ROUTES.score} className="text-[14px]">
                Still deciding? Check if my business is ready. <span aria-hidden="true">→</span>
              </TextLink>
              <TextLink href={ROUTES.howItWorks} className="text-[14px]">
                Want the details? See how the sale works. <span aria-hidden="true">→</span>
              </TextLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
