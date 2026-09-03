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

  it("sends a pasted offer: copies, records, and opens the mail client", async () => {
    render(<OfferIntake />)
    fireEvent.click(screen.getByTestId("oi-tab-paste"))
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "LOI: $4.65M" } })
    fireEvent.click(screen.getByTestId("oi-send"))
    expect(screen.getByText("Preparing your message...")).toBeInTheDocument()
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining("LOI: $4.65M"))
    expect(submitInquiry).toHaveBeenCalledWith(expect.objectContaining({ kind: "offer_review" }))
    expect(openMail).toHaveBeenCalledWith(expect.stringMatching(/^mailto:offers@heirloom\.com/))
    expect(screen.getByTestId("oi-sent")).toBeInTheDocument()
  })

  it("includes verbal fields and the reply email in the body", async () => {
    render(<OfferIntake initialMode="verbal" />)
    fireEvent.change(screen.getByLabelText("Price or range discussed"), { target: { value: "$4.5M" } })
    fireEvent.change(screen.getByLabelText("Email for your review"), { target: { value: "me@x.com" } })
    fireEvent.click(screen.getByTestId("oi-send"))
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    const body = copyText.mock.calls[0]?.[0] as string
    expect(body).toContain("Headline price: $4.5M")
    expect(body).toContain("Email for your review: me@x.com")
    expect(submitInquiry).toHaveBeenCalledWith(expect.objectContaining({ email: "me@x.com" }))
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

  it("forward mode: links the attach button and the inline address to offers@heirloom.com and has no send button", () => {
    render(<OfferIntake />)
    expect(screen.getByRole("link", { name: "Open an email to attach the offer" })).toHaveAttribute(
      "href",
      OFFER_FORWARD_MAILTO
    )
    expect(screen.getByRole("link", { name: "Open an email to attach the offer" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:offers@heirloom\.com\?subject=Free%20Offer%20Review&body=/)
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

  it("does not send before the preparation delay has elapsed", () => {
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    fireEvent.click(screen.getByTestId("oi-send"))
    act(() => {
      vi.advanceTimersByTime(419)
    })
    expect(copyText).not.toHaveBeenCalled()
    expect(openMail).not.toHaveBeenCalled()
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
    expect(openMail).toHaveBeenCalledWith(mailtoHref("offers@heirloom.com", "Free Offer Review", body))
    expect(submitInquiry).toHaveBeenCalledWith({ kind: "offer_review", body, email: "", source: "offer-review" })
    expect(
      screen.getByText("Your offer has been sent for review. We will reply to the email you provided.")
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "If your email app did not open, the summary has been copied. Paste it into a message to offers@heirloom.com."
      )
    ).toBeInTheDocument()
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
    expect(body).not.toContain("Paid later")
    expect(body).not.toContain("Other concerns")
    expect(body).not.toContain("Email for your review")
    expect(openMail).toHaveBeenCalledWith(mailtoHref("offers@heirloom.com", "Free Offer Review", body))
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

  it("shows the offers@ fallback and sends nothing when the message cannot be copied", async () => {
    copyText.mockRejectedValueOnce(new Error("clipboard unavailable"))
    render(<OfferIntake initialMode="paste" />)
    fireEvent.change(screen.getByLabelText("Paste the offer or buyer email"), { target: { value: "Terms" } })
    await send()
    expect(
      screen.getByText("We could not prepare the message. Email offers@heirloom.com directly and we will help.")
    ).toBeInTheDocument()
    expect(openMail).not.toHaveBeenCalled()
    expect(submitInquiry).not.toHaveBeenCalled()
    expect(screen.queryByTestId("oi-sent")).toBeNull()
    expect(screen.getByTestId("oi-send")).not.toBeDisabled()
  })

  it("clears the error when the visitor switches tabs", async () => {
    copyText.mockRejectedValueOnce(new Error("clipboard unavailable"))
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
})
