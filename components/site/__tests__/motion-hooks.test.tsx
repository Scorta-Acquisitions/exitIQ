import { act, render, screen } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { hoverUnavailable, prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { useCountUp } from "@/components/site/motion/useCountUp"
import { useIdleTick } from "@/components/site/motion/useIdleTick"
import { usePointerParallax } from "@/components/site/motion/usePointerParallax"
import { usePrevious } from "@/components/site/motion/usePrevious"
import { useRaceLoop } from "@/components/site/motion/useRaceLoop"
import { useReveal } from "@/components/site/motion/useReveal"
import { useTurntable } from "@/components/site/motion/useTurntable"
import { RACE_FINAL, type RaceFrame } from "@/lib/site/motion"
import {
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  setRect,
  stubMatchMedia,
} from "./scene-test-utils"

let now = 10_000
let drivers: SceneDrivers

/** Dispatch a pointer event on `el` (jsdom has no PointerEvent, so a MouseEvent carries the pointer type). */
function pointer(el: Element, type: "pointermove" | "pointerleave", x = 0, y = 0, pointerType = "mouse") {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true })
  Object.defineProperty(event, "pointerType", { value: pointerType })
  act(() => {
    el.dispatchEvent(event)
  })
}

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

describe("media helpers", () => {
  it("read reduced motion and hover availability from matchMedia", () => {
    expect(prefersReducedMotion()).toBe(false)
    expect(hoverUnavailable()).toBe(false)
    stubMatchMedia(["prefers-reduced-motion"])
    expect(prefersReducedMotion()).toBe(true)
    expect(hoverUnavailable()).toBe(false)
    stubMatchMedia(["hover: none"])
    expect(hoverUnavailable()).toBe(true)
  })
})

/* ------------------------------------------------------------------------------------------------ */

/** Reads back the value this hook remembered from the render before, next to the one it was given. */
function PreviousHarness({ value }: { value: number }) {
  const previous = usePrevious(value)
  return (
    <p data-testid="prev" data-value={value}>
      {previous}
    </p>
  )
}

describe("usePrevious", () => {
  it("answers the value it was given on the first render, so nothing reads as changed on mount", () => {
    render(<PreviousHarness value={2} />)
    expect(screen.getByTestId("prev").textContent).toBe("2")
  })

  it("answers the last committed value after a change, and the new one once it has been committed twice", () => {
    const { rerender } = render(<PreviousHarness value={2} />)
    rerender(<PreviousHarness value={5} />)
    expect(screen.getByTestId("prev").textContent).toBe("2")
    rerender(<PreviousHarness value={5} />)
    expect(screen.getByTestId("prev").textContent).toBe("5")
    rerender(<PreviousHarness value={1} />)
    expect(screen.getByTestId("prev").textContent).toBe("5")
  })
})

/* ------------------------------------------------------------------------------------------------ */

function RevealHarness() {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)
  return (
    <div ref={ref} data-testid="root">
      <p data-reveal="" data-testid="a">
        a
      </p>
      <p data-reveal="" data-testid="b">
        b
      </p>
      <p data-reveal="" data-testid="c">
        c
      </p>
      <p data-testid="d">d</p>
    </div>
  )
}

