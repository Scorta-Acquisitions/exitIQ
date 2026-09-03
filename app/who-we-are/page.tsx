import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { FounderPortrait } from "@/components/site/home/ExperienceAdvisor"
import { Container, Eyebrow } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { CONTACT, PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.whoWeAre.title, description: PAGE_META.whoWeAre.description }

const FACTS: Array<[string, string]> = [
  ["Heirloom transactions", "Millions in enterprise value"],
  ["Founder buy-side experience", "Millions in enterprise value, before Heirloom"],
  ["Engagement model", "One accountable M&A advisor"],
  ["Backing", "Y Combinator"],
]

const BENCH: Array<{ title: string; body: string }> = [
  {
    title: "Lead M&A advisor",
    body: "Accountable for valuation, buyer strategy, negotiation, major decisions, and closing.",
  },
  {
    title: "Engineering",
    body: "Keeps financial records, transaction materials, buyer access, and status consistent behind the engagement.",
  },
  {
    title: "Legal, accounting, lending, and tax specialists",
    body: "Provide regulated or specialized work while Heirloom coordinates requests, decisions, and timing.",
  },
]

const CHANGES: Array<{ title: string; body: string }> = [
  {
    title: "Better preparation",
    body: "We know which numbers, contracts, customer risks, and owner adjustments buyers are likely to challenge before the business enters the market.",
  },
  {
    title: "Stronger buyer qualification",
    body: "We test whether a buyer’s criteria, financing plan, and acquisition history fit the transaction before the owner spends time on meetings.",
  },
  {
    title: "Clearer offer comparison",
    body: "We look through headline price to cash at closing, money paid later, working capital, financing conditions, transition, and the chance of closing.",
  },
  {
    title: "More disciplined diligence",
    body: "We organize evidence early, answer routine questions consistently, and keep the buyer’s lender and specialists moving.",
  },
  {
    title: "A stronger negotiating position",
    body: "We preserve competition, challenge unsupported price reductions, and keep alternatives available when the process supports it.",
  },
]

export default function WhoWeArePage() {
  return (
    <>
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(56px,7vw,84px)]">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,42%)),1fr))] items-start gap-11">
          <div>
            <Eyebrow className="mb-[18px]">The firm behind your sale</Eyebrow>
            <h1 className="font-display mb-[22px] text-[clamp(32px,4.8vw,56px)] leading-[1.05] font-normal tracking-[-1.2px]">
              M&amp;A experience from both sides of the table.
            </h1>
            <p className="text-l2 mb-5 text-[16.5px] leading-[1.6]">
              Heirloom represents owners of established private businesses. We prepare the company, create buyer
              competition, negotiate the full transaction, and stay responsible through closing.
            </p>
            <div className="border-hair mb-5 border-t">
              {FACTS.map(([k, v]) => (
                <div
                  key={k}
                  className="border-hair flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b py-[11px]"
                >
                  <span className="text-l4 font-mono text-[11.5px] tracking-[.8px] uppercase">{k}</span>
                  <span className="text-ink text-[14px]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <AdvisorCtaButton>Talk to Suyash</AdvisorCtaButton>
              <TextLink href={ROUTES.howItWorks} className="text-[14px]">
                See how Heirloom sells a business →
              </TextLink>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            <FounderPortrait radius={14} />
            <div>
              <Eyebrow className="mb-1.5">Founder and CEO</Eyebrow>
              <h2 className="font-display mb-3 text-[26px] leading-[1.1] font-normal">Suyash Agrawal</h2>
              <p className="text-l2 mb-2.5 text-[14.5px] leading-[1.62]">
                Suyash leads Heirloom’s early seller engagements personally. Before Heirloom, he founded and sold a
                company, built software at Atlassian, and acquired and operated small businesses through micro-PE. His
                prior buy-side work includes millions of dollars in transacted enterprise value.
              </p>
              <p className="text-l2 mb-3.5 text-[14.5px] leading-[1.62]">
                He has evaluated earnings, challenged owner adjustments, structured offers, worked with lenders, and
                managed diligence from the buyer’s chair. That is the perspective Heirloom puts on the seller’s side of
                the table.
              </p>
              <TextLink href={`mailto:${CONTACT.hello}`} className="text-[14px]">
                Email Suyash
              </TextLink>{" "}
              <span className="text-l3 ml-2.5 font-mono text-[12px]">{CONTACT.hello}</span>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 pb-[clamp(56px,7vw,84px)]">
        <Container className="border-hair-2 border-t pt-[34px]">
          <Eyebrow className="mb-3.5">Who does the work</Eyebrow>
          <h2 className="font-display mb-2.5 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
            One advisor, backed by a full transaction bench.
          </h2>
          <p className="text-l2 mb-[22px] max-w-[720px] text-[15px] leading-[1.62]">
            Your lead advisor owns the relationship and the outcome. Engineers support the financial record, buyer
            research, access controls, and transaction coordination. Attorneys, accountants, quality-of-earnings
            providers, lenders, tax advisors, and other specialists join when the transaction requires them.
          </p>
          <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[26px]">
            {BENCH.map((b) => (
              <div key={b.title}>
                <div className="text-l3 mb-2 font-mono text-[11.5px]">{b.title}</div>
                <p className="text-l2 text-[14px] leading-[1.6]">{b.body}</p>
              </div>
            ))}
          </div>
          <p className="text-l3 mb-[38px] font-mono text-[11.5px]">
            You may use your existing professionals. Heirloom can also recommend a vetted specialist when needed.
          </p>
          <h2 className="font-display mb-5 text-[clamp(24px,3vw,32px)] leading-[1.14] font-normal">
            What this experience changes for you
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[22px]">
            {CHANGES.map((c) => (
              <div key={c.title}>
                <div className="mb-[5px] text-[15px] font-semibold">{c.title}</div>
                <p className="text-l2 text-[13.5px] leading-[1.6]">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-hair bg-paper-2 border-t px-6 py-[clamp(48px,6vw,72px)]">
        <Container className="max-w-[760px]">
          <h2 className="font-display mb-4 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
            Built for owners the market overlooks.
          </h2>
          <p className="text-l2 mb-[26px] text-[16.5px] leading-[1.68]">
            Large investment banks rarely focus on businesses in this size range. Many local brokers rely on public
            listings and wait for inbound interest. Heirloom gives an established owner a private, actively managed sale
            with prepared financials, qualified buyers, real competition, and one accountable advisor.
          </p>
          <div className="mb-3.5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <AdvisorCtaButton>Talk to Suyash about my business</AdvisorCtaButton>
            <TextLink href={ROUTES.howItWorks} className="text-[14px]">
              See how Heirloom works →
            </TextLink>
          </div>
          <p className="text-l3 font-mono text-[11.5px]">
            Heirloom represents sellers and never buys a represented business for its own account.
          </p>
        </Container>
      </section>
    </>
  )
}
