import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ExitIqQuestion } from "@/components/site/exitiq/ExitIqQuestion"
import { chipLabel, insightFor, QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import type { ExitIqAnswers } from "@/lib/site/exitiq/scoring"
import { INITIAL_SITE_STATE, type SiteState } from "@/lib/site/state/reducer"
import { renderWithSeededSite, renderWithSite } from "./test-utils"

const FOOTNOTE = "About 2 minutes. No name, email, phone number, or documents required."
const ADVANCE_MS = 400

/** State for a visitor sitting on question `phase` having answered every question before it. */
function atQuestion(phase: number): SiteState {
  const answers: ExitIqAnswers = {}
  for (const q of QUESTIONS.slice(0, phase)) answers[q.id] = q.chips[0]!.v
  return { ...INITIAL_SITE_STATE, iq: { ...INITIAL_SITE_STATE.iq, phase, answers, started: true } }
}

function choices(qNum: number) {
  return screen.getByRole("group", { name: `Answer choices for question ${qNum}` })
}

describe("<ExitIqQuestion />", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  describe.each([
    { variant: "hero" as const, progressText: `exitIQ · Question 1 of ${QUESTION_COUNT}` },
    { variant: "page" as const, progressText: `Question 1 of ${QUESTION_COUNT}` },
  ])("$variant variant", ({ variant, progressText }) => {
    it("renders question 1 with its position label, heading, note, and one chip per choice", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      const q1 = QUESTIONS[0]!
      expect(screen.getByText(progressText)).toBeInTheDocument()
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(q1.q)
      expect(screen.getByText(q1.note!)).toBeInTheDocument()
      const chips = within(choices(1)).getAllByRole("button")
      expect(chips.map((c) => c.textContent)).toEqual(q1.chips.map((c) => c.l))
      for (const chip of chips) {
        expect(chip).toHaveAttribute("aria-pressed", "false")
        expect(chip).toBeEnabled()
      }
    })

    it("hides the back button on the first question and shows it from the second question on", () => {
      const { unmount } = renderWithSite(<ExitIqQuestion variant={variant} />)
      expect(screen.queryByRole("button", { name: "Change my last answer" })).toBeNull()
      unmount()
      renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(1))
      expect(screen.getByRole("button", { name: "Change my last answer" })).toBeInTheDocument()
    })

    it("marks the pressed chip aria-pressed and disables all chips while the answer is being read", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      fireEvent.click(screen.getByRole("button", { name: "Recurring commercial services" }))
      for (const chip of within(choices(1)).getAllByRole("button")) {
        expect(chip).toBeDisabled()
        expect(chip).toHaveAttribute(
          "aria-pressed",
          chip.textContent === "Recurring commercial services" ? "true" : "false"
        )
      }
    })

    it("shows the buyer insight for exactly the answer chosen", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      fireEvent.click(screen.getByRole("button", { name: "Manufacturing or distribution" }))
      const insight = insightFor("type", "dist")!
      expect(insight).toBe("Inventory, working capital, suppliers, and equipment can become material deal terms.")
      expect(screen.getByText("What this tells a buyer").parentElement).toHaveTextContent(insight)
      expect(screen.queryByText(insightFor("type", "field")!)).toBeNull()
    })

    it("ignores a second chip press while the first answer is still being read", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      fireEvent.click(screen.getByRole("button", { name: "Another type of business" }))
      expect(screen.getByRole("button", { name: "Home or field services" })).toHaveAttribute("aria-pressed", "true")
      expect(screen.getByRole("button", { name: "Another type of business" })).toHaveAttribute("aria-pressed", "false")
      expect(screen.getByText("What this tells a buyer").parentElement).toHaveTextContent(insightFor("type", "field")!)
    })

    it("moves to question 2 after the reading pause, re-enabling the chips and keeping the insight visible", async () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[1]!.q)
      expect(screen.getByText(progressText.replace("Question 1", "Question 2"))).toBeInTheDocument()
      for (const chip of within(choices(2)).getAllByRole("button")) expect(chip).toBeEnabled()
      expect(screen.getByText("What this tells a buyer").parentElement).toHaveTextContent(insightFor("type", "field")!)
    })

    it("renders an empty note line for a question that has no note", async () => {
      renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(1))
      expect(QUESTIONS[1]!.note).toBeUndefined()
      const heading = screen.getByRole("heading", { level: 2 })
      expect(heading.nextElementSibling?.tagName).toBe("P")
      expect(heading.nextElementSibling).toHaveTextContent("")
    })

    it("going back clears the insight and shows the earlier question with its chip still selected", () => {
      renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(2))
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[2]!.q)
      fireEvent.click(screen.getByRole("button", { name: "Change my last answer" }))
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[1]!.q)
      expect(screen.getByRole("button", { name: chipLabel("rev", QUESTIONS[1]!.chips[0]!.v)! })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(screen.queryByText("What this tells a buyer")).toBeNull()
    })
  })

  describe("hero variant only", () => {
    it("shows the two-minute footnote", () => {
      renderWithSite(<ExitIqQuestion variant="hero" />)
      expect(screen.getByText(FOOTNOTE)).toBeInTheDocument()
    })

    it("shows a progress bar that counts the answers given so far", () => {
      renderWithSeededSite(<ExitIqQuestion variant="hero" />, atQuestion(3))
      const bar = screen.getByRole("progressbar", { name: "Your progress" })
      expect(bar).toHaveAttribute("aria-valuenow", "3")
      expect(bar).toHaveAttribute("aria-valuemax", String(QUESTION_COUNT))
      expect(screen.getByText(`exitIQ · Question 4 of ${QUESTION_COUNT}`)).toBeInTheDocument()
    })

    it("never offers 'Start over', even with answers recorded", () => {
      renderWithSeededSite(<ExitIqQuestion variant="hero" />, atQuestion(3))
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
    })

    it("does not show the reading line while the final answer is processed", () => {
      renderWithSeededSite(<ExitIqQuestion variant="hero" />, atQuestion(QUESTION_COUNT - 1))
      fireEvent.click(screen.getByRole("button", { name: "The business would run normally" }))
      expect(screen.queryByText("Reading your answers...")).toBeNull()
    })
  })

  describe("page variant only", () => {
    it("does not show the two-minute footnote or a progress bar", () => {
      renderWithSite(<ExitIqQuestion variant="page" />)
      expect(screen.queryByText(FOOTNOTE)).toBeNull()
      expect(screen.queryByRole("progressbar")).toBeNull()
    })

    it("hides 'Start over' until at least one answer exists", () => {
      renderWithSite(<ExitIqQuestion variant="page" />)
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument()
    })

    it("'Start over' clears the answers, insight, and both controls", async () => {
      renderWithSeededSite(<ExitIqQuestion variant="page" />, atQuestion(2))
      fireEvent.click(screen.getByRole("button", { name: "Start over" }))
      expect(screen.getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      for (const chip of within(choices(1)).getAllByRole("button")) {
        expect(chip).toHaveAttribute("aria-pressed", "false")
      }
      expect(screen.queryByText("What this tells a buyer")).toBeNull()
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
      expect(screen.queryByRole("button", { name: "Change my last answer" })).toBeNull()
    })

    it("announces 'Reading your answers...' politely only while the final answer is processed", async () => {
      renderWithSeededSite(<ExitIqQuestion variant="page" />, atQuestion(QUESTION_COUNT - 1))
      expect(screen.queryByText("Reading your answers...")).toBeNull()
      fireEvent.click(screen.getByRole("button", { name: "Work would slow down" }))
      expect(screen.getByText("Reading your answers...")).toHaveAttribute("aria-live", "polite")
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(screen.queryByText("Reading your answers...")).toBeNull()
    })

    it("does not announce the reading line on questions before the last", () => {
      renderWithSeededSite(<ExitIqQuestion variant="page" />, atQuestion(QUESTION_COUNT - 2))
      fireEvent.click(screen.getByRole("button", { name: "Under 10%" }))
      expect(screen.queryByText("Reading your answers...")).toBeNull()
    })
  })
})
