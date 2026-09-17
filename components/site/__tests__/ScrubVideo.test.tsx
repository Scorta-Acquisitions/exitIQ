import { act, fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type ScrubHandle, ScrubVideo } from "@/components/site/ui/ScrubVideo"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, stubMatchMedia } from "./scene-test-utils"

/**
 * A controllable playback model the way a browser exposes it: `duration` is NaN until `metadata()` delivers
 * it, every `currentTime` write is recorded and leaves the element `seeking` until `seeked()` fires.
 */
function mediaModel(video: HTMLVideoElement, duration: number) {
  const state = { currentTime: 0, seeks: [] as number[], duration: Number.NaN, seeking: false }
  Object.defineProperty(video, "duration", { configurable: true, get: () => state.duration })
  Object.defineProperty(video, "seeking", { configurable: true, get: () => state.seeking })
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => state.currentTime,
    set: (t: number) => {
      state.currentTime = t
      state.seeks.push(t)
      state.seeking = true
    },
  })
  return {
    ...state,
    get seeks() {
      return state.seeks
    },
    get currentTime() {
      return state.currentTime
    },
    set currentTime(t: number) {
      state.currentTime = t
    },
    get seeking() {
      return state.seeking
    },
    /** The browser reports the film's length. */
    metadata(length = duration) {
      state.duration = length
      fireEvent(video, new Event("loadedmetadata"))
    },
    /** The browser finishes the seek in flight. */
    seeked() {
      state.seeking = false
      fireEvent(video, new Event("seeked"))
    },
  }
}

/** Mount a film, bring it on screen, and (unless told otherwise) deliver its metadata. */
function mountReady(duration = 10) {
  const ref = createRef<ScrubHandle>()
  render(<ScrubVideo ref={ref} src="/media/x.mp4" poster="/media/x-poster.jpg" />)
  const video = screen.getByTestId("scrub-video") as HTMLVideoElement
  const media = mediaModel(video, duration)
  return { ref, video, media }
}

