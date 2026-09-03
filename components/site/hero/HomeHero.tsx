import Image from "next/image"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { HeroConsole } from "@/components/site/hero/HeroConsole"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { Button } from "@/components/site/ui/Button"
import { CONTACT, ROUTES } from "@/lib/site/routes"

export function HomeHero() {
  return (
    <section className="border-hair bg-hero-paper text-ink relative flex min-h-[calc(100svh-178px)] flex-col overflow-hidden border-b">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <AmbientVideo
          src="/media/hero-ambient.mp4"
          fadeLoop
          className="absolute inset-0 h-full w-full object-cover opacity-85 saturate-[.9] transition-opacity duration-500"
        />
        <div className="bg-paper/32 absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,250,244,.55)_0%,rgba(250,250,244,.3)_38%,rgba(250,250,244,.08)_70%,rgba(250,250,244,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,244,.5)_0%,rgba(250,250,244,0)_18%,rgba(250,250,244,0)_78%,rgba(250,250,244,.6)_100%)]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-6 pt-[18px] pb-2.5">
        <div className="mx-auto mb-3 max-w-[880px] text-center">
          <div className="text-l3 mb-2.5 font-mono text-[11px] tracking-[1.2px] uppercase">
            Technology-enabled sell-side M&amp;A for established business owners
          </div>
          <h1 className="font-display mb-2.5 text-[clamp(30px,3.8vw,52px)] leading-none font-normal tracking-[-.7px]">
            Sell your business to <em className="text-brand">the right buyer, on the right terms.</em>
          </h1>
          <div className="mx-auto mb-3.5 flex max-w-[760px] flex-wrap items-center justify-center gap-x-3.5 gap-y-2">
            <p className="text-l2 text-[clamp(14px,1.4vw,16px)] leading-[1.5]">
              Heirloom prepares your company, creates competition among qualified buyers, and manages the private sale
              through closing while you keep running the business.
            </p>
            <a
              href={CONTACT.ycombinator}
              target="_blank"
              rel="noopener"
              className="border-hair-2 bg-card/55 text-l3 inline-flex items-center gap-[7px] rounded-full border py-1 pr-[11px] pl-[5px] font-mono text-[10px] tracking-[1px] whitespace-nowrap"
            >
              <Image src="/brand/yc-logo.svg" alt="" width={15} height={15} className="block rounded-[3px]" />
              BACKED BY Y COMBINATOR
            </a>
          </div>
          <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2.5">
            <AdvisorCtaButton size="md" />
            <Button href={ROUTES.howItWorks} variant="outline" size="md" className="px-[18px]">
              See how it works
            </Button>
          </div>
        </div>
        <HeroConsole />
        <div className="border-hair mt-2 flex flex-wrap items-baseline justify-end gap-x-7 gap-y-2.5 border-t pt-2">
          <Button href={ROUTES.buyers} variant="pill-light" size="pill" className="px-3.5">
            Buying a business? Get Heirloom Verified →
          </Button>
        </div>
      </div>
    </section>
  )
}
