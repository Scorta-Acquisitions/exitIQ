import {
  ACCESS_LOG,
  ADVISOR_ORG,
  CLOSING_LOG_CLAUSE,
  FIGURE_LABELS,
  HOME_FIELD_OPEN_AT,
  HOME_RECORD_FIELD_COUNT,
  HOME_STAGE_NAMES,
  homeStageName,
  LEVEL_ZERO_NAME,
  MATCHING_BUYER,
  MAX_PERMISSION_LEVEL,
  NEVER_CONTACTED,
  NOT_CONTACTED,
  PRIVACY_TITLE,
  STAND_IN_ORDER,
  STAND_INS,
  type StandInKey,
} from "@/lib/site/confidentiality/data"
import type { DemoWords } from "@/lib/site/demo/chrome"
import type { DemoScript } from "@/lib/site/demo/clock"
import { ROUTES } from "@/lib/site/routes"
import { TAB_BREAKPOINT } from "@/lib/site/scroll"

/**
 * "Who sees what", as a demo that plays itself: the Project Ridgeline company record opening one level at a
 * time, the four buyers reaching as far as each one did, and the access history filling in underneath.
 * Everything here is a pure function of a beat id — the component reads a frame and renders it — and every
 * value comes from `lib/site/confidentiality/data.ts`: the record's words are `RECORD_FIELDS[i].v[level]`,
 * the count is `HOME_FIELD_OPEN_AT`, the log lines are `ACCESS_LOG` entries, and the levels are the six
 * `PERMISSION_LEVELS`. Unit-tested in `lib/site/__tests__/privacy-demo.test.ts`.
 */

/** The words beside the screen: the heading, one sentence and one link, and no eyebrow above them. */
export const PRIVACY_WORDS: DemoWords & { link: { href: string; label: string } } = {
  heading: PRIVACY_TITLE,
  sentence:
    "Buyers start with an anonymous overview. They learn your name after signing an NDA and see detailed records only after we qualify them.",
  link: { href: ROUTES.confidentiality, label: "The six levels" },
}

/** The section's anchor id, so a link can land on it under the bar. */
export const PRIVACY_SECTION_ID = "who-sees-what"

/** What the screen shows, on the frame's header beside the company. */
export const PRIVACY_SUBJECT = "Company record"

/** The highest level the demo ever shows: the closing-parties level is outside the buyer log. */
export const HOME_MAX_LEVEL = MAX_PERMISSION_LEVEL - 1

/** Where the buyer list ends: the level no buyer in it reaches, and where the record leaves the log. */
export const PRIVACY_CLOSING_LINE = closingLine()

function closingLine(): string {
  const lowered = `${CLOSING_LOG_CLAUSE.charAt(0).toLowerCase()}${CLOSING_LOG_CLAUSE.slice(1)}`
  return `L${MAX_PERMISSION_LEVEL} · ${HOME_STAGE_NAMES[MAX_PERMISSION_LEVEL - 1]} · ${lowered}`
}

/** One beat of the play: the level the record stands at, and the access-log entries the beat adds. */
interface PrivacyBeatSpec {
  id: string
  at: number
  level: number
  /** Indexes into `ACCESS_LOG`, in the order the log gains them. */
  adds: number[]
  say: string
}

const BEATS: PrivacyBeatSpec[] = [
  {
    id: "rules",
    at: 0,
    level: 0,
    adds: [5],
    say: "Before outreach: nothing public, and an excluded competitor is never contacted",
  },
  { id: "overview", at: 1800, level: 1, adds: [], say: "Level 1: an anonymous overview, two of five fields" },
  { id: "nda", at: 3600, level: 2, adds: [4], say: "Level 2: the company name, after an NDA" },
  {
    id: "qualified",
    at: 5400,
    level: 3,
    adds: [2],
    say: "Level 3: the customer's contract and the adjustment schedule, after qualification",
  },
  { id: "selected", at: 7200, level: 4, adds: [0], say: "Level 4: the finalist the owner selected sees the names" },
  { id: "expired", at: 9000, level: 4, adds: [3], say: "Every view is recorded, and access expires" },
]

