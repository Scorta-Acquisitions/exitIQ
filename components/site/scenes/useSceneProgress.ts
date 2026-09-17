import { type RefObject, useEffect, useRef } from "react"
import { BAR_H, sceneProgress } from "@/lib/site/scroll"

/**
 * Turns the element's measured top, height, the viewport height, and the element's width into a progress
 * value (0..1). The width lets a scene that pins only where it fits choose its measure per viewport.
 */
export type ProgressMeasure = (top: number, height: number, viewportHeight: number, width: number) => number

/**
 * The default measure: a tall scene whose panel pins under the bar (`scene-pin` sticks at `--bar-h`), so
 * progress runs from the moment the scene's top reaches the bar's bottom edge. One module-level function,
 * so the hook's effect never restarts over a fresh identity.
 */
const pinnedSceneProgress: ProgressMeasure = (top, height, viewportHeight) =>
  sceneProgress(top, height, viewportHeight, BAR_H)

/**
 * Drives a scroll-choreographed scene. While the element is near the viewport, a requestAnimationFrame
 * loop measures it and reports progress (0..1) whenever it changes. Off screen, nothing runs.
 * Continuous values should be written straight to the DOM inside `onFrame`; discrete changes can
 * go through React state. `measure` defaults to the pinned scene's travel under the bar
 * (`pinnedSceneProgress`); a frame that merely scrolls into view passes `revealProgress`.
 */
export function useSceneProgress(
  ref: RefObject<HTMLElement | null>,
  onFrame: (progress: number, size: { width: number; height: number }) => void,
  measure: ProgressMeasure = pinnedSceneProgress
) {
  const callback = useRef(onFrame)
  callback.current = onFrame

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let active = false
    let last = -1
    let lastW = 0
    let lastH = 0

    const frame = () => {
      raf = requestAnimationFrame(frame)
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const p = measure(rect.top, rect.height, vh, rect.width)
      if (p !== last || rect.width !== lastW || rect.height !== lastH) {
        last = p
        lastW = rect.width
        lastH = rect.height
        callback.current(p, { width: rect.width, height: rect.height })
      }
    }
    const start = () => {
      if (active) return
      active = true
      last = -1
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      active = false
      cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start()
        else stop()
      },
      { rootMargin: "200px 0px" }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
    }
  }, [ref, measure])
}
