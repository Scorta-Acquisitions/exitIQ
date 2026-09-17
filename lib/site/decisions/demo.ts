import { SALE_STAGES } from "@/lib/site/content/stages"
import {
  AS_ONE_OWNER,
  BEFORE_CONTACT_LINE,
  CLOSE_LINE,
  DECISION_IDS,
  DECISION_LABEL,
  DECISION_STAGE,
  type DecisionId,
  DECISIONS,
  DEMO_LABEL,
  FIGURE_LABELS,
  HANDLED_LABEL,
  HEIRLOOM_HANDLES,
  LETTER_DETAIL,
  LETTER_WORDS,
  LIT_AFTER_ANSWER,
  MEET_KEEPS,
  NEXT_DECISION,
  OWNER_ANSWERS,
  READY_BEFORE,
  RULE_REMOVES,
  TIMING_LINE,
  WORKING_LABEL,
} from "@/lib/site/decisions/data"
import type { DemoScript } from "@/lib/site/demo/clock"
import { formatMillions } from "@/lib/site/format"
import { type Offer, type OfferId, OFFERS, PRIORITIES, type Priority } from "@/lib/site/offers/data"
import { certaintyLabel, rankOffers, rankOrder } from "@/lib/site/offers/score"

/**
 * The four-decisions demo as pure functions: the script it plays and the whole board at any beat of it.
 * Every figure is computed — the stages from `DECISION_STAGE` and `LIT_AFTER_ANSWER`, the tasks from
 * `HEIRLOOM_HANDLES`, the letters from Project Ridgeline's four letters of intent under the owner's own
 * rules, and the letter the owner ends with from `rankOffers` over what is left on the table. Nothing is
 * typed in, and the component renders what `boardAt` returns. Unit-tested in
 * `lib/site/__tests__/decisions-demo.test.ts`.
 */

/** What a letter is doing at a beat: unopened, on the table, removed by a rule, off the calendar, chosen. */
export type LetterState = "sealed" | "on" | "removed" | "filtered" | "winner"

export interface LetterView {
  id: OfferId
  /** "Offer D". */
  name: string
  /** The buyer, once the letter is face up; empty while it is sealed. */
  who: string
  /** The headline price, once the letter is face up; empty while it is sealed. */
  headline: string
  state: LetterState
  /** The one line under the row: where the letter stands, with the buyer's own fact after it. */
  note: string
  /** The same line where there is no room for the fact (phones), so the row is one line high everywhere. */
  shortNote: string
  /** 1-based place in the row order, so a re-rank travels instead of redrawing. */
  rank: number
  /** Whether the row reads struck through: only the letter an owner's exclusion took off the table. */
  struck: boolean
}

export interface DecisionView {
  /** "Decision 2 of 4 · Privacy", "Heirloom is working", or the closing stage line. */
  eyebrow: string
  /** The question, or the stage the next decision waits at; empty at the close. */
  line: string
  /** The owner's answer, or the closing line; empty while Heirloom works. */
  answer: string
  /** Under the answer: that this is one owner's choice, plus the privacy note where it applies. */
  caption: string
}

export interface PriorityView {
  v: Priority
  label: string
  /** True for the priority the owner chose, once the offer decision is made: the one word the row lights. */
  lit: boolean
}

export interface HandledView {
  count: number
  total: number
  /** The last task this path has unlocked. */
  last: string
  /** "Handled without you · 5 of 9 · Answer routine diligence questions from approved records". */
  line: string
}

export interface BoardFrame {
  /** How many of the eight stages are lit. */
  lit: number
  /** The 0-based stage the decision on screen sits in, or null while Heirloom works. */
  current: number | null
  decision: DecisionView
  letters: LetterView[]
  /** The letters still in play, in letter order, for `data-on-table`. */
  onTable: OfferId[]
  handled: HandledView
  /** The four priorities the offer decision weighs: on screen from the first beat, one lit once it is made. */
  priorities: PriorityView[]
  /** The one timing fact, a fact of the plan rather than a consequence, so it stands at every beat. */
  timing: string
}

/** A beat either puts a decision on screen, runs the stages between two decisions, or closes the sale. */
type BeatKind = { decision: DecisionId } | { working: DecisionId } | { close: true }

interface BeatSpec {
  id: string
  at: number
  kind: BeatKind
}

const ALL_IDS: OfferId[] = OFFERS.map((o) => o.id)

