/**
 * Route table, per-page metadata, navigation structure, and contact points for the Heirloom site.
 * Everything that links between pages imports from here so a path can change in one place.
 */

export const ROUTES = {
  home: "/",
  score: "/score",
  offerReview: "/offer-review",
  howItWorks: "/how-it-works",
  fees: "/fees",
  confidentiality: "/confidentiality",
  buyers: "/buyers",
  whoWeAre: "/who-we-are",
  questions: "/questions",
  why: "/why",
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

export const SITE_NAME = "Heirloom"

export const CONTACT = {
  hello: "suyash@heirloomadvisory.ai",
  offers: "offers@heirloom.com",
  buyers: "buyers@heirloom.com",
  advisorCalendar: "https://heirloom.cal.com/suyash/m-a-advisory-meeting",
  ycombinator: "https://www.ycombinator.com/",
} as const

export interface PageMeta {
  title: string
  description: string
}

export const PAGE_META: Record<RouteKey, PageMeta> = {
  home: {
    title: "Sell Your Business Privately | Heirloom M&A Advisory",
    description:
      "Heirloom represents owners of established private businesses, brings qualified buyers into a private sale process, and manages the transaction through closing.",
  },
  score: {
    title: "Is Your Business Ready to Sell? exitIQ Readiness Check | Heirloom",
    description:
      "Seven questions on how buyers and lenders would view your business, with findings and a 90-day plan. No name, email, or documents required.",
  },
  offerReview: {
    title: "Free Business Offer Review Before You Sign | Heirloom",
    description:
      "Heirloom reviews the cash at closing, deferred payments, financing, exclusivity, and missing terms in an offer for your business, for free.",
  },
  howItWorks: {
    title: "How Heirloom Sells Your Business: The Eight Stages | Heirloom",
    description:
      "What Heirloom does at each stage of a private business sale, from preparing the financials to closing, and where the owner decides.",
  },
  fees: {
    title: "M&A Advisory Fees: 5% Success Fee, No Retainer | Heirloom",
    description:
      "5% success fee on a full private sale, 2.5% with an existing buyer, free initial offer review. No monthly retainer, listing fee, or minimum.",
  },
  confidentiality: {
    title: "Sell Your Business Confidentially: Who Sees What | Heirloom",
    description:
      "Your business is never publicly listed. Buyers see staged information after an NDA and qualification, and every access is recorded.",
  },
  buyers: {
    title: "Buyer Passport: Verified Business Buyer Record | Heirloom",
    description:
      "Verify your identity, acquisition criteria, and capacity range once, and share only the details you choose with each seller.",
  },
  whoWeAre: {
    title: "Who We Are: The Team Behind Heirloom M&A | Heirloom",
    description:
      "The firm and founder behind Heirloom, with firm transactions and the founder's buy-side experience stated separately.",
  },
  questions: {
    title: "Business Sale Questions: Fees, Confidentiality, Timing | Heirloom",
    description: "Direct answers on fees, confidentiality, fit, timing, buyers, and the firm.",
  },
  why: {
    title: "Why Heirloom Exists: A Private Sale Process for Owners | Heirloom",
    description:
      "Why established business owners need a private, competitive sale process, and what Heirloom is building.",
  },
}

export interface NavLink {
  href: string
  label: string
  note: string
}

export interface NavGroup {
  label: string
  minWidth: number
  links: NavLink[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "For owners",
    minWidth: 310,
    links: [
      { href: ROUTES.howItWorks, label: "Sell my business", note: "Private sale, preparation to closing" },
      {
        href: ROUTES.offerReview,
        label: "Review my offer",
        note: "Free read of the terms",
      },
      { href: ROUTES.score, label: "Check sale readiness", note: "Seven questions, no name needed" },
    ],
  },
  {
    label: "The process",
    minWidth: 280,
    links: [
      { href: ROUTES.howItWorks, label: "How it works", note: "The eight stages of a sale" },
      { href: ROUTES.fees, label: "Fees", note: "5% success fee, no retainer" },
      { href: ROUTES.confidentiality, label: "Confidentiality", note: "Who sees what, and when" },
    ],
  },
  {
    label: "The firm",
    minWidth: 270,
    links: [
      { href: ROUTES.whoWeAre, label: "Who we are", note: "The firm and its founder" },
      { href: ROUTES.questions, label: "Questions", note: "Answers on fees, confidentiality, fit" },
      { href: ROUTES.why, label: "Why Heirloom", note: "How private businesses sell today" },
    ],
  },
]

/** Anchors on pages that other pages deep-link to. Keep in sync with the `id` on the target element. */
export const ANCHORS = {
  buyerRegister: `${ROUTES.buyers}#buyer-register`,
} as const

/**
 * Flat list for the mobile menu. Each destination appears once: "Sell my business" is the owner-facing
 * name for the how-it-works page, so the page is not listed a second time under its own title.
 */
export const MOBILE_NAV_LINKS: Array<{ href: string; label: string; muted?: boolean }> = [
  { href: ROUTES.howItWorks, label: "Sell my business" },
  { href: ROUTES.offerReview, label: "Review my offer" },
  { href: ROUTES.score, label: "Check sale readiness" },
  { href: ROUTES.fees, label: "Fees" },
  { href: ROUTES.confidentiality, label: "Confidentiality" },
  { href: ROUTES.whoWeAre, label: "Who we are" },
  { href: ROUTES.questions, label: "Questions" },
  { href: ROUTES.why, label: "Why Heirloom" },
  { href: ROUTES.buyers, label: "For buyers", muted: true },
]

export const FOOTER_GROUPS: Array<{ label: string; links: Array<{ href: string; label: string }> }> = [
  {
    label: "For owners",
    links: [
      { href: ROUTES.howItWorks, label: "Sell my business" },
      { href: ROUTES.offerReview, label: "Review my offer" },
      { href: ROUTES.score, label: "Check sale readiness" },
      { href: ROUTES.fees, label: "Fees" },
      { href: ROUTES.confidentiality, label: "Confidentiality" },
    ],
  },
  {
    label: "For buyers",
    links: [
      { href: ROUTES.buyers, label: "Buyer Passport" },
      { href: ANCHORS.buyerRegister, label: "Get Heirloom Verified" },
    ],
  },
  {
    label: "The firm",
    links: [
      { href: ROUTES.whoWeAre, label: "Who we are" },
      { href: ROUTES.questions, label: "Questions" },
      { href: ROUTES.why, label: "Why Heirloom" },
    ],
  },
]

/** Ordered list of every public page, used by the sitemap and the e2e smoke suite. */
export const ALL_ROUTES: RoutePath[] = Object.values(ROUTES)
