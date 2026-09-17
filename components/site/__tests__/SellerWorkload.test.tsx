import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SellerWorkload } from "@/components/site/home/SellerWorkload"
import { SALE_STAGES } from "@/lib/site/content/stages"
import { CLOSE_LINE, SECTION_LINK, SECTION_WORDS, TIMING_LINE } from "@/lib/site/decisions/data"
import { DEMO_HOLD_MS, DEMO_IDLE_MS } from "@/lib/site/demo/clock"
import { ROUTES } from "@/lib/site/routes"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, stubMatchMedia } from "./scene-test-utils"

let now = 10_000
let drivers: SceneDrivers

const demo = () => screen.getByTestId("dec-demo")
const row = (id: string) => screen.getByTestId(`dec-letter-${id}`)
const rowText = (id: string) => row(id).textContent
const state = (id: string) => row(id).getAttribute("data-state")
const rank = (id: string) => row(id).getAttribute("data-rank")
const beat = () => demo().getAttribute("data-beat")
/** The rows the idle beat is resting on: the band is a tint on the row's own button, never a light. */
const banded = () => screen.getAllByTestId(/^dec-letter-/).filter((el) => el.innerHTML.includes("bg-line-soft"))

/** Put the demo on screen and take the loop's first reading, which costs the clock no time. */
function play() {
  act(() => drivers.intersect(demo(), true))
  act(() => drivers.flushFrames())
}

/** Let `ms` of wall clock pass and run the frame the loop has queued. */
function advance(ms: number) {
  now += ms
  act(() => drivers.flushFrames())
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
  vi.useRealTimers()
  restoreMatchMedia()
  window.history.replaceState({}, "", "/")
})

describe("<SellerWorkload /> words", () => {
  it("sets a few words beside the screen and one link to the stages, with no eyebrow", () => {
    render(<SellerWorkload />)
    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading).toHaveTextContent("The whole sale asks four decisions of you.")
    expect(heading).not.toHaveClass("mt-3")
    expect(heading.parentElement!.firstElementChild).toBe(heading)
    expect(screen.getByText(SECTION_WORDS.sentence)).toBeInTheDocument()
    const link = screen.getByRole("link", { name: SECTION_LINK.label })
    expect(link).toHaveAttribute("href", `${ROUTES.howItWorks}#stages`)
    expect(screen.getAllByRole("link")).toHaveLength(1)
  })

  it("heads the screen with the worked example it is", () => {
    render(<SellerWorkload />)
    expect(screen.getByTestId("dec-frame")).toHaveTextContent("Project Ridgeline · Sale plan")
    expect(screen.getByTestId("dec-frame")).toHaveTextContent("Worked example")
  })

  it("carries the same four lines of the decision block at every beat", () => {
    render(<SellerWorkload />)
    play()
    const lines = () => ["dec-question", "dec-answer", "dec-caption"].map((id) => screen.getByTestId(id).textContent)
    expect(lines()).toEqual(["When would you want the sale to close?", "In 1 to 2 years", "as one owner chose"])
    fireEvent.keyDown(demo(), { key: "ArrowRight" })
    expect(lines()).toEqual(["Next decision at Privacy", "Financials, Valuation", "ready before the next decision"])
    fireEvent.keyDown(demo(), { key: "End" })
    expect(lines()).toEqual(["A completed ownership transfer.", CLOSE_LINE, "as one owner chose"])
  })

  it("names the demo as one keyboard group and marks its first beat", () => {
    render(<SellerWorkload />)
    expect(demo()).toHaveAttribute("role", "group")
    expect(demo()).toHaveAttribute("aria-label", "The four decisions, a worked example that plays itself")
    expect(demo()).toHaveAttribute("tabindex", "0")
    expect(beat()).toBe("goals")
    expect(demo()).toHaveAttribute("data-cycle", "0")
  })
})

