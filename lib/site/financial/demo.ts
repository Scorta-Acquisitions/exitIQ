import type { DemoScript } from "@/lib/site/demo/clock"
import {
  FINANCIAL_TITLE,
  FOOT_CAPTIONS,
  type LedgerLineData,
  type LedgerLineId,
  type LineStatus,
  RECORDS_APART,
  RIDGELINE_BASE,
  RIDGELINE_LINES,
  RIDGELINE_RANGE_AFTER,
  RIDGELINE_RANGE_BEFORE,
  RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT,
  STATUS_WORD,
  USED_IN_ITEMS,
} from "@/lib/site/financial/data"
import { formatDollars } from "@/lib/site/format"

/**
 * The financial demo as pure functions: Project Ridgeline's four lines settling one at a time, and the one
 * figure they produce. The component holds no figure of its own — it renders `ledgerAt(beat)` — so every
 * state the screen can show is unit-tested in `lib/site/__tests__/financial-demo.test.ts`.
 *
 * The truth the demo carries: an add-back holds only with a record behind it. The $27,600 of family payroll
 * is $845,000 of adjusted earnings with the payroll register attached, and $817,400 without it, which is
 * what the hover preview shows.
 */

/** The six beats of one play, in order. */
export type FinancialBeatId = "arrived" | "note" | "register" | "receipts" | "invoice" | "used"

/** Whole dollars with thousands separators; module-level so the count-up hook keeps one reference. */
export const money = (n: number) => formatDollars(n)

/** The line each beat settles; the first beat settles nothing and the last one only lights the foot. */
const SETTLES: Record<FinancialBeatId, LedgerLineId | null> = {
  arrived: null,
  note: "revenue",
  register: "ownerComp",
  receipts: "personal",
  invoice: "oneoff",
  used: null,
}

const BEAT_IDS = Object.keys(SETTLES) as FinancialBeatId[]

export const FINANCIAL_SCRIPT: DemoScript = {
  prefix: "fin",
  beats: [
    { id: "arrived", at: 0, say: "Four lines as they arrived, none of them settled" },
    { id: "note", at: 1440, say: "Revenue timing, explained by a one-page note" },
    { id: "register", at: 3060, say: "Owner and family compensation, supported by the payroll register" },
    { id: "receipts", at: 4680, say: "Personal charges, supported by receipts" },
    { id: "invoice", at: 6300, say: "One-time items, supported by the invoice" },
    { id: "used", at: 7740, say: "Every line supported, and the four places the figure is used" },
  ],
  still: "used",
  label: `${FINANCIAL_TITLE}, a worked example that plays itself`,
}

/** The index of a beat in the script, or 0 for a beat this demo does not have. */
function beatPosition(beat: string): number {
  const index = BEAT_IDS.indexOf(beat as FinancialBeatId)
  return index < 0 ? 0 : index
}

/** How far into the play a line is settled: the position of the beat that attaches its record. */
function settledAt(id: LedgerLineId): number {
  return BEAT_IDS.findIndex((b) => SETTLES[b] === id)
}

/** One line of Ridgeline's adjustment schedule, as the screen reads it at one beat. */
export interface LedgerLineView {
  id: LedgerLineId
  label: string
  /** "Books $4,262,000 · Tax return $4,240,000 · $22,000 apart". */
  records: string
  /** The amount in the column, or null for the revenue timing, which rests on no figure. */
  amount: string | null
  status: LineStatus
  /** The status in this line's own vocabulary: "Not counted" and "Timing, explained" for the revenue line. */
  statusText: string
  /** Whether this beat has attached the line's record. */
  settled: boolean
  /** The record attached, once there is one. */
  evidence: string | null
  /** The 3px meter, as a whole percent: full once the line is settled. */
  meter: number
  /** Whether this beat is the one settling this line: the row bands. */
  current: boolean
}

/** The foot: the figure the four lines produce, why it reads that way, and the valuation range it carries. */
export interface FootView {
  figure: number
  figureText: string
  caption: string
  range: string
  /** The second caption, the alternative the last beat names; null at every other beat. */
  alt: string | null
}

/** One of the four places the finished figure goes, lit at the last beat 60ms apart. */
export interface UsedInView {
  label: string
  lit: boolean
}

