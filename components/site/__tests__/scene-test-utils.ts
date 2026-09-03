import { act } from "@testing-library/react"
import { type Mock, vi } from "vitest"

/**
 * Drivers for the scroll-choreographed scenes in jsdom.
 *
 * `useSceneProgress` starts a requestAnimationFrame loop from an IntersectionObserver callback and
 * re-requests a frame at the top of every tick, so the test needs (a) an observer whose callback it can
 * fire by hand and (b) a frame queue it can flush one batch at a time. Both are installed with
 * the test setup; call `drivers.restore()` in `afterEach`.
 */

interface ObserverRecord {
  cb: IntersectionObserverCallback
  targets: Set<Element>
  disconnected: boolean
}

export interface SceneDrivers {
  raf: Mock<(cb: FrameRequestCallback) => number>
  caf: Mock<(id: number) => void>
  /** Fire every live observer watching `el` with one entry. */
  intersect: (el: Element, isIntersecting: boolean) => void
  /** Run the frames queued so far (once per `count`); frames queued while running wait for the next flush. */
  flushFrames: (count?: number) => void
  pendingFrames: () => number
  /** Number of observers that are still connected and watching `el`. */
  watchers: (el: Element) => number
  /** Put the real IntersectionObserver and frame functions back. */
  restore: () => void
}

export function installSceneDrivers(): SceneDrivers {
  const observers: ObserverRecord[] = []

  class FakeIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string
    readonly thresholds: ReadonlyArray<number> = []
    private readonly rec: ObserverRecord
    constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
      this.rootMargin = init?.rootMargin ?? ""
      this.rec = { cb, targets: new Set(), disconnected: false }
      observers.push(this.rec)
    }
    observe(el: Element) {
      this.rec.targets.add(el)
    }
    unobserve(el: Element) {
      this.rec.targets.delete(el)
    }
    disconnect() {
      this.rec.disconnected = true
      this.rec.targets.clear()
    }
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  // vitest.setup.ts defines this property writable but not configurable, so assign rather than redefine.
  const realIO = window.IntersectionObserver
  window.IntersectionObserver = FakeIntersectionObserver

  let queue: Array<{ id: number; cb: FrameRequestCallback }> = []
  let nextId = 1
  const raf = vi.fn((cb: FrameRequestCallback) => {
    const id = nextId++
    queue.push({ id, cb })
    return id
  })
  const caf = vi.fn((id: number) => {
    queue = queue.filter((q) => q.id !== id)
  })
  vi.stubGlobal("requestAnimationFrame", raf)
  vi.stubGlobal("cancelAnimationFrame", caf)

  return {
    raf,
    caf,
    intersect(el, isIntersecting) {
      for (const o of observers) {
        if (o.disconnected || !o.targets.has(el)) continue
        const entry = { isIntersecting, target: el, intersectionRatio: isIntersecting ? 1 : 0 }
        o.cb([entry as unknown as IntersectionObserverEntry], o as unknown as IntersectionObserver)
      }
    },
    flushFrames(count = 1) {
      for (let i = 0; i < count; i++) {
        const batch = queue
        queue = []
        for (const q of batch) q.cb(performance.now())
      }
    },
    pendingFrames: () => queue.length,
    watchers: (el) => observers.filter((o) => !o.disconnected && o.targets.has(el)).length,
    restore() {
      window.IntersectionObserver = realIO
      vi.unstubAllGlobals()
    },
  }
}

const SCENE_HEIGHT = 2000
const VIEWPORT_HEIGHT = 1000

/** Pin the viewport at 1000px so `-top / (2000 - 1000)` yields exact progress values. */
export function pinViewport(height = VIEWPORT_HEIGHT) {
  Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: height })
}

export function setRect(el: Element, rect: { top: number; height: number; width?: number }) {
  const width = rect.width ?? 1200
  el.getBoundingClientRect = () =>
    ({
      top: rect.top,
      height: rect.height,
      width,
      bottom: rect.top + rect.height,
      left: 0,
      right: width,
      x: 0,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect
}

/** Scroll the scene so `useSceneProgress` reports exactly `p`, then run one frame inside act(). */
export function driveScene(drivers: SceneDrivers, el: Element, p: number) {
  setRect(el, { top: -p * (SCENE_HEIGHT - VIEWPORT_HEIGHT), height: SCENE_HEIGHT })
  act(() => {
    drivers.intersect(el, true)
    drivers.flushFrames()
  })
}
