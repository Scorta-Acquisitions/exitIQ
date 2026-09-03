import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FeeCalculator } from "@/components/site/fees/FeeCalculator"
import { computeFees, DEFAULT_FEE_INPUTS, type FeeInputs, RATE_LARGE, RATE_PENDING } from "@/lib/site/fees/calc"

/** Value shown beside a row label in the "What Heirloom is paid" column. */
function rowValue(label: string): string {
  return screen.getByText(label).nextElementSibling?.textContent ?? ""
}

function expectRowsToMatch(inputs: FeeInputs) {
  const fees = computeFees(inputs)
  expect(rowValue("Engagement commitment")).toBe(fees.upfront)
  expect(rowValue("Success fee rate")).toBe(fees.rateLabel)
  expect(rowValue("Credit at closing")).toBe(fees.credit)
  expect(rowValue("Still due at closing")).toBe(fees.atClose)
  expect(screen.getByTestId("fee-total")).toHaveTextContent(fees.total)
  expect(screen.getByTestId("fee-traditional")).toHaveTextContent(fees.traditional)
  expect(screen.getByTestId("fee-difference")).toHaveTextContent(fees.difference)
}

describe("<FeeCalculator />", () => {
  it("shows the default full-sale case", () => {
    render(<FeeCalculator />)
    expect(screen.getByTestId("fee-price")).toHaveTextContent("$2,400,000")
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$120,000")
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$240,000")
    expect(screen.getByTestId("fee-difference")).toHaveTextContent("$120,000")
    expect(screen.getByTestId("fee-path-market")).toHaveAttribute("aria-pressed", "true")
  })

  it("switches to the existing-buyer path", () => {
    render(<FeeCalculator />)
    fireEvent.click(screen.getByTestId("fee-path-execution"))
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$60,000")
    expect(screen.getByText("2.5%")).toBeInTheDocument()
    expect(screen.getAllByText("$0")).toHaveLength(2)
  })

  it("moves the price slider and asks for a quoted rate above $5M", () => {
    render(<FeeCalculator />)
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "7000000" } })
    expect(screen.getByTestId("fee-price")).toHaveTextContent("$7,000,000")
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$350,000")
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent(/Enter the quoted rate/)
  })

  it("accepts a quoted rate and resets", () => {
    render(<FeeCalculator />)
    fireEvent.click(screen.getByRole("button", { name: "Enter quoted rate" }))
    const rate = screen.getByLabelText("Traditional comparison rate")
    fireEvent.change(rate, { target: { value: "8" } })
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$192,000")
    expect(screen.getByTestId("fee-difference")).toHaveTextContent("$72,000")
    fireEvent.change(rate, { target: { value: "99" } })
    expect(screen.getByTestId("fee-difference")).toHaveTextContent(/cannot calculate/)
    fireEvent.click(screen.getByRole("button", { name: "Reset calculator" }))
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$240,000")
    expect(screen.queryByLabelText("Traditional comparison rate")).toBeNull()
  })

  it("bounds the price slider to $500K–$10M in $50K steps and labels the ends", () => {
    render(<FeeCalculator />)
    const slider = screen.getByLabelText("Expected transaction value") as HTMLInputElement
    expect(slider.type).toBe("range")
    expect(slider).toHaveAttribute("min", "500000")
    expect(slider).toHaveAttribute("max", "10000000")
    expect(slider).toHaveAttribute("step", "50000")
    expect(slider.value).toBe("2400000")
    expect(screen.getByText("$500K")).toBeInTheDocument()
    expect(screen.getByText("$10M")).toBeInTheDocument()
  })

  it("shows the fee at the slider minimum", () => {
    render(<FeeCalculator />)
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "500000" } })
    expect(screen.getByTestId("fee-price")).toHaveTextContent("$500,000")
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$25,000")
    expect(rowValue("Still due at closing")).toBe("$20,000")
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$50,000")
    expect(screen.getByTestId("fee-difference")).toHaveTextContent("$25,000")
    expectRowsToMatch({ ...DEFAULT_FEE_INPUTS, price: 500_000 })
  })

  it("shows the fee at the slider maximum and withholds the comparison until a rate is quoted", () => {
    render(<FeeCalculator />)
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "10000000" } })
    expect(screen.getByTestId("fee-price")).toHaveTextContent("$10,000,000")
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$500,000")
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent(RATE_LARGE)
    expect(screen.getByTestId("fee-difference")).toHaveTextContent(RATE_PENDING)
    expectRowsToMatch({ ...DEFAULT_FEE_INPUTS, price: 10_000_000 })
  })

  it("keeps the 10% illustration through exactly $5M", () => {
    render(<FeeCalculator />)
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "5000000" } })
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$500,000")
    expect(screen.getByTestId("fee-difference")).toHaveTextContent("$250,000")
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "5050000" } })
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent(RATE_LARGE)
  })

  it("constrains the quoted-rate input to 1–15 in half-point steps", () => {
    render(<FeeCalculator />)
    fireEvent.click(screen.getByRole("button", { name: "Enter quoted rate" }))
    const rate = screen.getByLabelText("Traditional comparison rate") as HTMLInputElement
    expect(rate.type).toBe("number")
    expect(rate).toHaveAttribute("min", "1")
    expect(rate).toHaveAttribute("max", "15")
    expect(rate).toHaveAttribute("step", "0.5")
    expect(rate).toHaveAttribute("placeholder", "Enter quoted rate")
    expect(rate.value).toBe("")
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent(RATE_PENDING)
    expect(screen.getByTestId("fee-difference")).toHaveTextContent(RATE_PENDING)
  })

  it("re-selects the 10% illustration, hides the rate input, and restores the illustrated comparison", () => {
    render(<FeeCalculator />)
    const illustration = screen.getByRole("button", { name: "Use 10% illustration" })
    const quoted = screen.getByRole("button", { name: "Enter quoted rate" })
    expect(illustration).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(quoted)
    expect(quoted).toHaveAttribute("aria-pressed", "true")
    expect(illustration).toHaveAttribute("aria-pressed", "false")
    fireEvent.change(screen.getByLabelText("Traditional comparison rate"), { target: { value: "8" } })
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$192,000")
    fireEvent.click(illustration)
    expect(illustration).toHaveAttribute("aria-pressed", "true")
    expect(quoted).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByLabelText("Traditional comparison rate")).toBeNull()
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$240,000")
    expect(screen.getByTestId("fee-difference")).toHaveTextContent("$120,000")
  })

  it("remembers the typed rate when the visitor returns to the quoted mode", () => {
    render(<FeeCalculator />)
    fireEvent.click(screen.getByRole("button", { name: "Enter quoted rate" }))
    fireEvent.change(screen.getByLabelText("Traditional comparison rate"), { target: { value: "8" } })
    fireEvent.click(screen.getByRole("button", { name: "Use 10% illustration" }))
    fireEvent.click(screen.getByRole("button", { name: "Enter quoted rate" }))
    expect(screen.getByLabelText("Traditional comparison rate")).toHaveValue(8)
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$192,000")
  })

  it("shows the four fee rows for the default full sale", () => {
    render(<FeeCalculator />)
    expect(rowValue("Engagement commitment")).toBe("$5,000")
    expect(rowValue("Success fee rate")).toBe("5%")
    expect(rowValue("Credit at closing")).toBe("$5,000")
    expect(rowValue("Still due at closing")).toBe("$115,000")
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$120,000")
    expectRowsToMatch(DEFAULT_FEE_INPUTS)
  })

  it("shows the four fee rows for an existing buyer at $4M with no commitment or credit", () => {
    render(<FeeCalculator />)
    fireEvent.click(screen.getByTestId("fee-path-execution"))
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "4000000" } })
    expect(rowValue("Engagement commitment")).toBe("$0")
    expect(rowValue("Success fee rate")).toBe("2.5%")
    expect(rowValue("Credit at closing")).toBe("$0")
    expect(rowValue("Still due at closing")).toBe("$100,000")
    expect(screen.getByTestId("fee-total")).toHaveTextContent("$100,000")
    expect(screen.getByTestId("fee-traditional")).toHaveTextContent("$400,000")
    expect(screen.getByTestId("fee-difference")).toHaveTextContent("$300,000")
    expectRowsToMatch({ ...DEFAULT_FEE_INPUTS, path: "execution", price: 4_000_000 })
  })

  it("marks only the chosen path card as selected", () => {
    render(<FeeCalculator />)
    expect(screen.getByText("Full private sale selected")).toBeInTheDocument()
    expect(screen.queryByText("Existing buyer selected")).toBeNull()
    fireEvent.click(screen.getByTestId("fee-path-execution"))
    expect(screen.getByTestId("fee-path-execution")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("fee-path-market")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("Existing buyer selected")).toBeInTheDocument()
    expect(screen.queryByText("Full private sale selected")).toBeNull()
  })

  it("resets the path, price, and rate mode together", () => {
    render(<FeeCalculator />)
    fireEvent.click(screen.getByTestId("fee-path-execution"))
    fireEvent.change(screen.getByLabelText("Expected transaction value"), { target: { value: "9000000" } })
    fireEvent.click(screen.getByRole("button", { name: "Enter quoted rate" }))
    fireEvent.click(screen.getByRole("button", { name: "Reset calculator" }))
    expect(screen.getByTestId("fee-path-market")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("fee-price")).toHaveTextContent("$2,400,000")
    expect((screen.getByLabelText("Expected transaction value") as HTMLInputElement).value).toBe("2400000")
    expect(screen.getByRole("button", { name: "Use 10% illustration" })).toHaveAttribute("aria-pressed", "true")
    expectRowsToMatch(DEFAULT_FEE_INPUTS)
  })
})
