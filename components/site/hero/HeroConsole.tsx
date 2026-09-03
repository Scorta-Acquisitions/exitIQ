// use client: the hero console is a short interactive funnel over shared site state
"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { ExitIqQuestion } from "@/components/site/exitiq/ExitIqQuestion"
import { HeroGraph } from "@/components/site/hero/HeroGraph"
import { useInstrumentField } from "@/components/site/hero/useInstrumentField"
import { useSiteState } from "@/components/site/providers/SiteStateProvider"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { LiveDot } from "@/components/site/ui/primitives"
import { scoreExitIq } from "@/lib/site/exitiq/scoring"
import {
  HERO_OPTIONS,
  type HeroStage,
  SELL_REVENUE_CHIPS,
  SELL_TIMING_CHIPS,
  sellDoneSubtitle,
  sellDoneTitle,
  STAGE_INTENSITY,
  STAGE_PROGRESS_LABEL,
} from "@/lib/site/hero/funnel"
import { CONTACT, ROUTES } from "@/lib/site/routes"

const eyebrow = "mb-3 font-mono text-[11.5px] uppercase tracking-[1.1px] text-filament"
const h2 = "mb-2 font-display text-[clamp(22px,2.5vw,29px)] font-normal leading-[1.18] text-d1"

function intensityFor(stage: HeroStage, conf: number): number {
  if (stage === "ready") return Math.max(0.25, conf)
  return STAGE_INTENSITY[stage]
}

