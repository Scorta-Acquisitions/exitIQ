// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request; see styles/site.css
// use client: the full exitIQ run on /score, with the live recommendation panel
"use client"

import { useEffect, useRef } from "react"
import { ConsolePill, ConsoleTicks } from "@/components/site/exitiq/ConsoleChrome"
import {
  ADVISOR_ERROR_COPY,
  ADVISOR_SENT_COPY,
  PLAN_DOWNLOADED_COPY,
  PLAN_SAVED_COPY,
  useAdvisorReview,
  useSavePlan,
} from "@/components/site/exitiq/ExitIqActions"
import { ExitIqQuestion } from "@/components/site/exitiq/ExitIqQuestion"
import { useConsoleField } from "@/components/site/exitiq/useConsoleField"
import { useSiteState } from "@/components/site/providers/SiteStateProvider"
import { QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import { recommendationDescription, scoreExitIq } from "@/lib/site/exitiq/scoring"
import { padIndex } from "@/lib/site/format"

function Meter({
  label,
  value,
  pct,
  hint,
  tone,
}: {
  label: string
  value: string
  pct: number
  hint: string
  tone: "filament" | "signal"
}) {
  return (
    <div>
      <div className="mb-[7px] flex items-baseline justify-between">
        <span className="text-d2 text-[13px]">{label}</span>
        <span className="tabular text-d1 font-mono text-[13px]">{value}</span>
      </div>
      <div className="bg-dfull/10 h-[3px] overflow-hidden rounded-full">
        <div
          className={`ease-e1 h-full transition-[width] duration-1000 ${
            tone === "filament"
              ? "bg-filament shadow-[0_0_10px_rgba(76,226,126,.6)]"
              : "bg-signal shadow-[0_0_10px_rgba(143,224,178,.5)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-d4 mt-[7px] text-[11.5px] leading-[1.5]">{hint}</p>
    </div>
  )
}

/**
 * The /score exitIQ card as the first build set it: the near-black instrument with its fractal field, the
 * mono header with its ticks (the live dot was removed on 2026-09-11 at the user's request), the question
 * pane, and the SCORES / RECOMMENDATION panel with its three meters, findings and the 90-day plan. The
 * first build's radii (12px cards, 8px buttons) are
 * spelled out because the current theme's radius scale differs; the shadow is the console's, since the
 * card now rests on a light tile; `anchor-target` lands it under the bar like every other anchor.
 */
export function ExitIqRun() {
  const { state, dispatch } = useSiteState()
  const { iq } = state
  const result = scoreExitIq(iq.answers)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulse = useConsoleField(canvasRef, result.conf)
  const resultRef = useRef<HTMLDivElement>(null)
  const review = useAdvisorReview()
  const plan = useSavePlan()

  const answeredCount = result.answered
  const lastAnswered = useRef(answeredCount)
  useEffect(() => {
    if (answeredCount !== lastAnswered.current) {
      lastAnswered.current = answeredCount
      if (answeredCount > 0) pulse()
    }
  }, [answeredCount, pulse])

  const wasDone = useRef(iq.done)
  useEffect(() => {
    if (iq.done && !wasDone.current && window.innerWidth < 900 && resultRef.current) {
      window.scrollTo({ top: resultRef.current.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" })
    }
    wasDone.current = iq.done
  }, [iq.done])

  const noAnswers = result.answered === 0

  return (
    <div
      id="exitiq-run"
      className="console-legacy border-dhair anchor-target relative overflow-hidden rounded-[22px] border text-[16px] leading-[1.5] shadow-[0_40px_90px_rgba(8,30,22,.35),inset_0_1px_0_rgba(255,255,255,.06)]"
      data-testid="exitiq-run"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="bg-ground absolute inset-0 block h-full w-full" />
      <div className="relative">
        <div className="border-dhair-2 flex flex-wrap items-center justify-between gap-3 border-b bg-[rgba(4,15,10,.42)] px-5 py-3.5">
          <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">exitIQ by Heirloom</span>
          <ConsoleTicks
            total={QUESTION_COUNT}
            filled={result.answered}
            current={iq.done ? undefined : iq.phase}
            label="Your progress"
          />
        </div>
        <div className="grid min-h-[420px] grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))]">
          <div role="group" aria-label="exitIQ readiness questions" className="bg-[rgba(4,15,10,.28)] px-7 py-8">
            {!iq.done ? (
              <ExitIqQuestion variant="page" />
            ) : (
              <div data-testid="exitiq-done">
                <p aria-live="polite" className="text-d4 mb-1.5 font-mono text-[11px] tracking-[.6px]">
                  Your result is ready.
                </p>
                <div className="eyebrow text-signal mb-3.5">Findings</div>
                <h2 className="font-display text-d1 mb-5 text-[clamp(25px,3vw,34px)] leading-[1.16] font-normal tracking-[-.5px]">
                  What a buyer would question first
                </h2>
                <div className="flex flex-col gap-3">
                  {result.findings.map((f, i) => (
                    <div key={f.t} className="border-dhair rounded-[12px] border bg-[rgba(4,15,10,.42)] px-[18px] py-4">
                      <div className="mb-2 flex items-baseline gap-3">
                        <span className="text-filament font-mono text-[11px]">{padIndex(i + 1)}</span>
                        <span className="text-d1 text-[15.5px] leading-[1.4] font-semibold">{f.t}</span>
                      </div>
                      <p className="text-d2 text-[13.5px] leading-[1.62]">{f.b}</p>
                    </div>
                  ))}
                </div>
                <div className="border-dhair-2 mt-[22px] border-t pt-[18px]">
                  <ConsolePill
                    variant="cta"
                    size="xl"
                    className="max-w-full text-center whitespace-normal"
                    onClick={review.send}
                  >
                    Review my result with an advisor
                  </ConsolePill>
                  <p className="text-d2 mt-3 max-w-[520px] text-[13.5px] leading-[1.6]">
                    Book a call with Suyash. Your result goes into the booking notes.
                  </p>
                  {review.sent ? (
                    <p aria-live="polite" className="text-filament mt-2.5 text-[13px]">
                      {ADVISOR_SENT_COPY}
                    </p>
                  ) : null}
                  {review.error ? (
                    <p aria-live="polite" className="text-signal mt-2.5 text-[13px]">
                      {ADVISOR_ERROR_COPY}
                    </p>
                  ) : null}
                </div>
                <div className="mt-[18px] flex flex-wrap items-center gap-2">
                  <span className="text-d4 font-mono text-[11.5px]">Change an answer:</span>
                  {QUESTIONS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => dispatch({ type: "iq/edit", index: i })}
                      aria-label={`Change answer ${i + 1}`}
                      className="hover-green-dark border-dhair text-d2 h-8 min-w-[34px] rounded-[8px] border px-[9px] font-mono text-[12px]"
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "iq/restart" })}
                  className="hover-green-dark border-dhair text-d3 mt-4 border-b pb-0.5 font-mono text-[11.5px]"
                >
                  Start over
                </button>
              </div>
            )}
          </div>

          <div
            ref={resultRef}
            role="group"
            aria-label="exitIQ recommendation and findings"
            className="border-dhair-2 relative overflow-hidden border-l bg-[rgba(3,12,8,.52)] px-7 py-[30px]"
            data-testid="exitiq-result"
          >
            <div className="mb-5">
              <span className="text-d4 font-mono text-[11.5px] tracking-[1.1px] uppercase">Scores</span>
            </div>
            <div className="border-dhair-2 mb-[18px] border-t pt-4">
              <div className="text-d4 mb-1.5 font-mono text-[11.5px] tracking-[1.1px] uppercase">Recommendation</div>
              <div className="font-display text-d1 text-[26px] leading-[1.2]" data-testid="exitiq-state">
                {result.state}
              </div>
              {recommendationDescription(result.state) ? (
                <p className="text-d3 mt-2 text-[12.5px] leading-[1.6]">{recommendationDescription(result.state)}</p>
              ) : null}
            </div>
            <div className="border-dhair-2 flex flex-col gap-4 border-t pt-[18px]">
              <Meter
                label="Financeability"
                value={noAnswers ? "–" : String(result.fin)}
                pct={result.fin}
                hint="Could a lender reasonably finance a buyer using the earnings and risks described?"
                tone="filament"
              />
              <Meter
                label="Transferability"
                value={noAnswers ? "–" : String(result.tra)}
                pct={result.tra}
                hint="Would the business continue to earn when you step away?"
                tone="filament"
              />
              <Meter
                label="Evidence quality"
                value={noAnswers ? "–" : String(result.evi)}
                pct={result.evi}
                hint="How much of the current story could a buyer’s accountant verify from records?"
                tone="signal"
              />
            </div>
            {iq.done ? (
              <div className="border-dhair-2 mt-5 border-t pt-4">
                <div className="text-d4 mb-3 font-mono text-[11.5px] tracking-[1.1px] uppercase">Your next 90 days</div>
                {result.plan.map((p, i) => (
                  <div key={p} className="border-dfull/5 grid grid-cols-[26px_1fr] gap-2.5 border-b py-2">
                    <span className="text-filament font-mono text-[11px]">{padIndex(i + 1)}</span>
                    <span className="text-d2 text-[13.5px] leading-[1.5]">{p}</span>
                  </div>
                ))}
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <ConsolePill
                    variant="pill-dark"
                    size="sm"
                    className="text-d1 h-[38px] text-[11.5px]"
                    onClick={plan.save}
                  >
                    Save my plan
                  </ConsolePill>
                  <ConsolePill
                    variant="pill-dark"
                    size="sm"
                    className="text-d1 h-[38px] text-[11.5px]"
                    onClick={review.send}
                  >
                    Review my result with an advisor
                  </ConsolePill>
                </div>
                {plan.saved ? (
                  <p className="text-filament mt-2.5 text-[12.5px] leading-[1.55]">
                    {plan.copied ? PLAN_SAVED_COPY : PLAN_DOWNLOADED_COPY}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="border-dhair-2 mt-[18px] border-t pt-3.5">
              <p className="text-d4 font-mono text-[11px] leading-[1.6]">
                Records can change the result in either direction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
