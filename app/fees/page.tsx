import type { Metadata } from "next"
import Image from "next/image"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { FeeCalculator } from "@/components/site/fees/FeeCalculator"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { cn } from "@/lib/site/cn"
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

/** One of the three headline figures: the value in display type, its note as a caption directly beneath. */
function BigNumber({ value, note, brand = false }: { value: string; note: string; brand?: boolean }) {
  return (
    <div>
      <span className={cn("type-display-lg tabular block", brand ? "text-accent" : "text-fg")}>{value}</span>
      <span className="type-caption text-fg-3 mt-2 block">{note}</span>
    </div>
  )
}

/** Titled rows separated by hairlines: the other-costs list and the fee questions. */
function RowList({ items }: { items: Array<{ title: string; body: string }> }) {
  return (
    <div className="border-line border-t">
      {items.map((item) => (
        <div key={item.title} className="border-line border-b py-5">
          <div className="type-body-strong text-fg">{item.title}</div>
          <p className="type-body text-fg-2 mt-2">{item.body}</p>
        </div>
      ))}
    </div>
  )
}

export default function FeesPage() {
  return (
    <>
      <Tile tone="light">
        <Container className="desk:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] desk:items-center grid grid-cols-1 gap-x-12 gap-y-12">
          <div className="desk:text-left text-center">
            <Eyebrow className="mb-4">Full sale or existing buyer</Eyebrow>
            <h1 className="type-hero text-fg">Fees</h1>
            <p className="type-lead-airy text-fg-2 desk:mx-0 mx-auto mt-5 max-w-[560px]">
              What you pay Heirloom for a full sale, an existing-buyer transaction, or readiness work.
            </p>
            <div className="tab:grid-cols-3 mt-10 grid grid-cols-1 gap-x-8 gap-y-6">
              <BigNumber value="5%" note="Success fee on a full private sale" brand />
              <BigNumber
                value="$5,000"
                note="Engagement commitment, credited against the success fee if the business sells"
              />
              <BigNumber
                value="2.5%"
                note="Success fee when you already have the buyer, after a free offer review, no upfront fee"
              />
            </div>
            <div className="desk:justify-start mt-10 flex flex-wrap justify-center gap-3">
              <Button href="#fees-calc">Calculate my fee</Button>
              <AdvisorCtaButton variant="secondary" />
            </div>
            <p className="type-caption text-fg-3 mt-5">No monthly retainer, listing fee, or minimum success fee.</p>
          </div>
          <figure
            className="desk:justify-self-end desk:mx-0 mx-auto my-0 w-full max-w-[400px]"
            data-testid="fees-figure"
          >
            <div className="shadow-product relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src="/media/fees.png"
                alt="Financial records bound between sheets of glass, arranged on a travertine table"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 400px"
                className="object-cover"
              />
            </div>
            <figcaption className="type-caption text-fg-3 mt-4">
              Every fee term is written into your engagement agreement before you sign.
            </figcaption>
          </figure>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container>
          <div className="max-w-[692px]">
            <h2 className="type-display-md text-fg">Compared with traditional fees</h2>
            <p className="type-body text-fg-2 mt-4">
              Brokers and M&amp;A firms at this deal size often charge high single-digit or low double-digit rates,
              sometimes with a minimum. At many transactions in Heirloom’s range, 5% is roughly half. Fees vary by firm
              and deal, so compare the actual agreements.
            </p>
            <div className="mt-5">
              <TextLink href="#fees-calc">Calculate my fee</TextLink>
            </div>
          </div>
        </Container>
      </Tile>

      <Tile tone="light">
        <Container>
          <h2 id="fees-calc" className="anchor-target type-display-lg text-fg">
            Fee calculator
          </h2>
          <div className="mt-8">
            <FeeCalculator />
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] gap-x-12 gap-y-14">
          <div>
            <Eyebrow className="mb-4">Full private sale</Eyebrow>
            <h2 className="type-display-md text-fg">What the $5,000 covers</h2>
            <p className="type-body text-fg-2 mt-4">
              You pay $5,000 when the work begins. It covers the preparation done before buyers see the company.
            </p>
            <p className="type-body text-fg-2 mt-4">
              If the business sells, it is credited against the 5% success fee. If it does not sell, it is not refunded,
              and you keep the work produced.
            </p>
            <p className="type-body text-fg-2 mt-4">
              The success fee applies to the purchase value you receive, including cash, seller financing, earnouts, and
              retained ownership. Salary you earn after closing is excluded. The fee on cash paid at closing is due at
              closing. The fee on any amount paid later is due when you receive it.
            </p>
            <p className="type-caption text-fg-3 mt-6">
              Engagement commitment: $5,000 · Success fee: 5% · Credit if the business sells: $5,000 · Monthly retainer:
              None · Minimum success fee: None · Payment timing: Due as each payment is received
            </p>
          </div>
          <div>
            <Eyebrow className="mb-4">Existing buyer</Eyebrow>
            <h2 className="type-display-md text-fg">What the 2.5% covers</h2>
            <p className="type-body text-fg-2 mt-4">
              The offer review is free. If you then hire Heirloom, the 2.5% success fee covers negotiation, diligence
              and financing coordination, defense against late price cuts, and closing.
            </p>
            <p className="type-caption text-fg-3 mt-6">Offer review: Free · Upfront fee: $0 · Success fee: 2.5%</p>
            <div className="mt-5">
              <TextLink href={ROUTES.offerReview}>Review my offer</TextLink>
            </div>
            <p className="type-caption text-fg-3 mt-3">
              If more buyer competition would likely help, we say so before you decide.
            </p>
          </div>
        </Container>
      </Tile>

      <Tile tone="light">
        <Container>
          <div className="max-w-[692px]">
            <h2 id="other-costs" className="anchor-target type-display-lg text-fg">
              Other costs
            </h2>
            <div className="mt-8">
              <RowList items={OTHER_COSTS} />
            </div>
            <p className="type-caption text-fg-3 mt-5">You approve third-party costs before the work begins.</p>
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container>
          <div className="max-w-[692px]">
            <h2 id="fee-questions" className="anchor-target type-display-lg text-fg">
              Common fee questions
            </h2>
            <div className="mt-8">
              <RowList items={FEE_QUESTIONS.map((f) => ({ title: f.q, body: f.a }))} />
            </div>
          </div>
        </Container>
      </Tile>

      <Tile tone="light">
        <Container>
          <div className="max-w-[692px]">
            <h2 className="type-display-lg text-fg">Ask about your fee</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <AdvisorCtaButton />
              <Button href={ROUTES.offerReview} variant="secondary">
                Review my offer
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <TextLink href={ROUTES.score}>Check sale readiness</TextLink>
              <TextLink href={ROUTES.howItWorks}>See how it works →</TextLink>
            </div>
          </div>
        </Container>
      </Tile>
    </>
  )
}
