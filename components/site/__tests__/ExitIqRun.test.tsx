import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ADVISOR_ERROR_COPY, ADVISOR_SENT_COPY } from "@/components/site/exitiq/ExitIqActions"
import { ExitIqRun } from "@/components/site/exitiq/ExitIqRun"
import { chipLabel, QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import {
  advisorReviewBody,
  EMPTY_STATE_LABEL,
  type ExitIqAnswers,
  planText,
  RECOMMENDATION_DESCRIPTIONS,
  scoreExitIq,
} from "@/lib/site/exitiq/scoring"
import { CONTACT } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

const mocks = vi.hoisted(() => ({
  copyText: vi.fn<(text: string) => Promise<boolean>>(),
  downloadTextFile: vi.fn<(filename: string, text: string) => boolean>(),
  openInNewTab: vi.fn<(url: string) => void>(),
  submitInquiry: vi.fn<(payload: unknown) => Promise<boolean>>(),
}))

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return {
    ...actual,
    copyText: (t: string) => mocks.copyText(t),
    downloadTextFile: (f: string, t: string) => mocks.downloadTextFile(f, t),
    openInNewTab: (u: string) => mocks.openInNewTab(u),
  }
})
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => mocks.submitInquiry(p) }))

/**
 * A deliberately weak business: every answer contributes a finding, so the result panel has three
 * ranked findings, a five-step plan, and a review body longer than the 700-character booking-notes cap.
 */
const WEAK: Required<ExitIqAnswers> = {
  type: "prof",
  rev: "1-2",
  trend: "down",
  sde: "b",
  books: "diff",
  conc: "d",
  owner: "c",
}
const WEAK_RESULT = scoreExitIq(WEAK)

const ADVANCE_MS = 400

function questionPanel() {
  return screen.getByRole("group", { name: "exitIQ readiness questions" })
}
function resultPanel() {
  return screen.getByRole("group", { name: "exitIQ recommendation and findings" })
}

/** Click the chip carrying `label` and wait out the "reading your answer" pause. */
async function answer(label: string) {
  fireEvent.click(within(questionPanel()).getByRole("button", { name: label }))
  await act(async () => {
    vi.advanceTimersByTime(ADVANCE_MS)
  })
}

async function answerAll(answers: Required<ExitIqAnswers>) {
  for (const q of QUESTIONS) {
    await answer(chipLabel(q.id, answers[q.id])!)
  }
}

