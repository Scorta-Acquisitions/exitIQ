import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, stubMatchMedia } from "./scene-test-utils"

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

  beforeEach(() => {
    drivers = installSceneDrivers()
    play = vi.fn().mockResolvedValue(undefined)
    pause = vi.fn()
    HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement["play"]
    HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement["pause"]
  })
  afterEach(() => {
    drivers.restore()
    vi.restoreAllMocks()
    restoreMatchMedia()
  })

  it("renders a muted, inline, metadata-preloading video that is hidden from assistive tech by default", () => {
    render(<AmbientVideo src="/media/x.mp4" className="cover" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    expect(video.tagName).toBe("VIDEO")
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute("playsinline")
    expect(video).toHaveAttribute("preload", "metadata")
    expect(video).toHaveAttribute("aria-hidden", "true")
    expect(video).not.toHaveAttribute("role")
    expect(video).not.toHaveAttribute("aria-label")
    expect(video).toHaveClass("cover")
  })

  it("carries no poster unless one is given, and shows the given poster before the source attaches", () => {
    const { unmount } = render(<AmbientVideo src="/media/x.mp4" />)
    expect(screen.getByTestId("ambient-video")).not.toHaveAttribute("poster")
    unmount()
    render(<AmbientVideo src="/media/x.mp4" poster="/media/x-poster.jpg" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    expect(video).toHaveAttribute("poster", "/media/x-poster.jpg")
    expect(video).not.toHaveAttribute("src")
    act(() => drivers.intersect(video, true))
    expect(video).toHaveAttribute("src", "/media/x.mp4")
    expect(video).toHaveAttribute("poster", "/media/x-poster.jpg")
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
    expect(play).not.toHaveBeenCalled()
  })

  it("watches with a 100px attach margin, so the source is fetched before the film is on screen", () => {
    const inits: (IntersectionObserverInit | undefined)[] = []
    const Base = window.IntersectionObserver
    class Recording extends Base {
      constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
        super(cb, init)
        inits.push(init)
      }
    }
    window.IntersectionObserver = Recording as unknown as typeof window.IntersectionObserver
    try {
      render(<AmbientVideo src="/media/x.mp4" />)
      expect(inits).toEqual([{ rootMargin: "100px" }])
    } finally {
      window.IntersectionObserver = Base
    }
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

  it("runs no frame loop: a looping film is driven by the observer alone", () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    expect(drivers.raf).not.toHaveBeenCalled()
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("pauses playback when it scrolls off screen and resumes it when the element returns", async () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    const media = mediaModel(video, 6)
    await act(async () => {
      drivers.intersect(video, true)
      await Promise.resolve()
    })
    media.paused = false
    act(() => drivers.intersect(video, false))
    expect(pause).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(1)
    media.paused = true
    act(() => drivers.intersect(video, true))
    expect(play).toHaveBeenCalledTimes(2)
  })

  it("does not pause a film that is already paused when it leaves the viewport", () => {
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    act(() => drivers.intersect(video, false))
    expect(pause).not.toHaveBeenCalled()
  })

  it("does not double-call play while a previous play() promise is still pending", async () => {
    let resolvePlay: () => void = () => {}
    play.mockImplementation(() => new Promise<void>((r) => (resolvePlay = r)))
    render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    act(() => drivers.intersect(video, true))
    expect(play).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolvePlay()
      await Promise.resolve()
    })
    act(() => drivers.intersect(video, true))
    expect(play).toHaveBeenCalledTimes(2)
  })

  describe("a rejected autoplay", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    async function renderRejected() {
      const utils = render(<AmbientVideo src="/media/x.mp4" />)
      const video = screen.getByTestId("ambient-video") as HTMLVideoElement
      const media = mediaModel(video, 6)
      await act(async () => {
        drivers.intersect(video, true)
        await Promise.resolve()
      })
      return { ...utils, video, media }
    }

    it("is tried again four seconds later, and not a millisecond before", async () => {
      play.mockRejectedValueOnce(new Error("NotAllowedError"))
      await renderRejected()
      expect(play).toHaveBeenCalledTimes(1)
      await act(async () => {
        vi.advanceTimersByTime(3_999)
      })
      expect(play).toHaveBeenCalledTimes(1)
      await act(async () => {
        vi.advanceTimersByTime(1)
      })
      expect(play).toHaveBeenCalledTimes(2)
    })

    it("queues one retry however many rejections a re-intersection adds", async () => {
      play.mockRejectedValue(new Error("NotAllowedError"))
      const { video } = await renderRejected()
      await act(async () => {
        drivers.intersect(video, true)
        await Promise.resolve()
      })
      expect(play).toHaveBeenCalledTimes(2)
      await act(async () => {
        vi.advanceTimersByTime(4_000)
      })
      expect(play).toHaveBeenCalledTimes(3)
    })

    it("is dropped when the film leaves the viewport, and picked up again when it returns", async () => {
      play.mockRejectedValueOnce(new Error("NotAllowedError"))
      const { video } = await renderRejected()
      act(() => drivers.intersect(video, false))
      await act(async () => {
        vi.advanceTimersByTime(4_000)
      })
      expect(play).toHaveBeenCalledTimes(1)
      act(() => drivers.intersect(video, true))
      expect(play).toHaveBeenCalledTimes(2)
    })

    it("clears its timer on unmount, so nothing plays after the element is gone", async () => {
      play.mockRejectedValueOnce(new Error("NotAllowedError"))
      const { unmount } = await renderRejected()
      expect(play).toHaveBeenCalledTimes(1)
      unmount()
      await act(async () => {
        vi.advanceTimersByTime(8_000)
      })
      expect(play).toHaveBeenCalledTimes(1)
    })
  })

  it("removes itself from the DOM when the source fails to load", () => {
    render(<AmbientVideo src="/media/missing.mp4" />)
    const video = screen.getByTestId("ambient-video")
    act(() => drivers.intersect(video, true))
    fireEvent.error(video)
    expect(screen.queryByTestId("ambient-video")).toBeNull()
    expect(drivers.watchers(video)).toBe(0)
  })

  it("leaves the poster as the only picture when the visitor prefers reduced motion", () => {
    stubMatchMedia(true)
    render(<AmbientVideo src="/media/x.mp4" poster="/media/x-poster.jpg" />)
    const video = screen.getByTestId("ambient-video")
    expect(drivers.watchers(video)).toBe(0)
    expect(drivers.raf).not.toHaveBeenCalled()
    expect(video).toHaveAttribute("poster", "/media/x-poster.jpg")
    expect(video).not.toHaveAttribute("src")
    expect(play).not.toHaveBeenCalled()
  })

  it("stops observing and pauses the film on unmount", () => {
    const { unmount } = render(<AmbientVideo src="/media/x.mp4" />)
    const video = screen.getByTestId("ambient-video") as HTMLVideoElement
    const media = mediaModel(video, 6)
    act(() => drivers.intersect(video, true))
    media.paused = false
    unmount()
    expect(drivers.watchers(video)).toBe(0)
    expect(pause).toHaveBeenCalledTimes(1)
  })
})
