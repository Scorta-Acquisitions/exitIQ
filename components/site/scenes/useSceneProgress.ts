import { type RefObject, useEffect, useRef } from "react"
import { sceneProgress } from "@/lib/site/scroll"

/**
 * Drives a scroll-choreographed scene. While the element is near the viewport, a requestAnimationFrame
 * loop measures it and reports progress (0..1) whenever it changes. Off screen, nothing runs.
 * Continuous values should be written straight to the DOM inside `onFrame`; discrete changes can
 * go through React state.
 */
export function useSceneProgress(
  ref: RefObject<HTMLElement | null>,
  onFrame: (progress: number, size: { width: number; height: number }) => void
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
      const p = sceneProgress(rect.top, rect.height, vh)
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
  }, [ref])
}
