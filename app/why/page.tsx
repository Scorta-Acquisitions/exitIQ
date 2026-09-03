import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { CONTACT, PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.why.title, description: PAGE_META.why.description }

const PATHS: Array<{ eyebrow: string; title: string; body: string }> = [
  {
    eyebrow: "Public listing",
    title: "Broad exposure",
    body: "A listing can reach buyers, but employees, customers, and competitors may learn the company is for sale.",
  },
  {
    eyebrow: "One direct buyer",
    title: "No market test",
    body: "One buyer sets the price, the pace, and the terms, with nothing pushing any of them in your favor.",
  },
  {
    eyebrow: "Heirloom sale process",
    title: "A private market, fully managed",
    body: "A controlled buyer market, prepared financials, qualified outreach, offer comparison, negotiation, diligence, and closing under one accountable advisor.",
  },
]

const NOW: Array<{ title: string; body: string }> = [
  {
    title: "Your advisor works for you",
    body: "Heirloom represents the seller only. We do not buy represented businesses or take a buyer-side fee on them.",
  },
  {
    title: "A buyer market built around your business",
    body: "We research, approach, and qualify credible buyers privately instead of waiting for one inbound offer.",
  },
  {
    title: "Confidentiality you control",
    body: "You decide who can know, what they can see, and when access expands. Every material access event is recorded.",
  },
  {
    title: "Financials ready for scrutiny",
    body: "We reconcile the numbers and prepare the evidence before buyers and lenders begin asking questions.",
  },
  {
    title: "Negotiation carried through closing",
    body: "We compare what each offer actually pays, negotiate terms, coordinate diligence and financing, and challenge late price cuts on the way to close.",
  },
  {
    title: "A materially lower fee",
    body: "The full private sale carries a 5% success fee, with the $5,000 engagement commitment credited in full if the business sells.",
  },
]

const LEADS: Array<{ title: string; body: string }> = [
  {
    title: "Explain the business once",
    body: "Financials, records, and approved answers stay consistent from preparation through closing.",
  },
  {
    title: "Prove buyer readiness once",
    body: "Credible buyers can verify who they are, what they seek, and their ability to pursue a transaction.",
  },
  {
    title: "Keep every offer comparable",
    body: "Price, cash at close, financing, contingencies, and execution risk can be evaluated in one view.",
  },
  {
    title: "Carry the record through closing",
    body: "The people responsible for diligence, financing, legal work, and close can work from an organized record with clear access rules.",
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
              Owners deserve the same deal discipline as buyers.
            </h1>
            <p className="text-d2 mb-6 text-[17px] leading-[1.6]">
              Professional buyers have research, lenders, attorneys, data, and years of transaction experience. Most
              owners sell one company once. Heirloom gives the owner a prepared, private, competitive sale process from
              the first decision through closing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href={ROUTES.howItWorks} variant="cta" size="xl">
                See how Heirloom works
              </Button>
              <AdvisorCtaButton variant="outline-dark" size="xl" className="px-[22px]">
                Talk to Suyash
              </AdvisorCtaButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 py-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="mb-[38px] max-w-[720px]">
            <Eyebrow className="mb-4">The seller side has fallen behind</Eyebrow>
            <h2 className="font-display mb-4 text-[clamp(28px,3.8vw,44px)] leading-[1.1] font-normal tracking-[-.9px]">
              Selling privately should not mean selling alone.
            </h2>
            <p className="text-l2 text-[16.5px] leading-[1.68]">
              A public listing can expose the business. A direct offer leaves one buyer in control of the negotiation. A
              traditional process can be slow, expensive, and hard to follow. Owners need private buyer competition with
              a capable advisor running the transaction.
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
              Heirloom represents owners through the entire sale.
            </h2>
            <p className="text-l2 mb-[26px] max-w-[680px] text-[15.5px] leading-[1.65]">
              One advisor owns the process from preparation through closing. The owner keeps control of the decisions,
              the information, and the final choice of buyer.
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
                See the full sale process →
              </TextLink>
              <TextLink href={ROUTES.fees} className="text-[14px]">
                Compare the fees →
              </TextLink>
              <TextLink href={ROUTES.confidentiality} className="text-[14px]">
                See our confidentiality controls →
              </TextLink>
            </div>
          </div>

          <div className="border-hair-2 mt-12 border-t pt-[34px]">
            <Eyebrow className="mb-3.5">Where this can lead</Eyebrow>
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              One shared record from preparation through closing.
            </h2>
            <p className="text-l2 mb-6 max-w-[720px] text-[15.5px] leading-[1.65]">
              Every sale brings owners, buyers, lenders, accountants, attorneys, and specialists into the same
              transaction. Heirloom is building toward a process where each approved person works from the same facts,
              access stays controlled, and progress does not depend on scattered files or repeated explanations.
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
              Experience from the buyer’s chair, working for sellers.
            </h2>
            <p className="text-l2 mb-2.5 text-[15.5px] leading-[1.68]">
              Heirloom has transacted millions of dollars in enterprise value through the firm. Founder and CEO Suyash
              Agrawal separately transacted millions of dollars in enterprise value on the buy side through prior
              micro-PE investing and operations. He now brings that buyer’s perspective to owners, with direct support
              from engineers and transaction specialists.
            </p>
            <p className="text-l3 mb-[22px] font-mono text-[11.5px]">
              Heirloom firm transactions and Suyash’s prior buy-side transactions are separate records.
            </p>
            <div className="mb-[30px] flex flex-wrap items-center gap-x-[22px] gap-y-3">
              <AdvisorCtaButton>Talk to Suyash</AdvisorCtaButton>
              <TextLink href={ROUTES.whoWeAre} className="text-[15px]">
                Read who we are →
              </TextLink>
            </div>
            <div className="border-hair grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5 border-t pt-6">
              <div>
                <div className="mb-[5px] text-[14.5px] font-semibold">
                  Own a business with $1 million or more in annual revenue?
                </div>
                <p className="text-l2 mb-1.5 text-[13.5px] leading-[1.6]">Check how buyers would read it today.</p>
                <TextLink href={ROUTES.score} className="text-[13.5px]">
                  Check my business →
                </TextLink>
              </div>
              <div>
                <div className="mb-[5px] text-[14.5px] font-semibold">Already have a buyer or offer?</div>
                <p className="text-l2 mb-1.5 text-[13.5px] leading-[1.6]">
                  Get a free review before you sign exclusivity or agree to terms.
                </p>
                <TextLink href={ROUTES.offerReview} className="text-[13.5px]">
                  Review my offer →
                </TextLink>
              </div>
              <div>
                <div className="mb-[5px] text-[14.5px] font-semibold">Looking to acquire a business?</div>
                <p className="text-l2 mb-1.5 text-[13.5px] leading-[1.6]">Create your Buyer Passport.</p>
                <TextLink href={ROUTES.buyers} className="text-[13.5px]">
                  Get Heirloom Verified →
                </TextLink>
              </div>
            </div>
            <p className="text-l3 mt-5 font-mono text-[12px]">
              General contact:{" "}
              <a href={`mailto:${CONTACT.hello}`} className="text-filament-ink">
                {CONTACT.hello}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
