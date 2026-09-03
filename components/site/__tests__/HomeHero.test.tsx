import { fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HomeHero } from "@/components/site/hero/HomeHero"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { CONTACT } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

function AdvisorProbe() {
  const { advisor } = useAdvisor()
  return <output data-testid="advisor-open">{String(advisor.open)}</output>
}

describe("<HomeHero />", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    HTMLMediaElement.prototype.pause = vi.fn()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("leads with the headline and its emphasised second half", () => {
    renderWithSite(<HomeHero />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1).toHaveTextContent("Sell your business to the right buyer, on the right terms.")
    expect(within(h1).getByText("the right buyer, on the right terms.").tagName).toBe("EM")
  })

  it("states the positioning line and the one-paragraph promise", () => {
    renderWithSite(<HomeHero />)
    expect(screen.getByText("Technology-enabled sell-side M&A for established business owners")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Heirloom prepares your company, creates competition among qualified buyers, and manages the private sale through closing while you keep running the business."
      )
    ).toBeInTheDocument()
  })

  it("links the Y Combinator chip to CONTACT.ycombinator in a new tab with noopener", () => {
    renderWithSite(<HomeHero />)
    const chip = screen.getByRole("link", { name: "BACKED BY Y COMBINATOR" })
    expect(chip).toHaveAttribute("href", CONTACT.ycombinator)
    expect(chip).toHaveAttribute("href", "https://www.ycombinator.com/")
    expect(chip).toHaveAttribute("target", "_blank")
    expect(chip).toHaveAttribute("rel", "noopener")
    const logo = within(chip).getByRole("presentation")
    expect(logo.tagName).toBe("IMG")
    expect(logo).toHaveAttribute("alt", "")
  })

  it("offers the advisor button as the primary call to action and opens the dialog on click", () => {
    renderWithSite(
      <>
        <HomeHero />
        <AdvisorProbe />
      </>
    )
    const cta = screen.getByTestId("open-advisor")
    expect(cta).toHaveTextContent("Talk to an M&A advisor")
    expect(cta.tagName).toBe("BUTTON")
    expect(screen.getByTestId("advisor-open")).toHaveTextContent("false")
    fireEvent.click(cta)
    expect(screen.getByTestId("advisor-open")).toHaveTextContent("true")
  })

  it("links 'See how it works' to /how-it-works", () => {
    renderWithSite(<HomeHero />)
    expect(screen.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "/how-it-works")
  })

  it("links buyers to the Buyer Passport page", () => {
    renderWithSite(<HomeHero />)
    expect(screen.getByRole("link", { name: "Buying a business? Get Heirloom Verified →" })).toHaveAttribute(
      "href",
      "/buyers"
    )
  })

  it("renders the console and the market graph", () => {
    renderWithSite(<HomeHero />)
    expect(screen.getByTestId("hero-console")).toBeInTheDocument()
    const graph = screen.getByTestId("hero-graph")
    expect(graph.tagName).toBe("svg")
    expect(graph).toHaveAttribute(
      "aria-label",
      "A live map of a private transaction forming around one protected business"
    )
    expect(within(screen.getByTestId("hero-console")).getByText("Where are you today?")).toBeInTheDocument()
  })

  it("keeps the ambient video decorative and in fade-loop mode behind an aria-hidden layer", () => {
    renderWithSite(<HomeHero />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    expect(video).toHaveAttribute("aria-hidden", "true")
    expect(video.parentElement).toHaveAttribute("aria-hidden", "true")
    expect(video).not.toHaveAttribute("src")
  })

  it("still renders every call to action when the ambient video fails", () => {
    renderWithSite(<HomeHero />)
    fireEvent.error(screen.getByTestId("ambient-video"))
    expect(screen.queryByTestId("ambient-video")).toBeNull()
    expect(screen.getByTestId("open-advisor")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "See how it works" })).toBeInTheDocument()
  })
})
