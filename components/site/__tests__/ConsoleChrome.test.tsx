import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentPropsWithoutRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { ConsoleChip, ConsolePill, ConsoleTicks } from "@/components/site/exitiq/ConsoleChrome"

// Tag every anchor produced by Next's Link so tests can tell it apart from a plain <a>.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a"> & { href: string }) => (
    <a href={href} data-next-link="true" {...rest}>
      {children}
    </a>
  ),
}))

const PILL_BASE =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-[box-shadow,border-color,color] duration-200 ease-e1 disabled:cursor-not-allowed disabled:opacity-60"
const PILL_CTA = "bg-cta font-semibold text-ground hover:text-ground hover:shadow-[0_10px_26px_rgba(4,15,10,.35)]"
const PILL_SM = "h-[38px] px-4 text-[13.5px]"
const PILL_MD = "h-[42px] px-5 text-[14px]"

const CHIP_BASE =
  "inline-flex items-center rounded-full border font-medium transition-all duration-200 ease-e2 disabled:cursor-default"
const CHIP_MD = "px-[15px] py-[10px] text-[13.5px]"
const CHIP_SELECTED = "border-filament/55 bg-filament/12 text-filament"
const CHIP_IDLE = "border-dfull/14 bg-dfull/[5.5%] text-dfull/86 hover:border-dfull/30"

const TICK_BASE = "ease-e1 h-[2px] w-4 rounded-full transition-[background,box-shadow] duration-500"
const TICK_FILLED = "bg-filament shadow-[0_0_7px_rgba(76,226,126,.55)]"
const TICK_CURRENT = "bg-filament/45"
const TICK_DIM = "bg-dfull/14"

const split = (s: string) => s.split(" ")