export const PRIVACY_SCRIPT: DemoScript = {
  prefix: "priv",
  beats: BEATS.map(({ id, at, say }) => ({ id, at, say })),
  still: "expired",
  label: `${PRIVACY_TITLE}, a worked example that plays itself`,
}

/** Who the record is open to: nobody, any buyer the rules allow, or one of the four organisations. */
export type ViewerKey = "none" | "matching" | StandInKey

/** Where a buyer stands: stopped by the owner's rules, not contacted yet, or looking at the record. */
export type BuyerRowState = "stopped" | "waiting" | "open"

export interface BuyerRowView {
  key: StandInKey
  org: string
  /** How far this buyer has got by this beat: never past the level it reached at Ridgeline. */
  level: number
  caption: string
  state: BuyerRowState
  /** The access-log entry that names this buyer, which its preview brings to the top of the log. */
  logIndex: number
}

export interface PrivacyView {
  beat: string
  level: number
  viewer: ViewerKey
  /** The record card's title: "Company record" until someone is looking, then "Viewing as …". */
  title: string
  /** The line under the record: "Level 2 · NDA signed · Visible 3 of 5". */
  levelLine: string
  visible: number
  rows: BuyerRowView[]
  /** Indexes into `ACCESS_LOG`, newest first. */
  log: number[]
  /** The log line a preview marks, so the buyer's own entry is the one banded. */
  banded: number | null
}

/**
 * How many of the five home record rows are open at `level`: the rows whose open level is at or below it,
 * counted over the whole record on every viewport. Outside the record's levels nothing is open.
 */
export function visibleCount(level: number): number {
  if (level < 0 || level > MAX_PERMISSION_LEVEL) return 0
  return HOME_FIELD_OPEN_AT.filter((at) => at <= level).length
}

/** Under this width every record value takes two lines, so the record gives its lower rows back to the screen. */
export const NARROW_PHONE = 360

/**
 * How many record rows the screen shows: five from the tablet breakpoint, four compact ones on a phone, and
 * the company's name alone on the narrowest phones (320 × 640), where the frame still has to stand inside one
 * screen under the bar and every value needs two lines. The count under the record reads the whole
 * five-field record whatever the screen shows.
 */
export function privacyFieldCount(width: number): number {
  if (width >= TAB_BREAKPOINT) return HOME_RECORD_FIELD_COUNT
  return width >= NARROW_PHONE ? 4 : 1
}

/**
 * Every record value is held to two lines whatever the level says, so the card's height never moves as the
 * words change: two lines is what the longest value takes at every width the demo renders it at.
 */
export const RECORD_VALUE_LINES = 2

/**
 * The same for the record's title: one line wherever "Viewing as {organisation}" fits on one, two on the
 * narrowest phones, where it wraps and would otherwise move the card every time the viewer changes.
 */
export function privacyTitleLines(width: number): 1 | 2 {
  return width >= NARROW_PHONE ? 1 : 2
}

/** How many access-log lines fit under the record: two from the tablet breakpoint, the latest one on a phone. */
export function privacyLogLimit(width: number): number {
  return width >= TAB_BREAKPOINT ? 2 : 1
}

/** The stage name at `level`: the public level has its own name, the other five are the disclosure stages. */
export function levelName(level: number): string {
  return level <= 0 ? LEVEL_ZERO_NAME : homeStageName(level)
}

/** The line under the record: the level, its stage name, and how much of the record is open. */
export function levelLine(level: number): string {
  return `Level ${level} · ${levelName(level)} · ${FIGURE_LABELS.visible(visibleCount(level), HOME_RECORD_FIELD_COUNT)}`
}

/** The same line where a phone has no room for it: one line at every level, so the frame never grows. */
export function shortLevelLine(level: number): string {
  return `L${level} · ${levelName(level)} · ${visibleCount(level)} of ${HOME_RECORD_FIELD_COUNT}`
}

/** The line under the record at `width`: the phone's short form under the tablet breakpoint. */
export function levelLineFor(level: number, width: number): string {
  return width >= TAB_BREAKPOINT ? levelLine(level) : shortLevelLine(level)
}

