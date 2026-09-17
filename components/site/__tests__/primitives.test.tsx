import { act, fireEvent, render, screen } from "@testing-library/react"
import { type ComponentPropsWithoutRef, createRef, useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { Button } from "@/components/site/ui/Button"
import { Chip } from "@/components/site/ui/Chip"
import { Dialog } from "@/components/site/ui/Dialog"
import { Disclosure } from "@/components/site/ui/Disclosure"
import {
  Card,
  Container,
  Eyebrow,
  KeyValueRow,
  ProgressTicks,
  Tile,
  VisuallyHidden,
} from "@/components/site/ui/primitives"
import { TextButton } from "@/components/site/ui/TextButton"
import { TextLink } from "@/components/site/ui/TextLink"
import { renderWithSite } from "./test-utils"

// Tag every anchor produced by Next's Link so tests can tell it apart from a plain <a>.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a"> & { href: string }) => (
    <a href={href} data-next-link="true" {...rest}>
      {children}
    </a>
  ),
}))

describe("<Container />", () => {
  it("centers the 980px content lock by default and keeps the base classes when merging", () => {
    render(<Container className="relative">x</Container>)
    const el = screen.getByText("x")
    expect(el).toHaveClass("mx-auto", "w-full", "max-w-[980px]", "relative")
  })

  it("offers the 692px reading column", () => {
    render(<Container size="text">t</Container>)
    expect(screen.getByText("t")).toHaveClass("max-w-[692px]")
    expect(screen.getByText("t")).not.toHaveClass("max-w-[980px]")
  })
})

describe("<Tile />", () => {
  it("is a light, padded, full-bleed section by default with no radius, border, or shadow", () => {
    render(<Tile data-testid="t">x</Tile>)
    const tile = screen.getByTestId("t")
    expect(tile.tagName).toBe("SECTION")
    expect(tile).toHaveClass("on-light", "bg-canvas", "tile", "px-6", "relative")
    expect(tile).toHaveAttribute("data-tone", "light")
    expect(tile.className).not.toMatch(/rounded|border|shadow/)
  })

  it.each([
    ["parchment", ["on-light", "bg-canvas-parchment"]],
    ["dark", ["on-dark", "bg-tile-1"]],
    ["dark-3", ["on-dark", "bg-tile-3"]],
  ] as const)("paints the %s tone and switches the surface context", (tone, classes) => {
    render(
      <Tile tone={tone} data-testid="t">
        x
      </Tile>
    )
    expect(screen.getByTestId("t")).toHaveClass(...classes)
    expect(screen.getByTestId("t")).toHaveAttribute("data-tone", tone)
  })

  it("forwards a ref so a scroll scene can measure its own root", () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tile as="div" padded={false} ref={ref} data-testid="t">
        x
      </Tile>
    )
    expect(ref.current).toBe(screen.getByTestId("t"))
  })

  it("drops the padding for scenes that manage their own height and can render as a div", () => {
    render(
      <Tile tone="dark" padded={false} as="div" data-testid="t" className="h-[200vh]">
        x
      </Tile>
    )
    const tile = screen.getByTestId("t")
    expect(tile.tagName).toBe("DIV")
    expect(tile).not.toHaveClass("tile")
    expect(tile).not.toHaveClass("px-6")
    expect(tile).toHaveClass("h-[200vh]", "on-dark")
  })
})

describe("<Card />", () => {
  it("is the surface colour with a hairline, 18px radius, and 24px padding", () => {
    render(<Card data-testid="c">x</Card>)
    const card = screen.getByTestId("c")
    expect(card).toHaveClass("bg-surface", "border", "border-line", "rounded-lg", "p-6")
    expect(card.className).not.toMatch(/shadow/)
  })

  it("offers a compact 16px padding for nested callouts", () => {
    render(
      <Card padded="compact" data-testid="c">
        x
      </Card>
    )
    expect(screen.getByTestId("c")).toHaveClass("p-4")
    expect(screen.getByTestId("c")).not.toHaveClass("p-6")
  })

  it("can drop its padding for cards with their own header rows and render as an article", () => {
    render(
      <Card padded={false} as="article" data-testid="c" className="overflow-hidden">
        x
      </Card>
    )
    const card = screen.getByTestId("c")
    expect(card.tagName).toBe("ARTICLE")
    expect(card).not.toHaveClass("p-6")
    expect(card).toHaveClass("overflow-hidden", "rounded-lg")
  })
})

