/**
 * Disclosure levels, the Project Ridgeline company record at each level, and the fictional access
 * history shown on the Confidentiality page and the home privacy scene.
 */

export interface PermissionLevel {
  t: string
  who: string
  see: string
  trig: string
}

export const PERMISSION_LEVELS: PermissionLevel[] = [
  {
    t: "Public",
    who: "Anyone",
    see: "No sale information. Only facts already public.",
    trig: "Nothing. No permission is required for public facts.",
  },
  {
    t: "Anonymous overview",
    who: "Prospective buyer matching your approved criteria",
    see: "Industry, broad region, and a financial range. No company name, exact city, customer names, website, or owner.",
    trig: "The buyer fits your approved categories and is not excluded by your rules.",
  },
  {
    t: "NDA signed",
    who: "Interested buyer who passes initial review",
    see: "Company identity, full buyer materials, and historical financial summary.",
    trig: "The buyer signs a non-disclosure agreement.",
  },
  {
    t: "Qualified buyer",
    who: "Serious buyer whose identity, fit, and ability to close have been reviewed",
    see: "Detailed margins, customer concentration, selected contracts, and approved diligence information.",
    trig: "Heirloom completes buyer qualification for the transaction.",
  },
  {
    t: "Finalist diligence",
    who: "Selected buyer or approved finalist",
    see: "Customer identities, payroll, bank support, full contracts, and other records required for final diligence.",
    trig: "You select the buyer for final diligence or approve finalist access.",
  },
  {
    t: "Closing parties",
    who: "People with a confirmed role in closing",
    see: "Purchase agreement, ownership records, funds flow, and other need-to-know closing information.",
    trig: "A confirmed closing role and a need for the information.",
  },
]

export const MAX_PERMISSION_LEVEL = PERMISSION_LEVELS.length - 1

export interface RecordField {
  l: string
  /** One value per permission level, index-aligned with PERMISSION_LEVELS. */
  v: [string, string, string, string, string, string]
}

export const RECORD_FIELDS: RecordField[] = [
  {
    l: "Company name",
    v: [
      "No sale record",
      "Hidden",
      "Ridgeline Mechanical Services, Inc.",
      "Ridgeline Mechanical Services, Inc.",
      "Ridgeline Mechanical Services, Inc.",
      "Ridgeline Mechanical Services, Inc.",
    ],
  },
  {
    l: "Location",
    v: [
      "Not available",
      "Southeastern United States",
      "Upstate South Carolina",
      "Greenville-Spartanburg area",
      "Greenville, South Carolina, two facilities",
      "Full addresses for closing parties",
    ],
  },
  { l: "Last 12 months revenue", v: ["Not available", "$3M to $5M", "$4.24M", "$4.24M", "$4.24M", "$4.24M"] },
  {
    l: "Adjusted earnings",
    v: [
      "Not available",
      "Not disclosed",
      "$845K, with a summary of adjustments",
      "$845K, with the adjustment schedule",
      "$845K, with full supporting records",
      "$845K, final agreed presentation",
    ],
  },
  {
    l: "Largest customer",
    v: [
      "Not available",
      "Not disclosed",
      "14% of revenue",
      "Regional grocery group, contracted through 2029",
      "Carolina Foods Group, 14%, contract attached",
      "Required consent obtained",
    ],
  },
  {
    l: "Employees and payroll",
    v: [
      "Not available",
      "25 to 50 employees",
      "31 employees",
      "Role-level employee list, no names",
      "Full payroll register with names restricted until required",
      "Full register and transfer schedule",
    ],
  },
  {
    l: "Owner",
    v: [
      "Not available",
      "Hidden",
      "D. Whitmore, owner since 2003",
      "Transition plan attached",
      "Draft employment or consulting terms",
      "Executed transition agreement",
    ],
  },
  {
    l: "Bank statements",
    v: [
      "Not available",
      "Not available",
      "Not available",
      "Not available",
      "Twelve months available in the secure room",
      "Twelve months available to authorized closing parties",
    ],
  },
  {
    l: "Purchase agreement and funds flow",
    v: [
      "Not available",
      "Not available",
      "Not available",
      "Not available",
      "Not available",
      "Executed documents shared with closing parties only",
    ],
  },
]

