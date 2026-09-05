// use client: the reconciliation example toggles between open and resolved
"use client"

import { useState } from "react"
import { Button } from "@/components/site/ui/Button"
import { Container } from "@/components/site/ui/primitives"

const RECORDS: Array<{ name: string; note: string; value: string }> = [
  { name: "Books", note: "QuickBooks · officer compensation", value: "$186,400" },
  { name: "Payroll", note: "Payroll register, including a family member with no recorded hours", value: "$214,000" },
  { name: "Tax return", note: "Filed return, provided by the accountant", value: "$186,400" },
  { name: "Owner explanation", note: "Working conversation, March", value: "$214,000" },
]

export function BusinessBrain() {
  const [resolved, setResolved] = useState(false)
  const prop = `tabular font-mono text-[15px] transition-colors duration-[600ms] ease-e1 ${resolved ? "text-filament" : "text-dfull/72"}`
  const rows: Array<[string, string]> = [
    ["Owner compensation adjustment", resolved ? "$27,600, documented" : "On hold"],
    ["Adjusted earnings", resolved ? "$845,000" : "$817,400"],
    ["Valuation", resolved ? "$2.96M – $3.49M" : "$2.86M – $3.38M"],
    ["Buyer materials", resolved ? "Updated" : "On hold"],
    ["Lender package", resolved ? "Updated" : "On hold"],
    ["Diligence answers", resolved ? "Updated" : "On hold"],
  ]

  return (
    <section className="aurora panel-market text-d1 relative overflow-hidden px-6 py-[clamp(56px,7vw,90px)]">
      <Container>
        <div className="relative mb-[34px] max-w-[760px]">
          <h2 className="font-display text-d1 mb-4 text-[clamp(28px,4vw,46px)] leading-[1.08] font-normal tracking-[-.9px]">
            Financial preparation
          </h2>
          <p className="text-d2 mb-2.5 text-[16.5px] leading-[1.68]">
            The books, payroll, tax return, and your own explanation often disagree. Your advisor records the resolution
            and the evidence for it, and every buyer document, lender package, and diligence answer uses that figure.
          </p>
        </div>
        <div
          className="border-dhair overflow-hidden rounded-[18px] border bg-[rgba(3,12,8,.5)]"
          data-testid="business-brain"
        >
          <div className="border-dhair-2 flex flex-wrap items-center justify-between gap-3 border-b px-[22px] py-[18px]">
            <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">
              Owner compensation · Project Ridgeline
            </span>
            <span
              className={
                resolved
                  ? "bg-filament text-ground-deep rounded-full px-[11px] py-[5px] font-mono text-[11.5px] tracking-[.9px] uppercase"
                  : "border-signal/45 text-signal rounded-full border px-[11px] py-1 font-mono text-[11.5px] tracking-[.9px] uppercase"
              }
              data-testid="brain-status"
            >
              {resolved ? "Resolved by the advisor" : "Advisor review required"}
            </span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))]">
            <div className="border-dhair-2 border-r p-[22px]">
              <div className="text-d4 mb-3.5 font-mono text-[11.5px] tracking-[1px] uppercase">
                The records disagree
              </div>
              {RECORDS.map((r) => (
                <div key={r.name} className="border-dhair-2 grid grid-cols-[1fr_auto] gap-2.5 border-b py-[11px]">
                  <div>
                    <div className="text-d1 text-[14px]">{r.name}</div>
                    <div className="text-d4 mt-[3px] font-mono text-[11px]">{r.note}</div>
                  </div>
                  <span className="tabular text-d2 font-mono text-[14px]">{r.value}</span>
                </div>
              ))}
              {!resolved ? (
                <div className="border-signal/40 bg-signal/[7%] mt-[18px] rounded-xl border px-4 py-[15px]">
                  <div className="text-signal mb-2 font-mono text-[11.5px] tracking-[1px] uppercase">
                    Advisor review required
                  </div>
                  <Button variant="cta" size="md" className="h-10 px-[18px]" onClick={() => setResolved(true)}>
                    Show the resolution →
                  </Button>
                </div>
              ) : (
                <div className="border-filament/40 bg-filament/[7%] mt-[18px] rounded-xl border px-4 py-[15px]">
                  <div className="text-signal mb-2 font-mono text-[11.5px] tracking-[1px] uppercase">
                    Resolution, recorded with support
                  </div>
                  <p className="text-d2 mb-2.5 text-[13.5px] leading-[1.62]">
                    $214,000, including $27,600 of documented family payroll with no recorded hours.
                  </p>
                  <p className="text-signal mb-2.5 font-mono text-[11px]">
                    Support: Payroll register and tax return attached
                  </p>
                  <button
                    type="button"
                    onClick={() => setResolved(false)}
                    className="border-dhair text-d3 border-b pb-0.5 font-mono text-[11.5px]"
                  >
                    Reset example
                  </button>
                </div>
              )}
            </div>
            <div className="p-[22px]">
              <div className="text-d4 mb-3.5 font-mono text-[11.5px] tracking-[1px] uppercase">Updated in</div>
              {rows.map(([label, value]) => (
                <div key={label} className="border-dhair-2 grid grid-cols-[1fr_auto] gap-2.5 border-b py-3">
                  <span className="text-d2 text-[14px]">{label}</span>
                  <span className={prop}>{value}</span>
                </div>
              ))}
              <div className="pt-3.5">
                <div className="text-d4 mb-2 font-mono text-[11.5px] tracking-[1px] uppercase">
                  Buyer question: Why is owner compensation adjusted to $214,000?
                </div>
                {!resolved ? (
                  <div className="border-dhair-2 bg-dfull/[2.5%] rounded-[10px] border px-[15px] py-[13px]">
                    <p className="text-d3 text-[13.5px] leading-[1.62]">
                      <em>Advisor review required.</em>
                    </p>
                  </div>
                ) : (
                  <div className="border-filament/30 bg-filament/5 rounded-[10px] border px-[15px] py-[13px]">
                    <p className="text-d2 mb-2 text-[13.5px] leading-[1.62]">
                      &quot;The tax return reports $186,400 of officer compensation. Payroll records show another
                      $27,600 paid to a family member with no recorded hours. Both amounts are included in the
                      adjustment, with the payroll lines attached for review.&quot;
                    </p>
                    <div className="text-filament font-mono text-[11px]">
                      Support: payroll register and tax return attached
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
