import { type RefObject, useLayoutEffect } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { belowFold, staggerDelay } from "@/lib/site/motion"

/** Mark an element with this attribute to have `useReveal` bring it in. */
const REVEAL_ATTR = "data-reveal"

/** Reveals landing within this many milliseconds of each other count as one batch and stagger together. */
const BATCH_MS = 50

/**
 * Reveals the `[data-reveal]` items inside `ref` once, the first time each scrolls into view (Apple's rule:
 * things arrive, they do not perform). Items still below the fold at mount are marked `reveal-pending`
 * (only ever from JavaScript, so server markup hides nothing); as they intersect, each is given a
 * `--reveal-delay` of `step` ms times its place in its batch (items arriving within 50ms of each other; never
 * more than `cap`) and swapped to `reveal-in`. Items already on screen at mount are left alone, and reduced motion marks nothing.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  { step = 60, cap = 300, threshold = 0.15 }: { step?: number; cap?: number; threshold?: number } = {}
) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const vh = window.innerHeight || 0
    const pending = Array.from(root.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`)).filter((el) =>
      belowFold(el.getBoundingClientRect().top, vh)
    )
    if (pending.length === 0) return
    for (const el of pending) el.classList.add("reveal-pending")
    const order = new Map(pending.map((el, i) => [el, i]))
    // Items that arrive within one batch window of each other are one group and stagger from zero.
    let batchAt = Number.NEGATIVE_INFINITY
    let place = 0
    const io = new IntersectionObserver(
      (entries) => {
        const now = performance.now()
        if (now - batchAt > BATCH_MS) place = 0
        batchAt = now
        const batch = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
        for (const el of batch) {
          el.style.setProperty("--reveal-delay", `${staggerDelay(place++, step, cap)}ms`)
          el.classList.remove("reveal-pending")
          el.classList.add("reveal-in")
          io.unobserve(el)
        }
      },
      { threshold }
    )
    for (const el of pending) io.observe(el)
    return () => {
      io.disconnect()
      for (const el of pending) {
        el.classList.remove("reveal-pending", "reveal-in")
        el.style.removeProperty("--reveal-delay")
      }
    }
  }, [ref, step, cap, threshold])
}
