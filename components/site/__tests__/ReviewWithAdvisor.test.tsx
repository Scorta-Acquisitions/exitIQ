import { act, fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ADVISOR_ERROR_COPY, ADVISOR_SENT_COPY } from "@/components/site/exitiq/ExitIqActions"
import { ReviewWithAdvisorButton, ReviewWithAdvisorCard } from "@/components/site/exitiq/ReviewWithAdvisor"
import { QUESTIONS } from "@/lib/site/exitiq/questions"
import { advisorReviewBody, type ExitIqAnswers } from "@/lib/site/exitiq/scoring"
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

describe("ReviewWithAdvisor", () => {
  beforeEach(() => {
    mocks.copyText.mockReset().mockResolvedValue(true)
    mocks.openInNewTab.mockReset()
    mocks.submitInquiry.mockReset().mockResolvedValue(true)
  })
  afterEach(() => vi.restoreAllMocks())

  describe("<ReviewWithAdvisorCard />", () => {
    it("is a real button whose accent title marks the whole card as a control at rest, with the booking blurb", () => {
      renderWithSite(<ReviewWithAdvisorCard />)
      const card = screen.getByRole("button", { name: /Review it with an advisor/ })
      expect(card).toHaveAttribute("type", "button")
      const title = screen.getByText("Review it with an advisor")
      expect(title).toHaveClass("type-tagline", "text-accent")
      expect(card).toContainElement(title)
      expect(screen.getByText("Book a call with Suyash. Your result goes into the booking notes.")).toHaveClass(
        "type-body",
        "text-fg-2"
      )
    })

    it("copies the result, beacons the review, and opens the booking page with the result as notes", async () => {
      renderWithSeededSite(<ReviewWithAdvisorCard />, FINISHED)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Review it with an advisor/ }))
      })
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      const body = mocks.copyText.mock.calls[0]![0]
      expect(body.startsWith("exitIQ result review\nRecommendation: Prepare First\n")).toBe(true)
      // The beacon carries the same text the clipboard was given.
      expect(mocks.submitInquiry).toHaveBeenCalledWith({ kind: "exitiq_review", body, source: "score" })
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      const url = mocks.openInNewTab.mock.calls[0]![0]
      const prefix = "https://heirloom.cal.com/suyash/m-a-advisory-meeting?notes="
      expect(url.slice(0, prefix.length)).toBe(prefix)
      // A finished result runs to 846 characters; the booking notes carry its first 700.
      const notes = decodeURIComponent(url.slice(prefix.length))
      expect(notes).toHaveLength(700)
      expect(notes).toBe(body.slice(0, 700))
    })

    it("sends the unanswered body when the visitor has answered nothing", async () => {
      renderWithSite(<ReviewWithAdvisorCard />)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Review it with an advisor/ }))
      })
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      const body = mocks.copyText.mock.calls[0]![0]
      expect(
        body.startsWith("exitIQ result review\nRecommendation: Answer seven questions to see your result.\n")
      ).toBe(true)
      expect(body).toBe(advisorReviewBody({}))
    })

    it("does not beacon or open a tab when the browser refuses the clipboard", async () => {
      // The reachable failure: copyText resolves false and never rejects.
      mocks.copyText.mockResolvedValueOnce(false)
      renderWithSeededSite(<ReviewWithAdvisorCard />, FINISHED)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Review it with an advisor/ }))
      })
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
    })
  })

  describe("<ReviewWithAdvisorButton />", () => {
    it("renders the call to action with its explanatory line and no status copy", () => {
      renderWithSite(<ReviewWithAdvisorButton />)
      expect(screen.getByRole("button", { name: "Review my result with an advisor" }).tagName).toBe("BUTTON")
      expect(screen.getByText("Your result goes into the booking notes.")).toHaveClass("type-caption", "text-fg-3")
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
    })

    it("on click copies, beacons an exitiq_review, opens the booking tab, and shows the success copy", async () => {
      renderWithSeededSite(<ReviewWithAdvisorButton />, FINISHED)
      fireEvent.click(screen.getByRole("button", { name: "Review my result with an advisor" }))
      const sent = await screen.findByText(ADVISOR_SENT_COPY)
      expect(sent).toHaveAttribute("aria-live", "polite")
      expect(sent).toHaveClass("type-caption", "text-accent")
      expect(ADVISOR_SENT_COPY).toBe(
        "The booking page opened in a new tab with your result attached. If it is missing, paste the copied text into the notes."
      )
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
    })

    it("shows the error copy with the hello@ address when the browser refuses the clipboard, and nothing else happens", async () => {
      mocks.copyText.mockResolvedValueOnce(false)
      renderWithSeededSite(<ReviewWithAdvisorButton />, FINISHED)
      fireEvent.click(screen.getByRole("button", { name: "Review my result with an advisor" }))
      const error = await screen.findByText(ADVISOR_ERROR_COPY)
      expect(error).toHaveAttribute("aria-live", "polite")
      expect(error).toHaveClass("type-caption", "text-error")
      expect(error).toHaveTextContent("Email suyash@heirloomadvisory.ai")
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
    })

    it("clears the error copy once a retry succeeds", async () => {
      mocks.copyText.mockResolvedValueOnce(false)
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
