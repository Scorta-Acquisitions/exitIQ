import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { Button } from "@/components/site/ui/Button"
import { Card, Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.why.title, description: PAGE_META.why.description }

const PATHS: Array<{ eyebrow: string; title: string; body: string }> = [
  {
    eyebrow: "Marketplace",
    title: "Public listing",
    body: "Employees, customers, and competitors may learn the company is for sale.",
  },
  {
    eyebrow: "Direct offer",
    title: "A single direct buyer",
    body: "The buyer knows there are no competing offers, and the terms reflect that.",
  },
  {
    eyebrow: "Managed sale",
    title: "Heirloom",
    body: "Several qualified buyers make offers privately. One advisor manages the sale to closing.",
  },
]

const NOW: Array<{ title: string; body: string }> = [
  {
    title: "Sellers only",
    body: "We do not buy represented businesses or take a buyer-side fee on them.",
  },
  {
    title: "Private buyer market",
    body: "We research, approach, and qualify buyers privately instead of waiting for an inbound offer.",
  },
  {
    title: "Confidentiality",
    body: "You decide who can know, what they see, and when access expands. Every access is recorded.",
  },
  {
    title: "Prepared financials",
    body: "We reconcile the numbers before buyers and lenders ask.",
  },
  {
    title: "Negotiation through closing",
    body: "We compare what each offer pays, coordinate diligence and financing, and challenge late price cuts.",
  },
  {
    title: "Fees",
    body: "A 5% success fee on a full sale, with the $5,000 engagement commitment credited if the business sells.",
  },
]

const LEADS: Array<{ title: string; body: string }> = [
  {
    title: "One financial record",
    body: "Approved figures stay consistent from preparation through closing.",
  },
  {
    title: "Verified buyers",
    body: "Buyers verify identity, criteria, and capacity once through Buyer Passport.",
  },
  {
    title: "Comparable offers",
    body: "Price, cash at closing, financing, and closing risk in one view.",
  },
  {
    title: "Shared closing record",
    body: "Diligence, financing, and legal work run from one record with access rules.",
  },
]

const NEXT_STEPS: Array<{ title: string; body: string; href: string; label: string }> = [
  {
    title: "Owners",
    body: "See how buyers would read your business today.",
    href: ROUTES.score,
    label: "Check sale readiness",
  },
  {
    title: "Existing offer",
    body: "A free read before you sign exclusivity.",
    href: ROUTES.offerReview,
    label: "Review my offer",
  },
  {
    title: "Buyers",
    body: "Create your Buyer Passport.",
    href: ROUTES.buyers,
    label: "Get Heirloom Verified",
  },
]

export default function WhyPage() {
  return (
    <>
      {/* The page opens dark: the environment an owner sells into, before the firm's answer. */}
      <Tile tone="dark">
        <Container size="text" className="text-center">
          <Eyebrow className="mb-4">Why Heirloom exists</Eyebrow>
          <h1 className="type-hero text-fg">The buyer usually has more experience.</h1>
          <p className="type-lead-airy text-fg-2 mt-5">
            Professional buyers acquire companies regularly and bring lenders, attorneys, and research with them. The
            owner across from them is usually selling for the first time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.howItWorks} variant="secondary">
              See how it works
            </Button>
          </div>
        </Container>
      </Tile>

      <Tile tone="light" id="today" className="anchor-target">
        <Container>
          <h2 className="type-display-lg text-fg">How private businesses sell today</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            Most owners either list the business publicly or negotiate with the one buyer who approached them.
          </p>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6">
            {PATHS.map((p) => (
              <Card key={p.title}>
                <Eyebrow tone="accent">{p.eyebrow}</Eyebrow>
                <div className="type-tagline text-fg mt-3">{p.title}</div>
                <p className="type-body text-fg-2 mt-2">{p.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment" id="what-we-do" className="anchor-target">
        <Container>
          <Eyebrow className="mb-4">What we do now</Eyebrow>
          <h2 className="type-display-lg text-fg">Seller representation through closing</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            You keep the decisions, the information, and the final choice of buyer.
          </p>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-8 gap-y-8">
            {NOW.map((n) => (
              <div key={n.title} className="border-line border-t pt-4">
                <div className="type-body-strong text-fg">{n.title}</div>
                <p className="type-body text-fg-2 mt-2">{n.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <TextLink href={ROUTES.howItWorks} standalone>
              See how it works →
            </TextLink>
            <TextLink href={ROUTES.fees} standalone>
              See fees →
            </TextLink>
            <TextLink href={ROUTES.confidentiality} standalone>
              See who can access what
            </TextLink>
          </div>
        </Container>
      </Tile>

      <Tile tone="light" id="building" className="anchor-target">
        <Container>
          <h2 className="type-display-lg text-fg">What Heirloom is building</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            A sale where the owner, buyers, lenders, and advisors work from the same approved facts, with controlled
            access and nothing explained twice.
          </p>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-8 gap-y-8">
            {LEADS.map((l) => (
              <div key={l.title} className="border-line border-t pt-4">
                <div className="type-body-strong text-fg">{l.title}</div>
                <p className="type-body text-fg-2 mt-2">{l.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container>
          <h2 className="type-display-lg text-fg">Millions in enterprise value already transacted.</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            Heirloom has closed sales for owners like you. Our founder, Suyash Agrawal, bought and ran small businesses
            himself before starting the firm, and engineers and transaction specialists back every engagement. Your sale
            is prepared the way a buyer will test it, by people who have been the buyer.
          </p>
          <p className="type-caption text-fg-3 mt-3 max-w-[692px]">
            Firm transactions and Suyash’s earlier buy-side record are separate.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <AdvisorCtaButton />
            <TextLink href={ROUTES.whoWeAre} standalone>
              Who we are
            </TextLink>
          </div>
        </Container>
      </Tile>

      {/* The page closes dark, as it opened: three next steps, each with its own link. */}
      <Tile tone="dark">
        <Container>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-6">
            {NEXT_STEPS.map((s) => (
              <Card key={s.title}>
                <div className="type-tagline text-fg">{s.title}</div>
                <p className="type-body text-fg-2 mt-2">{s.body}</p>
                <TextLink href={s.href} className="mt-4 inline-block">
                  {s.label}
                </TextLink>
              </Card>
            ))}
          </div>
        </Container>
      </Tile>
    </>
  )
}