export type FieldTone = "hidden" | "masked" | "shown"

export function fieldTone(value: string): FieldTone {
  if (value === "Not available" || value === "No sale record" || value === "Not disclosed") return "hidden"
  if (value === "Hidden") return "masked"
  return "shown"
}

export interface AccessLogEntry {
  t: string
  who: string
  org: string
  lvl: number
  act: string
  note: string
}

export const ACCESS_LOG: AccessLogEntry[] = [
  {
    t: "Thursday, 2:06 PM",
    who: "M. Alden",
    org: "Cadence Facility Partners",
    lvl: 4,
    act: "Viewed 2025 payroll register",
    note: "Finalist access",
  },
  {
    t: "Thursday, 11:52 AM",
    who: "M. Alden",
    org: "Cadence Facility Partners",
    lvl: 4,
    act: "Downloaded adjusted-earnings schedule",
    note: "Finalist access",
  },
  {
    t: "Wednesday, 9:14 PM",
    who: "J. Ferro",
    org: "Bellhaven Search",
    lvl: 3,
    act: "Viewed customer section for 11 minutes",
    note: "Qualified-buyer access",
  },
  {
    t: "Wednesday, 4:40 PM",
    who: "Heirloom",
    org: "Advisor action",
    lvl: 0,
    act: "R. Sandoval access expired after 30 days",
    note: "",
  },
  {
    t: "Wednesday, 9:03 AM",
    who: "K. Ortiz",
    org: "Meridian Trades Group",
    lvl: 2,
    act: "Signed NDA",
    note: "Identity access approved",
  },
  {
    t: "Tuesday, 5:22 PM",
    who: "Heirloom",
    org: "Advisor action",
    lvl: 0,
    act: "Revoked Northgate HVAC access",
    note: "Matched an owner exclusion",
  },
  {
    t: "Tuesday, 10:15 AM",
    who: "Prewitt & Co.",
    org: "Seller’s accountant",
    lvl: 3,
    act: "Uploaded 2024 tax transcript",
    note: "Accountant access",
  },
  {
    t: "Monday, 3:48 PM",
    who: "J. Ferro",
    org: "Bellhaven Search",
    lvl: 3,
    act: "Viewed adjusted financial summary",
    note: "Qualified-buyer access",
  },
]

/** Short stage names used by the home privacy scene (levels 1–5). */
export const HOME_STAGE_NAMES = [
  "Anonymous overview",
  "NDA signed",
  "Buyer qualified",
  "Final diligence",
  "Closing parties only",
] as const

export function homeStageName(level: number): string {
  return HOME_STAGE_NAMES[level - 1] ?? "Anonymous overview"
}

export const CONFIDENTIALITY_RULES: Array<{ title: string; body: string }> = [
  {
    title: "Your business is never publicly listed",
    body: "Buyer outreach is private and never uses a public business-for-sale marketplace.",
  },
  {
    title: "No contact with employees, customers, or suppliers without your approval",
    body: "Business relationships stay outside the process unless you authorize contact.",
  },
  {
    title: "You set buyer exclusions before outreach",
    body: "You can add exclusions at any time.",
  },
  {
    title: "Your identity is released after an NDA",
    body: "Buyers start with an anonymous overview and learn the name after signing.",
  },
  {
    title: "Sensitive records are released after qualification",
    body: "Margins, customer details, contracts, and payroll go only to qualified buyers.",
  },
  {
    title: "Every access is recorded",
    body: "The access history shows who opened what, and when access changed.",
  },
  {
    title: "Access expires and can be revoked",
    body: "Buyers who leave the process lose access. You can ask us to revoke it sooner.",
  },
  {
    title: "Retention rules are written before you sign",
    body: "Your engagement agreement states how documents, recordings, transcripts, and transaction records are kept and deleted.",
  },
]

