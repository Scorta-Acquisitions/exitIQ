import { act, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TermsStrip } from "@/components/site/home/TermsStrip"
import { ROUTES } from "@/lib/site/routes"
import {
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  setRect,
  stubMatchMedia,
} from "./scene-test-utils"

/** The full-bleed tile a section renders as, identified by the tone it declares. */
function tileOf(container: HTMLElement): HTMLElement {
  const tile = container.querySelector("section[data-tone]")
  expect(tile).not.toBeNull()
  return tile as HTMLElement
}

/** Lay every element out 200px below a 1000px viewport, the way the strip sits under the hero at mount. */
function layOutBelowFold() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top: 1200,
    height: 300,
    width: 300,
    bottom: 1500,
    left: 0,
    right: 300,
    x: 0,
    y: 1200,
    toJSON: () => ({}),
  } as DOMRect)
}

/** A playback model: `duration` known, every `currentTime` write recorded, never `seeking`. */
function mediaModel(video: HTMLVideoElement, duration: number) {
  const state = { currentTime: 0, seeks: [] as number[] }
  Object.defineProperty(video, "duration", { configurable: true, get: () => duration })
  Object.defineProperty(video, "seeking", { configurable: true, get: () => false })
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => state.currentTime,
    set: (t: number) => {
      state.currentTime = t
      state.seeks.push(t)
    },
  })
  return state
}

const EXPECTED = [
  {
    key: "seal",
    label: "Representation",
    text: "Sellers only.",
    href: ROUTES.whoWeAre,
  },
  {
    key: "envelope",
    label: "Listing",
    text: "Never public.",
    href: ROUTES.confidentiality,
  },
  {
    key: "scale",
    label: "Company fit",
    text: "Usually $1M or more in annual revenue.",
    href: ROUTES.questions,
  },
  {
    key: "stack",
    label: "Experience",
    text: "Millions in enterprise value transacted through Heirloom.",
    href: ROUTES.whoWeAre,
  },
  {
    key: "hourglass",
    label: "Timing",
    text: "40% faster than a traditional sale.",
    href: ROUTES.howItWorks,
  },
]
const KEYS = EXPECTED.map((t) => t.key)
const GRID = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-x-6 gap-y-10"