describe("<SellerWorkload /> the still", () => {
  it("renders the close with every stage lit, the competitor struck and the chosen letter first", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<SellerWorkload />)
    expect(demo()).toHaveAttribute("data-demo-state", "still")
    expect(beat()).toBe("close")
    expect(screen.getByTestId(`dec-stage-${SALE_STAGES.length}`)).toHaveAttribute("data-stage-state", "done")
    expect(screen.getByTestId("dec-stage-1")).toHaveAttribute("data-stage-state", "done")
    expect(state("D")).toBe("removed")
    expect(rowText("D")).toContain("Left the table · Competitor in an overlapping service area")
    expect(row("D").innerHTML).toContain("line-through")
    expect(state("B")).toBe("filtered")
    expect(rowText("B")).toContain("Not on the calendar")
    expect(state("C")).toBe("winner")
    expect(rank("C")).toBe("1")
    expect(rowText("C")).toContain("Chosen · High certainty")
    expect(screen.getByTestId("dec-timing")).toHaveTextContent(TIMING_LINE)
    expect(screen.getByTestId("dec-decision")).toHaveTextContent(CLOSE_LINE)
    expect(demo()).toHaveAttribute("data-on-table", "A,C")
  })

  it("counts Heirloom's nine tasks and lights the priority the owner chose", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<SellerWorkload />)
    expect(screen.getByTestId("dec-handled")).toHaveTextContent("Handled without you · 9 of 9 · Send a weekly update")
    expect(screen.getByTestId("dec-priority-certainty")).toHaveAttribute("data-lit", "true")
    expect(screen.getByTestId("dec-priority-cash")).toHaveAttribute("data-lit", "false")
    expect(screen.getByTestId("dec-priority-certainty")).toHaveTextContent("Highest chance of closing")
  })

  it("runs no frame loop when the visitor asked for reduced motion", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<SellerWorkload />)
    expect(drivers.pendingFrames()).toBe(0)
    expect(banded()).toHaveLength(0)
  })
})

describe("<SellerWorkload /> a named beat", () => {
  it("freezes on the beat the query string names, with the offer's own word lit", () => {
    window.history.replaceState({}, "", "/?demo=dec:offers")
    render(<SellerWorkload />)
    expect(beat()).toBe("offers")
    expect(demo()).toHaveAttribute("data-demo-state", "still")
    expect(screen.getByTestId("dec-timing")).toHaveTextContent(TIMING_LINE)
    expect(screen.getByTestId("dec-priority-certainty")).toHaveAttribute("data-lit", "true")
    expect(screen.getByTestId("dec-decision")).toHaveTextContent("Decision 4 of 4 · Offers")
    expect(screen.getByTestId("dec-decision")).toHaveTextContent("Highest chance of closing")
    expect(rank("C")).toBe("1")
    expect(screen.getByTestId("dec-handled")).toHaveTextContent("9 of 9")
  })

  it("freezes the meetings beat with the letters face up and the contingent buyer waiting", () => {
    window.history.replaceState({}, "", "/?demo=dec:meetings")
    render(<SellerWorkload />)
    expect(beat()).toBe("meetings")
    expect(rowText("A")).toContain("Regional consolidator")
    expect(rowText("A")).toContain("$4.30M")
    expect(rowText("B")).toContain("SBA 7(a), contingent, no prior closes")
    expect(state("C")).toBe("on")
    expect(demo()).toHaveAttribute("data-on-table", "A,C")
    // Nothing is struck but the letter an exclusion removed; the buyer off the calendar is dimmed.
    expect(row("B").innerHTML).not.toContain("line-through")
    expect(row("D").innerHTML).toContain("line-through")
    // The plan's own facts stand at every beat, so no row arrives late and nothing is reserved empty.
    expect(screen.getByTestId("dec-priorities")).toBeInTheDocument()
    expect(screen.getByTestId("dec-priority-certainty")).toHaveAttribute("data-lit", "false")
    expect(screen.getByTestId("dec-timing")).toHaveTextContent(TIMING_LINE)
  })
})

