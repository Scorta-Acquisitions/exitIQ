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
    body: "If the business needs significant preparation before market, Heirloom scopes and prices that work first. Eligible readiness fees may be partly credited toward a later full-sale engagement.",
  },
  {
    title: "Your lawyer",
    body: "Legal fees are separate. Your lawyer handles the letter of intent, purchase agreement, and disclosure schedules.",
  },
  {
    title: "Your accountant",
    body: "Accounting fees are separate when the books need assembly or a buyer requires a quality-of-earnings review.",
  },
  {
    title: "Tax advice",
    body: "Transaction tax planning is separate. It should happen before final terms are set.",
  },
  {
    title: "Other specialists",
    body: "Insurance, environmental, licensing, or industry-specific work may be needed. Heirloom coordinates the timing.",
  },
]

const FEE_QUESTIONS: Array<{ q: string; a: string }> = [
  {
    q: "Why is there a $5,000 engagement commitment?",
    a: "Most of the work that decides whether a sale is ready happens before buyer outreach. The commitment pays for that preparation and lets Heirloom limit the number of engagements.",
  },
  {
    q: "Is the $5,000 refundable if the business does not sell?",
    a: "No. It is credited against the success fee if the business sells and is not refunded otherwise. You keep the financial work, valuation, and materials produced.",
  },
  {
    q: "What does the 5% apply to?",
    a: "The purchase value you receive, including cash at closing, seller financing, earnouts, and retained ownership. The fee on cash paid at closing is due at closing. The fee on anything paid later is due when you receive it. Salary you earn after closing is excluded.",
  },
  {
    q: "Why pay 2.5% if I found the buyer?",
    a: "Price, cash, financing, working capital, diligence, and legal terms can all change after the first offer. The 2.5% covers negotiation, diligence, financing coordination, and closing.",
  },
  { q: "Is there a minimum fee?", a: "No. The percentage applies without a minimum success fee." },
]

