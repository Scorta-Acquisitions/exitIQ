import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { BAND } from "@/components/site/demo/classes"
import { PrivacyScene } from "@/components/site/scenes/PrivacyScene"
import { RECORD_FIELDS } from "@/lib/site/confidentiality/data"
import { DEMO_IDLE_MS } from "@/lib/site/demo/clock"
import { TAB_BREAKPOINT } from "@/lib/site/scroll"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, stubMatchMedia } from "./scene-test-utils"
import { renderWithSite } from "./test-utils"

const realInnerWidth = window.innerWidth

function setWidth(value: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value })
}

let now = 10_000
let drivers: SceneDrivers

const root = () => screen.getByTestId("priv-demo")
const record = () => screen.getByTestId("company-record")
const levelLine = () => screen.getByTestId("priv-level")
const buyer = (key: string) => screen.getByTestId(`priv-buyer-${key}`)
const caption = (key: string) => screen.getByTestId(`priv-buyer-${key}-caption`)
const logRows = () => screen.getByTestId("priv-log").querySelectorAll("li")
const announced = () => screen.getByTestId("priv-announce").textContent
/** The record's value cell for a field, by the row's label. */
const valueOf = (label: string) => within(record()).getByText(label).parentElement!.querySelector("span:last-child")!

/** Put the demo on screen and take the loop's first reading, which costs the clock no time. */
function play() {
  act(() => drivers.intersect(root(), true))
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
  setWidth(1024)
  window.history.replaceState({}, "", "/")
})

afterEach(() => {
  drivers.restore()
  vi.restoreAllMocks()
  vi.useRealTimers()
  restoreMatchMedia()
  setWidth(realInnerWidth)
  window.history.replaceState({}, "", "/")
})

describe("PrivacyScene: the words and the screen", () => {
  it("sets the section's few words, its one link and the frame's header", () => {
    renderWithSite(<PrivacyScene />)
    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading).toHaveTextContent("Who sees what")
    expect(heading).toHaveClass("type-display-lg", "text-fg")
    expect(
      screen.getByText(
        "Buyers start with an anonymous overview. They learn your name after signing an NDA and see detailed records only after we qualify them."
      )
    ).toHaveClass("type-body", "text-fg-2")
    const link = screen.getByRole("link", { name: "The six levels" })
    expect(link).toHaveAttribute("href", "/confidentiality")
    expect(screen.getByTestId("privacy-scene")).toHaveAttribute("data-tone", "dark")
    expect(screen.getByText("Project Ridgeline · Company record")).toBeInTheDocument()
    expect(screen.getByText("Worked example")).toBeInTheDocument()
  })

  it("names the demo as one keyboard-reachable group on its first beat", () => {
    renderWithSite(<PrivacyScene />)
    expect(root()).toHaveAttribute("role", "group")
    expect(root()).toHaveAttribute("aria-label", "Who sees what, a worked example that plays itself")
    expect(root()).toHaveAttribute("tabindex", "0")
    expect(root()).toHaveAttribute("data-beat", "rules")
    expect(root()).toHaveAttribute("data-demo-state", "playing")
    expect(root()).toHaveAttribute("data-level", "0")
    expect(root()).toHaveAttribute("data-viewer", "none")
    expect(root()).toHaveAttribute("data-preview", "")
    expect(announced()).toBe("")
  })

  it("opens with nothing public, the competitor already stopped and one advisor line in the log", () => {
    renderWithSite(<PrivacyScene />)
    expect(within(record()).getByText("Company record")).toBeInTheDocument()
    expect(levelLine()).toHaveTextContent("Level 0 · Nothing public · Visible 0 of 5")
    expect(valueOf("Company name")).toHaveTextContent("No sale record")
    expect(valueOf("Company name")).toHaveClass("bg-fg/10", "rounded-xs", "px-1.5")
    expect(caption("competitor").textContent).toBe("Matched an owner exclusion · never contacted")
    expect(buyer("competitor")).toHaveAttribute("data-state", "stopped")
    expect(caption("pe").textContent).toBe("Not yet contacted")
    expect(buyer("pe")).toHaveAttribute("data-state", "waiting")
    expect(logRows()).toHaveLength(2)
    expect(logRows()[0]).toHaveTextContent("Heirloom · Revoked Northgate HVAC access · Matched an owner exclusion")
    expect(logRows()[1]).toHaveTextContent("No entry yet")
    expect(logRows()[1]).toHaveAttribute("data-pending", "true")
  })

  it("lists the four buyers in reach order as 44px toggles, under the closing-parties line", () => {
    renderWithSite(<PrivacyScene />)
    const keys = ["competitor", "strategic", "individual", "pe"]
    const buttons = screen.getByTestId("priv-buyers").querySelectorAll("button")
    expect(Array.from(buttons).map((b) => b.getAttribute("data-testid"))).toEqual(keys.map((k) => `priv-buyer-${k}`))
    for (const key of keys) {
      expect(buyer(key)).toHaveClass("min-h-[44px]")
      expect(buyer(key)).toHaveAttribute("aria-pressed", "false")
    }
    expect(screen.getByTestId("priv-closing").textContent).toBe(
      "L5 · Closing parties only · closing documents move outside the buyer log"
    )
  })
})

