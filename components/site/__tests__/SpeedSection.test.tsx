import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SpeedSection } from "@/components/site/home/SpeedSection"
import { SPEED_COMPARISON, SPEED_STEPS } from "@/lib/site/content/speed"
import { ROUTES } from "@/lib/site/routes"
import {
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  stubMatchMedia,
} from "./scene-test-utils"

/** Lay every element out at `top` before mount: 1200 sits below the 1000px viewport, so counters and reveals arm. */
function layOutAt(top: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    height: 60,
    width: 460,
    bottom: top + 60,
    left: 0,
    right: 460,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect)
}

let drivers: SceneDrivers
let now = 10_000
/** `ScrubVideo` queues no frames of its own: the race loop seeks it, so only the loops under test hold frames. */
const FILM_FRAMES = 0

/** Run one frame batch `ms` later on the mocked clock. */
function frameAfter(ms: number) {
  now += ms
  act(() => drivers.flushFrames())
}

const fill = (key: string) => screen.getByTestId(`speed-fill-${key}`)
const runner = (key: string) => screen.getByTestId(`speed-runner-${key}`)
/** The track a fill rides on: the element the reset fades. */
const trackOpacity = (key: "traditional" | "heirloom") => screen.getByTestId(`speed-track-${key}`).style.opacity

function startRace() {
  const comparison = screen.getByTestId("speed-comparison")
  act(() => drivers.intersect(comparison, true))
  return comparison
}

beforeEach(() => {
  drivers = installSceneDrivers()
  pinViewport(1000)
  now = 10_000
  vi.spyOn(performance, "now").mockImplementation(() => now)
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
})
afterEach(() => {
  drivers.restore()
  vi.restoreAllMocks()
  pinViewport(768)
  restoreMatchMedia()
})

