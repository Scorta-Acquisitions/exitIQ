/**
 * The four fictional letters of intent for Project Ridgeline used by the offer-comparison demo, and
 * every word the section shows around them. Amounts are in millions of dollars.
 */

export type OfferId = "A" | "B" | "C" | "D"

export interface Offer {
  id: OfferId
  who: string
  sub: string
  head: number
  cash: number
  note: number
  earn: number
  roll: number
  /** Probability-like certainty of closing, 0..1. */
  cert: number
  trans: string
  /** How well the plan protects employees and the company name, 0..100. */
  staff: number
  fin: string
  excl: string
  staffNote: string
}

export const OFFERS: Offer[] = [
  {
    id: "A",
    who: "Regional consolidator",
    sub: "Owns four contractors in the Carolinas",
    head: 4.3,
    cash: 2.75,
    note: 0.65,
    earn: 0.6,
    roll: 0.3,
    cert: 0.82,
    trans: "12 months, full time",
    staff: 95,
    fin: "Bank line plus SBA 7(a) top-up",
    excl: "60 days",
    staffNote: "Kept all staff, the name and the location in three prior acquisitions. Verified against public record.",
  },
  {
    id: "B",
    who: "Independent searcher",
    sub: "First acquisition, committed investor group",
    head: 4.55,
    cash: 2.6,
    note: 0.95,
    earn: 0.55,
    roll: 0.45,
    cert: 0.62,
    trans: "4 months",
    staff: 70,
    fin: "SBA 7(a), contingent, no prior closes",
    excl: "90 days",
    staffNote: "Intends to keep everyone. No prior acquisitions to check the answer against.",
  },
  {
    id: "C",
    who: "Private equity add-on",
    sub: "Platform already owns two similar firms",
    head: 4.05,
    cash: 3.1,
    note: 0.15,
    earn: 0,
    roll: 0.8,
    cert: 0.93,
    trans: "3 months advisory, 24-month rollover lock",
    staff: 55,
    fin: "Committed equity and debt, no financing condition",
    excl: "45 days",
    staffNote: "Field staff retained; back office consolidated into the platform in two of two prior deals.",
  },
  {
    id: "D",
    who: "Strategic buyer",
    sub: "Competitor in an overlapping service area",
    head: 4.65,
    cash: 3.45,
    note: 0.45,
    earn: 0.75,
    roll: 0,
    cert: 0.75,
    trans: "12 months, full time",
    staff: 30,
    fin: "Cash on balance sheet",
    excl: "60 days",
    staffNote: "Overlapping crews in the same metro. Two prior acquisitions saw duplicate roles removed within a year.",
  },
]

export type Priority = "cash" | "certainty" | "upside" | "team"

export const PRIORITIES: Array<{ v: Priority; l: string }> = [
  { v: "cash", l: "Most cash at closing" },
  { v: "certainty", l: "Highest chance of closing" },
  { v: "upside", l: "Keep future upside" },
  { v: "team", l: "Protect employees and the company name" },
]

/** The words the offer comparison sets around the four cards: its header, its two group labels, and its badges. */
export const OFFER_COPY = {
  heading: "Compare offers",
  lead: "The highest price is not always the best offer. We rank offers on what you receive, when, and how likely the deal is to close.",
  figureAlt: "Four sealed cream envelopes with brass clasps",
  priorityGroup: "Choose your most important deal priority",
  priorityPrompt: "What matters most to you?",
  cardsGroup: "Compare cash, terms, conditions, and closing risk",
  bestBadge: "Strongest fit",
  headlineBadge: "Highest headline price",
  choose: "Choose an offer.",
  reading: "Reading the offer terms...",
  /** The label of every figure a card and the detail panel print, in the order the panel reads them. */
  terms: {
    head: "Headline price",
    cash: "Cash at closing",
    later: "Money paid later",
    retained: "Retained ownership",
    financing: "Buyer financing",
    stay: "Time you stay",
    team: "Team and company name",
    risk: "Closing risk",
  },
} as const

/** The heading over one letter's full terms: "Letter of intent A · Regional consolidator". */
export function letterTitle(o: Offer): string {
  return `Letter of intent ${o.id} · ${o.who}`
}

export const PRIORITY_WHY: Record<Priority, string> = {
  cash: "Ranks the cash you receive at closing first, then discounts money paid later for timing and risk.",
  certainty: "Rewards committed financing, a proven buyer, fewer conditions, and a shorter path to close.",
  upside: "Gives more weight to retained ownership and performance payments that preserve future value.",
  team: "Looks at written plans for employees, the company name, and locations, plus what the buyer has done before.",
}