export const OWNER_DECIDES = [
  "Buyer types allowed",
  "Named buyers or competitors excluded",
  "Customer, supplier, and employee restrictions",
  "Information that requires your specific approval",
  "Standard access expiry",
  "People allowed to collaborate on the sale",
]

export const OWNER_CONTROLS = [
  "Add an excluded buyer",
  "Approve my rules",
  "Review an exception",
  "Revoke access",
  "Extend access",
  "Download access history",
]

/* ------------------------------------------------------------------------------------------------
 * The home demo ("Who sees what")
 * ---------------------------------------------------------------------------------------------- */

/**
 * Project Ridgeline worked-example figures (fictional): the home demo. The record never varies by buyer
 * type; what varies is the event in front of it — an owner's exclusion, then the NDA, qualification and
 * the owner's selection — and which organisation from ACCESS_LOG is looking at it.
 */
export const PRIVACY_TITLE = "Who sees what"

/** The name of the level below the five home stages: what a business nobody has been told about shows. */
export const LEVEL_ZERO_NAME = "Nothing public"

/** A buyer the outreach has not reached yet, on the buyer list. */
export const NOT_CONTACTED = "Not yet contacted"

/** The viewer at L1, where no stand-in stops: the overview goes to anyone the owner's rules allow. */
export const MATCHING_BUYER = "a buyer who matches your rules"

/** What closes an excluded buyer's caption: the exclusion ran before the first message. */
export const NEVER_CONTACTED = "never contacted"

/** The organisation ACCESS_LOG gives Heirloom's own actions, whose lines name no buyer. */
export const ADVISOR_ORG = "Advisor action"

/** The reserved line of an access history that has not recorded that view yet: the log keeps its rows. */
export const LOG_PENDING = "No entry yet"

/** The caption above the four buyers, and the one above the log lines under the record. */
export const BUYER_LIST_LABEL = "Who is looking"
export const ACCESS_LOG_LABEL = "Access history"

/** The four organisations of the access log that the demo follows, keyed by the kind of buyer each is. */
export type StandInKey = "competitor" | "strategic" | "individual" | "pe"

export interface StandIn {
  org: string
  /** The disclosure level this buyer reached at Ridgeline, and the level a preview of it shows. */
  furthestLevel: number
  /** Index into ACCESS_LOG: the entry's organisation or action names the stand-in (asserted by a test). */
  logIndex: number
}

/** Reach order: the competitor stopped before outreach, then the NDA, qualification and final diligence. */
export const STAND_IN_ORDER: StandInKey[] = ["competitor", "strategic", "individual", "pe"]

export const STAND_INS: Record<StandInKey, StandIn> = {
  competitor: { org: "Northgate HVAC", furthestLevel: 0, logIndex: 5 },
  strategic: { org: "Meridian Trades Group", furthestLevel: 2, logIndex: 4 },
  individual: { org: "Bellhaven Search", furthestLevel: 3, logIndex: 2 },
  pe: { org: "Cadence Facility Partners", furthestLevel: 4, logIndex: 0 },
}

/** Where the record leaves the buyer log: the clause the closing level's log sentence and the buyer list's closing line both read. */
export const CLOSING_LOG_CLAUSE = "Closing documents move outside the buyer log"

/** The home record is the first five fields of RECORD_FIELDS; phones show the first four rows of it. */
export const HOME_RECORD_FIELD_COUNT = 5

/**
 * The level at which each of the five home rows first counts as visible, in RECORD_FIELDS order: a row opens when
 * it shows the fact it is for at the resolution the level allows. The broad region and the revenue range are the
 * overview's two disclosures (L1); the name comes with the NDA (L2); the adjustment schedule with qualification
 * (L3); the customer's name for a finalist (L4). So the count climbs 0, 2, 3, 4, 5 across the levels the demo
 * plays, and the record stands fully open to the finalist the owner selected.
 */
export const HOME_FIELD_OPEN_AT: number[] = [2, 1, 1, 3, 4]

export const FIGURE_LABELS = {
  visible: (n: number, of: number) => `Visible ${n} of ${of}`,
  viewingAs: (org: string) => `Viewing as ${org}`,
  recordTitle: "Company record",
}
