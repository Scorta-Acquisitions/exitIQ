import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
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
      {/* Hero: the firm alone. Centered on phones like every other page hero; left-aligned from the desktop breakpoint. */}
      <Tile tone="light">
        <Container className="desk:text-left text-center">
          <Eyebrow className="mb-4">Sell-side M&amp;A advisory</Eyebrow>
          <h1 className="type-hero text-fg">Who we are</h1>
          <p className="type-lead-airy text-fg-2 desk:mx-0 mx-auto mt-5 max-w-[692px]">
            Heirloom represents owners of established private businesses and manages the sale from preparation through
            closing.
          </p>
          {/* The facts stay left-aligned as a record. */}
          <dl className="border-line mt-8 max-w-[692px] border-t text-left">
            {FACTS.map(([k, v]) => (
              <div
                key={k}
                className="border-line lphone:grid-cols-[minmax(0,180px)_minmax(0,1fr)] grid items-baseline gap-x-6 gap-y-1 border-b py-3"
              >
                <dt className="type-caption text-fg-3">{k}</dt>
                <dd className="type-body text-fg m-0">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="desk:justify-start mt-8 flex flex-wrap justify-center gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.howItWorks} variant="secondary">
              See how it works →
            </Button>
          </div>
        </Container>
      </Tile>

      {/* The founder: portrait beside the bio from the desktop breakpoint, stacked below it. */}
      <Tile tone="parchment" id="founder" className="anchor-target">
        <Container className="desk:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] grid items-center gap-x-12 gap-y-8">
          <div className="desk:max-w-none max-w-[440px]">
            <FounderPortrait />
          </div>
          <div>
            <Eyebrow>Founder and CEO</Eyebrow>
            <h2 className="type-display-md text-fg mt-2">Suyash Agrawal</h2>
            <p className="type-body text-fg-2 mt-4">
              Suyash leads Heirloom’s early seller engagements personally. Before Heirloom, he founded and sold a
              company, built software at Atlassian, and acquired and operated small businesses through micro-PE.
            </p>
            <p className="type-body text-fg-2 mt-3">
              As a buyer, he evaluated earnings, challenged owner adjustments, structured offers, worked with lenders,
              and ran diligence.
            </p>
            <TextLink href={`mailto:${CONTACT.hello}`} standalone className="mt-3">
              Email Suyash
            </TextLink>
          </div>
        </Container>
      </Tile>

      <Tile tone="light" id="the-work" className="anchor-target">
        <Container>
          <h2 className="type-display-lg text-fg">Who does the work</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            Your lead advisor owns the outcome, with engineers and outside specialists behind the engagement.
          </p>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-8 gap-y-8">
            {BENCH.map((b) => (
              <div key={b.title} className="border-line border-t pt-4">
                <div className="type-body-strong text-fg">{b.title}</div>
                <p className="type-body text-fg-2 mt-2">{b.body}</p>
              </div>
            ))}
          </div>
          <p className="type-caption text-fg-3 mt-8">
            You can use your existing professionals, or Heirloom can recommend one.
          </p>

          <h2 className="type-display-md text-fg mt-20">What buy-side experience changes</h2>
          {/* Stacked record rows, mirroring the hero facts, so five titles never fight for one row. */}
          <div className="border-line mt-8 border-t">
            {CHANGES.map((c) => (
              <div
                key={c.title}
                className="border-line lphone:grid-cols-[minmax(0,260px)_minmax(0,1fr)] grid items-baseline gap-x-8 gap-y-1 border-b py-4"
              >
                <div className="type-body-strong text-fg">{c.title}</div>
                <p className="type-body text-fg-2 m-0">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="dark">
        <Container>
          <h2 className="type-display-lg text-fg">Where Heirloom fits</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            Large investment banks rarely take businesses in this size range, and many local brokers rely on public
            listings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.howItWorks} variant="secondary">
              See how it works →
            </Button>
          </div>
        </Container>
      </Tile>
    </>
  )
}
