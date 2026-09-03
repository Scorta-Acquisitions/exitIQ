import Link from "next/link"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { Container } from "@/components/site/ui/primitives"
import { ROUTES } from "@/lib/site/routes"

const CARDS = [
  {
    href: ROUTES.offerReview,
    eyebrow: "Offer in hand",
    title: "Review my offer",
    body: "See what it pays, what is missing, and where the buyer still has room to change the deal.",
  },
  {
    href: ROUTES.score,
    eyebrow: "Still deciding",
    title: "Start exitIQ",
    body: "Answer seven questions and leave with practical findings and a 90-day plan.",
  },
  {
    href: ROUTES.howItWorks,
    eyebrow: "Want the details",
    title: "See how it works",
    body: "Follow the sale from financial preparation through closing.",
  },
]

const cardText = (
  <>
    <div className="text-l4 mb-2.5 font-mono text-[11.5px] tracking-[1px] uppercase">Ready to sell</div>
    <div className="font-display mb-2 text-[24px] leading-[1.16]">Talk to an M&amp;A advisor</div>
    <p className="text-l3 text-[13.5px] leading-[1.55]">
      Find out whether Heirloom is the right firm for your business.
    </p>
  </>
)

export function CloseSection() {
  return (
    <section className="bg-paper px-6 py-[clamp(44px,5vw,72px)]">
      <Container>
        <div className="mb-[26px] max-w-[760px]">
          <h2 className="font-display text-[clamp(32px,4.6vw,54px)] leading-[1.04] font-normal tracking-[-1.1px]">
            Start <em className="text-filament-ink">where you are.</em>
          </h2>
        </div>
        <div className="border-hair-2 grid grid-cols-[repeat(auto-fit,minmax(238px,1fr))] border-t">
          <AdvisorTrigger className="hover-green border-hair block w-full border-b py-[18px] pr-6 text-left">
            {cardText}
          </AdvisorTrigger>
          {CARDS.map((c) => (
            <Link key={c.title} href={c.href} className="border-hair block border-b border-l px-6 py-[18px]">
              <div className="text-l4 mb-2.5 font-mono text-[11.5px] tracking-[1px] uppercase">{c.eyebrow}</div>
              <div className="font-display mb-2 text-[24px] leading-[1.16]">{c.title}</div>
              <p className="text-l3 text-[13.5px] leading-[1.55]">{c.body}</p>
            </Link>
          ))}
        </div>
        <p className="text-l3 mt-4 font-mono text-[11.5px]">No public listing. No obligation to sell.</p>
      </Container>
    </section>
  )
}