describe("<SellerWorkload /> the play", () => {
  it("steps its beats in order once on screen and rests on the close", () => {
    render(<SellerWorkload />)
    play()
    expect(beat()).toBe("goals")
    expect(demo()).toHaveAttribute("data-lit", "1")
    expect(state("D")).toBe("sealed")
    expect(rowText("D")).toContain("Not yet received")
    advance(1800)
    expect(beat()).toBe("numbers")
    expect(screen.getByTestId("dec-decision")).toHaveTextContent("Next decision at Privacy")
    advance(1800)
    expect(beat()).toBe("privacy")
    expect(state("D")).toBe("removed")
    expect(rowText("D")).toContain("$4.65M")
    expect(demo()).toHaveAttribute("data-on-table", "A,B,C")
    advance(1800)
    expect(beat()).toBe("market")
    expect(demo()).toHaveAttribute("data-lit", "5")
    expect(demo()).toHaveAttribute("data-on-table", "A,B,C")
    advance(1350)
    expect(beat()).toBe("meetings")
    advance(1350)
    expect(beat()).toBe("offers")
    advance(1350)
    expect(beat()).toBe("close")
    expect(demo()).toHaveAttribute("data-demo-state", "ended")
    expect(demo()).toHaveAttribute("data-lit", "8")
  })

  it("pauses under the pointer and runs again when it leaves", () => {
    render(<SellerWorkload />)
    play()
    fireEvent.pointerEnter(demo())
    expect(demo()).toHaveAttribute("data-demo-state", "paused")
    advance(3600)
    expect(beat()).toBe("goals")
    fireEvent.pointerLeave(demo())
    expect(demo()).toHaveAttribute("data-demo-state", "playing")
    // The first frame after a pause only takes the clock's reading, so the pause costs the demo no time.
    advance(0)
    advance(1800)
    expect(beat()).toBe("numbers")
  })

  it("steps forward and back with the arrow keys and speaks where it landed", () => {
    render(<SellerWorkload />)
    play()
    fireEvent.keyDown(demo(), { key: "ArrowRight" })
    expect(beat()).toBe("numbers")
    fireEvent.keyDown(demo(), { key: "ArrowRight" })
    expect(beat()).toBe("privacy")
    expect(screen.getByText("Decision 2 of 4 · Privacy. Competitors in my service area")).toBeInTheDocument()
    fireEvent.keyDown(demo(), { key: "ArrowLeft" })
    expect(beat()).toBe("numbers")
    fireEvent.keyDown(demo(), { key: "End" })
    expect(beat()).toBe("close")
    fireEvent.keyDown(demo(), { key: "Home" })
    expect(beat()).toBe("goals")
  })

  it("steps back from the close to the offers beat, the same rows in place", () => {
    render(<SellerWorkload />)
    play()
    fireEvent.keyDown(demo(), { key: "End" })
    const rows = screen.getAllByTestId(/^dec-/).length
    expect(screen.getByTestId("dec-decision")).toHaveTextContent(CLOSE_LINE)
    fireEvent.keyDown(demo(), { key: "ArrowLeft" })
    expect(beat()).toBe("offers")
    expect(screen.getAllByTestId(/^dec-/).length).toBe(rows)
    expect(screen.getByTestId("dec-timing")).toHaveTextContent(TIMING_LINE)
    expect(screen.getByTestId("dec-priority-certainty")).toHaveAttribute("data-lit", "true")
  })
})

describe("<SellerWorkload /> the replay", () => {
  it("comes round again with every row still in place, only the words changed", () => {
    render(<SellerWorkload />)
    play()
    const rows = () =>
      screen
        .getAllByTestId(/^dec-/)
        .map((el) => el.getAttribute("data-testid"))
        .sort()
    const atFirstBeat = rows()
    advance(9450)
    expect(beat()).toBe("close")
    expect(demo()).toHaveAttribute("data-demo-state", "ended")
    const atClose = rows()
    expect(atClose).toEqual(atFirstBeat)
    // The hold, then the demo plays again from the first beat one cycle on.
    advance(DEMO_HOLD_MS)
    expect(demo()).toHaveAttribute("data-cycle", "1")
    expect(beat()).toBe("goals")
    expect(rows()).toEqual(atClose)
    expect(screen.getByTestId("dec-timing")).toHaveTextContent(TIMING_LINE)
    expect(screen.getByTestId("dec-priority-certainty")).toHaveAttribute("data-lit", "false")
    expect(rowText("A")).toContain("Not yet received")
  })
})

