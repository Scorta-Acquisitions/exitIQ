import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { HeroConsole } from "@/components/site/hero/HeroConsole"
import { copyText, mailtoHref, openMail } from "@/lib/site/mailto"
import { renderWithSite } from "./test-utils"

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return { ...actual, openMail: vi.fn(), copyText: vi.fn().mockResolvedValue(true) }
})
const submitInquiry = vi.fn().mockResolvedValue(true)
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => submitInquiry(p) }))

const CALENDAR = "https://heirloom.cal.com/suyash/m-a-advisory-meeting"
const EMPTY_BRIEFING =
  "Advisor call briefing\nConversation: Not answered\nBusiness: Not answered\nRevenue: Not answered\nTarget timing: Not answered\nMatters most: Not answered"

function Harness() {
  return (
    <>
      <AdvisorCtaButton />
      <AdvisorDialog />
    </>
  )
}

function openDialog(): HTMLElement {
  fireEvent.click(screen.getByTestId("open-advisor"))
  return screen.getByTestId("advisor-dialog")
}

/** The briefing value shown beside a row label ("To be discussed" until answered). */
function row(dialog: HTMLElement, label: string): string {
  return within(dialog).getByText(label).nextElementSibling?.textContent ?? ""
}

function agenda(dialog: HTMLElement): string[] {
  const list = within(dialog).getByText("Call agenda").nextElementSibling!
  return Array.from(list.querySelectorAll(":scope > div > span:last-child"), (el) => el.textContent ?? "")
}

async function settle() {
  await act(async () => {
    vi.advanceTimersByTime(500)
  })
}

async function answer(dialog: HTMLElement, label: string) {
  fireEvent.click(within(dialog).getByRole("button", { name: label }))
  await settle()
}

async function walkToNote(dialog: HTMLElement) {
  await answer(dialog, "Selling the business")
  await answer(dialog, "Home or field services")
  await answer(dialog, "$1M to $2M")
  await answer(dialog, "Within a year")
  await answer(dialog, "Cash at closing")
}

