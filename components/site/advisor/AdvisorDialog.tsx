// use client: multi-step intake dialog driven by site state
"use client"

import { useState } from "react"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { Dialog } from "@/components/site/ui/Dialog"
import { LiveDot, ProgressTicks } from "@/components/site/ui/primitives"
import { ADVISOR_QUESTION_COUNT, ADVISOR_QUESTIONS } from "@/lib/site/advisor/data"
import {
  ADVISOR_NOTE_STEP,
  bookingUrl,
  briefingRows,
  briefingText,
  callAgenda,
  progressLabel,
} from "@/lib/site/advisor/intake"
import { padIndex } from "@/lib/site/format"
import { submitInquiry } from "@/lib/site/inquiry"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"
import { advisorAnsweredCount, advisorCanGoBack } from "@/lib/site/state/reducer"

const DIALOG_TITLE = "Talk to an M&A advisor"

export function AdvisorDialog() {
  const { advisor, closeAdvisor, dispatch } = useAdvisor()
  const question = ADVISOR_QUESTIONS[advisor.step]
  const asking = advisor.step < ADVISOR_NOTE_STEP && !!question
  const noting = advisor.step === ADVISOR_NOTE_STEP
  const done = advisor.step > ADVISOR_NOTE_STEP
  const { progress, position, total } = progressLabel(advisor)
  const answered = advisorAnsweredCount(advisor)
  const [emailError, setEmailError] = useState(false)

  const finish = async () => {
    const body = briefingText(advisor)
    await copyText(body)
    void submitInquiry({ kind: "advisor_briefing", body, source: "advisor" })
    dispatch({ type: "advisor/finish" })
  }

  const emailInstead = async () => {
    setEmailError(false)
    try {
      const body = briefingText(advisor) + "\n\nPlease reply with times for a call."
      await copyText(body)
      dispatch({ type: "advisor/emailed" })
      openMail(mailtoHref(CONTACT.hello, "Advisor call briefing", body, 1400))
    } catch {
      setEmailError(true)
    }
  }

  return (
    <Dialog open={advisor.open} onOpenChange={(o) => (o ? undefined : closeAdvisor())} title={DIALOG_TITLE}>
      <div
        className="aurora panel-hero border-dhair text-d1 max-h-[calc(100svh-32px)] overflow-auto rounded-[22px] border shadow-[0_60px_140px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]"
        data-testid="advisor-dialog"
      >
        <div className="border-dhair-2 flex flex-wrap items-center justify-between gap-2.5 border-b bg-[rgba(4,15,10,.45)] px-5 py-[13px]">
          <div className="flex items-center gap-2.5">
            <LiveDot />
            <span className="text-d2 font-mono text-[11.5px] tracking-[1px] uppercase">{DIALOG_TITLE}</span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-d4 font-mono text-[11px] tracking-[.8px]">{progress}</span>
            <ProgressTicks
              total={ADVISOR_QUESTION_COUNT}
              filled={answered}
              current={advisor.step}
              label="Briefing progress"
            />
            <button
              type="button"
              onClick={closeAdvisor}
              aria-label="Close"
              className="hover-green-dark border-dhair text-d2 inline-flex h-8 w-8 items-center justify-center rounded-full border text-[13px]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid min-h-[380px] grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          <div className="flex flex-col bg-[rgba(4,15,10,.28)] px-[26px] pt-[26px] pb-5">
            {asking && question ? (
              <div>
                <div className="eyebrow text-filament mb-3">
                  Before you book · question {position} of {total}
                </div>
                <h2 className="font-display text-d1 mb-1.5 text-[clamp(22px,2.6vw,30px)] leading-[1.16] font-normal tracking-[-.4px]">
                  {question.q}
                </h2>
                <p className="text-d4 mb-[18px] font-mono text-[11px]">{question.note}</p>
                <div role="group" aria-label="Answer choices" className="mb-3.5 flex flex-wrap gap-[9px]">
                  {question.chips.map(([v, l]) => (
                    <Chip
                      key={v}
                      selected={advisor.answers[question.id] === v}
                      disabled={advisor.busy}
                      onClick={() => dispatch({ type: "advisor/answer", id: question.id, value: v })}
                    >
                      {l}
                    </Chip>
                  ))}
                </div>
                {advisor.ack ? (
                  <div className="border-filament/50 bg-filament/[6%] rounded-r-[10px] border-l-2 px-[13px] py-2.5">
                    <p className="text-d2 text-[13px] leading-[1.55]">
                      <span className="text-signal mb-1 block font-mono text-[11px] tracking-[1px] uppercase">
                        How we prepare
                      </span>
                      {advisor.ack}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {noting ? (
              <div>
                <div className="eyebrow text-filament mb-3">Last one · optional</div>
                <h2 className="font-display text-d1 mb-3.5 text-[clamp(22px,2.6vw,30px)] leading-[1.16] font-normal">
                  Anything the advisor should read before the call?
                </h2>
                <textarea
                  rows={4}
                  value={advisor.note}
                  onChange={(e) => dispatch({ type: "advisor/note", note: e.target.value })}
                  aria-label="Note for the advisor"
                  placeholder="A concern, a deadline, a buyer to avoid. Rough notes are fine."
                  className="border-dhair text-d1 placeholder:text-d4 mb-3.5 w-full resize-y rounded-[10px] border bg-[rgba(3,12,8,.5)] px-3.5 py-3 text-[14.5px]"
                />
                <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
                  <Button variant="cta" size="md" className="h-11 font-semibold" onClick={finish}>
                    Finish the briefing →
                  </Button>
                  <button
                    type="button"
                    onClick={finish}
                    className="hover-green-dark border-dhair text-d3 border-b pb-0.5 font-mono text-[11.5px]"
                  >
                    Nothing to add
                  </button>
                </div>
              </div>
            ) : null}

            {done ? (
              <div>
                <div className="eyebrow text-filament mb-3">Briefing ready</div>
                <h2 className="font-display text-d1 mb-2.5 text-[clamp(23px,2.8vw,32px)] leading-[1.14] font-normal">
                  Your advisor reads this before you say a word.
                </h2>
                <p className="text-d2 mb-[18px] max-w-[440px] text-[14px] leading-[1.6]">
                  Book the call and the conversation starts from your situation, not from zero. A copy of the briefing
                  is on your clipboard for the booking notes.
                </p>
                <div className="mb-3.5 flex flex-wrap items-center gap-x-[18px] gap-y-3">
                  <Button
                    variant="cta"
                    size="lg"
                    href={bookingUrl(advisor)}
                    target="_blank"
                    rel="noopener"
                    className="px-6"
                  >
                    Book the call →
                  </Button>
                  <button
                    type="button"
                    onClick={emailInstead}
                    className="hover-green-dark border-dhair text-d2 border-b pb-0.5 text-[13.5px]"
                  >
                    Prefer email? Send the briefing instead
                  </button>
                </div>
                {emailError ? (
                  <p aria-live="polite" className="text-signal mb-3 text-[12.5px] leading-[1.6]">
                    We could not prepare the email. Write to {CONTACT.hello} directly and we will set up the call.
                  </p>
                ) : null}
                {advisor.emailed ? (
                  <p aria-live="polite" className="text-filament mb-3 text-[12.5px] leading-[1.6]">
                    Your email app opened with the briefing filled in. If it did not open, the text is copied; paste it
                    into a message to {CONTACT.hello}.
                  </p>
                ) : null}
                <p className="text-d4 font-mono text-[11px] leading-[1.7]">
                  No documents required. Nothing you shared here leaves this page until you book or email.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "advisor/restart" })}
                  className="hover-green-dark border-dhair text-d3 mt-3.5 border-b pb-0.5 font-mono text-[11px]"
                >
                  Start over
                </button>
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-[18px] gap-y-2 pt-4">
              {advisorCanGoBack(advisor) ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "advisor/back" })}
                  className="hover-green-dark border-dhair text-d3 border-b pb-0.5 font-mono text-[11px]"
                >
                  Change my last answer
                </button>
              ) : (
                <span />
              )}
              {asking ? (
                <button
                  type="button"
                  onClick={finish}
                  className="hover-green-dark border-dhair text-d4 border-b pb-0.5 font-mono text-[11px]"
                >
                  Skip the questions, just book
                </button>
              ) : null}
            </div>
          </div>

          <div className="border-dhair-2 border-l bg-[rgba(3,12,8,.52)] px-[26px] pt-[26px] pb-5">
            <div className="mb-2 flex items-baseline justify-between gap-2.5">
              <span className="text-d4 font-mono text-[11px] tracking-[1px] uppercase">Advisor briefing</span>
              <span className="text-d4 font-mono text-[10px] tracking-[.6px]">Builds as you answer</span>
            </div>
            <div className="border-dhair-2 bg-dfull/[2.5%] mb-4 rounded-xl border px-4 pt-1 pb-2.5">
              {briefingRows(advisor).map((row) => (
                <div key={row.label} className="border-dfull/5 flex flex-wrap gap-x-3.5 gap-y-0.5 border-b py-[9px]">
                  <span className="text-d4 flex-[0_1_128px] font-mono text-[11px] leading-[1.5]">{row.label}</span>
                  <span
                    className={`flex-[2_1_150px] text-[13.5px] leading-[1.5] transition-colors duration-300 ${
                      row.value ? "text-d1" : "text-dfull/30"
                    }`}
                  >
                    {row.value ?? "To be discussed"}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-d4 mb-2 font-mono text-[11px] tracking-[1px] uppercase">Call agenda</div>
            <div className="flex flex-col">
              {callAgenda(advisor.answers).map((item, i) => (
                <div key={item} className="border-dfull/5 grid grid-cols-[24px_1fr] gap-2 border-b py-[7px]">
                  <span className="text-filament font-mono text-[11px]">{padIndex(i + 1)}</span>
                  <span className="text-d2 text-[13px] leading-[1.5]">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-d4 mt-3.5 font-mono text-[10.5px] leading-[1.65]">
              Read by your advisor before the call. Not shared outside Heirloom.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
