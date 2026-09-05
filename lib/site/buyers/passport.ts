import { CONTACT } from "@/lib/site/routes"

/** Buyer Passport verification tiers and the card each tier reveals. */

export const PASSPORT_TIERS = ["Network Member", "Identity Verified", "Heirloom Verified", "Deal Qualified"] as const
export type PassportTierIndex = 0 | 1 | 2 | 3
export const DEFAULT_PASSPORT_TIER: PassportTierIndex = 2

export const PASSPORT_TIER_DESCRIPTIONS: readonly string[] = [
  "Checked: Profile and acquisition criteria provided. Nothing verified yet. Access: Anonymous matches and basic alerts.",
  "Checked: Identity and business entity confirmed. Acquisition capital has not been reviewed. Access: Faster identity and NDA review.",
  "Checked: Identity, current acquisition criteria, capacity range, and lender preparation where relevant. Access: Earlier alerts, richer anonymous details, and less repeat verification.",
  "Checked: Fit, seriousness, financing path, and ability to close for one specific transaction. Access: Eligible for deeper information and seller meetings under that seller’s rules.",
]

export interface PassportRow {
  l: string
  v: [string, string, string, string]
}

export const PASSPORT_ROWS: PassportRow[] = [
  { l: "Buyer name and firm", v: ["Shown", "Shown", "Shown", "Shown"] },
  {
    l: "Buyer type",
    v: [
      "Individual buyer or searcher",
      "Individual buyer or searcher",
      "Individual buyer or searcher",
      "Individual buyer or searcher",
    ],
  },
  {
    l: "Acquisition criteria",
    v: ["Provided, not verified", "Provided, not verified", "Verified and dated", "Matched to this transaction"],
  },
  {
    l: "Identity and entity status",
    v: [
      "Not checked",
      "Identity confirmed · Feb 2026",
      "Identity confirmed · Feb 2026",
      "Identity confirmed · Feb 2026",
    ],
  },
  {
    l: "Capacity range status",
    v: [
      "Not shown",
      "Capacity not reviewed",
      "Verified capacity range: $3M to $6M",
      "Confirmed for this transaction size",
    ],
  },
  {
    l: "Lender or SBA preparation",
    v: [
      "Not available",
      "Not available",
      "Lender preparation reviewed · expires Aug 2026",
      "Reviewed for this transaction",
    ],
  },
  {
    l: "Prior acquisitions",
    v: ["Self-reported", "Self-reported", "Checked against public record", "Checked, with seller-relevant notes"],
  },
  {
    l: "Plans for employees, company name, and locations",
    v: ["Not available", "Not available", "On file, in writing", "Released to the seller"],
  },
  {
    l: "Verification date",
    v: ["Not applicable", "Verified Feb 2026", "Verified Feb 2026", "Verified Feb 2026"],
  },
  {
    l: "Expiration date",
    v: ["Not applicable", "Expires Feb 2027", "Expires Aug 2026", "Expires with this transaction"],
  },
]

const MUTED_VALUES = new Set(["Not available", "Not shown", "Not checked", "Not applicable"])

export function isMutedPassportValue(v: string): boolean {
  return MUTED_VALUES.has(v)
}

export function passportProgress(tier: PassportTierIndex): string {
  return `${(tier / 3) * 100}%`
}

export function passportShareText(tier: PassportTierIndex): string {
  return `Buyer Passport · ${PASSPORT_TIERS[tier]} · verification details available on request via ${CONTACT.buyers}`
}

export const PASSPORT_HOW: Array<{ label: string; body: string }> = [
  { label: "Private sharing", body: "You choose what each recipient sees." },
  { label: "Range, not balance", body: "Capacity appears as a range unless you authorize more." },
  { label: "Dated verification", body: "Acquisition criteria and financial evidence expire and must be refreshed." },
  {
    label: "No recipient account required",
    body: "A seller or advisor can verify a Passport without a Heirloom account.",
  },
  {
    label: "No public score",
    body: "The Passport shows checks and dates only.",
  },
  { label: "Human review", body: "Verification is never downgraded or revoked automatically." },
  {
    label: "Outside advisors keep their clients",
    body: "An advisor can request a buyer’s Passport without involving Heirloom in the seller relationship.",
  },
]

export const PASSPORT_BENEFITS: Array<{ title: string; body: string }> = [
  {
    title: "Faster seller review",
    body: "Owners and advisors see a current, verified record of your identity and criteria.",
  },
  {
    title: "Less repeat paperwork",
    body: "Approved verification is reused on each opportunity.",
  },
  {
    title: "Earlier access",
    body: "Verified buyers can receive earlier alerts and more anonymous detail when the seller’s rules allow it.",
  },
  {
    title: "Financial privacy",
    body: "Sellers see a verified capacity range. Exact balances stay private unless you authorize more.",
  },
  {
    title: "Verified before the meeting",
    body: "Sellers see that your identity, financing path, and criteria were reviewed.",
  },
]

export const BUYER_QUESTIONS = [
  "What would you do with current employees in the first 12 months?",
  "Would you keep the company name and locations?",
  "What happened to employees, names, and locations in your prior acquisitions?",
  "If this would be your first acquisition, how will you support those plans?",
]

export const BUYER_TYPES = [
  "Individual buyer or searcher",
  "Independent sponsor",
  "Family office",
  "Private equity firm",
  "Strategic acquirer",
]

export interface BuyerRegistration {
  name: string
  firm: string
  buyerType: string
  targetSize: string
  geography: string
  industries: string
  financing: string
  evidence: string
  priorAcquisitions: string
  plans: string
  email: string
}

export const EMPTY_BUYER_REGISTRATION: BuyerRegistration = {
  name: "",
  firm: "",
  buyerType: BUYER_TYPES[0] ?? "",
  targetSize: "",
  geography: "",
  industries: "",
  financing: "",
  evidence: "",
  priorAcquisitions: "",
  plans: "",
  email: "",
}

export function buyerRegistrationBody(r: BuyerRegistration): string {
  const extras = [
    ["What kind of buyer are you?", r.buyerType],
    ["Geography", r.geography],
    ["Financing plan", r.financing],
    ["Current evidence of funds or lender support", r.evidence],
    ["Prior acquisitions", r.priorAcquisitions],
    ["Plans for employees, the company name, and locations", r.plans],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
  return (
    "I would like to create a Buyer Passport.\n\nName: " +
    r.name +
    "\nFirm: " +
    (r.firm || "Independent buyer") +
    "\nEmail: " +
    r.email +
    "\nAcquisition focus: " +
    r.industries +
    "\nTarget size: " +
    r.targetSize +
    (extras.length ? "\n" + extras.join("\n") : "") +
    "\n\nPlease send the verification steps."
  )
}