export interface LedgerView {
  lines: LedgerLineView[]
  foot: FootView
  usedIn: UsedInView[]
}

/** A line's status word: its own vocabulary where it has one (the revenue timing), else the shared noun. */
export function statusWord(line: Pick<LedgerLineData, "statusWords">, status: LineStatus): string {
  return line.statusWords?.[status] ?? STATUS_WORD[status]
}

/**
 * A line's records line: each record with its figure, and for a line whose amount is not in the column (the
 * revenue timing) the difference closing it: "Books $4,262,000 · Tax return $4,240,000 · $22,000 apart".
 */
export function recordsLine(line: Pick<LedgerLineData, "records" | "amount" | "countsInOpen">): string {
  const parts = line.records.map(([name, value]) => `${name} ${money(value)}`)
  if (!line.countsInOpen) parts.push(RECORDS_APART(money(line.amount)))
  return parts.join(" · ")
}

/** The caption under the figure at each beat: what moved it, or why it did not move. */
function captionAt(position: number): string {
  const line = (id: LedgerLineId) => RIDGELINE_LINES.find((l) => l.id === id)!
  switch (BEAT_IDS[position]) {
    case "note":
      return FOOT_CAPTIONS.note
    case "register":
      return FOOT_CAPTIONS.register(money(line("ownerComp").amount))
    case "receipts":
      return FOOT_CAPTIONS.receipts(money(line("personal").amount))
    case "invoice":
    case "used":
      return FOOT_CAPTIONS.shown
    default:
      return FOOT_CAPTIONS.base
  }
}

/**
 * The foot with the family payroll left in costs: the $27,600 without the register behind it, the figure it
 * leaves, and the valuation range that figure carries. This is the demo's one alternative, and the one thing
 * a hover previews.
 */
export function footLeftInCosts(): FootView {
  return {
    figure: RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT,
    figureText: money(RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT),
    caption: FOOT_CAPTIONS.leftInCosts,
    range: RIDGELINE_RANGE_BEFORE,
    alt: null,
  }
}

/**
 * The whole screen at one beat. Lines settle in the script's order, each one adding its amount to adjusted
 * earnings unless it is the revenue timing, which is explained and never counted; the valuation range moves
 * with the last line; the four Used-in items light at the last beat.
 *
 * `leftInCosts` is the hover preview: once the family payroll line is settled, hovering it shows the figure
 * without the register behind it. Before that beat the flag changes nothing, so a pointer resting on the row
 * can never show a consequence the demo has not reached.
 */
export function ledgerAt(beat: string, leftInCosts = false): LedgerView {
  const position = beatPosition(beat)
  const ownerCompSettled = position >= settledAt("ownerComp")
  const previewing = leftInCosts && ownerCompSettled

  const lines = RIDGELINE_LINES.map((line): LedgerLineView => {
    const settled = position >= settledAt(line.id)
    const removed = previewing && line.id === "ownerComp"
    const status: LineStatus = removed ? "removed" : settled ? "supported" : "open"
    return {
      id: line.id,
      label: line.label,
      records: recordsLine(line),
      amount: line.countsInOpen ? money(line.amount) : null,
      status,
      statusText: statusWord(line, status),
      settled,
      evidence: settled && !removed ? line.evidence : null,
      meter: status === "supported" ? 100 : 0,
      current: SETTLES[BEAT_IDS[position]!] === line.id,
    }
  })

  const figure = RIDGELINE_LINES.filter((l) => l.countsInOpen && position >= settledAt(l.id)).reduce(
    (sum, l) => sum + l.amount,
    RIDGELINE_BASE
  )
  const last = BEAT_IDS[position] === "used"
  const foot: FootView = previewing
    ? footLeftInCosts()
    : {
        figure,
        figureText: money(figure),
        caption: captionAt(position),
        range: position >= settledAt("oneoff") ? RIDGELINE_RANGE_AFTER : RIDGELINE_RANGE_BEFORE,
        alt: last ? `${money(RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT)} ${FOOT_CAPTIONS.leftInCosts}` : null,
      }

  return { lines, foot, usedIn: USED_IN_ITEMS.map((label) => ({ label, lit: last })) }
}
