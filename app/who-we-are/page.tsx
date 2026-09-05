import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { Container, Eyebrow } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { FounderPortrait } from "@/components/site/who-we-are/FounderPortrait"
import { CONTACT, PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.whoWeAre.title, description: PAGE_META.whoWeAre.description }

const FACTS: Array<[string, string]> = [
  ["Heirloom transactions", "Millions in enterprise value transacted"],
  ["Founder buy-side experience", "Small-business acquisitions as a micro-PE investor before Heirloom"],
  ["Engagement model", "One named advisor from first call to closing"],
  ["Backing", "Y Combinator"],
]

const BENCH: Array<{ title: string; body: string }> = [
  {
    title: "Lead advisor",
    body: "Owns valuation, buyer strategy, negotiation, and closing.",
  },
  {
    title: "Engineering",
    body: "Keeps financial records, materials, and buyer access consistent.",
  },
  {
    title: "Legal, accounting, lending, and tax specialists",
    body: "Do the regulated work. Heirloom coordinates timing.",
  },
]

const CHANGES: Array<{ title: string; body: string }> = [
  {
    title: "Better preparation",
    body: "We know which numbers and adjustments buyers will challenge before market.",
  },
  {
    title: "Stronger buyer qualification",
    body: "We test a buyer’s criteria, financing, and history before you meet.",
  },
  {
    title: "Clearer offer comparison",
    body: "We look past headline price to cash, financing, and closing risk.",
  },
  {
    title: "More disciplined diligence",
    body: "We organize evidence early and answer routine questions consistently.",
  },
  {
    title: "A stronger negotiating position",
    body: "We keep competition alive and challenge unsupported price cuts.",
  },
]

export default function WhoWeArePage() {
  return (
    <>
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(56px,7vw,84px)]">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,42%)),1fr))] items-start gap-11">
          <div>
            <Eyebrow className="mb-[18px]">Sell-side M&amp;A advisory</Eyebrow>
            <h1 className="font-display mb-[22px] text-[clamp(32px,4.8vw,56px)] leading-[1.05] font-normal tracking-[-1.2px]">
              Who we are
            </h1>
            <p className="text-l2 mb-5 text-[16.5px] leading-[1.6]">
              Heirloom represents owners of established private businesses and manages the sale from preparation through
              closing.
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
              <AdvisorCtaButton />
              <TextLink href={ROUTES.howItWorks} className="text-[14px]">
                See how it works →
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
                company, built software at Atlassian, and acquired and operated small businesses through micro-PE.
              </p>
              <p className="text-l2 mb-3.5 text-[14.5px] leading-[1.62]">
                As a buyer, he evaluated earnings, challenged owner adjustments, structured offers, worked with lenders,
                and ran diligence.
              </p>
              <TextLink href={`mailto:${CONTACT.hello}`} className="text-[14px]">
                Email Suyash
              </TextLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 pb-[clamp(56px,7vw,84px)]">
        <Container className="border-hair-2 border-t pt-[34px]">
          <h2 className="font-display mb-2.5 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
            Who does the work
          </h2>
          <p className="text-l2 mb-[22px] max-w-[720px] text-[15px] leading-[1.62]">
            Your lead advisor owns the outcome, with engineers and outside specialists behind the engagement.
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
            You can use your existing professionals, or Heirloom can recommend one.
          </p>
          <h2 className="font-display mb-5 text-[clamp(24px,3vw,32px)] leading-[1.14] font-normal">
            What buy-side experience changes
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
            Where Heirloom fits
          </h2>
          <p className="text-l2 mb-[26px] text-[16.5px] leading-[1.68]">
            Large investment banks rarely take businesses in this size range, and many local brokers rely on public
            listings.
          </p>
          <div className="mb-3.5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <AdvisorCtaButton />
            <TextLink href={ROUTES.howItWorks} className="text-[14px]">
              See how it works →
            </TextLink>
          </div>
        </Container>
      </section>
    </>
  )
}
