import { fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PrivacyScene } from "@/components/site/scenes/PrivacyScene"
import { PERMISSION_LEVELS, RECORD_FIELDS } from "@/lib/site/confidentiality/data"
import { driveScene, installSceneDrivers, pinViewport, type SceneDrivers } from "./scene-test-utils"

const realMatchMedia = window.matchMedia

function reducedMotion(matches: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

/** The seven record rows as [label, value] for the record currently on screen. */
function recordRows() {
  const record = screen.getByTestId("company-record")
  return RECORD_FIELDS.slice(0, 7).map((f) => {
    const label = within(record).getByText(f.l)
    const value = label.nextElementSibling as HTMLElement
    return [f.l, value.textContent] as const
  })
}

describe("<PrivacyScene />", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
    pinViewport(1000)
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
    HTMLMediaElement.prototype.pause = vi.fn()
  })
  afterEach(() => {
    drivers.restore()
    pinViewport(768)
    window.matchMedia = realMatchMedia
  })

  it("keeps the panel pinned with the sticky and top-[78px] classes on the scene root's direct child", () => {
    render(<PrivacyScene />)
    const panel = screen.getByTestId("privacy-scene").firstElementChild as HTMLElement
    expect(panel).toHaveClass("sticky")
    expect(panel).toHaveClass("top-[78px]")
  })

  it("starts at level L1 'Anonymous overview' before any scrolling", () => {
    render(<PrivacyScene />)
    const level = screen.getByTestId("privacy-level")
    expect(level).toHaveTextContent("L1")
    expect(level).toHaveClass("text-glow-filament")
    expect(level.nextElementSibling).toHaveTextContent("Anonymous overview")
    expect(screen.getByText(PERMISSION_LEVELS[1]!.trig)).toBeInTheDocument()
  })

  it("shows the anonymous-overview record at L1: name and owner hidden, revenue as a range", () => {
    render(<PrivacyScene />)
    expect(recordRows()).toEqual([
      ["Company name", "Hidden"],
      ["Location", "Southeastern United States"],
      ["Last 12 months revenue", "$3M to $5M"],
      ["Adjusted earnings", "Not disclosed"],
      ["Largest customer", "Not disclosed"],
      ["Employees and payroll", "25 to 50 employees"],
      ["Owner", "Hidden"],
    ])
  })

  it("limits the home record to seven fields, leaving bank statements and closing documents off", () => {
    render(<PrivacyScene />)
    const record = screen.getByTestId("company-record")
    expect(within(record).queryByText("Bank statements")).toBeNull()
    expect(within(record).queryByText("Purchase agreement and funds flow")).toBeNull()
  })

  it("moves to L2 'NDA signed' at progress 0.25 and reveals the company identity", () => {
    render(<PrivacyScene />)
    driveScene(drivers, screen.getByTestId("privacy-scene"), 0.25)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L2")
    expect(screen.getByTestId("privacy-level").nextElementSibling).toHaveTextContent("NDA signed")
    expect(screen.getByText(PERMISSION_LEVELS[2]!.trig)).toBeInTheDocument()
    expect(recordRows()).toEqual([
      ["Company name", "Ridgeline Mechanical Services, Inc."],
      ["Location", "Upstate South Carolina"],
      ["Last 12 months revenue", "$4.24M"],
      ["Adjusted earnings", "$845K, with a summary of adjustments"],
      ["Largest customer", "14% of revenue"],
      ["Employees and payroll", "31 employees"],
      ["Owner", "D. Whitmore, owner since 2003"],
    ])
  })

  it("stays at L1 just below the first threshold and flips to L2 exactly at 0.2002", () => {
    render(<PrivacyScene />)
    const scene = screen.getByTestId("privacy-scene")
    driveScene(drivers, scene, 0.2)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L1")
    driveScene(drivers, scene, 0.201)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L2")
  })

  it("moves to L3 'Buyer qualified' at progress 0.5 with the qualified-buyer record", () => {
    render(<PrivacyScene />)
    driveScene(drivers, screen.getByTestId("privacy-scene"), 0.5)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L3")
    expect(screen.getByTestId("privacy-level").nextElementSibling).toHaveTextContent("Buyer qualified")
    expect(recordRows()).toEqual([
      ["Company name", "Ridgeline Mechanical Services, Inc."],
      ["Location", "Greenville-Spartanburg area"],
      ["Last 12 months revenue", "$4.24M"],
      ["Adjusted earnings", "$845K, with the adjustment schedule"],
      ["Largest customer", "Regional grocery group, contracted through 2029"],
      ["Employees and payroll", "Role-level employee list, no names"],
      ["Owner", "Transition plan attached"],
    ])
  })

  it("reaches L5 'Closing parties only' at progress 0.99 and stays there at 1", () => {
    render(<PrivacyScene />)
    const scene = screen.getByTestId("privacy-scene")
    driveScene(drivers, scene, 0.99)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L5")
    expect(screen.getByTestId("privacy-level").nextElementSibling).toHaveTextContent("Closing parties only")
    expect(recordRows()).toEqual([
      ["Company name", "Ridgeline Mechanical Services, Inc."],
      ["Location", "Full addresses for closing parties"],
      ["Last 12 months revenue", "$4.24M"],
      ["Adjusted earnings", "$845K, final agreed presentation"],
      ["Largest customer", "Required consent obtained"],
      ["Employees and payroll", "Full register and transfer schedule"],
      ["Owner", "Executed transition agreement"],
    ])
    driveScene(drivers, scene, 1)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L5")
  })

  it("highlights only the current stage chip", () => {
    render(<PrivacyScene />)
    driveScene(drivers, screen.getByTestId("privacy-scene"), 0.5)
    const chips = [
      "Anonymous overview",
      "NDA signed",
      "Buyer qualified",
      "Final diligence",
      "Closing parties only",
    ].map((name) => screen.getAllByText(name).find((el) => el.classList.contains("rounded-full")) as HTMLElement)
    expect(chips.map((c) => c.classList.contains("text-filament"))).toEqual([false, false, true, false, false])
  })

  it("writes the veil opacity from veilOpacity(p)", () => {
    render(<PrivacyScene />)
    const scene = screen.getByTestId("privacy-scene")
    const veil = screen.getByTestId("ambient-video").nextElementSibling as HTMLElement
    expect(veil).toHaveClass("opacity-0")
    driveScene(drivers, scene, 0.5)
    expect(veil.style.opacity).toBe("0.11")
  })

  it("links to the confidentiality page", () => {
    render(<PrivacyScene />)
    expect(screen.getByRole("link", { name: "See who can access what →" })).toHaveAttribute("href", "/confidentiality")
  })

  it("renders and scrolls normally when the visitor prefers reduced motion", () => {
    reducedMotion(true)
    render(<PrivacyScene />)
    const video = screen.getByTestId("ambient-video")
    expect(video).not.toHaveAttribute("src")
    driveScene(drivers, screen.getByTestId("privacy-scene"), 0.75)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L4")
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it("keeps the level display working after the background video fails to load", () => {
    render(<PrivacyScene />)
    fireEvent.error(screen.getByTestId("ambient-video"))
    expect(screen.queryByTestId("ambient-video")).toBeNull()
    driveScene(drivers, screen.getByTestId("privacy-scene"), 0.5)
    expect(screen.getByTestId("privacy-level")).toHaveTextContent("L3")
  })
})