describe("useReveal", () => {
  /** Lay the four items out before mount: `a` on screen, `b` and `c` below the fold. */
  function layOut() {
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const top = this.dataset.testid === "a" ? 200 : 1200
      return { top, height: 40, width: 600, bottom: top + 40, left: 0, right: 600, x: 0, y: top, toJSON: () => ({}) }
    })
    return spy
  }

  it("marks only the items still below the fold as pending, never the one already on screen", () => {
    layOut()
    render(<RevealHarness />)
    expect(screen.getByTestId("a")).not.toHaveClass("reveal-pending")
    expect(screen.getByTestId("b")).toHaveClass("reveal-pending")
    expect(screen.getByTestId("c")).toHaveClass("reveal-pending")
    expect(screen.getByTestId("d")).not.toHaveClass("reveal-pending")
    expect(drivers.watchers(screen.getByTestId("b"))).toBe(1)
    expect(drivers.watchers(screen.getByTestId("a"))).toBe(0)
  })

  it("reveals items as they intersect, staggering the ones that land together by 60ms each, once", () => {
    layOut()
    render(<RevealHarness />)
    const b = screen.getByTestId("b")
    const c = screen.getByTestId("c")
    act(() => {
      drivers.intersect(b, true)
      drivers.intersect(c, true)
    })
    expect(b).toHaveClass("reveal-in")
    expect(b).not.toHaveClass("reveal-pending")
    expect(b.style.getPropertyValue("--reveal-delay")).toBe("0ms")
    expect(c).toHaveClass("reveal-in")
    expect(c.style.getPropertyValue("--reveal-delay")).toBe("60ms")
    // Revealed items are no longer watched, so scrolling away and back changes nothing.
    expect(drivers.watchers(b)).toBe(0)
    act(() => drivers.intersect(b, false))
    expect(b).toHaveClass("reveal-in")
  })

  it("starts a new stagger batch for an item arriving more than 50ms after the last", () => {
    layOut()
    render(<RevealHarness />)
    act(() => drivers.intersect(screen.getByTestId("b"), true))
    now += 51
    act(() => drivers.intersect(screen.getByTestId("c"), true))
    expect(screen.getByTestId("c").style.getPropertyValue("--reveal-delay")).toBe("0ms")
  })

  it("ignores an observer report that an item is not intersecting", () => {
    layOut()
    render(<RevealHarness />)
    const b = screen.getByTestId("b")
    act(() => drivers.intersect(b, false))
    expect(b).toHaveClass("reveal-pending")
    expect(b).not.toHaveClass("reveal-in")
  })

  it("marks nothing and watches nothing under reduced motion", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    layOut()
    render(<RevealHarness />)
    for (const id of ["a", "b", "c"]) expect(screen.getByTestId(id)).not.toHaveClass("reveal-pending")
    expect(drivers.watchers(screen.getByTestId("b"))).toBe(0)
  })

  it("watches nothing when every item is already on screen", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      height: 40,
      width: 600,
      bottom: 140,
      left: 0,
      right: 600,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect)
    render(<RevealHarness />)
    expect(screen.getByTestId("b")).not.toHaveClass("reveal-pending")
    expect(drivers.watchers(screen.getByTestId("b"))).toBe(0)
  })

  it("removes its classes and delay on unmount, and drops the observer a pending item still holds", () => {
    layOut()
    const { unmount } = render(<RevealHarness />)
    const b = screen.getByTestId("b")
    // `c` is still pending (never intersected), so its watcher is the one `io.disconnect()` has to drop.
    const c = screen.getByTestId("c")
    act(() => drivers.intersect(b, true))
    expect(drivers.watchers(c)).toBe(1)
    unmount()
    expect(b).not.toHaveClass("reveal-in")
    expect(b).not.toHaveClass("reveal-pending")
    expect(b.style.getPropertyValue("--reveal-delay")).toBe("")
    expect(drivers.watchers(c)).toBe(0)
  })
})

/* ------------------------------------------------------------------------------------------------ */

function ParallaxHarness({ max = 6 }: { max?: number }) {
  const area = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  usePointerParallax(area, layer, { max })
  return (
    <div ref={area} data-testid="area">
      <div ref={layer} data-testid="layer" />
    </div>
  )
}

