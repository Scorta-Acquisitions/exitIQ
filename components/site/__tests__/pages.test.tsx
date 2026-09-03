import { screen, within } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import BuyersPage, { metadata as buyersMeta } from "@/app/buyers/page"
import ConfidentialityPage, { metadata as confidentialityMeta } from "@/app/confidentiality/page"
import FeesPage, { metadata as feesMeta } from "@/app/fees/page"
import HowItWorksPage, { metadata as howItWorksMeta } from "@/app/how-it-works/page"
import NotFound, { metadata as notFoundMeta } from "@/app/not-found"
import OfferReviewPage, { metadata as offerReviewMeta } from "@/app/offer-review/page"
import HomePage from "@/app/page"
import QuestionsPage, { metadata as questionsMeta } from "@/app/questions/page"
import ScorePage, { metadata as scoreMeta } from "@/app/score/page"
import WhoWeArePage, { metadata as whoWeAreMeta } from "@/app/who-we-are/page"
import WhyPage, { metadata as whyMeta } from "@/app/why/page"
import { BUYER_QUESTIONS, PASSPORT_BENEFITS } from "@/lib/site/buyers/passport"
import { CONFIDENTIALITY_RULES, OWNER_CONTROLS, OWNER_DECIDES } from "@/lib/site/confidentiality/data"
import { HARD_PARTS, TIMING_ROWS } from "@/lib/site/content/stages"
import { QUESTION_CATEGORIES, QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { ANCHORS, CONTACT, PAGE_META, ROUTES } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

const ROUTE_PATHS = new Set<string>(Object.values(ROUTES))
const CROSS_PAGE_ANCHORS = new Set<string>(Object.values(ANCHORS))
const CONTACT_EMAILS = new Set<string>([CONTACT.hello, CONTACT.offers, CONTACT.buyers])

/** Every page is a synchronous server component; render it inside the site provider so client children work. */
function renderPage(page: ReactElement) {
  return renderWithSite(page)
}

function onlyH1(text: string) {
  const headings = screen.getAllByRole("heading", { level: 1 })
  expect(headings).toHaveLength(1)
  expect(headings[0]).toHaveTextContent(text)
}

/**
 * Walks every anchor on the page:
 * - internal hrefs must be a ROUTES path (query allowed) or a known cross-page anchor,
 * - in-page `#hash` hrefs must target an element with that id,
 * - mailto hrefs must use a CONTACT address,
 * - http(s) hrefs must open in a new tab with rel noopener.
 */
function auditLinks(container: HTMLElement) {
  const anchors = Array.from(container.querySelectorAll<HTMLAnchorElement>("a[href]"))
  expect(anchors.length).toBeGreaterThan(0)
  for (const a of anchors) {
    const href = a.getAttribute("href") ?? ""
    if (href.startsWith("mailto:")) {
      const address = href.slice("mailto:".length).split("?")[0] ?? ""
      expect(CONTACT_EMAILS.has(address), `mailto address in ${href}`).toBe(true)
    } else if (/^https?:\/\//.test(href)) {
      expect(a, `external ${href} target`).toHaveAttribute("target", "_blank")
      expect(a.getAttribute("rel") ?? "", `external ${href} rel`).toContain("noopener")
    } else if (href.startsWith("#")) {
      expect(container.querySelector(`[id="${href.slice(1)}"]`), `in-page target for ${href}`).not.toBeNull()
    } else {
      const [pathAndQuery = "", hash] = href.split("#")
      const path = pathAndQuery.split("?")[0] ?? ""
      expect(ROUTE_PATHS.has(path), `internal path in ${href}`).toBe(true)
      if (hash !== undefined) expect(CROSS_PAGE_ANCHORS.has(href), `cross-page anchor ${href}`).toBe(true)
    }
  }
}

function countText(container: HTMLElement, needle: RegExp) {
  return (container.textContent ?? "").match(needle)?.length ?? 0
}

describe("Home page", () => {
  it("renders exactly one h1 with the hero headline", () => {
    renderPage(<HomePage />)
    onlyH1("Sell your business to the right buyer, on the right terms.")
  })

  it("links only to known routes, contact addresses, and safe external targets", () => {
    const { container } = renderPage(<HomePage />)
    auditLinks(container)
  })

  it("opens the Y Combinator badge in a new tab with noopener", () => {
    renderPage(<HomePage />)
    const yc = screen.getByRole("link", { name: "BACKED BY Y COMBINATOR" })
    expect(yc).toHaveAttribute("href", CONTACT.ycombinator)
    expect(yc).toHaveAttribute("target", "_blank")
    expect(yc).toHaveAttribute("rel", "noopener")
  })

  it("shows the Project Ridgeline worked example in the financial preparation card", () => {
    const { container } = renderPage(<HomePage />)
    expect(countText(container, /Project Ridgeline/g)).toBeGreaterThanOrEqual(1)
  })

  it("routes the founder email to the hello inbox", () => {
    renderPage(<HomePage />)
    expect(screen.getByRole("link", { name: "Email Suyash" })).toHaveAttribute("href", `mailto:${CONTACT.hello}`)
  })
})

describe("Score page", () => {
  it("renders exactly one h1 with the exitIQ headline", () => {
    renderPage(<ScorePage />)
    onlyH1("See how buyers would view your business today.")
  })

  it("exports the exitIQ page metadata", () => {
    expect(scoreMeta).toEqual({ title: PAGE_META.score.title, description: PAGE_META.score.description })
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<ScorePage />)
    auditLinks(container)
  })

  it("points the result cards and footer links at fees, how it works, and offer review", () => {
    renderPage(<ScorePage />)
    expect(screen.getByRole("link", { name: /See how Heirloom runs a sale/ })).toHaveAttribute(
      "href",
      ROUTES.howItWorks
    )
    expect(screen.getByRole("link", { name: "See fees →" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getByRole("link", { name: /Ready to sell\? See how Heirloom runs the process\./ })).toHaveAttribute(
      "href",
      ROUTES.howItWorks
    )
    expect(
      screen.getByRole("link", { name: /Already have a buyer\? Have the offer reviewed first\./ })
    ).toHaveAttribute("href", ROUTES.offerReview)
  })

  it("states the educational disclaimer under the run", () => {
    renderPage(<ScorePage />)
    expect(screen.getByText(/exitIQ is an educational readiness screen/)).toBeInTheDocument()
  })
})

describe("Offer review page", () => {
  const params = (mode?: string | string[]) => Promise.resolve(mode === undefined ? {} : { mode })

  it("renders exactly one h1 with the offer review headline", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    onlyH1("Before you sign, know what the offer really pays.")
  })

  it("exports the offer review page metadata", () => {
    expect(offerReviewMeta).toEqual({
      title: PAGE_META.offerReview.title,
      description: PAGE_META.offerReview.description,
    })
  })

  it("links only to known routes, in-page anchors, and contact addresses", async () => {
    const { container } = renderPage(await OfferReviewPage({ searchParams: params() }))
    auditLinks(container)
  })

  it("starts on the forward tab when no mode is requested", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    expect(screen.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("oi-tab-paste")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "false")
  })

  it("selects the paste tab for ?mode=paste", async () => {
    renderPage(await OfferReviewPage({ searchParams: params("paste") }))
    expect(screen.getByTestId("oi-tab-paste")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByLabelText("Paste the offer or buyer email")).toBeInTheDocument()
  })

  it("selects the verbal tab for ?mode=verbal", async () => {
    renderPage(await OfferReviewPage({ searchParams: params("verbal") }))
    expect(screen.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByLabelText("Price or range discussed")).toBeInTheDocument()
  })

  it("falls back to the forward tab for an unknown mode", async () => {
    renderPage(await OfferReviewPage({ searchParams: params("telegram") }))
    expect(screen.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "false")
  })

  it("falls back to the forward tab when mode is repeated in the query", async () => {
    renderPage(await OfferReviewPage({ searchParams: params(["paste", "verbal"]) }))
    expect(screen.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
  })

  it("labels the Project Ridgeline letter of intent as fictional", async () => {
    const { container } = renderPage(await OfferReviewPage({ searchParams: params() }))
    expect(countText(container, /fictional/g)).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Letter of intent · Project Ridgeline")).toBeInTheDocument()
  })

  it("separates the headline price from cash at closing in the worked example", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    expect(screen.getByText("$4.65M")).toBeInTheDocument()
    expect(screen.getByText("$3.45M, or 74% of the headline price")).toBeInTheDocument()
    expect(screen.getByText("2.5% success fee")).toBeInTheDocument()
  })

  it("offers a direct mailto to the offers inbox", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    expect(screen.getByRole("link", { name: `Forward it to ${CONTACT.offers}` })).toHaveAttribute(
      "href",
      `mailto:${CONTACT.offers}`
    )
  })
})

