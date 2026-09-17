import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OfferComparison } from "@/components/site/home/OfferComparison"
import { padIndex } from "@/lib/site/format"
import { type OfferId, OFFERS, PRIORITIES, PRIORITY_WHY } from "@/lib/site/offers/data"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, setRect, stubMatchMedia } from "./scene-test-utils"

/** Text of the value that follows a label inside a label/value pair. */
function valueAfter(scope: HTMLElement, label: string): string {
  return within(scope).getByText(label).nextElementSibling?.textContent ?? ""
}

async function settle(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

const CARD_RECT = { width: 220, height: 300 }

/**
 * Lay the grid out from each card's rank: rank n sits at (250n, 40n). Every other element measures at the
 * origin. Installed before render so the mount measurement and every later one read the same geometry.
 */
function layOutByRank(step = { x: 250, y: 40 }) {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const rank = Number(this.dataset.rank ?? 0)
    const left = rank * step.x
    const top = rank * step.y
    return {
      left,
      top,
      right: left + CARD_RECT.width,
      bottom: top + CARD_RECT.height,
      x: left,
      y: top,
      ...CARD_RECT,
      toJSON: () => ({}),
    } as DOMRect
  })
}

const FLIP_CLASSES = ["transition-transform", "duration-500", "ease-e1"]
const PREVIEW_RING = ["bg-surface-2", "ring-1", "ring-inset", "ring-fg-2"]

function card(id: OfferId) {
  return screen.getByTestId(`offer-card-${id}`)
}

function chip(label: string) {
  return screen.getByRole("button", { name: label })
}

/** Dispatch a transitionend on `target` (jsdom has no TransitionEvent, so a plain Event carries the property). */
function transitionEnd(target: Element, propertyName: string) {
  const event = new Event("transitionend", { bubbles: true })
  Object.defineProperty(event, "propertyName", { value: propertyName })
  act(() => {
    target.dispatchEvent(event)
  })
}

/** Dispatch a pointer event (jsdom has no PointerEvent, so a MouseEvent carries the pointer type). */
function pointer(el: Element, type: "pointermove" | "pointerleave", x = 0, y = 0, pointerType = "mouse") {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true })
  Object.defineProperty(event, "pointerType", { value: pointerType })
  act(() => {
    el.dispatchEvent(event)
  })
}

let drivers: SceneDrivers

