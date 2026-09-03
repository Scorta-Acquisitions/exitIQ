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
  hello: "hello@heirloom.com",
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
    title: "Sell Your Business Privately | Heirloom",
    description:
      "Heirloom represents owners of established private businesses and runs the sale from preparation through closing. Create buyer competition, protect confidentiality, and keep more of the outcome.",
  },
  score: {
    title: "Is Your Business Ready to Sell? | exitIQ by Heirloom",
    description:
      "See how buyers and lenders would view your business today. Answer seven questions and get practical findings plus a 90-day action plan.",
  },
  offerReview: {
    title: "Free Business Offer Review | Heirloom",
    description:
      "Already have a buyer or offer? Heirloom reviews the cash, financing, earnouts, exclusivity, transition terms, missing terms, and closing risk for free.",
  },
  howItWorks: {
    title: "How Heirloom Sells Your Business",
    description:
      "See how Heirloom prepares your company, creates a private buyer market, negotiates offers, manages diligence and financing, and carries the sale through closing.",
  },
  fees: {
    title: "M&A Advisory Fees | Heirloom",
    description:
      "A 5% success fee for a full private sale, 2.5% with an existing buyer, and a free initial Offer Review. See how Heirloom’s fee compares with traditional alternatives.",
  },
  confidentiality: {
    title: "Sell Your Business Confidentially | Heirloom",
    description:
      "Your company is never publicly listed. See how Heirloom controls buyer access, protects your identity, applies your exclusions, and records every disclosure.",
  },
  buyers: {
    title: "Buyer Passport | Heirloom",
    description:
      "Prove your identity, acquisition criteria, and capacity range once. Keep the record current and share only the details you choose.",
  },
  whoWeAre: {
    title: "Who We Are | Heirloom",
    description:
      "Meet the people and transaction experience behind Heirloom, including millions in enterprise value transacted through the firm and prior founder buy-side experience.",
  },
  questions: {
    title: "Business Sale Questions | Heirloom",
    description:
      "Answers on fees, confidentiality, fit, timing, buyers, transaction experience, and what happens from preparation through closing.",
  },
  why: {
    title: "Why Heirloom Exists | Heirloom",
    description:
      "Professional buyers have become more sophisticated. Heirloom gives established business owners a private, prepared, competitive sale process of their own.",
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
      { href: ROUTES.howItWorks, label: "Sell my business", note: "A private sale from preparation through closing" },
      {
        href: ROUTES.offerReview,
        label: "Review my offer",
        note: "A free read of the buyer and terms in front of you",
      },
      { href: ROUTES.score, label: "Check my business", note: "See how buyers and lenders would view it today" },
    ],
  },
  {
    label: "The process",
    minWidth: 280,
    links: [
      { href: ROUTES.howItWorks, label: "How it works", note: "What Heirloom handles and what you decide" },
      { href: ROUTES.fees, label: "Fees", note: "Full-sale, existing-buyer, and readiness economics" },
      { href: ROUTES.confidentiality, label: "Confidentiality", note: "Who can see what, and when" },
    ],
  },
  {
    label: "The firm",
    minWidth: 270,
    links: [
      { href: ROUTES.whoWeAre, label: "Who we are", note: "The experience and people behind your sale" },
      { href: ROUTES.questions, label: "Questions", note: "Answers on fees, confidentiality, fit, and process" },
      { href: ROUTES.why, label: "Why Heirloom", note: "The problem with how private businesses sell" },
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
  { href: ROUTES.score, label: "Check if my business is ready" },
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
      { href: ROUTES.score, label: "Check my business" },
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
