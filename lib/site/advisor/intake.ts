import { chipLabel } from "@/lib/site/exitiq/questions"
import type { ExitIqAnswers } from "@/lib/site/exitiq/scoring"
import type { HeroStage, SellRevenue, SellTiming } from "@/lib/site/hero/funnel"
import { CONTACT } from "@/lib/site/routes"
import { ADVISOR_AGENDA, ADVISOR_CARE, ADVISOR_QUESTION_COUNT, ADVISOR_QUESTIONS, type AdvisorQuestionId } from "./data"

/**
 * Advisor intake state machine, expressed as pure functions over a small record.
 * Steps 0–4 are the five questions, 5 is the optional note, 6 is "briefing ready".
 */

export type AdvisorAnswers = Partial<Record<AdvisorQuestionId, string>>
export type AdvisorLabels = Partial<Record<AdvisorQuestionId, string>>
export type AdvisorPrefilled = Partial<Record<AdvisorQuestionId, true>>

export const ADVISOR_NOTE_STEP = ADVISOR_QUESTION_COUNT
export const ADVISOR_DONE_STEP = ADVISOR_QUESTION_COUNT + 1

export interface AdvisorState {
  open: boolean
  step: number
  answers: AdvisorAnswers
  labels: AdvisorLabels
  prefilled: AdvisorPrefilled
  ack: string | null
  busy: boolean
  note: string
  emailed: boolean
}

export const INITIAL_ADVISOR_STATE: AdvisorState = {
  open: false,
  step: 0,
  answers: {},
  labels: {},
  prefilled: {},
  ack: null,
  busy: false,
  note: "",
  emailed: false,
}

export interface PrefillContext {
  stage: HeroStage
  onScorePage: boolean
  iqAnswers: ExitIqAnswers
  sellTiming: SellTiming | null
  sellRevenue: SellRevenue | null
}

interface Prefill {
  answers: AdvisorAnswers
  labels: AdvisorLabels
}

/** Derive what the visitor has already told us elsewhere on the site. */
export function prefillFromSite(ctx: PrefillContext): Prefill {
  const answers: AdvisorAnswers = {}
  const labels: AdvisorLabels = {}
  const set = (k: AdvisorQuestionId, v: string, l: string) => {
    answers[k] = v
    labels[k] = l
  }
  const iq = ctx.iqAnswers

  if (ctx.stage === "offer") set("topic", "offer", "An offer or buyer I already have")
  else if (ctx.stage === "ready" || (ctx.onScorePage && Object.keys(iq).length))
    set("topic", "value", "Value and timing")
  else if (ctx.stage === "sellQ1" || ctx.stage === "sellQ2" || ctx.stage === "sellDone")
    set("topic", "sell", "Selling the business")

  const typeLabel = chipLabel("type", iq.type)
  if (iq.type && typeLabel) set("type", iq.type, typeLabel)
  const revLabel = chipLabel("rev", iq.rev)
  if (iq.rev && revLabel) set("rev", iq.rev, revLabel)

  if (ctx.sellTiming && answers.when === undefined) {
    const m: Record<SellTiming, [string, string]> = {
      now: ["soon", "Within a year"],
      mid: ["mid", "In 1 to 2 years"],
      explore: ["depends", "Depends on what I learn"],
    }
    const hit = m[ctx.sellTiming]
    set("when", hit[0], hit[1])
  }
  if (ctx.sellRevenue && answers.rev === undefined) {
    const m: Record<SellRevenue, [string, string]> = {
      u1: ["u1", "Under $1M"],
      "1-3": ["1-3", "$1M to $3M"],
      "3-10": ["3-10", "$3M to $10M"],
      "10+": ["10+", "More than $10M"],
    }
    const hit = m[ctx.sellRevenue]
    set("rev", hit[0], hit[1])
  }
  return { answers, labels }
}

/** First unanswered question at or after `from`, or the note step when all are answered. */
export function nextStep(from: number, answers: AdvisorAnswers): number {
  for (let i = from; i < ADVISOR_QUESTION_COUNT; i++) {
    const q = ADVISOR_QUESTIONS[i]
    if (q && answers[q.id] === undefined) return i
  }
  return ADVISOR_NOTE_STEP
}

/** Previous question the visitor answered inside the dialog (prefilled ones are skipped), or -1. */
export function prevStep(from: number, prefilled: AdvisorPrefilled): number {
  for (let i = Math.min(ADVISOR_QUESTION_COUNT - 1, from - 1); i >= 0; i--) {
    const q = ADVISOR_QUESTIONS[i]
    if (q && !prefilled[q.id]) return i
  }
  return -1
}

/**
 * Open the dialog. Fresh site prefills replace older prefills, but answers the visitor gave inside
 * the dialog stick. Returns the next state plus the acknowledgement line to show.
 */