describe("usePointerParallax", () => {
  function mount() {
    const utils = render(<ParallaxHarness />)
    const area = screen.getByTestId("area")
    setRect(area, { top: 0, height: 200, width: 400 })
    return { ...utils, area, layer: screen.getByTestId("layer") }
  }

  it("eases the layer toward the pointer by 12% of the remaining distance per frame and stops when settled", () => {
    const { area, layer } = mount()
    pointer(area, "pointermove", 400, 100, "mouse")
    expect(drivers.pendingFrames()).toBe(1)
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("translate3d(0.72px, 0.00px, 0)")
    now += 1000 / 60
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("translate3d(1.35px, 0.00px, 0)")
    // A long frame later the layer has effectively arrived and the loop stops.
    now += 5000
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("translate3d(6.00px, 0.00px, 0)")
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("coalesces two moves into the one queued frame and eases toward the latest target", () => {
    const { area, layer } = mount()
    pointer(area, "pointermove", 400, 100, "mouse")
    pointer(area, "pointermove", 400, 200, "mouse")
    expect(drivers.pendingFrames()).toBe(1)
    act(() => drivers.flushFrames())
    // One 60fps frame of 12% toward the second move's corner (6px, 6px), not the first move's (6px, 0px).
    expect(layer.style.transform).toBe("translate3d(0.72px, 0.72px, 0)")
  })

  it("returns to rest when the pointer leaves and clears the transform once home", () => {
    const { area, layer } = mount()
    pointer(area, "pointermove", 400, 200, "mouse")
    // The first frame after a move steps one 60fps frame; the clock is read from the second frame on.
    act(() => drivers.flushFrames())
    now += 5000
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("translate3d(6.00px, 6.00px, 0)")
    pointer(area, "pointerleave")
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("translate3d(5.28px, 5.28px, 0)")
    now += 5000
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("")
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("clamps to the maximum at the edges and to the centre in the middle", () => {
    const { area, layer } = mount()
    pointer(area, "pointermove", 2000, -300, "mouse")
    act(() => drivers.flushFrames())
    now += 5000
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("translate3d(6.00px, -6.00px, 0)")
    pointer(area, "pointermove", 200, 100, "mouse")
    act(() => drivers.flushFrames())
    now += 5000
    act(() => drivers.flushFrames())
    expect(layer.style.transform).toBe("")
  })

  it("ignores touch pointers", () => {
    const { area, layer } = mount()
    pointer(area, "pointermove", 400, 100, "touch")
    expect(drivers.pendingFrames()).toBe(0)
    expect(layer.style.transform).toBe("")
  })

  it("does nothing on a device that cannot hover or for a visitor who prefers reduced motion", () => {
    stubMatchMedia(["hover: none"])
    const first = mount()
    pointer(first.area, "pointermove", 400, 100, "mouse")
    expect(drivers.pendingFrames()).toBe(0)
    first.unmount()
    stubMatchMedia(["prefers-reduced-motion"])
    const second = mount()
    pointer(second.area, "pointermove", 400, 100, "mouse")
    expect(drivers.pendingFrames()).toBe(0)
    expect(second.layer.style.transform).toBe("")
  })

  it("cancels its frame, removes its listeners, and clears the transform on unmount", () => {
    const { area, layer, unmount } = mount()
    const remove = vi.spyOn(area, "removeEventListener")
    pointer(area, "pointermove", 400, 100, "mouse")
    act(() => drivers.flushFrames())
    expect(layer.style.transform).not.toBe("")
    unmount()
    expect(drivers.pendingFrames()).toBe(0)
    expect(layer.style.transform).toBe("")
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function))
    expect(remove).toHaveBeenCalledWith("pointerleave", expect.any(Function))
  })
})

/* ------------------------------------------------------------------------------------------------ */

function IdleHarness({ ms = 3500, enabled = true }: { ms?: number; enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const tick = useIdleTick(ref, ms, enabled)
  return (
    <div ref={ref} data-testid="el">
      {tick}
    </div>
  )
}

describe("useIdleTick", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }))
  afterEach(() => vi.useRealTimers())

  it("counts every 3.5 seconds only while the element is on screen", () => {
    render(<IdleHarness />)
    const el = screen.getByTestId("el")
    act(() => vi.advanceTimersByTime(10_000))
    expect(el).toHaveTextContent("0")
    act(() => drivers.intersect(el, true))
    act(() => vi.advanceTimersByTime(3499))
    expect(el).toHaveTextContent("0")
    act(() => vi.advanceTimersByTime(1))
    expect(el).toHaveTextContent("1")
    act(() => vi.advanceTimersByTime(7000))
    expect(el).toHaveTextContent("3")
    act(() => drivers.intersect(el, false))
    act(() => vi.advanceTimersByTime(10_000))
    expect(el).toHaveTextContent("3")
    act(() => drivers.intersect(el, true))
    act(() => vi.advanceTimersByTime(3500))
    expect(el).toHaveTextContent("4")
  })

  it("pauses while the tab is hidden and resumes when it is shown again", () => {
    render(<IdleHarness />)
    const el = screen.getByTestId("el")
    act(() => drivers.intersect(el, true))
    act(() => vi.advanceTimersByTime(3500))
    expect(el).toHaveTextContent("1")
    const visibility = vi.spyOn(document, "visibilityState", "get")
    visibility.mockReturnValue("hidden")
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
      vi.advanceTimersByTime(20_000)
    })
    expect(el).toHaveTextContent("1")
    visibility.mockReturnValue("visible")
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
      vi.advanceTimersByTime(3500)
    })
    expect(el).toHaveTextContent("2")
  })

  it("never counts when disabled, for a non-positive interval, or under reduced motion", () => {
    const disabled = render(<IdleHarness enabled={false} />)
    act(() => drivers.intersect(screen.getByTestId("el"), true))
    act(() => vi.advanceTimersByTime(20_000))
    expect(screen.getByTestId("el")).toHaveTextContent("0")
    expect(drivers.watchers(screen.getByTestId("el"))).toBe(0)
    disabled.unmount()
    const zero = render(<IdleHarness ms={0} />)
    expect(drivers.watchers(screen.getByTestId("el"))).toBe(0)
    zero.unmount()
    stubMatchMedia(["prefers-reduced-motion"])
    render(<IdleHarness />)
    expect(drivers.watchers(screen.getByTestId("el"))).toBe(0)
    act(() => drivers.intersect(screen.getByTestId("el"), true))
    act(() => vi.advanceTimersByTime(20_000))
    expect(screen.getByTestId("el")).toHaveTextContent("0")
  })

  it("never doubles its interval: shown again while ticking, shown while off screen, seen while hidden", () => {
    render(<IdleHarness />)
    const el = screen.getByTestId("el")
    act(() => drivers.intersect(el, true))
    expect(vi.getTimerCount()).toBe(1)
    // Reported on screen again while the beat runs: the same one interval, at the same pace.
    act(() => drivers.intersect(el, true))
    expect(vi.getTimerCount()).toBe(1)
    act(() => vi.advanceTimersByTime(3500))
    expect(el).toHaveTextContent("1")

    // The tab coming back while the element is off screen starts nothing.
    act(() => drivers.intersect(el, false))
    expect(vi.getTimerCount()).toBe(0)
    const visibility = vi.spyOn(document, "visibilityState", "get")
    visibility.mockReturnValue("visible")
    act(() => document.dispatchEvent(new Event("visibilitychange")))
    expect(vi.getTimerCount()).toBe(0)

    // The element arriving while the tab is hidden starts nothing either.
    visibility.mockReturnValue("hidden")
    act(() => drivers.intersect(el, true))
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(20_000))
    expect(el).toHaveTextContent("1")
  })

  it("stops its interval and observer on unmount", () => {
    const { unmount } = render(<IdleHarness />)
    const el = screen.getByTestId("el")
    act(() => drivers.intersect(el, true))
    unmount()
    expect(drivers.watchers(el)).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })
})

