/**
 * exitIQ question bank. Seven questions, each with a stable id that the scoring model keys on.
 * `READ` holds the one-line "what this tells a buyer" insight shown after each answer.
 */

export const QUESTION_IDS = ["type", "rev", "trend", "sde", "books", "conc", "owner"] as const
export type QuestionId = (typeof QUESTION_IDS)[number]

export interface Chip {
  v: string
  l: string
}

export interface Question {
  id: QuestionId
  q: string
  note?: string
  chips: Chip[]
}

export const QUESTIONS: Question[] = [
  {
    id: "type",
    q: "What kind of business do you run?",
    note: "Choose the closest answer. Estimates are fine. You can change any answer before finishing.",
    chips: [
      { v: "field", l: "Home or field services" },
      { v: "recurring", l: "Recurring commercial services" },
      { v: "prof", l: "Business or professional services" },
      { v: "dist", l: "Manufacturing or distribution" },
      { v: "other", l: "Another type of business" },
    ],
  },
  {
    id: "rev",
    q: "About how much revenue did the business generate last year?",
    chips: [
      { v: "u1", l: "Under $1M" },
      { v: "1-2", l: "$1M to $2M" },
      { v: "2-3", l: "$2M to $3M" },
      { v: "3-5", l: "$3M to $5M" },
      { v: "5+", l: "More than $5M" },
    ],
  },
  {
    id: "trend",
    q: "Over the last three years, what has happened to revenue?",
    chips: [
      { v: "up", l: "Grown" },
      { v: "flat", l: "Stayed about the same" },
      { v: "down", l: "Declined" },
    ],
  },
  {
    id: "sde",
    q: "About how much did the business earn before your pay and income taxes?",
    note: "Use your best estimate. No one is checking it here.",
    chips: [
      { v: "a", l: "Under $150K" },
      { v: "b", l: "$150K to $350K" },
      { v: "c", l: "$350K to $750K" },
      { v: "d", l: "More than $750K" },
    ],
  },
  {
    id: "books",
    q: "If a buyer compared your books with your tax returns, how closely would they match?",
    chips: [
      { v: "same", l: "They match" },
      { v: "close", l: "Close, with explainable differences" },
      { v: "diff", l: "Quite different" },
      { v: "unsure", l: "I do not know" },
    ],
  },
  {
    id: "conc",
    q: "How much of last year’s revenue came from your largest customer?",
    chips: [
      { v: "a", l: "Under 10%" },
      { v: "b", l: "10% to 25%" },
      { v: "c", l: "25% to 50%" },
      { v: "d", l: "More than half" },
    ],
  },
  {
    id: "owner",
    q: "If you stepped away for one month, what would happen?",
    chips: [
      { v: "a", l: "The business would run normally" },
      { v: "b", l: "It would run with a few calls from me" },
      { v: "c", l: "Work would slow down" },
      { v: "d", l: "Most important work would stop" },
    ],
  },
]

export const QUESTION_COUNT = QUESTIONS.length

export const READ: Record<string, string> = {
  "type:field":
    "Service businesses attract stronger interest when recurring maintenance revenue and technician capacity are documented.",
  "type:recurring":
    "Contracted recurring revenue can support buyer confidence when the agreements, renewal history, and margins are clear.",
  "type:prof": "Buyers will test whether client relationships belong to the firm or depend on you personally.",
  "type:dist": "Inventory, working capital, suppliers, and equipment can become material deal terms.",
  "type:other":
    "Buyers will focus on the revenue model, customer mix, margins, and how easily the business can transfer to a new owner.",
  "rev:u1": "Full representation usually begins around $1M in annual revenue. The readiness findings are still useful.",
  "rev:1-2": "This range attracts many individual buyers and buyers using bank or SBA financing.",
  "rev:2-3": "This range can attract individual buyers, search funds, and smaller investment groups.",
  "rev:3-5": "This range can also attract strategic buyers and private equity groups.",
  "rev:5+":
    "Larger professional buyers may enter, and the financing and diligence process often becomes more involved.",
  "trend:up": "Growth helps, and buyers will want to see it in tax returns and monthly financials.",
  "trend:flat": "Stable revenue can sell well when customer retention, repeat business, and margins are documented.",
  "trend:down": "A decline can make financing harder. Buyers will want a clear explanation supported by records.",
  "sde:a": "At this earnings level, fewer buyers can meet their own income needs after debt payments.",
  "sde:b": "Individual buyers and search funds are often active in this earnings range.",
  "sde:c": "This earnings range can support a broad pool of financed and professional buyers.",
  "sde:d":
    "Higher earnings can widen the buyer pool and support stronger valuations when the numbers are well documented.",
  "books:same": "Clean alignment between books and tax returns can reduce buyer doubt and support financing.",
  "books:close": "Explainable differences are common. Document them before buyers raise the question.",
  "books:diff": "A large gap can reduce what a lender will finance until every difference is supported.",
  "books:unsure": "This is worth checking now. A book-to-tax review can often resolve the issue before market.",
  "conc:a": "No single customer appears large enough to drive the whole risk discussion.",
  "conc:b": "This level is common. Contract length, renewal history, and relationship depth will matter.",
  "conc:c": "A lender and buyer will focus closely on the risk of that customer leaving.",
  "conc:d": "Buyers may view the business as one major relationship unless a durable contract supports it.",
  "owner:a": "A business that performs without daily owner involvement is easier to transfer.",
  "owner:b": "You are close. A clear second decision-maker can reduce buyer concern.",
  "owner:c": "Buyers may ask for a longer transition or hold back part of the price.",
  "owner:d": "Heavy owner dependence can reduce cash at closing and extend the time you need to stay.",
}

export function insightFor(id: QuestionId, value: string): string | null {
  return READ[`${id}:${value}`] ?? null
}

export function chipLabel(id: QuestionId, value: string | undefined): string | null {
  if (value === undefined) return null
  const q = QUESTIONS.find((x) => x.id === id)
  return q?.chips.find((c) => c.v === value)?.l ?? null
}
