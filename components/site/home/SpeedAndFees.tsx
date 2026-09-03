import { Container, KeyValueRow } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { ROUTES } from "@/lib/site/routes"

const SPEED_STEPS = [
  "Prepare before market",
  "Qualify before meetings",
  "Answer from organized records",
  "Run financing and diligence together",
  "Escalate decisions quickly",
]

export function SpeedAndFees() {
  return (
    <section className="border-hair bg-paper border-b px-6 py-[clamp(40px,5vw,64px)]">
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(300px,44%)),1fr))] items-start gap-x-12 gap-y-9">
        <div>
          <div className="mb-[22px]">
            <div className="text-filament-ink mb-3.5 font-mono text-[11.5px] tracking-[1.2px] uppercase">Speed</div>
            <h2 className="font-display mb-3 text-[clamp(26px,3vw,36px)] leading-[1.08] font-normal tracking-[-.7px]">
              Keep the deal moving toward close.
            </h2>
            <p className="text-l2 text-[15px] leading-[1.62]">
              We do the financial work before launch, qualify buyers before they take your time, and coordinate
              diligence, lenders, lawyers, and specialists against one plan. That removes the avoidable delays that
              stretch many sales out.
            </p>
          </div>
          <div className="border-hair-2 mb-5 flex flex-wrap gap-2 border-t pt-[18px]">
            {SPEED_STEPS.map((s, i) => (
              <span
                key={s}
                className="border-hair-2 bg-card inline-flex items-baseline gap-2 rounded-full border px-4 py-[9px]"
              >
                <span className="text-l4 font-mono text-[10px]">0{i + 1}</span>
                <span className="font-display text-[16.5px] leading-[1.2]">{s}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-7 gap-y-2.5">
            <TextLink href={ROUTES.howItWorks} className="text-[14px]">
              See the sale timeline →
            </TextLink>
            <p className="text-l3 max-w-[620px] font-mono text-[11px] leading-[1.6]">
              A well-prepared sale can move from engagement to close in months. The business, buyer financing,
              diligence, and legal work still affect timing.
            </p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <div className="text-filament-ink mb-3.5 font-mono text-[11.5px] tracking-[1.2px] uppercase">Fees</div>
            <h2 className="font-display mb-3 text-[clamp(26px,3vw,36px)] leading-[1.08] font-normal tracking-[-.7px]">
              Keep more of what you built.
            </h2>
            <p className="text-l2 text-[15px] leading-[1.62]">
              Heirloom charges a 5% success fee for a full sale, roughly half the high single-digit or low double-digit
              fees common in this part of the market. The $5,000 engagement commitment is credited in full if the
              business sells.
            </p>
          </div>
          <div className="border-hair-2 bg-card mb-4 overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(12,54,38,.08)]">
            <div className="px-[18px] pt-2 pb-1">
              <KeyValueRow label="Full private sale" className="border-hair border-b py-2.5">
                <span className="font-display text-ink text-[18px]">5% success fee</span>
              </KeyValueRow>
              <KeyValueRow label="Engagement commitment" className="border-hair border-b py-3">
                <span className="text-ink flex-[1_1_200px] text-right text-[14px] leading-[1.5]">
                  $5,000, fully credited at closing
                </span>
              </KeyValueRow>
              <KeyValueRow label="Existing buyer" className="py-3">
                <span className="text-ink flex-[1_1_200px] text-right text-[14px] leading-[1.5]">
                  Free Offer Review, then 2.5% if Heirloom runs the transaction
                </span>
              </KeyValueRow>
            </div>
            <div className="border-hair text-l4 border-t px-[18px] pt-2.5 pb-3 font-mono text-[10.5px] leading-[1.6]">
              Traditional fee schedules vary by deal size and firm. Compare the agreement in front of you.
            </div>
          </div>
          <TextLink href={ROUTES.fees} className="text-[14px]">
            See all fees →
          </TextLink>
        </div>
      </Container>
    </section>
  )
}
