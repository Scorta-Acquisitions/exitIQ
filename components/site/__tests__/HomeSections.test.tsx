import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { CloseSection } from "@/components/site/home/CloseSection"
import { ExperienceAdvisor, FounderPortrait } from "@/components/site/home/ExperienceAdvisor"
import { FinancialPrep } from "@/components/site/home/FinancialPrep"
import { QuestionsTeaser } from "@/components/site/home/QuestionsTeaser"
import { SellerWorkload } from "@/components/site/home/SellerWorkload"
import { SpeedAndFees } from "@/components/site/home/SpeedAndFees"
import { TermsStrip } from "@/components/site/home/TermsStrip"
import { TransactionCarries } from "@/components/site/home/TransactionCarries"
import { HOME_TEASER } from "@/lib/site/questions/data"
import { CONTACT, ROUTES } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

describe("<TermsStrip />", () => {
  const EXPECTED: Array<[string, string, string]> = [
    ["Representation", "We work for the seller.", ROUTES.whoWeAre],
    ["Confidentiality", "Your company is never publicly listed.", ROUTES.confidentiality],
    ["Company fit", "Established businesses, usually with $1M or more in annual revenue.", ROUTES.questions],
    ["Experience", "Millions in enterprise value transacted through Heirloom.", ROUTES.whoWeAre],
    ["Economics", "Roughly half many traditional broker and M&A fees.", ROUTES.fees],
  ]

  it("renders exactly five term links", () => {
    render(<TermsStrip />)
    expect(screen.getAllByRole("link")).toHaveLength(5)
  })

  it.each(EXPECTED)("links the %s term to %s", (label, text, href) => {
    render(<TermsStrip />)
    const link = screen.getByText(label).closest("a")
    expect(link).toHaveAttribute("href", href)
    // The statement inherits the link colour, so the global hover rule recolours it.
    expect(within(link as HTMLElement).getByText(text).className).not.toMatch(/\btext-(ink|l\d|d\d|filament)/)
  })

  it("keeps the label above the statement inside each link", () => {
    render(<TermsStrip />)
    for (const link of screen.getAllByRole("link")) {
      const [label, text] = Array.from(link.children)
      expect(label).toHaveClass("uppercase")
      expect(text).toHaveClass("font-display")
    }
  })
})

describe("<CloseSection />", () => {
  const CARDS: Array<[string, string, string]> = [
    ["Review my offer", "Offer in hand", ROUTES.offerReview],
    ["Start exitIQ", "Still deciding", ROUTES.score],
    ["See how it works", "Want the details", ROUTES.howItWorks],
  ]

  it("renders three route cards", () => {
    renderWithSite(<CloseSection />)
    expect(screen.getAllByRole("link")).toHaveLength(3)
  })

  it.each(CARDS)("routes the %s card (%s) to %s", (title, eyebrow, href) => {
    renderWithSite(<CloseSection />)
    const link = screen.getByText(title).closest("a")
    expect(link).toHaveAttribute("href", href)
    expect(within(link as HTMLElement).getByText(eyebrow)).toBeInTheDocument()
  })

  it("opens the advisor dialog from the first card", () => {
    renderWithSite(
      <>
        <CloseSection />
        <AdvisorDialog />
      </>
    )
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    const trigger = screen.getByRole("button", { name: /Talk to an M&A advisor/ })
    expect(trigger).toHaveAttribute("data-testid", "open-advisor")
    fireEvent.click(trigger)
    expect(screen.getByTestId("advisor-dialog")).toBeInTheDocument()
  })

  it("states there is no public listing and no obligation", () => {
    renderWithSite(<CloseSection />)
    expect(screen.getByText("No public listing. No obligation to sell.")).toBeInTheDocument()
  })
})

describe("<FounderPortrait />", () => {
  it("renders the portrait with a descriptive alt text", () => {
    render(<FounderPortrait />)
    const img = screen.getByRole("img", { name: "Suyash Agrawal, founder and CEO of Heirloom" })
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/suyash-portrait.jpg")
  })

  it("rounds the frame by 18px by default and honours a custom radius", () => {
    const { container, unmount } = render(<FounderPortrait />)
    expect(container.firstElementChild).toHaveStyle({ borderRadius: "18px" })
    unmount()
    const second = render(<FounderPortrait radius={14} />)
    expect(second.container.firstElementChild).toHaveStyle({ borderRadius: "14px" })
  })
})

