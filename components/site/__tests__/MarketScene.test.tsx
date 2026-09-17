import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MarketScene } from "@/components/site/scenes/MarketScene"
import { marketFrame, marketSlipIds } from "@/lib/site/scroll"
import {
  driveScene,
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  setRect,
  stubMatchMedia,
} from "./scene-test-utils"

const SLIP_IDS = marketSlipIds(18)
const STAGE_W = 1000
const STAGE_H = 700
/** The desk loop runs about seventeen seconds; the scene never seeks it, so the value only has to exist. */
const FILM_S = 17
const realPlay = HTMLMediaElement.prototype.play
const realPause = HTMLMediaElement.prototype.pause

/** A controllable playback model for the film: `paused`, `duration`, and every `currentTime` anything requests. */
function mediaModel(video: HTMLVideoElement, duration: number) {
  const state = { paused: true, currentTime: 0, seeks: [] as number[] }
  Object.defineProperty(video, "paused", { configurable: true, get: () => state.paused })
  Object.defineProperty(video, "duration", { configurable: true, get: () => duration })
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

function setup() {
  const utils = render(<MarketScene />)
  const scene = screen.getByTestId("market-scene")
  const panel = scene.firstElementChild as HTMLElement
  const layer = screen.getByTestId("market-film-layer")
  const film = screen.getByTestId("ambient-video") as HTMLVideoElement
  const letter = screen.getByText("BY MAIL · TO THE OWNER").parentElement as HTMLElement
  const stage = letter.parentElement as HTMLElement
  Object.defineProperty(stage, "offsetWidth", { configurable: true, value: STAGE_W })
  Object.defineProperty(stage, "offsetHeight", { configurable: true, value: STAGE_H })
  return { ...utils, scene, panel, layer, film, letter, stage }
}

/** Bring the film near the viewport so its source attaches and playback starts; settle the play() promise. */
async function startFilm(drivers: SceneDrivers, film: HTMLVideoElement) {
  const media = mediaModel(film, FILM_S)
  await act(async () => {
    drivers.intersect(film, true)
    await Promise.resolve()
  })
  return media
}

const activeFlags = () => [0, 1, 2, 3].map((i) => screen.getByTestId(`market-step-${i}`).getAttribute("data-active"))
const loiCard = (k: string) => screen.getByText(`LETTER OF INTENT · ${k}`).parentElement!.parentElement as HTMLElement

describe("<MarketScene />", () => {
  let drivers: SceneDrivers
  let play: ReturnType<typeof vi.fn>
  let pause: ReturnType<typeof vi.fn>
  beforeEach(() => {
    drivers = installSceneDrivers()
    pinViewport(1000)
    play = vi.fn().mockResolvedValue(undefined)
    pause = vi.fn()
    HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement["play"]
    HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement["pause"]
  })
  afterEach(() => {
    // Unmount while the playback stand-ins are still installed: a playing loop pauses itself on unmount.
    cleanup()
    drivers.restore()
    pinViewport(768)
    restoreMatchMedia()
    HTMLMediaElement.prototype.play = realPlay
    HTMLMediaElement.prototype.pause = realPause
  })

  it("is a full-bleed dark tile 255vh tall with no padding of its own", () => {
    const { scene } = setup()
    expect(scene).toHaveAttribute("data-tone", "dark")
    expect(scene).toHaveClass("on-dark")
    expect(scene).toHaveClass("bg-tile-1")
    // 255vh of scroll travel wherever the panel pins: from the tablet breakpoint, or on a tall phone.
    expect(scene).toHaveClass("tab:h-[255vh]")
    expect(scene).toHaveClass("tall:max-tab:h-[255vh]")
    expect(scene).not.toHaveClass("h-[255vh]")
    expect(scene).not.toHaveClass("tile")
    expect(scene.className).not.toMatch(/\bp[xt]-/)
  })

  it("pins the scene root's first child to the viewport with scene-pin and clips its overflow", () => {
    const { panel } = setup()
    // Pinned from the tablet breakpoint or on a tall phone; a short phone cannot hold copy and band, so it flows.
    expect(panel).toHaveClass("tab:scene-pin")
    expect(panel).toHaveClass("tall:max-tab:scene-pin")
    expect(panel).not.toHaveClass("scene-pin")
    expect(panel).toHaveClass("flex")
    expect(panel).toHaveClass("flex-col")
    // Positioned even when it flows, so its overflow clip still contains the absolute film layer.
    expect(panel).toHaveClass("relative")
    expect(panel).toHaveClass("overflow-hidden")
    expect(panel).not.toHaveClass("sticky")
    expect(panel.className).not.toMatch(/rounded|border|shadow|aurora|panel-/)
  })

  it("puts the 24px gutter on the pinned panel so the 980px lock is measured on the copy", () => {
    const { panel } = setup()
    expect(panel).toHaveClass("px-6")
    const container = panel.lastElementChild as HTMLElement
    expect(container).toHaveClass("max-w-[980px]")
    expect(container).toHaveClass("h-full")
    expect(container.className).not.toMatch(/\bpx-/)
  })

  it("rests the paper choreography on the desk film: a looping video in a parallax layer that is the panel's first child, under the stage and the copy", () => {
    const { panel, layer, film, stage } = setup()
    expect(panel.firstElementChild).toBe(layer)
    expect(layer.tagName).toBe("DIV")
    expect(layer.firstElementChild).toBe(film)
    expect(layer.children).toHaveLength(1)
    expect(film.tagName).toBe("VIDEO")
    expect(layer.nextElementSibling).toBe(stage)
    expect(panel.children).toHaveLength(3)
    expect(panel.lastElementChild).toContainElement(screen.getByRole("heading", { level: 2 }))
    // The scene no longer carries a scroll-scrubbed film.
    expect(screen.queryByTestId("scrub-video")).toBeNull()
    expect(screen.getAllByTestId("ambient-video")).toHaveLength(1)
  })

  it("positions the film layer over the whole panel as a transform-only, decorative surface with no frame of its own", () => {
    const { layer } = setup()
    expect(layer).toHaveAttribute("aria-hidden", "true")
    for (const cls of ["pointer-events-none", "absolute", "inset-0", "will-change-transform"]) {
      expect(layer).toHaveClass(cls)
    }
    expect(layer.className.split(" ")).toHaveLength(4)
    // A backdrop, not a framed film: no radius, shadow, border, or opacity of its own (the video dims itself).
    expect(layer.className).not.toMatch(/rounded|shadow|border|opacity|bg-/)
    // Server markup carries no transform; the first measured frame writes it.
    expect(layer.style.transform).toBe("")
  })

  it("dims the desk loop to 60%, covers the panel, hides it from assistive tech, and holds its first-frame poster until it is near", () => {
    const { film } = setup()
    expect(film).toHaveAttribute("poster", "/media/market-desk-live-poster.jpg")
    expect(film).toHaveAttribute("aria-hidden", "true")
    expect(film).not.toHaveAttribute("role")
    expect(film).not.toHaveAttribute("aria-label")
    expect(film).toHaveAttribute("preload", "metadata")
    expect(film).toHaveAttribute("playsinline")
    expect(film.muted).toBe(true)
    expect(film).not.toHaveAttribute("src")
    // Hidden on phones (the band is too small to earn a film): a display:none video never intersects, so its
    // source never attaches there.
    for (const cls of [
      "pointer-events-none",
      "absolute",
      "inset-0",
      "hidden",
      "tab:block",
      "h-full",
      "w-full",
      "object-cover",
      "opacity-60",
    ]) {
      expect(film).toHaveClass(cls)
    }
    expect(film.className.split(" ")).toHaveLength(9)
    // The source attaches only once the panel approaches the viewport.
    act(() => drivers.intersect(film, true))
    expect(film).toHaveAttribute("src", "/media/market-desk-live.mp4")
    expect(film).toHaveAttribute("poster", "/media/market-desk-live-poster.jpg")
  })

  it("runs the desk film as a native loop that rests off screen and plays again when it returns", async () => {
    const { film } = setup()
    const media = await startFilm(drivers, film)
    expect(film.loop).toBe(true)
    media.paused = false
    act(() => drivers.intersect(film, false))
    expect(pause).toHaveBeenCalledTimes(1)
    media.paused = true
    act(() => drivers.intersect(film, true))
    expect(play).toHaveBeenCalledTimes(2)
  })

  it("never scrubs the film with scroll: progress 0.4 and 1 request no seek while the steps still follow, and the loop rests on unmount", async () => {
    const { scene, film, unmount } = setup()
    const media = await startFilm(drivers, film)
    media.paused = false
    driveScene(drivers, scene, 0.4)
    expect(media.seeks).toEqual([])
    expect(activeFlags()).toEqual(["false", "true", "false", "false"])
    driveScene(drivers, scene, 1)
    expect(media.seeks).toEqual([])
    expect(media.currentTime).toBe(0)
    expect(activeFlags()).toEqual(["false", "false", "false", "true"])
    // Scrolling neither pauses nor restarts the loop; leaving the page does pause it and drops every watcher.
    expect(play).toHaveBeenCalledTimes(1)
    expect(pause).not.toHaveBeenCalled()
    unmount()
    expect(pause).toHaveBeenCalledTimes(1)
    expect(drivers.watchers(film)).toBe(0)
    expect(drivers.watchers(scene)).toBe(0)
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("drifts the film layer 3% against the scroll: down 3.00% at progress 0, 0.60% at 0.4, up 3.00% at 1, always at scale 1.060", () => {
    const { scene, layer, film } = setup()
    driveScene(drivers, scene, 0)
    expect(layer.style.transform).toBe("translate3d(0,3.00%,0) scale(1.060)")
    driveScene(drivers, scene, 0.4)
    expect(layer.style.transform).toBe("translate3d(0,0.60%,0) scale(1.060)")
    driveScene(drivers, scene, 1)
    expect(layer.style.transform).toBe("translate3d(0,-3.00%,0) scale(1.060)")
    // The transform lives on the layer alone; the video keeps no inline style.
    expect(film.style.transform).toBe("")
    expect(film.getAttribute("style")).toBeNull()
  })

  it("writes the parallax in the same frame as the paper: at progress 0.1 the layer sits at 2.40% while the letter is at 0.875", () => {
    const { scene, layer, letter } = setup()
    driveScene(drivers, scene, 0.1)
    expect(layer.style.transform).toBe("translate3d(0,2.40%,0) scale(1.060)")
    expect(letter.style.opacity).toBe("0.875")
    expect(letter.style.transform).toBe(marketFrame(0.1, STAGE_W, STAGE_H, 18, 4).letter.transform)
  })

  it("attaches no film source under reduced motion, leaving the poster, while the steps still follow scroll and the layer still drifts with it", () => {
    stubMatchMedia(true)
    const { scene, layer, film } = setup()
    const media = mediaModel(film, FILM_S)
    expect(drivers.watchers(film)).toBe(0)
    driveScene(drivers, scene, 0.5)
    expect(film).not.toHaveAttribute("src")
    expect(film).toHaveAttribute("poster", "/media/market-desk-live-poster.jpg")
    expect(film.loop).toBe(false)
    expect(play).not.toHaveBeenCalled()
    expect(media.seeks).toEqual([])
    expect(activeFlags()).toEqual(["false", "false", "true", "false"])
    // The parallax is scroll-driven, not an animation, so it still follows the visitor's own scrolling.
    expect(layer.style.transform).toBe("translate3d(0,0.00%,0) scale(1.060)")
    driveScene(drivers, scene, 1)
    expect(layer.style.transform).toBe("translate3d(0,-3.00%,0) scale(1.060)")
    expect(film).not.toHaveAttribute("src")
  })

  it("keeps the layer, the steps, and the paper moving when the film fails to load and removes itself", () => {
    const { scene, panel, layer, film, stage } = setup()
    act(() => drivers.intersect(film, true))
    fireEvent.error(film)
    expect(screen.queryByTestId("ambient-video")).toBeNull()
    expect(panel.firstElementChild).toBe(layer)
    expect(layer.children).toHaveLength(0)
    expect(layer.nextElementSibling).toBe(stage)
    expect(panel.children).toHaveLength(3)
    expect(drivers.watchers(film)).toBe(0)
    driveScene(drivers, scene, 0.72)
    expect(layer.style.transform).toBe("translate3d(0,-1.32%,0) scale(1.060)")
    expect(activeFlags()).toEqual(["false", "false", "true", "false"])
    const ndaOpacities = screen.getAllByText("NDA SIGNED").map((el) => (el.parentElement as HTMLElement).style.opacity)
    expect(ndaOpacities).toEqual(SLIP_IDS.map((_, i) => (i % 4 === 0 ? "1" : "0")))
  })

  it("flows on a short phone: progress comes from the MARKET_FLOW window so an unfolding step body cannot feed back", () => {
    pinViewport(640)
    const { scene } = setup()
    expect(scene).toHaveAttribute("data-layout", "pinned")
    // Top 480px above the viewport: (160 + 480) / 640 = 1 → the last step, whatever the scene's height.
    setRect(scene, { top: -480, height: 900, width: 320 })
    act(() => {
      drivers.intersect(scene, true)
      drivers.flushFrames()
    })
    expect(scene).toHaveAttribute("data-layout", "flow")
    expect(screen.getByTestId("market-step-3")).toHaveAttribute("data-active", "true")
    setRect(scene, { top: -480, height: 1300, width: 320 })
    act(() => drivers.flushFrames())
    expect(screen.getByTestId("market-step-3")).toHaveAttribute("data-active", "true")
    // Step 02 sits at 0.35: top = 160 - 224 = -64.
    setRect(scene, { top: -64, height: 1300, width: 320 })
    act(() => drivers.flushFrames())
    expect(screen.getByTestId("market-step-1")).toHaveAttribute("data-active", "true")
    pinViewport(844)
    setRect(scene, { top: -500, height: 2000, width: 390 })
    act(() => drivers.flushFrames())
    expect(scene).toHaveAttribute("data-layout", "pinned")
  })

  it("lays the paper stage as a 400px band after the copy on a short phone, the bottom 44% of the pinned panel on a tall one, and the whole panel from the tablet breakpoint", () => {
    const { panel, layer, stage } = setup()
    // The stage follows the film layer: paper above the desk, copy above the paper.
    expect(panel.children[1]).toBe(stage)
    expect(stage.previousElementSibling).toBe(layer)
    // Short phone: a flowing band ordered after the copy, bled to the panel's edges.
    for (const cls of [
      "relative",
      "order-2",
      "-mx-6",
      "h-[400px]",
      "shrink-0",
      "overflow-hidden",
      "pointer-events-none",
    ]) {
      expect(stage).toHaveClass(cls)
    }
    // Tall phone: the bottom 44% of the pinned panel.
    for (const cls of [
      "tall:max-tab:absolute",
      "tall:max-tab:inset-x-0",
      "tall:max-tab:bottom-0",
      "tall:max-tab:mx-0",
      "tall:max-tab:h-[44%]",
    ]) {
      expect(stage).toHaveClass(cls)
    }
    // Tablet up: the whole panel.
    for (const cls of ["tab:absolute", "tab:inset-0", "tab:mx-0", "tab:h-auto"]) expect(stage).toHaveClass(cls)
    expect(stage).not.toHaveClass("absolute")
    expect(stage).not.toHaveClass("inset-0")
    expect(stage).not.toHaveClass("h-[44%]")
    // The copy comes after the stage in the DOM, so it paints above the paper wherever the two overlap.
    const container = panel.lastElementChild as HTMLElement
    expect(container).toContainElement(screen.getByRole("heading", { level: 2 }))
    expect(container).toHaveClass("relative")
  })

  it("lets the copy column take only its own height on phones, with no cap and no nested scroller, and centres it over the stage from the tablet breakpoint", () => {
    setup()
    const column = screen.getByTestId("market-step-0").parentElement as HTMLElement
    for (const cls of [
      "flex",
      "flex-col",
      "max-w-[470px]",
      "gap-2",
      "py-4",
      "tab:flex-1",
      "tab:gap-3",
      "tab:justify-center-safe",
    ]) {
      expect(column).toHaveClass(cls)
    }
    // Exactly those eight: the old 56% cap and its scroller stalled the pinned scene at 390×844 with step 04
    // out of reach, and neither may come back.
    expect(column.className.split(" ")).toHaveLength(8)
    expect(column).toContainElement(screen.getByRole("heading", { level: 2 }))
  })

  it("folds every step body away on phones before the first frame, keeping the four titles on screen", () => {
    setup()
    for (let i = 0; i < 4; i++) {
      const step = screen.getByTestId(`market-step-${i}`)
      const body = step.lastElementChild as HTMLElement
      expect(body).toHaveClass("hidden")
      expect(body).toHaveClass("tab:block")
      expect(body).not.toHaveClass("block")
      expect(body.className.split(" ")).toHaveLength(5)
      expect(step.firstElementChild).not.toHaveClass("hidden")
    }
    expect(screen.getByTestId("market-step-0").firstElementChild).toHaveTextContent("01Inbound offer")
    expect(screen.getByTestId("market-step-1").firstElementChild).toHaveTextContent("02Buyer research")
    expect(screen.getByTestId("market-step-2").firstElementChild).toHaveTextContent("03NDA and qualification")
    expect(screen.getByTestId("market-step-3").firstElementChild).toHaveTextContent("04Offer comparison")
  })

  it("unfolds only the active step's body on phones at progress 0.6 (step 03) while every body shows from the tablet breakpoint", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.6)
    expect(activeFlags()).toEqual(["false", "false", "true", "false"])
    const bodies = [0, 1, 2, 3].map((i) => screen.getByTestId(`market-step-${i}`).lastElementChild as HTMLElement)
    expect(bodies.map((b) => b.classList.contains("hidden"))).toEqual([true, true, false, true])
    expect(bodies.map((b) => b.classList.contains("tab:block"))).toEqual([true, true, false, true])
    expect(bodies.map((b) => b.classList.contains("block"))).toEqual([false, false, true, false])
    for (const b of bodies) {
      expect(b).toHaveClass("type-caption")
      expect(b).toHaveClass("text-fg-2")
      expect(b).toHaveClass("mt-1")
    }
    expect(bodies[2]!.className.split(" ")).toHaveLength(4)
    expect(bodies[2]).toHaveTextContent("Buyers sign an NDA and show financing before seeing sensitive records.")
    // Titles never fold: all four stay rendered whichever step is active.
    for (const title of ["Inbound offer", "Buyer research", "NDA and qualification", "Offer comparison"]) {
      expect(screen.getByText(title).parentElement).not.toHaveClass("hidden")
    }
    // The step-04 link travels with its body, so it is on screen exactly when step 04 is active.
    const link = screen.getByRole("link", { name: "See how it works →" })
    expect(bodies[3]).toContainElement(link)
    driveScene(drivers, scene, 0.9)
    expect(activeFlags()).toEqual(["false", "false", "false", "true"])
    expect(screen.getByTestId("market-step-3").lastElementChild).toHaveClass("block")
    expect(screen.getByTestId("market-step-3").lastElementChild).not.toHaveClass("hidden")
    expect(screen.getByTestId("market-step-2").lastElementChild).toHaveClass("hidden")
  })

  it("renders the headline from the type ladder above the four steps", () => {
    setup()
    const heading = screen.getByRole("heading", { level: 2, name: "Several buyers compete privately." })
    expect(heading).toHaveClass("type-display-lg")
    expect(heading.nextElementSibling).toHaveTextContent(
      "We find and qualify several buyers for your business and run the process privately. You compare their offers instead of negotiating with whoever approached you."
    )
    expect(screen.getByText("A private market for your business")).toHaveClass("type-caption-strong")
    expect(screen.getByText("The same information, shown without animation.")).toHaveClass("motion-reduce:block")
  })

  it("sets the eyebrow directly above the headline, leaving only the motion-reduce note at the top of the panel", () => {
    const { panel } = setup()
    const eyebrow = screen.getByText("A private market for your business")
    const heading = screen.getByRole("heading", { level: 2 })
    expect(eyebrow.nextElementSibling).toBe(heading)
    expect(eyebrow).toHaveClass("mb-4")
    const container = panel.lastElementChild as HTMLElement
    const note = screen.getByText("The same information, shown without animation.")
    expect(container.firstElementChild).toBe(note)
    expect(note).toHaveClass("hidden")
    expect(note).not.toHaveClass("mt-2")
    expect(container.children).toHaveLength(2)
  })

  it("marks no step active before the first frame has been measured", () => {
    setup()
    expect(activeFlags()).toEqual(["false", "false", "false", "false"])
    for (let i = 0; i < 4; i++) expect(screen.getByTestId(`market-step-${i}`)).toHaveClass("border-line")
  })

  it("holds step 01 across two frames inside the same step (0.05 then 0.15) while the parallax and the letter keep moving", () => {
    const { scene, layer, letter } = setup()
    driveScene(drivers, scene, 0.05)
    expect(activeFlags()).toEqual(["true", "false", "false", "false"])
    expect(layer.style.transform).toBe("translate3d(0,2.70%,0) scale(1.060)")
    expect(letter.style.opacity).toBe("0.438")
    driveScene(drivers, scene, 0.15)
    // The second frame ran (both continuous values moved) and the step mark did not change.
    expect(activeFlags()).toEqual(["true", "false", "false", "false"])
    expect(layer.style.transform).toBe("translate3d(0,2.10%,0) scale(1.060)")
    expect(letter.style.opacity).toBe("1")
    expect(screen.getByTestId("market-step-0")).toHaveClass("border-accent")
    expect(screen.getByTestId("market-step-1")).toHaveClass("border-line")
  })

  it("draws the active step's left rule in the accent and dims the others to 70%, never lower", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.1)
    expect(screen.getByTestId("market-step-0")).toHaveClass("border-accent")
    expect(screen.getByTestId("market-step-0")).toHaveClass("opacity-100")
    for (const i of [1, 2, 3]) {
      expect(screen.getByTestId(`market-step-${i}`)).toHaveClass("border-line")
      // 14px text at 50% over tile-1 fell to 3.3:1; 70% keeps the dimmed bodies above 4.5:1.
      expect(screen.getByTestId(`market-step-${i}`)).toHaveClass("opacity-70")
      expect(screen.getByTestId(`market-step-${i}`)).not.toHaveClass("opacity-50")
      expect(screen.getByTestId(`market-step-${i}`)).not.toHaveClass("border-accent")
    }
  })

  it("flips to step 02 exactly at progress 0.22", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.219)
    expect(activeFlags()).toEqual(["true", "false", "false", "false"])
    driveScene(drivers, scene, 0.22)
    expect(activeFlags()).toEqual(["false", "true", "false", "false"])
    expect(screen.getByTestId("market-step-1")).toHaveTextContent("Buyer research")
  })

  it("flips to step 03 at progress 0.48 and step 04 at 0.74", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.48)
    expect(activeFlags()).toEqual(["false", "false", "true", "false"])
    driveScene(drivers, scene, 0.74)
    expect(activeFlags()).toEqual(["false", "false", "false", "true"])
    expect(screen.getByTestId("market-step-3")).toHaveTextContent("Offer comparison")
  })

  it("links the last step to the full sale process page", () => {
    setup()
    const step = screen.getByTestId("market-step-3")
    expect(within(step).getByRole("link", { name: "See how it works →" })).toHaveAttribute("href", "/how-it-works")
    for (const i of [0, 1, 2]) expect(within(screen.getByTestId(`market-step-${i}`)).queryByRole("link")).toBeNull()
  })

  it("sets the link on its own line under the step body as a 44px target that keeps the body's 4px gap", () => {
    setup()
    const link = screen.getByRole("link", { name: "See how it works →" })
    expect(link).toHaveClass("text-link")
    expect(link).toHaveClass("inline-flex")
    expect(link).toHaveClass("min-h-11")
    expect(link).toHaveClass("items-center")
    const line = link.parentElement as HTMLElement
    expect(line.tagName).toBe("SPAN")
    expect(line).toHaveClass("block")
    // The 44px box is centred on the 20px line: -8px above restores the 4px gap, -12px below the step's rule end.
    expect(line).toHaveClass("-mt-2")
    expect(line).toHaveClass("-mb-3")
    const body = line.parentElement as HTMLElement
    expect(body).toHaveClass("type-caption")
    expect(body.firstChild).toHaveTextContent("We compare the economics, buyer fit, and closing risk of each offer.")
    expect(body.lastElementChild).toBe(line)
  })

  it("renders eighteen teaser slips, one per buyer id", () => {
    setup()
    expect(screen.getAllByText("PROJECT RIDGELINE")).toHaveLength(18)
    for (const id of SLIP_IDS) {
      expect(screen.getByText(id)).toBeInTheDocument()
      expect(screen.getByText(`${id} ✓`)).toBeInTheDocument()
    }
  })

  it("prints the inbound letter's own words, with the round figure the one buyer names set inside them", () => {
    const { letter } = setup()
    expect(within(letter).getByText("BY MAIL · TO THE OWNER")).toBeInTheDocument()
    const quote = letter.children[1] as HTMLElement
    expect(quote.textContent).toBe('"We are prepared to offer $4.1M for your business…"')
    expect(within(quote).getByText("$4.1M").tagName).toBe("STRONG")
    expect(within(letter).getByText("ONE BUYER · ONE NUMBER")).toBeInTheDocument()
  })

  it("prints the teaser slip's anonymous note and the release line on every NDA face", () => {
    setup()
    expect(screen.getAllByText("ANONYMOUS TEASER · NO NAME")).toHaveLength(18)
    expect(screen.getAllByText("IDENTITY RELEASED · LEVEL 2")).toHaveLength(18)
  })

  it("prints the choreography on plain paper: light cards with a hairline, no shadow, no glow, no rotation class", () => {
    const { letter, stage } = setup()
    expect(stage).toHaveAttribute("aria-hidden", "true")
    expect(stage.querySelector("[class*='gradient'], [class*='veil']")).toBeNull()
    const slip = screen.getAllByText("PROJECT RIDGELINE")[0]!.parentElement!.parentElement!.parentElement as HTMLElement
    for (const sheet of [letter, slip, loiCard("A")]) {
      expect(sheet).toHaveClass("on-light")
      expect(sheet).toHaveClass("bg-canvas")
      expect(sheet).toHaveClass("rounded-sm")
      expect(sheet).toHaveClass("border")
      expect(sheet.className).not.toMatch(/shadow|rotate|glow|filament|slip/)
    }
    expect(screen.getByText(SLIP_IDS[0]!)).toHaveClass("rounded-pill")
    expect(screen.getByText(SLIP_IDS[0]!)).toHaveClass("border-accent")
    expect(screen.getByText(SLIP_IDS[0]!)).toHaveClass("text-accent")
    expect(screen.getAllByText("NDA SIGNED")[0]).toHaveClass("rounded-pill")
  })

  it("sizes the paper for the phone band (150px letters of intent, 120px slips) and widens it from the tablet breakpoint", () => {
    const { letter } = setup()
    for (const k of ["A", "B", "C", "D"]) {
      expect(loiCard(k)).toHaveClass("w-[150px]")
      expect(loiCard(k)).toHaveClass("tab:w-[200px]")
      expect(loiCard(k)).not.toHaveClass("w-[200px]")
      expect(loiCard(k)).toHaveAttribute("data-testid", `market-loi-${k}`)
    }
    // The inbound letter keeps its one width at every size; the slips match MARKET_NARROW.slipWidth on phones.
    expect(letter).toHaveClass("w-[220px]")
    expect(letter.className).not.toMatch(/tab:w-/)
    const slip = screen.getAllByText("PROJECT RIDGELINE")[0]!.parentElement!.parentElement!.parentElement as HTMLElement
    expect(slip).toHaveClass("w-[120px]")
    expect(slip).toHaveClass("tab:w-[150px]")
    expect(slip).toHaveAttribute("data-testid", "market-slip-0")
    expect(screen.getByTestId("market-stage")).toContainElement(slip)
  })

  it("hides the letter and keeps slips invisible before the scene starts", () => {
    const { scene, letter } = setup()
    driveScene(drivers, scene, 0)
    expect(letter.style.opacity).toBe("0")
    const slipOpacities = screen.getAllByText("PROJECT RIDGELINE").map((el) => {
      const slip = el.parentElement!.parentElement!.parentElement as HTMLElement
      return slip.style.opacity
    })
    expect(slipOpacities).toEqual(Array<string>(18).fill("0"))
  })

  it("flips only every fourth slip to its NDA face at progress 0.72", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.72)
    const ndaOpacities = screen.getAllByText("NDA SIGNED").map((el) => (el.parentElement as HTMLElement).style.opacity)
    expect(ndaOpacities).toEqual(SLIP_IDS.map((_, i) => (i % 4 === 0 ? "1" : "0")))
  })

  it("drops non-surviving slips to zero opacity at progress 0.72 while survivors stay visible", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.72)
    const opacities = screen.getAllByText("PROJECT RIDGELINE").map((el) => {
      const slip = el.parentElement!.parentElement!.parentElement as HTMLElement
      return slip.style.opacity
    })
    expect(opacities).toEqual(SLIP_IDS.map((_, i) => (i % 4 === 0 ? "1" : "0")))
  })

  it("renders the four letters of intent with their exact tags, amounts, buyers, and badges", () => {
    setup()
    const cards = [
      ["LETTER OF INTENT · A", "$4.30M", "REGIONAL ACQUIRER", null],
      ["LETTER OF INTENT · B", "$4.55M", "INDIVIDUAL BUYER", null],
      ["LETTER OF INTENT · C", "$4.05M", "INVESTMENT GROUP · COMMITTED FINANCING", "MOST CERTAIN"],
      ["LETTER OF INTENT · D", "$4.65M", "STRATEGIC ACQUIRER", "HIGHEST HEADLINE"],
    ] as const
    expect(screen.getAllByText(/^LETTER OF INTENT · [A-D]$/)).toHaveLength(4)
    for (const [tag, amount, who, badge] of cards) {
      const card = screen.getByText(tag).parentElement!.parentElement as HTMLElement
      expect(within(card).getByText(amount)).toBeInTheDocument()
      expect(within(card).getByText(amount)).toHaveClass("type-tagline")
      expect(within(card).getByText(who)).toBeInTheDocument()
      if (badge) expect(within(card).getByText(badge)).toBeInTheDocument()
      else expect(within(card).queryByText(/MOST CERTAIN|HIGHEST HEADLINE/)).toBeNull()
    }
  })

  it("badges the letters of intent with outlined pills: accent for the committed offer, hairline for the headline", () => {
    setup()
    const certain = screen.getByText("MOST CERTAIN")
    expect(certain).toHaveClass("rounded-pill")
    expect(certain).toHaveClass("border-accent")
    expect(certain).toHaveClass("text-accent")
    expect(certain.className).not.toMatch(/\bbg-/)
    const headline = screen.getByText("HIGHEST HEADLINE")
    expect(headline).toHaveClass("rounded-pill")
    expect(headline).toHaveClass("border-line")
    expect(headline).toHaveClass("text-fg-3")
  })

  it("lands all four letters of intent at the end with the committed offer stacked on top", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 1)
    const cards = ["A", "B", "C", "D"].map(loiCard)
    expect(cards.map((c) => c.style.opacity)).toEqual(["1", "1", "1", "1"])
    expect(cards.map((c) => c.style.zIndex)).toEqual(["1", "2", "5", "2"])
    expect(cards[2]).toHaveClass("border-accent")
    expect(cards[2]).toHaveClass("ring-accent")
    expect(cards[2]).toHaveClass("ring-inset")
    expect(cards[2]).not.toHaveClass("border-line")
    for (const k of [0, 1, 3]) {
      expect(cards[k]).toHaveClass("border-line")
      expect(cards[k]).not.toHaveClass("ring-accent")
    }
  })

  it("keeps the letters of intent hidden at progress 0.5", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.5)
    const cards = ["A", "B", "C", "D"].map(loiCard)
    expect(cards.map((c) => c.style.opacity)).toEqual(["0", "0", "0", "0"])
  })
})