describe("<SellerWorkload /> the previews", () => {
  it("ranks all four envelopes by a priority word, the owner's own exclusions struck at their places", () => {
    window.history.replaceState({}, "", "/?demo=dec:close")
    render(<SellerWorkload />)
    fireEvent.pointerEnter(screen.getByTestId("dec-priority-cash"), { pointerType: "mouse" })
    expect(demo()).toHaveAttribute("data-preview", "cash")
    expect(rank("D")).toBe("1")
    expect(rank("C")).toBe("2")
    expect(rank("A")).toBe("3")
    expect(rank("B")).toBe("4")
    expect(rowText("D")).toContain("Left the table · removed by your rules")
    expect(row("D").innerHTML).toContain("line-through")
    expect(rowText("B")).toContain("Not on the calendar · not met")
    fireEvent.pointerLeave(screen.getByTestId("dec-priority-cash"), { pointerType: "mouse" })
    expect(demo()).toHaveAttribute("data-preview", "")
    expect(rank("C")).toBe("1")
    expect(rowText("C")).toContain("Chosen")
  })

  it("reads a letter's own figures while the pointer rests on its row", () => {
    window.history.replaceState({}, "", "/?demo=dec:close")
    render(<SellerWorkload />)
    const button = within(row("A")).getByRole("button")
    fireEvent.pointerEnter(button, { pointerType: "mouse" })
    expect(demo()).toHaveAttribute("data-preview", "A")
    expect(rowText("A")).toContain("Headline $4.30M · Cash $2.75M · Certainty 0.82 · Staff plan 95 of 100")
    fireEvent.pointerLeave(button, { pointerType: "mouse" })
    expect(rowText("A")).not.toContain("Headline $4.30M")
  })

  it("adds the record behind the exclusion to the letter the rule removed", () => {
    window.history.replaceState({}, "", "/?demo=dec:close")
    render(<SellerWorkload />)
    fireEvent.pointerEnter(within(row("D")).getByRole("button"), { pointerType: "mouse" })
    expect(rowText("D")).toContain("Two prior acquisitions saw duplicate roles removed within a year.")
  })

  it("keeps a sealed letter out of reach: there is nothing yet to read", () => {
    render(<SellerWorkload />)
    play()
    expect(within(row("D")).queryByRole("button")).toBeNull()
    expect(rowText("D")).toContain("Not yet received")
  })

  it("previews from the keyboard too: focus opens a row and a word, blur closes them", () => {
    window.history.replaceState({}, "", "/?demo=dec:close")
    render(<SellerWorkload />)
    const button = within(row("A")).getByRole("button")
    act(() => button.focus())
    expect(demo()).toHaveAttribute("data-preview", "A")
    act(() => button.blur())
    expect(demo()).toHaveAttribute("data-preview", "")
    const word = screen.getByTestId("dec-priority-team")
    act(() => word.focus())
    expect(demo()).toHaveAttribute("data-preview", "team")
    expect(rank("A")).toBe("1")
    act(() => word.blur())
    expect(demo()).toHaveAttribute("data-preview", "")
  })

  it("opens and closes a priority on a press, and the rows rank with it", () => {
    window.history.replaceState({}, "", "/?demo=dec:close")
    render(<SellerWorkload />)
    const word = screen.getByTestId("dec-priority-upside")
    fireEvent.click(word)
    expect(demo()).toHaveAttribute("data-preview", "upside")
    expect(word).toHaveAttribute("aria-pressed", "true")
    expect(rank("B")).toBe("1")
    fireEvent.click(word)
    expect(demo()).toHaveAttribute("data-preview", "")
    expect(rank("C")).toBe("1")
  })

  it("opens and closes a letter on a press, for a visitor with no pointer to rest", () => {
    window.history.replaceState({}, "", "/?demo=dec:close")
    render(<SellerWorkload />)
    const button = within(row("C")).getByRole("button")
    // A touch pointer never previews on entry (`fromMouse` in demo/usePreviewHandlers), so the press alone does the work.
    fireEvent.click(button)
    expect(demo()).toHaveAttribute("data-preview", "C")
    expect(button).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(button)
    expect(demo()).toHaveAttribute("data-preview", "")
  })
})

describe("<SellerWorkload /> the idle beat", () => {
  it("walks a band down the letter rows only once the demo has come to rest", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] })
    render(<SellerWorkload />)
    play()
    expect(banded()).toHaveLength(0)
    advance(9450)
    expect(demo()).toHaveAttribute("data-demo-state", "ended")
    // The idle beat only starts watching once the play has ended, so the section reports itself again here.
    act(() => drivers.intersect(demo(), true))
    const before = screen.getByTestId("dec-decision").textContent
    expect(banded().map((el) => el.getAttribute("data-testid"))).toEqual(["dec-letter-A"])
    act(() => vi.advanceTimersByTime(DEMO_IDLE_MS))
    expect(banded().map((el) => el.getAttribute("data-testid"))).toEqual(["dec-letter-B"])
    act(() => vi.advanceTimersByTime(DEMO_IDLE_MS))
    expect(banded().map((el) => el.getAttribute("data-testid"))).toEqual(["dec-letter-C"])
    // The beat is a band and nothing else: no word on the screen changes while it walks.
    expect(screen.getByTestId("dec-decision").textContent).toBe(before)
  })
})