describe("<ExperienceAdvisor />", () => {
  it("emails Suyash at the hello inbox", () => {
    render(<ExperienceAdvisor />)
    expect(screen.getByRole("link", { name: "Email Suyash" })).toHaveAttribute("href", `mailto:${CONTACT.hello}`)
    expect(screen.getByText(CONTACT.hello)).toBeInTheDocument()
  })

  it("links Meet the firm to /who-we-are", () => {
    render(<ExperienceAdvisor />)
    expect(screen.getByRole("link", { name: "Meet the firm →" })).toHaveAttribute("href", ROUTES.whoWeAre)
  })

  it("shows the portrait and both experience records", () => {
    render(<ExperienceAdvisor />)
    expect(screen.getByRole("img", { name: "Suyash Agrawal, founder and CEO of Heirloom" })).toBeInTheDocument()
    expect(screen.getByText("Millions in enterprise value transacted through the firm")).toBeInTheDocument()
    expect(screen.getByText("Millions in enterprise value transacted on the buy side")).toBeInTheDocument()
  })
})

describe("<FinancialPrep />", () => {
  it("shows the Project Ridgeline owner compensation reconciliation", () => {
    render(<FinancialPrep />)
    expect(screen.getByText("Project Ridgeline")).toBeInTheDocument()
    expect(screen.getByText("Owner explanation").nextSibling).toHaveTextContent("$214,000")
    expect(screen.getByText("QuickBooks").nextSibling).toHaveTextContent("$186,400")
    expect(screen.getByText("Tax return").nextSibling).toHaveTextContent("$186,400")
    expect(screen.getByText("Advisor review").nextSibling).toHaveTextContent(
      "$214,000, including documented family payroll"
    )
    expect(screen.getByText("Used in").nextSibling).toHaveTextContent(
      "Valuation, buyer materials, lender package, and diligence answers"
    )
  })

  it("highlights the advisor review label", () => {
    render(<FinancialPrep />)
    expect(screen.getByText("Advisor review")).toHaveClass("text-filament-ink")
    expect(screen.getByText("QuickBooks")).not.toHaveClass("text-filament-ink")
  })

  it("links the call to action to /how-it-works", () => {
    render(<FinancialPrep />)
    expect(screen.getByRole("link", { name: "See how Heirloom prepares a business" })).toHaveAttribute(
      "href",
      ROUTES.howItWorks
    )
  })
})

describe("<SellerWorkload />", () => {
  const YOU = [
    "Explain your goals and the business",
    "Approve the privacy rules and sale materials",
    "Meet the buyers you choose",
    "Select the offer and approve major decisions",
  ]
  const HEIRLOOM = [
    "Organize and reconcile the financials",
    "Build the valuation and sale materials",
    "Research and contact buyers privately",
    "Screen buyers and manage NDAs",
    "Answer routine diligence questions from approved records",
    "Prepare you for buyer meetings",
    "Compare and negotiate offers",
    "Coordinate diligence, financing, lawyers, and closing",
    "Send one clear weekly update",
  ]

  it("lists the four things the owner handles", () => {
    render(<SellerWorkload />)
    for (const t of YOU) expect(screen.getByText(t)).toBeInTheDocument()
  })

  it("renders each Heirloom task twice for the loop but exposes it to assistive tech once", () => {
    render(<SellerWorkload />)
    for (const t of HEIRLOOM) {
      const rows = screen.getAllByText(t).map((el) => el.closest("div[class*='border-b']") as HTMLElement)
      expect(rows).toHaveLength(2)
      expect(rows[0]).not.toHaveAttribute("aria-hidden")
      expect(rows[1]).toHaveAttribute("aria-hidden", "true")
    }
  })

  it("marks the feed as live and links to every stage", () => {
    render(<SellerWorkload />)
    expect(screen.getByText("LIVE")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "See every stage →" })).toHaveAttribute("href", ROUTES.howItWorks)
  })
})

