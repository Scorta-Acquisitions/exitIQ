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
  { title: "We read what you send", body: "A document, email, draft, or notes from a conversation." },
  {
    title: "We separate price from terms",
    body: "Cash, deferred payments, financing, exclusivity, and missing language.",
  },
  {
    title: "You get a written read",
    body: "What you would receive, what could still change, and where you can push back.",
  },
  {
    title: "You decide",
    body: "Keep negotiating yourself, hire Heirloom to run the transaction, or open the sale to other buyers.",
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
            <Eyebrow className="mb-[18px]">Free offer review</Eyebrow>
            <h1 className="font-display mb-[22px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              Know what the offer pays before you sign.
            </h1>
            <p className="text-l2 mb-3.5 max-w-[680px] text-[17.5px] leading-[1.65]">
              Send us the offer. We tell you how much is cash at closing, what is paid later or depends on the buyer’s
              financing, what the exclusivity period commits you to, and which terms are missing.
            </p>
            <div className="mb-3">
              <Button href="#offer-intake">Review my offer</Button>
            </div>
            <p className="text-l3 mb-[30px] font-mono text-[12px] tracking-[.3px]">
              Free and confidential. We do not contact the buyer.
            </p>
            <h2 className="font-display mb-1.5 text-[clamp(22px,2.4vw,28px)] leading-[1.15] font-normal">
              Send the offer
            </h2>
            <p className="text-l2 mb-[18px] max-w-[640px] text-[15px] leading-[1.6]">
              An email, letter of intent, draft agreement, or notes from a conversation are enough.
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
              What the letter of intent leaves open
            </h2>
            <p className="text-l2 mb-[26px] max-w-[620px] text-[15px] leading-[1.55]">
              A fictional letter of intent. The terms below decide what the seller actually receives.
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
          </div>

          <div className="border-hair-2 mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] gap-[34px] border-t pt-[34px]">
            <div>
              <Eyebrow className="mb-3.5">Existing buyer</Eyebrow>
              <h2 className="font-display mb-3.5 text-[clamp(24px,3vw,32px)] leading-[1.14] font-normal">
                If you hire Heirloom after the review
              </h2>
              <p className="text-l2 text-[15px] leading-[1.6]">
                We negotiate the full deal, coordinate diligence and financing, push back on late price cuts, and manage
                the closing.
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
                  Negotiation, diligence and financing coordination, price-cut defense, and closing
                </span>
              </div>
              <TextLink href="#offer-intake" className="mt-3.5 inline-block text-[14px]">
                Review my offer
              </TextLink>
            </div>
          </div>

          <div className="border-hair-2 mt-11 border-t pt-[38px]">
            <h2 className="font-display mb-3 max-w-[680px] text-[clamp(26px,3.6vw,42px)] leading-[1.08] font-normal tracking-[-.8px]">
              Have it reviewed before you sign exclusivity.
            </h2>
            <p className="text-l2 mb-5 max-w-[620px] text-[15.5px] leading-[1.62]">
              Send the document, paste the terms, or tell us what was said.
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-x-[22px] gap-y-3">
              <Button href="#offer-intake">Review my offer</Button>
              <TextLink href={`mailto:${CONTACT.offers}`} className="text-[14.5px]">
                Forward it to {CONTACT.offers}
              </TextLink>
            </div>
            <p className="text-l3 font-mono text-[11.5px]">We do not contact the buyer.</p>
          </div>
        </Container>
      </section>
    </>
  )
}
