import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { DisclosureLevels } from "@/components/site/confidentiality/DisclosureLevels"
import { Button } from "@/components/site/ui/Button"
import { Container } from "@/components/site/ui/primitives"
import { CONFIDENTIALITY_RULES, OWNER_CONTROLS, OWNER_DECIDES } from "@/lib/site/confidentiality/data"
import { padIndex } from "@/lib/site/format"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = {
  title: PAGE_META.confidentiality.title,
  description: PAGE_META.confidentiality.description,
}

export default function ConfidentialityPage() {
  return (
    <>
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(40px,5vw,60px)]">
        <Container>
          <div className="max-w-[820px]">
            <h1 className="font-display mb-[22px] text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              Confidentiality
            </h1>
            <p className="text-l2 mb-[22px] text-[17px] leading-[1.6]">
              Your business is never listed publicly. Buyers learn your name only after signing an NDA. They see
              detailed records only after we have qualified them.
            </p>
            <div className="mb-3.5 flex flex-wrap gap-3">
              <AdvisorCtaButton />
              <Button href="#conf-levels" variant="outline-plain" className="px-5">
                See the disclosure levels
              </Button>
            </div>
            <p className="text-l3 font-mono text-[11.5px]">
              Employees, customers, suppliers, and competitors are never contacted without your approval.
            </p>
          </div>
        </Container>
      </section>

      <section className="aurora panel-market text-d1 relative overflow-hidden px-6 py-[clamp(56px,7vw,90px)]">
        <Container>
          <div className="mb-[34px] max-w-[780px]">
            <div className="eyebrow text-signal mb-4">Who can see what</div>
            <h2 className="font-display text-d1 mb-4 text-[clamp(28px,4vw,46px)] leading-[1.08] font-normal tracking-[-.9px]">
              Six levels of access
            </h2>
            <p className="text-d2 mb-2.5 text-[16.5px] leading-[1.68]">
              Names, financials, contracts, and closing documents are released in stages as a buyer signs, qualifies,
              and enters diligence.
            </p>
          </div>
          <DisclosureLevels />
          <div className="border-dhair-2 mt-[34px] max-w-[760px] border-t pt-[26px]">
            <h3 className="font-display text-d1 mb-3.5 text-[28px] leading-[1.14] font-normal">
              What an NDA can and cannot do
            </h3>
            <p className="text-d2 mb-3 text-[15.5px] leading-[1.68]">
              An NDA creates a legal duty, but no document guarantees behavior, and serious buyers have to involve their
              lawyers, accountants, and lenders.
            </p>
            <p className="text-d2 text-[15.5px] leading-[1.68]">
              Heirloom limits who receives information, records every access, and helps document any breach.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 pt-[clamp(48px,6vw,72px)]">
        <Container>
          <div className="mb-7 max-w-[760px]">
            <h2 className="font-display mb-3 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
              Your exclusions and limits
            </h2>
            <p className="text-l2 text-[16px] leading-[1.65]">
              You approve the buyer categories, named exclusions, and information limits before outreach starts. After
              that, you decide only the exceptions.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,44%)),1fr))] gap-9">
            <div>
              <div className="text-l4 mb-2 font-mono text-[11.5px] tracking-[1px] uppercase">You decide up front</div>
              <div className="flex flex-col">
                {OWNER_DECIDES.map((t, i) => (
                  <div
                    key={t}
                    className={`border-hair text-l2 border-t py-3 text-[15px] ${i === OWNER_DECIDES.length - 1 ? "border-b" : ""}`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-l4 mb-3 font-mono text-[11.5px] tracking-[1px] uppercase">
                Controls you keep once outreach begins
              </div>
              <div className="mb-3.5 flex flex-wrap gap-2">
                {OWNER_CONTROLS.map((t) => (
                  <span
                    key={t}
                    className="border-hair-2 text-l2 rounded-full border px-[13px] py-[7px] font-mono text-[11.5px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper px-6 pb-[clamp(56px,7vw,84px)]">
        <Container className="border-hair-2 border-t">
          <h2 className="font-display mt-[30px] mb-2 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-normal tracking-[-.7px]">
            Rules
          </h2>
          {CONFIDENTIALITY_RULES.map((r, i) => (
            <div key={r.title} className="border-hair flex flex-wrap items-start gap-x-5 gap-y-2.5 border-b py-6">
              <span className="text-l4 flex-[0_0_44px] pt-1 font-mono text-[12px]">{padIndex(i + 1)}</span>
              <h3 className="flex-[1_1_230px] text-[17px] leading-[1.4] font-semibold">{r.title}</h3>
              <p className="text-l2 flex-[3_1_330px] text-[15.5px] leading-[1.65]">{r.body}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="border-hair bg-paper-2 border-t px-6 py-[clamp(48px,6vw,72px)]">
        <Container className="max-w-[760px]">
          <h2 className="font-display mb-3 text-[clamp(28px,3.8vw,42px)] leading-[1.1] font-normal tracking-[-.9px]">
            Ask a question privately
          </h2>
          <p className="text-l2 mb-5 text-[15.5px] leading-[1.6]">
            Ask Suyash a question, or use exitIQ without giving your name.
          </p>
          <div className="mb-3.5 flex flex-wrap gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.score} variant="outline-plain" className="px-5">
              Check sale readiness
            </Button>
          </div>
          <p className="text-l3 font-mono text-[11.5px]">exitIQ asks for no name, email, or documents.</p>
        </Container>
      </section>
    </>
  )
}