describe("<SpeedAndFees />", () => {
  it("numbers the five speed steps from 01 to 05", () => {
    render(<SpeedAndFees />)
    const steps = [
      "Prepare before market",
      "Qualify before meetings",
      "Answer from organized records",
      "Run financing and diligence together",
      "Escalate decisions quickly",
    ]
    steps.forEach((s, i) => {
      const label = screen.getByText(s)
      expect(label.previousSibling).toHaveTextContent(`0${i + 1}`)
    })
  })

  it("states the three fee rows exactly", () => {
    render(<SpeedAndFees />)
    expect(screen.getByText("Full private sale").nextSibling).toHaveTextContent("5% success fee")
    expect(screen.getByText("Engagement commitment").nextSibling).toHaveTextContent("$5,000, fully credited at closing")
    expect(screen.getByText("Existing buyer").nextSibling).toHaveTextContent(
      "Free Offer Review, then 2.5% if Heirloom runs the transaction"
    )
  })

  it("links the timeline to /how-it-works and the fees to /fees", () => {
    render(<SpeedAndFees />)
    expect(screen.getByRole("link", { name: "See the sale timeline →" })).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getByRole("link", { name: "See all fees →" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getAllByRole("link")).toHaveLength(2)
  })
})

describe("<TransactionCarries />", () => {
  it("links Why Heirloom exists to /why in the dark tone", () => {
    render(<TransactionCarries />)
    const link = screen.getByRole("link", { name: "Why Heirloom exists →" })
    expect(link).toHaveAttribute("href", ROUTES.why)
    expect(link).toHaveClass("text-d1")
    expect(link).not.toHaveClass("text-ink")
  })

  it("describes the ambient video for assistive technology", () => {
    render(<TransactionCarries />)
    expect(
      screen.getByRole("img", { name: "Private business records prepared for a confidential ownership transfer." })
    ).toBe(screen.getByTestId("ambient-video"))
  })

  it("headlines what changes hands", () => {
    render(<TransactionCarries />)
    expect(
      screen.getByRole("heading", { level: 2, name: "The employees, the customers, and the name change hands too." })
    ).toBeInTheDocument()
  })
})

describe("<QuestionsTeaser />", () => {
  it("renders the five teaser questions collapsed", () => {
    render(<QuestionsTeaser />)
    expect(HOME_TEASER).toHaveLength(5)
    const buttons = screen.getAllByRole("button")
    expect(buttons.map((b) => b.textContent)).toEqual(HOME_TEASER.map((qa) => `${qa.q}+`))
    for (const b of buttons) expect(b).toHaveAttribute("aria-expanded", "false")
    for (const qa of HOME_TEASER) expect(screen.getByText(qa.a)).not.toBeVisible()
  })

  it("expands one answer and shows its text", () => {
    render(<QuestionsTeaser />)
    const first = HOME_TEASER[0]!
    fireEvent.click(screen.getByRole("button", { name: first.q }))
    expect(screen.getByRole("button", { name: first.q })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(first.a)).toBeVisible()
  })

  it("keeps only one answer open at a time", () => {
    render(<QuestionsTeaser />)
    const [first, second] = [HOME_TEASER[0]!, HOME_TEASER[1]!]
    fireEvent.click(screen.getByRole("button", { name: first.q }))
    fireEvent.click(screen.getByRole("button", { name: second.q }))
    expect(screen.getByRole("button", { name: first.q })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("button", { name: second.q })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(first.a)).not.toBeVisible()
    expect(screen.getByText(second.a)).toBeVisible()
  })

  it("collapses an open answer when its question is clicked again", () => {
    render(<QuestionsTeaser />)
    const first = HOME_TEASER[0]!
    const button = screen.getByRole("button", { name: first.q })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText(first.a)).not.toBeVisible()
  })

  it("links Read every answer to /questions", () => {
    render(<QuestionsTeaser />)
    expect(screen.getByRole("link", { name: "Read every answer →" })).toHaveAttribute("href", ROUTES.questions)
  })
})