function BigNumber({ value, note, brand = false }: { value: string; note: string; brand?: boolean }) {
  return (
    <div className="max-w-[200px]">
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
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(36px,4vw,52px)]">
        <Container className="grid grid-cols-1 gap-x-12 gap-y-9 md:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] md:items-center">
          <div className="max-w-[720px]">
            <Eyebrow className="mb-[18px]">Full sale or existing buyer</Eyebrow>
            <h1 className="font-display mb-[18px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              Fees
            </h1>
            <p className="text-l2 mb-5 max-w-[620px] text-[16.5px] leading-[1.6]">
              What you pay Heirloom for a full sale, an existing-buyer transaction, or readiness work.
            </p>
            <div className="mt-2.5 mb-[18px] flex flex-wrap items-start gap-x-11 gap-y-[18px]">
              <BigNumber value="5%" note="Success fee on a full private sale" brand />
              <BigNumber
                value="$5,000"
                note="Engagement commitment, credited against the success fee if the business sells"
              />
              <BigNumber
                value="2.5%"
                note="Success fee when you already have the buyer, after a free offer review, no upfront fee"
                brand
              />
            </div>
            <div className="mb-3.5 flex flex-wrap gap-3">
              <Button href="#fees-calc">Calculate my fee</Button>
              <AdvisorCtaButton variant="outline-plain" className="px-5" />
            </div>
            <p className="text-l3 font-mono text-[11.5px]">No monthly retainer, listing fee, or minimum success fee.</p>
          </div>
          <figure className="m-0 w-full max-w-[400px] md:justify-self-end" data-testid="fees-figure">
            <div className="border-hair-2 bg-card relative aspect-[3/4] overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(12,54,38,.08)]">
              <Image
                src="/media/fees.png"
                alt="Financial records bound between sheets of glass, arranged on a travertine table"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 400px"
                className="object-cover"
              />
            </div>
            <figcaption className="text-l3 mt-3 font-mono text-[11px] leading-[1.6]">
              Every fee term is written into your engagement agreement before you sign.
            </figcaption>
          </figure>
        </Container>
      </section>

      <section className="bg-paper px-6 pb-[clamp(56px,7vw,84px)]">
        <Container>
          <div className="mb-[30px] max-w-[720px]">
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              Compared with traditional fees
            </h2>
            <p className="text-l2 mb-3.5 text-[15.5px] leading-[1.65]">
              Brokers and M&amp;A firms at this deal size often charge high single-digit or low double-digit rates,
              sometimes with a minimum. At many transactions in Heirloom’s range, 5% is roughly half. Fees vary by firm
              and deal, so compare the actual agreements.
            </p>
            <TextLink href="#fees-calc" className="text-[14px]">
              Calculate my fee
            </TextLink>
          </div>
          <h2
            id="fees-calc"
            className="font-display mb-4 [scroll-margin-top:90px] text-[clamp(22px,2.6vw,30px)] leading-[1.14] font-normal"
          >
            Fee calculator
          </h2>
          <FeeCalculator />

          <div className="border-hair-2 mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] gap-9 border-t pt-[34px]">
            <div>
              <Eyebrow className="mb-3">Full private sale</Eyebrow>
              <h2 className="font-display mb-3.5 text-[30px] leading-[1.14] font-normal">What the $5,000 covers</h2>
              <p className="text-l2 mb-3 text-[15px] leading-[1.6]">
                You pay $5,000 when the work begins. It covers the preparation done before buyers see the company.
              </p>
              <p className="text-l2 mb-3 text-[15px] leading-[1.6]">
                If the business sells, it is credited against the 5% success fee. If it does not sell, it is not
                refunded, and you keep the work produced.
              </p>
              <p className="text-l2 mb-3.5 text-[15px] leading-[1.6]">
                The success fee applies to the purchase value you receive, including cash, seller financing, earnouts,
                and retained ownership. Salary you earn after closing is excluded. The fee on cash paid at closing is
                due at closing. The fee on any amount paid later is due when you receive it.
              </p>
              <p className="text-l3 font-mono text-[11.5px] leading-[1.7]">
                Engagement commitment: $5,000 · Success fee: 5% · Credit if the business sells: $5,000 · Monthly
                retainer: None · Minimum success fee: None · Payment timing: Due as each payment is received
              </p>
            </div>
            <div>
              <Eyebrow className="mb-3">Existing buyer</Eyebrow>
              <h2 className="font-display mb-3.5 text-[30px] leading-[1.14] font-normal">What the 2.5% covers</h2>
              <p className="text-l2 mb-3 text-[15px] leading-[1.6]">
                The offer review is free. If you then hire Heirloom, the 2.5% success fee covers negotiation, diligence
                and financing coordination, defense against late price cuts, and closing.
              </p>
              <p className="text-l3 mb-3.5 font-mono text-[11.5px] leading-[1.7]">
                Offer review: Free · Upfront fee: $0 · Success fee: 2.5%
              </p>
              <TextLink href={ROUTES.offerReview} className="mb-2.5 inline-block text-[14px]">
                Review my offer
              </TextLink>
              <p className="text-l3 text-[13px] leading-[1.6]">
                If more buyer competition would likely help, we say so before you decide.
              </p>
            </div>
          </div>

          <div className="border-hair-2 mt-11 max-w-[760px] border-t pt-[34px]">
            <h2 className="font-display mb-5 text-[30px] leading-[1.14] font-normal">Other costs</h2>
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
              You approve third-party costs before the work begins.
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
            <h2 className="font-display mb-4 text-[30px] leading-[1.14] font-normal">Ask about your fee</h2>
            <div className="mb-3.5 flex flex-wrap gap-3">
              <AdvisorCtaButton />
              <Button href={ROUTES.offerReview} variant="outline-plain" className="px-5">
                Review my offer
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2.5">
              <TextLink href={ROUTES.score} className="text-[14px]">
                Check sale readiness
              </TextLink>
              <TextLink href={ROUTES.howItWorks} className="text-[14px]">
                See how it works →
              </TextLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
