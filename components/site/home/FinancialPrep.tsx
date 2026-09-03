import { Button } from "@/components/site/ui/Button"
import { Container, KeyValueRow } from "@/components/site/ui/primitives"
import { ROUTES } from "@/lib/site/routes"

export function FinancialPrep() {
  return (
    <section className="border-hair bg-paper border-b px-6 py-[clamp(40px,5vw,64px)]">
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,42%)),1fr))] items-center gap-9">
        <div>
          <div className="text-filament-ink mb-3.5 font-mono text-[11.5px] tracking-[1.2px] uppercase">
            Get the numbers straight before buyers see them
          </div>
          <h2 className="font-display mb-3.5 text-[clamp(28px,3.6vw,42px)] leading-[1.06] font-normal tracking-[-.9px]">
            Explain the business once.
          </h2>
          <p className="text-l2 mb-[22px] max-w-[520px] text-[15.5px] leading-[1.62]">
            We compare the books, tax returns, payroll, contracts, and what you tell us. When the records disagree, your
            advisor resolves the conflict and keeps the valuation, buyer materials, lender package, and diligence
            answers consistent.
          </p>
          <Button href={ROUTES.howItWorks} size="md" className="h-11">
            See how Heirloom prepares a business
          </Button>
        </div>
        <div className="border-hair-2 bg-card overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(12,54,38,.08)]">
          <div className="border-hair flex flex-wrap items-baseline justify-between gap-x-3.5 gap-y-1 border-b px-[18px] py-3">
            <span className="text-l3 font-mono text-[11px] tracking-[1px] uppercase">Project Ridgeline</span>
            <span className="text-l4 font-mono text-[10px] tracking-[.5px]">Owner compensation</span>
          </div>
          <div className="px-[18px] pt-1.5 pb-3">
            <KeyValueRow label="Owner explanation" className="border-hair border-b">
              <span className="tabular text-ink font-mono text-[13.5px]">$214,000</span>
            </KeyValueRow>
            <KeyValueRow label="QuickBooks" className="border-hair border-b">
              <span className="tabular text-ink font-mono text-[13.5px]">$186,400</span>
            </KeyValueRow>
            <KeyValueRow label="Tax return" className="border-hair border-b">
              <span className="tabular text-ink font-mono text-[13.5px]">$186,400</span>
            </KeyValueRow>
            <KeyValueRow
              label="Advisor review"
              labelClassName="text-filament-ink"
              className="bg-filament/8 -mx-2 my-[3px] rounded-lg px-2"
            >
              <span className="text-ink flex-[1_1_220px] text-right text-[13px] leading-[1.5]">
                $214,000, including documented family payroll
              </span>
            </KeyValueRow>
            <KeyValueRow label="Used in">
              <span className="text-l2 flex-[1_1_220px] text-right text-[13px] leading-[1.5]">
                Valuation, buyer materials, lender package, and diligence answers
              </span>
            </KeyValueRow>
          </div>
        </div>
      </Container>
    </section>
  )
}
