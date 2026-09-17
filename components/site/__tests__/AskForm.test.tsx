import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AskForm } from "@/components/site/questions/AskForm"
import { CONTACT } from "@/lib/site/routes"

const openMail = vi.fn()
const copyText = vi.fn()
const submitInquiry = vi.fn().mockResolvedValue(true)

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return { ...actual, openMail: (href: string) => openMail(href), copyText: (t: string) => copyText(t) }
})
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => submitInquiry(p) }))

const QUESTION = "Do you work with franchises?"
const EMAIL = "owner@example.com"
/** What `askQuestionBody` must put on the clipboard and in the mail body. */
const BODY = "Question: Do you work with franchises?\n\nReply to: owner@example.com"

function fill(question = QUESTION, email = EMAIL) {
  fireEvent.change(screen.getByLabelText("Your question"), { target: { value: question } })
  fireEvent.change(screen.getByLabelText("Email for the reply"), { target: { value: email } })
}

async function settle() {
  await act(async () => {
    vi.advanceTimersByTime(420)
  })
}

describe("<AskForm />", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    openMail.mockReset()
    copyText.mockReset().mockResolvedValue(true)
    submitInquiry.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it("renders the anchor target, the two labelled fields, and the send button", () => {
    render(<AskForm />)
    expect(screen.getByTestId("ask-form")).toHaveAttribute("id", "q-ask")
    // `anchor-target` is the scroll margin that keeps #q-ask clear of the one sticky bar when linked to.
    expect(screen.getByTestId("ask-form")).toHaveClass("anchor-target")
    expect(screen.getByRole("heading", { level: 2, name: "Ask a question" })).toBeInTheDocument()
    expect(screen.getByLabelText("Your question")).toHaveValue("")
    expect(screen.getByLabelText("Email for the reply")).toHaveAttribute("type", "email")
    expect(screen.getByTestId("ask-send")).toBeEnabled()
    expect(screen.queryByTestId("ask-sent")).toBeNull()
  })

  it("shows the preparing state and sends once at 420ms, however many clicks it takes", async () => {
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    expect(screen.getByText("Preparing your message...")).toHaveAttribute("aria-live", "polite")
    expect(screen.getByTestId("ask-send")).toBeDisabled()
    fireEvent.click(screen.getByTestId("ask-send"))
    // The clipboard write happens inside the click, where WebKit allows it; nothing else fires yet.
    expect(copyText).toHaveBeenCalledTimes(1)
    act(() => {
      vi.advanceTimersByTime(419)
    })
    expect(openMail).not.toHaveBeenCalled()
    expect(submitInquiry).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(openMail).toHaveBeenCalledTimes(1)
  })

  it("copies, records, and opens the mail client with the exact body after the delay", async () => {
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(copyText).toHaveBeenCalledWith(BODY)
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "question", body: BODY, email: EMAIL, source: "questions" })
    const href = openMail.mock.calls[0]![0] as string
    expect(href.startsWith("mailto:suyash@heirloomadvisory.ai?subject=Question%20for%20Heirloom&body=")).toBe(true)
    expect(new URLSearchParams(href.slice(href.indexOf("?") + 1)).get("body")).toBe(BODY)
    expect(screen.getByTestId("ask-sent")).toHaveTextContent("Your email app opened with the question filled in.")
    expect(screen.getByTestId("ask-sent")).toHaveTextContent(
      `paste the copied question into a message to ${CONTACT.hello}`
    )
    expect(screen.getByTestId("ask-send")).toBeEnabled()
    expect(screen.queryByText("Preparing your message...")).toBeNull()
  })

  it("sends without an email address and beacons the empty field", async () => {
    render(<AskForm />)
    fill(QUESTION, "")
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(submitInquiry).toHaveBeenCalledWith({
      kind: "question",
      body: "Question: Do you work with franchises?\n\nReply to: ",
      email: "",
      source: "questions",
    })
    expect(copyText).toHaveBeenCalledWith("Question: Do you work with franchises?\n\nReply to: ")
    expect(screen.getByTestId("ask-sent")).toBeInTheDocument()
  })

  it("sends anyway when the browser refuses the clipboard, naming the draft as what carries the question", async () => {
    // The reachable failure: copyText resolves false and never rejects. The copy is a convenience — the
    // mail draft and the logged inquiry are the delivery — so the send goes on and only the line changes.
    copyText.mockResolvedValueOnce(false)
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "question", body: BODY, email: EMAIL, source: "questions" })
    expect(openMail).toHaveBeenCalledTimes(1)
    const sent = screen.getByTestId("ask-sent")
    expect(sent).toHaveTextContent("Your email app opened with the question filled in.")
    expect(sent).toHaveTextContent("We could not copy the question. The draft in your email app carries it.")
    expect(sent).not.toHaveTextContent(`paste the copied question into a message to ${CONTACT.hello}`)
    expect(screen.queryByText(/We could not prepare the message/)).toBeNull()
    expect(screen.getByTestId("ask-send")).toBeEnabled()

    // A later send whose copy lands names the clipboard again.
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(screen.getByTestId("ask-sent")).toHaveTextContent(
      `paste the copied question into a message to ${CONTACT.hello}`
    )
    expect(screen.queryByText("We could not copy the question. The draft in your email app carries it.")).toBeNull()
  })

  it("carries the honeypot hidden from people and sends it only when a script fills it", async () => {
    render(<AskForm />)
    const pot = screen.getByTestId("honeypot")
    expect(pot).toHaveAttribute("name", "website")
    expect(pot).toHaveAttribute("tabindex", "-1")
    expect(pot).toHaveAttribute("autocomplete", "off")
    expect(pot).toHaveAttribute("aria-hidden", "true")
    expect(pot.closest("label")).toHaveAttribute("aria-hidden", "true")
    // `sr-only` is absolutely positioned, so the field takes no space in the card's flow.
    expect(pot.closest("span")).toHaveClass("sr-only")
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "question", body: BODY, email: EMAIL, source: "questions" })
    fireEvent.change(pot, { target: { value: "http://spam.example" } })
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(submitInquiry).toHaveBeenLastCalledWith({
      kind: "question",
      body: BODY,
      email: EMAIL,
      source: "questions",
      website: "http://spam.example",
    })
  })

  it("cancels a pending send when unmounted so nothing fires afterwards", () => {
    const { unmount } = render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    // The click already wrote to the clipboard; the mail client and the beacon wait on the timer.
    expect(copyText).toHaveBeenCalledTimes(1)
    unmount()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(openMail).not.toHaveBeenCalled()
    expect(submitInquiry).not.toHaveBeenCalled()
  })

  it("keeps the fallback address when the handoff itself throws", async () => {
    submitInquiry.mockImplementationOnce(() => {
      throw new Error("beacon unavailable")
    })
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(
      screen.getByText("We could not prepare the message. Email suyash@heirloomadvisory.ai directly.")
    ).toBeInTheDocument()
    expect(screen.queryByTestId("ask-sent")).toBeNull()
    expect(openMail).not.toHaveBeenCalled()
  })
})
