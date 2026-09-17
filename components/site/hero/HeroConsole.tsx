// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request; see styles/site.css
// use client: the hero console is a short interactive funnel over shared site state
"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { twMerge } from "tailwind-merge"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { ConsoleChip, ConsolePill, consolePill } from "@/components/site/exitiq/ConsoleChrome"
import { ExitIqQuestion } from "@/components/site/exitiq/ExitIqQuestion"
import { useConsoleField } from "@/components/site/exitiq/useConsoleField"
import { HeroGraph } from "@/components/site/hero/HeroGraph"
import { useSiteState } from "@/components/site/providers/SiteStateProvider"
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

/**
 * The home hero's console as the first build set it: a near-black instrument with a fractal field behind
 * it, a mono header (brand, stage progress, "Start over"), the three paths in serif, the sell and offer
 * panels, and the exitIQ run with the buyer-view graph in the right pane (hidden below 620px).
 */
export function HeroConsole() {
  const { state, dispatch } = useSiteState()
  const { funnel, iq } = state
  const result = scoreExitIq(iq.answers)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulse = useConsoleField(canvasRef, intensityFor(funnel.stage, result.conf))

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
      className="console-legacy border-dhair bg-ground relative flex flex-1 flex-col overflow-hidden rounded-[22px] border text-[16px] leading-[1.5] shadow-[0_40px_90px_rgba(8,30,22,.35),inset_0_1px_0_rgba(255,255,255,.06)]"
      data-testid="hero-console"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      <div className="relative flex flex-1 flex-col">
        <div className="border-dhair-2 flex flex-wrap items-center justify-between gap-3 border-b bg-[rgba(4,15,10,.42)] px-5 py-[11px]">
          <div className="flex items-center gap-2.5">
            <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">Heirloom</span>
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

        {/* The first build's console filled a viewport-tall hero, which gave its body 300px at 1440×900; here that body
            is a floor from the tablet breakpoint (phones keep the 256px floor). The card sets the first build's 16px /
            1.5 body so every em-relative measure inside matches. */}
        <div className="tab:min-h-[300px] grid min-h-[256px] flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,max(280px,42%)),1fr))]">
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
                          <span className="sr-only">Continue</span>
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
                      <ConsoleChip
                        key={v}
                        selected={funnel.sellTiming === v}
                        onClick={() => setStage("sellQ2", { sellTiming: v })}
                      >
                        {l}
                      </ConsoleChip>
                    ))}
                  </div>
                </div>
              ) : null}

              {funnel.stage === "sellQ2" ? (
                <div>
                  <div className={eyebrow}>About your revenue</div>
                  <h2 className={`${h2} mb-1.5`}>About how much revenue did the business generate last year?</h2>
                  <p className="text-d4 mb-[18px] font-mono text-[11px]">A rough answer is enough.</p>
                  <div role="group" className="flex flex-wrap gap-[9px]">
                    {SELL_REVENUE_CHIPS.map(([v, l]) => (
                      <ConsoleChip
                        key={v}
                        selected={funnel.sellRevenue === v}
                        onClick={() => setStage("sellDone", { sellRevenue: v })}
                      >
                        {l}
                      </ConsoleChip>
                    ))}
                  </div>
                </div>
              ) : null}

              {funnel.stage === "sellDone" ? (
                <div data-testid="hero-sell-done">
                  <h2 className="font-display text-d1 mb-2.5 text-[clamp(21px,2.4vw,27px)] leading-[1.18] font-normal">
                    Timing and fit
                  </h2>
                  <p className="text-d1 mb-1.5 text-[14px] leading-[1.55] font-semibold">
                    {sellDoneTitle(funnel.sellTiming)}
                  </p>
                  <p className="text-d2 mb-2.5 text-[13.5px] leading-[1.55]">{sellDoneSubtitle(funnel.sellRevenue)}</p>
                  <p className="text-d2 mb-[18px] text-[13.5px] leading-[1.55]">
                    An advisor can look at the business, describe the likely buyers, and give a view on timing.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* twMerge, so h-11 (the 44px target) beats the md pill's 42px, as the first build's Button merged it. */}
                    <AdvisorTrigger className={twMerge(consolePill({ variant: "cta", size: "md" }), "h-11")}>
                      Talk to an M&amp;A advisor
                    </AdvisorTrigger>
                    <Link href={ROUTES.howItWorks} className="border-dhair text-d2 border-b pb-0.5 text-[13.5px]">
                      See how it works
                    </Link>
                  </div>
                </div>
              ) : null}

              {funnel.stage === "offer" ? (
                <div data-testid="hero-offer">
                  <div className={eyebrow}>Free offer review</div>
                  <h2 className={h2}>What the offer pays</h2>
                  <p className="text-d2 mb-4 text-[13.5px] leading-[1.55]">
                    We show you how much of the price is cash at closing, what is paid later or depends on financing,
                    and which terms are missing.
                  </p>
                  <div className="mb-4 flex flex-col gap-2">
                    {[
                      { href: `mailto:${CONTACT.offers}`, label: "Forward or attach the offer", note: CONTACT.offers },
                      { href: `${ROUTES.offerReview}?mode=paste`, label: "Paste the terms", note: "2 minutes" },
                      {
                        href: `${ROUTES.offerReview}?mode=verbal`,
                        label: "Tell us what was said",
                        note: "Rough notes are fine",
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
                  <p className="text-d4 font-mono text-[11.5px]">Confidential. We do not contact the buyer.</p>
                </div>
              ) : null}

              {funnel.stage === "ready" ? (
                <div data-testid="hero-ready">
                  {showIntro ? (
                    <div>
                      <div className={eyebrow}>exitIQ by Heirloom</div>
                      <h2 className={h2}>Is the business ready to sell?</h2>
                      <p className="text-d2 mb-[18px] text-[13.5px] leading-[1.55]">
                        Seven questions. You get the issues a buyer would raise first and a 90-day plan.
                      </p>
                      <ConsolePill
                        variant="cta"
                        size="md"
                        className="mb-3.5 h-11"
                        onClick={() => dispatch({ type: "iq/start" })}
                      >
                        Start exitIQ
                      </ConsolePill>
                      <p className="text-d4 font-mono text-[11.5px]">
                        About 2 minutes. No name, email, or documents required.
                      </p>
                    </div>
                  ) : null}
                  {showRun ? <ExitIqQuestion variant="hero" /> : null}
                  {iq.done ? (
                    <div data-testid="hero-iq-done">
                      <div className={eyebrow}>Your result is ready.</div>
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
                        <ConsolePill variant="cta" size="md" href={ROUTES.score} className="h-11">
                          See my findings and 90-day plan
                        </ConsolePill>
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