describe("<ConsolePill />", () => {
  it("renders an internal href through Next Link with the default cta/md classes", () => {
    render(<ConsolePill href="/score">Run exitIQ</ConsolePill>)
    const link = screen.getByRole("link", { name: "Run exitIQ" })
    expect(link).toHaveAttribute("data-next-link", "true")
    expect(link).toHaveAttribute("href", "/score")
    expect(link).toHaveClass(...split(PILL_BASE), ...split(PILL_CTA), ...split(PILL_MD))
    expect(link).not.toHaveClass("border", "font-mono", "text-d2")
  })

  it("renders mailto, protocol-relative and absolute hrefs as plain anchors and passes target and rel through", () => {
    render(
      <>
        <ConsolePill href="mailto:hello@heirloom.com">Mail</ConsolePill>
        <ConsolePill href="//evil.example">Proto</ConsolePill>
        <ConsolePill href="https://heirloom.cal.com/suyash" target="_blank" rel="noopener">
          Book
        </ConsolePill>
      </>
    )
    const mail = screen.getByRole("link", { name: "Mail" })
    const proto = screen.getByRole("link", { name: "Proto" })
    const book = screen.getByRole("link", { name: "Book" })
    for (const a of [mail, proto, book]) expect(a).not.toHaveAttribute("data-next-link")
    expect(mail).toHaveAttribute("href", "mailto:hello@heirloom.com")
    expect(proto).toHaveAttribute("href", "//evil.example")
    expect(book).toHaveAttribute("href", "https://heirloom.cal.com/suyash")
    expect(book).toHaveAttribute("target", "_blank")
    expect(book).toHaveAttribute("rel", "noopener")
    expect(book).toHaveClass(...split(PILL_CTA), ...split(PILL_MD))
  })

  it("renders a type=button without an href and fires its onClick", () => {
    const onClick = vi.fn()
    render(<ConsolePill onClick={onClick}>Save</ConsolePill>)
    const button = screen.getByRole("button", { name: "Save" })
    expect(button.tagName).toBe("BUTTON")
    expect(button).toHaveAttribute("type", "button")
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("respects an explicit button type and a disabled state", () => {
    render(
      <ConsolePill type="submit" disabled>
        Send
      </ConsolePill>
    )
    const button = screen.getByRole("button", { name: "Send" })
    expect(button).toHaveAttribute("type", "submit")
    expect(button).toBeDisabled()
  })

  it("sizes the cta pill at 38, 42 and 48px, each with its own padding and text rung", () => {
    render(
      <>
        <ConsolePill variant="cta" size="sm">
          Small
        </ConsolePill>
        <ConsolePill variant="cta" size="md">
          Medium
        </ConsolePill>
        <ConsolePill variant="cta" size="xl">
          Large
        </ConsolePill>
      </>
    )
    const small = screen.getByRole("button", { name: "Small" })
    const medium = screen.getByRole("button", { name: "Medium" })
    const large = screen.getByRole("button", { name: "Large" })
    expect(small).toHaveClass("h-[38px]", "px-4", "text-[13.5px]")
    expect(small).not.toHaveClass("h-[42px]", "h-12")
    expect(medium).toHaveClass("h-[42px]", "px-5", "text-[14px]")
    expect(medium).not.toHaveClass("h-[38px]", "h-12")
    expect(large).toHaveClass("h-12", "px-6", "text-[15px]")
    expect(large).not.toHaveClass("h-[38px]", "h-[42px]")
  })

  it("renders the dark pill as a mono hairline outline whose text size follows the size, not the variant", () => {
    render(
      <>
        <ConsolePill variant="pill-dark" size="sm">
          Small
        </ConsolePill>
        <ConsolePill variant="pill-dark">Medium</ConsolePill>
      </>
    )
    const small = screen.getByRole("button", { name: "Small" })
    expect(small).toHaveClass(
      "hover-green-dark",
      "border",
      "border-dhair",
      "font-mono",
      "text-d2",
      "hover:border-filament/50"
    )
    expect(small).toHaveClass(...split(PILL_SM))
    // twMerge keeps the last font size: the size's 13.5px replaces the variant's 11px.
    expect(small).not.toHaveClass("text-[11px]")
    expect(small).not.toHaveClass("bg-cta", "font-semibold", "text-ground")
    const medium = screen.getByRole("button", { name: "Medium" })
    expect(medium).toHaveClass(...split(PILL_MD))
    expect(medium).not.toHaveClass("text-[11px]")
  })

  it("merges className through twMerge so a later utility replaces the conflicting default", () => {
    render(
      <ConsolePill variant="pill-dark" size="sm" className="text-d1 h-10 px-8 text-[11.5px]">
        Plan
      </ConsolePill>
    )
    const button = screen.getByRole("button", { name: "Plan" })
    expect(button).toHaveClass("text-d1", "h-10", "px-8", "text-[11.5px]")
    expect(button).not.toHaveClass("text-d2", "h-[38px]", "px-4", "text-[13.5px]", "text-[11px]")
    expect(button).toHaveClass("font-mono", "border-dhair", "rounded-full")
  })

  it("merges className on the link forms too", () => {
    render(
      <>
        <ConsolePill href="/fees" className="px-8">
          Internal
        </ConsolePill>
        <ConsolePill href="https://example.com" className="px-8">
          External
        </ConsolePill>
      </>
    )
    for (const name of ["Internal", "External"]) {
      const link = screen.getByRole("link", { name })
      expect(link).toHaveClass("px-8")
      expect(link).not.toHaveClass("px-5")
    }
  })
})

describe("<ConsoleChip />", () => {
  it("renders an unselected medium chip by default with aria-pressed=false", () => {
    render(<ConsoleChip selected={false}>Grown</ConsoleChip>)
    const chip = screen.getByRole("button", { name: "Grown" })
    expect(chip).toHaveAttribute("type", "button")
    expect(chip).toHaveAttribute("aria-pressed", "false")
    expect(chip.className).toBe(`${CHIP_BASE} ${CHIP_MD} ${CHIP_IDLE}`)
  })

  it("lights the selected chip in filament and marks it aria-pressed=true", () => {
    render(<ConsoleChip selected>Declined</ConsoleChip>)
    const chip = screen.getByRole("button", { name: "Declined" })
    expect(chip).toHaveAttribute("aria-pressed", "true")
    expect(chip.className).toBe(`${CHIP_BASE} ${CHIP_MD} ${CHIP_SELECTED}`)
    expect(chip).not.toHaveClass(...split(CHIP_IDLE))
  })

  it("uses the larger padding and 14px text at size lg", () => {
    render(
      <ConsoleChip selected={false} size="lg">
        Under $1M
      </ConsoleChip>
    )
    const chip = screen.getByRole("button", { name: "Under $1M" })
    expect(chip).toHaveClass("px-4", "py-[11px]", "text-[14px]")
    expect(chip).not.toHaveClass("px-[15px]", "py-[10px]", "text-[13.5px]")
  })

  it("fires onClick when enabled and stays inert when disabled", () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <ConsoleChip selected={false} onClick={onClick}>
        Grown
      </ConsoleChip>
    )
    fireEvent.click(screen.getByRole("button", { name: "Grown" }))
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(
      <ConsoleChip selected={false} onClick={onClick} disabled>
        Grown
      </ConsoleChip>
    )
    const chip = screen.getByRole("button", { name: "Grown" })
    expect(chip).toBeDisabled()
    fireEvent.click(chip)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("respects an explicit type and merges className through twMerge", () => {
    render(
      <ConsoleChip selected={false} type="submit" className="px-6">
        Flat
      </ConsoleChip>
    )
    const chip = screen.getByRole("button", { name: "Flat" })
    expect(chip).toHaveAttribute("type", "submit")
    expect(chip).toHaveClass("px-6", "py-[10px]")
    expect(chip).not.toHaveClass("px-[15px]")
  })
})

describe("<ConsoleTicks />", () => {
  const ticks = () => Array.from(screen.getByRole("progressbar").children) as HTMLElement[]

  it("exposes a labelled progressbar with min 0, max total and the filled count as its value", () => {
    render(<ConsoleTicks total={7} filled={3} current={3} label="Your progress" />)
    const bar = screen.getByRole("progressbar", { name: "Your progress" })
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "7")
    expect(bar).toHaveAttribute("aria-valuenow", "3")
    expect(bar).toHaveClass("flex", "gap-[5px]")
    expect(bar.children).toHaveLength(7)
  })

  it("lights filled ticks bright, the current tick half, and the rest dim", () => {
    render(<ConsoleTicks total={5} filled={2} current={2} />)
    const all = ticks()
    expect(all.map((t) => t.className)).toEqual([
      `${TICK_BASE} ${TICK_FILLED}`,
      `${TICK_BASE} ${TICK_FILLED}`,
      `${TICK_BASE} ${TICK_CURRENT}`,
      `${TICK_BASE} ${TICK_DIM}`,
      `${TICK_BASE} ${TICK_DIM}`,
    ])
  })

  it("has no half-lit tick without a current index and no aria-label without a label", () => {
    render(<ConsoleTicks total={4} filled={1} />)
    const bar = screen.getByRole("progressbar")
    expect(bar).not.toHaveAttribute("aria-label")
    expect(ticks().map((t) => t.className)).toEqual([
      `${TICK_BASE} ${TICK_FILLED}`,
      `${TICK_BASE} ${TICK_DIM}`,
      `${TICK_BASE} ${TICK_DIM}`,
      `${TICK_BASE} ${TICK_DIM}`,
    ])
  })

  it("lets a filled tick win over the current index when they coincide", () => {
    render(<ConsoleTicks total={3} filled={2} current={1} />)
    expect(ticks().map((t) => t.className)).toEqual([
      `${TICK_BASE} ${TICK_FILLED}`,
      `${TICK_BASE} ${TICK_FILLED}`,
      `${TICK_BASE} ${TICK_DIM}`,
    ])
  })

  it("fills every tick once filled reaches total, and renders no ticks for a zero total", () => {
    const { rerender } = render(<ConsoleTicks total={3} filled={3} />)
    expect(ticks().map((t) => t.className)).toEqual(Array<string>(3).fill(`${TICK_BASE} ${TICK_FILLED}`))
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3")
    rerender(<ConsoleTicks total={0} filled={0} />)
    expect(screen.getByRole("progressbar").children).toHaveLength(0)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "0")
  })
})