/** The four letters by id. `OFFERS` carries one entry per `OfferId`, so every lookup lands. */
const OFFER_BY_ID = Object.fromEntries(OFFERS.map((o) => [o.id, o])) as Record<OfferId, Offer>

function offerOf(id: OfferId): Offer {
  return OFFER_BY_ID[id]
}

function stageLabel(index: number): string {
  return SALE_STAGES[index]?.label ?? ""
}

/** The last stage's own title, which the close stands under: "Diligence, financing, and closing". */
function closingTitle(): string {
  return SALE_STAGES[SALE_STAGES.length - 1]?.title ?? ""
}

/** What the last stage hands the owner: "A completed ownership transfer." */
function closingReceive(): string {
  return SALE_STAGES[SALE_STAGES.length - 1]?.receive ?? ""
}

/**
 * What Heirloom produced in the stages it ran after a decision: the artifacts of every stage between that
 * decision's own and the one the next decision sits at ("Financials, Valuation" after the timing decision).
 */
function artifactsRun(after: DecisionId): string[] {
  const from = DECISION_STAGE[after] + 1
  const to = LIT_AFTER_ANSWER[after]
  return SALE_STAGES.slice(from, to).map((stage) => stage.artifact)
}

function decisionOf(id: DecisionId) {
  const decision = DECISIONS.find((d) => d.id === id)
  if (!decision) throw new Error(`no decision ${id}`)
  return decision
}

/** The words of the answer the demo plays for a decision. */
export function ownerAnswer(id: DecisionId): string {
  const value = OWNER_ANSWERS[id]
  return decisionOf(id).chips.find((c) => c.v === value)?.label ?? ""
}

/**
 * The seven beats: the four decisions at the stages they sit in, the two stretches Heirloom runs between
 * them, and the close. Each beat is named for its stage, so `?demo=dec:meetings` reads as the screen does.
 */
const BEATS: BeatSpec[] = [
  { id: "goals", at: 0, kind: { decision: "when" } },
  { id: "numbers", at: 1800, kind: { working: "when" } },
  { id: "privacy", at: 3600, kind: { decision: "rules" } },
  { id: "market", at: 5400, kind: { working: "rules" } },
  { id: "meetings", at: 6750, kind: { decision: "meet" } },
  { id: "offers", at: 8100, kind: { decision: "priority" } },
  { id: "close", at: 9450, kind: { close: true } },
]

/** What a keyboard step speaks at each beat: the decision and its answer, or the line the screen reads. */
function announcement(spec: BeatSpec): string {
  if ("decision" in spec.kind) {
    const id = spec.kind.decision
    return `${DECISION_LABEL(DECISION_IDS.indexOf(id) + 1, DECISION_IDS.length, stageLabel(DECISION_STAGE[id]))}. ${ownerAnswer(id)}`
  }
  if ("working" in spec.kind) return WORKING_LABEL
  return CLOSE_LINE
}

export const DECISIONS_SCRIPT: DemoScript = {
  prefix: "dec",
  beats: BEATS.map((b) => ({ id: b.id, at: b.at, say: announcement(b) })),
  still: "close",
  label: DEMO_LABEL,
}

function specFor(beat: string): BeatSpec {
  return BEATS.find((b) => b.id === beat) ?? BEATS[0]!
}

/** The decisions the owner has answered by this beat, in order. */
export function answeredAt(beat: string): DecisionId[] {
  const spec = specFor(beat)
  if ("close" in spec.kind) return [...DECISION_IDS]
  const id = "decision" in spec.kind ? spec.kind.decision : spec.kind.working
  return DECISION_IDS.slice(0, DECISION_IDS.indexOf(id) + 1)
}

/** How many of the eight stages are lit at a beat: the decision's own stage, or everything it unlocked. */
export function litStageCount(beat: string): number {
  const spec = specFor(beat)
  if ("decision" in spec.kind) return DECISION_STAGE[spec.kind.decision] + 1
  if ("working" in spec.kind) return LIT_AFTER_ANSWER[spec.kind.working]
  return LIT_AFTER_ANSWER[DECISION_IDS[DECISION_IDS.length - 1]!]
}

export type StageState = "done" | "current" | "later"

/** How one stage cell reads: the decision's own stage in the accent, the stages behind it dimmed as done. */
export function stageState(index: number, lit: number, current: number | null): StageState {
  if (index === current && index < lit) return "current"
  return index < lit ? "done" : "later"
}