describe("<Eyebrow />", () => {
  it("renders the 14px strong caption in the muted ink plus any extra class", () => {
    render(<Eyebrow className="mb-4">Label</Eyebrow>)
    expect(screen.getByText("Label")).toHaveClass("type-caption-strong", "text-fg-3", "mb-4")
    expect(screen.getByText("Label").className).not.toMatch(/uppercase|font-mono/)
  })

  it("renders as a block span inside flex rows and buttons, and in the accent when asked", () => {
    render(
      <>
        <Eyebrow as="span">Inline</Eyebrow>
        <Eyebrow tone="accent">Accent</Eyebrow>
      </>
    )
    const inline = screen.getByText("Inline")
    expect(inline.tagName).toBe("SPAN")
    expect(inline).toHaveClass("block", "type-caption-strong", "text-fg-3")
    const accent = screen.getByText("Accent")
    expect(accent.tagName).toBe("DIV")
    expect(accent).toHaveClass("text-accent")
    expect(accent).not.toHaveClass("text-fg-3")
  })
})

describe("<VisuallyHidden />", () => {
  it("keeps the text in the DOM with the sr-only class", () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>)
    expect(screen.getByText("Screen reader text")).toHaveClass("sr-only")
  })
})

describe("<ProgressTicks />", () => {
  const FILLED = "bg-accent"
  const CURRENT = "bg-accent/45"
  const DIM = "bg-fg/15"

  it("exposes a progressbar with min, max, now, and label", () => {
    render(<ProgressTicks total={5} filled={2} current={2} label="Briefing progress" />)
    const bar = screen.getByRole("progressbar", { name: "Briefing progress" })
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "5")
    expect(bar).toHaveAttribute("aria-valuenow", "2")
  })

  it("renders one tick per unit of total", () => {
    render(<ProgressTicks total={7} filled={0} />)
    expect(screen.getByRole("progressbar").children).toHaveLength(7)
  })

  it("lights the filled ticks, half-lights the current one, and dims the rest without glows", () => {
    render(<ProgressTicks total={5} filled={2} current={2} />)
    const ticks = Array.from(screen.getByRole("progressbar").children)
    expect(ticks[0]).toHaveClass(FILLED)
    expect(ticks[1]).toHaveClass(FILLED)
    expect(ticks[2]).toHaveClass(CURRENT)
    expect(ticks[2]).not.toHaveClass(DIM)
    expect(ticks[3]).toHaveClass(DIM)
    expect(ticks[4]).toHaveClass(DIM)
    for (const tick of ticks) expect(tick.className).not.toMatch(/shadow/)
  })

  it("treats a current index inside the filled range as filled", () => {
    render(<ProgressTicks total={3} filled={2} current={0} />)
    const ticks = Array.from(screen.getByRole("progressbar").children)
    expect(ticks[0]).toHaveClass(FILLED)
    expect(ticks[0]).not.toHaveClass(CURRENT)
  })

  it("dims every tick when nothing is filled and no current step is given", () => {
    render(<ProgressTicks total={3} filled={0} />)
    for (const tick of Array.from(screen.getByRole("progressbar").children)) {
      expect(tick).toHaveClass(DIM)
      expect(tick).not.toHaveClass(FILLED)
    }
  })

  it("renders no ticks for a zero total", () => {
    render(<ProgressTicks total={0} filled={0} />)
    expect(screen.getByRole("progressbar").children).toHaveLength(0)
  })

  const ticks = () => Array.from(screen.getByRole("progressbar").children) as HTMLElement[]
  const delays = () => ticks().map((tick) => tick.style.transitionDelay)
  const NONE = (n: number) => Array.from({ length: n }, () => "0ms")

  it("applies no stagger on mount", () => {
    render(<ProgressTicks total={5} filled={3} current={3} />)
    expect(delays()).toEqual(NONE(5))
    expect(ticks()[2]).toHaveClass(FILLED)
  })

  it("staggers the ticks that light together by 60ms each, counted from the first new tick", () => {
    const { rerender } = render(<ProgressTicks total={5} filled={2} />)
    rerender(<ProgressTicks total={5} filled={5} />)
    expect(delays()).toEqual(["0ms", "0ms", "0ms", "60ms", "120ms"])
    // The colour class and its delay land in the same render.
    for (const tick of ticks()) expect(tick).toHaveClass(FILLED, "transition-[background-color]", "duration-500")
  })

  it("lets one new tick light at once, so answering one question at a time never waits", () => {
    const { rerender } = render(<ProgressTicks total={5} filled={2} current={2} />)
    rerender(<ProgressTicks total={5} filled={3} current={3} />)
    expect(delays()).toEqual(NONE(5))
    expect(ticks()[2]).toHaveClass(FILLED)
    expect(ticks()[3]).toHaveClass(CURRENT)
  })

  it("keeps the stagger only for the render that lit the ticks", () => {
    const { rerender } = render(<ProgressTicks total={5} filled={2} />)
    rerender(<ProgressTicks total={5} filled={5} />)
    expect(delays()[4]).toBe("120ms")
    rerender(<ProgressTicks total={5} filled={5} />)
    expect(delays()).toEqual(NONE(5))
  })

  it("applies no delay when the fill drops back, so Start over goes dark at once", () => {
    const { rerender } = render(<ProgressTicks total={5} filled={2} />)
    rerender(<ProgressTicks total={5} filled={5} />)
    rerender(<ProgressTicks total={5} filled={1} />)
    expect(delays()).toEqual(NONE(5))
    expect(ticks()[0]).toHaveClass(FILLED)
    for (const tick of ticks().slice(1)) expect(tick).toHaveClass(DIM)
  })

  it("measures the next stagger from the reduced fill after a drop", () => {
    const { rerender } = render(<ProgressTicks total={5} filled={5} />)
    rerender(<ProgressTicks total={5} filled={1} />)
    rerender(<ProgressTicks total={5} filled={4} />)
    expect(delays()).toEqual(["0ms", "0ms", "60ms", "120ms", "0ms"])
  })

  it("caps a long run at 300ms", () => {
    const { rerender } = render(<ProgressTicks total={7} filled={0} />)
    rerender(<ProgressTicks total={7} filled={7} />)
    expect(delays()).toEqual(["0ms", "60ms", "120ms", "180ms", "240ms", "300ms", "300ms"])
  })
})

