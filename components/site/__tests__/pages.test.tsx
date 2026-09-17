import { screen, within } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import BuyersPage from "@/app/buyers/page"
import ConfidentialityPage from "@/app/confidentiality/page"
import FeesPage from "@/app/fees/page"
import HowItWorksPage from "@/app/how-it-works/page"
import NotFound, { metadata as notFoundMeta } from "@/app/not-found"
import OfferReviewPage from "@/app/offer-review/page"
import HomePage from "@/app/page"
import QuestionsPage from "@/app/questions/page"
import ScorePage from "@/app/score/page"
import WhoWeArePage from "@/app/who-we-are/page"
import WhyPage from "@/app/why/page"
import { BUYER_QUESTIONS, PASSPORT_BENEFITS } from "@/lib/site/buyers/passport"
import { CONFIDENTIALITY_RULES, OWNER_CONTROLS, OWNER_DECIDES } from "@/lib/site/confidentiality/data"
import { HARD_PARTS, TIMING_ROWS } from "@/lib/site/content/stages"
import { QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { ANCHORS, CONTACT, ROUTES } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

const ROUTE_PATHS = new Set<string>(Object.values(ROUTES))
const CROSS_PAGE_ANCHORS = new Set<string>(Object.values(ANCHORS))
const CONTACT_EMAILS = new Set<string>([CONTACT.hello, CONTACT.offers, CONTACT.buyers])

/** Every page is a synchronous server component; render it inside the site provider so client children work. */
function renderPage(page: ReactElement) {
  return renderWithSite(page)
}

/** The value shown beside a label in a key/value row. */
function rowValue(label: string): string {
  return screen.getByText(label).nextElementSibling?.textContent ?? ""
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

describe("Home page", () => {
  it("renders exactly one h1 with the hero headline", () => {
    renderPage(<HomePage />)
    onlyH1("Sell your business privately, with qualified buyers competing.")
  })

  it("links only to known routes, contact addresses, and safe external targets", () => {
    const { container } = renderPage(<HomePage />)
    auditLinks(container)
  })

  it("stacks the sections in order, the console's question first and no founder or experience block", () => {
    renderPage(<HomePage />)
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Where are you today?",
      "Several buyers compete privately.",
      "Financial preparation",
      "Who sees what",
      "Compare offers",
      "The whole sale asks four decisions of you.",
      "40%faster than a traditional sale.",
      "Employees, customers, and the company name change hands too.",
      "Questions",
      "Choose a next step.",
    ])
  })
})