export function HeroConsole() {
  const { state, dispatch } = useSiteState()
  const { funnel, iq } = state
  const result = scoreExitIq(iq.answers)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulse = useInstrumentField(canvasRef, intensityFor(funnel.stage, result.conf))

  const answeredCount = result.answered
  const lastAnswered = useRef(answeredCount)
  useEffect(() => {
    if (answeredCount !== lastAnswered.current) {
      lastAnswered.current = answeredCount
      if (answeredCount > 0) pulse()
    }
  }, [answeredCount, pulse])

  const setStage = (
    stage: HeroStage,
    extra?: { sellTiming?: "now" | "mid" | "explore"; sellRevenue?: "u1" | "1-3" | "3-10" | "10+" }
  ) => dispatch({ type: "funnel/stage", stage, ...extra })

  const showIntro = !iq.started && !iq.done && result.answered === 0
  const showRun = !iq.done && (iq.started || result.answered > 0)

  return (
    <div
      className="border-dhair bg-ground relative flex flex-1 flex-col overflow-hidden rounded-[22px] border shadow-[0_40px_90px_rgba(8,30,22,.35),inset_0_1px_0_rgba(255,255,255,.06)]"
      data-testid="hero-console"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      <div className="relative flex flex-1 flex-col">
        <div className="border-dhair-2 flex flex-wrap items-center justify-between gap-3 border-b bg-[rgba(4,15,10,.42)] px-5 py-[11px]">
          <div className="flex items-center gap-2.5">
            <LiveDot />
            <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">Heirloom</span>
            <span className="text-d4 tab:inline hidden font-mono text-[9.5px] tracking-[1px] uppercase">
              Seller represented · Private by default
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-d4 font-mono text-[11.5px] tracking-[1px]" data-testid="hero-progress">
              {STAGE_PROGRESS_LABEL[funnel.stage]}
            </span>
            {funnel.stage !== "route" ? (
              <button
                type="button"
                onClick={() => setStage("route")}
                className="border-dhair text-d3 rounded-full border px-3 py-[5px] font-mono text-[11.5px] tracking-[.8px]"
              >
                Start over
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid min-h-[256px] flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,42%)),1fr))]">
          <div className="text-d1 flex flex-1 flex-col justify-center bg-[rgba(4,15,10,.25)] px-[26px] py-5">
            <div className="w-full max-w-[700px]">
              {funnel.stage === "route" ? (
                <div>
                  <h2 className="font-display text-d1 mb-3 text-[clamp(21px,2.3vw,27px)] leading-[1.15] font-normal tracking-[-.4px]">
                    Where are you today?
                  </h2>
                  <div role="group" aria-label="Choose where you are in the sale process" className="flex flex-col">
                    {HERO_OPTIONS.map((o) => {
                      const hot = funnel.path === o.k
                      return (
                        <button
                          key={o.k}
                          type="button"
                          onClick={() => setStage(o.stage)}
                          onMouseEnter={() => dispatch({ type: "funnel/hover", path: o.k })}
                          onFocus={() => dispatch({ type: "funnel/hover", path: o.k })}
                          className={`hover-green-dark border-dhair-2 flex w-full items-center gap-4 border-t px-1.5 py-2.5 text-left transition-colors duration-200 ${
                            hot ? "bg-filament/5 text-d1" : "text-dfull/60"
                          }`}
                          data-testid={`hero-option-${o.k}`}
                        >
                          <span
                            className={`flex-none font-mono text-[11.5px] tracking-[1px] ${hot ? "text-filament" : "text-dfull/30"}`}
                          >
                            {o.num}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="font-display block text-[clamp(19px,2vw,24px)] leading-[1.15]">
                              {o.title}
                            </span>
                            <span className={hot ? "text-d3 mt-[3px] block text-[13.5px]" : "hidden"}>{o.sub}</span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`text-filament flex-none font-mono text-[15px] transition-opacity duration-200 ${hot ? "opacity-100" : "opacity-15"}`}
                          >
                            →
                          </span>
                          <span className="sr-only">Choose this path</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {funnel.stage === "sellQ1" ? (
                <div>
                  <div className={eyebrow}>About your timing</div>
                  <h2 className={`${h2} mb-5`}>When are you thinking about selling?</h2>
                  <div role="group" className="flex flex-wrap gap-[9px]">
                    {SELL_TIMING_CHIPS.map(([v, l]) => (
                      <Chip
                        key={v}
                        selected={funnel.sellTiming === v}
                        onClick={() => setStage("sellQ2", { sellTiming: v })}
                      >
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : null}

              {funnel.stage === "sellQ2" ? (
                <div>
                  <div className={eyebrow}>About your timing</div>
                  <h2 className={`${h2} mb-1.5`}>About how much revenue did the business generate last year?</h2>
                  <p className="text-d4 mb-[18px] font-mono text-[11px]">
                    A rough answer is enough. No one is checking the number here.
                  </p>
                  <div role="group" className="flex flex-wrap gap-[9px]">
                    {SELL_REVENUE_CHIPS.map(([v, l]) => (
                      <Chip
                        key={v}
                        selected={funnel.sellRevenue === v}
                        onClick={() => setStage("sellDone", { sellRevenue: v })}
                      >
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : null}

              {funnel.stage === "sellDone" ? (
                <div data-testid="hero-sell-done">
                  <div className={eyebrow}>About your timing</div>
                  <h2 className="font-display text-d1 mb-2.5 text-[clamp(21px,2.4vw,27px)] leading-[1.18] font-normal">
                    See what your sale would require.
                  </h2>
                  <p className="text-d1 mb-1.5 text-[14px] leading-[1.55] font-semibold">
                    {sellDoneTitle(funnel.sellTiming)}
                  </p>
                  <p className="text-d2 mb-2.5 text-[13.5px] leading-[1.55]">{sellDoneSubtitle(funnel.sellRevenue)}</p>
                  <p className="text-d2 mb-[18px] text-[13.5px] leading-[1.55]">
                    Heirloom can assess the business, explain the likely buyer market, and tell you whether the timing
                    looks right. There is no obligation to enter the market.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <AdvisorCtaButton variant="cta" size="md" className="h-11" />
                    <Link href={ROUTES.howItWorks} className="border-dhair text-d2 border-b pb-0.5 text-[13.5px]">
                      See the sale process →
                    </Link>
                  </div>
                </div>
              ) : null}

              {funnel.stage === "offer" ? (
                <div data-testid="hero-offer">
                  <div className={eyebrow}>Free Offer Review</div>
                  <h2 className={h2}>Have the offer read before you sign.</h2>
                  <p className="text-d2 mb-4 text-[13.5px] leading-[1.55]">
                    We review the headline price, cash at closing, money paid later, buyer financing, exclusivity,
                    working capital, transition demands, and terms that are missing. The first review is free.
                  </p>
                  <div className="mb-4 flex flex-col gap-2">
                    {[
                      { href: `mailto:${CONTACT.offers}`, label: "Forward or attach the offer", note: CONTACT.offers },
                      { href: `${ROUTES.offerReview}?mode=paste`, label: "Paste the terms", note: "2 minutes" },
                      {
                        href: `${ROUTES.offerReview}?mode=verbal`,
                        label: "Tell us what was said",
                        note: "rough notes are fine",
                      },
                    ].map((row) =>
                      row.href.startsWith("/") ? (
                        <Link
                          key={row.label}
                          href={row.href}
                          className="border-dhair text-d1 hover:border-filament/50 flex items-baseline justify-between gap-3 rounded-[11px] border px-[15px] py-3 transition-colors duration-200"
                        >
                          <span className="text-[14px] font-medium">{row.label}</span>
                          <span className="text-d3 font-mono text-[11.5px]">{row.note}</span>
                        </Link>
                      ) : (
                        <a
                          key={row.label}
                          href={row.href}
                          className="border-dhair text-d1 hover:border-filament/50 flex items-baseline justify-between gap-3 rounded-[11px] border px-[15px] py-3 transition-colors duration-200"
                        >
                          <span className="text-[14px] font-medium">{row.label}</span>
                          <span className="text-d3 font-mono text-[11.5px]">{row.note}</span>
                        </a>
                      )
                    )}
                  </div>
                  <p className="text-d4 font-mono text-[11.5px]">
                    Confidential. No commitment. We do not contact the buyer during the review.
                  </p>
                </div>
              ) : null}

              {funnel.stage === "ready" ? (
                <div data-testid="hero-ready">
                  {showIntro ? (
                    <div>
                      <div className={eyebrow}>exitIQ by Heirloom</div>
                      <h2 className={h2}>See how the business looks to buyers today.</h2>
                      <p className="text-d2 mb-[18px] text-[13.5px] leading-[1.55]">
                        Answer seven questions and get the issues that matter most, plus a practical 90-day plan.
                      </p>
                      <Button
                        variant="cta"
                        size="md"
                        className="mb-3.5 h-11"
                        onClick={() => dispatch({ type: "iq/start" })}
                      >
                        Start exitIQ
                      </Button>
                      <p className="text-d4 font-mono text-[11.5px]">
                        About 2 minutes. No name, email, phone number, or documents required.
                      </p>
                    </div>
                  ) : null}
                  {showRun ? <ExitIqQuestion variant="hero" /> : null}
                  {iq.done ? (
                    <div data-testid="hero-iq-done">
                      <div className={eyebrow}>Your exitIQ result is ready.</div>
                      <div className="mb-2.5">
                        <span className="font-display text-filament text-[clamp(24px,2.6vw,32px)] leading-[1.1]">
                          {result.state}
                        </span>
                      </div>
                      <p className="text-d2 mb-4 text-[13.5px] leading-[1.55]">
                        <strong className="text-d1 font-semibold">{result.findings[0]?.t}.</strong>{" "}
                        {result.findings[0]?.b}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Button variant="cta" size="md" href={ROUTES.score} className="h-11">
                          See my findings and 90-day plan →
                        </Button>
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "iq/restart" })}
                          className="hover-green-dark border-dhair text-d3 border-b pb-0.5 font-mono text-[11px]"
                        >
                          Start over
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-dhair-2 relative min-h-[230px] overflow-hidden border-l bg-[rgba(3,12,8,.45)] max-[620px]:hidden">
            <HeroGraph path={funnel.path} tick={funnel.tick} boot={funnel.boot} />
          </div>
        </div>
      </div>
    </div>
  )
}