describe("<KeyValueRow />", () => {
  it("renders the label as a muted caption followed by the value", () => {
    render(
      <KeyValueRow label="Headline price">
        <span>$4.65M</span>
      </KeyValueRow>
    )
    const label = screen.getByText("Headline price")
    expect(label).toHaveClass("type-caption", "text-fg-3")
    expect(label.nextSibling).toHaveTextContent("$4.65M")
  })

  it("lets the label color be overridden without keeping the muted color", () => {
    render(
      <KeyValueRow label="Advisor review" labelClassName="text-accent">
        <span>v</span>
      </KeyValueRow>
    )
    const label = screen.getByText("Advisor review")
    expect(label).toHaveClass("text-accent", "type-caption")
    expect(label).not.toHaveClass("text-fg-3")
  })

  it("merges a row className onto the flex wrapper", () => {
    const { container } = render(
      <KeyValueRow label="k" className="border-line border-b">
        <span>v</span>
      </KeyValueRow>
    )
    expect(container.firstElementChild).toHaveClass("flex", "justify-between", "border-line", "border-b")
  })

  it("wraps a plain value in the given value classes so rows need no bespoke span", () => {
    render(
      <KeyValueRow label="Total" valueClassName="type-body text-fg tabular">
        $5,000
      </KeyValueRow>
    )
    const value = screen.getByText("$5,000")
    expect(value.tagName).toBe("SPAN")
    expect(value).toHaveClass("type-body", "text-fg", "tabular")
    expect(screen.getByText("Total").nextSibling).toBe(value)
  })
})