describe("<ExitIqRun />", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mocks.copyText.mockReset().mockResolvedValue(true)
    mocks.downloadTextFile.mockReset().mockReturnValue(true)
    mocks.openInNewTab.mockReset()
    mocks.submitInquiry.mockReset().mockResolvedValue(true)
  })
  afterEach(() => vi.useRealTimers())

  describe("before any answer", () => {
    it("shows the first question with a 'Question 1 of 7' label and no back or restart controls", () => {
      renderWithSite(<ExitIqRun />)
      const panel = questionPanel()
      expect(within(panel).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[0]!.q)
      expect(within(panel).queryByRole("button", { name: "Change my last answer" })).toBeNull()
      expect(within(panel).queryByRole("button", { name: "Start over" })).toBeNull()
    })

    it("shows the empty recommendation with dashed meters and no description or plan", () => {
      renderWithSite(<ExitIqRun />)
      const panel = resultPanel()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent(EMPTY_STATE_LABEL)
      expect(within(panel).getAllByText("–")).toHaveLength(3)
      for (const description of Object.values(RECOMMENDATION_DESCRIPTIONS)) {
        expect(within(panel).queryByText(description)).toBeNull()
      }
      expect(within(panel).queryByText("Your next 90 days")).toBeNull()
      expect(within(panel).queryByRole("button", { name: "Save my plan" })).toBeNull()
    })

    it("reports zero progress out of seven on the progress bar", () => {
      renderWithSite(<ExitIqRun />)
      const bar = screen.getByRole("progressbar", { name: "Your progress" })
      expect(bar).toHaveAttribute("aria-valuenow", "0")
      expect(bar).toHaveAttribute("aria-valuemax", String(QUESTION_COUNT))
    })
  })

  describe("answering", () => {
    it("marks the pressed chip selected, disables every chip, and does not show the reading line on an early question", () => {
      renderWithSite(<ExitIqRun />)
      const panel = questionPanel()
      fireEvent.click(within(panel).getByRole("button", { name: "Home or field services" }))
      const choices = within(panel).getByRole("group", { name: "Answer choices for question 1" })
      for (const chip of within(choices).getAllByRole("button")) {
        expect(chip).toBeDisabled()
        expect(chip).toHaveAttribute("aria-pressed", chip.textContent === "Home or field services" ? "true" : "false")
      }
      expect(within(panel).queryByText("Reading your answers...")).toBeNull()
    })

    it("advances to question 2 only after the reading pause has elapsed", async () => {
      renderWithSite(<ExitIqRun />)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Home or field services" }))
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(within(questionPanel()).getByText(`Question 2 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[1]!.q)
      expect(screen.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "1")
    })

    it("shows 'Reading your answers...' while the final answer is being processed", async () => {
      renderWithSite(<ExitIqRun />)
      for (const q of QUESTIONS.slice(0, -1)) {
        await answer(chipLabel(q.id, WEAK[q.id])!)
      }
      const last = QUESTIONS[QUESTION_COUNT - 1]!
      fireEvent.click(within(questionPanel()).getByRole("button", { name: chipLabel(last.id, WEAK[last.id])! }))
      const live = within(questionPanel()).getByText("Reading your answers...")
      expect(live).toHaveAttribute("aria-live", "polite")
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
    })

    it("updates the meters with the live scores as answers arrive", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      const partial = scoreExitIq({ type: "field" })
      const panel = resultPanel()
      expect(within(panel).getByText("Financeability").nextSibling).toHaveTextContent(String(partial.fin))
      expect(within(panel).getByText("Transferability").nextSibling).toHaveTextContent(String(partial.tra))
      expect(within(panel).getByText("Evidence quality").nextSibling).toHaveTextContent(String(partial.evi))
      expect(within(panel).queryByText("–")).toBeNull()
    })
  })

  describe("changing answers mid-run", () => {
    it("'Change my last answer' returns to the previous question with its chip still selected", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      expect(within(questionPanel()).getByText(`Question 3 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      expect(within(questionPanel()).getByText(`Question 2 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("button", { name: "Under $1M" })).toHaveAttribute("aria-pressed", "true")
      expect(within(questionPanel()).getByRole("button", { name: "$1M to $2M" })).toHaveAttribute(
        "aria-pressed",
        "false"
      )
    })

    it("going back keeps the other answers and the progress count", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("button", { name: "Home or field services" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(screen.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "2")
      expect(within(questionPanel()).queryByRole("button", { name: "Change my last answer" })).toBeNull()
    })

    it("replacing an earlier answer overwrites it and moves forward again", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      await answer("$3M to $5M")
      expect(within(questionPanel()).getByText(`Question 3 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      expect(within(questionPanel()).getByRole("button", { name: "$3M to $5M" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(within(questionPanel()).getByRole("button", { name: "Under $1M" })).toHaveAttribute(
        "aria-pressed",
        "false"
      )
    })

    it("'Start over' mid-run clears every answer and returns to the empty result", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Start over" }))
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("button", { name: "Home or field services" })).toHaveAttribute(
        "aria-pressed",
        "false"
      )
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent(EMPTY_STATE_LABEL)
      expect(within(resultPanel()).getAllByText("–")).toHaveLength(3)
      expect(within(questionPanel()).queryByRole("button", { name: "Start over" })).toBeNull()
    })
  })

  describe("the finished result", () => {
    it("names the exact recommendation and its description for a weak business", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      expect(WEAK_RESULT.state).toBe("More Evidence Needed")
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent("More Evidence Needed")
      expect(within(resultPanel()).getByText(RECOMMENDATION_DESCRIPTIONS["More Evidence Needed"])).toBeInTheDocument()
      expect(within(questionPanel()).getByText("Your result is ready.")).toHaveAttribute("aria-live", "polite")
    })

    it("lists the three highest-weight findings in rank order with their numbers", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const done = screen.getByTestId("exitiq-done")
      const titles = WEAK_RESULT.findings.map((f) => f.t)
      expect(titles).toEqual([
        "Books and tax returns need a closer look",
        "One customer carries most of the revenue",
        "Revenue has declined",
      ])
      const rendered = titles.map((t) => within(done).getByText(t))
      rendered.forEach((el, i) => {
        expect(el.previousSibling).toHaveTextContent(`0${i + 1}`)
        if (i > 0) expect(rendered[i - 1]!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      })
      for (const f of WEAK_RESULT.findings) expect(within(done).getByText(f.b)).toBeInTheDocument()
    })

    it("shows the five-step 90-day plan in order with the exact scores", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const panel = resultPanel()
      expect(WEAK_RESULT.plan).toHaveLength(5)
      const items = WEAK_RESULT.plan.map((p) => within(panel).getByText(p))
      items.forEach((el, i) => expect(el.previousSibling).toHaveTextContent(`0${i + 1}`))
      expect(within(panel).getByText("Financeability").nextSibling).toHaveTextContent("18")
      expect(within(panel).getByText("Transferability").nextSibling).toHaveTextContent("13")
      expect(within(panel).getByText("Evidence quality").nextSibling).toHaveTextContent("34")
      expect(screen.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute(
        "aria-valuenow",
        String(QUESTION_COUNT)
      )
    })

    it("'Change answer N' jumps back to that question with the old answer selected", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Change answer 5" }))
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
      expect(within(questionPanel()).getByText(`Question 5 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[4]!.q)
      expect(within(questionPanel()).getByRole("button", { name: "Quite different" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(within(resultPanel()).queryByText("Your next 90 days")).toBeNull()
    })

    it("re-answering after 'Change answer N' returns straight to an updated result", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Change answer 7" }))
      await answer("The business would run normally")
      const updated = scoreExitIq({ ...WEAK, owner: "a" })
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent(updated.state)
      expect(within(resultPanel()).getByText("Transferability").nextSibling).toHaveTextContent(String(updated.tra))
    })

    it("offers one 'Change answer' button per question", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const buttons = screen.getAllByRole("button", { name: /^Change answer \d$/ })
      expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(
        QUESTIONS.map((_, i) => `Change answer ${i + 1}`)
      )
    })

    it("'Start over' from the result clears the run back to question 1 and the empty state", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Start over" }))
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent(EMPTY_STATE_LABEL)
      expect(screen.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "0")
    })
  })

  describe("Save my plan", () => {
    it("copies and downloads the exact plan text under the fixed filename, then confirms", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Save my plan" }))
      const expected = planText(WEAK_RESULT)
      expect(await screen.findByText("Your plan was downloaded and copied.")).toBeInTheDocument()
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      expect(mocks.copyText).toHaveBeenCalledWith(expected)
      expect(mocks.downloadTextFile).toHaveBeenCalledTimes(1)
      expect(mocks.downloadTextFile).toHaveBeenCalledWith("exitIQ-90-day-plan.txt", expected)
      expect(expected).toContain("Recommendation: More Evidence Needed")
      expect(expected).toContain("1. Books and tax returns need a closer look")
    })

    it("does not open a booking tab or send an inquiry when only saving the plan", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Save my plan" }))
      await screen.findByText("Your plan was downloaded and copied.")
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
    })
  })

  describe("Review my result with an advisor", () => {
    it("copies the review body, beacons an exitiq_review inquiry, and opens the booking page with truncated notes", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" }))
      expect(await screen.findByText(ADVISOR_SENT_COPY)).toHaveAttribute("aria-live", "polite")
      const body = advisorReviewBody(WEAK)
      expect(body.length).toBeGreaterThan(700)
      expect(mocks.copyText).toHaveBeenCalledWith(body)
      expect(mocks.submitInquiry).toHaveBeenCalledTimes(1)
      expect(mocks.submitInquiry).toHaveBeenCalledWith({ kind: "exitiq_review", body, source: "score" })
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      expect(mocks.openInNewTab).toHaveBeenCalledWith(
        `${CONTACT.advisorCalendar}?notes=${encodeURIComponent(body.slice(0, 700))}`
      )
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
    })

    it("the review body carries the recommendation, the three scores, and every answer label", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(resultPanel()).getByRole("button", { name: "Review my result with an advisor" }))
      await screen.findByText(ADVISOR_SENT_COPY)
      const body = mocks.copyText.mock.calls[0]![0]
      expect(body).toContain("Recommendation: More Evidence Needed")
      expect(body).toContain("Financeability: 18\nTransferability: 13\nEvidence quality: 34")
      for (const q of QUESTIONS) expect(body).toContain(`- ${q.q} ${chipLabel(q.id, WEAK[q.id])}`)
      expect(body).not.toContain("Skipped")
    })

    it("shows the error copy and skips the inquiry and booking tab when the clipboard write fails", async () => {
      mocks.copyText.mockRejectedValueOnce(new Error("clipboard denied"))
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" }))
      expect(await screen.findByText(ADVISOR_ERROR_COPY)).toHaveAttribute("aria-live", "polite")
      expect(ADVISOR_ERROR_COPY).toBe("We could not open the booking page. Email suyash@heirloomadvisory.ai directly.")
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
    })

    it("recovers from a failed attempt when the next click succeeds", async () => {
      mocks.copyText.mockRejectedValueOnce(new Error("clipboard denied"))
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const button = within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" })
      fireEvent.click(button)
      await screen.findByText(ADVISOR_ERROR_COPY)
      fireEvent.click(button)
      await screen.findByText(ADVISOR_SENT_COPY)
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
    })
  })
})