describe("PrivacyScene: the play", () => {
  it("opens the record one level at a time and rests on the last beat", () => {
    renderWithSite(<PrivacyScene />)
    play()
    expect(root()).toHaveAttribute("data-beat", "rules")

    advance(1800)
    expect(root()).toHaveAttribute("data-beat", "overview")
    expect(root()).toHaveAttribute("data-level", "1")
    expect(root()).toHaveAttribute("data-viewer", "matching")
    expect(within(record()).getByText("Viewing as a buyer who matches your rules")).toBeInTheDocument()
    expect(levelLine()).toHaveTextContent("Level 1 · Anonymous overview · Visible 2 of 5")
    expect(valueOf("Location")).toHaveTextContent("Southeastern United States")
    expect(valueOf("Location")).not.toHaveClass("bg-fg/10")
    expect(caption("pe").textContent).toBe("Anonymous overview · L1")

    advance(1800)
    expect(root()).toHaveAttribute("data-beat", "nda")
    expect(root()).toHaveAttribute("data-viewer", "strategic")
    expect(valueOf("Company name")).toHaveTextContent("Ridgeline Mechanical Services, Inc.")
    expect(levelLine()).toHaveTextContent("Level 2 · NDA signed · Visible 3 of 5")
    expect(logRows()[0]).toHaveTextContent("K. Ortiz · Meridian Trades Group · Signed NDA · Wednesday, 9:03 AM")

    advance(1800)
    expect(root()).toHaveAttribute("data-beat", "qualified")
    expect(valueOf("Largest customer")).toHaveTextContent("Regional grocery group, contracted through 2029")
    expect(valueOf("Adjusted earnings")).toHaveTextContent("$845K, with the adjustment schedule")
    expect(caption("individual").textContent).toBe("Buyer qualified · L3")

    advance(1800)
    expect(root()).toHaveAttribute("data-beat", "selected")
    expect(root()).toHaveAttribute("data-level", "4")
    expect(valueOf("Location")).toHaveTextContent("Greenville, South Carolina, two facilities")
    expect(valueOf("Largest customer")).toHaveTextContent("Carolina Foods Group, 14%, contract attached")
    expect(caption("strategic").textContent).toBe("NDA signed · L2")

    advance(1800)
    expect(root()).toHaveAttribute("data-beat", "expired")
    expect(root()).toHaveAttribute("data-demo-state", "ended")
    expect(levelLine()).toHaveTextContent("Level 4 · Final diligence · Visible 5 of 5")
    expect(logRows()).toHaveLength(2)
    expect(logRows()[0]).toHaveTextContent("Heirloom · R. Sandoval access expired after 30 days")
  })

  it("walks the band down the record's rows only once the play has ended", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] })
    renderWithSite(<PrivacyScene />)
    play()
    const banded = () => Array.from(record().querySelectorAll("div")).filter((d) => d.classList.contains(BAND))
    advance(1800)
    expect(banded()).toHaveLength(0)
    advance(7200)
    expect(root()).toHaveAttribute("data-demo-state", "ended")
    // The idle beat starts watching only once the play has ended; the observer reports the section then.
    act(() => drivers.intersect(root(), true))
    expect(banded()).toHaveLength(1)
    expect(banded()[0]).toHaveTextContent("Company name")
    act(() => vi.advanceTimersByTime(DEMO_IDLE_MS))
    expect(banded()).toHaveLength(1)
    expect(banded()[0]).toHaveTextContent("Location")
    act(() => vi.advanceTimersByTime(DEMO_IDLE_MS))
    expect(banded()[0]).toHaveTextContent("Last 12 months revenue")
    // The band changes no word: the record still reads the level the play ended on.
    expect(valueOf("Company name")).toHaveTextContent("Ridgeline Mechanical Services, Inc.")
    expect(levelLine()).toHaveTextContent("Level 4 · Final diligence · Visible 5 of 5")
  })
})