describe("<Button />", () => {
  it("is the accent pill by default with 17px body type and the press scale", () => {
    render(<Button onClick={vi.fn()}>Go</Button>)
    const b = screen.getByRole("button", { name: "Go" })
    expect(b).toHaveAttribute("type", "button")
    expect(b).toHaveClass(
      "pressable",
      "bg-primary",
      "text-on-primary",
      "rounded-pill",
      "type-body",
      "px-[22px]",
      "py-[11px]"
    )
    expect(b.className).not.toMatch(/shadow|hover-green|font-medium/)
  })

  it("keeps a filled button's text colour on hover and only shifts the fill", () => {
    render(<Button onClick={vi.fn()}>Go</Button>)
    const b = screen.getByRole("button", { name: "Go" })
    expect(b).toHaveClass("hover:bg-primary-focus", "hover:text-on-primary")
  })

  it("renders the ghost pill and the pearl capsule", () => {
    render(
      <>
        <Button variant="secondary" onClick={vi.fn()}>
          Ghost
        </Button>
        <Button variant="pearl" onClick={vi.fn()}>
          Pearl
        </Button>
      </>
    )
    const ghost = screen.getByRole("button", { name: "Ghost" })
    expect(ghost).toHaveClass("border", "border-accent", "text-accent", "bg-transparent", "rounded-pill", "type-body")
    const pearl = screen.getByRole("button", { name: "Pearl" })
    expect(pearl).toHaveClass(
      "bg-surface-pearl",
      "text-ink-muted-80",
      "rounded-md",
      "type-caption",
      "border-[3px]",
      "border-divider-soft"
    )
    for (const el of screen.getAllByRole("button")) expect(el.className).not.toMatch(/shadow|glow/)
  })

  it("shrinks primary and secondary pills to the nav size", () => {
    render(
      <>
        <Button size="nav" href="/fees">
          Fees
        </Button>
        <Button size="nav" variant="secondary" href="#x">
          Anchor
        </Button>
      </>
    )
    for (const name of ["Fees", "Anchor"]) {
      const el = screen.getByRole("link", { name })
      expect(el).toHaveClass("type-nav-link", "h-[26px]", "px-[11px]")
      expect(el).not.toHaveClass("type-body")
    }
  })

  it("offers a compact 14px pill that keeps the 44px touch target, and a 32px icon control", () => {
    render(
      <>
        <Button size="compact" onClick={vi.fn()}>
          Share
        </Button>
        <Button size="compact" variant="secondary" href="mailto:x@y.z">
          Verify
        </Button>
        <Button size="compact" variant="icon" aria-label="Close" onClick={vi.fn()}>
          ×
        </Button>
      </>
    )
    for (const name of ["Share", "Verify"]) {
      const el = screen.getByText(name)
      expect(el).toHaveClass("type-caption", "px-4", "py-3", "rounded-pill")
      expect(el).not.toHaveClass("type-body")
    }
    // The dialog's close button is the one live icon control, and it is the compact one.
    const icon = screen.getByRole("button", { name: "Close" })
    expect(icon).toHaveClass("h-8", "w-8", "rounded-full", "bg-chip-translucent/64", "text-ink")
    expect(icon).not.toHaveClass("h-11")
  })

  it("renders internal hrefs through Next Link and other hrefs as plain anchors", () => {
    render(
      <>
        <Button href="/fees">Internal</Button>
        <Button href="mailto:x@y.z">Mail</Button>
        <Button href="#anchor">Hash</Button>
        <Button href="https://example.com" target="_blank" rel="noopener">
          External
        </Button>
      </>
    )
    expect(screen.getByRole("link", { name: "Internal" })).toHaveAttribute("data-next-link", "true")
    expect(screen.getByRole("link", { name: "Mail" })).not.toHaveAttribute("data-next-link")
    expect(screen.getByRole("link", { name: "Hash" })).not.toHaveAttribute("data-next-link")
    const ext = screen.getByRole("link", { name: "External" })
    expect(ext).not.toHaveAttribute("data-next-link")
    expect(ext).toHaveAttribute("target", "_blank")
    expect(ext).toHaveAttribute("rel", "noopener")
  })

  it("respects an explicit type, disabled state, and merged classes", () => {
    render(
      <Button type="submit" disabled className="self-start">
        Send
      </Button>
    )
    const b = screen.getByRole("button", { name: "Send" })
    expect(b).toHaveAttribute("type", "submit")
    expect(b).toBeDisabled()
    expect(b).toHaveClass("self-start", "disabled:opacity-60")
  })
})