/* ------------------------------------------------------------------------------------------------ */

const percent = (n: number) => `${Math.round(n)}%`

function CountHarness({ target = 40 }: { target?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useCountUp(ref, target, { format: percent })
  return (
    <span ref={ref} data-testid="figure">
      {percent(target)}
    </span>
  )
}

describe("useCountUp", () => {
  /** Put the figure `top` px down the page: the hook reads the rect once, at mount. */
  function belowTheFold(top = 1200) {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top,
      height: 60,
      width: 200,
      bottom: top + 60,
      left: 0,
      right: 200,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as DOMRect)
  }

  it("keeps the final value in the markup, then counts from 0 to 40 over 700ms once the figure is seen", () => {
    // The rect is read at mount, so the figure sits below the fold before the harness renders.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 1200,
      height: 60,
      width: 200,
      bottom: 1260,
      left: 0,
      right: 200,
      x: 0,
      y: 1200,
      toJSON: () => ({}),
    } as DOMRect)
    render(<CountHarness />)
    const figure = screen.getByTestId("figure")
    expect(figure).toHaveTextContent("40%")
    expect(drivers.watchers(figure)).toBe(1)
    act(() => drivers.intersect(figure, true))
    expect(figure).toHaveTextContent("0%")
    expect(drivers.watchers(figure)).toBe(0)
    act(() => drivers.flushFrames())
    expect(figure).toHaveTextContent("0%")
    now += 350
    act(() => drivers.flushFrames())
    expect(figure).toHaveTextContent("35%")
    now += 350
    act(() => drivers.flushFrames())
    expect(figure).toHaveTextContent("40%")
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("leaves a figure that is already on screen at mount alone", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 300,
      height: 60,
      width: 200,
      bottom: 360,
      left: 0,
      right: 200,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    } as DOMRect)
    render(<CountHarness />)
    const figure = screen.getByTestId("figure")
    expect(drivers.watchers(figure)).toBe(0)
    expect(figure).toHaveTextContent("40%")
  })

  it("does nothing under reduced motion", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<CountHarness />)
    expect(drivers.watchers(screen.getByTestId("figure"))).toBe(0)
    expect(screen.getByTestId("figure")).toHaveTextContent("40%")
  })

  it("ignores an observer report that the figure is not yet intersecting, and keeps watching it", () => {
    belowTheFold()
    render(<CountHarness />)
    const figure = screen.getByTestId("figure")
    act(() => drivers.intersect(figure, false))
    expect(figure).toHaveTextContent("40%")
    expect(drivers.pendingFrames()).toBe(0)
    expect(drivers.watchers(figure)).toBe(1)
    // The figure still counts when it really does arrive.
    act(() => drivers.intersect(figure, true))
    expect(figure).toHaveTextContent("0%")
  })

  it("counts a figure a viewport of no measurable height reports, since nothing sits above a zero fold", () => {
    pinViewport(0)
    belowTheFold(300)
    render(<CountHarness />)
    const figure = screen.getByTestId("figure")
    expect(drivers.watchers(figure)).toBe(1)
    act(() => drivers.intersect(figure, true))
    expect(figure).toHaveTextContent("0%")
    // The first frame only takes the clock's reading; 700ms later the count has arrived and stops.
    act(() => drivers.flushFrames())
    now += 700
    act(() => drivers.flushFrames())
    expect(figure).toHaveTextContent("40%")
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("stops counting on unmount", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 1200,
      height: 60,
      width: 200,
      bottom: 1260,
      left: 0,
      right: 200,
      x: 0,
      y: 1200,
      toJSON: () => ({}),
    } as DOMRect)
    const { unmount } = render(<CountHarness />)
    act(() => drivers.intersect(screen.getByTestId("figure"), true))
    expect(drivers.pendingFrames()).toBe(1)
    unmount()
    expect(drivers.pendingFrames()).toBe(0)
  })
})

