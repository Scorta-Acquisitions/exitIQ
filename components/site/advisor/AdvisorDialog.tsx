// use client: multi-step intake dialog driven by site state
"use client"

import Image from "next/image"
import { useState } from "react"
import { InstrumentField } from "@/components/site/instrument/InstrumentField"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { Dialog } from "@/components/site/ui/Dialog"
import { Card, Eyebrow, ProgressTicks } from "@/components/site/ui/primitives"
import { TextButton } from "@/components/site/ui/TextButton"
import { ADVISOR_QUESTION_COUNT, ADVISOR_QUESTIONS } from "@/lib/site/advisor/data"
import {
  ADVISOR_EMAILED_COPY,
  ADVISOR_NOTE_STEP,
  bookingUrl,
  briefingRows,
  briefingText,
  callAgenda,
  progressLabel,
} from "@/lib/site/advisor/intake"
import { cn } from "@/lib/site/cn"
import { padIndex } from "@/lib/site/format"
import { submitInquiry } from "@/lib/site/inquiry"
import { advisorFieldTarget } from "@/lib/site/instrument/level"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { CONTACT } from "@/lib/site/routes"
import { advisorAnsweredCount, advisorCanGoBack } from "@/lib/site/state/reducer"

const DIALOG_TITLE = "Talk to an M&A advisor"

/** A panel arriving (the sheet, each question, the note, the finished briefing): one motion, still under reduced motion. */
const STAGE_IN = "animate-stage-in motion-reduce:animate-none"
/** A row arriving (an acknowledgement, a briefing value, an agenda line): one motion, still under reduced motion. */
const ROW_IN = "animate-row-in motion-reduce:animate-none"

/**
 * One briefing row in the KeyValueRow shape: the label span, then the value span as its following sibling
 * (the relationship the e2e locators read). Drawn inline because the label carries the cursor: `data-current`
 * marks the row the current step fills, lit in the accent, so the visitor sees where the next answer lands. The
 * value is keyed by its text, so a row visibly lands when an answer fills it and holds still otherwise.
 */
function BriefingRow({ label, value, current }: { label: string; value: string | null; current: boolean }) {
  return (
    <div className="border-line-soft flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b py-2.5 last:border-b-0">
      <span
        data-current={current ? "true" : "false"}
        className={cn(
          "type-caption ease-e1 flex-[0_1_128px] transition-colors duration-300",
          current ? "text-accent" : "text-fg-3"
        )}
      >
        {label}
      </span>
      <span key={value ?? ""} className={cn("type-caption flex-[2_1_150px]", ROW_IN, value ? "text-fg" : "text-fg-3")}>
        {value ?? "To be discussed"}
      </span>
    </div>
  )
}

/**
 * The advisor intake: a light sheet resting over the frosted dark backdrop, arriving as one motion each time it
 * opens. A header row carries the title, the progress label and ticks, and the close control; under it a
 * dark display strip (tablet up) holds the instrument field, which brightens as the briefing fills, flares once
 * per answer, and leans toward the pointer; below that two panes sit on one hairline: the question flow (then
 * the optional note, then the finished briefing) on the left, each step arriving as a panel, and on the right the
 * briefing that builds as the visitor answers, its rows landing one by one with the current row's label lit as
 * a cursor. The sheet caps its height to the viewport and scrolls internally, so it fits a phone without the
 * page behind it moving.
 */
