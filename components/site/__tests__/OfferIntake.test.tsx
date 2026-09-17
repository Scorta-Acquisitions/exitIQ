import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OfferIntake } from "@/components/site/offer-review/OfferIntake"
import { mailtoHref, OFFER_FORWARD_MAILTO } from "@/lib/site/mailto"

const openMail = vi.fn()
const copyText = vi.fn().mockResolvedValue(true)
const submitInquiry = vi.fn().mockResolvedValue(true)

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return { ...actual, openMail: (href: string) => openMail(href), copyText: (t: string) => copyText(t) }
})
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => submitInquiry(p) }))

const OFFER_ASK =
  "Please explain what I would receive, what is missing, and which terms deserve attention before I respond."
const FOOTER = "\n\nSent from the Heirloom Offer Review page."
const SENT_FALLBACK =
  "If your email app did not open, the summary has been copied. Paste it into a message to offers@heirloom.com."
/** What the same line says when the browser refused the clipboard: the offer went, the draft carries it. */
const SENT_NOT_COPIED = "We could not copy the summary. The draft in your email app carries it."

async function send() {
  fireEvent.click(screen.getByTestId("oi-send"))
  await act(async () => {
    vi.advanceTimersByTime(420)
  })
}

describe("<OfferIntake />", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    openMail.mockClear()
    copyText.mockClear().mockResolvedValue(true)
    submitInquiry.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it("starts on the forward tab and honours an initial mode", () => {
    const { unmount } = render(<OfferIntake />)
    expect(screen.getByTestId("oi-tab-forward")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Choose a file" })).toBeInTheDocument()
    unmount()
    render(<OfferIntake initialMode="verbal" />)
    expect(screen.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByLabelText("Price or range discussed")).toBeInTheDocument()
  })

  it("sends the exact verbal body, with the reply email on its own line and in the record", async () => {
    render(<OfferIntake initialMode="verbal" />)
    fireEvent.change(screen.getByLabelText("Price or range discussed"), { target: { value: "$4.5M" } })
    fireEvent.change(screen.getByLabelText("Email for your review"), { target: { value: "me@x.com" } })
    await send()
    const body =
      "I received a verbal offer with these terms:\n" +
      "Headline price: $4.5M\n" +
      "Cash at close and later payments: \n" +
      "Financing status: \n" +
      "What the buyer requested next: \n\n" +
      OFFER_ASK +
      "\n\nEmail for your review: me@x.com" +
      FOOTER
    expect(copyText).toHaveBeenCalledWith(body)
    expect(submitInquiry).toHaveBeenCalledWith({
      kind: "offer_review",
      body,
      email: "me@x.com",
      source: "offer-review",
    })
  })

  it("keeps exactly one intake tab pressed and swaps the form when a tab is chosen", () => {
    render(<OfferIntake />)
    const pressed = () =>
      ["forward", "paste", "verbal"].filter(
        (m) => screen.getByTestId(`oi-tab-${m}`).getAttribute("aria-pressed") === "true"
      )
    expect(pressed()).toEqual(["forward"])
    fireEvent.click(screen.getByTestId("oi-tab-paste"))
    expect(pressed()).toEqual(["paste"])
    expect(screen.getByLabelText("Paste the offer or buyer email")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Choose a file" })).toBeNull()
    fireEvent.click(screen.getByTestId("oi-tab-verbal"))
    expect(pressed()).toEqual(["verbal"])
    expect(screen.getByLabelText("What does the buyer want you to sign or do next?")).toBeInTheDocument()
  })

  it("forward mode: names the chosen file and asks the visitor to attach it", () => {
    render(<OfferIntake />)
    expect(screen.getByText("No file chosen yet.")).toBeInTheDocument()
    const input = screen.getByLabelText("Upload the offer, buyer email, or letter of intent") as HTMLInputElement
    expect(input.type).toBe("file")
    const file = new File(["%PDF-1.7"], "ridgeline-loi.pdf", { type: "application/pdf" })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText("Selected: ridgeline-loi.pdf · attach it to the email that opens.")).toBeInTheDocument()
    expect(screen.queryByText("No file chosen yet.")).toBeNull()
  })

  it("forward mode: 'Choose a file' opens the hidden file picker", () => {
    render(<OfferIntake />)
    const input = screen.getByLabelText("Upload the offer, buyer email, or letter of intent") as HTMLInputElement
    const click = vi.spyOn(input, "click").mockImplementation(() => {})
    fireEvent.click(screen.getByRole("button", { name: "Choose a file" }))
    expect(click).toHaveBeenCalledTimes(1)
  })

  it("forward mode: clearing the file selection returns to the empty prompt", () => {
    render(<OfferIntake />)
    const input = screen.getByLabelText("Upload the offer, buyer email, or letter of intent") as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(["x"], "a.pdf")] } })
    expect(screen.getByText("Selected: a.pdf · attach it to the email that opens.")).toBeInTheDocument()
    fireEvent.change(input, { target: { files: [] } })
    expect(screen.getByText("No file chosen yet.")).toBeInTheDocument()
  })

  it("insets the mode chips 16px on phones and 24px from the tablet breakpoint", () => {
    render(<OfferIntake />)
    const row = screen.getByRole("group", { name: "Choose how to share your offer" })
    expect(row).toHaveClass("px-4", "tab:px-6")
    expect(row).not.toHaveClass("px-6")
    expect(row.children).toHaveLength(3)
    expect(row).toContainElement(screen.getByTestId("oi-tab-forward"))
  })

  it("forward mode: keeps the review note beside the attach button in one action row, as the other modes do", () => {
    const note = "A person reviews it. You usually hear back the same business day."
    const { unmount } = render(<OfferIntake />)
    const attach = screen.getByRole("link", { name: "Open an email to attach the offer" })
    const forwardNote = screen.getByText(note)
    expect(forwardNote).toHaveClass("type-caption", "text-fg-3")
    expect(forwardNote.previousElementSibling).toBe(attach)
    unmount()
    render(<OfferIntake initialMode="paste" />)
    expect(screen.getByText(note).previousElementSibling).toBe(screen.getByTestId("oi-send"))
  })

  it("forward mode: links the attach button and the inline address to offers@heirloom.com and has no send button", () => {
    render(<OfferIntake />)
    expect(screen.getByRole("link", { name: "Open an email to attach the offer" })).toHaveAttribute(
      "href",
      OFFER_FORWARD_MAILTO
    )
    expect(screen.getByRole("link", { name: "Open an email to attach the offer" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:offers@heirloom\.com\?subject=Free%20offer%20review&body=/)
    )
    expect(screen.getByRole("link", { name: "offers@heirloom.com" })).toHaveAttribute(
      "href",
      "mailto:offers@heirloom.com"
    )
    expect(screen.queryByTestId("oi-send")).toBeNull()
  })

  it("disables the send button and shows the preparing note while a send is in flight", async () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    const button = screen.getByTestId("oi-send")
    expect(button).not.toBeDisabled()
    fireEvent.click(button)
    expect(button).toBeDisabled()
    expect(screen.getByText("Preparing your message...")).toBeInTheDocument()
    fireEvent.click(button)
    await act(async () => {
      vi.advanceTimersByTime(420)
    })
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(openMail).toHaveBeenCalledTimes(1)
    expect(button).not.toBeDisabled()
    expect(screen.queryByText("Preparing your message...")).toBeNull()
  })

  it("writes to the clipboard inside the click and sends nothing before the preparation delay", () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    fireEvent.click(screen.getByTestId("oi-send"))
    // The write belongs to the click's own task: WebKit refuses one made from the 420ms timer.
    expect(copyText).toHaveBeenCalledTimes(1)
    act(() => {
      vi.advanceTimersByTime(419)
    })
    expect(openMail).not.toHaveBeenCalled()
    expect(submitInquiry).not.toHaveBeenCalled()
    expect(screen.queryByTestId("oi-sent")).toBeNull()
  })

  it("sends the exact pasted body and mailto link", async () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), {
      target: { value: "LOI: $4.65M, 60 days exclusivity" },
    })
    await send()
    const body =
      "I received the following terms for my business:\n\nLOI: $4.65M, 60 days exclusivity\n\n" + OFFER_ASK + FOOTER
    expect(copyText).toHaveBeenCalledWith(body)
    expect(openMail).toHaveBeenCalledWith(mailtoHref("offers@heirloom.com", "Free offer review", body))
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "offer_review", body, email: "", source: "offer-review" })
    expect(
      screen.getByText("Your offer has been sent for review. We will reply to the email you provided.")
    ).toBeInTheDocument()
    expect(screen.getByText(SENT_FALLBACK)).toBeInTheDocument()
  })

  it("omits the paid-later, concern, and email lines from a verbal body when those fields are empty", async () => {
    render(<OfferIntake initialMode="verbal" />)
    fireEvent.change(screen.getByLabelText("Price or range discussed"), { target: { value: "$4.5M" } })
    fireEvent.change(screen.getByLabelText("How much would be paid at closing?"), { target: { value: "$3M" } })
    fireEvent.change(screen.getByLabelText("Does the buyer already have financing?"), {
      target: { value: "SBA pre-approval" },
    })
    fireEvent.change(screen.getByLabelText("What does the buyer want you to sign or do next?"), {
      target: { value: "Sign an LOI" },
    })
    await send()
    const body =
      "I received a verbal offer with these terms:\n" +
      "Headline price: $4.5M\n" +
      "Cash at close and later payments: $3M\n" +
      "Financing status: SBA pre-approval\n" +
      "What the buyer requested next: Sign an LOI\n\n" +
      OFFER_ASK +
      FOOTER
    expect(copyText).toHaveBeenCalledWith(body)
    expect(openMail).toHaveBeenCalledWith(mailtoHref("offers@heirloom.com", "Free offer review", body))
  })

  it("includes the paid-later and concern lines when those fields are filled", async () => {
    render(<OfferIntake initialMode="verbal" />)
    fireEvent.change(screen.getByLabelText("How much would be paid at closing?"), { target: { value: "$3M" } })
    fireEvent.change(screen.getByLabelText("Would any amount be paid later?"), { target: { value: "$1M note" } })
    fireEvent.change(screen.getByLabelText("Anything else that concerns you?"), {
      target: { value: "90 days exclusivity" },
    })
    await send()
    const body = copyText.mock.calls[0]?.[0] as string
    expect(body).toContain("Cash at close and later payments: $3M · Paid later: $1M note\n")
    expect(body).toContain("What the buyer requested next: \nOther concerns: 90 days exclusivity\n\n")
  })

  it("sends anyway when the browser refuses the clipboard, naming the draft as what carries the summary", async () => {
    // The reachable failure: copyText resolves false (a denied permission, or a write WebKit rejects).
    // The copy is a convenience — the mail draft and the logged inquiry are the delivery — so nothing stops.
    copyText.mockResolvedValueOnce(false)
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    const body = "I received the following terms for my business:\n\nTerms\n\n" + OFFER_ASK + FOOTER
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "offer_review", body, email: "", source: "offer-review" })
    expect(openMail).toHaveBeenCalledWith(mailtoHref("offers@heirloom.com", "Free offer review", body))
    expect(screen.getByTestId("oi-sent")).toBeInTheDocument()
    expect(
      screen.getByText("Your offer has been sent for review. We will reply to the email you provided.")
    ).toBeInTheDocument()
    expect(screen.getByText(SENT_NOT_COPIED)).toBeInTheDocument()
    expect(screen.queryByText(SENT_FALLBACK)).toBeNull()
    expect(screen.queryByText(/We could not prepare the message/)).toBeNull()
    expect(screen.getByTestId("oi-send")).not.toBeDisabled()
  })

  it("names the clipboard again once a later send is copied", async () => {
    copyText.mockResolvedValueOnce(false)
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    expect(screen.getByText(SENT_NOT_COPIED)).toBeInTheDocument()
    await send()
    expect(screen.getByText(SENT_FALLBACK)).toBeInTheDocument()
    expect(screen.queryByText(SENT_NOT_COPIED)).toBeNull()
  })

  it("keeps the offers@ fallback when the handoff itself throws", async () => {
    submitInquiry.mockImplementationOnce(() => {
      throw new Error("beacon unavailable")
    })
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    expect(
      screen.getByText("We could not prepare the message. Email offers@heirloom.com directly.")
    ).toBeInTheDocument()
    expect(screen.queryByTestId("oi-sent")).toBeNull()
    expect(openMail).not.toHaveBeenCalled()
  })

  it("clears the error when the visitor switches tabs", async () => {
    submitInquiry.mockImplementationOnce(() => {
      throw new Error("beacon unavailable")
    })
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    expect(screen.getByText(/We could not prepare the message/)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("oi-tab-verbal"))
    expect(screen.queryByText(/We could not prepare the message/)).toBeNull()
  })

  it("clears the sent confirmation when the visitor switches tabs", async () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    expect(screen.getByTestId("oi-sent")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("oi-tab-verbal"))
    expect(screen.queryByTestId("oi-sent")).toBeNull()
    expect(screen.getByTestId("oi-tab-verbal")).toHaveAttribute("aria-pressed", "true")
  })

  it("keeps the typed fields when switching between tabs", () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Kept" } })
    fireEvent.click(screen.getByTestId("oi-tab-verbal"))
    fireEvent.click(screen.getByTestId("oi-tab-paste"))
    expect(screen.getByLabelText("Paste the offer or buyer email")).toHaveValue("Kept")
  })

  it("is the #offer-intake anchor target that the page's Review my offer links jump to", () => {
    render(<OfferIntake />)
    const intake = screen.getByTestId("offer-intake")
    expect(intake).toHaveAttribute("id", "offer-intake")
    expect(intake).toHaveClass("anchor-target")
  })

  it("carries the honeypot hidden from people: no layout, no tab stop, out of the accessibility tree", () => {
    render(<OfferIntake initialMode="paste" />)
    const pot = screen.getByTestId("honeypot")
    expect(pot).toHaveAttribute("name", "website")
    expect(pot).toHaveAttribute("tabindex", "-1")
    expect(pot).toHaveAttribute("autocomplete", "off")
    expect(pot).toHaveAttribute("aria-hidden", "true")
    expect(pot).toHaveValue("")
    // `sr-only` is absolutely positioned, so the field takes no space in the form's flow.
    expect(pot.closest("label")).toHaveAttribute("aria-hidden", "true")
    expect(pot.closest("span")).toHaveClass("sr-only")
  })

  it("leaves the honeypot out of a visitor's record and sends it when a script fills it", async () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    const body = "I received the following terms for my business:\n\nTerms\n\n" + OFFER_ASK + FOOTER
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "offer_review", body, email: "", source: "offer-review" })
    fireEvent.change(screen.getByTestId("honeypot"), { target: { value: "http://spam.example" } })
    await send()
    expect(submitInquiry).toHaveBeenLastCalledWith({
      kind: "offer_review",
      body,
      email: "",
      source: "offer-review",
      website: "http://spam.example",
    })
  })

  it("keeps the file input off-screen but reachable through its label", () => {
    render(<OfferIntake />)
    const input = screen.getByLabelText("Upload the offer, buyer email, or letter of intent")
    expect(input).toHaveAttribute("id", "oi-file")
    expect(input).toHaveClass("sr-only")
  })

  it("announces preparing, failure, and success politely in the caption, error, and accent tones", async () => {
    // The failure the send still has: the handoff itself throwing. A refused clipboard is not one.
    submitInquiry.mockImplementationOnce(() => {
      throw new Error("beacon unavailable")
    })
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    fireEvent.click(screen.getByTestId("oi-send"))
    const preparing = screen.getByText("Preparing your message...")
    expect(preparing).toHaveAttribute("aria-live", "polite")
    expect(preparing).toHaveClass("type-caption", "text-fg-3")
    await act(async () => {
      vi.advanceTimersByTime(420)
    })
    const failure = screen.getByText("We could not prepare the message. Email offers@heirloom.com directly.")
    expect(failure).toHaveAttribute("aria-live", "polite")
    expect(failure).toHaveClass("type-caption", "text-error")
    await send()
    expect(screen.queryByText(/We could not prepare the message/)).toBeNull()
    expect(screen.getByTestId("oi-sent")).toHaveAttribute("aria-live", "polite")
    expect(
      screen.getByText("Your offer has been sent for review. We will reply to the email you provided.")
    ).toHaveClass("type-caption", "text-accent")
  })
})
