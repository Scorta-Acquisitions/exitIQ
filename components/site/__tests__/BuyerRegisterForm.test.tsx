import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BuyerRegisterForm } from "@/components/site/buyers/BuyerRegisterForm"
import { BUYER_TYPES } from "@/lib/site/buyers/passport"
import { mailtoHref } from "@/lib/site/mailto"

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

  it("copies, records, opens the mail client, and confirms", async () => {
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      fireEvent.submit(screen.getByTestId("buyer-register-form"))
    })
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining("Test Buyer"))
    expect(submitInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "buyer_passport", email: "buyer@example.com" })
    )
    expect(openMail).toHaveBeenCalledWith(expect.stringContaining("mailto:buyers@heirloom.com"))
    expect(screen.getByTestId("buyer-register-sent")).toBeInTheDocument()
    expect(screen.queryByTestId("buyer-register-error")).toBeNull()
  })

  it("shows an error with the fallback address when the message cannot be prepared", async () => {
    copyText.mockRejectedValue(new Error("clipboard unavailable"))
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      fireEvent.submit(screen.getByTestId("buyer-register-form"))
    })
    expect(screen.getByTestId("buyer-register-error")).toHaveTextContent("buyers@heirloom.com")
    expect(screen.queryByTestId("buyer-register-sent")).toBeNull()
    expect(openMail).not.toHaveBeenCalled()
    expect(screen.getByTestId("buyer-register-submit")).not.toBeDisabled()
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

  it("sends once the required fields are filled and submitted through the browser", async () => {
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(openMail).toHaveBeenCalledTimes(1)
  })

  it("lists the five buyer types in order and defaults to the first", () => {
    render(<BuyerRegisterForm />)
    const select = screen.getByLabelText("What kind of buyer are you?") as HTMLSelectElement
    const options = within(select).getAllByRole("option")
    expect(options.map((o) => o.textContent)).toEqual(BUYER_TYPES)
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
    expect(openMail).toHaveBeenCalledWith(mailtoHref("buyers@heirloom.com", "Buyer Passport registration", body, 1600))
    expect(openMail.mock.calls[0]?.[0]).toMatch(
      /^mailto:buyers@heirloom\.com\?subject=Buyer%20Passport%20registration&body=/
    )
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

  it("shows the exact error copy and clears it on the next successful attempt", async () => {
    copyText.mockRejectedValueOnce(new Error("clipboard unavailable"))
    render(<BuyerRegisterForm />)
    fill()
    await act(async () => {
      form().requestSubmit()
    })
    expect(screen.getByTestId("buyer-register-error")).toHaveTextContent(
      "We could not prepare the registration. Email buyers@heirloom.com directly and we will help."
    )
    await act(async () => {
      form().requestSubmit()
    })
    expect(screen.queryByTestId("buyer-register-error")).toBeNull()
    expect(screen.getByTestId("buyer-register-sent")).toBeInTheDocument()
    expect(openMail).toHaveBeenCalledTimes(1)
  })
})