describe("<Chip />", () => {
  it("is a pill on the current surface with caption type and exposes aria-pressed", () => {
    render(
      <Chip selected={false} onClick={vi.fn()}>
        Option
      </Chip>
    )
    const chip = screen.getByRole("button", { name: "Option" })
    expect(chip).toHaveAttribute("aria-pressed", "false")
    expect(chip).toHaveAttribute("type", "button")
    expect(chip).toHaveClass(
      "pressable",
      "bg-surface",
      "text-fg",
      "type-caption",
      "rounded-pill",
      "border",
      "border-line"
    )
    expect(chip).not.toHaveClass("ring-1")
  })

  it("upgrades the selected chip to the 2px accent border without shifting layout", () => {
    render(
      <Chip selected onClick={vi.fn()}>
        Option
      </Chip>
    )
    const chip = screen.getByRole("button", { name: "Option" })
    expect(chip).toHaveAttribute("aria-pressed", "true")
    expect(chip).toHaveClass("border-accent-focus", "ring-1", "ring-inset", "ring-accent-focus")
    expect(chip).not.toHaveClass("border-line")
    expect(chip.className).not.toMatch(/border-2|shadow/)
  })

  it("forwards native props such as disabled and data attributes and merges classes", () => {
    render(
      <Chip selected={false} disabled data-testid="c" className="mt-2">
        Option
      </Chip>
    )
    const chip = screen.getByTestId("c")
    expect(chip).toBeDisabled()
    expect(chip).toHaveClass("mt-2", "disabled:cursor-default")
  })
})

describe("<TextLink />", () => {
  it("renders internal hrefs through Next Link", () => {
    render(<TextLink href="/fees">Fees</TextLink>)
    const link = screen.getByRole("link", { name: "Fees" })
    expect(link).toHaveAttribute("href", "/fees")
    expect(link).toHaveAttribute("data-next-link", "true")
  })

  it("renders external hrefs as a plain anchor and passes rel and target through", () => {
    render(
      <TextLink href="https://heirloom.cal.com/suyash" target="_blank" rel="noopener">
        Book
      </TextLink>
    )
    const link = screen.getByRole("link", { name: "Book" })
    expect(link).toHaveAttribute("href", "https://heirloom.cal.com/suyash")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener")
    expect(link).not.toHaveAttribute("data-next-link")
  })

  it("treats protocol-relative and mailto hrefs as external", () => {
    render(
      <>
        <TextLink href="//evil.example">Proto</TextLink>
        <TextLink href="mailto:hello@heirloom.com">Mail</TextLink>
        <TextLink href="#offer-intake">Hash</TextLink>
      </>
    )
    expect(screen.getByRole("link", { name: "Proto" })).not.toHaveAttribute("data-next-link")
    expect(screen.getByRole("link", { name: "Mail" })).not.toHaveAttribute("data-next-link")
    expect(screen.getByRole("link", { name: "Hash" })).not.toHaveAttribute("data-next-link")
  })

  it("grows a 44px hit area when it stands alone in an action row", () => {
    render(
      <TextLink href="/fees" standalone>
        Standalone
      </TextLink>
    )
    expect(screen.getByRole("link", { name: "Standalone" })).toHaveClass(
      "text-link",
      "inline-flex",
      "min-h-11",
      "items-center"
    )
  })

  it("takes the accent through the global text-link rule and carries no colour, hover, or glow of its own", () => {
    render(
      <TextLink href="/a" className="mt-2">
        Link
      </TextLink>
    )
    const link = screen.getByRole("link", { name: "Link" })
    expect(link).toHaveClass("text-link", "mt-2")
    expect(link.className).not.toMatch(/text-(ink|fg|accent|d\d|l\d)|hover:|glow|shadow|underline|border-b/)
  })
})

