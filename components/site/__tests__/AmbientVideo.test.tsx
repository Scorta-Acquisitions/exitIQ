import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { installSceneDrivers, type SceneDrivers } from "./scene-test-utils"

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

/** Give the video a controllable playback model: `paused`, `duration`, and a recorded `currentTime`. */
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

describe("<AmbientVideo />", () => {
  let drivers: SceneDrivers
  let play: ReturnType<typeof vi.fn>
  let pause: ReturnType<typeof vi.fn>
  let now = 10_000

  beforeEach(() => {
    drivers = installSceneDrivers()
    play = vi.fn().mockResolvedValue(undefined)
    pause = vi.fn()
    HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement["play"]
    HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement["pause"]
    now = 10_000
    vi.spyOn(performance, "now").mockImplementation(() => now)
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    window.matchMedia = realMatchMedia
  })

  it("renders a muted, inline, metadata-preloading video that is hidden from assistive tech by default", () => {
    render(<AmbientVideo src="/media/x.mp4" className="cover" style={{ opacity: 0.5 }} />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    expect(video.tagName).toBe("VIDEO")
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute("playsinline")
    expect(video).toHaveAttribute("preload", "metadata")
    expect(video).toHaveAttribute("aria-hidden", "true")
    expect(video).not.toHaveAttribute("role")
    expect(video).not.toHaveAttribute("aria-label")
    expect(video).toHaveClass("cover")
    expect(video.style.opacity).toBe("0.5")
  })

  it("exposes itself as an image with the given label when ariaLabel is set", () => {
    render(<AmbientVideo src="/media/x.mp4" ariaLabel="Slow drift over paper" />)
    const video = screen.getByRole("img", { name: "Slow drift over paper" })
    expect(video).toHaveAttribute("data-testid", "ambient-video")
    expect(video).not.toHaveAttribute("aria-hidden")
  })

  it("does not attach the source until the element approaches the viewport", () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video")
    expect(video).not.toHaveAttribute("src")
    expect(drivers.watchers(video)).toBe(1)
    act(() => drivers.flushFrames())
    expect(video).not.toHaveAttribute("src")
    expect(play).not.toHaveBeenCalled()
  })

  it("attaches the source, enables native looping, and starts playback once visible", () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    expect(video).toHaveAttribute("src", "/media/x.mp4")
    expect(video.loop).toBe(true)
    expect(video.muted).toBe(true)
    expect(play).toHaveBeenCalledTimes(1)
  })

  it("disables native looping in fadeLoop mode so it can scrub backward itself", () => {
    render(<AmbientVideo src="/media/x.mp4" fadeLoop />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    expect(video.loop).toBe(false)
  })

  it("pauses playback when it scrolls off screen and does not call play again", () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    const media = mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    media.paused = false
    act(() => drivers.intersect(video, false))
    expect(pause).toHaveBeenCalledTimes(1)
    act(() => drivers.flushFrames(3))
    expect(play).toHaveBeenCalledTimes(1)
  })

  it("does not double-call play while a previous play() promise is still pending", async () => {
    let resolvePlay: () => void = () => {}
    play.mockImplementation(() => new Promise<void>((r) => (resolvePlay = r)))
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    act(() => drivers.flushFrames(4))
    expect(play).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolvePlay()
      await Promise.resolve()
    })
    act(() => drivers.flushFrames())
    expect(play).toHaveBeenCalledTimes(2)
  })

  it("waits four seconds before retrying after autoplay is rejected", async () => {
    play.mockRejectedValueOnce(new Error("NotAllowedError"))
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    await act(async () => {
      drivers.intersect(video, true)
      await Promise.resolve()
    })
    expect(play).toHaveBeenCalledTimes(1)
    now += 3_999
    act(() => drivers.flushFrames())
    expect(play).toHaveBeenCalledTimes(1)
    now += 1
    act(() => drivers.flushFrames())
    expect(play).toHaveBeenCalledTimes(2)
  })

  it("scrubs backward to the start in fadeLoop mode instead of hard-cutting", async () => {
    render(<AmbientVideo src="/media/x.mp4" fadeLoop />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    const media = mediaModel(video, 5)
    await act(async () => {
      drivers.intersect(video, true)
      await Promise.resolve()
    })
    expect(play).toHaveBeenCalledTimes(1)
    media.paused = false
    media.currentTime = 4.95
    // Frame 1: past duration - 0.12, so playback pauses and the reverse scrub begins from 4.95.
    act(() => drivers.flushFrames())
    expect(pause).toHaveBeenCalledTimes(1)
    expect(media.seeks).toEqual([])
    // Frame 2, one second later: scrubbed back by one second.
    now += 1_000
    media.paused = true
    act(() => drivers.flushFrames())
    expect(media.seeks).toEqual([3.95])
    expect(play).toHaveBeenCalledTimes(1)
    // Frame 3, four more seconds later: reaches the start, snaps to 0.04, and plays forward again.
    now += 4_000
    act(() => drivers.flushFrames())
    expect(media.seeks).toEqual([3.95, 0.04])
    expect(play).toHaveBeenCalledTimes(2)
  })

  it("does not scrub in the default mode even when playback nears the end", () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    const media = mediaModel(video, 5)
    act(() => drivers.intersect(video, true))
    media.paused = false
    media.currentTime = 4.95
    act(() => drivers.flushFrames(2))
    expect(pause).not.toHaveBeenCalled()
    expect(media.seeks).toEqual([])
  })

  it("removes itself from the DOM when the source fails to load", () => {
    render(<AmbientVideo src="/media/missing.mp4" />)
    const video = screen.getByTestId("ambient-video")
    act(() => drivers.intersect(video, true))
    fireEvent.error(video)
    expect(screen.queryByTestId("ambient-video")).toBeNull()
    expect(drivers.watchers(video)).toBe(0)
  })

  it("never attaches the source or plays when the visitor prefers reduced motion", () => {
    reducedMotion(true)
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video")
    expect(drivers.watchers(video)).toBe(0)
    expect(drivers.raf).not.toHaveBeenCalled()
    act(() => drivers.flushFrames())
    expect(video).not.toHaveAttribute("src")
    expect(play).not.toHaveBeenCalled()
  })

  it("stops observing and cancels its frame loop on unmount", () => {
    const { unmount } = render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    const media = mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    media.paused = false
    expect(drivers.pendingFrames()).toBe(1)
    unmount()
    expect(drivers.watchers(video)).toBe(0)
    expect(drivers.pendingFrames()).toBe(0)
    expect(pause).toHaveBeenCalledTimes(1)
  })
})
