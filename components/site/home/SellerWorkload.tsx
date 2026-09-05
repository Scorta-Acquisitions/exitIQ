import { Container, LiveDot } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { ROUTES } from "@/lib/site/routes"

const YOU_HANDLE = [
  "Explain your goals and the business",
  "Approve the privacy rules and sale materials",
  "Meet the buyers you choose",
  "Select the offer and approve major decisions",
]

const HEIRLOOM_HANDLES = [
  "Organize and reconcile the financials",
  "Build the valuation and sale materials",
  "Research and contact buyers privately",
  "Screen buyers and manage NDAs",
  "Answer routine diligence questions from approved records",
  "Prepare you for buyer meetings",
  "Compare and negotiate offers",
  "Coordinate diligence, financing, lawyers, and closing",
  "Send a weekly update",
]

export function SellerWorkload() {
  const feed = [...HEIRLOOM_HANDLES, ...HEIRLOOM_HANDLES]
  return (
    <section className="border-hair bg-paper border-b px-6 py-[clamp(40px,5vw,64px)]">
      <Container>
        <div className="mb-7 max-w-[720px]">
          <h2 className="font-display mb-3 text-[clamp(28px,3.6vw,42px)] leading-[1.06] font-normal tracking-[-.9px]">
            The whole sale asks four decisions of you.
          </h2>
          <p className="text-l2 text-[15.5px] leading-[1.62]">
            Heirloom handles the preparation, buyer work, negotiation, and closing while you keep running the company.
          </p>
        </div>
        <div className="border-hair-2 bg-card grid grid-cols-1 overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(12,54,38,.08)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="border-hair flex min-h-0 flex-col border-b p-[clamp(14px,2.4vw,22px)] md:border-r md:border-b-0">
            <div className="text-filament-ink mb-3 font-mono text-[11px] tracking-[1px] uppercase">Owner</div>
            <div className="flex flex-col gap-[9px]">
              {YOU_HANDLE.map((t) => (
                <div
                  key={t}
                  className="border-filament-ink/25 bg-filament/14 text-ink rounded-[9px] border px-[11px] py-2 text-[13px] leading-[1.5]"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-h-0 flex-col p-[clamp(14px,2.4vw,22px)]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-l4 font-mono text-[11px] tracking-[1px] uppercase">Heirloom</span>
              <span className="text-filament-ink inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[.8px]">
                <LiveDot className="h-1.5 w-1.5 shadow-[0_0_8px_rgba(76,226,126,.8)]" />
                LIVE
              </span>
            </div>
            <div className="mask-feed max-h-[250px] min-h-[210px] flex-1 overflow-hidden">
              <div className="animate-feed motion-reduce:animate-none" aria-hidden={undefined}>
                {feed.map((t, i) => (
                  <div
                    key={`${t}-${i}`}
                    className="border-hair flex items-baseline gap-2.5 border-b py-[clamp(5px,1.1vh,9px)]"
                    aria-hidden={i >= HEIRLOOM_HANDLES.length ? true : undefined}
                  >
                    <span className="bg-filament-ink h-[5px] w-[5px] flex-none -translate-y-px rounded-full opacity-70" />
                    <span className="text-l2 text-[clamp(10.5px,1.9vh,12.5px)] leading-[1.5]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[18px]">
          <TextLink href={ROUTES.howItWorks} className="text-[14px]">
            See how it works →
          </TextLink>
        </div>
      </Container>
    </section>
  )
}
