import { act, render } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { driveScene, installSceneDrivers, pinViewport, type SceneDrivers, setRect } from "./scene-test-utils"

function Harness({ onFrame }: { onFrame: (p: number, size: { width: number; height: number }) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useSceneProgress(ref, onFrame)
  return <div ref={ref} data-testid="scene" />
}

describe("useSceneProgress", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
    pinViewport(1000)
  })
  afterEach(() => {
    drivers.restore()
    pinViewport(768)
  })

  it("does not run any frame until the scene intersects the viewport", () => {
    const onFrame = vi.fn()
    render(<Harness onFrame={onFrame} />)
    expect(drivers.raf).not.toHaveBeenCalled()
    expect(onFrame).not.toHaveBeenCalled()
  })

  it("reports 0 while the scene top is still below the viewport top", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    setRect(el, { top: 300, height: 2000, width: 900 })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    expect(onFrame).toHaveBeenCalledTimes(1)
    expect(onFrame).toHaveBeenCalledWith(0, { width: 900, height: 2000 })
  })

  it("reports 0.5 when the scene has scrolled halfway through its sticky range", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    driveScene(drivers, getByTestId("scene"), 0.5)
    expect(onFrame).toHaveBeenLastCalledWith(0.5, { width: 1200, height: 2000 })
  })

  it("clamps to 1 once the scene has scrolled past its sticky range", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    setRect(el, { top: -5000, height: 2000 })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    expect(onFrame).toHaveBeenLastCalledWith(1, { width: 1200, height: 2000 })
  })

  it("reports 0 for a scene shorter than the viewport even when it is scrolled up", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    setRect(el, { top: -400, height: 800 })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    expect(onFrame).toHaveBeenCalledWith(0, { width: 1200, height: 800 })
  })

  it("does not call back again while progress and size are unchanged", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    driveScene(drivers, getByTestId("scene"), 0.25)
    expect(onFrame).toHaveBeenCalledTimes(1)
    act(() => drivers.flushFrames(3))
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it("calls back when only the measured size changes", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    driveScene(drivers, el, 0.25)
    setRect(el, { top: -250, height: 2000, width: 640 })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenCalledTimes(2)
    expect(onFrame).toHaveBeenLastCalledWith(0.25, { width: 640, height: 2000 })
  })

  it("keeps one frame queued while visible and re-measures on every flush", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    driveScene(drivers, el, 0.1)
    expect(drivers.pendingFrames()).toBe(1)
    setRect(el, { top: -900, height: 2000 })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith(0.9, { width: 1200, height: 2000 })
    expect(drivers.pendingFrames()).toBe(1)
  })

  it("cancels the frame loop when the scene leaves the viewport and restarts from a fresh measurement when it returns", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    driveScene(drivers, el, 0.3)
    act(() => drivers.intersect(el, false))
    expect(drivers.caf).toHaveBeenCalledTimes(1)
    expect(drivers.pendingFrames()).toBe(0)
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    // Same progress as before, but re-entry resets the dedupe so the scene repaints.
    expect(onFrame).toHaveBeenCalledTimes(2)
    expect(onFrame).toHaveBeenLastCalledWith(0.3, { width: 1200, height: 2000 })
  })

  it("disconnects its observer and cancels the pending frame on unmount", () => {
    const onFrame = vi.fn()
    const { getByTestId, unmount } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    driveScene(drivers, el, 0.3)
    expect(drivers.watchers(el)).toBe(1)
    const pendingId = drivers.raf.mock.results.at(-1)?.value
    unmount()
    expect(drivers.watchers(el)).toBe(0)
    expect(drivers.caf).toHaveBeenCalledWith(pendingId)
    expect(drivers.pendingFrames()).toBe(0)
    setRect(el, { top: -900, height: 2000 })
    drivers.intersect(el, true)
    drivers.flushFrames()
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it("uses the latest callback without restarting the loop when the callback identity changes", () => {
    const first = vi.fn()
    const second = vi.fn()
    const { getByTestId, rerender } = render(<Harness onFrame={first} />)
    const el = getByTestId("scene")
    driveScene(drivers, el, 0.2)
    rerender(<Harness onFrame={second} />)
    setRect(el, { top: -600, height: 2000 })
    act(() => drivers.flushFrames())
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledWith(0.6, { width: 1200, height: 2000 })
    expect(drivers.watchers(el)).toBe(1)
  })
})
