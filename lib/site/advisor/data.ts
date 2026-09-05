/**
 * Advisor intake: five pre-call questions, the acknowledgement shown after each answer, and the
 * agenda the briefing panel assembles from the answers.
 */

export const ADVISOR_QUESTION_IDS = ["topic", "type", "rev", "when", "care"] as const
export type AdvisorQuestionId = (typeof ADVISOR_QUESTION_IDS)[number]

export interface AdvisorQuestion {
  id: AdvisorQuestionId
  q: string
  note: string
  chips: Array<[value: string, label: string]>
}

export const ADVISOR_QUESTIONS: AdvisorQuestion[] = [
  {
    id: "topic",
    q: "Where should the conversation start?",
    note: "This only sets the agenda.",
    chips: [
      ["sell", "Selling the business"],
      ["offer", "An offer or buyer I already have"],
      ["value", "Value and timing"],
      ["conf", "Confidentiality concerns"],
      ["else", "Something else"],
    ],
  },
  {
    id: "type",
    q: "What kind of business is it?",
    note: "Closest fit is fine.",
    chips: [
      ["field", "Home or field services"],
      ["recurring", "Recurring commercial services"],
      ["prof", "Business or professional services"],
      ["dist", "Manufacturing or distribution"],
      ["other", "Another type of business"],
    ],
  },
  {
    id: "rev",
    q: "About how much revenue last year?",
    note: "A range is enough.",
    chips: [
      ["u1", "Under $1M"],
      ["1-2", "$1M to $2M"],
      ["2-3", "$2M to $3M"],
      ["3-5", "$3M to $5M"],
      ["5+", "More than $5M"],
    ],
  },
  {
    id: "when",
    q: "When would you want a sale to close?",
    note: "",
    chips: [
      ["soon", "Within a year"],
      ["mid", "In 1 to 2 years"],
      ["later", "Someday, not scheduled"],
      ["depends", "Depends on what I learn"],
    ],
  },
  {
    id: "care",
    q: "What matters most in the outcome?",
    note: "",
    chips: [
      ["price", "Final price"],
      ["cash", "Cash at closing"],
      ["team", "Employees and the company name"],
      ["speed", "Speed"],
      ["certainty", "Certainty it closes"],
    ],
  },
]

export const ADVISOR_QUESTION_COUNT = ADVISOR_QUESTIONS.length

export const ADVISOR_ACK: Record<string, string> = {
  "topic:sell": "The call covers your likely buyer market and what preparation would happen before any outreach.",
  "topic:offer": "Notes from a conversation are enough for a first read of the terms.",
  "topic:value": "Estimates are enough to discuss value and timing.",
  "topic:conf": "The call itself is confidential. No one is contacted afterward without your approval.",
  "topic:else": "There is no follow-up email sequence after the call.",
  "type:field": "We will prepare the buyer categories that usually pursue field-service companies.",
  "type:recurring": "Expect questions about contracts and renewals. Buyers price them heavily.",
  "type:prof": "We will discuss how client relationships would transfer to a buyer.",
  "type:dist": "Inventory and working capital will come up.",
  "type:other": "We will map the likely buyer categories before the call.",
  "rev:u1": "Full representation usually begins around $1M in revenue. The call can still cover next steps.",
  "rev:1-2": "This range draws individual and SBA-financed buyers.",
  "rev:2-3": "Search funds and smaller investment groups are active in this range.",
  "rev:3-5": "Strategic and private equity interest becomes realistic at this size.",
  "rev:5+": "Businesses this size attract larger buyers and longer diligence.",
  "when:soon": "At this timing, preparation would start almost immediately.",
  "when:mid": "There is time to fix what buyers would flag before they see the business.",
  "when:later": "The call will focus on what builds value in the meantime.",
  "when:depends": "We will lay out the decisions that affect timing.",
  "care:price": "The call will cover how competing buyers affect the final price.",
  "care:cash": "We will separate headline price from cash at closing on the call.",
  "care:team": "We will show how buyers are screened on their plans for employees.",
  "care:speed": "We will walk the realistic timeline and where weeks are usually lost.",
  "care:certainty": "We will talk financing, conditions, and what makes deals fail late.",
}

export const ADVISOR_AGENDA: Record<string, string[]> = {
  sell: [
    "The likely buyer market for your business",
    "What preparation happens before any outreach",
    "How valuation is built and defended",
  ],
  offer: [
    "A first read of the offer in front of you",
    "Where the buyer still has room to move",
    "Whether competition would change the outcome",
  ],
  value: [
    "How buyers and lenders would view the business today",
    "What would most improve value before a sale",
    "What realistic timing looks like",
  ],
  conf: [
    "Who would learn about a sale, and when",
    "Your exclusions and information limits",
    "How outreach works without naming the business",
  ],
  else: ["Your question, answered directly", "The parts of a sale process it touches", "Practical next steps, if any"],
}

export const ADVISOR_CARE: Record<string, string> = {
  price: "How buyer competition moves the final price",
  cash: "Cash at closing versus money paid later",
  team: "Protecting employees and the company name in buyer selection",
  speed: "The realistic timeline, and where weeks are lost",
  certainty: "Reading closing risk before you commit to a buyer",
}
