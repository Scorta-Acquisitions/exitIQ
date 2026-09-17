import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ObjectFilm } from "@/components/site/home/ObjectFilm"
import { installSceneDrivers, pinViewport, type SceneDrivers, setRect } from "./scene-test-utils"

/**
 * A playback model the way a browser exposes a film whose metadata has arrived: `duration` is known, every
 * `currentTime` write is recorded, and the element never reports `seeking`, so each request goes through.
 */
function mediaModel(video: HTMLVideoElement, duration: number, currentTime = 0) {
  const state = { currentTime, seeks: [] as number[] }
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

/** The term films run 5.04 seconds; a quarter turn is second 1.26, three quarters is 3.78. */
const DURATION = 5.04
const SEAL = { src: "/media/term-seal.mp4", poster: "/media/term-seal-poster.jpg" }

let now = 10_000
let drivers: SceneDrivers

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
})

/** Mount the seal film, lay its 400px frame out on screen, and model a film currently showing second 2. */
function mount(props: { className?: string; testId?: string } = {}) {
  const utils = render(<ObjectFilm src={SEAL.src} poster={SEAL.poster} {...props} />)
  const figure = screen.getByTestId(props.testId ?? "object-film")
  setRect(figure, { top: 100, height: 400, width: 400 })
  const video = screen.getByTestId("scrub-video") as HTMLVideoElement
  const media = mediaModel(video, DURATION, 2)
  return { ...utils, figure, video, media }
}

/** Bring the film near the viewport (its source attaches) and the frame on screen (the turntable starts), then run one frame. */
function start({ figure, video }: { figure: HTMLElement; video: HTMLVideoElement }) {
  act(() => {
    drivers.intersect(video, true)
    drivers.intersect(figure, true)
    drivers.flushFrames()
  })
}

describe("<ObjectFilm />", () => {
  it("merges extra classes into the frame and takes a custom test id", () => {
    mount({ className: "mb-5", testId: "terms-figure-seal" })
    const figure = screen.getByTestId("terms-figure-seal")
    expect(figure).toHaveClass("mb-5", "m-0", "aspect-square", "shadow-product")
    expect(screen.queryByTestId("object-film")).toBeNull()
  })

  it("attaches the source once the film approaches the viewport and watches the frame for the turntable", () => {
    const { figure, video } = mount()
    expect(drivers.watchers(figure)).toBe(1)
    expect(drivers.watchers(video)).toBe(1)
    expect(drivers.raf).not.toHaveBeenCalled()
    act(() => drivers.intersect(video, true))
    expect(video).toHaveAttribute("src", SEAL.src)
    expect(video.preload).toBe("auto")
    expect(drivers.watchers(video)).toBe(0)
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("turns the object on its own: the first frame, a quarter turn 3.5 seconds later, then half", () => {
    const film = mount()
    start(film)
    // The loop starts from progress 0: the film jumps back from second 2 to its first frame.
    expect(film.media.seeks).toEqual([0])
    now += 3500
    act(() => drivers.flushFrames())
    expect(film.media.seeks).toHaveLength(2)
    expect(film.media.seeks[1]).toBeCloseTo(1.26, 2)
    now += 3500
    act(() => drivers.flushFrames())
    expect(film.media.seeks).toHaveLength(3)
    expect(film.media.seeks[2]).toBeCloseTo(2.52, 2)
    expect(drivers.pendingFrames()).toBe(1)
  })

  it("stops the loop once the frame leaves the viewport and resumes when it returns", () => {
    const film = mount()
    start(film)
    expect(drivers.pendingFrames()).toBe(1)
    act(() => drivers.intersect(film.figure, false))
    expect(drivers.pendingFrames()).toBe(0)
    act(() => drivers.intersect(film.figure, true))
    expect(drivers.pendingFrames()).toBe(1)
  })

  it("removes the video and keeps the frame when the source fails, and the loop carries on harmlessly", () => {
    const film = mount()
    start(film)
    fireEvent.error(film.video)
    expect(screen.queryByTestId("scrub-video")).toBeNull()
    const figure = screen.getByTestId("object-film")
    expect(figure).toHaveClass("bg-tile-1", "shadow-product", "aspect-square", "rounded-lg", "overflow-hidden")
    expect(figure.children).toHaveLength(0)
    now += 3500
    expect(() => act(() => drivers.flushFrames())).not.toThrow()
    expect(film.media.seeks).toEqual([0])
    expect(drivers.pendingFrames()).toBe(1)
  })
})