describe("<ScrubVideo />", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
  })
  afterEach(() => {
    drivers.restore()
    restoreMatchMedia()
  })

  it("renders a muted, inline video with its poster, preloading nothing, hidden from assistive tech by default", () => {
    render(<ScrubVideo src="/media/x.mp4" poster="/media/x-poster.jpg" className="cover" />)
    const video = screen.getByTestId("scrub-video") as HTMLVideoElement
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute("playsinline")
    expect(video).toHaveAttribute("preload", "none")
    expect(video).toHaveAttribute("poster", "/media/x-poster.jpg")
    expect(video).not.toHaveAttribute("src")
    expect(video).toHaveAttribute("aria-hidden", "true")
    expect(video).not.toHaveAttribute("role")
    expect(video).toHaveClass("cover")
  })

  it("exposes itself as an image with the given label when ariaLabel is set", () => {
    render(<ScrubVideo src="/media/x.mp4" poster="/media/x-poster.jpg" ariaLabel="A brass seal pressing wax" />)
    const video = screen.getByRole("img", { name: "A brass seal pressing wax" })
    expect(video).toHaveAttribute("data-testid", "scrub-video")
    expect(video).not.toHaveAttribute("aria-hidden")
  })

  it("attaches the source with full preloading once the element approaches the viewport, then stops observing", () => {
    const { video } = mountReady()
    expect(video).not.toHaveAttribute("src")
    expect(drivers.watchers(video)).toBe(1)
    act(() => drivers.intersect(video, true))
    expect(video).toHaveAttribute("src", "/media/x.mp4")
    expect(video.preload).toBe("auto")
    expect(drivers.watchers(video)).toBe(0)
  })

  it("does not attach the source while the element is still off screen", () => {
    const { video } = mountReady()
    act(() => drivers.intersect(video, false))
    expect(video).not.toHaveAttribute("src")
    expect(drivers.watchers(video)).toBe(1)
  })

  it("holds a seek requested before the metadata arrives and applies it as soon as the duration is known", () => {
    const { ref, video, media } = mountReady(10)
    act(() => drivers.intersect(video, true))
    act(() => ref.current!.seek(0.5))
    expect(media.seeks).toEqual([])
    media.metadata()
    expect(media.seeks).toEqual([5])
  })

  it("also applies a held seek when the browser only reports `canplay`", () => {
    const { ref, video, media } = mountReady(10)
    act(() => drivers.intersect(video, true))
    act(() => ref.current!.seek(0.3))
    media.duration = 10
    Object.defineProperty(video, "duration", { configurable: true, get: () => 10 })
    fireEvent(video, new Event("canplay"))
    expect(media.seeks).toEqual([3])
  })

  it("maps progress to currentTime across the film's duration and clamps out-of-range progress", () => {
    const { ref, video, media } = mountReady(8)
    act(() => drivers.intersect(video, true))
    media.metadata()
    act(() => ref.current!.seek(0.25))
    media.seeked()
    act(() => ref.current!.seek(1.7))
    media.seeked()
    act(() => ref.current!.seek(-3))
    expect(media.seeks).toEqual([2, 8, 0])
  })

  it("waits for `seeked` before issuing the next seek and then jumps straight to the latest request", () => {
    const { ref, video, media } = mountReady(10)
    act(() => drivers.intersect(video, true))
    media.metadata()
    act(() => ref.current!.seek(0.1))
    act(() => ref.current!.seek(0.2))
    act(() => ref.current!.seek(0.3))
    expect(media.seeks).toEqual([1])
    media.seeked()
    expect(media.seeks).toEqual([1, 3])
  })

  it("skips a seek that lands within one frame of the current time", () => {
    const { ref, video, media } = mountReady(10)
    act(() => drivers.intersect(video, true))
    media.metadata()
    act(() => ref.current!.seek(0.4))
    media.seeked()
    act(() => ref.current!.seek(0.401))
    expect(media.seeks).toEqual([4])
    act(() => ref.current!.seek(0.41))
    expect(media.seeks).toEqual([4, 4.1])
  })

  it("ignores a metadata event that reports no usable duration, and a zero one", () => {
    const { ref, video, media } = mountReady(Number.NaN)
    act(() => drivers.intersect(video, true))
    media.metadata(Number.NaN)
    act(() => ref.current!.seek(0.5))
    expect(media.seeks).toEqual([])
    media.metadata(0)
    expect(media.seeks).toEqual([])
    media.metadata(6)
    expect(media.seeks).toEqual([3])
  })

  it("recovers when the browser rejects a seek", () => {
    const { ref, video, media } = mountReady(10)
    act(() => drivers.intersect(video, true))
    media.metadata()
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => 0,
      set: () => {
        throw new Error("InvalidStateError")
      },
    })
    expect(() => act(() => ref.current!.seek(0.5))).not.toThrow()
    // The element never entered `seeking`, so the next request goes straight through.
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => 0,
      set: (t: number) => {
        media.seeks.push(t)
      },
    })
    act(() => ref.current!.seek(0.6))
    expect(media.seeks).toEqual([6])
  })

  it("removes itself from the DOM when the source fails to load", () => {
    const { video } = mountReady()
    act(() => drivers.intersect(video, true))
    fireEvent.error(video)
    expect(screen.queryByTestId("scrub-video")).toBeNull()
  })

  it("never attaches the source or seeks when the visitor prefers reduced motion, leaving the poster on show", () => {
    stubMatchMedia(true)
    const { ref, video, media } = mountReady()
    expect(drivers.watchers(video)).toBe(0)
    media.metadata()
    act(() => ref.current!.seek(0.5))
    expect(video).not.toHaveAttribute("src")
    expect(video).toHaveAttribute("poster", "/media/x-poster.jpg")
    expect(media.seeks).toEqual([])
  })

  it("stops observing and forgets its pending request on unmount", () => {
    const ref = createRef<ScrubHandle>()
    const { unmount } = render(<ScrubVideo ref={ref} src="/media/x.mp4" poster="/media/x-poster.jpg" />)
    const video = screen.getByTestId("scrub-video") as HTMLVideoElement
    const media = mediaModel(video, 10)
    act(() => drivers.intersect(video, true))
    act(() => ref.current!.seek(0.5))
    unmount()
    expect(drivers.watchers(video)).toBe(0)
    // A late metadata event finds nothing pending and no listener.
    media.metadata()
    act(() => ref.current?.seek(0.5))
    expect(media.seeks).toEqual([])
  })
})