/* ------------------------------------------------------------------------------------------------ */

function TurntableHarness({ seek }: { seek: (p: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useTurntable(ref, seek)
  return <div ref={ref} data-testid="frame" />
}

describe("useTurntable", () => {
  function mount() {
    const seek = vi.fn()
    const utils = render(<TurntableHarness seek={seek} />)
    const frame = screen.getByTestId("frame")
    setRect(frame, { top: 100, height: 400, width: 400 })
    return { ...utils, seek, frame }
  }

  it("drifts the object from 0 toward 1 over the period while on screen, seeking as it moves", () => {
    const { seek, frame } = mount()
    expect(drivers.pendingFrames()).toBe(0)
    act(() => drivers.intersect(frame, true))
    act(() => drivers.flushFrames())
    expect(seek).toHaveBeenLastCalledWith(0)
    now += 3500
    act(() => drivers.flushFrames())
    // The drift target is 0.25 a quarter period in; a 3.5s frame carries the eased value all the way there.
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(0.25, 3)
    now += 3500
    act(() => drivers.flushFrames())
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(0.5, 3)
    expect(drivers.pendingFrames()).toBe(1)
  })

  it("does not seek for a change smaller than a 240th", () => {
    const { seek, frame } = mount()
    act(() => drivers.intersect(frame, true))
    act(() => drivers.flushFrames())
    expect(seek).toHaveBeenCalledTimes(1)
    now += 1
    act(() => drivers.flushFrames())
    expect(seek).toHaveBeenCalledTimes(1)
  })

  it("follows the pointer across the frame and resumes the drift from there when it leaves", () => {
    const { seek, frame } = mount()
    act(() => drivers.intersect(frame, true))
    act(() => drivers.flushFrames())
    pointer(frame, "pointermove", 300, 200, "mouse")
    now += 5000
    act(() => drivers.flushFrames())
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(0.75, 3)
    pointer(frame, "pointerleave")
    // Drift resumes rising from 0.75: a quarter period later it has reached the top and turned.
    now += 3500
    act(() => drivers.flushFrames())
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(1, 2)
  })

  it("ignores touch pointers", () => {
    const { seek, frame } = mount()
    act(() => drivers.intersect(frame, true))
    act(() => drivers.flushFrames())
    pointer(frame, "pointermove", 400, 200, "touch")
    now += 3500
    act(() => drivers.flushFrames())
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(0.25, 3)
  })

  it("stops the loop off screen and never starts under reduced motion", () => {
    const { seek, frame, unmount } = mount()
    act(() => drivers.intersect(frame, true))
    act(() => drivers.flushFrames())
    act(() => drivers.intersect(frame, false))
    expect(drivers.pendingFrames()).toBe(0)
    unmount()
    stubMatchMedia(["prefers-reduced-motion"])
    const again = mount()
    expect(drivers.watchers(again.frame)).toBe(0)
    act(() => drivers.intersect(again.frame, true))
    expect(drivers.pendingFrames()).toBe(0)
    expect(again.seek).not.toHaveBeenCalled()
    expect(seek).toHaveBeenCalledTimes(1)
  })

  it("keeps its one loop and loses no time when the frame is reported on screen again while it drifts", () => {
    const { seek, frame } = mount()
    act(() => drivers.intersect(frame, true))
    act(() => drivers.flushFrames())
    expect(seek).toHaveBeenLastCalledWith(0)
    now += 3500
    act(() => drivers.flushFrames())
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(0.25, 3)
    // A second "on screen" report while the drift runs queues no extra frame and drops no elapsed time.
    act(() => drivers.intersect(frame, true))
    expect(drivers.pendingFrames()).toBe(1)
    now += 3500
    act(() => drivers.flushFrames())
    expect(seek.mock.calls.at(-1)?.[0]).toBeCloseTo(0.5, 3)
  })

  it("removes its listeners and observer on unmount", () => {
    const { frame, unmount } = mount()
    const remove = vi.spyOn(frame, "removeEventListener")
    act(() => drivers.intersect(frame, true))
    unmount()
    expect(drivers.watchers(frame)).toBe(0)
    expect(drivers.pendingFrames()).toBe(0)
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function))
    expect(remove).toHaveBeenCalledWith("pointerleave", expect.any(Function))
  })
})

