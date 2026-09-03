import { act, fireEvent, render, screen } from "@testing-library/react"
import { type ComponentPropsWithoutRef, useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { Dialog, DialogClose } from "@/components/site/ui/Dialog"
import {
  Container,
  Eyebrow,
  KeyValueRow,
  LiveDot,
  ProgressTicks,
  SealDot,
  VisuallyHidden,
} from "@/components/site/ui/primitives"
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
  it("centers a 1180px column and keeps the base classes when merging", () => {
    render(<Container className="relative">x</Container>)
    const el = screen.getByText("x")
    expect(el).toHaveClass("mx-auto", "w-full", "max-w-[1180px]", "relative")
  })

  it("lets a className override the max width instead of duplicating it", () => {
    render(<Container className="max-w-[760px]">x</Container>)
    const el = screen.getByText("x")
    expect(el).toHaveClass("max-w-[760px]")
    expect(el).not.toHaveClass("max-w-[1180px]")
  })

  it("forwards arbitrary div props", () => {
    render(
      <Container id="hero" data-testid="c" aria-label="Hero">
        x
      </Container>
    )
    const el = screen.getByTestId("c")
    expect(el).toHaveAttribute("id", "hero")
    expect(el).toHaveAttribute("aria-label", "Hero")
    expect(el.tagName).toBe("DIV")
  })
})

describe("<Eyebrow />", () => {
  it("renders the eyebrow and muted text classes plus any extra class", () => {
    render(<Eyebrow className="mb-4">Label</Eyebrow>)
    expect(screen.getByText("Label")).toHaveClass("eyebrow", "text-l3", "mb-4")
  })

  it("forwards props such as an id", () => {
    render(<Eyebrow id="eb">Label</Eyebrow>)
    expect(screen.getByText("Label")).toHaveAttribute("id", "eb")
  })
})

describe("<LiveDot />", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<LiveDot />)
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
  })

  it("blinks unless motion is reduced and accepts size overrides", () => {
    const { container } = render(<LiveDot className="h-1.5 w-1.5" />)
    const dot = container.firstElementChild
    expect(dot).toHaveClass("bg-filament", "animate-blink", "motion-reduce:animate-none", "h-1.5", "w-1.5")
    expect(dot).not.toHaveClass("h-[7px]")
  })
})

describe("<SealDot />", () => {
  it("is a decorative seal-colored dot hidden from assistive technology", () => {
    const { container } = render(<SealDot className="ml-2" />)
    const dot = container.firstElementChild
    expect(dot).toHaveAttribute("aria-hidden", "true")
    expect(dot).toHaveClass("bg-seal-dot", "rounded-full", "ml-2")
  })
})

describe("<VisuallyHidden />", () => {
  it("keeps the text in the DOM with the sr-only class", () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>)
    expect(screen.getByText("Screen reader text")).toHaveClass("sr-only")
  })
})

describe("<ProgressTicks />", () => {
  const FILLED = "bg-filament"
  const CURRENT = "bg-filament/45"
  const DIM = "bg-dfull/14"

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

  it("lights the filled ticks, half-lights the current one, and dims the rest", () => {
    render(<ProgressTicks total={5} filled={2} current={2} />)
    const ticks = Array.from(screen.getByRole("progressbar").children)
    expect(ticks[0]).toHaveClass(FILLED)
    expect(ticks[1]).toHaveClass(FILLED)
    expect(ticks[2]).toHaveClass(CURRENT)
    expect(ticks[2]).not.toHaveClass(DIM)
    expect(ticks[3]).toHaveClass(DIM)
    expect(ticks[4]).toHaveClass(DIM)
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

  it("omits the aria-label when no label is provided", () => {
    render(<ProgressTicks total={2} filled={1} />)
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-label")
  })
})

describe("<KeyValueRow />", () => {
  it("renders the label in the muted mono style followed by the value", () => {
    render(
      <KeyValueRow label="Headline price">
        <span>$4.65M</span>
      </KeyValueRow>
    )
    const label = screen.getByText("Headline price")
    expect(label).toHaveClass("text-l3", "font-mono")
    expect(label.nextSibling).toHaveTextContent("$4.65M")
  })

  it("lets the label color be overridden without keeping the muted color", () => {
    render(
      <KeyValueRow label="Advisor review" labelClassName="text-filament-ink">
        <span>v</span>
      </KeyValueRow>
    )
    const label = screen.getByText("Advisor review")
    expect(label).toHaveClass("text-filament-ink", "font-mono")
    expect(label).not.toHaveClass("text-l3")
  })

  it("merges a row className onto the flex wrapper", () => {
    const { container } = render(
      <KeyValueRow label="k" className="border-hair border-b">
        <span>v</span>
      </KeyValueRow>
    )
    expect(container.firstElementChild).toHaveClass("flex", "justify-between", "border-hair", "border-b")
  })

  it("accepts a node as the label", () => {
    render(
      <KeyValueRow label={<em>Owner</em>}>
        <span>v</span>
      </KeyValueRow>
    )
    expect(screen.getByText("Owner").tagName).toBe("EM")
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

  it("renders in the surrounding ink by default and the light ink on dark panels, leaving hover to the global rule", () => {
    render(
      <>
        <TextLink href="/a">Light</TextLink>
        <TextLink href="/b" tone="dark">
          Dark
        </TextLink>
      </>
    )
    const light = screen.getByRole("link", { name: "Light" })
    const dark = screen.getByRole("link", { name: "Dark" })
    expect(light).toHaveClass("text-ink")
    expect(dark).toHaveClass("text-d1")
    for (const link of [light, dark]) {
      expect(link.className).not.toMatch(/hover:text-|glow|text-shadow|underline|border-b/)
    }
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

  it("asks to close on Escape", () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <p>Body</p>
      </Dialog>
    )
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" })
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("asks to close when the overlay is pressed", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <p>Body</p>
      </Dialog>
    )
    await flushDismissListeners()
    const overlay = screen.getByRole("dialog").previousElementSibling as HTMLElement
    expect(overlay).toHaveClass("backdrop-blur-[7px]")
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

  it("closes through DialogClose", () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="T">
        <DialogClose>Dismiss</DialogClose>
      </Dialog>
    )
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("merges a className onto the centered panel", () => {
    render(
      <Dialog open onOpenChange={() => {}} title="T" className="max-w-[480px]">
        <p>Body</p>
      </Dialog>
    )
    expect(screen.getByRole("dialog")).toHaveClass("fixed", "z-[101]", "max-w-[480px]")
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

  it("throws outside the site state provider", () => {
    const silence = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<AdvisorTrigger>Talk</AdvisorTrigger>)).toThrow(
      "useSiteState must be used inside <SiteStateProvider>"
    )
    silence.mockRestore()
  })
})
