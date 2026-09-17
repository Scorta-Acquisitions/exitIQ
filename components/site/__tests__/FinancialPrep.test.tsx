import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FinancialPrep } from "@/components/site/home/FinancialPrep"
import { DEMO_IDLE_MS } from "@/lib/site/demo/clock"
import {
  FINANCIAL_LINK_LABEL,
  FINANCIAL_WORDS,
  RIDGELINE_LINES,
  RIDGELINE_RANGE_AFTER,
  RIDGELINE_RANGE_BEFORE,
  USED_IN_ITEMS,
} from "@/lib/site/financial/data"
import { ANCHORS } from "@/lib/site/routes"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, stubMatchMedia } from "./scene-test-utils"

let now = 10_000
let drivers: SceneDrivers

const LINES = ["revenue", "ownerComp", "personal", "oneoff"] as const
type LineId = (typeof LINES)[number]

const demo = () => screen.getByTestId("fin-demo")
const foot = () => screen.getByTestId("fin-foot").textContent
const caption = () => screen.getByTestId("fin-foot-caption").textContent
const alt = () => screen.getByTestId("fin-foot-alt").textContent
const range = () => screen.getByTestId("fin-range").textContent
const line = (id: LineId) => screen.getByTestId(`fin-line-${id}`)
const status = (id: LineId) => screen.getByTestId(`fin-line-${id}-status`).textContent
const evidence = (id: LineId) => screen.getByTestId(`fin-line-${id}-evidence`).textContent
const banded = () => LINES.filter((id) => line(id).getAttribute("data-banded") === "true")

/** Put the screen on screen and take the loop's first reading, which costs the clock no time. */
function play() {
  act(() => drivers.intersect(demo(), true))
  act(() => drivers.flushFrames())
}

/** Let `ms` of wall clock pass and run the frame the loop has queued. */
function advance(ms: number) {
  now += ms
  act(() => drivers.flushFrames())
}

/** The pointer arriving over a row and leaving it: React reads its enter and leave from these two. */
function hover(el: Element) {
  act(() => {
    fireEvent.pointerOver(el, { relatedTarget: document.body })
  })
}
function unhover(el: Element) {
  act(() => {
    fireEvent.pointerOut(el, { relatedTarget: document.body })
  })
}

beforeEach(() => {
  drivers = installSceneDrivers()
  now = 10_000
  vi.spyOn(performance, "now").mockImplementation(() => now)
  window.history.replaceState({}, "", "/")
})
afterEach(() => {
  drivers.restore()
  vi.restoreAllMocks()
  restoreMatchMedia()
  window.history.replaceState({}, "", "/")
})

describe("FinancialPrep: the words beside the screen", () => {
  it("sets one heading, one sentence and one link to the reconciliation, with no eyebrow", () => {
    render(<FinancialPrep />)
    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading).toHaveTextContent("Financial preparation")
    expect(heading).not.toHaveClass("mt-3")
    expect(heading.parentElement!.firstElementChild).toBe(heading)
    expect(screen.getByText(FINANCIAL_WORDS.sentence)).toHaveClass("type-body", "text-fg-2")
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveTextContent(FINANCIAL_LINK_LABEL)
    expect(links[0]).toHaveAttribute("href", ANCHORS.financialPreparation)
    expect(ANCHORS.financialPreparation).toBe("/how-it-works#financial-preparation")
  })

  it("holds no button of its own: the demo is the argument", () => {
    render(<FinancialPrep />)
    expect(screen.queryAllByRole("button")).toHaveLength(0)
  })

  it("names the screen as one keyboard group over Project Ridgeline's adjusted earnings", () => {
    render(<FinancialPrep />)
    expect(demo()).toHaveAttribute("role", "group")
    expect(demo()).toHaveAttribute("aria-label", "Financial preparation, a worked example that plays itself")
    expect(demo()).toHaveAttribute("tabindex", "0")
    expect(screen.getByText("Project Ridgeline · Adjusted earnings")).toBeInTheDocument()
    expect(screen.getByText("Worked example")).toBeInTheDocument()
  })

  it("runs the ledger-glass film behind the screen at 35%, from the tablet breakpoint up", () => {
    render(<FinancialPrep />)
    expect(screen.getByTestId("fin-frame-film")).toHaveClass("hidden", "tab:block")
    expect(screen.getByTestId("ambient-video")).toHaveAttribute("poster", "/media/ledger-glass-poster.jpg")
    expect(screen.getByTestId("ambient-video")).toHaveClass("opacity-35")
  })
})