describe("<TermsStrip />", () => {
  let drivers: SceneDrivers
  let now = 10_000
  beforeEach(() => {
    drivers = installSceneDrivers()
    pinViewport(1000)
    now = 10_000
    vi.spyOn(performance, "now").mockImplementation(() => now)
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    pinViewport(768)
    restoreMatchMedia()
  })

  it("renders exactly five term links on a parchment tile with the standard tile padding", () => {
    const { container } = render(<TermsStrip />)
    expect(screen.getAllByRole("link")).toHaveLength(5)
    const tile = tileOf(container)
    expect(tile).toHaveAttribute("data-tone", "parchment")
    expect(tile).toHaveClass("tile", "px-6")
    expect(Array.from(tile.classList).filter((c) => /^py-|^pt-|^pb-/.test(c))).toEqual([])
  })

  it("lays the five cards out as auto-fit columns no narrower than 120px inside the 980px content lock", () => {
    render(<TermsStrip />)
    const grid = screen.getByTestId("terms-grid")
    expect(grid.className).toBe(GRID)
    expect(grid.parentElement).toHaveClass("mx-auto", "w-full", "max-w-[980px]")
    expect(Array.from(grid.children).map((c) => c.getAttribute("data-testid"))).toEqual(
      KEYS.map((k) => `terms-link-${k}`)
    )
  })

  it.each(EXPECTED)("links the $label term to $href as one accent-on-hover card", ({ key, label, text, href }) => {
    render(<TermsStrip />)
    const link = screen.getByText(label).closest("a") as HTMLAnchorElement
    expect(link).toHaveAttribute("href", href)
    expect(link).toHaveAttribute("data-testid", `terms-link-${key}`)
    expect(link).toHaveAttribute("data-reveal", "")
    expect(link).toHaveClass("group", "text-fg", "hover:text-accent", "block")
    // The reveal transition lives on the link, so the link carries no transition utility of its own
    // (a Tailwind utility would override it); the label and statement animate their inherited colour instead.
    expect(link.className).not.toMatch(/transition|duration|pressable/)
    const statement = within(link).getByText(text)
    expect(statement.className).not.toMatch(/\btext-(fg|ink|accent|on-dark)/)
    expect(statement).toHaveClass("type-body-strong", "block", "transition-colors", "duration-200")
    // The caption label sits 8px above the statement and takes the accent with the card it is hovered in.
    expect(screen.getByText(label)).toHaveClass("mb-2", "group-hover:text-accent")
  })

  it.each(EXPECTED)(
    "frames the $key film above the $label label, poster first, source once near the viewport",
    ({ key, label, text }) => {
      render(<TermsStrip />)
      const link = screen.getByTestId(`terms-link-${key}`)
      const figure = screen.getByTestId(`terms-figure-${key}`)
      const [first, second, third] = Array.from(link.children)
      expect(link.children).toHaveLength(3)
      expect(first).toBe(figure)
      expect(second?.textContent).toBe(label)
      expect(third?.textContent).toBe(text)
      expect(figure).toHaveClass(
        "bg-tile-1",
        "shadow-product",
        "aspect-square",
        "rounded-lg",
        "overflow-hidden",
        "mb-5"
      )
      // The film is decorative inside the link: hidden from assistive technology, no role of its own.
      const video = within(figure).getByTestId("scrub-video") as HTMLVideoElement
      expect(video).toHaveAttribute("aria-hidden", "true")
      expect(video).not.toHaveAttribute("role")
      expect(video).not.toHaveAttribute("aria-label")
      expect(video).toHaveAttribute("poster", `/media/term-${key}-poster.jpg`)
      expect(video).toHaveAttribute("preload", "none")
      expect(video).not.toHaveAttribute("src")
      act(() => drivers.intersect(video, true))
      expect(video).toHaveAttribute("src", `/media/term-${key}.mp4`)
    }
  )

  it("names each link by its label and statement only: the film adds nothing to the accessible name", () => {
    render(<TermsStrip />)
    expect(screen.getByRole("link", { name: "Representation Sellers only." })).toHaveAttribute("href", ROUTES.whoWeAre)
    expect(screen.getByRole("link", { name: "Timing 40% faster than a traditional sale." })).toHaveAttribute(
      "href",
      ROUTES.howItWorks
    )
    expect(screen.queryAllByRole("img")).toHaveLength(0)
  })

  it("marks all five cards for the reveal and brings them in 60ms apart the first time they scroll in", () => {
    layOutBelowFold()
    render(<TermsStrip />)
    const links = screen.getAllByRole("link")
    for (const link of links) expect(link).toHaveClass("reveal-pending")
    act(() => {
      for (const link of links) drivers.intersect(link, true)
    })
    expect(links.map((l) => l.style.getPropertyValue("--reveal-delay"))).toEqual([
      "0ms",
      "60ms",
      "120ms",
      "180ms",
      "240ms",
    ])
    for (const link of links) {
      expect(link).toHaveClass("reveal-in")
      expect(link).not.toHaveClass("reveal-pending")
    }
  })

  it("leaves the cards unmarked when the strip is already on screen at mount", () => {
    render(<TermsStrip />)
    const links = screen.getAllByRole("link")
    for (const link of links) expect(link.className).not.toMatch(/reveal/)
    act(() => {
      for (const link of links) drivers.intersect(link, true)
    })
    for (const link of links) {
      expect(link.className).not.toMatch(/reveal/)
      expect(link.style.getPropertyValue("--reveal-delay")).toBe("")
    }
  })

  it("makes each figure its own turntable root and each film its own loader, looping only on screen", () => {
    render(<TermsStrip />)
    for (const key of KEYS) {
      const figure = screen.getByTestId(`terms-figure-${key}`)
      expect(drivers.watchers(figure)).toBe(1)
      expect(drivers.watchers(within(figure).getByTestId("scrub-video"))).toBe(1)
    }
    expect(drivers.raf).not.toHaveBeenCalled()
    act(() => drivers.intersect(screen.getByTestId("terms-figure-seal"), true))
    expect(drivers.pendingFrames()).toBe(1)
    act(() => drivers.intersect(screen.getByTestId("terms-figure-hourglass"), true))
    expect(drivers.pendingFrames()).toBe(2)
  })

  it("turns the hovered object with the pointer: three quarters across the seal lands on second 3.78 of 5.04", () => {
    render(<TermsStrip />)
    const figure = screen.getByTestId("terms-figure-seal")
    setRect(figure, { top: 100, height: 400, width: 400 })
    const video = within(figure).getByTestId("scrub-video") as HTMLVideoElement
    const media = mediaModel(video, 5.04)
    act(() => {
      drivers.intersect(video, true)
      drivers.intersect(figure, true)
      drivers.flushFrames()
    })
    // The film already shows its first frame, so progress 0 issues no seek.
    expect(media.seeks).toEqual([])
    const move = new MouseEvent("pointermove", { clientX: 300, clientY: 200, bubbles: true })
    Object.defineProperty(move, "pointerType", { value: "mouse" })
    act(() => {
      video.dispatchEvent(move)
    })
    now += 5000
    act(() => drivers.flushFrames())
    expect(media.seeks).toHaveLength(1)
    expect(media.seeks[0]).toBeCloseTo(3.78, 2)
  })

  it("under reduced motion marks no card, attaches no source, and leaves every poster standing", () => {
    stubMatchMedia(true)
    layOutBelowFold()
    render(<TermsStrip />)
    const links = screen.getAllByRole("link")
    act(() => {
      for (const link of links) drivers.intersect(link, true)
    })
    for (const link of links) {
      expect(link.className).not.toMatch(/reveal/)
      expect(link.style.getPropertyValue("--reveal-delay")).toBe("")
    }
    const videos = screen.getAllByTestId("scrub-video") as HTMLVideoElement[]
    expect(videos).toHaveLength(5)
    for (const video of videos) {
      expect(drivers.watchers(video)).toBe(0)
      act(() => drivers.intersect(video, true))
      expect(video).not.toHaveAttribute("src")
    }
    expect(videos.map((v) => v.getAttribute("poster"))).toEqual(KEYS.map((k) => `/media/term-${k}-poster.jpg`))
    for (const key of KEYS) expect(drivers.watchers(screen.getByTestId(`terms-figure-${key}`))).toBe(0)
  })
})