describe("PrivacyScene: the screen holds its shape", () => {
  it("keeps two log rows from the first beat and fills them as the history records a view", () => {
    renderWithSite(<PrivacyScene />)
    play()
    const pending = () => Array.from(logRows()).filter((li) => li.getAttribute("data-pending") === "true").length
    expect(logRows()).toHaveLength(2)
    expect(pending()).toBe(1)
    advance(3600)
    expect(root()).toHaveAttribute("data-beat", "nda")
    expect(logRows()).toHaveLength(2)
    expect(pending()).toBe(0)
    expect(logRows()[1]).toHaveTextContent("Heirloom · Revoked Northgate HVAC access · Matched an owner exclusion")
    advance(5400)
    expect(logRows()).toHaveLength(2)
    expect(pending()).toBe(0)
    expect(logRows()[0]).toHaveTextContent("Heirloom · R. Sandoval access expired after 30 days")
  })

  it("staggers the record's values in order on the first play and changes them in place on the replay", () => {
    renderWithSite(<PrivacyScene />)
    play()
    const delays = () => RECORD_FIELDS.slice(0, 5).map((f) => (valueOf(f.l) as HTMLElement).style.animationDelay)
    // `demoStagger(0, i)`: 60ms apart, capped at 300, the grammar the other demo rows follow.
    expect(delays()).toEqual(["0ms", "60ms", "120ms", "180ms", "240ms"])
    advance(9000)
    expect(root()).toHaveAttribute("data-demo-state", "ended")
    advance(8000)
    expect(root()).toHaveAttribute("data-cycle", "1")
    // `demoStagger(1, i)`: on a replay nothing re-staggers from nothing, so every value changes where it is.
    expect(delays()).toEqual(Array.from({ length: 5 }, () => "0ms"))
  })

  it("takes no row away when the play comes round again", () => {
    renderWithSite(<PrivacyScene />)
    play()
    advance(9000)
    expect(root()).toHaveAttribute("data-demo-state", "ended")
    const ended = root().querySelectorAll("*").length
    advance(8000)
    expect(root()).toHaveAttribute("data-cycle", "1")
    expect(root()).toHaveAttribute("data-beat", "rules")
    expect(root().querySelectorAll("*").length).toBe(ended)
    expect(logRows()).toHaveLength(2)
    expect(levelLine()).toHaveTextContent("Level 0 · Nothing public · Visible 0 of 5")
  })

  it("holds every record value to two lines and the title to one, so the card never moves", () => {
    renderWithSite(<PrivacyScene />)
    for (const field of RECORD_FIELDS.slice(0, 5)) {
      expect(valueOf(field.l)).toHaveClass("line-clamp-2", "min-h-[41px]")
    }
    expect(within(record()).getByText("Company record")).toHaveClass("line-clamp-1", "min-h-[19px]")
    expect(levelLine()).toHaveClass("truncate")
    expect(logRows()[0]).toHaveClass("truncate")
  })
})

