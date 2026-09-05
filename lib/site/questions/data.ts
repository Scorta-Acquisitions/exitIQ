/** Questions page content and the five-question teaser on the home page. */

export interface QuestionItem {
  q: string
  a: string
  a2?: string
}

export interface QuestionCategory {
  id: string
  label: string
  items: QuestionItem[]
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: "q-money",
    label: "Fees",
    items: [
      {
        q: "How much does Heirloom charge?",
        a: "A full private sale costs a $5,000 engagement commitment and a 5% success fee. The $5,000 is credited against the fee if the business sells. There is no retainer, listing fee, or minimum. If you already have a buyer, the offer review is free and the success fee is 2.5%, with no upfront fee.",
      },
      {
        q: "Is the $5,000 refundable if the business does not sell?",
        a: "No. It is credited against the success fee if the business sells and is not refunded otherwise. You keep the financial work, valuation, and materials produced.",
      },
      {
        q: "What does the 5% apply to?",
        a: "The purchase value you receive, including cash at closing, seller financing, earnouts, and retained ownership. The fee on cash paid at closing is due at closing. The fee on anything paid later is due when you receive it. Salary you earn after closing is excluded.",
      },
      {
        q: "How does 5% compare with a traditional broker or M&A firm?",
        a: "Firms at this deal size often charge high single-digit or low double-digit rates, sometimes with a minimum. At many transactions in our range, 5% is roughly half. Compare the actual agreements, because schedules vary.",
      },
      {
        q: "Why would I pay 2.5% if I found the buyer?",
        a: "Price, cash, financing, working capital, diligence, and legal terms can all change after the first offer. The 2.5% covers negotiation, diligence, financing coordination, and closing.",
      },
    ],
  },
  {
    id: "q-conf",
    label: "Confidentiality",
    items: [
      {
        q: "Will my employees find out I am selling?",
        a: "Not from Heirloom. We do not contact employees, customers, or suppliers without your approval, and buyers learn the company’s identity only after signing an NDA.",
      },
      {
        q: "Will my business be listed publicly?",
        a: "No. Buyer outreach is private and begins without naming the business.",
      },
      {
        q: "Who decides which buyers can see my information?",
        a: "You set the buyer categories, named exclusions, and information limits before outreach. Heirloom works inside those rules and comes back to you for exceptions.",
      },
      {
        q: "What does a prospective buyer see before learning my name?",
        a: "Industry, broad geography, and a revenue or earnings range. Your identity and full materials follow a signed NDA. Detailed financials and contracts follow qualification.",
      },
      {
        q: "What happens to my data if I stop the process?",
        a: "Buyer access is revoked and buyers are told only that the owner withdrew. Your engagement agreement states the retention and deletion rules for each type of record.",
      },
    ],
  },
  {
    id: "q-fit",
    label: "Fit and readiness",
    items: [
      {
        q: "What size businesses does Heirloom work with?",
        a: "Usually US businesses with at least $1M in annual revenue and a transaction value below $10M. We look at larger businesses, and exceptional smaller ones, individually.",
      },
      {
        q: "Can you value my business from seven questions?",
        a: "No. exitIQ shows how buyers and lenders may view the business and which readiness issues matter most. A valuation needs verified financials and market evidence.",
      },
      {
        q: "What happens if I am not ready to sell?",
        a: "We explain the issues, give you milestones, and coordinate the accountants, lawyers, or lenders needed. Significant readiness work is scoped and priced before it begins.",
      },
      {
        q: "What happens if Heirloom cannot sell my business?",
        a: "We explain in writing why no acceptable sale resulted, and you keep the work produced. The $5,000 commitment is not refunded. We take a full-sale engagement only when a realistic buyer market looks possible.",
      },
    ],
  },
  {
    id: "q-process",
    label: "Sale process",
    items: [
      {
        q: "How long does it take to sell a business this size?",
        a: "A traditional sale takes six to nine months. Heirloom closes in three to four months on average from launch to closing. Timing depends on how ready the business is, buyer interest, financing, diligence, and legal work.",
      },
      {
        q: "What does software do, and what does the advisor decide?",
        a: "Software organizes records, flags inconsistencies, researches buyers, drafts materials, and answers routine questions from approved evidence. Your advisor decides valuation, disclosure, negotiating positions, and offer recommendations. Software cannot release sensitive information on its own.",
      },
      {
        q: "Who runs my deal?",
        a: "One named advisor owns the engagement from the first conversation through closing. Suyash Agrawal leads early seller engagements himself, with engineers and transaction specialists supporting him.",
      },
      {
        q: "How much of the sale falls on me?",
        a: "You explain the business, approve the privacy rules and materials, meet the buyers you choose, and decide on the offer and major terms. Heirloom handles the rest.",
      },
      {
        q: "Can I talk to someone without giving a phone number?",
        a: "Yes. Send a question through the form on this page and a person replies once by email. Your address is not added to a marketing list.",
      },
    ],
  },
  {
    id: "q-buyers",
    label: "Buyers",
    items: [
      {
        q: "Does Heirloom represent buyers?",
        a: "No. Heirloom represents sellers and never buys a business it represents. Buyer Passport verifies buyers. It does not advise them.",
      },
      {
        q: "Do buyers pay Heirloom?",
        a: "Buyers pay no transaction fee on a business we represent. Buyer Passport is currently free.",
      },
      {
        q: "What is Buyer Passport?",
        a: "A private record confirming a buyer’s identity, acquisition criteria, capacity range, and lender preparation. Verification is dated, capacity appears as a range, and the buyer controls what each recipient sees.",
      },
    ],
  },
  {
    id: "q-about",
    label: "About Heirloom",
    items: [
      {
        q: "What transaction experience does Heirloom have?",
        a: "Heirloom has transacted millions of dollars in enterprise value. Before founding the firm, Suyash Agrawal acquired and operated small businesses as a micro-PE investor. Firm transactions and his earlier buy-side record are separate.",
      },
      {
        q: "Why should I trust Heirloom with the sale?",
        a: "We work for sellers only, publish our fees, and name the advisor who runs your engagement. The full process is on this site before you sign anything.",
      },
      {
        q: "Is Project Ridgeline a real transaction?",
        a: "No. Project Ridgeline is a fictional company used to show how Heirloom prepares financials, controls access, answers diligence, and compares offers. Every name and figure is invented.",
      },
    ],
  },
]

