import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AskForm } from "@/components/site/questions/AskForm"
import { mailtoHref } from "@/lib/site/mailto"
import { askQuestionBody } from "@/lib/site/questions/data"
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
    expect(screen.getByLabelText("Your question")).toHaveValue("")
    expect(screen.getByLabelText("Email for the reply")).toHaveAttribute("type", "email")
    expect(screen.getByTestId("ask-send")).toBeEnabled()
    expect(screen.queryByTestId("ask-sent")).toBeNull()
  })

  it("shows the preparing state and ignores a second click while sending", () => {
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    expect(screen.getByText("Preparing your message...")).toHaveAttribute("aria-live", "polite")
    expect(screen.getByTestId("ask-send")).toBeDisabled()
    fireEvent.click(screen.getByTestId("ask-send"))
    act(() => {
      vi.advanceTimersByTime(419)
    })
    expect(copyText).not.toHaveBeenCalled()
  })

  it("copies, records, and opens the mail client with the exact body after the delay", async () => {
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    const body = askQuestionBody(QUESTION, EMAIL)
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(copyText).toHaveBeenCalledWith(body)
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "question", body, email: EMAIL, source: "questions" })
    expect(openMail).toHaveBeenCalledWith(mailtoHref(CONTACT.hello, "Question for Heirloom", body, 1400))
    expect(screen.getByTestId("ask-sent")).toHaveTextContent(
      "Your email app opened with the question filled in. Send it to reach Heirloom."
    )
    expect(screen.getByTestId("ask-sent")).toHaveTextContent(
      `paste the copied question into a message to ${CONTACT.hello}`
    )
    expect(screen.getByTestId("ask-send")).toBeEnabled()
    expect(screen.queryByText("Preparing your message...")).toBeNull()
  })

  it("sends without an email address and leaves the email field out of the beacon", async () => {
    render(<AskForm />)
    fill(QUESTION, "")
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    expect(submitInquiry).toHaveBeenCalledWith(expect.objectContaining({ email: "" }))
    expect(copyText).toHaveBeenCalledWith(askQuestionBody(QUESTION, ""))
    expect(screen.getByTestId("ask-sent")).toBeInTheDocument()
  })

  it("shows the fallback address when the message cannot be prepared, then clears it on retry", async () => {
    copyText.mockRejectedValueOnce(new Error("clipboard unavailable"))
    render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    await settle()
    const error = screen.getByText(/We could not prepare the message/)
    expect(error).toHaveTextContent(`Email ${CONTACT.hello} directly and we will help.`)
    expect(error).toHaveAttribute("aria-live", "polite")
    expect(openMail).not.toHaveBeenCalled()
    expect(submitInquiry).not.toHaveBeenCalled()
    expect(screen.queryByTestId("ask-sent")).toBeNull()
    expect(screen.getByTestId("ask-send")).toBeEnabled()

    fireEvent.click(screen.getByTestId("ask-send"))
    expect(screen.queryByText(/We could not prepare the message/)).toBeNull()
    await settle()
    expect(openMail).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("ask-sent")).toBeInTheDocument()
  })

  it("cancels a pending send when unmounted so nothing fires afterwards", () => {
    const { unmount } = render(<AskForm />)
    fill()
    fireEvent.click(screen.getByTestId("ask-send"))
    unmount()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(copyText).not.toHaveBeenCalled()
    expect(openMail).not.toHaveBeenCalled()
  })
})