describe("<AdvisorDialog />", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(copyText).mockClear().mockResolvedValue(true)
    vi.mocked(openMail).mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it("opens from the call to action and walks through a question", async () => {
    renderWithSite(<Harness />)
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    fireEvent.click(screen.getByTestId("open-advisor"))
    const dialog = screen.getByTestId("advisor-dialog")
    expect(within(dialog).getByText("Where should the conversation start?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 1 OF 5")).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Selling the business" }))
    expect(within(dialog).getByText(/The call covers your likely buyer market/)).toBeInTheDocument()
    expect(within(dialog).getByText("Conversation").nextSibling).toHaveTextContent("Selling the business")
    await act(async () => {
      vi.advanceTimersByTime(600)
    })
    expect(within(dialog).getByText("What kind of business is it?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 2 OF 5")).toBeInTheDocument()
  })

  it("lets the visitor skip straight to booking with the briefing attached", async () => {
    renderWithSite(<Harness />)
    fireEvent.click(screen.getByTestId("open-advisor"))
    const dialog = screen.getByTestId("advisor-dialog")
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
    const book = within(dialog).getByRole("link", { name: /Book the call/ })
    expect(book).toHaveAttribute("href", expect.stringContaining("heirloom.cal.com"))
    expect(decodeURIComponent(book.getAttribute("href") ?? "")).toContain("Conversation: Not answered")
    fireEvent.click(within(dialog).getByRole("button", { name: "Start over" }))
    expect(within(dialog).getByText("Where should the conversation start?")).toBeInTheDocument()
  })

  it("closes with the close button", () => {
    renderWithSite(<Harness />)
    fireEvent.click(screen.getByTestId("open-advisor"))
    fireEvent.click(within(screen.getByTestId("advisor-dialog")).getByRole("button", { name: "Close" }))
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
  })

  it("names the dialog for assistive technology and starts with an empty briefing", () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
    for (const label of ["Conversation", "Business", "Revenue", "Target timing", "Matters most", "Advisor note"]) {
      expect(row(dialog, label), label).toBe("To be discussed")
    }
    expect(within(dialog).getByRole("progressbar", { name: "Briefing progress" })).toHaveAttribute("aria-valuenow", "0")
    expect(within(dialog).getByRole("progressbar", { name: "Briefing progress" })).toHaveAttribute("aria-valuemax", "5")
    expect(within(dialog).queryByRole("button", { name: "Change my last answer" })).toBeNull()
    expect(agenda(dialog)).toEqual([
      "The likely buyer market for your business",
      "What preparation happens before any outreach",
      "How valuation is built and defended",
    ])
  })

  it("fills one briefing row per answer across the five questions, then reaches the optional note", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    const progress = within(dialog).getByRole("progressbar", { name: "Briefing progress" })

    fireEvent.click(within(dialog).getByRole("button", { name: "Selling the business" }))
    expect(row(dialog, "Conversation")).toBe("Selling the business")
    expect(progress).toHaveAttribute("aria-valuenow", "1")
    expect(within(dialog).getByRole("button", { name: "Value and timing" })).toBeDisabled()
    await settle()
    expect(within(dialog).getByText("What kind of business is it?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 2 OF 5")).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Home or field services" }))
    expect(row(dialog, "Business")).toBe("Home or field services")
    expect(
      within(dialog).getByText("We will prepare the buyer categories that usually pursue field-service companies.")
    ).toBeInTheDocument()
    await settle()
    expect(within(dialog).getByText("About how much revenue last year?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 3 OF 5")).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "$1M to $2M" }))
    expect(row(dialog, "Revenue")).toBe("$1M to $2M")
    await settle()
    expect(within(dialog).getByText("When would you want a sale to close?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 4 OF 5")).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Within a year" }))
    expect(row(dialog, "Target timing")).toBe("Within a year")
    await settle()
    expect(within(dialog).getByText("What matters most in the outcome?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 5 OF 5")).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Cash at closing" }))
    expect(row(dialog, "Matters most")).toBe("Cash at closing")
    expect(agenda(dialog)).toEqual([
      "The likely buyer market for your business",
      "What preparation happens before any outreach",
      "Cash at closing versus money paid later",
    ])
    await settle()
    expect(within(dialog).getByText("Anything the advisor should read before the call?")).toBeInTheDocument()
    expect(within(dialog).getByText("OPTIONAL NOTE")).toBeInTheDocument()
    expect(progress).toHaveAttribute("aria-valuenow", "5")
    expect(row(dialog, "Advisor note")).toBe("To be discussed")
    expect(within(dialog).queryByRole("button", { name: "Skip the questions, just book" })).toBeNull()
  })

  it("attaches the note to the briefing text and the booking link when the visitor finishes", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    await walkToNote(dialog)
    fireEvent.change(within(dialog).getByLabelText("Note for the advisor"), { target: { value: "Deadline in June" } })
    expect(row(dialog, "Advisor note")).toBe("Attached")
    fireEvent.click(within(dialog).getByRole("button", { name: "Finish" }))
    await act(async () => {})
    expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
    const briefing =
      "Advisor call briefing\nConversation: Selling the business\nBusiness: Home or field services\nRevenue: $1M to $2M\nTarget timing: Within a year\nMatters most: Cash at closing\nNote for the advisor: Deadline in June"
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(copyText).toHaveBeenCalledWith(briefing)
    const book = within(dialog).getByRole("link", { name: "Book the call" })
    expect(book).toHaveAttribute("href", `${CALENDAR}?notes=${encodeURIComponent(briefing)}`)
    expect(book).toHaveAttribute("target", "_blank")
    expect(book).toHaveAttribute("rel", "noopener")
    expect(openMail).not.toHaveBeenCalled()
  })

  it("finishes with 'Nothing to add' and leaves the note line out of the briefing", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    await walkToNote(dialog)
    fireEvent.click(within(dialog).getByRole("button", { name: "Nothing to add" }))
    await act(async () => {})
    expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
    expect(within(dialog).getByText("Your advisor reads this before the call.")).toBeInTheDocument()
    expect(copyText).toHaveBeenCalledWith(
      "Advisor call briefing\nConversation: Selling the business\nBusiness: Home or field services\nRevenue: $1M to $2M\nTarget timing: Within a year\nMatters most: Cash at closing"
    )
    expect(row(dialog, "Advisor note")).toBe("To be discussed")
  })

  it("emails the briefing instead: copies it, opens hello@ with the exact subject and body, and confirms", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    fireEvent.click(within(dialog).getByRole("button", { name: "Send the briefing by email instead" }))
    await act(async () => {})
    const body = EMPTY_BRIEFING + "\n\nPlease reply with times for a call."
    expect(copyText).toHaveBeenLastCalledWith(body)
    expect(openMail).toHaveBeenCalledTimes(1)
    const href = vi.mocked(openMail).mock.calls[0]![0]
    expect(href).toBe(mailtoHref("suyash@heirloomadvisory.ai", "Advisor call briefing", body, 1400))
    expect(href.startsWith("mailto:suyash@heirloomadvisory.ai?subject=Advisor%20call%20briefing&body=")).toBe(true)
    expect(new URLSearchParams(href.slice(href.indexOf("?") + 1)).get("body")).toBe(body)
    expect(
      within(dialog).getByText(
        "Your email app opened with the briefing. If it did not, the text is copied. Paste it into a message to suyash@heirloomadvisory.ai."
      )
    ).toBeInTheDocument()
  })

  it("shows the hello@ fallback and does not open mail when the briefing cannot be copied", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    vi.mocked(copyText).mockRejectedValueOnce(new Error("clipboard unavailable"))
    fireEvent.click(within(dialog).getByRole("button", { name: "Send the briefing by email instead" }))
    await act(async () => {})
    expect(
      within(dialog).getByText("We could not prepare the email. Write to suyash@heirloomadvisory.ai directly.")
    ).toBeInTheDocument()
    expect(openMail).not.toHaveBeenCalled()
    expect(within(dialog).queryByText(/Your email app opened/)).toBeNull()
  })

  it("restores the previous question with its selection when the visitor changes the last answer", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    await answer(dialog, "Selling the business")
    expect(within(dialog).getByText("What kind of business is it?")).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
    expect(within(dialog).getByText("Where should the conversation start?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 1 OF 5")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Selling the business" })).toHaveAttribute("aria-pressed", "true")
    expect(within(dialog).getByRole("button", { name: "Value and timing" })).toHaveAttribute("aria-pressed", "false")
    expect(within(dialog).queryByText("On the call")).toBeNull()
    expect(row(dialog, "Conversation")).toBe("Selling the business")
    expect(within(dialog).queryByRole("button", { name: "Change my last answer" })).toBeNull()
  })

  it("re-answering a question replaces the briefing row and the agenda", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    await answer(dialog, "Selling the business")
    fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
    fireEvent.click(within(dialog).getByRole("button", { name: "Confidentiality concerns" }))
    expect(row(dialog, "Conversation")).toBe("Confidentiality concerns")
    expect(agenda(dialog)).toEqual([
      "Who would learn about a sale, and when",
      "Your exclusions and information limits",
      "How outreach works without naming the business",
    ])
  })

  it("steps back from the finished briefing to the note", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    await walkToNote(dialog)
    fireEvent.click(within(dialog).getByRole("button", { name: "Nothing to add" }))
    await act(async () => {})
    fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
    expect(within(dialog).getByText("Anything the advisor should read before the call?")).toBeInTheDocument()
    expect(within(dialog).getByText("OPTIONAL NOTE")).toBeInTheDocument()
  })

  it("carries the offer path over from the hero funnel and asks only the remaining four questions", async () => {
    renderWithSite(
      <>
        <HeroConsole />
        <Harness />
      </>
    )
    fireEvent.click(screen.getByTestId("hero-option-offer"))
    expect(screen.getByTestId("hero-offer")).toBeInTheDocument()
    const dialog = openDialog()
    expect(
      within(dialog).getByText("Your earlier answers carried over. 4 questions left before booking.")
    ).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 1 OF 4")).toBeInTheDocument()
    expect(within(dialog).getByText("What kind of business is it?")).toBeInTheDocument()
    expect(within(dialog).queryByText("Where should the conversation start?")).toBeNull()
    expect(row(dialog, "Conversation")).toBe("An offer or buyer I already have")
    expect(within(dialog).getByRole("progressbar", { name: "Briefing progress" })).toHaveAttribute("aria-valuenow", "1")
    expect(within(dialog).queryByRole("button", { name: "Change my last answer" })).toBeNull()
    expect(agenda(dialog)).toEqual([
      "A first read of the offer in front of you",
      "Where the buyer still has room to move",
      "Whether competition would change the outcome",
    ])
    await answer(dialog, "Recurring commercial services")
    expect(within(dialog).getByText("QUESTION 2 OF 4")).toBeInTheDocument()
    expect(within(dialog).getByText("About how much revenue last year?")).toBeInTheDocument()
  })

  it("closes on Escape", () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("keeps the answers when the dialog is closed and reopened", async () => {
    renderWithSite(<Harness />)
    let dialog = openDialog()
    await answer(dialog, "Value and timing")
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }))
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    dialog = openDialog()
    expect(row(dialog, "Conversation")).toBe("Value and timing")
    expect(within(dialog).getByText("What kind of business is it?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 2 OF 5")).toBeInTheDocument()
  })
  it("records the finished briefing as an advisor_briefing inquiry exactly once", async () => {
    submitInquiry.mockClear()
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Selling the business" }))
    await act(async () => {
      vi.advanceTimersByTime(600)
    })
    expect(submitInquiry).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(submitInquiry).toHaveBeenCalledTimes(1)
    expect(submitInquiry).toHaveBeenCalledWith({
      kind: "advisor_briefing",
      body: EMPTY_BRIEFING.replace("Conversation: Not answered", "Conversation: Selling the business"),
      source: "advisor",
    })
    fireEvent.click(within(dialog).getByRole("button", { name: "Send the briefing by email instead" }))
    await act(async () => {})
    expect(submitInquiry).toHaveBeenCalledTimes(1)
  })
})