/** "Stage 4 of 8 · Privacy": the stage the beat stands in, for the phone line and the strip's name. */
export function stageLine(lit: number, current: number | null): string {
  const index = current ?? lit - 1
  return FIGURE_LABELS.stage(index + 1, stageLabel(index))
}

/** The letters the owner's exclusion rule leaves, once that rule is answered. */
export function lettersOnTable(answered: DecisionId[]): OfferId[] {
  if (!answered.includes("rules")) return [...ALL_IDS]
  const removed = RULE_REMOVES[OWNER_ANSWERS.rules]
  return ALL_IDS.filter((id) => id !== removed)
}

/** The letters that reach the calendar: the table filtered by the meeting rule. */
export function lettersMet(answered: DecisionId[]): OfferId[] {
  if (!answered.includes("meet")) return lettersOnTable(answered)
  const keeps = MEET_KEEPS[OWNER_ANSWERS.meet] ?? []
  return lettersOnTable(answered).filter((id) => keeps.includes(id))
}

/** The priority the owner chose, as the offer page names it. */
export function ownerPriority(): Priority {
  const value = OWNER_ANSWERS.priority.slice("priority:".length)
  const priority = PRIORITIES.find((p) => p.v === value)
  if (!priority) throw new Error(`no priority ${OWNER_ANSWERS.priority}`)
  return priority.v
}

/** The letter the owner's priority picks from the buyers met; computed, never named. */
export function winnerAt(answered: DecisionId[]): OfferId | null {
  if (!answered.includes("priority")) return null
  const met = lettersMet(answered)
  if (met.length === 0) return null
  return rankOffers(
    ownerPriority(),
    met.map((id) => offerOf(id))
  ).bestId
}

/**
 * Where a letter stands, in two lengths: the state in a few words, and the same with the buyer's own fact
 * after it — the description an exclusion matched, the financing that keeps a buyer off the calendar, the
 * closing-risk word behind a choice. Every row reads one of these at every beat, so no row is ever blank.
 */
function notesFor(state: LetterState, offer: Offer): { note: string; shortNote: string } {
  if (state === "sealed") return { note: LETTER_WORDS.sealed, shortNote: LETTER_WORDS.sealed }
  if (state === "removed") {
    return { note: `${LETTER_WORDS.removed} · ${offer.sub}`, shortNote: LETTER_WORDS.removed }
  }
  if (state === "filtered") {
    return { note: `${LETTER_WORDS.waiting} · ${offer.fin}`, shortNote: LETTER_WORDS.waiting }
  }
  if (state === "winner") {
    const chosen = `${LETTER_WORDS.chosen} · ${LETTER_WORDS.certainty(certaintyLabel(offer.cert))}`
    return { note: chosen, shortNote: chosen }
  }
  return { note: `${LETTER_WORDS.onTable} · ${offer.sub}`, shortNote: LETTER_WORDS.onTable }
}

function viewOf(offer: Offer, state: LetterState, rank: number): LetterView {
  const faceUp = state !== "sealed"
  return {
    id: offer.id,
    name: LETTER_WORDS.letter(offer.id),
    who: faceUp ? offer.who : "",
    headline: faceUp ? formatMillions(offer.head) : "",
    state,
    ...notesFor(state, offer),
    rank,
    struck: state === "removed",
  }
}

/**
 * The four letters at a beat. They lie sealed until a decision turns one face up: the exclusion rule shows
 * the competitor's letter as it leaves, the meeting rule turns the rest over, and the priority lifts the
 * one it chooses to the top of the order.
 */
export function lettersAt(beat: string): LetterView[] {
  const answered = answeredAt(beat)
  const table = lettersOnTable(answered)
  const met = lettersMet(answered)
  const winner = winnerAt(answered)
  const rules = answered.includes("rules")
  const meet = answered.includes("meet")
  const stateOf = (id: OfferId): LetterState => {
    if (rules && !table.includes(id)) return "removed"
    if (!meet) return "sealed"
    if (!met.includes(id)) return "filtered"
    return id === winner ? "winner" : "on"
  }
  const order = winner ? [winner, ...ALL_IDS.filter((id) => id !== winner)] : [...ALL_IDS]
  return ALL_IDS.map((id) => viewOf(offerOf(id), stateOf(id), order.indexOf(id) + 1))
}

/** Heirloom's tasks unlocked by the decisions answered so far, with the last of them. */
export function handledAt(beat: string): HandledView {
  const answered = answeredAt(beat)
  const done = HEIRLOOM_HANDLES.filter((task) => answered.includes(DECISION_IDS[task.by]!))
  const last = done[done.length - 1]?.t ?? ""
  return {
    count: done.length,
    total: HEIRLOOM_HANDLES.length,
    last,
    line: `${HANDLED_LABEL} · ${done.length} of ${HEIRLOOM_HANDLES.length} · ${last}`,
  }
}