describe("<TextButton />", () => {
  it("is a text-link-styled button in caption type, with no press scale", () => {
    const onClick = vi.fn()
    render(
      <TextButton onClick={onClick} className="mt-3">
        Start over
      </TextButton>
    )
    const b = screen.getByRole("button", { name: "Start over" })
    expect(b).toHaveAttribute("type", "button")
    expect(b).toHaveClass("text-link", "type-caption", "mt-3", "inline-flex", "min-h-11", "items-center")
    expect(b).not.toHaveClass("pressable")
    fireEvent.click(b)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe("<Disclosure />", () => {
  it("is a hairline row whose button controls a hidden region and recolours as a whole on hover", () => {
    const onToggle = vi.fn()
    const { container } = render(
      <Disclosure question="Why?" open={false} onToggle={onToggle} questionClassName="type-tagline">
        Because.
      </Disclosure>
    )
    expect(container.firstElementChild).toHaveClass("border-line", "border-b")
    const row = screen.getByRole("button", { name: /Why\?/ })
    expect(row).toHaveAttribute("aria-expanded", "false")
    expect(row).toHaveClass("hover:text-accent")
    expect(screen.getByText("Why?")).toHaveClass("type-tagline")
    expect(screen.getByText("Why?").className).not.toMatch(/\btext-(ink|fg|l\d|d\d)\b|glow/)
    expect(screen.getByRole("region", { hidden: true })).not.toBeVisible()
    fireEvent.click(row)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it("shows the region and the minus glyph when open", () => {
    render(
      <Disclosure question="Why?" open onToggle={vi.fn()}>
        Because.
      </Disclosure>
    )
    expect(screen.getByRole("button", { name: /Why\?/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region")).toBeVisible()
    expect(screen.getByText("−")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("Why?")).toHaveClass("type-body-strong")
  })
})

describe("<Dialog />", () => {
  const flushDismissListeners = () => act(() => new Promise<void>((r) => setTimeout(r, 0)))

  it("renders nothing while closed", () => {
    render(
      <Dialog open={false} onOpenChange={() => {}} title="Closed">
        <p>Body</p>
      </Dialog>
    )
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.queryByText("Body")).toBeNull()
  })

  it("renders the body and names the dialog after the visually hidden title", () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Talk to an M&A advisor">
        <p>Body</p>
      </Dialog>
    )
    const dialog = screen.getByRole("dialog", { name: "Talk to an M&A advisor" })
    expect(dialog).toContainElement(screen.getByText("Body"))
    expect(screen.getByText("Talk to an M&A advisor")).toHaveClass("sr-only")
  })

  it("moves focus inside the dialog when it opens", () => {
    render(
      <Dialog open onOpenChange={() => {}} title="T">
        <button type="button">First action</button>
      </Dialog>
    )
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement)
  })

  it("returns focus to the element that had it when the dialog opened", async () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open it
          </button>
          <Dialog open={open} onOpenChange={setOpen} title="T">
            <button type="button" onClick={() => setOpen(false)}>
              Done
            </button>
          </Dialog>
        </>
      )
    }
    render(<Harness />)
    const opener = screen.getByRole("button", { name: "Open it" })
    opener.focus()
    fireEvent.click(opener)
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement)
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    // Radix hands focus back on the next macrotask.
    await flushDismissListeners()
    expect(document.activeElement).toBe(opener)
  })

  it("asks to close when the frosted overlay is pressed", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <p>Body</p>
      </Dialog>
    )
    await flushDismissListeners()
    const overlay = screen.getByRole("dialog").previousElementSibling as HTMLElement
    expect(overlay).toHaveClass("bg-surface-black/60", "backdrop-blur-[20px]")
    fireEvent.pointerDown(overlay, { button: 0, pointerType: "mouse" })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("does not ask to close when the press lands inside the panel", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <p>Body</p>
      </Dialog>
    )
    await flushDismissListeners()
    fireEvent.pointerDown(screen.getByText("Body"), { button: 0, pointerType: "mouse" })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("centres the sheet at the system's 980px lock", () => {
    render(
      <Dialog open onOpenChange={() => {}} title="T">
        <p>Body</p>
      </Dialog>
    )
    expect(screen.getByRole("dialog")).toHaveClass("fixed", "z-[101]", "w-[min(980px,calc(100%-32px))]")
  })
})

describe("<AdvisorTrigger />", () => {
  it("renders a button carrying the open-advisor test id and its own classes", () => {
    renderWithSite(
      <AdvisorTrigger className="group block" aria-label="Open advisor">
        Card text
      </AdvisorTrigger>
    )
    const button = screen.getByRole("button", { name: "Open advisor" })
    expect(button).toHaveAttribute("type", "button")
    expect(button).toHaveAttribute("data-testid", "open-advisor")
    expect(button).toHaveClass("group", "block")
    expect(button).toHaveTextContent("Card text")
  })

  it("opens the advisor dialog when clicked", () => {
    renderWithSite(
      <>
        <AdvisorTrigger>Talk</AdvisorTrigger>
        <AdvisorDialog />
      </>
    )
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Talk" }))
    expect(screen.getByTestId("advisor-dialog")).toBeInTheDocument()
    expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
  })
})