export function AdvisorDialog() {
  const { advisor, closeAdvisor, dispatch } = useAdvisor()
  const question = ADVISOR_QUESTIONS[advisor.step]
  const asking = advisor.step < ADVISOR_NOTE_STEP && !!question
  const noting = advisor.step === ADVISOR_NOTE_STEP
  const done = advisor.step > ADVISOR_NOTE_STEP
  const { progress, position, total } = progressLabel(advisor)
  const answered = advisorAnsweredCount(advisor)
  const [emailError, setEmailError] = useState(false)
  /* A refused clipboard (copyText resolves false, it never throws) must not leave the briefing panel
     claiming the copy. False by default, so a session restored at the briefing reads as it always did. */
  const [copyFailed, setCopyFailed] = useState(false)
  /* The same for the email handoff, which opens the mail client whatever the clipboard does. */
  const [emailCopyFailed, setEmailCopyFailed] = useState(false)

  const finish = async () => {
    const body = briefingText(advisor)
    setCopyFailed(!(await copyText(body)))
    void submitInquiry({ kind: "advisor_briefing", body, source: "advisor" })
    dispatch({ type: "advisor/finish" })
  }

  const emailInstead = async () => {
    setEmailError(false)
    try {
      const body = briefingText(advisor) + "\n\nPlease reply with times for a call."
      // The copy is a convenience; the mail draft is the delivery, so a refused clipboard opens the mail
      // client all the same and only changes the line under it. Its own flag: the briefing panel's line
      // above reports the copy the finish made, which this write neither repeats nor undoes.
      setEmailCopyFailed(!(await copyText(body)))
      dispatch({ type: "advisor/emailed" })
      openMail(mailtoHref(CONTACT.hello, "Advisor call briefing", body, 1400))
    } catch {
      setEmailError(true)
    }
  }

  return (
    <Dialog open={advisor.open} onOpenChange={(o) => (o ? undefined : closeAdvisor())} title={DIALOG_TITLE}>
      <Card
        padded={false}
        className={cn("on-light max-h-[calc(100svh-32px)] overflow-auto", STAGE_IN)}
        data-testid="advisor-dialog"
      >
        <div className="border-line flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3.5">
          <Eyebrow as="span">{DIALOG_TITLE}</Eyebrow>
          <div className="flex items-center gap-4">
            <span className="tabular type-caption text-fg-3">{progress}</span>
            <ProgressTicks
              total={ADVISOR_QUESTION_COUNT}
              filled={answered}
              current={advisor.step}
              label="Briefing progress"
            />
            <Button variant="icon" size="compact" aria-label="Close" onClick={closeAdvisor}>
              ✕
            </Button>
          </div>
        </div>

        {/* The instrument strip: its own dark box on the light sheet, so the field's material reads as a product
            band. Tablet up only; on phones the first answer chips stay above the fold. The field leans toward the
            pointer over this box by itself. */}
        <div
          aria-hidden="true"
          className="on-dark bg-tile-1 border-line tab:block relative hidden h-14 overflow-hidden border-b"
          data-testid="advisor-field-strip"
        >
          {/* The calm texture as a static stand-in without WebGL; the canvas (absolute, inset-0) paints over it once live. */}
          <Image src="/generated/field-calm.webp" alt="" fill sizes="980px" className="object-cover opacity-50" />
          <InstrumentField target={advisorFieldTarget(answered)} pulseKey={answered} testId="advisor-field" />
        </div>

        {/* A 1px gap over the hairline colour divides the panes whether they sit side by side or stack. */}
        <div className="bg-line grid min-h-[380px] grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-px">
          <div className="bg-surface flex flex-col px-6 py-6">
            {asking && question ? (
              <>
                {/* Keyed by step so each next question arrives as a panel; the acknowledgement sits beside it and
                    holds still through the change, moving only when its text does. */}
                <div
                  key={`question-${advisor.step}`}
                  className={STAGE_IN}
                  data-testid="advisor-stage"
                  data-step={advisor.step}
                >
                  <Eyebrow tone="accent">
                    Before you book · question {position} of {total}
                  </Eyebrow>
                  <h2 className="type-display-md text-fg mt-3">{question.q}</h2>
                  <p className="type-caption text-fg-3 mt-2">{question.note}</p>
                  <div role="group" aria-label="Answer choices" className="mt-6 flex flex-wrap gap-2.5">
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
                </div>
                {advisor.ack ? (
                  <div
                    key={advisor.ack}
                    className={cn("border-accent mt-5 border-l-2 py-2 pl-4", ROW_IN)}
                    data-testid="advisor-ack"
                  >
                    <p className="type-caption text-fg-2">
                      <Eyebrow as="span" tone="accent" className="mb-1">
                        On the call
                      </Eyebrow>
                      {advisor.ack}
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}

            {noting ? (
              <div key="note" className={STAGE_IN} data-testid="advisor-stage" data-step={advisor.step}>
                <Eyebrow tone="accent">Last one · optional</Eyebrow>
                <h2 className="type-display-md text-fg mt-3">Anything the advisor should read before the call?</h2>
                <textarea
                  rows={4}
                  value={advisor.note}
                  onChange={(e) => dispatch({ type: "advisor/note", note: e.target.value })}
                  aria-label="Note for the advisor"
                  placeholder="A concern, a deadline, a buyer to avoid. Rough notes are fine."
                  className="type-body text-fg placeholder:text-fg-3 border-line bg-surface mt-6 w-full resize-y rounded-lg border px-5 py-3"
                />
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button onClick={finish}>Finish</Button>
                  <TextButton onClick={finish}>Nothing to add</TextButton>
                </div>
              </div>
            ) : null}

            {done ? (
              <div key="done" className={STAGE_IN} data-testid="advisor-stage" data-step={advisor.step}>
                <Eyebrow tone="accent">Briefing ready</Eyebrow>
                <h2 className="type-display-md text-fg mt-3">Your advisor reads this before the call.</h2>
                <p className="type-body text-fg-2 mt-3 max-w-[440px]">
                  {copyFailed
                    ? "We could not copy the briefing. The booking link below carries it."
                    : "We copied the briefing so you can paste it into the booking notes."}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button href={bookingUrl(advisor)} target="_blank" rel="noopener">
                    Book the call
                  </Button>
                  <TextButton onClick={emailInstead}>Send the briefing by email instead</TextButton>
                </div>
                {emailError ? (
                  <p aria-live="polite" className="type-caption text-error mt-4">
                    We could not prepare the email. Write to {CONTACT.hello} directly.
                  </p>
                ) : null}
                {advisor.emailed ? (
                  <p aria-live="polite" className="type-caption text-accent mt-4">
                    {emailCopyFailed ? ADVISOR_EMAILED_COPY.notCopied : ADVISOR_EMAILED_COPY.copied}
                  </p>
                ) : null}
                <p className="type-caption text-fg-3 mt-5">
                  Nothing you enter here leaves this page until you book or email.
                </p>
                <TextButton onClick={() => dispatch({ type: "advisor/restart" })} className="mt-4">
                  Start over
                </TextButton>
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 pt-6">
              {advisorCanGoBack(advisor) ? (
                <TextButton onClick={() => dispatch({ type: "advisor/back" })}>Change my last answer</TextButton>
              ) : (
                <span />
              )}
              {asking ? <TextButton onClick={finish}>Skip the questions, just book</TextButton> : null}
            </div>
          </div>

          <div className="bg-surface-2 px-6 py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-1">
              <Eyebrow as="span">Advisor briefing</Eyebrow>
              <span className="type-fine-print text-fg-3">Builds as you answer</span>
            </div>
            {/* briefingRows lists one row per question in question order, then the note: the row the current step
                fills is the row at advisor.step (none once the briefing is ready). */}
            <Card padded={false} className="mt-3 px-5 py-1" data-testid="advisor-briefing">
              {briefingRows(advisor).map((row, i) => (
                <BriefingRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  current={i === advisor.step && i <= ADVISOR_NOTE_STEP}
                />
              ))}
            </Card>
            <Eyebrow className="mt-6">Call agenda</Eyebrow>
            <div className="mt-2 flex flex-col" data-testid="advisor-agenda">
              {/* Keyed by text, so the line that changes lands and the others hold still. */}
              {callAgenda(advisor.answers).map((item, i) => (
                <div
                  key={item}
                  className={cn("border-line-soft grid grid-cols-[28px_1fr] gap-2 border-b py-2", ROW_IN)}
                >
                  <span className="tabular type-caption text-accent">{padIndex(i + 1)}</span>
                  <span className="type-caption text-fg-2">{item}</span>
                </div>
              ))}
            </div>
            <p className="type-fine-print text-fg-3 mt-5 leading-[1.5]">Not shared outside Heirloom.</p>
          </div>
        </div>
      </Card>
    </Dialog>
  )
}