describe("Score page", () => {
  it("renders exactly one h1 with the exitIQ headline", () => {
    renderPage(<ScorePage />)
    onlyH1("Is the business ready to sell?")
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<ScorePage />)
    auditLinks(container)
  })

  it("points the result cards and footer links at fees, how it works, and offer review", () => {
    renderPage(<ScorePage />)
    const process = screen.getAllByRole("link", { name: /^See how it works/ })
    expect(process).toHaveLength(2)
    expect(process[0]).toHaveTextContent("See how it worksThe eight stages from preparation to closing.")
    for (const link of process) expect(link).toHaveAttribute("href", ROUTES.howItWorks)
    expect(process[1]).toHaveTextContent("See how it works →")
    expect(screen.getByRole("link", { name: "See fees →" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getByRole("link", { name: "Review my offer" })).toHaveAttribute("href", ROUTES.offerReview)
  })

  it("states the readiness-screen disclaimer under the run", () => {
    renderPage(<ScorePage />)
    expect(
      screen.getByText(
        "exitIQ is a readiness screen based on your answers. It is not a valuation, appraisal, financing decision, or assurance that a business will sell."
      )
    ).toBeInTheDocument()
  })
})

describe("Offer review page", () => {
  const params = (mode?: string | string[]) => Promise.resolve(mode === undefined ? {} : { mode })

  it("renders exactly one h1 with the offer review headline", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    onlyH1("Know what the offer pays before you sign.")
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

  it("labels the Project Ridgeline letter of intent as fictional, under its own heading", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    expect(screen.getByRole("heading", { name: "What the letter of intent leaves open" })).toBeInTheDocument()
    expect(screen.getByText("Worked example")).toBeInTheDocument()
    expect(
      screen.getByText("A fictional letter of intent. The terms below decide what the seller actually receives.")
    ).toBeInTheDocument()
    expect(screen.getByText("Letter of intent · Project Ridgeline")).toBeInTheDocument()
  })

  it("separates the headline price from cash at closing in the worked example", async () => {
    renderPage(await OfferReviewPage({ searchParams: params() }))
    expect(rowValue("Headline price")).toBe("$4.65M")
    expect(rowValue("Cash at closing")).toBe("$3.45M, or 74% of the headline price")
    expect(rowValue("Exclusivity")).toBe("90 days during which the seller cannot negotiate elsewhere")
    expect(screen.getByText("Existing-buyer engagement")).toBeInTheDocument()
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
    onlyH1("The eight stages of a private sale.")
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<HowItWorksPage />)
    auditLinks(container)
  })

  it("routes the fee and readiness buttons to /fees and /score", () => {
    renderPage(<HowItWorksPage />)
    expect(screen.getByRole("link", { name: "See fees" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getByRole("link", { name: "Check sale readiness" })).toHaveAttribute("href", ROUTES.score)
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
    renderPage(<HowItWorksPage />)
    expect(screen.getByText("Owner compensation · Project Ridgeline")).toBeInTheDocument()
  })

  it("places three advisor calls to action on the page", () => {
    renderPage(<HowItWorksPage />)
    expect(screen.getAllByTestId("open-advisor")).toHaveLength(3)
  })
})

describe("Fees page", () => {
  it("renders exactly one h1 with the fees headline", () => {
    renderPage(<FeesPage />)
    onlyH1("Fees")
  })

  it("frames the ledger photograph beside the hero copy with its caption", () => {
    renderPage(<FeesPage />)
    const img = screen.getByRole("img", {
      name: "Financial records bound between sheets of glass, arranged on a travertine table",
    })
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/media/fees.png")
    const figure = screen.getByTestId("fees-figure")
    expect(figure.tagName).toBe("FIGURE")
    expect(figure).toContainElement(img)
    expect(
      within(figure).getByText("Every fee term is written into your engagement agreement before you sign.").tagName
    ).toBe("FIGCAPTION")
    expect(screen.queryByRole("img", { hidden: true, name: "" })).toBeNull()
  })

  it("links only to known routes, in-page anchors, and contact addresses", () => {
    const { container } = renderPage(<FeesPage />)
    auditLinks(container)
  })

  it("headlines the three fee numbers with their notes", () => {
    renderPage(<FeesPage />)
    const bigNumber = (note: string) => screen.getByText(note).previousSibling
    expect(bigNumber("Success fee on a full private sale")).toHaveTextContent("5%")
    expect(
      bigNumber("Engagement commitment, credited against the success fee if the business sells")
    ).toHaveTextContent("$5,000")
    expect(
      bigNumber("Success fee when you already have the buyer, after a free offer review, no upfront fee")
    ).toHaveTextContent("2.5%")
  })

  it("scrolls the calculator buttons to the #fees-calc heading", () => {
    const { container } = renderPage(<FeesPage />)
    const calc = screen.getAllByRole("link", { name: "Calculate my fee" })
    expect(calc).toHaveLength(2)
    for (const link of calc) expect(link).toHaveAttribute("href", "#fees-calc")
    expect(container.querySelector("#fees-calc")).toHaveTextContent("Fee calculator")
  })

  it("gives the hero's advisor call to action the ghost pill and the closing one the filled pill", () => {
    renderPage(<FeesPage />)
    const [ghost, filled] = screen.getAllByRole("button", { name: "Talk to an M&A advisor" })
    expect(ghost).toHaveClass(
      "pressable",
      "border",
      "border-accent",
      "bg-transparent",
      "text-accent",
      "hover:bg-accent/10",
      "rounded-pill",
      "type-body",
      "px-[22px]",
      "py-[11px]"
    )
    expect(ghost).not.toHaveClass("bg-primary")
    expect(ghost).not.toHaveClass("text-on-primary")
    expect(filled).toHaveClass("bg-primary", "text-on-primary", "rounded-pill", "type-body", "px-[22px]", "py-[11px]")
    expect(filled).not.toHaveClass("border-accent")
  })

  it("routes both offer review links to /offer-review", () => {
    renderPage(<FeesPage />)
    const links = screen.getAllByRole("link", { name: "Review my offer" })
    expect(links).toHaveLength(2)
    for (const link of links) expect(link).toHaveAttribute("href", ROUTES.offerReview)
  })

  it("routes the closing links to /score and /how-it-works", () => {
    renderPage(<FeesPage />)
    expect(screen.getByRole("link", { name: "Check sale readiness" })).toHaveAttribute("href", ROUTES.score)
    expect(screen.getByRole("link", { name: "See how it works →" })).toHaveAttribute("href", ROUTES.howItWorks)
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
    for (const title of ["Readiness work", "Your lawyer", "Your accountant", "Tax advice", "Other specialists"]) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })
})

describe("Confidentiality page", () => {
  it("renders exactly one h1 with the confidentiality headline", () => {
    renderPage(<ConfidentialityPage />)
    onlyH1("Confidentiality")
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
    expect(screen.getByRole("link", { name: "Check sale readiness" })).toHaveAttribute("href", ROUTES.score)
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
    onlyH1("A verified record of who you are and what you buy")
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
    expect(container.querySelector("#buyer-register")).toHaveTextContent("Register my criteria")
  })

  it("frames the passport booklet beside the hero copy with no caption of its own", () => {
    renderPage(<BuyersPage />)
    const img = screen.getByRole("img", {
      name: "A deep green Buyer Passport booklet with a brass Heirloom seal on the cover",
    })
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/generated/passport.webp")
    expect(img).toHaveAttribute("sizes", "(max-width: 1068px) 100vw, 400px")
    expect(img).toHaveClass("object-contain", "p-8")
    const figure = screen.getByTestId("passport-figure")
    expect(figure.tagName).toBe("FIGURE")
    expect(figure).toContainElement(img)
    // 280px on phones (the plate was 54% of a 390 viewport at full width); 400px from the desktop breakpoint.
    expect(figure).toHaveClass(
      "desk:justify-self-end",
      "desk:mx-0",
      "desk:max-w-[400px]",
      "mx-auto",
      "my-0",
      "w-full",
      "max-w-[280px]"
    )
    expect(figure).not.toHaveClass("max-w-[400px]")
    expect(figure.querySelector("figcaption")).toBeNull()
    expect(img.parentElement).toHaveClass(
      "bg-canvas-parchment",
      "shadow-product",
      "relative",
      "aspect-[3/4]",
      "overflow-hidden",
      "rounded-lg"
    )
    expect(screen.queryByRole("img", { hidden: true, name: "" })).toBeNull()
  })

  it("lays the hero out as the two-column recipe: centred copy that aligns left beside the passport on desktop", () => {
    renderPage(<BuyersPage />)
    const figure = screen.getByTestId("passport-figure")
    const hero = figure.parentElement as HTMLElement
    expect(hero).toHaveClass("grid", "grid-cols-1", "desk:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]")
    expect(hero.children).toHaveLength(2)
    const copy = hero.firstElementChild as HTMLElement
    // The copy is centred on phones and aligns left beside the passport from the desktop breakpoint.
    expect(copy).toHaveClass("text-center", "desk:text-left")
    expect(copy).toContainElement(screen.getByRole("heading", { level: 1 }))
    const lead = within(copy).getByText(
      "Buyer Passport verifies your identity, acquisition criteria, and capacity range once. You choose which details each seller sees."
    )
    expect(lead).toHaveClass("type-lead-airy", "text-fg-2", "mx-auto", "desk:mx-0")
    const ctas = within(copy).getByRole("link", { name: "Get Heirloom Verified" }).parentElement as HTMLElement
    expect(ctas).toHaveClass("justify-center", "desk:justify-start")
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
    onlyH1("Who we are")
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<WhoWeArePage />)
    auditLinks(container)
  })

  it("renders the four firm facts", () => {
    renderPage(<WhoWeArePage />)
    expect(screen.getByText("Heirloom transactions").nextSibling).toHaveTextContent(
      "Millions in enterprise value transacted"
    )
    expect(screen.getByText("Founder buy-side experience").nextSibling).toHaveTextContent(
      "Small-business acquisitions as a micro-PE investor before Heirloom"
    )
    expect(screen.getByText("Engagement model").nextSibling).toHaveTextContent(
      "One named advisor from first call to closing"
    )
    expect(screen.getByText("Backing").nextSibling).toHaveTextContent("Y Combinator")
  })

  it("mounts the founder portrait inside the founder tile, with a descriptive alt text", () => {
    const { container } = renderPage(<WhoWeArePage />)
    const founder = container.querySelector("#founder") as HTMLElement
    const img = within(founder).getByRole("img", { name: "Suyash Agrawal, founder and CEO of Heirloom" })
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/suyash-portrait.jpg")
  })

  it("emails Suyash at the hello inbox behind a named link, never printing the address", () => {
    renderPage(<WhoWeArePage />)
    expect(screen.getByRole("link", { name: "Email Suyash" })).toHaveAttribute("href", `mailto:${CONTACT.hello}`)
    expect(screen.queryByText(CONTACT.hello)).toBeNull()
  })

  it("labels both advisor calls to action Talk to an M&A advisor", () => {
    renderPage(<WhoWeArePage />)
    const ctas = screen.getAllByTestId("open-advisor")
    expect(ctas.map((b) => b.textContent)).toEqual(["Talk to an M&A advisor", "Talk to an M&A advisor"])
  })

  it("routes both process links to /how-it-works", () => {
    renderPage(<WhoWeArePage />)
    const links = screen.getAllByRole("link", { name: "See how it works →" })
    expect(links).toHaveLength(2)
    for (const link of links) expect(link).toHaveAttribute("href", ROUTES.howItWorks)
  })
})

describe("Questions page", () => {
  it("renders exactly one h1 with the questions headline", () => {
    renderPage(<QuestionsPage />)
    onlyH1("Questions owners ask.")
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
})

describe("Why page", () => {
  it("renders exactly one h1 with the why headline", () => {
    renderPage(<WhyPage />)
    onlyH1("The buyer usually has more experience.")
  })

  it("links only to known routes and contact addresses", () => {
    const { container } = renderPage(<WhyPage />)
    auditLinks(container)
  })

  it("routes each closing card to its destination", () => {
    renderPage(<WhyPage />)
    const process = screen.getAllByRole("link", { name: /^See how it works/ })
    expect(process.map((l) => l.textContent)).toEqual(["See how it works", "See how it works →"])
    for (const link of process) expect(link).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getByRole("link", { name: "See fees →" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getByRole("link", { name: "See who can access what" })).toHaveAttribute(
      "href",
      ROUTES.confidentiality
    )
    expect(screen.getByRole("link", { name: "Who we are" })).toHaveAttribute("href", ROUTES.whoWeAre)
    expect(screen.getByRole("link", { name: "Check sale readiness" })).toHaveAttribute("href", ROUTES.score)
    expect(screen.getByRole("link", { name: "Review my offer" })).toHaveAttribute("href", ROUTES.offerReview)
    expect(screen.getByRole("link", { name: "Get Heirloom Verified" })).toHaveAttribute("href", ROUTES.buyers)
  })

  it("names the three paths an owner can take", () => {
    renderPage(<WhyPage />)
    expect(screen.getByText("Public listing")).toBeInTheDocument()
    expect(screen.getByText("A single direct buyer")).toBeInTheDocument()
    expect(screen.getByText("Heirloom", { selector: "div.type-tagline" })).toBeInTheDocument()
  })

  it("labels both advisor calls to action Talk to an M&A advisor", () => {
    renderPage(<WhyPage />)
    const ctas = screen.getAllByTestId("open-advisor")
    expect(ctas).toHaveLength(2)
    for (const b of ctas) expect(b).toHaveTextContent("Talk to an M&A advisor")
  })
})

describe("Not found page", () => {
  it("renders exactly one h1 with the not-found headline", () => {
    renderPage(<NotFound />)
    onlyH1("That page is not part of the record.")
  })

  it("exports a Page not found title and asks robots not to index it", () => {
    expect(notFoundMeta.title).toBe("Heirloom | Page not found")
    expect(notFoundMeta.robots).toEqual({ index: false })
    expect(notFoundMeta.description).toBe(
      "The address may have changed. Start from the Heirloom home page or go straight to the sale process."
    )
  })

  it("draws the stacked lockup in the Heirloom green, decorative, above the eyebrow", () => {
    const { container } = renderPage(<NotFound />)
    const lockup = container.querySelector('[data-testid="brand-lockup"]')!
    expect(lockup).toHaveAttribute("data-variant", "stacked")
    expect(lockup.parentElement).toHaveClass("text-heirloom")
    expect(lockup.parentElement).toHaveAttribute("aria-hidden", "true")
  })

  it("offers a way home and a way into the process", () => {
    renderPage(<NotFound />)
    expect(screen.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", ROUTES.home)
    expect(screen.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getAllByRole("link")).toHaveLength(2)
  })
})
