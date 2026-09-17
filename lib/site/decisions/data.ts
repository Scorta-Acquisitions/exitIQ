/**
 * Project Ridgeline worked-example figures (fictional) and every word the four-decisions demo shows. The demo
 * computes its figures from the four letters in lib/site/offers/data.ts, the eight stages in
 * lib/site/content/stages.ts and the nine tasks below; the only timing fact is the note in
 * lib/site/content/speed.ts. Nothing here states a duration, a count of buyers, or a market statistic.
 */
import { SPEED_COMPARISON } from "@/lib/site/content/speed"
import type { DemoWords } from "@/lib/site/demo/chrome"
import { type OfferId, PRIORITIES } from "@/lib/site/offers/data"
import { ANCHORS } from "@/lib/site/routes"

/** The few words beside the screen: what the demo argues, in one heading and one sentence, with no eyebrow. */
export const SECTION_WORDS: DemoWords = {
  heading: "You make four decisions. We run the rest.",
  sentence:
    "Eight stages take a company from preparation to closing. Heirloom carries all eight, and brings you the four decisions only an owner can make.",
}

/** The section's one link: the stage roadmap the strip across the screen is drawn from. */
export const SECTION_LINK = { href: ANCHORS.saleStages, label: "The eight stages" }

/** The name assistive technology reads for the demo's root, and the anchor the tile carries. */
export const DEMO_LABEL = "The four decisions, a worked example that plays itself"
export const DEMO_ANCHOR = "four-decisions"

/** What the screen shows, after the company name, in the frame's header. */
export const DEMO_SUBJECT = "Sale plan"

/** Heirloom's nine tasks, each with the owner's decision (an index into DECISION_IDS) that unlocks it. */
export const HEIRLOOM_HANDLES: Array<{ t: string; by: 0 | 1 | 2 | 3 }> = [
  { t: "Organize and reconcile the financials", by: 0 },
  { t: "Build the valuation and sale materials", by: 0 },
  { t: "Research and contact buyers privately", by: 1 },
  { t: "Screen buyers and manage NDAs", by: 1 },
  { t: "Answer routine diligence questions from approved records", by: 1 },
  { t: "Prepare you for buyer meetings", by: 2 },
  { t: "Compare and negotiate offers", by: 3 },
  { t: "Coordinate diligence, financing, lawyers, and closing", by: 3 },
  { t: "Send a weekly update", by: 3 },
]

export type DecisionId = "when" | "rules" | "meet" | "priority"

/** The four decisions in the order the owner takes them (the index is the step). */
export const DECISION_IDS: DecisionId[] = ["when", "rules", "meet", "priority"]

/** 0-based index into SALE_STAGES where each decision sits: Goals, Privacy, Meetings, Offers. */
export const DECISION_STAGE: Record<DecisionId, number> = { when: 0, rules: 3, meet: 5, priority: 6 }

/** How many stages are lit once the decision is answered (Heirloom runs the stages between the owner's decisions). */
export const LIT_AFTER_ANSWER: Record<DecisionId, number> = { when: 3, rules: 5, meet: 6, priority: 8 }

/** Which letter an exclusion removes from Ridgeline's table (D is the competitor, C the private equity add-on). */
export const RULE_REMOVES: Record<string, OfferId | null> = {
  "rules:competitors": "D",
  "rules:pe": "C",
  "rules:named": null,
  "rules:none": null,
}

/**
 * Which letters a meeting filter keeps: financing shown (A, C, D; A's bank line and SBA top-up and D's balance sheet
 * are shown, C's is committed, B's SBA loan is contingent per its `fin`), a written staff plan scored 70 or more of
 * 100 (A 95, B 70), or every qualified buyer.
 */
export const MEET_KEEPS: Record<string, OfferId[]> = {
  "meet:financed": ["A", "C", "D"],
  "meet:team": ["A", "B"],
  "meet:all": ["A", "B", "C", "D"],
}

/** "A traditional sale runs 6 to 9 months. Heirloom averages 3 to 4." The site's one timing fact. */
export const TIMING_LINE = `A traditional sale runs ${SPEED_COMPARISON.bars[0].note}. Heirloom averages 3 to 4.`

/** Goals, Numbers, Value and Privacy precede Market in SALE_STAGES (unit-tested: the index of "Market" is 4). */
export const STAGES_BEFORE_CONTACT = "4 of 8"

