import type { Metadata } from "next"
import { BuyerRegisterForm } from "@/components/site/buyers/BuyerRegisterForm"
import { PassportTiers } from "@/components/site/buyers/PassportTiers"
import { Button } from "@/components/site/ui/Button"
import { Container } from "@/components/site/ui/primitives"
import { BUYER_QUESTIONS, PASSPORT_BENEFITS } from "@/lib/site/buyers/passport"
import { PAGE_META } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.buyers.title, description: PAGE_META.buyers.description }

export default function BuyersPage() {
  return (
    <>
      <section className="panel-hero text-d1 px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(48px,6vw,72px)]">
        <Container>
          <div className="mb-[38px] max-w-[820px]">
            <div className="eyebrow text-signal mb-[18px]">Buyer Passport</div>
            <h1 className="font-display mb-[22px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              Prove you are ready to close.
            </h1>
            <p className="text-d2 mb-[18px] max-w-[660px] text-[17.5px] leading-[1.6]">
              Buyer Passport gives sellers a verified view of who you are, what you buy, and the acquisition range you
              can support. Complete the checks once, keep them current, and share only the details you choose.
            </p>
            <p className="text-d3 mb-7 font-mono text-[12px] tracking-[.4px]">
              Private by default. Capacity is shown as a range. Heirloom represents sellers; Buyer Passport verifies
              buyers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="#buyer-register" variant="cta" size="xl">
                Get Heirloom Verified
              </Button>
              <Button href="#buyer-register" variant="outline-dark" size="xl" className="px-[22px]">
                Register my criteria
              </Button>
            </div>
          </div>
          <div className="mb-[34px]">
            <h2 className="font-display text-d1 mb-[18px] text-[clamp(24px,3vw,34px)] leading-[1.14] font-normal">
              Spend less time proving the same facts.
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
              {PASSPORT_BENEFITS.map((b) => (
                <div key={b.title}>
                  <div className="text-d1 mb-[5px] text-[14.5px] font-semibold">{b.title}</div>
                  <p className="text-d3 text-[13px] leading-[1.6]">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
          <PassportTiers />
        </Container>
      </section>

      <section className="bg-paper px-6 py-[clamp(56px,7vw,84px)]">
        <Container>
          <div className="mb-8 max-w-[760px]">
            <h2 className="font-display mb-4 text-[clamp(28px,3.8vw,44px)] leading-[1.1] font-normal tracking-[-.9px]">
              What sellers need before sharing a name
            </h2>
            <p className="text-l2 text-[16.5px] leading-[1.6]">
              Expect to sign an NDA and explain how you plan to finance the transaction. Deeper access requires a
              current view of your identity, acquisition criteria, and ability to close.
            </p>
          </div>
          <div className="border-hair-2 bg-card mb-[34px] max-w-[820px] rounded-[14px] border px-[26px] py-6">
            <div className="text-l4 mb-4 font-mono text-[11.5px] tracking-[1px] uppercase">Questions buyers answer</div>
            <div className="flex flex-col gap-3.5">
              {BUYER_QUESTIONS.map((q, i) => (
                <div key={q} className="grid grid-cols-[30px_1fr] gap-3">
                  <span className="text-filament-ink font-mono text-[12px]">0{i + 1}</span>
                  <span className="text-[16px] leading-[1.55]">{q}</span>
                </div>
              ))}
            </div>
            <p className="text-l3 mt-3.5 font-mono text-[11px]">
              Answers may be shared with the seller and checked against available records.
            </p>
          </div>
          <div id="buyer-register" className="border-hair-2 [scroll-margin-top:90px] border-t pt-[34px]">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,45%)),1fr))] gap-9">
              <div>
                <h2 className="font-display mb-3.5 text-[32px] leading-[1.12] font-normal">Tell us what you buy.</h2>
                <p className="text-l2 mb-3 text-[15.5px] leading-[1.6]">
                  About three minutes. We contact you only when a relevant opportunity or verification step requires it.
                </p>
                <p className="text-l3 font-mono text-[12px]">
                  Your criteria are not shared with other buyers. No newsletter.
                </p>
              </div>
              <BuyerRegisterForm />
            </div>
          </div>
          <div className="border-hair-2 mt-11 max-w-[760px] border-t pt-[34px]">
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              Ready buyers should be easy to recognize.
            </h2>
            <p className="text-l2 mb-5 text-[15.5px] leading-[1.6]">
              Complete Buyer Passport once, keep it current, and give sellers the facts they need to move you forward.
            </p>
            <div className="mb-3.5 flex flex-wrap gap-3">
              <Button href="#buyer-register">Get Heirloom Verified</Button>
              <Button href="#buyer-register" variant="outline-plain" className="px-5">
                Register my criteria
              </Button>
            </div>
            <p className="text-l3 font-mono text-[11.5px]">Buyer Passport is private by default and currently free.</p>
          </div>
        </Container>
      </section>
    </>
  )
}
