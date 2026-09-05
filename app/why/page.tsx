import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow } from "@/components/site/ui/primitives"
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

export default function WhyPage() {
  return (
    <>
      <section className="panel-hero text-d1 px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(56px,7vw,84px)]">
        <Container>
          <div className="max-w-[860px]">
            <div className="eyebrow text-signal mb-[18px]">Why Heirloom exists</div>
            <h1 className="font-display mb-6 text-[clamp(36px,6vw,72px)] leading-[1.03] font-normal tracking-[-1.6px]">
              The buyer usually has more experience.
            </h1>
            <p className="text-d2 mb-6 text-[17px] leading-[1.6]">
              Professional buyers acquire companies regularly and bring lenders, attorneys, and research with them. The
              owner across from them is usually selling for the first time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href={ROUTES.howItWorks} variant="cta" size="xl">
                See how it works
              </Button>
              <AdvisorCtaButton variant="outline-dark" size="xl" className="px-[22px]" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 py-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="mb-[38px] max-w-[720px]">
            <h2 className="font-display mb-4 text-[clamp(28px,3.8vw,44px)] leading-[1.1] font-normal tracking-[-.9px]">
              How private businesses sell today
            </h2>
            <p className="text-l2 text-[16.5px] leading-[1.68]">
              Most owners either list the business publicly or negotiate with the one buyer who approached them.
            </p>
          </div>
          <div className="border-hair-2 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] border-t">
            {PATHS.map((p, i) => (
              <div
                key={p.title}
                className={`border-hair border-b py-6 ${i === 0 ? "sm:pr-[26px]" : i === PATHS.length - 1 ? "sm:border-l sm:pl-[26px]" : "sm:border-l sm:px-[26px]"}`}
              >
                <div className="text-filament-ink mb-3 font-mono text-[11.5px] tracking-[1px] uppercase">
                  {p.eyebrow}
                </div>
                <div className="font-display mb-2.5 text-[24px] leading-[1.14]">{p.title}</div>
                <p className="text-l2 text-[14.5px] leading-[1.65]">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="border-hair-2 mt-12 border-t pt-[34px]">
            <Eyebrow className="mb-3.5">What we do now</Eyebrow>
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              Seller representation through closing
            </h2>
            <p className="text-l2 mb-[26px] max-w-[680px] text-[15.5px] leading-[1.65]">
              You keep the decisions, the information, and the final choice of buyer.
            </p>
            <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-[30px] gap-y-6">
              {NOW.map((n) => (
                <div key={n.title}>
                  <div className="mb-1.5 text-[15.5px] font-semibold">{n.title}</div>
                  <p className="text-l2 text-[14px] leading-[1.62]">{n.body}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-[22px] gap-y-2.5">
              <TextLink href={ROUTES.howItWorks} className="text-[14px]">
                See how it works →
              </TextLink>
              <TextLink href={ROUTES.fees} className="text-[14px]">
                See fees →
              </TextLink>
              <TextLink href={ROUTES.confidentiality} className="text-[14px]">
                See who can access what
              </TextLink>
            </div>
          </div>

          <div className="border-hair-2 mt-12 border-t pt-[34px]">
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              What Heirloom is building
            </h2>
            <p className="text-l2 mb-6 max-w-[720px] text-[15.5px] leading-[1.65]">
              A sale where the owner, buyers, lenders, and advisors work from the same approved facts, with controlled
              access and nothing explained twice.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-[38px] gap-y-[18px]">
              {LEADS.map((l) => (
                <div key={l.title}>
                  <div className="mb-[3px] text-[14.5px] font-semibold">{l.title}</div>
                  <p className="text-l2 text-[13.5px] leading-[1.6]">{l.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-hair-2 mt-12 max-w-[760px] border-t pt-8">
            <h2 className="font-display mb-3.5 text-[29px] leading-[1.14] font-normal">
              Millions in enterprise value already transacted.
            </h2>
            <p className="text-l2 mb-2.5 text-[15.5px] leading-[1.68]">
              Heirloom has closed sales for owners like you. Our founder, Suyash Agrawal, bought and ran small
              businesses himself before starting the firm, and engineers and transaction specialists back every
              engagement. Your sale is prepared the way a buyer will test it, by people who have been the buyer.
            </p>
            <p className="text-l3 mb-[22px] font-mono text-[11.5px]">
              Firm transactions and Suyash’s earlier buy-side record are separate.
            </p>
            <div className="mb-[30px] flex flex-wrap items-center gap-x-[22px] gap-y-3">
              <AdvisorCtaButton />
              <TextLink href={ROUTES.whoWeAre} className="text-[15px]">
                Who we are
              </TextLink>
            </div>
            <div className="border-hair grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5 border-t pt-6">
              <div>
                <div className="mb-[5px] text-[14.5px] font-semibold">Owners</div>
                <p className="text-l2 mb-1.5 text-[13.5px] leading-[1.6]">
                  See how buyers would read your business today.
                </p>
                <TextLink href={ROUTES.score} className="text-[13.5px]">
                  Check sale readiness
                </TextLink>
              </div>
              <div>
                <div className="mb-[5px] text-[14.5px] font-semibold">Existing offer</div>
                <p className="text-l2 mb-1.5 text-[13.5px] leading-[1.6]">A free read before you sign exclusivity.</p>
                <TextLink href={ROUTES.offerReview} className="text-[13.5px]">
                  Review my offer
                </TextLink>
              </div>
              <div>
                <div className="mb-[5px] text-[14.5px] font-semibold">Buyers</div>
                <p className="text-l2 mb-1.5 text-[13.5px] leading-[1.6]">Create your Buyer Passport.</p>
                <TextLink href={ROUTES.buyers} className="text-[13.5px]">
                  Get Heirloom Verified
                </TextLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