describe("PrivacyScene: the still", () => {
  it("renders the finished record with no frame loop under reduced motion", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    renderWithSite(<PrivacyScene />)
    expect(root()).toHaveAttribute("data-demo-state", "still")
    expect(root()).toHaveAttribute("data-beat", "expired")
    expect(drivers.pendingFrames()).toBe(0)
    expect(within(record()).getByText("Viewing as Cadence Facility Partners")).toBeInTheDocument()
    expect(levelLine()).toHaveTextContent("Level 4 · Final diligence · Visible 5 of 5")
    expect(logRows()).toHaveLength(2)
    expect(valueOf("Largest customer")).toHaveTextContent("Carolina Foods Group, 14%, contract attached")
    const film = screen.getByTestId("privacy-room-frame").querySelector("video")!
    expect(film).toHaveAttribute("poster", "/media/privacy-room-poster.jpg")
    expect(film).not.toHaveAttribute("src")
    for (const el of [levelLine(), caption("pe"), logRows()[0]!]) {
      expect(el).toHaveClass("motion-reduce:animate-none")
    }
  })
})

describe("PrivacyScene: the buyer preview", () => {
  it("shows the excluded competitor nothing, with its own revocation at the top of the log", () => {
    renderWithSite(<PrivacyScene />)
    play()
    advance(7200)
    expect(root()).toHaveAttribute("data-level", "4")

    fireEvent.pointerOver(buyer("competitor"))
    expect(root()).toHaveAttribute("data-preview", "competitor")
    expect(root()).toHaveAttribute("data-level", "0")
    expect(root()).toHaveAttribute("data-viewer", "competitor")
    expect(within(record()).getByText("Viewing as Northgate HVAC")).toBeInTheDocument()
    expect(valueOf("Company name")).toHaveTextContent("No sale record")
    expect(levelLine()).toHaveTextContent("Level 0 · Nothing public · Visible 0 of 5")
    expect(logRows()[0]).toHaveTextContent("Heirloom · Revoked Northgate HVAC access · Matched an owner exclusion")
    expect(logRows()[0]).toHaveClass(BAND)
    expect(buyer("competitor")).toHaveAttribute("aria-pressed", "true")
    // The buyer list keeps the beat's own rows: the preview is of the record, not of the play.
    expect(caption("pe").textContent).toBe("Final diligence · L4")

    fireEvent.pointerOut(buyer("competitor"), { relatedTarget: document.body })
    expect(root()).toHaveAttribute("data-preview", "")
    expect(root()).toHaveAttribute("data-level", "4")
    expect(valueOf("Largest customer")).toHaveTextContent("Carolina Foods Group, 14%, contract attached")
  })

  it("stops each buyer at the level it reached, and never at the closing parties", () => {
    renderWithSite(<PrivacyScene />)
    play()
    for (const [key, level] of [
      ["strategic", "2"],
      ["individual", "3"],
      ["pe", "4"],
    ] as const) {
      fireEvent.pointerOver(buyer(key))
      expect(root()).toHaveAttribute("data-level", level)
      fireEvent.pointerOut(buyer(key), { relatedTarget: document.body })
    }
    fireEvent.pointerOver(buyer("pe"))
    expect(root()).toHaveAttribute("data-level", "4")
    expect(valueOf("Adjusted earnings")).toHaveTextContent("$845K, with full supporting records")
    // L5 is the closing parties' own level: the furthest buyer never reads the closing addresses.
    expect(valueOf("Location")).toHaveTextContent("Greenville, South Carolina, two facilities")
    expect(within(record()).queryByText("Full addresses for closing parties")).toBeNull()
  })

  it("previews from the keyboard as well, and speaks each step once", () => {
    renderWithSite(<PrivacyScene />)
    play()
    act(() => buyer("individual").focus())
    expect(root()).toHaveAttribute("data-preview", "individual")
    expect(valueOf("Adjusted earnings")).toHaveTextContent("$845K, with the adjustment schedule")
    act(() => buyer("individual").blur())
    expect(root()).toHaveAttribute("data-preview", "")

    fireEvent.keyDown(root(), { key: "ArrowRight" })
    expect(root()).toHaveAttribute("data-beat", "overview")
    expect(announced()).toBe("Level 1: an anonymous overview, two of five fields")
    fireEvent.keyDown(root(), { key: "ArrowLeft" })
    expect(root()).toHaveAttribute("data-beat", "rules")
    fireEvent.keyDown(root(), { key: "End" })
    expect(root()).toHaveAttribute("data-beat", "expired")
    fireEvent.keyDown(root(), { key: "Home" })
    expect(root()).toHaveAttribute("data-beat", "rules")
  })

  it("turns the preview into a toggling tap where the pointer cannot hover", () => {
    stubMatchMedia(["hover: none"])
    renderWithSite(<PrivacyScene />)
    play()
    fireEvent.pointerOver(buyer("pe"))
    expect(root()).toHaveAttribute("data-preview", "")
    fireEvent.click(buyer("pe"))
    expect(root()).toHaveAttribute("data-preview", "pe")
    expect(root()).toHaveAttribute("data-level", "4")
    fireEvent.click(buyer("pe"))
    expect(root()).toHaveAttribute("data-preview", "")
    expect(root()).toHaveAttribute("data-level", "0")
  })
})