/* ------------------------------------------------------------------------------------------------ */

function RaceHarness({ onFrame }: { onFrame: (f: RaceFrame) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useRaceLoop(ref, onFrame)
  return <div ref={ref} data-testid="track" />
}

describe("useRaceLoop", () => {
  it("advances the race clock only while running and reports each frame", () => {
    const onFrame = vi.fn()
    render(<RaceHarness onFrame={onFrame} />)
    const track = screen.getByTestId("track")
    expect(onFrame).not.toHaveBeenCalled()
    act(() => drivers.intersect(track, true))
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith({ traditional: 0, heirloom: 0, phase: "run", opacity: 1 })
    now += 1800
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith({ traditional: 0.3, heirloom: 0.5, phase: "run", opacity: 1 })
    // Off screen the clock pauses: a long absence does not advance the race.
    act(() => drivers.intersect(track, false))
    expect(drivers.pendingFrames()).toBe(0)
    now += 60_000
    act(() => drivers.intersect(track, true))
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith({ traditional: 0.3, heirloom: 0.5, phase: "run", opacity: 1 })
    now += 1800
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith({ traditional: 0.6, heirloom: 1, phase: "run", opacity: 1 })
  })

  it("keeps its one loop and loses no time when the track is reported on screen again while it runs", () => {
    const onFrame = vi.fn()
    render(<RaceHarness onFrame={onFrame} />)
    const track = screen.getByTestId("track")
    act(() => drivers.intersect(track, true))
    act(() => drivers.flushFrames())
    now += 1800
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith({ traditional: 0.3, heirloom: 0.5, phase: "run", opacity: 1 })
    // A second "on screen" report while the race runs queues no extra frame and resets no clock.
    act(() => drivers.intersect(track, true))
    expect(drivers.pendingFrames()).toBe(1)
    now += 1800
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith({ traditional: 0.6, heirloom: 1, phase: "run", opacity: 1 })
  })

  it("reports the final still once and runs no loop under reduced motion", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    const onFrame = vi.fn()
    render(<RaceHarness onFrame={onFrame} />)
    expect(onFrame).toHaveBeenCalledTimes(1)
    expect(onFrame).toHaveBeenCalledWith(RACE_FINAL)
    expect(drivers.watchers(screen.getByTestId("track"))).toBe(0)
  })

  it("stops on unmount", () => {
    const onFrame = vi.fn()
    const { unmount } = render(<RaceHarness onFrame={onFrame} />)
    act(() => drivers.intersect(screen.getByTestId("track"), true))
    expect(drivers.pendingFrames()).toBe(1)
    unmount()
    expect(drivers.pendingFrames()).toBe(0)
  })
})
