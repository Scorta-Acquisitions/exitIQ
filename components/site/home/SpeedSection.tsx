import { Container } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { SPEED_COMPARISON, SPEED_RANGE, SPEED_STEPS } from "@/lib/site/content/speed"
import { padIndex } from "@/lib/site/format"
import { ROUTES } from "@/lib/site/routes"

export function SpeedSection() {
  return (
    <section className="border-hair bg-paper border-b px-6 py-[clamp(44px,5.5vw,72px)]" data-testid="speed-section">
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-end gap-x-12 gap-y-9">
        <div>
          <div className="text-filament-ink mb-3.5 font-mono text-[11.5px] tracking-[1.2px] uppercase">Speed</div>
          <h2 className="font-display mb-4 font-normal">
            <span
              className="tabular text-brand block text-[clamp(64px,8.5vw,116px)] leading-[.92] tracking-[-2.5px]"
              data-testid="speed-range"
            >
              {SPEED_RANGE.figure}
            </span>
            <span className="mt-2 block max-w-[420px] text-[clamp(22px,2.6vw,32px)] leading-[1.12] tracking-[-.5px]">
              {SPEED_RANGE.unit}
            </span>
          </h2>
          <div
            role="img"
            aria-label={SPEED_COMPARISON.ariaLabel}
            className="mb-5 flex max-w-[460px] flex-col gap-3"
            data-testid="speed-comparison"
          >
            {SPEED_COMPARISON.bars.map((bar) => {
              const heirloom = bar.key === "heirloom"
              return (
                <div key={bar.key} data-testid={`speed-bar-${bar.key}`}>
                  <div className="mb-1.5 flex justify-between gap-3 font-mono text-[10.5px] tracking-[1px] uppercase">
                    <span className={heirloom ? "text-filament-ink" : "text-l4"}>{bar.label}</span>
                    {bar.note ? <span className="text-ink">{bar.note}</span> : null}
                  </div>
                  <div className="bg-hair/70 h-1.5 overflow-hidden rounded-[4px]">
                    <div
                      className={
                        heirloom
                          ? "bg-filament-ink animate-fill h-full origin-left rounded-[4px] motion-reduce:animate-none"
                          : "bg-hair-2 h-full rounded-[4px]"
                      }
                      style={{ width: `${bar.pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-l2 mb-5 max-w-[460px] text-[15px] leading-[1.62]">
            A traditional sale takes six to nine months from launch to closing. Heirloom closes in three to four on
            average, because the financial work is finished before launch and buyers are qualified before they take your
            time.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            <TextLink href={ROUTES.howItWorks} className="text-[14px]">
              See how it works →
            </TextLink>
            <TextLink href={ROUTES.fees} className="text-[14px]">
              See fees →
            </TextLink>
          </div>
        </div>
        <ol
          aria-label="How Heirloom keeps a sale moving"
          className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-x-5 gap-y-7 p-0"
        >
          {SPEED_STEPS.map((s, i) => (
            <li
              key={s.title}
              className="border-filament-ink/35 animate-row relative border-t pt-4 motion-reduce:animate-none"
              style={{ animationDelay: `${(i * 0.09).toFixed(2)}s` }}
              data-testid={`speed-step-${i}`}
            >
              <span
                aria-hidden="true"
                className="bg-filament-ink absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full shadow-[0_0_0_4px_var(--color-paper)]"
              />
              <span className="text-l4 block font-mono text-[10.5px] tracking-[1px]">{padIndex(i + 1)}</span>
              <span className="font-display mt-1.5 block text-[clamp(17px,1.6vw,20px)] leading-[1.2]">{s.title}</span>
              <p className="text-l2 mt-1.5 text-[13px] leading-[1.55]">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
