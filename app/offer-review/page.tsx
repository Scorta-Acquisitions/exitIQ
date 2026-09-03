import type { Metadata } from "next"
import { OfferIntake, type OfferIntakeMode } from "@/components/site/offer-review/OfferIntake"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, LiveDot } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { CONTACT, PAGE_META } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.offerReview.title, description: PAGE_META.offerReview.description }

const MODES: OfferIntakeMode[] = ["forward", "paste", "verbal"]

function Term({
  label,
  value,
  tone = "d2",
}: {
  label: string
  value: string
  tone?: "d1" | "d2" | "filament" | "signal"
}) {
  const color = { d1: "text-d1", d2: "text-d2", filament: "text-filament", signal: "text-signal" }[tone]
  return (
    <div className="border-dhair-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b py-[9px] last:border-b-0">
      <span className="text-d2 text-[13px]">{label}</span>
      <span className={`font-mono ${tone === "d1" ? "text-[13.5px]" : "text-[12px]"} ${color}`}>{value}</span>
    </div>
  )
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="highlight-term">{children}</span>
}

const AFTER_STEPS = [
  { title: "We read what you have", body: "Document, email, draft, or verbal summary." },
  {
    title: "We separate price from terms",
    body: "Cash, deferred payments, financing, exclusivity, working capital, transition, and missing language.",
  },
  {
    title: "You get the plain-English read",
    body: "What you receive, what could change, what may keep the deal from closing, and where you still have negotiating room.",
  },
  {
    title: "You decide what happens next",
    body: "Keep negotiating yourself, ask Heirloom to run the transaction, or discuss whether a broader private market could produce a stronger outcome.",
  },
]