function decisionAt(beat: string): DecisionView {
  const spec = specFor(beat)
  if ("decision" in spec.kind) {
    const id = spec.kind.decision
    const stage = stageLabel(DECISION_STAGE[id])
    const caption = id === "rules" ? `${AS_ONE_OWNER} · ${BEFORE_CONTACT_LINE}` : AS_ONE_OWNER
    return {
      eyebrow: DECISION_LABEL(DECISION_IDS.indexOf(id) + 1, DECISION_IDS.length, stage),
      line: decisionOf(id).q,
      answer: ownerAnswer(id),
      caption,
    }
  }
  if ("working" in spec.kind) {
    const next = DECISION_IDS[DECISION_IDS.indexOf(spec.kind.working) + 1]
    return {
      eyebrow: WORKING_LABEL,
      line: next ? NEXT_DECISION(stageLabel(DECISION_STAGE[next])) : "",
      // What those stages hand the owner, so the beat states its own work instead of resting on empty space.
      answer: artifactsRun(spec.kind.working).join(", "),
      caption: READY_BEFORE,
    }
  }
  // The phone already reads "Stage 8 of 8 · Close" beside the ticks, so the close names what that stage is.
  return { eyebrow: closingTitle(), line: closingReceive(), answer: CLOSE_LINE, caption: AS_ONE_OWNER }
}

/** The whole board at a beat: what the screen reads, top to bottom. */
export function boardAt(beat: string): BoardFrame {
  const spec = specFor(beat)
  const answered = answeredAt(beat)
  const lit = litStageCount(beat)
  const current = "decision" in spec.kind ? DECISION_STAGE[spec.kind.decision] : null
  const chosen = ownerPriority()
  return {
    lit,
    current,
    decision: decisionAt(beat),
    letters: lettersAt(beat),
    onTable: lettersMet(answered),
    handled: handledAt(beat),
    priorities: PRIORITIES.map((p) => ({ v: p.v, label: p.l, lit: answered.includes("priority") && p.v === chosen })),
    timing: TIMING_LINE,
  }
}

/**
 * The preview a priority word shows: the same four envelopes ranked by that priority, including the two the
 * owner's own rules and meeting filter already took out, each struck with the reason. It is the section's
 * one consequence — a different priority picks a different letter, and the highest headline is not it.
 */
export function ghostRank(priority: Priority): LetterView[] {
  const table = lettersOnTable([...DECISION_IDS])
  const met = lettersMet([...DECISION_IDS])
  const order = rankOrder(priority)
  return ALL_IDS.map((id) => {
    const offer = offerOf(id)
    const rank = order.indexOf(id) + 1
    if (!table.includes(id)) {
      const note = `${LETTER_WORDS.removed} · ${LETTER_WORDS.removedByRules}`
      return { ...viewOf(offer, "removed", rank), note, shortNote: note }
    }
    if (!met.includes(id)) {
      const note = `${LETTER_WORDS.waiting} · ${LETTER_WORDS.notMet}`
      return { ...viewOf(offer, "filtered", rank), note, shortNote: note }
    }
    return viewOf(offer, "on", rank)
  })
}

/**
 * The second line a face-up letter row reads under the pointer: the four figures the ranking weighs. The
 * letter the owner's exclusion removed adds the last sentence of its own record, which is why the rule was
 * set; the others say nothing further, because nothing further is on their letter.
 */
export function letterDetail(id: OfferId): string[] {
  const o = offerOf(id)
  const figures = [
    `${LETTER_DETAIL.headline} ${formatMillions(o.head)}`,
    `${LETTER_DETAIL.cash} ${formatMillions(o.cash)}`,
    `${LETTER_DETAIL.certainty} ${o.cert.toFixed(2)}`,
    `${LETTER_DETAIL.staff} ${o.staff} ${LETTER_DETAIL.outOf}`,
  ]
  const lines = [figures.join(" · ")]
  if (id === RULE_REMOVES[OWNER_ANSWERS.rules]) lines.push(lastSentence(o.staffNote))
  return lines
}

/** The last sentence of a record line, which is the one that says what the buyer did before. */
function lastSentence(text: string): string {
  const parts = text.split(". ")
  return parts[parts.length - 1] ?? text
}