/** The note under the privacy decision: the rule is set before a single buyer hears the business exists. */
export const BEFORE_CONTACT_LINE = `${STAGES_BEFORE_CONTACT} stages before any buyer is contacted`

/** One answer of one decision: the value the demo plays and the words it reads. */
export interface DecisionChip {
  v: string
  label: string
}

export interface Decision {
  id: DecisionId
  q: string
  chips: DecisionChip[]
}

export const DECISIONS: Decision[] = [
  {
    id: "when",
    q: "When would you want the sale to close?",
    chips: [
      { v: "when:soon", label: "Within a year" },
      { v: "when:mid", label: "In 1 to 2 years" },
      { v: "when:depends", label: "Depends on what I learn" },
    ],
  },
  {
    id: "rules",
    q: "Which buyers must never hear the business is for sale?",
    chips: [
      { v: "rules:competitors", label: "Competitors in my service area" },
      { v: "rules:pe", label: "Private equity groups" },
      { v: "rules:named", label: "Named companies I list" },
      { v: "rules:none", label: "No exclusions, I decide exceptions" },
    ],
  },
  {
    id: "meet",
    q: "Which qualified buyers do you want to meet?",
    chips: [
      { v: "meet:financed", label: "Buyers who have shown their financing" },
      { v: "meet:team", label: "Buyers with a written plan for the team and the name" },
      { v: "meet:all", label: "Every qualified buyer" },
    ],
  },
  {
    id: "priority",
    q: "What matters most when you choose the offer?",
    // The offer page's four priorities are this demo's fourth decision, so both sections read one list.
    chips: PRIORITIES.map((p) => ({ v: `priority:${p.v}`, label: p.l })),
  },
]

/** The answers the demo plays: one owner's path through the four decisions. */
export const OWNER_ANSWERS: Record<DecisionId, string> = {
  when: "when:mid",
  rules: "rules:competitors",
  meet: "meet:financed",
  priority: "priority:certainty",
}

/** Under the answer: these are one owner's choices, not a recommendation. */
export const AS_ONE_OWNER = "as one owner chose"

/** Under what Heirloom produced while the owner was not asked anything. */
export const READY_BEFORE = "ready before the next decision"

/** The name of the priority row for assistive technology: what the words are, not a question being asked. */
export const PRIORITY_ROW_LABEL = "Priorities, preview how each ranks the offers"

/** The eyebrow over a decision, and the two lines the screen reads between decisions. */
export const DECISION_LABEL = (n: number, total: number, stage: string) => `Decision ${n} of ${total} · ${stage}`
export const WORKING_LABEL = "Heirloom is working"
export const NEXT_DECISION = (stage: string) => `Next decision at ${stage}`

/** The last line of the play: the four decisions against the nine tasks (unit-tested against both lists). */
export const CLOSE_LINE = "Four decisions were yours. Nine tasks were not."

/** The row that counts Heirloom's tasks: "Handled without you · 5 of 9 · Answer routine diligence questions". */
export const HANDLED_LABEL = "Handled without you"

/** Every word a letter row reads beside its own figures. */
export const LETTER_WORDS = {
  /** A letter that has not arrived yet. */
  sealed: "Not yet received",
  /** A letter the rules left in play, with the buyer's own description after it. */
  onTable: "On the table",
  /** The letter an exclusion rule removed before the buyer heard anything. */
  removed: "Left the table",
  /** The buyer the meeting rule keeps off the calendar, with that buyer's own financing line after it. */
  waiting: "Not on the calendar",
  /** The letter the priority chose, with the offer page's closing-risk word after it. */
  chosen: "Chosen",
  certainty: (label: string) => `${label} certainty`,
  /** The two ghost rows of a priority preview: what the owner's own rules already ruled out. */
  removedByRules: "removed by your rules",
  notMet: "not met",
  /** The row's own name: "Offer D". */
  letter: (id: OfferId) => `Offer ${id}`,
} as const

/** The figure labels the letter detail reads, in the order the line sets them. */
export const LETTER_DETAIL = {
  headline: "Headline",
  cash: "Cash",
  certainty: "Certainty",
  staff: "Staff plan",
  outOf: "of 100",
}

export const FIGURE_LABELS = {
  stage: (n: number, label: string) => `Stage ${n} of 8 · ${label}`,
}
