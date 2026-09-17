import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { HeroConsole } from "@/components/site/hero/HeroConsole"
import { copyText, openMail } from "@/lib/site/mailto"
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

const ROW_LABELS = ["Conversation", "Business", "Revenue", "Target timing", "Matters most", "Advisor note"]

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

  it("stays closed until the call to action is pressed", () => {
    renderWithSite(<Harness />)
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    expect(screen.queryByRole("dialog")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Talk to an M&A advisor" }))
    const dialog = screen.getByTestId("advisor-dialog")
    expect(within(dialog).getByText("Where should the conversation start?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 1 OF 5")).toBeInTheDocument()
  })

  it("lets the visitor skip straight to booking with the briefing attached", async () => {
    renderWithSite(<Harness />)
    fireEvent.click(screen.getByTestId("open-advisor"))
    const dialog = screen.getByTestId("advisor-dialog")
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
    const book = within(dialog).getByRole("link", { name: /Book the call/ })
    expect(book).toHaveAttribute("href", `${CALENDAR}?notes=${encodeURIComponent(EMPTY_BRIEFING)}`)
    fireEvent.click(within(dialog).getByRole("button", { name: "Start over" }))
    expect(within(dialog).getByText("Where should the conversation start?")).toBeInTheDocument()
    for (const label of ROW_LABELS) expect(row(dialog, label), label).toBe("To be discussed")
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
    for (const label of ROW_LABELS) expect(row(dialog, label), label).toBe("To be discussed")
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
    expect(href.startsWith("mailto:suyash@heirloomadvisory.ai?subject=Advisor%20call%20briefing&body=")).toBe(true)
    expect(new URLSearchParams(href.slice(href.indexOf("?") + 1)).get("body")).toBe(body)
    const confirmation = within(dialog).getByText(
      "Your email app opened with the briefing. If it did not, the text is copied. Paste it into a message to suyash@heirloomadvisory.ai."
    )
    expect(confirmation).toHaveAttribute("aria-live", "polite")
    expect(confirmation).toHaveClass("type-caption", "text-accent")
    expect(confirmation).not.toHaveClass("text-error")
  })

  it("says the briefing was copied once the clipboard takes it", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(
      within(dialog).getByText("We copied the briefing so you can paste it into the booking notes.")
    ).toBeInTheDocument()
    expect(within(dialog).queryByText("We could not copy the briefing. The booking link below carries it.")).toBeNull()
  })

  it("says the booking link carries the briefing when the browser refuses the clipboard", async () => {
    // The reachable failure: copyText resolves false and never rejects, so the panel must not claim the copy.
    vi.mocked(copyText).mockResolvedValueOnce(false)
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(
      within(dialog).getByText("We could not copy the briefing. The booking link below carries it.")
    ).toBeInTheDocument()
    expect(within(dialog).queryByText("We copied the briefing so you can paste it into the booking notes.")).toBeNull()
    // The booking link still carries the whole briefing: only the clipboard failed.
    expect(within(dialog).getByRole("link", { name: "Book the call" })).toHaveAttribute(
      "href",
      `${CALENDAR}?notes=${encodeURIComponent(EMPTY_BRIEFING)}`
    )
  })

  it("opens mail anyway when the browser refuses the clipboard, and says the draft carries the briefing", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    // The reachable failure: copyText resolves false and never rejects. The mail draft is the delivery.
    vi.mocked(copyText).mockResolvedValueOnce(false)
    fireEvent.click(within(dialog).getByRole("button", { name: "Send the briefing by email instead" }))
    await act(async () => {})
    expect(openMail).toHaveBeenCalledTimes(1)
    const confirmation = within(dialog).getByText(
      "Your email app opened with the briefing. We could not copy the text, so the draft carries it."
    )
    expect(confirmation).toHaveAttribute("aria-live", "polite")
    expect(confirmation).toHaveClass("type-caption", "text-accent")
    expect(within(dialog).queryByText(/We could not prepare the email/)).toBeNull()
    expect(
      within(dialog).queryByText(
        "Your email app opened with the briefing. If it did not, the text is copied. Paste it into a message to suyash@heirloomadvisory.ai."
      )
    ).toBeNull()
    // The panel above still reports the copy the finish made, which this write neither repeats nor undoes.
    expect(
      within(dialog).getByText("We copied the briefing so you can paste it into the booking notes.")
    ).toBeInTheDocument()
  })

  it("keeps the hello@ fallback when the copy throws", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    // A throw drives the defensive catch; a refused clipboard resolves false (the test above).
    vi.mocked(copyText).mockRejectedValueOnce(new Error("clipboard unavailable"))
    fireEvent.click(within(dialog).getByRole("button", { name: "Send the briefing by email instead" }))
    await act(async () => {})
    expect(
      within(dialog).getByText("We could not prepare the email. Write to suyash@heirloomadvisory.ai directly.")
    ).toBeInTheDocument()
    expect(openMail).not.toHaveBeenCalled()
  })

  it("restores the previous question with its selection when the visitor changes the last answer", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    const progress = within(dialog).getByRole("progressbar", { name: "Briefing progress" })
    await answer(dialog, "Selling the business")
    await answer(dialog, "Home or field services")
    expect(within(dialog).getByText("About how much revenue last year?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 3 OF 5")).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
    expect(within(dialog).getByText("What kind of business is it?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 2 OF 5")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Home or field services" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(within(dialog).getByRole("button", { name: "Another type of business" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(within(dialog).queryByText("On the call")).toBeNull()
    expect(row(dialog, "Business")).toBe("Home or field services")
    // The two answers still stand, so the progress does not step back with the question.
    expect(progress).toHaveAttribute("aria-valuenow", "2")

    fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
    expect(within(dialog).getByText("Where should the conversation start?")).toBeInTheDocument()
    expect(within(dialog).getByText("QUESTION 1 OF 5")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Selling the business" })).toHaveAttribute("aria-pressed", "true")
    expect(within(dialog).getByRole("button", { name: "Value and timing" })).toHaveAttribute("aria-pressed", "false")
    expect(row(dialog, "Conversation")).toBe("Selling the business")
    expect(within(dialog).queryByRole("button", { name: "Change my last answer" })).toBeNull()
  })

  it("steps back from the finished briefing to the optional note, and forward again", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
    expect(within(dialog).getByText("OPTIONAL NOTE")).toBeInTheDocument()
    expect(within(dialog).getByText("Anything the advisor should read before the call?")).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole("button", { name: "Nothing to add" }))
    await act(async () => {})
    expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
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

  it("shows exactly six briefing rows: the five questions and the note", () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    const rowsCard = within(dialog).getByTestId("advisor-briefing")
    expect(rowsCard.children).toHaveLength(6)
    expect(Array.from(rowsCard.children, (r) => r.firstElementChild?.textContent)).toEqual(ROW_LABELS)
  })

  it("renders as a light sheet that caps its height to the viewport and scrolls internally", () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    expect(dialog).toHaveClass("on-light")
    expect(dialog).toHaveClass("max-h-[calc(100svh-32px)]", "overflow-auto")

    // The title starts the header row itself: no live dot, no wrapper, nothing before it.
    const header = within(dialog).getByText("Talk to an M&A advisor", { selector: "span" })
    expect(header.previousElementSibling).toBeNull()
    expect(header.parentElement?.querySelector(".bg-accent.rounded-full")).toBeNull()

    const close = within(dialog).getByRole("button", { name: "Close" })
    expect(close).toHaveTextContent("✕")
  })

  it("asks the first question with its caption, its heading, the agenda note and five choices", () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    expect(within(dialog).getByText("Before you book · question 1 of 5")).toBeInTheDocument()
    expect(
      within(dialog).getByRole("heading", { level: 2, name: "Where should the conversation start?" })
    ).toBeInTheDocument()
    expect(within(dialog).getByText("This only sets the agenda.")).toBeInTheDocument()
    expect(within(dialog).getByRole("group", { name: "Answer choices" }).children).toHaveLength(5)
  })

  it("asks for the optional note in a four-row field with its own placeholder", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    await walkToNote(dialog)
    expect(within(dialog).getByText("Last one · optional")).toBeInTheDocument()
    expect(
      within(dialog).getByRole("heading", { level: 2, name: "Anything the advisor should read before the call?" })
    ).toBeInTheDocument()
    const note = within(dialog).getByLabelText("Note for the advisor")
    expect(note).toHaveAttribute("rows", "4")
    expect(note).toHaveAttribute("placeholder", "A concern, a deadline, a buyer to avoid. Rough notes are fine.")
  })

  it("closes the briefing with the copy note and the privacy line", async () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
    await act(async () => {})
    expect(within(dialog).getByText("Briefing ready")).toBeInTheDocument()
    expect(
      within(dialog).getByText("We copied the briefing so you can paste it into the booking notes.")
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText("Nothing you enter here leaves this page until you book or email.")
    ).toBeInTheDocument()
  })

  it("captions the briefing panel and numbers each agenda line beside its text", () => {
    renderWithSite(<Harness />)
    const dialog = openDialog()
    expect(within(dialog).getByText("Builds as you answer")).toBeInTheDocument()
    expect(within(dialog).getByText("01").nextElementSibling).toHaveTextContent(
      "The likely buyer market for your business"
    )
    expect(within(dialog).getByText("03").nextElementSibling).toHaveTextContent("How valuation is built and defended")
    expect(within(dialog).getByText("Not shared outside Heirloom.")).toBeInTheDocument()
  })

  describe("motion and the instrument strip", () => {
    const STAGE_IN = ["animate-stage-in", "motion-reduce:animate-none"]
    const ROW_IN = ["animate-row-in", "motion-reduce:animate-none"]
    const ANSWERS = ["Selling the business", "Home or field services", "$1M to $2M", "Within a year", "Cash at closing"]

    const stage = (dialog: HTMLElement) => within(dialog).getByTestId("advisor-stage")
    const label = (dialog: HTMLElement, text: string) => within(dialog).getByText(text)
    const value = (dialog: HTMLElement, text: string) => within(dialog).getByText(text).nextElementSibling!
    const agendaRows = (dialog: HTMLElement) => Array.from(within(dialog).getByTestId("advisor-agenda").children)
    /** The labels currently marked as the cursor. */
    const litLabels = (dialog: HTMLElement) =>
      ROW_LABELS.filter((l) => label(dialog, l).getAttribute("data-current") === "true")

    it("arrives as one sheet motion each time it opens: a new element per open, still under reduced motion", () => {
      renderWithSite(<Harness />)
      const first = openDialog()
      expect(first).toHaveClass(...STAGE_IN)
      fireEvent.click(within(first).getByRole("button", { name: "Close" }))
      expect(screen.queryByTestId("advisor-dialog")).toBeNull()
      expect(openDialog()).toHaveClass(...STAGE_IN)
    })

    it("keys the question panel by step so each next question arrives, while the acknowledgement holds through the change", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      const q1 = stage(dialog)
      expect(q1).toHaveAttribute("data-step", "0")
      expect(q1).toHaveClass(...STAGE_IN)
      expect(within(q1).getByRole("heading", { level: 2 })).toHaveTextContent("Where should the conversation start?")
      expect(within(q1).getByRole("group", { name: "Answer choices" })).toBeInTheDocument()
      expect(within(dialog).queryByTestId("advisor-ack")).toBeNull()

      // The answer lands: the question holds (same element) and the acknowledgement arrives beside it as a row.
      fireEvent.click(within(dialog).getByRole("button", { name: "Selling the business" }))
      expect(stage(dialog)).toBe(q1)
      const ack = within(dialog).getByTestId("advisor-ack")
      expect(ack).toHaveClass(...ROW_IN, "border-l-2", "border-accent")
      expect(ack).toHaveTextContent(
        "On the callThe call covers your likely buyer market and what preparation would happen before any outreach."
      )
      expect(ack.previousElementSibling).toBe(q1)
      expect(ack.parentElement).toBe(q1.parentElement)

      // The step advances: a new panel for the next question, the same acknowledgement element under it.
      await settle()
      const q2 = stage(dialog)
      expect(q2).not.toBe(q1)
      expect(q2).toHaveAttribute("data-step", "1")
      expect(q2).toHaveClass(...STAGE_IN)
      expect(within(q2).getByRole("heading", { level: 2 })).toHaveTextContent("What kind of business is it?")
      expect(within(dialog).getByTestId("advisor-ack")).toBe(ack)
      expect(ack.previousElementSibling).toBe(q2)

      // A new acknowledgement text is a new row.
      fireEvent.click(within(dialog).getByRole("button", { name: "Home or field services" }))
      const ack2 = within(dialog).getByTestId("advisor-ack")
      expect(ack2).not.toBe(ack)
      expect(ack2).toHaveTextContent(
        "We will prepare the buyer categories that usually pursue field-service companies."
      )
      expect(stage(dialog)).toBe(q2)
      await settle()
      expect(stage(dialog)).toHaveAttribute("data-step", "2")

      // Stepping back arrives the previous question as a panel again, with no acknowledgement.
      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      const back = stage(dialog)
      expect(back).not.toBe(q2)
      expect(back).toHaveAttribute("data-step", "1")
      expect(back).toHaveClass(...STAGE_IN)
      expect(within(dialog).queryByTestId("advisor-ack")).toBeNull()
    })

    it("arrives the optional note and the finished briefing as panels, and the note again on the way back", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      await walkToNote(dialog)
      const note = stage(dialog)
      expect(note).toHaveAttribute("data-step", "5")
      expect(note).toHaveClass(...STAGE_IN)
      expect(within(note).getByRole("heading", { level: 2 })).toHaveTextContent(
        "Anything the advisor should read before the call?"
      )
      expect(within(dialog).queryByTestId("advisor-ack")).toBeNull()

      fireEvent.click(within(dialog).getByRole("button", { name: "Nothing to add" }))
      await act(async () => {})
      const ready = stage(dialog)
      expect(ready).not.toBe(note)
      expect(ready).toHaveAttribute("data-step", "6")
      expect(ready).toHaveClass(...STAGE_IN)
      expect(within(ready).getByText("Briefing ready")).toBeInTheDocument()

      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      const noteAgain = stage(dialog)
      expect(noteAgain).not.toBe(note)
      expect(noteAgain).not.toBe(ready)
      expect(noteAgain).toHaveAttribute("data-step", "5")
      expect(within(noteAgain).getByRole("heading", { level: 2 })).toHaveTextContent(
        "Anything the advisor should read before the call?"
      )
      expect(within(dialog).getByText("OPTIONAL NOTE")).toBeInTheDocument()
    })

    it("lights exactly the label of the row the current step fills, through all five questions and the note, then none", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      for (let step = 0; step < 5; step++) {
        expect(litLabels(dialog), `step ${step}`).toEqual([ROW_LABELS[step]])
        const lit = label(dialog, ROW_LABELS[step]!)
        expect(lit).toHaveClass("text-accent", "type-caption")
        expect(lit).not.toHaveClass("text-fg-3")
        for (const other of ROW_LABELS.filter((l) => l !== ROW_LABELS[step])) {
          expect(label(dialog, other), other).toHaveAttribute("data-current", "false")
          expect(label(dialog, other), other).toHaveClass("text-fg-3")
          expect(label(dialog, other), other).not.toHaveClass("text-accent")
        }
        await answer(dialog, ANSWERS[step]!)
      }
      expect(litLabels(dialog)).toEqual(["Advisor note"])
      expect(label(dialog, "Advisor note")).toHaveClass("text-accent")
      expect(label(dialog, "Matters most")).toHaveAttribute("data-current", "false")

      fireEvent.click(within(dialog).getByRole("button", { name: "Nothing to add" }))
      await act(async () => {})
      expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
      expect(litLabels(dialog)).toEqual([])
      for (const l of ROW_LABELS) expect(label(dialog, l), l).toHaveClass("text-fg-3")

      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      expect(litLabels(dialog)).toEqual(["Advisor note"])
    })

    it("moves the cursor back with the visitor and sits it on the first open question after a prefill", async () => {
      renderWithSite(
        <>
          <HeroConsole />
          <Harness />
        </>
      )
      fireEvent.click(screen.getByTestId("hero-option-offer"))
      const dialog = openDialog()
      // "Conversation" is filled from the hero but the cursor sits on the question being asked.
      expect(value(dialog, "Conversation")).toHaveTextContent("An offer or buyer I already have")
      expect(label(dialog, "Conversation")).toHaveAttribute("data-current", "false")
      expect(litLabels(dialog)).toEqual(["Business"])
      await answer(dialog, "Recurring commercial services")
      expect(litLabels(dialog)).toEqual(["Revenue"])
      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      expect(litLabels(dialog)).toEqual(["Business"])
    })

    it("lands a briefing value as a new row when an answer fills it, and holds the label and the untouched rows still", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      const conversationLabel = label(dialog, "Conversation")
      const empty = value(dialog, "Conversation")
      const businessValue = value(dialog, "Business")
      expect(empty).toHaveTextContent("To be discussed")
      expect(empty).toHaveClass(...ROW_IN, "text-fg-3")
      expect(empty).not.toHaveClass("text-fg")

      fireEvent.click(within(dialog).getByRole("button", { name: "Selling the business" }))
      const filled = value(dialog, "Conversation")
      expect(filled).not.toBe(empty)
      expect(filled).toHaveTextContent("Selling the business")
      expect(filled).toHaveClass(...ROW_IN, "text-fg")
      expect(filled).not.toHaveClass("text-fg-3")
      expect(label(dialog, "Conversation")).toBe(conversationLabel)
      expect(value(dialog, "Business")).toBe(businessValue)
      await settle()

      // Going back changes no value, so nothing lands; re-answering replaces the row.
      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      expect(value(dialog, "Conversation")).toBe(filled)
      fireEvent.click(within(dialog).getByRole("button", { name: "Confidentiality concerns" }))
      const replaced = value(dialog, "Conversation")
      expect(replaced).not.toBe(filled)
      expect(replaced).toHaveTextContent("Confidentiality concerns")
      expect(value(dialog, "Business")).toBe(businessValue)
    })

    it("lands the note row when a note is attached, holds while typing, and lands again when it is cleared", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      await walkToNote(dialog)
      const empty = value(dialog, "Advisor note")
      expect(empty).toHaveTextContent("To be discussed")
      const textarea = within(dialog).getByLabelText("Note for the advisor")

      fireEvent.change(textarea, { target: { value: "Deadline" } })
      const attached = value(dialog, "Advisor note")
      expect(attached).not.toBe(empty)
      expect(attached).toHaveTextContent("Attached")
      expect(attached).toHaveClass(...ROW_IN, "text-fg")

      fireEvent.change(textarea, { target: { value: "Deadline in June" } })
      expect(value(dialog, "Advisor note")).toBe(attached)

      fireEvent.change(textarea, { target: { value: "" } })
      const cleared = value(dialog, "Advisor note")
      expect(cleared).not.toBe(attached)
      expect(cleared).toHaveTextContent("To be discussed")
      expect(cleared).toHaveClass("text-fg-3")
    })

    it("swaps only the agenda line that changes, and every line when the topic does", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      const opened = agendaRows(dialog)
      expect(opened).toHaveLength(3)
      for (const r of opened) expect(r).toHaveClass(...ROW_IN)
      expect(opened[2]).toHaveTextContent("03How valuation is built and defended")

      // The conversation topic swaps every line: three new rows carrying that topic's own texts.
      fireEvent.click(within(dialog).getByRole("button", { name: "Confidentiality concerns" }))
      const conf = agendaRows(dialog)
      conf.forEach((r, i) => expect(r, `row ${i + 1}`).not.toBe(opened[i]))
      expect(conf.map((r) => r.textContent)).toEqual([
        "01Who would learn about a sale, and when",
        "02Your exclusions and information limits",
        "03How outreach works without naming the business",
      ])

      // Back to "Selling the business": the default three lines again, and they hold through the next answers.
      await settle()
      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      await answer(dialog, "Selling the business")
      const [first, second, third] = agendaRows(dialog)
      expect(third).toHaveTextContent("03How valuation is built and defended")
      await answer(dialog, "Home or field services")
      await answer(dialog, "$1M to $2M")
      await answer(dialog, "Within a year")
      expect(agendaRows(dialog)).toEqual([first, second, third])

      fireEvent.click(within(dialog).getByRole("button", { name: "Cash at closing" }))
      const rows = agendaRows(dialog)
      expect(rows[0]).toBe(first)
      expect(rows[1]).toBe(second)
      expect(rows[2]).not.toBe(third)
      expect(rows[2]).toHaveTextContent("03Cash at closing versus money paid later")
      expect(rows[2]).toHaveClass(...ROW_IN)
    })

    it("holds a dark instrument strip between the header and the panes, tablet up, over the calm still", () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      const header = within(dialog).getByText("Talk to an M&A advisor", { selector: "span" }).parentElement!
      const strip = within(dialog).getByTestId("advisor-field-strip")
      const panes = strip.nextElementSibling!
      expect(Array.from(dialog.children)).toEqual([header, strip, panes])

      // Its own dark box on the light sheet; hidden below the tablet breakpoint so the chips stay above the fold.
      expect(strip).toHaveClass("hidden", "tab:block", "on-dark")
      expect(strip).toHaveAttribute("aria-hidden", "true")
      expect(strip.textContent).toBe("")

      const still = strip.children[0] as HTMLImageElement
      const field = within(dialog).getByTestId("advisor-field")
      expect(Array.from(strip.children)).toEqual([still, field])
      expect(still.tagName).toBe("IMG")
      expect(decodeURIComponent(still.getAttribute("src") ?? "")).toContain("/generated/field-calm.webp")
      expect(still).toHaveAttribute("alt", "")

      // Without WebGL (jsdom) the canvas stays inert over the still; its level is still exposed.
      expect(field.tagName).toBe("CANVAS")
      expect(field).toHaveAttribute("aria-hidden", "true")
      expect(field).toHaveAttribute("data-target", "0.15")
    })

    it("brightens the field by one step per answer, holds it through the note and the briefing, and drops it on Start over", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      const field = () => within(dialog).getByTestId("advisor-field")
      expect(field()).toHaveAttribute("data-target", "0.15")
      const levels: string[] = []
      for (const chip of ANSWERS) {
        fireEvent.click(within(dialog).getByRole("button", { name: chip }))
        levels.push(field().getAttribute("data-target") ?? "")
        await settle()
      }
      expect(levels).toEqual(["0.29", "0.43", "0.57", "0.71", "0.85"])
      expect(within(dialog).getByText("OPTIONAL NOTE")).toBeInTheDocument()
      expect(field()).toHaveAttribute("data-target", "0.85")

      // Going back changes no answer, so the level holds; the finished briefing holds it too.
      fireEvent.click(within(dialog).getByRole("button", { name: "Change my last answer" }))
      expect(field()).toHaveAttribute("data-target", "0.85")
      fireEvent.click(within(dialog).getByRole("button", { name: "Skip the questions, just book" }))
      await act(async () => {})
      expect(within(dialog).getByText("BRIEFING READY")).toBeInTheDocument()
      expect(field()).toHaveAttribute("data-target", "0.85")

      fireEvent.click(within(dialog).getByRole("button", { name: "Start over" }))
      expect(field()).toHaveAttribute("data-target", "0.15")
      expect(within(dialog).getByRole("progressbar", { name: "Briefing progress" })).toHaveAttribute(
        "aria-valuenow",
        "0"
      )
    })

    it("opens already lit one step when an answer carried over from the hero", () => {
      renderWithSite(
        <>
          <HeroConsole />
          <Harness />
        </>
      )
      fireEvent.click(screen.getByTestId("hero-option-offer"))
      const dialog = openDialog()
      expect(within(dialog).getByTestId("advisor-field")).toHaveAttribute("data-target", "0.29")
      expect(within(dialog).getByRole("progressbar", { name: "Briefing progress" })).toHaveAttribute(
        "aria-valuenow",
        "1"
      )
    })

    it("pairs every one-shot animation in the sheet with its reduced-motion still, and nothing loops", async () => {
      renderWithSite(<Harness />)
      const dialog = openDialog()
      const animated = () => [dialog, ...Array.from(dialog.querySelectorAll('[class*="animate-"]'))]
      // The sheet, the question panel, six briefing values, three agenda lines.
      expect(animated()).toHaveLength(1 + 1 + 6 + 3)
      for (const el of animated()) {
        expect(el).toHaveClass("motion-reduce:animate-none")
        expect(el.className).toMatch(/animate-(stage|row)-in/)
        expect(el.className).not.toMatch(/animate-(dash|pulse|spin|bounce|ping)/)
      }
      fireEvent.click(within(dialog).getByRole("button", { name: "Selling the business" }))
      // Plus the acknowledgement row.
      expect(animated()).toHaveLength(1 + 1 + 1 + 6 + 3)
      for (const el of animated()) expect(el).toHaveClass("motion-reduce:animate-none")
      await settle()
      expect(dialog.querySelectorAll(".animate-stage-in")).toHaveLength(1)
      expect(dialog.querySelectorAll(".animate-row-in")).toHaveLength(1 + 6 + 3)
    })
  })
})