export default async function OfferReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const requested = typeof params.mode === "string" ? params.mode : undefined
  const initialMode: OfferIntakeMode = MODES.includes(requested as OfferIntakeMode)
    ? (requested as OfferIntakeMode)
    : "forward"

  return (
    <>
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(40px,5vw,64px)]">
        <Container>
          <div className="max-w-[800px]">
            <Eyebrow className="mb-[18px]">Free Offer Review</Eyebrow>
            <h1 className="font-display mb-[22px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              Before you sign, know what the offer really pays.
            </h1>
            <p className="text-l2 mb-3.5 max-w-[680px] text-[17.5px] leading-[1.65]">
              We review cash at closing, money paid later, buyer financing, exclusivity, working capital, transition
              demands, and the terms that are missing. You get a plain-English read of what the offer means and where
              you still have room to negotiate.
            </p>
            <div className="mb-3">
              <Button href="#offer-intake">Review my offer</Button>
            </div>
            <p className="text-l3 mb-[30px] font-mono text-[12px] tracking-[.3px]">
              Free. Confidential. No commitment. We do not contact the buyer during the review.
            </p>
            <h2 className="font-display mb-1.5 text-[clamp(22px,2.4vw,28px)] leading-[1.15] font-normal">
              Send whatever you have.
            </h2>
            <p className="text-l2 mb-[18px] max-w-[640px] text-[15px] leading-[1.6]">
              An email, a letter of intent, a draft agreement, or rough notes from a conversation are all enough to
              begin.
            </p>
            <OfferIntake initialMode={initialMode} />
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 pb-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="border-hair-2 border-t pt-[34px]">
            <Eyebrow className="mb-3.5">Worked example</Eyebrow>
            <h2 className="font-display mb-2 max-w-[620px] text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              The number is only the first line.
            </h2>
            <p className="text-l2 mb-[26px] max-w-[620px] text-[15px] leading-[1.55]">
              This fictional offer shows the phrases that determine what the seller receives, how long the buyer
              controls the process, and what can still change.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(290px,45%)),1fr))] gap-[18px]">
              <div className="bg-card-warm border-hair-2 rounded-2xl border px-[26px] py-6 shadow-[0_24px_60px_rgba(12,54,38,.08)]">
                <div className="border-hair mb-3.5 flex justify-between border-b pb-2.5">
                  <span className="text-l3 font-mono text-[10.5px] tracking-[1.2px] uppercase">
                    Letter of intent · Project Ridgeline
                  </span>
                </div>
                <p className="font-display text-l2 mb-3 text-[16.5px] leading-[1.75]">
                  We propose an enterprise value of <Highlight>$4,650,000</Highlight>, including cash at closing, a
                  seller note, and an earnout based on <Highlight>post-closing performance</Highlight>.
                </p>
                <p className="font-display text-l2 mb-3 text-[16.5px] leading-[1.75]">
                  The proposal is <Highlight>subject to financing</Highlight> and satisfactory diligence during a{" "}
                  <Highlight>90-day exclusivity period</Highlight>.
                </p>
                <p className="font-display text-l2 text-[16.5px] leading-[1.75]">
                  The seller will provide <Highlight>reasonable transition support</Highlight>.
                </p>
              </div>
              <div className="panel-market border-dfull/8 text-d1 relative overflow-hidden rounded-2xl border px-[26px] py-6">
                <div className="border-dhair-2 mb-2 flex justify-between border-b pb-2.5">
                  <span className="text-signal font-mono text-[10.5px] tracking-[1.2px] uppercase">
                    The terms, separated
                  </span>
                  <LiveDot className="h-1.5 w-1.5 animate-none shadow-none" />
                </div>
                <Term label="Headline price" value="$4.65M" tone="d1" />
                <Term label="Cash at closing" value="$3.45M, or 74% of the headline price" tone="filament" />
                <Term
                  label="Seller note"
                  value="Amount, interest rate, security, and repayment terms need confirmation"
                />
                <Term label="Earnout" value="Target and accounting rules are not defined" />
                <Term label="Buyer financing" value="Required, with no lender commitment shown" />
                <Term
                  label="Exclusivity"
                  value="90 days during which the seller cannot negotiate elsewhere"
                  tone="signal"
                />
                <Term label="Transition" value="“Reasonable support” has no hours, duties, or end date" tone="signal" />
                <Term
                  label="Working capital"
                  value="No target is stated, which can change cash received at closing"
                  tone="signal"
                />
              </div>
            </div>
          </div>

          <div className="border-hair-2 mt-11 border-t pt-[34px]">
            <h2 className="font-display mb-5 text-[clamp(24px,3vw,34px)] leading-[1.14] font-normal">
              What happens after you send it
            </h2>
            <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[22px]">
              {AFTER_STEPS.map((s, i) => (
                <div key={s.title}>
                  <div className="text-filament-ink mb-2 font-mono text-[11px]">0{i + 1}</div>
                  <div className="mb-1.5 text-[15px] font-semibold">{s.title}</div>
                  <p className="text-l2 text-[13.5px] leading-[1.6]">{s.body}</p>
                </div>
              ))}
            </div>
            <p className="text-l2 max-w-[640px] text-[14.5px] leading-[1.6]">
              Your review stays between you and Heirloom. We do not contact the buyer unless you hire us and authorize
              that contact.
            </p>
          </div>

          <div className="border-hair-2 mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] gap-[34px] border-t pt-[34px]">
            <div>
              <Eyebrow className="mb-3.5">If you want Heirloom to take it from here</Eyebrow>
              <h2 className="font-display mb-3.5 text-[clamp(24px,3vw,32px)] leading-[1.14] font-normal">
                A buyer is only the beginning of the transaction.
              </h2>
              <p className="text-l2 mb-3.5 text-[15px] leading-[1.6]">
                We negotiate the full deal, coordinate diligence and financing, challenge late price cuts, keep lawyers
                and specialists moving, and carry the transaction through closing.
              </p>
              <p className="text-l2 text-[15px] leading-[1.6]">
                If the offer looks weak or the buyer holds too much negotiating power, we can also discuss opening a
                private competitive process.
              </p>
            </div>
            <div className="self-center">
              <div className="border-hair flex justify-between gap-3.5 border-t py-[11px]">
                <span className="text-l2 text-[14px]">Existing-buyer engagement</span>
                <span className="text-ink font-mono text-[13.5px]">2.5% success fee</span>
              </div>
              <div className="border-hair flex justify-between gap-3.5 border-t py-[11px]">
                <span className="text-l2 text-[14px]">Upfront fee</span>
                <span className="text-ink font-mono text-[13.5px]">$0</span>
              </div>
              <div className="border-hair border-y py-[11px]">
                <span className="text-l4 mb-1.5 block font-mono text-[11px] tracking-[.8px] uppercase">Included</span>
                <span className="text-l2 text-[13.5px] leading-[1.6]">
                  Negotiation, diligence, financing coordination, working-capital and closing terms, late price-cut
                  defense, specialist coordination, and closing management
                </span>
              </div>
              <TextLink href="#offer-intake" className="mt-3.5 inline-block text-[14px]">
                Review my offer first →
              </TextLink>
            </div>
          </div>

          <div className="border-hair-2 mt-11 border-t pt-[38px]">
            <h2 className="font-display mb-3 max-w-[680px] text-[clamp(26px,3.6vw,42px)] leading-[1.08] font-normal tracking-[-.8px]">
              Have the offer reviewed before you sign exclusivity.
            </h2>
            <p className="text-l2 mb-5 max-w-[620px] text-[15.5px] leading-[1.62]">
              Send the document, paste the terms, or tell us what the buyer said. The first review is free and
              confidential.
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-x-[22px] gap-y-3">
              <Button href="#offer-intake">Review my offer</Button>
              <TextLink href={`mailto:${CONTACT.offers}`} className="text-[14.5px]">
                Forward it to {CONTACT.offers}
              </TextLink>
            </div>
            <p className="text-l3 font-mono text-[11.5px]">We do not contact the buyer during the free review.</p>
          </div>
        </Container>
      </section>
    </>
  )
}
