import { act, fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ADVISOR_ERROR_COPY, ADVISOR_SENT_COPY } from "@/components/site/exitiq/ExitIqActions"
import { ReviewWithAdvisorButton, ReviewWithAdvisorCard } from "@/components/site/exitiq/ReviewWithAdvisor"
import { QUESTIONS } from "@/lib/site/exitiq/questions"
import { advisorReviewBody, type ExitIqAnswers } from "@/lib/site/exitiq/scoring"
import { CONTACT } from "@/lib/site/routes"
import { INITIAL_SITE_STATE, type SiteState } from "@/lib/site/state/reducer"
import { renderWithSeededSite, renderWithSite } from "./test-utils"

const mocks = vi.hoisted(() => ({
  copyText: vi.fn<(text: string) => Promise<boolean>>(),
  openInNewTab: vi.fn<(url: string) => void>(),
  submitInquiry: vi.fn<(payload: unknown) => Promise<boolean>>(),
}))

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return {
    ...actual,
    copyText: (t: string) => mocks.copyText(t),
    openInNewTab: (u: string) => mocks.openInNewTab(u),
  }
})
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => mocks.submitInquiry(p) }))

const ANSWERS: Required<ExitIqAnswers> = {
  type: "field",
  rev: "2-3",
  trend: "flat",
  sde: "c",
  books: "close",
  conc: "b",
  owner: "b",
}
const FINISHED: SiteState = {
  ...INITIAL_SITE_STATE,
  iq: { ...INITIAL_SITE_STATE.iq, phase: QUESTIONS.length - 1, answers: ANSWERS, done: true, started: true },
}
const BODY = advisorReviewBody(ANSWERS)
const BOOKING_URL = `${CONTACT.advisorCalendar}?notes=${encodeURIComponent(BODY.slice(0, 700))}`

describe("ReviewWithAdvisor", () => {
  beforeEach(() => {
    mocks.copyText.mockReset().mockResolvedValue(true)
    mocks.openInNewTab.mockReset()
    mocks.submitInquiry.mockReset().mockResolvedValue(true)
  })
  afterEach(() => vi.restoreAllMocks())

  describe("<ReviewWithAdvisorCard />", () => {
    it("is a real button that reacts to hover as a whole, with the title and the booking blurb", () => {
      renderWithSite(<ReviewWithAdvisorCard />)
      const card = screen.getByRole("button", { name: /Ask an advisor to review the result/ })
      expect(card.tagName).toBe("BUTTON")
      expect(card).toHaveAttribute("type", "button")
      expect(card).toHaveClass("hover-green")
      const title = screen.getByText("Ask an advisor to review the result")
      expect(title.className).not.toMatch(/\btext-(ink|l\d|d\d)\b/)
      expect(card).toContainElement(title)
      expect(card).toHaveTextContent("Book a call with Suyash. Your result rides along in the booking notes.")
    })

    it("copies the result, beacons the review, and opens the booking page with the result as notes", async () => {
      renderWithSeededSite(<ReviewWithAdvisorCard />, FINISHED)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Ask an advisor to review the result/ }))
      })
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      expect(mocks.copyText).toHaveBeenCalledWith(BODY)
      expect(BODY).toContain("Recommendation: Prepare First")
      expect(mocks.submitInquiry).toHaveBeenCalledWith({ kind: "exitiq_review", body: BODY, source: "score" })
      expect(mocks.openInNewTab).toHaveBeenCalledWith(BOOKING_URL)
    })

    it("sends a body that marks every question 'Skipped' when nothing has been answered", async () => {
      renderWithSite(<ReviewWithAdvisorCard />)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Ask an advisor to review the result/ }))
      })
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      const body = mocks.copyText.mock.calls[0]![0]
      expect(body).toBe(advisorReviewBody({}))
      expect(body).toContain("Recommendation: Answer seven questions to see your result.")
      expect(body.match(/Skipped/g)).toHaveLength(QUESTIONS.length)
    })

    it("does not beacon or open a tab when the clipboard write fails", async () => {
      mocks.copyText.mockRejectedValueOnce(new Error("denied"))
      renderWithSeededSite(<ReviewWithAdvisorCard />, FINISHED)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Ask an advisor to review the result/ }))
      })
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
    })
  })

  describe("<ReviewWithAdvisorButton />", () => {
    it("renders the call to action with its explanatory line and no status copy", () => {
      renderWithSite(<ReviewWithAdvisorButton />)
      const button = screen.getByRole("button", { name: "Review my result with an advisor" })
      expect(button.tagName).toBe("BUTTON")
      expect(
        screen.getByText("Your exitIQ result rides along in the booking notes so you do not have to repeat it.")
      ).toBeInTheDocument()
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
    })

    it("on click copies, beacons an exitiq_review, opens the booking tab, and shows the success copy", async () => {
      renderWithSeededSite(<ReviewWithAdvisorButton />, FINISHED)
      fireEvent.click(screen.getByRole("button", { name: "Review my result with an advisor" }))
      const sent = await screen.findByText(ADVISOR_SENT_COPY)
      expect(sent).toHaveAttribute("aria-live", "polite")
      expect(ADVISOR_SENT_COPY).toBe(
        "The booking page opened in a new tab with your result attached. It is also copied; paste it into the booking notes if it is missing."
      )
      expect(mocks.copyText).toHaveBeenCalledWith(BODY)
      expect(mocks.submitInquiry).toHaveBeenCalledWith({ kind: "exitiq_review", body: BODY, source: "score" })
      expect(mocks.openInNewTab).toHaveBeenCalledWith(BOOKING_URL)
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
    })

    it("shows the error copy with the hello@ address when the clipboard write fails, and nothing else happens", async () => {
      mocks.copyText.mockRejectedValueOnce(new Error("denied"))
      renderWithSeededSite(<ReviewWithAdvisorButton />, FINISHED)
      fireEvent.click(screen.getByRole("button", { name: "Review my result with an advisor" }))
      const error = await screen.findByText(ADVISOR_ERROR_COPY)
      expect(error).toHaveAttribute("aria-live", "polite")
      expect(error).toHaveTextContent("Email hello@heirloom.com")
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
    })

    it("clears the error copy once a retry succeeds", async () => {
      mocks.copyText.mockRejectedValueOnce(new Error("denied"))
      renderWithSeededSite(<ReviewWithAdvisorButton />, FINISHED)
      const button = screen.getByRole("button", { name: "Review my result with an advisor" })
      fireEvent.click(button)
      await screen.findByText(ADVISOR_ERROR_COPY)
      fireEvent.click(button)
      await screen.findByText(ADVISOR_SENT_COPY)
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
    })
  })
})