export function openAdvisor(state: AdvisorState, ctx: PrefillContext): AdvisorState {
  const fresh = prefillFromSite(ctx)
  const merged: AdvisorAnswers = { ...state.answers }
  const labels: AdvisorLabels = { ...state.labels }
  const prefilled: AdvisorPrefilled = { ...state.prefilled }
  let carried = 0
  for (const k of Object.keys(fresh.answers) as AdvisorQuestionId[]) {
    if (merged[k] === undefined || state.prefilled[k]) {
      merged[k] = fresh.answers[k]
      labels[k] = fresh.labels[k]
      prefilled[k] = true
      carried++
    }
  }
  const step = state.step >= ADVISOR_NOTE_STEP ? state.step : nextStep(state.step, merged)
  const left = ADVISOR_QUESTION_COUNT - Object.keys(merged).length
  const ack =
    carried > 0 && step < ADVISOR_NOTE_STEP
      ? `Your earlier answers carried over. ${left === 1 ? "One question" : `${left} questions`} left before booking.`
      : state.ack
  return { ...state, open: true, emailed: false, answers: merged, labels, prefilled, step, ack }
}

function answerLabel(state: Pick<AdvisorState, "answers" | "labels">, qid: AdvisorQuestionId): string | null {
  const q = ADVISOR_QUESTIONS.find((x) => x.id === qid)
  const chip = q?.chips.find((x) => x[0] === state.answers[qid])
  if (chip) return chip[1]
  return state.labels[qid] ?? null
}

/** The briefing that reads from the advisor state: the answers, their carried labels, and the note. */
type Briefable = Pick<AdvisorState, "answers" | "labels" | "note">

export function briefingText(state: Briefable): string {
  const L = (qid: AdvisorQuestionId) => answerLabel(state, qid) ?? "Not answered"
  let t =
    "Advisor call briefing\nConversation: " +
    L("topic") +
    "\nBusiness: " +
    L("type") +
    "\nRevenue: " +
    L("rev") +
    "\nTarget timing: " +
    L("when") +
    "\nMatters most: " +
    L("care")
  if (state.note) t += "\nNote for the advisor: " + state.note
  return t
}

export interface BriefRow {
  label: string
  value: string | null
}

/** One row per question in question order, then the note. */
export function briefingRows(state: Briefable): BriefRow[] {
  const rows: BriefRow[] = [
    { label: "Conversation", value: answerLabel(state, "topic") },
    { label: "Business", value: answerLabel(state, "type") },
    { label: "Revenue", value: answerLabel(state, "rev") },
    { label: "Target timing", value: answerLabel(state, "when") },
    { label: "Matters most", value: answerLabel(state, "care") },
    { label: "Advisor note", value: state.note ? "Attached" : null },
  ]
  return rows
}

export function callAgenda(answers: AdvisorAnswers): string[] {
  const asked = answers.topic as keyof typeof ADVISOR_AGENDA | undefined
  let g = (asked && ADVISOR_AGENDA[asked] ? ADVISOR_AGENDA[asked] : ADVISOR_AGENDA.sell).slice(0, 3)
  if (answers.care && ADVISOR_CARE[answers.care]) g = g.slice(0, 2).concat([ADVISOR_CARE[answers.care] as string])
  return g
}

export function bookingUrl(state: Briefable): string {
  return `${CONTACT.advisorCalendar}?notes=${encodeURIComponent(briefingText(state).slice(0, 700))}`
}

/**
 * What the dialog says once the visitor sends the briefing by email. The mail client opens either way:
 * when the browser refuses the clipboard the line names the draft rather than a copy that does not exist.
 */
export const ADVISOR_EMAILED_COPY = {
  copied: `Your email app opened with the briefing. If it did not, the text is copied. Paste it into a message to ${CONTACT.hello}.`,
  notCopied: "Your email app opened with the briefing. We could not copy the text, so the draft carries it.",
} as const

/** Progress copy for the dialog header and the "question x of y" line (prefilled questions are not counted). */
export function progressLabel(state: Pick<AdvisorState, "step" | "prefilled">): {
  progress: string
  position: number
  total: number
} {
  const asked = ADVISOR_QUESTIONS.filter((q) => !state.prefilled[q.id])
  const current = ADVISOR_QUESTIONS[state.step]
  const position =
    state.step < ADVISOR_NOTE_STEP && current
      ? Math.max(1, asked.findIndex((q) => q.id === current.id) + 1)
      : asked.length
  const total = asked.length
  const progress =
    state.step < ADVISOR_NOTE_STEP
      ? `QUESTION ${position} OF ${total}`
      : state.step === ADVISOR_NOTE_STEP
        ? "OPTIONAL NOTE"
        : "BRIEFING READY"
  return { progress, position, total }
}
