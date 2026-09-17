import { act, render } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { type ProgressMeasure, useSceneProgress } from "@/components/site/scenes/useSceneProgress"
import { BAR_H } from "@/lib/site/scroll"
import {
  driveScene,
  installSceneDrivers,
  pinViewport,
  SCENE_HEIGHT,
  type SceneDrivers,
  sceneTopAt,
  setRect,
  VIEWPORT_HEIGHT,
} from "./scene-test-utils"

function Harness({
  onFrame,
  measure,
}: {
  onFrame: (p: number, size: { width: number; height: number }) => void
  measure?: ProgressMeasure
}) {
  const ref = useRef<HTMLDivElement>(null)
  useSceneProgress(ref, onFrame, measure)
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
    setRect(el, { top: 300, height: SCENE_HEIGHT, width: 900 })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    expect(onFrame).toHaveBeenCalledTimes(1)
    expect(onFrame).toHaveBeenCalledWith(0, { width: 900, height: SCENE_HEIGHT })
  })

  it("measures under the bar by default: 0 with the scene's top at the bar's bottom edge, 0.052 once the bar covers 52px of it, static at the panel's height", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    setRect(el, { top: BAR_H, height: SCENE_HEIGHT })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    expect(onFrame).toHaveBeenLastCalledWith(0, { width: 1200, height: SCENE_HEIGHT })
    // The scene's top at the viewport's top is already 52px under the bar: 52 of the 1000px travel.
    setRect(el, { top: 0, height: SCENE_HEIGHT })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith(0.052, { width: 1200, height: SCENE_HEIGHT })
    // A scene exactly as tall as the panel (viewport minus bar) is static; one pixel taller plays through.
    setRect(el, { top: -300, height: VIEWPORT_HEIGHT - BAR_H })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith(0, { width: 1200, height: 948 })
    setRect(el, { top: -300, height: VIEWPORT_HEIGHT - BAR_H + 1 })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith(1, { width: 1200, height: 949 })
  })

  it("clamps to 1 once the scene has scrolled past its sticky range", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    setRect(el, { top: -5000, height: SCENE_HEIGHT })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    expect(onFrame).toHaveBeenLastCalledWith(1, { width: 1200, height: SCENE_HEIGHT })
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
    setRect(el, { top: sceneTopAt(0.25), height: SCENE_HEIGHT, width: 640 })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenCalledTimes(2)
    expect(onFrame).toHaveBeenLastCalledWith(0.25, { width: 640, height: SCENE_HEIGHT })
  })

  it("keeps one frame queued while visible and re-measures on every flush", () => {
    const onFrame = vi.fn()
    const { getByTestId } = render(<Harness onFrame={onFrame} />)
    const el = getByTestId("scene")
    driveScene(drivers, el, 0.1)
    expect(drivers.pendingFrames()).toBe(1)
    setRect(el, { top: sceneTopAt(0.9), height: SCENE_HEIGHT })
    act(() => drivers.flushFrames())
    expect(onFrame).toHaveBeenLastCalledWith(0.9, { width: 1200, height: SCENE_HEIGHT })
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
    expect(onFrame).toHaveBeenLastCalledWith(0.3, { width: 1200, height: SCENE_HEIGHT })
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
    setRect(el, { top: sceneTopAt(0.9), height: SCENE_HEIGHT })
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
    setRect(el, { top: sceneTopAt(0.6), height: SCENE_HEIGHT })
    act(() => drivers.flushFrames())
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledWith(0.6, { width: 1200, height: SCENE_HEIGHT })
    expect(drivers.watchers(el)).toBe(1)
  })

  it("measures through the supplied function instead of sceneProgress when one is given", () => {
    const onFrame = vi.fn()
    const measure: ProgressMeasure = vi.fn((top, height, vh) => (top + height + vh) / 10)
    const { getByTestId } = render(<Harness onFrame={onFrame} measure={measure} />)
    const el = getByTestId("scene")
    setRect(el, { top: 100, height: 400, width: 800 })
    act(() => {
      drivers.intersect(el, true)
      drivers.flushFrames()
    })
    // The measure also receives the scene's width, so a scene can pick its measure per viewport.
    expect(measure).toHaveBeenCalledWith(100, 400, 1000, 800)
    expect(onFrame).toHaveBeenCalledWith(150, { width: 800, height: 400 })
  })
})
