import Image from "next/image"
import { Button } from "@/components/site/ui/Button"
import { Container } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { CONTACT, ROUTES } from "@/lib/site/routes"

export function FounderPortrait({ radius = 18 }: { radius?: number }) {
  return (
    <div className="bg-paper-2 relative aspect-[4/5] w-full overflow-hidden" style={{ borderRadius: radius }}>
      <Image
        src="/suyash-portrait.jpg"
        alt="Suyash Agrawal, founder and CEO of Heirloom"
        fill
        sizes="(max-width: 720px) 100vw, 400px"
        className="object-cover"
      />
    </div>
  )
}

export function ExperienceAdvisor() {
  return (
    <section className="bg-paper px-6 pb-[clamp(44px,5vw,68px)]">
      <Container className="border-hair grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(260px,36%)),1fr))] items-center gap-10 border-t pt-[clamp(40px,5vw,56px)]">
        <div className="max-w-[400px]">
          <FounderPortrait />
        </div>
        <div>
          <h2 className="font-display mb-3.5 text-[clamp(28px,3.6vw,42px)] leading-[1.06] font-normal tracking-[-.9px]">
            Transaction experience on both sides of the table.
          </h2>
          <p className="text-l2 mb-3 text-[15.5px] leading-[1.62]">
            Heirloom has transacted millions of dollars in enterprise value through the firm.
          </p>
          <p className="text-l2 mb-4 text-[15.5px] leading-[1.62]">
            Separately, before founding Heirloom, <strong className="text-ink font-semibold">Suyash Agrawal</strong>{" "}
            transacted millions of dollars in enterprise value on the buy side as a micro-PE investor and operator. That
            perspective helps us anticipate how buyers test earnings, structure offers, use diligence, and look for room
            to lower the price.
          </p>
          <div className="border-hair-2 mb-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-7 border-t">
            <div className="border-hair border-b py-[13px]">
              <div className="text-l4 mb-[5px] font-mono text-[10.5px] tracking-[1px] uppercase">
                Heirloom experience
              </div>
              <div className="font-display text-[17px] leading-[1.3]">
                Millions in enterprise value transacted through the firm
              </div>
            </div>
            <div className="border-hair border-b py-[13px]">
              <div className="text-l4 mb-[5px] font-mono text-[10.5px] tracking-[1px] uppercase">
                Prior founder experience
              </div>
              <div className="font-display text-[17px] leading-[1.3]">
                Millions in enterprise value transacted on the buy side
              </div>
            </div>
          </div>
          <div className="text-l4 mb-1.5 font-mono text-[11px] tracking-[1px] uppercase">
            One advisor owns the engagement
          </div>
          <p className="text-l2 mb-2 text-[15px] leading-[1.6]">
            <strong className="text-ink font-semibold">Your advisor stays accountable through close.</strong> Founder
            and CEO Suyash Agrawal leads Heirloom’s early seller engagements personally and owns the valuation, buyer
            strategy, negotiation, major decisions, and the relationship through closing.
          </p>
          <p className="text-l2 mb-[18px] text-[15px] leading-[1.6]">
            Engineers and transaction specialists support the work, while Suyash remains the accountable advisor.
          </p>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3">
            <Button href={`mailto:${CONTACT.hello}`} className="text-[14.5px]">
              Email Suyash
            </Button>
            <TextLink href={ROUTES.whoWeAre} className="text-[14px]">
              Meet the firm →
            </TextLink>
            <span className="text-l3 font-mono text-[12px]">{CONTACT.hello}</span>
          </div>
        </div>
      </Container>
    </section>
  )
}
