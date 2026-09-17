// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request; see styles/site.css
// use client: answers dispatch into shared site state
"use client"

import { ConsoleChip, ConsoleTicks } from "@/components/site/exitiq/ConsoleChrome"
import { useSiteState } from "@/components/site/providers/SiteStateProvider"
import { QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import { scoreExitIq } from "@/lib/site/exitiq/scoring"

/**
 * One exitIQ question with its answer chips, the post-answer insight, and back/restart controls, as the
 * first build set it: mono uppercase labels, the serif question, dark chips. `variant="hero"` is the
 * compact version inside the home console; `"page"` is the full /score run.
 */
export function ExitIqQuestion({ variant }: { variant: "hero" | "page" }) {
  const { state, dispatch } = useSiteState()
  const { iq } = state
  const q = QUESTIONS[iq.phase]
  if (!q) return null
  const result = scoreExitIq(iq.answers)
  const qNum = iq.phase + 1
  const hero = variant === "hero"
  const calculating = iq.busy && iq.phase + 1 >= QUESTION_COUNT

  return (
    <div data-testid="exitiq-question">
      {hero ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-filament font-mono text-[11.5px] tracking-[1.1px] uppercase">
            exitIQ · Question {qNum} of {QUESTION_COUNT}
          </span>
          <ConsoleTicks total={QUESTION_COUNT} filled={result.answered} current={iq.phase} label="Your progress" />
        </div>
      ) : (
        <div className="eyebrow text-signal mb-3.5">
          Question {qNum} of {QUESTION_COUNT}
        </div>
      )}
      <h2
        className={
          hero
            ? "font-display text-d1 mb-1 text-[clamp(22px,2.5vw,29px)] leading-[1.18] font-normal"
            : "font-display text-d1 mb-1.5 text-[clamp(25px,3vw,34px)] leading-[1.18] font-normal tracking-[-.5px]"
        }
      >
        {q.q}
      </h2>
      <p className={`text-d4 font-mono ${hero ? "mb-4 text-[11px]" : "mb-6 text-[11.5px]"}`}>{q.note ?? ""}</p>
      <div
        role="group"
        aria-label={`Answer choices for question ${qNum}`}
        className={`flex flex-wrap ${hero ? "mb-3.5 gap-2" : "mb-5 gap-[9px]"}`}
      >
        {q.chips.map((c) => (
          <ConsoleChip
            key={c.v}
            size="lg"
            selected={iq.answers[q.id] === c.v}
            disabled={iq.busy}
            onClick={() => dispatch({ type: "iq/answer", value: c.v })}
          >
            {c.l}
          </ConsoleChip>
        ))}
      </div>
      {iq.insight ? (
        <div
          className={`border-filament/50 bg-filament/[6%] rounded-r-[10px] border-l-2 ${hero ? "px-[13px] py-2.5" : "px-3.5 py-3"}`}
        >
          <p className={`text-d2 leading-[1.55] ${hero ? "text-[13px]" : "text-[13.5px] leading-[1.6]"}`}>
            <span className="text-signal mb-1 block font-mono text-[11.5px] tracking-[1px] uppercase">
              What this tells a buyer
            </span>
            {iq.insight}
          </p>
        </div>
      ) : null}
      {!hero && calculating ? (
        <p aria-live="polite" className="text-signal font-mono text-[11.5px]">
          Reading your answers...
        </p>
      ) : null}
      <div className={`flex flex-wrap gap-x-[18px] gap-y-2.5 ${hero ? "mt-3.5" : "mt-[18px]"}`}>
        {iq.phase > 0 ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "iq/back" })}
            className="hover-green-dark border-dhair text-d3 border-b pb-0.5 font-mono text-[11.5px]"
          >
            Change my last answer
          </button>
        ) : null}
        {!hero && result.answered > 0 ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "iq/restart" })}
            className="hover-green-dark border-dhair text-d3 border-b pb-0.5 font-mono text-[11.5px]"
          >
            Start over
          </button>
        ) : null}
      </div>
      {hero ? (
        <p className="text-d4 mt-3.5 font-mono text-[11.5px]">
          About 2 minutes. No name, email, or documents required.
        </p>
      ) : null}
    </div>
  )
}