describe("How it works page", () => {
  it("renders exactly one h1 with the process headline", () => {
    renderPage(<HowItWorksPage />)
    onlyH1("You make the decisions. We carry the deal.")
  })

  it("exports the how it works page metadata", () => {
    expect(howItWorksMeta).toEqual({ title: PAGE_META.howItWorks.title, description: PAGE_META.howItWorks.description })
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<HowItWorksPage />)
    auditLinks(container)
  })

  it("routes the fee and readiness buttons to /fees and /score", () => {
    renderPage(<HowItWorksPage />)
    expect(screen.getByRole("link", { name: "See fees" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getByRole("link", { name: "Check if my business is ready" })).toHaveAttribute("href", ROUTES.score)
  })

  it("renders every timing row label and value", () => {
    renderPage(<HowItWorksPage />)
    for (const [label, value] of TIMING_ROWS) {
      expect(screen.getByText(label)).toBeInTheDocument()
      expect(screen.getByText(value)).toBeInTheDocument()
    }
  })

  it("renders every hard-part title", () => {
    renderPage(<HowItWorksPage />)
    for (const part of HARD_PARTS) expect(screen.getByText(part.title)).toBeInTheDocument()
  })

  it("shows the Project Ridgeline reconciliation example", () => {
    const { container } = renderPage(<HowItWorksPage />)
    expect(countText(container, /Project Ridgeline/g)).toBeGreaterThanOrEqual(1)
  })

  it("places three advisor calls to action on the page", () => {
    renderPage(<HowItWorksPage />)
    expect(screen.getAllByTestId("open-advisor")).toHaveLength(3)
  })
})

describe("Fees page", () => {
  it("renders exactly one h1 with the fees headline", () => {
    renderPage(<FeesPage />)
    onlyH1("What Heirloom costs.")
  })

  it("exports the fees page metadata", () => {
    expect(feesMeta).toEqual({ title: PAGE_META.fees.title, description: PAGE_META.fees.description })
  })

  it("links only to known routes, in-page anchors, and contact addresses", () => {
    const { container } = renderPage(<FeesPage />)
    auditLinks(container)
  })

  it("headlines the three fee numbers with their notes", () => {
    renderPage(<FeesPage />)
    const bigNumber = (note: string) => screen.getByText(note).previousSibling
    expect(bigNumber("Full private sale, paid when the transaction closes")).toHaveTextContent("5%")
    expect(
      bigNumber("Engagement commitment, credited in full toward the 5% success fee if the business sells")
    ).toHaveTextContent("$5,000")
    expect(
      bigNumber("Existing-buyer transaction, with a free offer review first and no upfront fee")
    ).toHaveTextContent("2.5%")
  })

  it("scrolls the calculator buttons to the #fees-calc heading", () => {
    const { container } = renderPage(<FeesPage />)
    expect(screen.getByRole("link", { name: "Calculate my fee" })).toHaveAttribute("href", "#fees-calc")
    expect(screen.getByRole("link", { name: "Compare the fees on my sale →" })).toHaveAttribute("href", "#fees-calc")
    expect(container.querySelector("#fees-calc")).toHaveTextContent("What would Heirloom cost on your sale?")
  })

  it("routes both offer review links to /offer-review", () => {
    renderPage(<FeesPage />)
    expect(screen.getByRole("link", { name: "Review my offer →" })).toHaveAttribute("href", ROUTES.offerReview)
    expect(screen.getByRole("link", { name: "Review my offer" })).toHaveAttribute("href", ROUTES.offerReview)
  })

  it("routes the closing links to /score and /how-it-works", () => {
    renderPage(<FeesPage />)
    expect(screen.getByRole("link", { name: /Still deciding\? Check if my business is ready\./ })).toHaveAttribute(
      "href",
      ROUTES.score
    )
    expect(screen.getByRole("link", { name: /Want the details\? See how the sale works\./ })).toHaveAttribute(
      "href",
      ROUTES.howItWorks
    )
  })

  it("answers the five common fee questions", () => {
    renderPage(<FeesPage />)
    expect(screen.getByText("Why is there a $5,000 engagement commitment?")).toBeInTheDocument()
    expect(screen.getByText("Is the $5,000 refundable if the business does not sell?")).toBeInTheDocument()
    expect(screen.getByText("What does the 5% apply to?")).toBeInTheDocument()
    expect(screen.getByText("Why pay 2.5% if I found the buyer?")).toBeInTheDocument()
    expect(screen.getByText("Is there a minimum fee?")).toBeInTheDocument()
    expect(screen.getByText("No. The percentage applies without a minimum success fee.")).toBeInTheDocument()
  })

  it("lists the five separate third-party costs", () => {
    renderPage(<FeesPage />)
    for (const title of [
      "Readiness work",
      "Your lawyer",
      "Your accountant or quality-of-earnings provider",
      "Tax advice",
      "Other specialists",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })
})

describe("Confidentiality page", () => {
  it("renders exactly one h1 with the confidentiality headline", () => {
    renderPage(<ConfidentialityPage />)
    onlyH1("Deciding to sell should stay private.")
  })

  it("exports the confidentiality page metadata", () => {
    expect(confidentialityMeta).toEqual({
      title: PAGE_META.confidentiality.title,
      description: PAGE_META.confidentiality.description,
    })
  })

  it("links only to known routes, in-page anchors, and contact addresses", () => {
    const { container } = renderPage(<ConfidentialityPage />)
    auditLinks(container)
  })

  it("scrolls the disclosure-levels button to the #conf-levels panel", () => {
    const { container } = renderPage(<ConfidentialityPage />)
    expect(screen.getByRole("link", { name: "See the disclosure levels" })).toHaveAttribute("href", "#conf-levels")
    expect(container.querySelector("#conf-levels")).toBe(screen.getByTestId("disclosure-levels"))
  })

  it("routes the private check to /score", () => {
    renderPage(<ConfidentialityPage />)
    expect(screen.getByRole("link", { name: "Check my business privately" })).toHaveAttribute("href", ROUTES.score)
  })

  it("numbers and renders every confidentiality rule", () => {
    renderPage(<ConfidentialityPage />)
    CONFIDENTIALITY_RULES.forEach((rule, i) => {
      expect(screen.getByRole("heading", { level: 3, name: rule.title })).toBeInTheDocument()
      expect(screen.getByText(rule.body)).toBeInTheDocument()
      expect(screen.getByText(String(i + 1).padStart(2, "0"))).toBeInTheDocument()
    })
  })

  it("lists what the owner decides up front and the controls they keep", () => {
    renderPage(<ConfidentialityPage />)
    for (const t of OWNER_DECIDES) expect(screen.getByText(t)).toBeInTheDocument()
    for (const t of OWNER_CONTROLS) expect(screen.getByText(t)).toBeInTheDocument()
  })

  it("shows the Project Ridgeline company record", () => {
    renderPage(<ConfidentialityPage />)
    expect(screen.getByText("Company record · Project Ridgeline")).toBeInTheDocument()
  })

  it("places two advisor calls to action on the page", () => {
    renderPage(<ConfidentialityPage />)
    expect(screen.getAllByTestId("open-advisor")).toHaveLength(2)
  })
})

describe("Buyers page", () => {
  it("renders exactly one h1 with the Buyer Passport headline", () => {
    renderPage(<BuyersPage />)
    onlyH1("Prove you are ready to close.")
  })

  it("exports the buyers page metadata", () => {
    expect(buyersMeta).toEqual({ title: PAGE_META.buyers.title, description: PAGE_META.buyers.description })
  })

  it("links only to known routes, in-page anchors, and contact addresses", () => {
    const { container } = renderPage(<BuyersPage />)
    auditLinks(container)
  })

  it("points all four register buttons at the #buyer-register form", () => {
    const { container } = renderPage(<BuyersPage />)
    const verified = screen.getAllByRole("link", { name: "Get Heirloom Verified" })
    const register = screen.getAllByRole("link", { name: "Register my criteria" })
    expect(verified).toHaveLength(2)
    expect(register).toHaveLength(2)
    for (const a of [...verified, ...register]) expect(a).toHaveAttribute("href", "#buyer-register")
    expect(container.querySelector("#buyer-register")).toHaveTextContent("Tell us what you buy.")
  })

  it("renders every passport benefit", () => {
    renderPage(<BuyersPage />)
    for (const b of PASSPORT_BENEFITS) {
      expect(screen.getByText(b.title)).toBeInTheDocument()
      expect(screen.getByText(b.body)).toBeInTheDocument()
    }
  })

  it("numbers the questions buyers answer from 01", () => {
    renderPage(<BuyersPage />)
    BUYER_QUESTIONS.forEach((q, i) => {
      expect(screen.getByText(q)).toBeInTheDocument()
      expect(screen.getByText(`0${i + 1}`)).toBeInTheDocument()
    })
  })
})

describe("Who we are page", () => {
  it("renders exactly one h1 with the firm headline", () => {
    renderPage(<WhoWeArePage />)
    onlyH1("M&A experience from both sides of the table.")
  })

  it("exports the who we are page metadata", () => {
    expect(whoWeAreMeta).toEqual({ title: PAGE_META.whoWeAre.title, description: PAGE_META.whoWeAre.description })
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<WhoWeArePage />)
    auditLinks(container)
  })

  it("renders the four firm facts", () => {
    renderPage(<WhoWeArePage />)
    expect(screen.getByText("Heirloom transactions").nextSibling).toHaveTextContent("Millions in enterprise value")
    expect(screen.getByText("Founder buy-side experience").nextSibling).toHaveTextContent(
      "Millions in enterprise value, before Heirloom"
    )
    expect(screen.getByText("Engagement model").nextSibling).toHaveTextContent("One accountable M&A advisor")
    expect(screen.getByText("Backing").nextSibling).toHaveTextContent("Y Combinator")
  })

  it("shows the founder portrait with a descriptive alt text", () => {
    renderPage(<WhoWeArePage />)
    const img = screen.getByRole("img", { name: "Suyash Agrawal, founder and CEO of Heirloom" })
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/suyash-portrait.jpg")
  })

  it("emails Suyash at the hello inbox and shows the address", () => {
    renderPage(<WhoWeArePage />)
    expect(screen.getByRole("link", { name: "Email Suyash" })).toHaveAttribute("href", `mailto:${CONTACT.hello}`)
    expect(screen.getByText(CONTACT.hello)).toBeInTheDocument()
  })

  it("labels both advisor calls to action with the founder's name", () => {
    renderPage(<WhoWeArePage />)
    const ctas = screen.getAllByTestId("open-advisor")
    expect(ctas.map((b) => b.textContent)).toEqual(["Talk to Suyash", "Talk to Suyash about my business"])
  })

  it("routes both process links to /how-it-works", () => {
    renderPage(<WhoWeArePage />)
    expect(screen.getByRole("link", { name: "See how Heirloom sells a business →" })).toHaveAttribute(
      "href",
      ROUTES.howItWorks
    )
    expect(screen.getByRole("link", { name: "See how Heirloom works →" })).toHaveAttribute("href", ROUTES.howItWorks)
  })
})

describe("Questions page", () => {
  it("renders exactly one h1 with the questions headline", () => {
    renderPage(<QuestionsPage />)
    onlyH1("What owners ask before they sell.")
  })

  it("exports the questions page metadata", () => {
    expect(questionsMeta).toEqual({ title: PAGE_META.questions.title, description: PAGE_META.questions.description })
  })

  it("links only to known routes, in-page anchors, and contact addresses", () => {
    const { container } = renderPage(<QuestionsPage />)
    auditLinks(container)
  })

  it("links every category chip to a heading that exists on the page", () => {
    const { container } = renderPage(<QuestionsPage />)
    const nav = screen.getByRole("navigation", { name: "Question categories" })
    for (const link of QUESTION_CATEGORY_LINKS) {
      expect(within(nav).getByRole("link", { name: link.label })).toHaveAttribute("href", link.href)
      const target = container.querySelector(link.href)
      expect(target).not.toBeNull()
      expect(target?.tagName).toBe("H2")
    }
    expect(within(nav).getByRole("link", { name: "Ask a question" })).toHaveAttribute("href", "#q-ask")
    expect(container.querySelector("#q-ask")).not.toBeNull()
  })

  it("renders every question from every category", () => {
    renderPage(<QuestionsPage />)
    for (const cat of QUESTION_CATEGORIES) {
      for (const item of cat.items) {
        expect(screen.getByRole("button", { name: item.q })).toHaveAttribute("aria-expanded", "false")
      }
    }
  })
})

describe("Why page", () => {
  it("renders exactly one h1 with the why headline", () => {
    renderPage(<WhyPage />)
    onlyH1("Owners deserve the same deal discipline as buyers.")
  })

  it("exports the why page metadata", () => {
    expect(whyMeta).toEqual({ title: PAGE_META.why.title, description: PAGE_META.why.description })
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<WhyPage />)
    auditLinks(container)
  })

  it("routes each closing card to its destination", () => {
    renderPage(<WhyPage />)
    expect(screen.getByRole("link", { name: "See how Heirloom works" })).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getByRole("link", { name: "See the full sale process →" })).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getByRole("link", { name: "Compare the fees →" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getByRole("link", { name: "See our confidentiality controls →" })).toHaveAttribute(
      "href",
      ROUTES.confidentiality
    )
    expect(screen.getByRole("link", { name: "Read who we are →" })).toHaveAttribute("href", ROUTES.whoWeAre)
    expect(screen.getByRole("link", { name: "Check my business →" })).toHaveAttribute("href", ROUTES.score)
    expect(screen.getByRole("link", { name: "Review my offer →" })).toHaveAttribute("href", ROUTES.offerReview)
    expect(screen.getByRole("link", { name: "Get Heirloom Verified →" })).toHaveAttribute("href", ROUTES.buyers)
  })

  it("shows the general contact address as a mailto link", () => {
    renderPage(<WhyPage />)
    expect(screen.getByRole("link", { name: CONTACT.hello })).toHaveAttribute("href", `mailto:${CONTACT.hello}`)
  })

  it("names the three paths an owner can take", () => {
    renderPage(<WhyPage />)
    expect(screen.getByText("Broad exposure")).toBeInTheDocument()
    expect(screen.getByText("No market test")).toBeInTheDocument()
    expect(screen.getByText("A private market, fully managed")).toBeInTheDocument()
  })

  it("labels both advisor calls to action Talk to Suyash", () => {
    renderPage(<WhyPage />)
    const ctas = screen.getAllByTestId("open-advisor")
    expect(ctas).toHaveLength(2)
    for (const b of ctas) expect(b).toHaveTextContent("Talk to Suyash")
  })
})

describe("Not found page", () => {
  it("renders exactly one h1 with the not-found headline", () => {
    renderPage(<NotFound />)
    onlyH1("That page is not part of the record.")
  })

  it("exports a Page not found title and asks robots not to index it", () => {
    expect(notFoundMeta.title).toBe("Page not found | Heirloom")
    expect(notFoundMeta.robots).toEqual({ index: false })
    expect(notFoundMeta.description).toBe(
      "The address may have changed. Start from the Heirloom home page or go straight to the sale process."
    )
  })

  it("offers a way home and a way into the process", () => {
    renderPage(<NotFound />)
    expect(screen.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", ROUTES.home)
    expect(screen.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getAllByRole("link")).toHaveLength(2)
  })
})