describe("<SpeedSection />", () => {
  it("headlines the comparison as one sentence with the figure set as hero type on a dark tile", () => {
    render(<SpeedSection />)
    expect(screen.getByTestId("speed-section")).toHaveAttribute("data-tone", "dark")
    expect(screen.getByRole("heading", { level: 2, name: "40% faster than a traditional sale." })).toBeInTheDocument()
    const figure = screen.getByTestId("speed-range")
    expect(figure).toHaveTextContent("40%")
    expect(figure).toHaveClass("type-hero", "text-fg", "tabular")
    // The eyebrow names the section directly above the figure.
    const eyebrow = screen.getByText("Speed")
    expect(eyebrow).toHaveClass("type-caption-strong", "mb-4")
    expect(eyebrow.nextElementSibling?.tagName).toBe("H2")
    expect(figure.nextElementSibling).toHaveClass("type-lead")
    // The headline column tops the grid rather than sinking to the bottom of the bars.
    const grid = figure.closest(".grid") as HTMLElement
    expect(grid).toHaveClass("items-start")
    expect(grid).not.toHaveClass("items-end")
  })

  it("counts the figure up from 0% to 40% over 700ms the first time it is seen, keeping 40% in the markup", () => {
    layOutAt(1200)
    render(<SpeedSection />)
    const figure = screen.getByTestId("speed-range")
    expect(figure).toHaveTextContent("40%")
    expect(drivers.watchers(figure)).toBe(1)
    act(() => drivers.intersect(figure, true))
    expect(figure).toHaveTextContent("0%")
    expect(drivers.watchers(figure)).toBe(0)
    act(() => drivers.flushFrames())
    expect(figure).toHaveTextContent("0%")
    frameAfter(350)
    expect(figure).toHaveTextContent("35%")
    frameAfter(350)
    expect(figure).toHaveTextContent("40%")
    // The counter ran once; only the film's own tick stays queued (the race loop has not been started here).
    expect(drivers.pendingFrames()).toBe(FILM_FRAMES)
  })

  it("leaves a figure already on screen at mount, or a reduced-motion visitor's figure, at 40% with no watcher", () => {
    layOutAt(300)
    const seen = render(<SpeedSection />)
    expect(drivers.watchers(screen.getByTestId("speed-range"))).toBe(0)
    expect(screen.getByTestId("speed-range")).toHaveTextContent("40%")
    seen.unmount()
    stubMatchMedia(true)
    layOutAt(1200)
    render(<SpeedSection />)
    expect(drivers.watchers(screen.getByTestId("speed-range"))).toBe(0)
    expect(screen.getByTestId("speed-range")).toHaveTextContent("40%")
  })

  it("draws the two tracks with direct labels, the finished race in the markup, and the timing sentence", () => {
    render(<SpeedSection />)
    const comparison = screen.getByRole("img", { name: SPEED_COMPARISON.ariaLabel })
    expect(comparison).toHaveAttribute("data-testid", "speed-comparison")
    expect(comparison.style.opacity).toBe("")
    expect(screen.getByTestId("speed-track-traditional").style.opacity).toBe("")
    expect(screen.getByTestId("speed-track-heirloom").style.opacity).toBe("")
    const traditional = screen.getByTestId("speed-bar-traditional")
    const heirloom = screen.getByTestId("speed-bar-heirloom")
    expect(traditional).toHaveTextContent("Traditional sale6 to 9 months")
    expect(heirloom).toHaveTextContent("Heirloom3 to 4 months on average")
    // Server markup draws the finished race: the fills scale from the left to their final length.
    expect(fill("traditional").style.transform).toBe("scaleX(1)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0.6)")
    expect(fill("traditional")).toHaveClass("bg-fg/30")
    expect(fill("traditional")).not.toHaveClass("bg-accent")
    expect(fill("heirloom")).toHaveClass("bg-accent")
    for (const key of ["traditional", "heirloom"]) {
      expect(fill(key).className).not.toMatch(/\banimate-|\btransition/)
      expect(fill(key).style.width).toBe("")
      const track = fill(key).parentElement as HTMLElement
      expect(track).toHaveClass("bg-fg/15", "rounded-pill", "relative", "h-[3px]")
      expect(track.children).toHaveLength(2)
      expect(track.lastElementChild).toBe(runner(key))
    }
    expect(
      screen.getByText(
        "A traditional sale takes six to nine months from launch to closing. Heirloom closes in three to four on average, because the financial work is finished before launch and buyers are qualified before they take your time."
      )
    ).toBeInTheDocument()
  })

  it("clips each track sideways so the runner's track-wide wrapper never widens the page", () => {
    render(<SpeedSection />)
    for (const key of ["traditional", "heirloom"] as const) {
      const track = screen.getByTestId(`speed-track-${key}`)
      expect(track).toHaveClass("overflow-x-clip", "relative", "h-[3px]")
      expect(track).not.toHaveClass("overflow-hidden")
      expect(track).toContainElement(runner(key))
    }
    // At the finish the wrapper travels its own width less the dot, so the dot's far edge meets the track's end.
    expect(runner("traditional").style.transform).toBe("translateX(calc(100% - 7px))")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(60% - 4.2px))")
  })

  it("puts a 7px runner dot at the end of each fill: accent for Heirloom, muted for the traditional sale", () => {
    render(<SpeedSection />)
    for (const key of ["traditional", "heirloom"]) {
      const wrapper = runner(key)
      expect(wrapper).toHaveAttribute("aria-hidden", "true")
      expect(wrapper).toHaveClass("absolute", "inset-y-0", "left-0", "w-full", "pointer-events-none")
      expect(wrapper.children).toHaveLength(1)
      const dot = wrapper.firstElementChild as HTMLElement
      expect(dot).toHaveClass("h-[7px]", "w-[7px]", "rounded-full", "absolute", "left-0", "top-1/2")
      expect(dot).toHaveClass("-translate-y-1/2")
      expect(dot).not.toHaveClass("-translate-x-1/2")
    }
    expect(runner("heirloom").firstElementChild).toHaveClass("bg-accent")
    expect(runner("traditional").firstElementChild).toHaveClass("bg-fg/60")
    expect(runner("traditional").firstElementChild).not.toHaveClass("bg-accent")
  })

  it("runs the race from the frame loop once the comparison is on screen: both runners at one pace, Heirloom home at 60%", () => {
    render(<SpeedSection />)
    const comparison = screen.getByTestId("speed-comparison")
    expect(drivers.pendingFrames()).toBe(FILM_FRAMES)
    startRace()
    expect(drivers.pendingFrames()).toBe(FILM_FRAMES + 1)
    act(() => drivers.flushFrames())
    expect(fill("traditional").style.transform).toBe("scaleX(0)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0)")
    expect(runner("traditional").style.transform).toBe("translateX(calc(0% - 0px))")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(0% - 0px))")
    expect(comparison.style.opacity).toBe("")
    expect(trackOpacity("traditional")).toBe("1")
    expect(trackOpacity("heirloom")).toBe("1")
    frameAfter(1800)
    expect(fill("traditional").style.transform).toBe("scaleX(0.3)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0.3)")
    expect(runner("traditional").style.transform).toBe("translateX(calc(30% - 2.1px))")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(30% - 2.1px))")
    frameAfter(1800)
    expect(fill("traditional").style.transform).toBe("scaleX(0.6)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0.6)")
    expect(runner("traditional").style.transform).toBe("translateX(calc(60% - 4.2px))")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(60% - 4.2px))")
    // Heirloom holds at home while the traditional runner keeps going.
    frameAfter(1200)
    expect(fill("traditional").style.transform).toBe("scaleX(0.8)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0.6)")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(60% - 4.2px))")
    expect(trackOpacity("traditional")).toBe("1")
    expect(drivers.pendingFrames()).toBe(FILM_FRAMES + 1)
  })

  it("holds both runners home with the tracks full, then fades the two tracks (never the labels) through the reset", () => {
    render(<SpeedSection />)
    const comparison = startRace()
    act(() => drivers.flushFrames())
    frameAfter(6000)
    expect(fill("traditional").style.transform).toBe("scaleX(1)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0.6)")
    expect(runner("traditional").style.transform).toBe("translateX(calc(100% - 7px))")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(60% - 4.2px))")
    expect(trackOpacity("traditional")).toBe("1")
    expect(trackOpacity("heirloom")).toBe("1")
    frameAfter(2050)
    expect(trackOpacity("traditional")).toBe("0.5")
    expect(trackOpacity("heirloom")).toBe("0.5")
    // The labels and notes above the tracks never fade.
    expect(comparison.style.opacity).toBe("")
    expect(screen.getByText("Traditional sale").style.opacity).toBe("")
    expect(fill("traditional").style.transform).toBe("scaleX(1)")
    expect(runner("traditional").style.transform).toBe("translateX(calc(100% - 7px))")
    // The next run starts from zero with the tracks back at full opacity.
    frameAfter(250)
    expect(trackOpacity("traditional")).toBe("1")
    expect(fill("traditional").style.transform).toBe("scaleX(0)")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(0% - 0px))")
  })

  it("pauses the race off screen and stops it on unmount", () => {
    const { unmount } = render(<SpeedSection />)
    const comparison = startRace()
    act(() => drivers.flushFrames())
    frameAfter(1800)
    expect(fill("traditional").style.transform).toBe("scaleX(0.3)")
    act(() => drivers.intersect(comparison, false))
    expect(drivers.pendingFrames()).toBe(FILM_FRAMES)
    now += 60_000
    act(() => drivers.intersect(comparison, true))
    act(() => drivers.flushFrames())
    expect(fill("traditional").style.transform).toBe("scaleX(0.3)")
    expect(drivers.pendingFrames()).toBe(FILM_FRAMES + 1)
    unmount()
    expect(drivers.pendingFrames()).toBe(0)
    expect(drivers.watchers(comparison)).toBe(0)
  })

  it("shows the finished race as a still under reduced motion, written once with no loop and no watcher", () => {
    stubMatchMedia(true)
    render(<SpeedSection />)
    const comparison = screen.getByTestId("speed-comparison")
    expect(comparison.style.opacity).toBe("")
    expect(trackOpacity("traditional")).toBe("1")
    expect(trackOpacity("heirloom")).toBe("1")
    expect(fill("traditional").style.transform).toBe("scaleX(1)")
    expect(fill("heirloom").style.transform).toBe("scaleX(0.6)")
    expect(runner("traditional").style.transform).toBe("translateX(calc(100% - 7px))")
    expect(runner("heirloom").style.transform).toBe("translateX(calc(60% - 4.2px))")
    expect(drivers.watchers(comparison)).toBe(0)
    expect(drivers.pendingFrames()).toBe(0)
    act(() => drivers.intersect(comparison, true))
    expect(drivers.pendingFrames()).toBe(0)
    expect(fill("traditional").style.transform).toBe("scaleX(1)")
  })

  it("marks ten months under the traditional track, a ninth apart, and none under Heirloom's", () => {
    render(<SpeedSection />)
    const ticks = screen.getByTestId("speed-ticks")
    expect(ticks).toHaveAttribute("aria-hidden", "true")
    expect(ticks).toHaveClass("relative", "h-[6px]")
    expect(screen.getByTestId("speed-bar-traditional")).toContainElement(ticks)
    expect(screen.getByTestId("speed-bar-heirloom").querySelector('[data-testid="speed-ticks"]')).toBeNull()
    // The ticks read against the track: they follow it directly.
    expect(ticks.previousElementSibling).toBe(fill("traditional").parentElement)
    const marks = Array.from(ticks.children) as HTMLElement[]
    expect(marks).toHaveLength(10)
    expect(marks[0]!.style.left).toBe("0%")
    expect(marks[1]!.style.left).toBe("11.1%")
    expect(marks[2]!.style.left).toBe("22.2%")
    expect(marks[5]!.style.left).toBe("55.6%")
    expect(marks[9]!.style.left).toBe("100%")
    for (const mark of marks) {
      expect(mark).toHaveClass("bg-fg/25", "absolute", "top-0", "h-[6px]", "w-px", "-translate-x-1/2")
      expect(mark.textContent).toBe("")
    }
  })

  it("frames the hourglass film under the headline as the section's one image, with its poster and label", () => {
    render(<SpeedSection />)
    const figure = screen.getByTestId("speed-film")
    expect(figure.tagName).toBe("FIGURE")
    expect(figure).toHaveClass(
      "bg-tile-1",
      "shadow-product",
      "relative",
      "m-0",
      "mt-8",
      "aspect-video",
      "w-full",
      "max-w-[420px]",
      "overflow-hidden",
      "rounded-lg"
    )
    // It sits in the headline column, directly under the h2, and stacks there on phones (w-full, no breakpoint hide).
    expect(figure.previousElementSibling).toBe(screen.getByRole("heading", { level: 2 }))
    expect(figure.parentElement).toContainElement(screen.getByTestId("speed-range"))
    expect(Array.from(figure.classList).filter((c) => /(^|:)hidden$|(^|:)block$/.test(c))).toEqual([])
    const video = within(figure).getByRole("img", {
      name: "Two brass hourglasses on green lacquer; the right one runs through faster.",
    }) as HTMLVideoElement
    // A scrubbed film, not a looping one: the race seeks it.
    expect(video).toHaveAttribute("data-testid", "scrub-video")
    expect(screen.queryByTestId("ambient-video")).toBeNull()
    expect(video).toHaveAttribute("poster", "/media/speed-hourglasses-poster.jpg")
    expect(video).toHaveClass("absolute", "inset-0", "h-full", "w-full", "object-cover")
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(false)
    // The source attaches only as the frame approaches the viewport.
    expect(video).not.toHaveAttribute("src")
    act(() => drivers.intersect(video, true))
    expect(video).toHaveAttribute("src", "/media/speed-hourglasses.mp4")
    expect(screen.getAllByTestId("scrub-video")).toHaveLength(1)
  })

  it("seeks the film to the traditional runner's progress every frame and fades the figure with the tracks through the reset", () => {
    render(<SpeedSection />)
    const video = screen.getByTestId("scrub-video") as HTMLVideoElement
    const figure = screen.getByTestId("speed-film")
    const seeks: number[] = []
    Object.defineProperty(video, "duration", { configurable: true, get: () => 10 })
    Object.defineProperty(video, "seeking", { configurable: true, get: () => false })
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => seeks[seeks.length - 1] ?? 0,
      set: (t: number) => {
        seeks.push(t)
      },
    })
    act(() => drivers.intersect(video, true))
    startRace()
    act(() => drivers.flushFrames())
    // The first frame asks for 0, which is where the film already is, so nothing is written.
    expect(seeks).toHaveLength(0)
    // Half way through the 6s run the traditional runner is at 0.5, so the film sits at 5 of its 10 seconds.
    frameAfter(3000)
    expect(seeks[seeks.length - 1]).toBeCloseTo(5, 1)
    expect(figure.style.opacity).toBe("1")
    // At the end of the run the sand has run through: the last frame, held through the hold.
    frameAfter(3000)
    expect(seeks[seeks.length - 1]).toBeCloseTo(10, 1)
    frameAfter(1000)
    expect(seeks[seeks.length - 1]).toBeCloseTo(10, 1)
    expect(figure.style.opacity).toBe("1")
    // Through the reset the figure fades exactly as the tracks do while the film holds its last frame; the next
    // run's first frame winds it back to the start with the bars.
    frameAfter(800 + 250)
    expect(Number(figure.style.opacity)).toBeLessThan(1)
    expect(Number(figure.style.opacity)).toBeGreaterThan(0)
    expect(figure.style.opacity).toBe(screen.getByTestId("speed-track-traditional").style.opacity)
    expect(seeks[seeks.length - 1]).toBeCloseTo(10, 1)
    frameAfter(300)
    expect(figure.style.opacity).toBe("1")
    expect(seeks[seeks.length - 1]).toBeCloseTo(0.08, 1)
    expect(fill("traditional").style.transform).toBe("scaleX(0.0083)")
  })

  it("keeps the frame when the film fails to load, and shows only the poster under reduced motion", () => {
    const failing = render(<SpeedSection />)
    fireEvent.error(screen.getByTestId("scrub-video"))
    expect(screen.queryByTestId("scrub-video")).toBeNull()
    const figure = screen.getByTestId("speed-film")
    expect(figure).toBeInTheDocument()
    expect(figure).toHaveClass("bg-tile-1", "shadow-product", "aspect-video")
    expect(figure.children).toHaveLength(0)
    failing.unmount()
    stubMatchMedia(true)
    render(<SpeedSection />)
    const video = screen.getByTestId("scrub-video")
    act(() => drivers.intersect(video, true))
    act(() => drivers.flushFrames())
    expect(video).toHaveAttribute("poster", "/media/speed-hourglasses-poster.jpg")
    expect(video).not.toHaveAttribute("src")
  })

  it("lists the five steps in order with their numbers, titles, and one-line bodies", () => {
    render(<SpeedSection />)
    const list = screen.getByRole("list", { name: "How Heirloom keeps a sale moving" })
    const items = within(list).getAllByRole("listitem")
    expect(items).toHaveLength(5)
    SPEED_STEPS.forEach((s, i) => {
      const item = items[i]!
      expect(item).toHaveTextContent(`0${i + 1}${s.title}${s.body}`)
      expect(within(item).getByText(s.title).previousSibling).toHaveTextContent(`0${i + 1}`)
      // List-item recipe: body-strong title, body-size line beneath.
      expect(within(item).getByText(s.title)).toHaveClass("type-body-strong", "text-fg")
      expect(within(item).getByText(s.title)).not.toHaveClass("type-tagline")
      expect(within(item).getByText(s.body)).toHaveClass("type-body", "text-fg-2")
    })
    // 170px columns: one column on a 320px phone, still five at the 980 lock, never a lone fifth step.
    expect(list.className).toContain("grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))]")
  })

  it("marks each step for the reveal under its hairline, with no inline animation and nothing hidden in the markup", () => {
    render(<SpeedSection />)
    SPEED_STEPS.forEach((_, i) => {
      const item = screen.getByTestId(`speed-step-${i}`)
      expect(item).toHaveClass("border-t", "border-line")
      expect(item).toHaveAttribute("data-reveal", "")
      expect(item.className).not.toMatch(/\banimate-/)
      expect(item.style.animationDelay).toBe("")
      expect(item.getAttribute("style")).toBeNull()
      // Already on screen at mount: the reveal leaves it alone.
      expect(item).not.toHaveClass("reveal-pending")
      expect(drivers.watchers(item)).toBe(0)
    })
  })

  it("reveals the steps once as they scroll in, staggered 60ms apart from the list they belong to", () => {
    layOutAt(1200)
    render(<SpeedSection />)
    const steps = SPEED_STEPS.map((_, i) => screen.getByTestId(`speed-step-${i}`))
    for (const step of steps) {
      expect(step).toHaveClass("reveal-pending")
      expect(drivers.watchers(step)).toBe(1)
    }
    act(() => {
      for (const step of steps) drivers.intersect(step, true)
    })
    steps.forEach((step, i) => {
      expect(step).toHaveClass("reveal-in")
      expect(step).not.toHaveClass("reveal-pending")
      expect(step.style.getPropertyValue("--reveal-delay")).toBe(`${i * 60}ms`)
      expect(drivers.watchers(step)).toBe(0)
    })
  })

  it("reveals nothing under reduced motion: every step stands in the markup as it is", () => {
    stubMatchMedia(true)
    layOutAt(1200)
    render(<SpeedSection />)
    SPEED_STEPS.forEach((_, i) => {
      const item = screen.getByTestId(`speed-step-${i}`)
      expect(item).not.toHaveClass("reveal-pending")
      expect(item).not.toHaveClass("reveal-in")
      expect(drivers.watchers(item)).toBe(0)
    })
  })

  it("links to the process and the fees with arrows as 44px standalone links and carries no fee copy", () => {
    render(<SpeedSection />)
    const how = screen.getByRole("link", { name: "See how it works →" })
    const fees = screen.getByRole("link", { name: "See fees →" })
    expect(how).toHaveAttribute("href", ROUTES.howItWorks)
    expect(fees).toHaveAttribute("href", ROUTES.fees)
    for (const link of [how, fees]) expect(link).toHaveClass("min-h-11")
    expect(how.parentElement).toBe(fees.parentElement)
    expect(how.parentElement).toHaveClass("mt-3", "-mb-3", "flex", "flex-wrap")
    expect(screen.getAllByRole("link")).toHaveLength(2)
    expect(screen.queryByText(/success fee/)).toBeNull()
    expect(screen.queryByText(/\$5,000/)).toBeNull()
  })
})