describe("FinancialPrep: the first beat", () => {
  it("opens with four lines open, the base figure and the lower valuation", () => {
    render(<FinancialPrep />)
    expect(demo()).toHaveAttribute("data-beat", "arrived")
    expect(demo()).toHaveAttribute("data-foot", "795200")
    expect(foot()).toBe("$795,200")
    expect(caption()).toBe("Before these four lines")
    expect(range()).toBe(RIDGELINE_RANGE_BEFORE)
    expect(LINES.map(status)).toEqual(["Not counted", "Open", "Open", "Open"])
    expect(LINES.map(evidence)).toEqual(["", "", "", ""])
    expect(alt()).toBe("")
  })

  it("keeps the record's line in place before there is a record, so the screen never changes height", () => {
    render(<FinancialPrep />)
    expect(screen.getByTestId("fin-line-revenue-evidence")).toHaveClass("min-h-3")
    expect(screen.getByTestId("fin-foot-alt")).toHaveClass("min-h-3")
  })

  it("reads the four places the figure will be used, none of them lit yet", () => {
    render(<FinancialPrep />)
    const used = within(screen.getByTestId("fin-used"))
    expect(screen.getByTestId("fin-used").textContent).toBe(USED_IN_ITEMS.join(""))
    USED_IN_ITEMS.forEach((label) => expect(used.getByText(label)).toHaveAttribute("data-lit", "false"))
  })
})

describe("FinancialPrep: the play", () => {
  it("settles one line per beat and moves the figure to what each record supports", () => {
    render(<FinancialPrep />)
    play()
    expect(foot()).toBe("$795,200")

    advance(1440)
    expect(demo()).toHaveAttribute("data-beat", "note")
    expect(status("revenue")).toBe("Timing, explained")
    expect(evidence("revenue")).toBe(RIDGELINE_LINES[0]!.evidence)
    expect(foot()).toBe("$795,200")
    expect(caption()).toBe("A note, not an add-back. The figure does not move.")

    advance(1620)
    expect(demo()).toHaveAttribute("data-foot", "822800")
    expect(status("ownerComp")).toBe("Supported")
    expect(caption()).toBe("$27,600 supported by the register")

    advance(1620)
    expect(foot()).toBe("$832,200")
    expect(evidence("personal")).toBe(RIDGELINE_LINES[2]!.evidence)

    advance(1620)
    expect(demo()).toHaveAttribute("data-beat", "invoice")
    expect(foot()).toBe("$845,000")
    expect(range()).toBe(RIDGELINE_RANGE_AFTER)
    expect(caption()).toBe("Shown to buyers, every line supported")

    advance(1440)
    expect(demo()).toHaveAttribute("data-beat", "used")
    expect(demo()).toHaveAttribute("data-demo-state", "ended")
    expect(alt()).toBe("$817,400 if the family payroll stays in costs")
    const used = within(screen.getByTestId("fin-used"))
    USED_IN_ITEMS.forEach((label) => expect(used.getByText(label)).toHaveAttribute("data-lit", "true"))
  })

  it("bands the line the beat settles, and only that one", () => {
    render(<FinancialPrep />)
    play()
    expect(banded()).toEqual([])
    advance(1440)
    expect(banded()).toEqual(["revenue"])
    advance(1620)
    expect(banded()).toEqual(["ownerComp"])
  })

  it("walks the band down the lines once the play has ended, changing no text", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] })
    render(<FinancialPrep />)
    play()
    advance(7740)
    expect(demo()).toHaveAttribute("data-demo-state", "ended")
    // The idle beat starts its own observer when the play ends; a real one reports on observing.
    act(() => drivers.intersect(demo(), true))
    const settled = LINES.map(status)
    expect(banded()).toEqual(["revenue"])
    act(() => vi.advanceTimersByTime(DEMO_IDLE_MS))
    expect(banded()).toEqual(["ownerComp"])
    act(() => vi.advanceTimersByTime(DEMO_IDLE_MS))
    expect(banded()).toEqual(["personal"])
    expect(LINES.map(status)).toEqual(settled)
    expect(foot()).toBe("$845,000")
    vi.useRealTimers()
  })
})

