import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { CloseSection } from "@/components/site/home/CloseSection"
import { FinancialPrep } from "@/components/site/home/FinancialPrep"
import { QuestionsTeaser } from "@/components/site/home/QuestionsTeaser"
import { SellerWorkload } from "@/components/site/home/SellerWorkload"
import { SpeedSection } from "@/components/site/home/SpeedSection"
import { TermsStrip } from "@/components/site/home/TermsStrip"
import { TransactionCarries } from "@/components/site/home/TransactionCarries"
import { FounderPortrait } from "@/components/site/who-we-are/FounderPortrait"
import { SPEED_COMPARISON, SPEED_STEPS } from "@/lib/site/content/speed"
import { HOME_TEASER } from "@/lib/site/questions/data"
import { ROUTES } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

describe("<TermsStrip />", () => {
  const EXPECTED: Array<[string, string, string]> = [
    ["Representation", "Sellers only.", ROUTES.whoWeAre],
    ["Listing", "Never public.", ROUTES.confidentiality],
    ["Company fit", "Usually $1M or more in annual revenue.", ROUTES.questions],
    ["Experience", "Millions in enterprise value transacted through Heirloom.", ROUTES.whoWeAre],
    ["Timing", "40% faster than a traditional sale.", ROUTES.howItWorks],
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
    ["Check sale readiness", "Still deciding", ROUTES.score],
    ["See how it works", "The process", ROUTES.howItWorks],
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

  it("headlines the section with the next-step heading and no footnote below the cards", () => {
    const { container } = renderWithSite(<CloseSection />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Choose a next step.")
    expect(container.querySelectorAll("section > div > p")).toHaveLength(0)
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
    expect(screen.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", ROUTES.howItWorks)
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
    "Send a weekly update",
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

  it("marks the feed as live and links to the process with an arrow", () => {
    render(<SellerWorkload />)
    expect(screen.getByText("LIVE")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "See how it works →" })).toHaveAttribute("href", ROUTES.howItWorks)
  })

  it("headlines the owner's four decisions and states the split in one sentence", () => {
    render(<SellerWorkload />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The whole sale asks four decisions of you.")
    expect(
      screen.getByText(
        "Heirloom handles the preparation, buyer work, negotiation, and closing while you keep running the company."
      )
    ).toBeInTheDocument()
  })
})

describe("<SpeedSection />", () => {
  it("headlines the comparison as one sentence with the figure set as display type", () => {
    render(<SpeedSection />)
    expect(screen.getByRole("heading", { level: 2, name: "40% faster than a traditional sale." })).toBeInTheDocument()
    const figure = screen.getByTestId("speed-range")
    expect(figure).toHaveTextContent("40%")
    expect(figure).toHaveClass("text-brand", "tabular")
  })

  it("draws the two comparison bars with direct labels, the 60% Heirloom fill, and the timing sentence", () => {
    render(<SpeedSection />)
    const figure = screen.getByRole("img", { name: SPEED_COMPARISON.ariaLabel })
    expect(figure).toHaveAttribute("data-testid", "speed-comparison")
    const traditional = screen.getByTestId("speed-bar-traditional")
    const heirloom = screen.getByTestId("speed-bar-heirloom")
    expect(traditional).toHaveTextContent("Traditional sale6 to 9 months")
    expect(heirloom).toHaveTextContent("Heirloom3 to 4 months on average")
    const fill = (bar: HTMLElement) => (bar.lastElementChild as HTMLElement).firstElementChild as HTMLElement
    expect(fill(traditional).style.width).toBe("100%")
    expect(fill(traditional)).toHaveClass("bg-hair-2")
    expect(fill(heirloom).style.width).toBe("60%")
    expect(fill(heirloom)).toHaveClass("bg-filament-ink", "animate-fill", "origin-left", "motion-reduce:animate-none")
    expect(
      screen.getByText(
        "A traditional sale takes six to nine months from launch to closing. Heirloom closes in three to four on average, because the financial work is finished before launch and buyers are qualified before they take your time."
      )
    ).toBeInTheDocument()
  })

  it("lists the five steps in order with their numbers, titles, and one-line bodies", () => {
    render(<SpeedSection />)
    const list = screen.getByRole("list", { name: "How Heirloom keeps a sale moving" })
    const items = within(list).getAllByRole("listitem")
    expect(items).toHaveLength(5)
    expect(SPEED_STEPS.map((s) => s.title)).toEqual([
      "Prepare before market",
      "Qualify before meetings",
      "Answer from organized records",
      "Run financing and diligence together",
      "Escalate decisions quickly",
    ])
    SPEED_STEPS.forEach((s, i) => {
      const item = items[i]!
      expect(item).toHaveTextContent(`0${i + 1}${s.title}${s.body}`)
      expect(within(item).getByText(s.title).previousSibling).toHaveTextContent(`0${i + 1}`)
    })
  })

  it("staggers the step reveal by 90ms and turns it off for reduced motion", () => {
    render(<SpeedSection />)
    SPEED_STEPS.forEach((_, i) => {
      const item = screen.getByTestId(`speed-step-${i}`)
      expect(item).toHaveClass("animate-row", "motion-reduce:animate-none")
      expect(item.style.animationDelay).toBe(`${(i * 0.09).toFixed(2)}s`)
    })
  })

  it("links to the process and the fees with arrows and carries no fee copy", () => {
    render(<SpeedSection />)
    expect(screen.getByRole("link", { name: "See how it works →" })).toHaveAttribute("href", ROUTES.howItWorks)
    expect(screen.getByRole("link", { name: "See fees →" })).toHaveAttribute("href", ROUTES.fees)
    expect(screen.getAllByRole("link")).toHaveLength(2)
    expect(screen.queryByText(/success fee/)).toBeNull()
    expect(screen.queryByText(/\$5,000/)).toBeNull()
  })
})

describe("<TransactionCarries />", () => {
  it("links Why Heirloom exists to /why in the dark tone", () => {
    render(<TransactionCarries />)
    const link = screen.getByRole("link", { name: "Why Heirloom exists" })
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
      screen.getByRole("heading", { level: 2, name: "Employees, customers, and the company name change hands too." })
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

  it("links See all questions to /questions", () => {
    render(<QuestionsTeaser />)
    expect(screen.getByRole("link", { name: "See all questions" })).toHaveAttribute("href", ROUTES.questions)
  })
})
