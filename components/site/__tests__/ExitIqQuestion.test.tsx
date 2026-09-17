import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ExitIqQuestion } from "@/components/site/exitiq/ExitIqQuestion"
import { chipLabel, insightFor, QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import type { ExitIqAnswers } from "@/lib/site/exitiq/scoring"
import { INITIAL_SITE_STATE, type SiteState } from "@/lib/site/state/reducer"
import { renderWithSeededSite, renderWithSite } from "./test-utils"

const FOOTNOTE = "About 2 minutes. No name, email, or documents required."
const ADVANCE_MS = 400

const CHIP_LG = ["px-4", "py-[11px]", "text-[14px]"]
const CHIP_SELECTED = ["border-filament/55", "bg-filament/12", "text-filament"]
const CHIP_IDLE = ["border-dfull/14", "bg-dfull/[5.5%]", "text-dfull/86", "hover:border-dfull/30"]
const LINK_BUTTON = ["hover-green-dark", "border-dhair", "text-d3", "border-b", "pb-0.5", "font-mono", "text-[11.5px]"]

/** State for a visitor sitting on question `phase` having answered every question before it. */
function atQuestion(phase: number): SiteState {
  const answers: ExitIqAnswers = {}
  for (const q of QUESTIONS.slice(0, phase)) answers[q.id] = q.chips[0]!.v
  return { ...INITIAL_SITE_STATE, iq: { ...INITIAL_SITE_STATE.iq, phase, answers, started: true } }
}

function choices(qNum: number) {
  return screen.getByRole("group", { name: `Answer choices for question ${qNum}` })
}

function insightBlock() {
  return screen.getByText("What this tells a buyer").parentElement!.parentElement!
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
      expect(screen.getByTestId("exitiq-question")).toBeInTheDocument()
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

    it("renders the answers as large dark console chips", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      for (const chip of within(choices(1)).getAllByRole("button")) {
        expect(chip).toHaveAttribute("type", "button")
        expect(chip).toHaveClass("inline-flex", "items-center", "rounded-full", "border", "font-medium", ...CHIP_LG)
        expect(chip).toHaveClass(...CHIP_IDLE)
        expect(chip).not.toHaveClass("px-[15px]", "py-[10px]", "text-[13.5px]")
      }
    })

    it("sets the serif heading and the mono note in the first build's dark palette", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      const heading = screen.getByRole("heading", { level: 2 })
      expect(heading).toHaveClass("font-display", "text-d1", "font-normal", "leading-[1.18]")
      const note = screen.getByText(QUESTIONS[0]!.note!)
      expect(note.tagName).toBe("P")
      expect(note).toHaveClass("text-d4", "font-mono")
    })

    it("hides the back button on the first question and shows it from the second question on", () => {
      const { unmount } = renderWithSite(<ExitIqQuestion variant={variant} />)
      expect(screen.queryByRole("button", { name: "Change my last answer" })).toBeNull()
      unmount()
      renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(1))
      const back = screen.getByRole("button", { name: "Change my last answer" })
      expect(back).toHaveAttribute("type", "button")
      expect(back).toHaveClass(...LINK_BUTTON)
    })

    it("marks the pressed chip aria-pressed, lights it in filament, and disables all chips while the answer is being read", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      fireEvent.click(screen.getByRole("button", { name: "Recurring commercial services" }))
      for (const chip of within(choices(1)).getAllByRole("button")) {
        expect(chip).toBeDisabled()
        const pressed = chip.textContent === "Recurring commercial services"
        expect(chip).toHaveAttribute("aria-pressed", pressed ? "true" : "false")
        if (pressed) {
          expect(chip).toHaveClass(...CHIP_SELECTED)
          expect(chip).not.toHaveClass(...CHIP_IDLE)
        } else {
          expect(chip).toHaveClass(...CHIP_IDLE)
          expect(chip).not.toHaveClass(...CHIP_SELECTED)
        }
      }
    })

    it("shows the buyer insight for exactly the answer chosen, under a mono uppercase label", () => {
      renderWithSite(<ExitIqQuestion variant={variant} />)
      expect(screen.queryByText("What this tells a buyer")).toBeNull()
      fireEvent.click(screen.getByRole("button", { name: "Manufacturing or distribution" }))
      const insight = insightFor("type", "dist")!
      expect(insight).toBe("Inventory, working capital, suppliers, and equipment can become material deal terms.")
      const label = screen.getByText("What this tells a buyer")
      expect(label).toHaveClass("text-signal", "font-mono", "text-[11.5px]", "tracking-[1px]", "uppercase", "block")
      expect(label.parentElement).toHaveTextContent(insight)
      expect(label.parentElement).toHaveClass("text-d2", "leading-[1.55]")
      expect(insightBlock()).toHaveClass("border-filament/50", "bg-filament/[6%]", "rounded-r-[10px]", "border-l-2")
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
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[0]!.q)
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[1]!.q)
      expect(screen.getByText(progressText.replace("Question 1", "Question 2"))).toBeInTheDocument()
      for (const chip of within(choices(2)).getAllByRole("button")) {
        expect(chip).toBeEnabled()
        expect(chip).toHaveAttribute("aria-pressed", "false")
      }
      expect(screen.getByText("What this tells a buyer").parentElement).toHaveTextContent(insightFor("type", "field")!)
    })

    it("renders an empty note line for a question that has no note", () => {
      renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(1))
      expect(QUESTIONS[1]!.note).toBeUndefined()
      const heading = screen.getByRole("heading", { level: 2 })
      expect(heading.nextElementSibling?.tagName).toBe("P")
      expect(heading.nextElementSibling).toHaveTextContent("")
      expect(heading.nextElementSibling).toHaveClass("text-d4", "font-mono")
    })

    it("going back clears the insight and shows the earlier question with its chip still selected", () => {
      renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(2))
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[2]!.q)
      fireEvent.click(screen.getByRole("button", { name: "Change my last answer" }))
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[1]!.q)
      expect(screen.getByText(progressText.replace("Question 1", "Question 2"))).toBeInTheDocument()
      expect(screen.getByRole("button", { name: chipLabel("rev", QUESTIONS[1]!.chips[0]!.v)! })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(screen.getByRole("button", { name: "$1M to $2M" })).toHaveAttribute("aria-pressed", "false")
      expect(screen.queryByText("What this tells a buyer")).toBeNull()
    })

    it("renders nothing when the phase points past the last question", () => {
      const { container } = renderWithSeededSite(<ExitIqQuestion variant={variant} />, atQuestion(QUESTION_COUNT))
      expect(QUESTIONS[QUESTION_COUNT]).toBeUndefined()
      expect(screen.queryByTestId("exitiq-question")).toBeNull()
      expect(container.innerHTML).toBe("")
    })
  })

  describe("hero variant only", () => {
    it("shows the two-minute footnote in mono under the controls", () => {
      renderWithSite(<ExitIqQuestion variant="hero" />)
      const note = screen.getByText(FOOTNOTE)
      expect(note.tagName).toBe("P")
      expect(note).toHaveClass("text-d4", "mt-3.5", "font-mono", "text-[11.5px]")
    })

    it("sets the position label in filament mono uppercase", () => {
      renderWithSite(<ExitIqQuestion variant="hero" />)
      const label = screen.getByText(`exitIQ · Question 1 of ${QUESTION_COUNT}`)
      expect(label).toHaveClass("text-filament", "font-mono", "text-[11.5px]", "tracking-[1.1px]", "uppercase")
      expect(label).not.toHaveClass("eyebrow", "text-signal")
    })

    it("shows a progress bar that counts the answers given so far and half-lights the current question", () => {
      renderWithSeededSite(<ExitIqQuestion variant="hero" />, atQuestion(3))
      const bar = screen.getByRole("progressbar", { name: "Your progress" })
      expect(bar).toHaveAttribute("aria-valuemin", "0")
      expect(bar).toHaveAttribute("aria-valuenow", "3")
      expect(bar).toHaveAttribute("aria-valuemax", String(QUESTION_COUNT))
      const ticks = Array.from(bar.children)
      expect(ticks).toHaveLength(QUESTION_COUNT)
      ticks.forEach((tick, i) => {
        if (i < 3) expect(tick).toHaveClass("bg-filament", "shadow-[0_0_7px_rgba(76,226,126,.55)]")
        else if (i === 3) expect(tick).toHaveClass("bg-filament/45")
        else expect(tick).toHaveClass("bg-dfull/14")
      })
      expect(screen.getByText(`exitIQ · Question 4 of ${QUESTION_COUNT}`)).toBeInTheDocument()
    })

    it("uses the compact spacing: tighter heading, 11px note, gap-2 chips, and the smaller insight padding", () => {
      renderWithSite(<ExitIqQuestion variant="hero" />)
      expect(screen.getByRole("heading", { level: 2 })).toHaveClass("mb-1", "text-[clamp(22px,2.5vw,29px)]")
      expect(screen.getByRole("heading", { level: 2 })).not.toHaveClass("tracking-[-.5px]")
      expect(screen.getByText(QUESTIONS[0]!.note!)).toHaveClass("mb-4", "text-[11px]")
      expect(choices(1)).toHaveClass("flex", "flex-wrap", "mb-3.5", "gap-2")
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      expect(insightBlock()).toHaveClass("px-[13px]", "py-2.5")
      expect(screen.getByText("What this tells a buyer").parentElement).toHaveClass("text-[13px]")
      expect(screen.getByText(FOOTNOTE).previousElementSibling).toHaveClass("mt-3.5")
    })

    it("never offers 'Start over', even with answers recorded", () => {
      renderWithSeededSite(<ExitIqQuestion variant="hero" />, atQuestion(3))
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
    })

    it("does not show the reading line while the final answer is processed", () => {
      renderWithSeededSite(<ExitIqQuestion variant="hero" />, atQuestion(QUESTION_COUNT - 1))
      fireEvent.click(screen.getByRole("button", { name: "The business would run normally" }))
      expect(screen.getByRole("button", { name: "The business would run normally" })).toBeDisabled()
      expect(screen.queryByText("Reading your answers...")).toBeNull()
    })
  })

  describe("page variant only", () => {
    it("does not show the two-minute footnote or a progress bar", () => {
      renderWithSite(<ExitIqQuestion variant="page" />)
      expect(screen.queryByText(FOOTNOTE)).toBeNull()
      expect(screen.queryByRole("progressbar")).toBeNull()
    })

    it("sets the position label as a signal eyebrow", () => {
      renderWithSite(<ExitIqQuestion variant="page" />)
      const label = screen.getByText(`Question 1 of ${QUESTION_COUNT}`)
      expect(label).toHaveClass("eyebrow", "text-signal", "mb-3.5")
      expect(label).not.toHaveClass("text-filament", "font-mono")
    })

    it("uses the full spacing: tracked heading, 11.5px note, 9px chip gaps, and the larger insight padding", () => {
      renderWithSite(<ExitIqQuestion variant="page" />)
      expect(screen.getByRole("heading", { level: 2 })).toHaveClass(
        "mb-1.5",
        "text-[clamp(25px,3vw,34px)]",
        "tracking-[-.5px]"
      )
      expect(screen.getByText(QUESTIONS[0]!.note!)).toHaveClass("mb-6", "text-[11.5px]")
      expect(choices(1)).toHaveClass("flex", "flex-wrap", "mb-5", "gap-[9px]")
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      expect(insightBlock()).toHaveClass("px-3.5", "py-3")
      expect(screen.getByText("What this tells a buyer").parentElement).toHaveClass("text-[13.5px]", "leading-[1.6]")
      expect(screen.getByRole("button", { name: "Start over" }).parentElement).toHaveClass("mt-[18px]")
    })

    it("hides 'Start over' until at least one answer exists", () => {
      renderWithSite(<ExitIqQuestion variant="page" />)
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      const restart = screen.getByRole("button", { name: "Start over" })
      expect(restart).toHaveAttribute("type", "button")
      expect(restart).toHaveClass(...LINK_BUTTON)
    })

    it("'Start over' clears the answers, insight, and both controls", () => {
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
      const live = screen.getByText("Reading your answers...")
      expect(live).toHaveAttribute("aria-live", "polite")
      expect(live).toHaveClass("text-signal", "font-mono", "text-[11.5px]")
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(screen.queryByText("Reading your answers...")).toBeNull()
    })

    it("does not announce the reading line on questions before the last", () => {
      renderWithSeededSite(<ExitIqQuestion variant="page" />, atQuestion(QUESTION_COUNT - 2))
      fireEvent.click(screen.getByRole("button", { name: "Under 10%" }))
      expect(screen.getByRole("button", { name: "Under 10%" })).toBeDisabled()
      expect(screen.queryByText("Reading your answers...")).toBeNull()
    })
  })
})
