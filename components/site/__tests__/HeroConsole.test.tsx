import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HeroConsole } from "@/components/site/hero/HeroConsole"
import { QUESTIONS } from "@/lib/site/exitiq/questions"
import { type ExitIqAnswers, scoreExitIq } from "@/lib/site/exitiq/scoring"
import { renderWithSite } from "./test-utils"

describe("<HeroConsole />", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it("walks the sell path to a result and back", () => {
    renderWithSite(<HeroConsole />)
    expect(screen.getByText("Where are you today?")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("hero-option-sell"))
    expect(screen.getByText("When are you thinking about selling?")).toBeInTheDocument()
    expect(screen.getByTestId("hero-progress")).toHaveTextContent("QUESTION 1 OF 2")
    fireEvent.click(screen.getByRole("button", { name: "Now or within 6 months" }))
    expect(screen.getByText(/About how much revenue/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "$1M to $3M" }))
    const done = screen.getByTestId("hero-sell-done")
    expect(within(done).getByText("You could start a full sale process now.")).toBeInTheDocument()
    expect(within(done).getByText("Your business is in Heirloom’s usual range.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Start over" }))
    expect(screen.getByText("Where are you today?")).toBeInTheDocument()
  })

  it("shows the offer paths with deep links into the review page", () => {
    renderWithSite(<HeroConsole />)
    fireEvent.click(screen.getByTestId("hero-option-offer"))
    const panel = screen.getByTestId("hero-offer")
    expect(within(panel).getByRole("link", { name: /Paste the terms/ })).toHaveAttribute(
      "href",
      "/offer-review?mode=paste"
    )
    expect(within(panel).getByRole("link", { name: /Tell us what was said/ })).toHaveAttribute(
      "href",
      "/offer-review?mode=verbal"
    )
  })

  it("runs exitIQ inside the console and lands on the exact result for the answers given", async () => {
    renderWithSite(<HeroConsole />)
    fireEvent.click(screen.getByTestId("hero-option-ready"))
    fireEvent.click(screen.getByRole("button", { name: "Start exitIQ" }))
    const answers: ExitIqAnswers = {}
    for (const q of QUESTIONS) {
      expect(screen.getByText(q.q)).toBeInTheDocument()
      const chip = q.chips[0]!
      answers[q.id] = chip.v
      fireEvent.click(screen.getByRole("button", { name: chip.l }))
      await act(async () => {
        vi.advanceTimersByTime(500)
      })
    }
    const result = scoreExitIq(answers)
    expect(result.state).toBe("Market Ready")
    const done = screen.getByTestId("hero-iq-done")
    expect(within(done).getByRole("link", { name: /See my findings/ })).toHaveAttribute("href", "/score")
    expect(within(done).getByText("Market Ready")).toBeInTheDocument()
    expect(within(done).queryByText(/Prepare First|More Evidence Needed|Outside Our/)).toBeNull()
    expect(result.findings[0]!.t).toBe("Revenue is below our usual full-sale range")
    expect(within(done).getByText(`${result.findings[0]!.t}.`)).toBeInTheDocument()
    expect(within(done).getByText(`${result.findings[0]!.t}.`).parentElement).toHaveTextContent(result.findings[0]!.b)
  })
})
