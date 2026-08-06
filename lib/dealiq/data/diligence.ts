/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import type { DiligenceQuestion } from "@/lib/dealiq/types"

/**
 * The question bank. Twenty-seven questions, tagged by category, by how fast an
 * unfavourable answer kills the deal, and — for about half of them — by the
 * recast rule that promotes them when it fires.
 *
 * Note what is NOT here: an order. The bank is authored in category groups purely
 * for editing convenience. `rankQuestions()` in `lib/dealiq/diligence.ts` sorts by
 * computed `killScore` and floats `sourceFinding` matches to the top, so the order
 * on screen is produced, never typed. Reordering this array must change nothing.
 *
 * These questions carry no business facts — no names, no figures, no verdicts —
 * so they are safe to read as written. Their *wording* is still provisional and
 * belongs to the content pass; the tags are what the ranking depends on.
 */
export const DILIGENCE_BANK: ReadonlyArray<DiligenceQuestion> = [
  // ── Financial ──────────────────────────────────────────────────────────────
  {
    id: "dq-fin-01",
    question: "Provide three years of filed tax returns and reconcile each to the P&L in the package.",
    category: "financial",
    killSpeed: 5,
    rationale: "A gap between the returns and the package is the fastest way to learn the SDE is not real.",
    sourceFinding: "documentation",
    askOf: "accountant",
  },
  {
    id: "dq-fin-02",
    question: "For each add-back, which document supports it — and which are estimates?",
    category: "financial",
    killSpeed: 5,
    rationale: "Undocumented add-backs are the single largest source of overstated SDE.",
    sourceFinding: "documentation",
    askOf: "seller",
  },
  {
    id: "dq-fin-03",
    question: "Has any expense claimed as one-time appeared in more than one year of the window?",
    category: "financial",
    killSpeed: 5,
    rationale: "A recurring 'one-time' expense is a permanent cost wearing a temporary label.",
    sourceFinding: "reserve",
    askOf: "accountant",
  },
  {
    id: "dq-fin-04",
    question: "Provide month-by-month revenue for the trailing 36 months, not annual totals.",
    category: "financial",
    killSpeed: 4,
    rationale: "Annual totals hide seasonality, a lost quarter, and a declining trend inside a flat year.",
    askOf: "accountant",
  },
  {
    id: "dq-fin-05",
    question: "What capital expenditure has the business actually required each year?",
    category: "financial",
    killSpeed: 4,
    rationale: "A P&L with no maintenance capex is a P&L that has deferred it onto the buyer.",
    sourceFinding: "reserve",
    askOf: "seller",
  },
  {
    id: "dq-fin-06",
    question: "What is the current working-capital balance, and how much transfers at close?",
    category: "financial",
    killSpeed: 3,
    rationale: "Working capital excluded from the deal is cash the buyer funds on day one.",
    askOf: "broker",
  },
  {
    id: "dq-fin-07",
    question: "What debt sits on the balance sheet, and what is assumed versus retired at close?",
    category: "financial",
    killSpeed: 3,
    rationale: "Assumed debt changes the capital stack and can break the lender's coverage test.",
    askOf: "lender",
  },

  // ── Customer ───────────────────────────────────────────────────────────────
  {
    id: "dq-cus-01",
    question: "Provide revenue by customer for three years — the top twenty, named.",
    category: "customer",
    killSpeed: 5,
    rationale: "Concentration is the risk most often understated in a listing and least often volunteered.",
    askOf: "seller",
  },
  {
    id: "dq-cus-02",
    question: "Which customers are under written contract, and when does each renew?",
    category: "customer",
    killSpeed: 5,
    rationale: "Revenue described as recurring but not contracted can leave the week after close.",
    askOf: "seller",
  },
  {
    id: "dq-cus-03",
    question: "Has any customer above 10% of revenue left in the last three years?",
    category: "customer",
    killSpeed: 5,
    rationale: "A departed anchor account predicts the next one better than any margin analysis.",
    askOf: "seller",
  },
  {
    id: "dq-cus-04",
    question: "Who at the business owns each of the top five customer relationships?",
    category: "customer",
    killSpeed: 4,
    rationale: "If the answer is the owner, the concentration risk and the dependency risk are the same risk.",
    sourceFinding: "role_split",
    askOf: "seller",
  },
  {
    id: "dq-cus-05",
    question: "Where does new business come from, and does the owner personally generate it?",
    category: "customer",
    killSpeed: 4,
    rationale: "An acquisition channel that is the owner's personal network does not convey with the assets.",
    sourceFinding: "role_split",
    askOf: "seller",
  },

  // ── Operational ────────────────────────────────────────────────────────────
  {
    id: "dq-ops-01",
    question: "What occupancy cost does the P&L carry, and is the lease at market rate?",
    category: "operational",
    killSpeed: 5,
    rationale: "A below-market or absent rent inflates SDE by the entire difference, every year.",
    sourceFinding: "occupancy",
    askOf: "seller",
  },
  {
    id: "dq-ops-02",
    question: "If the seller owns the premises, what rent will a buyer pay after close?",
    category: "operational",
    killSpeed: 5,
    rationale: "The lease negotiated after the price is agreed is where the savings quietly go back.",
    sourceFinding: "occupancy",
    askOf: "broker",
  },
  {
    id: "dq-ops-03",
    question: "What is the booked-forward backlog, and what evidences it?",
    category: "operational",
    killSpeed: 4,
    rationale: "Backlog cited without signed work behind it is a forecast, not an asset.",
    askOf: "seller",
  },
  {
    id: "dq-ops-04",
    question: "Which processes are documented, and can I read the documentation?",
    category: "operational",
    killSpeed: 4,
    rationale: "Undocumented process is owner knowledge, and owner knowledge leaves at close.",
    askOf: "seller",
  },
  {
    id: "dq-ops-05",
    question: "What systems run the business, and are the licences assignable to a buyer?",
    category: "operational",
    killSpeed: 3,
    rationale: "Non-assignable systems become an unbudgeted migration in the first ninety days.",
    askOf: "seller",
  },
  {
    id: "dq-ops-06",
    question: "Which suppliers are sole-sourced, and what are the terms?",
    category: "operational",
    killSpeed: 3,
    rationale: "Supplier terms tied to the owner personally reprice the moment they leave.",
    askOf: "seller",
  },

  // ── People ─────────────────────────────────────────────────────────────────
  {
    id: "dq-ppl-01",
    question: "What roles does the owner personally perform, and for how many hours a week?",
    category: "people",
    killSpeed: 5,
    rationale: "This answer determines both the replacement cost and whether the add-back was ever real.",
    sourceFinding: "role_split",
    askOf: "seller",
  },
  {
    id: "dq-ppl-02",
    question: "What would it cost to hire replacements for each role the owner vacates at close?",
    category: "people",
    killSpeed: 5,
    rationale: "Replacement cost above the compensation added back is a permanent reduction in SDE.",
    sourceFinding: "replacement_cost",
    askOf: "seller",
  },
  {
    id: "dq-ppl-03",
    question: "Which employees are essential, and which have been told about the sale?",
    category: "people",
    killSpeed: 4,
    rationale: "Key staff who learn about the sale from a stranger tend to leave before the buyer arrives.",
    askOf: "seller",
  },
  {
    id: "dq-ppl-04",
    question: "Are any family members or related parties on payroll, and at what rate?",
    category: "people",
    killSpeed: 4,
    rationale: "Related-party payroll is either an add-back or a role the buyer has to fill — never neither.",
    sourceFinding: "documentation",
    askOf: "accountant",
  },
  {
    id: "dq-ppl-05",
    question: "Are there employment agreements, non-competes, or retention arrangements in force?",
    category: "people",
    killSpeed: 3,
    rationale: "Without them, the buyer is acquiring a payroll rather than a team.",
    askOf: "broker",
  },
  {
    id: "dq-ppl-06",
    question: "What has actual staff turnover been over the last three years?",
    category: "people",
    killSpeed: 3,
    rationale: "Turnover is the operating-culture number a listing never volunteers.",
    askOf: "seller",
  },

  // ── Legal ──────────────────────────────────────────────────────────────────
  {
    id: "dq-leg-01",
    question: "Are there pending or threatened claims, liens, or regulatory actions?",
    category: "legal",
    killSpeed: 5,
    rationale: "An undisclosed claim can exceed the equity cheque and is discoverable in an afternoon.",
    askOf: "seller",
  },
  {
    id: "dq-leg-02",
    question: "Which licences and permits are required, and are they transferable?",
    category: "legal",
    killSpeed: 5,
    rationale: "A non-transferable licence turns an asset purchase into a re-application with a revenue gap.",
    askOf: "broker",
  },
  {
    id: "dq-leg-03",
    question: "Are any personal or mixed-use assets included in the asking price?",
    category: "legal",
    killSpeed: 4,
    rationale: "Personal assets inside the price are value the lender will not finance.",
    sourceFinding: "mixed_use",
    askOf: "seller",
  },

  // ── Market ─────────────────────────────────────────────────────────────────
  {
    id: "dq-mkt-01",
    question: "What share of revenue is contractual or recurring versus project-based?",
    category: "market",
    killSpeed: 4,
    rationale: "The recurring share sets the multiple more than the headline growth rate does.",
    askOf: "seller",
  },
  {
    id: "dq-mkt-02",
    question: "Who are the three closest competitors, and what has changed in two years?",
    category: "market",
    killSpeed: 3,
    rationale: "A stable-looking business in a repricing market is a declining business on a delay.",
    askOf: "seller",
  },
] as const