describe("FinancialPrep: the keyboard", () => {
  it("steps a beat at a time and speaks where it landed", () => {
    render(<FinancialPrep />)
    fireEvent.keyDown(demo(), { key: "ArrowRight" })
    expect(demo()).toHaveAttribute("data-beat", "note")
    expect(screen.getByText("Revenue timing, explained by a one-page note")).toHaveClass("sr-only")
    fireEvent.keyDown(demo(), { key: "ArrowRight" })
    expect(demo()).toHaveAttribute("data-foot", "822800")
    fireEvent.keyDown(demo(), { key: "ArrowLeft" })
    expect(demo()).toHaveAttribute("data-beat", "note")
    expect(foot()).toBe("$795,200")
  })

  it("replays from the first beat with Home and rests on the settled ledger with End", () => {
    render(<FinancialPrep />)
    fireEvent.keyDown(demo(), { key: "End" })
    expect(demo()).toHaveAttribute("data-beat", "used")
    expect(foot()).toBe("$845,000")
    fireEvent.keyDown(demo(), { key: "Home" })
    expect(demo()).toHaveAttribute("data-beat", "arrived")
    expect(foot()).toBe("$795,200")
  })
})

describe("FinancialPrep: the one alternative, previewed", () => {
  it("reads $817,400 and Left in costs while the pointer rests on the family payroll line", () => {
    render(<FinancialPrep />)
    fireEvent.keyDown(demo(), { key: "End" })
    hover(line("ownerComp"))
    expect(demo()).toHaveAttribute("data-preview", "ownerComp")
    expect(demo()).toHaveAttribute("data-foot", "817400")
    expect(foot()).toBe("$817,400")
    expect(status("ownerComp")).toBe("Left in costs")
    expect(evidence("ownerComp")).toBe("")
    expect(caption()).toBe("if the family payroll stays in costs")
    expect(range()).toBe(RIDGELINE_RANGE_BEFORE)

    unhover(line("ownerComp"))
    expect(demo()).not.toHaveAttribute("data-preview")
    expect(foot()).toBe("$845,000")
    expect(status("ownerComp")).toBe("Supported")
    expect(range()).toBe(RIDGELINE_RANGE_AFTER)
  })

  it("previews nothing before the demo has attached that record", () => {
    render(<FinancialPrep />)
    hover(line("ownerComp"))
    expect(demo()).not.toHaveAttribute("data-preview")
    expect(foot()).toBe("$795,200")
    expect(status("ownerComp")).toBe("Open")
  })

  it("bands whichever line the pointer rests on", () => {
    render(<FinancialPrep />)
    hover(line("personal"))
    expect(banded()).toEqual(["personal"])
    unhover(line("personal"))
    expect(banded()).toEqual([])
  })
})

describe("FinancialPrep: the still", () => {
  it("renders the settled ledger under reduced motion, with no clock running", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<FinancialPrep />)
    expect(demo()).toHaveAttribute("data-demo-state", "still")
    expect(demo()).toHaveAttribute("data-beat", "used")
    expect(drivers.pendingFrames()).toBe(0)
    expect(foot()).toBe("$845,000")
    expect(LINES.map(evidence)).toEqual(RIDGELINE_LINES.map((l) => l.evidence))
    expect(range()).toBe(RIDGELINE_RANGE_AFTER)
    expect(banded()).toEqual([])
  })

  it("freezes on the beat a URL names, and the keyboard still steps from there", () => {
    window.history.replaceState({}, "", "/?demo=fin:note")
    render(<FinancialPrep />)
    expect(demo()).toHaveAttribute("data-demo-state", "still")
    expect(demo()).toHaveAttribute("data-beat", "note")
    expect(foot()).toBe("$795,200")
    expect(LINES.map(evidence)).toEqual([RIDGELINE_LINES[0]!.evidence, "", "", ""])
    fireEvent.keyDown(demo(), { key: "ArrowRight" })
    expect(demo()).toHaveAttribute("data-beat", "register")
    expect(foot()).toBe("$822,800")
  })
})