describe("PrivacyScene: the phone", () => {
  it("shows four compact record rows and one log line, and keeps the film off", () => {
    setWidth(390)
    renderWithSite(<PrivacyScene />)
    play()
    advance(9000)
    const labels = Array.from(record().querySelectorAll("span.type-fine-print")).map((s) => s.textContent)
    expect(labels).toEqual(["Company name", "Location", "Last 12 months revenue", "Adjusted earnings"])
    expect(valueOf("Location")).toHaveClass("type-caption")
    expect(logRows()).toHaveLength(1)
    expect(logRows()[0]).toHaveTextContent("Heirloom · R. Sandoval access expired after 30 days")
    expect(screen.getByTestId("privacy-room-frame")).toHaveClass("hidden", "tab:block")
  })

  it("shows the company's name alone at 320, where the frame has one screen", () => {
    setWidth(320)
    renderWithSite(<PrivacyScene />)
    play()
    advance(9000)
    expect(record().querySelectorAll("span.type-fine-print")).toHaveLength(1)
    expect(valueOf("Company name")).toHaveTextContent("Ridgeline Mechanical Services, Inc.")
    expect(levelLine()).toHaveTextContent("L4 · Final diligence · 5 of 5")
    expect(within(record()).getByText("Viewing as Cadence Facility Partners")).toHaveClass("line-clamp-2")
    expect(logRows()).toHaveLength(1)
    expect(logRows()[0]).toHaveTextContent("Heirloom · R. Sandoval access expired after 30 days")
  })

  it("keeps the wide record at exactly the tablet breakpoint, and a resize to the same width changes nothing", () => {
    setWidth(TAB_BREAKPOINT)
    expect(TAB_BREAKPOINT).toBe(736)
    const { rerender } = renderWithSite(<PrivacyScene />)
    expect(record().querySelectorAll("span.type-fine-print")).toHaveLength(5)
    expect(logRows()).toHaveLength(2)
    // The measure only re-renders on a width that actually changed, so the rows stay as they are.
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(record().querySelectorAll("span.type-fine-print")).toHaveLength(5)
    expect(logRows()).toHaveLength(2)
    rerender(<PrivacyScene />)
    expect(within(record()).getByText("Largest customer")).toBeInTheDocument()
  })

  it("goes back to the five-row record when the window widens", () => {
    setWidth(390)
    renderWithSite(<PrivacyScene />)
    expect(record().querySelectorAll("span.type-fine-print")).toHaveLength(4)
    expect(within(record()).queryByText("Largest customer")).toBeNull()
    setWidth(1200)
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(within(record()).getByText("Largest customer")).toBeInTheDocument()
    expect(record().querySelectorAll("span.type-fine-print")).toHaveLength(5)
    expect(logRows()).toHaveLength(2)
  })
})
