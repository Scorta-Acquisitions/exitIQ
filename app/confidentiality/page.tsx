import type { Metadata } from "next"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { DisclosureLevels } from "@/components/site/confidentiality/DisclosureLevels"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { CONFIDENTIALITY_RULES, OWNER_CONTROLS, OWNER_DECIDES } from "@/lib/site/confidentiality/data"
import { padIndex } from "@/lib/site/format"
import { PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = {
  title: PAGE_META.confidentiality.title,
  description: PAGE_META.confidentiality.description,
}

/**
 * Confidentiality: a centered page hero, the disclosure instrument on a dark tile with the NDA note
 * beneath it, the owner's exclusions and limits, the eight rules on parchment, and a private close.
 */
export default function ConfidentialityPage() {
  return (
    <>
      <Tile tone="light">
        <Container size="text" className="text-center">
          <Eyebrow className="mb-4">Who sees what, and when</Eyebrow>
          <h1 className="type-hero text-fg">Confidentiality</h1>
          <p className="type-lead-airy text-fg-2 mt-5">
            Your business is never listed publicly. Buyers learn your name only after signing an NDA. They see detailed
            records only after we have qualified them.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AdvisorCtaButton />
            <Button href="#conf-levels" variant="secondary">
              See the disclosure levels
            </Button>
          </div>
          <p className="type-caption text-fg-3 mt-5">
            Employees, customers, suppliers, and competitors are never contacted without your approval.
          </p>
        </Container>
      </Tile>

      <Tile tone="dark">
        <Container>
          <Eyebrow className="mb-4">Who can see what</Eyebrow>
          <h2 className="type-display-lg text-fg">Six levels of access</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            Names, financials, contracts, and closing documents are released in stages as a buyer signs, qualifies, and
            enters diligence.
          </p>
          <div className="mt-12">
            <DisclosureLevels />
          </div>
          <div className="mt-16 max-w-[692px]">
            <h3 className="type-display-md text-fg">What an NDA can and cannot do</h3>
            <p className="type-body text-fg-2 mt-4">
              An NDA creates a legal duty, but no document guarantees behavior, and serious buyers have to involve their
              lawyers, accountants, and lenders.
            </p>
            <p className="type-body text-fg-2 mt-3">
              Heirloom limits who receives information, records every access, and helps document any breach.
            </p>
          </div>
        </Container>
      </Tile>

      <Tile tone="light" id="exclusions" className="anchor-target">
        <Container>
          <h2 className="type-display-lg text-fg">Your exclusions and limits</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            You approve the buyer categories, named exclusions, and information limits before outreach starts. After
            that, you decide only the exceptions.
          </p>
          <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-12 gap-y-10">
            <div>
              <Eyebrow>You decide up front</Eyebrow>
              <div className="border-line mt-4 border-t">
                {OWNER_DECIDES.map((t) => (
                  <div key={t} className="border-line type-body text-fg border-b py-3">
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Eyebrow>Controls you keep once outreach begins</Eyebrow>
              <div className="border-line mt-4 border-t">
                {OWNER_CONTROLS.map((t) => (
                  <div key={t} className="border-line type-body text-fg border-b py-3">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment" id="rules" className="anchor-target">
        <Container>
          <h2 className="type-display-lg text-fg">Rules</h2>
          <div className="border-line mt-10 border-t">
            {CONFIDENTIALITY_RULES.map((r, i) => (
              <div
                key={r.title}
                className="border-line tab:grid-cols-[44px_minmax(0,1fr)_minmax(0,1.4fr)] grid grid-cols-[44px_minmax(0,1fr)] gap-x-6 gap-y-2 border-b py-6"
              >
                <span className="type-caption text-fg-3 tabular pt-1">{padIndex(i + 1)}</span>
                <h3 className="type-body-strong text-fg">{r.title}</h3>
                <p className="type-body text-fg-2 tab:col-start-auto col-start-2">{r.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="light">
        <Container size="text" className="text-center">
          <h2 className="type-display-md text-fg">Ask a question privately</h2>
          <p className="type-body text-fg-2 mt-4">Ask Suyash a question, or use exitIQ without giving your name.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AdvisorCtaButton />
            <Button href={ROUTES.score} variant="secondary">
              Check sale readiness
            </Button>
          </div>
          <p className="type-caption text-fg-3 mt-5">exitIQ asks for no name, email, or documents.</p>
        </Container>
      </Tile>
    </>
  )
}
