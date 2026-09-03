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
        a: "For a full private sale, you pay a $5,000 engagement commitment and a 5% success fee. The $5,000 is credited in full toward the success fee if the business sells. There is no monthly retainer, listing fee, or minimum success fee.",
        a2: "If you already have the buyer, the initial Offer Review is free. If you hire Heirloom to negotiate and manage that transaction through closing, the success fee is 2.5% with no upfront fee.",
      },
      {
        q: "Is the $5,000 refundable if the business does not sell?",
        a: "No. It is credited toward the 5% success fee if the business sells and is not refunded if no sale occurs. You keep the financial work, valuation, sale materials, buyer research, and outreach record produced for your business.",
      },
      {
        q: "What does the 5% apply to?",
        a: "The fee applies to purchase value you receive, including cash at closing, seller financing, earnouts, and retained ownership under the engagement terms. Fees tied to a seller note or earnout are collected as those payments arrive. Genuine post-close salary is excluded.",
      },
      {
        q: "How does 5% compare with a traditional broker or M&A firm?",
        a: "Traditional firms in this market can charge high single digits or low double digits, sometimes with minimums or a rate that declines as the deal gets larger. Heirloom charges 5% with no minimum. At many transactions in our core range, that can be roughly half the traditional fee. The right comparison is between the actual agreements because fee schedules vary.",
      },
      {
        q: "Why would I pay 2.5% if I found the buyer?",
        a: "Finding a buyer does not complete the sale. Price, cash at closing, financing, working capital, diligence, transition, legal terms, and closing risk can all change after the first offer. The 2.5% covers representation through negotiation, diligence, financing, late price-cut defense, and closing.",
      },
    ],
  },
  {
    id: "q-conf",
    label: "Confidentiality",
    items: [
      {
        q: "Will my employees find out I am selling?",
        a: "Heirloom will not tell them. We do not contact employees, customers, or suppliers without your approval. Prospective buyers begin with an anonymous overview and learn the company identity only after signing an NDA and passing initial review.",
      },
      {
        q: "Will my business be listed publicly?",
        a: "No. Heirloom does not place your company or confidential information on a public business-for-sale marketplace. Buyer outreach is private and begins without naming the business.",
      },
      {
        q: "Who decides which buyers can see my information?",
        a: "You set the buyer categories, named exclusions, and information boundaries before outreach. Heirloom works inside those rules and returns to you for genuine exceptions. Routine outreach does not require buyer-by-buyer approval.",
      },
      {
        q: "What does a prospective buyer see before learning my name?",
        a: "Industry, broad geography, and a revenue or earnings range. The anonymous overview does not include the company name, exact city, customers, website, or owner. Identity and full buyer materials follow a signed NDA; deeper financial and contract information follows buyer qualification.",
      },
      {
        q: "What happens to my data if I stop the process?",
        a: "Buyer access is revoked immediately and buyers are told only that the owner withdrew. Your engagement states the retention and deletion rules for documents, recordings, transcripts, and transaction records. Different records have different legal and operational retention periods, all disclosed before you sign.",
      },
    ],
  },
  {
    id: "q-fit",
    label: "Fit and readiness",
    items: [
      {
        q: "What size businesses does Heirloom work with?",
        a: "We usually represent US businesses with at least $1M in annual revenue and a transaction value below $10M. We review larger opportunities and exceptional smaller businesses individually. Strong records and a realistic path to buyer competition matter as much as industry.",
      },
      {
        q: "Can you value my business from seven questions?",
        a: "No. exitIQ shows how buyers and lenders may view the business today and identifies the highest-priority readiness issues. A defensible valuation requires verified financials, market evidence, and advisor judgment.",
      },
      {
        q: "What happens if I am not ready to sell?",
        a: "We explain the issues, give you specific milestones, and help coordinate the right accountants, lawyers, lenders, or other specialists. If the business should wait, we can revisit it after the work is complete. Material readiness work is scoped and priced before it begins.",
      },
      {
        q: "What happens if Heirloom cannot sell my business?",
        a: "We explain in writing why the process did not produce an acceptable sale, and you keep the work created for your business. The $5,000 engagement commitment is not refunded. We accept a full-sale engagement only when a realistic buyer market and seller outcome look possible.",
      },
    ],
  },
  {
    id: "q-process",
    label: "Sale process",
    items: [
      {
        q: "How long does it take to sell a business this size?",
        a: "Many transactions can close in roughly six to nine months. Timing depends on how ready the business is, buyer interest, financing, diligence, and legal work. Heirloom is designed to compress the parts we control through preparation, buyer qualification, and coordinated execution.",
      },
      {
        q: "What does software do, and what does the advisor decide?",
        a: "Software helps organize records, detect inconsistencies, research buyers, draft materials, and answer routine questions from approved evidence. Your advisor decides valuation, disclosure, negotiation positions, material diligence answers, and offer recommendations. Software cannot release sensitive information or communicate a negotiating position on its own.",
      },
      {
        q: "Who actually runs my deal?",
        a: "One named M&A advisor owns the engagement from the first conversation through closing. Suyash Agrawal leads Heirloom’s early seller engagements personally, supported by engineers and transaction specialists. We aim to respond the same business day and handle urgent live-transaction issues promptly.",
      },
      {
        q: "How much of the sale falls on me?",
        a: "You explain your goals and the business, approve the privacy rules and sale materials, meet the serious buyers you choose, and decide on the offer and major terms. Heirloom manages the financial preparation, buyer process, negotiation, diligence, financing, specialists, and closing coordination.",
      },
      {
        q: "Can I talk to someone without giving a phone number?",
        a: "Yes. Email Suyash directly at hello@heirloom.com. A phone number is not required to ask a question or begin a conversation, and your email is not added to an automated marketing sequence.",
      },
    ],
  },
  {
    id: "q-buyers",
    label: "Buyers",
    items: [
      {
        q: "Does Heirloom represent buyers?",
        a: "No. Heirloom represents sellers in transactions and never buys a represented business for its own account. Buyer Passport verifies buyers; it does not advise them on a Heirloom-represented transaction.",
      },
      {
        q: "Do buyers pay Heirloom?",
        a: "Buyers do not pay Heirloom a transaction fee on a business we represent. Buyer Passport is currently free.",
      },
      {
        q: "What is Buyer Passport?",
        a: "A private buyer record that can confirm identity, acquisition criteria, capacity range, and lender preparation. Verification is dated, capacity appears as a range, and the buyer controls which approved details each recipient sees. A seller or advisor can verify an authentic Passport without creating an account.",
      },
    ],
  },
  {
    id: "q-about",
    label: "About Heirloom",
    items: [
      {
        q: "What transaction experience does Heirloom have?",
        a: "Heirloom has transacted millions of dollars in enterprise value through the firm. Separately, founder and CEO Suyash Agrawal previously transacted millions of dollars in enterprise value on the buy side through micro-PE investing and operations. Heirloom firm experience and Suyash’s earlier buy-side experience are separate records.",
      },
      {
        q: "Why should I trust Heirloom with the sale?",
        a: "Heirloom combines firm transaction experience, prior founder buy-side experience, a named lead advisor, seller-only representation, a private buyer process, and published fees. Suyash leads early seller engagements personally, and the full process from preparation through closing is available for review before you engage us.",
      },
      {
        q: "Is Project Ridgeline a real transaction?",
        a: "No. Project Ridgeline is a fictional company created to show how Heirloom prepares financials, controls buyer access, answers diligence, and compares offers without exposing a seller’s information. Its company, people, buyers, activity, and figures are invented and labeled wherever they appear.",
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
    a: "A full sale carries a 5% success fee. The $5,000 engagement commitment is credited toward that fee if the business sells.",
  },
  {
    q: "Will my employees find out?",
    a: "Heirloom never contacts your employees, customers, or suppliers without your approval. Buyers see an anonymous overview before your identity is released.",
  },
  {
    q: "What if I already have a buyer?",
    a: "We review the offer for free. If you hire us to negotiate and manage that transaction through closing, the success fee is 2.5%.",
  },
  {
    q: "How long does a sale take?",
    a: "Many transactions of this size can close in roughly six to nine months. Readiness, buyer financing, diligence, and legal work affect the timing.",
  },
  {
    q: "Who runs my sale?",
    a: "One named M&A advisor owns the engagement from the first conversation through close. Suyash leads Heirloom’s early seller engagements personally.",
  },
]

export function askQuestionBody(question: string, email: string): string {
  return `Question: ${question}\n\nReply to: ${email}`
}