/**
 * One access-log entry as the demo reads it: a buyer's view names the person, the organisation, what they
 * opened and when; Heirloom's own actions name no organisation and carry their reason instead of a time.
 * `short` is the phone's reading, where one line has room for the person and the act alone.
 */
export function logLine(index: number, short = false): string {
  const entry = ACCESS_LOG[index]
  if (!entry) return ""
  if (short) return `${entry.who} · ${entry.act}`
  const parts =
    entry.org === ADVISOR_ORG ? [entry.who, entry.act, entry.note] : [entry.who, entry.org, entry.act, entry.t]
  return parts.filter((part) => part.length > 0).join(" · ")
}

/** How a buyer's row reads at `beatLevel`: its exclusion, its wait, or the stage it has reached. */
export function buyerRow(key: StandInKey, beatLevel: number): BuyerRowView {
  const si = STAND_INS[key]
  const level = Math.min(beatLevel, si.furthestLevel)
  const excluded = si.furthestLevel === 0
  const caption = excluded
    ? `${ACCESS_LOG[si.logIndex]?.note ?? ""} · ${NEVER_CONTACTED}`
    : level === 0
      ? NOT_CONTACTED
      : `${homeStageName(level)} · L${level}`
  return {
    key,
    org: si.org,
    level,
    caption,
    state: excluded ? "stopped" : level === 0 ? "waiting" : "open",
    logIndex: si.logIndex,
  }
}

/**
 * Who is looking at `level`: nobody below the overview, any buyer the owner's rules allow at the overview
 * (no organisation stops there), and otherwise the one organisation that reached exactly this level.
 */
export function viewerAt(level: number): ViewerKey {
  if (level <= 0) return "none"
  return STAND_IN_ORDER.find((key) => STAND_INS[key].furthestLevel === level) ?? "matching"
}

/** The name the record's title gives the viewer. */
export function viewerOrg(viewer: ViewerKey): string {
  if (viewer === "none") return ""
  return viewer === "matching" ? MATCHING_BUYER : STAND_INS[viewer].org
}

function titleFor(viewer: ViewerKey): string {
  return viewer === "none" ? FIGURE_LABELS.recordTitle : FIGURE_LABELS.viewingAs(viewerOrg(viewer))
}

/** The access-log entries the play has gathered by beat `index`, newest first. */
function logThrough(index: number): number[] {
  const out: number[] = []
  for (const beat of BEATS.slice(0, index + 1)) for (const add of beat.adds) out.unshift(add)
  return out
}

function specFor(beat: string): { spec: PrivacyBeatSpec; index: number } {
  const index = Math.max(
    0,
    BEATS.findIndex((b) => b.id === beat)
  )
  return { spec: BEATS[index]!, index }
}

/** Everything the screen shows at one beat of the play. */
export function recordAt(beat: string): PrivacyView {
  const { spec, index } = specFor(beat)
  const viewer = viewerAt(spec.level)
  return {
    beat: spec.id,
    level: spec.level,
    viewer,
    title: titleFor(viewer),
    levelLine: levelLine(spec.level),
    visible: visibleCount(spec.level),
    rows: STAND_IN_ORDER.map((key) => buyerRow(key, spec.level)),
    log: logThrough(index),
    banded: null,
  }
}

/**
 * The record as one of the four buyers sees it, which is what a pointer over that buyer's row previews: the
 * level that buyer reached, its own name on the title, and its own access-log line at the top of the log,
 * banded. The buyer list keeps the beat's own rows, so leaving the row restores the play untouched. No
 * preview reaches the closing-parties level: no buyer is a closing party.
 */
export function previewFor(key: StandInKey, from: PrivacyView = recordAt(PRIVACY_SCRIPT.still)): PrivacyView {
  const si = STAND_INS[key]
  const level = Math.min(si.furthestLevel, HOME_MAX_LEVEL)
  return {
    ...from,
    level,
    viewer: key,
    title: FIGURE_LABELS.viewingAs(si.org),
    levelLine: levelLine(level),
    visible: visibleCount(level),
    log: [si.logIndex, ...from.log.filter((i) => i !== si.logIndex)],
    banded: si.logIndex,
  }
}
