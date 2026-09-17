import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BuyerRegisterForm } from "@/components/site/buyers/BuyerRegisterForm"

const openMail = vi.fn()
const copyText = vi.fn()
const submitInquiry = vi.fn().mockResolvedValue(true)

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return { ...actual, openMail: (href: string) => openMail(href), copyText: (t: string) => copyText(t) }
})
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => submitInquiry(p) }))

function fill() {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Test Buyer" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "buyer@example.com" } })
  fireEvent.click(screen.getByLabelText(/I confirm that this information/))
}

const form = () => screen.getByTestId("buyer-register-form") as HTMLFormElement

describe("<BuyerRegisterForm />", () => {
  beforeEach(() => {
    openMail.mockReset()
    copyText.mockReset().mockResolvedValue(true)
    submitInquiry.mockClear()
  })

  it("requires the name, email, and confirmation before the form is valid", () => {
    render(<BuyerRegisterForm />)
    expect(screen.getByLabelText("Your name")).toBeRequired()
    expect(screen.getByLabelText("Email")).toBeRequired()
    expect(screen.getByLabelText(/I confirm that this information/)).toBeRequired()
    expect(screen.getByLabelText("Firm and role")).not.toBeRequired()
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
    expect(form().checkValidity()).toBe(false)
    fill()
    expect(form().checkValidity()).toBe(true)
  })

  it("does not send anything when the visitor submits with the required fields empty", async () => {
    render(<BuyerRegisterForm />)
    // requestSubmit runs the browser's constraint validation, exactly like clicking the submit button.
    await act(async () => {
      form().requestSubmit()
    })
    expect(copyText).not.toHaveBeenCalled()
    expect(openMail).not.toHaveBeenCalled()
    expect(submitInquiry).not.toHaveBeenCalled()
    expect(screen.queryByTestId("buyer-register-sent")).toBeNull()
  })

  it("rejects a malformed email address at submit time", async () => {
    render(<BuyerRegisterForm />)
    fill()
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } })
    expect(form().checkValidity()).toBe(false)
    await act(async () => {
      form().requestSubmit()
    })
    expect(copyText).not.toHaveBeenCalled()
    expect(openMail).not.toHaveBeenCalled()
  })

  it("lists the five buyer types in order and defaults to the first", () => {
    render(<BuyerRegisterForm />)
    const select = screen.getByLabelText("What kind of buyer are you?") as HTMLSelectElement
    const options = within(select).getAllByRole("option")
    expect(options.map((o) => o.textContent)).toEqual([
      "Individual buyer or searcher",
      "Independent sponsor",
      "Family office",
      "Private equity firm",
      "Strategic acquirer",
    ])
    expect(select.value).toBe("Individual buyer or searcher")
  })

  it("writes every filled field into the body in the documented order and opens the exact mailto", async () => {
    render(<BuyerRegisterForm />)
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ada Buyer" } })
    fireEvent.change(screen.getByLabelText("Firm and role"), { target: { value: "Northwind Capital, Principal" } })
    fireEvent.change(screen.getByLabelText("What kind of buyer are you?"), { target: { value: "Family office" } })
    fireEvent.change(screen.getByLabelText("Target transaction size"), { target: { value: "$2M to $8M" } })
    fireEvent.change(screen.getByLabelText("Geography"), { target: { value: "Southeast" } })
    fireEvent.change(screen.getByLabelText("Industries you pursue"), { target: { value: "HVAC and plumbing" } })
    fireEvent.change(screen.getByLabelText("Financing plan"), { target: { value: "Cash plus SBA 7(a)" } })
    fireEvent.change(screen.getByLabelText("Current evidence of funds or lender support"), {
      target: { value: "Bank letter dated March 2026" },
    })
    fireEvent.change(screen.getByLabelText("Prior acquisitions"), { target: { value: "Two, both in field services" } })
    fireEvent.change(screen.getByLabelText("Plans for employees, the company name, and locations"), {
      target: { value: "Keep every employee and the name" },
    })
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@northwind.example" } })
    fireEvent.click(screen.getByLabelText(/I confirm that this information/))
    await act(async () => {
      form().requestSubmit()
    })
    const body =
      "I would like to create a Buyer Passport.\n\n" +
      "Name: Ada Buyer\n" +
      "Firm: Northwind Capital, Principal\n" +
      "Email: ada@northwind.example\n" +
      "Acquisition focus: HVAC and plumbing\n" +
      "Target size: $2M to $8M\n" +
      "What kind of buyer are you?: Family office\n" +
      "Geography: Southeast\n" +
      "Financing plan: Cash plus SBA 7(a)\n" +
      "Current evidence of funds or lender support: Bank letter dated March 2026\n" +
      "Prior acquisitions: Two, both in field services\n" +
      "Plans for employees, the company name, and locations: Keep every employee and the name\n\n" +
      "Please send the verification steps."
    expect(copyText).toHaveBeenCalledWith(body)
    expect(submitInquiry).toHaveBeenCalledWith({
      kind: "buyer_passport",
      body,
      email: "ada@northwind.example",
      source: "buyers",
    })
    const href = openMail.mock.calls[0]![0] as string
    expect(href.startsWith("mailto:buyers@heirloom.com?subject=Buyer%20Passport%20registration&body=")).toBe(true)
    expect(new URLSearchParams(href.slice(href.indexOf("?") + 1)).get("body")).toBe(body)
  })

  it("labels a buyer without a firm as independent and omits the empty optional lines", async () => {
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    expect(copyText).toHaveBeenCalledWith(
      "I would like to create a Buyer Passport.\n\n" +
        "Name: Test Buyer\n" +
        "Firm: Independent buyer\n" +
        "Email: buyer@example.com\n" +
        "Acquisition focus: \n" +
        "Target size: \n" +
        "What kind of buyer are you?: Individual buyer or searcher\n\n" +
        "Please send the verification steps."
    )
  })

  it("disables the submit button and shows the preparing note until the copy settles", async () => {
    let resolveCopy: (v: boolean) => void = () => {}
    copyText.mockImplementation(() => new Promise<boolean>((r) => (resolveCopy = r)))
    render(<BuyerRegisterForm />)
    fill()
    const submit = screen.getByTestId("buyer-register-submit")
    expect(submit).not.toBeDisabled()
    await act(async () => {
      form().requestSubmit()
    })
    expect(submit).toBeDisabled()
    expect(screen.getByText("Preparing your registration...")).toBeInTheDocument()
    expect(openMail).not.toHaveBeenCalled()
    await act(async () => {
      form().requestSubmit()
    })
    expect(copyText).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolveCopy(true)
    })
    expect(submit).not.toBeDisabled()
    expect(screen.queryByText("Preparing your registration...")).toBeNull()
    expect(openMail).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("buyer-register-sent")).toBeInTheDocument()
  })

  it("shows the exact confirmation and fallback copy after a successful send", async () => {
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    const sent = screen.getByTestId("buyer-register-sent")
    expect(
      within(sent).getByText(
        "Your email app opened with the registration filled in. Send it to begin. The text has also been copied."
      )
    ).toBeInTheDocument()
    expect(
      within(sent).getByText(
        "If your email app did not open, paste the copied registration into a message to buyers@heirloom.com."
      )
    ).toBeInTheDocument()
  })

  it("announces each state politely, tones the error, and clears the confirmation when a retry fails", async () => {
    let resolveCopy: (v: boolean) => void = () => {}
    copyText.mockImplementation(() => new Promise<boolean>((r) => (resolveCopy = r)))
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    expect(screen.getByText("Preparing your registration...")).toHaveAttribute("aria-live", "polite")
    await act(async () => {
      resolveCopy(true)
    })
    expect(screen.getByTestId("buyer-register-sent")).toHaveAttribute("aria-live", "polite")

    // A throw drives the defensive catch; a refused clipboard resolves false (the test above).
    copyText.mockRejectedValueOnce(new Error("clipboard unavailable"))
    await act(async () => {
      form().requestSubmit()
    })
    const error = screen.getByTestId("buyer-register-error")
    expect(error).toHaveClass("text-error")
    expect(error).toHaveAttribute("aria-live", "polite")
    expect(screen.queryByTestId("buyer-register-sent")).toBeNull()
  })

  it("submits with the keyboard and gives the consent row the 44px touch target", () => {
    render(<BuyerRegisterForm />)
    const evidence = screen.getByLabelText("Current evidence of funds or lender support")
    expect(evidence.tagName).toBe("TEXTAREA")
    // The consent row is a 44px touch target with the 16px box centred on it.
    expect(screen.getByLabelText(/I confirm that this information/).closest("label")).toHaveClass("min-h-11")
    expect(screen.getByTestId("buyer-register-submit")).toHaveAttribute("type", "submit")
  })

  it("registers anyway when the browser refuses the clipboard, naming the draft as what carries the text", async () => {
    // The reachable failure: copyText resolves false and never rejects. The copy is a convenience — the
    // mail draft and the logged inquiry are the delivery — so the registration goes either way.
    copyText.mockResolvedValueOnce(false)
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    expect(submitInquiry).toHaveBeenCalledTimes(1)
    expect(openMail).toHaveBeenCalledTimes(1)
    const sent = screen.getByTestId("buyer-register-sent")
    expect(
      within(sent).getByText("Your email app opened with the registration filled in. Send it to begin.")
    ).toBeInTheDocument()
    expect(
      within(sent).getByText("We could not copy the registration. The draft in your email app carries it.")
    ).toBeInTheDocument()
    expect(screen.queryByTestId("buyer-register-error")).toBeNull()
    expect(screen.getByTestId("buyer-register-submit")).not.toBeDisabled()

    // A later submission whose copy lands names the clipboard again.
    await act(async () => {
      form().requestSubmit()
    })
    expect(
      within(screen.getByTestId("buyer-register-sent")).getByText(
        "Your email app opened with the registration filled in. Send it to begin. The text has also been copied."
      )
    ).toBeInTheDocument()
    expect(screen.queryByText("We could not copy the registration. The draft in your email app carries it.")).toBeNull()
    expect(openMail).toHaveBeenCalledTimes(2)
  })

  it("carries the honeypot hidden from people and sends it only when a script fills it", async () => {
    render(<BuyerRegisterForm />)
    const pot = screen.getByTestId("honeypot")
    expect(pot).toHaveAttribute("name", "website")
    expect(pot).toHaveAttribute("tabindex", "-1")
    expect(pot).toHaveAttribute("autocomplete", "off")
    expect(pot).toHaveAttribute("aria-hidden", "true")
    expect(pot).not.toBeRequired()
    expect(pot.closest("label")).toHaveAttribute("aria-hidden", "true")
    // `sr-only` is absolutely positioned, so the field takes no space in the form's flow.
    expect(pot.closest("span")).toHaveClass("sr-only")
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    expect(submitInquiry).toHaveBeenLastCalledWith({
      kind: "buyer_passport",
      body: expect.stringContaining("Name: Test Buyer"),
      email: "buyer@example.com",
      source: "buyers",
    })
    fireEvent.change(pot, { target: { value: "http://spam.example" } })
    await act(async () => {
      form().requestSubmit()
    })
    expect(submitInquiry).toHaveBeenLastCalledWith({
      kind: "buyer_passport",
      body: expect.stringContaining("Name: Test Buyer"),
      email: "buyer@example.com",
      source: "buyers",
      website: "http://spam.example",
    })
  })
})
