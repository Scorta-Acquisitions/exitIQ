import { type RefObject, useLayoutEffect, useRef } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"

/** How long a row or card takes to travel to its new place in a ranking. */
const FLIP_MS = 500

/**
 * The travel transition: put on an element for its move and taken off when the move ends, so `pressable`
 * keeps its 150ms press the rest of the time.
 */
const FLIP_CLASSES = ["transition-transform", "duration-500", "ease-e1"]

const px = (n: number) => `${+n.toFixed(2)}px`

/**
 * FLIP for the children of one container: when `key` changes and their CSS `order` puts them in new places,
 * each child is first translated back to where it stood (no transition), then released on the next frame to
 * travel over 500ms. Call the returned `snapshot` before the state change, so a child still mid-travel starts
 * from where it is rather than from where it was going.
 *
 * Transforms only, written straight to the DOM; nothing runs under reduced motion, and the one frame it asks
 * for is a single release, not a loop. Shared by the offer cards and the demo's letter rows.
 */
export function useFlipRows(containerRef: RefObject<HTMLElement | null>, key: string) {
  const before = useRef<DOMRect[]>([])

  const snapshot = () => {
    const container = containerRef.current
    if (!container || prefersReducedMotion()) return
    before.current = Array.from(container.children, (el) => el.getBoundingClientRect())
  }

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || prefersReducedMotion()) return
    const rows = Array.from(container.children) as HTMLElement[]
    const from = before.current
    const now: DOMRect[] = []
    const moves: Array<{ el: HTMLElement; dx: number; dy: number }> = []
    rows.forEach((el, i) => {
      // A travel still in flight ends here, so the row is measured where the new layout puts it.
      el.style.transition = "none"
      el.classList.remove(...FLIP_CLASSES)
      el.style.transform = ""
      const to = el.getBoundingClientRect()
      now.push(to)
      const was = from[i]
      const dx = was ? was.left - to.left : 0
      const dy = was ? was.top - to.top : 0
      if (dx || dy) moves.push({ el, dx, dy })
      else el.style.transition = ""
    })
    before.current = now
    if (moves.length === 0) return

    for (const m of moves) m.el.style.transform = `translate(${px(m.dx)}, ${px(m.dy)})`
    const release = requestAnimationFrame(() => {
      for (const m of moves) {
        m.el.style.transition = ""
        m.el.classList.add(...FLIP_CLASSES)
        m.el.style.transform = ""
      }
    })
    function settle(el: HTMLElement) {
      el.classList.remove(...FLIP_CLASSES)
      el.removeEventListener("transitionend", onEnd)
    }
    function onEnd(e: Event) {
      const el = e.currentTarget as HTMLElement
      if (e.target === el && (e as TransitionEvent).propertyName === "transform") settle(el)
    }
    for (const m of moves) m.el.addEventListener("transitionend", onEnd)
    const fallback = window.setTimeout(() => moves.forEach((m) => settle(m.el)), FLIP_MS + 100)
    return () => {
      cancelAnimationFrame(release)
      window.clearTimeout(fallback)
      for (const m of moves) m.el.removeEventListener("transitionend", onEnd)
    }
  }, [containerRef, key])

  return snapshot
}