export const QUESTION_CATEGORY_LINKS: Array<{ href: string; label: string }> = [
  { href: "#q-money", label: "Fees" },
  { href: "#q-conf", label: "Confidentiality" },
  { href: "#q-fit", label: "Fit and readiness" },
  { href: "#q-process", label: "Sale process" },
  { href: "#q-buyers", label: "Buyers" },
  { href: "#q-about", label: "About Heirloom" },
]

export const HOME_TEASER: QuestionItem[] = [
  {
    q: "How much does Heirloom charge?",
    a: "A $5,000 engagement commitment and a 5% success fee. The $5,000 is credited against the fee if the business sells.",
  },
  {
    q: "Will my employees find out?",
    a: "Not from Heirloom. We do not contact employees, customers, or suppliers without your approval.",
  },
  {
    q: "What if I already have a buyer?",
    a: "The offer review is free. If you hire us to run the transaction, the success fee is 2.5%.",
  },
  {
    q: "How long does a sale take?",
    a: "Three to four months on average from launch to closing, 40% faster than a traditional sale.",
  },
  {
    q: "Who runs my sale?",
    a: "One named advisor owns the engagement from the first conversation through closing.",
  },
]

export function askQuestionBody(question: string, email: string): string {
  return `Question: ${question}\n\nReply to: ${email}`
}
