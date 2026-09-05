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