describe("<OfferComparison />", () => {
  beforeEach(() => {
    // Time only moves when a test steps it, so the 340ms and 600ms boundaries hold under slow (instrumented) runs.
    vi.useFakeTimers()
    drivers = installSceneDrivers()
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    vi.useRealTimers()
    restoreMatchMedia()
  })

  it("re-ranks by priority and reveals the selected offer", () => {
    render(<OfferComparison />)
    expect(card("C")).toHaveAttribute("data-best", "true")
    fireEvent.click(chip("Most cash at closing"))
    expect(card("D")).toHaveAttribute("data-best", "true")
    expect(screen.getByText("Choose an offer.")).toBeInTheDocument()
    fireEvent.click(card("A"))
    expect(screen.getByText("Reading the offer terms...")).toBeInTheDocument()
    expect(screen.getByText("Reading the offer terms...")).toHaveAttribute("aria-live", "polite")
  })

  it("reveals the exact terms of Letter of intent A after the reading delay", async () => {
    render(<OfferComparison />)
    fireEvent.click(card("A"))
    expect(card("A")).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByTestId("offer-detail")).toBeNull()
    expect(screen.queryByText("Choose an offer.")).toBeNull()
    await settle(339)
    expect(screen.queryByTestId("offer-detail")).toBeNull()
    await settle(1)
    expect(screen.queryByText("Reading the offer terms...")).toBeNull()
    const detail = screen.getByTestId("offer-detail")
    expect(within(detail).getByText("Letter of intent A · Regional consolidator")).toBeInTheDocument()
    expect(within(detail).getByText("Owns four contractors in the Carolinas")).toBeInTheDocument()
    expect(valueAfter(detail, "Headline price")).toBe("$4.30M")
    expect(valueAfter(detail, "Cash at closing")).toBe("$2.75M")
    expect(valueAfter(detail, "Money paid later")).toBe("$1.25M")
    expect(valueAfter(detail, "Retained ownership")).toBe("$0.30M")
    expect(valueAfter(detail, "Buyer financing")).toBe("Bank line plus SBA 7(a) top-up")
    expect(valueAfter(detail, "Time you stay")).toBe("12 months, full time")
    expect(valueAfter(detail, "Team and company name")).toBe(
      "Kept all staff, the name and the location in three prior acquisitions. Verified against public record."
    )
    expect(valueAfter(detail, "Closing risk")).toBe("Moderate · 60 days exclusivity")
  })

  it.each([
    {
      id: "B",
      title: "Letter of intent B · Independent searcher",
      head: "$4.55M",
      cash: "$2.60M",
      later: "$1.50M",
      roll: "$0.45M",
      fin: "SBA 7(a), contingent, no prior closes",
      trans: "4 months",
      risk: "Lower · 90 days exclusivity",
    },
    {
      id: "C",
      title: "Letter of intent C · Private equity add-on",
      head: "$4.05M",
      cash: "$3.10M",
      later: "$0.15M",
      roll: "$0.80M",
      fin: "Committed equity and debt, no financing condition",
      trans: "3 months advisory, 24-month rollover lock",
      risk: "High · 45 days exclusivity",
    },
    {
      id: "D",
      title: "Letter of intent D · Strategic buyer",
      head: "$4.65M",
      cash: "$3.45M",
      later: "$1.20M",
      roll: "None",
      fin: "Cash on balance sheet",
      trans: "12 months, full time",
      risk: "Moderate · 60 days exclusivity",
    },
  ] as const)("shows the exact terms of offer $id", async (offer) => {
    render(<OfferComparison />)
    fireEvent.click(card(offer.id))
    await settle(340)
    const detail = screen.getByTestId("offer-detail")
    expect(within(detail).getByText(offer.title)).toBeInTheDocument()
    expect(valueAfter(detail, "Headline price")).toBe(offer.head)
    expect(valueAfter(detail, "Cash at closing")).toBe(offer.cash)
    expect(valueAfter(detail, "Money paid later")).toBe(offer.later)
    expect(valueAfter(detail, "Retained ownership")).toBe(offer.roll)
    expect(valueAfter(detail, "Buyer financing")).toBe(offer.fin)
    expect(valueAfter(detail, "Time you stay")).toBe(offer.trans)
    expect(valueAfter(detail, "Closing risk")).toBe(offer.risk)
  })

  it("clicking the selected offer again collapses the detail panel", async () => {
    render(<OfferComparison />)
    fireEvent.click(card("B"))
    await settle(340)
    expect(screen.getByTestId("offer-detail")).toBeInTheDocument()
    fireEvent.click(card("B"))
    expect(screen.queryByTestId("offer-detail")).toBeNull()
    expect(card("B")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("Choose an offer.")).toBeInTheDocument()
  })

  it("selects an offer with Enter and toggles it off with Space, ignoring other keys", async () => {
    render(<OfferComparison />)
    const c = card("C")
    fireEvent.keyDown(c, { key: "a" })
    expect(c).toHaveAttribute("aria-pressed", "false")
    fireEvent.keyDown(c, { key: "Enter" })
    expect(c).toHaveAttribute("aria-pressed", "true")
    await settle(340)
    expect(screen.getByTestId("offer-detail")).toHaveTextContent("Letter of intent C · Private equity add-on")
    fireEvent.keyDown(c, { key: " " })
    expect(c).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByTestId("offer-detail")).toBeNull()
  })

  it("explains the default certainty priority and marks exactly one strongest fit", () => {
    render(<OfferComparison />)
    expect(chip("Highest chance of closing")).toHaveAttribute("aria-pressed", "true")
    expect(
      screen.getByText("Rewards committed financing, a proven buyer, fewer conditions, and a shorter path to close.")
    ).toBeInTheDocument()
    expect(screen.getAllByText("Strongest fit")).toHaveLength(1)
    expect(within(card("C")).getByText("Strongest fit")).toBeInTheDocument()
  })

  it.each([
    ["cash", "Most cash at closing", "D"],
    ["upside", "Keep future upside", "B"],
    ["team", "Protect employees and the company name", "A"],
  ] as const)("moves the strongest fit to offer %s for the '%s' priority", (priority, label, expectedBest) => {
    render(<OfferComparison />)
    fireEvent.click(chip(label))
    expect(chip(label)).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(PRIORITY_WHY[priority])).toBeInTheDocument()
    for (const o of OFFERS) {
      expect(card(o.id), o.id).toHaveAttribute("data-best", String(o.id === expectedBest))
    }
    expect(screen.getAllByText("Strongest fit")).toHaveLength(1)
    expect(within(card(expectedBest)).getByText("Strongest fit")).toBeInTheDocument()
  })

  it("asks the priority question once, over a group the four chips are named by", () => {
    render(<OfferComparison />)
    const group = screen.getByRole("group", { name: "Choose your most important deal priority" })
    expect(within(group).getByText("What matters most to you?")).toBeInTheDocument()
    expect(within(group).getByText("What matters most to you?")).toHaveClass("type-caption", "basis-full")
    for (const p of PRIORITIES) expect(group).toContainElement(chip(p.l))
  })

  it("keeps only one priority pressed at a time", () => {
    render(<OfferComparison />)
    fireEvent.click(chip("Keep future upside"))
    const pressed = PRIORITIES.filter((p) => chip(p.l).getAttribute("aria-pressed") === "true")
    expect(pressed.map((p) => p.v)).toEqual(["upside"])
  })

  it("flags offer D as the highest headline price under every priority", () => {
    render(<OfferComparison />)
    for (const p of PRIORITIES) {
      fireEvent.click(chip(p.l))
      expect(screen.getAllByText("Highest headline price")).toHaveLength(1)
      expect(within(card("D")).getByText("Highest headline price")).toBeInTheDocument()
    }
  })

  it("prints each card's headline, cash, certainty band, and certainty bar width", () => {
    render(<OfferComparison />)
    const expected = [
      { id: "A", who: "Regional consolidator", head: "$4.30M", cash: "$2.75M", risk: "Moderate", bar: "82%" },
      { id: "B", who: "Independent searcher", head: "$4.55M", cash: "$2.60M", risk: "Lower", bar: "62%" },
      { id: "C", who: "Private equity add-on", head: "$4.05M", cash: "$3.10M", risk: "High", bar: "93%" },
      { id: "D", who: "Strategic buyer", head: "$4.65M", cash: "$3.45M", risk: "Moderate", bar: "75%" },
    ] as const
    for (const o of expected) {
      const c = card(o.id)
      expect(within(c).getByText(o.who)).toBeInTheDocument()
      expect(valueAfter(c, "Headline price"), o.id).toBe(o.head)
      expect(valueAfter(c, "Cash at closing"), o.id).toBe(o.cash)
      expect(valueAfter(c, "Closing risk"), o.id).toBe(o.risk)
      const bar = c.querySelector('[style*="width"]') as HTMLElement
      expect(bar.style.width, o.id).toBe(o.bar)
    }
  })

  /* ---------------------------------------------------------------------------------------------- */

  describe("ranking order", () => {
    it("ranks the cards C, A, D, B for the default certainty priority, in CSS order with the DOM order unchanged", () => {
      render(<OfferComparison />)
      const ids = ["C", "A", "D", "B"] as const
      expect(card("C")).toHaveAttribute("data-best", "true")
      ids.forEach((id, i) => {
        const c = card(id)
        expect(c, id).toHaveAttribute("data-rank", String(i + 1))
        expect(c.style.order, id).toBe(String(i + 1))
        expect(within(c).getByTestId(`offer-rank-${id}`)).toHaveTextContent(padIndex(i + 1))
      })
      // The DOM (and so the tab order and the testids) still runs A to D; only the CSS order moves.
      const grid = screen.getByRole("group", { name: "Compare cash, terms, conditions, and closing risk" })
      expect(Array.from(grid.children, (el) => el.getAttribute("data-testid"))).toEqual([
        "offer-card-A",
        "offer-card-B",
        "offer-card-C",
        "offer-card-D",
      ])
      expect(grid).toHaveClass("grid", "grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]", "gap-6", "mt-8")
      for (const el of Array.from(grid.children)) {
        expect(el).toHaveAttribute("role", "button")
        expect(el).toHaveAttribute("tabindex", "0")
      }
    })

    it.each([
      ["team", "Protect employees and the company name", ["A", "B", "C", "D"]],
      ["cash", "Most cash at closing", ["D", "C", "A", "B"]],
      ["upside", "Keep future upside", ["B", "C", "D", "A"]],
    ] as const)("re-ranks for the %s priority and the rank numerals follow", (_priority, label, expected) => {
      render(<OfferComparison />)
      fireEvent.click(chip(label))
      expected.forEach((id, i) => {
        expect(card(id), id).toHaveAttribute("data-rank", String(i + 1))
        expect(card(id).style.order, id).toBe(String(i + 1))
        expect(screen.getByTestId(`offer-rank-${id}`), id).toHaveTextContent(padIndex(i + 1))
      })
      // Read in DOM order (A to D), each letter shows the numeral of its place in the ranking, once.
      expect(screen.getAllByText(/^0[1-4]$/).map((el) => el.textContent)).toEqual(
        OFFERS.map((o) => padIndex(expected.indexOf(o.id) + 1))
      )
      expect(card(expected[0])).toHaveAttribute("data-best", "true")
    })

    it("draws each rank as a tabular caption numeral in the card's top-right that arrives with the row motion", () => {
      render(<OfferComparison />)
      const c = card("C")
      const numeral = within(c).getByTestId("offer-rank-C")
      expect(numeral).toHaveTextContent("01")
      expect(numeral).toHaveClass(
        "type-caption",
        "text-fg-3",
        "tabular",
        "animate-row-in",
        "motion-reduce:animate-none"
      )
      expect(numeral).toHaveAttribute("aria-hidden", "true")
      const row = numeral.parentElement as HTMLElement
      expect(row).toBe(c.firstElementChild)
      // min-h-14 reserves two pill lines, so a badge that wraps (card 03) never pushes its card's body out of line.
      expect(row).toHaveClass("min-h-14")
      expect(row.lastElementChild).toBe(numeral)
      const badges = row.firstElementChild as HTMLElement
      expect(within(badges).getByText("Strongest fit")).toBeInTheDocument()
      // A card with no badge keeps the reserved row so the figures line up.
      const rowA = card("A").firstElementChild as HTMLElement
      expect(rowA.firstElementChild?.childElementCount).toBe(0)
      expect(within(rowA).getByTestId("offer-rank-A")).toHaveTextContent("02")
    })

    it("tells the two badges apart by tone: the strongest fit in accent, the headline price in the muted outline", () => {
      render(<OfferComparison />)
      const best = screen.getByText("Strongest fit")
      expect(best).toHaveClass(
        "animate-row-in",
        "motion-reduce:animate-none",
        "text-accent",
        "border-accent",
        "rounded-pill",
        "type-caption-strong"
      )
      const head = screen.getByText("Highest headline price")
      expect(head).toHaveClass(
        "animate-row-in",
        "motion-reduce:animate-none",
        "text-fg-3",
        "border-line",
        "rounded-pill"
      )
      expect(head).not.toHaveClass("text-accent")
      expect(head).not.toHaveClass("border-accent")
    })

    it("clicking the priority that is already pressed changes nothing and queues no move", () => {
      layOutByRank()
      render(<OfferComparison />)
      fireEvent.click(chip("Highest chance of closing"))
      expect(chip("Highest chance of closing")).toHaveAttribute("aria-pressed", "true")
      expect(card("C")).toHaveAttribute("data-rank", "1")
      expect(drivers.pendingFrames()).toBe(0)
      expect(card("C").style.transform).toBe("")
    })
  })

  /* ---------------------------------------------------------------------------------------------- */

  describe("priority preview", () => {
    it("hovering a priority marks the card it would lift with the idle-hover ring, without touching the ranking", () => {
      render(<OfferComparison />)
      const team = chip("Protect employees and the company name")
      fireEvent.mouseEnter(team)
      expect(card("A")).toHaveAttribute("data-preview", "true")
      expect(card("A")).toHaveClass(...PREVIEW_RING)
      expect(card("A")).toHaveClass("border-line", "hover:border-fg-3")
      expect(card("A")).toHaveAttribute("data-best", "false")
      expect(card("A")).toHaveAttribute("data-rank", "2")
      for (const id of ["B", "C", "D"] as const) {
        expect(card(id), id).toHaveAttribute("data-preview", "false")
        expect(card(id), id).not.toHaveClass("ring-fg-2")
      }
      expect(card("C")).toHaveAttribute("data-best", "true")
      expect(card("C")).toHaveClass("border-accent-focus", "ring-accent-focus", "ring-1", "ring-inset")
      expect(screen.getAllByText("Strongest fit")).toHaveLength(1)
      expect(screen.getByText(PRIORITY_WHY.certainty)).toBeInTheDocument()
      fireEvent.mouseLeave(team)
      expect(card("A")).toHaveAttribute("data-preview", "false")
      expect(card("A")).not.toHaveClass("ring-fg-2")
      expect(card("A")).not.toHaveClass("bg-surface-2")
      expect(card("A")).toHaveClass("border-line")
    })

    it("focusing a priority previews the same way and blur clears it", () => {
      render(<OfferComparison />)
      const cash = chip("Most cash at closing")
      fireEvent.focus(cash)
      expect(card("D")).toHaveAttribute("data-preview", "true")
      expect(card("D")).toHaveClass(...PREVIEW_RING)
      expect(card("D")).toHaveAttribute("data-best", "false")
      fireEvent.blur(cash)
      expect(card("D")).toHaveAttribute("data-preview", "false")
      expect(card("D")).not.toHaveClass("ring-fg-2")
      expect(card("D")).not.toHaveClass("bg-surface-2")
    })

    it("lets the hovered priority win over the focused one and falls back to focus when the pointer leaves", () => {
      render(<OfferComparison />)
      const cash = chip("Most cash at closing")
      const team = chip("Protect employees and the company name")
      fireEvent.focus(cash)
      fireEvent.mouseEnter(team)
      expect(card("A")).toHaveAttribute("data-preview", "true")
      expect(card("D")).toHaveAttribute("data-preview", "false")
      fireEvent.mouseLeave(team)
      expect(card("A")).toHaveAttribute("data-preview", "false")
      expect(card("D")).toHaveAttribute("data-preview", "true")
      fireEvent.blur(cash)
      expect(screen.getByTestId("offer-comparison").querySelectorAll('[data-preview="true"]')).toHaveLength(0)
    })

    it("never dims the accent ring: previewing the current fit marks it but keeps the selected border", () => {
      render(<OfferComparison />)
      fireEvent.mouseEnter(chip("Highest chance of closing"))
      expect(card("C")).toHaveAttribute("data-preview", "true")
      expect(card("C")).toHaveAttribute("data-best", "true")
      expect(card("C")).toHaveClass("border-accent-focus", "ring-accent-focus", "ring-1", "ring-inset")
      expect(card("C")).not.toHaveClass("ring-fg-2")
      expect(card("C")).not.toHaveClass("bg-surface-2")
    })

    it("draws the preview ring over a pressed card's ink border", async () => {
      render(<OfferComparison />)
      fireEvent.click(card("A"))
      await settle(340)
      expect(card("A")).toHaveClass("border-fg")
      expect(card("A")).not.toHaveClass("border-line")
      fireEvent.mouseEnter(chip("Protect employees and the company name"))
      expect(card("A")).toHaveClass("border-fg", ...PREVIEW_RING)
    })

    it("hands the preview over to the accent ring when the previewed priority is chosen", () => {
      render(<OfferComparison />)
      const team = chip("Protect employees and the company name")
      fireEvent.mouseEnter(team)
      expect(card("A")).toHaveClass(...PREVIEW_RING)
      fireEvent.click(team)
      expect(card("A")).toHaveAttribute("data-best", "true")
      expect(card("A")).toHaveAttribute("data-preview", "true")
      expect(card("A")).toHaveClass("border-accent-focus", "ring-accent-focus")
      expect(card("A")).not.toHaveClass("ring-fg-2")
      expect(card("C")).toHaveClass("border-line")
      expect(card("C")).not.toHaveClass("ring-1")
    })
  })

  /* ---------------------------------------------------------------------------------------------- */

  describe("FLIP re-ordering", () => {
    it("translates every moved card back to where it stood with no transition, then releases it on the next frame", () => {
      layOutByRank()
      render(<OfferComparison />)
      expect(drivers.pendingFrames()).toBe(0)
      fireEvent.click(chip("Protect employees and the company name"))
      // certainty → team: A 2→1, B 4→2, C 1→3, D 3→4, each card 250px × 40px per rank.
      const expected = {
        A: "translate(250px, 40px)",
        B: "translate(500px, 80px)",
        C: "translate(-500px, -80px)",
        D: "translate(-250px, -40px)",
      } as const
      for (const o of OFFERS) {
        const c = card(o.id)
        expect(c.style.transform, o.id).toBe(expected[o.id])
        expect(c.style.transition, o.id).toBe("none")
        expect(c, o.id).not.toHaveClass(...FLIP_CLASSES)
      }
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      for (const o of OFFERS) {
        const c = card(o.id)
        expect(c.style.transform, o.id).toBe("")
        expect(c.style.transition, o.id).toBe("")
        expect(c, o.id).toHaveClass(...FLIP_CLASSES)
        expect(c, o.id).toHaveClass("pressable", "cursor-pointer")
      }
      expect(drivers.pendingFrames()).toBe(0)
    })

    it("moves a card that only changes row by its vertical distance", () => {
      layOutByRank({ x: 0, y: 100 })
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      expect(card("A").style.transform).toBe("translate(0px, 100px)")
      expect(card("C").style.transform).toBe("translate(0px, -200px)")
      expect(drivers.pendingFrames()).toBe(1)
    })

    it("takes the travel transition off a card when its own transform transition ends, ignoring other transitions", () => {
      layOutByRank()
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      act(() => drivers.flushFrames())
      for (const o of OFFERS) expect(card(o.id)).toHaveClass(...FLIP_CLASSES)
      transitionEnd(card("A"), "transform")
      expect(card("A")).not.toHaveClass(...FLIP_CLASSES)
      // Under the team priority A is the strongest fit, so it keeps the accent border and its press transition.
      expect(card("A")).toHaveClass("pressable", "cursor-pointer", "bg-surface", "border-accent-focus")
      // A child's transition bubbling up (the certainty bar's width, or a transform inside) is not the card's travel.
      transitionEnd(within(card("B")).getByText("Headline price"), "transform")
      expect(card("B")).toHaveClass(...FLIP_CLASSES)
      transitionEnd(card("C"), "width")
      expect(card("C")).toHaveClass(...FLIP_CLASSES)
      // A second end on a settled card is harmless.
      transitionEnd(card("A"), "transform")
      expect(card("A")).not.toHaveClass(...FLIP_CLASSES)
    })

    it("takes the travel transition off every card 600ms after the move even if no transitionend arrives", async () => {
      layOutByRank()
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      act(() => drivers.flushFrames())
      await settle(599)
      for (const o of OFFERS) expect(card(o.id), o.id).toHaveClass(...FLIP_CLASSES)
      await settle(1)
      for (const o of OFFERS) {
        expect(card(o.id), o.id).not.toHaveClass(...FLIP_CLASSES)
        expect(card(o.id).style.transform, o.id).toBe("")
      }
    })

    it("starts a new move from where a card is mid-travel and cancels the frame the first move was waiting on", () => {
      layOutByRank()
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      expect(drivers.pendingFrames()).toBe(1)
      const first = drivers.raf.mock.results[0]?.value as number
      fireEvent.click(chip("Most cash at closing"))
      expect(drivers.caf).toHaveBeenCalledWith(first)
      expect(drivers.pendingFrames()).toBe(1)
      // team → cash: A 1→3, B 2→4, C 3→2, D 4→1, measured from the team layout the snapshot took.
      expect(card("A").style.transform).toBe("translate(-500px, -80px)")
      expect(card("B").style.transform).toBe("translate(-500px, -80px)")
      expect(card("C").style.transform).toBe("translate(250px, 40px)")
      expect(card("D").style.transform).toBe("translate(750px, 120px)")
      for (const o of OFFERS) expect(card(o.id), o.id).toHaveClass("pressable")
      act(() => drivers.flushFrames())
      for (const o of OFFERS) expect(card(o.id).style.transform, o.id).toBe("")
      expect(card("D")).toHaveAttribute("data-rank", "1")
    })

    it("ends a travel in flight before measuring, so a released card is re-measured without its transition", () => {
      layOutByRank()
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      act(() => drivers.flushFrames())
      expect(card("A")).toHaveClass(...FLIP_CLASSES)
      fireEvent.click(chip("Most cash at closing"))
      // The in-flight classes come off before the new offset is written; the offset waits on the next frame.
      for (const o of OFFERS) {
        expect(card(o.id), o.id).not.toHaveClass(...FLIP_CLASSES)
        expect(card(o.id).style.transition, o.id).toBe("none")
      }
      act(() => drivers.flushFrames())
      for (const o of OFFERS) expect(card(o.id), o.id).toHaveClass(...FLIP_CLASSES)
    })

    it("writes nothing and queues no frame when the new layout leaves every card where it was", () => {
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        left: 10,
        top: 20,
        right: 230,
        bottom: 320,
        x: 10,
        y: 20,
        ...CARD_RECT,
        toJSON: () => ({}),
      } as DOMRect)
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      for (const o of OFFERS) {
        expect(card(o.id).style.transform, o.id).toBe("")
        expect(card(o.id).style.transition, o.id).toBe("")
        expect(card(o.id), o.id).not.toHaveClass(...FLIP_CLASSES)
      }
      expect(drivers.pendingFrames()).toBe(0)
      expect(card("A")).toHaveAttribute("data-rank", "1")
    })

    it("re-ranks without any travel under reduced motion", () => {
      stubMatchMedia(["prefers-reduced-motion"])
      const rects = layOutByRank()
      render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      // Neither the mount nor the click measures a single card.
      expect(rects).not.toHaveBeenCalled()
      for (const o of OFFERS) {
        expect(card(o.id).style.transform, o.id).toBe("")
        expect(card(o.id).style.transition, o.id).toBe("")
        expect(card(o.id), o.id).not.toHaveClass(...FLIP_CLASSES)
      }
      expect(drivers.pendingFrames()).toBe(0)
      expect(card("A")).toHaveAttribute("data-rank", "1")
      expect(card("A")).toHaveAttribute("data-best", "true")
      expect(screen.getByTestId("offer-rank-A")).toHaveTextContent("01")
    })

    it("cancels the pending frame, the fallback timer, and the listeners on unmount", async () => {
      layOutByRank()
      const { unmount } = render(<OfferComparison />)
      fireEvent.click(chip("Protect employees and the company name"))
      const a = card("A")
      const remove = vi.spyOn(a, "removeEventListener")
      expect(drivers.pendingFrames()).toBe(1)
      unmount()
      expect(drivers.pendingFrames()).toBe(0)
      expect(remove).toHaveBeenCalledWith("transitionend", expect.any(Function))
      // The detached card keeps its offset: nothing runs after unmount to release or settle it.
      await settle(700)
      expect(a.style.transform).toBe("translate(250px, 40px)")
    })
  })

  /* ---------------------------------------------------------------------------------------------- */

  describe("cards and panel", () => {
    it("brings the detail panel in with the stage motion each time it appears", async () => {
      render(<OfferComparison />)
      fireEvent.click(card("A"))
      await settle(340)
      const detail = screen.getByTestId("offer-detail")
      expect(detail).toHaveClass("animate-stage-in", "motion-reduce:animate-none", "mt-6")
      fireEvent.click(card("D"))
      expect(screen.queryByTestId("offer-detail")).toBeNull()
      await settle(340)
      const next = screen.getByTestId("offer-detail")
      expect(next).not.toBe(detail)
      expect(next).toHaveClass("animate-stage-in", "motion-reduce:animate-none")
      expect(within(next).getByText("Letter of intent D · Strategic buyer")).toBeInTheDocument()
    })
  })

  /* ---------------------------------------------------------------------------------------------- */

  describe("envelopes figure", () => {
    it("sets the envelopes beside the section header from the desktop breakpoint and hides them below it", () => {
      render(<OfferComparison />)
      const figure = screen.getByTestId("offers-figure")
      expect(figure).toHaveClass("hidden", "desk:block")
      expect(figure.querySelector("figcaption")).toBeNull()
      const img = within(figure).getByRole("img", { name: "Four sealed cream envelopes with brass clasps" })
      expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/generated/envelopes.webp")
      expect(img).toHaveAttribute("sizes", "280px")
      // The generated object rests inside a framed surface, which is how it earns the product shadow.
      const frame = screen.getByTestId("offers-figure-layer").parentElement as HTMLElement
      expect(frame).toHaveClass("bg-tile-1", "shadow-product", "aspect-[3/2]", "overflow-hidden", "rounded-lg")
      expect(frame).not.toHaveClass("bg-surface")
      // The 280px column exists only from `desk:`; below it the header copy has the row to itself.
      const grid = figure.parentElement as HTMLElement
      expect(grid).toHaveClass("grid", "grid-cols-1", "desk:grid-cols-[minmax(0,1fr)_280px]")
      expect(within(grid).getByRole("heading", { level: 2 })).toHaveTextContent("Compare offers")
      expect(
        within(grid).getByText(
          "The highest price is not always the best offer. We rank offers on what you receive, when, and how likely the deal is to close."
        )
      ).toBeInTheDocument()
    })

    it("leans the envelope layer up to 6px toward the pointer over the figure and leaves the image itself alone", () => {
      render(<OfferComparison />)
      const figure = screen.getByTestId("offers-figure")
      const layer = screen.getByTestId("offers-figure-layer")
      setRect(figure, { top: 0, height: 200, width: 400 })
      pointer(figure, "pointermove", 400, 100)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      // The first frame eases 12% of the 6px maximum.
      expect(layer.style.transform).toBe("translate3d(0.72px, 0.00px, 0)")
      const img = within(layer).getByRole("img", { name: "Four sealed cream envelopes with brass clasps" })
      expect(img.style.transform).toBe("")
      pointer(figure, "pointermove", 400, 100, "touch")
      expect(drivers.pendingFrames()).toBe(1)
    })
  })
})
