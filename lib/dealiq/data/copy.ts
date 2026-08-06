/**
 * PLACEHOLDER CONTENT — provisional values, authored separately and swapped wholesale.
 * Shapes are contractual; values are not. No component may hardcode any value from this file.
 */

import { FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { formatCompactCurrency, formatCount } from "@/lib/dealiq/format"
import type { DealSeed, LogLine } from "@/lib/dealiq/types"

/**
 * The Ingestion Agent's log script — fourteen lines, one every `LOG_STEP_MS`,
 * which is the ~4.5s latency mask the Deal Inbox runs while the model works
 * (Execution Plan §2: "the card reveals when *both* the log completes and the
 * response resolves").
 *
 * Deliberately figure-free. A log line asserting "detected $180,000 owner salary"
 * would be a hand-typed total on screen — the one thing §1 rule 4 forbids — and
 * it would silently contradict the seed the moment an add-back amount changed.
 * The lines describe what the agent is doing; the card that follows carries the
 * numbers, all of them derived.
 */
export const LOG_STEP_MS = 320

export const INGESTION_LOG: ReadonlyArray<LogLine> = [
  { ts: "00:00", text: "Reading listing document..." },
  { ts: "00:01", text: "Identifying business type and geography..." },
  { ts: "00:01", text: "Extracting asking price and claimed cash flow..." },
  { ts: "00:02", text: "Parsing the seller's add-back schedule..." },
  { ts: "00:02", text: "Classifying each claim by category and evidence...", accent: true },
  { ts: "00:03", text: "Checking compensation claims against roles vacated at close", accent: true },
  { ts: "00:03", text: "Testing one-time claims against the history window", accent: true },
  { ts: "00:04", text: "Scanning for occupancy cost in the profit and loss..." },
  { ts: "00:04", text: "No occupancy cost carried — flagged for the recast", flag: "amber" },
  { ts: "00:05", text: "Reading customer concentration disclosures..." },
  { ts: "00:05", text: "Owner-held relationships detected in the listing text", flag: "red" },
  { ts: "00:06", text: "Cross-checking the ask against the comp multiple band..." },
  { ts: "00:06", text: "Assembling structured deal card..." },
  { ts: "00:07", text: "Screen complete." },
] as const

/**
 * The sample listing a buyer can load into the Inbox with one click.
 *
 * Built from the seed rather than typed, so the fixture's figures cannot drift
 * from `FOCUS_DEAL`. The content pass rewrites the prose around the interpolated
 * values; it should not replace them with literals.
 */
export function buildSampleListing(seed: DealSeed): string {
  const { card, addBacks, occupancy } = seed
  const schedule = addBacks
    .map((line) => `  · ${line.label} — ${formatCompactCurrency(line.annualAmount)}/yr`)
    .join("\n")

  return [
    `${card.name} — ${card.industry}`,
    `${card.geography}${card.yearsOperating ? ` · Established ${formatCount(card.yearsOperating)} years` : ""}`,
    "",
    `Asking: ${formatCompactCurrency(card.ask)}`,
    `Seller's discretionary earnings: ${formatCompactCurrency(card.claimedSde)}`,
    card.revenue ? `Gross revenue: ${formatCompactCurrency(card.revenue)}` : "",
    card.employees ? `Employees: ${formatCount(card.employees)}` : "",
    "",
    "Seller's add-back schedule:",
    schedule,
    "",
    occupancy.premisesOwnedBySeller
      ? "Premises owned by the seller. Real estate available separately."
      : "Premises leased. Lease assignable to a qualified buyer.",
    "",
    "Highlights:",
    ...card.highlights.map((line) => `  · ${line}`),
    "",
    card.reasonForSale ? `Reason for sale: ${card.reasonForSale}` : "",
    "",
    SAMPLE_LISTING_MARKER,
  ]
    .filter((line) => line !== "")
    .join("\n")
}

/**
 * The line that identifies pasted text as the demo fixture. The screen route
 * uses it to pin extraction output to the seed — the fixture is the source
 * document, so the model may narrate it but never overrule it.
 */
export const SAMPLE_LISTING_MARKER =
  "PROVISIONAL LISTING TEXT — this is placeholder prose used to demonstrate ingestion."

export const SAMPLE_LISTING_TEXT = buildSampleListing(FOCUS_DEAL)

/**
 * URLs the screen route resolves to the focus-deal fixture. No fetching, no
 * scraping — a matching URL simply returns the seeded card. Unknown URLs get
 * `needsText` guidance instead.
 */
export const FIXTURE_LISTING_URLS: ReadonlyArray<string> = [
  "placeholder-listings.example/focus-deal",
  "sample-marketplace.example/listing/hvac-1",
] as const

/**
 * The fallback challenge memo, rendered when Sonnet is slow, unreachable, or the
 * key is unset. It explains the *method* and never states a figure, so it stays
 * true under any seed and can never contradict the table it sits beneath.
 */
export const FALLBACK_CHALLENGE_MEMO = [
  "Every line in the schedule above was tested against the same six rules, in the same order, regardless of how the seller characterised it.",
  "",
  "Compensation add-backs were accepted only for the portion of the role actually vacated at close — a buyer who has to re-hire the work has not saved the salary. Where the market cost of that re-hire exceeds what was added back, the difference is carried as an omitted cost rather than netted quietly against the claim.",
  "",
  "Mixed-use expenses were split at the documented business-use share. Claims without supporting documentation were reduced or rejected outright, not argued about. Expenses presented as one-time were checked against the full history window; a cost that appears in most years of the window is a recurring cost with a temporary label, and the reserve it implies is stated as its own line.",
  "",
  "What survives this is the defensible number — the cash flow a lender will underwrite and a buyer can service. The gap between it and the asking price is not an accusation. It is the negotiation.",
].join("\n")

/** Deal Inbox surface copy. */
export const INBOX_COPY = {
  eyebrow: "Ingestion Agent",
  title: "Screen a deal",
  subtitle: "Paste a listing. Get a structured deal card, a score, and a verdict.",
  placeholder:
    "Paste the listing text — description, asking price, cash flow, and the add-back schedule if the broker provided one.",
  sampleChip: "Load sample listing",
  submit: "Screen this deal",
  submitting: "Screening…",
  urlGuidance:
    "That URL is not in the demo fixture set, and DealIQ does not fetch pages. Paste the listing text instead and the screen runs identically.",
  networkError: "The screen could not complete. Check the connection and try again — nothing was lost.",
  oversizeError:
    "That listing is longer than the screen accepts. Paste the financial sections and the add-back schedule.",
  emptyError: "Paste a listing, or load the sample, to run a screen.",
} as const

/** Capital Verification surface copy. Pool stats interpolate from the buyer seed. */
export const VERIFY_COPY = {
  eyebrow: "Capital Verification",
  title: "Verify once. See deals before the market does.",
  tradeStatement:
    "Verified buyers see certified deals before they reach the open market. Sellers get a shorter list of buyers who can actually close; buyers get a first look at deals that have already been recast, documented, and pre-qualified.",
  dropzoneIdle: "Drop a proof-of-funds letter, bank statement, or SBA pre-qualification",
  dropzoneHint: "Read in your browser only — the file is never uploaded, stored, or sent anywhere.",
  dropzoneBrowse: "or choose a file",
  wrongType: "That file type cannot be read as a funding document. Use a PDF, image, or document file.",
  checkLines: [
    "Reading document metadata…",
    "Matching declared capital against the mandate…",
    "Recording verification against the buyer profile…",
  ],
  reverify: "Re-verify / update proof",
  productionNote:
    "In production, verification documents are reviewed by a Scorta analyst before a badge is issued. This surface demonstrates the flow.",
} as const

/** Buyer sign-in positioning — one line, beneath the wordmark. */
export const SIGNIN_COPY = {
  wordmark: "DealIQ",
  mark: "Buy-side",
  positioning:
    "Screen any listing in seconds. Take the seller's add-backs apart line by line. Know what the deal actually earns before you spend a week on it.",
  submit: "Sign in",
  submitting: "Signing in…",
  invalidCredentials: "That email and password combination was not recognised.",
  networkError: "Sign-in could not complete. Check the connection and try again.",
} as const

/** Certified Deal Flow surface copy. */
export const FLOW_COPY = {
  eyebrow: "Certified Deal Flow",
  title: "Pre-market, mandate-matched",
  subtitle:
    "Deals that cleared certification on the sell side, ranked against your mandate, before they list publicly.",
  lockedTitle: "Verify capital to view",
  lockedBody: "Certified listings are released to capital-verified buyers first. Verification takes one document.",
  emptyMandate:
    "No certified listing currently matches your mandate. Widen the industry or geography criteria to see more.",
} as const

/** Reverse Recast surface copy. */
export const RECAST_COPY = {
  eyebrow: "Recast Agent · buy-side",
  title: "The seller's add-backs, line by line",
  ledgerClaimed: "Claimed SDE",
  ledgerDefensible: "Defensible SDE",
  ledgerAdjusted: "Total adjusted",
  groupChallenges: "Add-back challenges",
  groupOmitted: "Omitted costs",
  flagsTitle: "Flags",
  flagScenarioLink: "Priced in the Returns model →",
  negotiationTitle: "The negotiation",
  negotiationBasis:
    "Fair value applies the comp multiple band to the defensible SDE. The delta is the ask minus that value — it is not an accusation, it is the negotiation.",
  acceptGate: "Accept this challenge → carry the defensible SDE into the Returns model",
  accepting: "Recording…",
  accepted: "Challenge accepted",
  memoHeading: "Challenge memo",
  memoPending: "Drafting the challenge memo…",
  notAvailableNote:
    "The challenge table runs on deals screened in this session. Screen this deal through the Deal Inbox to take its add-back schedule apart.",
} as const

/** Returns Model surface copy. Labels are deliberately precise — precision is what makes the figures credible. */
export const RETURNS_COPY = {
  eyebrow: "Returns Model",
  title: "What the deal earns at this price",
  stackTitle: "Capital stack",
  sliderLabel: "Purchase price",
  tickFair: "Fair value",
  tickAsk: "Ask",
  metricDebtService: "Monthly debt service, steady-state",
  metricDscr: "DSCR against the lender floor",
  metricCoc: "Year-1 cash-on-cash, pre-transition-risk",
  metricPayback: "Years to payback on cash invested",
  metricSalary: "Buyer salary, drawn before coverage",
  metricCashRequired: "Cash required at close",
  neverRecovers: "never recovers at this price",
  constraintTitle: "Ceiling at the DSCR floor",
  constraintBody:
    "The highest price at which this scenario's cash flow still clears the lender floor. Above it, the structure does not finance — whatever the ask says.",
  notAvailableNote:
    "The returns model runs on deals screened in this session. Screen this deal through the Deal Inbox to model the structure.",
} as const

/** LOI surface copy. Non-binding labelling is not optional. */
export const LOI_COPY = {
  eyebrow: "LOI Drafter",
  title: "Letter of intent — draft",
  badge: "Non-binding · for counsel review",
  disclaimer:
    "This is a draft letter of intent generated for discussion. It is non-binding, does not constitute legal advice, and must be reviewed by counsel before it is sent.",
  whyThisPrice: "Why this price, not the ask",
  sendGate: "Send to seller's Case Manager",
  sending: "Sending…",
  sent: "Delivered to the seller's Case Manager",
} as const

/** Screen Score surface copy. */
export const SCORE_COPY = {
  eyebrow: "Case Manager · buy-side",
  title: "Screen Score",
  conditionsTitle: "What this verdict rests on",
  methodologyTitle: "How this score is produced",
  methodologyLead: "Six weighted sub-scores, each computed from the deal's own figures.",
  noModelLine: "No model produced this number.",
  crossProductLead: "Same engine, opposite objective",
  crossProductBody:
    "The sell side runs these rules to find what a seller should fix before listing. The buy side runs them to find what a buyer should not pay for.",
  summaryOnlyNote:
    "This deal was screened earlier in the pipeline. The score and verdict are recorded; the full sub-score breakdown runs on deals screened in this session.",
  notScreenedNote: "This deal has not been screened yet. Run it through the Deal Inbox to produce a score.",
} as const

/** Pipeline board copy. */
export const PIPELINE_COPY = {
  eyebrow: "Pipeline",
  emptyTitle: "Nothing screened yet",
  emptyBody: "Paste a listing into the Deal Inbox and it lands here with a score and a verdict.",
  emptyCta: "Screen a deal",
  /** Stamped on the pipeline card the moment the Inbox lands a deal. */
  justScreenedAction: "Screened just now — recast, returns and score computed",
  justScreenedBadge: "New",
} as const
